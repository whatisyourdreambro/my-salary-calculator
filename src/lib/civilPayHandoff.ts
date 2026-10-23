/** Same-tab, explicit table selection. Never put this payload in a URL, analytics event or log. */
export const CIVIL_PAY_HANDOFF_KEY = "moneysalary:civil-pay-handoff:v1";
export const CIVIL_PAY_HANDOFF_TTL_MS = 10 * 60 * 1000;
export const CIVIL_PAY_BASIS_VERSION = "civil-pay-2026-annex10-v1";
export const CIVIL_PAY_DESTINATION = "/calc/civil-servant-net-pay";

export const CIVIL_PAY_GRADES = {
  police: [
    { id: "police-sungyeong", label: "순경", engineRank: 0 },
    { id: "police-gyeongjang", label: "경장", engineRank: 1 },
    { id: "police-gyeongsa", label: "경사", engineRank: 2 },
    { id: "police-gyeongwi", label: "경위", engineRank: 3 },
    { id: "police-gyeonggam", label: "경감", engineRank: 4 },
  ],
  fire: [
    { id: "fire-sobangsa", label: "소방사", engineRank: 0 },
    { id: "fire-sobanggyo", label: "소방교", engineRank: 1 },
    { id: "fire-sobangjang", label: "소방장", engineRank: 2 },
    { id: "fire-sobangwi", label: "소방위", engineRank: 3 },
    { id: "fire-sobanggyeong", label: "소방경", engineRank: 4 },
  ],
} as const;
export type CivilPayOccupation = keyof typeof CIVIL_PAY_GRADES;
export type CivilPayGradeId = (typeof CIVIL_PAY_GRADES)[CivilPayOccupation][number]["id"];
export const CIVIL_PAY_SOURCES = {
  police: "/police-pay-2026", fire: "/firefighter-pay-2026",
} as const;
export type CivilPaySelection = {
  source: (typeof CIVIL_PAY_SOURCES)[CivilPayOccupation];
  occupation: CivilPayOccupation;
  gradeId: CivilPayGradeId;
  step: number;
  payYear: 2026;
  basisVersion: typeof CIVIL_PAY_BASIS_VERSION;
};
type StorageAccess = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type CivilPayHandoffResult =
  | { status: "absent" }
  | { status: "accepted"; selection: CivilPaySelection }
  | { status: "rejected"; reason: "invalid" | "expired" | "storage_unavailable" };

function exactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
const integer = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;

/** No clamping: this pilot supports exactly the 50 cells shown by the two source tables. */
export function isCivilPaySelection(value: unknown): value is CivilPaySelection {
  if (!exactKeys(value, ["source", "occupation", "gradeId", "step", "payYear", "basisVersion"])) return false;
  if (value.occupation !== "police" && value.occupation !== "fire") return false;
  return value.source === CIVIL_PAY_SOURCES[value.occupation] && value.payYear === 2026 &&
    value.basisVersion === CIVIL_PAY_BASIS_VERSION && integer(value.step, 1, 5) &&
    CIVIL_PAY_GRADES[value.occupation].some(grade => grade.id === value.gradeId);
}

export function civilPaySelectionInput(selection: CivilPaySelection) {
  if (!isCivilPaySelection(selection)) return null;
  const grade = CIVIL_PAY_GRADES[selection.occupation].find(item => item.id === selection.gradeId)!;
  return { kind: selection.occupation, rank: grade.engineRank, hobong: selection.step };
}

/** Restoring a table cell or editing before confirmation must not count as a result. */
export function isCivilPayResultReady(awaitingConfirmation: boolean, inputsValid: boolean, result: {
  net: number; grossMonthly: number; deductions: number;
}): boolean {
  return !awaitingConfirmation && inputsValid && [result.net, result.grossMonthly, result.deductions].every(Number.isFinite);
}

export function writeCivilPayHandoff(selection: unknown, pathname: string | null, storage: StorageAccess, now = Date.now()): boolean {
  try {
    storage.removeItem(CIVIL_PAY_HANDOFF_KEY);
    if (!isCivilPaySelection(selection) || pathname !== selection.source ||
      !integer(now, 0, Number.MAX_SAFE_INTEGER - CIVIL_PAY_HANDOFF_TTL_MS)) return false;
    storage.setItem(CIVIL_PAY_HANDOFF_KEY, JSON.stringify({
      version: 1, createdAt: now, expiresAt: now + CIVIL_PAY_HANDOFF_TTL_MS, selection,
    }));
    return true;
  } catch { return false; }
}

/** Remove before validation/application. A failed removal must never apply the saved value. */
export function consumeCivilPayHandoff(storage: StorageAccess, now = Date.now()): CivilPayHandoffResult {
  let raw: string | null;
  try {
    raw = storage.getItem(CIVIL_PAY_HANDOFF_KEY);
    storage.removeItem(CIVIL_PAY_HANDOFF_KEY);
  } catch { return { status: "rejected", reason: "storage_unavailable" }; }
  if (raw === null) return { status: "absent" };
  try {
    if (raw.length > 2048 || !integer(now, 0, Number.MAX_SAFE_INTEGER)) throw new Error("invalid");
    const value: unknown = JSON.parse(raw);
    if (!exactKeys(value, ["version", "createdAt", "expiresAt", "selection"]) || value.version !== 1 ||
      !integer(value.createdAt, 0, now) || !integer(value.expiresAt, 0, Number.MAX_SAFE_INTEGER) ||
      value.expiresAt !== value.createdAt + CIVIL_PAY_HANDOFF_TTL_MS || !isCivilPaySelection(value.selection)) {
      return { status: "rejected", reason: "invalid" };
    }
    if (value.expiresAt <= now) return { status: "rejected", reason: "expired" };
    return { status: "accepted", selection: { ...value.selection } };
  } catch { return { status: "rejected", reason: "invalid" }; }
}
