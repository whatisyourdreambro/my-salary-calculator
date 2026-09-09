import { describe, expect, it } from "vitest";
import { languagePaths, isEnglishPath, englishGuideNextTask } from "./englishNavigation";
import { englishGuideContent } from "./englishGuideContent";

describe("English navigation", () => {
  it("does not invent Korean translations for English-only tools or help", () => {
    for (const route of ["/en/flat-tax", "/en/salary-converter", "/en/help"]) expect(languagePaths(route).ko).toBe("/");
  });
  it("maps a real guide pair and falls back for an untranslated guide", () => {
    expect(languagePaths("/guides/chip-stock-tax-guide/").en).toBe("/en/guides/chip-stock-tax-guide");
    expect(languagePaths("/en/guides/chip-stock-tax-guide").ko).toBe("/guides/chip-stock-tax-guide");
    expect(languagePaths("/guides/unknown").en).toBe("/en/guides");
  });
  it("matches the language segment, not unrelated route prefixes", () => {
    expect(isEnglishPath("/energy")).toBe(false);
    expect(languagePaths("/energy").en).toBe("/en");
    expect(isEnglishPath("/en/help")).toBe(true);
  });
  it("does not send a benefit application reader to the foreign-worker flat-tax election", () => {
    expect(englishGuideNextTask("earned-income-credit-2026").href).toBe("/en/help#tax-resources");
  });
});

describe("English guide table of contents", () => {
  it("links attributed headings to real unique targets while preserving existing IDs", () => {
    const result = englishGuideContent('<h2 class="a">Pay &amp; tax</h2><h2 id="en-section-1">Keep me</h2><h2 class="b"><strong>Pay</strong></h2>');
    expect(result.headings).toEqual([{ id: "en-section-2", text: "Pay & tax" }, { id: "en-section-1", text: "Keep me" }, { id: "en-section-3", text: "Pay" }]);
    for (const heading of result.headings) expect(result.html).toContain(`id="${heading.id}"`);
    expect(result.html).toContain('<strong>Pay</strong>');
  });
});
