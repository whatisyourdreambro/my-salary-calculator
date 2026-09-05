// /widget/salary — 블로그 임베드용 연봉 실수령액 계산기 (edge Route Handler).
//
// 루트 레이아웃(AdSense auto-ads·GA4·카카오 스크립트)을 완전히 우회하는
// 자가완결 HTML — iframe 안에서 광고 스크립트가 실행되면 AdSense 정책 리스크가
// 있어 Route Handler 방식이 필수다 (App Router 페이지로 만들면 우회 불가).
//
// - 세법 로직은 src/lib/calculator.ts 단일 소스: 요청 시 연봉 그리드를 계산해
//   HTML에 인라인 → 위젯 JS는 보간만 수행(외부 요청 0회, CF 요청 한도 보호).
// - iframe 허용 헤더(CSP frame-ancestors *)는 이 핸들러가 직접 세팅하는 것이
//   정본 — next-on-pages는 next.config headers()를 정적 라우트에 내보내지 않는
//   실측(2026-08-16)이 있어 config 규칙(/widget/:path*)은 dev 패리티용이다.
// - 색인 차단: X-Robots-Tag + robots.ts Disallow(/widget/) 이중 — 임베드 안내는
//   /embed 페이지가 담당한다.

import { calculateNetSalary2026 } from "@/lib/calculator";
import { WIDGET_CSP, WIDGET_REFERRER_SCRIPT } from "../shared";

export const runtime = "edge";

// 연봉 그리드: 1,200만 ~ 2억, 100만원 스텝 (월 실수령은 구간 선형보간)
const GRID_MIN = 12_000_000;
const GRID_MAX = 200_000_000;
const GRID_STEP = 1_000_000;

// 위젯 기본 가정 — 표기 문구와 반드시 일치 유지
const NON_TAXABLE = 2_400_000; // 비과세 식대 월 20만원
const DEPENDENTS = 1;

function buildGrid(): number[] {
  const grid: number[] = [];
  for (let annual = GRID_MIN; annual <= GRID_MAX; annual += GRID_STEP) {
    const r = calculateNetSalary2026(annual, NON_TAXABLE, DEPENDENTS, 0, {
      isSmeYouth: false,
      disabledDependents: 0,
      seniorDependents: 0,
    });
    grid.push(Math.round(r.monthlyNet));
  }
  return grid;
}

function buildHtml(): string {
  const grid = buildGrid();
  // 숫자 배열만 인라인 — "</script>" 유출 위험 없음
  const gridJson = JSON.stringify(grid);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>2026 연봉 실수령액 계산기 — 머니샐러리</title>
<style>
  :root {
    --bg: #ffffff; --card: #f4f6f9; --text: #0a1829; --sub: #5b6b82;
    --accent: #0145F2; --border: #e2e8f0;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --sub: #94a3b8;
      --accent: #5b8bff; --border: #334155;
    }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: var(--bg); }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
      "Malgun Gothic", "Segoe UI", sans-serif;
    color: var(--text); padding: 16px; font-size: 14px;
  }
  .title { font-size: 15px; font-weight: 800; margin-bottom: 12px; }
  .title span { color: var(--accent); }
  .row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  label { font-weight: 700; font-size: 13px; color: var(--sub); white-space: nowrap; }
  input[type="number"] {
    flex: 1; min-width: 0; padding: 10px 12px; font-size: 16px; font-weight: 700;
    border: 1px solid var(--border); border-radius: 10px;
    background: var(--bg); color: var(--text); outline: none;
  }
  input[type="number"]:focus { border-color: var(--accent); }
  .unit { font-weight: 700; color: var(--sub); font-size: 13px; }
  .result {
    background: var(--card); border-radius: 12px; padding: 14px 16px;
    display: flex; align-items: baseline; justify-content: space-between;
    gap: 8px; flex-wrap: wrap; margin-bottom: 10px;
  }
  .result .label { font-size: 13px; font-weight: 700; color: var(--sub); }
  .result .value { font-size: 24px; font-weight: 900; color: var(--accent); }
  .result .value small { font-size: 14px; font-weight: 700; }
  .note { font-size: 11px; color: var(--sub); line-height: 1.5; margin-bottom: 10px; }
  .cta {
    display: block; text-align: center; padding: 10px 12px;
    background: var(--accent); color: #fff; font-weight: 800; font-size: 13px;
    border-radius: 10px; text-decoration: none;
  }
  .brand { margin-top: 8px; text-align: center; font-size: 11px; }
  .brand a { color: var(--sub); text-decoration: none; font-weight: 700; }
</style>
</head>
<body>
  <p class="title">💰 2026 연봉 <span>실수령액</span> 계산기</p>
  <div class="row">
    <label for="salary">연봉</label>
    <input id="salary" type="number" inputmode="numeric" min="500" max="20000" step="100" value="5000">
    <span class="unit">만원</span>
  </div>
  <div class="result">
    <span class="label">세후 월 실수령액</span>
    <span class="value" id="net">—</span>
  </div>
  <p class="note">2026년 세법 · 부양가족 1인 · 비과세 식대 월 20만원 기준 추정치입니다.</p>
  <a class="cta" href="https://www.moneysalary.com/?utm_source=widget&amp;utm_medium=iframe" target="_blank" rel="noopener">정확한 공제 내역 계산하기 →</a>
  <p class="brand"><a href="https://www.moneysalary.com/?utm_source=widget&amp;utm_medium=iframe" target="_blank" rel="noopener">by 머니샐러리</a></p>
<script>
(function () {
  var GRID = ${gridJson};
  var MIN = ${GRID_MIN}, MAX = ${GRID_MAX}, STEP = ${GRID_STEP};
  var input = document.getElementById("salary");
  var out = document.getElementById("net");
  function netOf(annualWon) {
    var idx = (annualWon - MIN) / STEP;
    if (idx <= 0) return GRID[0] * (annualWon / MIN); // 그리드 하한 미만은 비례 근사
    if (idx >= GRID.length - 1) return GRID[GRID.length - 1];
    var lo = Math.floor(idx), hi = Math.ceil(idx), t = idx - lo;
    return GRID[lo] + (GRID[hi] - GRID[lo]) * t;
  }
  function render() {
    var manwon = parseFloat(input.value);
    if (!isFinite(manwon) || manwon <= 0) { out.textContent = "—"; return; }
    if (manwon * 10000 > MAX) {
      // 그리드 상한(2억) 초과 — 틀린 값을 조용히 보여주는 대신 본편으로 안내
      out.innerHTML = "<small>2억 초과는 아래 버튼으로</small>";
      return;
    }
    var net = netOf(manwon * 10000);
    var netManwon = Math.round(net / 10000);
    out.innerHTML = "월 " + netManwon.toLocaleString("ko-KR") + "<small>만원</small>";
  }
  input.addEventListener("input", render);
  render();
})();
</script>
<script>${WIDGET_REFERRER_SCRIPT}</script>
</body>
</html>`;
}

export async function GET() {
  return new Response(buildHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": WIDGET_CSP,
      "X-Robots-Tag": "noindex, nofollow",
      // 위젯은 배포 시에만 바뀜 — 브라우저 1시간 · 엣지 1일 캐시
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
