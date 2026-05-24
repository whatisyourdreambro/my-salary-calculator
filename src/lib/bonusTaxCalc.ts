// src/lib/bonusTaxCalc.ts
//
// 회사별 성과급 계산기 공통 — 성과급 세전 → 세후 변환.
// 성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%)
// 이 적용되며, 지방소득세(소득세의 10%)·4대보험 정산이 따라온다.
//
// samsung-bonus 의 calcBonusNet 와 동일 로직을 회사별 계산기에서 재사용
// 가능하도록 추출. 회사별로 다른 건 "성과급 풀 산정 방식"이지 세금 계산은
// 동일.
//
// 세율·요율 상수는 lib/taxConstants2026.ts 단일 진실 소스에서 import.
// 2027년 세율 변경 시 taxConstants2026 만 수정하면 모든 계산기에 일괄 반영.

import {
  INSURANCE_RATES_2026,
  PENSION_BASE_2026,
  earnedIncomeDeduction2026 as earnedIncomeDeduction,
  calcIncomeTax2026 as calcIncomeTax,
} from "./taxConstants2026";

export interface BonusNetResult {
  /** 세전 성과급 (원) */
  gross: number;
  /** 소득세 증가분 */
  incomeTaxDelta: number;
  /** 지방소득세 증가분 */
  localTaxDelta: number;
  /** 국민연금 추가 부과 (보수월액 상한 적용) */
  pensionDelta: number;
  /** 건강보험 + 장기요양 추가 부과 */
  healthDelta: number;
  /** 고용보험 추가 부과 */
  empInsDelta: number;
  /** 총 추가 공제 (소득세 + 지방세 + 4대보험) */
  totalDeductions: number;
  /** 세후 실수령 성과급 */
  net: number;
  /** 실효세율 (%) */
  effectiveRate: number;
}

/**
 * 성과급 세후 실수령액 계산.
 *
 * 누진세율 특성상 "기존 연봉 기준 세금" vs "연봉+성과급 합산 세금"의 차이를
 * 성과급에 귀속시키는 방식(marginal). 4대보험은 보수에 합산되어 추가 부과되는데
 * 국민연금은 보수월액 상한(2026년 기준 연 7,404만원, 월 617만원) 적용.
 *
 * @param salary 본인 연 기본 연봉 (원)
 * @param bonusWon 세전 성과급 (원)
 * @param creditRate 세액공제율 0~50% (디폴트 30%) — 자녀·연금·의료비·기부 등
 * @param applyInsurance 4대보험 추가 부과 적용 여부 (디폴트 true)
 */
export function calcBonusNet(
  salary: number,
  bonusWon: number,
  creditRate = 30,
  applyInsurance = true,
): BonusNetResult {
  if (bonusWon <= 0) {
    return {
      gross: 0,
      incomeTaxDelta: 0,
      localTaxDelta: 0,
      pensionDelta: 0,
      healthDelta: 0,
      empInsDelta: 0,
      totalDeductions: 0,
      net: 0,
      effectiveRate: 0,
    };
  }

  // 1) 소득세 marginal 계산
  const baseDeduction = 1_500_000; // 본인 기본공제
  const empDeductBase = earnedIncomeDeduction(salary);
  const empDeductWithBonus = earnedIncomeDeduction(salary + bonusWon);

  const taxableBase = Math.max(0, salary - empDeductBase - baseDeduction);
  const taxableWithBonus = Math.max(
    0,
    salary + bonusWon - empDeductWithBonus - baseDeduction,
  );

  const taxBase = calcIncomeTax(taxableBase);
  const taxWithBonus = calcIncomeTax(taxableWithBonus);

  const creditMult = 1 - creditRate / 100;
  const incomeTaxDelta = Math.max(0, (taxWithBonus - taxBase) * creditMult);
  const localTaxDelta = Math.round(
    incomeTaxDelta * INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO,
  );

  // 2) 4대보험 추가 부과 (보수에 합산되므로 성과급도 부과 대상)
  let pensionDelta = 0;
  let healthDelta = 0;
  let empInsDelta = 0;

  if (applyInsurance) {
    // 국민연금 — 보수월액 상한(2026 연 7,404만원). 본인 연봉이 이미 상한
    // 이상이면 성과급 추가 부과 없음 (cap 도달)
    const remainingPensionRoom = Math.max(0, PENSION_BASE_2026.MAX_ANNUAL - salary);
    const pensionTarget = Math.min(bonusWon, remainingPensionRoom);
    pensionDelta = Math.round(pensionTarget * INSURANCE_RATES_2026.NATIONAL_PENSION);

    // 건강보험 + 장기요양 (건보의 12.95%) — 상한 없음
    const healthBase = bonusWon * INSURANCE_RATES_2026.HEALTH_INSURANCE;
    const longTermCare = healthBase * INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO;
    healthDelta = Math.round(healthBase + longTermCare);

    // 고용보험 — 상한 없음
    empInsDelta = Math.round(bonusWon * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE);
  }

  const totalDeductions =
    incomeTaxDelta + localTaxDelta + pensionDelta + healthDelta + empInsDelta;
  const net = Math.max(0, bonusWon - totalDeductions);
  const effectiveRate = bonusWon > 0 ? (totalDeductions / bonusWon) * 100 : 0;

  return {
    gross: bonusWon,
    incomeTaxDelta: Math.round(incomeTaxDelta),
    localTaxDelta,
    pensionDelta,
    healthDelta,
    empInsDelta,
    totalDeductions: Math.round(totalDeductions),
    net: Math.round(net),
    effectiveRate: Math.round(effectiveRate * 10) / 10,
  };
}

/**
 * 만원 단위 포맷 — 1,234만원
 */
export function fmtManwon(won: number): string {
  return `${Math.round(won / 10000).toLocaleString("ko-KR")}만원`;
}

/**
 * 원 단위 포맷 — 12,345,678원
 */
export function fmtWon(won: number): string {
  return `${Math.round(won).toLocaleString("ko-KR")}원`;
}

/**
 * 억 단위 포맷 — 1.23억 (소수 둘째 자리)
 */
export function fmtEok(won: number): string {
  if (won < 100_000_000) return fmtManwon(won);
  return `${(won / 100_000_000).toFixed(2)}억원`;
}
