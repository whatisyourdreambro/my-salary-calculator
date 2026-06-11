import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "머니샐러리 - 2026년 연봉 실수령액 계산기";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const BRAND_BLUE = "#0145F2";
const BRAND_BLUE_DEEP = "#0134B8";
const CANVAS = "#EDF1F5";

// 이미지에 들어가는 모든 글자 — Google Fonts 서브셋(&text=) 요청에 그대로 사용
const OG_TEXT =
  "머니샐러리 2026년 연봉 실수령액 계산기 최신 세법 완벽 반영 · 4대보험 연말정산 moneysalary.com";

// 렌더할 글자만 담은 서브셋 폰트를 Google Fonts에서 동적 로드.
// Noto Sans KR 전체(수 MB)를 올리거나 폰트 없이 한글을 렌더하면 엣지 CPU 한도
// 초과(Cloudflare error 1102)로 503이 나므로, &text= 서브셋(수 KB)만 받아
// satori에 전달한다 (2026-06-11 OG 503 incident 대응).
async function loadGoogleFont(text: string): Promise<ArrayBuffer> {
  const subset = Array.from(new Set(text)).join("");
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(subset)}`
  );
  if (!cssRes.ok) throw new Error("font css fetch failed");
  const css = await cssRes.text();
  // UA 없는 요청에는 Google이 ttf/otf URL을 내려줌 (satori는 woff2 미지원)
  const match = css.match(
    /src:\s*url\((.+?)\)\s*format\('(opentype|truetype|woff)'\)/
  );
  if (!match) throw new Error("font url not found in css");
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error("font file fetch failed");
  return fontRes.arrayBuffer();
}

export default async function Image() {
  try {
    const fontData = await loadGoogleFont(OG_TEXT);
    const image = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DEEP} 100%)`,
            fontFamily: '"Noto Sans KR", sans-serif',
            position: "relative",
          }}
        >
          <div
            style={{
              color: CANVAS,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "0.04em",
              marginBottom: 28,
            }}
          >
            머니샐러리
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <div style={{ color: "white", fontSize: 76, fontWeight: 700, lineHeight: 1.25 }}>
              2026년 연봉
            </div>
            <div style={{ color: "white", fontSize: 76, fontWeight: 700, lineHeight: 1.25 }}>
              실수령액 계산기
            </div>
          </div>
          <div style={{ color: CANVAS, fontSize: 28, opacity: 0.9 }}>
            최신 세법 완벽 반영 · 4대보험 · 연말정산
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 36,
              color: "white",
              opacity: 0.5,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            moneysalary.com
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          { name: "Noto Sans KR", data: fontData, style: "normal", weight: 700 },
        ],
      }
    );
    // 스트리밍 도중 렌더가 실패하면 200 + 0바이트가 CDN에 캐시되므로 버퍼링 후 응답
    const body = await image.arrayBuffer();
    return new Response(body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    // 폰트 로드/렌더 실패 — 내장 라틴 폰트만으로 ASCII 폴백 렌더 (한글 미사용)
    const image = new ImageResponse(
      (
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
          <div style={{ color: "white", fontSize: 88, fontWeight: 700 }}>
            MoneySalary
          </div>
          <div style={{ color: "white", fontSize: 30, opacity: 0.7, marginTop: 16 }}>
            moneysalary.com
          </div>
        </div>
      ),
      { ...size }
    );
    const body = await image.arrayBuffer();
    return new Response(body, {
      headers: {
        "Content-Type": "image/png",
        // 폴백 이미지는 짧게만 캐시 — 복구 후 정상 이미지로 빨리 교체되도록
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }
}
