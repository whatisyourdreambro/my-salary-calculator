import { afterEach, describe, expect, it, vi } from "vitest";
import { focusCalculationResult } from "@/lib/calculationResultFocus";

afterEach(() => { vi.unstubAllGlobals(); });
function fixture(top: number, bottom: number) {
  vi.stubGlobal("window", { innerHeight: 800, visualViewport: { height: 800, offsetTop: 0 } });
  const summary = { focus: vi.fn(), scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ top, bottom }) };
  return summary;
}
describe("explicit calculation result focus", () => {
  it("focuses an already visible summary without moving the page", () => {
    const summary = fixture(200, 250); focusCalculationResult(summary as unknown as HTMLElement);
    expect(summary.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(summary.scrollIntoView).not.toHaveBeenCalled();
  });
  it.each([[20, 70], [900, 950]])("reveals a hidden summary with an immediate, nearest movement (%s)", (top, bottom) => {
    const summary = fixture(top, bottom); focusCalculationResult(summary as unknown as HTMLElement);
    expect(summary.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant", block: "nearest" });
  });
  it("uses the visual viewport when a keyboard is open", () => {
    const summary = fixture(500, 550);
    vi.stubGlobal("window", { innerHeight: 800, visualViewport: { offsetTop: 50, height: 350 } });
    focusCalculationResult(summary as unknown as HTMLElement);
    expect(summary.scrollIntoView).toHaveBeenCalledOnce();
  });
  it("does nothing for a removed or invalid result", () => { expect(() => focusCalculationResult(null)).not.toThrow(); });
});
