import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBottomAdHeight } from "@/lib/bottomAdDetect";
import { observeBottomSheetSpace, readBottomSheetSpace } from "@/lib/bottomSheetLayout";

// Inert geometry/event fakes only: no browser, frame URL, SDK or network.
function viewportFixture() {
  const viewport = Object.assign(new EventTarget(), { offsetTop: 0, height: 800 });
  const win = Object.assign(new EventTarget(), { innerHeight: 800, visualViewport: viewport });
  let anchors: object[] = [];
  const querySelectorAll = vi.fn((selector: string) => selector.startsWith("ins.") ? anchors : []);
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", { querySelectorAll });
  vi.stubGlobal("getComputedStyle", () => ({ position: "fixed" }));
  return { win, viewport, querySelectorAll, anchor(top: number, bottom: number) {
    anchors = [{ getBoundingClientRect: () => ({ top, bottom, height: bottom - top }) }];
  }, clear: () => { anchors = []; } };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", () => { throw new Error("No network in geometry tests"); });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("BottomSheet safe space", () => {
  it("reserves the anchor plus its bottom gap, retaining space until close", () => {
    const fixture = viewportFixture();
    fixture.anchor(690.5, 780);
    expect(getBottomAdHeight()).toBe(110);
    const layouts: ReturnType<typeof readBottomSheetSpace>[] = [];
    const stop = observeBottomSheetSpace((layout) => layouts.push(layout), vi.fn());
    expect(layouts.at(-1)).toEqual({ bottom: 0, maxHeight: 680, paddingBottom: 122 });
    fixture.clear();
    vi.advanceTimersByTime(1000);
    expect(layouts.at(-1)?.paddingBottom).toBe(122);
    stop();
    expect(vi.getTimerCount()).toBe(0);
    expect(readBottomSheetSpace().paddingBottom).toBe(0); // a later opening resets it
  });

  it("tracks a keyboard's visible viewport and an anchor moved above the keyboard", () => {
    const fixture = viewportFixture();
    const layouts: ReturnType<typeof readBottomSheetSpace>[] = [];
    const stop = observeBottomSheetSpace((layout) => layouts.push(layout), vi.fn());
    fixture.viewport.height = 400;
    fixture.anchor(340, 390);
    fixture.viewport.dispatchEvent(new Event("resize"));
    expect(layouts.at(-1)).toEqual({ bottom: 400, maxHeight: 340, paddingBottom: 72 });
    fixture.viewport.offsetTop = 40;
    fixture.viewport.dispatchEvent(new Event("scroll"));
    expect(layouts.at(-1)).toEqual({ bottom: 360, maxHeight: 340, paddingBottom: 112 });
    fixture.clear(); fixture.win.innerHeight = 500; fixture.viewport.offsetTop = 0; fixture.viewport.height = 500;
    fixture.win.dispatchEvent(new Event("orientationchange"));
    expect(layouts.at(-1)).toEqual({ bottom: 0, maxHeight: 425, paddingBottom: 112 });
    stop();
    const count = layouts.length;
    fixture.win.dispatchEvent(new Event("resize")); fixture.viewport.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(3000);
    expect(layouts).toHaveLength(count);
  });

  it("ignores a fixed frame below the visible keyboard viewport", () => {
    const fixture = viewportFixture(); fixture.anchor(700, 800); fixture.viewport.height = 400;
    expect(readBottomSheetSpace()).toEqual({ bottom: 400, maxHeight: 340, paddingBottom: 0 });
  });

  it("closes on detector failure and never emits a zero-gap recovery or reopens", () => {
    const fixture = viewportFixture(); fixture.anchor(700, 800);
    const changed = vi.fn(), unsafe = vi.fn();
    observeBottomSheetSpace(changed, unsafe);
    fixture.querySelectorAll.mockImplementation(() => { throw new Error("Unreadable DOM"); });
    fixture.win.dispatchEvent(new Event("resize"));
    expect(unsafe).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    fixture.querySelectorAll.mockReturnValue([]);
    fixture.viewport.dispatchEvent(new Event("resize")); vi.advanceTimersByTime(5000);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it.each([0, Number.NaN, -5])("closes when viewport height is invalid (%s)", (height) => {
    const fixture = viewportFixture(); fixture.viewport.height = height;
    const changed = vi.fn(), unsafe = vi.fn(); observeBottomSheetSpace(changed, unsafe);
    expect(changed).not.toHaveBeenCalled(); expect(unsafe).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("closes instead of placing controls in an anchor that occupies most of the viewport", () => {
    const fixture = viewportFixture(); fixture.viewport.height = 200; fixture.anchor(100, 200);
    expect(() => readBottomSheetSpace()).toThrow("Insufficient safe space");
  });

  it("supports browsers without visualViewport", () => {
    viewportFixture(); vi.stubGlobal("window", { innerHeight: 600 });
    expect(readBottomSheetSpace()).toEqual({ bottom: 0, maxHeight: 510, paddingBottom: 0 });
  });
});
