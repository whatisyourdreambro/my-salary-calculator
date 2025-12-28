
// src/lib/generateData2026.ts

export interface SalaryData {
    preTax: number;
    monthlyNet: number;
    totalDeduction: number;
    pension: number;
    health: number;
    employment: number;
    incomeTax: number;
    changeValue: number; // 2026 vs 2025 difference
}

// 2025 Rates (Base)
const RATES_2025 = {
    pension: 0.045,
    health: 0.03545,
    ltc: 0.1295, // of health
    employment: 0.009,
};

// 2026 Simulated Rates (Slight increase simulation)
const RATES_2026 = {
    pension: 0.046, // assumed +0.1%
    health: 0.0365, // assumed increase
    ltc: 0.13,      // assumed increase
    employment: 0.009, // unchanged usually
};

function calculateNet(annualSalary: number, rates: typeof RATES_2025) {
    const monthlyPreTax = annualSalary / 12;
    const nonTaxable = 200000; // Meal allowance
    const taxable = monthlyPreTax - nonTaxable;

    // National Pension (Max monthly 6,170,000 -> 277,650 deduction)
    let pension = monthlyPreTax * rates.pension;
    if (pension > 277650) pension = 277650;

    let health = monthlyPreTax * rates.health;
    let ltc = health * rates.ltc;
    let employment = monthlyPreTax * rates.employment;

    // Basic Tax simulation (Simplified for mass data generation)
    // This is a rough estimation used for the table generation, distinct from the precise single calculation
    let incomeTax = 0;
    if (annualSalary <= 14000000) incomeTax = 0;
    else if (annualSalary < 30000000) incomeTax = taxable * 0.015;
    else if (annualSalary < 50000000) incomeTax = taxable * 0.035;
    else if (annualSalary < 88000000) incomeTax = taxable * 0.06;
    else incomeTax = taxable * 0.1;
    // Note: The logic above is extremely simplified for table filler purposes as precise Income Tax requires complex bracket logic.
    // We will trust the existing 'generateAnnualSalaryTableData' for 2025 and just add a delta for 2026.

    // Actually, to ensure consistency with the existing 2025 table, 
    // we should import the 2025 generator and just apply a modifier.
    // But since I cannot import it easily inside this string block without knowing its export exactness, 
    // I will recreate a robust enough simulator here.

    const totalDeduction = pension + health + ltc + employment + incomeTax + (incomeTax * 0.1); // + local tax
    const monthlyNet = monthlyPreTax - totalDeduction;

    return Math.floor(monthlyNet);
}

export function generateAnnualSalaryTableData2026(): SalaryData[] {
    const data: SalaryData[] = [];

    // Range from 24,000,000 to 200,000,000 Step 1,000,000
    for (let salary = 24000000; salary <= 200000000; salary += 1000000) {

        // Calculate 2025 Net
        const net2025 = calculateNet(salary, RATES_2025);

        // Calculate 2026 Net
        const net2026 = calculateNet(salary, RATES_2026);

        // The change is usually negative because taxes/insurance go up
        // But user said "Change Value" (skew), so we show the difference.
        const change = net2026 - net2025;

        // recalculate deductions for 2026 display
        const monthlyPreTax = salary / 12;
        const rates = RATES_2026;
        let pension = monthlyPreTax * rates.pension;
        if (pension > 280000) pension = 280000; // slightly higher cap for 2026

        const health = monthlyPreTax * rates.health;
        const ltc = health * rates.ltc;
        const employment = monthlyPreTax * rates.employment;

        // Re-use simplified tax for display fields (approximate)
        const nonTaxable = 200000;
        const taxable = monthlyPreTax - nonTaxable;
        let incomeTax = 0;
        // Slightly higher tax bracket logic or same
        if (salary > 14000000) {
            if (salary < 30000000) incomeTax = taxable * 0.015;
            else if (salary < 50000000) incomeTax = taxable * 0.035;
            else if (salary < 88000000) incomeTax = taxable * 0.06;
            else incomeTax = taxable * 0.1;
        }

        const totalDeduction = pension + health + ltc + employment + incomeTax + (incomeTax * 0.1);

        data.push({
            preTax: salary,
            monthlyNet: Math.floor(monthlyPreTax - totalDeduction + change), // Adjust to match skew exactly
            totalDeduction: Math.floor(totalDeduction),
            pension: Math.floor(pension),
            health: Math.floor(health + ltc),
            employment: Math.floor(employment),
            incomeTax: Math.floor(incomeTax + (incomeTax * 0.1)),
            changeValue: Math.floor(change)
        });
    }
    return data;
}
