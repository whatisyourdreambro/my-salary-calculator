import { TOPIC_NEXT_STEPS } from '@/lib/topicNextSteps';
import { FUN_PAGES } from '@/lib/funRelatedPages';
import { ENGLISH_TOOL_READING } from '@/lib/englishContentLinks';

// Explicit scope of the 2026-10-19 editorial release: new explanatory next-step
// sections and comparison choices. Incoming links alone do not change a page's
// date. Guide recommendation reordering does not change the article revision.
// KST midnight is already past when an early-morning Korean release is built.
export const PAGE_LINK_REVIEW_DATE = new Date('2026-10-19T00:00:00+09:00');
export const PAGE_LINK_REVIEW_PATHS: ReadonlySet<string> = new Set([
  ...Object.keys(TOPIC_NEXT_STEPS),
  ...Object.keys(FUN_PAGES).map(slug => `/fun/${slug}`),
  ...Object.keys(ENGLISH_TOOL_READING).map(slug => `/en/tools/${slug}`),
  '/en', '/en/about', '/en/help', '/en/flat-tax', '/en/guides',
  '/en/bonus', '/en/salary-db', '/en/season', '/en/tools', '/en/fun',
  ...[2026, 2027].flatMap(year => ['annual', 'monthly', 'weekly', 'hourly'].map(kind => `/table/${year}/${kind}`)),
]);

// Only these pages received factual pension/tax corrections on October 23.
// Storage, routing and measurement changes do not refresh unrelated articles.
export const PAGE_ACCURACY_REVIEW_DATE = new Date('2026-10-23T00:00:00+09:00');
export const PAGE_ACCURACY_REVIEW_PATHS: ReadonlySet<string> = new Set([
  '/calc/pension-hike-2027', '/tools/finance/irp',
]);

export function pageContentRevision(path: string): Date | undefined {
  if (PAGE_ACCURACY_REVIEW_PATHS.has(path)) return PAGE_ACCURACY_REVIEW_DATE;
  if (PAGE_LINK_REVIEW_PATHS.has(path)) return PAGE_LINK_REVIEW_DATE;
  // Industry and region net-pay descriptions were substantively corrected by
  // commit 579d60bb on this day. Job/calculator recommendation changes alone do
  // not advance their content date.
  if (/^\/(?:region|industry)\/[^/]+$/.test(path)) return PAGE_LINK_REVIEW_DATE;
  return undefined;
}
