// src/app/table/weekly/page.tsx

import { Suspense } from "react";
import { generateWeeklyPayTableData } from "@/lib/generateData";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import WeeklyTableInteractive from "./WeeklyTableInteractive";
import TableHero from "@/components/TableHero";

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
        <TableHero
          badgeText="2025년 최신 세법 기준"
          title={
            <>
              2025 주급 실수령액 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                미리보기
              </span>
            </>
          }
          description={
            <>
              2025년, 주급으로 받는 내 급여는 월급으로 환산하면 얼마일까요? <br className="hidden sm:block" />
              최신 정책을 반영한 예상 실수령액을 확인하세요.
            </>
          }
        />

        <WeeklyTableInteractive
          allData={allData}
          tableHeaders={tableHeaders}
          highlightRows={highlightRows}
          totalPages={totalPages}
          paginatedData={paginatedData}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              2025년 vs 2026년 주요 정책 비교
            </h2>
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <p className="text-center text-muted-foreground">
                현재 2026년 세법 개정안이 확정되지 않았습니다. 아래 정보는 현재까지의 전망을 바탕으로 한 예상치이며, 실제와 다를 수 있습니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">2025년</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>- 국민연금 요율: 9% (근로자 4.5%)</li>
                    <li>- 건강보험 요율: 7.09% (근로자 3.545%)</li>
                    <li>- 근로소득세 최저세율: 6%</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">2026년 (전망)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>- 국민연금 요율: <span className="font-semibold text-primary">변동 가능성 있음</span></li>
                    <li>- 건강보험 요율: <span className="font-semibold text-primary">소폭 인상 전망</span></li>
                    <li>- 근로소득세: <span className="font-semibold text-primary">세율 조정 논의 중</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
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