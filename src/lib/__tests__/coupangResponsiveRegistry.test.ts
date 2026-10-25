import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ReactElement } from "react";
import CoupangBannerCore, { type CoupangBannerProps } from "@/components/affiliate/CoupangBannerCore";

// Execute the real component and its private registry with isolated hook slots.
// No DOM/renderer/browser exists: returned <img> objects never load resources.
// No click or impression callbacks are invoked. The real live-service gate runs
// against the same synthetic visitor objects used by liveServices.test.ts.
type Slot = { value?: unknown; dependencies?: readonly unknown[]; cleanup?: (() => void) | void };
type Element = ReactElement<Record<string, unknown>>;
type Instance = { name: string; pathname: string; props: CoupangBannerProps; slots: Slot[]; cursor: number; tree?: Element | null };
const fixture = vi.hoisted(() => ({
  current: null as Instance | null, dirty: false,
  pending: [] as Array<{ slot: Slot; create: () => void | (() => void); dependencies?: readonly unknown[] }>,
  resize: new Set<() => void>(), clicks: vi.fn(),
  network: vi.fn(() => { throw new Error("Network forbidden in offline banner fixture"); }),
}));
function effect(create: () => void | (() => void), dependencies?: readonly unknown[]) {
  const instance = fixture.current!;
  const slot = instance.slots[instance.cursor++] ??= {};
  if (!slot.dependencies || !dependencies || slot.dependencies.length !== dependencies.length || dependencies.some((value, index) => !Object.is(value, slot.dependencies?.[index]))) {
    fixture.pending.push({ slot, create, dependencies });
  }
}
vi.mock("react", async (original) => ({ ...await original<typeof import("react")>(),
  useState: (initial: unknown) => {
    const instance = fixture.current!;
    const slot = instance.slots[instance.cursor++] ??= { value: typeof initial === "function" ? initial() : initial };
    return [slot.value, (value: unknown) => {
      const next = typeof value === "function" ? value(slot.value) : value;
      if (!Object.is(next, slot.value)) { slot.value = next; fixture.dirty = true; }
    }];
  },
  useEffect: (create: () => void | (() => void), dependencies?: readonly unknown[]) => effect(create, dependencies),
  useSyncExternalStore: (subscribe: (callback: () => void) => () => void, getSnapshot: () => unknown) => {
    effect(() => subscribe(() => { fixture.dirty = true; }), [subscribe]);
    return getSnapshot();
  },
}));
vi.mock("next/navigation", () => ({ usePathname: () => fixture.current!.pathname }));
vi.mock("@/lib/analytics", () => ({ trackCoupangClick: fixture.clicks }));

const instances: Instance[] = [];
const frames: Array<Array<{ name: string; path: string; size: unknown; disclosure: boolean }>> = [];
function children(node: Element) { return (Array.isArray(node.props.children) ? node.props.children : [node.props.children]).filter(value => value && typeof value === "object") as Element[]; }
function currentFrame() {
  return instances.filter(instance => instance.tree).map(instance => ({
    name: instance.name, path: instance.pathname, size: instance.tree!.props["data-coupang-banner-size"],
    disclosure: children(instance.tree!).some(child => child.type === "p"),
  }));
}
function render() {
  for (let pass = 0; pass < 20; pass++) {
    fixture.pending = []; fixture.dirty = false;
    for (const instance of instances) {
      fixture.current = instance; instance.cursor = 0;
      instance.tree = CoupangBannerCore(instance.props) as Element | null;
    }
    fixture.current = null;
    frames.push(currentFrame()); // Includes the initial/stale render before effects.
    for (const { slot, create, dependencies } of fixture.pending) {
      slot.cleanup?.(); slot.dependencies = dependencies?.slice(); slot.cleanup = create();
    }
    if (!fixture.dirty) return;
  }
  throw new Error("Offline banner fixture did not settle");
}
function add(name: string, props: CoupangBannerProps, pathname = "/guides/offline-fixture") {
  const instance = { name, props, pathname, slots: [], cursor: 0 } as Instance;
  instances.push(instance); return instance;
}
function guidePair() {
  add("body", { responsive: { mobile: "mobile-banner", desktop: "large-portrait" } });
  add("footer", { responsive: { mobile: "mobile-banner", desktop: "leaderboard" } });
  render();
}
function resize(width: number) { window.innerWidth = width; for (const callback of [...fixture.resize]) callback(); render(); }
function remove(instance: Instance) {
  instances.splice(instances.indexOf(instance), 1);
  for (const slot of instance.slots) slot.cleanup?.();
  render();
}
function visible() { return currentFrame().map(({ name, size, disclosure }) => ({ name, size, disclosure })); }

