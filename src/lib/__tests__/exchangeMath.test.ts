import { describe, expect, it } from "vitest";
import { assetInComparisonCurrency } from "../exchangeMath";

describe("purchasing power uses the selected quote's currency units", () => {
  it("converts KRW assets to USD with KRW per USD", () => {
    expect(assetInComparisonCurrency(1_500_000, 1_500)).toBe(1_000);
  });
  it("converts USD assets to KRW with USD per KRW", () => {
    expect(assetInComparisonCurrency(1_000, 1 / 1_500)).toBe(1_500_000);
  });
  it("uses a user-entered cross-currency quote rather than a KRW-based background feed", () => {
    expect(assetInComparisonCurrency(100, 0.8)).toBe(125);
  });
  it.each([0, -1, NaN, Infinity])("does not display non-finite purchasing power for quote %s", (quote) => {
    expect(assetInComparisonCurrency(100, quote)).toBe(0);
  });
});
