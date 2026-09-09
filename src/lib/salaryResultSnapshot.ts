import type { StoredFinancialData, StoredSalaryData } from "@/app/types";

export function isCurrentSalaryResult(state: { showResult: boolean; isCalculating: boolean; inputsValid: boolean;
  calculatedSnapshot: string | null; inputSnapshot: string; result: { monthlyNet: number } & Record<string, number> }) {
  return state.showResult && !state.isCalculating && state.inputsValid && state.calculatedSnapshot === state.inputSnapshot &&
    Object.values(state.result).every(Number.isFinite) && state.result.monthlyNet > 0;
}

/** A missing expense input is unknown. It must not become an observed zero expense. */
export function mergeSalarySnapshot(existing: unknown, salary: Omit<StoredSalaryData, "monthlyExpenses">, now: string): StoredFinancialData {
  const previous = existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
  return { ...previous, salary: { ...salary }, lastUpdated: now } as StoredFinancialData;
}

export type SavedHomeInputs = { salaryInput: string; incomeType: "regular" | "freelancer" | "part_time";
  payBasis: "annual" | "monthly"; dependents: number; children: number; nonTaxableAmount: string };
export function parseSavedHomeInputs(raw: string): SavedHomeInputs | null {
  if (raw.length > 4096) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value) ||
      typeof value.salaryInput !== "string" || typeof value.nonTaxableAmount !== "string" ||
      !/^\d[\d,]*(?:\.\d+)?$/.test(value.salaryInput) || !/^\d[\d,]*(?:\.\d+)?$/.test(value.nonTaxableAmount) ||
      !["regular", "freelancer", "part_time"].includes(value.incomeType) || !["annual", "monthly"].includes(value.payBasis) ||
      !Number.isInteger(value.dependents) || value.dependents < 1 || value.dependents > 20 ||
      !Number.isInteger(value.children) || value.children < 0 || value.children > 10) return null;
    const gross = Number(value.salaryInput.replace(/,/g, ""));
    const nonTaxable = Number(value.nonTaxableAmount.replace(/,/g, ""));
    if (!Number.isFinite(gross) || gross <= 0 || gross > 1_000_000_000_000 ||
      !Number.isFinite(nonTaxable) || nonTaxable < 0 || nonTaxable > 1_000_000_000_000) return null;
    return { salaryInput: value.salaryInput, incomeType: value.incomeType, payBasis: value.payBasis,
      dependents: value.dependents, children: value.children, nonTaxableAmount: value.nonTaxableAmount };
  } catch { return null; }
}
