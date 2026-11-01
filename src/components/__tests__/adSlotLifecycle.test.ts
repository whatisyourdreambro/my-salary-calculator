// Offline AdSlot lifecycle check — no browser, no network, no ad loader.
// A tiny in-memory DOM is enough for react-dom/client; window.adsbygoogle is a plain
// array that only records push() calls, IntersectionObserver is a manual stub and
// the slot id is synthetic. Purpose: a same-path remount must never push twice.
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ path: "/fixture-a" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.path }));
vi.mock("@/lib/liveAds", () => ({ canRequestLiveAds: () => true }));
vi.mock("@/lib/vitalsAttribution", () => ({ viewportBucket: () => "m" }));
vi.mock("@/lib/analytics", () => ({
  trackAdFillStatus: () => {},
  trackAdRequestAttempt: () => {},
  trackAdRequestError: () => {},
  trackAdUnitClick: () => {},
}));

// ---------------------------------------------------------------- minimal DOM
class FakeNode {
  nodeType = 1;
  nodeName = "";
  parentNode: FakeNode | null = null;
  childNodes: FakeNode[] = [];
  nodeValue: string | null = null;
  namespaceURI = "http://www.w3.org/1999/xhtml";
  ownerDocument: FakeDocument | null = null;
  get firstChild(): FakeNode | null { return this.childNodes[0] ?? null; }
  get lastChild(): FakeNode | null { return this.childNodes[this.childNodes.length - 1] ?? null; }
  get nextSibling(): FakeNode | null {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.childNodes;
    return siblings[siblings.indexOf(this) + 1] ?? null;
  }
  get parentElement(): FakeNode | null { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
  appendChild(child: FakeNode) { child.parentNode?.removeChild(child); child.parentNode = this; this.childNodes.push(child); return child; }
  insertBefore(child: FakeNode, ref: FakeNode | null) {
    if (!ref) return this.appendChild(child);
    child.parentNode?.removeChild(child);
    child.parentNode = this;
    this.childNodes.splice(this.childNodes.indexOf(ref), 0, child);
    return child;
  }
  removeChild(child: FakeNode) { const i = this.childNodes.indexOf(child); if (i >= 0) this.childNodes.splice(i, 1); child.parentNode = null; return child; }
  addEventListener() {}
  removeEventListener() {}
  get textContent(): string { return this.nodeType === 3 ? this.nodeValue ?? "" : this.childNodes.map((c) => c.textContent).join(""); }
  set textContent(value: string) {
    if (this.nodeType === 3) { this.nodeValue = value; return; }
    this.childNodes.forEach((c) => { c.parentNode = null; });
    this.childNodes = [];
    if (value) { const t = new FakeText(value); t.ownerDocument = this.ownerDocument; this.appendChild(t); }
  }
  get isConnected(): boolean { let n: FakeNode | null = this.parentNode; let top = this.nodeType; while (n) { top = n.nodeType; n = n.parentNode; } return top === 9; }
}
class FakeText extends FakeNode {
  constructor(text: string) { super(); this.nodeType = 3; this.nodeName = "#text"; this.nodeValue = text; }
  get data() { return this.nodeValue ?? ""; }
  set data(v: string) { this.nodeValue = v; }
}
class FakeElement extends FakeNode {
  attrs = new Map<string, string>();
  style: Record<string, unknown> = { setProperty(k: string, v: string) { (this as Record<string, unknown>)[k] = v; }, removeProperty() {} };
  constructor(tag: string) { super(); this.nodeName = tag.toUpperCase(); }
  get tagName() { return this.nodeName; }
  setAttribute(name: string, value: unknown) { this.attrs.set(name, String(value)); }
  getAttribute(name: string) { return this.attrs.has(name) ? this.attrs.get(name)! : null; }
  hasAttribute(name: string) { return this.attrs.has(name); }
  removeAttribute(name: string) { this.attrs.delete(name); }
  getBoundingClientRect() { return { top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100 }; }
  contains(node: FakeNode | null): boolean { for (let n = node; n; n = n.parentNode) if (n === this) return true; return false; }
  // Supports the selectors AdPlacement uses: "ins.adsbygoogle[data-ad-slot]" and "ins.adsbygoogle".
  matches(selector: string) {
    const m = /^(\w+)?((?:\.[\w-]+)*)(?:\[([\w-]+)\])?$/.exec(selector.trim());
    if (!m) return false;
    const [, tag, classes, attr] = m;
    if (tag && this.nodeName !== tag.toUpperCase()) return false;
    const own = (this.getAttribute("class") ?? "").split(/\s+/);
    if (classes && classes.split(".").filter(Boolean).some((c) => !own.includes(c))) return false;
    if (attr && !this.hasAttribute(attr)) return false;
    return true;
  }
  querySelectorAll(selector: string): FakeElement[] {
    const out: FakeElement[] = [];
    const walk = (n: FakeNode) => n.childNodes.forEach((c) => { if (c instanceof FakeElement) { if (c.matches(selector)) out.push(c); walk(c); } });
    walk(this);
    return out;
  }
  querySelector(selector: string) { return this.querySelectorAll(selector)[0] ?? null; }
}
class FakeDocument extends FakeNode {
  body: FakeElement;
  documentElement: FakeElement;
  activeElement: FakeElement;
  defaultView: unknown = null;
  constructor() {
    super();
    this.nodeType = 9;
    this.nodeName = "#document";
    this.documentElement = this.createElement("html");
    this.appendChild(this.documentElement);
    this.body = this.createElement("body");
    this.documentElement.appendChild(this.body);
    this.activeElement = this.body;
  }
  createElement(tag: string) { const el = new FakeElement(tag); el.ownerDocument = this; return el; }
  createElementNS(_ns: string, tag: string) { return this.createElement(tag); }
  createTextNode(text: string) { const t = new FakeText(text); t.ownerDocument = this; return t; }
  querySelectorAll(selector: string) { return (this.documentElement as FakeElement).querySelectorAll(selector); }
  querySelector(selector: string) { return this.querySelectorAll(selector)[0] ?? null; }
}

type Observer = { callback: (entries: unknown[]) => void; target?: FakeElement; disconnected?: boolean };
const observers: Observer[] = [];
const pushes: unknown[] = [];

beforeAll(() => {
  const doc = new FakeDocument();
  const win = globalThis as unknown as Record<string, unknown>;
  win.window = globalThis;
  win.document = doc;
  doc.defaultView = globalThis;
  win.HTMLIFrameElement = class {};
  win.innerHeight = 800;
  win.innerWidth = 390;
  win.addEventListener = () => {};
  win.removeEventListener = () => {};
  win.IS_REACT_ACT_ENVIRONMENT = true;
  win.MutationObserver = class { observe() {} disconnect() {} };
  win.IntersectionObserver = class {
    o: Observer;
    constructor(callback: Observer["callback"]) { this.o = { callback }; observers.push(this.o); }
    observe(target: FakeElement) { this.o.target = target; }
    disconnect() { this.o.disconnected = true; }
  };
  // Synthetic queue: records requests, never loads anything.
  win.adsbygoogle = { push: (v: unknown) => { pushes.push(v); } };
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP = "1111111111";
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE = "2222222222";
});

afterEach(() => { observers.length = 0; pushes.length = 0; });

async function setup() {
  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const ads = await import("@/components/AdPlacement");
  const doc = (globalThis as unknown as { document: FakeDocument }).document;
  const container = doc.createElement("main");
  doc.body.appendChild(container);
  const root = createRoot(container as unknown as Element);
  const render = async (node: unknown) => { await React.act(async () => { root.render(node as never); }); };
  // Deliver "in viewport" to every live observer whose target is still attached, as the browser would.
  const scrollIntoView = async () => {
    await React.act(async () => {
      observers.filter((o) => !o.disconnected && o.target?.isConnected).forEach((o) => o.callback([{ target: o.target, isIntersecting: true }]));
    });
  };
  const cleanup = async () => { await React.act(async () => root.unmount()); container.parentNode?.removeChild(container); };
  const boxes = () => container.querySelectorAll(".ad-container").length;
  const { default: NotFoundAdPause } = await import("@/components/NotFoundAdPause");
  return { h: React.createElement, Fragment: React.Fragment, ads, render, scrollIntoView, cleanup, boxes, NotFoundAdPause };
}

describe("AdSlot request count per page view (offline)", () => {
  it("a stable instance pushes once across re-renders", async () => {
    nav.path = "/fixture-stable";
    const t = await setup();
    for (let i = 0; i < 5; i++) { await t.render(t.h("div", { "data-step": i }, t.h(t.ads.InArticleAd))); await t.scrollIntoView(); }
    expect(pushes).toHaveLength(1);
    await t.cleanup();
  });

  it("a conditional remount on the same path (replay round) does not push again", async () => {
    nav.path = "/fixture-replay";
    const t = await setup();
    const round = async (showAd: boolean) => { await t.render(t.h("div", null, showAd ? t.h(t.ads.InArticleAd) : null)); await t.scrollIntoView(); };
    await round(true);   // round 1 result
    expect(t.boxes()).toBe(1);
    await round(false);  // spin / replay
    await round(true);   // round 2 result
    await round(false);
    await round(true);   // round 3 result
    expect(pushes).toHaveLength(1);
    expect(t.boxes()).toBe(0); // no empty reserved box in later rounds
    await t.cleanup();
  });

  it("A -> B without any ad slot -> back to A is a new page view (root pause component resets the ledger)", async () => {
    nav.path = "/fixture-loop-a";
    const t = await setup();
    await t.render(t.h("div", null, t.h(t.NotFoundAdPause), t.h(t.ads.HomeTopAd)));
    await t.scrollIntoView();
    nav.path = "/fixture-loop-b";
    await t.render(t.h("div", null, t.h(t.NotFoundAdPause)));
    nav.path = "/fixture-loop-a";
    await t.render(t.h("div", null, t.h(t.NotFoundAdPause), t.h(t.ads.HomeTopAd)));
    await t.scrollIntoView();
    expect(pushes).toHaveLength(2);
    await t.cleanup();
  });

  it("two different slots on one page view each push once", async () => {
    nav.path = "/fixture-two";
    const t = await setup();
    await t.render(t.h("div", null, t.h(t.ads.HomeTopAd), t.h(t.ads.InArticleAd)));
    await t.scrollIntoView();
    expect(pushes).toHaveLength(2);
    await t.cleanup();
  });

  it("a keyed remount on the same path (list filter) does not push again", async () => {
    nav.path = "/fixture-list";
    const t = await setup();
    for (const key of ["company-a", "company-b", "company-c"]) {
      await t.render(t.h("div", null, t.h(t.Fragment, { key }, t.h(t.ads.HomeTopAd))));
      await t.scrollIntoView();
    }
    expect(pushes).toHaveLength(1);
    await t.cleanup();
  });

  it("a new pathname is a new page view and may push again", async () => {
    nav.path = "/fixture-nav-a";
    const t = await setup();
    await t.render(t.h("div", null, t.h(t.ads.HomeTopAd)));
    await t.scrollIntoView();
    nav.path = "/fixture-nav-b";
    await t.render(t.h("div", { "data-path": "b" }, t.h(t.ads.HomeTopAd)));
    await t.scrollIntoView();
    expect(pushes).toHaveLength(2);
    await t.cleanup();
  });

  it("a page-level instance that remounts on a new pathname may push again", async () => {
    nav.path = "/fixture-page-a";
    const t = await setup();
    await t.render(t.h("div", null, t.h(t.Fragment, { key: "/fixture-page-a" }, t.h(t.ads.HomeTopAd))));
    await t.scrollIntoView();
    nav.path = "/fixture-page-b";
    await t.render(t.h("div", null, t.h(t.Fragment, { key: "/fixture-page-b" }, t.h(t.ads.HomeTopAd))));
    await t.scrollIntoView();
    expect(pushes).toHaveLength(2);
    expect(t.boxes()).toBe(1);
    await t.cleanup();
  });

  it("an instance unmounted before it was ever visible does not consume the page-view request", async () => {
    nav.path = "/fixture-early";
    const t = await setup();
    await t.render(t.h("div", null, t.h(t.Fragment, { key: "a" }, t.h(t.ads.HomeTopAd))));
    // no scrollIntoView: never requested
    await t.render(t.h("div", null, t.h(t.Fragment, { key: "b" }, t.h(t.ads.HomeTopAd))));
    await t.scrollIntoView();
    expect(pushes).toHaveLength(1);
    await t.cleanup();
  });
});
