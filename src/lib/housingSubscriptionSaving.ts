// /calc/housing-subscription (청약저축 소득공제 계산기) 계산부.
//
// 2026-10-05 감사 code2-01 정정: 종전 Client.tsx 는 절세액 = 공제액 x '한계세율' 로, 그 세율을 총급여에 과세표준
// 구간(5,000만 초과 24% 등)을 그대로 대 골랐다. 근로소득공제·인적공제·4대보험 공제를 거친 실제 과세표준과 맞지 않아
// 총급여 2,000만~3,000만원은 2~5배, 5,500만~7,000만원은 1.45배 과대였다 (사이트 가이드
// /guides/housing-subscription-25man-deduction-2026 의 18만/19.8만원과도 모순).
// 이제 사이트 연말정산 정본 엔진 calculateYearEndTax 로 '청약 공제 없을 때 - 있을 때' 결정세액 차이를 구하고
// 지방소득세(10%)를 더한다. 가정: 1인 가구 근로자, 4대보험 근로자 부담분은 총급여에서 파생, 다른 공제 없음.
// 2026-11-01: 엔진이 표준세액공제(연 13만원) 방식과 특별공제 방식 중 결정세액이 낮은 쪽을 쓰게 되어(CALC-02),
// 저소득 구간의 절세액은 표준세액공제 방식 기준 차이다 (청약 공제는 조특법 제87조라 두 방식 모두에 남는다).
// 총급여 3,000만원은 89,100원 → 99,756원, 2,000만원 35,640원·3,500만~7,000만원 198,000원은 그대로.
//
// 공제 요건 (조세특례제한법 제87조 제2항, 시행 2026.9.18 판): 총급여 7천만원 이하, 해당 과세기간 중 주택을 소유하지
// 않은 세대의 세대주 또는 세대주의 배우자, 2028.12.31 까지 납입분, 연 300만원 한도 x 40%.

import {
  calculateYearEndTax,
  deriveAnnualSocialInsurance2026,
  type TaxInputs,
} from "@/lib/yearEndTaxCalculator";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";

export const HOUSING_SUBSCRIPTION_ANNUAL_CAP = 3_000_000;
export const HOUSING_SUBSCRIPTION_RATE = 0.4;
export const HOUSING_SUBSCRIPTION_SALARY_CAP = 70_000_000;

export interface HousingSubscriptionResult {
  /** 연 납입액 */
  yearlyContribution: number;
  /** 공제 인정 납입액 (연 300만원 한도) */
  annualPayment: number;
  /** 소득공제액 (요건 미충족이면 0) */
  deduction: number;
  /** 절세액 = 결정세액 차이 x 1.1 (지방소득세 포함, 원 단위 반올림) */
  taxSaving: number;
  eligibleForDeduction: boolean;
  maxedOut: boolean;
}

function baseInputs(salary: number): TaxInputs {
  return {
    grossSalary: salary,
    prepaidTax: 0,
    ...deriveAnnualSocialInsurance2026(salary),
    dependents: 1,
    disabledDependents: 0,
    seniorDependents: 0,
    housingSubscription: 0,
    creditCard: 0,
    debitCardAndCash: 0,
    traditionalMarket: 0,
    publicTransport: 0,
    children: 0,
    childTaxCreditEligibleChildren: 0,
    birthsOrAdoptions: 0,
    pensionSavings: 0,
    irp: 0,
    lifeInsurance: 0,
    medicalExpenses: 0,
    educationExpenses: 0,
    donation: 0,
    monthlyRent: 0,
  };
}

export function calcHousingSubscriptionSaving(monthly: number, salary: number): HousingSubscriptionResult {
  const m = Number.isFinite(monthly) ? Math.max(0, monthly) : 0;
  const s = Number.isFinite(salary) ? Math.max(0, salary) : 0;
  const yearlyContribution = m * 12;
  const annualPayment = Math.min(yearlyContribution, HOUSING_SUBSCRIPTION_ANNUAL_CAP);
  const eligibleForDeduction = s <= HOUSING_SUBSCRIPTION_SALARY_CAP;
  const deduction = eligibleForDeduction ? annualPayment * HOUSING_SUBSCRIPTION_RATE : 0;

  let taxSaving = 0;
  if (eligibleForDeduction && s > 0 && annualPayment > 0) {
    const without = calculateYearEndTax(baseInputs(s)).determinedTax;
    const withSub = calculateYearEndTax({ ...baseInputs(s), housingSubscription: annualPayment }).determinedTax;
    const incomeTaxSaving = Math.max(0, without - withSub);
    taxSaving = incomeTaxSaving + Math.round(incomeTaxSaving * INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO);
  }

  return {
    yearlyContribution,
    annualPayment,
    deduction,
    taxSaving,
    eligibleForDeduction,
    maxedOut: m >= 250_000,
  };
}
