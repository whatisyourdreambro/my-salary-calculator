"use client";

// 2027판 — calculationFn 만 2027 요율(연금 5.0%)로 교체 (2026 복제)

import InteractiveTable from "@/components/InteractiveTable";
import { calculateNetSalary2027 } from "@/lib/generateData2027";
import type { SalaryData } from "@/lib/generateData";

interface HourlyTableInteractiveProps {
 allData: SalaryData[];
 tableHeaders: { key: string; label: string }[];
 highlightRows: number[];
}

export default function HourlyTableInteractive({
 allData,
 tableHeaders,
 highlightRows,
}: HourlyTableInteractiveProps) {
 const pageConfig = {
 title: "시급별 실수령액 시뮬레이터 (2027년 예상)",
 basePath: "/table/2027/hourly",
 searchPlaceholder: "시급으로 검색...",
 salaryLabel: "시급",
 salaryMin: 10000,
 salaryMax: 50000,
 salaryStep: 1000,
 defaultSalary: 15000,
 };

 return (
 <InteractiveTable
 allData={allData}
 tableHeaders={tableHeaders}
 highlightRows={highlightRows}
 calculationFn={(salary, nonTaxable, dependents, children, settings) =>
 // 주휴수당 포함 월 209시간 기준: 시급 × 209 = 월급, × 12 = 연봉
 calculateNetSalary2027(salary * 209 * 12, nonTaxable * 12, dependents, children, settings)
 }
 toMonthly={(salary) => salary * 209}
 linkColumnBaseHref="/salary"
 linkValueMultiplier={209 * 12}
 pageConfig={pageConfig}
 />
 );
}
