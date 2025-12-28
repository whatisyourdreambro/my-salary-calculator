
// src/app/table/2026/annual/page.tsx

import { Suspense } from "react";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import { HelpCircle, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import SalaryTable from "@/components/SalaryTable"; // Reusing the generic component
import TableHero from "@/components/TableHero";

export const runtime = "edge";

const tableHeaders = [
  { key: "preTax", label: "연봉" },
  { key: "monthlyNet", label: "2026 예상 월 실수령" },
  { key: "changeValue", label: "변화값 (전년비)" }, // New Column
  { key: "totalDeduction", label: "공제총액" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

async function AnnualTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allData = generateAnnualSalaryTableData2026();

  const page = parseInt(searchParams.page as string, 10) || 1;
  const searchTerm = searchParams.searchTerm as string | undefined;
  const itemsPerPage = 100;

  const filteredData = searchTerm
    ? allData.filter((row) =>
      row.preTax.toString().includes(searchTerm.replace(/,/g, ""))
    )
    : allData;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const highlightRows = [30000000, 50000000, 80000000, 100000000];

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <TableHero
        badgeText="2026년 예상 시뮬레이션"
        title={
          <>
            2026 연봉 실수령액 <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              미리보기
            </span>
          </>
        }
        description={
          <>
            2026년, 내 월급은 어떻게 변할까요? <br className="hidden sm:block" />
            물가 상승과 보험료 인상을 반영한 상세 예측 데이터를 확인하세요.
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <SalaryTable
          headers={tableHeaders}
          data={paginatedData}
          highlightRows={highlightRows}
        />

        <div className="mt-8 text-center text-muted-foreground text-sm">
          * 본 데이터는 2026년 예상 보험료율 인상안을 반영한 시뮬레이션 결과이며, 실제 확정치와 다를 수 있습니다.
        </div>
      </div>
    </main>
  );
}

export default function AnnualTablePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading 2026 Data...</div>}>
      <AnnualTable searchParams={searchParams} />
    </Suspense>
  );
}
