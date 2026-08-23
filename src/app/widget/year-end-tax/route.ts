// /widget/year-end-tax — 블로그 임베드용 연말정산 환급 계산기 (edge Route Handler).
//
// widget/salary 패턴 복제 (2026-08-23 위젯 2호): 루트 레이아웃 우회 자가완결
// HTML + 헤더 직접 세팅(정본) + "그리드 사전계산 → 인라인 → 보간".
//
// 축소판 성립 근거: 표준 가정(본인 1인 기본공제, 4대보험은 총급여에서 요율로
// 자동 산출, 그 외 공제 0)을 두면 결정세액이 총급여만의 함수가 된다 —
// 결정세액 1D 그리드를 인라인하고, 환급 = 기납부세액 − 결정세액(보간)만
// 클라이언트에서 뺄셈. 결과는 "기본 공제만 반영한 보수적 추정"으로 프레이밍
// (카드·연금저축 등 입력 시 실제 환급은 이보다 늘어남 → 본편 CTA).
// ★가정 문구와 계산 로직 일치 유지 — 아래 상수 변경 시 note 문구도 함께.

import { calculateYearEndTax } from "@/lib/yearEndTaxCalculator";
import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "@/lib/taxConstants2026";

export const runtime = "edge";

// 총급여 그리드: 1,200만 ~ 2억, 100만원 스텝 (결정세액은 구간 선형보간)
const GRID_MIN = 12_000_000;
const GRID_MAX = 200_000_000;
const GRID_STEP = 1_000_000;

const WIDGET_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors *; base-uri 'none'; form-action 'none'";

/** 표준 가정 하 연간 4대보험 (근로자 부담분) — 결정세액 그리드 입력용 */
function derivedInsurance(grossSalary: number) {
  const monthly = grossSalary / 12;
  const pensionBase = Math.min(
    Math.max(monthly, PENSION_BASE_2026.MIN_MONTHLY),
    PENSION_BASE_2026.MAX_MONTHLY
  );
  return {
    nationalPension: Math.round(pensionBase * INSURANCE_RATES_2026.NATIONAL_PENSION * 12),
    healthInsurance: Math.round(grossSalary * INSURANCE_RATES_2026.HEALTH_INSURANCE),
    employmentInsurance: Math.round(grossSalary * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE),
  };
}

function buildGrid(): number[] {
  const grid: number[] = [];
  for (let s = GRID_MIN; s <= GRID_MAX; s += GRID_STEP) {
    const ins = derivedInsurance(s);
    const r = calculateYearEndTax({
      grossSalary: s,
      prepaidTax: 0,
      ...ins,
      dependents: 1,
      disabledDependents: 0,
      seniorDependents: 0,
      housingSubscription: 0,
      mortgageInterest: 0,
      creditCard: 0,
      debitCardAndCash: 0,
      traditionalMarket: 0,
      publicTransport: 0,
      children: 0,
      birthsOrAdoptions: 0,
      pensionSavings: 0,
      irp: 0,
      lifeInsurance: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
      donation: 0,
      monthlyRent: 0,
    });
    grid.push(Math.round(r.determinedTax));
  }
  return grid;
}

function buildHtml(): string {
  const gridJson = JSON.stringify(buildGrid());

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>2026 연말정산 환급 계산기 — 머니샐러리</title>
<style>
  :root {
    --bg: #ffffff; --card: #f4f6f9; --text: #0a1829; --sub: #5b6b82;
    --accent: #0145F2; --minus: #d13636; --border: #e2e8f0;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --sub: #94a3b8;
      --accent: #5b8bff; --minus: #ff7b7b; --border: #334155;
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
  .row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  label { font-weight: 700; font-size: 13px; color: var(--sub); white-space: nowrap; width: 74px; }
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
    gap: 8px; flex-wrap: wrap; margin: 12px 0 10px;
  }
  .result .label { font-size: 13px; font-weight: 700; color: var(--sub); }
  .result .value { font-size: 22px; font-weight: 900; color: var(--accent); }
  .result .value.minus { color: var(--minus); }
  .result .value small { font-size: 13px; font-weight: 700; }
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
  <p class="title">🧾 2026 연말정산 <span>환급</span> 계산기</p>
  <div class="row">
    <label for="salary">연간 총급여</label>
    <input id="salary" type="number" inputmode="numeric" min="1200" max="20000" step="100" value="5000">
    <span class="unit">만원</span>
  </div>
  <div class="row">
    <label for="prepaid">기납부세액</label>
    <input id="prepaid" type="number" inputmode="numeric" min="0" step="10" placeholder="월급 소득세×12">
    <span class="unit">만원</span>
  </div>
  <div class="result">
    <span class="label" id="resLabel">올해 결정세액(추정)</span>
    <span class="value" id="res">—</span>
  </div>
  <p class="note">2026년 귀속 · 본인 1인 공제·4대보험만 반영한 보수적 추정 — 카드·연금저축·월세 공제를 넣으면 환급이 늘어납니다. 지방소득세(소득세의 10%)는 별도.</p>
  <a class="cta" href="https://www.moneysalary.com/year-end-tax?utm_source=widget&amp;utm_medium=iframe" target="_blank" rel="noopener">공제 다 넣고 정확히 계산하기 →</a>
  <p class="brand"><a href="https://www.moneysalary.com/year-end-tax?utm_source=widget&amp;utm_medium=iframe" target="_blank" rel="noopener">by 머니샐러리</a></p>
<script>
(function () {
  var GRID = ${gridJson};
  var MIN = ${GRID_MIN}, MAX = ${GRID_MAX}, STEP = ${GRID_STEP};
  var salaryEl = document.getElementById("salary");
  var prepaidEl = document.getElementById("prepaid");
  var out = document.getElementById("res");
  var lab = document.getElementById("resLabel");
  function taxOf(annualWon) {
    var idx = (annualWon - MIN) / STEP;
    if (idx <= 0) return GRID[0] * (annualWon / MIN);
    if (idx >= GRID.length - 1) return GRID[GRID.length - 1];
    var lo = Math.floor(idx), hi = Math.ceil(idx), t = idx - lo;
    return GRID[lo] + (GRID[hi] - GRID[lo]) * t;
  }
  function fmtMan(won) { return Math.round(won / 10000).toLocaleString("ko-KR"); }
  function render() {
    var manwon = parseFloat(salaryEl.value);
    if (!isFinite(manwon) || manwon <= 0) { out.textContent = "—"; return; }
    if (manwon * 10000 > MAX) {
      out.className = "value";
      out.innerHTML = "<small>2억 초과는 아래 버튼으로</small>";
      return;
    }
    var tax = taxOf(manwon * 10000);
    var prepaidMan = parseFloat(prepaidEl.value);
    if (!isFinite(prepaidMan)) {
      lab.textContent = "올해 결정세액(추정)";
      out.className = "value";
      out.innerHTML = "약 " + fmtMan(tax) + "<small>만원</small>";
      return;
    }
    var refund = prepaidMan * 10000 - tax;
    if (refund >= 0) {
      lab.textContent = "예상 환급액(최소)";
      out.className = "value";
      out.innerHTML = "+" + fmtMan(refund) + "<small>만원</small>";
    } else {
      lab.textContent = "예상 추가 납부";
      out.className = "value minus";
      out.innerHTML = "-" + fmtMan(-refund) + "<small>만원</small>";
    }
  }
  salaryEl.addEventListener("input", render);
  prepaidEl.addEventListener("input", render);
  render();
})();
</script>
</body>
</html>`;
}

export async function GET() {
  return new Response(buildHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": WIDGET_CSP,
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
