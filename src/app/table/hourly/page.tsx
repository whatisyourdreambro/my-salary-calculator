// src/app/table/hourly/page.tsx

import { Suspense } from "react";
import SalaryTable from "@/components/SalaryTable";
import { generateHourlyWageTableData } from "@/lib/generateData";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import TableInteraction from "@/components/TableInteraction";

export const runtime = "edge";

const tableHeaders = [
  { key: "preTax", label: "시급" },
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
  name: "2025년 시급 실수령액 표",
  description: "2025년 최신 세법 기준 시급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/hourly",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["시급", "실수령액", "세후 월급", "시급 테이블", "2025년"],
};

async function HourlyTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allData = generateHourlyWageTableData();

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

  const highlightRows = [10030, 12000, 15000, 20000];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-primary/90 to-primary dark:from-gray-900 dark:to-primary/80 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025 시급 실수령액 표
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            최저시급부터 전문직 시급까지, 당신의 시간에 대한 가치를 월 실수령액으로 환산해 드립니다.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl border border-border">
            <TableInteraction totalPages={totalPages} basePath="/table/hourly" searchPlaceholder="시급으로 검색..." />

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
              시급에 대한 모든 궁금증 (Q&A)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 2025년 최저시급은 얼마인가요?
                </h3>
                <p className="text-muted-foreground">
                  2025년 최저시급은 <strong>10,030원</strong>으로 예상되고 있습니다. 이 표는 예상 최저시급을 기준으로 작성되었으며, 확정 시 업데이트될 예정입니다. 주휴수당을 포함한 월 환산액은 약 209만원입니다.
                </p>
                 <Link
                  href="/guides/minimum-wage"
                  className="text-primary font-semibold mt-4 inline-block"
                >
                  2025년 최저임금 자세히 보기 →
                </Link>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 알바도 4대보험에 가입해야 하나요?
                </h3>
                <p className="text-muted-foreground">
                  네, 월 60시간 이상 근무하는 아르바이트생은 4대보험 의무 가입 대상입니다. 다만, 국민연금과 건강보험은 조건에 따라 제외될 수 있습니다. 자세한 내용은 프리랜서/알바 계산기를 참고하세요.
                </p>
                <Link
                  href="/?tab=freelancer"
                  className="text-primary font-semibold mt-4 inline-block"
                >
                  프리랜서/알바 계산기 바로가기 →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function HourlyTablePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HourlyTable searchParams={searchParams} />
    </Suspense>
  );
}