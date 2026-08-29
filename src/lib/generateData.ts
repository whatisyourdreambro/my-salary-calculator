// src/lib/generateData.ts
//
// /table/2026/{weekly,hourly} 표 + /api/salary-table 의 행 데이터.
//
// 2026-08-30 기준 통일: 전 생성 함수가 TaxLogic.calculateSalary2026(비과세 식대
// 월 20만원·본인 1인)을 사용 — 상세 페이지(/salary/[amount])·/table/2026 표와
// 같은 함수·같은 기준이라 사이트 어디서든 같은 연봉이면 같은 값이 나온다.
// (종전 비과세 0원 기준은 상세 페이지와 전 구간 어긋났음.)
//
// ★ 동명 함수 주의: /table/2026/{annual,monthly} 표는 generateData2026.ts 의
//   generateAnnualSalaryTableData2026(2,400만~2억 100만 단위 177행 + changeValue)을,
//   이 파일의 함수들은 weekly·hourly 표와 /api/salary-table 이 사용한다.

import { calculateSalary2026 } from "./TaxLogic";

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

// 표 4종·상세 페이지 공통 기준 — 비과세 식대 월 20만원 (TaxLogic 기본값과 동일)
const NON_TAXABLE_MONTHLY = 200_000;

const ZERO_ROW = {
 monthlyNet: 0,
 health: 0,
 employment: 0,
 longTermCare: 0,
 pension: 0,
 incomeTax: 0,
 localTax: 0,
 totalDeduction: 0,
};

// 연봉 → 표 행 공통 변환 (preTax 는 표마다 주급·시급 등 다른 단위를 담는다)
function buildRow(annualSalary: number, preTax: number): SalaryData {
 if (annualSalary <= 0) return { preTax, ...ZERO_ROW };
 // 월급이 식대 20만원보다 작은 극저구간은 비과세를 월급까지로 클램프
 const nonTaxable = Math.min(NON_TAXABLE_MONTHLY, Math.floor(annualSalary / 12));
 const r = calculateSalary2026(annualSalary, nonTaxable, 1, 0);
 return {
 preTax,
 monthlyNet: r.netPay,
 health: r.healthInsurance,
 employment: r.employmentInsurance,
 longTermCare: r.longTermCare,
 pension: r.nationalPension,
 incomeTax: r.incomeTax,
 localTax: r.localIncomeTax,
 totalDeduction: r.totalDeductions,
 };
}

// 연봉 실수령액 데이터 생성 (/api/salary-table)
export function generateAnnualSalaryTableData(): SalaryData[] {
 const data: SalaryData[] = [];
 for (let salary = 0; salary <= 100000000; salary += 50000) {
 data.push(buildRow(salary, salary));
 }
 for (let salary = 101000000; salary <= 500000000; salary += 1000000) {
 data.push(buildRow(salary, salary));
 }
 return data;
}

// 2026년 연봉 실수령액 데이터 생성 (0~5억 고밀도 격자)
export function generateAnnualSalaryTableData2026(): SalaryData[] {
 return generateAnnualSalaryTableData();
}

// 월급 실수령액 데이터 생성
export function generateMonthlySalaryTableData(): SalaryData[] {
 const data: SalaryData[] = [];
 for (let monthly = 0; monthly <= 100000000; monthly += 50000) {
 data.push(buildRow(monthly * 12, monthly));
 }
 return data;
}

// 2026년 월급 실수령액 데이터 생성
export function generateMonthlySalaryTableData2026(): SalaryData[] {
 return generateMonthlySalaryTableData();
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
 return buildWeeklyPaySteps().map((weekly) => buildRow(weekly * 52, weekly));
}

// 2026년 주급 실수령액 데이터 생성
export function generateWeeklyPayTableData2026(): SalaryData[] {
 return generateWeeklyPayTableData();
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
 return buildHourlyWageSteps().map((hourly) => buildRow(hourly * 209 * 12, hourly));
}

// 2026년 시급 실수령액 데이터 생성 — 주휴수당 포함 월 209시간 기준
export function generateHourlyWageTableData2026(): SalaryData[] {
 return generateHourlyWageTableData();
}
