import { enGuideCards } from "./guidesData";
import type { SearchEntry } from "./searchIndex";

/** English search only links to pages with English content. Loaded on demand. */
export const englishSearchIndex: SearchEntry[] = [
  { title: "Korea salary calculator", href: "/en", category: "계산기", description: "Estimate monthly take-home pay from annual gross salary in KRW.", priority: 1 },
  { title: "Foreign employee flat tax comparison", href: "/en/flat-tax", category: "계산기", description: "Compare limited progressive-tax assumptions with the 19% national flat tax plus local income tax.", priority: 1 },
  { title: "Gross salary currency converter", href: "/en/salary-converter", category: "계산기", description: "Convert annual and monthly gross salary using an exchange rate you choose.", priority: 1 },
  { title: "English salary and tax guides", href: "/en/guides", category: "가이드", description: "Guides for understanding work, salary and tax in Korea." },
  { title: "Help using Moneysalary", href: "/en/help", category: "도구", description: "Calculator assumptions, official sources, privacy and contact options." },
  ...enGuideCards.map(guide => ({ title: guide.title, href: `/en/guides/${guide.slug}`, category: "가이드" as const, description: guide.description })),
];

export function searchEnglishEntries(query: string, limit = 10): SearchEntry[] {
  const words = query.toLocaleLowerCase("en").trim().split(/\s+/).filter(Boolean);
  if (!words.length || !Number.isInteger(limit) || limit < 1) return [];
  return englishSearchIndex
    .map(entry => {
      const title = entry.title.toLocaleLowerCase("en");
      const description = entry.description?.toLocaleLowerCase("en") ?? "";
      const matches = words.every(word => title.includes(word) || description.includes(word));
      const score = words.reduce((total, word) => total + (title.includes(word) ? 3 : 0) + (description.includes(word) ? 1 : 0), 0);
      return { entry, score, matches };
    })
    .filter(item => item.matches)
    .sort((a, b) => b.score - a.score || (a.entry.priority ?? 99) - (b.entry.priority ?? 99) || a.entry.title.localeCompare(b.entry.title, "en"))
    .slice(0, limit)
    .map(item => item.entry);
}
