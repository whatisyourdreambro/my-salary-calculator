// src/app/table/2026/weekly/page.tsx

import { Suspense } from "react";
import { generateWeeklyPayTableData2026 } from "@/lib/generateData";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import WeeklyTableInteractive from "./WeeklyTableInteractive";
import TableHero from "@/components/TableHero";



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
  name: "2026년 주급 실수령액 표",
  description: "2026년 최신 세법 기준 주급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/2026/weekly",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["주급", "실수령액", "세후 월급", "주급 테이블", "2026년"],
};

// 서버 컴포넌트는 데이터 로직에만 집중합니다.
function WeeklyTable2026() {
  const allData = generateWeeklyPayTableData2026();
  const highlightRows = [1000000, 1500000, 2000000];

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
              2026 주급 실수령액 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                미리보기
              </span>
            </>
          }
          description={
            <>
              2026년 최저시급 10,320원 확정! <br className="hidden sm:block" />
              주급으로 환산 시 예상 실수령액을 확인해보세요.
            </>
          }
        />

        <Suspense fallback={<div>Loading...</div>}>
          <WeeklyTableInteractive
            allData={allData}
            tableHeaders={tableHeaders}
            highlightRows={highlightRows}
          />
        </Suspense>

        <div className="w-full py-16">
          <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              2025년 vs 2026년 주요 정책 비교
            </h2>
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <p className="text-center text-muted-foreground">
                2026년 최저시급 10,320원(2.9% 인상)이 확정되었습니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">2025년</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>- 최저시급: 10,030원</li>
                    <li>- 월 환산액: 2,096,270원</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">2026년 (확정)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>- 최저시급: <span className="font-semibold text-primary">10,320원</span></li>
                    <li>- 월 환산액: <span className="font-semibold text-primary">2,156,880원</span></li>
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
                  Q. 2026년 주급은 얼마인가요? (최저임금 기준)
                </h3>
                <p className="text-muted-foreground">
                  2026년 최저시급 10,320원 기준으로 주 40시간(주휴수당 포함 48시간분) 근무 시 주급은 <strong>495,360원</strong>입니다.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">
                  Q. 주휴수당은 어떻게 계산되나요?
                </h3>
                <p className="text-muted-foreground">
                  1주 15시간 이상 근무 시 1일치(8시간) 임금이 추가됩니다. 시급 10,320원 기준 주휴수당은 82,560원입니다.
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

export default function WeeklyTable2026Page() {
  return <WeeklyTable2026 />;
}
