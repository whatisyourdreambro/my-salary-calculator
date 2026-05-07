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
 <main className="flex items-center justify-center min-h-[60vh] bg-canvas">
 <div className="text-center">
 <div className="w-10 h-10 border-4 border-electric-15 border-t-electric rounded-full animate-spin mx-auto mb-4" />
 <p className="text-sm font-semibold text-faint-blue">
 대시보드 불러오는 중 (로컬에서 로드, 약 1초)...
 </p>
 </div>
 </main>
 );
 }

 return (
 <main className="w-full min-h-screen bg-canvas pt-28 pb-20">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {dashboardData ? (
 <div className="space-y-12">
 <MyDashboard data={dashboardData} onReset={handleResetDashboard} />
 <DashboardFavoritesSection />
 </div>
 ) : (
 <div className="space-y-12">
 {/* Empty State Hero */}
 <div className="text-center bg-white rounded-3xl p-12 sm:p-16 border border-canvas-200">
 <div className="w-20 h-20 bg-electric-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
 <span className="text-4xl">📊</span>
 </div>
 <h1 className="text-2xl sm:text-3xl font-black text-navy mb-3 tracking-tight">
 내 연봉 대시보드
 </h1>
 <p className="text-base text-muted-blue max-w-md mx-auto mb-8 leading-relaxed">
 연봉을 계산하고 저장하면 시간에 따른 변화를 추적하고,<br className="hidden sm:block" />
 동급 회사와 비교할 수 있는 나만의 대시보드가 만들어집니다.
 </p>
 <Link
 href="/"
 className="inline-flex items-center gap-2 px-8 py-4 bg-electric text-white rounded-xl font-bold text-base hover:bg-blue-600 transition-colors"
 >
 <Calculator className="w-4 h-4" />
 첫 계산 시작하기
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>

 {/* 즐겨찾기 + 이메일 구독 (있으면 표시) */}
 <DashboardFavoritesSection />

 {/* Preview Features */}
 <section>
 <h2 className="text-lg font-black text-navy mb-4 px-2">
 대시보드에서 할 수 있는 것
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {PREVIEW_FEATURES.map((feature) => {
 const Icon = feature.icon;
 return (
 <div
 key={feature.title}
 className="p-6 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="w-10 h-10 rounded-xl bg-electric-10 flex items-center justify-center mb-4">
 <Icon className="w-5 h-5 text-electric" />
 </div>
 <p className="font-bold text-navy text-sm mb-1">
 {feature.title}
 </p>
 <p className="text-xs text-muted-blue leading-relaxed">
 {feature.description}
 </p>
 </div>
 );
 })}
 </div>
 </section>

 {/* Quick Start */}
 <section>
 <h2 className="text-lg font-black text-navy mb-4 px-2">
 먼저 시도해볼 계산기
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {QUICK_START.map((item) => {
 const Icon = item.icon;
 return (
 <Link
 key={item.href}
 href={item.href}
 className="group flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center mb-3 group-hover:bg-electric-10 transition-colors">
 <Icon className="w-5 h-5 text-electric" />
 </div>
 <p className="font-bold text-navy text-sm">{item.title}</p>
 </Link>
 );
 })}
 </div>
 </section>
 </div>
 )}
 </div>
 </main>
 );
}
