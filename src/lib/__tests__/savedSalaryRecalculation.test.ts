import { describe, expect, it } from "vitest";
import { CURRENT_RATES_AS_OF, CURRENT_RATES_YEAR } from "@/config/currentRates";
import { CURRENT_SALARY_BASIS_VERSION, savedSalaryMetadata, isStoredDashboardData } from "@/lib/storedFinancialData";
import { mergeSalarySnapshot } from "@/lib/salaryResultSnapshot";
import {
  savedSalaryRecalculation, readSavedSalaryRecalculation, requestSavedSalaryRecalculation,
  consumeSavedSalaryRecalculationRequest, SAVED_SALARY_RECALCULATION_KEY as key,
  SAVED_SALARY_RECALCULATION_TTL_MS as ttl,
} from "@/lib/savedSalaryRecalculation";

const savedAt = "2026-10-23T01:00:00.000Z";
const salary = { annualSalary: 60_000_000, monthlyNet: 4_000_000, payBasis: "annual" as const,
  severanceType: "separate" as const, nonTaxableAmount: 200_000, dependents: 3, children: 1 };
function memoryStorage() {
  const data = new Map<string, string>();
  return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
}

describe("saved salary basis, including existing records", () => {
  it("reads legacy fields as unknown without a migration write or guessed date", () => {
    const old = { salary, lastUpdated: savedAt, homeLoan: { monthlyPayment: 100_000 } };
    const before = JSON.stringify(old);
    expect(isStoredDashboardData(old)).toBe(true);
    expect(savedSalaryMetadata(old.salary)).toEqual({ basis: "unknown", savedAt: null, incomeType: null, inputOrigin: null });
    expect(readSavedSalaryRecalculation(before)?.incomeTypeUnknown).toBe(true);
    expect(JSON.stringify(old)).toBe(before);
  });
  it("follows the current source pointer and distinguishes changed from unknown", () => {
    expect(CURRENT_SALARY_BASIS_VERSION).toBe(`home-v1:${CURRENT_RATES_YEAR}:${CURRENT_RATES_AS_OF}`);
    expect(savedSalaryMetadata({ calculationBasisVersion: CURRENT_SALARY_BASIS_VERSION }).basis).toBe("current");
    expect(savedSalaryMetadata({ calculationBasisVersion: "home-v0:2025:2025-07" }).basis).toBe("changed");
    expect(savedSalaryMetadata({ calculationBasisVersion: "unrecognized", savedAt: "bad", incomeType: { toString: 0 } })).toEqual({ basis: "unknown", savedAt: null, incomeType: null, inputOrigin: null });
  });
  it("explicit new saves preserve unrelated sections and older object fields", () => {
    const previous = { salary, homeLoan: { monthlyPayment: 500_000 }, extraLegacySection: { retained: true }, lastUpdated: savedAt };
    const before = JSON.stringify(previous);
    const current = { ...salary, savedAt, calculationBasisVersion: CURRENT_SALARY_BASIS_VERSION, incomeType: "regular" as const, inputOrigin: "saved_salary" as const };
    const updated = mergeSalarySnapshot(previous, current, savedAt);
    expect(updated.salary).toEqual(current);
    expect(updated.homeLoan).toEqual(previous.homeLoan);
    expect(updated).toHaveProperty("extraLegacySection", previous.extraLegacySection);
    expect(JSON.stringify(previous)).toBe(before);
  });
});

describe("recalculation conditions", () => {
  it("restores annual and monthly units without adding non-taxable pay a second time", () => {
    expect(savedSalaryRecalculation(salary)).toMatchObject({ annualSalary: 60_000_000, salaryInput: "60000000", nonTaxableAmount: "200000", dependents: 3, children: 1 });
    expect(savedSalaryRecalculation({ ...salary, payBasis: "monthly", incomeType: "regular" })).toMatchObject({ salaryInput: "5000000", payBasis: "monthly", incomeTypeUnknown: false });
  });
  it.each([null, {}, { ...salary, payBasis: { toString: 0 } }, { ...salary, severanceType: "included" },
    { ...salary, incomeType: "freelancer" }, { ...salary, incomeType: "part_time" }, { ...salary, incomeType: "unknown" },
    { ...salary, nonTaxableAmount: undefined }, { ...salary, children: undefined }, { ...salary, dependents: 1, children: 1 },
    { ...salary, annualSalary: 0 }, { ...salary, annualSalary: Infinity }, { ...salary, nonTaxableAmount: 5_000_001 },
  ])("does not invent missing or incompatible conditions (%j)", value => expect(savedSalaryRecalculation(value)).toBeNull());
  it("rejects corrupt/oversized records without changing them", () => {
    for (const value of [null, "bad", "[]", "x".repeat(65_537)]) expect(readSavedSalaryRecalculation(value)).toBeNull();
  });
});

describe("same-tab request flag", () => {
  const now = 1_700_000_000_000;
  it("carries no pay data and consumes only once", () => {
    const storage = memoryStorage();
    storage.setItem("existing", "preserve");
    expect(requestSavedSalaryRecalculation(storage, now)).toBe(true);
    expect(Object.keys(JSON.parse(storage.getItem(key)!)).sort()).toEqual(["createdAt", "expiresAt", "version"]);
    expect(consumeSavedSalaryRecalculationRequest(storage, now + 1)).toBe(true);
    expect(consumeSavedSalaryRecalculationRequest(storage, now + 2)).toBe(false);
    expect(storage.getItem("existing")).toBe("preserve");
  });
  it("expires at ten minutes and rejects incompatible flags", () => {
    const storage = memoryStorage();
    requestSavedSalaryRecalculation(storage, now);
    expect(consumeSavedSalaryRecalculationRequest(storage, now + ttl)).toBe(false);
    for (const patch of [{ version: 2 }, { createdAt: now + 1 }, { expiresAt: now + ttl + 1 }, { secret: "extra" }]) {
      requestSavedSalaryRecalculation(storage, now);
      storage.setItem(key, JSON.stringify({ ...JSON.parse(storage.getItem(key)!), ...patch }));
      expect(consumeSavedSalaryRecalculationRequest(storage, now)).toBe(false);
    }
  });
  it("does not navigate/apply on denied, dropped, or non-consumable storage operations", () => {
    const storage = memoryStorage();
    expect(requestSavedSalaryRecalculation({ ...storage, setItem: () => { throw Error("quota"); } }, now)).toBe(false);
    expect(requestSavedSalaryRecalculation({ ...storage, setItem: () => {} }, now)).toBe(false);
    requestSavedSalaryRecalculation(storage, now);
    expect(consumeSavedSalaryRecalculationRequest({ ...storage, removeItem: () => { throw Error("denied"); } }, now)).toBe(false);
    expect(consumeSavedSalaryRecalculationRequest({ ...storage, getItem: () => { throw Error("denied"); } }, now)).toBe(false);
  });
});
