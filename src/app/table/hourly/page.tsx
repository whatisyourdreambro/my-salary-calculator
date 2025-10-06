"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import SalaryTable from "@/components/SalaryTable";
import type { SalaryData } from "@/lib/generateData";
import { Search, Shield } from "lucide-react";
import Link from "next/link";

const tableHeaders = [
  { key: "preTax", label: "시급" },
  { key: "monthlyNet", label: "월 환산 실수령액" },
  { key: "totalDeduction", label: "월 환산 공제액" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "DataSet",
  name: "2025년 시급 실수령액 표",
  description:
    "2025년 최신 세법 기준 시급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/hourly",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["시급", "실수령액", "세후 월급", "시급 테이블", "최저시급"],
};

export default function HourlyTablePage() {
  const [data, setData] = useState<SalaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // [추가된 부분] Google Ads 전환 추적 스크립트
  useEffect(() => {
    // 페이지가 처음 로드될 때 한 번만 전환 이벤트를 발생시킵니다.
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-17586554693/E3-oCJSY3p4bEMWO9sFB",
      });
      console.log("Google Ads Conversion (Hourly Table) Fired!"); // 정상 작동 확인용 로그
    }
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 1회만 실행되도록 합니다.

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/salary-table?type=hourly&page=${currentPage}&searchTerm=${searchTerm}`
      );
      const result = await response.json();
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch salary data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    setSearchTerm(
      numericValue ? parseInt(numericValue, 10).toLocaleString() : ""
    );
    setCurrentPage(1);
  };

  const highlightRows = useMemo(() => [10030, 15000, 20000], []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-purple-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            당신의 시간은 얼마인가요?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            나의 한 시간의 가치를 월급으로 환산하여 확인해보세요. 최저시급부터
            고액 시급까지, 당신의 노력을 숫자로 증명해 드립니다.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="mb-8">
              <label htmlFor="search" className="sr-only">
                시급 검색
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="찾고 싶은 시급을 입력하세요 (예: 15,000)"
                  className="w-full pl-11 pr-4 py-4 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-signature-blue bg-white dark:bg-gray-800 text-lg"
                />
              </div>
            </div>

            <div className="overflow-hidden">
              {isLoading ? (
                <div className="py-20 text-center text-gray-500">
                  데이터를 불러오는 중입니다...
                </div>
              ) : (
                <SalaryTable
                  headers={tableHeaders}
                  data={data}
                  highlightRows={highlightRows}
                  unit="원"
                />
              )}
            </div>

            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                이전
              </button>
              <span className="text-sm font-semibold">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                다음
              </button>
            </div>
          </div>

          <section className="mt-16 bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-xl border">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200 flex items-center justify-center gap-3">
              <Shield className="w-8 h-8 text-purple-500" />내 권리의 시작,
              최저임금
            </h2>
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
                최저임금은 국가가 법으로 정한 최소한의 임금 수준입니다. 2025년
                기준 최저시급은 <strong>10,030원(예상)</strong>으로, 모든
                사업주는 이 이상의 시급을 지급해야 할 의무가 있습니다.
              </p>
              <Link
                href="/guides/minimum-wage"
                className="inline-block mt-6 py-3 px-6 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-transform transform hover:scale-105"
              >
                2025년 최저임금 완벽 가이드
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
