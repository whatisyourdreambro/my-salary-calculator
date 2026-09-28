// /salary/[amount] 하단 "다른 연봉 리포트" 비교표 + 가운데 빵부스러기 (2026-09-28 S21).
//
// - 표 행: 인근 연봉(getSalaryNeighborAmounts) + 현재 연봉, 오름차순. 예상 월 실수령은 페이지 본문과 같은
//   calculateSalary2026(연봉, 200000, 1, 0), 차이는 표에 보이는 만원 값끼리의 차. 현재 행만 강조·링크 없음.
// - 표는 마지막 본문 광고(GuideMidAd) 아래에 있고, 바깥 래퍼·제목은 종전 그대로다.
// - 가운데 빵부스러기(보이는 단계 + BreadcrumbList)는 이름 그대로 /table/2026/annual 을 가리킨다.
import { existsSync, readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not found"); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
// 광고는 표지 요소로 — JSX 순서(렌더 순서)에서 표가 광고 아래인지 본다
vi.mock("@/components/AdPlacement", () => {
  const marker = (name: string) => function AdMarker() { return createElement("ins", { "data-ad": name }); };
  return { CalcResultAd: marker("calc-result"), Display2Ad: marker("display2"), GuideMidAd: marker("guide-mid"), HomeTopAd: marker("home-top"), InArticleAd: marker("in-article"), SidebarAd: marker("sidebar") };
});
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("ins", { "data-ad": "coupang" }) }));
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
import { buildSalaryNeighborRows, formatManwonDiff } from "@/lib/salaryNeighborTable";
import { getSalaryNeighborAmounts, getStaticSalaryAmounts, isStaticSalaryAmount, sitemapGridAmounts } from "@/lib/salaryStaticParams";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { formatSalaryKorean } from "@/lib/seo";

const SITE = "https://www.moneysalary.com";
const pageNet = (amount: number) => calculateSalary2026(amount, 200_000, 1, 0).netPay;
const manwon = (won: number) => Math.round(won / 10_000);
const render = (amount: number) => renderToStaticMarkup(createElement(SalaryPage, { params: { amount: String(amount) } }));
const tableOf = (html: string) => {
  const m = html.match(/<table\b[\s\S]*?<\/table>/);
  expect(m, "neighbour table").not.toBeNull();
  return m![0];
};
const rowsOf = (table: string) => [...table.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)].slice(1); // 머리 행 제외

describe("buildSalaryNeighborRows — 표 데이터", () => {
  it("인근 연봉 + 현재 연봉을 오름차순으로, 페이지와 같은 계산으로 월 실수령·차이를 만든다", () => {
    const amount = 50_000_000;
    const neighbors = getSalaryNeighborAmounts(amount);
    const rows = buildSalaryNeighborRows(amount, pageNet(amount), neighbors);
    expect(rows.map((r) => r.amount)).toEqual([...neighbors, amount].sort((a, b) => a - b));
    expect(rows.filter((r) => r.isCurrent).map((r) => r.amount)).toEqual([amount]);
    const currentManwon = manwon(pageNet(amount));
    for (const row of rows) {
      expect(row.monthlyNet, String(row.amount)).toBe(pageNet(row.amount));
      expect(row.monthlyNetManwon).toBe(manwon(row.monthlyNet));
      expect(row.diffManwon).toBe(row.monthlyNetManwon - currentManwon);
      // 연봉이 낮으면 차이 음수, 높으면 양수
      if (row.amount < amount) expect(row.diffManwon).toBeLessThan(0);
      if (row.amount > amount) expect(row.diffManwon).toBeGreaterThan(0);
    }
    expect(rows.find((r) => r.isCurrent)!.diffManwon).toBe(0);
  });

  it("현재 행은 페이지가 넘긴 값을 그대로 쓰고, 입력의 중복·현재 연봉은 한 번만 남긴다", () => {
    const rows = buildSalaryNeighborRows(40_000_000, 1_234_567, [42_000_000, 38_000_000, 42_000_000, 40_000_000]);
    expect(rows.map((r) => [r.amount, r.isCurrent])).toEqual([[38_000_000, false], [40_000_000, true], [42_000_000, false]]);
    const current = rows[1];
    expect(current.monthlyNet).toBe(1_234_567);
    expect(current.monthlyNetManwon).toBe(123);
    expect(rows[0].diffManwon).toBe(manwon(pageNet(38_000_000)) - 123);
  });

  it("격자 밖 연봉(표·회사 링크 값)도 제자리에 현재 행으로 들어간다", () => {
    const grid = new Set(sitemapGridAmounts());
    const offGrid = getStaticSalaryAmounts().find((a) => !grid.has(a) && a > 30_000_000 && a < 90_000_000)!;
    expect(offGrid).toBeDefined();
    const rows = buildSalaryNeighborRows(offGrid, pageNet(offGrid), getSalaryNeighborAmounts(offGrid));
    const idx = rows.findIndex((r) => r.isCurrent);
    expect(rows[idx].amount).toBe(offGrid);
    if (idx > 0) expect(rows[idx - 1].amount).toBeLessThan(offGrid);
    if (idx < rows.length - 1) expect(rows[idx + 1].amount).toBeGreaterThan(offGrid);
  });

  it("정적 생성 전 연봉에서 현재 행 1개, 인근 행은 모두 정적 URL(내부 404 0건)", () => {
    for (const amount of getStaticSalaryAmounts()) {
      const neighbors = getSalaryNeighborAmounts(amount);
      const rows = buildSalaryNeighborRows(amount, pageNet(amount), neighbors);
      expect(rows.filter((r) => r.isCurrent), String(amount)).toHaveLength(1);
      expect(rows).toHaveLength(neighbors.length + 1);
      for (const r of rows) if (!r.isCurrent) expect(isStaticSalaryAmount(r.amount), `${amount} → ${r.amount}`).toBe(true);
    }
  });

  it("차이 칸 표기", () => {
    expect(formatManwonDiff(23)).toBe("+23만원");
    expect(formatManwonDiff(-18)).toBe("-18만원");
    expect(formatManwonDiff(0)).toBe("0만원");
    expect(formatManwonDiff(1234)).toBe("+1,234만원");
  });
});

