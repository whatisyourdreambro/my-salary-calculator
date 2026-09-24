// src/app/api/salary-table/route.ts

import { NextResponse } from "next/server";
import {
 generateAnnualSalaryTableData,
 generateMonthlySalaryTableData,
 generateWeeklyPayTableData,
 generateHourlyWageTableData,
 type SalaryData,
} from "@/lib/generateData";

// 이 코드를 추가하여 Cloudflare Pages 엣지 런타임에서 실행되도록 설정합니다.
export const runtime = "edge";

// 표 4종 생성기 — 요청된 type 만 첫 요청 때 생성하고 isolate 수명 동안 메모한다.
// 종전에는 모듈 스코프에서 4종(연봉 2,401행·월급 2,001행·주급·시급)을 모두 세액 계산해
// 콜드 isolate 마다 CPU 10ms 한도(1102)에 근접했다(2026-09-25 B1). 응답 형태·검증·헤더는 동일.
// 이 라우트는 scripts/health-check.mjs 의 edge 워커 생존 프로브이기도 하다 — 삭제 금지.
const GENERATORS = {
 annual: generateAnnualSalaryTableData,
 monthly: generateMonthlySalaryTableData,
 weekly: generateWeeklyPayTableData,
 hourly: generateHourlyWageTableData,
} as const;
type TableType = keyof typeof GENERATORS;

const rowsCache: Partial<Record<TableType, SalaryData[]>> = {};
function rowsFor(type: TableType): SalaryData[] {
 return (rowsCache[type] ??= GENERATORS[type]());
}

export async function GET(request: Request) {
 const { searchParams } = new URL(request.url);
 const typeParam = searchParams.get("type") || "annual";
 // page 는 1 이상의 정수만 허용한다. 종전에는 무검증이라
 // ?page=-1 이 slice(-200,-100) 으로 강등돼 "마지막 부근 실데이터"를 200 으로
 // 돌려줬고, ?page=abc 는 NaN → 빈 배열을 오류 없이 돌려줬다 (2026-09-06 전수검사).
 const pageRaw = Number(searchParams.get("page") ?? "1");
 const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
 const searchTerm = searchParams.get("searchTerm") || "";
 const itemsPerPage = 100;

 // __proto__/constructor 등 프로토타입 키로 500 나지 않도록 자기 소유 키만 허용 (그 외는 연봉표)
 const type: TableType = Object.hasOwn(GENERATORS, typeParam) ? (typeParam as TableType) : "annual";
 const dataForType = rowsFor(type);

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
