import { EN_GUIDE_SLUGS } from "./enGuideSlugs";
import { LANGUAGE_ROUTE_PAIRS } from "./englishSite";

export function isEnglishPath(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/");
}

export function languagePaths(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const english = isEnglishPath(path);
  const pair = LANGUAGE_ROUTE_PAIRS.find(([ko, en]) => path === ko || path === en);
  if (pair) return { ko: pair[0], en: pair[1], english };
  if (path === "/" || path === "/en") return { ko: "/", en: "/en", english };
  if (path === "/guides" || path === "/en/guides") return { ko: "/guides", en: "/en/guides", english };
  const guide = path.match(/^\/(?:en\/)?guides\/([^/]+)$/);
  if (guide && EN_GUIDE_SLUGS.has(guide[1])) return { ko: `/guides/${guide[1]}`, en: `/en/guides/${guide[1]}`, english };
  return english
    ? { ko: "/", en: path, english }
    : { ko: path, en: guide ? "/en/guides" : "/en", english };
}

export function englishGuideNextTask(slug: string) {
  if (slug === "four-major-insurance-complete") return { name: "Estimate Korean take-home pay", href: "/en#calculator", description: "Read modeled insurance and tax as separate lines. Confirm whether standard coverage applies to you." };
  if (slug === "health-insurance-2026-guide") return { name: "Insurance sources and checklist", href: "/en/help#insurance", description: "Use NHIS resources to confirm your membership and assessment; a simple salary form cannot determine regional premiums." };
  if (slug === "earned-income-credit-2026" || slug === "chip-stock-tax-guide") return { name: "English tax resources", href: "/en/help#tax-resources", description: "Confirm the applicable income year and personal eligibility in the official source before applying the guide." };
  if (slug === "year-end-tax-deductions-guide") return { name: "Compare income-tax methods", href: "/en/flat-tax", description: "Explore the limited resident comparison and its omissions. It does not calculate a final refund or decide eligibility." };
  if (slug === "loan-types-comparison-2026") return { name: "Plan loan payments", href: "/en/tools/loan", description: "Test a fixed monthly-payment schedule with your principal, rate and term; fees and lender approval remain separate." };
  if (slug === "samsung-vs-hynix-employee-comparison" || slug === "samsung-employee-rsu-stock") return { name: "Compare gross job offers", href: "/en/tools/offer-compare", description: "Use the written cash components of your offers. Keep uncertain share awards and contract conditions separate." };
  if (slug === "sk-hynix-employee-bonus-stock") return { name: "Calculate a gross bonus scenario", href: "/en/tools/bonus", description: "Enter your own annual-base percentage and fixed bonus. The model does not predict PS, PI, tax or eligibility." };
  if (slug === "semiconductor-cycle-2026" || slug === "kospi-leader-stock-strategy") return { name: "Explore a savings goal", href: "/en/tools/savings-goal", description: "Build a contribution scenario from your goal and time horizon; the assumed return is not a market forecast." };
  return { name: "Explore money planning tools", href: "/en/tools", description: "Compare your cash-flow assumptions without treating a company's product announcement as an investment-return forecast." };
}
