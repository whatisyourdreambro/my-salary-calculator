import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { getGuideRelatedCalcs, STATIC_CALC_CARDS } from "@/lib/crossLink";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { getGuidePrimaryCalculator, GUIDE_PRIMARY_CALCULATOR_SLUGS } from "@/lib/guidePrimaryCalculator";
import { getRelatedGuides } from "@/lib/relatedGuides";
import { rankRelatedGuides } from "@/lib/guideDiscovery";
import { isReleaseHeldBack, withoutHeldBackGuides } from "@/lib/guideReleaseHoldback";

const capture = vi.hoisted(() => ({ top: [] as string[], bottom: [] as string[], calculator: {} as { name?: string; href?: string } }));
vi.mock("@/app/guides/[slug]/GuidePageClient", () => ({
  default: (props: { relatedGuides: { slug: string }[]; relatedCalculator: { name: string; href: string } }) => {
    capture.top = props.relatedGuides.map(({ slug }) => slug);
    capture.calculator = props.relatedCalculator;
    return createElement("span", { "data-section": "guide-client" });
  },
}));
vi.mock("@/components/RelatedGuides", () => ({ default: (props: { items: { slug: string }[] }) => {
  capture.bottom = props.items.map(({ slug }) => slug);
  return createElement("span", { "data-section": "bottom-guides" });
} }));
vi.mock("@/components/GuideRelatedCalcs", () => ({ default: () => createElement("span", { "data-section": "related-calcs" }) }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("span", { "data-section": "result-ad" }),
  HomeTopAd: () => createElement("span", { "data-section": "home-ad" }),
}));
import GuidePage from "@/app/guides/[slug]/page";

