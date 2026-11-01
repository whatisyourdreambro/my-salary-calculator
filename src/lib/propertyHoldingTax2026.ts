// /property-holding-tax-2026 보유세 계산부 (PropertyHoldingTaxClient.tsx 에서 분리 — 2026-10-05 감사 code15-02).
//
// 재산세 (주택분) — 1세대 1주택 특례 반영 (2026년 기준, 행안부·지방세법)
// · 공정시장가액비율: 1세대1주택 43~45% 특례(시가표준 3억 이하 43% / 3~6억 44% / 6억 초과 45%,
//   지방세법 시행령 제109조 제1항 제2호 — 2026년도 납세의무분), 그 외 일반 60%
// · 특례세율: 1세대1주택 & 시가표준 9억 이하 → 표준세율 대비 구간별 0.05%p 인하
//   (지방세법 제111조의2, 2026년 12월 28일까지 성립한 납세의무에 유효)
// · 주택분 재산세는 주택별로 세율을 적용한다 (지방세법 제113조 제2항).
// 종합부동산세 — 납세의무자별 공시가격 합계에서 기본공제(1세대 1주택 12억, 그 외 9억) 후 공정시장가액비율 60%.
//
// code15-02 정정: 종전에는 입력 한 칸을 재산세(주택별)와 종부세(인별 합계)에 그대로 넣어, 2주택 이상이면 한쪽이
// 반드시 틀렸다 (6억 2채를 합계 12억으로 넣으면 재산세 2,250,000원 — 집별 계산 810,000원 x 2 = 1,620,000원).
// 이제 2주택 이상은 입력값을 보유 주택 공시가격 합계로 보고, 재산세는 주택마다 같은 금액이라 보고 집별로 계산해
// 더한다. 종부세는 합계에 그대로 적용한다.
//
// 2026-11-01 R2-HOLD — 12월 고지분에 빠져 있던 두 가지를 넣는다 (법제처 국가법령정보센터 원문 대조):
// · 1세대 1주택자 세액공제 — 종합부동산세법 제9조 제5항·제6항·제8항 ([시행 2026. 1. 1.] 법률 제21224호,
//   https://www.law.go.kr/법령/종합부동산세법): 과세기준일(6월 1일, 같은 법 제3조·지방세법 제114조) 현재
//   만 60세 이상 20% / 65세 이상 30% / 70세 이상 40%, 5년 이상 보유 20% / 10년 이상 40% / 15년 이상 50%.
//   두 공제는 공제율 합계 100분의 80 범위에서 중복 적용한다. 1세대 1주택자가 아니면 공제 없음.
// · 농어촌특별세 — 농어촌특별세법 제5조 제1항 제8호 ([시행 2026. 5. 12.] 법률 제21611호,
//   https://www.law.go.kr/법령/농어촌특별세법): 납부하여야 할 종합부동산세액(세액공제 뒤)의 100분의 20.
//   같은 법 제7조 제4항에 따라 종부세와 함께 신고·납부(12월 고지서에 함께 나온다).
// · 공정시장가액비율 60% — 종합부동산세법 시행령 제2조의4 제1항 ([시행 2026. 10. 1.] 대통령령 제36739호,
//   https://www.law.go.kr/법령/종합부동산세법시행령). 세율표는 같은 법 제9조 제1항 제1호(2주택 이하).
// 여전히 단순화로 미반영(화면 각주에 명시): 재산세 중복분 공제(제9조 제3항), 3주택 이상 중과세율(제9조 제1항
// 제2호 — 과세표준 12억 이하는 일반세율과 같다), 세부담 상한(제10조). 그래서 세액공제는 이 계산기의 산출세액에,
// 농특세는 그 공제 뒤 금액에 곱한다.

