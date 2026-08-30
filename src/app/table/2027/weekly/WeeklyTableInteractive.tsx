"use client";

// 2027판 — calculationFn 만 2027 요율(연금 5.0%)로 교체 (2026 복제)

import InteractiveTable from "@/components/InteractiveTable";
import { calculateNetSalary2027 } from "@/lib/generateData2027";
import type { SalaryData } from "@/lib/generateData";

interface WeeklyTableInteractiveProps {
 allData: SalaryData[];
 tableHeaders: { key: string; label: string }[];
 highlightRows: number[];
}

export default function WeeklyTableInteractive({
 allData,
 tableHeaders,
 highlightRows,
}: WeeklyTableInteractiveProps) {
 const pageConfig = {
 title: "주급별 실수령액 시뮬레이터 (2027년 예상)",
 basePath: "/table/2027/weekly",
 searchPlaceholder: "주급으로 검색...",
 salaryLabel: "주급",
 salaryMin: 100000,
 salaryMax: 5000000,
 salaryStep: 50000,
 defaultSalary: 1000000,
 };

 return (
 <InteractiveTable
 allData={allData}
 tableHeaders={tableHeaders}
 highlightRows={highlightRows}
 calculationFn={(salary, nonTaxable, dependents, children, settings) =>
 // nonTaxable은 월 입력 → 연 단위 변환 (2026판과 동일 규약)
 calculateNetSalary2027(salary * 52, nonTaxable * 12, dependents, children, settings)
 }
 toMonthly={(salary) => (salary * 52) / 12}
 linkColumnBaseHref="/salary"
 linkValueMultiplier={52}
 pageConfig={pageConfig}
 />
 );
}
