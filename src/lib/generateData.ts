// src/lib/generateData.ts

import { calculateNetSalary } from "./calculator";
import type { AdvancedSettings } from "@/app/types";

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

// [고도화] 서버리스 환경에 적합하지 않은 인메모리 캐시(tableDataCache) 제거

const defaultAdvancedSettings: AdvancedSettings = {
  isSmeYouth: false,
  disabledDependents: 0,
  seniorDependents: 0,
};

// 연봉 실수령액 데이터 생성
export function generateAnnualSalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let salary = 0; salary <= 100000000; salary += 50000) {
    const results = calculateNetSalary(
      salary,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: salary, ...results });
  }
  for (let salary = 101000000; salary <= 500000000; salary += 1000000) {
    const results = calculateNetSalary(
      salary,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: salary, ...results });
  }
  return data;
}

// 월급 실수령액 데이터 생성
export function generateMonthlySalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let monthly = 0; monthly <= 100000000; monthly += 50000) {
    const results = calculateNetSalary(
      monthly * 12,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: monthly, ...results });
  }
  return data;
}

// 주급 실수령액 데이터 생성
export function generateWeeklyPayTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let weekly = 0; weekly <= 10000000; weekly += 50000) {
    const results = calculateNetSalary(
      weekly * 52,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: weekly, ...results });
  }
  return data;
}

// 시급 실수령액 데이터 생성
export function generateHourlyWageTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  for (let hourly = 0; hourly <= 10000000; hourly += 5000) {
    const results = calculateNetSalary(
      hourly * 40 * 52,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: hourly, ...results });
  }
  return data;
}
