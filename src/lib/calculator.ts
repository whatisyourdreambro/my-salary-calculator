// src/lib/calculator.ts
//
// 연봉 실수령액 계산 단일 코어.
// 2026-08 대규모 점검: 기존에 calculateNetSalary / calculateNetSalary2026 두 함수가
// 상수 이름만 다르고 값·로직이 100% 동일하게 중복 정의되어 있던 것을 요율
// 파라미터화된 코어 하나로 통합. 월 소득세는 근로소득 간이세액표(withholdingTaxTable2026)
// 금액이다 (2026-09-25 A17 — 종전 연간 추정 ÷ 12 모델 대체).
//
// 요율 연도 (2026-09-25 N3): calculateNetSalary 는 현행 포인터(src/config/currentRates.ts)를,
// calculateNetSalary2026 은 2026 요율을 고정으로 쓴다 — /table/2026 주급·시급 표는 1/1 전환 뒤에도
// 2026 값이어야 하므로 2026 고정 쪽을 부른다.

// [추가] types.ts에서 AdvancedSettings 타입을 import 합니다.
import type { AdvancedSettings } from "@/app/types";
import {
 INSURANCE_RATES_2026,
 PENSION_BASE_2026,
 type InsuranceRates,
} from "./taxConstants2026";
import { CURRENT_INSURANCE_RATES } from "@/config/currentRates";
import { withholdingIncomeTax2026 } from "./withholdingTaxTable2026";

/** 4대보험 요율 파라미터 — 연도별 계산(표의 "전년 대비" 기준선 등)에 사용 */
export interface NetSalaryRates {
 /** 국민연금 근로자 부담 요율 */
 pension: number;
 /** 국민연금 기준소득월액 상한 (원) — 공제 상한 = 상한 × 요율 */
 pensionMonthlyCapBase: number;
 /** 국민연금 기준소득월액 하한 (원) — 하한 미만 소득도 하한 기준으로 부과 */
 pensionMonthlyFloorBase: number;
 /** 건강보험 근로자 부담 요율 */
 health: number;
 /** 장기요양보험 — 건강보험료 대비 비율 */
 ltcRatio: number;
 /** 고용보험 근로자 부담 요율 */
 employment: number;
}

/**
 * 연도 요율(InsuranceRates) → 코어 파라미터. 국민연금 기준소득월액 상·하한은 PENSION_BASE_2026
 * (2026-07~2027-06 적용 — 2027-01 요율 전환과 무관하게 2027-06 까지 유지, 7월 재조정은 별도).
 */
export function toNetSalaryRates(rates: InsuranceRates): NetSalaryRates {
 return {
 pension: rates.NATIONAL_PENSION,
 pensionMonthlyCapBase: PENSION_BASE_2026.MAX_MONTHLY,
 pensionMonthlyFloorBase: PENSION_BASE_2026.MIN_MONTHLY,
 health: rates.HEALTH_INSURANCE,
 ltcRatio: rates.LONG_TERM_CARE_RATIO,
 employment: rates.EMPLOYMENT_INSURANCE,
 };
}

/** 2026 요율 고정 — /table/2026 표·전년 대비 기준선 전용 */
export const NET_SALARY_RATES_2026: NetSalaryRates = toNetSalaryRates(INSURANCE_RATES_2026);

/** 현행 요율 — src/config/currentRates.ts 포인터를 따른다 (1/1 전환 시 자동 반영) */
export const CURRENT_NET_SALARY_RATES: NetSalaryRates = toNetSalaryRates(CURRENT_INSURANCE_RATES);

const LOCAL_INCOME_TAX_RATE = INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO;

export type CalculationResult = ReturnType<typeof calculateNetSalary>;

