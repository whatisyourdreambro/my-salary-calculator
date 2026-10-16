/** Quote is asset-currency units per one comparison-currency unit. */
export function assetInComparisonCurrency(amount: number, currentQuote: number): number {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(currentQuote) || currentQuote <= 0) return 0;
  const converted = amount / currentQuote;
  return Number.isFinite(converted) ? converted : 0;
}
