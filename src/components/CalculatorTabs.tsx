"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SalaryCalculator from "@/components/SalaryCalculator";
import SeveranceCalculator from "@/components/SeveranceCalculator";
import FutureSalaryCalculator from "@/components/FutureSalaryCalculator";

// [수정] 이 줄에 export default를 추가했습니다.
export default function CalculatorTabs() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"salary" | "severance" | "future">(
    "salary"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "severance") {
      setActiveTab("severance");
    } else if (tab === "future") {
      setActiveTab("future");
    } else {
      setActiveTab("salary");
    }
  }, [searchParams]);

  return (
    <div>
      <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("salary")}
          className={`px-4 sm:px-6 py-3 font-semibold text-base sm:text-lg transition-colors duration-200 ${
            activeTab === "salary"
              ? "border-b-2 border-signature-blue text-signature-blue"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          연봉 계산기
        </button>
        <button
          onClick={() => setActiveTab("severance")}
          className={`px-4 sm:px-6 py-3 font-semibold text-base sm:text-lg transition-colors duration-200 ${
            activeTab === "severance"
              ? "border-b-2 border-signature-blue text-signature-blue"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          퇴직금 계산기
        </button>
        <button
          onClick={() => setActiveTab("future")}
          className={`px-4 sm:px-6 py-3 font-semibold text-base sm:text-lg transition-colors duration-200 ${
            activeTab === "future"
              ? "border-b-2 border-signature-blue text-signature-blue"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          미래 연봉
        </button>
      </div>

      <div>
        {activeTab === "salary" && <SalaryCalculator />}
        {activeTab === "severance" && <SeveranceCalculator />}
        {activeTab === "future" && <FutureSalaryCalculator />}
      </div>
    </div>
  );
}
