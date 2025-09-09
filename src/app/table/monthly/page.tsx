"use client";

import { useState, useMemo, useEffect } from "react";
import SalaryTable from "@/components/SalaryTable";
import type { SalaryData } from "@/lib/types";

const tableHeaders = [
  { key: "preTax", label: "세전 금액(원)" },
  { key: "monthlyNet", label: "월 실수령액(원)" },
  { key: "health", label: "건강보험(원)" },
  { key: "employment", label: "고용보험(원)" },
  { key: "longTermCare", label: "장기요양(원)" },
  { key: "pension", label: "국민연금(원)" },
  { key: "incomeTax", label: "소득세(원)" },
  { key: "localTax", label: "지방소득세(원)" },
  { key: "totalDeduction", label: "공제액 합계(원)" },
];

export default function MonthlyTablePage() {
  const [allData, setAllData] = useState<SalaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "월급 실수령액표 | Moneysalary";

    const fetchData = async () => {
      try {
        const res = await fetch("/api/salary-table?type=monthly");
        const data = await res.json();
        setAllData(data);
      } catch (error) {
        console.error("Failed to fetch salary data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue) {
      setSearchTerm(parseInt(numericValue, 10).toLocaleString());
    } else {
      setSearchTerm("");
    }
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return allData;
    const cleanSearchTerm = searchTerm.replace(/,/g, "");
    return allData.filter((row) =>
      row.preTax.toString().includes(cleanSearchTerm)
    );
  }, [searchTerm, allData]);

  const dynamicHeaders = tableHeaders.map((h) =>
    h.key === "preTax" ? { ...h, label: "월급(원)" } : h
  );

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
          월급 실수령액 표
        </h1>
        <p className="mt-4 text-base lg:text-lg leading-8 text-gray-600 dark:text-gray-400">
          월급 구간별 월 예상 실수령액과 상세 공제 내역을 확인하세요.
        </p>
      </div>

      <div className="mb-6 max-w-sm mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="월급으로 검색 (예: 3,000,000)"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-signature-blue focus:border-signature-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center p-10">데이터를 불러오는 중입니다...</div>
        ) : (
          <SalaryTable headers={dynamicHeaders} data={filteredData} />
        )}
      </div>
    </main>
  );
}
