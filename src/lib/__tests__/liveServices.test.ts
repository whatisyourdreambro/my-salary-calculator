import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import LiveServices from "@/components/LiveServices";
import CoupangBannerCore from "@/components/affiliate/CoupangBannerCore";
import { HomeTopAd } from "@/components/AdPlacement";
import { installLiveServices } from "@/lib/liveServices";
import { LIVE_SERVICES_DISABLED_KEY } from "@/lib/liveAds";
import { installNavTypeTracking, resetNavTypeForTests } from "@/lib/navType";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); resetNavTypeForTests(); });

// These are plain objects, not a browser DOM: assigning src never starts a request.
// Keep an ID registry so duplicate installation tests exercise the real guard.
function fixture(pathname: string, invalid: boolean, qa = false) {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "0");
  type Script = { id: string; src: string; async: boolean; dataset: Record<string, string> };
  const inserted: Script[] = [];
  const scripts = new Map<string, Script>();
  const values = new Map<string, string>();
  const state = { invalid };
  const noNetwork = vi.fn(() => { throw new Error("Network forbidden in offline fixture"); });
  const browser = {
    location: new URL(pathname, "https://www.moneysalary.com"),
    navigator: { webdriver: false, userAgent: "Synthetic visitor fixture", sendBeacon: noNetwork },
    frameElement: null,
    sessionStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) },
    __MSY_TEST_MODE__: qa,
    dataLayer: undefined as unknown[] | undefined,
    gtag: undefined as ((...args: unknown[]) => void) | undefined,
    history: { pushState: move, replaceState: move },
    addEventListener: vi.fn(),
  };
  function move(_data: unknown, _unused: string, url?: string | URL | null) {
    if (url != null) browser.location = new URL(url, browser.location);
  }
  Object.assign(browser, { top: browser, parent: browser });
  vi.stubGlobal("window", browser);
  vi.stubGlobal("document", {
    querySelector: () => state.invalid ? {} : null,
    getElementById: (id: string) => scripts.get(id) ?? null,
    createElement: (tag: string) => {
      expect(tag).toBe("script");
      return { dataset: {} };
    },
    head: { appendChild: (node: Script) => { inserted.push(node); scripts.set(node.id, node); } },
  });
  vi.stubGlobal("fetch", noNetwork);
  vi.stubGlobal("XMLHttpRequest", class { constructor() { noNetwork(); } });
  vi.stubGlobal("WebSocket", class { constructor() { noNetwork(); } });
  return {
    inserted, scripts, values, browser, noNetwork,
    navigate(path: string, nextInvalid = false) {
      browser.history.pushState(null, "", path);
      state.invalid = nextInvalid;
    },
    commands: () => (browser.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>)),
  };
}

describe("server rendering cannot start advertising or analytics requests", () => {
  it("does not emit Google script or preload markup", () => {
    expect(renderToStaticMarkup(createElement(LiveServices))).toBe("");
  });
  it("does not emit a Coupang banner image URL before the client context is eligible", () => {
    expect(renderToStaticMarkup(createElement(CoupangBannerCore))).toBe("");
  });
  it("does not emit an adsbygoogle ins before the client context is eligible", () => {
    const html = renderToStaticMarkup(createElement(HomeTopAd));
    expect(html).not.toContain("<ins");
    expect(html).not.toContain("googlesyndication.com");
  });
});

describe("invalid share documents never install live SDKs", () => {
  it("blocks malformed share and the empty static shell before either loader or page_view", () => {
    for (const pathname of ["/share", "/share/invalid"]) {
      const { inserted, values } = fixture(pathname, true);
      expect(installLiveServices()).toBe(false);
      expect(inserted).toEqual([]);
      expect(window.gtag).toBeUndefined();
      expect(values.size).toBe(0);
    }
  });
  it("retains normal valid-share and other document loader decisions", () => {
    for (const [pathname, invalid] of [["/share/valid-token", false], ["/", true]] as const) {
      const { inserted } = fixture(pathname, invalid);
      expect(installLiveServices()).toBe(true);
      expect(inserted).toHaveLength(2);
    }
  });
  it("the QA guard still wins for a valid share", () => {
    const { inserted } = fixture("/share/valid-token", false, true);
    expect(installLiveServices()).toBe(false);
    expect(inserted).toEqual([]);
  });
});

