import { describe, expect, it } from "vitest";
import { deleteNumberAtSeparator, equivalentNumberDraft, expandNumberExponent, formatNumberDraft, normalizeNumberDraft, numberCaretPosition, numberDraftValue, numberInputDraft } from "../numberInput";

describe("grouped number editing", () => {
  it.each([
    ["6000000", "6,000,000"], ["-1234567.8900", "-1,234,567.8900"],
    ["3.", "3."], ["", ""], ["-", "-"], [".05", ".05"],
    ["900719925474099312345", "900,719,925,474,099,312,345"],
  ])("formats %s without rounding or losing an editing suffix", (raw, expected) => {
    expect(formatNumberDraft(raw)).toBe(expected);
  });
  it("accepts grouped paste/full-width digits and rejects mixed prose", () => {
    expect(normalizeNumberDraft(" ６，０００，０００ ")).toBe("6000000");
    expect(normalizeNumberDraft("−1,000.50")).toBe("-1000.50");
    expect(normalizeNumberDraft("0,000,123.00")).toBe("123.00");
    expect(normalizeNumberDraft("12원34")).toBeNull();
    expect(normalizeNumberDraft("3.5", { allowDecimal: false })).toBeNull();
    expect(normalizeNumberDraft("-5", { allowNegative: false })).toBeNull();
  });
  it("preserves controlled drafts when legacy callers coerce them to numbers", () => {
    expect(equivalentNumberDraft("0", "")).toBe(true);
    expect(equivalentNumberDraft("0", "-")).toBe(true);
    expect(equivalentNumberDraft("3", "3.")).toBe(true);
    expect(equivalentNumberDraft("3.5", "3.50")).toBe(true);
    expect(equivalentNumberDraft("10", "100")).toBe(false);
    expect(numberDraftValue("-.")).toBe("");
    expect(numberDraftValue("1234.50")).toBe("1234.50");
  });
  it("expands scientific numeric props without applying locale decimal precision", () => {
    expect(numberInputDraft(1e21)).toBe("1000000000000000000000");
    expect(expandNumberExponent("-1.25e-7")).toBe("-0.000000125");
    expect(numberInputDraft("6,000,000.00001")).toBe("6000000.00001");
    expect(numberInputDraft(NaN)).toBe("");
  });
  it("keeps the cursor at the edited digits when commas move", () => {
    expect(numberCaretPosition("6000000", 7, "6,000,000")).toBe(9);
    expect(numberCaretPosition("61,000,000", 2, "61,000,000")).toBe(2);
    expect(numberCaretPosition("12,340", 3, "12,340")).toBe(2);
    expect(numberCaretPosition("-1234.50", 6, "-1,234.50")).toBe(7);
  });
  it("deletes adjacent digits at grouping boundaries instead of trapping the cursor", () => {
    expect(deleteNumberAtSeparator("1,234", 2, "backward")).toEqual({ text: "234", caret: 0 });
    expect(deleteNumberAtSeparator("1,234", 1, "forward")).toEqual({ text: "134", caret: 1 });
    expect(deleteNumberAtSeparator("1,234", 4, "backward")).toBeNull();
  });
});
