import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchDeferredSectionActivation as watchHomeCalculatorActivation } from "@/lib/deferredSectionActivation";

describe("secondary home calculator activation", () => {
  const target = {} as Element;
  let intersection: IntersectionObserverCallback;
  let hashChange: () => void;
  let hash: string;
  const observe = vi.fn();
  const disconnect = vi.fn();
  const remove = vi.fn();
  const construct = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    hash = "";
    vi.stubGlobal("window", {
      location: { get hash() { return hash; } },
      addEventListener: vi.fn((name, handler) => { if (name === "hashchange") hashChange = handler; }),
      removeEventListener: remove,
    });
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) { intersection = callback; construct(options); }
      observe = observe;
      disconnect = disconnect;
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  const notify = (visible: boolean, element = target) => intersection([{ target: element, isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver);

  it("does not mount off-screen tools; loads once before they reach the viewport", () => {
    const activate = vi.fn();
    watchHomeCalculatorActivation(target, "home-loan-calculator", activate);
    expect(observe).toHaveBeenCalledWith(target);
    expect(construct).toHaveBeenCalledWith({ rootMargin: "800px 0px", threshold: 0 });
    notify(false);
    notify(true, {} as Element);
    expect(activate).not.toHaveBeenCalled();
    notify(true);
    notify(true);
    expect(activate).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("loads a direct hash target without waiting for intersection", () => {
    hash = "#home-loan-calculator";
    const activate = vi.fn();
    watchHomeCalculatorActivation(target, "home-loan-calculator", activate);
    expect(activate).toHaveBeenCalledTimes(1);
    expect(construct).not.toHaveBeenCalled();
  });

  it("handles a later hash navigation and ignores unrelated anchors", () => {
    const activate = vi.fn();
    watchHomeCalculatorActivation(target, "home-deposit-calculator", activate);
    hash = "#calculator-section";
    hashChange();
    expect(activate).not.toHaveBeenCalled();
    hash = "#home-deposit-calculator";
    hashChange();
    expect(activate).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("loads immediately when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const activate = vi.fn();
    watchHomeCalculatorActivation(target, "home-loan-calculator", activate);
    expect(activate).toHaveBeenCalledTimes(1);
  });

  it("removes observers and ignores late notifications after unmount", () => {
    const activate = vi.fn();
    const stop = watchHomeCalculatorActivation(target, "home-loan-calculator", activate);
    stop();
    notify(true);
    hash = "#home-loan-calculator";
    hashChange();
    expect(activate).not.toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith("hashchange", expect.any(Function));
  });
});
