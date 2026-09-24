// src/lib/TaxLogic.ts
//
// 메인 페이지 연봉 실수령액 계산 핵심 로직.
// 4대보험 요율·국민연금 상한·세율은 lib/taxConstants2026.ts 단일 진실 소스에서 import.
// ★ 2026 블록을 제자리 수정 금지 — 연도 전환은 rates 인자/포인터 상수로 한다.
//   calculateSalary2026(…, rates) 의 기본값이 2026 요율이라 인자를 넘기지 않는 호출부는
//   그대로다. 2026 귀속 연말정산·/table/2026 은 2026 고정.

import {
 INSURANCE_RATES_2026,
 PENSION_BASE_2026,
 earnedIncomeDeduction2026,
 calcIncomeTax2026,
 earnedIncomeTaxCredit2026,
 childTaxCredit2026,
 type InsuranceRates,
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

const CAPS_2026 = {
 NATIONAL_PENSION_MAX_INCOME: PENSION_BASE_2026.MAX_MONTHLY,
 NATIONAL_PENSION_MIN_INCOME: PENSION_BASE_2026.MIN_MONTHLY,
};

// 근로소득공제(2,000만 캡 포함)·누진세율표·근로소득세액공제·자녀세액공제는
// 전부 taxConstants2026 정본 함수를 사용한다 (로컬 재구현 제거, 2026-08 대규모 점검).

// 10원 미만 절사(보험료 고지 관례) — 부동소수점 오차로 정확한 경계값(예: 12,600원)이
// 12,599.99…로 계산되어 한 단계 낮게 절사되는 것을 원 단위 반올림 선행으로 방지
const floorTo10 = (v: number) => Math.floor(Math.round(v) / 10) * 10;

const ZERO_RESULT: TaxResult = {
 nationalPension: 0,
 healthInsurance: 0,
 longTermCare: 0,
 employmentInsurance: 0,
 incomeTax: 0,
 localIncomeTax: 0,
 totalDeductions: 0,
 netPay: 0,
};

/**
 * @param rates 4대보험·지방세 요율 — 기본값 2026. 연도 전환 시 호출부가 해당 연도 요율을 넘긴다
 *   (2026 블록 제자리 수정 금지). 국민연금 기준소득월액 상·하한은 PENSION_BASE_2026 을 쓴다.
 */
export function calculateSalary2026(
 annualSalary: number,
 nonTaxableMonthly: number = 200_000,
 dependents: number = 1,
 children: number = 0,
 rates: InsuranceRates = INSURANCE_RATES_2026
): TaxResult {
 // 방어: 연봉 0 이하·비유한(NaN·Infinity) 입력은 전 항목 0 반환
 // (음수 공제·음수 실수령·NaN 전파 방지 — calculator.ts 와 같은 가드).
 // 정상 입력(유한한 연봉 > 0) 경로의 산출값에는 영향 없음.
 if (!Number.isFinite(annualSalary) || annualSalary <= 0) {
 return { ...ZERO_RESULT };
 }
 // 보조 입력 정리 — 비과세: 비유한·음수 → 0 / 부양가족(본인 포함): 비유한 → 1, 최소 1 /
 // 자녀: 비유한 → 0. 정상 입력은 그대로 통과한다.
 nonTaxableMonthly = Number.isFinite(nonTaxableMonthly) ? Math.max(0, nonTaxableMonthly) : 0;
 dependents = Number.isFinite(dependents) ? Math.max(1, dependents) : 1;
 children = Number.isFinite(children) ? children : 0;

 const monthlySalary = annualSalary / 12;
 // 월 과세 보수 (월급 − 비과세). 0 이하면 보험료 부과 대상 보수가 없다.
 const taxableMonthly = monthlySalary - nonTaxableMonthly;

 // 1. National Pension
 // Logic: Applied on monthly income, capped at max income
 // 기준소득월액 하한(41만)은 과세 보수가 있을 때만 적용한다 — 월급 전액이 비과세인
 // 극소 입력(연 5만·20만 등)에 하한 기준 연금을 매겨 실수령이 음수가 되던 것 방지.
 const pensionBase =
 taxableMonthly > 0
 ? Math.min(Math.max(taxableMonthly, CAPS_2026.NATIONAL_PENSION_MIN_INCOME), CAPS_2026.NATIONAL_PENSION_MAX_INCOME)
 : 0;
 const nationalPension = floorTo10(pensionBase * rates.NATIONAL_PENSION); // Floor to 10 won

 // 2. Health Insurance
 // Logic: Applied on (Monthly Salary - NonTaxable)
 // 월급 < 비과세인 극소 연봉에서 보수월액이 음수가 되어 보험료가
 // 음수로 나오는 것을 방지 (정상 입력에서는 클램프 미작동 — 산출값 동일)
 const healthBase = Math.max(0, taxableMonthly);
 const healthInsurance = floorTo10(healthBase * rates.HEALTH_INSURANCE);

 // 3. Long-term Care Insurance
 // Logic: % of Health Insurance
 const longTermCare = floorTo10(healthInsurance * rates.LONG_TERM_CARE_RATIO);

 // 4. Employment Insurance
 // Logic: Applied on (Monthly Salary - NonTaxable)
 const employmentInsurance = floorTo10(healthBase * rates.EMPLOYMENT_INSURANCE);

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
 // 한도 판정 기준은 '총급여액'(= 연봉 − 비과세)이다. 종전에는 비과세를 포함한
 // annualSalary 를 넘겨 calculator.ts(총급여 기준)와 결과가 갈렸다.
 // 비과세 식대 연 240만원 폭만큼, 한도 임계값(3,300만·7,000만·1.2억) 바로 위
 // 세 구간에서 두 엔진이 다른 한도를 골라 월 최대 14,655원(연 175,860원) 차이가
 // 났고, /table/2026 과 /table/2027 을 나란히 보면 "요율이 올랐는데 실수령이 늘어난"
 // 물리적으로 불가능한 행이 3개 노출됐다 (2026-09-06 전수검사 실측).
 const taxCredit = earnedIncomeTaxCredit2026(calculatedTax, taxableIncome);

 // 자녀세액공제 (소득세법 §59의2) — 정본 함수 사용
 const childCredit = childTaxCredit2026(children);
 
 const finalAnnualTax = Math.max(0, calculatedTax - taxCredit - childCredit);
 
 // Monthly Income Tax
 const incomeTax = Math.floor((finalAnnualTax / 12) / 10) * 10;
 
 // 6. Local Income Tax (10% of Income Tax)
 const localIncomeTax = floorTo10(incomeTax * rates.LOCAL_INCOME_TAX_RATIO);

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
