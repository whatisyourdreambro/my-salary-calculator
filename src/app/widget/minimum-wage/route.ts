// /widget/minimum-wage — 블로그 임베드용 최저임금 카드 + 시급→월급 환산기 (edge Route Handler).
//
// ★에버그린 URL(연도 없음): 블로거가 한 번 붙이면 코드 교체 없이 매년 최신
//   확정값으로 자동 갱신된다. 수치 정본은 src/config/minimumWage.ts 단일 소스 —
//   /minimum-wage-2027 페이지와 동일 모듈을 import (이중 관리 금지).
// 헤더(CSP frame-ancestors·noindex·캐시)는 핸들러가 직접 세팅 — next-on-pages 가
//   config headers() 를 정적 라우트에 내보내지 않는 실측(shared.ts 참조).
// 색인 차단: X-Robots-Tag + robots.ts Disallow(/widget/) 이중. 무광고·무GA.
//
// ★ 갱신 슬롯: 매년 8월 초 확정 고시로 config 에 이듬해 값이 추가되면
//   NEXT/CURRENT 참조와 CTA 딥링크(/minimum-wage-2027)를 새 연도로 교체할 것.

import {
  MINIMUM_WAGE_2026,
  MINIMUM_WAGE_2027,
  MONTHLY_HOURS,
} from "@/config/minimumWage";
import { WIDGET_HEADERS, widgetShell } from "../shared";

export const runtime = "edge";

// 확정 차기(기본 표시) / 현행(병기) — 갱신 슬롯: 연도 전환 시 이 두 줄만 교체
const NEXT = MINIMUM_WAGE_2027;
const CURRENT = MINIMUM_WAGE_2026;

const won = (n: number) => n.toLocaleString("ko-KR");

function buildHtml(): string {
  return widgetShell({
    title: `${NEXT.year} 최저임금 시급 ${won(NEXT.hourly)}원 — 머니샐러리`,
    bodyHtml: `  <p class="title">⏰ ${NEXT.year} 최저임금 <span>시급 ${won(NEXT.hourly)}원</span> 확정</p>
  <div class="result">
    <span class="label">${NEXT.year} 확정 (${NEXT.year}.1.1~)</span>
    <span class="value">시급 ${won(NEXT.hourly)}<small>원</small></span>
  </div>
  <div class="result minor">
    <span class="label">주휴 포함 월급 (209시간)</span>
    <span class="value">${won(NEXT.monthly)}<small>원</small></span>
  </div>
  <div class="result minor">
    <span class="label">${CURRENT.year} 현행 (~${CURRENT.year}.12.31)</span>
    <span class="value">시급 ${won(CURRENT.hourly)}<small>원</small> · 월 ${won(CURRENT.monthly)}<small>원</small></span>
  </div>
  <div class="row">
    <label for="hourly">시급 환산</label>
    <input id="hourly" type="number" inputmode="numeric" min="1000" max="100000" step="10" value="${NEXT.hourly}">
    <span class="unit">원</span>
  </div>
  <div class="result minor">
    <span class="label">주휴 포함 월급 · 연봉</span>
    <span class="value" id="converted">—</span>
  </div>
  <p class="note">고용노동부 확정 고시 기준(${NEXT.year}년 적용 시급 ${won(NEXT.hourly)}원, ${CURRENT.year}년 ${won(CURRENT.hourly)}원). 월급은 주 40시간 + 주휴수당 포함 월 ${MONTHLY_HOURS}시간 환산액입니다.</p>`,
    script: `(function () {
  var HOURS = ${MONTHLY_HOURS};
  var input = document.getElementById("hourly");
  var out = document.getElementById("converted");
  function render() {
    var h = parseFloat(input.value);
    if (!isFinite(h) || h <= 0) { out.textContent = "—"; return; }
    var monthly = h * HOURS;
    var yearly = monthly * 12;
    out.innerHTML = "월 " + Math.round(monthly).toLocaleString("ko-KR") +
      "<small>원</small> · 연 " + Math.round(yearly / 10000).toLocaleString("ko-KR") + "<small>만원</small>";
  }
  input.addEventListener("input", render);
  render();
})();`,
    ctaHref: "/minimum-wage-2027",
    ctaLabel: "표결 결과·세후 실수령액까지 보기 →",
  });
}

// HTML 은 배포 단위 상수 — 모듈 스코프 1회 생성 (형제 위젯과 동일 패턴)
const WIDGET_HTML = buildHtml();

export async function GET() {
  return new Response(WIDGET_HTML, { headers: WIDGET_HEADERS });
}
