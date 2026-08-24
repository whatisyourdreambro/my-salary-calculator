"use client";

import InteractiveTable from "@/components/InteractiveTable";
import { calculateNetSalary2026 } from "@/lib/calculator";
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
 title: "주급별 실수령액 시뮬레이터 (2026년 예상)",
 basePath: "/table/2026/weekly",
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
 calculateNetSalary2026(salary * 52, nonTaxable, dependents, children, settings)
 }
 toMonthly={(salary) => (salary * 52) / 12}
 linkColumnBaseHref="/salary"
 linkValueMultiplier={52}
 // 표는 page.tsx 가 annual 과 동일하게 SSR 렌더 — 여기선 시뮬레이터만
 // (useSearchParams 프리렌더 폴백으로 /salary 행 링크가 서버 HTML에서
 //  사라지던 문제 해소, 2026-08-24)
 hideTable
 pageConfig={pageConfig}
 />
 );
}
