import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { analyzeHtml, normalizePath, SEASONAL_MODULE } from "../../../scripts/qa-page-quality.mjs";

// Render the actual route/components, but never load SDKs, run browser effects,
// or contact any origin. These fixtures retain the real content-link elements.
vi.mock("next/navigation", () => ({ usePathname: () => "/calc", useSearchParams: () => new URLSearchParams(),
  permanentRedirect: () => { throw new Error("Unexpected redirect"); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, href, ...props }: { children: ReactNode; href: string }) =>
  createElement("a", { ...props, href }, children) }));
vi.mock("@/components/AdPlacement", () => Object.fromEntries(
  ["CalcResultAd", "GuideMidAd", "InArticleAd", "HomeTopAd", "SidebarAd", "Display2Ad", "MultiplexAd"]
    .map(name => [name, () => createElement("span", { "data-inert-ad": name })]),
));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/hooks/useCalculatorMeasurement", () => ({ useCalculatorMeasurement: () => ({ inputProps: {}, resultRef: null }) }));

import CalcPage, { generateMetadata } from "@/app/calc/[slug]/page";
import CalcIndexPage, { metadata as indexMetadata } from "@/app/calc/page";
import HubPage, { generateMetadata as hubMetadata } from "@/app/hub/[id]/page";
import GuidePage, { generateMetadata as guideMetadata } from "@/app/guides/[slug]/page";
import { getAllHubIds } from "@/lib/hubs";
import { isReleaseHeldBack } from "@/lib/guideReleaseHoldback";
import { allCalculators, toClientCalculator } from "@/lib/simpleCalculators";
import { calcPinHrefs, mapToNextActionCategory, nextActionHrefs } from "@/lib/nextActionLinks";
import { getRelatedCalculators } from "@/lib/relatedCalculators";

function contentLinks(node: ReactNode): Set<string> {
  // The application's root layout supplies this same main-content wrapper.
  const html = renderToStaticMarkup(createElement("main", { id: "main-content" }, node));
  return new Set(analyzeHtml(html).links
    .filter((link: { inContent: boolean; rel: string; module: string }) =>
      link.inContent && !/\bnofollow\b/i.test(link.rel) && link.module !== SEASONAL_MODULE)
    .map((link: { href: string }) => new URL(link.href, "https://www.moneysalary.com"))
    .filter((url: URL) => url.origin === "https://www.moneysalary.com")
    .map((url: URL) => normalizePath(url.pathname)));
}

const targets = allCalculators.map(calc => `/calc/${calc.slug}`);
const targetSet = new Set(targets);
// These existing editorial pages supply necessary non-calculator sources.
// Render their current routes rather than retaining stale ledger counts.
const supportingGuides = ["gift-tax-exemption", "household-ledger-tips"];
const outgoing = new Map<string, Set<string>>();
const incoming = new Map(targets.map(target => [target, new Set<string>()]));
const fetchTrap = vi.fn(() => { throw new Error("Network is prohibited in the calculator SSR graph"); });

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "1");
  vi.stubEnv("MSY_QA_MODE", "1");
  vi.stubGlobal("fetch", fetchTrap);
  outgoing.set("/calc", contentLinks(createElement(CalcIndexPage)));
  for (const calc of allCalculators) {
    const params = Promise.resolve({ slug: calc.slug });
    const metadata = await generateMetadata({ params });
    expect(metadata.robots, `${calc.slug} is not an indexable source`).not.toMatchObject({ index: false });
    outgoing.set(`/calc/${calc.slug}`, contentLinks(await CalcPage({ params })));
  }
  for (const id of getAllHubIds()) {
    const params = Promise.resolve({ id });
    expect((await hubMetadata({ params })).robots, id).not.toMatchObject({ index: false });
    outgoing.set(`/hub/${id}`, contentLinks(await HubPage({ params })));
  }
  for (const slug of supportingGuides) {
    const params = Promise.resolve({ slug });
    expect(isReleaseHeldBack(slug), slug).toBe(false);
    expect((await guideMetadata({ params })).robots, slug).not.toMatchObject({ index: false });
    outgoing.set(`/guides/${slug}`, contentLinks(await GuidePage({ params })));
  }
  for (const [source, links] of outgoing) {
    for (const target of links) if (target !== source) incoming.get(target)?.add(source);
  }
}, 30_000);

afterAll(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("all registry calculators retain distinct incoming content links", () => {
  it("renders all 202 indexable calculator routes and the directory without network or SDKs", () => {
    expect(targets).toHaveLength(202);
    expect(outgoing.size).toBe(203 + getAllHubIds().length + supportingGuides.length);
    expect(indexMetadata.robots).not.toMatchObject({ index: false });
    expect(fetchTrap).not.toHaveBeenCalled();
    for (const target of targets) expect(outgoing.get("/calc")!.has(target), target).toBe(true);
  });

  it("matches real visible cards/next actions/fallbacks, without counting navigation-only precision pins", () => {
    for (const calc of allCalculators) {
      const path = `/calc/${calc.slug}`;
      const client = toClientCalculator(calc);
      const category = mapToNextActionCategory(calc.category);
      const next = category ? nextActionHrefs(category, path) : [];
      const fallback = getRelatedCalculators(path, 4, calc.category, [...calcPinHrefs(client), ...next]);
      const expected = new Set([
        ...(client.relatedCards ?? []).map(card => `/calc/${card.slug}`),
        ...next, ...fallback.map(item => item.path),
      ].filter(target => targetSet.has(target)));
      expect(new Set([...outgoing.get(path)!].filter(target => targetSet.has(target))), path).toEqual(expected);
      expect(client.relatedCards, path).toHaveLength((calc.relatedSlugs ?? []).filter(slug => targetSet.has(`/calc/${slug}`) && slug !== calc.slug).length);
      expect(fallback, path).toHaveLength(4);
    }
  });

  it("keeps at least three distinct indexable content sources for every calculator", () => {
    const rows = [...incoming].map(([path, sources]) => ({ path, incoming: sources.size, sources: [...sources].sort() }));
    // Explicit opt-in, ignored audit artifact; never writes application output.
    if (process.env.MSY_CALCULATOR_GRAPH_REPORT === "1") writeFileSync(resolve(process.cwd(),
      ".artifacts/links-dates-release-2026-10-19/calculator-ssr-graph.json"), JSON.stringify({
      schemaVersion: 1, generated: new Date().toISOString(), method: "actual 202 calculator routes, directory, all topic hubs and two existing guide routes SSR; identical analyzeHtml content filters; no SDK, browser, effects or network; conservative subset of site sources",
      sources: outgoing.size, sourcePaths: [...outgoing.keys()].sort(), targets: rows.length, rows,
    }, null, 2) + "\n");
    expect(rows.filter(row => row.incoming < 3)).toEqual([]);
  });
});
