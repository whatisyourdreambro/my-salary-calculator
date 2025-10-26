// src/components/TableInteraction.tsx
"use client";

import { useState } from "react";
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
    router.push(`${basePath}?page=1&searchTerm=${numericSearch}`);
  };

  const handlePageChange = (newPage: number) => {
    const numericSearch = (searchParams.get("searchTerm") || "").replace(
      /,/g,
      ""
    );
    router.push(
      `${basePath}?page=${newPage}${
        numericSearch ? `&searchTerm=${numericSearch}` : ""
      }`
    );
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-base"
        />
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
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}
