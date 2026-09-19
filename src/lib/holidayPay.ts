/** Separate holiday-work estimate; not payroll or part of the live clock totals.
 * MOEL: https://1350.moel.go.kr/rtmview.do?id=1000111373
 * Statutory holiday pay for not working is deliberately excluded.
 */
export function estimateHolidayWorkPay(input: {
  ordinaryHourly: number; hours: number; nightHours: number; eligible: boolean;
}) {
  const { ordinaryHourly, hours, nightHours, eligible } = input;
  if (![ordinaryHourly, hours, nightHours].every(Number.isFinite) || ordinaryHourly <= 0 || ordinaryHourly > 100_000_000 || hours < 0 || hours > 24 || nightHours < 0 || nightHours > hours || nightHours > 8) return null;
  if (!eligible) return null;
  const base = ordinaryHourly * hours;
  const holidayPremium = ordinaryHourly * (Math.min(hours, 8) * 0.5 + Math.max(0, hours - 8));
  const nightPremium = ordinaryHourly * nightHours * 0.5;
  return { base, holidayPremium, nightPremium, total: base + holidayPremium + nightPremium };
}
