// src/components/TableInteraction.tsx
"use client";

import { useEffect, useState } from "react";
import { clampTablePage, formatTableSearch, normalizeTableSearch, safeTablePageCount } from "@/lib/tableQueryState";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface TableInteractionProps {
 totalPages: number;
 basePath: string; // e.g., "/table/annual"
 searchPlaceholder: string;
}

export default function TableInteraction({
 totalPages,
 basePath,
 searchPlaceholder,
}: TableInteractionProps) {
 const router = useRouter();
 const searchParams = useSearchParams();

  const pageCount = safeTablePageCount(totalPages);
  const currentPage = clampTablePage(searchParams.get("page"), pageCount);
  const currentSearch = normalizeTableSearch(searchParams.get("searchTerm"));
  const currentQuery = searchParams.toString();

  const [searchTerm, setSearchTerm] = useState(() => formatTableSearch(currentSearch));
  useEffect(() => {
    // Page navigation and browser history must discard an unsubmitted draft,
    // even when the submitted search itself has not changed.
    setSearchTerm(formatTableSearch(currentSearch));
  }, [currentSearch, currentQuery]);

 const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { value } = e.target;
 const numericValue = value.replace(/[^0-9]/g, "");
 setSearchTerm(
  formatTableSearch(numericValue)
 );
 };

 const handleSearchSubmit = (e: React.FormEvent) => {
 e.preventDefault();
  const numericSearch = normalizeTableSearch(searchTerm);
 router.push(`${basePath}?page=1&searchTerm=${numericSearch}`);
 };

 const handlePageChange = (newPage: number) => {
  const numericSearch = currentSearch;
  const page = clampTablePage(String(newPage), pageCount);
 router.push(
 `${basePath}?page=${page}${
 numericSearch ? `&searchTerm=${numericSearch}` : ""
 }`
 );
 };

 return (
 <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
 <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
 <label htmlFor="search" className="sr-only">
 금액으로 표 검색
 </label>
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Search className="h-5 w-5 text-muted-foreground" />
 </div>
 <input
 id="search"
 type="text"
 inputMode="numeric"
 enterKeyHint="search"
 value={searchTerm}
 onChange={handleSearchChange}
 placeholder={searchPlaceholder}
 className="w-full pl-10 pr-20 py-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-base"
 />
 <button
 type="submit"
 className="absolute inset-y-1.5 right-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
 >
 검색
 </button>
 </form>

 <div className="flex justify-center items-center gap-2">
 <button
 onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
 disabled={currentPage === 1}
 className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
 >
 이전
 </button>
 <span className="text-sm font-semibold text-muted-foreground">
 {currentPage} / {pageCount}
 </span>
 <button
 onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
 disabled={currentPage >= pageCount}
 className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
 >
 다음
 </button>
 </div>
 </div>
 );
}
