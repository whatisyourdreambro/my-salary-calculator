import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { glossaryData, getRelatedGlossaryItems, toGlossarySlug } from "@/data/glossaryData";
import { qnaData, getRelatedQna, toQnaSlug } from "@/data/qnaData";
import { qnaTopicScore } from "@/lib/qnaRelatedTopics";
import { buildRelatedContentGraph, categoryNeighbours } from "@/lib/relatedContentGraph";
import { koGuides } from "@/lib/guidesContent";
import { getRelatedGuides } from "@/lib/relatedGuides";
import { rankRelatedGuides } from "@/lib/guideDiscovery";
import { isReleaseHeldBack, withoutHeldBackGuides } from "@/lib/guideReleaseHoldback";

vi.mock("@/components/AppLink", () => ({ default: ({ children, href, ...props }: { children: ReactNode; href: string }) =>
  createElement("a", { href, ...props }, children) }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("span", { "data-slot": "coupang" }) }));
vi.mock("@/components/AdPlacement", () => Object.fromEntries(
  ["HomeTopAd", "InArticleAd", "GuideMidAd", "CalcResultAd", "MultiplexAd"]
    .map((name) => [name, () => createElement("span", { "data-slot": name })]),
));
import GlossaryPage from "@/app/glossary/[slug]/page";
import QnaPage from "@/app/qna/[slug]/page";

function incoming<T>(items: readonly T[], id: (item: T) => string, related: (item: T) => readonly T[]) {
  const graph = new Map(items.map((item) => [id(item), new Set<string>()]));
  for (const source of items) for (const target of related(source)) {
    expect(id(target)).not.toBe(id(source));
    graph.get(id(target))?.add(id(source));
  }
  return graph;
}

describe("fixed-size, relevant incoming discovery paths", () => {
  it("every glossary term receives at least three same-category sources without adding cards", () => {
    const graph = incoming(glossaryData, (item) => item.title, getRelatedGlossaryItems);
    for (const item of glossaryData) {
      const related = getRelatedGlossaryItems(item);
      const previousCount = Math.min(5, glossaryData.filter((g) => g !== item && g.category === item.category).length);
      expect(related, item.title).toHaveLength(previousCount);
      expect(new Set(related).size).toBe(related.length);
      expect(related.every((g) => g.category === item.category)).toBe(true);
      expect(graph.get(item.title)!.size, item.title).toBeGreaterThanOrEqual(3);
    }
    const term = glossaryData.find((g) => g.title === "원리금균등상환")!;
    expect(getRelatedGlossaryItems(term).map((g) => g.title)).toContain("원금균등상환");
    const paired = glossaryData.find((g) => g.title === "원금균등상환")!;
    expect(getRelatedGlossaryItems(paired)).toContain(term);
  });

  it("Q&A preserves each prior 0–4 card count, and every question has three relevant source pages", () => {
    const graph = incoming(qnaData, (item) => item.question, getRelatedQna);
    for (const item of qnaData) {
      const related = getRelatedQna(item);
      const previousCount = Math.min(4, qnaData.filter((q) => q !== item && q.category === item.category).length);
      expect(related, item.question).toHaveLength(previousCount);
      expect(new Set(related).size).toBe(related.length);
      expect(related.every((q) => qnaTopicScore(item, q) > 0)).toBe(true);
      expect(graph.get(item.question)!.size, item.question).toBeGreaterThanOrEqual(3);
    }
    const medical = qnaData.find((q) => q.question.startsWith("본인부담상한제"))!;
    expect(getRelatedQna(medical)).toEqual([]); // no new block or ad
    expect([...graph.get(medical.question)!].every((source) => /보험/.test(source))).toBe(true);
  });

  it("does not equate a savings product's name with a tax deduction or childcare topic", () => {
    const medical = qnaData.find((q) => q.question.startsWith("부모님 의료비"))!;
    const youth = qnaData.find((q) => q.question.startsWith("청년내일채움공제"))!;
    const savings = qnaData.find((q) => q.question.startsWith("청년도약계좌"))!;
    const leave = qnaData.find((q) => q.question.startsWith("출산휴가"))!;
    expect(qnaTopicScore(medical, youth)).toBe(0);
    expect(qnaTopicScore(savings, leave)).toBe(0);
  });

  it("public KO guide recommendations preserve the top three and six remaining cards, holdbacks and topic relevance", () => {
    const publicGuides = withoutHeldBackGuides(koGuides);
    const graph = new Map(publicGuides.map((g) => [g.slug, new Set<string>()]));
    for (const guide of publicGuides) {
      const top = rankRelatedGuides(publicGuides, { currentSlug: guide.slug, category: guide.category, tags: guide.tags }).slice(0, 3);
      const bottom = getRelatedGuides({ currentSlug: guide.slug, category: guide.category, tags: guide.tags,
        limit: 6, excludeSlugs: top.map((g) => g.slug) });
      expect(bottom, guide.slug).toHaveLength(6);
      expect(new Set([...top, ...bottom].map((g) => g.slug)).size).toBe(9);
      for (const target of [...top, ...bottom]) {
        expect(target.slug).not.toBe(guide.slug); expect(isReleaseHeldBack(target.slug)).toBe(false);
        graph.get(target.slug)?.add(guide.slug);
      }
      for (const target of bottom) {
        const full = publicGuides.find((g) => g.slug === target.slug)!;
        const tags = new Set(guide.tags.map((tag) => tag.toLocaleLowerCase()).filter((tag) => !/^\d{4}(?:년)?$/.test(tag)));
        expect(full.category === guide.category || full.tags.some((tag) => tags.has(tag.toLocaleLowerCase()))).toBe(true);
        expect(target).not.toHaveProperty("content");
      }
    }
    for (const [slug, sources] of graph) expect(sources.size, slug).toBeGreaterThanOrEqual(3);
  });
});

