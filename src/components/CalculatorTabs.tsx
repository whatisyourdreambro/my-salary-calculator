"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import SalaryCalculator from "@/components/SalaryCalculator";
import SeveranceCalculator from "@/components/SeveranceCalculator";

// 미래 연봉 계산기와 연봉 비교 계산기는 dynamic import로 로딩 속도 최적화
const FutureSalaryCalculator = dynamic(
  () => import("@/components/FutureSalaryCalculator"),
  {
    loading: () => (
      <div className="p-8 text-center">미래 연봉 계산기 로딩 중...</div>
    ),
    ssr: false,
  }
);

const SalaryComparator = dynamic(
  () => import("@/components/SalaryComparator"),
  {
    loading: () => (
      <div className="p-8 text-center">연봉 비교 계산기 로딩 중...</div>
    ),
    ssr: false,
  }
);

const TABS = {
  SALARY: "salary",
  SEVERANCE: "severance",
  FUTURE: "future",
  COMPARATOR: "comparator", // [추가] 비교기 탭
};

type TabValue = (typeof TABS)[keyof typeof TABS];

export default function CalculatorTabs() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>(TABS.SALARY);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === TABS.SEVERANCE ||
      tab === TABS.FUTURE ||
      tab === TABS.COMPARATOR
    ) {
      setActiveTab(tab);
    } else {
      setActiveTab(TABS.SALARY);
    }
  }, [searchParams]);

  const renderActiveCalculator = () => {
    switch (activeTab) {
      case TABS.SEVERANCE:
        return <SeveranceCalculator />;
      case TABS.FUTURE:
        return <FutureSalaryCalculator />;
      case TABS.COMPARATOR: // [추가]
        return <SalaryComparator />;
      case TABS.SALARY:
      default:
        return <SalaryCalculator />;
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-800">
        {(Object.values(TABS) as TabValue[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-6 py-3 font-semibold text-base sm:text-lg transition-colors duration-200 ${
              activeTab === tab
                ? "border-b-2 border-signature-blue text-signature-blue"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            {tab === TABS.SALARY && "연봉 계산기"}
            {tab === TABS.SEVERANCE && "퇴직금 계산기"}
            {tab === TABS.FUTURE && "미래 연봉"}
            {tab === TABS.COMPARATOR && "연봉 비교기"} {/* [추가] */}
          </button>
        ))}
      </div>

      <div>{renderActiveCalculator()}</div>
    </div>
  );
}
