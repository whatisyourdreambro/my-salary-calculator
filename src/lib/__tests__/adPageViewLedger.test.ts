import { describe, expect, it } from "vitest";
import { beginAdPageView, hasRequestedInPageView, markRequestedInPageView } from "@/lib/adPageViewLedger";

describe("ad page-view ledger (one request per slot per page view)", () => {
  it("records a slot once per pathname and keeps it across same-path remounts", () => {
    beginAdPageView("/fun/lunch-roulette");
    expect(hasRequestedInPageView("/fun/lunch-roulette", "2222222222")).toBe(false);
    markRequestedInPageView("/fun/lunch-roulette", "2222222222");
    expect(hasRequestedInPageView("/fun/lunch-roulette", "2222222222")).toBe(true);
    // same path again (query/hash change, replay round) is the same page view
    beginAdPageView("/fun/lunch-roulette");
    expect(hasRequestedInPageView("/fun/lunch-roulette", "2222222222")).toBe(true);
    expect(hasRequestedInPageView("/fun/lunch-roulette", "1111111111")).toBe(false);
  });

  it("a pathname change starts a new page view, including A -> B -> A", () => {
    markRequestedInPageView("/salary-db", "3333333333");
    beginAdPageView("/salary-db/samsung-electronics");
    expect(hasRequestedInPageView("/salary-db", "3333333333")).toBe(false);
    beginAdPageView("/salary-db");
    expect(hasRequestedInPageView("/salary-db", "3333333333")).toBe(false);
  });

  it("marking on a different path implicitly starts that page view", () => {
    markRequestedInPageView("/a", "4444444444");
    markRequestedInPageView("/b", "5555555555");
    expect(hasRequestedInPageView("/a", "4444444444")).toBe(false);
    expect(hasRequestedInPageView("/b", "5555555555")).toBe(true);
  });
});
