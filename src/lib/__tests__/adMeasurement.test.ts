import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeCoupangImpressions, observeViewableImpression } from "@/lib/adMeasurement";
import { trackAdRequestAttempt, trackAdRequestError, trackCoupangClick } from "@/lib/analytics";

// Platform fakes invoke actual observer callbacks, including queued callbacks
// after disconnect. No source-string assertions or third-party ad requests.
class TestElement {
  isConnected = true;
  child: TestElement | null = null;
  attributes = new Map<string, string>();
  getAttribute(name: string) { return this.attributes.get(name) ?? null; }
  querySelector() { return this.child?.element ?? null; }
  contains(element: Element) { return this.child?.element === element; }
  get element() { return this as unknown as Element; }
}

class TestIntersectionObserver {
  static instances: TestIntersectionObserver[] = [];
  target!: Element;
  disconnect = vi.fn();
  constructor(private callback: IntersectionObserverCallback, readonly options: IntersectionObserverInit) {
    TestIntersectionObserver.instances.push(this);
  }
  observe(element: Element) { this.target = element; }
  fire(ratio: number, width = 320, height = 100, isIntersecting = true) {
    this.callback([{
      target: this.target, isIntersecting, intersectionRatio: ratio,
      boundingClientRect: { width, height },
    } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

class TestMutationObserver {
  static instances: TestMutationObserver[] = [];
  disconnect = vi.fn();
  observe = vi.fn();
  constructor(private callback: MutationCallback) { TestMutationObserver.instances.push(this); }
  fire() { this.callback([], this as unknown as MutationObserver); }
}

const latestIntersection = () => TestIntersectionObserver.instances.at(-1)!;
const latestMutation = () => TestMutationObserver.instances.at(-1)!;
function banner(size = "mobile-banner", category = "salary") {
  const element = new TestElement();
  element.attributes.set("data-coupang-banner-size", size);
  element.attributes.set("data-coupang-category", category);
  return element;
}

beforeEach(() => {
  TestIntersectionObserver.instances = [];
  TestMutationObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
  vi.stubGlobal("MutationObserver", TestMutationObserver);
});
afterEach(() => vi.unstubAllGlobals());

describe("viewable impressions", () => {
  it("requires a connected, non-empty target at >=50%, and reports only once", () => {
    const el = new TestElement();
    const report = vi.fn();
    observeViewableImpression(el.element, report);
    const observer = latestIntersection();
    observer.fire(0.1);
    observer.fire(0.49);
    observer.fire(1, 0, 100);
    observer.fire(1, 320, 0);
    observer.fire(1, 320, 100, false);
    el.isConnected = false;
    observer.fire(1);
    expect(report).not.toHaveBeenCalled();
    el.isConnected = true;
    observer.fire(0.5);
    observer.fire(1);
    expect(report).toHaveBeenCalledTimes(1);
    expect(observer.options.threshold).toBe(0.5);
  });

  it("ignores queued callbacks after cleanup, but a new page visit can count again", () => {
    const el = new TestElement();
    const report = vi.fn();
    const stopA = observeViewableImpression(el.element, () => report("/a"));
    const staleA = latestIntersection();
    stopA();
    const stopB = observeViewableImpression(el.element, () => report("/b"));
    staleA.fire(1);
    latestIntersection().fire(1);
    stopB();
    observeViewableImpression(el.element, () => report("/a"));
    latestIntersection().fire(1);
    expect(report.mock.calls).toEqual([["/b"], ["/a"]]);
  });
});

describe("rendered Coupang fallback", () => {
  it("does not observe an empty fallback, then observes a banner rendered later", () => {
    const root = new TestElement();
    const report = vi.fn();
    observeCoupangImpressions(root.element, report);
    expect(TestIntersectionObserver.instances).toHaveLength(0);
    latestMutation().fire();
    expect(report).not.toHaveBeenCalled();
    root.child = banner();
    latestMutation().fire();
    expect(latestIntersection().target).toBe(root.child.element);
    latestIntersection().fire(0.5);
    expect(report).toHaveBeenCalledWith({ banner_size: "mobile-banner", category: "salary" });
  });

  it("does not report a banner removed by dedup before its queued intersection", () => {
    const root = new TestElement();
    root.child = banner();
    const report = vi.fn();
    observeCoupangImpressions(root.element, report);
    const stale = latestIntersection();
    root.child = null;
    stale.fire(1);
    latestMutation().fire();
    stale.fire(1);
    expect(report).not.toHaveBeenCalled();
  });

  it("uses current rendered dimensions after mobile resize, matching the click schema", () => {
    const root = new TestElement();
    const ad = banner("leaderboard", "loan");
    root.child = ad;
    const report = vi.fn();
    observeCoupangImpressions(root.element, report);
    const staleDesktop = latestIntersection();
    ad.attributes.set("data-coupang-banner-size", "mobile-banner");
    // A queued visibility notification can precede the metadata mutation callback.
    staleDesktop.fire(1);
    latestMutation().fire();
    latestIntersection().fire(1);
    expect(report.mock.calls).toEqual([[{ banner_size: "mobile-banner", category: "loan" }]]);
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      gtag,
      location: { href: "https://www.moneysalary.com/home-loan?salary=50000000&utm_source=test" },
    });
    trackCoupangClick("mobile-banner", "loan", "/home-loan");
    expect(gtag).toHaveBeenCalledWith("event", "coupang_click", {
      ...report.mock.calls[0][0], page_path: "/home-loan",
      page_location: "https://www.moneysalary.com/home-loan?utm_source=test",
      page_referrer: "",
    });
  });

  it("counts each displayed size once per visit, including A→B→back navigation", () => {
    const root = new TestElement();
    root.child = banner();
    const report = vi.fn();
    const visit = (path: string) => observeCoupangImpressions(root.element, (dims) => report(path, dims));
    let stop = visit("/a");
    latestIntersection().fire(1);
    latestMutation().fire();
    latestIntersection().fire(1);
    stop();
    stop = visit("/b");
    latestIntersection().fire(1);
    stop();
    stop = visit("/a");
    latestIntersection().fire(1);
    stop();
    latestMutation().fire();
    latestIntersection().fire(1);
    expect(report.mock.calls.map(([path]) => path)).toEqual(["/a", "/b", "/a"]);
  });

  it("reports mobile and desktop independently but does not recount resize-back", () => {
    const root = new TestElement();
    const ad = banner();
    root.child = ad;
    const report = vi.fn();
    observeCoupangImpressions(root.element, report);
    latestIntersection().fire(1);
    ad.attributes.set("data-coupang-banner-size", "leaderboard");
    latestMutation().fire();
    latestIntersection().fire(1);
    ad.attributes.set("data-coupang-banner-size", "mobile-banner");
    latestMutation().fire();
    latestIntersection().fire(1);
    expect(report.mock.calls.map(([dims]) => dims.banner_size)).toEqual(["mobile-banner", "leaderboard"]);
  });
});

describe("manual AdSense diagnostic events", () => {
  it("uses distinct attempt/error names, never the native ad_impression name", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      gtag,
      location: { href: "https://www.moneysalary.com/salary-db/samsung?salary=50000000" },
    });
    vi.stubGlobal("location", { pathname: "/salary-db/samsung" });
    trackAdRequestAttempt("fluid");
    trackAdRequestError("fluid");
    expect(gtag.mock.calls).toEqual([
      ["event", "ad_request_attempt", {
        slot_kind: "fluid", page_path: "/salary-db/samsung",
        page_location: "https://www.moneysalary.com/salary-db/samsung", page_referrer: "",
      }],
      ["event", "ad_request_error", {
        slot_kind: "fluid", error_type: "push_failed", page_path: "/salary-db/samsung",
        page_location: "https://www.moneysalary.com/salary-db/samsung", page_referrer: "",
      }],
    ]);
  });
  it("remains non-fatal when measurement is blocked", () => {
    vi.stubGlobal("window", { gtag: () => { throw new Error("blocked"); } });
    expect(() => trackAdRequestAttempt("result", "/")).not.toThrow();
    expect(() => trackAdRequestError("result", "/")).not.toThrow();
  });
});
