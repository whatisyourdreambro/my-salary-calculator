// /widget/dsr — 블로그 임베드용 DSR 대출 한도 계산기 (edge Route Handler).
//
// 계산 단일 소스: /calc/dsr-quick 의 compute (src/lib/simpleCalculators/batch1.ts,
// DSR 40% 한도 → 원리금균등 PV 역산). 순수 산술이라 위젯 JS 에 동일 산식을 인라인한다.
// 본편 compute 와의 일치는 vitest(src/lib/__tests__/widgetDsr.test.ts)가 강제한다(드리프트 = 테스트 실패).
// ★ 이 파일에서 @/lib/simpleCalculators 를 import 하지 말 것 — 계산기 레지스트리 전체가 edge 함수에
//   번들돼 1.68MB·콜드 isolate CPU 낭비였다(2026-09-25 B1, 종전 모듈 스코프 assert 제거).
import { DSR_RATIO } from "@/lib/widgets/dsrLimit";
import { WIDGET_HEADERS, widgetShell } from "../shared";

export const runtime = "edge";

function buildHtml(): string {
  return widgetShell({
    title: "2026 DSR 대출 한도 계산기 — 머니샐러리",
    bodyHtml: `  <p class="title">🏠 DSR 40% <span>대출 한도</span> 계산기</p>
  <div class="row">
    <label for="yearly">연소득</label>
    <input id="yearly" type="text" data-number-input="grouped" role="spinbutton" inputmode="decimal" min="500" max="100000" step="100" value="5,000">
    <span class="unit">만원</span>
  </div>
  <div class="row">
    <label for="rate">금리</label>
    <input id="rate" type="text" data-number-input="grouped" role="spinbutton" inputmode="decimal" min="0" max="20" step="0.1" value="4">
    <span class="unit">%</span>
    <label for="years">만기</label>
    <input id="years" type="text" data-number-input="grouped" role="spinbutton" inputmode="decimal" min="1" max="50" step="1" value="30">
    <span class="unit">년</span>
  </div>
  <div class="result">
    <span class="label">DSR 한도 대출액</span>
    <span class="value" id="limit">—</span>
  </div>
  <div class="result minor">
    <span class="label">월 원리금 한도</span>
    <span class="value" id="monthly">—</span>
  </div>
  <p class="note">DSR 40%·원리금균등 기준 추정치입니다. 기존 대출 원리금이 있으면 한도가 줄어들며, 은행·규제지역별 기준이 다를 수 있습니다.</p>`,
    script: `(function () {
  var RATIO = ${DSR_RATIO};
  var yearly = document.getElementById("yearly");
  var rate = document.getElementById("rate");
  var years = document.getElementById("years");
  var limitEl = document.getElementById("limit");
  var monthlyEl = document.getElementById("monthly");
  function render() {
    var y = parseFloat(yearly.value.replace(/,/g, "")) * 10000;
    var rp = parseFloat(rate.value.replace(/,/g, ""));
    var n = parseInt(years.value.replace(/,/g, ""), 10);
    if (!isFinite(y) || y <= 0 || !isFinite(rp) || rp < 0 || !isFinite(n) || n < 1) {
      limitEl.textContent = "—"; monthlyEl.textContent = "—"; return;
    }
    var monthly = (y * RATIO) / 12;
    var r = rp / 100 / 12, months = n * 12;
    var principal = r === 0 ? monthly * months : (monthly * (1 - Math.pow(1 + r, -months))) / r;
    var eok = principal / 100000000;
    limitEl.innerHTML = (eok >= 1 ? eok.toFixed(2) + "<small>억원</small>" : Math.round(principal / 10000).toLocaleString("ko-KR") + "<small>만원</small>");
    monthlyEl.innerHTML = Math.round(monthly / 10000).toLocaleString("ko-KR") + "<small>만원</small>";
  }
  bindGroupedNumberInput(yearly, render);
  bindGroupedNumberInput(rate, render);
  bindGroupedNumberInput(years, render);
  render();
})();`,
    ctaHref: "/home-loan",
    ctaLabel: "LTV·월 상환액까지 정확히 계산하기 →",
  });
}

// HTML 은 배포 단위 상수 — 모듈 스코프 1회 생성 (형제 위젯과 동일 패턴)
const WIDGET_HTML = buildHtml();

export async function GET() {
  return new Response(WIDGET_HTML, { headers: WIDGET_HEADERS });
}
