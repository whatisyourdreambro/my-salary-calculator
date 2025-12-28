
// src/app/table/2026/monthly/page.tsx

import { Suspense } from "react";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";

export const runtime = "edge";

const tableHeaders = [
  { key: "monthlyPreTax", label: "월급 (세전)" },
  { key: "monthlyNet", label: "월 실수령액" },
  { key: "totalDeduction", label: "공제총액" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

async function MonthlyTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Reuse the generation logic but map it to monthly view focus
  const rawData = generateAnnualSalaryTableData2026();
  // Filter mostly relevant monthly steps if needed, but the generator is annual step 1M. 
  // For monthly table, often we want steps like 2000000, 2100000... 
  // The current generator gives annual steps. 
  // Let's just use it and display the monthly pre-tax as the primary key.

  const allData = rawData.map(d => ({
    ...d,
    monthlyPreTax: Math.floor(d.preTax / 12)
  }));


  const page = parseInt(searchParams.page as string, 10) || 1;
  const itemsPerPage = 100;
  const paginatedData = allData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <TableHero
        badgeText="2026년 예상 시뮬레이션"
        title={
          <>
            2026 월급 실수령액 <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              미리보기
            </span>
          </>
        }
        description={
          <>
            2026년 예상 월급표입니다. <br />
            세후 수령액 변화를 미리 확인해보세요.
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <SalaryTable
          headers={tableHeaders}
          data={paginatedData}
        />

        <div className="mt-8 text-center text-muted-foreground text-sm">
          * 본 데이터는 2026년 예상 보험료율 인상안을 반영한 시뮬레이션 결과입니다.
        </div>
      </div>
    </main>
  );
}

export default function MonthlyTablePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MonthlyTable searchParams={searchParams} />
    </Suspense>
  );
}
