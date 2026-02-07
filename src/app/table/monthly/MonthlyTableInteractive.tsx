"use client";

import InteractiveTable from "@/components/InteractiveTable";
import { calculateNetSalary } from "@/lib/calculator";
import type { SalaryData } from "@/lib/generateData";

interface MonthlyTableInteractiveProps {
  allData: SalaryData[];
  tableHeaders: { key: string; label: string }[];
  highlightRows: number[];
}

export default function MonthlyTableInteractive({
  allData,
  tableHeaders,
  highlightRows,
}: MonthlyTableInteractiveProps) {
  const pageConfig = {
    title: "월급별 실수령액 시뮬레이터 (2025년)",
    basePath: "/table/monthly",
    searchPlaceholder: "월급으로 검색...",
    salaryLabel: "월급",
    salaryMin: 1000000,
    salaryMax: 20000000,
    salaryStep: 100000,
    defaultSalary: 4000000,
  };

  return (
    <InteractiveTable
      allData={allData}
      tableHeaders={tableHeaders}
      highlightRows={highlightRows}
      calculationFn={(salary, nonTaxable, dependents, children, settings) =>
        calculateNetSalary(salary * 12, nonTaxable, dependents, children, settings)
      }
      pageConfig={pageConfig}
    />
  );
}
