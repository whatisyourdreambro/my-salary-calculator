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

// [확인] 데이터 생성 범위가 아래와 같이 줄어있는지 확인합니다.
export function generateAnnualSalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let salary = 24000000; salary <= 150000000; salary += 1000000) {
    const results = calculateNetSalary(salary);
    data.push({ preTax: salary, ...results });
  }
  return data;
}

export function generateMonthlySalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let monthly = 2000000; monthly <= 10000000; monthly += 100000) {
    const results = calculateNetSalary(monthly * 12);
    data.push({ preTax: monthly, ...results });
  }
  return data;
}

export function generateWeeklyPayTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let weekly = 500000; weekly <= 2500000; weekly += 50000) {
    const results = calculateNetSalary(weekly * 52);
    data.push({ preTax: weekly, ...results });
  }
  return data;
}

export function generateHourlyWageTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let hourly = 10000; hourly <= 50000; hourly += 1000) {
    const results = calculateNetSalary(hourly * 40 * 52);
    data.push({ preTax: hourly, ...results });
  }
  return data;
}
