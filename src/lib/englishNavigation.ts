import { EN_GUIDE_SLUGS } from "./enGuideSlugs";

export function isEnglishPath(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/");
}

export function languagePaths(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const english = isEnglishPath(path);
  if (path === "/" || path === "/en") return { ko: "/", en: "/en", english };
  if (path === "/guides" || path === "/en/guides") return { ko: "/guides", en: "/en/guides", english };
  const guide = path.match(/^\/(?:en\/)?guides\/([^/]+)$/);
  if (guide && EN_GUIDE_SLUGS.has(guide[1])) return { ko: `/guides/${guide[1]}`, en: `/en/guides/${guide[1]}`, english };
  return english
    ? { ko: "/", en: path, english }
    : { ko: path, en: guide ? "/en/guides" : "/en", english };
}

export function englishGuideNextTask(slug: string) {
  if (slug === "four-major-insurance-complete" || slug === "health-insurance-2026-guide") return { name: "Insurance sources and checklist", href: "/en/help#insurance" };
  if (slug === "earned-income-credit-2026" || slug === "year-end-tax-deductions-guide" || slug === "chip-stock-tax-guide") return { name: "English tax resources", href: "/en/help#tax-resources" };
  if (slug === "loan-types-comparison-2026") return { name: "Gross currency conversion", href: "/en/salary-converter" };
  return { name: "English guide library", href: "/en/guides" };
}
