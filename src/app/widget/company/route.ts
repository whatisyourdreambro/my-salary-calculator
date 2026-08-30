// /widget/company?id={companyId} — 블로그 임베드용 회사 공시연봉 카드 (edge Route Handler).
//
// 데이터: dartInjection(21KB, 공시 요약) + dartNameMap(9KB, id→한글명) 두 경량
//   모듈만 import — ★dartDisclosed(1.3MB)·dartReport 는 이 라우트에 import 절대
//   금지 (edge 번들 폭탄). 한글명 맵 재생성: node scripts/gen-dart-namemap.mjs.
// id 무효(미보유·형식 불량·별칭)면 크래시 대신 안내 카드를 렌더한다.
// 헤더(CSP frame-ancestors·noindex·캐시)는 핸들러가 직접 세팅 (shared.ts 참조).
// 색인 차단: X-Robots-Tag + robots.ts Disallow(/widget/) 이중. 무광고·무GA.

import { dartInjection, DART_INJECTION_DATE } from "@/data/dart/dartInjection";
import { dartNameMap } from "@/data/dart/dartNameMap";
import { WIDGET_HEADERS, widgetShell } from "../shared";

export const runtime = "edge";

const ID_RE = /^[a-z0-9-]{1,64}$/;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 만원 단위 → "1억 5,400만원" / "9,900만원" */
function salaryLabel(manwon: number): string {
  if (manwon >= 10000) {
    const eok = Math.floor(manwon / 10000);
    const rest = manwon % 10000;
    return rest > 0
      ? `${eok}억 ${rest.toLocaleString("ko-KR")}만원`
      : `${eok}억원`;
  }
  return `${manwon.toLocaleString("ko-KR")}만원`;
}

function buildCompanyHtml(id: string, name: string): string {
  const d = dartInjection[id];
  const tenureRow =
    d.t != null
      ? `  <div class="result minor">
    <span class="label">평균 근속연수</span>
    <span class="value">${d.t}<small>년</small></span>
  </div>
`
      : "";
  return widgetShell({
    title: `${esc(name)} 평균연봉 — DART 공시 기준 — 머니샐러리`,
    bodyHtml: `  <p class="title">🏢 ${esc(name)} <span>평균연봉</span></p>
  <div class="result">
    <span class="label">DART 공시 평균연봉 (${esc(d.y)}년)</span>
    <span class="value">${salaryLabel(d.a)}</span>
  </div>
  <div class="result minor">
    <span class="label">직원수</span>
    <span class="value">${d.e.toLocaleString("ko-KR")}<small>명</small></span>
  </div>
${tenureRow}  <p class="note">금융감독원 DART ${esc(d.y)}년 사업보고서 &ldquo;직원 등의 현황&rdquo; 기준(임원 제외 전 직원 평균, 100만원 단위 반올림). 데이터 기준일 ${DART_INJECTION_DATE}.</p>`,
    script: `/* 정적 카드 위젯 — 상호작용 스크립트 없음 */`,
    ctaHref: `/salary-db/${id}`,
    ctaLabel: "직급별 연봉·업계 비교 보기 →",
  });
}

function buildFallbackHtml(): string {
  return widgetShell({
    title: "회사 공시연봉 카드 위젯 — 머니샐러리",
    bodyHtml: `  <p class="title">🏢 회사 <span>공시연봉</span> 카드</p>
  <div class="result">
    <span class="label">안내</span>
    <span class="value" style="font-size:15px;">회사를 찾을 수 없습니다</span>
  </div>
  <p class="note">주소의 id 파라미터가 비어 있거나 지원하지 않는 회사입니다. 사용 예: <b>/widget/company?id=samsung-electronics</b> — 지원 회사 목록과 임베드 코드는 머니샐러리 임베드 안내 페이지(/embed)에서 회사 이름으로 검색해 만들 수 있습니다.</p>`,
    script: `/* 정적 안내 카드 — 상호작용 스크립트 없음 */`,
    ctaHref: "/salary-db",
    ctaLabel: "전체 기업 연봉 DB 보기 →",
  });
}

// 안내 카드는 요청 불변 — 모듈 스코프 1회 생성
const FALLBACK_HTML = buildFallbackHtml();

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const name =
    ID_RE.test(id) && dartInjection[id] ? dartNameMap[id] : undefined;
  const html = name ? buildCompanyHtml(id, name) : FALLBACK_HTML;
  return new Response(html, { headers: WIDGET_HEADERS });
}
