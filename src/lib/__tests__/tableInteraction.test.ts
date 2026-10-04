import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import TableInteraction from "@/components/TableInteraction";
import InteractiveTable from "@/components/InteractiveTable";
import type { SalaryData } from "@/lib/generateData";
import { calculateNetSalary2026 } from "@/lib/calculator";

const state = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(state.query),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: Record<string, unknown>) => createElement("a", props, children as string),
}));
vi.mock("@/components/ui/slider", () => ({ Slider: () => null }));
vi.mock("@/components/ui/switch", () => ({ Switch: () => null }));

const data: SalaryData[] = Array.from({ length: 250 }, (_, index) => ({
  preTax: 10000 + index * 100, monthlyNet: index, totalDeduction: 0,
  pension: 0, health: 0, longTermCare: 0, employment: 0, incomeTax: 0, localTax: 0,
}));

function renderTable(query: string) {
  state.query = query;
  return renderToStaticMarkup(createElement(InteractiveTable, {
    allData: data, tableHeaders: [{ key: "preTax", label: "시급" }, { key: "monthlyNet", label: "실수령액" }],
    highlightRows: [], calculationFn: calculateNetSalary2026,
    linkColumnBaseHref: "/salary", linkValueMultiplier: 2508,
    pageConfig: { title: "test", basePath: "/table/test", searchPlaceholder: "시급 검색", salaryLabel: "시급", salaryMin: 10000, salaryMax: 50000, salaryStep: 1000, defaultSalary: 15000 },
  }));
}

const tableRows = (html: string) => html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr\b/g)?.length ?? 0;

describe("salary table rendered query state", () => {
  it("keeps formatted search, filtered rows and annual detail links consistent", () => {
    const html = renderTable("searchTerm=15,000&page=999");
    expect(tableRows(html)).toBe(1);
    expect(html).toContain('value="15,000"');
    expect(html).toContain('href="/salary/37620000"');
    expect(html).toContain("1 / 1");
  });

  it("clamps an excessive page to the last available rows", () => {
    const html = renderTable("page=999");
    expect(tableRows(html)).toBe(50);
    expect(html).toContain('href="/salary/75240000"');
    expect(html).toContain("3 / 3");
  });

  it("shows no-results text and disables both directions at page 1/1", () => {
    const html = renderTable("searchTerm=999999&page=999");
    expect(tableRows(html)).toBe(0);
    expect(html).toContain("검색 결과가 없습니다.");
    expect(html).toContain("1 / 1");
    expect((html.match(/<button[^>]*disabled=""/g) ?? []).length).toBe(2);
  });

  it("invalid search queries restore the unfiltered table without NaN", () => {
    const html = renderTable("searchTerm=abc&page=abc");
    expect(tableRows(html)).toBe(100);
    expect(html).toContain('value=""');
    expect(html).toContain("1 / 3");
    expect(html).not.toContain("NaN");
  });

  it("provides an explicit submit action for numeric mobile keyboards", () => {
    state.query = "";
    const html = renderToStaticMarkup(createElement(TableInteraction, { totalPages: 1, basePath: "/table/test", searchPlaceholder: "금액 검색" }));
    expect(html).toContain('inputMode="numeric"');
    expect(html).toContain('enterKeyHint="search"');
    expect(html).toMatch(/<button type="submit"[^>]*>검색<\/button>/);
    expect(html).toContain("금액으로 표 검색");
  });
});
