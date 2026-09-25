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
// 소득세 증가분 = 연간 결정세액(연봉 + 성과급) − 연간 결정세액(연봉) — 연말정산 구조의
// 실제 엔진 차이다 (2026-09-25 A18 CALC-02). 종전에는 산출세액 차이에 '세액공제 30%'
// 를 일률로 곱했는데, 근로소득세액공제는 한도(총급여가 오를수록 줄어듦)가 있는 정액성
// 공제라 성과급에 비례해 늘지 않는다 — 세후가 5~19% 과대(연봉 1억 + 성과급 5천만 +538만원)였다.
//
// 세율·요율 상수는 lib/taxConstants2026.ts 단일 진실 소스에서 import.
// ★ 2026 블록을 제자리 수정 금지 — 연도 전환은 calcBonusNet 의 선택 인자 rates 로 한다.
//   calcBonusNet 의 기본값은 현행 요율 포인터(src/config/currentRates.ts CURRENT_INSURANCE_RATES —
//   지금은 2026)라 1/1 전환은 포인터 한 줄로 인자 없는 성과급 계산기 전부에 반영된다.
//   estimateAnnualIncomeTax2026 의 기본값은 2026 고정이다 — 인자 없이 부르는 곳(samsung-bonus/model.ts)이
//   다른 호출에 2026 요율을 명시하고 있어, 기본값만 포인터로 바꾸면 한 계산 안에서 연도가 섞인다.

import { CURRENT_INSURANCE_RATES } from "@/config/currentRates";
import {
  INSURANCE_RATES_2026,
  PENSION_BASE_2026,
  earnedIncomeDeduction2026 as earnedIncomeDeduction,
  calcIncomeTax2026 as calcIncomeTax,
  earnedIncomeTaxCredit2026,
  type InsuranceRates,
} from "./taxConstants2026";

/**
 * 성과급 계산기 23종 공통 '추가 세액공제' 가정 디폴트(%) — 0.
 * 기본 계산은 연말정산 구조의 실제 엔진 차이(근로소득세액공제 한도 포함)라 추가 가정이
 * 없다. 슬라이더를 올리면 연금저축·의료비·기부 등 개인별 공제로 성과급 몫 소득세가 그
 * 비율만큼 더 줄어든다고 가정한다(사용자 조정). 2026-09-25 전까지는 30 이었고 이 30% 가
 * 기본 가정이었다 — 삼성 공유 링크의 옛 cr 값은 samsung-bonus/shareState.ts 가 변환한다.
 * 계산기마다 따로 두면 같은 회사·같은 입력에 세후가 갈리므로 이 상수 하나만 참조한다.
 */
export const DEFAULT_BONUS_CREDIT_RATE = 0;

/**
 * 연간 결정세액 추정 — 연말정산 구조(성과급 증가분 계산 전용).
 *
 * 총급여 → 근로소득공제(§47) → 본인 기본공제 150만(§50) → 연금보험료공제(§51의3) →
 * 건강·장기요양·고용보험료 공제(§52) → 누진세율(§55) → 근로소득세액공제(§59, 총급여 기준 한도).
 * 보험료는 rates 요율(기본 2026 고정 · 국민연금은 기준소득월액 상·하한의 연 환산)로 추정한다.
 * 현행 연도 계산은 calcBonusNet 처럼 rates 를 명시해 부른다.
 * 자녀·연금저축·의료비·신용카드 등 개인별 공제는 넣지 않는다.
 *
 * @param grossSalary 총급여 (원)
 * @param insuredGross 보험료를 매기는 보수 (원, 기본 = 총급여) — 성과급에 4대보험을
 *   매기지 않는 가정이면 연봉만 넘긴다(보험료 공제도 그만큼만).
 */
