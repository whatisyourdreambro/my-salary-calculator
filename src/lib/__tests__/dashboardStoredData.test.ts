import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isStoredDashboardData, isStoredFinancialData } from "@/lib/storedFinancialData";

const state = vi.hoisted(() => ({ values: [] as unknown[], index: 0, effects: [] as (() => void)[] }));
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual,
    useState(initial: unknown) { const slot = state.index++; return [state.values[slot] ?? initial, (value: unknown) => { state.values[slot] = value; }]; },
    useEffect(effect: () => void) { state.effects.push(effect); },
  };
});
vi.mock("next/dynamic", async () => {
  const actual = await vi.importActual<typeof import("@/components/MyDashboard")>("@/components/MyDashboard");
  return { default: () => actual.default };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/PageFooterAds", () => ({ default: () => null }));
vi.mock("@/components/DashboardFavoritesSection", () => ({ default: () => null }));
vi.mock("@/components/AppLink", () => ({ default: (props: { href: string; children: unknown }) => createElement("a", { href: props.href }, props.children as string) }));
vi.mock("react-countup", () => ({ default: (props: { end: number }) => createElement("span", null, String(props.end)) }));
vi.mock("lucide-react", () => ({ Calculator: () => null, PiggyBank: () => null, TrendingUp: () => null, Building2: () => null, ArrowRight: () => null, Sparkles: () => null, RefreshCw: () => null }));
vi.mock("recharts", () => Object.fromEntries(["RadialBarChart", "RadialBar", "ResponsiveContainer", "PieChart", "Pie", "Cell", "Tooltip", "Legend"].map(name => [name, () => null])));

import DashboardPage from "@/app/dashboard/page";

const lastUpdated = "2026-10-03T00:00:00.000Z";
const salary = { annualSalary: 60000000, monthlyNet: 4000000 };
function renderSaved(fixture: unknown) {
  state.values = [null, true, ""]; state.index = 0; state.effects = [];
  const raw = JSON.stringify(fixture);
  const storage = { getItem: vi.fn(() => raw), setItem: vi.fn(), removeItem: vi.fn() };
  vi.stubGlobal("localStorage", storage);
  DashboardPage(); const effect = state.effects[0]; state.effects = []; effect(); state.index = 0;
  const html = renderToStaticMarkup(DashboardPage());
  vi.unstubAllGlobals();
  return { html, storage };
}

describe("dashboard-only predicate preserves the existing shallow predicate", () => {
  it("keeps the old object-only semantics for existing callers", () => {
    const broken = { salary: {}, lastUpdated };
    expect(isStoredFinancialData(broken)).toBe(true); expect(isStoredDashboardData(broken)).toBe(false);
  });
  it.each([{ lastUpdated }, { salary: { annualSalary: 0, monthlyNet: 0 }, lastUpdated }, { salary, rank: { rank: 0 }, lastUpdated }, { rank: { rank: 100 }, lastUpdated }])("allows optional sections, valid zero and rank endpoints (%j)", value => { expect(isStoredDashboardData(value)).toBe(true); });
  it.each([
    { salary: {}, lastUpdated }, { salary: { ...salary, annualSalary: "bad" }, lastUpdated }, { salary, lastUpdated: "invalid" },
    { salary, rank: {}, lastUpdated }, { salary, rank: { rank: "30" }, lastUpdated }, { salary, rank: { rank: Number.NaN }, lastUpdated },
    { salary, rank: { rank: -1 }, lastUpdated }, { salary, rank: { rank: 101 }, lastUpdated },
  ])("rejects malformed rendered fields (%j)", value => { expect(isStoredDashboardData(value)).toBe(false); });
});

describe("actual DashboardPage and MyDashboard rendering", () => {
  it.each([{ salary: {}, lastUpdated }, { salary: { ...salary, annualSalary: "bad" }, lastUpdated }, { salary, lastUpdated: "invalid" }, { salary, rank: {}, lastUpdated }])("preserves malformed records and shows a controlled alert (%j)", fixture => {
    const { html, storage } = renderSaved(fixture);
    expect(html).toContain('role="alert"'); expect(html).toContain("기존 값은 삭제하지 않았습니다");
    expect(html).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    expect(storage.setItem).not.toHaveBeenCalled(); expect(storage.removeItem).not.toHaveBeenCalled();
  });
  it.each([{ salary, lastUpdated }, { salary: { annualSalary: 0, monthlyNet: 0 }, lastUpdated }, { rank: { rank: 0 }, lastUpdated }, { lastUpdated }])("renders actual valid optional/zero dashboard without numeric errors (%j)", fixture => {
    const { html } = renderSaved(fixture);
    expect(html).toContain("나의 종합 금융 대시보드"); expect(html).not.toContain('role="alert"');
    expect(html).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
  });
});
