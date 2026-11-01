// src/lib/januaryBonus2026.ts
//
// /calc/january-bonus (13월의 월급 시뮬레이터) 계산부 — 사이트 연말정산 정본 엔진 calculateYearEndTax 어댑터.
//
// 2026-11-01 B23 CALC-01 (운영자 승인 2026-11-01, 승인 목록 4번 권장안 = 기본 엔진으로 교체):
// 종전 Client.tsx 는 누진세율·근로소득공제·카드공제·원천징수 추정을 따로 구현한 포크 엔진이었다.
// 국민연금(소득세법 제51조의3 연금보험료공제)과 건강·장기요양·고용보험료(제52조 제1항 특별소득공제)를 빼지 않아
// 결정세액이 부풀었고, 원천징수세액을 비워 두면 같은 부풀린 산식으로 추정해 환급처럼 보였다. 실제(간이세액표
// 기준) 원천징수세액을 넣으면 환급이 추가 납부로 뒤집혔다 — 기본값(총급여 5,000만원)에서 비우면 +731,125원,
// 간이세액표 원천징수 2,868,624원을 넣으면 −269,501원.
// 이제 /year-end-tax 와 같은 경로만 쓴다.
// - 결정세액: calculateYearEndTax (표준세액공제 13만원 방식 비교 포함). 4대보험은 deriveAnnualSocialInsurance2026.
// - 원천징수세액을 비워 두면: estimatePrepaidIncomeTax2026 (근로소득 간이세액표 × 12) — /year-end-tax 기본값과 같다.
//
// 입력 매핑 (입력칸 수·배치는 그대로):
// - 공제대상가족 = 본인 1 + 배우자 + '부양 n명' (인적공제와 간이세액표에 같은 값). 자녀 입력칸이 없어 자녀는 0.
// - '신용/체크카드 1년 사용액'은 전액 신용카드(15%)로 본다 — 결제수단을 모를 때 공제가 덜 나오는 쪽.
// - 'IRP/연금저축 납입액'은 엔진 irp 로 넘긴다 (연금계좌 합산 900만원 한도, 총급여 5,500만원 이하 15%·초과 12%).
// - 기부금 칸은 고향사랑기부금(조특법 제58조)으로 엔진 hometownDonation 에 넘긴다 (운영자 승인 — 칸 이름도
//   '고향사랑기부금 (10만원 전액)'). 10만원까지 100/110(지방소득세까지 전액), 10만원 초과 20만원 이하 40%,
//   20만원 초과 15% — donationCredit.ts 정본 산식.
//
// 화면 금액 기준: 이 페이지는 결정세액·원천징수세액을 '소득세 + 지방소득세(소득세의 10%)'로 보여준다.
// 엔진 값(소득세)에 1.1 을 곱해 원 단위로 반올림하고, 직접 넣은 원천징수세액(지방소득세 포함)은 1.1 로 나눠
// 엔진의 기납부세액(소득세)으로 넘긴다. 환급(+)/추징(−) = 원천징수세액 − 결정세액 (둘 다 지방소득세 포함).
// 고정 테스트: src/lib/__tests__/januaryBonus2026.test.ts

import {
  calculateYearEndTax,
  deriveAnnualSocialInsurance2026,
  estimatePrepaidIncomeTax2026,
} from "@/lib/yearEndTaxCalculator";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";

export interface JanuaryBonusInputs {
  /** 총급여 (비과세 제외, 연) */
  salary: number;
  /** 신용/체크카드 1년 사용액 — 전액 신용카드로 본다 */
  card: number;
  /** IRP/연금저축 납입액 (연) */
  irp: number;
  /** 의료비 지출액 (총급여 3% 초과분이 공제 대상) */
  medical: number;
  /** 고향사랑기부금 (본인 지출) */
  donation: number;
  /** 작년 원천징수세액 — 소득세 + 지방소득세. 0 이하·미입력이면 간이세액표 추정치를 쓴다 */
  withheldWithLocal: number;
  hasSpouse: boolean;
  /** 부양가족 수 (본인·배우자 제외) */
  dependents: number;
}