describe("/salary/[amount] 비교표 렌더", () => {
  it.each([50_000_000, 120_000_000])("%i: 연봉 | 예상 월 실수령 | 차이 표, 현재 행 강조·링크 없음, 값은 위 요약과 같다", (amount) => {
    const html = render(amount);
    const table = tableOf(html);
    expect(table).toMatch(/<th scope="col"[^>]*>연봉<\/th><th scope="col"[^>]*>예상 월 실수령<\/th><th scope="col"[^>]*>차이<\/th>/);

    const rows = rowsOf(table);
    const expected = buildSalaryNeighborRows(amount, pageNet(amount), getSalaryNeighborAmounts(amount));
    expect(rows).toHaveLength(expected.length);
    rows.forEach(([, attrs, cells], i) => {
      const row = expected[i];
      const label = `연봉 ${formatSalaryKorean(row.amount)}`;
      expect(cells).toContain(`${row.monthlyNetManwon.toLocaleString("ko-KR")}만원</td>`);
      if (row.isCurrent) {
        expect(attrs).toContain('aria-current="page"');
        expect(attrs).toContain("bg-primary/5");
        expect(cells).toContain(`${label} (현재)`);
        expect(cells).toContain(">기준</td>");
        expect(cells).not.toContain("<a ");
      } else {
        expect(attrs).not.toContain("aria-current");
        expect(cells).toContain(`href="/salary/${row.amount}"`);
        expect(cells).toContain(label);
        expect(cells).toContain(`>${formatManwonDiff(row.diffManwon)}</td>`);
      }
    });
    // 현재 행 값 = 위 요약 문장(약 N만원)의 N — 같은 tax 값
    const summary = html.match(/예상 월 실수령액은 약 (\d+)만원/)![1];
    expect(Number(summary)).toBe(expected.find((r) => r.isCurrent)!.monthlyNetManwon);
    // 1억 이상도 제목·H1 과 같은 억 표기 (다섯 자리 만원 금지)
    expect(table).not.toMatch(/\d{2,3},\d{3}만원/);
  });

  it("표는 마지막 본문 광고(GuideMidAd) 아래, 바깥 래퍼·제목은 종전 그대로", () => {
    const html = render(50_000_000);
    const tableAt = html.indexOf("<table");
    const aside = html.indexOf("<aside");
    for (const ad of ["calc-result", "coupang", "home-top", "guide-mid"]) {
      const at = html.indexOf(`data-ad="${ad}"`);
      expect(at, ad).toBeGreaterThan(-1);
      expect(at, ad).toBeLessThan(tableAt);
    }
    // 표와 사이드바(aside) 사이 본문에는 광고가 없다
    expect(html.slice(tableAt, aside)).not.toContain("data-ad=");
    expect(html).toContain(
      '<div class="pt-8 border-t border-canvas px-2 sm:px-6"><h2 class="text-sm font-black text-faint-blue uppercase tracking-widest mb-4 text-center">다른 연봉 리포트</h2><div class="overflow-x-auto rounded-2xl border border-canvas bg-white shadow-sm"><table'
    );
  });
});

describe("/salary/[amount] 가운데 빵부스러기 → /table/2026/annual", () => {
  it("보이는 단계와 BreadcrumbList 가 이름 그대로 연봉 실수령액 표를 가리킨다", () => {
    const html = render(50_000_000);
    expect(html).toContain('<a href="/table/2026/annual" class="inline-flex min-h-8 items-center rounded-md whitespace-nowrap transition-colors hover:text-link">연봉별 실수령액</a>');
    const lists = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .flatMap((m) => [JSON.parse(m[1])].flat())
      .filter((d: { "@type": string }) => d["@type"] === "BreadcrumbList");
    expect(lists).toHaveLength(1);
    const items = lists[0].itemListElement as { name: string; item: string }[];
    expect(items.map((i) => i.name)).toEqual(["홈", "연봉별 실수령액", "연봉 5,000만원"]);
    expect(items.map((i) => i.item)).toEqual([`${SITE}/`, `${SITE}/table/2026/annual`, `${SITE}/salary/50000000`]);
  });

  it("/table/2026/annual 은 실제 색인 가능 페이지다 (라우트·canonical·robots·사이트맵)", () => {
    expect(existsSync("src/app/table/2026/annual/page.tsx")).toBe(true);
    expect(annualMetadata.alternates?.canonical).toBe(`${SITE}/table/2026/annual`);
    expect(annualMetadata.robots).toMatchObject({ index: true, follow: true });
    expect(readFileSync("src/app/sitemap.ts", "utf8")).toContain("'/table/2026/annual',");
  });
});