/** 주택 1채의 재산세 본세 (지방교육세·도시지역분 제외) */
export function calcPropertyTax(publishedValue: number, isSpecialOneHome: boolean): number {
  const fairMarketRatio = isSpecialOneHome
    ? publishedValue <= 300_000_000
      ? 0.43
      : publishedValue <= 600_000_000
      ? 0.44
      : 0.45
    : 0.6;
  const taxableBase = publishedValue * fairMarketRatio;

  if (isSpecialOneHome && publishedValue <= 900_000_000) {
    // 특례세율 0.05~0.35% (누진공제 3만/12만/42만원)
    if (taxableBase <= 60_000_000) return taxableBase * 0.0005;
    if (taxableBase <= 150_000_000) return 30_000 + (taxableBase - 60_000_000) * 0.001;
    if (taxableBase <= 300_000_000) return 120_000 + (taxableBase - 150_000_000) * 0.002;
    return 420_000 + (taxableBase - 300_000_000) * 0.0035;
  }
  // 표준세율 0.1~0.4% (누진공제 6만/19.5만/57만원)
  if (taxableBase <= 60_000_000) return taxableBase * 0.001;
  if (taxableBase <= 150_000_000) return 60_000 + (taxableBase - 60_000_000) * 0.0015;
  if (taxableBase <= 300_000_000) return 195_000 + (taxableBase - 150_000_000) * 0.0025;
  return 570_000 + (taxableBase - 300_000_000) * 0.004;
}

/**
 * 종합부동산세 (일반세율 기준, 납세의무자별 공시가격 합계)
 * 기본공제: 1세대 1주택 12억원, 그 외 인별 9억원 (2023년 개정 — 다주택자도 9억)
 */
export function calcComprehensiveTax(
  publishedTotal: number,
  isOnlyOneHome: boolean,
  fairMarketRatio = 0.6
): number {
  const deduction = isOnlyOneHome ? 1_200_000_000 : 900_000_000;
  const afterDeduction = Math.max(0, publishedTotal - deduction);
  const taxableBase = afterDeduction * fairMarketRatio;

  if (taxableBase <= 0) return 0;
  if (taxableBase <= 300_000_000) return taxableBase * 0.005;
  if (taxableBase <= 600_000_000) return 1_500_000 + (taxableBase - 300_000_000) * 0.007;
  if (taxableBase <= 1_200_000_000) return 3_600_000 + (taxableBase - 600_000_000) * 0.01;
  if (taxableBase <= 2_500_000_000) return 9_600_000 + (taxableBase - 1_200_000_000) * 0.013;
  if (taxableBase <= 5_000_000_000) return 26_500_000 + (taxableBase - 2_500_000_000) * 0.015;
  if (taxableBase <= 9_400_000_000) return 64_000_000 + (taxableBase - 5_000_000_000) * 0.02;
  return 152_000_000 + (taxableBase - 9_400_000_000) * 0.027;
}

/** 종합부동산세법 제9조 제5항 — 1세대 1주택자 고령자·장기보유 공제율 합계 한도(%) */
export const ONE_HOME_CREDIT_CAP_PERCENT = 80;
/** 농어촌특별세법 제5조 제1항 제8호 — 납부하여야 할 종합부동산세액의 100분의 20 */
export const RURAL_SPECIAL_TAX_PERCENT = 20;

/** 과세기준일(6월 1일) 현재 만 나이 → 연령별 공제율(%) — 종합부동산세법 제9조 제6항 */
export function seniorCreditPercent(age: number): number {
  if (!Number.isFinite(age) || age < 60) return 0;
  if (age < 65) return 20;
  if (age < 70) return 30;
  return 40;
}

/** 과세기준일 현재 해당 주택 보유기간(년) → 보유기간별 공제율(%) — 같은 조 제8항 */
export function longHoldingCreditPercent(holdingYears: number): number {
  if (!Number.isFinite(holdingYears) || holdingYears < 5) return 0;
  if (holdingYears < 10) return 20;
  if (holdingYears < 15) return 40;
  return 50;
}

/** 1세대 1주택자 세액공제 입력 — 비우면 공제 없음 (1세대 1주택자가 아니면 넣어도 무시) */
export interface OneHomeCreditInput {
  /** 과세기준일(6월 1일) 현재 만 나이 */
  age?: number;
  /** 과세기준일 현재 해당 주택 보유기간(년) */
  holdingYears?: number;
}

