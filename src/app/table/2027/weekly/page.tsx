// src/app/table/2027/weekly/page.tsx — 2027년판 주급 실수령액 표 (2026-08-30 신설, 성장 제안 ④)
// 엔진: generateData2027 (연금 5.0%·건강보험 3.595% 적용, 장기요양·고용보험 2026값 준용; 확정 상태의 출처는 taxConstants2027 참조)

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
import { CITATION_POLICY_URL } from "@/lib/citationPolicy";
import SalaryTable from "@/components/SalaryTable";

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
      "주급 × 52주 ÷ 12개월로 환산합니다. 예를 들어 주급 100만원이면 연 5,200만원, 월 약 433만원(세전)입니다. 본 표는 이 환산 월급에서 2027년 국민연금 5.0%·건강보험 3.595%(이 표 적용 요율)와 장기요양·고용보험·소득세(2026 기준 준용)를 공제한 참고치입니다.",
  },
  {
    question: "2027년 최저임금 기준 주급은 얼마인가요?",
    answer:
      `2027년 최저시급 ${fmtWon(MIN_WAGE_2027)}원 기준, 주 40시간 + 주휴 8시간 = 주 48시간분을 적용하면 최저 주급은 세전 ${fmtWon(MIN_WAGE_2027 * 48)}원입니다.`,
  },
  {
    question: "주급제도 4대보험과 세금을 공제하나요?",
    answer:
      "고용 형태와 근로시간·기간 등 보험별 가입 요건에 따라 다릅니다. 본 표는 일반 근로소득자의 공제 모형으로, 개별 가입 제외 조건은 따로 확인해야 합니다. 사업소득으로 처리된 소득은 소득 구분과 원천징수 방식이 달라 이 표와 직접 비교할 수 없습니다.",
  },
];

const structuredData = [
  datasetLd({
    name: "2027년 주급 실수령액 표",
    description:
      "2027년 국민연금 5.0% 인상을 반영한 주급 구간별 월 환산 실수령액 데이터 표 (건강보험 3.595% 적용, 장기요양·고용보험은 2026 준용).",
    url: "/table/2027/weekly",
    dateModified: "2026-09-25",
    keywords: ["2027 주급", "실수령액", "주급 환산", "주급 테이블", "2027년"],
    // 인용 정책 URL (승인 A23, 2026-09-25 — GSC Dataset license 경고 해소)
    license: CITATION_POLICY_URL,
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

        {/* fallback 은 서버에서 렌더한 실제 표다. WeeklyTableInteractive 는 useSearchParams 를
          쓰므로 CSR 바일아웃이 일어나 프리렌더 HTML 에서 통째로 빠지는데,
          fallback 이 "Loading..." 이면 크롤러·저사양 클라이언트가 받는 정적
          HTML 에 표 데이터가 0행이 된다(2026-09-06 전수검사: annual·monthly 는
          354개 행 링크, weekly·hourly 는 0개). 같은 SalaryTable 을 fallback 으로
          두면 하이드레이션 전에도 표가 보이고 색인 대상 본문이 생긴다. */}
        <Suspense
          fallback={
            <SalaryTable
              headers={tableHeaders}
              data={allData.slice(0, 100)}
              highlightRows={highlightRows}
              linkColumnBaseHref="/salary"
              linkValueMultiplier={52}
            />
          }
        >
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
                    {/* 건보 동결은 기존 연금 항목에 합쳐 항목 수 유지 — 아래 표·광고를 밀지 않게 (2026-09-25) */}
                    <li>- 국민연금 5.0%(법정 인상 일정 적용)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-center">이 표의 준용·적용 요율</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>- 건강보험 3.595% 적용, 장기요양·고용보험 2026값 준용</li>
                    <li>- 소득세 — 현행 근로소득 간이세액표 준용</li>
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
                  4주 평균 1주 소정근로시간 15시간 이상이고 소정근로일을 개근하는 등 요건을 충족하면 주휴수당이 발생합니다. 받은 주급에 주휴가
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
                  국민연금 기준소득월액의 0.25%p입니다. 기준소득월액 300만원이면 월 7,500원, 연 9만원이 늘어나는 예시입니다. 비과세액과 상·하한 적용에 따라 달라지므로 내
                  소득 조건의 비교는 국민연금 인상 계산기에서 확인하세요.
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
