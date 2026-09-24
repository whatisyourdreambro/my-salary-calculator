// src/app/api/og/route.tsx
//
// 동적 Open Graph 이미지 생성기.
// type 파라미터로 페이지 종류별 unique 이미지 자동 생성:
//   ?type=salary&amount=50000000   — 연봉 페이지
//   ?type=tool&name=성과급+세금     — 계산기 도구 페이지
//   ?type=guide&slug=...           — 가이드 글
//   ?type=company&id=...           — 회사 페이지
//   기본(type 없음)                 — title 파라미터로 일반 페이지
//
// 각 렌더 함수는 { node, text }를 반환 — text는 이미지에 실제로 그려지는
// 모든 글자를 모은 문자열로, Google Fonts 서브셋(&text=) 요청에 사용된다.

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import type { ReactElement } from "react";
import { OG_CLIENT_CACHE_CONTROL, OgFontCache, serveCachedOgImage } from "@/lib/ogImageCache";

export const runtime = "edge";

const BRAND_BLUE = "#0145F2";
const BRAND_BLUE_DEEP = "#0134B8";
const BRAND_DARK = "#0A1829";
const CANVAS = "#EDF1F5";

// Googlebot 색인 차단 — 이 endpoint는 OG 이미지 API 이지 페이지가 아님.
// robots.txt Disallow 와 별도로 응답 헤더에도 noindex 를 박아두면
// 이미 색인된 OG URL도 다음 크롤 시 색인에서 제거됨 (2026-05-24 incident 대응).
// SNS 미리보기는 og:image meta 로 직접 요청하므로 noindex 영향 없음.
const ROBOTS_HEADER = "noindex, noimageindex, nofollow";

// 정상 응답: 브라우저 1일 · CDN 1일.
// 기존 s-maxage=2592000(30일)은 0바이트/장애 응답이 CDN에 한 달 고착되는
// 원인이었음 (2026-06-11 503 incident) — 1일로 단축.
// 값은 ogImageCache 와 공유한다: 엣지 Cache API 저장본만 30일로 늘리고(검증된 카드만, STAB-04),
// 밖으로 나가는 응답은 HIT·MISS 모두 이 1일로 다시 맞춘다.
const OK_HEADERS = {
  "Content-Type": "image/png",
  "X-Robots-Tag": ROBOTS_HEADER,
  "Cache-Control": OG_CLIENT_CACHE_CONTROL,
};

// 폴백/에러 응답: 5분만 캐시 — 장애 이미지가 CDN에 오래 남지 않도록.
const FALLBACK_HEADERS = {
  "Content-Type": "image/png",
  "X-Robots-Tag": ROBOTS_HEADER,
  "Cache-Control": "public, max-age=300, s-maxage=300",
};

// 렌더할 글자만 담은 서브셋 폰트를 Google Fonts에서 동적 로드.
// Noto Sans KR 전체(수 MB)를 올리거나 폰트 없이 한글을 렌더하면 엣지 CPU 한도
// 초과(Cloudflare error 1102)로 503이 나므로, &text= 서브셋(수 KB)만 받아
// satori에 전달한다 (2026-06-11 OG 503 incident 대응).
// 동일 서브셋 재요청 시 외부 fetch 2회를 생략하는 메모리 캐시 (isolate 생존 동안 유효).
// 제목은 외부 쿼리로도 들어오므로 엔트리 수·총 용량을 제한한다.
const fontCache = new OgFontCache();

