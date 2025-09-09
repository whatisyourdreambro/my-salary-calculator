// src/app/api/salary-table/route.ts

import { NextResponse } from "next/server";
import type { SalaryData } from "@/lib/types";

// ===================================================================
// calculator.ts의 내용을 이곳으로 전부 이동
// ===================================================================
const PENSION_RATE = 0.045;
const PENSION_MONTHLY_CAP = 5900000 * PENSION_RATE;
const HEALTH_RATE = 0.03545;
const LONG_TERM_CARE_RATE = 0.1295;
const EMPLOYMENT_INSURANCE_RATE = 0.009;
const LOCAL_INCOME_TAX_RATE = 0.1;

function getEarnedIncomeDeduction(annualSalary: number): number {
  if (annualSalary <= 5000000) return annualSalary * 0.7;
  if (annualSalary <= 15000000) return 3500000 + (annualSalary - 5000000) * 0.4;
  if (annualSalary <= 45000000)
    return 7500000 + (annualSalary - 15000000) * 0.15;
  if (annualSalary <= 100000000)
    return 12000000 + (annualSalary - 45000000) * 0.05;
  return 14750000 + (annualSalary - 100000000) * 0.02;
}

function getCalculatedTax(taxBase: number): number {
  if (taxBase <= 14000000) return taxBase * 0.06;
  if (taxBase <= 50000000) return 840000 + (taxBase - 14000000) * 0.15;
  if (taxBase <= 88000000) return 6240000 + (taxBase - 50000000) * 0.24;
  if (taxBase <= 150000000) return 15360000 + (taxBase - 88000000) * 0.35;
  if (taxBase <= 300000000) return 37060000 + (taxBase - 150000000) * 0.38;
  if (taxBase <= 500000000) return 94060000 + (taxBase - 300000000) * 0.4;
  if (taxBase <= 1000000000) return 174060000 + (taxBase - 500000000) * 0.42;
  return 384060000 + (taxBase - 1000000000) * 0.45;
}

function getTaxCredit(calculatedTax: number, annualSalary: number): number {
  let credit = 0;
  if (calculatedTax <= 1300000) {
    credit = calculatedTax * 0.55;
  } else {
    credit = 715000 + (calculatedTax - 1300000) * 0.3;
  }
  if (annualSalary > 70000000) return Math.min(credit, 660000);
  if (annualSalary > 33000000) return Math.min(credit, 740000);
  return credit;
}

function calculateNetSalary(
  annualSalary: number,
  nonTaxableAmount: number = 0,
  dependents: number = 1,
  children: number = 0,
  overtimePay: number = 0
) {
  const totalAnnualSalary = annualSalary + overtimePay;

  if (totalAnnualSalary <= 0) {
    return {
      monthlyNet: 0,
      totalDeduction: 0,
      pension: 0,
      health: 0,
      longTermCare: 0,
      employment: 0,
      incomeTax: 0,
      localTax: 0,
    };
  }

  const actualNonTaxableAmount = Math.min(totalAnnualSalary, nonTaxableAmount);
  const taxableAnnualSalary = totalAnnualSalary - actualNonTaxableAmount;
  const monthlySalary = totalAnnualSalary / 12;
  const taxableMonthlyIncome = Math.max(
    0,
    monthlySalary - actualNonTaxableAmount / 12
  );

  const pension = Math.min(
    taxableMonthlyIncome * PENSION_RATE,
    PENSION_MONTHLY_CAP
  );
  const health = taxableMonthlyIncome * HEALTH_RATE;
  const longTermCare = health * LONG_TERM_CARE_RATE;
  const employment = taxableMonthlyIncome * EMPLOYMENT_INSURANCE_RATE;

  const earnedIncomeDeduction = getEarnedIncomeDeduction(taxableAnnualSalary);
  const personalDeduction = dependents * 1500000;
  const pensionDeduction = pension * 12;

  const taxBase = Math.max(
    0,
    taxableAnnualSalary -
      earnedIncomeDeduction -
      personalDeduction -
      pensionDeduction
  );

  const calculatedTax = getCalculatedTax(taxBase);
  const taxCredit = getTaxCredit(calculatedTax, taxableAnnualSalary);
  const childTaxCredit = children * 150000;

  const finalAnnualTax = Math.max(
    0,
    calculatedTax - taxCredit - childTaxCredit
  );

  const incomeTax = finalAnnualTax / 12;
  const localTax = incomeTax * LOCAL_INCOME_TAX_RATE;

  const totalDeduction =
    pension + health + longTermCare + employment + incomeTax + localTax;
  const finalMonthlyNet = monthlySalary - totalDeduction;

  return {
    monthlyNet: Math.round(finalMonthlyNet),
    totalDeduction: Math.round(totalDeduction),
    pension: Math.round(pension),
    health: Math.round(health),
    longTermCare: Math.round(longTermCare),
    employment: Math.round(employment),
    incomeTax: Math.round(incomeTax),
    localTax: Math.round(localTax),
  };
}
// ===================================================================
// generateData.ts의 내용을 이곳으로 전부 이동
// ===================================================================
function generateAnnualSalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let salary = 100000; salary <= 100000000; salary += 100000) {
    const results = calculateNetSalary(salary);
    data.push({ preTax: salary, ...results });
  }
  for (let salary = 101000000; salary <= 500000000; salary += 1000000) {
    const results = calculateNetSalary(salary);
    data.push({ preTax: salary, ...results });
  }
  return data;
}

function generateMonthlySalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let monthly = 100000; monthly <= 10000000; monthly += 100000) {
    const results = calculateNetSalary(monthly * 12);
    data.push({ preTax: monthly, ...results });
  }
  for (let monthly = 11000000; monthly <= 300000000; monthly += 1000000) {
    const results = calculateNetSalary(monthly * 12);
    data.push({ preTax: monthly, ...results });
  }
  return data;
}

function generateWeeklyPayTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let weekly = 50000; weekly <= 2500000; weekly += 50000) {
    const results = calculateNetSalary(weekly * 52);
    data.push({ preTax: weekly, ...results });
  }
  for (let weekly = 3000000; weekly <= 20000000; weekly += 500000) {
    const results = calculateNetSalary(weekly * 52);
    data.push({ preTax: weekly, ...results });
  }
  return data;
}

function generateHourlyWageTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let hourly = 9860; hourly <= 100000; hourly += 1000) {
    const results = calculateNetSalary(hourly * 40 * 52);
    data.push({ preTax: hourly, ...results });
  }
  for (let hourly = 200000; hourly <= 20000000; hourly += 100000) {
    const results = calculateNetSalary(hourly * 40 * 52);
    data.push({ preTax: hourly, ...results });
  }
  return data;
}

// --- API 라우트 핸들러 ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  let data;

  switch (type) {
    case "annual":
      data = generateAnnualSalaryTableData();
      break;
    case "monthly":
      data = generateMonthlySalaryTableData();
      break;
    case "weekly":
      data = generateWeeklyPayTableData();
      break;
    case "hourly":
      data = generateHourlyWageTableData();
      break;
    default:
      return NextResponse.json(
        { error: "Invalid table type" },
        { status: 400 }
      );
  }
  return NextResponse.json(data);
}
