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

// 10원 미만 절사(보험료 고지 관례) — 부동소수점 오차로 정확한 경계값(예: 12,600원)이
// 12,599.99…로 계산되어 한 단계 낮게 절사되는 것을 원 단위 반올림 선행으로 방지
const floorTo10 = (v: number) => Math.floor(Math.round(v) / 10) * 10;

export function calculateSalary2026(
 annualSalary: number,
 nonTaxableMonthly: number = 200_000,
 dependents: number = 1,
 children: number = 0
): TaxResult {
 // 방어: 연봉 0 이하 입력은 전 항목 0 반환 (음수 공제·음수 실수령 방지).
 // 정상 입력(연봉 > 0) 경로의 산출값에는 영향 없음.
 if (annualSalary <= 0) {
 return {
 nationalPension: 0,
 healthInsurance: 0,
 longTermCare: 0,
 employmentInsurance: 0,
 incomeTax: 0,
 localIncomeTax: 0,
 totalDeductions: 0,
 netPay: 0,
 };
 }

 const monthlySalary = annualSalary / 12;

 // 1. National Pension
 // Logic: Applied on monthly income, capped at max income
 const pensionBase = Math.min(Math.max(monthlySalary - nonTaxableMonthly, CAPS_2026.NATIONAL_PENSION_MIN_INCOME), CAPS_2026.NATIONAL_PENSION_MAX_INCOME);
 const nationalPension = floorTo10(pensionBase * TAX_RATES_2026.NATIONAL_PENSION); // Floor to 10 won

 // 2. Health Insurance
 // Logic: Applied on (Monthly Salary - NonTaxable)
 // 월급 < 비과세인 극소 연봉에서 보수월액이 음수가 되어 보험료가
 // 음수로 나오는 것을 방지 (정상 입력에서는 클램프 미작동 — 산출값 동일)
 const healthBase = Math.max(0, monthlySalary - nonTaxableMonthly);
 const healthInsurance = floorTo10(healthBase * TAX_RATES_2026.HEALTH_INSURANCE);

 // 3. Long-term Care Insurance
 // Logic: % of Health Insurance
 const longTermCare = floorTo10(healthInsurance * TAX_RATES_2026.LONG_TERM_CARE_RATIO);

 // 4. Employment Insurance
 // Logic: Applied on (Monthly Salary - NonTaxable)
 const employmentInsurance = floorTo10(healthBase * TAX_RATES_2026.EMPLOYMENT_INSURANCE);

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
 const localIncomeTax = floorTo10(incomeTax * TAX_RATES_2026.LOCAL_INCOME_TAX_RATIO);

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