async function loadGoogleFont(text: string): Promise<ArrayBuffer> {
  const subset = Array.from(new Set(text)).join("");
  const cached = fontCache.get(subset);
  if (cached) return cached;
  // 외부 fetch 지연이 Worker CPU/wall-time 한도까지 번지지 않도록 3초 타임아웃
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(subset)}`,
    { signal: AbortSignal.timeout(3000) }
  );
  if (!cssRes.ok) throw new Error("font css fetch failed");
  const css = await cssRes.text();
  // UA 없는 요청에는 Google이 ttf/otf URL을 내려줌 (satori는 woff2 미지원)
  const match = css.match(
    /src:\s*url\((.+?)\)\s*format\('(opentype|truetype|woff)'\)/
  );
  if (!match) throw new Error("font url not found in css");
  const fontRes = await fetch(match[1], { signal: AbortSignal.timeout(3000) });
  if (!fontRes.ok) throw new Error("font file fetch failed");
  const fontData = await fontRes.arrayBuffer();
  if (fontData.byteLength > 262_144) throw new Error("font subset exceeds render budget");
  fontCache.set(subset, fontData);
  return fontData;
}

const containerStyle = {
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  // 복잡한 radial 패턴은 엣지 렌더 비용이 커서 단순 linear-gradient로 축소
  backgroundImage: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DEEP} 100%)`,
  padding: "0 60px",
};

const cardStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  padding: "60px 80px",
  borderRadius: "40px",
  border: "2px solid rgba(255, 255, 255, 0.12)",
  maxWidth: "1000px",
};

const watermarkStyle = {
  position: "absolute" as const,
  bottom: 36,
  color: "white",
  opacity: 0.5,
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: "0.04em",
};

type OgRender = { node: ReactElement; text: string };

// left 미지정 = 종전 위치(부모 alignItems 기준 — 가운데 정렬 카드는 하단 중앙). 좌측 정렬 카드는 명시 inset 을 준다.
function BrandSignature({ left }: { left?: number } = {}) {
  return <div style={{ ...watermarkStyle, ...(left === undefined ? {} : { left }), display: "flex", alignItems: "center", gap: 14, opacity: 0.9 }}>
    <svg width="46" height="46" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="white" />
      <path d="M8 23L16 11L24 23" stroke={BRAND_BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span>moneysalary.com</span>
  </div>;
}

function renderSalaryOg(amount: string, netPay?: string): OgRender {
  const manwon = Math.round(Number(amount) / 10000).toLocaleString("ko-KR");
  // netPay는 원 단위(예: 3300000)로 전달 → 만원 단위로 포맷해 SNS 카드 가독성 ↑
  const netManwon = netPay
    ? Math.round(Number(netPay) / 10000).toLocaleString("ko-KR")
    : null;
  const node = (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ color: CANVAS, fontSize: 28, fontWeight: 900, marginBottom: 16, letterSpacing: "0.04em" }}>
          2026 연봉 리포트
        </div>
        {/* 자식을 문자열 하나로 합친다 — JSX 가 ["연봉 ", manwon, "만원"] 배열을 만들면 satori 가
            display:flex 없는 <div> 의 복수 자식을 거부해(Expected <div> to have explicit "display: flex")
            type=salary 카드가 항상 ASCII 폴백으로 나가던 원인 (2026-09-23 리뷰에서 확인). */}
        <div style={{ color: "white", fontSize: 64, fontWeight: 900, marginBottom: 10 }}>
          {`연봉 ${manwon}만원`}
        </div>
        <div style={{ color: "white", fontSize: 32, fontWeight: 400, opacity: 0.85, marginBottom: 32 }}>
          세후 월 실수령액
        </div>
        {netManwon && (
          <div
            style={{
              backgroundColor: CANVAS,
              color: BRAND_DARK,
              padding: "16px 48px",
              borderRadius: "100px",
              fontSize: 56,
              fontWeight: 900,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            월 {netManwon}
            <span style={{ fontSize: 28, marginLeft: 8 }}>만원</span>
          </div>
        )}
      </div>
      <BrandSignature />
    </div>
  );
  const text = [
    "2026 연봉 리포트",
    `연봉 ${manwon}만원`,
    "세후 월 실수령액",
    netManwon ? `월 ${netManwon}만원` : "",
    "moneysalary.com",
  ].join(" ");
  return { node, text };
}

function renderToolOg(name: string): OgRender {
  const node = (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ color: CANVAS, fontSize: 26, fontWeight: 900, marginBottom: 14, letterSpacing: "0.04em" }}>
          머니샐러리 · 금융 계산기
        </div>
        <div style={{ color: "white", fontSize: 64, fontWeight: 900, marginBottom: 12, textAlign: "center", lineHeight: 1.15 }}>
          {name}
        </div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 500, opacity: 0.85, marginTop: 16 }}>
          2026년 최신 세법 기준 · 무료
        </div>
      </div>
      <BrandSignature />
    </div>
  );
  const text = [
    "머니샐러리 · 금융 계산기",
    name,
    "2026년 최신 세법 기준 · 무료",
    "moneysalary.com",
  ].join(" ");
  return { node, text };
}

