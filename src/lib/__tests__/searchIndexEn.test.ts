import { describe, it, expect } from "vitest";
import { englishSearchIndex, searchEnglishEntries } from "../searchIndexEn";
import { enGuideCards } from "../guidesData";

describe("English site search", () => {
  it("only offers actual English routes and keeps every English guide discoverable", () => {
    expect(new Set(englishSearchIndex.map(entry => entry.href)).size).toBe(englishSearchIndex.length);
    expect(englishSearchIndex.every(entry => entry.href === "/en" || entry.href.startsWith("/en/"))).toBe(true);
    for (const guide of enGuideCards) expect(englishSearchIndex.some(entry => entry.href === `/en/guides/${guide.slug}`)).toBe(true);
  });
  it("finds the intended task with mixed case and whitespace", () => {
    expect(searchEnglishEntries("  FOREIGN   tax ")[0].href).toBe("/en/flat-tax");
    expect(searchEnglishEntries("currency")[0].href).toBe("/en/salary-converter");
    expect(searchEnglishEntries("privacy")[0].href).toBe("/en/privacy");
  });
  it("does not invent a translation when no English result matches", () => {
    expect(searchEnglishEntries("zznonexistentzz")).toEqual([]);
    expect(searchEnglishEntries(" ")).toEqual([]);
    expect(searchEnglishEntries("salary", 0)).toEqual([]);
    expect(searchEnglishEntries("salary", 2).length).toBeLessThanOrEqual(2);
  });
});
