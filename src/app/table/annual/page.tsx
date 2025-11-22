// src/app/table/annual/page.tsx

import { Suspense } from "react";
import { generateAnnualSalaryTableData } from "@/lib/generateData";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import AnnualTableInteractive from "./AnnualTableInteractive";
import TableHero from "@/components/TableHero";

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
  name: "2025년 연봉 실수령액 표",
  description:
    "2025년 최신 세법 기준 연봉 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/annual",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["연봉", "실수령액", "세후 월급", "연봉 테이블", "2025년"],
};

// 서버 컴포넌트는 데이터 로직에만 집중합니다.
async function AnnualTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allData = generateAnnualSalaryTableData();

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
        <TableHero
          badgeText="2025년 최신 세법 기준"
          title={
            <>
              2025 연봉 실수령액 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                대백과
              </span>
            </>
          }
          description={
            <>
              당신의 진짜 가치를 숫자로 확인하세요. <br className="hidden sm:block" />
              2025년 최신 세법 기준, 연봉 구간별 상세 공제 내역과 실수령액을 한눈에 비교해 드립니다.
            </>
          }
        />

        <AnnualTableInteractive
          allData={allData}
          tableHeaders={tableHeaders}
          highlightRows={highlightRows}
          totalPages={totalPages}
          paginatedData={paginatedData}
        />

        <div className="w-full py-16">
          <section>
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

export default function AnnualTablePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnnualTable searchParams={searchParams} />
    </Suspense>
  );
}
