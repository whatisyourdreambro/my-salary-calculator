// src/lib/calculator.ts
//
// 연봉 실수령액 계산 단일 코어.
// 2026-08 대규모 점검: 기존에 calculateNetSalary / calculateNetSalary2026 두 함수가
// 상수 이름만 다르고 값·로직이 100% 동일하게 중복 정의되어 있던 것을 요율
// 파라미터화된 코어 하나로 통합. 세율표·근로소득공제(2,000만 캡 포함)·
// 근로소득세액공제·자녀세액공제는 taxConstants2026 정본 함수를 사용한다.

// [추가] types.ts에서 AdvancedSettings 타입을 import 합니다.
import type { AdvancedSettings } from "@/app/types";
import {
 INSURANCE_RATES_2026,
 PENSION_BASE_2026,
 earnedIncomeDeduction2026,
 calcIncomeTax2026,
 earnedIncomeTaxCredit2026,
 childTaxCredit2026,
} from "./taxConstants2026";

/** 4대보험 요율 파라미터 — 연도별 계산(표의 "전년 대비" 기준선 등)에 사용 */
export interface NetSalaryRates {
 /** 국민연금 근로자 부담 요율 */
 pension: number;
 /** 국민연금 기준소득월액 상한 (원) — 공제 상한 = 상한 × 요율 */
 pensionMonthlyCapBase: number;
 /** 건강보험 근로자 부담 요율 */
 health: number;
 /** 장기요양보험 — 건강보험료 대비 비율 */
 ltcRatio: number;
 /** 고용보험 근로자 부담 요율 */
 employment: number;
}

export const NET_SALARY_RATES_2026: NetSalaryRates = {
 pension: INSURANCE_RATES_2026.NATIONAL_PENSION,
 pensionMonthlyCapBase: PENSION_BASE_2026.MAX_MONTHLY,
 health: INSURANCE_RATES_2026.HEALTH_INSURANCE,
 ltcRatio: INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO,
 employment: INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE,
};

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
 const taxableAnnualSalary = annualSalary - actualNonTaxableAmount;
 const monthlySalary = annualSalary / 12;
 const taxableMonthlyIncome = Math.max(
 0,
 monthlySalary - actualNonTaxableAmount / 12
 );

 const pension = Math.min(
 taxableMonthlyIncome * rates.pension,
 rates.pensionMonthlyCapBase * rates.pension
 );
 const health = taxableMonthlyIncome * rates.health;
 const longTermCare = health * rates.ltcRatio;
 const employment = taxableMonthlyIncome * rates.employment;

 const earnedIncomeDeduction = earnedIncomeDeduction2026(taxableAnnualSalary);

 const personalDeduction =
 dependents * 1500000 +
 advancedSettings.disabledDependents * 2000000 +
 advancedSettings.seniorDependents * 1000000;

 const pensionDeduction = pension * 12;

 const taxBase = Math.max(
 0,
 taxableAnnualSalary -
 earnedIncomeDeduction -
 personalDeduction -
 pensionDeduction
 );

 const calculatedTax = calcIncomeTax2026(taxBase);
 const taxCredit = earnedIncomeTaxCredit2026(calculatedTax, taxableAnnualSalary);

 // 자녀세액공제 (소득세법 §59의2) — 정본 함수 사용 (첫째 25만·둘째 30만·셋째+ 40만)
 const childTaxCredit = childTaxCredit2026(children);

 let finalAnnualTax = Math.max(0, calculatedTax - taxCredit - childTaxCredit);

 if (advancedSettings.isSmeYouth) {
 const taxReductionLimit = 2000000;
 const taxReductionAmount = finalAnnualTax * 0.9;
 finalAnnualTax -= Math.min(taxReductionAmount, taxReductionLimit);
 }

 const incomeTax = finalAnnualTax / 12;
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
 NET_SALARY_RATES_2026
 );
}

// 하위 호환 alias — 기존 호출부(generateData.ts 등)가 그대로 사용
export const calculateNetSalary2026 = calculateNetSalary;
