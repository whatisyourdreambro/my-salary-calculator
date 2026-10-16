import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

// Offline hook harness: real page event handlers/effects run, but no DOM,
// browser, ad component, animation or network request is created.
const hooks = vi.hoisted(() => {
  type Slot = { value?: unknown; deps?: unknown[]; cleanup?: (() => void) | void };
  const state = { slots: [] as Slot[], cursor: 0, dirty: false, effects: [] as (() => void)[], strictUpdaters: false };
  const changed = (a?: unknown[], b?: unknown[]) => !a || !b || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
  return {
    state,
    useState(initial: unknown) {
      const index = state.cursor++;
      const slot = state.slots[index] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slot.value, (next: unknown) => {
        if (state.strictUpdaters && typeof next === "function") next(slot.value);
        const value = typeof next === "function" ? next(slot.value) : next;
        if (!Object.is(value, slot.value)) { slot.value = value; state.dirty = true; }
      }];
    },
    useRef(value: unknown) {
      const slot = state.slots[state.cursor++] ??= { value: { current: value } };
      return slot.value;
    },
    useCallback(value: unknown, deps: unknown[]) {
      const index = state.cursor++;
      if (changed(state.slots[index]?.deps, deps)) state.slots[index] = { value, deps };
      return state.slots[index].value;
    },
    useEffect(effect: () => (() => void) | void, deps?: unknown[]) {
      const index = state.cursor++;
      const slot = state.slots[index] ??= {};
      if (changed(slot.deps, deps)) {
        slot.deps = deps;
        state.effects.push(() => { slot.cleanup?.(); slot.cleanup = effect(); });
      }
    },
  };
});
vi.mock("react", async (importOriginal) => ({ ...await importOriginal<typeof import("react")>(), ...hooks }));
vi.mock("framer-motion", () => ({ motion: { div: "div" }, AnimatePresence: "div" }));
vi.mock("@/components/AdPlacement", () => ({ InArticleAd: () => null }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => null }));
const confetti = vi.hoisted(() => vi.fn());
vi.mock("canvas-confetti", () => ({ default: confetti }));

import TetrisPage from "./tetris/page";
import AssetAllocatorGame from "./asset-allocator/page";

type Element = ReactElement<Record<string, unknown>>;
let tree: Element;
let currentPage: () => Element;
const listeners = new Map<string, (event: unknown) => void>();
const canvas = { width: 600, height: 560 };

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
function flush() {
  for (let i = 0; i < 20; i++) {
    hooks.state.cursor = 0;
    hooks.state.dirty = false;
    tree = currentPage();
    for (const element of elements(tree)) {
      if (element.type === "canvas") ((element as unknown as { ref: { current: unknown } }).ref).current = canvas;
    }
    hooks.state.effects.splice(0).forEach(effect => effect());
    if (!hooks.state.dirty) return;
  }
  throw new Error("Page did not settle");
}
function click(label: string) {
  const button = elements(tree).find(e => e.type === "button" && (e.props["aria-label"] === label || text(e.props.children).includes(label)));
  expect(button, `button ${label}`).toBeDefined();
  (button!.props.onClick as () => void)();
  flush();
}
function activeRows() {
  const grid = elements(tree).find(e => String(e.props.className).includes("grid-cols-10 grid-rows-20"))!;
  return elements(grid.props.children).flatMap((e, index) => String(e.props.className).includes("shadow-[0_0_10px") ? [Math.floor(index / 10)] : []);
}

beforeEach(() => {
  hooks.state.slots = []; hooks.state.cursor = 0; hooks.state.effects = []; hooks.state.strictUpdaters = false;
  listeners.clear(); confetti.mockClear(); vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  vi.stubGlobal("HTMLElement", class {});
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("window", {
    innerWidth: 800, innerHeight: 800,
    setInterval, clearInterval,
    addEventListener: (type: string, handler: (event: unknown) => void) => listeners.set(type, handler),
    removeEventListener: (type: string) => listeners.delete(type),
  });
});
afterEach(() => {
  hooks.state.slots.forEach(slot => slot.cleanup?.());
  vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals();
});

describe("game lifecycle regressions", () => {
  it.each([TetrisPage, AssetAllocatorGame])("ignores a corrupted saved high score", page => {
    vi.stubGlobal("localStorage", { getItem: () => "broken", setItem: vi.fn() });
    currentPage = page; flush();
    expect(text(tree)).not.toContain("NaN");
  });

  it("keeps gravity running while the player repeatedly moves sideways", () => {
    currentPage = TetrisPage; flush(); click("START GAME");
    expect(activeRows()).toEqual([0, 0, 0, 0]);
    vi.advanceTimersByTime(400); flush(); click("블록 왼쪽 이동");
    vi.advanceTimersByTime(400); flush();
    expect(activeRows()).toEqual([1, 1, 1, 1]);
    click("블록 오른쪽 이동");
    vi.advanceTimersByTime(800); flush();
    expect(activeRows()).toEqual([2, 2, 2, 2]);
  });

  it("allows normal keyboard scrolling before a tetris game starts", () => {
    currentPage = TetrisPage; flush();
    const preventDefault = vi.fn();
    listeners.get("keydown")!({ key: "ArrowDown", preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("finishes the asset game once when React replays state updaters", async () => {
    currentPage = AssetAllocatorGame; hooks.state.strictUpdaters = true;
    flush(); click("PLAY NOW");
    for (let second = 0; second < 60; second++) { vi.advanceTimersByTime(1000); flush(); }
    await vi.dynamicImportSettled();
    expect(text(tree)).toContain("SESSION CLOSED");
    expect(confetti).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels the asset animation when leaving the page", () => {
    currentPage = AssetAllocatorGame; flush(); click("PLAY NOW");
    hooks.state.slots.forEach(slot => { slot.cleanup?.(); slot.cleanup = undefined; });
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