export function estimateAnnualIncomeTax2026(
  grossSalary: number,
  rates: InsuranceRates = INSURANCE_RATES_2026,
  insuredGross: number = grossSalary,
): number {
  if (!Number.isFinite(grossSalary) || grossSalary <= 0) return 0;
  const insured = Number.isFinite(insuredGross) ? Math.max(0, insuredGross) : grossSalary;
  const pension =
    insured > 0
      ? Math.min(Math.max(insured, PENSION_BASE_2026.MIN_MONTHLY * 12), PENSION_BASE_2026.MAX_ANNUAL) *
        rates.NATIONAL_PENSION
      : 0;
  const healthAndCare = insured * rates.HEALTH_INSURANCE * (1 + rates.LONG_TERM_CARE_RATIO);
  const employment = insured * rates.EMPLOYMENT_INSURANCE;
  const taxBase = Math.max(
    0,
    grossSalary - earnedIncomeDeduction(grossSalary) - 1_500_000 - pension - healthAndCare - employment,
  );
  const calculatedTax = calcIncomeTax(taxBase);
  return Math.max(0, calculatedTax - earnedIncomeTaxCredit2026(calculatedTax, grossSalary));
}

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
 * "연봉만의 연간 결정세액" vs "연봉+성과급 합산 결정세액"의 차이를 성과급에 귀속시키는
 * 방식(marginal, estimateAnnualIncomeTax2026). 4대보험은 보수에 합산되어 추가 부과되는데
 * 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원, 월 659만원) 적용.
 *
 * @param salary 본인 연 기본 연봉 (원)
 * @param bonusWon 세전 성과급 (원)
 * @param creditRate 추가 세액공제 가정 0~50% (디폴트 0) — 엔진 증가분에서 이 비율만큼 더 뺀다
 * @param applyInsurance 4대보험 추가 부과 적용 여부 (디폴트 true)
 * @param rates 4대보험·지방세 요율 (디폴트 현행 포인터 CURRENT_INSURANCE_RATES, 지금은 2026)
 */
export function calcBonusNet(
  salary: number,
  bonusWon: number,
  creditRate = DEFAULT_BONUS_CREDIT_RATE,
  applyInsurance = true,
  rates: InsuranceRates = CURRENT_INSURANCE_RATES,
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

  // 1) 소득세 증가분 — 연말정산 구조 결정세액의 차이 (성과급에 4대보험을 매기지 않는
  //    가정이면 보험료 공제도 연봉분만)
  const taxBase = estimateAnnualIncomeTax2026(salary, rates);
  const taxWithBonus = estimateAnnualIncomeTax2026(
    salary + bonusWon,
    rates,
    applyInsurance ? salary + bonusWon : salary,
  );

  const creditMult = 1 - creditRate / 100;
  const incomeTaxDelta = Math.max(0, (taxWithBonus - taxBase) * creditMult);
  const localTaxDelta = Math.round(
    incomeTaxDelta * rates.LOCAL_INCOME_TAX_RATIO,
  );

  // 2) 4대보험 추가 부과 (보수에 합산되므로 성과급도 부과 대상)
  let pensionDelta = 0;
  let healthDelta = 0;
  let empInsDelta = 0;

  if (applyInsurance) {
    // 국민연금 — 보수월액 상한(2026.7~2027.6 연 7,908만원). 본인 연봉이 이미 상한
    // 이상이면 성과급 추가 부과 없음 (cap 도달)
    const remainingPensionRoom = Math.max(0, PENSION_BASE_2026.MAX_ANNUAL - salary);
    const pensionTarget = Math.min(bonusWon, remainingPensionRoom);
    pensionDelta = Math.round(pensionTarget * rates.NATIONAL_PENSION);

    // 건강보험 + 장기요양 (건보료 × rates.LONG_TERM_CARE_RATIO) — 상한 없음
    const healthBase = bonusWon * rates.HEALTH_INSURANCE;
    const longTermCare = healthBase * rates.LONG_TERM_CARE_RATIO;
    healthDelta = Math.round(healthBase + longTermCare);

    // 고용보험 — 상한 없음
    empInsDelta = Math.round(bonusWon * rates.EMPLOYMENT_INSURANCE);
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
