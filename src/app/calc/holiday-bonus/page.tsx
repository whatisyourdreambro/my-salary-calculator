// /calc/holiday-bonus — 명절 상여금 세금 계산기 (시즌: 1~2월 설/9월 추석)

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { Sparkles, Info } from "lucide-react";
import HolidayBonusClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "명절 상여금에도 세금이 붙나요?",
    answer:
      "네, 명절 상여금(설·추석 보너스)도 근로소득에 포함되어 소득세와 4대보험이 부과됩니다. 회사가 명절에 일시 지급하더라도 정기 상여금으로 분류되면 4대보험 부과 대상이 되며, 비정기 일회성 격려금이라도 소득세는 동일하게 부과됩니다.",
  },
  {
    question: "명절 상여금이 비과세 처리되는 경우가 있나요?",
    answer:
      "근로소득법상 명절 격려금이 일정 한도 내에서 비과세될 수는 없습니다. 다만 '복리후생 차원의 선물(쌀·식료품 등 현물)' 또는 '경조사비'로 지급되면 일정 부분 비과세될 수 있습니다. 현금 명절 상여금은 모두 과세 대상입니다.",
  },
  {
    question: "100만원 미만이면 세금이 거의 안 붙는다고 들었는데요?",
    answer:
      "한계세율이 6%인 저소득 구간이라면 명절 상여금 100만원의 소득세는 약 6만원 + 지방세 6천원 + 4대보험 약 9만원 정도로, 실수령 약 84만원 수준입니다. 한계세율이 24%이면 실수령은 약 70만원으로 내려갑니다. 본 계산기로 정확히 확인 가능합니다.",
  },
  {
    question: "명절 상여금 절세 방법은?",
    answer:
      "명절 상여금 자체의 절세는 어렵지만, 수령한 후 IRP에 추가 납입(연 900만 한도, 13.2~16.5% 세액공제)하면 환급액을 키울 수 있습니다. 또한 명절 직전에 의료비·기부금 등을 정리해 연말정산 공제를 늘리는 것도 방법입니다.",
  },
  {
    question: "비정규직·아르바이트도 명절 상여금에 세금이 붙나요?",
    answer:
      "네, 근로소득세는 근로 형태와 무관하게 부과됩니다. 일용직 근로자는 일당 18만원까지 비과세이지만, 그 초과분은 단일세율 6%(소득세) + 0.6%(지방세)로 분리과세됩니다. 정규·계약직은 일반 근로소득과 동일하게 누진세율이 적용됩니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "명절 상여금 세금 계산기",
  tagline: "설·추석 보너스 실수령액 — 소득세·4대보험 즉시 계산",
  description:
    "설·추석 명절 상여금의 세금과 4대보험을 2026년 세법 기준으로 계산합니다. 한계세율별 실수령액 비교, 비과세 항목 안내, 절세 팁까지.",
  path: "/calc/holiday-bonus",
  keywords: [
    "명절 상여금",
    "설 보너스",
    "추석 보너스",
    "명절 상여 세금",
    "명절 보너스 실수령",
    "설날 보너스 세금",
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
          </header>

          <HolidayBonusClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              명절 상여금에 붙는 세금 종류
            </h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li><strong>소득세</strong>: 누진세율 6~45% (연봉 합산 기준)</li>
              <li><strong>지방소득세</strong>: 소득세의 10%</li>
              <li><strong>국민연금</strong>: 4.5% (연봉 7,404만원 상한)</li>
              <li><strong>건강보험</strong>: 3.545% + 장기요양 0.4591%</li>
              <li><strong>고용보험</strong>: 0.9%</li>
            </ul>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              명절 상여금 vs 정기 보너스
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              회사가 명절 상여를 <strong>정기 상여금</strong>으로 분류하면 4대보험 부과 대상이 됩니다. 반면
              <strong> 비정기 격려금</strong>으로 분류하면 4대보험은 일부만(국민연금 제외) 부과될 수 있습니다.
              취업규칙에 명시된 정기 지급이라면 정기 상여로 봅니다.
            </p>
          </article>

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
              본 계산은 단일 직장 근로자 기준 2026년 세법으로 추정한 값입니다. 부양가족·비과세 항목 등에
              따라 실제 금액은 다를 수 있습니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/holiday-bonus" />
        </div>
      </main>
    </>
  );
}
