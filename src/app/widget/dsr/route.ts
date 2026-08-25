// /widget/dsr — 블로그 임베드용 DSR 대출 한도 계산기 (edge Route Handler).
//
// 계산 단일 소스: /calc/dsr-quick 의 compute (src/lib/simpleCalculators/batch1.ts,
// DSR 40% 한도 → 원리금균등 PV 역산). 순수 산술이라 위젯 JS 에 동일 산식을 인라인하되,
// 모듈 로드 시 아래 assert 가 본편 compute 와의 일치를 강제한다(드리프트 = 빌드 실패).
import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { WIDGET_HEADERS, widgetShell } from "../shared";

export const runtime = "edge";

const DSR_RATIO = 0.4;

/** 위젯 JS 와 동일한 산식 (원리금균등 상환 월납 한도 → 대출원금 PV) */
function dsrLimitOf(yearly: number, ratePct: number, years: number): number {
  const annualLimit = yearly * DSR_RATIO;
  const monthly = annualLimit / 12;
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return Math.round(monthly * n);
  return Math.round((monthly * (1 - Math.pow(1 + r, -n))) / r);
}

// 본편 dsr-quick compute 와 산식 일치 검증 — 어긋나면 위젯을 배포시키지 않는다.
{
  const calc = getCalculatorBySlug("dsr-quick");
  if (calc) {
    const sample = calc.compute({ yearly: 50_000_000, rate: 4, years: 30 }) as {
      primary: { value: number };
    };
    const mine = dsrLimitOf(50_000_000, 4, 30);
    if (Math.abs(sample.primary.value - mine) > 1) {
      throw new Error(
        `[widget/dsr] 본편 dsr-quick 과 산식 불일치: ${sample.primary.value} vs ${mine}`,
      );
    }
  }
}

function buildHtml(): string {
  return widgetShell({
    title: "2026 DSR 대출 한도 계산기 — 머니샐러리",
    bodyHtml: `  <p class="title">🏠 DSR 40% <span>대출 한도</span> 계산기</p>
  <div class="row">
    <label for="yearly">연소득</label>
    <input id="yearly" type="number" inputmode="numeric" min="500" max="100000" step="100" value="5000">
    <span class="unit">만원</span>
  </div>
  <div class="row">
    <label for="rate">금리</label>
    <input id="rate" type="number" inputmode="decimal" min="0" max="20" step="0.1" value="4">
    <span class="unit">%</span>
    <label for="years">만기</label>
    <input id="years" type="number" inputmode="numeric" min="1" max="50" step="1" value="30">
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
    var y = parseFloat(yearly.value) * 10000;
    var rp = parseFloat(rate.value);
    var n = parseInt(years.value, 10);
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
  yearly.addEventListener("input", render);
  rate.addEventListener("input", render);
  years.addEventListener("input", render);
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
