// src/lib/generateData.ts

import { calculateNetSalary } from "./calculator";
import type { SalaryData } from "./types"; // [수정] 타입을 새 파일에서 가져옵니다.

// 1. 연봉 표 데이터 생성기 (기존과 동일)
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

// 2. 월급 표 데이터 생성기 (범위 확장)
export function generateMonthlySalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 1천만원까지 10만원 단위
  for (let monthly = 100000; monthly <= 10000000; monthly += 100000) {
    const results = calculateNetSalary(monthly * 12);
    data.push({ preTax: monthly, ...results });
  }
  // 3억까지 100만원 단위
  for (let monthly = 11000000; monthly <= 300000000; monthly += 1000000) {
    const results = calculateNetSalary(monthly * 12);
    data.push({ preTax: monthly, ...results });
  }
  return data;
}

// 3. 주급 표 데이터 생성기 (범위 확장)
export function generateWeeklyPayTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 250만원까지 5만원 단위
  for (let weekly = 50000; weekly <= 2500000; weekly += 50000) {
    const results = calculateNetSalary(weekly * 52);
    data.push({ preTax: weekly, ...results });
  }
  // 2천만원까지 50만원 단위
  for (let weekly = 3000000; weekly <= 20000000; weekly += 500000) {
    const results = calculateNetSalary(weekly * 52);
    data.push({ preTax: weekly, ...results });
  }
  return data;
}

// 4. 시급 표 데이터 생성기 (범위 확장)
export function generateHourlyWageTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 10만원까지 1천원 단위
  for (let hourly = 9860; hourly <= 100000; hourly += 1000) {
    const results = calculateNetSalary(hourly * 40 * 52);
    data.push({ preTax: hourly, ...results });
  }
  // 2천만원까지 10만원 단위
  for (let hourly = 200000; hourly <= 20000000; hourly += 100000) {
    const results = calculateNetSalary(hourly * 40 * 52);
    data.push({ preTax: hourly, ...results });
  }
  return data;
}
