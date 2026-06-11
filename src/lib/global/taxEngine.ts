export type CountryCode = 'KR' | 'US' | 'JP' | 'SG' | 'UK';

export interface TaxResult {
 country: CountryCode;
 currency: string;
 gross: number;
 tax: number;
 social: number; // Social security / Insurance
 net: number;
 effectiveRate: number;
}

interface TaxBracket {
 threshold: number;
 rate: number;
}

export const EXCHANGE_RATES: Record<CountryCode, number> = {
 KR: 1,
 US: 0.00075, // 1 KRW = 0.00075 USD (approx 1330 KRW/USD)
 JP: 0.11, // 1 KRW = 0.11 JPY (approx 900 KRW/100 JPY)
 SG: 0.001, // 1 KRW = 0.001 SGD
 UK: 0.0006, // 1 KRW = 0.0006 GBP
};

// Purchasing Power Parity (Cost of Living Index, roughly)
// Higher means more expensive. Baseline US=1.0
export const PPP_INDEX: Record<CountryCode, number> = {
 KR: 0.75, // Korea is cheaper than US
 US: 1.0,
 JP: 0.85,
 SG: 1.1, // Singapore is expensive
 UK: 0.9,
};

export const COUNTRY_NAMES: Record<CountryCode, { name: string; flag: string }> = {
 KR: { name: "South Korea", flag: "🇰🇷" },
 US: { name: "United States (CA)", flag: "🇺🇸" },
 JP: { name: "Japan", flag: "🇯🇵" },
 SG: { name: "Singapore", flag: "🇸🇬" },
 UK: { name: "United Kingdom", flag: "🇬🇧" },
};

// ─────────────────────────────────────────────────────────────
// KR helpers (2026) — flat-tax / salary-converter 페이지에서 재사용
// ─────────────────────────────────────────────────────────────

// 근로소득공제 (2026 표준 구간, 한도 2,000만원) — 총급여(연) 기준
export function earnedIncomeDeduction(grossAnnual: number): number {
 if (grossAnnual <= 0) return 0;
 let deduction: number;
 if (grossAnnual <= 5_000_000) deduction = grossAnnual * 0.7;
 else if (grossAnnual <= 15_000_000) deduction = 3_500_000 + (grossAnnual - 5_000_000) * 0.4;
 else if (grossAnnual <= 45_000_000) deduction = 7_500_000 + (grossAnnual - 15_000_000) * 0.15;
 else if (grossAnnual <= 100_000_000) deduction = 12_000_000 + (grossAnnual - 45_000_000) * 0.05;
 else deduction = 14_750_000 + (grossAnnual - 100_000_000) * 0.02;
 return Math.min(deduction, 20_000_000);
}

// 한국 소득세 누진세율 (2026, 8구간 6~45%) — 과세표준 기준
export function calcKrProgressiveTax(taxable: number): number {
 if (taxable <= 0) return 0;
 if (taxable <= 14_000_000) return taxable * 0.06;
 if (taxable <= 50_000_000) return 840_000 + (taxable - 14_000_000) * 0.15;
 if (taxable <= 88_000_000) return 6_240_000 + (taxable - 50_000_000) * 0.24;
 if (taxable <= 150_000_000) return 15_360_000 + (taxable - 88_000_000) * 0.35;
 if (taxable <= 300_000_000) return 37_060_000 + (taxable - 150_000_000) * 0.38;
 if (taxable <= 500_000_000) return 94_060_000 + (taxable - 300_000_000) * 0.4;
 if (taxable <= 1_000_000_000) return 174_060_000 + (taxable - 500_000_000) * 0.42;
 return 384_060_000 + (taxable - 1_000_000_000) * 0.45;
}

// 국민연금 기준소득월액 상한 (2026): 월 637만원
export const KR_PENSION_MONTHLY_CAP = 6_370_000;

// 4대보험 본인부담 합계 (2026) — 국민연금 4.75%(상한 적용)·건강 3.595%·장기요양(건보료의 13.14%)·고용 0.9%
export function krSocialInsurance(grossAnnual: number): number {
 const pension = Math.min(grossAnnual / 12, KR_PENSION_MONTHLY_CAP) * 12 * 0.0475;
 const health = grossAnnual * 0.03595;
 const longTermCare = health * 0.1314;
 const employment = grossAnnual * 0.009;
 return pension + health + longTermCare + employment;
}

