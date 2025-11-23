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
    JP: 0.11,    // 1 KRW = 0.11 JPY (approx 900 KRW/100 JPY)
    SG: 0.001,   // 1 KRW = 0.001 SGD
    UK: 0.0006,  // 1 KRW = 0.0006 GBP
};

// Purchasing Power Parity (Cost of Living Index, roughly)
// Higher means more expensive. Baseline US=1.0
export const PPP_INDEX: Record<CountryCode, number> = {
    KR: 0.75, // Korea is cheaper than US
    US: 1.0,
    JP: 0.85,
    SG: 1.1,  // Singapore is expensive
    UK: 0.9,
};

export const COUNTRY_NAMES: Record<CountryCode, { name: string; flag: string }> = {
    KR: { name: "South Korea", flag: "🇰🇷" },
    US: { name: "United States (CA)", flag: "🇺🇸" },
    JP: { name: "Japan", flag: "🇯🇵" },
    SG: { name: "Singapore", flag: "🇸🇬" },
    UK: { name: "United Kingdom", flag: "🇬🇧" },
};

export class GlobalTaxEngine {
    static calculate(grossKRW: number, country: CountryCode): TaxResult {
        const localGross = grossKRW * EXCHANGE_RATES[country];
        let tax = 0;
        let social = 0;

        switch (country) {
            case 'KR':
                // Simplified KR Tax (2024)
                // Income Tax
                if (localGross <= 14000000) tax = localGross * 0.06;
                else if (localGross <= 50000000) tax = 840000 + (localGross - 14000000) * 0.15;
                else if (localGross <= 88000000) tax = 6240000 + (localGross - 50000000) * 0.24;
                else if (localGross <= 150000000) tax = 15360000 + (localGross - 88000000) * 0.35;
                else if (localGross <= 300000000) tax = 37060000 + (localGross - 150000000) * 0.38;
                else if (localGross <= 500000000) tax = 94060000 + (localGross - 300000000) * 0.40;
                else tax = 174060000 + (localGross - 500000000) * 0.42;

                // Social (Pension 4.5%, Health 3.545%, Employment 0.9%) ~ Approx 9%
                social = localGross * 0.09;
                break;

            case 'US':
                // Simplified US Tax (Federal + CA State)
                // Federal (2024 Single)
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
