import { isValidElement, type ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FINANCIAL_DATA_KEY, CURRENT_SALARY_BASIS_VERSION } from "@/lib/storedFinancialData";
import { requestSavedSalaryRecalculation } from "@/lib/savedSalaryRecalculation";

const hooks = vi.hoisted(() => ({ values: [] as unknown[], index: 0, effects: [] as (() => unknown)[], push: vi.fn() }));
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual,
    useState(initial: unknown) {
      const slot = hooks.index++;
      if (!(slot in hooks.values)) hooks.values[slot] = initial;
      return [hooks.values[slot], (next: unknown) => { hooks.values[slot] = typeof next === "function" ? next(hooks.values[slot]) : next; }];
    },
    useEffect(effect: () => unknown) { hooks.effects.push(effect); },
    useRef(initial: unknown) {
      const slot = hooks.index++;
      if (!(slot in hooks.values)) hooks.values[slot] = { current: initial };
      return hooks.values[slot];
    },
    useMemo(fn: () => unknown) { return fn(); },
    useCallback(fn: unknown) { return fn; },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: hooks.push }), usePathname: () => "/" }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/hooks/useCalculatorMeasurement", () => ({ useCalculatorMeasurement: () => ({ inputProps: {}, resultRef: () => {} }) }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackSavedSalaryRecalculate: vi.fn() }));

import SalaryCalculator from "@/components/SalaryCalculator";

