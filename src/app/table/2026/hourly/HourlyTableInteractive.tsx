"use client";

import InteractiveTable from "@/components/InteractiveTable";
import { calculateNetSalary2026 } from "@/lib/calculator";
import type { SalaryData } from "@/lib/generateData";

interface HourlyTableInteractiveProps {
  allData: SalaryData[];
  tableHeaders: { key: string; label: string }[];
  highlightRows: number[];
  totalPages: number;
  paginatedData: SalaryData[];
}

export default function HourlyTableInteractive({
  allData,
  tableHeaders,
  highlightRows,
  totalPages,
  paginatedData,
}: HourlyTableInteractiveProps) {
  const pageConfig = {
    title: "시급별 실수령액 시뮬레이터 (2026년 예상)",
    basePath: "/table/2026/hourly",
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
      totalPages={totalPages}
      paginatedData={paginatedData}
      calculationFn={(salary, nonTaxable, dependents, children, settings) => 
        calculateNetSalary2026(salary * 8 * 209 / 12 * 12, nonTaxable, dependents, children, settings)
      }
      pageConfig={pageConfig}
    />
  );
}
