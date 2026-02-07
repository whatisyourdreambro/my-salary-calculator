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
      pageConfig={pageConfig}
    />
  );
}
