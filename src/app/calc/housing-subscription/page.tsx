// /calc/housing-subscription — 청약저축·주택청약 소득공제 계산기

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { Sparkles, Info, Home } from "lucide-react";
import HousingSubscriptionClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "청약저축 소득공제 한도는 얼마인가요?",
    answer:
      "총급여 7천만원 이하 무주택 세대주가 청약저축에 납입한 금액의 40%가 소득공제됩니다. 연 납입한도 300만원 기준 최대 120만원이 과세표준에서 차감됩니다. 한계세율 24%면 약 28.8만원 절세 효과가 있습니다.",
  },
  {
    question: "청약저축 vs 주택청약종합저축, 어느 것이 공제되나요?",
    answer:
      "현재 신규 가입 가능한 것은 '주택청약종합저축'이며, 이것이 소득공제 대상입니다. 과거 가입한 '청약저축'도 동일하게 공제됩니다. '청년우대형' 주택청약은 비과세 혜택까지 추가로 받을 수 있어 만 19~34세에게 유리합니다.",
  },
  {
    question: "월 얼마씩 넣어야 가장 효율적인가요?",
    answer:
      "공제 한도가 연 300만원이므로 월 25만원이 최적입니다. 그 이상 납입해도 추가 소득공제는 없습니다. 단, 주택청약 1순위 자격이나 청년우대형 비과세 한도(연 600만원)를 고려한다면 더 많이 납입할 수도 있습니다.",
  },
  {
    question: "총급여가 7천만원을 초과하면 공제 못 받나요?",
    answer:
      "네, 청약저축 소득공제는 총급여 7천만원 이하 세대주만 해당됩니다. 그 초과면 공제는 받을 수 없지만 청약 1순위 자격을 위해 납입은 계속하는 것이 좋습니다. 청년우대형은 별도 요건(소득 3,600만원 이하 등)이 있습니다.",
  },
  {
    question: "주택을 보유한 적이 있어도 공제 가능한가요?",
    answer:
      "현재 무주택 세대주여야 합니다. 과거에 주택을 보유했었더라도 현재 시점에 무주택이면 공제 대상입니다. 단, 세대원이 주택을 소유하면 세대주가 아니므로 공제 불가. 1세대 1주택자도 일정 조건(국민주택규모 이하 등)에 따라 일부 가능합니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "청약저축 소득공제 계산기",
  tagline: "주택청약 납입액 공제 — 절세 효과 자동 계산",
  description:
    "주택청약종합저축 납입액과 연봉으로 소득공제 절세 효과를 자동 계산합니다. 청년우대형 비과세 혜택까지 비교.",
  path: "/calc/housing-subscription",
  keywords: ["청약저축 공제", "주택청약 소득공제", "청년우대형", "청약저축 절세", "청약 한도", "주택청약종합저축"],
});

export default function HousingSubscriptionPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({ name: "청약저축 소득공제 계산기", description: "주택청약 납입액 소득공제 절세 효과를 자동 계산합니다.", url: "/calc/housing-subscription" }),
          autoBreadcrumbLd("/calc/housing-subscription", { leafName: "청약저축 소득공제 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Home size={12} /> 무주택 세대주
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              청약저축 소득공제 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              월 납입액별 <strong className="text-electric">절세 효과 즉시 확인</strong>
            </p>
          </header>

          <HousingSubscriptionClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">청약저축 소득공제 핵심 요건</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li><strong>총급여 7천만원 이하</strong> 무주택 세대주</li>
              <li><strong>납입액 40% 공제</strong>, 연 300만원 한도 (최대 공제 120만원)</li>
              <li>한계세율에 따라 절세액 7.2만~52.8만원</li>
              <li><strong>청년우대형</strong>: 만 19~34세, 소득 3,600만원 이하 시 비과세 혜택까지 (연 600만원 한도)</li>
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
              총급여 기준은 비과세 항목(식대 등) 제외 후 금액입니다. 연말정산 간소화 서비스에서 정확한 납입액 확인 후 신고하세요.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/housing-subscription" />
        </div>
      </main>
    </>
  );
}
