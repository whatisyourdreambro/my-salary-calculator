
// src/app/table/2026/monthly/page.tsx

import { Suspense } from "react";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";



const tableHeaders = [
  { key: "monthlyPreTax", label: "월급 (세전)" },
  { key: "monthlyNet", label: "월 실수령액" },
  { key: "totalDeduction", label: "공제총액" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

// 서버 컴포넌트는 데이터 로직에만 집중합니다.
function MonthlyTable() {
  const rawData = generateAnnualSalaryTableData2026();
  const allData = rawData.map(d => ({
    ...d,
    monthlyPreTax: Math.floor(d.preTax / 12)
  }));

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <TableHero
        badgeText="2026년 최신 데이터 반영"
        title={
          <>
            2026 월급 실수령액 <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 whitespace-nowrap">
              미리보기
            </span>
          </>
        }
        description={
          <>
            2026년 최저월급은 약 216만원입니다. (<span className="text-primary font-bold">10,320원</span> 기준)<br />
            내 월급의 세후 수령액 변화를 미리 확인해보세요.
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <SalaryTable
          headers={tableHeaders}
          data={allData}
        />

        <div className="mt-8 text-center text-muted-foreground text-sm">
          * 본 데이터는 2026년 예상 보험료율 인상안을 반영한 시뮬레이션 결과입니다.
        </div>
      </div>
    </main>
  );
}

export default function MonthlyTablePage() {
  return <MonthlyTable />;
}
