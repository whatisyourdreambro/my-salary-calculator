// /widget/military-pay — 블로그 임베드용 군인 월급 표 + 장병내일준비적금 요약 (edge Route Handler).
//
// 수치 정본: src/lib/civilServantPay.ts (공무원보수규정 별표 13 원문 — 3중 교차검증)
//   단일 소스 import — 이 파일에 봉급·적금 수치 하드코딩 금지.
// 헤더(CSP frame-ancestors·noindex·캐시)는 핸들러가 직접 세팅 (shared.ts 참조).
// 색인 차단: X-Robots-Tag + robots.ts Disallow(/widget/) 이중. 무광고·무GA.
//
// ★ 갱신 슬롯: 매년 12월 말 국무회의 의결로 civilServantPay 의 병·간부 봉급이
//   갱신되면 이 위젯은 자동 반영 — 연도 라벨(2026)만 함께 확인할 것.
//   장병내일준비적금 구조는 예산사업(연중 변경 가능) — MILITARY_SAVINGS 주석 참조.

import {
  MILITARY_PAY_2026,
  MILITARY_OFFICER_STARTING_2026,
  MILITARY_SAVINGS_2026,
} from "@/lib/civilServantPay";
import { WIDGET_HEADERS, widgetShell } from "../shared";

export const runtime = "edge";

const won = (n: number) => n.toLocaleString("ko-KR");
const manwon = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR");

function buildHtml(): string {
  // 대표 예시: 육군 복무 18개월 기준 만기 수령 구조 (원금 + 정부 매칭)
  const exampleMonths = 18;
  const principal = MILITARY_SAVINGS_2026.monthlyCap * exampleMonths;
  const matching = Math.round(principal * MILITARY_SAVINGS_2026.matchRate);

  const rankCells = MILITARY_PAY_2026.map(
    (row) => `    <div style="background:var(--card);border-radius:10px;padding:10px 8px;text-align:center;">
      <div style="font-size:12px;font-weight:700;color:var(--sub);margin-bottom:2px;">${row.rank}</div>
      <div style="font-size:15px;font-weight:900;">${won(row.pay)}원</div>
    </div>`,
  ).join("\n");

  const officerCells = MILITARY_OFFICER_STARTING_2026.map(
    (row) => `${row.rank} ${won(row.pay)}원`,
  ).join(" · ");

  return widgetShell({
    title: "2026 군인 월급 — 병사 봉급표·적금 매칭 — 머니샐러리",
    bodyHtml: `  <p class="title">🎖️ 2026 군인 월급 <span>병사 봉급표</span></p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
${rankCells}
  </div>
  <div class="result minor">
    <span class="label">장병내일준비적금</span>
    <span class="value">월 최대 ${won(MILITARY_SAVINGS_2026.monthlyCap)}<small>원</small> 납입 시 정부 ${Math.round(MILITARY_SAVINGS_2026.matchRate * 100)}<small>%</small> 매칭</span>
  </div>
  <p class="note">예: ${exampleMonths}개월 × ${manwon(MILITARY_SAVINGS_2026.monthlyCap)}만원 납입 = 원금 ${manwon(principal)}만원 + 매칭 ${manwon(matching)}만원 = <b>약 ${manwon(principal + matching)}만원</b>(+은행 이자). ${MILITARY_SAVINGS_2026.note}.</p>
  <p class="note">간부 초임(1호봉): ${officerCells}. 병 봉급은 소득세 비과세·4대보험 공제 없음 — 공무원보수규정 별표 13 기준.</p>`,
    script: `/* 정적 표 위젯 — 상호작용 스크립트 없음 */`,
    ctaHref: "/military-pay-2026",
    ctaLabel: "전역 시 적금 수령액 계산하기 →",
  });
}

// HTML 은 배포 단위 상수 — 모듈 스코프 1회 생성 (형제 위젯과 동일 패턴)
const WIDGET_HTML = buildHtml();

export async function GET() {
  return new Response(WIDGET_HTML, { headers: WIDGET_HEADERS });
}
