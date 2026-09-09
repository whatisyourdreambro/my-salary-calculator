/** Ratios are undefined when no money has been invested. Keep that state explicit. */
export function compoundDisplayRatios(balance: number, principal: number, interest: number) {
  const percentage = (amount: number) =>
    Number.isFinite(balance) && balance > 0 && Number.isFinite(amount)
      ? Math.max(0, Math.min(100, amount / balance * 100))
      : 0;
  const multiplier = principal > 0 && Number.isFinite(balance) && Number.isFinite(principal)
    ? balance / principal
    : null;
  return {
    multiplier: multiplier !== null && Number.isFinite(multiplier) ? multiplier : null,
    principalPercent: percentage(principal),
    interestPercent: percentage(interest),
  };
}
