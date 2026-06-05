// src/lib/calculator.ts

// [추가] types.ts에서 AdvancedSettings 타입을 import 합니다.
import type { AdvancedSettings } from "@/app/types";

const PENSION_RATE = 0.0475;
// 국민연금 월 기준소득월액 상한 637만원 (2025.7~2026.6) — PENSION_MONTHLY_CAP_2026 과 동일
const PENSION_MONTHLY_CAP = 6370000 * PENSION_RATE;
const HEALTH_RATE = 0.03595;
const LONG_TERM_CARE_RATE = 0.1314;
const EMPLOYMENT_INSURANCE_RATE = 0.009;
const LOCAL_INCOME_TAX_RATE = 0.1;

export type CalculationResult = ReturnType<typeof calculateNetSalary>;

function getEarnedIncomeDeduction(annualSalary: number): number {
 if (annualSalary <= 5000000) return annualSalary * 0.7;
 if (annualSalary <= 15000000) return 3500000 + (annualSalary - 5000000) * 0.4;
 if (annualSalary <= 45000000)
 return 7500000 + (annualSalary - 15000000) * 0.15;
 if (annualSalary <= 100000000)
 return 12000000 + (annualSalary - 45000000) * 0.05;
 return 14750000 + (annualSalary - 100000000) * 0.02;
}

function getCalculatedTax(taxBase: number): number {
 if (taxBase <= 14000000) return taxBase * 0.06;
 if (taxBase <= 50000000) return 840000 + (taxBase - 14000000) * 0.15;
 if (taxBase <= 88000000) return 6240000 + (taxBase - 50000000) * 0.24;
 if (taxBase <= 150000000) return 15360000 + (taxBase - 88000000) * 0.35;
 if (taxBase <= 300000000) return 37060000 + (taxBase - 150000000) * 0.38;
 if (taxBase <= 500000000) return 94060000 + (taxBase - 300000000) * 0.4;
 if (taxBase <= 1000000000) return 174060000 + (taxBase - 500000000) * 0.42;
 return 384060000 + (taxBase - 1000000000) * 0.45;
}

function getTaxCredit(calculatedTax: number, annualSalary: number): number {
 let credit = 0;
 if (calculatedTax <= 1300000) {
 credit = calculatedTax * 0.55;
 } else {
 credit = 715000 + (calculatedTax - 1300000) * 0.3;
 }
 // 근로소득세액공제 한도 (2026 세법 기준)
 // 총급여 1.2억 초과 → 50만원 한도
 // 총급여 7,000만원 초과 ~ 1.2억 이하 → 66만원 한도
 // 총급여 3,300만원 초과 ~ 7,000만원 이하 → 74만원 한도
 // 총급여 3,300만원 이하 → 한도 없음
 if (annualSalary > 120_000_000) return Math.min(credit, 500_000);
 if (annualSalary > 70_000_000) return Math.min(credit, 660_000);
 if (annualSalary > 33_000_000) return Math.min(credit, 740_000);
 return credit;
}

// [수정] overtimePay 파라미터를 제거하고 advancedSettings를 받도록 변경
export function calculateNetSalary(
 annualSalary: number,
 nonTaxableAmount: number = 0,
 dependents: number = 1,
 children: number = 0,
 advancedSettings: AdvancedSettings
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
 taxableMonthlyIncome * PENSION_RATE,
 PENSION_MONTHLY_CAP
 );
 const health = taxableMonthlyIncome * HEALTH_RATE;
 const longTermCare = health * LONG_TERM_CARE_RATE;
 const employment = taxableMonthlyIncome * EMPLOYMENT_INSURANCE_RATE;

 const earnedIncomeDeduction = getEarnedIncomeDeduction(taxableAnnualSalary);

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

 const calculatedTax = getCalculatedTax(taxBase);
 const taxCredit = getTaxCredit(calculatedTax, taxableAnnualSalary);

 // 자녀 세액공제: 1명 15만원, 2명 35만원(15+20), 3명부터 1명당 30만원 추가
 let childTaxCredit = 0;
 if (children === 1) {
 childTaxCredit = 150000;
 } else if (children >= 2) {
 childTaxCredit = 350000 + (children - 2) * 300000;
 }

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

// [2026년 4대보험 요율 — 사이트 전역 단일 기준]
// src/lib/taxConstants2026.ts (INSURANCE_RATES_2026·PENSION_BASE_2026) 와 동일 값 유지.
// 2026 변경: 국민연금 9%→9.5%(본인 4.75%, 2026-01 시행), 건강보험 7.09%→7.19%(본인 3.595%),
// 장기요양 12.95%→13.14%, 국민연금 상한 617만→637만. (출처: 보건복지부·국민연금공단 2025)
const PENSION_RATE_2026 = 0.0475; // 국민연금 본인부담 4.75% (회사 4.75% 별도)
const PENSION_MONTHLY_CAP_2026 = 6370000 * PENSION_RATE_2026; // 월 기준소득월액 상한 637만원
const HEALTH_RATE_2026 = 0.03595; // 건강보험 본인부담 3.595% (7.19% / 2)
const LONG_TERM_CARE_RATE_2026 = 0.1314; // 장기요양 = 건강보험료 × 13.14%
const EMPLOYMENT_INSURANCE_RATE_2026 = 0.009; // 고용보험 본인부담 0.9%

export function calculateNetSalary2026(
 annualSalary: number,
 nonTaxableAmount: number = 0,
 dependents: number = 1,
 children: number = 0,
 advancedSettings: AdvancedSettings
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
 taxableMonthlyIncome * PENSION_RATE_2026,
 PENSION_MONTHLY_CAP_2026
 );
 const health = taxableMonthlyIncome * HEALTH_RATE_2026;
 const longTermCare = health * LONG_TERM_CARE_RATE_2026;
 const employment = taxableMonthlyIncome * EMPLOYMENT_INSURANCE_RATE_2026;

 const earnedIncomeDeduction = getEarnedIncomeDeduction(taxableAnnualSalary);

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

 const calculatedTax = getCalculatedTax(taxBase);
 const taxCredit = getTaxCredit(calculatedTax, taxableAnnualSalary);

 let childTaxCredit = 0;
 if (children === 1) {
 childTaxCredit = 150000;
 } else if (children >= 2) {
 childTaxCredit = 350000 + (children - 2) * 300000;
 }

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
