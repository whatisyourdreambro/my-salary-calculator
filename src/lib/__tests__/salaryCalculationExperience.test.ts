import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import SalaryCalculator from "@/components/SalaryCalculator";
import SalaryResultCard from "@/components/SalaryResultCard";
import NextActions from "@/components/NextActions";
import RelatedCalculators from "@/components/RelatedCalculators";
import MoneyInput from "@/components/ui/MoneyInput";
import { InArticleAd, ResultAd } from "@/components/AdPlacement";
import { calculateSalary2026 } from "@/lib/TaxLogic";

type Slot = { value?: unknown; dependencies?: readonly unknown[]; cleanup?: (() => void) | void };
const fixture = vi.hoisted(() => ({
  slots: [] as Slot[], cursor: 0, dirty: false,
  pending: [] as Array<{ slot: Slot; create: () => void | (() => void); dependencies?: readonly unknown[] }>,
  summary: { focus: vi.fn(), scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ top: 200, bottom: 260 }) },
  measurement: { valid: false },
}));
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useState: (initial: unknown) => {
    const index = fixture.cursor++;
    const slot = fixture.slots[index] ??= { value: typeof initial === "function" ? initial() : initial };
    return [slot.value, (value: unknown) => {
      const next = typeof value === "function" ? value(slot.value) : value;
      if (!Object.is(next, slot.value)) { slot.value = next; fixture.dirty = true; }
    }];
  },
  useRef: (initial: unknown) => {
    const slot = fixture.slots[fixture.cursor++] ??= { value: { current: initial } };
    return slot.value;
  },
  useCallback: (callback: unknown) => callback,
  useMemo: (create: () => unknown) => create(),
  useEffect: (create: () => void | (() => void), dependencies?: readonly unknown[]) => {
    const slot = fixture.slots[fixture.cursor++] ??= {};
    if (!slot.dependencies || !dependencies || dependencies.some((value, index) => !Object.is(value, slot.dependencies?.[index]))) {
      fixture.pending.push({ slot, create, dependencies });
    }
  },
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("framer-motion", () => ({ motion: { div: "div" } }));
vi.mock("@/components/AppLink", () => ({ default: "a" }));
vi.mock("@/components/AdPlacement", () => ({ ResultAd: () => null, InArticleAd: () => null }));
vi.mock("@/components/BottomSheet", () => ({ default: () => null }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => null }));
vi.mock("@/components/SalaryTierCard", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/NextActions", () => ({ default: () => null }));
vi.mock("@/components/ui/MoneyInput", () => ({ default: () => null }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/useCalculatorMeasurement", () => ({ useCalculatorMeasurement: (options: { valid: boolean }) => {
  fixture.measurement = options;
  return { inputProps: {}, resultRef: vi.fn() };
} }));

