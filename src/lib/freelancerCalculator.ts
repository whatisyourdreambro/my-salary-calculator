// src/lib/freelancerCalculator.ts

import {
 INSURANCE_RATES_2026,
 PENSION_BASE_2026,
 calcIncomeTax2026,
 earnedIncomeDeduction2026,
 earnedIncomeTaxCredit2026,
} from "./taxConstants2026";

/**
 * 3.3% 사업소득 또는 4대보험 적용 아르바이트 급여를 계산합니다.
 * @param income 월 소득 (세전)
 * @param taxType 세금 종류 ('freelancer' 또는 'part_time')
 * @returns 월 실수령액, 공제액 합계, 각 공제 항목
 */
export function calculatePartTimeSalary(
 income: number,
 taxType: "freelancer" | "part_time"
) {
 if (income <= 0) {
 return {
 netPay: 0,
 totalDeduction: 0,
 incomeTax: 0,
 localTax: 0,
 nationalPension: 0,
 healthInsurance: 0,
 longTermCare: 0,
 employmentInsurance: 0,
 };
 }

 if (taxType === "freelancer") {
 // 사업소득 원천징수: 3.3% = 소득세 3% + 지방소득세 0.3% (소득세의 10%)
 const incomeTax = Math.round(income * 0.03); // 소득세 3%
 const localTax = Math.round(income * 0.003); // 지방소득세 0.3%
 const totalDeduction = incomeTax + localTax; // 합계 3.3%
 const netPay = income - totalDeduction;
 return {
 netPay: Math.round(netPay),
 totalDeduction,
 incomeTax,
 localTax,
 nationalPension: 0,
 healthInsurance: 0,
 longTermCare: 0,
 employmentInsurance: 0,
 };
 } else {
 // 4대보험 적용 (월 60시간 이상 근로자 기준) — 요율은 taxConstants2026 정본 사용.
 // 2026-08 대규모 점검: 장기요양보험(건강보험료의 13.14%) 누락 보완.
 // 국민연금 — 기준소득월액 상·하한 클램프 (2026.7~: 월 41만~659만, 정본)
 const pensionBase = Math.min(
 Math.max(income, PENSION_BASE_2026.MIN_MONTHLY),
 PENSION_BASE_2026.MAX_MONTHLY
 );
 const nationalPension = pensionBase * INSURANCE_RATES_2026.NATIONAL_PENSION;
 const healthInsurance = income * INSURANCE_RATES_2026.HEALTH_INSURANCE;
 const longTermCare =
 healthInsurance * INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO;
 const employmentInsurance =
 income * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE;

 // 근로소득세 (1인 가구 기준) — 월 60시간 이상 4대보험 가입 알바는 세법상
 // 근로소득자다. 따라서 직장인 탭(TaxLogic.calculateSalary2026)과 같은 정본
 // 경로를 써야 한다.
 // 2026-09-06 전수검사 정정: 종전에는 근로소득공제를 일률 30% 로 근사하고,
 // 바로 위에서 계산한 국민연금(연금보험료공제)과 근로소득세액공제(§59)를
 // 과세표준·세액에서 빼지 않았다. 같은 화면에서 '직장인' 탭과 '알바' 탭이
 // 월 최대 10만원 가까이 다른 답을 냈다.
 const annualIncome = income * 12;
 const taxBase = Math.max(
 0,
 annualIncome -
 earnedIncomeDeduction2026(annualIncome) -
 1_500_000 -
 nationalPension * 12
 );
 const calculatedTax = calcIncomeTax2026(taxBase);
 const annualIncomeTax = Math.max(
 0,
 calculatedTax - earnedIncomeTaxCredit2026(calculatedTax, annualIncome)
 );
 const incomeTax = annualIncomeTax / 12;
 const localTax = incomeTax * 0.1;

 const totalDeduction =
 nationalPension +
 healthInsurance +
 longTermCare +
 employmentInsurance +
 incomeTax +
 localTax;
 const netPay = income - totalDeduction;

 return {
 netPay: Math.round(netPay),
 totalDeduction: Math.round(totalDeduction),
 incomeTax: Math.round(incomeTax),
 localTax: Math.round(localTax),
 nationalPension: Math.round(nationalPension),
 healthInsurance: Math.round(healthInsurance),
 longTermCare: Math.round(longTermCare),
 employmentInsurance: Math.round(employmentInsurance),
 };
 }
}
