// 공유 페이지 컨텍스트 저장소 게이트 (S02 · RT-09, 2026-10 비광고 슬롯):
//  1) 구독 시 이 페이지의 메타 설명·og:image 원문을 함께 읽고, <meta content> 갱신(SPA 이동)도 감시한다.
//  2) DOM 변경 묶음이 몰려도 다시 읽기(querySelector·직렬화)는 한 프레임에 한 번뿐이다.
//  3) 마지막 구독 해제 때 대기 중인 프레임을 취소하고 관찰을 끊는다.
// jsdom 없음 — document/window/MutationObserver/rAF 를 스텁한다.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/salary/50000000" }));

import { sharePageContextStore as store } from "@/hooks/useSharePageContext";

const OG = "https://www.moneysalary.com/api/og?type=salary&amount=50000000&net=3570000&v=20260924";
let head: Record<string, Record<string, unknown> | null>;
let queries: number;
let mutationCallback: () => void;
let observeOptions: MutationObserverInit | undefined;
const disconnect = vi.fn();
let frames: Map<number, () => void>;

const runFrames = () => {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((cb) => cb());
};

beforeEach(() => {
  queries = 0;
  frames = new Map();
  disconnect.mockClear();
  head = {
    'link[rel="canonical"]': { href: "https://www.moneysalary.com/salary/50000000" },
    '[data-page-state="not-found"]': null,
    "[data-share-result-url]": null,
    'meta[name="description"]': { content: "연봉 5,000만원의 월 실수령액은 약 357만원입니다." },
    'meta[property="og:image"]': { content: OG },
  };
  vi.stubGlobal("document", {
    title: "연봉 5000만원 실수령액 | 머니샐러리",
    documentElement: {},
    querySelector: (selector: string) => {
      queries += 1;
      return head[selector] ?? null;
    },
  });
  vi.stubGlobal("window", { location: { pathname: "/salary/50000000" }, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal("MutationObserver", class {
    constructor(callback: () => void) { mutationCallback = callback; }
    observe(_target: unknown, options: MutationObserverInit) { observeOptions = options; }
    disconnect = disconnect;
  });
  let id = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: () => void) => { frames.set(++id, cb); return id; });
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => { frames.delete(handle); });
});

afterEach(() => vi.unstubAllGlobals());

describe("share page context store", () => {
  it("captures the meta description and og:image on subscribe and watches <meta content> updates", () => {
    const unsubscribe = store.subscribe(vi.fn());
    expect(store.getSnapshot()).toMatchObject({
      pathname: "/salary/50000000",
      title: "연봉 5000만원 실수령액 | 머니샐러리",
      description: "연봉 5,000만원의 월 실수령액은 약 357만원입니다.",
      ogImage: OG,
    });
    expect(observeOptions?.attributeFilter).toEqual(expect.arrayContaining(["href", "content", "data-page-state", "data-share-result-url"]));
    unsubscribe();
  });

  it("coalesces a burst of mutation batches into one re-read per animation frame", () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    listener.mockClear();
    queries = 0;

    head['meta[property="og:image"]'] = { content: "https://www.moneysalary.com/og-default.png" };
    for (let i = 0; i < 5; i += 1) mutationCallback();
    expect(frames.size).toBe(1);
    expect(queries).toBe(0);
    expect(listener).not.toHaveBeenCalled();

    runFrames();
    expect(queries).toBe(5); // 한 번의 refresh = querySelector 5회
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()?.ogImage).toBe("https://www.moneysalary.com/og-default.png");

    // 바뀐 것이 없으면 다시 읽어도 구독자를 깨우지 않는다
    mutationCallback();
    mutationCallback();
    runFrames();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("the last unsubscribe cancels a pending frame, disconnects and clears the snapshot", () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    mutationCallback();
    expect(frames.size).toBe(1);
    unsubscribe();
    expect(frames.size).toBe(0);
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toBeNull();
  });
});
