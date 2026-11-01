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

export interface HoldingTaxResult {
  propertyTax: number;
  educationTax: number;
  comprehensiveTax: number;
  totalRegional: number;
  total: number;
}

/**
 * @param publishedValue 1주택이면 그 주택의 공시가격, 2주택 이상이면 보유 주택 공시가격 합계
 * @param numHomes 보유 주택 수 (1~5)
 * @param isOnlyOneHome 1세대 1주택 여부 (1주택일 때만 의미)
 */
export function calcHoldingTax2026(
  publishedValue: number,
  numHomes: number,
  isOnlyOneHome: boolean
): HoldingTaxResult {
  const total = Number.isFinite(publishedValue) ? Math.max(0, publishedValue) : 0;
  const homes = Math.max(1, Math.floor(Number.isFinite(numHomes) ? numHomes : 1));
  const special = isOnlyOneHome && homes === 1;
  // 재산세는 주택별 — 합계를 주택 수로 나눈 1채 금액으로 집마다 계산해 더한다
  const propertyTax = calcPropertyTax(total / homes, special) * homes;
  const educationTax = propertyTax * 0.2; // 지방교육세 20%
  const comprehensiveTax = calcComprehensiveTax(total, special);
  const totalRegional = propertyTax + educationTax;
  return { propertyTax, educationTax, comprehensiveTax, totalRegional, total: totalRegional + comprehensiveTax };
}
