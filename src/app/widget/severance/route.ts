// /widget/severance — 블로그 임베드용 퇴직금 계산기 (edge Route Handler).
//
// 계산 단일 소스: src/lib/severanceCalculator.calculateSeveranceTax (퇴직소득세 정본).
// 세전 퇴직금 = 월평균임금 × 근속연수(법정 30일분×연수 근사).
// 퇴직소득세는 (퇴직금, 근속연수) 2변수 — 연수는 정수 1~40 그대로,
// 퇴직금 축은 엔진에서 찾은 꺾임점 표를 인라인하고 그 사이만 직선 보간한다(산식 중복 0).
// ⚠️ tools/finance/severance/page.tsx 의 인라인 사본은 참조 금지(포크 상태).
//
// 2026-11-15 (audit1115 app-data-pages-b05-M01): 종전 1,000만원 등간격 그리드는 세금 0 구간이
// 끝나는 꺾임점을 가로질러 직선 보간해 단기 근속 세금을 3~4배로 보였다(월 250만×1년: 12만원
// 표시, 엔진 2.2만원). 세액은 퇴직금의 볼록 꺾은선(환산급여공제율은 줄고 세율은 오르는 구간표)이라
// 꺾임점만 1원 폭까지 찾아 두면 보간값이 엔진과 몇 원 안에서 같다.
import { calculateSeveranceTax } from "@/lib/severanceCalculator";
import { WIDGET_HEADERS, widgetShell } from "../shared";

export const dynamic = "force-static";


const YEARS_MAX = 40;
// 퇴직금 축: 0 ~ 10억 (꺾임점 표, 구간 직선 보간)
const PAY_MAX = 1_000_000_000;
// 허용 오차(원). 엔진은 소득세·지방소득세를 각각 원 단위로 반올림해 돌려주므로 값마다 ±1원
// 흔들림이 있다 — 그보다 작게 잡으면 흔들림을 꺾임으로 보고 점이 수백 개로 는다.
// 볼록 함수라 가운데 점이 현에서 LINEAR_TOL_WON 안이면 구간 전체 오차는 그 2배 이하.
// 실측(월평균 100~3,000만원 1만원 간격 × 1~40년, 11만 4천 건): 엔진과 최대 3.4원 차이, 표 약 11KB.
const LINEAR_TOL_WON = 1.5;
/** 같은 직선 위로 보고 표에서 뺄 중간점의 허용 오차(원) */
const DROP_TOL_WON = 1.5;

/** 근속 y년·퇴직금 pay 의 퇴직소득세+지방소득세(원) — 정본 엔진 값 그대로 */
function taxAt(pay: number, years: number): number {
  if (pay <= 0) return 0;
  const t = calculateSeveranceTax(pay, years * 365);
  return t.incomeTax + t.localTax;
}

/** [a, b] 안의 꺾임점을 이분 탐색으로 1원 폭까지 좁히며 거친 점을 out 에 [금액, 세액] 으로 더한다. */
function refine(a: number, fa: number, b: number, fb: number, years: number, out: Array<[number, number]>): void {
  if (b - a < 2) return;
  const m = Math.floor((a + b) / 2);
  const fm = taxAt(m, years);
  if (fa + ((fb - fa) * (m - a)) / (b - a) - fm <= LINEAR_TOL_WON) return;
  refine(a, fa, m, fm, years, out);
  out.push([m, fm]);
  refine(m, fm, b, fb, years, out);
}

/** taxTable[y-1] = 근속 y년 꺾임점 표 [금액0, 세액0, 금액1, 세액1, …] (세액 = 퇴직소득세+지방소득세, 원) */
function buildTaxTable(): number[][] {
  const table: number[][] = [];
  for (let y = 1; y <= YEARS_MAX; y++) {
    const top = taxAt(PAY_MAX, y);
    const points: Array<[number, number]> = [[0, 0]];
    refine(0, 0, PAY_MAX, top, y, points);
    points.push([PAY_MAX, top]);
    // 직전에 남긴 점과 다음 점을 잇는 직선에서 DROP_TOL_WON 안인 중간점은 버린다.
    const kept: Array<[number, number]> = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
      const [p0, t0] = kept[kept.length - 1];
      const [p1, t1] = points[i];
      const [p2, t2] = points[i + 1];
      if (Math.abs(t0 + ((t2 - t0) * (p1 - p0)) / (p2 - p0) - t1) > DROP_TOL_WON) kept.push(points[i]);
    }
    kept.push(points[points.length - 1]);
    table.push(kept.flatMap(([pay, tax]) => [pay, Math.round(tax)]));
  }
  return table;
}

