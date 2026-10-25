import { calculatePensionHike } from "./pensionHike";
import { INSURANCE_RATES_2026 } from "./taxConstants2026";
import { INSURANCE_RATES_2027 } from "./taxConstants2027";

/** Rate-page examples only; bounds remain 2026-07 through 2027-06 in both years. */
export function calculateInsuranceRateExample(monthly: number, year: 2026 | 2027) {
  const comparison = calculatePensionHike(String(monthly));
  if (!comparison) throw new RangeError("A positive whole-won monthly income is required");
  const rates = year === 2026 ? INSURANCE_RATES_2026 : INSURANCE_RATES_2027;
  // Preserve the existing tables' per-contribution ten-won truncation. Only the
  // pension basis discards sub-thousand income; other examples use monthly pay.
  const tenWonFloor = (amount: number) => Math.floor(amount / 10) * 10;
  const pension = tenWonFloor(comparison.base * rates.NATIONAL_PENSION);
  const pension2026 = tenWonFloor(comparison.p2026);
  const health = tenWonFloor(monthly * rates.HEALTH_INSURANCE);
  const longTermCare = tenWonFloor(health * rates.LONG_TERM_CARE_RATIO);
  const employment = tenWonFloor(monthly * rates.EMPLOYMENT_INSURANCE);
  return {
    pensionBase: comparison.base,
    pension, health, longTermCare, employment,
    total: pension + health + longTermCare + employment,
    diff2026: pension - pension2026,
  };
}
