// 가이드 탐색 기준: 목록은 발행일, 관련 글은 같은 주제·태그 다음 발행일.
// 출처와 집계 기간이 없는 legacy views 값은 표시·추천에 사용하지 않는다.
export type GuideSortOrder = "latest" | "oldest";

type DatedGuide = { slug: string; publishedDate: string };
type SearchableGuide = DatedGuide & {
  title: string;
  description: string;
  category: string;
  tags: string[];
};

export function compareGuideDates(a: DatedGuide, b: DatedGuide): number {
  return b.publishedDate.localeCompare(a.publishedDate) || a.slug.localeCompare(b.slug);
}

export function filterAndSortGuides<T extends SearchableGuide>(
  guides: readonly T[],
  { query = "", category = "all", order = "latest" }: {
    query?: string;
    category?: string;
    order?: GuideSortOrder;
  } = {},
): T[] {
  const normalized = query.trim().toLocaleLowerCase();
  return guides.filter((guide) =>
    (category === "all" || guide.category === category) &&
    (!normalized || [guide.title, guide.description, ...guide.tags]
      .some((value) => value.toLocaleLowerCase().includes(normalized))),
  ).sort((a, b) => order === "oldest"
    ? a.publishedDate.localeCompare(b.publishedDate) || a.slug.localeCompare(b.slug)
    : compareGuideDates(a, b));
}

export function rankRelatedGuides<T extends SearchableGuide>(
  guides: readonly T[],
  { currentSlug, category, tags = [] }: {
    currentSlug: string;
    category?: string;
    tags?: string[];
  },
): T[] {
  const currentTags = new Set(tags.map((tag) => tag.toLocaleLowerCase()));
  const score = (guide: T) =>
    (guide.category === category ? 10 : 0) +
    guide.tags.filter((tag) => currentTags.has(tag.toLocaleLowerCase())).length * 3;
  return guides.filter((guide) => guide.slug !== currentSlug)
    .sort((a, b) => score(b) - score(a) || compareGuideDates(a, b));
}

export function readGuideSearchQuery(params: Pick<URLSearchParams, "get">): string {
  return (params.get("q") ?? "").trim();
}

export function isGuideSearchVariant(
  pathname: string,
  params: Pick<URLSearchParams, "get">,
): boolean {
  const path = pathname.replace(/\/$/, "");
  return (path === "/guides" || path === "/en/guides") &&
    readGuideSearchQuery(params).length > 0;
}

export function guideSearchHref(query: string, lang: "ko" | "en" = "ko"): string {
  const path = lang === "en" ? "/en/guides" : "/guides";
  const value = query.trim();
  return value ? `${path}?${new URLSearchParams({ q: value })}` : path;
}
