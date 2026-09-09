import { describe, expect, it } from "vitest";
import { isCurrentSalaryResult, mergeSalarySnapshot, parseSavedHomeInputs } from "@/lib/salaryResultSnapshot";

const current = { showResult: true, isCalculating: false, inputsValid: true, inputSnapshot: "A", calculatedSnapshot: "A", result: { monthlyNet: 3_000_000, totalDeduction: 300_000 } };
describe("current salary result and local storage", () => {
  it("allows a current valid completed result and rejects edited/busy/invalid/hidden results", () => {
    expect(isCurrentSalaryResult(current)).toBe(true);
    for (const state of [{ ...current, inputSnapshot: "B" }, { ...current, isCalculating: true }, { ...current, inputsValid: false },
      { ...current, showResult: false }, { ...current, calculatedSnapshot: null }, { ...current, result: { monthlyNet: NaN } }]) {
      expect(isCurrentSalaryResult(state)).toBe(false);
    }
  });
  it("saves no fabricated zero expense, while keeping other prior dashboard records", () => {
    const salary = { annualSalary: 50e6, monthlyNet: 3e6, payBasis: "annual" as const, severanceType: "separate" as const, nonTaxableAmount: 200000, dependents: 1, children: 0 };
    const homeLoan = { monthlyPayment: 500000, loanSuggestion: "existing" };
    const merged = mergeSalarySnapshot({ salary: { ...salary, monthlyExpenses: 0 }, homeLoan }, salary, "2026-09-09T00:00:00Z");
    expect(merged.homeLoan).toEqual(homeLoan);
    expect(merged.salary).not.toHaveProperty("monthlyExpenses");
    expect(mergeSalarySnapshot(null, salary, "now").salary).toEqual(salary);
  });
  const saved = { salaryInput: "50,000,000", nonTaxableAmount: "200000", incomeType: "regular", payBasis: "annual", dependents: 1, children: 0 };
  it("restores legitimate complete old saved inputs including zero children/tax-free", () => {
    expect(parseSavedHomeInputs(JSON.stringify(saved))).toEqual(saved);
    expect(parseSavedHomeInputs(JSON.stringify({ ...saved, nonTaxableAmount: "0" }))?.nonTaxableAmount).toBe("0");
  });
  it.each([null, [], {}, { ...saved, salaryInput: 50000000 }, { ...saved, incomeType: "bogus" },
    { ...saved, salaryInput: { secret: "x" } }, { ...saved, children: "0" }, { ...saved, dependents: 1.2 },
    { ...saved, salaryInput: "Infinity" }, { ...saved, payBasis: "weekly" }])("ignores malformed storage without calling string methods on untrusted types", value => {
    expect(parseSavedHomeInputs(JSON.stringify(value))).toBeNull();
  });
});
