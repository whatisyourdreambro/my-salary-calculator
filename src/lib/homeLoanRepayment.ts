export type HomeLoanRepaymentType = 'equalPrincipalAndInterest' | 'equalPrincipal';

/** Fixed-rate, monthly repayment illustration, excluding fees and grace periods.
 * The supplied loan rate is never replaced by assumed policy-product discounts.
 */
export function calculateHomeLoanRepayment(
  principal: number,
  annualRate: number,
  years: number,
  type: HomeLoanRepaymentType,
) {
  const months = years * 12;
  if (![principal, annualRate, months].every(Number.isFinite) || principal <= 0 ||
      annualRate < 0 || !Number.isInteger(months) || months <= 0) {
    return { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
  }
  const rate = annualRate / 100 / 12;
  const monthlyPayment = rate === 0
    ? principal / months
    : type === 'equalPrincipal'
      ? principal / months + principal * rate
      : principal * rate / (1 - Math.pow(1 + rate, -months));
  const totalPayment = rate === 0 ? principal : type === 'equalPrincipal'
    ? principal + principal * rate * (months + 1) / 2
    : monthlyPayment * months;
  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalPayment - principal),
    totalPayment: Math.round(totalPayment),
  };
}
