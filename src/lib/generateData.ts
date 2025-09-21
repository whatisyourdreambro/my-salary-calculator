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

const tableDataCache = new Map<string, SalaryData[]>();

const defaultAdvancedSettings: AdvancedSettings = {
  isSmeYouth: false,
  disabledDependents: 0,
  seniorDependents: 0,
};

// 연봉 실수령액 데이터 생성 (캐싱 적용)
export function generateAnnualSalaryTableData(): SalaryData[] {
  if (tableDataCache.has("annual")) {
    return tableDataCache.get("annual")!;
  }

  const data: SalaryData[] = [];
  for (let salary = 0; salary <= 100000000; salary += 50000) {
    // [수정] 불필요한 인수(0)를 제거했습니다.
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
    // [수정] 불필요한 인수(0)를 제거했습니다.
    const results = calculateNetSalary(
      salary,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: salary, ...results });
  }

  tableDataCache.set("annual", data);
  return data;
}

// 월급 실수령액 데이터 생성 (캐싱 적용)
export function generateMonthlySalaryTableData(): SalaryData[] {
  if (tableDataCache.has("monthly")) {
    return tableDataCache.get("monthly")!;
  }

  const data: SalaryData[] = [];
  for (let monthly = 0; monthly <= 100000000; monthly += 50000) {
    // [수정] 불필요한 인수(0)를 제거했습니다.
    const results = calculateNetSalary(
      monthly * 12,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: monthly, ...results });
  }

  tableDataCache.set("monthly", data);
  return data;
}

// 주급 실수령액 데이터 생성 (캐싱 적용)
export function generateWeeklyPayTableData(): SalaryData[] {
  if (tableDataCache.has("weekly")) {
    return tableDataCache.get("weekly")!;
  }

  const data: SalaryData[] = [];
  for (let weekly = 0; weekly <= 10000000; weekly += 50000) {
    // [수정] 불필요한 인수(0)를 제거했습니다.
    const results = calculateNetSalary(
      weekly * 52,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: weekly, ...results });
  }

  tableDataCache.set("weekly", data);
  return data;
}

// 시급 실수령액 데이터 생성 (캐싱 적용)
export function generateHourlyWageTableData(): SalaryData[] {
  if (tableDataCache.has("hourly")) {
    return tableDataCache.get("hourly")!;
  }

  const data: SalaryData[] = [];
  for (let hourly = 0; hourly <= 10000000; hourly += 5000) {
    // [수정] 불필요한 인수(0)를 제거했습니다.
    const results = calculateNetSalary(
      hourly * 40 * 52,
      0,
      1,
      0,
      defaultAdvancedSettings
    );
    data.push({ preTax: hourly, ...results });
  }

  tableDataCache.set("hourly", data);
  return data;
}
