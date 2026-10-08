// 새 가이드 공개 보류(guideReleaseHoldback.ts) 회귀 가드 — R4, 2026-09-26.
// 보류 중인 새 가이드는 기존 페이지의 자동 목록(관련 글·허브·메인 편집 추천)에 들어가지 않고,
// 새 가이드 페이지끼리는 서로 추천된다. 보류 목록이 비면(운영자 승인 후 해제) 이 테스트도 그대로 통과한다.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { getRelatedGuides } from "@/lib/relatedGuides";
import { rankRelatedGuides } from "@/lib/guideDiscovery";
import { getCalcRelatedGuideSlugs, SALARY_PAGE_GUIDES } from "@/lib/crossLink";
import { getAllSlugs } from "@/lib/simpleCalculators";
import {
  RELEASE_HOLDBACK_SLUGS,
  isReleaseHeldBack,
  withoutHeldBackGuides,
} from "@/lib/guideReleaseHoldback";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8").replace(/\s+/g, " ");
const held = (slugs: string[]) => slugs.filter((s) => RELEASE_HOLDBACK_SLUGS.has(s));

describe("withoutHeldBackGuides", () => {
  const sample = [{ slug: "old-a" }, { slug: "lotto-prize-tax" }, { slug: "old-b" }];

  it("기존 페이지 후보에서는 보류 가이드를 뺀다", () => {
    expect(withoutHeldBackGuides(sample).map((g) => g.slug)).toEqual(["old-a", "old-b"]);
    expect(withoutHeldBackGuides(sample, "old-a").map((g) => g.slug)).toEqual(["old-a", "old-b"]);
  });

  it("보류 가이드 자신의 페이지에서는 후보를 그대로 둔다 (새 가이드끼리 서로 추천)", () => {
    expect(withoutHeldBackGuides(sample, "lotto-prize-tax").map((g) => g.slug)).toEqual(["old-a", "lotto-prize-tax", "old-b"]);
    expect(isReleaseHeldBack("lotto-prize-tax")).toBe(true);
    expect(isReleaseHeldBack("old-a")).toBe(false);
  });
});

describe("기존 페이지의 자동 목록에 보류 가이드가 없다", () => {
  const existing = koGuides.filter((g) => !isReleaseHeldBack(g.slug));

  it("가이드 상세 관련 글 3편(page.tsx 와 같은 호출)과 6편", () => {
    for (const g of existing) {
      const top3 = rankRelatedGuides(withoutHeldBackGuides(koGuides, g.slug), {
        currentSlug: g.slug, category: g.category, tags: g.tags,
      }).slice(0, 3).map((x) => x.slug);
      expect(held(top3), g.slug).toEqual([]);
      const six = getRelatedGuides({ currentSlug: g.slug, category: g.category, tags: g.tags, limit: 6 }).map((x) => x.slug);
      expect(held(six), g.slug).toEqual([]);
    }
  });

  it("/calc/[slug] 함께 볼 가이드 3편과 /salary/[amount] 4편 (명시 연결 제외)", () => {
    for (const slug of getAllSlugs()) {
      const explicit = new Set(getCalcRelatedGuideSlugs(slug));
      const items = getRelatedGuides({ currentSlug: `__calc-${slug}`, explicitSlugs: [...explicit], limit: 3 })
        .map((x) => x.slug).filter((s) => !explicit.has(s));
      expect(held(items), slug).toEqual([]);
    }
    const salary = getRelatedGuides({ currentSlug: "__salary-x", explicitSlugs: SALARY_PAGE_GUIDES, limit: 4 })
      .map((x) => x.slug).filter((s) => !SALARY_PAGE_GUIDES.includes(s));
    expect(held(salary)).toEqual([]);
  });

  it("가이드 상세·허브·/guides 목록·메인 편집 추천이 보류 목록을 거친다 (소스 스캔)", () => {
    expect(read("src/app/guides/[slug]/page.tsx")).toContain("rankRelatedGuides(withoutHeldBackGuides(koGuides, guide.slug), {");
    expect(read("src/lib/relatedGuides.ts")).toContain("rankRelatedGuides(withoutHeldBackGuides(koGuides, currentSlug), {");
    for (const p of ["src/app/guides/category/[slug]/page.tsx", "src/components/FeaturedGuides.tsx", "src/app/guides/page.tsx"]) {
      const src = read(p);
      expect(src, p).toContain("koGuideCards as allKoGuideCards");
      expect(src, p).toContain("const koGuideCards = withoutHeldBackGuides(allKoGuideCards);");
    }
  });
});

describe("보류 가이드 페이지 자신은 제한 없이 추천받는다", () => {
  it("보류 가이드가 있으면 그 페이지의 후보는 전체 목록이다", () => {
    for (const g of koGuides.filter((x) => isReleaseHeldBack(x.slug))) {
      expect(withoutHeldBackGuides(koGuides, g.slug).length).toBe(koGuides.length);
    }
  });
});
