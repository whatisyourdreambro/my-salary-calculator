// /calc/holiday-bonus — 명절 상여금 세금 계산기 (시즌: 1~2월 설/9월 추석)

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import { CURRENT_RATES_YEAR, CURRENT_RATE_LABELS } from "@/config/currentRates";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import FavoritesButton from "@/components/FavoritesButton";
import RelatedCalculators from "@/components/RelatedCalculators";
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { Sparkles, Info } from "lucide-react";
import HolidayBonusClient from "./Client";
import { staticRouteLastModified } from "@/app/sitemap";

const FAQ_ITEMS = [
  {
    question: "명절 상여금에도 세금이 붙나요?",
    answer:
      "네, 명절 상여금(설·추석 보너스)도 근로소득에 포함되어 소득세와 4대보험이 부과됩니다. 회사가 명절에 일시 지급하더라도 정기 상여금으로 분류되면 4대보험 부과 대상이 되며, 비정기 일회성 격려금이라도 소득세는 동일하게 부과됩니다.",
  },
  {
    question: "명절 상여금이 비과세 처리되는 경우가 있나요?",
    answer:
      // SE-07(1) 2026-10-22: 법률명 오기 → 소득세법. 현물 선물 비과세 문장은 근거 없음 — 비과세 근로소득은
      // 소득세법 제12조 제3호 열거분뿐이고 명절 상여·선물은 없다(제20조 제1항 제1호 상여). 닫힌 FAQ, 높이 0.
      // 2026-11-02 RL-05 재확인: 조세특례제한법에도 비과세 특례(예: 제16조의2 벤처기업 주식매수선택권 행사이익)가 있어
      // 제12조 열거분만 비과세라는 단정은 지나치다 — '제12조 등 법에 열거된 항목뿐'으로 좁힌다(명절 상여가 목록에 없다는 결론은 같다).
      "소득세법상 명절 상여금에 따로 정해진 비과세 한도는 없습니다. 비과세 근로소득은 소득세법 제12조 등 법에 열거된 항목뿐이고 명절 상여는 그 목록에 없어, 현금뿐 아니라 상품권·현물 선물로 받아도 근로의 대가인 상여(소득세법 제20조)로 근로소득에 포함됩니다.",
  },
  {
    question: "100만원 미만이면 세금이 거의 안 붙는다고 들었는데요?",
    answer:
      "과세표준이 6% 구간인 저소득층은 근로소득세액공제(산출세액의 55%)까지 반영돼 소득세 부담이 작습니다. 예를 들어 연봉 2,400만원에 명절 상여금 100만원이면 소득세 약 2만원 + 지방세 약 2천원 + 4대보험 약 9.7만원으로 실수령 약 88만원, 연봉 9,000만원이면 실수령 약 71만원입니다. 본 계산기로 정확히 확인 가능합니다.",
  },
  {
    question: "명절 상여금 절세 방법은?",
    answer:
      "명절 상여금 자체의 절세는 어렵지만, 수령한 후 IRP에 추가 납입(연 900만 한도, 13.2~16.5% 세액공제)하면 환급액을 키울 수 있습니다. 또한 명절 직전에 의료비·기부금 등을 정리해 연말정산 공제를 늘리는 것도 방법입니다.",
  },
  {
    question: "비정규직·아르바이트도 명절 상여금에 세금이 붙나요?",
    answer:
      // SE-07(1) 2026-10-22: 일용근로소득 — 1일 15만원 공제(소득세법 제47조 제2항), 6% 뒤 55% 세액공제(제59조 제3항),
      // 원천징수세액 1천원 미만 소액부징수(제86조), 원천징수로 종결(분리과세). 국세청 일용근로소득 안내(mi=6584, cntntsId=7863).
      // 2026-11-02 RL-05 재확인: 같은 국세청 안내 — 소액부징수는 지급 건 기준이라 5일치 일당을 한 번에 주면 5일치 세액 합계로
      // 판단한다. 18만7천원 문장 뒤에 그 조건을 괄호로 붙인다.
      "네, 근로소득세는 근로 형태와 무관하게 부과됩니다. 일용직은 일당 15만원까지는 근로소득공제(소득세법 제47조 제2항)로 세금이 없고, 초과분에 6%를 곱한 뒤 55%를 세액공제(제59조 제3항)해 실제 2.7%(지방소득세 0.27% 별도)를 원천징수하며 분리과세로 끝납니다. 원천징수세액이 1천원 미만이면 떼지 않아(제86조) 일당 약 18만7천원 이하는 실제 원천징수가 없습니다(여러 날 일당을 한꺼번에 받으면 합친 세액으로 판단). 정규·계약직은 일반 근로소득과 동일하게 누진세율이 적용됩니다.",
  },
  // 7~8월 "여름휴가비" 시즌 쿼리 흡수 — 세금 구조가 명절 상여와 동일 (2026-07-06 감사)
  {
    question: "여름휴가비(하계휴가비)도 세금이 똑같이 붙나요?",
    answer:
      "네, 여름휴가비도 명절 상여금과 동일하게 근로소득으로 과세됩니다. 현금으로 지급되는 휴가비는 금액과 명칭(휴가비·하계상여·바캉스비)에 관계없이 소득세·지방소득세·4대보험 부과 대상이며, 이 계산기에 금액을 넣으면 실수령액이 그대로 계산됩니다.",
  },
  {
    question: "회사가 여름휴가비를 꼭 줘야 하나요?",
    answer:
      "법정 의무는 아닙니다. 여름휴가비는 근로기준법상 의무 지급 항목이 아니라 회사의 취업규칙·단체협약·근로계약에 지급 근거가 있을 때만 청구할 수 있습니다. 다만 취업규칙에 명시돼 있거나 관행적으로 전 직원에게 계속 지급해 왔다면 임금성이 인정되어 일방적으로 없애기 어렵습니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "명절·휴가비 상여금 세금 계산기",
  tagline: "설·추석 보너스와 여름휴가비 실수령액",
  description:
    "설·추석 명절 상여금과 여름휴가비의 세금·4대보험을 2026년 세법 기준으로 계산합니다. 한계세율별 실수령액 비교, 비과세 항목 안내, 지급 의무 여부까지.",
  path: "/calc/holiday-bonus",
  keywords: [
    "명절 상여금",
    "설 보너스",
    "추석 보너스",
    "명절 상여 세금",
    "명절 보너스 실수령",
    "설날 보너스 세금",
    "여름휴가비",
    "하계휴가비",
    "휴가비 세금",
    "휴가비 지급 의무",
  ],
});

