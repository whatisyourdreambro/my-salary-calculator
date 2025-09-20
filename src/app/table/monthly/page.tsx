"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import SalaryTable from "@/components/SalaryTable";
import type { SalaryData } from "@/lib/generateData";
import { PiggyBank, Search } from "lucide-react"; // [수정] 사용하지 않는 아이콘 제거
import Link from "next/link";

const tableHeaders = [
  { key: "preTax", label: "월급" },
  { key: "monthlyNet", label: "실수령액" },
  { key: "totalDeduction", label: "공제액 합계" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "DataSet",
  name: "2025년 월급 실수령액 표",
  description:
    "2025년 최신 세법 기준 월급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/monthly",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["월급", "실수령액", "세후 월급", "월급 테이블", "2025년"],
};

export default function MonthlyTablePage() {
  const [data, setData] = useState<SalaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/salary-table?type=monthly&page=${currentPage}&searchTerm=${searchTerm}`
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

  const highlightRows = useMemo(() => [3000000, 4000000, 5000000], []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-green-500 to-emerald-600 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            내 월급, 어디까지 알고 계신가요?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-emerald-100 dark:text-gray-300">
            매달 통장에 들어오는 월급, 그 속에 숨겨진 숫자의 의미를
            파헤쳐보세요. 세전 월급부터 세후 실수령액까지 모든 것을
            알려드립니다.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="mb-8">
              <label htmlFor="search" className="sr-only">
                월급 검색
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
                  placeholder="찾고 싶은 월급을 입력하세요 (예: 3,000,000)"
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

          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200 flex items-center justify-center gap-3">
              <PiggyBank className="w-8 h-8 text-green-500" />
              월급 관리 재테크 팁
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border">
                <h3 className="font-bold text-xl mb-3">
                  통장 쪼개기부터 시작하세요!
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  월급 통장, 생활비 통장, 비상금 통장, 투자 통장으로 나누어
                  관리하면 돈의 흐름을 파악하고 불필요한 소비를 줄일 수
                  있습니다. &apos;선저축 후지출&apos; 습관을 만드는
                  첫걸음입니다.
                </p>
              </div>
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border">
                <h3 className="font-bold text-xl mb-3">
                  첫 월급, 투자를 시작할 최적기!
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  큰 돈이 아니어도 괜찮습니다. 월 10만원이라도 S&P 500 ETF와
                  같은 우량 자산에 꾸준히 투자하면 복리의 마법을 경험할 수
                  있습니다. 가장 강력한 무기는 &apos;시간&apos;입니다.
                </p>
                <Link
                  href="/guides/first-job-investment"
                  className="text-green-600 font-semibold mt-4 inline-block"
                >
                  사회초년생 재테크 가이드 →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
