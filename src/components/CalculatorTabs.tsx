// src/components/CalculatorTabs.tsx

"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  TrendingUp, PiggyBank, FileText, GitCompare,
  BarChart3, Calculator, Briefcase, Globe,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const SalaryCalculator      = dynamic(() => import("@/components/SalaryCalculator"));
const SeveranceCalculator   = dynamic(() => import("@/components/SeveranceCalculator"));
const PayStubGenerator      = dynamic(() => import("@/components/PayStubGenerator"));
const FutureSalaryCalculator = dynamic(() => import("@/components/FutureSalaryCalculator"));
const SalaryComparator      = dynamic(() => import("@/components/SalaryComparator"));
const SalaryRank            = dynamic(() => import("@/components/SalaryRank"));
const FreelancerCalculator  = dynamic(() => import("@/components/FreelancerCalculator"));
const ExchangeRateImpactCalculator = dynamic(() => import("@/components/ExchangeRateDisplay"));
const YearEndTaxCalculator  = dynamic(() => import("@/components/YearEndTaxCalculator"));

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

const TAB_CONFIG: Record<TabValue, { name: string; icon: React.ElementType }> = {
  [TABS.SALARY]:       { name: "정규직 계산기",  icon: Calculator },
  [TABS.SEVERANCE]:    { name: "퇴직금 계산기",  icon: PiggyBank },
  [TABS.FREELANCER]:   { name: "알바/프리랜서",  icon: Briefcase },
  [TABS.EXCHANGE]:     { name: "환율 영향",      icon: Globe },
  [TABS.YEAR_END_TAX]: { name: "연말정산",        icon: FileText },
  [TABS.PAYSTUB]:      { name: "급여명세서",      icon: FileText },
  [TABS.FUTURE]:       { name: "미래 연봉",       icon: TrendingUp },
  [TABS.COMPARATOR]:   { name: "연봉 비교",       icon: GitCompare },
  [TABS.RANK]:         { name: "연봉 순위",       icon: BarChart3 },
};

function CalculatorTabsComponent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>(TABS.SALARY);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tab = searchParams.get("tab") as TabValue;
    setActiveTab(tab && Object.values(TABS).includes(tab) ? tab : TABS.SALARY);
  }, [searchParams]);

  // 스크롤 가능 여부 감지
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const renderActiveCalculator = () => {
    switch (activeTab) {
      case TABS.SEVERANCE:    return <SeveranceCalculator />;
      case TABS.FREELANCER:   return <FreelancerCalculator />;
      case TABS.EXCHANGE:     return <ExchangeRateImpactCalculator />;
      case TABS.YEAR_END_TAX: return <YearEndTaxCalculator />;
      case TABS.PAYSTUB:      return <PayStubGenerator />;
      case TABS.FUTURE:       return <FutureSalaryCalculator />;
      case TABS.COMPARATOR:   return <SalaryComparator />;
      case TABS.RANK:         return <SalaryRank />;
      case TABS.SALARY:
      default:                return <SalaryCalculator />;
    }
  };

  const tabs = Object.values(TABS) as TabValue[];

  return (
    <div className="w-full">
      {/* ── 탭 네비게이션: 좌우 화살표 + 스크롤 ──────────────────── */}
      <div className="relative flex items-center gap-1 mb-6">
        {/* 왼쪽 버튼 */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`flex-none w-9 h-9 rounded-full border flex items-center justify-center transition-all
            ${canScrollLeft
              ? "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary shadow-sm"
              : "bg-slate-50 border-slate-100 text-slate-300 cursor-default"
            }`}
          aria-label="이전 탭"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 스크롤 컨테이너 */}
        <div
          ref={scrollRef}
          className="flex-1 flex overflow-x-auto gap-2 pb-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          onScroll={checkScroll}
        >
          {tabs.map((tab) => {
            const { name, icon: Icon } = TAB_CONFIG[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-none flex items-center gap-1.5 px-4 py-2.5
                  rounded-full border text-sm font-bold
                  whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? "bg-primary border-primary shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : ""}`} />
                <span className={isActive ? "text-white" : ""}>{name}</span>
              </button>
            );
          })}
        </div>

        {/* 오른쪽 버튼 */}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`flex-none w-9 h-9 rounded-full border flex items-center justify-center transition-all
            ${canScrollRight
              ? "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary shadow-sm"
              : "bg-slate-50 border-slate-100 text-slate-300 cursor-default"
            }`}
          aria-label="다음 탭"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 구분선 */}
      <div className="h-px bg-slate-100 mb-6" />

      {/* ── 활성 계산기 ─────────────────────────────────────────── */}
      <div className="w-full">{renderActiveCalculator()}</div>
    </div>
  );
}

export default function CalculatorTabs() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
        <div className="flex-1 flex gap-2 overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-none h-10 w-28 rounded-full bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
      </div>
    }>
      <CalculatorTabsComponent />
    </Suspense>
  );
}