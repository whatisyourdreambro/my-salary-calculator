// src/lib/crossLink.ts
//
// 계산기 ↔ 가이드 양방향 cross-link 매핑.
// 기존 RelatedCalculators(계산기→계산기), RelatedGuides(가이드→가이드)에 더해
// 계산기 페이지에서 어울리는 가이드를, 연봉 페이지에서 핵심 가이드를 노출.
// 페이지 평균 PV/세션 향상 + 내부 링크 mass 강화로 SEO 동시 효과.

/**
 * 계산기 slug → 추천 가이드 slug[]
 * 핵심 시즌·고트래픽 페어 + 카테고리별 일반 매핑.
 * 가이드가 존재하지 않으면 RelatedGuides가 자동 fallback.
 */
export const CALC_TO_GUIDES: Record<string, string[]> = {
  // ───── 시즌성 — 11~3월 트래픽 핫스팟
  "year-end-bonus": ["year-end-tax-2026", "bonus-tax-rate"],
  "year-end-bonus-tax": ["year-end-tax-2026", "bonus-tax-rate"],
  "incentive-tax": ["bonus-tax-rate", "salary-negotiation-secret"],
  "january-bonus": ["year-end-tax-2026", "bonus-tax-rate"],
  // ───── 퇴직·연금
  "severance": ["severance-pay-guide", "isa-vs-pension-savings"],
  "severance-vs-pension": ["severance-pay-guide", "isa-vs-pension-savings"],
  "severance-pay-quick": ["severance-pay-guide", "isa-vs-pension-savings"],
  "retirement-income-tax-quick": ["severance-pay-guide", "fire-movement-realistic-2026"],
  // ───── 부동산·전월세
  "jeonse-loan": ["jeonse-scam-prevention", "first-home-2026-strategy"],
  "jeonse-loan-cost": ["jeonse-scam-prevention", "first-home-2026-strategy"],
  "jeonse-vs-monthly-cost": ["jeonse-scam-prevention", "first-home-2026-strategy"],
  "monthly-rent-tax-credit-quick": ["jeonse-scam-prevention", "year-end-tax-2026"],
  "housing-subscription": ["first-home-2026-strategy", "happy-housing-qualifications"],
  "mortgage-monthly-quick": ["first-home-buyer-loan", "first-home-2026-strategy"],
  "housing-affordability-quick": ["first-home-buyer-loan", "first-home-2026-strategy"],
  "rental-yield": ["gap-investment-risk", "first-home-2026-strategy"],
  "real-estate-flip-cost": ["gap-investment-risk", "first-home-buyer-loan"],
  "registration-tax-quick": ["first-home-buyer-loan", "gift-tax-exemption"],
  "property-tax-quick": ["first-home-2026-strategy", "comprehensive-income-tax-2026"],
  "comprehensive-property-tax-quick": ["comprehensive-income-tax-2026", "first-home-2026-strategy"],
  "real-estate-capital-gains-quick": ["comprehensive-income-tax-2026", "gift-tax-exemption"],
  // ───── 가족·아이·결혼
  "child-deduction": ["child-education-tax-strategy", "year-end-tax-2026"],
  "wedding-cost-quick": ["first-job-financial-setup", "first-home-2026-strategy"],
  "baby-yearly-cost": ["child-education-tax-strategy", "career-break-financial-plan"],
  "education-cost-cumulative": ["child-education-tax-strategy", "isa-vs-pension-savings"],
  "childcare-fee": ["child-education-tax-strategy", "year-end-tax-2026"],
  "alimony-quick": ["career-break-financial-plan", "comprehensive-income-tax-2026"],
  // ───── 휴가·수당·근로
  "vacation-pay": ["annual-leave-allowance", "salary-guide-2026"],
  "holiday-bonus": ["bonus-tax-rate", "salary-guide-2026"],
  "holiday-allowance-quick": ["annual-leave-allowance", "salary-guide-2026"],
  "annual-leave-pay-quick": ["annual-leave-allowance", "salary-guide-2026"],
  "overtime-pay-quick": ["overtime-pay-calculation", "salary-guide-2026"],
  "night-shift-pay-quick": ["overtime-pay-calculation", "salary-guide-2026"],
  "weekend-pay-quick": ["overtime-pay-calculation", "annual-leave-allowance"],
  "hourly-to-yearly": ["minimum-wage-2026", "salary-guide-2026"],
  "yearly-to-hourly": ["minimum-wage-2026", "salary-guide-2026"],
  "weekly-pay": ["minimum-wage-2026", "salary-guide-2026"],
  "daily-pay": ["minimum-wage-2026", "salary-guide-2026"],
  // ───── 세금 일반
  "income-tax-bracket-sim": ["comprehensive-income-tax-2026", "year-end-tax-2026"],
  "earned-income-tax-quick": ["year-end-tax-2026", "salary-guide-2026"],
  "comprehensive-income-tax-quick": ["comprehensive-income-tax-2026", "year-end-tax-2026"],
  "dividend-tax-quick": ["financial-income-tax", "capital-gains-tax-stock"],
  "interest-tax-quick": ["financial-income-tax", "isa-account-guide"],
  "stock-capital-gains-quick": ["capital-gains-tax-stock", "chip-stock-tax-guide"],
  "vat-quick": ["freelancer-tax-essentials", "individual-vs-corporate-tax"],
  "vat-reverse-quick": ["freelancer-tax-essentials", "individual-vs-corporate-tax"],
  "inheritance-tax-sim": ["inheritance-tax-strategy", "gift-tax-exemption"],
  "gift-tax-quick": ["gift-tax-exemption", "inheritance-tax-strategy"],
  // ───── 대출
  "loan-monthly-payment": ["first-home-buyer-loan", "credit-score-up-2026"],
  "loan-total-interest": ["first-home-buyer-loan", "credit-score-up-2026"],
  "dsr-quick": ["first-home-buyer-loan", "first-home-2026-strategy"],
  "ltv-quick": ["first-home-buyer-loan", "first-home-2026-strategy"],
  "loan-affordability": ["first-home-buyer-loan", "credit-score-up-2026"],
  "level-principal-payment": ["first-home-buyer-loan", "fire-movement-realistic-2026"],
  "bullet-loan": ["gap-investment-risk", "first-home-buyer-loan"],
  "prepayment-fee-quick": ["first-home-buyer-loan", "credit-score-up-2026"],
  "loan-refinance-savings": ["first-home-buyer-loan", "credit-score-up-2026"],
  "monthly-installment": ["credit-score-up-2026", "household-ledger-tips"],
  "auto-loan-vs-lease-quick": ["auto-loan-vs-lease-2026", "car-tax-annual-payment"],
  // ───── 투자·재테크
  "compound-interest-quick": ["fire-movement-realistic-2026", "isa-vs-pension-savings"],
  "simple-interest-quick": ["household-ledger-tips", "isa-account-guide"],
  "cagr-quick": ["etf-portfolio-2026", "fire-movement-realistic-2026"],
  "rule-of-72-quick": ["fire-movement-realistic-2026", "etf-portfolio-2026"],
  "savings-goal-time": ["fire-movement-realistic-2026", "isa-vs-pension-savings"],
  "fire-target": ["fire-movement-realistic-2026", "economic-freedom-fire"],
  "dollar-cost-average": ["etf-investment-starter", "dollar-investment"],
  "dividend-yield-quick": ["financial-income-tax", "etf-portfolio-2026"],
  "real-return-quick": ["fire-movement-realistic-2026", "etf-portfolio-2026"],
  "inflation-impact-quick": ["fire-movement-realistic-2026", "dollar-investment"],
  "stock-pl-quick": ["capital-gains-tax-stock", "chip-stock-tax-guide"],
  "etf-fee-impact": ["etf-investment-starter", "fund-vs-etf-2026"],
  "bond-yield-quick": ["financial-income-tax", "etf-portfolio-2026"],
  "portfolio-allocation": ["etf-portfolio-2026", "fund-vs-etf-2026"],
  "exchange-impact-quick": ["dollar-investment", "currency-exchange-2026"],
  // ───── 보험
  "auto-insurance-quick": ["auto-insurance-comparison", "car-tax-annual-payment"],
  "life-insurance-needs": ["health-insurance-vs-life-insurance", "first-job-financial-setup"],
  "medical-expense-coverage": ["health-insurance-vs-life-insurance", "year-end-tax-2026"],
  "cancer-insurance-needs": ["health-insurance-vs-life-insurance"],
  // ───── 비즈니스·프리랜서
  "freelancer-yearly-quick": ["freelancer-tax-essentials", "individual-vs-corporate-tax"],
  "side-business-net": ["freelancer-tax-essentials", "individual-vs-corporate-tax"],
  "hourly-billing-rate": ["freelancer-tax-essentials", "salary-negotiation-secret"],
  "business-margin-quick": ["individual-vs-corporate-tax", "freelancer-tax-essentials"],
  "corporate-tax-quick": ["individual-vs-corporate-tax", "freelancer-tax-essentials"],
  "simple-vs-general-vat": ["freelancer-tax-essentials", "individual-vs-corporate-tax"],
  // ───── 환율·해외
  "currency-converter": ["currency-exchange-2026", "dollar-investment"],
};

