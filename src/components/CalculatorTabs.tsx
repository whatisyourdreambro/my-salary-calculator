"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// 각 계산기를 Dynamic Import로 불러오고, ssr: false 옵션으로 서버 렌더링을 비활성화합니다.
// 로딩 UI를 추가하여 사용자 경험을 개선합니다.
const SalaryCalculator = dynamic(
  () => import("@/components/SalaryCalculator"),
  { ssr: false, loading: () => <p>연봉 계산기 로딩 중...</p> }
);
const SeveranceCalculator = dynamic(
  () => import("@/components/SeveranceCalculator"),
  { ssr: false, loading: () => <p>퇴직금 계산기 로딩 중...</p> }
);
const FutureSalaryCalculator = dynamic(
  () => import("@/components/FutureSalaryCalculator"),
  { ssr: false, loading: () => <p>미래 연봉 계산기 로딩 중...</p> }
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
