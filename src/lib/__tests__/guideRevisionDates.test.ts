import { execFileSync } from "node:child_process";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Render the real article and date controls without executing browser effects.
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => null, GuideMidAd: () => null, HomeTopAd: () => null,
  InArticleAd: () => null, MultiplexAd: () => null, SidebarAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/RelatedGuides", () => ({ default: () => null }));
vi.mock("@/components/GuideRelatedCalcs", () => ({ default: () => null }));

import GuidePage, { generateMetadata } from "@/app/guides/[slug]/page";
import { koGuides } from "@/lib/guidesContent";
import { getGuideModifiedDate } from "@/lib/guideDates";
import { filterAndSortGuides, rankRelatedGuides } from "@/lib/guideDiscovery";
import { GUIDE_CONTENT_REVISED } from "@/lib/guideContentRevisions";
import { getGuideSitemapDate } from "@/lib/guideSitemapDates";

// 대상: 본문 정정일 표 전체(guideContentRevisions.ts 가 합친 표 — 일시적 2주택 4편 + 2026-11-01 사실 정정 묶음 +
// R1 재착지 1편(쿠팡 야간 가이드)).
// 기대값 = max(modifiedDate ?? publishedDate, 그 글의 정정일).
const expectedContentDate = (guide: { slug: string; publishedDate: string; modifiedDate?: string }) =>
  [getGuideModifiedDate(guide), GUIDE_CONTENT_REVISED[guide.slug]].sort().at(-1)!;

// 2026-11-15 (ads-01): R1 재착지에서 내용이 바뀐 '수정 칩 있는' 가이드 10편은 본문 정정일 표에서 빠져 위 표의 대상이 아니다.
// 칩 숫자를 2026.10.03 → 2026.11.03 으로 바꾸면 화면 폭 440~445px 에서 제목 아래 광고가 24px 내려가서(가드 스윕 실측),
// 화면·OG·Article 날짜는 운영 값 그대로 두고 사이트맵 lastmod·rss.xml pubDate 만 올린다(guideSitemapDates.ts 사이트맵 전용 행).
// 아래 두 번째 describe 가 실제 페이지 출력으로 그 10편의 날짜 글자가 운영과 같은지 본다(표 쪽 고정은 relandR1Ledger.test.ts).
const R1_SITEMAP_ONLY_SLUGS = [
  "career-break-financial-plan",
  "comprehensive-income-tax-2026",
  "first-home-2026-strategy",
  "isa-account-guide",
  "kai-salary-2026",
  "minimum-wage-impact-2026",
  "performance-pay-complete-2026",
  "retirement-planning-30s",
  "us-treasury-bond",
  "year-end-tax-2026",
];
// 운영(326b54383, 내용 d2fcc8720)이 이 10편에 보여 주는 날짜와, R1 이 그 내용을 실제로 고친 날(사이트맵·RSS 전용)
const R1_PRODUCTION_SCREEN_DATE = "2026-10-03";
const R1_LEDGER_DAY = "2026-11-03";
// R1 뒤 묶음이 다시 고쳐 사이트맵·RSS 날짜만 그 묶음의 실제 수정일로 늦춘 글(화면 날짜는 위 운영 값 그대로) — relandR1Ledger.test.ts 와 같은 표.
// RL-08(2026-11-15): first-home-2026-strategy 광고 위 매수 가능액 공식 두 줄 같은 폭 이하 정정.
const R1_LATER_SITEMAP_DAY: Readonly<Record<string, string>> = { "first-home-2026-strategy": "2026-11-15", "performance-pay-complete-2026": "2026-11-18" };

