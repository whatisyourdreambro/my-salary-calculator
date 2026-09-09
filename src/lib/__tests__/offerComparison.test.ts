import { describe, expect, it } from "vitest";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { compareOffers, explainOfferDifference, initialOfferComparisonState, offerComparisonReducer,
  type OfferComparisonAction, type OfferComparisonState, type OfferInput } from "@/lib/offerComparison";

const settings = { nonTaxableAmount: "200,000", dependents: 3, children: 1 };
const offers: OfferInput[] = [
  { id: 1, companyName: "A", salary: "50,000,001", bonus: "3,000,000", overtime: "1,000,000" },
  { id: 2, companyName: "B", salary: "60,000,002", bonus: "", overtime: "0" },
];
function validState(): OfferComparisonState {
  return offerComparisonReducer({ ...initialOfferComparisonState, offers, settings }, { type: "compare" });
}

describe("valid current offer comparisons", () => {
  it("matches the home regular-salary result exactly for the same annual total and monthly tax-free conditions", () => {
    for (const [annualGross, nonTaxableMonthly, dependents, children] of [
      [50_000_000, 200_000, 1, 0], [72_000_000, 300_000, 4, 2], [120_000_001, 0, 2, 1], [30_000_000, 100_000, 3, 0],
    ]) {
      const outcome = compareOffers(offers.map(offer => ({ ...offer, salary: String(annualGross), bonus: "", overtime: "" })),
        { nonTaxableAmount: String(nonTaxableMonthly), dependents, children });
      if (!outcome.ok) throw Error(outcome.error);
      const home = calculateSalary2026(annualGross, nonTaxableMonthly, dependents, children);
      for (const result of outcome.comparison.results) expect(result.monthlyNet).toBe(home.netPay);
    }
  });
  it("requires at least two positive salary offers, including newly added blank offers", () => {
    expect(compareOffers(offers.slice(0, 1), settings).ok).toBe(false);
    expect(compareOffers([...offers, { ...offers[0], id: 3, salary: "" }], settings).ok).toBe(false);
    expect(compareOffers([{ ...offers[0], salary: "0" }, offers[1]], settings).ok).toBe(false);
  });
  it.each(["-1", "3e7", "Infinity", "NaN", "30,000a", "500.5", "1000000000001"])("rejects invalid money %s", salary => {
    expect(compareOffers([{ ...offers[0], salary }, offers[1]], settings).ok).toBe(false);
  });
  it("checks common tax-free and family inputs rather than silently clamping them", () => {
    for (const changed of [{ nonTaxableAmount: "9,000,000" }, { dependents: 0 }, { dependents: 1.5 }, { children: 3 }, { children: -1 }]) {
      expect(compareOffers(offers, { ...settings, ...changed }).ok).toBe(false);
    }
  });
  it("treats optional blank bonuses as zero and holds the same annual total to the same tax result", () => {
    const outcome = compareOffers([offers[0], { ...offers[1], salary: "54,000,001", bonus: "", overtime: "" }], settings);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw Error(outcome.error);
    expect(outcome.comparison.results[0].monthlyNet).toBe(outcome.comparison.results[1].monthlyNet);
    expect(outcome.comparison.results[1].bonus).toBe(0);
  });
  it("reconciles displayed annual differences, including the monthly rounding adjustment", () => {
    const outcome = compareOffers(offers, settings);
    if (!outcome.ok) throw Error(outcome.error);
    const [a, b] = outcome.comparison.results;
    expect(outcome.comparison.baselineId).toBe(1);
    expect(a.monthlyNet).toBeGreaterThanOrEqual(b.monthlyNet);
    for (const result of [a, b]) {
      expect(result.totalAnnual - result.annualDeduction).toBe(result.annualNet);
      expect(result.annualInsurance + result.annualTax + result.roundingAdjustment).toBe(result.annualDeduction);
    }
    const delta = explainOfferDifference(a, b);
    expect(delta.salary + delta.bonus + delta.overtime).toBe(delta.gross);
    expect(delta.insurance + delta.tax + delta.rounding).toBe(delta.deductions);
    expect(delta.gross - delta.deductions).toBe(delta.net);
    expect(delta.monthlyNet * 12).toBe(delta.net);
    expect(explainOfferDifference(b, a).net).toBe(-delta.net);
  });
  it("keeps stored result snapshots independent from subsequent edits", () => {
    const state = validState();
    const previous = state.comparison;
    const next = offerComparisonReducer(state, { type: "offer", id: 1, field: "salary", value: "70000000" });
    expect(next.comparison).toBeNull();
    expect(previous?.results.find(result => result.id === 1)?.salary).toBe(50_000_001);
    const updated = offerComparisonReducer(next, { type: "compare" });
    expect(updated.comparison?.results[0].id).toBe(1);
    expect(updated.stale).toBe(false);
  });
});

describe("stale ranking and export invalidation", () => {
  const actions: OfferComparisonAction[] = [
    { type: "offer", id: 1, field: "salary", value: "60000000" },
    { type: "offer", id: 1, field: "bonus", value: "5000000" },
    { type: "offer", id: 1, field: "overtime", value: "2000000" },
    { type: "offer", id: 1, field: "companyName", value: "Edited" },
    { type: "settings", value: { ...settings, nonTaxableAmount: "100000" } },
    { type: "settings", value: { ...settings, dependents: 4 } },
    { type: "settings", value: { ...settings, children: 2 } },
    { type: "add" },
  ];
  it.each(actions)("removes old results for edit %j", action => {
    const next = offerComparisonReducer(validState(), action);
    expect(next.comparison).toBeNull();
    expect(next.stale).toBe(true);
  });
  it("invalidates deletion and then compares only remaining offers", () => {
    const three = offerComparisonReducer({ ...validState(), offers: [...offers, { ...offers[0], id: 3 }] }, { type: "compare" });
    const next = offerComparisonReducer(three, { type: "remove", id: 2 });
    expect(next.comparison).toBeNull();
    expect(next.stale).toBe(true);
    expect(offerComparisonReducer(next, { type: "compare" }).comparison?.results.map(result => result.id)).toEqual([1, 3]);
  });
  it("retains valid results for a no-op input or disabled minimum removal", () => {
    const state = validState();
    expect(offerComparisonReducer(state, { type: "offer", id: 1, field: "salary", value: offers[0].salary })).toBe(state);
    expect(offerComparisonReducer(state, { type: "remove", id: 1 })).toBe(state);
  });
  it("applies explicitly accepted home conditions to the first offer without double-counting tax-free income or auto-comparing", () => {
    const state = validState();
    const next = offerComparisonReducer(state, { type: "prefill", annualGross: 72_000_000,
      nonTaxableMonthly: 300_000, dependents: 4, children: 2 });
    expect(next.offers[0]).toMatchObject({ salary: "72,000,000", bonus: "", overtime: "" });
    expect(next.offers[1]).toEqual(state.offers[1]);
    expect(next.settings).toEqual({ nonTaxableAmount: "300,000", dependents: 4, children: 2 });
    expect(next.comparison).toBeNull();
    expect(next.stale).toBe(true);
    const recalculated = offerComparisonReducer(next, { type: "compare" });
    expect(recalculated.comparison?.results.find(result => result.id === 1)?.totalAnnual).toBe(72_000_000);
  });
});
