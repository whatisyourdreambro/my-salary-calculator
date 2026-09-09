import { describe, expect, it } from "vitest";
import {
  canHandoffCurrentSalaryResult, consumeOfferComparisonHandoff, isValidOfferComparisonConditions,
  OFFER_COMPARISON_HANDOFF_KEY as key, OFFER_COMPARISON_HANDOFF_TTL_MS as ttl,
  writeOfferComparisonHandoff, type HandoffStorage,
} from "@/lib/offerComparisonHandoff";

function memoryStorage() {
  const data = new Map<string, string>();
  return { data, getItem: (name: string) => data.get(name) ?? null, setItem: (name: string, value: string) => { data.set(name, value); }, removeItem: (name: string) => { data.delete(name); } };
}
const conditions = { annualGross: 50_000_000, nonTaxableMonthly: 200_000, dependents: 3, children: 1 };
const now = 1_700_000_000_000;

describe("explicit same-tab comparison handoff", () => {
  it("preserves units and tax conditions exactly, then consumes only once", () => {
    const storage = memoryStorage();
    storage.setItem("existing-global-key", "leave this alone");
    expect(writeOfferComparisonHandoff(conditions, storage, now)).toBe(true);
    expect(consumeOfferComparisonHandoff(storage, now + 1)).toEqual(conditions);
    expect(consumeOfferComparisonHandoff(storage, now + 2)).toBeNull();
    expect(storage.getItem("existing-global-key")).toBe("leave this alone");
  });
  it.each([
    {}, { ...conditions, annualGross: 0 }, { ...conditions, annualGross: NaN },
    { ...conditions, annualGross: Infinity }, { ...conditions, annualGross: 1_000_000_000_001 },
    { ...conditions, nonTaxableMonthly: 5_000_000 }, { ...conditions, nonTaxableMonthly: -1 },
    { ...conditions, annualGross: "50000000" }, { ...conditions, children: 0.5 },
    { ...conditions, dependents: 0 }, { ...conditions, dependents: 1, children: 1 },
    { ...conditions, result: "unrequested field" },
  ])("rejects invalid or partial conditions and removes a stale payload: %j", (invalid) => {
    const storage = memoryStorage();
    storage.setItem(key, "stale");
    expect(isValidOfferComparisonConditions(invalid)).toBe(false);
    expect(writeOfferComparisonHandoff(invalid, storage, now)).toBe(false);
    expect(storage.getItem(key)).toBeNull();
  });
  it("expires exactly at ten minutes without claiming automatic background deletion", () => {
    const storage = memoryStorage();
    writeOfferComparisonHandoff(conditions, storage, now);
    expect(consumeOfferComparisonHandoff(storage, now + ttl - 1)).toEqual(conditions);
    writeOfferComparisonHandoff(conditions, storage, now);
    expect(consumeOfferComparisonHandoff(storage, now + ttl)).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });
  it.each([
    { version: 2 }, { source: "another-page" }, { taxYear: 2027 },
    { createdAt: now + 1 }, { expiresAt: now + ttl + 1 },
    { conditions: { ...conditions, dependents: 1, children: 2 } },
  ])("rejects incompatible/tampered envelopes: %j", (override) => {
    const storage = memoryStorage();
    writeOfferComparisonHandoff(conditions, storage, now);
    storage.setItem(key, JSON.stringify({ ...JSON.parse(storage.getItem(key)!), ...override }));
    expect(consumeOfferComparisonHandoff(storage, now)).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });
  it("fails closed on corrupt/oversized JSON and storage denial", () => {
    const storage = memoryStorage();
    for (const raw of ["not-json", "x".repeat(2049)]) {
      storage.setItem(key, raw);
      expect(consumeOfferComparisonHandoff(storage, now)).toBeNull();
      expect(storage.getItem(key)).toBeNull();
    }
    const blocked: HandoffStorage = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    expect(writeOfferComparisonHandoff(conditions, blocked, now)).toBe(false);
    expect(consumeOfferComparisonHandoff(blocked, now)).toBeNull();
  });
  it("does not apply a payload when one-time removal is denied", () => {
    const storage = memoryStorage();
    writeOfferComparisonHandoff(conditions, storage, now);
    expect(consumeOfferComparisonHandoff({ ...storage, removeItem: () => { throw new Error("blocked"); } }, now)).toBeNull();
  });
  it("does not report success if the dedicated session write fails", () => {
    const storage = memoryStorage();
    storage.setItem(key, "older payload");
    expect(writeOfferComparisonHandoff(conditions, { ...storage, setItem: () => { throw new Error("quota"); } }, now)).toBe(false);
    expect(storage.getItem(key)).toBeNull();
  });
});

describe("home result transfer availability", () => {
  const ready = { pathname: "/", incomeType: "regular", severanceType: "separate",
    showResult: true, isCalculating: false, inputsValid: true,
    inputSnapshot: "validated-input", calculatedSnapshot: "validated-input",
    result: { monthlyNet: 3_000_000, totalDeduction: 500_000 }, conditions };
  it("allows a current validated result only", () => {
    expect(canHandoffCurrentSalaryResult(ready)).toBe(true);
  });
  it.each([
    { pathname: "/another-page" }, { incomeType: "freelancer" }, { incomeType: "part_time" },
    { severanceType: "included" }, { showResult: false }, { isCalculating: true },
    { calculatedSnapshot: null }, { inputSnapshot: "edited-after-calculation" },
    { inputsValid: false }, { result: { monthlyNet: 0, totalDeduction: 0 } },
    { result: { monthlyNet: 3_000_000, totalDeduction: NaN } },
    { conditions: { ...conditions, children: 3 } },
  ])("does not offer transfer for stale, ineligible or invalid state: %j", (change) => {
    expect(canHandoffCurrentSalaryResult({ ...ready, ...change })).toBe(false);
  });
});
