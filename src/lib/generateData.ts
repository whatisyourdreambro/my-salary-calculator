// src/lib/generateData.ts

import { calculateNetSalary, calculateNetSalary2026 } from "./calculator";
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

// 2026년 연봉 실수령액 데이터 생성
export function generateAnnualSalaryTableData2026(): SalaryData[] {
 const data: SalaryData[] = [];
 for (let salary = 0; salary <= 100000000; salary += 50000) {
 const results = calculateNetSalary2026(
 salary,
 0,
 1,
 0,
 defaultAdvancedSettings
 );
 data.push({ preTax: salary, ...results });
 }
 for (let salary = 101000000; salary <= 500000000; salary += 1000000) {
 const results = calculateNetSalary2026(
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

// 2026년 월급 실수령액 데이터 생성
export function generateMonthlySalaryTableData2026(): SalaryData[] {
 const data: SalaryData[] = [];
 for (let monthly = 0; monthly <= 100000000; monthly += 50000) {
 const results = calculateNetSalary2026(
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

// 주급 표 구간 — 현실적인 주급 범위(20만~300만원, 5만원 단위)만 생성
function buildWeeklyPaySteps(): number[] {
 const steps: number[] = [];
 for (let weekly = 200000; weekly <= 3000000; weekly += 50000) {
 steps.push(weekly);
 }
 return steps;
}

// 주급 실수령액 데이터 생성
export function generateWeeklyPayTableData(): SalaryData[] {
 const data: SalaryData[] = [];
 for (const weekly of buildWeeklyPaySteps()) {
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

// 2026년 주급 실수령액 데이터 생성
export function generateWeeklyPayTableData2026(): SalaryData[] {
 const data: SalaryData[] = [];
 for (const weekly of buildWeeklyPaySteps()) {
 const results = calculateNetSalary2026(
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

// 시급 표 구간 — 9,500~30,000원은 500원 단위(+최저시급 10,320원 행 명시), 30,000~50,000원은 1,000원 단위
function buildHourlyWageSteps(): number[] {
 const steps: number[] = [];
 for (let hourly = 9500; hourly <= 30000; hourly += 500) {
 steps.push(hourly);
 }
 steps.push(10320); // 2026 최저시급 행
 for (let hourly = 31000; hourly <= 50000; hourly += 1000) {
 steps.push(hourly);
 }
 return steps.sort((a, b) => a - b);
}

// 시급 실수령액 데이터 생성 — 주휴수당 포함 월 209시간 기준 (시급 × 209 = 월급, × 12 = 연봉)
export function generateHourlyWageTableData(): SalaryData[] {
 const data: SalaryData[] = [];
 for (const hourly of buildHourlyWageSteps()) {
 const results = calculateNetSalary(
 hourly * 209 * 12,
 0,
 1,
 0,
 defaultAdvancedSettings
 );
 data.push({ preTax: hourly, ...results });
 }
 return data;
}

// 2026년 시급 실수령액 데이터 생성 — 주휴수당 포함 월 209시간 기준
export function generateHourlyWageTableData2026(): SalaryData[] {
 const data: SalaryData[] = [];
 for (const hourly of buildHourlyWageSteps()) {
 const results = calculateNetSalary2026(
 hourly * 209 * 12,
 0,
 1,
 0,
 defaultAdvancedSettings
 );
 data.push({ preTax: hourly, ...results });
 }
 return data;
}
