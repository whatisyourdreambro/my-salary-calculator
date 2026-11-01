// B38 (owner approval 2026-11-01, item 8): useSharePageContext reads the head's og:image and follows in-place
// content changes. Offline: React's store hook and the DOM are minimal stubs (no jsdom, no network, no browser).
import { afterEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  subscribe: null as null | ((listener: () => void) => () => void),
  getSnapshot: null as null | (() => unknown),
}));
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useEffect: () => {},
  useSyncExternalStore: (subscribe: (listener: () => void) => () => void, getSnapshot: () => unknown) => {
    store.subscribe = subscribe;
    store.getSnapshot = getSnapshot;
    return getSnapshot();
  },
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/salary-db/samsung-electronics" }));

import { useSharePageContext } from "@/hooks/useSharePageContext";

const ORIGIN = "https://www.moneysalary.com";
const head = { og: null as string | null };

class FakeObserver {
  static last: FakeObserver | undefined;
  callback: () => void;
  options: MutationObserverInit | undefined;
  constructor(callback: () => void) {
    this.callback = callback;
    FakeObserver.last = this;
  }
  observe(_target: unknown, options: MutationObserverInit) { this.options = options; }
  disconnect() {}
}

function stubDom() {
  vi.stubGlobal("MutationObserver", FakeObserver);
  vi.stubGlobal("window", { location: { pathname: "/salary-db/samsung-electronics" }, addEventListener: () => {}, removeEventListener: () => {} });
  vi.stubGlobal("document", {
    title: "삼성전자 연봉 | 머니샐러리",
    documentElement: {},
    querySelector: (selector: string) => {
      if (selector === 'link[rel="canonical"]') return { href: `${ORIGIN}/salary-db/samsung-electronics` };
      if (selector === 'meta[property="og:image"]') return head.og === null ? null : { content: head.og };
      return null;
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("useSharePageContext og:image snapshot (B38)", () => {
  it("reads meta og:image and refreshes when only its content attribute changes", () => {
    stubDom();
    head.og = `${ORIGIN}/api/og?type=company&name=${encodeURIComponent("삼성전자")}`;
    // Nothing is read before the store subscribes (SSR and the hydration render).
    expect(useSharePageContext().context).toBeNull();
    const listener = vi.fn();
    const unsubscribe = store.subscribe!(listener);
    try {
      expect(FakeObserver.last!.options).toMatchObject({ attributes: true, childList: true, subtree: true });
      expect(FakeObserver.last!.options!.attributeFilter).toEqual(expect.arrayContaining(["href", "data-page-state", "content"]));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(useSharePageContext().context).toMatchObject({ pathname: "/salary-db/samsung-electronics", ogImage: head.og });

      head.og = `${ORIGIN}/api/og?type=company&name=SK`;
      FakeObserver.last!.callback();
      expect(listener).toHaveBeenCalledTimes(2);
      expect(useSharePageContext().context?.ogImage).toBe(`${ORIGIN}/api/og?type=company&name=SK`);

      // An unchanged head does not notify again.
      FakeObserver.last!.callback();
      expect(listener).toHaveBeenCalledTimes(2);

      head.og = null;
      FakeObserver.last!.callback();
      expect(useSharePageContext().context?.ogImage).toBeNull();
    } finally {
      unsubscribe();
    }
  });
});
