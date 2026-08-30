// src/app/table/2027/monthly/page.tsx — 2027년판 월급 실수령액 표 (2026-08-30 신설, 성장 제안 ④)
// 엔진: generateData2027 (연금 5.0% 확정 + 미확정 요율 2026 준용 — layout 고지 배너 참조)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { generateAnnualSalaryTableData2027, MIN_WAGE_2027, MIN_WAGE_2027_MONTHLY } from "@/lib/generateData2027";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";
import { CalcResultAd, Display2Ad } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, datasetLd, faqLd } from "@/lib/structuredData";
import SeasonalLinks from "../../2026/SeasonalLinks";
import FavoritesButton from "@/components/FavoritesButton";

const fmtWon = (n: number) => n.toLocaleString("ko-KR");

export const metadata: Metadata = buildPageMetadata({
  title: "2027 월급 실수령액 표 — 최저임금 223.6만원·연금 5% 인상 반영",
  description:
    "2027년 최저임금 월 2,236,300원(시급 10,700원) 확정, 국민연금 요율 5.0% 인상. 내년 기준 월급 200만~1,600만원 전 구간 세후 수령액과 2026년 대비 변화를 미리 확인하세요.",
  path: "/table/2027/monthly",
  keywords: [
    "2027 월급 실수령액",
    "2027 월급 실수령액 표",
    "내년 월급 실수령액",
    "2027 최저월급",
    "2027 세후 월급",
    "국민연금 인상 월급",
  ],
});

const tableHeaders = [
  { key: "monthlyPreTax", label: "월급 (세전)" },
  { key: "monthlyNet", label: "월 실수령액" },
  { key: "changeValue", label: "변화값 (2026比)" },
  { key: "totalDeduction", label: "공제총액" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const FAQ_ITEMS = [
  {
    question: "2027년 최저임금 월급은 얼마인가요?",
    answer:
      `2027년 최저시급은 ${fmtWon(MIN_WAGE_2027)}원으로 확정됐습니다(고용노동부 고시, +3.7%). 주휴수당 포함 월 209시간 기준 세전 ${fmtWon(MIN_WAGE_2027_MONTHLY)}원이며, 여기서 4대보험과 소득세를 공제한 금액이 실수령액입니다.`,
  },
  {
    question: "같은 월급이면 2027년 실수령액이 왜 줄어드나요?",
    answer:
      "2027년 1월부터 국민연금 요율이 근로자 4.75%에서 5.0%로 오르기 때문입니다. 월급 300만원 기준 매달 약 7,500원을 더 내게 됩니다. 표의 '변화값(2026比)' 열이 이 감소분입니다. 건강보험 등 미확정 요율이 추가 인상되면 감소폭이 조금 더 커질 수 있습니다.",
  },
  {
    question: "이 표는 확정 수치인가요?",
    answer:
      "국민연금 5.0%와 최저임금은 확정, 건강보험·장기요양·간이세액표는 2027년분 미발표라 2026년 기준을 준용한 예상표입니다. 확정 발표 시 즉시 갱신하며, 올해 확정 기준은 2026 월급 실수령액 표에서 볼 수 있습니다.",
  },
  {
    question: "연봉 기준으로 보려면 어디로 가나요?",
    answer:
      "상단 탭의 '연봉'에서 2027 연봉 실수령액 표를 볼 수 있습니다. 본 표는 연봉의 1/12을 세전 월급으로 환산한 값이므로, 상여금이 별도인 회사는 실제 월 수령액과 다를 수 있습니다.",
  },
];

const monthlyJsonLd = [
  datasetLd({
    name: "2027년 월급별 실수령액 데이터",
    description:
      "2027년 국민연금 5.0% 인상·최저임금 확정을 반영한 월급 구간별 실수령액과 4대보험 공제 내역 데이터셋 (미확정 요율은 2026 준용)",
    url: "/table/2027/monthly",
    dateModified: "2026-08-30",
    keywords: ["2027 월급", "실수령액", "세후 월급", "최저임금 2027", "2027년"],
  }),
  faqLd(FAQ_ITEMS),
  autoBreadcrumbLd("/table/2027/monthly", { leafName: "2027 월급 실수령액 표" }),
];

function MonthlyTable2027() {
  const rawData = generateAnnualSalaryTableData2027();
  const allData = rawData.map((d) => ({
    ...d,
    monthlyPreTax: Math.floor(d.preTax / 12),
  }));

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <JsonLd data={monthlyJsonLd} />
      <TableHero
        badgeText="2027 최저임금·연금 인상 선반영"
        title={
          <>
            2027 월급 실수령액 <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 whitespace-nowrap">
              미리보기
            </span>
          </>
        }
        description={
          <>
            2027년 최저월급은 <span className="text-primary font-bold">{fmtWon(MIN_WAGE_2027_MONTHLY)}원</span>
            (시급 {fmtWon(MIN_WAGE_2027)}원)입니다.
            <br />
            연금 인상까지 반영한 내년 세후 월급을 미리 확인해보세요.
          </>
        }
      />

      <div className="page-width -mt-20 relative z-10">
        <SalaryTable
          headers={tableHeaders}
          data={allData}
          linkColumnBaseHref="/salary"
          linkValueKey="preTax"
        />

        {/* 광고 배치 — 2026 표와 동일 복제 (운영자 승인 2026-08-30) */}
        <CalcResultAd />

        {/* SEO 텍스트 콘텐츠 */}
        <section className="mt-12 mb-8 max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC" }}
          >
            <h2 className="text-2xl font-black text-navy mb-4">2027년 월급, 이렇게 달라집니다</h2>
            <p className="text-faint-blue leading-relaxed mb-4">
              <strong className="text-navy">최저시급 {fmtWon(MIN_WAGE_2027)}원(+3.7%)</strong> —
              주휴수당 포함 월 209시간 기준 세전 {fmtWon(MIN_WAGE_2027_MONTHLY)}원으로, 최저임금
              근로자의 세전 월급이 올해보다 약 8만원 오릅니다. 반면{" "}
              <strong className="text-navy">국민연금 요율은 근로자 5.0%로 인상</strong>되어 같은
              월급이라면 공제가 늘어납니다.
            </p>
            <p className="text-faint-blue leading-relaxed mb-4">
              건강보험·장기요양 요율과 간이세액표는 2027년분 발표 전이라 2026년 기준을
              준용했습니다. 내 월급의 연금 인상 부담만 따로 보려면{" "}
              <Link href="/calc/pension-hike-2027" className="text-electric font-bold hover:underline">
                국민연금 인상 계산기
              </Link>
              를, 2027 최저임금 상세는{" "}
              <Link href="/minimum-wage-2027" className="text-electric font-bold hover:underline">
                2027 최저임금 총정리
              </Link>
              를 확인하세요.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-8 max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC" }}
          >
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
        <div className="mt-10">
          <Display2Ad />
        </div>

        <SeasonalLinks />

        <div className="mt-6 flex justify-center">
          <FavoritesButton path="/table/2027/monthly" title="2027 월급 실수령액 표" />
        </div>

        <div className="mt-4 text-center text-faint-blue text-sm pb-8">
          * 비과세 식대 월 20만원·본인 1인 공제 기준. 국민연금 5.0%·최저임금은 확정,
          건강보험·간이세액표는 2026 기준 준용(확정 시 갱신). 각 행의 상세 페이지는 2026년
          기준입니다.
        </div>
      </div>
    </main>
  );
}

export default function MonthlyTable2027Page() {
  return <MonthlyTable2027 />;
}
