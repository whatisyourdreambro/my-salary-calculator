import { describe, expect, it } from "vitest";
import { normalizeFeedbackPath } from "./feedbackStorage";

describe("private inquiry route context", () => {
  it.each([
    ["/monthly/3578910", "/monthly/[amount]"],
    ["/salary/1-eok", "/salary/[amount]"],
    ["/salary/1-5-eok", "/salary/[amount]"],
    ["/salary/%36%30%30%30-manwon", "/salary/[amount]"],
  ])("redacts amount paths: %s", (path, expected) => {
    expect(normalizeFeedbackPath(path)).toBe(expected);
  });

  it.each(["/share/%2573ecret", "/salary/%2536%2530%2530%2530", "/%252fexample.com"])(
    "rejects ambiguous nested encoding before storing route context: %s", path => {
      expect(normalizeFeedbackPath(path)).toBeNull();
    },
  );

  it("preserves ordinary page context", () => {
    expect(normalizeFeedbackPath("/calc/samsung-bonus")).toBe("/calc/samsung-bonus");
  });
});
