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
  const win: { adsbygoogle?: unknown } = { adsbygoogle: queue };
  vi.stubGlobal("window", win);
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
  return {
    queue, disconnect, cleanup,
    change(next: string | null) { marker = next; callback(); },
    /** adsbygoogle.js 로드 후처럼 pauseAdRequests 가 쓰기 전용(setter)인 SDK 객체로 교체하고 쓰기 기록을 돌려준다. */
    loadSdk() {
      const writes: number[] = [];
      const sdk = {};
      Object.defineProperty(sdk, "pauseAdRequests", { set: (v: number) => { writes.push(v); }, configurable: true });
      win.adsbygoogle = sdk;
      return writes;
    },
  };
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
  it("resumes an initial not-found pause after the write-only SDK object replaces the queue", () => {
    const app = runtime("not-found");
    const writes = app.loadSdk();
    app.change(null); expect(writes).toEqual([0]); app.cleanup();
  });
  it("pauses and resumes a later error marker through the write-only SDK object", () => {
    const app = runtime();
    const writes = app.loadSdk();
    app.change("error"); app.change(null);
    expect(writes).toEqual([1, 0]); app.cleanup();
  });
  it("never writes to the SDK object on a page that was never paused", () => {
    const app = runtime();
    const writes = app.loadSdk();
    app.change(null); expect(writes).toEqual([]); app.cleanup();
  });
  // 실제 404 → 사이트 안 링크 이동: 경로가 바뀌면 effect 가 정리되고 새로 실행된다. 보류 표시가 effect 클로저가 아니라
  // window(문서 단위)에 있어야 새 실행이 해제(0)를 쓴다 — 정리된 옛 관찰자의 콜백은 무시되므로 기댈 수 없다.
  it("resumes from a fresh effect run after a pathname change, exactly once (the pause flag lives on window)", () => {
    const app = runtime("not-found");
    const writes = app.loadSdk();
    app.cleanup(); app.change(null); expect(writes).toEqual([]);
    const cleanup = observePageAdPause(); expect(writes).toEqual([0]);
    app.change(null); expect(writes).toEqual([0]); cleanup();
  });
});
