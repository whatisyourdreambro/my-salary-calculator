// src/components/IncomeTypeSelector.tsx
"use client";

import { motion } from "framer-motion";
import type { IncomeType } from "./SalaryCalculator";

interface Props {
  incomeType: IncomeType;
  onIncomeTypeChange: (type: IncomeType) => void;
}

const options: { label: string; value: IncomeType }[] = [
  { label: "정규직", value: "regular" },
  { label: "프리랜서(3.3%)", value: "freelancer" },
  { label: "아르바이트", value: "part_time" },
];

export default function IncomeTypeSelector({ incomeType, onIncomeTypeChange }: Props) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 my-4 relative">
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onIncomeTypeChange(option.value)}
          className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors relative z-10 ${
            incomeType === option.value
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {incomeType === option.value && (
            <motion.div
              className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-md z-[-1]"
              layoutId="activeIndicator"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          {option.label}
        </motion.button>
      ))}
    </div>
  );
}