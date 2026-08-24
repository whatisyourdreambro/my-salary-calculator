
// src/app/table/2026/annual/page.tsx

import { Metadata } from "next";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";
import { CalcResultAd, Display2Ad } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, datasetLd, faqLd } from "@/lib/structuredData";
import SeasonalLinks from "../SeasonalLinks";
import FavoritesButton from "@/components/FavoritesButton";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 연봉 실수령액 표 — 2400만~2억 전 구간 세후 월급 한눈에",
  description:
    "연봉 3000만원이면 월 약 220만원, 5000만원이면 약 348만원, 1억이면 약 643만원. 2026년 최신 세법 기준 4대보험·소득세 자동 공제와 전년 대비 변화액까지 즉시 확인.",
  path: "/table/2026/annual",
  keywords: [
    "연봉 실수령액 표",
    "2026 연봉 계산기",
    "연봉별 실수령액",
    "세후 월급 표",
    "연봉 3000 실수령액",
    "연봉 4000 실수령액",
    "연봉 5000 실수령액",
    "연봉 6000 실수령액",
    "연봉 7000 실수령액",
    "연봉 1억 실수령액",
    "연봉 8000 실수령액",
    "4대보험 공제액",
    "2026 세법",
  ],
});

const tableHeaders = [
  { key: "preTax", label: "연봉" },
  { key: "monthlyNet", label: "2026 예상 월 실수령" },
  { key: "changeValue", label: "변화값 (전년비)" },
  { key: "totalDeduction", label: "공제총액" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

// FAQ — monthly 표가 이미 쓰는 패턴을 연봉 축으로 신설 (2026-08-24 JSON-LD 보강).
// 수치는 본문 SEO 섹션(연봉 3천 220만·5천 348만·1억 643만, 요율 4.75%/3.595%)과 동일 소스.
const FAQ_ITEMS = [
  {
    question: "연봉 5000만원의 월 실수령액은 얼마인가요?",
    answer:
      "2026년 최신 세법 기준 월 약 348만원입니다. 부양가족이 없는 1인 직장인 기준이며, 비과세 식대 포함 여부와 부양가족 수에 따라 달라질 수 있습니다. 위 표에서 전 구간을 확인하세요.",
  },
  {
    question: "연봉에서 공제되는 항목은 무엇인가요?",
    answer:
      "국민연금 4.75%, 건강보험 3.595%, 장기요양보험(건강보험료의 13.14%), 고용보험 0.9%가 공제되고, 여기에 근로소득 간이세액표 기준 소득세와 소득세의 10%인 지방소득세가 추가로 공제됩니다.",
  },
  {
    question: "2026년에는 같은 연봉인데 왜 실수령액이 줄어드나요?",
    answer:
      "2026년에 국민연금 요율이 4.5%에서 4.75%로, 건강보험 요율이 3.545%에서 3.595%로 인상되어 동일 연봉이라도 전년 대비 실수령액이 소폭 감소합니다. 감소폭은 표의 변화값(전년비) 항목에서 확인할 수 있습니다.",
  },
  {
    question: "연봉 1억이면 월 실수령액은 얼마인가요?",
    answer:
      "2026년 기준 월 약 643만원입니다. 연봉 1억은 최고 구간 세율이 아니라 8단계 누진세율 구간을 차례로 통과한 결과이며, 연금저축·IRP 세액공제 등 공제 항목에 따라 실제 금액은 달라질 수 있습니다.",
  },
];

// JSON-LD for table page — datasetLd 빌더로 dateModified(신선도 신호) 부여 + breadcrumb
const tableJsonLd = [
  datasetLd({
    name: "2026년 연봉별 실수령액 데이터",
    description:
      "2026년 최신 세법 기준 연봉 2000만원에서 2억까지 구간별 월 실수령액, 4대보험 공제 내역 데이터셋",
    url: "/table/2026/annual",
    dateModified: "2026-08-24",
    keywords: ["연봉", "실수령액", "세후 월급", "연봉 테이블", "2026년"],
  }),
  faqLd(FAQ_ITEMS),
  autoBreadcrumbLd("/table/2026/annual", { leafName: "2026 연봉 실수령액 표" }),
];

function AnnualTable() {
  const allData = generateAnnualSalaryTableData2026();
  const highlightRows = [26000000, 30000000, 50000000, 80000000, 100000000];

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <JsonLd data={tableJsonLd} />
      <TableHero
        badgeText="2026년 최신 데이터 반영"
        title={
          <>
            2026 연봉 실수령액 <br className="sm:hidden" />
            <span className="text-electric whitespace-nowrap">
              대백과
            </span>
          </>
        }
        description={
          <>
            당신의 진짜 가치를 숫자로 확인하세요. <br className="hidden sm:block" />
            2026년 최신 세법 기준, 연봉 구간별 상세 공제 내역과 실수령액을 한눈에 비교해 드립니다.
          </>
        }
      />

      <div className="page-width -mt-20 relative z-10">
        <SalaryTable
          headers={tableHeaders}
          data={allData}
          highlightRows={highlightRows}
          linkColumnBaseHref="/salary"
        />

        {/* 운영자 승인 광고 배치(2026-07-07): 177행 표와 SEO 본문 사이 — 표 전 구간 무광고였음 */}
        <CalcResultAd />

        {/* SEO 텍스트 콘텐츠 — 체류시간 + 검색엔진 */}
        <section className="mt-12 mb-8 max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC" }}
          >
            <h2 className="text-2xl font-black text-navy mb-4">
              2026년 연봉 실수령액이란?
            </h2>
            <p className="text-faint-blue leading-relaxed mb-4">
              연봉 실수령액은 세전 연봉에서 <strong className="text-navy">국민연금(4.75%)</strong>,{" "}
              <strong className="text-navy">건강보험(3.595%)</strong>,{" "}
              <strong className="text-navy">장기요양보험(건강보험료의 13.14%)</strong>,{" "}
              <strong className="text-navy">고용보험(0.9%)</strong>, 그리고{" "}
              <strong className="text-navy">소득세(근로소득 간이세액표 기준)</strong>를
              공제하고 실제로 받는 금액입니다.
            </p>
            <p className="text-faint-blue leading-relaxed mb-4">
              2026년에는 국민연금(4.5→4.75%)·건강보험(3.545→3.595%) 요율이 인상되어, 동일 연봉이라도
              전년 대비 실수령액이 소폭 감소합니다. 위 표의{" "}
              <strong className="text-navy">변화값(전년비)</strong> 항목에서 감소폭을
              확인하세요.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {/* 수치는 generateData2026(정식 엔진) 결과와 동기 — 2026-08-24 엔진 통일 시 갱신 */}
              {[
                { label: "연봉 3천만원", monthly: "약 220만원" },
                { label: "연봉 5천만원", monthly: "약 348만원" },
                { label: "연봉 7천만원", monthly: "약 472만원" },
                { label: "연봉 1억원",  monthly: "약 643만원" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-4 rounded-xl"
                  style={{ backgroundColor: "#EDF1F5" }}
                >
                  <div className="text-xs font-bold text-faint-blue mb-1">{item.label}</div>
                  <div className="text-lg font-black text-electric">월 {item.monthly}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — monthly 표와 동일 패턴 (FAQPage JSON-LD와 본문 정합, 2026-08-24) */}
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
                  <p className="text-faint-blue leading-relaxed text-sm">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 실험 #1 (docs/ad-experiments.md, 운영자 승인 2026-08-17): display-2 추가
            배치 — 본문(SEO 섹션)과 시즌 링크 사이. CalcResultAd와 1스크린+ 간격.
            env NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY_2 미설정 시 자동 미렌더. */}
        <div className="mt-10">
          <Display2Ad />
        </div>

        {/* 시즌 크로스링크 — 표 유입을 시즌 피크 페이지로 라우팅 (2026-07-16, 광고 슬롯과 무관한 본문 영역) */}
        <SeasonalLinks />

        {/* 즐겨찾기 락인 — 표는 "내 연봉 구간 다시 보기" 재방문 수요가 큼 (2026-08-17, 광고 아래 영역) */}
        <div className="mt-6 flex justify-center">
          <FavoritesButton path="/table/2026/annual" title="2026 연봉 실수령액 표" />
        </div>

        <div className="mt-4 text-center text-faint-blue text-sm pb-8">
          * 본 데이터는 2026년 예상 보험료율 인상안을 반영한 시뮬레이션 결과이며, 실제 확정치와 다를 수 있습니다.
        </div>
      </div>
    </main>
  );
}

export default function AnnualTablePage() {
  return <AnnualTable />;
}
