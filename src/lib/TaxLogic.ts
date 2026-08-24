// src/lib/TaxLogic.ts
//
// 메인 페이지 연봉 실수령액 계산 핵심 로직.
// 4대보험 요율·국민연금 상한·세율은 lib/taxConstants2026.ts 단일 진실 소스에서 import.
// 2027년 세율 변경 시 taxConstants2026 한 파일만 수정 → 모든 계산기 일괄 반영.

import {
 INSURANCE_RATES_2026,
 PENSION_BASE_2026,
 earnedIncomeDeduction2026,
 calcIncomeTax2026,
 earnedIncomeTaxCredit2026,
 childTaxCredit2026,
} from "./taxConstants2026";

export type TaxResult = {
 nationalPension: number;
 healthInsurance: number;
 longTermCare: number;
 employmentInsurance: number;
 incomeTax: number;
 localIncomeTax: number;
 totalDeductions: number;
 netPay: number;
};

// 하위 호환을 위한 alias — 기존 코드 변경 최소화
const TAX_RATES_2026 = INSURANCE_RATES_2026;
const CAPS_2026 = {
 NATIONAL_PENSION_MAX_INCOME: PENSION_BASE_2026.MAX_MONTHLY,
 NATIONAL_PENSION_MIN_INCOME: PENSION_BASE_2026.MIN_MONTHLY,
};

// 근로소득공제(2,000만 캡 포함)·누진세율표·근로소득세액공제·자녀세액공제는
// 전부 taxConstants2026 정본 함수를 사용한다 (로컬 재구현 제거, 2026-08 대규모 점검).

export function calculateSalary2026(
 annualSalary: number,
 nonTaxableMonthly: number = 200_000,
 dependents: number = 1,
 children: number = 0
): TaxResult {
 const monthlySalary = annualSalary / 12;
 
 // 1. National Pension
 // Logic: Applied on monthly income, capped at max income
 const pensionBase = Math.min(Math.max(monthlySalary - nonTaxableMonthly, CAPS_2026.NATIONAL_PENSION_MIN_INCOME), CAPS_2026.NATIONAL_PENSION_MAX_INCOME);
 const nationalPension = Math.floor((pensionBase * TAX_RATES_2026.NATIONAL_PENSION) / 10) * 10; // Floor to 10 won

 // 2. Health Insurance
 // Logic: Applied on (Monthly Salary - NonTaxable)
 const healthBase = monthlySalary - nonTaxableMonthly;
 const healthInsurance = Math.floor((healthBase * TAX_RATES_2026.HEALTH_INSURANCE) / 10) * 10;

 // 3. Long-term Care Insurance
 // Logic: % of Health Insurance
 const longTermCare = Math.floor((healthInsurance * TAX_RATES_2026.LONG_TERM_CARE_RATIO) / 10) * 10;

 // 4. Employment Insurance
 // Logic: Applied on (Monthly Salary - NonTaxable)
 const employmentInsurance = Math.floor((healthBase * TAX_RATES_2026.EMPLOYMENT_INSURANCE) / 10) * 10;

 // 5. Income Tax (Simplified Year-End Adjustment Logic for Monthly Withholding)
 // Step A: Annual Income -> Tax Base
 const annualNonTaxable = nonTaxableMonthly * 12;
 const taxableIncome = Math.max(0, annualSalary - annualNonTaxable);
 const incomeDeduction = earnedIncomeDeduction2026(taxableIncome);
 
 // Step B: Personal Exemptions
 // Basic: 1.5M per person
 const personalExemption = dependents * 1_500_000; 
 // Pension Deduction (Full amount deductible)
 const annualPension = nationalPension * 12; // Approximation using monthly * 12
 
 const taxBase = Math.max(0, taxableIncome - incomeDeduction - personalExemption - annualPension);
 
 // Step C: Calculate Tax
 const calculatedTax = calcIncomeTax2026(taxBase);

 // Step D: Tax Credits
 const taxCredit = earnedIncomeTaxCredit2026(calculatedTax, annualSalary);

 // 자녀세액공제 (소득세법 §59의2) — 정본 함수 사용
 const childCredit = childTaxCredit2026(children);
 
 const finalAnnualTax = Math.max(0, calculatedTax - taxCredit - childCredit);
 
 // Monthly Income Tax
 const incomeTax = Math.floor((finalAnnualTax / 12) / 10) * 10;
 
 // 6. Local Income Tax (10% of Income Tax)
 const localIncomeTax = Math.floor((incomeTax * TAX_RATES_2026.LOCAL_INCOME_TAX_RATIO) / 10) * 10;

 const totalDeductions = nationalPension + healthInsurance + longTermCare + employmentInsurance + incomeTax + localIncomeTax;
 const netPay = Math.floor(monthlySalary - totalDeductions);

 return {
 nationalPension,
 healthInsurance,
 longTermCare,
 employmentInsurance,
 incomeTax,
 localIncomeTax,
 totalDeductions,
 netPay
 };
}