function renderGuideOg(title: string): OgRender {
  // 하단 여백 130px — BrandSignature(absolute, bottom 36, 높이 46 → y 548~594)가 좌측 같은 높이에 놓여
  // 부제와 겹치던 것(바닥 60px 여백이라 부제가 y≈540~570, 2026-09-24 실측 OG-08)을 부제 아래로 분리.
  // 서명은 left 미지정이면 x=0(왼쪽 끝에 붙음)이라 본문과 같은 x=80 으로 맞춘다. 좌하단 그대로라
  // 네이버 가운데 정사각 크롭에는 변화가 없다. 3줄 제목 로컬 PNG 육안 확인(2026-09-25).
  const node = (
    <div style={{ ...containerStyle, alignItems: "flex-start", justifyContent: "flex-end", padding: "60px 80px 130px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "1040px" }}>
        <div style={{ color: CANVAS, fontSize: 24, fontWeight: 900, marginBottom: 16, letterSpacing: "0.04em" }}>
          머니샐러리 · 금융 가이드
        </div>
        <div style={{ color: "white", fontSize: 56, fontWeight: 900, lineHeight: 1.2, marginBottom: 24 }}>
          {title}
        </div>
        <div style={{ color: "white", fontSize: 24, fontWeight: 600, opacity: 0.85 }}>
          직장인이 꼭 알아야 할 세금·재테크
        </div>
      </div>
      <BrandSignature left={80} />
    </div>
  );
  const text = [
    "머니샐러리 · 금융 가이드",
    title,
    "직장인이 꼭 알아야 할 세금·재테크",
    "moneysalary.com",
  ].join(" ");
  return { node, text };
}

function renderFunOg(title: string): OgRender {
  // /fun 카테고리 — 보라 톤으로 펀 콘텐츠 시각 구분 (SNS 공유 차별화)
  const FUN_ACCENT = "#F0ABFC";
  const node = (
    <div
      style={{
        ...containerStyle,
        backgroundImage: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
      }}
    >
      <div style={cardStyle}>
        <div style={{ color: FUN_ACCENT, fontSize: 26, fontWeight: 900, marginBottom: 14, letterSpacing: "0.08em" }}>
          머니샐러리 · FUN
        </div>
        <div style={{ color: "white", fontSize: 64, fontWeight: 900, marginBottom: 12, textAlign: "center", lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 500, opacity: 0.9, marginTop: 12 }}>
          지금 바로 무료로 즐기는 머니 게임
        </div>
      </div>
      <BrandSignature />
    </div>
  );
  const text = [
    "머니샐러리 · FUN",
    title,
    "지금 바로 무료로 즐기는 머니 게임",
    "moneysalary.com",
  ].join(" ");
  return { node, text };
}

function renderCompanyOg(name: string): OgRender {
  const node = (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ color: CANVAS, fontSize: 26, fontWeight: 900, marginBottom: 14, letterSpacing: "0.04em" }}>
          머니샐러리 · 회사별 연봉
        </div>
        <div style={{ color: "white", fontSize: 64, fontWeight: 900, marginBottom: 10, textAlign: "center" }}>
          {name}
        </div>
        <div style={{ color: "white", fontSize: 32, fontWeight: 500, opacity: 0.85 }}>
          평균 연봉 · 직급별 실수령액
        </div>
      </div>
      <BrandSignature />
    </div>
  );
  const text = [
    "머니샐러리 · 회사별 연봉",
    name,
    "평균 연봉 · 직급별 실수령액",
    "moneysalary.com",
  ].join(" ");
  return { node, text };
}

