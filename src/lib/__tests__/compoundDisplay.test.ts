import { describe, expect, it } from "vitest";
import { compoundDisplayRatios } from "@/lib/compoundDisplay";

describe("compound result display", () => {
  it("does not invent a return multiplier when both deposits are zero", () => {
    expect(compoundDisplayRatios(0, 0, 0)).toEqual({
      multiplier: null, principalPercent: 0, interestPercent: 0,
    });
  });
  it("preserves the result for a funded investment", () => {
    const ratios = compoundDisplayRatios(300_850_718, 130_000_000, 170_850_718);
    expect(ratios.multiplier?.toFixed(2)).toBe("2.31");
    expect(ratios.principalPercent.toFixed(1)).toBe("43.2");
    expect(ratios.interestPercent.toFixed(1)).toBe("56.8");
  });
  it("shows principal only for a zero-return investment", () => {
    expect(compoundDisplayRatios(50_000, 50_000, 0)).toEqual({
      multiplier: 1, principalPercent: 100, interestPercent: 0,
    });
  });
  it("never gives non-finite ratios to text or CSS", () => {
    for (const value of [NaN, Infinity, -Infinity]) {
      const result = compoundDisplayRatios(value, 0, value);
      expect(result.multiplier).toBeNull();
      expect(result.principalPercent).toBe(0);
      expect(result.interestPercent).toBe(0);
    }
  });
});
