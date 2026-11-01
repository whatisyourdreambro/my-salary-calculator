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

// Visible revision dates (PublishedMeta updatedDate, OG modifiedTime, Article modifiedDate) of
// pages whose only October 19 change was the TopicNextSteps link box. src/app/about/page.tsx:221:
// 본문·계산 기준·출처를 실질적으로 바꾼 경우에만 수정일을 표시하고, 날짜만 바꾸어 새 정보처럼
// 보이게 하지 않는다. The sitemap lastmod keeps PAGE_LINK_REVIEW_DATE (links are a real change
// for crawlers). verify:sitemap accepts a listed date only while the sitemap still carries that
// link-review day and never a visible date later than it; a substantive revision removes the route.
// B36, owner approval 8 (2026-11-01). Not listed: /health-checkup-2026 (real 11/1 STR-06 revision),
// and /year-end-tax-settlement-2026 and /tips, whose body facts were corrected after their older
// displayed dates, so those dates are not their last real revision.
export const PAGE_VISIBLE_REVISION_DATES: Readonly<Record<string, string>> = {
  '/chuseok-bonus-2026': '2026-08-16',
  '/health-insurance-2026': '2026-10-04',
  '/basic-pension-2026': '2026-08-15',
  '/civil-servant-pay-2027': '2026-09-25',
};

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
