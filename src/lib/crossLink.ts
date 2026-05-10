// src/lib/crossLink.ts
//
// 계산기 ↔ 가이드 양방향 cross-link 매핑.
// 기존 RelatedCalculators(계산기→계산기), RelatedGuides(가이드→가이드)에 더해
// 계산기 페이지에서 어울리는 가이드를, 연봉 페이지에서 핵심 가이드를 노출.
// 페이지 평균 PV/세션 향상 + 내부 링크 mass 강화로 SEO 동시 효과.

/**
 * 계산기 slug → 추천 가이드 slug[]
 * 핵심 시즌·고트래픽 페어만 등록 (보일러플레이트 회피).
 */
export const CALC_TO_GUIDES: Record<string, string[]> = {
  // 시즌성 — 11~3월 트래픽 핫스팟
  "year-end-bonus": ["year-end-tax-2026", "bonus-tax-rate"],
  "year-end-bonus-tax": ["year-end-tax-2026", "bonus-tax-rate"],
  "incentive-tax": ["bonus-tax-rate", "salary-negotiation-secret"],
  "january-bonus": ["year-end-tax-2026", "bonus-tax-rate"],
  // 퇴직·연금
  "severance": ["severance-pay-guide", "pension-savings-fund"],
  "severance-vs-pension": ["severance-pay-guide", "pension-savings-fund"],
  // 부동산·전월세
  "jeonse-loan": ["jeonse-vs-monthly-rent-2026", "monthly-rent-tax-credit"],
  "housing-subscription": ["first-home-2026-strategy", "loan-types-comparison-2026"],
  // 가족·아이
  "child-deduction": ["child-education-tax-strategy", "marriage-tax-benefits-2026"],
  // 휴가·수당
  "vacation-pay": ["annual-leave-allowance"],
  "holiday-bonus": ["bonus-tax-rate"],
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
