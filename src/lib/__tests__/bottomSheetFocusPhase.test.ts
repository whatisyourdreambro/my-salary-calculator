import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import BottomSheet from "@/components/BottomSheet";

type Slot = { value?: unknown; dependencies?: readonly unknown[]; cleanup?: (() => void) | void };
type Effect = { slot: Slot; create: () => void | (() => void); dependencies?: readonly unknown[] };
const hooks = vi.hoisted(() => ({
  slots: [] as Slot[], cursor: 0, dirty: false,
  layout: [] as Effect[], passive: [] as Effect[],
}));
vi.mock("react", async original => {
  const register = (queue: Effect[], create: Effect["create"], dependencies?: readonly unknown[]) => {
    const slot = hooks.slots[hooks.cursor++] ??= {};
    if (!slot.dependencies || !dependencies || dependencies.some((value, i) => !Object.is(value, slot.dependencies?.[i]))) {
      queue.push({ slot, create, dependencies });
    }
  };
  return {
    ...await original<typeof import("react")>(),
    useId: () => "sheet-title",
    useRef: (value: unknown) => (hooks.slots[hooks.cursor++] ??= { value: { current: value } }).value,
    useState: (initial: unknown) => {
      const slot = hooks.slots[hooks.cursor++] ??= { value: initial };
      return [slot.value, (update: unknown) => {
        const next = typeof update === "function" ? update(slot.value) : update;
        if (!Object.is(slot.value, next)) { slot.value = next; hooks.dirty = true; }
      }];
    },
    useLayoutEffect: (create: Effect["create"], dependencies?: readonly unknown[]) => register(hooks.layout, create, dependencies),
    useEffect: (create: Effect["create"], dependencies?: readonly unknown[]) => register(hooks.passive, create, dependencies),
  };
});
vi.mock("framer-motion", () => ({ motion: { div: "div" }, AnimatePresence: "presence", useReducedMotion: () => true }));
vi.mock("@/lib/bottomSheetLayout", () => ({
  // Fixed synthetic geometry: no ad detection, timer, browser, or network access.
  observeBottomSheetSpace: (receive: (value: unknown) => void) => {
    receive({ bottom: 0, maxHeight: 680, paddingBottom: 0 });
    return () => {};
  },
}));

type Listener = (event: { target: NodeStub }) => void;
class DocumentStub {
  body = new NodeStub(this, "body");
  activeElement = this.body;
  listeners = new Map<string, Set<Listener>>();
  addEventListener(name: string, listener: Listener) {
    const set = this.listeners.get(name) ?? new Set<Listener>(); set.add(listener); this.listeners.set(name, set);
  }
  removeEventListener(name: string, listener: Listener) { this.listeners.get(name)?.delete(listener); }
}
class NodeStub {
  parentElement: NodeStub | null = null;
  children: NodeStub[] = [];
  attrs = new Map<string, string>();
  style = { overflow: "" };
  constructor(public ownerDocument: DocumentStub, public tag = "div") {}
  get tagName() { return this.tag.toUpperCase(); }
  get nodeType() { return 1; }
  get childNodes() { return this.children; }
  get isConnected(): boolean { return this === this.ownerDocument.body || Boolean(this.parentElement?.isConnected); }
  get tabIndex() { return Number(this.attrs.get("tabindex") ?? (this.tag === "button" ? 0 : -1)); }
  getAttribute(name: string) { return this.attrs.get(name) ?? null; }
  getAttributeNames() { return [...this.attrs.keys()]; }
  hasAttribute(name: string) { return this.attrs.has(name); }
  setAttribute(name: string, value: string) { this.attrs.set(name, value); }
  removeAttribute(name: string) { this.attrs.delete(name); }
  append(node: NodeStub) { node.parentElement = this; this.children.push(node); }
  contains(node: NodeStub | null): boolean { return node === this || this.children.some(child => child.contains(node)); }
  closest(selector: string): NodeStub | null {
    return [...selector.matchAll(/\[([^\]]+)\]/g)].some(match => this.hasAttribute(match[1]))
      ? this : this.parentElement?.closest(selector) ?? null;
  }
  querySelectorAll(): NodeStub[] {
    return this.children.flatMap(child => [
      ...(["button", "input"].includes(child.tag) || child.hasAttribute("tabindex") ? [child] : []),
      ...child.querySelectorAll(),
    ]);
  }
  matches() { return false; }
  getClientRects() { return this.isConnected ? [{}] : []; }
  focus() {
    if (!this.isConnected || this.closest("[inert]")) return;
    this.ownerDocument.activeElement = this;
    for (const listener of this.ownerDocument.listeners.get("focusin") ?? []) listener({ target: this });
  }
}
class InputStub extends NodeStub {}
type Element = ReactElement<Record<string, unknown>>;
function elements(value: unknown): Element[] {
  if (Array.isArray(value)) return value.flatMap(elements);
  if (!value || typeof value !== "object" || !("props" in value)) return [];
  const element = value as Element;
  return [element, ...elements(element.props.children)];
}
function cleanup(queue: Effect[]) {
  for (const effect of queue) effect.slot.cleanup?.();
}
function mount(queue: Effect[]) {
  for (const effect of queue) {
    effect.slot.dependencies = effect.dependencies;
    effect.slot.cleanup = effect.create();
  }
}