/** 요율 파라미터를 받는 단일 코어 — 일반 소비처는 아래 calculateNetSalary 사용 */
export function calculateNetSalaryWithRates(
 annualSalary: number,
 nonTaxableAmount: number,
 dependents: number,
 children: number,
 advancedSettings: AdvancedSettings,
 rates: NetSalaryRates
) {
 if (!Number.isFinite(annualSalary) || annualSalary <= 0) {
 return {
 monthlyNet: 0,
 totalDeduction: 0,
 pension: 0,
 health: 0,
 longTermCare: 0,
 employment: 0,
 incomeTax: 0,
 localTax: 0,
 };
 }

 const actualNonTaxableAmount = Math.min(annualSalary, nonTaxableAmount);
 const monthlySalary = annualSalary / 12;
 const taxableMonthlyIncome = Math.max(
 0,
 monthlySalary - actualNonTaxableAmount / 12
 );

 // 기준소득월액 상·하한 클램프 (2026.7~: 월 659만 / 41만 — taxConstants2026 정본)
 const pensionBase = Math.min(
 Math.max(taxableMonthlyIncome, rates.pensionMonthlyFloorBase),
 rates.pensionMonthlyCapBase
 );
 const pension = pensionBase * rates.pension;
 const health = taxableMonthlyIncome * rates.health;
 const longTermCare = health * rates.ltcRatio;
 const employment = taxableMonthlyIncome * rates.employment;

 // 월 소득세 — 근로소득 간이세액표(소득세법 시행령 별표2, 2026-03-01 지급분~) 월 원천징수액.
 // 월급여액 = 월 과세 보수, 공제대상가족 수 = dependents(본인 포함), 8~20세 자녀 공제 = children.
 // 2026-09-25(A17 CALC-01) 전에는 연간 세액을 추정해 12로 나눴고 건강·고용보험료 공제(§52)와
 // 특별공제가 빠져 급여명세서보다 소득세가 컸다. 표의 '특별소득공제 등'이 이를 반영한다.
 // - 장애인(200만)·경로우대(100만) 추가공제는 표에 없는 항목이라 같은 표 산식에 공제를 더해 추정.
 // - 중소기업 청년 감면은 표 산식의 산출세액에 조특법 §30 감면과 소득세법 §59③ 공제 축소를
 //   적용한다(/calc/smb-income-tax-break 와 같은 applySmeYouthReduction 헬퍼).
 const extraAnnualDeduction =
 advancedSettings.disabledDependents * 2000000 +
 advancedSettings.seniorDependents * 1000000;
 const incomeTax = withholdingIncomeTax2026(taxableMonthlyIncome, dependents, children, {
 extraAnnualDeduction,
 smeYouth: advancedSettings.isSmeYouth,
 });
 const localTax = incomeTax * LOCAL_INCOME_TAX_RATE;

 const totalDeduction =
 pension + health + longTermCare + employment + incomeTax + localTax;
 const finalMonthlyNet = monthlySalary - totalDeduction;

 return {
 monthlyNet: Math.round(finalMonthlyNet),
 totalDeduction: Math.round(totalDeduction),
 pension: Math.round(pension),
 health: Math.round(health),
 longTermCare: Math.round(longTermCare),
 employment: Math.round(employment),
 incomeTax: Math.round(incomeTax),
 localTax: Math.round(localTax),
 };
}

// [수정] overtimePay 파라미터를 제거하고 advancedSettings를 받도록 변경
/** 현행 요율(포인터) 월 실수령 — 홈·급여명세서 등 연도 표기 없는 계산기 */
export function calculateNetSalary(
 annualSalary: number,
 nonTaxableAmount: number = 0,
 dependents: number = 1,
 children: number = 0,
 advancedSettings: AdvancedSettings
) {
 return calculateNetSalaryWithRates(
 annualSalary,
 nonTaxableAmount,
 dependents,
 children,
 advancedSettings,
 CURRENT_NET_SALARY_RATES
 );
}

/**
 * 2026 요율 고정 월 실수령 — /table/2026 주급·시급 표(InteractiveTable)용.
 * 2026-09-25 N3 전에는 calculateNetSalary 의 alias 였다(지금은 두 요율이 같아 값 동일).
 */
export function calculateNetSalary2026(
 annualSalary: number,
 nonTaxableAmount: number = 0,
 dependents: number = 1,
 children: number = 0,
 advancedSettings: AdvancedSettings
) {
 return calculateNetSalaryWithRates(
 annualSalary,
 nonTaxableAmount,
 dependents,
 children,
 advancedSettings,
 NET_SALARY_RATES_2026
 );
}
