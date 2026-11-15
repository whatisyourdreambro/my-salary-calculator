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
// 가이드의 발행일은 보존하고, 본문·계산 기준·출처를 실질적으로 바꾼 경우 수정일을 별도로 표시합니다.
// 날짜만 바꾸어 새 정보처럼 보이게 하지 않습니다. A calculation-basis change counts even when it
// arrives through a shared engine the page renders: /chuseok-bonus-2026 was listed at 2026-09-25, when A18
// (78f10ee20) changed calcBonusNet and so its mini calculator results, not its 8/16 article text.
// The sitemap lastmod keeps PAGE_LINK_REVIEW_DATE (links are a real change for crawlers).
// verify:sitemap accepts a listed date only while the sitemap still carries that link-review day
// and never a visible date later than it; a substantive revision removes the route.
// B36, owner approval 8 (2026-11-01). Not listed: /health-checkup-2026 (real 11/1 STR-06 revision),
// and /year-end-tax-settlement-2026 and /tips, whose body facts were corrected after their older
// displayed dates, so those dates are not their last real revision. Removed: /chuseok-bonus-2026
// (2026-11-03 R1 re-land ledger: its collapsed FAQ[0] source became the 2026 KEF survey, a substantive
// revision, so the visible, OG, Article and sitemap dates are all 2026-11-03).
export const PAGE_VISIBLE_REVISION_DATES: Readonly<Record<string, string>> = {
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

// 2026-11-15 (DATAB fd8c50245, app-data-pages-b03-F07): the hero label of every region detail page
// reads 2026년 추정 평균 연봉 instead of 2026년 전체 평균 연봉 — a visible correction, because the
// region figures are self-compiled estimates. The /region hub row is dated in ROUTE_OVERRIDES instead.
// If the sweep reverts fd8c50245, remove this date with it.
export const REGION_ESTIMATE_LABEL_DATE = new Date('2026-11-15T00:00:00+09:00');

export function pageContentRevision(path: string): Date | undefined {
  if (PAGE_ACCURACY_REVIEW_PATHS.has(path)) return PAGE_ACCURACY_REVIEW_DATE;
  if (PAGE_LINK_REVIEW_PATHS.has(path)) return PAGE_LINK_REVIEW_DATE;
  if (/^\/region\/[^/]+$/.test(path)) return REGION_ESTIMATE_LABEL_DATE;
  // Industry and region net-pay descriptions were substantively corrected by
  // commit 579d60bb on this day. Job/calculator recommendation changes alone do
  // not advance their content date.
  if (/^\/(?:region|industry)\/[^/]+$/.test(path)) return PAGE_LINK_REVIEW_DATE;
  return undefined;
}
