// src/config/minimumWage.ts
//
// 최저임금 확정값 단일 진실 소스 (2026-08-31 신설 — 위젯 B3-1).
// 종전에 /minimum-wage-2027 페이지 로컬 상수였던 값을 페이지·임베드 위젯
// (/widget/minimum-wage)이 함께 import 하도록 추출 — 상수 이중 관리 방지.
//
// 출처:
// - 2027: 최저임금위원회 2026-07-14 제14차 전원회의 의결 → 고용노동부
//   2026-08-05 확정 고시 (시급 10,700원)
// - 2026: 고용노동부 고시 제2025-… (2026-01-01 시행, 시급 10,320원)
//
// ★ 갱신 슬롯: 매년 7월 중순 최저임금위원회 의결 + 8월 초 고용노동부 확정
//   고시 직후 이듬해 값 추가 (2027-07 → MINIMUM_WAGE_2028 추가 예정).

/** 주휴수당 포함 월 환산 시간 — 주 40시간 + 주휴 8시간, 4.345주 */
export const MONTHLY_HOURS = 209;

export interface MinimumWageYear {
  /** 적용 연도 */
  year: number;
  /** 시급 (원) */
  hourly: number;
  /** 주휴 포함 월 환산액 (원, 시급 × 209시간) */
  monthly: number;
  /** 연 환산액 (원, 월 × 12) */
  yearly: number;
}

function build(year: number, hourly: number): MinimumWageYear {
  const monthly = hourly * MONTHLY_HOURS;
  return { year, hourly, monthly, yearly: monthly * 12 };
}

/** 2026년 적용 최저임금 (현행, 2026-12-31까지) — 시급 10,320원 · 월 2,156,880원 */
export const MINIMUM_WAGE_2026: MinimumWageYear = build(2026, 10320);

/** 2027년 적용 최저임금 (확정 고시, 2027-01-01부터) — 시급 10,700원 · 월 2,236,300원 */
export const MINIMUM_WAGE_2027: MinimumWageYear = build(2027, 10700);
