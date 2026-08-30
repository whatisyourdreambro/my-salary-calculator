// src/app/table/2027/weekly/page.tsx — 2027년판 주급 실수령액 표 (2026-08-30 신설, 성장 제안 ④)
// 엔진: generateData2027 (연금 5.0% 확정 + 미확정 요율 2026 준용 — layout 고지 배너 참조)

import { Suspense } from "react";
import { generateWeeklyPayTableData2027, MIN_WAGE_2027 } from "@/lib/generateData2027";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "@/components/AppLink";
import WeeklyTableInteractive from "./WeeklyTableInteractive";
import TableHero from "@/components/TableHero";
import SeasonalLinks from "../../2026/SeasonalLinks";
import FavoritesButton from "@/components/FavoritesButton";
import { CalcResultAd, Display2Ad } from "@/components/AdPlacement";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, datasetLd, faqLd } from "@/lib/structuredData";

const fmtWon = (n: number) => n.toLocaleString("ko-KR");

export const metadata: Metadata = buildPageMetadata({
  title: "2027 주급 실수령액 표 — 주급별 월 환산 세후 금액 미리보기",
  description:
    "2027년 국민연금 5.0% 인상을 반영한 주급 20만~300만원 구간별 월 환산 실수령액 표. 주급제 알바·계약직의 내년 세후 수령액을 4대보험·소득세 공제까지 미리 확인하세요.",
  path: "/table/2027/weekly",
  keywords: [
    "2027 주급 실수령액",
    "주급 계산기 2027",
    "주급 월급 환산",
    "주급 실수령액 표",
    "주급제 세금",
  ],
});

const tableHeaders = [
  { key: "preTax", label: "주급" },
  { key: "monthlyNet", label: "월 예상 실수령액" },
  { key: "totalDeduction", label: "월 공제액 합계" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const FAQ_ITEMS = [
  {
    question: "주급을 월급으로 어떻게 환산하나요?",
    answer:
      "주급 × 52주 ÷ 12개월로 환산합니다. 예를 들어 주급 100만원이면 연 5,200만원, 월 약 433만원(세전)입니다. 본 표는 이 환산 월급에서 2027년 국민연금 5.0%(확정 인상)와 건강보험·고용보험·소득세(2026 기준 준용)를 공제한 참고치입니다.",
  },
  {
    question: "2027년 최저임금 기준 주급은 얼마인가요?",
    answer:
      `2027년 최저시급 ${fmtWon(MIN_WAGE_2027)}원 기준, 주 40시간 + 주휴 8시간 = 주 48시간분을 적용하면 최저 주급은 세전 ${fmtWon(MIN_WAGE_2027 * 48)}원입니다.`,
  },
  {
    question: "주급제도 4대보험과 세금을 공제하나요?",
    answer:
      "근로 형태와 시간에 따라 다릅니다. 월 60시간 이상 근무하는 근로자는 4대보험 가입 대상이며, 본 표는 근로소득 기준 공제를 적용한 참고치입니다. 3.3% 사업소득 원천징수로 처리되는 경우는 실제 수령액이 다릅니다.",
  },
];

const structuredData = [
  datasetLd({
    name: "2027년 주급 실수령액 표",
    description:
      "2027년 국민연금 5.0% 인상을 반영한 주급 구간별 월 환산 실수령액 데이터 표 (미확정 요율은 2026 준용).",
    url: "/table/2027/weekly",
    dateModified: "2026-08-30",
    keywords: ["2027 주급", "실수령액", "주급 환산", "주급 테이블", "2027년"],
  }),
  autoBreadcrumbLd("/table/2027/weekly", { leafName: "2027 주급 실수령액 표" }),
  faqLd(FAQ_ITEMS),
];

function WeeklyTable2027() {
  const allData = generateWeeklyPayTableData2027();
  const highlightRows = [500000, 1000000, 1500000, 2000000];

  return (
    <>
      <JsonLd data={structuredData} />
      <main className="w-full bg-background">
        <TableHero
          badgeText="2027 연금 인상 선반영"
          title={
            <>
              2027 주급 실수령액 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                미리보기
              </span>
            </>
          }
          description={
            <>
              주급 × 52주 ÷ 12개월 환산 기준. <br className="hidden sm:block" />
              국민연금 인상(5.0%)까지 반영한 내년 세후 수령액을 미리 확인하세요.
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

        {/* 광고 배치 — 2026 표와 동일 복제 (운영자 승인 2026-08-30) */}
        <CalcResultAd />

        <div className="w-full py-16">
          <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              2027년 주급, 무엇이 달라지나
            </h2>
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">확정 변경</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>- 최저시급 {fmtWon(MIN_WAGE_2027)}원 (+3.7%)</li>
                    <li>- 국민연금 근로자 5.0% (4.75%에서 인상)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">미확정 (2026 준용)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>- 건강보험·장기요양 요율 (통상 9~11월 결정)</li>
                    <li>- 간이세액표(소득세) — 변경 예고 없음</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              주급에 대한 궁금증 (Q&A)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">Q. 주휴수당은 주급에 포함해야 하나요?</h3>
                <p className="text-muted-foreground">
                  1주 15시간 이상 근무하고 개근하면 주휴수당(1일분)이 발생합니다. 받은 주급에 주휴가
                  이미 포함돼 있는지 근로계약서를 확인하고, 시급 기준으로 따져보려면 시급 표를
                  이용하세요.
                </p>
                <Link href="/table/2027/hourly" className="text-primary font-semibold mt-4 inline-block">
                  2027 시급 실수령액 표 →
                </Link>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">Q. 연금 인상으로 얼마나 더 떼이나요?</h3>
                <p className="text-muted-foreground">
                  월 환산 소득의 0.25%p입니다. 월 300만원이면 매달 7,500원, 연 9만원을 더 냅니다. 내
                  소득 기준 정확한 금액은 국민연금 인상 계산기에서 확인하세요.
                </p>
                <Link href="/calc/pension-hike-2027" className="text-primary font-semibold mt-4 inline-block">
                  국민연금 인상 계산기 →
                </Link>
              </div>
            </div>
          </section>
          {/* 가시 FAQ + FAQPage 스키마 쌍 */}
          <section className="mt-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-black text-navy mb-6">자주 묻는 질문</h2>
              <div className="space-y-6">
                {FAQ_ITEMS.map((item) => (
                  <div key={item.question}>
                    <h3 className="font-bold text-navy mb-2">Q. {item.question}</h3>
                    <p className="text-faint-blue leading-relaxed text-sm faq-answer">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Display2 — 2026 표와 동일 배치 복제 (운영자 승인 2026-08-30) */}
          <div className="mt-10 px-4 sm:px-6">
            <Display2Ad />
          </div>

          <SeasonalLinks className="px-4 sm:px-6" />

          <div className="mt-6 flex justify-center">
            <FavoritesButton path="/table/2027/weekly" title="2027 주급 실수령액 표" />
          </div>
        </div>
      </main>
    </>
  );
}

export default function WeeklyTable2027Page() {
  return <WeeklyTable2027 />;
}
