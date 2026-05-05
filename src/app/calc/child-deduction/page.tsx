// /calc/child-deduction — 자녀 인적공제 + 자녀세액공제 계산기

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { Sparkles, Info, Heart } from "lucide-react";
import ChildDeductionClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "자녀 인적공제와 자녀세액공제는 다른가요?",
    answer:
      "네, 둘은 별개입니다. (1) 인적공제: 자녀 1명당 150만원이 과세표준에서 차감 (소득공제). (2) 자녀세액공제: 1자녀 25만원, 2자녀 55만원, 3자녀 이상 자녀 1명당 30만원 추가 (세액공제). 두 공제가 모두 적용되어 세금이 크게 줄어듭니다.",
  },
  {
    question: "8세 이상 20세 이하 자녀 1명당 자녀세액공제는 얼마인가요?",
    answer:
      "1자녀 25만원, 2자녀 합계 55만원(2번째 30만원), 3자녀부터 매 명당 30만원 추가입니다. 즉 4자녀면 25 + 30 + 30 + 30 = 115만원. 6세 이하는 자녀세액공제 대상이 아니지만 인적공제는 가능합니다.",
  },
  {
    question: "8세 미만 자녀는 어떤 혜택이 있나요?",
    answer:
      "6세 이하: 인적공제 150만원 + 6세 이하 자녀 추가공제 100만원 + 출산·입양 세액공제 (첫째 30, 둘째 50, 셋째 이상 70만원). 7세 이상은 기본 인적공제 + 자녀세액공제 대상이 됩니다(8세 미만 일부 예외).",
  },
  {
    question: "맞벌이 부부 누가 자녀공제를 받는 게 유리한가요?",
    answer:
      "한계세율이 높은 쪽에서 받는 것이 유리합니다. 예: 한쪽이 35% 구간, 한쪽이 24% 구간이면 35% 쪽에서 인적공제 150만원을 받으면 약 52.5만원 절세, 24% 쪽이면 약 36만원 절세. 약 16만원 차이가 발생합니다.",
  },
  {
    question: "자녀공제 한도가 있나요?",
    answer:
      "인적공제 자체에는 인원 제한이 없으나, 부양가족(자녀 포함)의 연소득이 100만원(근로소득만 있을 경우 500만원)을 초과하면 공제 대상에서 제외됩니다. 자녀가 아르바이트로 연 500만원 초과 소득을 얻었다면 공제가 불가합니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "자녀 인적공제·세액공제 계산기",
  tagline: "자녀 수별 공제액 자동 계산 — 2026 세법",
  description:
    "자녀 수와 연령대를 입력하면 인적공제와 자녀세액공제를 합산한 절세 효과를 자동 계산합니다. 6세 이하·출산·다자녀 가산까지 반영.",
  path: "/calc/child-deduction",
  keywords: ["자녀공제 계산기", "자녀 인적공제", "자녀세액공제", "다자녀 가산", "출산 세액공제", "6세 이하 자녀공제"],
});

export default function ChildDeductionPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({ name: "자녀 인적공제·세액공제 계산기", description: "자녀 수와 연령에 따른 공제·세액공제 자동 계산", url: "/calc/child-deduction" }),
          autoBreadcrumbLd("/calc/child-deduction", { leafName: "자녀 인적공제·세액공제 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Heart size={12} /> 가족 절세
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              자녀공제 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              자녀 수·연령으로 <strong className="text-electric">인적공제 + 자녀세액공제</strong> 자동 계산
            </p>
          </header>

          <ChildDeductionClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">자녀공제 종류 (2026 기준)</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li><strong>기본 인적공제</strong>: 자녀 1명당 150만원 (소득공제)</li>
              <li><strong>6세 이하 추가공제</strong>: 1명당 100만원 (소득공제)</li>
              <li><strong>출산·입양 세액공제</strong>: 첫째 30만, 둘째 50만, 셋째 이상 70만원</li>
              <li><strong>자녀세액공제(8~20세)</strong>: 1자녀 25만, 2자녀 합 55만, 3자녀부터 30만씩 추가</li>
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
              본 계산기는 표준 자녀 수·연령 기준 추정치입니다. 부양가족 등록·연소득 요건·중복 공제 여부에 따라 달라질 수 있으니 연말정산 시 정확히 확인하세요.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/child-deduction" />
        </div>
      </main>
    </>
  );
}
