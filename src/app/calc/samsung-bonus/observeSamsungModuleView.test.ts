import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeSamsungModuleView } from "./observeSamsungModuleView";

describe("삼성 결과 링크의 실제 노출", () => {
  let callback: IntersectionObserverCallback;
  let disconnect: ReturnType<typeof vi.fn>;
  let page: EventTarget & { visibilityState: string };
  let pageEvents: EventTarget;
  let target: Element;

  beforeEach(() => {
    vi.useFakeTimers();
    target = {} as Element;
    page = Object.assign(new EventTarget(), { visibilityState: "visible" });
    pageEvents = new EventTarget();
    disconnect = vi.fn();
    vi.stubGlobal("document", page);
    vi.stubGlobal("window", pageEvents);
    vi.stubGlobal("IntersectionObserver", class {
      constructor(cb: IntersectionObserverCallback) { callback = cb; }
      observe = vi.fn();
      disconnect = disconnect;
    });
  });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });
  const intersect = (ratio: number, isIntersecting = true) => {
    callback([{ target, intersectionRatio: ratio, isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
  };

  it("관측 API가 없으면 실제 노출을 추정하지 않는다", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const send = vi.fn();
    const dispose = observeSamsungModuleView(target, send);
    vi.advanceTimersByTime(2000);
    expect(send).not.toHaveBeenCalled();
    dispose();
  });
  it("절반 미만의 노출은 분모에 포함하지 않는다", () => {
    const send = vi.fn();
    const dispose = observeSamsungModuleView(target, send);
    intersect(0.49);
    vi.advanceTimersByTime(2000);
    expect(send).not.toHaveBeenCalled();
    dispose();
  });
  it("절반 이상을 1초 본 경우 관측 수명당 한 번 전송한다", () => {
    const send = vi.fn();
    const dispose = observeSamsungModuleView(target, send);
    intersect(0.5);
    vi.advanceTimersByTime(999);
    expect(send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(send).toHaveBeenCalledTimes(1);
    intersect(1);
    vi.advanceTimersByTime(2000);
    expect(send).toHaveBeenCalledTimes(1);
    dispose();
  });
  it("1초 전에 벗어나면 취소하고 재진입 뒤 1초를 다시 센다", () => {
    const send = vi.fn();
    const dispose = observeSamsungModuleView(target, send);
    intersect(1);
    vi.advanceTimersByTime(600);
    intersect(0, false);
    vi.advanceTimersByTime(1000);
    expect(send).not.toHaveBeenCalled();
    intersect(1);
    vi.advanceTimersByTime(999);
    expect(send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(send).toHaveBeenCalledTimes(1);
    dispose();
  });
  it("백그라운드 시간은 제외한다", () => {
    const send = vi.fn();
    const dispose = observeSamsungModuleView(target, send);
    intersect(1);
    vi.advanceTimersByTime(500);
    page.visibilityState = "hidden";
    page.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(2000);
    expect(send).not.toHaveBeenCalled();
    page.visibilityState = "visible";
    page.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(1000);
    expect(send).toHaveBeenCalledTimes(1);
    dispose();
  });
  it("pagehide에서 취소하고 pageshow 후 다시 관측한다", () => {
    const send = vi.fn();
    const dispose = observeSamsungModuleView(target, send);
    intersect(1);
    vi.advanceTimersByTime(500);
    pageEvents.dispatchEvent(new Event("pagehide"));
    vi.advanceTimersByTime(2000);
    expect(send).not.toHaveBeenCalled();
    pageEvents.dispatchEvent(new Event("pageshow"));
    vi.advanceTimersByTime(1000);
    expect(send).toHaveBeenCalledTimes(1);
    dispose();
  });
  it("경로 이동·해제 뒤 타이머와 늦은 observer 콜백을 무시한다", () => {
    const send = vi.fn();
    const dispose = observeSamsungModuleView(target, send);
    intersect(1);
    vi.advanceTimersByTime(500);
    dispose();
    intersect(1);
    vi.advanceTimersByTime(2000);
    expect(send).not.toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
  });
});