function buildHtml(): string {
  const taxJson = JSON.stringify(buildTaxTable());
  return widgetShell({
    title: "2026 퇴직금 계산기 — 머니샐러리",
    bodyHtml: `  <p class="title">🏦 2026 <span>퇴직금</span> 계산기</p>
  <div class="row">
    <label for="wage">월평균임금</label>
    <input id="wage" type="text" data-number-input="grouped" role="spinbutton" inputmode="decimal" min="100" max="3000" step="10" value="350">
    <span class="unit">만원</span>
  </div>
  <div class="row">
    <label for="years">근속연수</label>
    <input id="years" type="text" data-number-input="grouped" role="spinbutton" inputmode="decimal" min="1" max="${YEARS_MAX}" step="1" value="5">
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
  var TAX = ${taxJson};
  var PAY_MAX = ${PAY_MAX}, YEARS_MAX = ${YEARS_MAX};
  var wage = document.getElementById("wage");
  var years = document.getElementById("years");
  var net = document.getElementById("net");
  var detail = document.getElementById("detail");
  function taxOf(pay, y) {
    var r = TAX[Math.min(YEARS_MAX, Math.max(1, y)) - 1];
    if (pay >= r[r.length - 2]) return r[r.length - 1];
    for (var i = 2; i < r.length; i += 2) {
      if (pay <= r[i]) { var p0 = r[i - 2], t0 = r[i - 1]; return t0 + (r[i + 1] - t0) * (pay - p0) / (r[i] - p0); }
    }
    return r[r.length - 1];
  }
  function fmtManwon(won) { return Math.round(won / 10000).toLocaleString("ko-KR"); }
  function render() {
    var w = parseFloat(wage.value.replace(/,/g, "")) * 10000;
    var y = Number(years.value.replace(/,/g, ""));
    if (!isFinite(w) || w <= 0 || !isFinite(y) || y < 1) { net.textContent = "—"; detail.textContent = "—"; return; }
    if (!Number.isInteger(y)) { net.textContent = "근속연수는 정수로 입력"; detail.textContent = "—"; return; }
    if (y > YEARS_MAX) { net.innerHTML = "<small>" + YEARS_MAX + "년 초과는 아래 버튼으로</small>"; detail.textContent = "—"; return; }
    var gross = w * y; // 30일분 평균임금 × 연수
    if (gross > PAY_MAX) { net.innerHTML = "<small>10억 초과는 아래 버튼으로</small>"; detail.textContent = "—"; return; }
    var tax = taxOf(gross, y);
    net.innerHTML = fmtManwon(gross - tax) + "<small>만원</small>";
    detail.innerHTML = fmtManwon(gross) + "<small>만원</small> / " + fmtManwon(tax) + "<small>만원</small>";
  }
  bindGroupedNumberInput(wage, render);
  bindGroupedNumberInput(years, render);
  render();
})();`,
    ctaHref: "/?tab=severance",
    ctaLabel: "입사·퇴사일 기준 예상액 계산하기 →",
  });
}

// 꺾임점 표(근속연수 40개 × 이분 탐색, 수만 회 퇴직소득세 계산)와 HTML 은 배포 단위 상수 —
// 요청마다 재계산하지 않도록 모듈 스코프에서 1회 생성 (엣지 CPU 예산 보호).
const WIDGET_HTML = buildHtml();

export async function GET() {
  return new Response(WIDGET_HTML, { headers: WIDGET_HEADERS });
}
