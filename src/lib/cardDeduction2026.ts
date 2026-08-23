// src/lib/cardDeduction2026.ts
//
// 신용카드 등 사용금액 소득공제 — 2026년 귀속(현행법) 공유 순수 모듈.
// 근거: 조세특례제한법 제126조의2 (2025-12 개정, 2028-12-31까지 연장 확정)
// 공제율: 신용 15% / 체크·현금영수증 30% / 문화비 30%(총급여 7천만 이하만) /
//         전통시장 40% / 대중교통 40%
// 한도: 2026년 귀속부터 자녀 수(최대 2명분)에 따라 기본공제 한도 상향.
//
// 단일 소스 원칙(2026-08-23 정합화): 이 로직의 원본은
// src/app/credit-card-deduction-2026/Client.tsx 의 검증된 계산부였고,
// 연말정산 엔진(src/lib/yearEndTaxCalculator.ts)이 일괄 15%·단일 300만 상한으로
// 간소화해 정밀판과 다른 답을 내던 문제를 해소하기 위해 순수 함수로 추출했다.
// 두 소비처(엔진·정밀 계산기)가 모두 이 모듈을 import — 수치 드리프트 원천 차단.

/** 문화비·한도 구분 기준 총급여 7,000만원 */
export const CARD_SALARY_THRESHOLD = 70_000_000;

export interface CardDeductionInputs {
  grossSalary: number;
  /** 자녀(손자녀 포함) 수 — 기본공제 한도 상향, 최대 2명분 반영 */
  children?: number;
  /** 신용카드 사용액 */
  creditCard: number;
  /** 체크·선불카드·현금영수증 사용액 */
  checkCash: number;
  /** 전통시장 사용액 */
  traditionalMarket: number;
  /** 대중교통 사용액 */
  publicTransport: number;
  /** 문화비(도서·공연 등) — 총급여 7천만 초과자는 자동 제외 */
  culture?: number;
}

export interface CardDeductionResult {
  /** 최종 소득공제액 (기본 + 추가) */
  finalDeduction: number;
  baseDeduction: number;
  extraDeduction: number;
  /** 최저사용금액(총급여 25%) 충족 여부 */
  thresholdMet: boolean;
  /** 문턱까지 부족액 (충족 시 0) */
  shortfall: number;
  /** 한도 적용 전 공제액 S */
  beforeCap: number;
  /** 최저사용금액 차감 케이스 (1: 신용만으로 소진 / 2: 30% 그룹까지 / 3: 40% 그룹까지) */
  thresholdCase: 1 | 2 | 3;
  // ── UI 브레이크다운 (정밀 계산기 표시용) ──
  isLowSalary: boolean;
  /** 최저사용금액 (총급여 25%) */
  minUsage: number;
  totalUse: number;
  /** 결제수단별 차감 전 공제액: 신용/체크·현금/문화비/전통시장/대중교통 */
  byMethod: { credit: number; checkCash: number; culture: number; traditional: number; transit: number };
  grossBeforeThreshold: number;
  thresholdDeducted: number;
  baseCap: number;
  extraCap: number;
  extraEligible: number;
  /** 7천만 초과로 문화비 입력이 무시됐는지 */
  cultureIgnored: boolean;
}

/** 기본공제 한도 — 2026년 귀속부터 자녀 수에 따라 상향 (최대 2명분) */
export function cardBaseLimit(isLowSalary: boolean, children: number): number {
  const c = Math.min(Math.max(children, 0), 2);
  return isLowSalary
    ? [3_000_000, 3_500_000, 4_000_000][c]
    : [2_500_000, 2_750_000, 3_000_000][c];
}

export function calcCardDeduction2026(i: CardDeductionInputs): CardDeductionResult {
  const isLow = i.grossSalary <= CARD_SALARY_THRESHOLD;
  // 총급여 7,000만원 초과자의 문화비는 공제 대상 아님 — 계산에서 제외
  const cultureEff = isLow ? i.culture ?? 0 : 0;

  const M = i.grossSalary * 0.25; // 최저사용금액 (총급여의 25%)
  const totalUse =
    i.creditCard + i.checkCash + i.traditionalMarket + i.publicTransport + cultureEff;

  // 결제수단별 공제액 (차감 전)
  const A = i.creditCard * 0.15;
  const B = i.checkCash * 0.3;
  const C = cultureEff * 0.3;
  const D = i.traditionalMarket * 0.4;
  const E = i.publicTransport * 0.4;
  const gross = A + B + C + D + E;

  // 최저사용금액 차감액 T — 공제율 낮은 결제수단(신용→30%그룹→40%그룹)부터 소진
  const mid = i.checkCash + cultureEff; // 30% 그룹
  let T: number;
  let thresholdCase: 1 | 2 | 3;
  if (i.creditCard >= M) {
    T = M * 0.15;
    thresholdCase = 1;
  } else if (i.creditCard + mid >= M) {
    T = i.creditCard * 0.15 + (M - i.creditCard) * 0.3;
    thresholdCase = 2;
  } else {
    T = i.creditCard * 0.15 + mid * 0.3 + (M - i.creditCard - mid) * 0.4;
    thresholdCase = 3;
  }

  const S = Math.max(0, gross - T); // 한도 적용 전 공제액

  // 한도 — 기본(자녀 상향) + 추가공제(전통시장·대중교통·저소득 문화비)
  const L1 = cardBaseLimit(isLow, i.children ?? 0);
  const L2 = isLow ? 3_000_000 : 2_000_000;
  const extraEligible = D + E + (isLow ? C : 0);
  const baseDeduction = Math.min(S, L1);
  const extraDeduction = Math.min(Math.max(S - L1, 0), extraEligible, L2);
  const finalDeduction = baseDeduction + extraDeduction;

  return {
    finalDeduction,
    baseDeduction,
    extraDeduction,
    thresholdMet: totalUse > M,
    shortfall: Math.max(0, M - totalUse),
    beforeCap: S,
    thresholdCase,
    isLowSalary: isLow,
    minUsage: M,
    totalUse,
    byMethod: { credit: A, checkCash: B, culture: C, traditional: D, transit: E },
    grossBeforeThreshold: gross,
    thresholdDeducted: T,
    baseCap: L1,
    extraCap: L2,
    extraEligible,
    cultureIgnored: !isLow && (i.culture ?? 0) > 0,
  };
}