type Element = ReactElement<Record<string, unknown>>;
function nodes(value: unknown): Element[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object" || !("props" in value)) return [];
  const element = value as Element;
  return [element, ...nodes(element.props.children)];
}
function textOf(value: unknown): string {
  if (Array.isArray(value)) return value.map(textOf).join("");
  if (value && typeof value === "object" && "props" in value) return textOf((value as Element).props.children);
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
function render() {
  for (let attempt = 0; attempt < 10; attempt++) {
    fixture.cursor = 0; fixture.pending = []; fixture.dirty = false;
    const tree = SalaryCalculator();
    const region = nodes(tree).find((node) => node.props.id === "calculation-result");
    if (region) (region.props.ref as { current: unknown }).current = { querySelector: () => fixture.summary };
    for (const { slot, create, dependencies } of fixture.pending) {
      slot.cleanup?.(); slot.dependencies = dependencies; slot.cleanup = create();
    }
    if (!fixture.dirty) return tree;
  }
  throw new Error("Fixture did not settle");
}
function click(tree: unknown, label: string) {
  const button = nodes(tree).find((node) => node.type === "button" && textOf(node) === label);
  expect(button, label).toBeDefined(); (button!.props.onClick as () => void)();
  return render();
}
function changeIncome(tree: unknown, value: string) {
  const input = nodes(tree).find((node) => node.type === MoneyInput && node.props.label !== "월 비과세액");
  (input!.props.onValueChange as (value: string) => void)(value); return render();
}
beforeEach(() => {
  vi.useFakeTimers(); fixture.slots = []; fixture.pending = []; fixture.cursor = 0;
  fixture.summary.focus.mockClear(); fixture.summary.scrollIntoView.mockClear();
  vi.stubGlobal("window", { innerHeight: 800, location: { origin: "http://127.0.0.1" } });
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
  vi.stubGlobal("fetch", () => { throw new Error("Network forbidden in component fixture"); });
});
afterEach(() => {
  fixture.slots.forEach((slot) => slot.cleanup?.()); vi.useRealTimers(); vi.unstubAllGlobals();
});

describe("salary result user action lifecycle (offline hook/element fixture)", () => {
  it("shows the computed result immediately and focuses only after a valid explicit calculation", () => {
    let tree = render(); expect(fixture.summary.focus).not.toHaveBeenCalled();
    tree = click(tree, "결과 확인하기");
    const card = nodes(tree).find((node) => node.type === SalaryResultCard)!;
    expect(card.props.monthlyNet).toBe(calculateSalary2026(50_000_000, 200_000, 1, 0).netPay);
    expect(fixture.measurement.valid).toBe(true);
    expect(fixture.summary.focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
    expect(fixture.summary.scrollIntoView).not.toHaveBeenCalled();
    render(); expect(fixture.summary.focus).toHaveBeenCalledTimes(1);
    click(tree, "결과 확인하기"); expect(fixture.summary.focus).toHaveBeenCalledTimes(2);
  });

  it("input edits mark old results stale and invalid attempts cannot refocus or report success", () => {
    let tree = click(render(), "결과 확인하기");
    tree = changeIncome(tree, "60,000,000");
    expect(fixture.measurement.valid).toBe(false);
    expect(textOf(tree)).toContain("아래는 이전 계산 결과");
    expect(fixture.summary.focus).toHaveBeenCalledTimes(1);
    tree = changeIncome(tree, "0"); tree = click(tree, "결과 확인하기");
    expect(nodes(tree).some((node) => node.props.role === "alert")).toBe(true);
    expect(fixture.summary.focus).toHaveBeenCalledTimes(1);
    expect(fixture.measurement.valid).toBe(false);
  });

  it.each([["프리랜서", "freelancer"], ["알바", "part_time"]])("passes %s context while preserving the ad element order", (label, incomeType) => {
    let tree = click(render(), label); tree = click(tree, "결과 확인하기");
    const all = nodes(tree);
    expect(all.find((node) => node.type === NextActions)?.props.incomeType).toBe(incomeType);
    const nextIndex = all.findIndex((node) => node.type === NextActions);
    const adIndex = all.findIndex((node) => node.type === ResultAd);
    const relatedIndex = all.findIndex((node) => node.type === RelatedCalculators);
    expect(nextIndex).toBeLessThan(adIndex); expect(adIndex).toBeLessThan(relatedIndex);
    expect(all.filter((node) => node.type === ResultAd)).toHaveLength(1);
    const resultCard = all.find((node) => node.type === SalaryResultCard)!;
    const cardTree = SalaryResultCard(resultCard.props as unknown as Parameters<typeof SalaryResultCard>[0]);
    const cardNodes = nodes(cardTree);
    expect(cardNodes.filter((node) => node.type === InArticleAd)).toHaveLength(1);
    expect(cardNodes.findIndex((node) => node.props["data-salary-result-summary"] !== undefined)).toBeLessThan(cardNodes.findIndex((node) => node.type === InArticleAd));
  });

  it("associates invalid salary attempts with that field and clears the relationship after recovery", () => {
    let tree = render();
    for (const value of ["0", "1,000,000,000,001"]) {
      tree = changeIncome(tree, value); tree = click(tree, "결과 확인하기");
      const income = nodes(tree).find(node => node.type === MoneyInput && node.props.label === "계약 연봉")!;
      expect(income.props["aria-invalid"]).toBe(true);
      expect(income.props["aria-describedby"]).toBe("salary-invalid-hint");
      expect(textOf(nodes(tree).find(node => node.props.id === "salary-invalid-hint"))).toContain("연 환산 1조 원 이하");
      expect(fixture.measurement.valid).toBe(false);
    }
    tree = changeIncome(tree, "50,000,000"); tree = click(tree, "결과 확인하기");
    const income = nodes(tree).find(node => node.type === MoneyInput && node.props.label === "계약 연봉")!;
    expect(income.props["aria-invalid"]).toBe(false); expect(income.props["aria-describedby"]).toBeUndefined();
    expect(fixture.measurement.valid).toBe(true);
  });

  it("links an excessive tax-free amount to its own input without marking valid salary invalid", () => {
    let tree = render();
    const taxFree = nodes(tree).find(node => node.type === MoneyInput && node.props.label === "월 비과세액")!;
    (taxFree.props.onValueChange as (value: string) => void)("5,000,000"); tree = render();
    tree = click(tree, "결과 확인하기");
    const inputs = nodes(tree).filter(node => node.type === MoneyInput);
    expect(inputs.find(node => node.props.label === "계약 연봉")?.props["aria-invalid"]).toBe(false);
    expect(inputs.find(node => node.props.label === "월 비과세액")?.props["aria-invalid"]).toBe(true);
    expect(inputs.find(node => node.props.label === "월 비과세액")?.props["aria-describedby"]).toBe("salary-nontaxable-hint");
    expect(textOf(nodes(tree).find(node => node.props.id === "salary-nontaxable-hint"))).toContain("세전 월급 이하");
    expect(fixture.measurement.valid).toBe(false);
  });
});
