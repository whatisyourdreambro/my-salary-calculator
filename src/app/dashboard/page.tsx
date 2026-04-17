"use client";

import { useState, useEffect } from "react";
import MyDashboard from "@/components/MyDashboard";
import type { StoredFinancialData } from "@/app/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdUnit from "@/components/AdUnit";

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
    router.push("/"); // 데이터 초기화 후 홈으로 이동
  };

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-[#191F28]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-500">
            대시보드 데이터를 불러오는 중...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-[#191F28] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {dashboardData ? (
          <MyDashboard data={dashboardData} onReset={handleResetDashboard} />
        ) : (
          <div className="text-center toss-card p-16">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-5xl">📊</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-900 mb-4 tracking-tight">
              저장된 데이터가 없습니다.
            </h1>
            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-md mx-auto">
              먼저 연봉, 퇴직금 등 금융 정보를 계산하고 저장하여<br />
              나만의 맞춤형 금융 대시보드를 만들어보세요.
            </p>
            <Link
              href="/"
              className="toss-button-primary inline-flex w-auto px-10 py-4 text-lg"
            >
              계산하러 가기
            </Link>
          </div>
        )}

        
      </div>
    </main>
  );
}
