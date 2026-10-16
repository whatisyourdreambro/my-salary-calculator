import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

const state = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0, calculations: [] as unknown[] }));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState: (initial: unknown) => {
    const index = state.cursor++;
    return [index < state.values.length ? state.values[index] : typeof initial === "function" ? initial() : initial, () => {}];
  },
  useMemo: (calculate: () => unknown) => { const result = calculate(); state.calculations.push(result); return result; },
  useEffect: () => {},
  useRef: () => ({ current: null }),
}));
vi.mock("framer-motion", () => ({ motion: { div: "div", button: "button" }, AnimatePresence: "div" }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, GuideMidAd: () => null }));
vi.mock("@/components/PageFooterAds", () => ({ default: () => null }));
vi.mock("react-countup", () => ({ default: () => null }));

import FireCalculatorPage from "./fire-calculator/page";
import InstallmentPage from "./tools/finance/installment/page";

const defaultFire = {
  currentAge: "30", monthlySpending: "3,000,000", currentSavings: "50,000,000", monthlySavings: "1,500,000",
  salaryGrowthRate: "5", investmentStrategy: "balanced", customReturn: "", retirementIncome: "0", withdrawalRate: "4",
};
type FireResult = { yearsToFire: number; finalTargetAmount: number; coastFireTarget: number; baristaTargetAmount: number };
function reset(values: unknown[]) { state.values = values; state.cursor = 0; state.calculations = []; }
function fire(changes: Partial<typeof defaultFire> = {}) {
  reset(["result", { ...defaultFire, ...changes }, []]);
  const tree = FireCalculatorPage();
  return { result: state.calculations[0] as FireResult | null, tree };
}
function hasAlert(node: unknown): boolean {
  if (Array.isArray(node)) return node.some(hasAlert);
  if (!node || typeof node !== "object" || !("props" in node)) return false;
  const props = (node as ReactElement<Record<string, unknown>>).props;
  return props.role === "alert" || hasAlert(props.children);
}
function installment(principal: number, months: number, rate: number) {
  reset([principal, months, rate]);
  const tree = InstallmentPage();
  return { result: state.calculations[0] as { monthly: number; totalPayment: number; totalInterest: number } | null, tree };
}

describe("FIRE page input boundaries", () => {
  it.each([{ withdrawalRate: "0" }, { withdrawalRate: "" }, { withdrawalRate: "-1" }, { currentAge: "" }, { monthlySavings: "" }, { salaryGrowthRate: "" }])("shows a correction message for invalid input %o", input => {
    const { result, tree } = fire(input);
    expect(result).toBeNull();
    expect(hasAlert(tree)).toBe(true);
  });
  it("never shows negative target assets when retirement income covers the expenses", () => {
    const { result, tree } = fire({ retirementIncome: "4,000,000" });
    expect(result).toMatchObject({ yearsToFire: 0, finalTargetAmount: 0, coastFireTarget: 0, baristaTargetAmount: 0 });
    expect(hasAlert(tree)).toBe(false);
  });
  it("keeps a zero custom return distinct from the default strategy", () => {
    const zero = fire({ customReturn: "0" }).result!;
    const fallback = fire().result!;
    expect(zero.coastFireTarget).toBeGreaterThan(fallback.coastFireTarget);
    expect(zero.coastFireTarget).toBe(Math.round(900_000_000 * 1.02 ** 35));
  });
});

describe("installment page rounding and invalid inputs", () => {
  it("zero-interest installments repay exactly the original principal", () => {
    expect(installment(2_000_000, 3, 0).result).toEqual({ monthly: 2_000_000 / 3, totalPayment: 2_000_000, totalInterest: 0 });
  });
  it("keeps final totals independent of rounding the displayed monthly estimate", () => {
    const result = installment(2_000_000, 12, 15.9).result!;
    expect(result.totalPayment).toBe(Math.round(result.monthly * 12));
    expect(result.totalPayment).not.toBe(Math.round(result.monthly) * 12);
    expect(result.totalInterest).toBe(result.totalPayment - 2_000_000);
  });
  it.each([[-1, 12, 1], [1, 0, 1], [1, 12, -1], [Infinity, 12, 1], [1, 12, NaN]])("rejects invalid values (%s, %s, %s)", (principal, months, rate) => {
    const { result, tree } = installment(principal, months, rate);
    expect(result).toBeNull();
    expect(hasAlert(tree)).toBe(true);
  });
});