export class GlobalTaxEngine {
 static calculate(grossKRW: number, country: CountryCode): TaxResult {
 const localGross = grossKRW * EXCHANGE_RATES[country];
 let tax = 0;
 let social = 0;

 switch (country) {
 case 'KR':
 // Simplified KR Tax (2026) — 근로소득공제 반영해 과대계산 완화
 // Income Tax: 총급여 − 근로소득공제 → 2026 누진세율 6~45% (8구간)
 tax = calcKrProgressiveTax(localGross - earnedIncomeDeduction(localGross));

 // Social (2026): Pension 4.75% (월 637만 상한) + Health 3.595% + 장기요양 + Employment 0.9%
 social = krSocialInsurance(localGross);
 break;

 case 'US':
 // Simplified US Tax (Federal + CA State)
 // Federal 2024 single 기준 단순화 (표준공제 미반영 추정치)
 let fedTax = 0;
 if (localGross <= 11600) fedTax = localGross * 0.10;
 else if (localGross <= 47150) fedTax = 1160 + (localGross - 11600) * 0.12;
 else if (localGross <= 100525) fedTax = 5426 + (localGross - 47150) * 0.22;
 else if (localGross <= 191950) fedTax = 17168 + (localGross - 100525) * 0.24;
 else if (localGross <= 243725) fedTax = 39110 + (localGross - 191950) * 0.32;
 else if (localGross <= 609350) fedTax = 55678 + (localGross - 243725) * 0.35;
 else fedTax = 183647 + (localGross - 609350) * 0.37;

 // CA State (Roughly 9.3% for high earners, simplified progressive)
 let stateTax = localGross * 0.08; // Averaged

 // FICA (7.65%)
 social = localGross * 0.0765;
 tax = fedTax + stateTax;
 break;

 case 'JP':
 // Simplified Japan Tax
 // Income Tax
 if (localGross <= 1950000) tax = localGross * 0.05;
 else if (localGross <= 3300000) tax = (localGross * 0.10) - 97500;
 else if (localGross <= 6950000) tax = (localGross * 0.20) - 427500;
 else if (localGross <= 9000000) tax = (localGross * 0.23) - 636000;
 else if (localGross <= 18000000) tax = (localGross * 0.33) - 1536000;
 else if (localGross <= 40000000) tax = (localGross * 0.40) - 2796000;
 else tax = (localGross * 0.45) - 4796000;

 // Residence Tax (10%)
 tax += localGross * 0.10;

 // Social Insurance (~15%)
 social = localGross * 0.15;
 break;

 case 'SG':
 // Singapore (Very low tax)
 if (localGross <= 20000) tax = 0;
 else if (localGross <= 30000) tax = (localGross - 20000) * 0.02;
 else if (localGross <= 40000) tax = 200 + (localGross - 30000) * 0.035;
 else if (localGross <= 80000) tax = 550 + (localGross - 40000) * 0.07;
 else if (localGross <= 120000) tax = 3350 + (localGross - 80000) * 0.115;
 else if (localGross <= 160000) tax = 7950 + (localGross - 120000) * 0.15;
 else if (localGross <= 200000) tax = 13950 + (localGross - 160000) * 0.18;
 else if (localGross <= 240000) tax = 21150 + (localGross - 200000) * 0.19;
 else if (localGross <= 280000) tax = 28750 + (localGross - 240000) * 0.195;
 else if (localGross <= 320000) tax = 36550 + (localGross - 280000) * 0.20;
 else tax = 44550 + (localGross - 320000) * 0.22;

 // CPF (Social) - Only for citizens/PR, but let's assume 0 for expats or max cap for locals
 // For simplicity in "Global Talent" context, we often assume expat (0 CPF) or capped. 
 // Let's use a small flat rate to represent insurance etc.
 social = 0;
 break;

 case 'UK':
 // UK Tax
 // Personal Allowance ~12570 (0%)
 // Basic 20% up to 50270
 // Higher 40% up to 125140
 // Additional 45%
 if (localGross <= 12570) tax = 0;
 else if (localGross <= 50270) tax = (localGross - 12570) * 0.20;
 else if (localGross <= 125140) tax = 7540 + (localGross - 50270) * 0.40;
 else tax = 37488 + (localGross - 125140) * 0.45;

 // National Insurance (~10% blended)
 if (localGross > 12570) social = (localGross - 12570) * 0.10;
 break;
 }

 const net = localGross - tax - social;
 const effectiveRate = ((tax + social) / localGross) * 100;

 return {
 country,
 currency: country === 'US' ? 'USD' : country === 'KR' ? 'KRW' : country === 'JP' ? 'JPY' : country === 'UK' ? 'GBP' : 'SGD',
 gross: localGross,
 tax,
 social,
 net,
 effectiveRate
 };
 }
}