// Execute the actual component and modal focus implementation, but explicitly
// model the relevant installed React/Framer ordering: exiting DOM is retained,
// layout cleanup runs during mutation, React restores a still-connected previous
// focus, then layout setup and passive effects run. Geometry's setSpace(null)
// removes the retained DOM in another commit. This is a deterministic phase
// fixture, not an actual React renderer, animation, or browser scheduling proof.
function fixture() {
  const doc = new DocumentStub(), page = new NodeStub(doc), opener = new NodeStub(doc, "button");
  const other = new NodeStub(doc, "button");
  doc.body.append(page); page.append(opener); page.append(other); opener.focus();
  vi.stubGlobal("document", doc);
  let open = false;
  let sheet: NodeStub | null = null, backdrop: NodeStub | null = null;
  let close: NodeStub | null = null, clickClose: (() => void) | undefined;
  const phases: { name: string; active: NodeStub; retainedSheet: NodeStub | null }[] = [];
  const selectionRestorations: NodeStub[] = [];
  const record = (name: string) => phases.push({ name, active: doc.activeElement, retainedSheet: sheet });
  const onClose = () => commit(false);
  function commit(nextOpen: boolean) {
    // Callers explicitly flush the previous passive phase before another update.
    expect(hooks.passive).toHaveLength(0);
    const priorFocused = doc.activeElement;
    open = nextOpen; hooks.cursor = 0; hooks.layout = []; hooks.passive = []; hooks.dirty = false;
    const tree = elements(BottomSheet({ isOpen: open, onClose, title: "비과세액 설정", children: null }));
    const surface = tree.find(node => node.props.role === "dialog");
    if (surface) {
      if (!sheet) {
        backdrop = new NodeStub(doc); backdrop.setAttribute("aria-hidden", "true"); page.append(backdrop);
        sheet = new NodeStub(doc); sheet.setAttribute("tabindex", "-1"); page.append(sheet);
        close = new NodeStub(doc, "button"); sheet.append(close);
      }
      (surface.props.ref as { current: unknown }).current = sheet;
      const shade = tree.find(node => node.props["aria-hidden"] === "true")!;
      (shade.props.ref as { current: unknown }).current = backdrop;
      clickClose = tree.find(node => node.type === "button")!.props.onClick as () => void;
    } else if (sheet && !tree.some(node => node.type === "presence")) {
      // AnimatePresence retains an exiting child while it remains mounted.
      // The later geometry update unmounts AnimatePresence itself.
      if (sheet.contains(doc.activeElement)) doc.activeElement = doc.body;
      page.children = page.children.filter(node => node !== sheet && node !== backdrop);
      sheet.parentElement = null; backdrop!.parentElement = null;
      sheet = null; backdrop = null; close = null;
    }
    const layout = hooks.layout; hooks.layout = [];
    cleanup(layout);
    record("mutation-cleanup");
    // React resetAfterCommit restores selection/focus after mutation effects,
    // even when an application's layout cleanup just focused its opener.
    if (priorFocused.isConnected && doc.activeElement !== priorFocused) {
      priorFocused.focus();
      selectionRestorations.push(priorFocused);
    }
    record("selection-restoration");
    mount(layout);
    record("layout-setup");
  }
  function passive() {
    const queue = hooks.passive; hooks.passive = [];
    cleanup(queue); mount(queue);
    record("passive-effects");
    if (hooks.dirty) commit(open);
  }
  function settle() {
    for (let i = 0; hooks.passive.length && i < 8; i++) passive();
    expect(hooks.passive).toHaveLength(0);
  }
  commit(false); settle();
  return {
    doc, opener, other, phases, selectionRestorations, commit, passive, settle,
    openBeforePassiveFocus() { commit(true); passive(); expect(sheet).not.toBeNull(); },
    get sheet() { return sheet; }, get close() { return close; },
    clickClose() { expect(clickClose).toBeTypeOf("function"); clickClose!(); },
  };
}

