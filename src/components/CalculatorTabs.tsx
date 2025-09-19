"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import SalaryCalculator from "@/components/SalaryCalculator";
import SeveranceCalculator from "@/components/SeveranceCalculator";
// [추가] PayStubGenerator를 동적으로 임포트
const PayStubGenerator = dynamic(() => import("@/components/PayStubGenerator"));

// Dynamic imports for performance
const FutureSalaryCalculator = dynamic(
  () => import("@/components/FutureSalaryCalculator")
);
const SalaryComparator = dynamic(() => import("@/components/SalaryComparator"));
const SalaryRank = dynamic(() => import("@/components/SalaryRank"));

// [추가] PAYSTUB 탭 정의
const TABS = {
  SALARY: "salary",
  SEVERANCE: "severance",
  PAYSTUB: "paystub", // 신규 탭
  FUTURE: "future",
  COMPARATOR: "comparator",
  RANK: "rank",
};

type TabValue = (typeof TABS)[keyof typeof TABS];

// [추가] PAYSTUB 탭 이름 정의
const TAB_NAMES: Record<TabValue, string> = {
  [TABS.SALARY]: "연봉 계산기",
  [TABS.SEVERANCE]: "퇴직금 계산기",
  [TABS.PAYSTUB]: "급여명세서", // 신규 탭
  [TABS.FUTURE]: "미래 연봉",
  [TABS.COMPARATOR]: "연봉 비교기",
  [TABS.RANK]: "연봉 순위",
};

export default function CalculatorTabs() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>(TABS.SALARY);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && Object.values(TABS).includes(tab as TabValue)) {
      setActiveTab(tab as TabValue);
    } else {
      setActiveTab(TABS.SALARY);
    }
  }, [searchParams]);

  const renderActiveCalculator = () => {
    switch (activeTab) {
      case TABS.SEVERANCE:
        return <SeveranceCalculator />;
      // [추가] PAYSTUB 탭 렌더링 로직
      case TABS.PAYSTUB:
        return <PayStubGenerator />;
      case TABS.FUTURE:
        return <FutureSalaryCalculator />;
      case TABS.COMPARATOR:
        return <SalaryComparator />;
      case TABS.RANK:
        return <SalaryRank />;
      case TABS.SALARY:
      default:
        return <SalaryCalculator />;
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {(Object.values(TABS) as TabValue[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-6 py-3 font-semibold text-sm sm:text-lg transition-colors duration-200 shrink-0 ${
              activeTab === tab
                ? "border-b-2 border-signature-blue text-signature-blue"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            {TAB_NAMES[tab]}
          </button>
        ))}
      </div>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div>{renderActiveCalculator()}</div>
    </div>
  );
}