export interface HoldingTaxResult {
  /** 재산세 본세 (주택별 합, 도시지역분 제외) */
  propertyTax: number;
  /** 지방교육세 (재산세의 20%) */
  educationTax: number;
  /** 재산세 + 지방교육세 (7·9월) */
  totalRegional: number;
  /** 종부세 산출세액 — 세액공제 전 (재산세 중복분 공제·세부담 상한 미반영) */
  comprehensiveTaxBeforeCredit: number;
  /** 세액공제 대상(1세대 1주택자) 여부 */
  oneHomeCreditEligible: boolean;
  /** 고령자 공제율(%) — 대상이 아니면 0 */
  seniorCreditPercent: number;
  /** 장기보유 공제율(%) — 대상이 아니면 0 */
  longHoldingCreditPercent: number;
  /** 적용 공제율(%) = min(고령자 + 장기보유, 80) */
  creditPercent: number;
  /** 세액공제액 = 산출세액 × 적용 공제율 */
  oneHomeCredit: number;
  /** 납부할 종부세 = 산출세액 − 세액공제 */
  comprehensiveTax: number;
  /** 농어촌특별세 = 납부할 종부세 × 20% */
  ruralSpecialTax: number;
  /** 12월 고지 합계 = 종부세 + 농어촌특별세 */
  totalNational: number;
  /** 연 보유세 총액 = 재산세 합계(7·9월) + 종부세 + 농어촌특별세(12월) */
  total: number;
}

/**
 * @param publishedValue 1주택이면 그 주택의 공시가격, 2주택 이상이면 보유 주택 공시가격 합계
 * @param numHomes 보유 주택 수 (1~5)
 * @param isOnlyOneHome 1세대 1주택 여부 (1주택일 때만 의미)
 * @param credit 1세대 1주택자 고령자·장기보유 세액공제 입력 (생략하면 공제 없음)
 */
export function calcHoldingTax2026(
  publishedValue: number,
  numHomes: number,
  isOnlyOneHome: boolean,
  credit: OneHomeCreditInput = {}
): HoldingTaxResult {
  const total = Number.isFinite(publishedValue) ? Math.max(0, publishedValue) : 0;
  const homes = Math.max(1, Math.floor(Number.isFinite(numHomes) ? numHomes : 1));
  const special = isOnlyOneHome && homes === 1;
  // 재산세는 주택별 — 합계를 주택 수로 나눈 1채 금액으로 집마다 계산해 더한다
  const propertyTax = calcPropertyTax(total / homes, special) * homes;
  const educationTax = propertyTax * 0.2; // 지방교육세 20%
  const totalRegional = propertyTax + educationTax;

  const comprehensiveTaxBeforeCredit = calcComprehensiveTax(total, special);
  // 세액공제는 1세대 1주택자만, 두 공제율 합계 80% 한도 (제9조 제5항) — 정수 % 로 곱해 소수 오차를 줄인다
  const senior = special ? seniorCreditPercent(credit.age ?? 0) : 0;
  const longHolding = special ? longHoldingCreditPercent(credit.holdingYears ?? 0) : 0;
  const creditPercent = Math.min(senior + longHolding, ONE_HOME_CREDIT_CAP_PERCENT);
  const oneHomeCredit = (comprehensiveTaxBeforeCredit * creditPercent) / 100;
  const comprehensiveTax = comprehensiveTaxBeforeCredit - oneHomeCredit;
  // 농특세는 세액공제 뒤 '납부하여야 할' 종부세액에 붙는다
  const ruralSpecialTax = (comprehensiveTax * RURAL_SPECIAL_TAX_PERCENT) / 100;
  const totalNational = comprehensiveTax + ruralSpecialTax;

  return {
    propertyTax,
    educationTax,
    totalRegional,
    comprehensiveTaxBeforeCredit,
    oneHomeCreditEligible: special,
    seniorCreditPercent: senior,
    longHoldingCreditPercent: longHolding,
    creditPercent,
    oneHomeCredit,
    comprehensiveTax,
    ruralSpecialTax,
    totalNational,
    total: totalRegional + totalNational,
  };
}