beforeEach(() => {
  fixture.current = null; fixture.pending = []; fixture.resize.clear(); fixture.clicks.mockClear(); fixture.network.mockClear(); frames.length = 0;
  vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "0");
  const storage = new Map<string, string>();
  const browser = {
    innerWidth: 1024, location: new URL("https://www.moneysalary.com/guides/offline-fixture"),
    navigator: { webdriver: false, userAgent: "Synthetic visitor fixture", sendBeacon: fixture.network },
    frameElement: null,
    sessionStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
    addEventListener(type: string, callback: () => void) { expect(type).toBe("resize"); fixture.resize.add(callback); },
    removeEventListener(type: string, callback: () => void) { expect(type).toBe("resize"); fixture.resize.delete(callback); },
  };
  Object.assign(browser, { top: browser, parent: browser });
  vi.stubGlobal("window", browser);
  vi.stubGlobal("fetch", fixture.network);
  vi.stubGlobal("XMLHttpRequest", fixture.network);
  vi.stubGlobal("WebSocket", fixture.network);
  vi.stubGlobal("Image", fixture.network);
  vi.stubGlobal("navigator", browser.navigator);
});
afterEach(() => {
  for (const frame of frames) for (const path of new Set(frame.map(row => row.path))) {
    const page = frame.filter(row => row.path === path);
    expect(page.length).toBeLessThanOrEqual(2);
    expect(new Set(page.map(row => row.size)).size).toBe(page.length);
    expect(page.filter(row => row.disclosure).length).toBeLessThanOrEqual(1);
  }
  for (const instance of [...instances]) remove(instance);
  expect(fixture.resize.size).toBe(0);
  expect(fixture.network).not.toHaveBeenCalled(); expect(fixture.clicks).not.toHaveBeenCalled();
  vi.unstubAllGlobals(); vi.unstubAllEnvs();
});

