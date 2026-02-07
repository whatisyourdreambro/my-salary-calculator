// src/app/table/2026/hourly/page.tsx

import { Suspense } from "react";
import { generateHourlyWageTableData2026 } from "@/lib/generateData";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import HourlyTableInteractive from "./HourlyTableInteractive";
import TableHero from "@/components/TableHero";



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

// 서버 컴포넌트는 데이터 로직에만 집중합니다.
function HourlyTable2026() {
  const allData = generateHourlyWageTableData2026();
  const highlightRows = [10320, 12000, 15000, 20000];

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
              2026년 최저시급은 <strong>10,320원</strong>으로 확정되었습니다. <br className="hidden sm:block" />
              내 시급에 따른 월 환산 실수령액을 미리 확인해보세요.
            </>
          }
        />

        <Suspense fallback={<div>Loading...</div>}>
          <HourlyTableInteractive
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
                2026년 최저임금이 10,320원으로 확정되었습니다.
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
                    <li>- 최저시급: <span className="font-semibold text-primary">10,320원 (2.9% 인상)</span></li>
                    <li>- 월 환산액: <span className="font-semibold text-primary">2,156,880원</span></li>
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
                  Q. 2026년 최저시급은 얼마인가요?
                </h3>
                <p className="text-muted-foreground">
                  2026년 최저시급은 <strong>10,320원</strong>으로 결정되었습니다. 2025년 10,030원 대비 290원(2.9%) 인상된 금액입니다.
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

export default function HourlyTable2026Page() {
  return <HourlyTable2026 />;
}
