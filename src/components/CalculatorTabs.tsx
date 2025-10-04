// src/components/CalculatorTabs.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  TrendingUp,
  PiggyBank,
  FileText,
  GitCompare,
  BarChart3,
  Calculator,
  Briefcase, // [추가] 아이콘 추가
} from "lucide-react";

// Dynamic imports for performance
const SalaryCalculator = dynamic(() => import("@/components/SalaryCalculator"));
const SeveranceCalculator = dynamic(
  () => import("@/components/SeveranceCalculator")
);
const PayStubGenerator = dynamic(() => import("@/components/PayStubGenerator"));
const FutureSalaryCalculator = dynamic(
  () => import("@/components/FutureSalaryCalculator")
);
const SalaryComparator = dynamic(() => import("@/components/SalaryComparator"));
const SalaryRank = dynamic(() => import("@/components/SalaryRank"));
// [추가] 프리랜서 계산기 동적 임포트
const FreelancerCalculator = dynamic(
  () => import("@/components/FreelancerCalculator")
);

const TABS = {
  SALARY: "salary",
  SEVERANCE: "severance",
  FREELANCER: "freelancer", // [추가] 탭 상수 추가
  PAYSTUB: "paystub",
  FUTURE: "future",
  COMPARATOR: "comparator",
  RANK: "rank",
};

type TabValue = (typeof TABS)[keyof typeof TABS];

const TAB_CONFIG: Record<
  TabValue,
  { name: string; description: string; icon: React.ElementType }
> = {
  [TABS.SALARY]: {
    name: "정규직 계산기",
    description: "내 월급의 모든 것",
    icon: Calculator,
  },
  [TABS.SEVERANCE]: {
    name: "퇴직금 계산기",
    description: "미래를 위한 자금 계획",
    icon: PiggyBank,
  },
  [TABS.FREELANCER]: {
    // [추가] 탭 설정 추가
    name: "알바/프리랜서",
    description: "3.3% 및 4대보험 계산",
    icon: Briefcase,
  },
  [TABS.PAYSTUB]: {
    name: "급여명세서",
    description: "월급 내역 한눈에 보기",
    icon: FileText,
  },
  [TABS.FUTURE]: {
    name: "미래 연봉",
    description: "커리어 로드맵 예측",
    icon: TrendingUp,
  },
  [TABS.COMPARATOR]: {
    name: "연봉 비교",
    description: "최고의 오퍼 선택하기",
    icon: GitCompare,
  },
  [TABS.RANK]: {
    name: "연봉 순위",
    description: "내 소득 위치 확인",
    icon: BarChart3,
  },
};

function CalculatorTabsComponent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>(TABS.SALARY);

  useEffect(() => {
    const tab = searchParams.get("tab") as TabValue;
    if (tab && Object.values(TABS).includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab(TABS.SALARY);
    }
  }, [searchParams]);

  const renderActiveCalculator = () => {
    switch (activeTab) {
      case TABS.SEVERANCE:
        return <SeveranceCalculator />;
      case TABS.FREELANCER: // [추가]
        return <FreelancerCalculator />;
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
      <div className="flex justify-center mb-10 border-b border-gray-200 dark:border-gray-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {(Object.values(TABS) as TabValue[]).map((tab) => {
          const { name, icon: Icon } = TAB_CONFIG[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-4 font-semibold text-sm sm:text-base transition-colors duration-200 shrink-0 flex items-center gap-2 ${
                activeTab === tab
                  ? "border-b-2 border-signature-blue text-signature-blue"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent"
              }`}
            >
              <Icon className="w-5 h-5" />
              {name}
            </button>
          );
        })}
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

// Suspense for client-side components
export default function CalculatorTabs() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalculatorTabsComponent />
    </Suspense>
  );
}
