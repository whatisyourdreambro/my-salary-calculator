"use client";

import { useState, useMemo } from "react";
import type { Metadata } from "next";
import SalaryTable from "@/components/SalaryTable";
import { generateAnnualSalaryTableData } from "@/lib/generateData";

/* 페이지별 metadata는 검색엔진 최적화(SEO)에 매우 중요합니다.
  하지만 'use client'를 사용하는 클라이언트 컴포넌트에서는 이 방식이 직접 지원되지 않습니다.
  SEO를 더 강화하려면, 이 페이지들을 서버 컴포넌트로 분리하는 리팩토링이 필요하지만,
  현재 기능에는 영향이 없으므로 일단 주석으로 남겨둡니다.
*/
// export const metadata: Metadata = {
//   title: '2025년 연봉 실수령액표 (10만원 ~ 5억원)',
//   description: '2025년 최신 기준 연봉 10만원부터 5억원까지의 구간별 세후 월급, 4대보험, 공제액을 상세히 확인하세요.',
// };

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

export default function AnnualTablePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const allData = useMemo(() => generateAnnualSalaryTableData(), []);

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
    h.key === "preTax" ? { ...h, label: "연봉(원)" } : h
  );

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
          연봉 실수령액 표
        </h1>
        <p className="mt-4 text-base lg:text-lg leading-8 text-gray-600 dark:text-gray-400">
          연봉 구간별 월 예상 실수령액과 상세 공제 내역을 확인하세요.
        </p>
      </div>

      <div className="mb-6 max-w-sm mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="연봉으로 검색 (예: 50,000,000)"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-signature-blue focus:border-signature-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <SalaryTable headers={dynamicHeaders} data={filteredData} />
      </div>
    </main>
  );
}
