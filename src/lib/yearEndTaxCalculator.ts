// 연말정산(2026년 귀속 — 정산은 2027년 1~2월) 계산 엔진.
// 2026-08-23 정합화: 근로소득공제·세율표는 taxConstants2026, 카드공제는
// cardDeduction2026(정밀 계산기와 동일 로직), 월세는 RENT_CREDIT_2026 공유 —
// 페이지·정밀 계산기와 수치 드리프트 원천 차단. 결과는 소득세 기준이며
// 지방소득세(소득세의 10%)는 미포함 (UI에서 별도 고지).

import {
  earnedIncomeDeduction2026,
  calcIncomeTax2026,
  earnedIncomeTaxCredit2026,
  childTaxCredit2026,
  RENT_CREDIT_2026,
} from "@/lib/taxConstants2026";
import { calcCardDeduction2026 } from "@/lib/cardDeduction2026";

// 연말정산 항목별 입력을 위한 인터페이스 정의
export interface TaxInputs {
 grossSalary: number; // 총급여액
 prepaidTax: number; // 기납부세액

 // 소득공제 항목
 nationalPension: number; // 국민연금
 healthInsurance: number; // 건강보험료
 employmentInsurance: number; // 고용보험료

 dependents: number; // 기본공제 대상자 수 (본인포함)
 disabledDependents: number; // 장애인 수
 seniorDependents: number; // 70세 이상 경로자 수

 housingSubscription: number; // 주택청약저축 납입액
 mortgageInterest: number; // 장기주택저당차입금 이자상환액

 creditCard: number; // 신용카드 사용액
 debitCardAndCash: number; // 체크카드 및 현금영수증 사용액
 traditionalMarket: number; // 전통시장 사용액
 publicTransport: number; // 대중교통 사용액

 // 세액공제 항목
 children: number; // 자녀 수
 birthsOrAdoptions: number; // 해당년도 출산/입양 자녀 수

 pensionSavings: number; // 연금저축 납입액
 irp: number; // IRP 납입액

 lifeInsurance: number; // 보장성 보험료
 medicalExpenses: number; // 의료비
 educationExpenses: number; // 교육비
 donation: number; // 기부금
 monthlyRent: number; // 월세액
}

// 계산 결과를 위한 인터페이스 정의
export interface TaxResult {
 finalRefund: number; // 최종 환급(또는 추가납부)액
 determinedTax: number; // 결정세액
 taxBase: number; // 과세표준
 grossSalary: number; // 총급여
 totalDeductions: number; // 총 공제액 (소득공제 + 세액공제)
}

// 2026년 귀속 연말정산 계산 함수
export function calculateYearEndTax(inputs: TaxInputs): TaxResult {
 const { grossSalary } = inputs;

 // 1. 근로소득공제 — taxConstants2026 정본 사용 (2,000만원 캡 포함)
 const earnedIncomeDeduction = earnedIncomeDeduction2026(grossSalary);
 const earnedIncomeAmount = grossSalary - earnedIncomeDeduction;

 // 2. 소득공제
 const personalDeduction =
 inputs.dependents * 1500000 +
 inputs.seniorDependents * 1000000 +
 inputs.disabledDependents * 2000000;

 const insuranceDeduction =
 inputs.nationalPension +
 inputs.healthInsurance +
 inputs.employmentInsurance;

 const housingSubscriptionDeduction =
 Math.min(inputs.housingSubscription, 3000000) * 0.4;

 // 카드공제 — 정밀 계산기와 동일한 공유 모듈 (결제수단별 15/30/40%·
 // 자녀 한도 상향·전통시장/대중교통 추가한도. 2026-08-23 간소화판 대체)
 const cardDeduction = calcCardDeduction2026({
 grossSalary,
 children: inputs.children,
 creditCard: inputs.creditCard,
 checkCash: inputs.debitCardAndCash,
 traditionalMarket: inputs.traditionalMarket,
 publicTransport: inputs.publicTransport,
 }).finalDeduction;

 const totalIncomeDeduction =
 personalDeduction +
 insuranceDeduction +
 housingSubscriptionDeduction +
 cardDeduction;

 // 3. 과세표준
 const taxBase = Math.max(0, earnedIncomeAmount - totalIncomeDeduction);

 // 4. 산출세액 — taxConstants2026 누진세율표 정본 사용 (수학적 동치,
 // 경계값 1,400만/5,000만/8,800만 일치 확인)
 const calculatedTax = calcIncomeTax2026(taxBase);

 // 5. 세액공제 — 근로소득세액공제·자녀세액공제는 taxConstants2026 정본 함수 사용
 const earnedIncomeTaxCredit = earnedIncomeTaxCredit2026(
 calculatedTax,
 grossSalary
 );

 // 자녀세액공제 (소득세법 §59의2, 2025 개정) — 첫째 25만·둘째 30만·셋째+ 40만
 const childTaxCredit = childTaxCredit2026(inputs.children);

 const pensionAccountCredit =
 Math.min(inputs.pensionSavings + inputs.irp, 9000000) *
 (grossSalary <= 55000000 ? 0.15 : 0.12);
 const insuranceCredit = inputs.lifeInsurance * 0.12;
 const medicalCredit =
 Math.max(0, inputs.medicalExpenses - grossSalary * 0.03) * 0.15;
 const educationCredit = inputs.educationExpenses * 0.15;
 // 월세 세액공제 — 총급여 8,000만 초과는 대상 아님 (RENT_CREDIT_2026 정본,
 // 2026-08-23 상한 미적용 버그 수정)
 const rentCredit =
 grossSalary > RENT_CREDIT_2026.SALARY_CAP
 ? 0
 : Math.min(inputs.monthlyRent, RENT_CREDIT_2026.CAP) *
 (grossSalary <= RENT_CREDIT_2026.SALARY_17_MAX
 ? RENT_CREDIT_2026.RATE_HIGH
 : RENT_CREDIT_2026.RATE_LOW);

 // 기부금 세액공제 — 1천만원 이하 15%, 초과분 30% (소득세법 §59의4)
 // 유형별 한도(소득 30%·10% 등)·이월공제는 단순화 미반영 — 본 엔진의
 // 다른 항목(보험료·교육비 한도 미적용 등)과 동일한 정밀도 수준
 const donationCredit =
 Math.min(inputs.donation, 10_000_000) * 0.15 +
 Math.max(0, inputs.donation - 10_000_000) * 0.3;

 const totalTaxCredit =
 earnedIncomeTaxCredit +
 childTaxCredit +
 pensionAccountCredit +
 insuranceCredit +
 medicalCredit +
 educationCredit +
 donationCredit +
 rentCredit;

 // 6. 최종 결정세액 및 환급액
 const determinedTax = Math.max(0, calculatedTax - totalTaxCredit);
 const finalRefund = inputs.prepaidTax - determinedTax;

 return {
 finalRefund: Math.round(finalRefund),
 determinedTax: Math.round(determinedTax),
 taxBase: Math.round(taxBase),
 grossSalary,
 totalDeductions: Math.round(grossSalary - taxBase),
 };
}
