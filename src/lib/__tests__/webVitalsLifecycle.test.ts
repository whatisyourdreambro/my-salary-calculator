import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WebVitals from "@/components/WebVitals";

type Callback = (metric: Record<string, unknown>) => void;
type Effect = { dependencies?: readonly unknown[]; cleanup?: (() => void) | void };
const hooks = vi.hoisted(() => ({
  cursor: 0,
  effects: [] as Effect[],
  pending: [] as Array<{ effect: Effect; create: () => void | (() => void); dependencies?: readonly unknown[] }>,
  registrations: new Map<string, Callback[]>(),
  trackEvent: vi.fn(),
}));

vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useEffect: (create: () => void | (() => void), dependencies?: readonly unknown[]) => {
    const effect = hooks.effects[hooks.cursor++] ??= {};
    const previous = effect.dependencies;
    if (!previous || !dependencies || previous.length !== dependencies.length ||
        dependencies.some((value, index) => !Object.is(value, previous[index]))) {
      hooks.pending.push({ effect, create, dependencies });
    }
  },
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: hooks.trackEvent }));
vi.mock("next/web-vitals", async () => {
  // Use the installed Next hook, not a reimplementation. Only its React effect
  // and metric registration dependencies are inert fakes: no browser or SDK.
  const { readFileSync } = await import("node:fs");
  const { createRequire } = await import("node:module");
  const vm = await import("node:vm");
  const react = await import("react");
  const require = createRequire(import.meta.url);
  const filename = require.resolve("next/dist/client/web-vitals.js");
  const registrations = Object.fromEntries(["onCLS", "onFID", "onLCP", "onINP", "onFCP", "onTTFB"].map(name => [
    name, (callback: Callback) => {
      const existing = hooks.registrations.get(name) ?? [];
      existing.push(callback);
      hooks.registrations.set(name, existing);
    },
  ]));
  const context = {
    exports: {},
    require(name: string) {
      if (name === "react") return react;
      if (name === "next/dist/compiled/web-vitals") return registrations;
      throw new Error(`Unexpected Next hook dependency: ${name}`);
    },
  };
  vm.runInNewContext(readFileSync(filename, "utf8"), context, { filename });
  return context.exports;
});

function render() {
  hooks.cursor = 0;
  hooks.pending = [];
  expect(WebVitals()).toBeNull();
  for (const { effect } of hooks.pending) effect.cleanup?.();
  for (const { effect, create, dependencies } of hooks.pending) {
    effect.dependencies = dependencies;
    effect.cleanup = create();
  }
}

const noNetwork = vi.fn(() => { throw new Error("Network forbidden in offline lifecycle test"); });
beforeEach(() => {
  hooks.cursor = 0;
  hooks.effects = [];
  hooks.pending = [];
  hooks.registrations.clear();
  hooks.trackEvent.mockReset();
  noNetwork.mockClear();
  vi.spyOn(Math, "random").mockReturnValue(1); // Attribution is outside this lifecycle test.
  vi.stubGlobal("location", { pathname: "/calc/samsung-bonus" });
  vi.stubGlobal("fetch", noNetwork);
  vi.stubGlobal("XMLHttpRequest", class { constructor() { noNetwork(); } });
  vi.stubGlobal("WebSocket", class { constructor() { noNetwork(); } });
});
afterEach(() => {
  for (const effect of hooks.effects) effect.cleanup?.();
  expect(noNetwork).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("WebVitals callback lifecycle with the installed Next hook", () => {
  it("does not register another metric reporter on ordinary component rerenders", () => {
    render();
    render();
    render();
    expect([...hooks.registrations.keys()].sort()).toEqual(["onCLS", "onFCP", "onFID", "onINP", "onLCP", "onTTFB"]);
    for (const [name, callbacks] of hooks.registrations) {
      expect(callbacks, name).toHaveLength(1);
    }
    for (const callback of hooks.registrations.get("onCLS") ?? []) {
      callback({ name: "CLS", value: 0.025, rating: "good", id: "synthetic-cls" });
    }
    expect(hooks.trackEvent).toHaveBeenCalledTimes(1);
    expect(hooks.trackEvent).toHaveBeenCalledWith("web_vitals", {
      metric_name: "CLS", metric_value: 25, metric_rating: "good", metric_id: "synthetic-cls",
      page_path: "/calc/samsung-bonus",
    });
  });

  it("preserves later metric updates and reads the current path without a stale render closure", () => {
    render();
    const report = hooks.registrations.get("onLCP")![0];
    report({ name: "LCP", value: 1234.4, rating: "good", id: "synthetic-lcp" });
    vi.stubGlobal("location", { pathname: "/salary/5000" });
    render();
    expect(hooks.registrations.get("onLCP")).toEqual([report]);
    report({ name: "LCP", value: 2345.6, rating: "needs-improvement", id: "synthetic-lcp" });
    expect(hooks.trackEvent).toHaveBeenCalledTimes(2);
    expect(hooks.trackEvent).toHaveBeenLastCalledWith("web_vitals", {
      metric_name: "LCP", metric_value: 2346, metric_rating: "needs-improvement", metric_id: "synthetic-lcp",
      page_path: "/salary/5000",
    });
  });
});
