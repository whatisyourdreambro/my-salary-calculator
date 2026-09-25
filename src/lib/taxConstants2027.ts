// src/lib/taxConstants2027.ts
//
// 2027년 4대보험 요율 정본 (2026-09-25 N3 — 1/1 전환 준비).
// 종전에는 /table/2027·요율표가 generateData2027.ts 의 NET_SALARY_RATES_2027 안에
// 국민연금 0.05 를 리터럴로 들고 있었다. 이 파일이 2027 요율의 유일한 원천이고,
// NET_SALARY_RATES_2027(표 4종)과 src/config/currentRates.ts(현행 포인터)가 여기서 파생한다.
//
// ★ 이 블록이 1/1 에 '현행 요율'이 된다 — CURRENT_RATES_YEAR 를 2027 로 바꾸기 전에
//   INSURANCE_RATES_2027_STATUS 의 provisional 항목을 전부 확인하고 confirmed 로 바꿀 것
//   (currentRates.test.ts 가 provisional 이 남은 채 전환되는 것을 막는다).
//   런북: docs/next-upgrade-plan-2026-09-11.md §5.

import { INSURANCE_RATES_2026, type InsuranceRates } from "./taxConstants2026";

/**
 * 2027 근로자 부담 요율.
 * - 국민연금 5.0% — ★확정. 국민연금법 개정(법률 제20903호, 2025-04-02 공포, 2026-01-01 시행)의
 *   법정 스케줄: 총 9.5%(2026) → 10.0%(2027) → 매년 0.5%p → 13.0%(2033). 사업장가입자는 절반씩.
 *   출처: 보건복지부 연금개혁 Q&A · 국민연금공단 법령정보(국민연금법 개정 안내).
 * - 건강보험 3.595% — ★확정: 2027 동결(총 7.19%). 2026년 제15차 건강보험정책심의위원회(2026-09-08).
 * - 장기요양 비율 — 미확정: 2027년분은 장기요양위원회가 10월 이후 결정 예정(보건복지부 2026-08-14
 *   제7기 장기요양위원회 출범 보도). 그 전까지 2026 비율(건보료의 13.14%) 준용.
 * - 고용보험 0.9% — 미확정: 고용노동부 2026-09-01 「고용보험 제도개편 방안」이 실업급여 요율을
 *   근로자·회사 각 0.9%→1.0% 로 올리는 안을 냈으나 법령 개정 전(연내 개정 목표). 개정 공포 전까지 현행.
 * - 지방소득세 — 소득세의 10% (변동 없음).
 */
export const INSURANCE_RATES_2027: InsuranceRates = {
  NATIONAL_PENSION: 0.05,
  HEALTH_INSURANCE: INSURANCE_RATES_2026.HEALTH_INSURANCE,
  LONG_TERM_CARE_RATIO: INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO,
  EMPLOYMENT_INSURANCE: INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE,
  LOCAL_INCOME_TAX_RATIO: INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO,
};

/**
 * 2027 요율 항목별 확정 상태.
 * confirmed = 공식 결정·법령으로 2027 값이 확정됨 / provisional = 2026 값 준용 중(결정 대기).
 * 갱신 슬롯: 장기요양 — 2026년 10~11월 장기요양위원회 의결 · 고용보험 — 징수법 시행령 개정 공포 시
 * (개정 없이 해를 넘기면 현행 0.9% 가 그대로 2027 법정 요율이므로 확인 후 confirmed).
 */
export const INSURANCE_RATES_2027_STATUS: Readonly<
  Record<keyof InsuranceRates, "confirmed" | "provisional">
> = {
  NATIONAL_PENSION: "confirmed",
  HEALTH_INSURANCE: "confirmed",
  LONG_TERM_CARE_RATIO: "provisional",
  EMPLOYMENT_INSURANCE: "provisional",
  LOCAL_INCOME_TAX_RATIO: "confirmed",
};