function renderReportOg(title: string): OgRender {
  // /insights 데이터 리포트 — 기자·블로거 인용용 카드. 라벨로 "데이터 리포트" 정체성 명시.
  const node = (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ color: CANVAS, fontSize: 26, fontWeight: 900, marginBottom: 14, letterSpacing: "0.04em" }}>
          머니샐러리 데이터 리포트
        </div>
        <div style={{ color: "white", fontSize: 58, fontWeight: 900, marginBottom: 12, textAlign: "center", lineHeight: 1.18 }}>
          {title}
        </div>
        <div style={{ color: "white", fontSize: 26, fontWeight: 500, opacity: 0.85, marginTop: 12 }}>
          출처 표기 시 자유 인용 · 원문 데이터 공개
        </div>
      </div>
      <BrandSignature />
    </div>
  );
  const text = [
    "머니샐러리 데이터 리포트",
    title,
    "출처 표기 시 자유 인용 · 원문 데이터 공개",
    "moneysalary.com",
  ].join(" ");
  return { node, text };
}

// 영어 페이지(/en/*)용 — 크롬 문자열만 영어, 레이아웃·팔레트는 기본 OG 와 동일.
// Noto Sans KR 서브셋이 라틴 글리프를 포함하므로 폰트 파이프라인 재사용.
function renderEnOg(title: string): OgRender {
  const node = (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ color: CANVAS, fontSize: 28, fontWeight: 900, marginBottom: 18, letterSpacing: "0.04em" }}>
          Moneysalary
        </div>
        <div style={{ color: "white", fontSize: 56, fontWeight: 900, marginBottom: 12, textAlign: "center", lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ color: "white", fontSize: 26, fontWeight: 500, opacity: 0.85 }}>
          Korea salary · tax · stocks — in English
        </div>
      </div>
      <BrandSignature />
    </div>
  );
  const text = [
    "Moneysalary",
    title,
    "Korea salary · tax · stocks — in English",
    "moneysalary.com",
  ].join(" ");
  return { node, text };
}

function renderDefaultOg(title: string): OgRender {
  const node = (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ color: CANVAS, fontSize: 28, fontWeight: 900, marginBottom: 18, letterSpacing: "0.04em" }}>
          머니샐러리
        </div>
        <div style={{ color: "white", fontSize: 60, fontWeight: 900, marginBottom: 12, textAlign: "center", lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 500, opacity: 0.85 }}>
          내 조건으로 비교하는 급여·금융 도구
        </div>
      </div>
      <BrandSignature />
    </div>
  );
  const text = ["머니샐러리", title, "내 조건으로 비교하는 급여·금융 도구", "moneysalary.com"].join(" ");
  return { node, text };
}

// 폰트 로드 실패 시 안전망 — 내장 라틴 폰트만으로 ASCII 폴백 렌더 (한글 미사용)
function renderAsciiFallbackOg(): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BRAND_BLUE,
      }}
    >
      <div style={{ color: "white", fontSize: 88, fontWeight: 700 }}>MoneySalary</div>
      <div style={{ color: "white", fontSize: 30, opacity: 0.7, marginTop: 16 }}>
        moneysalary.com
      </div>
    </div>
  );
}

export async function GET(req: NextRequest) {
  return serveCachedOgImage(req.url, renderOgResponse);
}

