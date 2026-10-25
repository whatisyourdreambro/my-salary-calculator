import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import YearEndTaxCalculator from "@/components/YearEndTaxCalculator";
import { calculationTracking } from "@/lib/calculationTracking";
import type { CalculationEvent } from "@/lib/calculationMeasurement";

// Reuse the offline hook/element approach from calculatorAccessibleStates.test.ts.
// The real measurement hook and state machine run, but delivery is an in-memory
// callback. No live-service switch, browser, analytics transport or network exists.
type Slot = { value?: unknown; dependencies?: readonly unknown[]; cleanup?: (() => void) | void };
const fixture = vi.hoisted(() => ({
  slots: [] as Slot[], cursor: 0, dirty: false, events: [] as CalculationEvent[],
  pending: [] as Array<{ slot: Slot; create: () => void | (() => void); dependencies?: readonly unknown[] }>,
}));
vi.mock("react", async (original) => ({ ...await original<typeof import("react")>(),
  useState: (initial: unknown) => {
    const slot = fixture.slots[fixture.cursor++] ??= { value: typeof initial === "function" ? initial() : initial };
    return [slot.value, (value: unknown) => {
      const next = typeof value === "function" ? value(slot.value) : value;
      if (!Object.is(next, slot.value)) { slot.value = next; fixture.dirty = true; }
    }];
  },
  useRef: (initial: unknown) => (fixture.slots[fixture.cursor++] ??= { value: { current: initial } }).value,
  useId: () => "pension-measurement-fixture",
  useMemo: (create: () => unknown) => create(), useCallback: (callback: unknown) => callback,
  useEffect: (create: () => void | (() => void), dependencies?: readonly unknown[]) => {
    const slot = fixture.slots[fixture.cursor++] ??= {};
    if (!slot.dependencies || !dependencies || dependencies.some((v, i) => !Object.is(v, slot.dependencies?.[i]))) {
      fixture.pending.push({ slot, create, dependencies });
    }
  },
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/year-end-tax" }));
vi.mock("@/lib/calculationTracking", async () => {
  const { createCalculationMeasurement } = await import("@/lib/calculationMeasurement");
  return { calculationTracking: createCalculationMeasurement(event => fixture.events.push(event)) };
});

class FixtureElement {
  constructor(readonly tagName: string, public value = "") {}
  closest(selector: string) { return selector.split(",").map(part => part.trim()).includes(this.tagName) ? this : null; }
}
class FixtureInput extends FixtureElement {
  readonly type = "range";
  readonly inputMode = "";
  constructor(value: string) { super("input", value); }
}
const visibleResult = new FixtureElement("div");
type Element = ReactElement<Record<string, unknown>>;

function expandSlider(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(expandSlider);
  if (!value || typeof value !== "object" || !("props" in value)) return value;
  const node = value as Element;
  // Expand the real child whose inputProps boundary is under regression review.
  // Other children need no synthetic mounting for this capture-path scenario.
  if (typeof node.type === "function" && node.type.name === "OptimizationSlider") {
    return expandSlider((node.type as (props: Record<string, unknown>) => unknown)(node.props));
  }
  return { ...node, props: { ...node.props, children: expandSlider(node.props.children) } };
}
function findPath(value: unknown, matches: (node: Element) => boolean): Element[] | null {
  if (Array.isArray(value)) {
    for (const child of value) { const found = findPath(child, matches); if (found) return found; }
    return null;
  }
  if (!value || typeof value !== "object" || !("props" in value)) return null;
  const node = value as Element;
  if (matches(node)) return [node];
  const child = findPath(node.props.children, matches);
  return child ? [node, ...child] : null;
}
function render() {
  for (let attempt = 0; attempt < 12; attempt++) {
    fixture.cursor = 0; fixture.pending = []; fixture.dirty = false;
    const tree = expandSlider(YearEndTaxCalculator());
    const result = findPath(tree, node => node.props["data-calculation-result"] === "year-end-tax")?.at(-1);
    expect(result).toBeDefined();
    (result!.props.ref as (element: unknown) => void)(visibleResult);
    for (const { slot, create, dependencies } of fixture.pending) {
      slot.cleanup?.(); slot.dependencies = dependencies; slot.cleanup = create();
    }
    if (!fixture.dirty) return tree;
  }
  throw new Error("Offline year-end measurement fixture did not settle");
}
function change(tree: unknown, label: string, target: FixtureElement) {
  const path = findPath(tree, node => node.props["aria-label"] === label);
  expect(path, label).not.toBeNull();
  // Model React's capture-before-change order. isTrusted is only a local fixture
  // input to the real hook, not a synthetic event sent to any running website.
  const event = { type: "change", nativeEvent: { isTrusted: true }, target };
  for (const node of path!) (node.props.onChangeCapture as ((event: unknown) => void) | undefined)?.(event);
  (path!.at(-1)!.props.onChange as (event: unknown) => void)(event);
  return render();
}
const calculationEvents = () => fixture.events.filter(event => event.name !== "result_view");

beforeEach(() => {
  fixture.slots = []; fixture.pending = []; fixture.cursor = 0; fixture.events = [];
  calculationTracking.visit("/offline-fixture-reset");
  vi.stubGlobal("Element", FixtureElement);
  vi.stubGlobal("HTMLInputElement", FixtureInput);
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private readonly callback: (entries: unknown[]) => void) {}
    observe() { this.callback([{ isIntersecting: true, intersectionRatio: 1 }]); }
    disconnect() {}
  });
  vi.stubGlobal("fetch", () => { throw new Error("Network forbidden in measurement fixture"); });
});
afterEach(() => { fixture.slots.forEach(slot => slot.cleanup?.()); vi.unstubAllGlobals(); });

describe("year-end pension control measurement boundary (offline)", () => {
  it("account viewing does not start/succeed; a real amount control change does, once per visit", () => {
    let tree = render();
    expect(fixture.events).toEqual([{ name: "result_view", pagePath: "/year-end-tax", calcType: "year_end_tax", resultOrigin: "default" }]);
    tree = change(tree, "조정할 연금계좌", new FixtureElement("select", "irp"));
    tree = change(tree, "조정할 연금계좌", new FixtureElement("select", "pensionSavings"));
    tree = change(tree, "조정할 연금계좌", new FixtureElement("select", "irp"));
    expect(calculationEvents()).toEqual([]);

    tree = change(tree, "IRP·퇴직연금 본인 납입액 조정", new FixtureInput("100000"));
    expect(calculationEvents()).toEqual([
      { name: "calc_start", pagePath: "/year-end-tax", calcType: "year_end_tax" },
      { name: "calc_success", pagePath: "/year-end-tax", calcType: "year_end_tax" },
    ]);
    tree = change(tree, "조정할 연금계좌", new FixtureElement("select", "pensionSavings"));
    change(tree, "연금저축 납입액 조정", new FixtureInput("200000"));
    expect(calculationEvents()).toHaveLength(2);
  });
});
