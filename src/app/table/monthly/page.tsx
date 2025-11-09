// src/app/table/monthly/page.tsx

import { Suspense } from "react";
import { generateMonthlySalaryTableData } from "@/lib/generateData";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import MonthlyTableInteractive from "./MonthlyTableInteractive";

export const runtime = "edge";

const tableHeaders = [
  { key: "preTax", label: "월급" },
  { key: "monthlyNet", label: "월 실수령액" },
  { key: "totalDeduction", label: "월 공제액 합계" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "DataSet",
  name: "2025년 월급 실수령액 표",
  description: "2025년 최신 세법 기준 월급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/monthly",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["월급", "실수령액", "세후 월급", "월급 테이블", "2025년"],
};

async function MonthlyTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allData = generateMonthlySalaryTableData();

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

  const highlightRows = [3000000, 4000000, 5000000, 6000000];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-primary/90 to-primary dark:from-gray-900 dark:to-primary/80 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025 월급 실수령액 표
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            매달 받는 월급, 세금을 떼고 나면 실제로는 얼마일까요? 월급 구간별 상세 공제 내역과 실수령액을 확인하세요.
          </p>
        </div>

        <MonthlyTableInteractive
          allData={allData}
          tableHeaders={tableHeaders}
          highlightRows={highlightRows}
          totalPages={totalPages}
          paginatedData={paginatedData}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              월급에 대한 모든 궁금증 (Q&A)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 월급과 연봉, 어떻게 다른가요?
                </h3>
                <p className="text-muted-foreground">
                  <strong>연봉</strong>은 1년 동안 받기로 계약한 총금액이며, <strong>월급</strong>은 보통 이 연봉을 12개월로 나눈 금액입니다. 하지만 퇴직금 포함 여부, 비과세 수당 등에 따라 단순 계산과 달라질 수 있습니다.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 더 정확한 내 월급을 계산하고 싶어요.
                </h3>
                <p className="text-muted-foreground">
                  부양가족 수, 비과세액 등 개인의 상황에 따라 실수령액은 달라집니다. 메인 페이지의 계산기에서 상세 조건을 입력하여 더 정확한 월 실수령액을 확인해보세요.
                </p>
                <Link
                  href="/"
                  className="text-primary font-semibold mt-4 inline-block"
                >
                  내 조건으로 정확히 계산하기 →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
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