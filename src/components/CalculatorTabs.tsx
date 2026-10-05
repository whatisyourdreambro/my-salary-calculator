// src/components/CalculatorTabs.tsx

"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { retryChunkImport } from "@/lib/chunkReload";
import {
 TrendingUp, PiggyBank, FileText, GitCompare,
 BarChart3, Calculator, Briefcase, Globe,
 ChevronLeft, ChevronRight,
} from "lucide-react";

// 탭 청크 로드 실패는 1초 뒤 1회 재시도(승인 #10 A14) — 그래도 실패하면 홈 HomeClient 의 섬 경계가 이 탭 묶음 자리만 대체.
const SalaryCalculator = dynamic(() => retryChunkImport(() => import("@/components/SalaryCalculator")));
const SeveranceCalculator = dynamic(() => retryChunkImport(() => import("@/components/SeveranceCalculator")));
const PayStubGenerator = dynamic(() => retryChunkImport(() => import("@/components/PayStubGenerator")));
const FutureSalaryCalculator = dynamic(() => retryChunkImport(() => import("@/components/FutureSalaryCalculator")));
const SalaryComparator = dynamic(() => retryChunkImport(() => import("@/components/SalaryComparator")));
const SalaryRank = dynamic(() => retryChunkImport(() => import("@/components/SalaryRank")));
const FreelancerCalculator = dynamic(() => retryChunkImport(() => import("@/components/FreelancerCalculator")));
const ExchangeRateImpactCalculator = dynamic(() => retryChunkImport(() => import("@/components/ExchangeRateDisplay")));
const YearEndTaxCalculator = dynamic(() => retryChunkImport(() => import("@/components/YearEndTaxCalculator")));

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
 [TABS.SALARY]: { name: "정규직 계산기", icon: Calculator },
 [TABS.SEVERANCE]: { name: "퇴직금 계산기", icon: PiggyBank },
 [TABS.FREELANCER]: { name: "알바/프리랜서", icon: Briefcase },
 [TABS.EXCHANGE]: { name: "환율 영향", icon: Globe },
 [TABS.YEAR_END_TAX]: { name: "연말정산", icon: FileText },
 [TABS.PAYSTUB]: { name: "급여명세서", icon: FileText },
 [TABS.FUTURE]: { name: "미래 연봉", icon: TrendingUp },
 [TABS.COMPARATOR]: { name: "연봉 비교", icon: GitCompare },
 [TABS.RANK]: { name: "연봉 순위", icon: BarChart3 },
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
 el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
 };

 const renderActiveCalculator = () => {
 switch (activeTab) {
 case TABS.SEVERANCE: return <SeveranceCalculator />;
 case TABS.FREELANCER: return <FreelancerCalculator />;
 case TABS.EXCHANGE: return <ExchangeRateImpactCalculator />;
 case TABS.YEAR_END_TAX: return <YearEndTaxCalculator />;
 case TABS.PAYSTUB: return <PayStubGenerator />;
 case TABS.FUTURE: return <FutureSalaryCalculator />;
 case TABS.COMPARATOR: return <SalaryComparator />;
 case TABS.RANK: return <SalaryRank />;
 case TABS.SALARY:
 default: return <SalaryCalculator />;
 }
 };

 const tabs = Object.values(TABS) as TabValue[];

 return (
 <div className="w-full">
 {/* ── 탭 네비게이션: 좌우 화살표 + 스크롤 ──────────────────── */}
 <div className="relative flex items-center gap-2 mb-4">
 {/* 왼쪽 버튼 */}
 <button
 type="button"
 onClick={() => scroll("left")}
 disabled={!canScrollLeft}
 className="ms-button ms-button-secondary h-11 w-11 shrink-0 p-0"
 aria-label="계산기 목록 왼쪽으로 이동"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>

 {/* 스크롤 컨테이너 */}
 <div
 ref={scrollRef}
 role="tablist"
 aria-label="계산기 종류"
 className="min-w-0 flex-1 flex overflow-x-auto gap-2 p-1"
 style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
 onScroll={checkScroll}
 >
 {tabs.map((tab) => {
 const { name, icon: Icon } = TAB_CONFIG[tab];
 const isActive = activeTab === tab;
 return (
 <button
 key={tab}
 type="button"
 role="tab"
 aria-selected={isActive}
 aria-controls={`calc-panel-${tab}`}
 id={`calc-tab-${tab}`}
 tabIndex={isActive ? 0 : -1}
 onClick={() => setActiveTab(tab)}
 // roving tabindex 만 있고 화살표 키 핸들러가 없어 9개 탭 중
 // 활성 1개 외에는 키보드로 도달할 수 없었다 (WAI-ARIA tabs 패턴 위반,
 // 2026-09-06 전수검사). ←/→/Home/End 로 이동 + 포커스 이동까지 처리한다.
 onKeyDown={(e) => {
 const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
 if (!keys.includes(e.key)) return;
 e.preventDefault();
 const i = tabs.indexOf(tab);
 const next =
 e.key === "Home"
 ? 0
 : e.key === "End"
 ? tabs.length - 1
 : e.key === "ArrowLeft"
 ? (i - 1 + tabs.length) % tabs.length
 : (i + 1) % tabs.length;
 const target = tabs[next];
 setActiveTab(target);
 requestAnimationFrame(() => {
 const button = document.getElementById(`calc-tab-${target}`);
 button?.focus({ preventScroll: true });
 button?.scrollIntoView({ block: "nearest", inline: "nearest" });
 });
 }}
 className="ms-tab flex-none flex min-h-11 items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap"
 >
 <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
 <span>{name}</span>
 </button>
 );
 })}
 </div>

 {/* 오른쪽 버튼 */}
 <button
 type="button"
 onClick={() => scroll("right")}
 disabled={!canScrollRight}
 className="ms-button ms-button-secondary h-11 w-11 shrink-0 p-0"
 aria-label="계산기 목록 오른쪽으로 이동"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>

 {/* 구분선 */}
 <div className="h-px bg-border mb-6" aria-hidden="true" />

 {/* ── 활성 계산기 ─────────────────────────────────────────── */}
 <div
 id={`calc-panel-${activeTab}`}
 role="tabpanel"
 tabIndex={0}
 aria-labelledby={`calc-tab-${activeTab}`}
 className="w-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
 >
 {renderActiveCalculator()}
 </div>
 </div>
 );
}

export default function CalculatorTabs() {
 return (
 <Suspense fallback={
 <div className="flex items-center gap-2 mb-6">
 <div className="w-11 h-11 rounded-xl bg-secondary motion-safe:animate-pulse" />
 <div className="flex-1 flex gap-2 overflow-hidden">
 {[...Array(7)].map((_, i) => (
 <div key={i} className="flex-none h-11 w-28 rounded-xl bg-secondary motion-safe:animate-pulse" />
 ))}
 </div>
 <div className="w-11 h-11 rounded-xl bg-secondary motion-safe:animate-pulse" />
 </div>
 }>
 <CalculatorTabsComponent />
 </Suspense>
 );
}
