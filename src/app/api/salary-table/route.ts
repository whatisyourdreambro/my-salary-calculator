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

 // __proto__/constructor 등 프로토타입 키로 500 나지 않도록 자기 소유 키만 허용
 const dataForType = Object.hasOwn(allData, type) ? allData[type] : allData.annual;

 const filteredData = searchTerm
 ? dataForType.filter((row) =>
 row.preTax.toString().includes(searchTerm.replace(/,/g, ""))
 )
 : dataForType;

 const totalPages = Math.ceil(filteredData.length / itemsPerPage);
 const startIndex = (page - 1) * itemsPerPage;
 const endIndex = startIndex + itemsPerPage;
 // 극저구간에서 공제 합계가 급여를 넘어 monthlyNet이 음수로 나오는 행 방지 (API 표면 클램프)
 const paginatedData = filteredData.slice(startIndex, endIndex).map((row) => ({
 ...row,
 monthlyNet: Math.max(0, row.monthlyNet),
 }));

 return NextResponse.json(
 {
 data: paginatedData,
 totalPages,
 },
 {
 // 데이터가 정적(세법 고정)이므로 엣지 1일 캐시 — Cloudflare Worker 반복 실행 방지
 headers: { "Cache-Control": "public, s-maxage=86400" },
 }
 );
}