describe("가이드 대표 계산기의 편집 의도", () => {
  it.each([
    ["samsung-ds-special-bonus-details-oct-2026", "/calc/samsung-bonus"],
    ["sk-hynix-ps-forecast-2027", "/calc/sk-hynix-bonus"],
    ["samsung-vs-sk-hynix-stock-bonus-2026", "/calc/bonus-calculators"],
    ["year-end-tax-2026", "/year-end-tax"],
    ["severance-pay-guide", "/tools/finance/severance"],
    ["isa-vs-pension-savings", "/tools/finance/compound"],
    ["annual-leave-allowance", "/calc/vacation-pay"],
    ["first-home-buyer-loan", "/calc/mortgage-monthly-quick"],
    ["etf-portfolio-2026", "/calc/portfolio-allocation"],
    ["capital-gains-tax-stock", "/calc/stock-capital-gains-quick"],
    ["auto-loan-vs-lease-2026", "/car-loan"],
    ["donation-tax-credit", "/donation-tax-credit-2026"],
    ["job-change-salary-jump-2026", "/calc/offer-compare"],
  ])("%s는 주제에 맞는 도구 %s를 선택한다", (slug, href) => {
    const guide = koGuides.find((g) => g.slug === slug);
    expect(guide).toBeDefined();
    expect(getGuidePrimaryCalculator(guide!)).toMatchObject({ href });
  });

  it("모든 명시 선택은 실존 글·crossLink 연결·계산기 정본과 일치한다", () => {
    for (const [guideSlug, calcSlug] of Object.entries(GUIDE_PRIMARY_CALCULATOR_SLUGS)) {
      const guide = koGuides.find((g) => g.slug === guideSlug);
      expect(guide, guideSlug).toBeDefined();
      expect(getGuideRelatedCalcs(guideSlug), guideSlug).toContain(calcSlug);
      const card = STATIC_CALC_CARDS[calcSlug] ?? getCalculatorBySlug(calcSlug);
      expect(card, calcSlug).toBeDefined();
      expect(getGuidePrimaryCalculator(guide!)).toEqual({
        name: card!.title, href: STATIC_CALC_CARDS[calcSlug]?.href ?? `/calc/${calcSlug}`,
      });
    }
  });

  it("모든 현재 글의 목적지는 실제 정적 페이지나 등록된 계산기다", () => {
    for (const guide of koGuides) {
      const link = getGuidePrimaryCalculator(guide);
      expect(Object.keys(link).sort()).toEqual(["href", "name"]);
      const staticPage = resolve(process.cwd(), "src/app", link.href.slice(1), "page.tsx");
      const dynamicCalc = /^\/calc\/([^/]+)$/.exec(link.href)?.[1];
      expect(existsSync(staticPage) || Boolean(dynamicCalc && getCalculatorBySlug(dynamicCalc)), `${guide.slug}: ${link.href}`).toBe(true);
    }
  });

  it.each([
    ["부동산", "/home-loan"], ["투자", "/tools/finance/compound"], ["주식", "/calc/stock-pl-quick"],
  ])("개별 매핑이 없는 %s 글도 해당 분야 도구로 연결한다", (category, href) => {
    expect(getGuidePrimaryCalculator({ slug: "unmapped-guide", category }).href).toBe(href);
  });

  it("클라이언트에는 작은 링크 prop만 전달하고 기존 위임 클릭 계측 한 개를 쓴다", () => {
    const source = readFileSync(resolve(process.cwd(), "src/app/guides/[slug]/GuidePageClient.tsx"), "utf8");
    expect(source).toContain('import type { GuideCalculatorLink }');
    expect(source).not.toMatch(/from ["']@\/lib\/(?:crossLink|simpleCalculators)["']/);
    expect(source.match(/data-msy-module="guide-primary-calculator"/g)).toHaveLength(1);
    expect(source).not.toContain("trackGuideCTAClick(");
    expect(source).not.toContain("onClick=");
  });
});

describe("상단 3개·하단 6개 관련 글", () => {
  it("현재 모든 글에서 아홉 개를 중복 없이 채우며 공개 보류 정책을 유지한다", () => {
    for (const guide of koGuides) {
      const top = rankRelatedGuides(withoutHeldBackGuides(koGuides, guide.slug), {
        currentSlug: guide.slug, category: guide.category, tags: guide.tags,
      }).slice(0, 3).map((g) => g.slug);
      const bottom = getRelatedGuides({ currentSlug: guide.slug, category: guide.category, tags: guide.tags, excludeSlugs: top, limit: 6 });
      const slugs = [...top, ...bottom.map((g) => g.slug)];
      expect(top, guide.slug).toHaveLength(3);
      expect(bottom, guide.slug).toHaveLength(6);
      expect(new Set(slugs).size, guide.slug).toBe(9);
      expect(slugs).not.toContain(guide.slug);
      if (!isReleaseHeldBack(guide.slug)) expect(slugs.some(isReleaseHeldBack), guide.slug).toBe(false);
      expect(bottom.every((g) => !("content" in g))).toBe(true);
    }
  });

  it("명시 추천과 자동 추천 양쪽에서 제외한 뒤 부족분을 채운다", () => {
    const excluded = ["salary-guide-2026", "year-end-tax-2026"];
    const result = getRelatedGuides({ currentSlug: "annual-leave-allowance", explicitSlugs: [...excluded, "bonus-tax-rate"], excludeSlugs: excluded, limit: 6 });
    expect(result).toHaveLength(6);
    expect(result[0].slug).toBe("bonus-tax-rate");
    expect(result.some((g) => excluded.includes(g.slug))).toBe(false);
  });

  it("실제 서버 페이지가 제외 목록을 전달하고 기존 광고·카드 DOM 순서를 보존한다", async () => {
    const html = renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug: "severance-pay-guide" }) }));
    expect(capture.top).toHaveLength(3);
    expect(capture.bottom).toHaveLength(6);
    expect(new Set([...capture.top, ...capture.bottom]).size).toBe(9);
    expect(capture.calculator.href).toBe("/tools/finance/severance");
    expect([...html.matchAll(/data-section="([^"]+)"/g)].map((m) => m[1]))
      .toEqual(["guide-client", "result-ad", "bottom-guides", "related-calcs", "home-ad"]);
  });
});
