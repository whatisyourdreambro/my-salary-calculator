// src/components/CalculatorTabs.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  TrendingUp,
  PiggyBank,
  FileText,
  GitCompare,
  BarChart3,
  Calculator,
  Briefcase,
  Globe,
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
const FreelancerCalculator = dynamic(
  () => import("@/components/FreelancerCalculator")
);
const ExchangeRateImpactCalculator = dynamic(
  () => import("@/components/ExchangeRateDisplay")
);
const YearEndTaxCalculator = dynamic(
  () => import("@/components/YearEndTaxCalculator")
);

const TABS = {
  SALARY: "salary",
  SEVERANCE: "severance",
  FREELANCER: "freelancer",
  EXCHANGE: "exchange",
  YEAR_END_TAX: "year-end-tax",
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
  [TABS.SALARY]: { name: "정규직 계산기", description: "내 월급의 모든 것", icon: Calculator },
  [TABS.SEVERANCE]: { name: "퇴직금 계산기", description: "미래를 위한 자금 계획", icon: PiggyBank },
  [TABS.FREELANCER]: { name: "알바/프리랜서", description: "3.3% 및 4대보험 계산", icon: Briefcase },
  [TABS.EXCHANGE]: { name: "환율 영향", description: "내 자산가치 변화 분석", icon: Globe },
  [TABS.YEAR_END_TAX]: { name: "연말정산 최적화", description: "최상의 환급 시나리오", icon: FileText },
  [TABS.PAYSTUB]: { name: "급여명세서", description: "월급 내역 한눈에 보기", icon: FileText },
  [TABS.FUTURE]: { name: "미래 연봉", description: "커리어 로드맵 예측", icon: TrendingUp },
  [TABS.COMPARATOR]: { name: "연봉 비교", description: "최고의 오퍼 선택하기", icon: GitCompare },
  [TABS.RANK]: { name: "연봉 순위", description: "내 소득 위치 확인", icon: BarChart3 },
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

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} defaultValue={TABS.SALARY} className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 md:flex md:flex-wrap md:justify-center h-auto">
        {(Object.values(TABS) as TabValue[]).map((tab) => {
          const { name, icon: Icon } = TAB_CONFIG[tab];
          return (
            <TabsTrigger key={tab} value={tab} className="flex flex-col md:flex-row gap-1 md:gap-2 h-auto md:h-10 px-2 py-3 text-xs sm:text-sm">
              <Icon className="w-5 h-5 mb-1 md:mb-0" />
              <span>{name}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <div className="mt-8">
        <TabsContent value={TABS.SALARY}><SalaryCalculator /></TabsContent>
        <TabsContent value={TABS.SEVERANCE}><SeveranceCalculator /></TabsContent>
        <TabsContent value={TABS.FREELANCER}><FreelancerCalculator /></TabsContent>
        <TabsContent value={TABS.EXCHANGE}><ExchangeRateImpactCalculator /></TabsContent>
        <TabsContent value={TABS.YEAR_END_TAX}><YearEndTaxCalculator /></TabsContent>
        <TabsContent value={TABS.PAYSTUB}><PayStubGenerator /></TabsContent>
        <TabsContent value={TABS.FUTURE}><FutureSalaryCalculator /></TabsContent>
        <TabsContent value={TABS.COMPARATOR}><SalaryComparator /></TabsContent>
        <TabsContent value={TABS.RANK}><SalaryRank /></TabsContent>
      </div>
    </Tabs>
  );
}

// Suspense for client-side components
export default function CalculatorTabs() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
      <CalculatorTabsComponent />
    </Suspense>
  );
}