/**
 * 연봉 페이지(/salary/[amount]) 공통 추천 가이드 — 모든 연봉 페이지에서 동일 노출.
 * 본인의 위치 + 다음 단계 의사결정에 도움 되는 핵심 글.
 */
export const SALARY_PAGE_GUIDES: string[] = [
  "salary-guide-2026",
  "year-end-tax-2026",
  "salary-negotiation-secret",
  "fire-movement-realistic-2026",
];

/**
 * /calc/[slug] 의 calculator slug 로부터 추천 가이드 슬러그를 가져옴.
 * 매핑 없으면 빈 배열 → RelatedGuides 가 자동 score fallback 동작.
 */
export function getCalcRelatedGuideSlugs(calcSlug: string): string[] {
  return CALC_TO_GUIDES[calcSlug] ?? [];
}

/**
 * 가이드 → 계산기 역방향 매핑.
 * CALC_TO_GUIDES를 역으로 집계 — 별도 매핑을 유지하지 않아도 항상 동기화됨.
 * 가이드 글을 읽은 독자를 관련 계산기(=실전 도구)로 보내 PV/세션 향상.
 */
let _guideToCalcsCache: Record<string, string[]> | null = null;

function buildGuideToCalcs(): Record<string, string[]> {
  if (_guideToCalcsCache) return _guideToCalcsCache;
  const map: Record<string, string[]> = {};
  for (const [calcSlug, guideSlugs] of Object.entries(CALC_TO_GUIDES)) {
    for (const g of guideSlugs) {
      (map[g] ??= []).push(calcSlug);
    }
  }
  _guideToCalcsCache = map;
  return map;
}

/**
 * 가이드 slug → 이 가이드와 짝지어진 계산기 slug[].
 * 매핑 없으면 빈 배열.
 */
export function getGuideRelatedCalcs(guideSlug: string): string[] {
  return buildGuideToCalcs()[guideSlug] ?? [];
}
