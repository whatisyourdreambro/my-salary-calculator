// src/lib/TaxLogic.ts

export type TaxResult = {
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeductions: number;
  netPay: number;
};

// 2026 Estimated Tax Constants (User Provided & Best Practice Estimates)
const TAX_RATES_2026 = {
  NATIONAL_PENSION: 0.045, // 4.5% (Employee share)
  HEALTH_INSURANCE: 0.03545, // 3.545% (Employee share)
  // Long-term care is 12.95% OF the Health Insurance premium
  LONG_TERM_CARE_RATIO: 0.1295, 
  EMPLOYMENT_INSURANCE: 0.009, // 0.9%
  LOCAL_INCOME_TAX_RATIO: 0.1, // 10% of Income Tax
};

// Caps (Monthly Max Bases) - Estimated for 2026
const CAPS_2026 = {
  NATIONAL_PENSION_MAX_INCOME: 6170000, // Monthly income cap for pension (Estimated increase)
  NATIONAL_PENSION_MIN_INCOME: 390000,
};

/**
 * Calculates the Earned Income Deduction (근로소득공제)
 * Based on 2024-2025 standards (often stable, but checked for 2026 projection)
 */
function getEarnedIncomeDeduction(annualSalary: number): number {
  if (annualSalary <= 5_000_000) return annualSalary * 0.7;
  if (annualSalary <= 15_000_000) return 3_500_000 + (annualSalary - 5_000_000) * 0.4;
  if (annualSalary <= 45_000_000) return 7_500_000 + (annualSalary - 15_000_000) * 0.15;
  if (annualSalary <= 100_000_000) return 12_000_000 + (annualSalary - 45_000_000) * 0.05;
  return 14_750_000 + (annualSalary - 100_000_000) * 0.02;
}

/**
 * Calculates Basic Income Tax (기본세율)
 * Progressive tax brackets (Standard Korean Income Tax Brackets)
 */
function getBaseTax(taxBase: number): number {
  if (taxBase <= 14_000_000) return taxBase * 0.06;
  if (taxBase <= 50_000_000) return 840_000 + (taxBase - 14_000_000) * 0.15;
  if (taxBase <= 88_000_000) return 6_240_000 + (taxBase - 50_000_000) * 0.24;
  if (taxBase <= 150_000_000) return 15_360_000 + (taxBase - 88_000_000) * 0.35;
  if (taxBase <= 300_000_000) return 37_060_000 + (taxBase - 150_000_000) * 0.38;
  if (taxBase <= 500_000_000) return 94_060_000 + (taxBase - 300_000_000) * 0.40;
  if (taxBase <= 1_000_000_000) return 174_060_000 + (taxBase - 500_000_000) * 0.42;
  return 384_060_000 + (taxBase - 1_000_000_000) * 0.45;
}

/**
 * Calculates Earned Income Tax Credit (근로소득세액공제)
 */
function getTaxCredit(calculatedTax: number, annualSalary: number): number {
  let credit = 0;
  if (calculatedTax <= 1_300_000) {
    credit = calculatedTax * 0.55;
  } else {
    credit = 715_000 + (calculatedTax - 1_300_000) * 0.30;
  }

  // Cap on credit based on salary
  let limit = 740_000;
  if (annualSalary > 70_000_000) limit = 660_000;
  if (annualSalary > 33_000_000 && annualSalary <= 70_000_000) limit = 740_000; // Explicit for clarity
  // Note: Detailed high income limits exist but simplified for 2026 core logic
  if (annualSalary > 100_000_000) limit = 500_000; // Approximate reduction for high earners

  return Math.min(credit, limit);
}

export function calculateSalary2026(
  annualSalary: number,
  nonTaxableMonthly: number = 200_000,
  dependents: number = 1,
  children: number = 0
): TaxResult {
  const monthlySalary = annualSalary / 12;
  
  // 1. National Pension
  // Logic: Applied on monthly income, capped at max income
  const pensionBase = Math.min(Math.max(monthlySalary - nonTaxableMonthly, CAPS_2026.NATIONAL_PENSION_MIN_INCOME), CAPS_2026.NATIONAL_PENSION_MAX_INCOME);
  const nationalPension = Math.floor((pensionBase * TAX_RATES_2026.NATIONAL_PENSION) / 10) * 10; // Floor to 10 won

  // 2. Health Insurance
  // Logic: Applied on (Monthly Salary - NonTaxable)
  const healthBase = monthlySalary - nonTaxableMonthly;
  const healthInsurance = Math.floor((healthBase * TAX_RATES_2026.HEALTH_INSURANCE) / 10) * 10;

  // 3. Long-term Care Insurance
  // Logic: % of Health Insurance
  const longTermCare = Math.floor((healthInsurance * TAX_RATES_2026.LONG_TERM_CARE_RATIO) / 10) * 10;

  // 4. Employment Insurance
  // Logic: Applied on (Monthly Salary - NonTaxable)
  const employmentInsurance = Math.floor((healthBase * TAX_RATES_2026.EMPLOYMENT_INSURANCE) / 10) * 10;

  // 5. Income Tax (Simplified Year-End Adjustment Logic for Monthly Withholding)
  // Step A: Annual Income -> Tax Base
  const annualNonTaxable = nonTaxableMonthly * 12;
  const taxableIncome = Math.max(0, annualSalary - annualNonTaxable);
  const incomeDeduction = getEarnedIncomeDeduction(taxableIncome);
  
  // Step B: Personal Exemptions
  // Basic: 1.5M per person
  const personalExemption = dependents * 1_500_000; 
  // Pension Deduction (Full amount deductible)
  const annualPension = nationalPension * 12; // Approximation using monthly * 12
  
  const taxBase = Math.max(0, taxableIncome - incomeDeduction - personalExemption - annualPension);
  
  // Step C: Calculate Tax
  const calculatedTax = getBaseTax(taxBase);
  
  // Step D: Tax Credits
  const taxCredit = getTaxCredit(calculatedTax, annualSalary);
  
  // Child Tax Credit (simplified)
  let childCredit = 0;
  if (children === 1) childCredit = 150_000;
  else if (children === 2) childCredit = 300_000;
  else if (children >= 3) childCredit = 300_000 + (children - 2) * 300_000;
  
  const finalAnnualTax = Math.max(0, calculatedTax - taxCredit - childCredit);
  
  // Monthly Income Tax
  const incomeTax = Math.floor((finalAnnualTax / 12) / 10) * 10;
  
  // 6. Local Income Tax (10% of Income Tax)
  const localIncomeTax = Math.floor((incomeTax * TAX_RATES_2026.LOCAL_INCOME_TAX_RATIO) / 10) * 10;

  const totalDeductions = nationalPension + healthInsurance + longTermCare + employmentInsurance + incomeTax + localIncomeTax;
  const netPay = Math.floor(monthlySalary - totalDeductions);

  return {
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    incomeTax,
    localIncomeTax,
    totalDeductions,
    netPay
  };
}
