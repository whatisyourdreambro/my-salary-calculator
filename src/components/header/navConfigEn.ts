import type { DropdownSubItem, NavItem } from "./navConfig";
import { EN_SECTIONS } from "@/lib/englishSite";

const items: Record<(typeof EN_SECTIONS)[number]["id"], DropdownSubItem[]> = {
  bonus: [
    { name: "Bonus and compensation hub", href: "/en/bonus", description: "Cash, stock awards and pay-package questions", badge: "MUST" },
    { name: "Bonus calculator", href: "/en/tools/bonus", description: "Fixed and percentage-based gross bonuses" },
    { name: "Compare job offers", href: "/en/tools/offer-compare", description: "Compare consistent annual pay assumptions" },
    { name: "Samsung employee stock plans", href: "/en/guides/samsung-employee-rsu-stock" },
    { name: "SK Hynix PS, PI and employee shares", href: "/en/guides/sk-hynix-employee-bonus-stock" },
  ],
  calculators: [
    { name: "All calculators", href: "/en/calculators", description: "Find the tool that answers your question", badge: "MUST" },
    { name: "Korea take-home salary", href: "/en#calculator", description: "2026 Korean employee estimate" },
    { name: "Foreign employee income-tax comparison", href: "/en/flat-tax", description: "Compare methods; check eligibility separately" },
    { name: "Gross salary currency converter", href: "/en/salary-converter", description: "Use an exchange rate you choose" },
    { name: "Hourly pay to annual salary", href: "/en/tools/hourly-to-salary" },
    { name: "Salary raise calculator", href: "/en/tools/salary-raise" },
    { name: "Loan repayment calculator", href: "/en/tools/loan" },
    { name: "Compound interest calculator", href: "/en/tools/compound-interest" },
    { name: "Savings goal calculator", href: "/en/tools/savings-goal" },
    { name: "FIRE target calculator", href: "/en/tools/fire" },
  ],
  salary: [
    { name: "Salary research and comparisons", href: "/en/salary-db", description: "Read published pay figures in context", badge: "MUST" },
    { name: "Compare gross job offers", href: "/en/tools/offer-compare" },
    { name: "Korea take-home salary", href: "/en#calculator" },
    { name: "Hourly pay to annual salary", href: "/en/tools/hourly-to-salary" },
    { name: "Samsung and SK Hynix compensation", href: "/en/guides/samsung-vs-hynix-employee-comparison" },
    { name: "My saved results", href: "/en/dashboard" },
  ],
  season: [
    { name: "Pay and tax preparation", href: "/en/season", description: "Prepare for job changes and tax reconciliation", badge: "SEASON" },
    { name: "Korean year-end tax deductions", href: "/en/guides/year-end-tax-deductions-guide" },
    { name: "Korean Earned Income Tax Credit", href: "/en/guides/earned-income-credit-2026" },
    { name: "Insurance before changing jobs", href: "/en/guides/four-major-insurance-complete" },
    { name: "Bonus calculator", href: "/en/tools/bonus" },
  ],
  guides: [
    { name: "All English guides", href: "/en/guides", description: "Salary, insurance, tax and financial decisions", badge: "MUST" },
    { name: "Methods, sources and help", href: "/en/help" },
    { name: "Korean social insurance", href: "/en/guides/four-major-insurance-complete" },
    { name: "Korean health insurance", href: "/en/guides/health-insurance-2026-guide" },
    { name: "Understanding loan types", href: "/en/guides/loan-types-comparison-2026" },
    { name: "Samsung Electronics: reading the business", href: "/en/guides/samsung-electronics-stock-2026" },
    { name: "SK Hynix: reading the business", href: "/en/guides/sk-hynix-stock-2026" },
    { name: "Semiconductor industry guide", href: "/en/guides/semiconductor-cycle-2026" },
    { name: "Stock and employee award tax questions", href: "/en/guides/chip-stock-tax-guide" },
    { name: "Regular investing and lump sums", href: "/en/guides/kospi-leader-stock-strategy" },
  ],
  money: [
    { name: "Everyday money tools", href: "/en/tools", description: "Choose your currency and state your assumptions", badge: "MUST" },
    { name: "Loan repayments", href: "/en/tools/loan" },
    { name: "Compound growth", href: "/en/tools/compound-interest" },
    { name: "Savings goals", href: "/en/tools/savings-goal" },
    { name: "FIRE target", href: "/en/tools/fire" },
    { name: "Gross currency conversion", href: "/en/salary-converter" },
    { name: "Split a bill", href: "/en/tools/split-bill" },
  ],
  fun: [
    { name: "Everyday money perspectives", href: "/en/fun", description: "Useful ways to put spending into perspective" },
    { name: "What does it cost in work hours?", href: "/en/tools/work-time-cost" },
    { name: "Split a bill with friends", href: "/en/tools/split-bill" },
    { name: "Imagine your next salary raise", href: "/en/tools/salary-raise" },
  ],
};

export const navConfigEn: NavItem[] = EN_SECTIONS.map(section => ({
  name: section.title, type: "dropdown", description: section.description, items: items[section.id],
}));
