// src/app/api/salary-table/route.ts

import { NextResponse } from "next/server";
import { calculateNetSalary } from "@/lib/calculator";
import type { SalaryData } from "@/lib/types";

// --- generateData.ts 파일의 내용을 이곳으로 전부 이동 ---

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
// --- 여기까지 ---

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
