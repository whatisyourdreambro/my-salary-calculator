// src/components/IncomeTypeSelector.tsx
"use client";

import type { IncomeType } from "./SalaryCalculator"; // Assuming type is exported from parent

interface Props {
  incomeType: IncomeType;
  onIncomeTypeChange: (type: IncomeType) => void;
}

export default function IncomeTypeSelector({ incomeType, onIncomeTypeChange }: Props) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 my-4">
      <button
        onClick={() => onIncomeTypeChange("regular")}
        className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
          incomeType === "regular"
            ? "bg-white dark:bg-gray-700 shadow-sm"
            : "text-gray-500"
        }`}
      >
        정규직
      </button>
      <button
        onClick={() => onIncomeTypeChange("freelancer")}
        className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
          incomeType === "freelancer"
            ? "bg-white dark:bg-gray-700 shadow-sm"
            : "text-gray-500"
        }`}
      >
        프리랜서(3.3%)
      </button>
      <button
        onClick={() => onIncomeTypeChange("part_time")}
        className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
          incomeType === "part_time"
            ? "bg-white dark:bg-gray-700 shadow-sm"
            : "text-gray-500"
        }`}
      >
        아르바이트
      </button>
    </div>
  );
}
