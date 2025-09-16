"use client";

import { useState, useEffect, useCallback } from "react";
import SalaryTable from "@/components/SalaryTable";
import type { SalaryData } from "@/lib/generateData";

const tableHeaders = [
  { key: "preTax", label: "주급(원)" },
  { key: "monthlyNet", label: "월 실수령액(원)" },
  { key: "health", label: "건강보험(원)" },
  { key: "employment", label: "고용보험(원)" },
  { key: "longTermCare", label: "장기요양(원)" },
  { key: "pension", label: "국민연금(원)" },
  { key: "incomeTax", label: "소득세(원)" },
  { key: "localTax", label: "지방소득세(원)" },
  { key: "totalDeduction", label: "공제액 합계(원)" },
];

export default function WeeklyTablePage() {
  useEffect(() => {
    document.title = "주급 실수령액표 | Moneysalary";
  }, []);

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

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
          주급 실수령액 표
        </h1>
        <p className="mt-4 text-base lg:text-lg leading-8 text-gray-600 dark:text-gray-400">
          주급 구간별 월 예상 실수령액과 상세 공제 내역을 확인하세요.
        </p>
      </div>

      <div className="mb-6 max-w-sm mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="주급으로 검색 (예: 1,000,000)"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-signature-blue focus:border-signature-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>
        ) : (
          <SalaryTable headers={tableHeaders} data={data} />
        )}
      </div>

      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-gray-200 dark:bg-gray-800"
        >
          이전
        </button>
        <span className="text-sm">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-gray-200 dark:bg-gray-800"
        >
          다음
        </button>
      </div>
    </main>
  );
}
