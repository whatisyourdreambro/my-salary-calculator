// src/app/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import MyDashboard from "@/components/MyDashboard";
import type { StoredFinancialData } from "@/app/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-semibold">
            대시보드 데이터를 불러오는 중...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {dashboardData ? (
        <MyDashboard data={dashboardData} onReset={handleResetDashboard} />
      ) : (
        <div className="text-center bg-card p-12 rounded-2xl shadow-lg border border-border">
          <h1 className="text-3xl font-bold text-foreground">
            저장된 데이터가 없습니다.
          </h1>
          <p className="mt-4 text-muted-foreground">
            먼저 연봉, 퇴직금 등 금융 정보를 계산하고 저장하여
            <br />
            나만의 맞춤형 금융 대시보드를 만들어보세요.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 py-3 px-8 bg-primary text-primary-foreground rounded-lg font-bold hover:brightness-95 transition-all shadow-lg"
          >
            계산하러 가기
          </Link>
        </div>
      )}
    </main>
  );
}