describe("검증된 가이드 보강일의 상세 화면·검색 메타 정합성", () => {
  it("실제 sitemap 함수도 정정일 표의 글마다 같은 내용 수정일을 출력한다", () => {
    // sitemap의 지연 require(@/...)를 앱과 같은 tsx 경로 해석으로 실행한다.
    // 생성 함수만 호출하며 서버·브라우저를 시작하거나 HTTP를 요청하지 않는다.
    const source = `globalThis.fetch = () => { throw new Error('Network forbidden in sitemap fixture'); };
      const sitemap = require('./src/app/sitemap.ts').default;
      const { GUIDE_CONTENT_REVISED: revisions } = require('./src/lib/guideContentRevisions.ts');
      const paths = new Set(Object.keys(revisions).map(slug => 'https://www.moneysalary.com/guides/' + slug));
      console.log(JSON.stringify(sitemap().filter(item => paths.has(item.url)).map(item => ({ url: item.url, date: item.lastModified }))));`;
    const rows = JSON.parse(execFileSync(process.execPath, ["--import", "tsx", "-e", source], {
      cwd: process.cwd(), encoding: "utf8", timeout: 15_000, maxBuffer: 1024 * 1024,
    })) as Array<{ url: string; date: string }>;
    expect(rows).toHaveLength(Object.keys(GUIDE_CONTENT_REVISED).length);
    for (const { url, date } of rows) {
      const guide = koGuides.find((item) => url.endsWith(`/guides/${item.slug}`))!;
      expect(date).toBe(expectedContentDate(guide));
    }
  }, 20_000);

  it.each(Object.keys(GUIDE_CONTENT_REVISED))("%s의 원발행일은 보존하고 내용 수정일은 일치시킨다", async (slug) => {
    const guide = koGuides.find((item) => item.slug === slug)!;
    const original = { publishedDate: guide.publishedDate, modifiedDate: guide.modifiedDate };
    const originalList = filterAndSortGuides(koGuides).map((item) => item.slug);
    const originalRelated = rankRelatedGuides(koGuides, { currentSlug: slug, category: guide.category, tags: guide.tags }).map((item) => item.slug);
    const expected = expectedContentDate(guide);
    const props = { params: Promise.resolve({ slug }) };
    const metadata = await generateMetadata(props);
    const html = renderToStaticMarkup(await GuidePage(props));
    const og = metadata.openGraph as { publishedTime?: string; modifiedTime?: string };
    expect(og.publishedTime).toBe(`${guide.publishedDate}T00:00:00.000Z`);
    expect(og.modifiedTime).toBe(`${expected}T00:00:00.000Z`);
    expect(metadata.alternates?.canonical).toBe(`https://www.moneysalary.com/guides/${slug}`);
    const visibleDates = [...html.matchAll(/<time\b[^>]*datetime="([^"]+)"/gi)].map((match) => match[1]);
    expect(visibleDates).toContain(guide.publishedDate);
    expect(visibleDates).toContain(expected);
    const visibleLastModified = html.match(/마지막 내용 수정:[\s\S]*?<time datetime="([^"]+)"/i);
    expect(visibleLastModified?.[1]).toBe(expected);
    const article = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)]
      .flatMap((match) => JSON.parse(match[1])).find((schema) => schema["@type"] === "Article");
    expect(article).toMatchObject({ datePublished: `${guide.publishedDate}T00:00:00.000Z`, dateModified: `${expected}T00:00:00.000Z` });
    expect({ publishedDate: guide.publishedDate, modifiedDate: guide.modifiedDate }).toEqual(original);
    expect(filterAndSortGuides(koGuides).map((item) => item.slug)).toEqual(originalList);
    expect(rankRelatedGuides(koGuides, { currentSlug: slug, category: guide.category, tags: guide.tags }).map((item) => item.slug)).toEqual(originalRelated);
  });
});

describe("R1 사이트맵 전용 10편 — 상세 화면·OG·Article 날짜는 운영 값 2026-10-03 그대로 (ads-01)", () => {
  it.each(R1_SITEMAP_ONLY_SLUGS)("%s: 수정 칩·하단 상자·OG·Article 은 2026-10-03 이고 2026-11-03 은 사이트맵 날짜에만 있다", async (slug) => {
    const guide = koGuides.find((item) => item.slug === slug)!;
    expect(GUIDE_CONTENT_REVISED[slug]).toBeUndefined();
    expect(guide.modifiedDate).toBe(R1_PRODUCTION_SCREEN_DATE);
    const props = { params: Promise.resolve({ slug }) };
    const metadata = await generateMetadata(props);
    const html = renderToStaticMarkup(await GuidePage(props));
    const og = metadata.openGraph as { publishedTime?: string; modifiedTime?: string };
    expect(og.publishedTime).toBe(`${guide.publishedDate}T00:00:00.000Z`);
    expect(og.modifiedTime).toBe(`${R1_PRODUCTION_SCREEN_DATE}T00:00:00.000Z`);
    // 히어로 '수정' 칩 — 첫 광고 위 글자. 운영과 글자까지 같아야 날짜 줄 폭이 같다.
    expect(html).toMatch(/수정 <time datetime="2026-10-03">2026\.10\.03<\/time>/i);
    // 하단 '마지막 내용 수정' 상자 — 날짜 속성과 보이는 글자 모두
    const visibleLastModified = html.match(/마지막 내용 수정:[\s\S]*?<time datetime="([^"]+)">([^<]*)<\/time>/i);
    expect(visibleLastModified?.[1]).toBe(R1_PRODUCTION_SCREEN_DATE);
    expect(visibleLastModified?.[2]).toBe("2026.10.03");
    const visibleDates = [...html.matchAll(/<time\b[^>]*datetime="([^"]+)"/gi)].map((match) => match[1]);
    expect(visibleDates).toContain(guide.publishedDate);
    expect(visibleDates).toContain(R1_PRODUCTION_SCREEN_DATE);
    expect(visibleDates).not.toContain(R1_LEDGER_DAY);
    const article = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)]
      .flatMap((match) => JSON.parse(match[1])).find((schema) => schema["@type"] === "Article");
    expect(article).toMatchObject({ datePublished: `${guide.publishedDate}T00:00:00.000Z`, dateModified: `${R1_PRODUCTION_SCREEN_DATE}T00:00:00.000Z` });
    // R1 원장일(뒤 묶음이 다시 고친 글은 그 묶음의 수정일)은 사이트맵 lastmod·rss.xml pubDate 에만 쓴다
    const sitemapDay = R1_LATER_SITEMAP_DAY[slug] ?? R1_LEDGER_DAY;
    expect(visibleDates).not.toContain(sitemapDay);
    expect(getGuideSitemapDate(guide)).toBe(sitemapDay);
  });
});
