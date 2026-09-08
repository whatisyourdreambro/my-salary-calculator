import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Guide, GuideCardMeta } from "@/lib/guidesData";

// 광고·공유의 브라우저 효과는 분리하고 실제 가이드 HTML을 렌더한다.
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  GuideMidAd: () => null, HomeTopAd: () => null, InArticleAd: () => null,
  MultiplexAd: () => null, SidebarAd: () => null,
}));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/components/guides/TableOfContents", () => ({ default: () => null }));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

import GuidesListClient from "@/app/guides/GuidesListClient";
import EnglishGuidesClient from "@/app/en/guides/EnglishGuidesClient";
import GuidePageClient from "@/app/guides/[slug]/GuidePageClient";
import EnglishGuideClient from "@/app/en/guides/[slug]/EnglishGuideClient";
import GuideCategories from "@/components/GuideCategories";

const cards: GuideCardMeta[] = [
  { slug: "new-guide", title: "최신 가이드", description: "검색 설명", category: "세금", tags: ["세금"], level: "초급", publishedDate: "2026-09-01", views: 0, contentChars: 2000 },
  { slug: "old-guide", title: "이전 가이드", description: "검색 설명", category: "세금", tags: ["세금"], level: "초급", publishedDate: "2026-01-01", views: 987654321, contentChars: 2000 },
];

describe("가이드 정적 HTML과 탐색 링크", () => {
  it.each(["ko", "en"])("최신 글도 모바일 공용 카드에 있으며 가짜 인기 지표가 없다: %s", (lang) => {
    const categories = [{ id: "all", name: "All" }, { id: "세금", name: "Tax" }];
    const html = renderToStaticMarkup(lang === "ko"
      ? createElement(GuidesListClient, { guides: cards, categories })
      : createElement(EnglishGuidesClient, { guides: cards, categoriesEn: categories }));
    expect(html).toContain("<h1");
    // Hero는 h2, 모바일에서도 보이는 공용 카드는 h3이다.
    const cardTitles = [...html.matchAll(/<h3\b[^>]*>(.*?)<\/h3>/g)].map((match) => match[1]);
    expect(cardTitles).toEqual(["최신 가이드", "이전 가이드"]);
    expect(html).toContain(lang === "ko" ? 'aria-label="가이드 키워드 검색"' : 'aria-label="Search guide keywords"');
    expect(html).not.toMatch(/인기순|Popular|987,?654,?321/);
  });

  it.each(["ko", "en"])("글 본문·태그 링크는 HTML에 남고 출처 없는 조회수는 노출하지 않는다: %s", (lang) => {
    const guide: Guide = {
      ...cards[1], tags: ["세금 & ISA"], content: "<h2>가이드 본문</h2><p>출처를 확인할 안내 내용</p>",
    };
    const html = renderToStaticMarkup(lang === "ko"
      ? createElement(GuidePageClient, { guide, relatedGuides: [] })
      : createElement(EnglishGuideClient, { guide, relatedGuides: [] }));
    expect(html).toContain("가이드 본문");
    expect(html).not.toMatch(/987,?654,?321|조회수|views/i);
    const prefix = lang === "ko" ? "/guides" : "/en/guides";
    const tagAnchor = html.match(new RegExp(`<a\\b[^>]*href="${prefix}\\?q=[^"]*"[^>]*>`))?.[0];
    expect(tagAnchor).toContain('rel="nofollow"');
    expect(tagAnchor).toContain("%26");
  });

  it("카테고리 정규 허브는 일반 링크를 유지한다", () => {
    const html = renderToStaticMarkup(createElement(GuideCategories));
    const anchors = [...html.matchAll(/<a\b[^>]*href="\/guides\/category\/[^"]*"[^>]*>/g)].map((match) => match[0]);
    expect(anchors.length).toBeGreaterThan(0);
    expect(anchors.every((anchor) => !anchor.includes('rel="nofollow"'))).toBe(true);
  });

  it.each(["ko", "en"])("발행일과 수정일을 구분하고 실제 수정일을 카드·본문에 표시한다: %s", (lang) => {
    const guide: Guide = { ...cards[1], modifiedDate: "2026-09-09", content: "<h2>수정한 본문</h2>" };
    const detail = renderToStaticMarkup(lang === "ko"
      ? createElement(GuidePageClient, { guide, relatedGuides: [] })
      : createElement(EnglishGuideClient, { guide, relatedGuides: [] }));
    expect(detail).toMatch(/<time datetime="2026-01-01"/i);
    expect(detail).toMatch(/<time datetime="2026-09-09"/i);
    expect(detail).toContain(lang === "ko" ? "발행 " : "Published ");
    expect(detail).toContain(lang === "ko" ? "수정 " : "Updated ");
    const categories = [{ id: "all", name: "All" }];
    const updatedCard: GuideCardMeta = { ...guide, contentChars: 2000 };
    const list = renderToStaticMarkup(lang === "ko"
      ? createElement(GuidesListClient, { guides: [cards[0], updatedCard], categories })
      : createElement(EnglishGuidesClient, { guides: [cards[0], updatedCard], categoriesEn: categories }));
    const titles = [...list.matchAll(/<h3\b[^>]*>(.*?)<\/h3>/g)].map((match) => match[1]);
    expect(titles).toEqual(["이전 가이드", "최신 가이드"]);
    expect(list).toMatch(/<time datetime="2026-09-09"/i);
    expect(list).toContain(lang === "ko" ? "수정 " : "Updated ");
  });
});
