
// src/app/table/2026/monthly/page.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 월급 실수령액 표 — 200만~1000만원 전 구간 세후 수령액",
 description:
 "월급 250만원이면 세후 약 218만원, 500만원이면 약 410만원. 2026년 최신 4대보험·소득세 자동 계산표를 200만~1000만원 전 구간으로 한눈에 확인하세요. 전년 대비 변화액까지 즉시 비교 가능.",
 path: "/table/2026/monthly",
 keywords: [
 "월급 실수령액 표",
 "2026 월급 계산기",
 "월급별 실수령액",
 "최저월급 2026",
 "세후 월급 계산",
 "월급 250만원 실수령",
 "월급 300만원 실수령",
 "월급 400만원 실수령",
 "월급 500만원 실수령",
 "월급 700만원 실수령",
 "4대보험 공제액",
 ],
});

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
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 whitespace-nowrap">
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

 <div className="page-width -mt-20 relative z-10">
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
