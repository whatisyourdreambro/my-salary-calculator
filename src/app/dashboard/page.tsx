"use client";

import { useState, useEffect } from "react";
import MyDashboard from "@/components/MyDashboard";
import DashboardFavoritesSection from "@/components/DashboardFavoritesSection";
import type { StoredFinancialData } from "@/app/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
 Calculator,
 PiggyBank,
 TrendingUp,
 Building2,
 ArrowRight,
 Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { buttonVariants } from "@/components/ui/Button";

const PREVIEW_FEATURES = [
 {
 icon: TrendingUp,
 title: "연봉 변화 타임라인",
 description: "저장된 계산 결과를 시간순으로 비교",
 },
 {
 icon: PiggyBank,
 title: "자산 성장 시뮬",
 description: "현재 연봉 → 5/10년 후 자산 예측",
 },
 {
 icon: Building2,
 title: "동급 회사 비교",
 description: "비슷한 연봉대 기업 평균과 차이",
 },
];

const QUICK_START = [
 { href: "/", title: "연봉 실수령액", icon: Calculator },
 { href: "/year-end-tax", title: "연말정산", icon: Sparkles },
 { href: "/fire-calculator", title: "FIRE 계산기", icon: TrendingUp },
 { href: "/salary-db", title: "회사별 연봉", icon: Building2 },
];

export default function DashboardPage() {
 const [dashboardData, setDashboardData] =
 useState<StoredFinancialData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const router = useRouter();

 useEffect(() => {
 try {
 const savedData = localStorage.getItem("moneysalary-financial-data");
 if (savedData) {
 setDashboardData(JSON.parse(savedData));
 }
 } catch (error) {
 console.error("Failed to parse dashboard data from localStorage", error);
 localStorage.removeItem("moneysalary-financial-data");
 } finally {
 setIsLoading(false);
 }
 }, []);

 const handleResetDashboard = () => {
 localStorage.removeItem("moneysalary-financial-data");
 setDashboardData(null);
 router.push("/");
 };

 if (isLoading) {
 return (
 <PageShell background="canvas" container="wide" spacing="normal">
 <div className="flex items-center justify-center min-h-[40vh]">
 <div className="text-center" role="status" aria-live="polite">
 <div className="w-10 h-10 border-4 border-electric-15 border-t-electric rounded-full animate-spin mx-auto mb-4" />
 <p className="text-sm font-semibold text-faint-blue">
 대시보드 불러오는 중 (로컬에서 로드, 약 1초)...
 </p>
 </div>
 </div>
 </PageShell>
 );
 }

 return (
 <PageShell background="canvas" container="wide" spacing="normal">
 {dashboardData ? (
 <div className="space-y-12">
 <MyDashboard data={dashboardData} onReset={handleResetDashboard} />
 <DashboardFavoritesSection />
 </div>
 ) : (
 <div className="space-y-12">
 {/* Empty State Hero */}
 <section className="text-center bg-white dark:bg-canvas-900 rounded-3xl p-8 sm:p-12 lg:p-16 border border-canvas-200 dark:border-canvas-800 shadow-card">
 <div className="w-20 h-20 bg-electric-10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-primary-sm">
 <span className="text-4xl" aria-hidden="true">📊</span>
 </div>
 <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy dark:text-canvas-50 mb-4 tracking-tight">
 내 연봉 대시보드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 max-w-lg mx-auto mb-10 leading-relaxed">
 연봉을 계산하고 저장하면 시간에 따른 변화를 추적하고,
 <br className="hidden sm:block" />
 동급 회사와 비교할 수 있는 나만의 대시보드가 만들어집니다.
 </p>
 <Link
 href="/"
 className={buttonVariants({ intent: "primary", size: "lg" })}
 >
 <Calculator className="w-4 h-4" aria-hidden="true" />
 첫 계산 시작하기
 <ArrowRight className="w-4 h-4" aria-hidden="true" />
 </Link>
 </section>

 {/* 즐겨찾기 + 이메일 구독 (있으면 표시) */}
 <DashboardFavoritesSection />

 {/* Preview Features */}
 <section aria-labelledby="preview-heading">
 <h2 id="preview-heading" className="text-lg sm:text-xl font-black text-navy dark:text-canvas-50 mb-5 px-2">
 대시보드에서 할 수 있는 것
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
 {PREVIEW_FEATURES.map((feature) => {
 const Icon = feature.icon;
 return (
 <div
 key={feature.title}
 className="p-6 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 transition-all duration-200 hover:border-electric hover:-translate-y-0.5 hover:shadow-card-hover"
 >
 <div className="w-11 h-11 rounded-xl bg-electric-10 flex items-center justify-center mb-4">
 <Icon className="w-5 h-5 text-electric" aria-hidden="true" />
 </div>
 <p className="font-extrabold text-navy dark:text-canvas-50 text-[15px] mb-1.5 tracking-tight">
 {feature.title}
 </p>
 <p className="text-[13px] text-muted-blue dark:text-canvas-300 leading-relaxed">
 {feature.description}
 </p>
 </div>
 );
 })}
 </div>
 </section>

 {/* Quick Start */}
 <section aria-labelledby="quickstart-heading">
 <h2 id="quickstart-heading" className="text-lg sm:text-xl font-black text-navy dark:text-canvas-50 mb-5 px-2">
 먼저 시도해볼 계산기
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
 {QUICK_START.map((item) => {
 const Icon = item.icon;
 return (
 <Link
 key={item.href}
 href={item.href}
 className="group flex flex-col items-center text-center p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 transition-all duration-200 hover:border-electric hover:-translate-y-0.5 hover:shadow-card-hover no-tap-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
 >
 <div className="w-11 h-11 rounded-xl bg-electric-5 flex items-center justify-center mb-3 group-hover:bg-electric group-hover:text-white transition-colors">
 <Icon className="w-5 h-5 text-electric group-hover:text-white transition-colors" aria-hidden="true" />
 </div>
 <p className="font-extrabold text-navy dark:text-canvas-50 text-sm group-hover:text-electric transition-colors">{item.title}</p>
 </Link>
 );
 })}
 </div>
 </section>
 </div>
 )}
 </PageShell>
 );
}
