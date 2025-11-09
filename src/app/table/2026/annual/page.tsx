// src/app/table/2026/annual/page.tsx

import { Suspense } from "react";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import AnnualTableInteractive from "./AnnualTableInteractive";

// Cloudflare Pages 배포를 위한 Edge 런타임 설정
export const runtime = "edge";

const tableHeaders = [
  { key: "preTax", label: "연봉" },
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
  name: "2026년 연봉 실수령액 표",
  description:
    "2026년 최신 세법 기준 연봉 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/2026/annual",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["연봉", "실수령액", "세후 월급", "연봉 테이블", "2026년"],
};

async function AnnualTable2026({
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-primary/90 to-primary dark:from-gray-900 dark:to-primary/80 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2026 연봉 실수령액 미리보기
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            다가오는 2026년, 당신의 연봉은 어떻게 변할까요? 최신 정책 전망을 반영한 예상 실수령액을 확인하고 미래를 준비하세요.
          </p>
        </div>

        <AnnualTableInteractive
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
              연봉에 대한 모든 궁금증 (Q&A)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. &apos;세전&apos;, &apos;세후&apos;는 무슨 뜻인가요?
                </h3>
                <p className="text-muted-foreground">
                  <strong>세전 연봉</strong>은 회사와 계약한 금액 총액을
                  의미하며, <strong>세후 실수령액</strong>은 이 세전 연봉에서
                  4대보험과 소득세 등 각종 공제 항목을 제외하고 실제 통장에
                  입금되는 금액을 말합니다.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 연봉이 같아도 실수령액이 다른 이유는?
                </h3>
                <p className="text-muted-foreground">
                  <strong>
                    비과세 수당(식대 등), 부양가족 수, 연말정산 결과
                  </strong>
                  에 따라 공제되는 세금 액수가 달라지기 때문입니다. 저희
                  계산기에서 상세 조건을 입력하면 더 정확한 결과를 얻을 수
                  있습니다.
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

export default function AnnualTable2026Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnnualTable2026 searchParams={searchParams} />
    </Suspense>
  );
}
