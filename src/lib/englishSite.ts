/** Lightweight, shared English information architecture. No article bodies or calculator code. */
export const EN_SECTIONS = [
  { id: "bonus", title: "Bonus", koTitle: "성과급", href: "/en/bonus", description: "Understand bonuses, stock awards and total compensation." },
  { id: "calculators", title: "Calculators", koTitle: "계산기", href: "/en/calculators", description: "Choose a calculator by the question you need to answer." },
  { id: "salary", title: "Salaries", koTitle: "연봉DB", href: "/en/salary-db", description: "Read salary information and compare your own offers." },
  { id: "season", title: "Seasonal", koTitle: "시즌", href: "/en/season", description: "Prepare for a new job, bonus season and Korean tax reconciliation." },
  { id: "guides", title: "Guides", koTitle: "가이드", href: "/en/guides", description: "Practical explanations with sources and clear assumptions." },
  { id: "money", title: "Money", koTitle: "생활금융", href: "/en/tools", description: "Plan borrowing, saving and everyday spending in your chosen currency." },
  { id: "fun", title: "Fun", koTitle: "Fun", href: "/en/fun", description: "Put everyday costs and shared bills into perspective." },
] as const;

export const EN_SUPPORT_PAGES = [
  { href: "/en/help", title: "Methods, sources and help", description: "Understand calculator methods, limits and official sources." },
  { href: "/en/about", title: "About Moneysalary", description: "How Moneysalary's calculators, guides and corrections work." },
  { href: "/en/privacy", title: "Privacy policy", description: "How saved results, analytics, advertising and contact data are handled." },
  { href: "/en/terms", title: "Terms of use", description: "Terms for using Moneysalary's reference tools and content." },
  { href: "/en/contact", title: "Private contact and corrections", description: "Report a problem or request a correction privately.", private: true },
  { href: "/en/dashboard", title: "My dashboard", description: "Reopen English results and favorites saved in this browser.", private: true },
] as const;

/** Language navigation counterparts. SEO equivalents are intentionally a smaller set. */
export const LANGUAGE_ROUTE_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["/", "/en"], ["/guides", "/en/guides"], ["/calc", "/en/calculators"],
  ["/calc/bonus-calculators", "/en/bonus"], ["/salary-db", "/en/salary-db"],
  ["/tools", "/en/tools"], ["/fun", "/en/fun"],
  ["/dashboard", "/en/dashboard"], ["/about", "/en/about"],
  ["/privacy", "/en/privacy"], ["/terms", "/en/terms"], ["/contact", "/en/contact"],
  ["/tools/loan", "/en/tools/loan"], ["/tools/finance/compound", "/en/tools/compound-interest"],
  ["/calc/offer-compare", "/en/tools/offer-compare"], ["/fire-calculator", "/en/tools/fire"],
  ["/salary-raise-2026", "/en/tools/salary-raise"], ["/tools/finance/bonus", "/en/tools/bonus"],
];

/** Only translated policy pages are added here; different financial models are not hreflang twins. */
export const EN_TRANSLATED_POLICY_PATHS = ["/about", "/privacy", "/terms", "/contact"] as const;

export function englishPolicyCounterpart(path: string): string | undefined {
  return EN_TRANSLATED_POLICY_PATHS.find(ko => path === ko || path === `/en${ko}`);
}