async function renderOgResponse(searchParams: URLSearchParams) {
  try {
    const type = searchParams.get("type");
    const lang = searchParams.get("lang");
    const title = searchParams.get("title") || "연봉 실수령액 계산기";

    let og: OgRender;

    if (lang === "en") {
      // /en 트리 전용 — 영어 타이틀 + 영어 크롬 (한국어 기본 OG 상속 차단)
      og = renderEnOg(searchParams.get("title") || "Korea Salary Calculator");
    } else if (type === "salary") {
      const amount = searchParams.get("amount") || "50000000";
      // netPay는 구버전 공유 URL 하위호환 (카톡에 이미 뿌려진 링크 대응)
      const netPay =
        searchParams.get("net") || searchParams.get("netPay") || undefined;
      og = renderSalaryOg(amount, netPay);
    } else if (type === "tool") {
      const name = searchParams.get("name") || title;
      og = renderToolOg(name);
    } else if (type === "guide") {
      // slug보다 title이 더 사람 읽기 좋아서 title 우선 사용
      og = renderGuideOg(title);
    } else if (type === "fun") {
      // /fun 카테고리 — 보라/네온 OG (SNS 공유 시 일반 OG와 시각 구분)
      og = renderFunOg(title);
    } else if (type === "company") {
      const name = searchParams.get("name") || title;
      og = renderCompanyOg(name);
    } else if (type === "report") {
      og = renderReportOg(title);
    } else {
      // legacy 호환: amount 단독 query는 salary로 처리
      const legacyAmount = searchParams.get("amount");
      if (legacyAmount) {
        const netPay =
          searchParams.get("net") || searchParams.get("netPay") || undefined;
        og = renderSalaryOg(legacyAmount, netPay);
      } else {
        // path 기반 자동 분기 — buildPageMetadata가 path를 넘기면 카테고리별 OG 자동 적용
        const path = searchParams.get("path") || "";
        if (path.startsWith("/fun")) {
          og = renderFunOg(title);
        } else if (path.startsWith("/insights")) {
          og = renderReportOg(title);
        } else if (path.startsWith("/guides")) {
          og = renderGuideOg(title);
        } else if (path.startsWith("/salary-db")) {
          og = renderCompanyOg(title);
        } else {
          og = renderDefaultOg(title);
        }
      }
    }

    const fontData = await loadGoogleFont(og.text);
    const image = new ImageResponse(og.node, {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Noto Sans KR", data: fontData, style: "normal", weight: 700 },
      ],
    });
    // 스트리밍 도중 렌더가 실패하면 200 + 0바이트가 CDN에 캐시되므로 버퍼링 후 응답
    const body = await image.arrayBuffer();
    return new Response(body, { headers: OK_HEADERS });
  } catch (error) {
    // 폰트 로드/렌더 실패 — ASCII 폴백 이미지 + 짧은 캐시로 응답.
    // 2026-09-23: 원인 진단용으로 실패 사유를 로그와 X-OG-Error 헤더에 노출한다
    // (type=salary 카드가 프로덕션에서 항상 폴백으로 나가는데 catch 가 사유를 삼키고 있었음).
    const reason = describeOgError(error);
    console.error("[og] render failed:", reason);
    try {
      const image = new ImageResponse(renderAsciiFallbackOg(), {
        width: 1200,
        height: 630,
      });
      const body = await image.arrayBuffer();
      return new Response(body, {
        headers: { ...FALLBACK_HEADERS, "X-OG-Error": reason },
      });
    } catch (fallbackError) {
      const fallbackReason = describeOgError(fallbackError);
      console.error("[og] fallback failed:", fallbackReason);
      return new Response("Failed to generate the image", {
        status: 500,
        headers: {
          "X-Robots-Tag": ROBOTS_HEADER,
          "Cache-Control": "no-store",
          "X-OG-Error": `${reason} | fallback: ${fallbackReason}`.slice(0, 400),
        },
      });
    }
  }
}

// 헤더 값은 ASCII 만 안전 — 비ASCII 는 ? 로 치환하고 200자로 자른다.
function describeOgError(error: unknown): string {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return message.replace(/[^\x20-\x7e]/g, "?").slice(0, 200) || "unknown";
}
