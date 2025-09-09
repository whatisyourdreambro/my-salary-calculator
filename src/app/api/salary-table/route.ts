// src/app/api/salary-table/route.ts

import { NextResponse } from "next/server";
import {
  generateAnnualSalaryTableData,
  generateMonthlySalaryTableData,
  generateWeeklyPayTableData,
  generateHourlyWageTableData,
} from "@/lib/generateData";

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
