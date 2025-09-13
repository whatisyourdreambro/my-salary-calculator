"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SalaryCalculator from "@/components/SalaryCalculator";
import SeveranceCalculator from "@/components/SeveranceCalculator";
import FutureSalaryCalculator from "@/components/FutureSalaryCalculator";

// 탭 종류를 상수로 정의하여 코드의 가독성과 유지보수성을 높입니다.
const TABS = {
  SALARY: "salary",
  SEVERANCE: "severance",
  FUTURE: "future",
};

type TabValue = (typeof TABS)[keyof typeof TABS];

export default function CalculatorTabs() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>(TABS.SALARY);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === TABS.SEVERANCE || tab === TABS.FUTURE) {
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
          </button>
        ))}
      </div>

      <div>{renderActiveCalculator()}</div>
    </div>
  );
}
