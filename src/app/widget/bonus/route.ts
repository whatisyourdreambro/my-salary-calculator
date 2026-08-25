// /widget/bonus — 블로그 임베드용 성과급 세후 실수령 계산기 (edge Route Handler).
//
// 계산 단일 소스: src/lib/bonusTaxCalc.calcBonusNet (한계세율 모델 — 요율·산식 재구현 금지).
// calcBonusNet(s, b).totalDeductions 는 순수 한계차 G(s+b) − G(s) 로 텔레스코핑됨을
// 수치 검증(오차 ≤1원, 2026-08-25) — 연소득 축 1D 공제 그리드만 인라인하면
// 위젯 JS 는 보간·차감만 수행한다(외부 요청 0회, 산식 중복 0).
//
// 회사별 지급률(OPI/PS 시나리오)은 다루지 않는다 — 제네릭 성과급 세후 계산 전용.
// (회사별은 /calc/*-bonus 본편이 담당 — docs/serp-strategy-2026.md "Client.tsx 수정 금지")
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { WIDGET_HEADERS, widgetShell } from "../shared";

export const runtime = "edge";

// 연소득(연봉+성과급 합산) 축 그리드: 1,200만 ~ 4억, 200만원 스텝
const GRID_MIN = 12_000_000;
const GRID_MAX = 400_000_000;
const GRID_STEP = 2_000_000;

/** G(x) = 연소득 x 에서의 누적 공제(기준점 GRID_MIN 대비) — calcBonusNet 로만 계산 */
function buildDeductionGrid(): number[] {
  const grid: number[] = [];
  for (let x = GRID_MIN; x <= GRID_MAX; x += GRID_STEP) {
    grid.push(x <= GRID_MIN ? 0 : Math.round(calcBonusNet(GRID_MIN, x - GRID_MIN).totalDeductions));
  }
  return grid;
}

function buildHtml(): string {
  const gridJson = JSON.stringify(buildDeductionGrid());
  return widgetShell({
    title: "2026 성과급 실수령액 계산기 — 머니샐러리",
    bodyHtml: `  <p class="title">🎁 2026 성과급 <span>세후 실수령</span> 계산기</p>
  <div class="row">
    <label for="salary">연봉</label>
    <input id="salary" type="number" inputmode="numeric" min="500" max="20000" step="100" value="5000">
    <span class="unit">만원</span>
  </div>
  <div class="row">
    <label for="bonus">성과급</label>
    <input id="bonus" type="number" inputmode="numeric" min="0" max="20000" step="50" value="1000">
    <span class="unit">만원</span>
  </div>
  <div class="result">
    <span class="label">성과급 세후 수령액</span>
    <span class="value" id="net">—</span>
  </div>
  <div class="result minor">
    <span class="label">공제 합계(추정)</span>
    <span class="value" id="ded">—</span>
  </div>
  <p class="note">2026년 세법 한계세율 기준 추정치입니다. 성과급이 연봉에 합산되며 늘어나는 소득세·4대보험 증가분을 공제로 반영합니다.</p>`,
    script: `(function () {
  var G = ${gridJson};
  var MIN = ${GRID_MIN}, MAX = ${GRID_MAX}, STEP = ${GRID_STEP};
  var salary = document.getElementById("salary");
  var bonus = document.getElementById("bonus");
  var net = document.getElementById("net");
  var ded = document.getElementById("ded");
  function gOf(x) {
    if (x <= MIN) return 0;
    var idx = (x - MIN) / STEP;
    if (idx >= G.length - 1) return G[G.length - 1];
    var lo = Math.floor(idx), hi = Math.ceil(idx), t = idx - lo;
    return G[lo] + (G[hi] - G[lo]) * t;
  }
  function render() {
    var s = parseFloat(salary.value) * 10000;
    var b = parseFloat(bonus.value) * 10000;
    if (!isFinite(s) || s <= 0 || !isFinite(b) || b < 0) { net.textContent = "—"; ded.textContent = "—"; return; }
    if (s + b > MAX) {
      net.innerHTML = "<small>합산 4억 초과는 아래 버튼으로</small>"; ded.textContent = "—"; return;
    }
    var deductions = Math.max(0, gOf(s + b) - gOf(s));
    var netWon = Math.max(0, b - deductions);
    net.innerHTML = Math.round(netWon / 10000).toLocaleString("ko-KR") + "<small>만원</small>";
    ded.innerHTML = Math.round(deductions / 10000).toLocaleString("ko-KR") + "<small>만원</small>";
  }
  salary.addEventListener("input", render);
  bonus.addEventListener("input", render);
  render();
})();`,
    ctaHref: "/tools/finance/bonus",
    ctaLabel: "회사별 성과급·상세 공제 계산하기 →",
  });
}

export async function GET() {
  return new Response(buildHtml(), { headers: WIDGET_HEADERS });
}