type Node = ReactElement<Record<string, unknown>>;
function allNodes(value: unknown): Node[] {
  if (Array.isArray(value)) return value.flatMap(allNodes);
  if (!isValidElement<Record<string, unknown>>(value)) return [];
  return [value, ...allNodes(value.props.children)];
}
function content(value: unknown): string {
  if (Array.isArray(value)) return value.map(content).join("");
  if (isValidElement<Record<string, unknown>>(value)) return content(value.props.children);
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
function button(tree: Node, label: string) {
  const found = allNodes(tree).find(node => node.type === "button" && content(node) === label);
  expect(found, `button ${label}`).toBeDefined();
  return found!;
}
function click(tree: Node, label: string) { (button(tree, label).props.onClick as () => void)(); }
function render() { hooks.index = 0; hooks.effects = []; return SalaryCalculator() as Node; }
function memoryStorage() {
  const map = new Map<string, string>();
  return { getItem: vi.fn((key: string) => map.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { map.set(key, value); }), removeItem: vi.fn((key: string) => { map.delete(key); }) };
}
const oldSalary = { annualSalary: 60_000_000, monthlyNet: 3_900_000, payBasis: "monthly", severanceType: "separate", nonTaxableAmount: 200_000, dependents: 3, children: 1 };
const oldRecord = { salary: oldSalary, homeLoan: { monthlyPayment: 123_000 }, lastUpdated: "2025-10-01T00:00:00.000Z" };

beforeEach(() => { hooks.values = []; hooks.index = 0; hooks.effects = []; hooks.push.mockClear(); vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

function arriveFromDashboard() {
  const local = memoryStorage(); const session = memoryStorage();
  local.setItem(FINANCIAL_DATA_KEY, JSON.stringify(oldRecord));
  local.setItem("moneysalary-user-input", JSON.stringify({ salaryInput: "40000000", incomeType: "regular", payBasis: "annual", nonTaxableAmount: "0", dependents: 1, children: 0 }));
  requestSavedSalaryRecalculation(session);
  const alert = vi.fn();
  vi.stubGlobal("localStorage", local);
  vi.stubGlobal("window", { sessionStorage: session, location: { origin: "http://localhost" } });
  vi.stubGlobal("document", { getElementById: () => null });
  vi.stubGlobal("alert", alert);
  render();
  // Only initial reads; no browser, real service or timer navigation is involved.
  const effects = [...hooks.effects]; effects[0](); effects[1]();
  return { local, alert, tree: render() };
}
function completeCalculation(tree: Node) {
  click(tree, "결과 확인하기");
  const calculated = render();
  // Production calculates immediately; restoring a saved salary must not add a timed gate.
  expect(allNodes(calculated).some(node => node.props.id === "calculation-result")).toBe(true);
  expect(button(calculated, "대시보드에 저장하기").props.disabled).toBe(false);
  return calculated;
}

describe("actual home saved-salary confirmation and save handlers", () => {
  it("does not apply on arrival; explicit confirmation then calculation precedes any dashboard overwrite", () => {
    const { local, alert, tree } = arriveFromDashboard();
    expect(content(tree)).toContain("이전 기록에는 소득 유형이 없습니다");
    expect(allNodes(tree).find(node => node.props.label === "계약 연봉")?.props.value).toBe("40000000");
    expect(local.getItem(FINANCIAL_DATA_KEY)).toBe(JSON.stringify(oldRecord));
    click(tree, "직장인 조건 확인 후 불러오기");
    let loaded = render();
    expect(allNodes(loaded).find(node => node.props.label === "세전 월급")?.props.value).toBe("5000000");
    expect(content(loaded)).toContain("입력값을 확인한 뒤");
    expect(local.getItem(FINANCIAL_DATA_KEY)).toBe(JSON.stringify(oldRecord));
    loaded = completeCalculation(loaded);
    expect(button(loaded, "대시보드에 저장하기").props.disabled).toBe(false);
    click(loaded, "대시보드에 저장하기");
    const updated = JSON.parse(local.getItem(FINANCIAL_DATA_KEY)!);
    expect(updated.salary).toMatchObject({ annualSalary: 60_000_000, payBasis: "monthly", nonTaxableAmount: 200_000, dependents: 3, children: 1,
      incomeType: "regular", inputOrigin: "saved_salary", calculationBasisVersion: CURRENT_SALARY_BASIS_VERSION });
    expect(Number.isFinite(Date.parse(updated.salary.savedAt))).toBe(true);
    expect(updated.homeLoan).toEqual(oldRecord.homeLoan);
    expect(alert).toHaveBeenCalledWith("연봉 정보가 대시보드에 저장되었습니다!");
    expect(hooks.push).toHaveBeenCalledWith("/dashboard");
  });
  it("cancel keeps the existing home input and the old dashboard result", () => {
    const { local, tree } = arriveFromDashboard();
    click(tree, "불러오지 않기");
    const cancelled = render();
    expect(content(cancelled)).not.toContain("이 저장 조건을 다시 계산할까요?");
    expect(allNodes(cancelled).find(node => node.props.label === "계약 연봉")?.props.value).toBe("40000000");
    expect(local.getItem(FINANCIAL_DATA_KEY)).toBe(JSON.stringify(oldRecord));
  });
  it("storage rejection never reports successful save or navigates", () => {
    const { local, alert, tree } = arriveFromDashboard();
    click(tree, "직장인 조건 확인 후 불러오기");
    const completed = completeCalculation(render());
    local.setItem.mockImplementation(() => { throw Error("quota"); });
    click(completed, "대시보드에 저장하기");
    expect(local.getItem(FINANCIAL_DATA_KEY)).toBe(JSON.stringify(oldRecord));
    expect(alert).toHaveBeenCalledWith(expect.stringContaining("저장 완료를 확인하지 못했습니다"));
    expect(hooks.push).not.toHaveBeenCalled();
  });
  it("editing restored inputs invalidates the old result and records the manual origin after recalculation", () => {
    const { local, tree } = arriveFromDashboard();
    click(tree, "직장인 조건 확인 후 불러오기");
    let completed = completeCalculation(render());
    const input = allNodes(completed).find(node => node.props.label === "세전 월급")!;
    (input.props.onValueChange as (value: string) => void)("6000000");
    completed = render();
    expect(button(completed, "대시보드에 저장하기").props.disabled).toBe(true);
    completed = completeCalculation(completed);
    click(completed, "대시보드에 저장하기");
    expect(JSON.parse(local.getItem(FINANCIAL_DATA_KEY)!).salary).toMatchObject({ annualSalary: 72_000_000, inputOrigin: "user" });
  });
});
