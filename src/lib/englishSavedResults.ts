/** Browser-only, explicit English salary saves. Never send these values to analytics or a URL. */
export const ENGLISH_RESULTS_KEY = "moneysalary-en-results-v1";
export const ENGLISH_RESULTS_EVENT = "moneysalary:en-results";
export const ENGLISH_RESULTS_LIMIT = 20;
const MODEL = "kr-regular-employee-2026";
const LABEL = "Korea take-home salary estimate";

export interface EnglishSalaryInput {
  annualSalary: number;
  nonTaxableMonthly: number;
  dependents: number;
  children: number;
  netPay: number;
  totalDeductions: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
}

export interface EnglishSalarySnapshot extends EnglishSalaryInput {
  schemaVersion: 1;
  kind: "salary";
  model: typeof MODEL;
  currency: "KRW";
  label: typeof LABEL;
  id: string;
  savedAt: string;
}

type StorageAccess = Pick<Storage, "getItem" | "setItem">;
const moneyKeys = ["netPay", "totalDeductions", "nationalPension", "healthInsurance", "longTermCare", "employmentInsurance", "incomeTax", "localIncomeTax"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const whole = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;

export function validEnglishSalaryInput(value: unknown): value is EnglishSalaryInput {
  if (!isRecord(value) || !whole(value.annualSalary, 0, 1_000_000_000) || !whole(value.nonTaxableMonthly, 0, 1_000_000_000 / 12)) return false;
  if (value.nonTaxableMonthly * 12 > value.annualSalary || !whole(value.dependents, 1, 11) || !whole(value.children, 0, 10) || value.children > value.dependents - 1) return false;
  if (!moneyKeys.every(key => whole(value[key], 0, Math.ceil(value.annualSalary as number / 12)))) return false;
  const result = value as unknown as EnglishSalaryInput;
  const deductions = result.nationalPension + result.healthInsurance + result.longTermCare + result.employmentInsurance + result.incomeTax + result.localIncomeTax;
  return Math.abs(deductions - result.totalDeductions) <= 1 && Math.abs(result.netPay + result.totalDeductions - result.annualSalary / 12) <= 1;
}

function cleanInput(value: EnglishSalaryInput): EnglishSalaryInput {
  return { annualSalary: value.annualSalary, nonTaxableMonthly: value.nonTaxableMonthly, dependents: value.dependents, children: value.children,
    netPay: value.netPay, totalDeductions: value.totalDeductions, nationalPension: value.nationalPension, healthInsurance: value.healthInsurance,
    longTermCare: value.longTermCare, employmentInsurance: value.employmentInsurance, incomeTax: value.incomeTax, localIncomeTax: value.localIncomeTax };
}

function parseSnapshot(value: unknown): EnglishSalarySnapshot | null {
  if (!validEnglishSalaryInput(value)) return null;
  const saved = value as unknown as Record<string, unknown>;
  if (saved.schemaVersion !== 1 || saved.kind !== "salary" || saved.model !== MODEL || saved.currency !== "KRW" || saved.label !== LABEL || typeof saved.id !== "string" || !UUID.test(saved.id) || typeof saved.savedAt !== "string") return null;
  const date = new Date(saved.savedAt);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== saved.savedAt || date.getTime() > Date.now() + 60_000) return null;
  return { ...cleanInput(value), schemaVersion: 1, kind: "salary", model: MODEL, currency: "KRW", label: LABEL, id: saved.id, savedAt: saved.savedAt };
}

function browserStorage(): StorageAccess | null {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}

export function loadEnglishSalarySnapshots(storage: StorageAccess | null = browserStorage()): { ok: boolean; snapshots: EnglishSalarySnapshot[] } {
  if (!storage) return { ok: false, snapshots: [] };
  try {
    const raw = storage.getItem(ENGLISH_RESULTS_KEY);
    if (!raw) return { ok: true, snapshots: [] };
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.version !== 1 || !Array.isArray(data.snapshots) || data.snapshots.length > ENGLISH_RESULTS_LIMIT) return { ok: false, snapshots: [] };
    const snapshots = data.snapshots.map(parseSnapshot);
    if (snapshots.some(value => value === null) || new Set(snapshots.map(value => value!.id)).size !== snapshots.length) return { ok: false, snapshots: [] };
    return { ok: true, snapshots: (snapshots as EnglishSalarySnapshot[]).sort((a, b) => b.savedAt.localeCompare(a.savedAt)) };
  } catch { return { ok: false, snapshots: [] }; }
}

function write(snapshots: EnglishSalarySnapshot[], storage: StorageAccess): boolean {
  try {
    storage.setItem(ENGLISH_RESULTS_KEY, JSON.stringify({ version: 1, snapshots }));
    if (typeof window !== "undefined") window.dispatchEvent(new Event(ENGLISH_RESULTS_EVENT));
    return true;
  } catch { return false; }
}

export function saveEnglishSalarySnapshot(input: EnglishSalaryInput, storage: StorageAccess | null = browserStorage()): { ok: true } | { ok: false; reason: "invalid" | "unavailable" | "full" } {
  if (!validEnglishSalaryInput(input)) return { ok: false, reason: "invalid" };
  if (!storage) return { ok: false, reason: "unavailable" };
  const existing = loadEnglishSalarySnapshots(storage);
  if (!existing.ok) return { ok: false, reason: "unavailable" };
  if (existing.snapshots.length >= ENGLISH_RESULTS_LIMIT) return { ok: false, reason: "full" };
  try {
    const snapshot: EnglishSalarySnapshot = { ...cleanInput(input), schemaVersion: 1, kind: "salary", model: MODEL, currency: "KRW", label: LABEL, id: crypto.randomUUID(), savedAt: new Date().toISOString() };
    return write([snapshot, ...existing.snapshots], storage) ? { ok: true } : { ok: false, reason: "unavailable" };
  } catch { return { ok: false, reason: "unavailable" }; }
}

/** A user must choose a particular saved result to delete. No implicit clearing or KO-key writes. */
export function deleteEnglishSalarySnapshot(id: string, storage: StorageAccess | null = browserStorage()): boolean {
  if (!storage || !UUID.test(id)) return false;
  const existing = loadEnglishSalarySnapshots(storage);
  if (!existing.ok || !existing.snapshots.some(value => value.id === id)) return false;
  return write(existing.snapshots.filter(value => value.id !== id), storage);
}
