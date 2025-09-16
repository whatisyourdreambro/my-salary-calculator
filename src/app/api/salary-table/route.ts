// src/app/api/salary-table/route.ts

import { NextResponse } from "next/server";
import {
  generateAnnualSalaryTableData,
  generateMonthlySalaryTableData,
  generateWeeklyPayTableData,
  generateHourlyWageTableData,
} from "@/lib/generateData";

// generateData 함수들을 API 라우트 내에서 호출하도록 수정합니다.
// (기존 generateData.ts의 내용은 그대로 두셔도 됩니다)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "annual";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const searchTerm = searchParams.get("searchTerm") || "";
  const itemsPerPage = 100;

  let allData;
  switch (type) {
    case "monthly":
      allData = generateMonthlySalaryTableData();
      break;
    case "weekly":
      allData = generateWeeklyPayTableData();
      break;
    case "hourly":
      allData = generateHourlyWageTableData();
      break;
    default:
      allData = generateAnnualSalaryTableData();
      break;
  }

  const filteredData = searchTerm
    ? allData.filter((row) =>
        row.preTax.toString().includes(searchTerm.replace(/,/g, ""))
      )
    : allData;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return NextResponse.json({
    data: paginatedData,
    totalPages,
  });
}
