// src/app/table/2027/annual/page.tsx — 2027년판 연봉 실수령액 표 (2026-08-30 신설, 성장 제안 ④)
// 엔진: generateData2027 (연금 5.0%·건강보험 3.595% 적용, 장기요양·고용보험 2026값 준용; 확정 상태의 출처는 taxConstants2027 참조)
// ★갱신 슬롯: 2027-01-01 next.config /table/annual redirect 를 2027로 교체

import { Metadata } from "next";
import { generateAnnualSalaryTableData2027 } from "@/lib/generateData2027";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";
import { CalcResultAd, Display2Ad } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, datasetLd, faqLd } from "@/lib/structuredData";
import { CITATION_POLICY_URL } from "@/lib/citationPolicy";
import SeasonalLinks from "../../2026/SeasonalLinks";
import FavoritesButton from "@/components/FavoritesButton";

export const metadata: Metadata = buildPageMetadata({
  title: "2027 연봉 실수령액 표 — 국민연금 5% 인상 반영, 전 구간 세후 월급",
  description:
    "2027년 1월부터 국민연금 요율이 근로자 5.0%로 오릅니다. 인상분을 반영한 연봉 2400만~2억 전 구간 세후 월급과 2026년 대비 감소액을 미리 확인하세요. 최저임금 10,700원 확정 반영.",
  path: "/table/2027/annual",
  keywords: [
    "2027 연봉 실수령액",
    "2027 연봉 실수령액 표",
    "내년 연봉 실수령액",
    "2027 세후 월급",
    "국민연금 인상 실수령액",
    "2027 연봉 계산기",
  ],
});

const tableHeaders = [
  { key: "preTax", label: "연봉" },
  { key: "monthlyNet", label: "2027 예상 월 실수령" },
  { key: "changeValue", label: "연금 요율 비교 (2026比)" },
  { key: "totalDeduction", label: "공제총액" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험·장기요양" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세·지방세" },
];

const FAQ_ITEMS = [
  {
    question: "2027년에는 같은 연봉이어도 실수령액이 줄어드나요?",
    answer:
      "이 표의 적용 조건에서는 국민연금 근로자 요율이 4.75%에서 5.0%로 올라 같은 급여의 예상 실수령액이 줄어듭니다. 연봉 5,000만원 예시의 연금 부담 증가는 월 약 1만원입니다. 연금 요율 비교 열은 같은 계산 모형에서 요율만 비교하며 실제 급여명세 차이와 다를 수 있습니다.",
  },
  {
    question: "이 표의 2027년 수치는 확정인가요?",
    answer:
      "이 표는 국민연금 근로자 5.0%와 건강보험 3.595%를 적용하고 장기요양·고용보험은 2026년 값을 준용합니다. 소득세도 2026년 근로소득 간이세액표를 사용한 월 원천징수 추정치입니다. 실제 2027년 지급액은 당시 확정 요율·급여 조건·세액표·정산에 따라 달라질 수 있으므로 해당 시점 공식 기준을 확인하세요.",
  },
  {
    question: "국민연금을 더 내면 나중에 더 받나요?",
    answer:
      "보험료율 인상과 소득대체율은 서로 다른 항목입니다. 보험료를 더 낸 비율만큼 연금액이 그대로 늘어난다고 볼 수 없으며, 실제 연금액은 가입 기간과 기준소득월액 기록 등 지급 요건에 따라 달라집니다. 내 급여의 공제 증가분은 국민연금 인상 계산기에서 비교할 수 있습니다.",
  },
  {
    question: "2026년 표와 어떤 점이 다른가요?",
    answer:
      "계산 기준(비과세 식대 월 20만원·본인 1인 공제)과 표 구간은 동일하고, 국민연금 요율만 4.75%에서 5.0%로 바뀌었습니다. 각 행의 링크로 들어가는 상세 페이지는 2026년 기준이므로 연금 항목이 소폭 다를 수 있습니다.",
  },
];