export interface JanuaryBonusEstimate {
  /** 원천징수세액 — 소득세 + 지방소득세 (입력값 또는 간이세액표 추정치) */
  withheld: number;
  isWithheldEstimated: boolean;
  /** 결정세액 — 소득세 (엔진 값, /year-end-tax 와 같은 기준) */
  determinedTax: number;
  /** 결정세액 — 소득세 + 지방소득세 */
  totalFinalTax: number;
  /** 환급(+) / 추징(−) = withheld − totalFinalTax */
  refund: number;
  /** IRP·연금저축 세액공제 (소득세분, 산출세액 한도 적용 전) */
  irpCredit: number;
  /** 의료비 세액공제 (산출세액 한도 적용 전, 표준세액공제 방식이면 0) */
  medicalCredit: number;
  /** 고향사랑기부금 세액공제 (소득세분, 산출세액 한도 적용 전) */
  donationCredit: number;
  /** 신용카드 등 소득공제 (정본 calcCardDeduction2026, 신용카드 15%) */
  cardDeductionCapped: number;
  /** 엔진이 표준세액공제(연 13만원) 방식을 골랐는지 */
  standardTaxCreditApplied: boolean;
}

/** 소득세 → 소득세 + 지방소득세 배율 (1.1) */
const WITH_LOCAL_TAX = 1 + INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO;

const nonNegative = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** 공제대상가족 수 (본인 포함) — 인적공제와 간이세액표 추정에 같은 값을 쓴다 */
export function januaryBonusFamily(hasSpouse: boolean, dependents: number): number {
  return 1 + (hasSpouse ? 1 : 0) + Math.floor(nonNegative(dependents));
}

export function estimateJanuaryBonus2026(i: JanuaryBonusInputs): JanuaryBonusEstimate {
  const salary = nonNegative(i.salary);
  const family = januaryBonusFamily(i.hasSpouse, i.dependents);
  const typedWithheld = nonNegative(i.withheldWithLocal);
  const isWithheldEstimated = typedWithheld <= 0;
  // 엔진 기납부세액은 소득세 기준 — 직접 넣은 값(지방소득세 포함)은 1.1 로 나눈다
  const prepaidIncomeTax = isWithheldEstimated
    ? estimatePrepaidIncomeTax2026(salary, family, 0)
    : typedWithheld / WITH_LOCAL_TAX;

  const r = calculateYearEndTax({
    grossSalary: salary,
    prepaidTax: prepaidIncomeTax,
    ...deriveAnnualSocialInsurance2026(salary),
    dependents: family,
    disabledDependents: 0,
    seniorDependents: 0,
    housingSubscription: 0,
    creditCard: nonNegative(i.card),
    debitCardAndCash: 0,
    traditionalMarket: 0,
    publicTransport: 0,
    children: 0,
    childTaxCreditEligibleChildren: 0,
    birthsOrAdoptions: 0,
    pensionSavings: 0,
    irp: nonNegative(i.irp),
    lifeInsurance: 0,
    medicalExpenses: nonNegative(i.medical),
    educationExpenses: 0,
    donation: 0,
    hometownDonation: nonNegative(i.donation),
    monthlyRent: 0,
  });

  const withheld = isWithheldEstimated
    ? Math.round(prepaidIncomeTax * WITH_LOCAL_TAX)
    : typedWithheld;
  const totalFinalTax = Math.round(r.determinedTax * WITH_LOCAL_TAX);

  return {
    withheld,
    isWithheldEstimated,
    determinedTax: r.determinedTax,
    totalFinalTax,
    refund: withheld - totalFinalTax,
    irpCredit: r.breakdown.pensionAccountCredit,
    medicalCredit: r.breakdown.medicalCredit,
    donationCredit: r.breakdown.hometownCredit,
    cardDeductionCapped: r.breakdown.cardDeduction,
    standardTaxCreditApplied: r.standardTaxCreditApplied,
  };
}
