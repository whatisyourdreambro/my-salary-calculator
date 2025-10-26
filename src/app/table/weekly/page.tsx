// src/app/table/weekly/page.tsx

import { Suspense } from "react";
import SalaryTable from "@/components/SalaryTable";
import { generateWeeklyPayTableData } from "@/lib/generateData";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import TableInteraction from "@/components/TableInteraction";

export const runtime = "edge";

const tableHeaders = [
  { key: "preTax", label: "주급" },
  { key: "monthlyNet", label: "월 예상 실수령액" },
  { key: "totalDeduction", label: "월 공제액 합계" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "DataSet",
  name: "2025년 주급 실수령액 표",
  description: "2025년 최신 세법 기준 주급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/weekly",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["주급", "실수령액", "세후 월급", "주급 테이블", "2025년"],
};

async function WeeklyTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allData = generateWeeklyPayTableData();

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

  const highlightRows = [1000000, 1500000, 2000000];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-primary/90 to-primary dark:from-gray-900 dark:to-primary/80 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025 주급 실수령액 표
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            주급으로 급여를 받으시나요? 주급에 따른 월 예상 실수령액과 상세 공제 내역을 확인하세요.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl border border-border">
            <TableInteraction totalPages={totalPages} basePath="/table/weekly" searchPlaceholder="주급으로 검색..." />

            <div className="overflow-hidden mt-8">
              <SalaryTable
                headers={tableHeaders}
                data={paginatedData}
                highlightRows={highlightRows}
                unit="원"
              />
            </div>
          </div>
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              주급에 대한 모든 궁금증 (Q&A)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 주급제인데 4대보험에 가입해야 하나요?
                </h3>
                <p className="text-muted-foreground">
                  네, 주 15시간 이상, 월 60시간 이상 근무하는 근로자는 주급제, 시급제 등 급여 형태와 관계없이 4대보험 의무 가입 대상입니다. 이 표는 4대보험 가입을 기준으로 계산되었습니다.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 주휴수당은 어떻게 계산되나요?
                </h3>
                <p className="text-muted-foreground">
                  1주 동안 규정된 근무일수를 다 채운 근로자에게는 1일치의 유급 주휴일이 주어집니다. 이 표의 계산은 주 5일, 40시간 근무를 기준으로 주휴수당이 포함된 월 환산액으로 계산됩니다.
                </p>
                <Link
                  href="/guides/holiday-allowance"
                  className="text-primary font-semibold mt-4 inline-block"
                >
                  주휴수당 자세히 알아보기 →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function WeeklyTablePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WeeklyTable searchParams={searchParams} />
    </Suspense>
  );
}