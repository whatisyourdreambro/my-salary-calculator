"use client";

import InteractiveTable from "@/components/InteractiveTable";
import { calculateNetSalary } from "@/lib/calculator";
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
    title: "시급별 실수령액 시뮬레이터 (2025년)",
    basePath: "/table/hourly",
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
        calculateNetSalary(salary * 8 * 209 / 12 * 12, nonTaxable, dependents, children, settings)
      }
      pageConfig={pageConfig}
    />
  );
}
