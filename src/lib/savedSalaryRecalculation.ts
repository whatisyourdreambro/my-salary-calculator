import type { SavedHomeInputs } from "./salaryResultSnapshot";
import { validateSalarySharePayload } from "./salarySharePayload";

/** Only an expiring request flag crosses the route; financial values never enter the URL. */
export const SAVED_SALARY_RECALCULATION_KEY = "moneysalary:saved-salary-recalculation:v1";
export const SAVED_SALARY_RECALCULATION_TTL_MS = 10 * 60 * 1000;
type StorageAccess = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type SavedSalaryRecalculation = SavedHomeInputs & { incomeType: "regular"; annualSalary: number; incomeTypeUnknown: boolean };

/** Existing amounts are already normalized annual pay. Never assume omitted tax conditions. */
export function savedSalaryRecalculation(value: unknown): SavedSalaryRecalculation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const salary = value as Record<string, unknown>;
  if (salary.incomeType !== undefined && salary.incomeType !== "regular") return null;
  if ((salary.payBasis !== "annual" && salary.payBasis !== "monthly") || salary.severanceType !== "separate") return null;
  const validated = validateSalarySharePayload({
    v: 1, taxYear: 2026, incomeType: "regular", annualSalary: salary.annualSalary,
    nonTaxableAmount: salary.nonTaxableAmount, dependents: salary.dependents, children: salary.children,
  });
  if (!validated || !("annualSalary" in validated)) return null;
  return {
    annualSalary: validated.annualSalary,
    salaryInput: String(salary.payBasis === "monthly" ? validated.annualSalary / 12 : validated.annualSalary),
    payBasis: salary.payBasis as "annual" | "monthly", incomeType: "regular",
    nonTaxableAmount: String(validated.nonTaxableAmount), dependents: validated.dependents, children: validated.children,
    incomeTypeUnknown: salary.incomeType === undefined,
  };
}

export function readSavedSalaryRecalculation(raw: string | null): SavedSalaryRecalculation | null {
  if (!raw || raw.length > 65_536) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    return savedSalaryRecalculation((data as Record<string, unknown>).salary);
  } catch { return null; }
}

export function requestSavedSalaryRecalculation(storage: StorageAccess, now = Date.now()): boolean {
  try {
    storage.removeItem(SAVED_SALARY_RECALCULATION_KEY);
    if (!Number.isSafeInteger(now) || now < 0 || now > Number.MAX_SAFE_INTEGER - SAVED_SALARY_RECALCULATION_TTL_MS) return false;
    const raw = JSON.stringify({ version: 1, createdAt: now, expiresAt: now + SAVED_SALARY_RECALCULATION_TTL_MS });
    storage.setItem(SAVED_SALARY_RECALCULATION_KEY, raw);
    return storage.getItem(SAVED_SALARY_RECALCULATION_KEY) === raw;
  } catch { return false; }
}

/** Consume before offering a confirmation. Nothing is applied or recalculated here. */
export function consumeSavedSalaryRecalculationRequest(storage: StorageAccess, now = Date.now()): boolean {
  try {
    const raw = storage.getItem(SAVED_SALARY_RECALCULATION_KEY);
    storage.removeItem(SAVED_SALARY_RECALCULATION_KEY);
    if (!raw || raw.length > 256 || !Number.isSafeInteger(now) || now < 0) return false;
    const value = JSON.parse(raw);
    return value !== null && typeof value === "object" && !Array.isArray(value)
      && Object.keys(value).length === 3 && value.version === 1
      && Number.isSafeInteger(value.createdAt) && value.createdAt >= 0 && value.createdAt <= now
      && Number.isSafeInteger(value.expiresAt) && value.expiresAt > now
      && value.expiresAt === value.createdAt + SAVED_SALARY_RECALCULATION_TTL_MS;
  } catch { return false; }
}
