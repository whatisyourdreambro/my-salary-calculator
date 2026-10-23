import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "./taxConstants2026";
import { INSURANCE_RATES_2027 } from "./taxConstants2027";

/** Comparison only: the same income and 2026-07..2027-06 bounds in both years. */
export function calculatePensionHike(input: string) {
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(input)) return null;
  const monthly = Number(input.replaceAll(",", ""));
  if (!Number.isSafeInteger(monthly) || monthly <= 0) return null;
  // NPS reported standard monthly income discards the sub-1,000-won part.
  const base = Math.min(Math.max(Math.floor(monthly / 1_000) * 1_000,
    PENSION_BASE_2026.MIN_MONTHLY), PENSION_BASE_2026.MAX_MONTHLY);
  const p2026 = base * INSURANCE_RATES_2026.NATIONAL_PENSION;
  const p2027 = base * INSURANCE_RATES_2027.NATIONAL_PENSION;
  return {
    base, p2026, p2027,
    capped: monthly > PENSION_BASE_2026.MAX_MONTHLY,
    floored: monthly < PENSION_BASE_2026.MIN_MONTHLY,
    diffMonthly: p2027 - p2026,
    annualizedDifference: (p2027 - p2026) * 12,
    totalWithEmployer2027: p2027 * 2,
  };
}
