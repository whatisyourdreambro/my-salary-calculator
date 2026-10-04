import { describe, expect, it } from "vitest";
import { clampTablePage, formatTableSearch, normalizeTableSearch, safeTablePageCount } from "../tableQueryState";

describe("salary table search query", () => {
  it.each([
    [null, ""], [undefined, ""], ["", ""], [" 15,000 ", "15000"],
    ["00015,000", "15000"], ["0", "0"], ["000", "0"],
    ["15abc000", ""], ["1e4", ""], ["-100", ""], ["1.5", ""], [",,,", ""],
  ])("normalizes %s to %s", (query, expected) => {
    expect(normalizeTableSearch(query)).toBe(expected);
  });

  it("formats long digits without rounding or exponential notation", () => {
    const digits = "123456789012345678901234567890";
    expect(formatTableSearch(digits)).toBe("123,456,789,012,345,678,901,234,567,890");
    expect(normalizeTableSearch(formatTableSearch(digits))).toBe(digits);
    expect(formatTableSearch("0")).toBe("0");
    expect(formatTableSearch("")).toBe("");
  });
});

describe("salary table page bounds", () => {
  it.each([null, "abc", "NaN", "Infinity", "-1", "0", ""])('uses page 1 for %s', page => {
    expect(clampTablePage(page, 3)).toBe(1);
  });

  it("clamps to the last filtered page and floors fractions", () => {
    expect(clampTablePage("999", 3)).toBe(3);
    expect(clampTablePage("2.9", 3)).toBe(2);
    expect(clampTablePage("2", 1)).toBe(1);
  });

  it("keeps an empty result at page 1/1", () => {
    for (const count of [0, -1, NaN, Infinity]) {
      expect(safeTablePageCount(count)).toBe(1);
      expect(clampTablePage("999", count)).toBe(1);
    }
    expect(safeTablePageCount(3.9)).toBe(3);
  });
});
