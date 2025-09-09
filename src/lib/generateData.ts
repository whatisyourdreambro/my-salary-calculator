// src/lib/generateData.ts

import { calculateNetSalary } from "./calculator";

export type SalaryData = {
  preTax: number;
  monthlyNet: number;
  health: number;
  employment: number;
  longTermCare: number;
  pension: number;
  incomeTax: number;
  localTax: number;
  totalDeduction: number;
};

// 1. 연봉 표 데이터 생성기
export function generateAnnualSalaryTableData(): SalaryData[] {
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

// 2. 월급 표 데이터 생성기
export function generateMonthlySalaryTableData(): SalaryData[] {
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

// 3. 주급 표 데이터 생성기
export function generateWeeklyPayTableData(): SalaryData[] {
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

// 4. 시급 표 데이터 생성기
export function generateHourlyWageTableData(): SalaryData[] {
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
