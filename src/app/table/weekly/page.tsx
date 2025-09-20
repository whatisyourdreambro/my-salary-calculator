"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import SalaryTable from "@/components/SalaryTable";
import type { SalaryData } from "@/lib/generateData";
import { CalendarCheck, Search } from "lucide-react"; // [수정] 사용하지 않는 아이콘 제거
import Link from "next/link";

const tableHeaders = [
  { key: "preTax", label: "주급" },
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
  name: "2025년 주급 실수령액 표",
  description:
    "2025년 최신 세법 기준 주급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/weekly",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["주급", "실수령액", "세후 월급", "주급 테이블", "아르바이트"],
};

export default function WeeklyTablePage() {
  const [data, setData] = useState<SalaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/salary-table?type=weekly&page=${currentPage}&searchTerm=${searchTerm}`
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

  const highlightRows = useMemo(() => [500000, 1000000, 1500000], []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-gray-900 dark:to-amber-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            주급으로 확인하는 내 소득 가치
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-orange-100 dark:text-gray-300">
            일주일의 땀과 노력이 얼마의 가치를 가지는지, 주급 기준 월 환산
            실수령액으로 정확하게 확인하고 계획을 세워보세요.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="mb-8">
              <label htmlFor="search" className="sr-only">
                주급 검색
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
                  placeholder="찾고 싶은 주급을 입력하세요 (예: 1,000,000)"
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
              <CalendarCheck className="w-8 h-8 text-amber-500" />
              주급러 필독! 주휴수당 챙기기
            </h2>
            <div className="text-center max-w-2xl mx-auto">
              {/* [수정] 작은따옴표를 &apos;으로 변경 */}
              <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
                1주일에 15시간 이상 일하고, 결근 없이 성실하게 근무했다면{" "}
                <strong>하루치 일급에 해당하는 &apos;주휴수당&apos;</strong>을
                더 받을 수 있습니다. 이는 근로기준법에 명시된 당신의 소중한
                권리입니다.
              </p>
              <Link
                href="/guides/holiday-allowance"
                className="inline-block mt-6 py-3 px-6 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-transform transform hover:scale-105"
              >
                주휴수당 완벽 가이드 보기
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