describe("live service installation after a document changes route", () => {
  it("can recover from an invalid share once called on a valid route, without duplicate loaders or config", () => {
    const doc = fixture("/share/invalid", true);
    expect(installLiveServices()).toBe(false);
    expect(doc.inserted).toHaveLength(0);
    doc.navigate("/");
    expect(installLiveServices()).toBe(true);
    const originalGtag = doc.browser.gtag;
    for (const path of ["/", "/calc/salary", "/share/valid-token", "/calc/salary?page=2"]) {
      doc.navigate(path);
      expect(installLiveServices()).toBe(true);
    }
    expect(doc.inserted.map((script) => script.id)).toEqual(["msy-ga-loader", "msy-adsense-loader"]);
    expect(doc.commands().map((command) => command[0])).toEqual(["js", "config"]);
    expect(doc.commands()[1]).toEqual(["config", "G-EZ8GT7RPEZ", { send_page_view: true }]);
    expect(doc.browser.gtag).toBe(originalGtag);
    expect(doc.values.size).toBe(0);
    expect(doc.noNetwork).not.toHaveBeenCalled();
  });

  it("does not install again when returning from a later invalid share", () => {
    const doc = fixture("/", false);
    expect(installLiveServices()).toBe(true);
    doc.navigate("/share/invalid", true);
    expect(installLiveServices()).toBe(false);
    doc.navigate("/calc/salary");
    expect(installLiveServices()).toBe(true);
    expect(doc.inserted).toHaveLength(2);
    expect(doc.commands().filter((command) => command[0] === "config")).toHaveLength(1);
    expect(doc.noNetwork).not.toHaveBeenCalled();
  });

  it.each([
    ["QA global", "/share/invalid", true, false, false],
    ["ads off query", "/share/invalid?ads=off", false, false, false],
    ["test mode query", "/share/invalid?test_mode=1", false, false, false],
    ["persisted session opt-out", "/share/invalid", false, true, false],
    ["disabled build", "/share/invalid", false, false, true],
  ] as const)("keeps %s blocked after query/global changes and valid-route transitions", (_label, path, qa, persisted, buildDisabled) => {
    const doc = fixture(path, true, qa);
    if (persisted) doc.values.set(LIVE_SERVICES_DISABLED_KEY, "1");
    if (buildDisabled) vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "1");
    expect(installLiveServices()).toBe(false);
    doc.browser.__MSY_TEST_MODE__ = false;
    for (const next of ["/", "/calc/salary?ads=on", "/share/valid-token"]) {
      doc.navigate(next);
      expect(installLiveServices()).toBe(false);
    }
    expect(doc.inserted).toHaveLength(0);
    expect(doc.commands()).toEqual([]);
    expect(doc.noNetwork).not.toHaveBeenCalled();
  });

  it("retains soft-navigation attribution before the first eligible config without manually emitting page_view", () => {
    resetNavTypeForTests();
    const doc = fixture("/share/invalid", true);
    installNavTypeTracking(doc.browser);
    expect(installLiveServices()).toBe(false);
    doc.navigate("/calc/salary");
    expect(installLiveServices()).toBe(true);
    expect(doc.commands().map((command) => command[0])).toEqual(["set", "set", "js", "config"]);
    expect(doc.commands().slice(0, 2)).toEqual([["set", { nav_type: "landing" }], ["set", { nav_type: "soft" }]]);
    expect(doc.commands().some((command) => command[0] === "event" && command[1] === "page_view")).toBe(false);
    expect(doc.browser.location.pathname).toBe("/calc/salary");
    expect(doc.noNetwork).not.toHaveBeenCalled();
  });
});
