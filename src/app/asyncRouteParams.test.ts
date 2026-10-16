import { beforeAll, describe, expect, it, vi } from "vitest";

// Source-only calls: these functions return React elements; no browser, hydration,
// effects, advertising SDK, or external request is involved.
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => null, CalcResultAd: () => null, ResultAd: () => null,
  GuideMidAd: () => null, SidebarAd: () => null, InArticleAd: () => null,
  MultiplexAd: () => null, Display2Ad: () => null, CompanyTopAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));

const routes = [
  ["calc", () => import("@/app/calc/[slug]/page")],
  ["company compare", () => import("@/app/company/compare/[slug]/page")],
  ["English guides", () => import("@/app/en/guides/[slug]/page")],
  ["English tools", () => import("@/app/en/tools/[slug]/page")],
  ["glossary", () => import("@/app/glossary/[slug]/page")],
  ["guide category", () => import("@/app/guides/category/[slug]/page")],
  ["guides", () => import("@/app/guides/[slug]/page")],
  ["hub", () => import("@/app/hub/[id]/page")],
  ["industry", () => import("@/app/industry/[slug]/page")],
  ["job", () => import("@/app/job/[slug]/page")],
  ["monthly", () => import("@/app/monthly/[amount]/page")],
  ["Q&A", () => import("@/app/qna/[slug]/page")],
  ["region", () => import("@/app/region/[slug]/page")],
  ["salary", () => import("@/app/salary/[amount]/page")],
  ["salary database compare", () => import("@/app/salary-db/compare/[slug]/page")],
  ["listed industry", () => import("@/app/salary-db/listed/industry/[industryId]/page")],
  ["listed company", () => import("@/app/salary-db/listed/[stockCode]/page")],
  ["company", () => import("@/app/salary-db/[id]/page")],
  ["share", () => import("@/app/share/[data]/page")],
] as const;

describe.each(routes)("Next 15 asynchronous route parameters: %s", (_, load) => {
  let route: Awaited<ReturnType<typeof load>>;
  // Importing a route can transform large company/calculator registries. Give only
  // fixture preparation a bounded longer deadline; keep the contract test at 5s.
  beforeAll(async () => { route = await load(); }, 30_000);

  it("waits for routing before page or metadata work", async () => {
    for (const render of [route.default, route.generateMetadata]) {
      const failure = new Error("Routing parameters unavailable");
      let rejectParams!: (reason: Error) => void;
      const params = new Promise<never>((_, reject) => { rejectParams = reject; });
      const result = render({ params });
      let settled = false;
      void result.then(() => { settled = true; }, () => { settled = true; });
      await Promise.resolve();
      expect(settled).toBe(false);
      rejectParams(failure);
      await expect(result).rejects.toBe(failure);
    }
  });
});
