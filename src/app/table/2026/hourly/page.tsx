// src/app/table/2026/hourly/page.tsx

import { Suspense } from "react";
import { generateHourlyWageTableData2026 } from "@/lib/generateData";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import HourlyTableInteractive from "./HourlyTableInteractive";
import TableHero from "@/components/TableHero";

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
  name: "2026년 시급 실수령액 표",
  description: "2026년 최신 세법 기준 시급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/2026/hourly",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["시급", "실수령액", "세후 월급", "시급 테이블", "2026년"],
};

async function HourlyTable2026({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allData = generateHourlyWageTableData2026();

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
        <TableHero
          badgeText="2026년 최신 데이터 반영"
          title={
            <>
              2026 시급 실수령액 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                미리보기
              </span>
            </>
          }
          description={
            <>
              2026년 최저시급은 얼마가 될까요? <br className="hidden sm:block" />
              예상 최저시급과 내 시급에 따른 월 환산 실수령액을 미리 확인해보세요.
            </>
          }
        />

        <HourlyTableInteractive
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
              시급에 대한 모든 궁금증 (Q&A)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 2026년 최저시급은 얼마로 예상되나요?
                </h3>
                <p className="text-muted-foreground">
                  2026년 최저시급은 아직 결정되지 않았지만, 최근 인상률을 고려할 때 <strong>10,300원 ~ 10,500원</strong> 사이에서 결정될 가능성이 있습니다. 확정되는 대로 신속하게 업데이트하겠습니다.
                </p>
                <Link
                  href="/guides/minimum-wage"
                  className="text-primary font-semibold mt-4 inline-block"
                >
                  최저임금 관련 뉴스 보기 →
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

export default function HourlyTable2026Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HourlyTable2026 searchParams={searchParams} />
    </Suspense>
  );
}
