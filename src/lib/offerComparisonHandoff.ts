/** Explicit, same-tab handoff only. Never put this payload in a URL, event or log. */
export const OFFER_COMPARISON_HANDOFF_KEY = "moneysalary:offer-comparison-handoff:v1";
export const OFFER_COMPARISON_HANDOFF_TTL_MS = 10 * 60 * 1000;

export type OfferComparisonConditions = {
  /** KRW/year; includes the monthly non-taxable amount, excludes severance. */
  annualGross: number;
  /** KRW/month, already part of annualGross, never added to it a second time. */
  nonTaxableMonthly: number;
  /** Total eligible dependents INCLUDING the taxpayer. */
  dependents: number;
  /** Eligible children aged 8–20, already included in dependents. */
  children: number;
};
export type HandoffStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function hasExactKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
const integer = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;

export function isValidOfferComparisonConditions(value: unknown): value is OfferComparisonConditions {
  if (!hasExactKeys(value, ["annualGross", "nonTaxableMonthly", "dependents", "children"])) return false;
  return integer(value.annualGross, 1, 1_000_000_000_000) &&
    integer(value.nonTaxableMonthly, 0, value.annualGross / 12) &&
    integer(value.dependents, 1, 20) && integer(value.children, 0, 10) &&
    value.children <= value.dependents - 1;
}

/** The pilot only transfers conditions that still describe the visible home result. */
export function canHandoffCurrentSalaryResult(state: {
  pathname: string | null; incomeType: string; severanceType: string;
  showResult: boolean; isCalculating: boolean; inputsValid: boolean;
  inputSnapshot: string; calculatedSnapshot: string | null;
  result: { monthlyNet: number } & Record<string, number>;
  conditions: unknown;
}): boolean {
  return state.pathname === "/" && state.incomeType === "regular" && state.severanceType === "separate" &&
    state.showResult && !state.isCalculating && state.inputsValid &&
    state.calculatedSnapshot === state.inputSnapshot &&
    Object.values(state.result).every(Number.isFinite) && state.result.monthlyNet > 0 &&
    isValidOfferComparisonConditions(state.conditions);
}

/** Replaces only this dedicated key. Failure must not trigger navigation/success UI. */
export function writeOfferComparisonHandoff(
  conditions: unknown, storage: HandoffStorage, now = Date.now(),
): boolean {
  try {
    storage.removeItem(OFFER_COMPARISON_HANDOFF_KEY);
    if (!isValidOfferComparisonConditions(conditions) || !integer(now, 0, Number.MAX_SAFE_INTEGER - OFFER_COMPARISON_HANDOFF_TTL_MS)) return false;
    storage.setItem(OFFER_COMPARISON_HANDOFF_KEY, JSON.stringify({
      version: 1, source: "home-salary", taxYear: 2026,
      createdAt: now, expiresAt: now + OFFER_COMPARISON_HANDOFF_TTL_MS,
      conditions,
    }));
    return true;
  } catch {
    return false;
  }
}

/** Consume once before applying. Invalid/expired payloads are removed as well. */
export function consumeOfferComparisonHandoff(
  storage: HandoffStorage, now = Date.now(),
): OfferComparisonConditions | null {
  try {
    const raw = storage.getItem(OFFER_COMPARISON_HANDOFF_KEY);
    storage.removeItem(OFFER_COMPARISON_HANDOFF_KEY);
    if (!raw || raw.length > 2048 || !integer(now, 0, Number.MAX_SAFE_INTEGER)) return null;
    const value: unknown = JSON.parse(raw);
    if (!hasExactKeys(value, ["version", "source", "taxYear", "createdAt", "expiresAt", "conditions"])) return null;
    if (value.version !== 1 || value.source !== "home-salary" || value.taxYear !== 2026 ||
      !integer(value.createdAt, 0, now) || !integer(value.expiresAt, now + 1, Number.MAX_SAFE_INTEGER) ||
      value.expiresAt !== value.createdAt + OFFER_COMPARISON_HANDOFF_TTL_MS ||
      !isValidOfferComparisonConditions(value.conditions)) return null;
    return { ...value.conditions };
  } catch {
    return null;
  }
}