beforeEach(() => {
  hooks.slots = []; hooks.cursor = 0; hooks.layout = []; hooks.passive = []; hooks.dirty = false;
  vi.stubGlobal("HTMLElement", NodeStub); vi.stubGlobal("HTMLInputElement", InputStub);
  vi.stubGlobal("MutationObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("getComputedStyle", () => ({ visibility: "visible" }));
  vi.stubGlobal("fetch", () => { throw new Error("Network forbidden in BottomSheet phase tests"); });
});
afterEach(() => {
  for (const slot of hooks.slots.toReversed()) slot.cleanup?.();
  vi.unstubAllGlobals();
});

describe("BottomSheet focus commit boundary (offline phase fixture)", () => {
  it("captures the original opener in the opening layout before deferred geometry and activation", () => {
    const app = fixture(); app.commit(true);
    // Geometry is still deferred; a later activeElement is not the opener.
    app.other.focus(); app.passive(); app.settle();
    expect(app.doc.activeElement).toBe(app.sheet);
    expect(app.opener.hasAttribute("inert")).toBe(true);
    expect(app.doc.body.style.overflow).toBe("hidden");
    app.close!.focus(); app.clickClose(); app.settle();
    expect(app.doc.activeElement).toBe(app.opener);
    expect(app.opener.hasAttribute("inert")).toBe(false);
  });
  it("releases focus after React selection restoration and before retained exit DOM is removed", () => {
    const app = fixture(); app.openBeforePassiveFocus(); app.settle();
    const exitingSheet = app.sheet, exitingClose = app.close;
    app.close!.focus(); app.phases.length = 0; app.clickClose();
    expect(app.sheet).toBe(exitingSheet);
    expect(exitingSheet!.isConnected).toBe(true);
    // Until passive cleanup the connected control may still own focus.
    expect(app.doc.activeElement).toBe(exitingClose);
    app.passive();
    expect(app.phases.find(phase => phase.name === "passive-effects")).toMatchObject({
      active: app.opener, retainedSheet: exitingSheet,
    });
    expect(app.sheet).toBeNull();
    expect(app.doc.activeElement).toBe(app.opener);
    expect(app.opener.hasAttribute("inert")).toBe(false);
    expect(app.doc.body.style.overflow).toBe("");
    app.settle();
  });
  it("does not capture a sheet control when activation runs after it receives focus", () => {
    const app = fixture(); app.openBeforePassiveFocus();
    app.close!.focus(); app.passive();
    expect(app.doc.activeElement).toBe(app.sheet);
    app.close!.focus(); app.clickClose(); app.settle();
    expect(app.doc.activeElement).toBe(app.opener);
    expect(app.doc.listeners.get("focusin")?.size).toBe(0);
  });
  it("preserves the opener through immediate reopening, deferred activation, and closing again", () => {
    const app = fixture(); app.openBeforePassiveFocus(); app.settle();
    app.close!.focus(); app.clickClose(); app.settle();
    expect(app.doc.activeElement).toBe(app.opener);
    app.openBeforePassiveFocus();
    // Move as soon as the second visible DOM exists, before deferred effects.
    app.close!.focus(); app.passive(); app.clickClose(); app.settle();
    expect(app.doc.activeElement).toBe(app.opener);
    expect(app.opener.hasAttribute("inert")).toBe(false);
    expect(app.doc.listeners.get("focusin")?.size).toBe(0);
  });
});