const tableJsonLd = [
  datasetLd({
    name: "2027년 연봉별 실수령액 데이터",
    description:
      "2027년 국민연금 5.0%를 적용한 연봉 2400만원~2억원 구간의 월 실수령 추정·공제 데이터셋 (건강보험 3.595% 적용, 장기요양·고용보험·간이세액표는 2026년 기준 준용)",
    url: "/table/2027/annual",
    dateModified: "2026-09-25",
    keywords: ["2027 연봉", "실수령액", "세후 월급", "국민연금 인상", "2027년"],
    // 인용 정책 URL (승인 A23, 2026-09-25 — GSC Dataset license 경고 해소)
    license: CITATION_POLICY_URL,
  }),
  autoBreadcrumbLd("/table/2027/annual", { leafName: "2027 연봉 실수령액 표" }),
  faqLd(FAQ_ITEMS),
];

function AnnualTable2027() {
  const allData = generateAnnualSalaryTableData2027();
  const highlightRows = [26000000, 30000000, 50000000, 80000000, 100000000];

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <JsonLd data={tableJsonLd} />
      <TableHero
        badgeText="2027 국민연금 5.0% 인상 선반영"
        title={
          <>
            2027 연봉 실수령액 <br className="sm:hidden" />
            <span className="text-electric whitespace-nowrap">미리보기</span>
          </>
        }
        description={
          <>
            내년 1월부터 국민연금 요율이 오릅니다. <br className="hidden sm:block" />
            같은 연봉으로 2027년에 받게 될 세후 월급과 올해 대비 감소액을 미리 확인하세요.
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

        {/* 광고 배치 — 2026 표와 동일 복제 (운영자 승인 2026-08-30) */}
        <CalcResultAd />

        {/* SEO 텍스트 콘텐츠 */}
        <section className="mt-12 mb-8 max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC" }}
          >
            <h2 className="text-2xl font-black text-navy mb-4">
              2027년, 내 월급에서 무엇이 달라지나
            </h2>
            <p className="text-faint-blue leading-relaxed mb-4">
              2027년 1월 1일부터 <strong className="text-navy">국민연금 보험료율이 총
              10.0%(근로자 5.0%)</strong>로 오릅니다. 2025년 연금개혁으로 법에 명시된
              인상 스케줄(매년 +0.5%p, 2033년 13% 도달)의 두 번째 해입니다. 회사가 절반을
              부담하므로 근로자 몫은 월 소득의 5.0%이며, 기준소득월액 상한(659만원,
              2027년 6월까지)을 넘는 소득에는 부과되지 않습니다.
            </p>
            <p className="text-faint-blue leading-relaxed mb-4">
              <strong className="text-navy">최저임금은 시급 10,700원(+3.7%)으로 확정</strong>돼
              월 209시간 기준 2,236,300원입니다. 이 표는 건강보험 근로자 3.595%를 적용하고, 장기요양·고용보험과 간이세액표는 2026년 기준을 준용합니다.
              <strong className="text-navy">연금 요율 비교(2026比)</strong>는 같은 계산 모형에서 연금 요율만 바꾼 값입니다.
              2026년 표시 표와는 원 단위 처리 방식이 달라 두 표의 월 실수령액을 직접 뺀 결과와 소액 차이가 날 수 있습니다.
            </p>
          </div>
        </section>

        {/* FAQ */}
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

        {/* Display2 — 2026 표와 동일 배치 복제 (실험 #1 계열, 운영자 승인 2026-08-30) */}
        <div className="mt-10">
          <Display2Ad />
        </div>

        {/* 시즌 크로스링크 — 2026 세트 공유 */}
        <SeasonalLinks />

        <div className="mt-6 flex justify-center">
          <FavoritesButton path="/table/2027/annual" title="2027 연봉 실수령액 표" />
        </div>

        <div className="mt-4 text-center text-faint-blue text-sm pb-8">
          * 월 비과세 20만원·본인 1명·자녀 0명 기준. 국민연금 5.0%·건강보험 3.595% 적용, 장기요양·고용보험·근로소득 간이세액표는 2026년 기준 준용입니다.
          실제 지급액은 당시 공식 기준과 급여 정산 조건에 따라 달라질 수 있습니다. 각 행의 상세 페이지는 2026년 기준입니다.
        </div>
      </div>
    </main>
  );
}

export default function AnnualTable2027Page() {
  return <AnnualTable2027 />;
}
