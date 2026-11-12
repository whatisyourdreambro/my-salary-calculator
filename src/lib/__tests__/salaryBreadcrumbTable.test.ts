// /salary/[amount] 가운데 빵부스러기 → /table/2026/annual (2026-11-13 lens-links-F09 (2)).
// e340cb4d2(RL-53, 운영자 질문 2 묶음)의 빵부스러기 조각만 먼저 옮겼다 — 보이는 글자·class 는 그대로, href 와
// BreadcrumbList item 만 바뀐다. RL-53 을 다시 자를 때 이 조각은 빼고, 이 파일이 그 단언을 맡는다.
// 1/1 요율 전환(RL-44) 때 /table/2027/annual 로 따라갈지는 그 체크리스트에서 정한다.
import { existsSync, readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not found"); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, Display2Ad: () => null, GuideMidAd: () => null, HomeTopAd: () => null, InArticleAd: () => null, SidebarAd: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/SalaryResultCard", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/app/table/2026/SeasonalLinks", () => ({ default: () => null }));
vi.mock("@/components/SalaryTierCard", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/RelatedGuides", () => ({ default: () => null }));
vi.mock("@/components/RelatedCompanies", () => ({ default: () => null }));
vi.mock("@/components/ListedSalaryBandTable", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/NextActions", () => ({ default: () => null }));
vi.mock("@/components/WealthChartLazy", () => ({ default: () => null }));
vi.mock("@/components/SalaryTable", () => ({ default: () => null }));
vi.mock("@/components/TableHero", () => ({ default: () => null }));
vi.mock("@/lib/relatedGuides", () => ({ getRelatedGuides: () => [] }));

import SalaryPage from "@/app/salary/[amount]/page";
import { metadata as annualMetadata } from "@/app/table/2026/annual/page";

const SITE = "https://www.moneysalary.com";
const render = async (amount: number) =>
  renderToStaticMarkup(await SalaryPage({ params: Promise.resolve({ amount: String(amount) }) }));

describe("/salary/[amount] 가운데 빵부스러기 → /table/2026/annual", () => {
  it("보이는 단계와 BreadcrumbList 가 이름 그대로 연봉 실수령액 표를 가리키고, 같은 URL 이 두 번 나오지 않는다", async () => {
    const html = await render(50_000_000);
    expect(html).toMatch(/<a href="\/table\/2026\/annual"[^>]*>연봉별 실수령액<\/a>/);
    const lists = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .flatMap((m) => [JSON.parse(m[1])].flat())
      .filter((d: { "@type": string }) => d["@type"] === "BreadcrumbList");
    expect(lists).toHaveLength(1);
    const items = lists[0].itemListElement as { name: string; item: string }[];
    expect(items.map((i) => i.name)).toEqual(["홈", "연봉별 실수령액", "연봉 5,000만원"]);
    expect(items.map((i) => i.item)).toEqual([`${SITE}/`, `${SITE}/table/2026/annual`, `${SITE}/salary/50000000`]);
    expect(new Set(items.map((i) => i.item)).size).toBe(items.length);
  });

  it("/table/2026/annual 은 실제 색인 가능 페이지다 (라우트·canonical·robots·사이트맵)", () => {
    expect(existsSync("src/app/table/2026/annual/page.tsx")).toBe(true);
    expect(annualMetadata.alternates?.canonical).toBe(`${SITE}/table/2026/annual`);
    expect(annualMetadata.robots).toMatchObject({ index: true, follow: true });
    expect(readFileSync("src/app/sitemap.ts", "utf8")).toContain("'/table/2026/annual',");
  });
});