describe("Coupang existing-slot responsive arbitration (offline)", () => {
  it("uses the existing body/footer sizes and admits nothing before registration", () => {
    expect(readFileSync(resolve(process.cwd(), "src/app/guides/[slug]/GuidePageClient.tsx"), "utf8")).toContain('responsive={{ mobile: "mobile-banner", desktop: "large-portrait" }}');
    expect(readFileSync(resolve(process.cwd(), "src/components/PageFooterAds.tsx"), "utf8")).toContain('responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}');
    guidePair();
    expect(frames[0]).toEqual([]);
    expect(visible()).toEqual([{ name: "body", size: "large-portrait", disclosure: true }, { name: "footer", size: "leaderboard", disclosure: false }]);
  });
  it("1024→390→1024 suppresses a duplicate and restores only the existing eligible slot", () => {
    guidePair(); resize(390);
    expect(visible()).toEqual([{ name: "body", size: "mobile-banner", disclosure: true }]);
    resize(1024);
    expect(visible()).toEqual([{ name: "body", size: "large-portrait", disclosure: true }, { name: "footer", size: "leaderboard", disclosure: false }]);
  });
  it("a fresh mobile visit and both sides of 767/768 obey the same rules", () => {
    window.innerWidth = 390; guidePair();
    expect(visible()).toEqual([{ name: "body", size: "mobile-banner", disclosure: true }]);
    resize(768); expect(visible().map(row => row.size)).toEqual(["large-portrait", "leaderboard"]);
    resize(767); expect(visible()).toEqual([{ name: "body", size: "mobile-banner", disclosure: true }]);
    resize(768); expect(visible().map(row => row.size)).toEqual(["large-portrait", "leaderboard"]);
  });
  it("max-two and same-size waiters recover after owners unmount, with one disclosure", () => {
    const first = add("first", { size: "mobile-banner" });
    add("duplicate", { size: "mobile-banner" });
    const second = add("second", { size: "rectangle" });
    add("capped", { size: "skyscraper" }); render();
    expect(visible().map(row => row.name)).toEqual(["first", "second"]);
    remove(first);
    expect(visible()).toEqual([{ name: "duplicate", size: "mobile-banner", disclosure: true }, { name: "second", size: "rectangle", disclosure: false }]);
    remove(second);
    expect(visible()).toEqual([{ name: "duplicate", size: "mobile-banner", disclosure: true }, { name: "capped", size: "skyscraper", disclosure: false }]);
  });
  it("fresh inline props do not reorder owners, and route transitions do not reuse old admission", () => {
    guidePair();
    for (let iteration = 0; iteration < 3; iteration++) {
      for (const instance of instances) instance.props = { ...instance.props, responsive: { ...instance.props.responsive! } };
      render();
      expect(visible()[0]).toEqual({ name: "body", size: "large-portrait", disclosure: true });
      expect(fixture.resize.size).toBe(1);
    }
    const before = frames.length;
    for (const instance of instances) instance.pathname = "/guides/another-fixture";
    render();
    expect(frames[before]).toEqual([]);
    expect(visible().map(row => row.name)).toEqual(["body", "footer"]);
    for (const instance of instances) instance.pathname = "/en/guides/fixture";
    render(); expect(visible()).toEqual([]); expect(fixture.resize.size).toBe(0);
    for (const instance of instances) instance.pathname = "/guides/offline-fixture";
    render(); expect(visible().map(row => row.name)).toEqual(["body", "footer"]);
  });
  it("changed size props cannot render with a stale registration", () => {
    const first = add("first", { size: "rectangle" }); add("second", { size: "leaderboard" }); render();
    first.props = { size: "leaderboard" };
    const before = frames.length; render();
    expect(frames[before].map(row => row.name)).toEqual(["second"]);
    expect(visible()).toEqual([{ name: "second", size: "leaderboard", disclosure: true }]);
  });
  it("an owner leaving the route releases its old path to the waiting candidate", () => {
    const owner = add("owner", { size: "rectangle" });
    add("waiting", { size: "rectangle" }); render();
    owner.pathname = "/guides/other-fixture"; render();
    expect(currentFrame()).toEqual([
      { name: "owner", path: "/guides/other-fixture", size: "rectangle", disclosure: true },
      { name: "waiting", path: "/guides/offline-fixture", size: "rectangle", disclosure: true },
    ]);
  });
  it("effect teardown/replay has no retained ownership or duplicate resize subscription", () => {
    guidePair();
    for (const instance of instances) for (const slot of instance.slots) {
      slot.cleanup?.(); slot.cleanup = undefined; slot.dependencies = undefined;
    }
    expect(fixture.resize.size).toBe(0);
    const before = frames.length; render();
    expect(frames[before]).toEqual([]);
    expect(visible()).toEqual([{ name: "body", size: "large-portrait", disclosure: true }, { name: "footer", size: "leaderboard", disclosure: false }]);
    expect(fixture.resize.size).toBe(1);
    resize(390); expect(visible()).toEqual([{ name: "body", size: "mobile-banner", disclosure: true }]);
  });
  it.each(["qa", "build-disabled", "english"])("%s has no banner or resize registration", (mode) => {
    if (mode === "qa") window.__MSY_TEST_MODE__ = true;
    if (mode === "build-disabled") vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "1");
    add("blocked", { size: "rectangle" }, mode === "english" ? "/en/guides/fixture" : "/guides/offline-fixture"); render();
    expect(visible()).toEqual([]); expect(fixture.resize.size).toBe(0);
  });
  it("retains affiliate destinations, trace/subId, referrer policy and explicit disclosure suppression", () => {
    const instance = add("one", { size: "mobile-banner", showDisclosure: false }); render();
    const anchor = children(instance.tree!).find(child => child.type === "a")!;
    expect(anchor.props.href).toBe("https://link.coupang.com/a/eCfO0c");
    expect(anchor.props.target).toBe("_blank");
    expect(anchor.props.rel).toBe("sponsored nofollow noopener noreferrer");
    expect(anchor.props.referrerPolicy).toBe("unsafe-url");
    expect(anchor.props.onAuxClick).toBeUndefined();
    const image = children(anchor).find(child => child.type === "img")!;
    expect(image.props.src).toBe("https://ads-partners.coupang.com/banners/986017?subId=cat-guide-%2Fguides%2Foffline-fixture&traceId=V0-301-371ae01f4226dec2-I986017&w=320&h=100");
    expect(visible()[0].disclosure).toBe(false);
    instance.pathname = "/share/fixture-token"; render();
    expect(children(instance.tree!).find(child => child.type === "a")!.props.referrerPolicy).toBe("origin");
  });
});