export default function HolidayBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "명절 상여금 세금 계산기",
            description: "설·추석 명절 보너스 실수령액과 세금을 자동 계산합니다.",
            url: "/calc/holiday-bonus",
            dateModified: staticRouteLastModified("/calc/holiday-bonus"),
          }),
          autoBreadcrumbLd("/calc/holiday-bonus", { leafName: "명절 상여금 세금 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} /> 설·추석 시즌
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              명절 상여금 세금 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              설·추석 보너스 <strong className="text-electric">실수령액 즉시 계산</strong>
            </p>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <HolidayBonusClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              명절 상여금에 붙는 세금 종류
            </h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li><strong>소득세</strong>: 누진세율 6~45% (연봉 합산 기준)</li>
              <li><strong>지방소득세</strong>: 소득세의 10%</li>
              <li><strong>국민연금</strong>: {CURRENT_RATE_LABELS.pension} (연봉 7,908만원 상한, 2026.7~2027.6)</li>
              <li><strong>건강보험</strong>: {CURRENT_RATE_LABELS.health} + 장기요양 {CURRENT_RATE_LABELS.ltcOfIncome}</li>
              <li><strong>고용보험</strong>: {CURRENT_RATE_LABELS.employment}</li>
            </ul>

            {/* 본문 중간 광고 */}
            <GuideMidAd />

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              명절 상여금 vs 정기 보너스
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              회사가 명절 상여를 <strong>정기 상여금</strong>으로 분류하면 4대보험 부과 대상이 됩니다. 반면
              <strong> 비정기 격려금</strong>으로 분류하면 4대보험은 일부만(국민연금 제외) 부과될 수 있습니다.
              취업규칙에 명시된 정기 지급이라면 정기 상여로 봅니다.
            </p>
          </article>

          {/* 본문-FAQ 사이 광고 */}
          <InArticleAd />

          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={idx} className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group">
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}
                    <span className="text-electric group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산은 단일 직장 근로자 기준 {CURRENT_RATES_YEAR}년 세법으로 추정한 값입니다. 부양가족·비과세 항목 등에
              따라 실제 금액은 다를 수 있습니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/holiday-bonus" />
        </div>
      </main>
    </>
  );
}
