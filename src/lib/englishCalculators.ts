import { calcIncomeTax2026, earnedIncomeDeduction2026, earnedIncomeTaxCredit2026 } from "./taxConstants2026";

export const MAX_ANNUAL_KRW = 1_000_000_000;

export function parseCalculatorAmount(value: string, maximum = MAX_ANNUAL_KRW): number | null {
  if (!/^\d+(?:\.\d+)?$/.test(value.trim())) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 && amount <= maximum ? amount : null;
}

export function parseWholeKRW(value: string): number | null {
  const amount = parseCalculatorAmount(value);
  return amount !== null && Number.isInteger(amount) ? amount : null;
}

export function compareKoreanIncomeTax(remuneration: number, progressiveExempt: number, deductibleContributions: number) {
  if (![remuneration, progressiveExempt, deductibleContributions].every((value) => Number.isFinite(value) && value >= 0 && value <= MAX_ANNUAL_KRW)) return null;
  const progressiveGross = remuneration - progressiveExempt;
  if (progressiveGross < 0 || deductibleContributions > progressiveGross) return null;
  const earnedDeduction = earnedIncomeDeduction2026(progressiveGross);
  const taxableIncome = Math.max(0, progressiveGross - earnedDeduction - 1_500_000 - deductibleContributions);
  const calculatedTax = calcIncomeTax2026(taxableIncome);
  const earnedCredit = Math.min(calculatedTax, earnedIncomeTaxCredit2026(calculatedTax, progressiveGross));
  const national = Math.max(0, calculatedTax - earnedCredit);
  const local = Math.round(national * 0.1);
  const flatNational = Math.round(remuneration * 0.19);
  const flatLocal = Math.round(flatNational * 0.1);
  return {
    progressive: { gross: progressiveGross, earnedDeduction, taxableIncome, earnedCredit, national, local, total: national + local },
    flat: { national: flatNational, local: flatLocal, total: flatNational + flatLocal },
    difference: flatNational + flatLocal - national - local,
  };
}

export function convertGrossSalary(annualKRW: number, krwPerUnit: number) {
  if (!Number.isFinite(annualKRW) || annualKRW < 0 || annualKRW > MAX_ANNUAL_KRW || !Number.isFinite(krwPerUnit) || krwPerUnit < 0.000001 || krwPerUnit > 1_000_000) return null;
  return { annual: annualKRW / krwPerUnit, monthly: annualKRW / krwPerUnit / 12 };
}
