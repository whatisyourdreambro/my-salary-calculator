import { afterEach, describe, expect, it, vi } from "vitest";
import { observePageAdPause } from "@/components/NotFoundAdPause";

const eligibility = vi.hoisted(() => ({ allowed: true }));
vi.mock("@/lib/liveAds", () => ({ canRequestLiveAds: () => eligibility.allowed }));
vi.mock("next/navigation", () => ({ usePathname: () => "/same-route" }));
afterEach(() => { vi.unstubAllGlobals(); eligibility.allowed = true; });

function runtime(initial: string | null = null) {
  let marker = initial;
  let callback = () => {};
  const disconnect = vi.fn();
  const queue: unknown[] & { pauseAdRequests?: number } = [];
  vi.stubGlobal("window", { adsbygoogle: queue });
  vi.stubGlobal("document", {
    documentElement: {},
    querySelector: (selector: string) => {
      expect(selector).not.toContain("main[");
      expect(selector).toContain('[data-page-state="error"]');
      return marker ? { marker } : null;
    },
  });
  vi.stubGlobal("MutationObserver", class {
    constructor(refresh: () => void) { callback = refresh; }
    observe() {}
    disconnect = disconnect;
  });
  const cleanup = observePageAdPause();
  return { queue, disconnect, cleanup, change(next: string | null) { marker = next; callback(); } };
}

describe("page state advertising pause", () => {
  it.each(["not-found", "error"])("pauses an initial %s page", (marker) => {
    const app = runtime(marker);
    expect(app.queue.pauseAdRequests).toBe(1); app.cleanup();
  });
  it("pauses a same-path error and resumes only after its marker is removed", () => {
    const app = runtime();
    app.change("error"); expect(app.queue.pauseAdRequests).toBe(1);
    app.change(null); expect(app.queue.pauseAdRequests).toBe(0); app.cleanup();
  });
  it("never resumes a QA or ineligible document when an error is cleared", () => {
    eligibility.allowed = false;
    const app = runtime("error");
    app.change(null); expect(app.queue.pauseAdRequests).toBe(1); app.cleanup();
  });
  it("ignores an already queued observer callback after cleanup", () => {
    const app = runtime("error"); app.cleanup();
    app.change(null); expect(app.queue.pauseAdRequests).toBe(1);
    expect(app.disconnect).toHaveBeenCalledOnce();
  });
});
