// Server-only selection: pass only { name, href } to GuidePageClient, never the calculator catalog.
import { getGuideRelatedCalcs, STATIC_CALC_CARDS } from "@/lib/crossLink";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";

export interface GuideCalculatorLink {
  name: string;
  href: string;
}

// A cross-link means "related", not "primary". Choose the article's next task explicitly;
// insertion order would send tax-settlement readers to a bonus calculator, for example.
export const GUIDE_PRIMARY_CALCULATOR_SLUGS: Readonly<Record<string, string>> = {
  "samsung-bonus-treasury-stock-15-trillion-2026": "samsung-bonus",
  "samsung-special-bonus-q3-preview-2027": "samsung-bonus",
  "samsung-opi-forecast-2027": "samsung-bonus",
  "samsung-ds-special-bonus-details-oct-2026": "samsung-bonus",
  "sk-hynix-bonus-renegotiation-sept-2026": "sk-hynix-bonus",
  "sk-hynix-ps-cash-vs-stock-scenarios-2026": "sk-hynix-bonus",
  "sk-hynix-ps-forecast-2027": "sk-hynix-bonus",
  "bonus-tax-rate": "incentive-tax",
  "severance-pay-guide": "severance",
  "voluntary-vs-recommended-resignation-2026": "voluntary-retirement",
  "annual-leave-allowance": "vacation-pay",
  "overtime-pay-calculation": "overtime-pay-quick",
  "minimum-wage-2026": "hourly-to-yearly",
  "jeonse-scam-prevention": "jeonse-loan",
  "first-home-2026-strategy": "housing-affordability-quick",
  "first-home-buyer-loan": "mortgage-monthly-quick",
  "happy-housing-qualifications": "housing-subscription",
  "gap-investment-risk": "rental-yield",
  "credit-score-up-2026": "loan-affordability",
  "auto-loan-vs-lease-2026": "car-loan",
  "child-education-tax-strategy": "child-deduction",
  "comprehensive-income-tax-2026": "income-tax-bracket-sim",
  "financial-income-tax": "dividend-tax-quick",
  "capital-gains-tax-stock": "stock-capital-gains-quick",
  "chip-stock-tax-guide": "stock-capital-gains-quick",
  "gift-tax-exemption": "gift-tax-quick",
  "inheritance-tax-strategy": "inheritance-tax-sim",
  "freelancer-tax-essentials": "freelancer-yearly-quick",
  "individual-vs-corporate-tax": "corporate-tax-quick",
  "fire-movement-realistic-2026": "fire-target",
  "economic-freedom-fire": "fire-target",
  "etf-investment-starter": "etf-fee-impact",
  "fund-vs-etf-2026": "etf-fee-impact",
  "etf-portfolio-2026": "portfolio-allocation",
  "dollar-investment": "exchange-impact-quick",
  "currency-exchange-2026": "currency-converter",
  "auto-insurance-comparison": "auto-insurance-quick",
  "health-insurance-vs-life-insurance": "life-insurance-needs",
  "year-end-tax-deductions-guide": "dependent-check",
  "year-end-tax-13-tips-2026": "dependent-check",
  "tax-refund-mistakes-2026": "dependent-check",
  "marriage-tax-benefits-2026": "dual-income-year-end",
  "medical-edu-donation-limits-2026": "dual-income-year-end",
  "donation-tax-credit": "donation-tax-credit-2026",
  "job-change-salary-jump-2026": "offer-compare",
  "salary-negotiation-script-2026": "offer-compare",
  "health-insurance-2026-guide": "health-insurance-dependent",
  "social-insurance-reduction": "social-insurance-rates-2027",
};

// These articles cover a wider decision than any one reverse-mapped calculator.
// Keep the whole tax settlement, retirement plan or two-company comparison as the task.
const DIRECT_GUIDE_LINKS: Readonly<Record<string, GuideCalculatorLink>> = {
  "year-end-tax-2026": { name: "연말정산 계산기", href: "/year-end-tax" },
  "salary-guide-2026": { name: "연봉 실수령액 계산기", href: "/" },
  "isa-vs-pension-savings": { name: "복리 계산기", href: "/tools/finance/compound" },
  "samsung-vs-sk-hynix-stock-bonus-2026": { name: "회사별 성과급 계산기", href: "/calc/bonus-calculators" },
};

const CATEGORY_LINKS: Readonly<Record<string, GuideCalculatorLink>> = {
  "연봉": { name: "연봉 실수령액 계산기", href: "/" },
  "세금": { name: "연말정산 계산기", href: "/year-end-tax" },
  "커리어": { name: "커리어 플래너", href: "/pro/career-planner" },
  "부동산": { name: "주택담보대출 계산기", href: "/home-loan" },
  "투자": { name: "복리 계산기", href: "/tools/finance/compound" },
  "주식": { name: "주식 수익률 계산기", href: "/calc/stock-pl-quick" },
  "기초": { name: "연봉 실수령액 계산기", href: "/" },
};

export function getGuidePrimaryCalculator(guide: { slug: string; category: string }): GuideCalculatorLink {
  const direct = DIRECT_GUIDE_LINKS[guide.slug];
  if (direct) return direct;
  const calcSlug = GUIDE_PRIMARY_CALCULATOR_SLUGS[guide.slug];
  if (calcSlug && getGuideRelatedCalcs(guide.slug).includes(calcSlug)) {
    const card = STATIC_CALC_CARDS[calcSlug] ?? getCalculatorBySlug(calcSlug);
    if (card) return { name: card.title, href: STATIC_CALC_CARDS[calcSlug]?.href ?? `/calc/${card.slug}` };
  }
  return CATEGORY_LINKS[guide.category] ?? { name: "연봉 실수령액 계산기", href: "/" };
}
