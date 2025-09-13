"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic"; // next/dynamic을 import 합니다.

// 각 계산기 컴포넌트를 dynamic import로 불러옵니다.
const SalaryCalculator = dynamic(() => import("@/components/SalaryCalculator"));
const SeveranceCalculator = dynamic(
  () => import("@/components/SeveranceCalculator")
);
const FutureSalaryCalculator = dynamic(
  () => import("@/components/FutureSalaryCalculator")
);

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
        {/* 버튼 부분은 그대로 유지 */}
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
        {/* 탭에 따라 해당 컴포넌트를 렌더링하는 부분은 그대로 유지 */}
        {activeTab === "salary" && <SalaryCalculator />}
        {activeTab === "severance" && <SeveranceCalculator />}
        {activeTab === "future" && <FutureSalaryCalculator />}
      </div>
    </div>
  );
}
