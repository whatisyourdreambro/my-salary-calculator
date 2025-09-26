// src/app/api/salary-table/route.ts

import { NextResponse } from "next/server";
import {
  generateAnnualSalaryTableData,
  generateMonthlySalaryTableData,
  generateWeeklyPayTableData,
  generateHourlyWageTableData,
} from "@/lib/generateData";

// 이 코드를 추가하여 Cloudflare Pages 엣지 런타임에서 실행되도록 설정합니다.
export const runtime = "edge";

// [고도화] 모든 데이터를 한 번에 생성하는 로직으로 변경 (Next.js가 응답을 캐시함)
const allData = {
  annual: generateAnnualSalaryTableData(),
  monthly: generateMonthlySalaryTableData(),
  weekly: generateWeeklyPayTableData(),
  hourly: generateHourlyWageTableData(),
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "annual") as keyof typeof allData;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const searchTerm = searchParams.get("searchTerm") || "";
  const itemsPerPage = 100;

  const dataForType = allData[type] || allData.annual;

  const filteredData = searchTerm
    ? dataForType.filter((row) =>
        row.preTax.toString().includes(searchTerm.replace(/,/g, ""))
      )
    : dataForType;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return NextResponse.json({
    data: paginatedData,
    totalPages,
  });
}
