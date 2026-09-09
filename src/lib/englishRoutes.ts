import { EN_SECTIONS, EN_SUPPORT_PAGES } from "./englishSite";
import { ENGLISH_TOOLS } from "./englishTools";
import { EN_GUIDE_SLUGS } from "./enGuideSlugs";

/** Concrete route inventory shared by discovery, sitemap and whole-English QA. */
export const EN_STATIC_PAGE_ENTRIES = [
  { href: "/en", title: "Korea salary calculator", description: "Estimate Korean take-home pay and explore salary and money tools." },
  { href: "/en/flat-tax", title: "Foreign employee flat tax comparison", description: "Compare limited Korean progressive income-tax assumptions with the foreign-employee flat method." },
  { href: "/en/salary-converter", title: "Gross salary currency converter", description: "Convert annual and monthly gross salary using an exchange rate you choose." },
  ...EN_SECTIONS.map(({ href, title, description }) => ({ href, title, description })),
  ...EN_SUPPORT_PAGES,
  ...ENGLISH_TOOLS.map(tool => ({ href: `/en/tools/${tool.slug}`, title: tool.title, description: tool.description })),
];
export const EN_INDEXABLE_STATIC_PATHS = EN_STATIC_PAGE_ENTRIES.filter(entry => !("private" in entry && entry.private)).map(entry => entry.href);
export const EN_ALL_PAGE_PATHS = [...EN_STATIC_PAGE_ENTRIES.map(entry => entry.href), ...[...EN_GUIDE_SLUGS].map(slug => `/en/guides/${slug}`)];
