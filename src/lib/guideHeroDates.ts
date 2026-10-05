import type { Guide } from "./guidesData";
import { getGuideModifiedDate } from "./guideDates";

/**
 * 히어로(제목 아래 발행·수정 줄, 첫 본문 광고 GuideMidAd 위)에 '수정' 날짜를 표시하지 않는 가이드.
 *
 * 2026-10-03 사실 정정(352451886)으로 modifiedDate 가 처음 생긴 55편이다. 히어로 메타 줄에 날짜가 하나 더 붙으면
 * 모바일에서 줄이 늘어 그 아래 광고가 모두 내려간다(2026-10-05 감사 code51-01). 히어로는 9/27 빌드(4ef59a4b2)
 * 배치로 되돌리고, 수정일은 화면 밖 신호(Article JSON-LD dateModified·OG modified_time·사이트맵 lastmod·RSS)와
 * 광고 아래 '마지막 내용 수정' 줄에 그대로 둔다. 히어로에 수정일을 보이는 방식은 10/15 슬롯(마스터플랜 SEO 승인 ③,
 * 히어로에 새 줄이 생기지 않는 방식)에서 폭 점검과 함께 정한다 — 그때 이 목록을 줄인다.
 * 서버 전용 — guides/[slug]/page.tsx 에서만 읽고 결과(boolean)만 클라이언트로 넘긴다(목록이 클라 번들에 실리지 않게).
 */
export const GUIDE_HERO_MODIFIED_HIDDEN: ReadonlySet<string> = new Set([
  "auto-loan-vs-lease-2026",
  "bonus-property-sell-same-year-2026",
  "bonus-split-payout-1000-saving-2026",
  "business-trip-expense-tax-2026",
  "career-break-financial-plan",
  "child-fund-gift-strategy-2026",
  "chip-rsu-stock-tax-2026",
  "comprehensive-financial-income-2000-2026",
  "comprehensive-income-tax-2026",
  "coupang-fulfillment-night-pay-2026",
  "credit-score-850-strategy-2026",
  "dependent-check-before-bonus-2026",
  "energy-voucher-2026",
  "etf-portfolio-2026",
  "farmland-forest-capital-gains-2026",
  "first-home-2026-strategy",
  "first-job-salary-negotiation",
  "foreign-flat-tax-19-2026",
  "fx-gain-tax-2026",
  "gift-tax-exemption",
  "gift-vs-transfer-asset-2026",
  "health-insurance-2026-guide",
  "health-insurance-continue-after-retire-2026",
  "individual-vs-corporate-tax",
  "inheritance-tax-strategy",
  "irp-pension-isa-comparison-2026",
  "irp-pension-year-end-2026",
  "isa-account-guide",
  "isa-vs-pension-savings",
  "kai-salary-2026",
  "minimum-wage-impact-2026",
  "mortgage-refinance-guide-2026",
  "newlywed-loan-limit-2x-2026",
  "one-home-capital-gains-12eok-2026",
  "parcel-vs-occupancy-right-tax-2026",
  "pension-savings-fund",
  "performance-pay-complete-2026",
  "personal-loan-vs-debt-consolidation",
  "personal-vs-corporation-tax-2026",
  "public-company-salary-ranking-2026",
  "reits-investment",
  "retention-bonus-3year-split-2026",
  "retirement-planning",
  "retirement-planning-30s",
  "samsung-special-bonus-q3-preview-2027",
  "semiconductor-performance-bonus-tax",
  "sign-on-bonus-tax-2026",
  "stock-investment-beginner-2026",
  "tax-amnesty-self-report-2026",
  "us-treasury-bond",
  "work-contract-check-7-2026",
  "year-end-tax-2026",
  "year-end-tax-deductions-guide",
  "youth-leap-account-2026",
  "youth-subscription-60points-2026",
]);

/** 히어로에 '수정' 날짜를 표시할지 — 수정일이 발행일과 다르고, 위 목록에 없는 글만. */
export function showGuideHeroModified(guide: Pick<Guide, "slug" | "publishedDate" | "modifiedDate">): boolean {
  return getGuideModifiedDate(guide) !== guide.publishedDate && !GUIDE_HERO_MODIFIED_HIDDEN.has(guide.slug);
}