describe("actual detail-page SSR retains links inside content and existing ad presence", () => {
  it("renders glossary neighbours as ordinary links between the existing ad and banner", async () => {
    const item = glossaryData.find((g) => g.title === "분산투자")!;
    const html = renderToStaticMarkup(await GlossaryPage({ params: Promise.resolve({ slug: toGlossarySlug(item.title) }) }));
    expect(html.startsWith("<main")).toBe(true);
    const related = getRelatedGlossaryItems(item);
    for (const target of related) expect(html).toContain(`href="/glossary/${toGlossarySlug(target.title)}"`);
    const firstLink = html.indexOf(`href="/glossary/${toGlossarySlug(related[0].title)}"`);
    expect(html.indexOf('data-slot="CalcResultAd"')).toBeLessThan(firstLink);
    expect(firstLink).toBeLessThan(html.indexOf('data-slot="coupang"'));
  });

  it.each(["주 52시간제", "본인부담상한제"])("renders %s with its original recommendation/ad count", async (prefix) => {
    const item = qnaData.find((q) => q.question.startsWith(prefix))!;
    const html = renderToStaticMarkup(await QnaPage({ params: Promise.resolve({ slug: toQnaSlug(item.question) }) }));
    expect(html.startsWith("<main")).toBe(true);
    const related = getRelatedQna(item);
    for (const target of related) expect(html).toContain(`href="/qna/${toQnaSlug(target.question)}"`);
    expect(html.includes('data-slot="CalcResultAd"')).toBe(related.length > 0);
    expect(html.includes("함께 알아두면 좋은 질문")).toBe(related.length > 0);
  });
});

describe("discovery graph boundaries", () => {
  it("does not consult locale collation for ID tie-breakers", () => {
    const items = ["가", "z-1", "A", "0", "나", "a_1"].map((id) => ({ id }));
    const comparator = vi.spyOn(String.prototype, "localeCompare").mockImplementation(() => {
      throw new Error("Implicit locale collation would change deployment output");
    });
    let graph: Map<string, { id: string }[]>;
    try {
      graph = buildRelatedContentGraph(items, { id: item => item.id, limit: () => 3, score: () => 1 });
    } finally { comparator.mockRestore(); }
    expect([...graph.keys()]).toEqual(["0", "A", "a_1", "z-1", "가", "나"]);
  });

  it.each(["ko-KR", "en-US"])("all actual Q&A recommendations are identical under %s and reordered inputs", (locale) => {
    const options = { id: (q: typeof qnaData[number]) => toQnaSlug(q.question),
      limit: (q: typeof qnaData[number]) => Math.min(4, qnaData.filter(peer => peer !== q && peer.category === q.category).length),
      score: qnaTopicScore };
    const expected = buildRelatedContentGraph(qnaData, options);
    const collator = new Intl.Collator(locale);
    const comparator = vi.spyOn(String.prototype, "localeCompare").mockImplementation(function (this: string, other) {
      return collator.compare(String(this), String(other));
    });
    const graphs: typeof expected[] = [];
    let calls = 0;
    try {
      for (const items of [qnaData, [...qnaData].reverse(), [...qnaData.slice(17), ...qnaData.slice(0, 17)]]) {
        graphs.push(buildRelatedContentGraph(items, options));
      }
      calls = comparator.mock.calls.length;
    } finally { comparator.mockRestore(); }
    expect(calls).toBe(0);
    for (const graph of graphs) expect(graph).toEqual(expected);
    const incoming = new Map(qnaData.map(q => [toQnaSlug(q.question), new Set<string>()]));
    for (const [source, targets] of expected) for (const target of targets) incoming.get(toQnaSlug(target.question))!.add(source);
    for (const [target, sources] of incoming) expect(sources.size, target).toBeGreaterThanOrEqual(3);
  });

  it("never fills sparse topics with unrelated entries or includes itself", () => {
    const items = [{ id: "a", topic: 1 }, { id: "b", topic: 1 }, { id: "c", topic: 2 }];
    const result = buildRelatedContentGraph(items, { id: (x) => x.id, limit: () => 4,
      score: (a, b) => a.topic === b.topic ? 1 : 0 });
    expect(result.get("a")).toEqual([items[1]]);
    expect(result.get("b")).toEqual([items[0]]);
    expect(result.get("c")).toEqual([]);
    expect(categoryNeighbours(items, { id: "missing", topic: 1 }, 3)).toEqual([]);
  });

  it("is deterministic under input order changes and keeps primary targets out of secondary cards", () => {
    const items = Array.from({ length: 6 }, (_, index) => ({ id: String(index) }));
    const options = { id: (x: { id: string }) => x.id, limit: () => 3, score: () => 1,
      existing: (x: { id: string }) => [String((Number(x.id) + 1) % 6)] };
    expect(buildRelatedContentGraph(items, options)).toEqual(buildRelatedContentGraph([...items].reverse(), options));
    for (const [id, peers] of buildRelatedContentGraph(items, options)) {
      expect(peers).toHaveLength(3);
      expect(peers.map((x) => x.id)).not.toContain(String((Number(id) + 1) % 6));
    }
  });
});
