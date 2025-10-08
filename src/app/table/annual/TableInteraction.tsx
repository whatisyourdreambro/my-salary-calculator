// src/app/table/annual/TableInteraction.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface TableInteractionProps {
  totalPages: number;
}

export default function TableInteraction({
  totalPages,
}: TableInteractionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리에서 현재 페이지와 검색어를 직접 읽어와 상태를 관리합니다.
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSearch = searchParams.get("searchTerm") || "";

  const [searchTerm, setSearchTerm] = useState(
    currentSearch ? parseInt(currentSearch, 10).toLocaleString() : ""
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    setSearchTerm(
      numericValue ? parseInt(numericValue, 10).toLocaleString() : ""
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericSearch = searchTerm.replace(/,/g, "");
    router.push(`/table/annual?page=1&searchTerm=${numericSearch}`);
  };

  const handlePageChange = (newPage: number) => {
    const numericSearch = (searchParams.get("searchTerm") || "").replace(
      /,/g,
      ""
    );
    router.push(
      `/table/annual?page=${newPage}${
        numericSearch ? `&searchTerm=${numericSearch}` : ""
      }`
    );
  };

  return (
    <>
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <label htmlFor="search" className="sr-only">
            연봉 검색
          </label>
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
        </form>
      </div>

      <div className="flex justify-center items-center mt-8 mb-4 space-x-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          이전
        </button>
        <span className="text-sm font-semibold">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          다음
        </button>
      </div>
    </>
  );
}
