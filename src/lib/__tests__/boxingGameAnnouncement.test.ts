import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CompanyProfile } from "@/types/company";
import type { ComparisonResult } from "@/lib/versusEngine";

// Run the component's real timer/event logic against inert React elements.
// This verifies status updates, not browser accessibility events or NVDA speech.
const hooks = vi.hoisted(() => {
  type Slot = { value?: unknown; deps?: unknown[]; cleanup?: (() => void) | void };
  const state = { slots: [] as Slot[], cursor: 0, dirty: false, effects: [] as (() => void)[] };
  return {
    state,
    useState(initial: unknown) {
      const slot = state.slots[state.cursor++] ??= { value: initial };
      return [slot.value, (next: unknown) => {
        const value = typeof next === "function" ? next(slot.value) : next;
        if (!Object.is(value, slot.value)) { slot.value = value; state.dirty = true; }
      }];
    },
    useRef(initial: unknown) {
      const slot = state.slots[state.cursor++] ??= { value: { current: initial } };
      return slot.value;
    },
    useEffect(effect: () => (() => void) | void, deps: unknown[]) {
      const slot = state.slots[state.cursor++] ??= {};
      if (!slot.deps || deps.some((value, index) => !Object.is(value, slot.deps?.[index]))) {
        slot.deps = deps;
        state.effects.push(() => { slot.cleanup?.(); slot.cleanup = effect(); });
      }
    },
  };
});
vi.mock("react", async importOriginal => ({ ...await importOriginal<typeof import("react")>(), ...hooks }));
vi.mock("framer-motion", () => ({ motion: { div: "div" }, AnimatePresence: "div" }));
vi.mock("@/hooks/useModalDialog", () => ({ useModalDialog: vi.fn() }));

import BoxingGame from "@/components/BoxingGame";

type Element = ReactElement<Record<string, unknown>>;
const companyA = { name: { ko: "가 회사" } } as CompanyProfile;
const companyB = { name: { ko: "나 회사" } } as CompanyProfile;
const comparison = (winner: "a" | "b") => ({ metrics: { totalComp: { winner } } }) as ComparisonResult;
let tree: Element;
let props: Parameters<typeof BoxingGame>[0];
let announcements: string[];

function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}
function text(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join("");
  return node && typeof node === "object" && "props" in node ? text((node as Element).props.children) : "";
}
function status() {
  const statuses = elements(tree).filter(element => element.props.role === "status");
  expect(statuses).toHaveLength(1);
  return statuses[0];
}
function flush() {
  for (let iteration = 0; iteration < 20; iteration++) {
    hooks.state.cursor = 0;
    hooks.state.dirty = false;
    tree = BoxingGame(props);
    hooks.state.effects.splice(0).forEach(effect => effect());
    if (!hooks.state.dirty) {
      const message = text(status());
      if (announcements.at(-1) !== message) announcements.push(message);
      return;
    }
  }
  throw new Error("Boxing game state did not settle");
}
function tick(count = 1) {
  for (let index = 0; index < count; index++) { vi.advanceTimersByTime(600); flush(); }
}
function cleanup() {
  hooks.state.slots.forEach(slot => { slot.cleanup?.(); slot.cleanup = undefined; });
}
function reset() {
  hooks.state.slots = []; hooks.state.cursor = 0; hooks.state.effects = [];
  announcements = [];
}
function button(label: string) {
  const found = elements(tree).find(element => element.type === "button" && text(element) === label);
  expect(found, label).toBeDefined();
  return found!;
}

beforeEach(() => {
  reset();
  props = { companyA, companyB, result: comparison("a"), onFinish: vi.fn() };
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  vi.stubGlobal("fetch", () => { throw new Error("Network forbidden in boxing tests"); });
});
afterEach(() => {
  cleanup(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals();
});

describe("boxing game completion announcement", () => {
  it("keeps one empty polite atomic status mounted while combat updates stay outside it", () => {
    flush();
    expect(tree.props.children).toContain(status());
    expect(status().props).toMatchObject({
      "aria-live": "polite", "aria-atomic": "true",
      className: "sr-only", "data-game-announcement": "salary-battle",
    });
    expect(text(status())).toBe("");
    expect(button("애니메이션 건너뛰고 결과 보기").props.autoFocus).toBe(true);
    tick(3);
    expect(text(tree)).toContain("가 회사의 강력한 펀치!");
    expect(announcements).toEqual([""]);
    expect(elements(tree).filter(element => element.props["aria-live"] || element.props.role === "alert")).toEqual([status()]);
  });

  it.each([
    { comparisonWinner: "a", roll: 0, ticks: 7, name: "가 회사" },
    { comparisonWinner: "b", roll: 0, ticks: 7, name: "나 회사" },
    // The game is random: announce its actual winner, not the salary comparison's winner.
    { comparisonWinner: "a", roll: 0.99, ticks: 13, name: "나 회사" },
  ] as const)("announces the actual winner once ($name, comparison $comparisonWinner)", scenario => {
    props.result = comparison(scenario.comparisonWinner);
    vi.mocked(Math.random).mockReturnValue(scenario.roll);
    flush(); tick(scenario.ticks - 1);
    expect(text(status())).toBe("");
    tick();
    const expected = `게임이 끝났습니다. ${scenario.name} 승리. 재미용 게임 결과이며 실제 보상 비교 결과와 별개입니다. 결과 확인하기 버튼으로 비교 결과를 볼 수 있습니다.`;
    expect(text(status())).toBe(expected);
    expect(text(tree)).toContain("KO!");
    tick(10);
    expect(announcements).toEqual(["", expected]);
    expect(props.onFinish).not.toHaveBeenCalled();
    (button("결과 확인하기").props.onClick as () => void)();
    expect(props.onFinish).toHaveBeenCalledTimes(1);
  });

  it.each(["skip", "cancel"] as const)("does not complete a dismissed game, and reopens with an empty status (%s)", action => {
    flush(); tick(2);
    if (action === "skip") (button("애니메이션 건너뛰고 결과 보기").props.onClick as () => void)();
    else {
      const preventDefault = vi.fn();
      (tree.props.onCancel as (event: { preventDefault: () => void }) => void)({ preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
    }
    expect(props.onFinish).toHaveBeenCalledTimes(1);
    cleanup();
    vi.advanceTimersByTime(20_000);
    expect(announcements).toEqual([""]);
    expect(vi.getTimerCount()).toBe(0);
    reset(); flush();
    expect(text(status())).toBe("");
    expect(elements(tree).some(element => text(element) === "KO!")).toBe(false);
    tick(7);
    expect(text(status())).toContain("가 회사 승리.");
  });
});
