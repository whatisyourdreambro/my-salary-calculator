// src/app/table/2027/hourly/page.tsx — 2027년판 시급 실수령액 표 (2026-08-30 신설, 성장 제안 ④)
// 2027 최저시급 10,700원 확정 반영 — 엔진: generateData2027

import { Suspense } from "react";
import { generateHourlyWageTableData2027, MIN_WAGE_2027, MIN_WAGE_2027_MONTHLY } from "@/lib/generateData2027";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "@/components/AppLink";
import HourlyTableInteractive from "./HourlyTableInteractive";
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
  title: "2027 시급 실수령액 표 — 최저시급 10,700원 확정, 월 환산 세후 금액",
  description:
    "2027년 최저시급 10,700원(+3.7%) 확정. 시급 9,500~50,000원 구간별 주휴수당 포함 월 209시간 환산 실수령액을 국민연금 5.0% 인상까지 반영해 미리 확인하세요. 알바·파트타임 내년 월급 계산.",
  path: "/table/2027/hourly",
  keywords: [
    "2027 최저시급",
    "2027 시급 실수령액",
    "최저시급 10700원",
    "2027 최저임금 월급",
    "시급 월급 환산 2027",
    "알바 월급 2027",
  ],
});

const tableHeaders = [
  { key: "preTax", label: "시급" },
  { key: "monthlyNet", label: "월 예상 실수령액" },
  { key: "totalDeduction", label: "월 공제액 합계" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const FAQ_ITEMS = [
  {
    question: "2027년 최저시급은 얼마인가요?",
    answer:
      `2027년 최저시급은 ${fmtWon(MIN_WAGE_2027)}원으로 확정 고시됐습니다(2026년 10,320원 대비 +380원, +3.7%). 주 40시간 근무 시 주휴수당 포함 월 환산액(209시간)은 세전 ${fmtWon(MIN_WAGE_2027_MONTHLY)}원입니다.`,
  },
  {
    question: "표의 실수령액은 어떤 기준인가요?",
    answer:
      "시급 × 209시간(주휴 포함)을 세전 월급으로 환산한 뒤 2027년 국민연금 5.0%(확정 인상)와 건강보험·고용보험·소득세(2026 기준 준용)를 공제한 참고치입니다. 근로 시간이 짧아 4대보험 가입 대상이 아니거나 3.3% 원천징수로 처리되는 알바는 실제 수령액이 다를 수 있습니다.",
  },
  {
    question: "주휴수당은 누구나 받나요?",
    answer:
      "1주 15시간 이상 근무하고 개근하면 주휴수당이 발생합니다. 주 40시간 기준 월 환산 209시간에는 주휴가 포함돼 있으며, 15시간 미만 근무는 주휴수당 대상이 아니므로 시급 × 실제 근무시간으로 계산해야 합니다.",
  },
];

const structuredData = [
  datasetLd({
    name: "2027년 시급 실수령액 표",
    description:
      "2027년 최저시급 10,700원 확정과 국민연금 5.0% 인상을 반영한 시급 구간별 월 환산 실수령액 데이터 표 (미확정 요율은 2026 준용).",
    url: "/table/2027/hourly",
    dateModified: "2026-08-30",
    keywords: ["2027 시급", "최저시급", "실수령액", "시급 테이블", "2027년"],
  }),
  autoBreadcrumbLd("/table/2027/hourly", { leafName: "2027 시급 실수령액 표" }),
  faqLd(FAQ_ITEMS),
];

function HourlyTable2027() {
  const allData = generateHourlyWageTableData2027();
  const highlightRows = [MIN_WAGE_2027, 12000, 15000, 20000];

  return (
    <>
      <JsonLd data={structuredData} />
      <main className="w-full bg-background">
        <TableHero
          badgeText="2027 최저시급 확정 반영"
          title={
            <>
              2027 시급 실수령액 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                미리보기
              </span>
            </>
          }
          description={
            <>
              2027년 최저시급은 <strong>{fmtWon(MIN_WAGE_2027)}원</strong>으로 확정됐습니다.{" "}
              <br className="hidden sm:block" />
              주휴수당 포함 월 209시간 기준, 내년 내 시급의 월 환산 실수령액을 미리 확인하세요.
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

        {/* 광고 배치 — 2026 표와 동일 복제 (운영자 승인 2026-08-30) */}
        <CalcResultAd />

        <div className="w-full py-16">
          <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              2026년 vs 2027년 최저시급 비교
            </h2>
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <p className="text-center text-muted-foreground">
                2027년 최저임금이 {fmtWon(MIN_WAGE_2027)}원으로 확정 고시됐습니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">2026년</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>- 최저시급: 10,320원</li>
                    <li>- 월 환산액: 2,156,880원</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">2027년 (확정)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      - 최저시급:{" "}
                      <span className="font-semibold text-primary">{fmtWon(MIN_WAGE_2027)}원 (+3.7%)</span>
                    </li>
                    <li>
                      - 월 환산액:{" "}
                      <span className="font-semibold text-primary">{fmtWon(MIN_WAGE_2027_MONTHLY)}원</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              2027 시급 궁금증 (Q&A)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">Q. 최저임금 인상으로 월급이 얼마나 오르나요?</h3>
                <p className="text-muted-foreground">
                  주 40시간 기준 세전 월 환산액이 2,156,880원에서 {fmtWon(MIN_WAGE_2027_MONTHLY)}원으로
                  약 79,420원 오릅니다. 다만 국민연금 요율 인상(4.75→5.0%)으로 공제도 함께 늘어나므로,
                  실수령 증가분은 이보다 조금 작습니다.
                </p>
                <Link href="/minimum-wage-2027" className="text-primary font-semibold mt-4 inline-block">
                  2027 최저임금 10,700원 총정리 →
                </Link>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                <h3 className="font-bold text-xl mb-3">Q. 알바도 4대보험에 가입해야 하나요?</h3>
                <p className="text-muted-foreground">
                  월 60시간 이상 근무하는 아르바이트생은 4대보험 의무 가입 대상입니다. 다만 국민연금과
                  건강보험은 조건에 따라 제외될 수 있고, 3.3% 사업소득 원천징수로 처리되는 경우도
                  있습니다.
                </p>
                <Link href="/?tab=freelancer" className="text-primary font-semibold mt-4 inline-block">
                  프리랜서/알바 계산기 바로가기 →
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
            <FavoritesButton path="/table/2027/hourly" title="2027 시급 실수령액 표" />
          </div>
        </div>
      </main>
    </>
  );
}

export default function HourlyTable2027Page() {
  return <HourlyTable2027 />;
}
