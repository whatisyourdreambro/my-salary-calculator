import type { StoredFinancialData } from "@/app/types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Validate only fields rendered by /report; preserve the original browser record. */
export function isStoredReportData(value: unknown): value is StoredFinancialData {
  if (!isObject(value) || typeof value.lastUpdated !== "string" || !Number.isFinite(Date.parse(value.lastUpdated))) return false;
  if (value.salary !== undefined && (!isObject(value.salary) || !isFiniteNumber(value.salary.annualSalary) || !isFiniteNumber(value.salary.monthlyNet))) return false;
  if (value.homeLoan !== undefined && (!isObject(value.homeLoan) || !isFiniteNumber(value.homeLoan.monthlyPayment))) return false;
  if (value.severance !== undefined && (!isObject(value.severance) || !isFiniteNumber(value.severance.estimatedSeverancePay))) return false;
  if (value.futureSalary !== undefined) {
    const future = value.futureSalary;
    // The saving calculator offers 1–30 years; zero remains valid without a chart.
    if (!isObject(future) || !isFiniteNumber(future.finalSalary) || !isFiniteNumber(future.years) || !Number.isInteger(future.years) || future.years < 0 || future.years > 30) return false;
  }
  return true;
}
