import { calculateSalary2026 } from "./TaxLogic";
import { MAX_ANNUAL_KRW } from "./englishCalculators";

export interface EnglishTakeHomeInputs {
  annualSalary: number;
  nonTaxableMonthly: number;
  dependents: number;
  children: number;
}

export function calculateEnglishTakeHome({ annualSalary, nonTaxableMonthly, dependents, children }: EnglishTakeHomeInputs) {
  if (![annualSalary, nonTaxableMonthly, dependents, children].every(Number.isFinite)) return null;
  if (!Number.isInteger(annualSalary) || annualSalary < 0 || annualSalary > MAX_ANNUAL_KRW) return null;
  if (!Number.isInteger(nonTaxableMonthly) || nonTaxableMonthly < 0 || nonTaxableMonthly * 12 > annualSalary) return null;
  if (!Number.isInteger(dependents) || dependents < 1 || dependents > 11 || !Number.isInteger(children) || children < 0 || children > 10 || children > dependents - 1) return null;
  const result = calculateSalary2026(annualSalary, nonTaxableMonthly, dependents, children);
  return Object.values(result).every((value) => Number.isFinite(value) && value >= 0) ? result : null;
}
