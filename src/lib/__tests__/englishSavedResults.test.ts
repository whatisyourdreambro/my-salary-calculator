import { describe, expect, it } from "vitest";
import { calculateEnglishTakeHome } from "../englishTakeHome";
import { ENGLISH_RESULTS_KEY, deleteEnglishSalarySnapshot, loadEnglishSalarySnapshots, saveEnglishSalarySnapshot, validEnglishSalaryInput } from "../englishSavedResults";

function store() {
  const values = new Map<string, string>([["moneysalary-financial-data", "unchanged Korean data"]]);
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
function input(annualSalary = 60_000_000) {
  const params = { annualSalary, nonTaxableMonthly: annualSalary ? 200_000 : 0, dependents: 1, children: 0 };
  return { ...params, ...calculateEnglishTakeHome(params)! };
}
describe("explicit English browser saves", () => {
  it.each([0, 60_000_000, 60_000_001, 1_000_000_000])("accepts real modeled results including KRW rounding at %i", salary => {
    expect(validEnglishSalaryInput(input(salary))).toBe(true);
  });
  it("does not write on read and preserves the Korean namespace on save and delete", () => {
    const storage = store();
    expect(loadEnglishSalarySnapshots(storage)).toEqual({ ok: true, snapshots: [] });
    expect(storage.values.size).toBe(1);
    expect(saveEnglishSalarySnapshot(input(), storage)).toEqual({ ok: true });
    const saved = loadEnglishSalarySnapshots(storage).snapshots[0];
    expect(saved).toMatchObject({ schemaVersion: 1, currency: "KRW", model: "kr-regular-employee-2026", label: "Korea take-home salary estimate" });
    expect(deleteEnglishSalarySnapshot(saved.id, storage)).toBe(true);
    expect(storage.values.get("moneysalary-financial-data")).toBe("unchanged Korean data");
    expect(loadEnglishSalarySnapshots(storage).snapshots).toEqual([]);
  });
  it.each([
    { annualSalary: Infinity }, { annualSalary: -1 }, { nonTaxableMonthly: 6_000_000 },
    { children: 1 }, { dependents: 0 }, { netPay: NaN }, { netPay: -1 },
    { totalDeductions: 1 }, { netPay: 5_000_000 },
  ])("rejects invalid or inconsistent inputs without writing: %j", change => {
    const storage = store();
    expect(saveEnglishSalarySnapshot({ ...input(), ...change }, storage).ok).toBe(false);
    expect(storage.values.has(ENGLISH_RESULTS_KEY)).toBe(false);
  });
  it("rejects corrupted, unsupported-version and unknown-model persisted records without erasing them", () => {
    const storage = store();
    saveEnglishSalarySnapshot(input(), storage);
    const original = storage.values.get(ENGLISH_RESULTS_KEY)!;
    for (const mutate of [() => "[broken", () => original.replace('"version":1', '"version":2'), () => original.replace('"KRW"', '"USD"'), () => original.replace('kr-regular-employee-2026', 'unverified-model')]) {
      const corrupt = mutate();
      storage.values.set(ENGLISH_RESULTS_KEY, corrupt);
      expect(loadEnglishSalarySnapshots(storage)).toEqual({ ok: false, snapshots: [] });
      expect(saveEnglishSalarySnapshot(input(), storage).ok).toBe(false);
      expect(storage.values.get(ENGLISH_RESULTS_KEY)).toBe(corrupt);
    }
  });
  it("does not claim storage success when permission/quota is unavailable", () => {
    expect(saveEnglishSalarySnapshot(input(), null)).toEqual({ ok: false, reason: "unavailable" });
    const storage = { getItem: () => null, setItem: () => { throw new Error("quota"); } };
    expect(saveEnglishSalarySnapshot(input(), storage)).toEqual({ ok: false, reason: "unavailable" });
  });
  it("keeps all 20 existing snapshots and requires an explicit deletion before another save", () => {
    const storage = store();
    for (let i = 0; i < 20; i++) expect(saveEnglishSalarySnapshot(input(), storage).ok).toBe(true);
    const raw = storage.values.get(ENGLISH_RESULTS_KEY);
    expect(saveEnglishSalarySnapshot(input(), storage)).toEqual({ ok: false, reason: "full" });
    expect(storage.values.get(ENGLISH_RESULTS_KEY)).toBe(raw);
    expect(deleteEnglishSalarySnapshot("not-an-id", storage)).toBe(false);
  });
  it("stores only the fixed schema and rejects duplicate IDs on load", () => {
    const storage = store();
    saveEnglishSalarySnapshot({ ...input(), unexpectedPersonalText: "must not persist" } as ReturnType<typeof input>, storage);
    expect(storage.values.get(ENGLISH_RESULTS_KEY)).not.toContain("must not persist");
    const parsed = JSON.parse(storage.values.get(ENGLISH_RESULTS_KEY)!);
    parsed.snapshots.push(parsed.snapshots[0]);
    storage.setItem(ENGLISH_RESULTS_KEY, JSON.stringify(parsed));
    expect(loadEnglishSalarySnapshots(storage).ok).toBe(false);
  });
});
