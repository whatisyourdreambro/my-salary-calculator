// src/app/calc/year-end-bonus-tax/page.tsx
//
// 연말 보너스 세금 — 일시 지급 vs 분할 지급 비교
// 키워드: "연말 보너스 세금", "12월 보너스", "보너스 분할 지급"

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { Sparkles, Info, Calendar } from "lucide-react";
import YearEndBonusTaxClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "연말 보너스를 12월에 받는 게 좋을까, 1월에 받는 게 좋을까?",
    answer:
      "연봉이 매년 비슷하다면 차이가 거의 없습니다. 두 경우 모두 결국 누진세율로 합산 과세되기 때문입니다. 하지만 (1) 다음해 퇴사 예정이거나 (2) 다음해 소득이 크게 줄어드는 경우(육아휴직 등) 1월 수령이 유리할 수 있습니다. 반대로 다음해 소득이 크게 늘어날 예정이라면 12월 수령이 유리합니다.",
  },
  {
    question: "보너스를 분할 지급하면 세금이 줄어드나요?",
    answer:
      "원천징수 시점의 일시적 부담은 줄어들 수 있지만, 연말정산에서 합산 과세되기 때문에 최종 세금은 동일합니다. 단, 회사가 일부를 다음해로 이연 지급하면 다음해 소득에 합산되어 누진세율 구간이 달라질 수 있습니다. 이 경우 절세 효과는 개인의 다음해 예상 소득에 따라 결정됩니다.",
  },
  {
    question: "보너스에 4대보험이 부과되는 게 맞나요?",
    answer:
      "네, 정기든 비정기든 근로의 대가로 지급되는 모든 금품에는 4대보험이 부과됩니다. 단, 국민연금은 월 617만원 상한이 있어 연봉이 이미 상한을 넘었다면 보너스에 추가 부과되지 않습니다. 산재보험은 사업주 전액 부담이라 근로자가 직접 부담하는 것은 국민연금·건강보험·고용보험 3가지입니다.",
  },
  {
    question: "성과급과 보너스의 차이는?",
    answer:
      "법적으로는 동일하게 근로소득(상여금)으로 처리됩니다. 일반적으로 '보너스'는 정기 상여금(명절·반기·연말 정해진 시기에 지급)을, '성과급'은 실적 기반 변동 보상을 가리키지만 세금 계산 방식은 같습니다. 명칭이 아니라 정기·비정기 여부가 4대보험 부과 시점에만 영향을 줍니다.",
  },
  {
    question: "보너스를 받으면 세금이 갑자기 많이 떼이는 이유는?",
    answer:
      "보너스 지급 시점에 회사는 '간이세액표' 기준으로 세금을 계산하는데, 이 표는 보너스를 받은 달의 월급이 평소보다 많아 보이게 하므로 일시적으로 높은 세율이 적용됩니다. 하지만 연말정산에서 1년치를 합산하여 재계산하므로, 평소보다 많이 떼인 부분은 보통 환급됩니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "연말 보너스 세금 계산기",
  tagline: "12월 보너스 vs 1월 보너스 — 수령 시점별 세금 비교",
  description:
    "연말 보너스를 12월에 받을지 1월에 받을지, 일시 지급과 분할 지급 중 어느 쪽이 절세에 유리한지 비교합니다. 2026년 누진세율 기준 합산 과세 시뮬레이션.",
  path: "/calc/year-end-bonus-tax",
  keywords: [
    "연말 보너스 세금",
    "12월 보너스",
    "1월 보너스",
    "보너스 분할 지급",
    "보너스 세금 계산기",
    "정기 상여금 세금",
  ],
});

export default function YearEndBonusTaxPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "연말 보너스 세금 계산기",
            description: "수령 시점·분할 지급에 따른 보너스 세금 차이를 비교 계산합니다.",
            url: "/calc/year-end-bonus-tax",
          }),
          autoBreadcrumbLd("/calc/year-end-bonus-tax", {
            leafName: "연말 보너스 세금 계산기",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Calendar size={12} /> 시즌 11~12월
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              연말 보너스 세금 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              <strong className="text-electric">12월 vs 1월 수령</strong> — 어느 쪽이 더 받나?
            </p>
          </header>

          <YearEndBonusTaxClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              일시 지급 vs 분할 지급, 무엇이 유리한가?
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              한 회계연도 안에서 보너스를 일시 지급받든 분할 지급받든 <strong>최종 세액은 동일</strong>합니다.
              연말정산에서 1년치 소득을 합산하여 누진세율로 재계산하기 때문입니다. 다만 다음 두
              경우에는 분할 지급이 유리할 수 있습니다.
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>다음해 소득 감소 예상</strong> — 육아휴직, 이직, 퇴사 등으로 다음해 연봉이
                대폭 줄어들 때 일부를 다음해로 이연하면 낮은 세율 구간 적용 가능
              </li>
              <li>
                <strong>한계세율 구간 진입 회피</strong> — 보너스로 인해 35% 구간(8,800만원 초과)에
                진입할 때, 일부를 다음해로 분산하면 24% 구간 유지 가능
              </li>
              <li>
                <strong>현금 흐름 관리</strong> — 일시 지급 시 원천징수가 크게 떼이고 환급은 다음해
                3월이라 자금 운용 측면에서 분할 지급이 유리한 경우도 있음
              </li>
            </ul>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              연말 보너스 절세 5가지 핵심
            </h2>
            <ol className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong className="text-navy dark:text-canvas-50">12월 IRP 일시납</strong> — 보너스 일부를 IRP에 즉시 납입하면 세액공제 + 환급 극대화
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">한계세율 구간 시뮬레이션</strong> — 88,000,000원 직전이면 IRP 납입으로 24% 구간 유지
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">기부금 12월 결제</strong> — 보너스 받은 후 즉시 기부하면 해당 연도 공제 가능
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">의료비·신용카드 사용</strong> — 보너스 받은 12월에 큰 지출 몰아서 공제 한도 채우기
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">우리사주 조합 출연</strong> — 연 400만원 한도 비과세, 보너스 일부를 자사주로 적립
              </li>
            </ol>
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
              본 계산은 단일 연도 합산과세 기준이며, 연도 간 분할 지급의 절세 효과는 다음해
              예상 소득에 따라 달라집니다. 회사와 분할 지급 협의는 근로계약 변경 사항이므로
              인사 부서를 통해 공식 진행해야 합니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/year-end-bonus-tax" />
        </div>
      </main>
    </>
  );
}
