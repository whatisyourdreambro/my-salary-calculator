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
import { GUIDE_CONTENT_REVISED_TWO_HOME_LAW } from "@/lib/guideContentRevisions.twoHomeLaw";
import { TWO_HOME_LAW_FIX_PUSH } from "@/config/twoHomeLawFixPush";

describe("검증된 가이드 보강일의 상세 화면·검색 메타 정합성", () => {
  it("실제 sitemap 함수도 같은 4편의 내용 수정일을 출력한다", () => {
    // sitemap의 지연 require(@/...)를 앱과 같은 tsx 경로 해석으로 실행한다.
    // 생성 함수만 호출하며 서버·브라우저를 시작하거나 HTTP를 요청하지 않는다.
    const source = `globalThis.fetch = () => { throw new Error('Network forbidden in sitemap fixture'); };
      const sitemap = require('./src/app/sitemap.ts').default;
      const { GUIDE_CONTENT_REVISED_TWO_HOME_LAW: revisions } = require('./src/lib/guideContentRevisions.twoHomeLaw.ts');
      const paths = new Set(Object.keys(revisions).map(slug => 'https://www.moneysalary.com/guides/' + slug));
      console.log(JSON.stringify(sitemap().filter(item => paths.has(item.url)).map(item => ({ url: item.url, date: item.lastModified.toISOString().slice(0, 10) }))));`;
    const rows = JSON.parse(execFileSync(process.execPath, ["--import", "tsx", "-e", source], {
      cwd: process.cwd(), encoding: "utf8", timeout: 15_000, maxBuffer: 1024 * 1024,
    })) as Array<{ url: string; date: string }>;
    expect(rows).toHaveLength(4);
    for (const { url, date } of rows) {
      const guide = koGuides.find((item) => url.endsWith(`/guides/${item.slug}`))!;
      expect(date).toBe([getGuideModifiedDate(guide), TWO_HOME_LAW_FIX_PUSH].sort().at(-1));
    }
  }, 20_000);

  it.each(Object.keys(GUIDE_CONTENT_REVISED_TWO_HOME_LAW))("%s의 원발행일은 보존하고 내용 수정일은 일치시킨다", async (slug) => {
    const guide = koGuides.find((item) => item.slug === slug)!;
    const original = { publishedDate: guide.publishedDate, modifiedDate: guide.modifiedDate };
    const originalList = filterAndSortGuides(koGuides).map((item) => item.slug);
    const originalRelated = rankRelatedGuides(koGuides, { currentSlug: slug, category: guide.category, tags: guide.tags }).map((item) => item.slug);
    const expected = [getGuideModifiedDate(guide), TWO_HOME_LAW_FIX_PUSH].sort().at(-1)!;
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
