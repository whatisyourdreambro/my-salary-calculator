// /calc/vacation-pay — 연차수당 계산기

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { Sparkles, Info } from "lucide-react";
import VacationPayClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "연차수당은 어떻게 계산되나요?",
    answer:
      "근로기준법상 연차수당 = 통상임금(또는 평균임금) × 미사용 연차 일수입니다. 통상임금은 1일 8시간 기준 월급을 209시간(법정 월 근로시간)으로 나눈 시급에 8을 곱한 1일 통상임금입니다. 일반적으로 연봉을 240(12개월×20일)으로 나누어 1일 통상임금을 추정합니다.",
  },
  {
    question: "연차수당에도 세금이 붙나요?",
    answer:
      "네, 연차수당은 근로소득에 포함되어 소득세·지방세·4대보험이 모두 부과됩니다. 정기 급여와 같은 누진세율이 적용되므로, 연말 일시 지급 시에는 한계세율 구간이 한 단계 올라갈 수 있습니다.",
  },
  {
    question: "연차를 사용하지 않으면 무조건 수당으로 받을 수 있나요?",
    answer:
      "법적으로 연차 사용을 적극 권장(연차사용촉진제)한 회사라면 미사용 연차에 대한 수당 지급 의무가 면제될 수 있습니다. 회사가 사용 촉진 절차를 거치지 않았다면 미사용 연차에 대해 수당을 청구할 수 있습니다. 자세한 절차는 노무사 상담을 권합니다.",
  },
  {
    question: "1년 미만 근무자도 연차수당을 받나요?",
    answer:
      "네, 1년 미만 근로자도 1개월 개근 시 1일 연차가 발생합니다(최대 11일). 미사용 시 수당으로 받을 수 있으며, 1년 이상 근무하면 추가로 15일이 발생합니다. 4년 차부터 매 2년마다 1일씩 가산되어 최대 25일까지 늘어납니다.",
  },
  {
    question: "연차수당과 퇴직금에 영향이 있나요?",
    answer:
      "연차수당은 퇴직 직전 3개월 평균임금 산정에 포함되므로, 연차수당이 클수록 퇴직금도 늘어납니다. 다만 퇴직 직전 3개월 외 시점에 받은 연차수당은 평균임금에 포함되지 않습니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "연차수당 계산기",
  tagline: "미사용 연차 수당 — 통상임금·세금 자동 계산",
  description:
    "사용하지 않은 연차 일수와 연봉만 입력하면 통상임금 기반 연차수당과 세후 실수령액을 즉시 계산합니다. 2026년 세법 적용.",
  path: "/calc/vacation-pay",
  keywords: ["연차수당 계산기", "연차수당", "미사용 연차", "통상임금 계산", "연차수당 세금"],
});

export default function VacationPayPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({ name: "연차수당 계산기", description: "미사용 연차 수당과 세후 실수령액을 자동 계산합니다.", url: "/calc/vacation-pay" }),
          autoBreadcrumbLd("/calc/vacation-pay", { leafName: "연차수당 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} /> 연말·퇴사 시즌
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              연차수당 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              미사용 연차 <strong className="text-electric">수당 + 세후 실수령</strong> 즉시 계산
            </p>
          </header>

          <VacationPayClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">통상임금 계산 방법</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              <strong>1일 통상임금</strong> = 월 통상임금 ÷ 209시간 × 8시간. 월 통상임금에는 기본급 + 정기 수당이 포함됩니다.
              간편 추정: 연봉 ÷ 240 (12개월 × 20일).
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">연차 발생 일수 (근로기준법)</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>1년 미만: 1개월 개근 시 1일 (최대 11일)</li>
              <li>1년 이상: 15일</li>
              <li>3년차부터 매 2년마다 1일 가산</li>
              <li>최대 25일 (21년차 이후)</li>
            </ul>
          </article>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={idx} className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group">
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}<span className="text-electric group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 통상임금 ≈ 연봉/240 가정 추정치입니다. 정기·비정기 수당, 상여금 포함 여부에 따라 실제 통상임금이 달라질 수 있습니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/vacation-pay" />
        </div>
      </main>
    </>
  );
}
