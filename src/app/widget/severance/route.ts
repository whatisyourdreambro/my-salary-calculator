// /widget/severance — 블로그 임베드용 퇴직금 계산기 (edge Route Handler).
//
// 계산 단일 소스: src/lib/severanceCalculator.calculateSeveranceTax (퇴직소득세 정본).
// 세전 퇴직금 = 월평균임금 × 근속연수(법정 30일분×연수 근사).
// 퇴직소득세는 (퇴직금, 근속연수) 2변수 — 연수는 정수 1~40 그대로,
// 퇴직금 축만 그리드 보간하는 2D 그리드를 인라인한다(산식 중복 0).
// ⚠️ tools/finance/severance/page.tsx 의 인라인 사본은 참조 금지(포크 상태).
import { calculateSeveranceTax } from "@/lib/severanceCalculator";
import { WIDGET_HEADERS, widgetShell } from "../shared";

export const runtime = "edge";

const YEARS_MAX = 40;
// 퇴직금 축: 0 ~ 10억, 1,000만원 스텝 (구간 선형보간)
const PAY_MAX = 1_000_000_000;
const PAY_STEP = 10_000_000;

/** taxGrid[y-1][i] = 근속 y년·퇴직금 i×PAY_STEP 의 퇴직소득세+지방세 */
function buildTaxGrid(): number[][] {
  const grid: number[][] = [];
  for (let y = 1; y <= YEARS_MAX; y++) {
    const row: number[] = [];
    for (let pay = 0; pay <= PAY_MAX; pay += PAY_STEP) {
      if (pay === 0) {
        row.push(0);
        continue;
      }
      const t = calculateSeveranceTax(pay, y * 365);
      row.push(Math.round(t.incomeTax + t.localTax));
    }
    grid.push(row);
  }
  return grid;
}

function buildHtml(): string {
  const gridJson = JSON.stringify(buildTaxGrid());
  return widgetShell({
    title: "2026 퇴직금 계산기 — 머니샐러리",
    bodyHtml: `  <p class="title">🏦 2026 <span>퇴직금</span> 계산기</p>
  <div class="row">
    <label for="wage">월평균임금</label>
    <input id="wage" type="number" inputmode="numeric" min="100" max="3000" step="10" value="350">
    <span class="unit">만원</span>
  </div>
  <div class="row">
    <label for="years">근속연수</label>
    <input id="years" type="number" inputmode="numeric" min="1" max="${YEARS_MAX}" step="1" value="5">
    <span class="unit">년</span>
  </div>
  <div class="result">
    <span class="label">세후 예상 퇴직금</span>
    <span class="value" id="net">—</span>
  </div>
  <div class="result minor">
    <span class="label">세전 퇴직금 / 퇴직소득세</span>
    <span class="value" id="detail">—</span>
  </div>
  <p class="note">퇴직 전 3개월 평균임금 30일분 × 근속연수 기준 추정치입니다. 상여·연차수당 포함 여부, 일할 계산에 따라 실제와 다를 수 있습니다.</p>`,
    script: `(function () {
  var TAX = ${gridJson};
  var PAY_STEP = ${PAY_STEP}, PAY_MAX = ${PAY_MAX}, YEARS_MAX = ${YEARS_MAX};
  var wage = document.getElementById("wage");
  var years = document.getElementById("years");
  var net = document.getElementById("net");
  var detail = document.getElementById("detail");
  function taxOf(pay, y) {
    var row = TAX[Math.min(YEARS_MAX, Math.max(1, y)) - 1];
    var idx = pay / PAY_STEP;
    if (idx >= row.length - 1) return row[row.length - 1];
    var lo = Math.floor(idx), hi = Math.ceil(idx), t = idx - lo;
    return row[lo] + (row[hi] - row[lo]) * t;
  }
  function fmtManwon(won) { return Math.round(won / 10000).toLocaleString("ko-KR"); }
  function render() {
    var w = parseFloat(wage.value) * 10000;
    var y = parseInt(years.value, 10);
    if (!isFinite(w) || w <= 0 || !isFinite(y) || y < 1) { net.textContent = "—"; detail.textContent = "—"; return; }
    if (y > YEARS_MAX) { net.innerHTML = "<small>" + YEARS_MAX + "년 초과는 아래 버튼으로</small>"; detail.textContent = "—"; return; }
    var gross = w * y; // 30일분 평균임금 × 연수
    if (gross > PAY_MAX) { net.innerHTML = "<small>10억 초과는 아래 버튼으로</small>"; detail.textContent = "—"; return; }
    var tax = taxOf(gross, y);
    net.innerHTML = fmtManwon(gross - tax) + "<small>만원</small>";
    detail.innerHTML = fmtManwon(gross) + "<small>만원</small> / " + fmtManwon(tax) + "<small>만원</small>";
  }
  wage.addEventListener("input", render);
  years.addEventListener("input", render);
  render();
})();`,
    ctaHref: "/?tab=severance",
    ctaLabel: "입사·퇴사일 기준 정확히 계산하기 →",
  });
}

// 그리드(40×101 = ~4,000회 퇴직소득세 계산)와 HTML 은 배포 단위 상수 —
// 요청마다 재계산하지 않도록 모듈 스코프에서 1회 생성 (엣지 CPU 예산 보호).
const WIDGET_HTML = buildHtml();

export async function GET() {
  return new Response(WIDGET_HTML, { headers: WIDGET_HEADERS });
}
