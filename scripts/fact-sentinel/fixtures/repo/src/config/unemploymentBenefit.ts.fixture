// src/config/unemploymentBenefit.ts
//
// 구직급여(실업급여) 1일 상·하한 단일 진실 소스 (2026-09-12 신설 — S2-1 SI-08).
// 종전에 /unemployment-benefit(UnemploymentBenefitContent.tsx)과 퀵 계산기
// unemployment-benefit(simpleCalculators/batch2.ts)이 68,100·10,320 을 각자
// 로컬 리터럴로 들고 있던 것을 한곳으로 모은다.
// 의존성은 src/config/minimumWage.ts(의존성 0)뿐 — 클라이언트 컴포넌트가 import
// 해도 서버 전용 코드가 딸려오지 않는다.
//
// 출처:
// - 상한: 고용보험법 제45조·시행령 제68조에 따른 고용노동부 고시 — 2026년 이직자
//   1일 상한액 68,100원 (2025년 이직자 66,000원). 최저임금과 연동되지 않는 별도 고시값.
// - 하한: 고용보험법 제46조 — 이직일 당시 최저시급 × 80% × 1일 소정근로시간(8시간 상한).
//   2026: 10,320원 × 80% × 8시간 = 66,048원 → MINIMUM_WAGE_2026 에서 파생한다
//   (unemploymentDailyLowerBound). 2026년은 상한 > 하한이라 상·하한 사이 구간이 있다.
//
// ★ 갱신 슬롯: 매년 12월 말~1월 초 고용노동부 상한액 고시 확인. 최저임금 연도 전환
//   (2027-01-01) 때 하한 파생 기준을 MINIMUM_WAGE_2027 로 함께 옮길 것.

import { MINIMUM_WAGE_2026, type MinimumWageYear } from "./minimumWage";

export const UNEMPLOYMENT_BENEFIT_2026 = {
  /** 적용 연도 (이직일 기준) */
  YEAR: 2026,
  /** 구직급여 1일 상한액 (원) — 고용노동부 고시, 최저임금 비연동 */
  DAILY_UPPER: 68_100,
  /** 하한 산정 비율 — 최저시급의 80% (고용보험법 제46조) */
  LOWER_RATE: 0.8,
  /** 하한 산정에 쓰는 1일 소정근로시간 상한 (시간) */
  MAX_DAILY_HOURS: 8,
} as const;

/**
 * 구직급여 1일 하한액 (원, 반올림 전) — 최저시급 × 80% × 1일 소정근로시간.
 * 기본값(8시간·2026 최저임금)에서 66,048원. 소비자가 시간 입력을 그대로 곱하는
 * /unemployment-benefit 과 동일한 곱셈 순서(시급 × 비율 × 시간)를 유지한다.
 */
export function unemploymentDailyLowerBound(
  hoursPerDay: number = UNEMPLOYMENT_BENEFIT_2026.MAX_DAILY_HOURS,
  wage: MinimumWageYear = MINIMUM_WAGE_2026
): number {
  return wage.hourly * UNEMPLOYMENT_BENEFIT_2026.LOWER_RATE * hoursPerDay;
}
