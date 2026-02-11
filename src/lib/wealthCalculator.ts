// src/lib/wealthCalculator.ts

export interface WealthDataPoint {
  year: number;
  age: number;
  simpleSavings: number;
  compoundGrowth: number;
}

/**
 * Calculates yearly wealth projection
 * @param monthlySavings Amount saved per month
 * @param annualReturn Expected annual return (e.g., 0.08 for 8%)
 * @param years Projection horizon (default 30)
 * @param currentAge Starting age for tooltip context
 */
export function calculateWealthProjection(
  monthlySavings: number,
  annualReturn: number,
  years: number = 30,
  currentAge: number = 30
): WealthDataPoint[] {
  const data: WealthDataPoint[] = [];
  let simpleSavings = 0;
  let compoundGrowth = 0;
  
  const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;

  for (let year = 0; year <= years; year++) {
    // Current state at end of year
    data.push({
      year,
      age: currentAge + year,
      simpleSavings: Math.round(simpleSavings),
      compoundGrowth: Math.round(compoundGrowth),
    });

    // Calculate next year's growth (12 months of contributions)
    for (let month = 0; month < 12; month++) {
      simpleSavings += monthlySavings;
      
      // Compound Interest Formula: (Current + Contribution) * (1 + Monthly Rate)
      compoundGrowth = (compoundGrowth + monthlySavings) * (1 + monthlyReturn);
    }
  }

  return data;
}
