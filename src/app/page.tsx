// src/app/page.tsx

"use client";

import { useState, useEffect } from "react";
import CalculatorTabs from "@/components/CalculatorTabs";
import MyDashboard from "@/components/MyDashboard";
// [수정] StoredFinancialData 타입을 import합니다.
import type { StoredFinancialData } from "@/app/types";

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Moneysalary",
  url: "https://www.moneysalary.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.moneysalary.com/salary/{search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  const [dashboardData, setDashboardData] =
    useState<StoredFinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 페이지가 로드될 때 localStorage에서 데이터를 가져옵니다.
    try {
      // [수정] 'moneysalary-financial-data' 키를 사용합니다.
      const savedData = localStorage.getItem("moneysalary-financial-data");
      if (savedData) {
        setDashboardData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to parse dashboard data from localStorage", error);
      // [수정] 'moneysalary-financial-data' 키를 삭제합니다.
      localStorage.removeItem("moneysalary-financial-data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetDashboard = () => {
    // 대시보드 데이터를 삭제하고 계산기 화면으로 전환합니다.
    // [수정] 'moneysalary-financial-data' 키를 삭제합니다.
    localStorage.removeItem("moneysalary-financial-data");
    setDashboardData(null);
    window.location.reload(); // 상태를 확실히 초기화하기 위해 페이지 새로고침
  };

  // 로딩 중에는 스켈레톤 UI나 로딩 스피너를 보여줄 수 있습니다.
  if (isLoading) {
    return (
      <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-20">Loading...</div>
      </main>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {dashboardData ? (
          <MyDashboard data={dashboardData} onReset={handleResetDashboard} />
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
                2025년 연봉 실수령액 계산기
              </h1>
              <p className="mt-4 text-base lg:text-lg text-gray-600 dark:text-gray-400">
                2025년 최신 4대보험 및 소득세 기준을 적용하여 가장 정확한 세후
                실수령액을 확인하세요.
              </p>
            </div>
            <section className="my-12 p-6 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-center mb-4">
                Moneysalary 계산기는 무엇이 다른가요?
              </h2>
              <p className="text-center text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Moneysalary는 단순한 계산을 넘어, 2025년 최신 고용보험,
                건강보험, 국민연금 요율과 소득세법상 근로소득 간이세액표를
                완벽하게 반영하여 가장 정확한 실수령액 정보를 제공합니다.
                비과세액, 부양가족 수 등 복잡한 공제 항목까지 상세히 설정하여
                내게 맞는 결과를 확인하고, 퇴직금과 미래 예상 연봉까지 한 곳에서
                관리하세요.
              </p>
            </section>
            <CalculatorTabs />
          </>
        )}
      </main>
    </>
  );
}
