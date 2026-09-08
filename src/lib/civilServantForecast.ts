import { GENERAL_PAY_ROWS_2026, forecast2027 } from "@/lib/civilServantPay";

export const CIVIL_FORECAST_GRADES = [9, 8, 7, 6, 5] as const;
export const CIVIL_FORECAST_STEPS = GENERAL_PAY_ROWS_2026.map(([step]) => step);

/** Look up the shared official base before applying the existing forecast rule. */
export function getCivilServantForecast(grade: number, step: number) {
  if (!Number.isInteger(grade) || !Number.isInteger(step)) return null;
  const column = CIVIL_FORECAST_GRADES.findIndex(value => value === grade);
  const row = GENERAL_PAY_ROWS_2026.find(([value]) => value === step);
  if (column < 0 || !row) return null;
  const base2026 = row[column + 1];
  const predicted2027 = forecast2027(base2026);
  return { grade, step, base2026, predicted2027, monthlyIncrease: predicted2027 - base2026 };
}
