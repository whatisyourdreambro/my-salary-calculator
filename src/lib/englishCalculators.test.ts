import { describe, expect, it } from "vitest";
import { compareKoreanIncomeTax, convertGrossSalary, parseCalculatorAmount, parseWholeKRW } from "./englishCalculators";

describe("English calculator inputs", () => {
  it.each(["", " ", "-1", "NaN", "Infinity", "1e8", "60,000,000", "3a", "1.2.3", "1000000001"])("rejects invalid amount %s", (value) => {
    expect(parseCalculatorAmount(value)).toBeNull();
  });
  it("accepts zero, decimal rates and the documented upper bound", () => {
    expect(parseCalculatorAmount("0")).toBe(0);
    expect(parseCalculatorAmount("9.25", 1_000_000)).toBe(9.25);
    expect(parseCalculatorAmount("1000000000")).toBe(1_000_000_000);
    expect(parseWholeKRW("60000000.5")).toBeNull();
    expect(parseWholeKRW("60000000")).toBe(60_000_000);
  });
});

describe("Korean income-tax limited comparison", () => {
  it("independently checks a KRW 60M case including earned credit and local tax", () => {
    const result = compareKoreanIncomeTax(60_000_000, 0, 0)!;
    expect(result.progressive).toEqual({ gross: 60_000_000, earnedDeduction: 12_750_000, taxableIncome: 45_750_000, earnedCredit: 660_000, national: 4_942_500, local: 494_250, total: 5_436_750 });
    expect(result.flat).toEqual({ national: 11_400_000, local: 1_140_000, total: 12_540_000 });
    expect(result.difference).toBe(7_103_250);
  });
  it("applies progressive exemptions and paid deductions only to that method", () => {
    const result = compareKoreanIncomeTax(60_000_000, 3_000_000, 5_000_000)!;
    expect(result.progressive.gross).toBe(57_000_000);
    expect(result.progressive.taxableIncome).toBe(37_900_000);
    expect(result.flat.total).toBe(12_540_000);
  });
  it("never returns negative tax for zero remuneration or exhausted tax base", () => {
    expect(compareKoreanIncomeTax(0, 0, 0)?.progressive.total).toBe(0);
    expect(compareKoreanIncomeTax(1_000_000, 0, 900_000)?.progressive.total).toBe(0);
  });
  it.each([[60, 61, 0], [60, 30, 31], [-1, 0, 0], [NaN, 0, 0], [Infinity, 0, 0]])("rejects inconsistent or nonfinite values", (gross, exempt, paid) => {
    expect(compareKoreanIncomeTax(gross, exempt, paid)).toBeNull();
  });
});

describe("Gross currency conversion", () => {
  it("uses the user-entered rate in the stated direction, then divides by twelve", () => {
    expect(convertGrossSalary(60_000_000, 1_250)).toEqual({ annual: 48_000, monthly: 4_000 });
    expect(convertGrossSalary(60_000_000, 1)).toEqual({ annual: 60_000_000, monthly: 5_000_000 });
    expect(convertGrossSalary(0, 9.25)).toEqual({ annual: 0, monthly: 0 });
  });
  it.each([0, -1, NaN, Infinity, 1_000_001, Number.MIN_VALUE])("rejects an invalid exchange rate %s", (rate) => {
    expect(convertGrossSalary(60_000_000, rate)).toBeNull();
  });
});
