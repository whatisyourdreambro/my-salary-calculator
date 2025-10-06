"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import SalaryTable from "@/components/SalaryTable";
import type { SalaryData } from "@/lib/generateData";
import { HelpCircle, Search } from "lucide-react";
import Link from "next/link";

const tableHeaders = [
  { key: "preTax", label: "연봉" },
  { key: "monthlyNet", label: "월 실수령액" },
  { key: "totalDeduction", label: "월 공제액 합계" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "DataSet",
  name: "2025년 연봉 실수령액 표",
  description:
    "2025년 최신 세법 기준 연봉 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/annual",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["연봉", "실수령액", "세후 월급", "연봉 테이블", "2025년"],
};

export default function AnnualTablePage() {
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
      console.log("Google Ads Conversion (Annual Table) Fired!"); // 정상 작동 확인용 로그
    }
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 1회만 실행되도록 합니다.

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/salary-table?type=annual&page=${currentPage}&searchTerm=${searchTerm}`
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

  const highlightRows = useMemo(
    () => [30000000, 50000000, 80000000, 100000000],
    []
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-signature-blue to-blue-400 dark:from-gray-900 dark:to-signature-blue/80 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025 연봉 실수령액 대백과
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            당신의 진짜 가치를 숫자로 확인하세요. 2025년 최신 세법 기준, 연봉
            구간별 상세 공제 내역과 실수령액을 한눈에 비교해 드립니다.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            {/* 검색 및 필터링 섹션 */}
            <div className="mb-8">
              <label htmlFor="search" className="sr-only">
                연봉 검색
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
                  placeholder="찾고 싶은 연봉을 입력하세요 (예: 50,000,000)"
                  className="w-full pl-11 pr-4 py-4 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-signature-blue bg-white dark:bg-gray-800 text-lg"
                />
              </div>
            </div>

            {/* 테이블 섹션 */}
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

            {/* 페이지네이션 */}
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

          {/* 추가 정보 섹션 */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200 flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-signature-blue" />
              연봉에 대한 모든 궁금증 (Q&A)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border">
                {/* [수정] 작은따옴표를 &apos;으로 변경 */}
                <h3 className="font-bold text-xl mb-3">
                  Q. &apos;세전&apos;, &apos;세후&apos;는 무슨 뜻인가요?
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  <strong>세전 연봉</strong>은 회사와 계약한 금액 총액을
                  의미하며, <strong>세후 실수령액</strong>은 이 세전 연봉에서
                  4대보험과 소득세 등 각종 공제 항목을 제외하고 실제 통장에
                  입금되는 금액을 말합니다.
                </p>
              </div>
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 연봉이 같아도 실수령액이 다른 이유는?
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  <strong>
                    비과세 수당(식대 등), 부양가족 수, 연말정산 결과
                  </strong>
                  에 따라 공제되는 세금 액수가 달라지기 때문입니다. 저희
                  계산기에서 상세 조건을 입력하면 더 정확한 결과를 얻을 수
                  있습니다.
                </p>
                <Link
                  href="/"
                  className="text-signature-blue font-semibold mt-4 inline-block"
                >
                  내 조건으로 정확히 계산하기 →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
