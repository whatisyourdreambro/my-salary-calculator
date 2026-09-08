import { describe, expect, it } from "vitest";
import {
  filterAndSortGuides,
  guideSearchHref,
  isGuideSearchVariant,
  rankRelatedGuides,
  readGuideSearchQuery,
} from "@/lib/guideDiscovery";

const guides = [
  { slug: "old", title: "연봉 협상", description: "직장인 급여", category: "salary", tags: ["협상"], publishedDate: "2026-01-01", views: 999999 },
  { slug: "new", title: "Tax Saving", description: "IRP 공제 안내", category: "tax", tags: ["ISA", "Tax"], publishedDate: "2026-09-01", views: 0 },
  { slug: "related", title: "절세", description: "연금 공제", category: "tax", tags: ["ISA"], publishedDate: "2026-08-01", views: 1 },
];

describe("가이드 검색과 편집 정렬", () => {
  it("목록은 조회수와 관계없이 발행일 순이며 원본 배열을 변경하지 않는다", () => {
    expect(filterAndSortGuides(guides).map((g) => g.slug)).toEqual(["new", "related", "old"]);
    expect(filterAndSortGuides(guides, { order: "oldest" }).map((g) => g.slug)).toEqual(["old", "related", "new"]);
    expect(guides.map((g) => g.slug)).toEqual(["old", "new", "related"]);
  });

  it.each([
    ["  연봉  ", ["old"]],
    ["tAX", ["new"]],
    ["irp", ["new"]],
    ["isa", ["new", "related"]],
    ["   ", ["new", "related", "old"]],
    ["not-found", []],
  ])("제목·설명·태그에서 검색한다: %s", (query, slugs) => {
    expect(filterAndSortGuides(guides, { query }).map((g) => g.slug)).toEqual(slugs);
  });

  it("카테고리와 검색 조건을 함께 적용하고 최신 글도 일반 목록에 남긴다", () => {
    expect(filterAndSortGuides(guides, { category: "tax", query: "isa" }).map((g) => g.slug)).toEqual(["new", "related"]);
    expect(filterAndSortGuides(guides, { category: "salary", query: "isa" })).toEqual([]);
  });

  it("관련 글은 현재 글을 제외하고 주제·태그 관련성을 조회수보다 우선한다", () => {
    const ranked = rankRelatedGuides(guides, { currentSlug: "new", category: "tax", tags: ["isa"] });
    expect(ranked.map((g) => g.slug)).toEqual(["related", "old"]);
  });

  it("같은 관련성은 최신 발행일, 같은 날짜는 slug 순서로 안정적으로 정렬한다", () => {
    const tied = [guides[0], { ...guides[0], slug: "another" }, { ...guides[0], slug: "newer", publishedDate: "2026-02-01", views: 0 }];
    expect(rankRelatedGuides(tied, { currentSlug: "other" }).map((g) => g.slug)).toEqual(["newer", "another", "old"]);
  });

  it("수정된 기존 글은 발행일을 보존하면서 최신 목록·추천에 반영된다", () => {
    const updated = { ...guides[0], modifiedDate: "2026-09-09" };
    const input = [updated, guides[1], guides[2]];
    expect(filterAndSortGuides(input).map((guide) => guide.slug)).toEqual(["old", "new", "related"]);
    expect(filterAndSortGuides(input, { order: "oldest" }).map((guide) => guide.slug)).toEqual(["related", "new", "old"]);
    expect(rankRelatedGuides(input, { currentSlug: "none" }).map((guide) => guide.slug)).toEqual(["old", "new", "related"]);
    expect(updated.publishedDate).toBe("2026-01-01");
  });
});

describe("검색 URL 범위와 안전한 태그 링크", () => {
  it.each(["/guides", "/en/guides", "/guides/", "/en/guides/"])("내용 있는 q만 검색 변형이다: %s", (path) => {
    expect(isGuideSearchVariant(path, new URLSearchParams({ q: "  세금  " }))).toBe(true);
    expect(isGuideSearchVariant(path, new URLSearchParams({ q: "   " }))).toBe(false);
    expect(isGuideSearchVariant(path, new URLSearchParams({ q: "" }))).toBe(false);
    expect(isGuideSearchVariant(path, new URLSearchParams({ category: "tax" }))).toBe(false);
  });

  it.each(["/guides/tax", "/en/guides/tax", "/guides/category/tax", "/salary-db"])("고유 글·다른 허브는 검색 색인 정책에 포함하지 않는다: %s", (path) => {
    expect(isGuideSearchVariant(path, new URLSearchParams({ q: "tax" }))).toBe(false);
  });

  it.each(["ko", "en"] as const)("특수문자 태그는 하나의 q 값으로 왕복한다: %s", (lang) => {
    const tag = "세금 & ISA+#? = tax";
    const url = new URL(guideSearchHref(tag, lang), "https://www.moneysalary.com");
    expect(url.pathname).toBe(lang === "en" ? "/en/guides" : "/guides");
    expect([...url.searchParams.keys()]).toEqual(["q"]);
    expect(readGuideSearchQuery(url.searchParams)).toBe(tag);
    expect(url.hash).toBe("");
    expect(guideSearchHref(" ", lang)).toBe(url.pathname);
  });

  it("중복 q는 화면과 응답 모두 첫 값을 사용한다", () => {
    const params = new URLSearchParams("q=&q=tax");
    expect(readGuideSearchQuery(params)).toBe("");
    expect(isGuideSearchVariant("/guides", params)).toBe(false);
  });
});
