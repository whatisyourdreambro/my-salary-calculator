import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canRequestLiveAds, hasLiveServicesOptOut, isLiveAdsContext, LIVE_SERVICES_DISABLED_KEY } from "../liveAds";
import { installLiveServices } from "../liveServices";
import { trackEvent } from "../analytics";
import { runWhenGtagReady } from "../gtagReady";

function browser(url = "https://www.moneysalary.com/") {
  const values = new Map<string, string>();
  const win = {
    location: new URL(url), navigator: { webdriver: false, userAgent: "Mozilla/5.0 Chrome/140.0 Safari/537.36" },
    sessionStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) },
    frameElement: null, top: undefined as unknown, parent: undefined as unknown,
    __MSY_TEST_MODE__: false, __MSY_ADS_DISABLED__: false,
  };
  win.top = win; win.parent = win;
  return win;
}

// These are plain objects. No browser, DOM library or network is started.
function documentRecorder() {
  const scripts: Array<{ id: string; src: string; dataset: Record<string, string> }> = [];
  const createElement = vi.fn(() => ({ id: "", src: "", dataset: {} }));
  vi.stubGlobal("document", {
    referrer: "", createElement,
    getElementById: (id: string) => scripts.find((script) => script.id === id),
    head: { appendChild: (script: typeof scripts[number]) => scripts.push(script) },
  });
  return { scripts, createElement };
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Network forbidden in this test"); }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("live advertising and measurement gate", () => {
  it.each([
    "http://localhost:3000/", "http://127.0.0.1:3100/", "https://preview.pages.dev/",
    "https://moneysalary.com.evil.test/", "http://www.moneysalary.com/",
  ])("does not even create a loader for %s", (url) => {
    vi.stubGlobal("window", browser(url));
    const recorder = documentRecorder();
    expect(installLiveServices()).toBe(false);
    expect(recorder.createElement).not.toHaveBeenCalled();
  });

  it.each(["development", "test"])("denies %s even on the public hostname", (mode) => {
    vi.stubEnv("NODE_ENV", mode); vi.stubGlobal("window", browser());
    expect(canRequestLiveAds()).toBe(false);
  });

  it("denies a public-host test build and cannot be enabled by a query", () => {
    vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "1");
    vi.stubGlobal("window", browser("https://www.moneysalary.com/?ads=on&test_mode=0"));
    const recorder = documentRecorder();
    expect(installLiveServices()).toBe(false);
    expect(recorder.scripts).toEqual([]);
  });

  it.each(["webdriver", "iframe", "cross-origin-frame", "headless", "qa-user-agent", "test-marker", "disabled-marker"])("denies %s before scripts and analytics events", (kind) => {
    const win = browser();
    if (kind === "webdriver") win.navigator.webdriver = true;
    if (kind === "iframe") win.top = {};
    if (kind === "cross-origin-frame") Object.defineProperty(win, "top", { get() { throw new Error("SecurityError"); } });
    if (kind === "headless") win.navigator.userAgent = "HeadlessChrome/140";
    if (kind === "qa-user-agent") win.navigator.userAgent = "Mozilla/5.0 MoneySalary-QA/1.0";
    if (kind === "test-marker") win.__MSY_TEST_MODE__ = true;
    if (kind === "disabled-marker") win.__MSY_ADS_DISABLED__ = true;
    const gtag = vi.fn(); vi.stubGlobal("window", Object.assign(win, { gtag }));
    const recorder = documentRecorder();
    expect(installLiveServices()).toBe(false); trackEvent("test-event");
    expect(recorder.createElement).not.toHaveBeenCalled(); expect(gtag).not.toHaveBeenCalled();
  });

  it("keeps a query opt-out for the tab after navigation drops it", () => {
    const win = browser("https://www.moneysalary.com/?ads=off&ads=on"); vi.stubGlobal("window", win);
    expect(canRequestLiveAds()).toBe(false);
    expect(win.sessionStorage.getItem(LIVE_SERVICES_DISABLED_KEY)).toBe("1");
    win.location = new URL("https://www.moneysalary.com/calc/samsung-bonus?ads=on");
    expect(canRequestLiveAds()).toBe(false);
  });

  it("fails closed when browser context or storage cannot be read", () => {
    vi.stubGlobal("window", undefined); expect(canRequestLiveAds()).toBe(false);
    vi.stubGlobal("window", {}); expect(canRequestLiveAds()).toBe(false);
    const win = browser(); win.sessionStorage.getItem = () => { throw new Error("denied"); };
    vi.stubGlobal("window", win); expect(canRequestLiveAds()).toBe(false);
    expect(isLiveAdsContext({ production: true, protocol: "https:", hostname: "www.moneysalary.com", topLevel: undefined as unknown as boolean })).toBe(false);
  });

  it("recognizes only OFF query controls and never an ON override", () => {
    expect(hasLiveServicesOptOut("?test_mode=1")).toBe(true);
    expect(hasLiveServicesOptOut("?ads=OFF")).toBe(true);
    expect(hasLiveServicesOptOut("?ads=on")).toBe(false);
    expect(isLiveAdsContext({ production: false, protocol: "https:", hostname: "www.moneysalary.com", topLevel: true })).toBe(false);
  });

  it.each(["www.moneysalary.com", "moneysalary.com"])("preserves ordinary top-level visitors on %s and loads each SDK only once", (host) => {
    const win = browser(`https://${host}/`);
    // Android WebView is a real visitor context, not by itself automation.
    win.navigator.userAgent = "Mozilla/5.0 (Linux; Android 14; wv) Chrome/140.0";
    vi.stubGlobal("window", win); const recorder = documentRecorder();
    expect(installLiveServices()).toBe(true); expect(installLiveServices()).toBe(true);
    expect(recorder.scripts.map((script) => new URL(script.src).hostname)).toEqual(["www.googletagmanager.com", "pagead2.googlesyndication.com"]);
    const queued = (window.dataLayer ?? []).map((item) => Array.from(item as ArrayLike<unknown>));
    expect(queued.filter((item) => item[0] === "config")).toHaveLength(1);
  });

  it("does not queue or retry GA callbacks in test mode even if gtag already exists", () => {
    vi.useFakeTimers(); const win = browser(); win.__MSY_TEST_MODE__ = true;
    vi.stubGlobal("window", Object.assign(win, { gtag: vi.fn() })); const send = vi.fn();
    runWhenGtagReady(send); vi.runAllTimers(); expect(send).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
});
