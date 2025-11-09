"use client";

import InteractiveTable from "@/components/InteractiveTable";
import { calculateNetSalary } from "@/lib/calculator";
import type { SalaryData } from "@/lib/generateData";

interface AnnualTableInteractiveProps {
  allData: SalaryData[];
  tableHeaders: { key: string; label: string }[];
  highlightRows: number[];
  totalPages: number;
  paginatedData: SalaryData[];
}

export default function AnnualTableInteractive({
  allData,
  tableHeaders,
  highlightRows,
  totalPages,
  paginatedData,
}: AnnualTableInteractiveProps) {
  const pageConfig = {
    title: "연봉별 실수령액 시뮬레이터 (2025년)",
    basePath: "/table/annual",
    searchPlaceholder: "연봉으로 검색...",
    salaryLabel: "연봉",
    salaryMin: 10000000,
    salaryMax: 200000000,
    salaryStep: 1000000,
    defaultSalary: 50000000,
  };

  return (
    <InteractiveTable
      allData={allData}
      tableHeaders={tableHeaders}
      highlightRows={highlightRows}
      totalPages={totalPages}
      paginatedData={paginatedData}
      calculationFn={calculateNetSalary}
      pageConfig={pageConfig}
    />
  );
}
