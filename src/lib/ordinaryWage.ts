// src/lib/ordinaryWage.ts
//
// 통상임금 계산 — /calc/ordinary-wage 전용 순수 함수 (서버·클라 공용, 의존성 0).
//
// 법적 근거 (2026 기준, 전부 원문 확인 2026-08-30):
// - 대법원 2020다247190 전원합의체(2024-12-19): '고정성' 요건 폐기 — 재직조건부·
//   최소근무일수 조건부 정기상여금도 통상임금 포함. 새 법리는 선고일 이후 산정분 적용.
// - 고용노동부 통상임금 노사지도 지침 개정(2025-02-06): 지급주기 1개월 초과(분기·연
//   상여)여도 제외되지 않음 — 연 상여 총액 ÷ 12 월할 산입.
// - 근로기준법 시행령 제6조: 시간급 = 월 통상임금 ÷ 월 통상임금 산정 기준시간.
//   주 40h: (40 + 주휴 8) × (365/7/12 = 4.345주) = 208.57 → 209시간.
// - 근로기준법 제56조: 연장·야간 50% 가산(중복 가능), 휴일 8h 이내 50%·초과 100%.

export interface OrdinaryWageInput {
  /** 월 기본급 (원) */
  monthlyBase: number;
  /** 월 고정수당 — 정기·일률 지급분 (원) */
  monthlyFixedAllowance: number;
  /** 연간 정기상여 총액 (원) — 재직조건부 포함 (2024-12 전합) */
  annualBonus: number;
}

export interface OrdinaryWageResult {
  /** 월 통상임금 (원) */
  monthlyOrdinary: number;
  /** 월 소정근로시간 (주 40h 기준 209) */
  monthlyHours: number;
  /** 시간급 통상임금 (원, 소수 유지) */
  hourly: number;
  /** 1일(8h) 통상임금 */
  daily: number;
  /** 연장근로 1시간 (×1.5) */
  overtimeHourly: number;
  /** 야간근로 가산분 1시간 (+0.5 — 연장과 중복 시 합산) */
  nightExtraHourly: number;
  /** 휴일근로 8시간 (×1.5) */
  holiday8hPay: number;
  /** 휴일근로 8시간 초과 1시간 (×2.0) */
  holidayOver8Hourly: number;
  /** 미사용 연차 1일 수당 (= 1일 통상임금) */
  annualLeaveDaily: number;
}

/** 주 40시간 기준 월 통상임금 산정 기준시간 — 209시간 고정 */
export const MONTHLY_ORDINARY_HOURS = 209;

export function computeOrdinaryWage(input: OrdinaryWageInput): OrdinaryWageResult {
  const monthlyOrdinary =
    Math.max(0, input.monthlyBase) +
    Math.max(0, input.monthlyFixedAllowance) +
    Math.max(0, input.annualBonus) / 12;
  const hourly = monthlyOrdinary / MONTHLY_ORDINARY_HOURS;
  const daily = hourly * 8;
  return {
    monthlyOrdinary,
    monthlyHours: MONTHLY_ORDINARY_HOURS,
    hourly,
    daily,
    overtimeHourly: hourly * 1.5,
    nightExtraHourly: hourly * 0.5,
    holiday8hPay: daily * 1.5,
    holidayOver8Hourly: hourly * 2,
    annualLeaveDaily: daily,
  };
}
