// src/app/calc/year-end-bonus/page.tsx
//
// 성과급 세금 계산기 (시즌 페이지)
// 키워드: "성과급 세금", "성과급 실수령액", "보너스 실수령"
// /tools/finance/bonus와 차별화: 직급별·연봉별 성과급 시나리오 표 중심.

import type { Metadata } from "next";
import Link from "next/link";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { Gift, Calculator, ArrowRight, Sparkles, Info } from "lucide-react";
import YearEndBonusClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "성과급 세금은 왜 이렇게 많이 떼이나요?",
    answer:
      "성과급은 근로소득에 합산되어 누진세율(6%~45%)이 적용되기 때문입니다. 연봉 5천만원에 성과급 1천만원을 받으면 합산 6천만원 구간(24%) 기준이 아니라, 성과급으로 인해 추가된 부분(5천~6천만원)에 24%가 적용됩니다. 따라서 평소 한계세율보다 한 단계 위 세율이 성과급에 적용되는 경우가 많습니다.",
  },
  {
    question: "성과급에도 4대보험이 부과되나요?",
    answer:
      "네, 정기 상여금이든 비정기 성과급이든 4대보험(국민연금·건강보험·고용보험) 부과 대상입니다. 단, 국민연금은 월 617만원(2026년 기준) 상한이 있어 연봉이 이미 상한을 넘었다면 성과급에 추가 부과되지 않습니다. 건강보험과 고용보험은 상한이 없어 매번 부과됩니다.",
  },
  {
    question: "성과급으로 한계세율 구간이 바뀌면 어떻게 되나요?",
    answer:
      "한계세율이 24%에서 35%로 올라간다고 해서 성과급 전체에 35%가 적용되는 것은 아닙니다. 88,000,000원 초과분에만 35%가 적용되고, 그 미만은 여전히 24%입니다. 다만 추가 소득에는 35%가 적용되므로 IRP·연금저축으로 과세표준을 낮추는 것이 효과적입니다.",
  },
  {
    question: "성과급 세금을 줄이는 방법이 있나요?",
    answer:
      "가장 효과적인 방법은 IRP(개인형 퇴직연금) 연 900만원 한도 추가 납입입니다. 소득에 따라 13.2%~16.5% 세액공제를 받을 수 있어, 900만원 납입 시 최대 148.5만원 환급 가능합니다. 그 외 연금저축(연 600만원 한도), 주택청약 납입(연 300만원 한도, 40% 공제), 의료비·교육비 공제 활용도 도움됩니다.",
  },
  {
    question: "원천징수 세금과 연말정산 결과가 다른 이유는?",
    answer:
      "회사는 성과급 지급 시 간이세액표 기준으로 미리 세금을 차감(원천징수)합니다. 하지만 실제 확정 세액은 다음해 2월 연말정산에서 누진세 합산 방식으로 재계산됩니다. 두 방식 사이에 차이가 생기면 연말정산에서 환급(원천징수가 많았던 경우) 또는 추징(부족했던 경우)됩니다.",
  },
];

// 직급별 평균 성과급 시나리오 (한국 기업 평균값 기준)
const SCENARIOS = [
  { rank: "신입사원", salary: 32_000_000, bonus: 1_500_000 },
  { rank: "대리", salary: 45_000_000, bonus: 4_000_000 },
  { rank: "과장", salary: 60_000_000, bonus: 8_000_000 },
  { rank: "차장", salary: 75_000_000, bonus: 12_000_000 },
  { rank: "부장", salary: 95_000_000, bonus: 20_000_000 },
  { rank: "임원", salary: 150_000_000, bonus: 40_000_000 },
];

export const metadata: Metadata = buildToolMetadata({
  name: "성과급 세금 계산기",
  tagline: "직급별 성과급 실수령액 — 4대보험·소득세 자동 계산",
  description:
    "성과급(보너스) 세금을 2026년 누진세율로 정확히 계산합니다. 신입~임원 직급별 평균 성과급 시나리오, 한계세율 구간 진입 경고, IRP 절세 팁까지 한눈에 확인하세요.",
  path: "/calc/year-end-bonus",
  keywords: [
    "성과급 세금",
    "성과급 실수령액",
    "성과급 계산기",
    "보너스 세금 계산기",
    "보너스 실수령액",
    "직급별 성과급",
    "PS 세금",
    "인센티브 세금",
  ],
});

export default function YearEndBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "성과급 세금 계산기",
            description:
              "직급별 성과급 평균 시나리오와 실수령액을 2026년 누진세율 기준으로 자동 계산합니다.",
            url: "/calc/year-end-bonus",
          }),
          autoBreadcrumbLd("/calc/year-end-bonus", {
            leafName: "성과급 세금 계산기",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} /> 2026 세법 완벽 반영
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              성과급 세금 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              직급별 평균 성과급으로 <strong className="text-electric">실수령액 즉시 비교</strong>
            </p>
          </header>

          {/* Client Calculator */}
          <YearEndBonusClient scenarios={SCENARIOS} />

          {/* Detailed Link to /tools/finance/bonus */}
          <div className="rounded-2xl bg-electric text-white p-6 mb-10 flex items-center gap-4">
            <Calculator className="flex-shrink-0" size={32} />
            <div className="flex-1">
              <p className="font-black text-base mb-1">정확한 계산이 필요하신가요?</p>
              <p className="text-sm opacity-90">
                내 연봉 + 성과급 + 부양가족까지 입력해 정밀 계산하기
              </p>
            </div>
            <Link
              href="/tools/finance/bonus"
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-electric font-bold text-sm whitespace-nowrap"
            >
              상세 계산기
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 콘텐츠 섹션 */}
          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              성과급 세금, 왜 그렇게 많이 떼이는가?
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              성과급은 일반 급여와 다르게 <strong>한 번에 큰 금액이 지급</strong>되기 때문에
              누진세율 구간이 위로 올라가는 경우가 많습니다. 예를 들어 연봉 8천만원이 평소 24%
              한계세율 구간이라면, 성과급 1천만원을 받는 순간 합산 9천만원이 되어 35% 구간에
              진입할 수 있습니다. 이때 88,000,000원 초과분에 35%가 적용되므로 성과급의
              상당 부분이 35%로 과세됩니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              직급별 평균 성과급 (한국 기업 기준)
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              한국 기업의 평균 성과급은 보통 <strong>연봉의 5~25%</strong> 수준이며, 임원급은
              연봉의 30~50%까지 올라갑니다. IT 대기업·금융권·외국계는 평균보다 높고,
              스타트업·중소기업은 평균보다 낮은 편입니다. PS(이익배분제)를 운영하는 기업은
              실적이 좋은 해에 추가 성과급이 지급되기도 합니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              성과급 절세 4가지 핵심 전략
            </h2>
            <ol className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong className="text-navy dark:text-canvas-50">IRP 추가 납입</strong> — 연 900만원 한도, 세액공제 13.2~16.5% (최대 148.5만원 환급)
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">연금저축 납입</strong> — 연 600만원 한도, IRP 합산 900만원까지 공제
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">주택청약</strong> — 소득 7천만원 이하 시 연 300만원 한도 (40% 공제)
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">의료비·교육비 공제</strong> — 성과급으로 늘어난 세 부담을 공제로 상쇄
              </li>
            </ol>
          </article>

          {/* FAQ */}
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

          {/* 면책 */}
          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 2026년 소득세법 기준 누진세 합산 방식으로 산출됩니다. 실제 원천징수는 월
              지급 시점의 간이세액표를 적용하므로 차이가 있을 수 있으며, 연말정산에서 정산됩니다.
              부양가족·세액공제 등 개인 변수는 상세 계산기를 이용해주세요.
            </p>
          </div>

          {/* Related */}
          <RelatedCalculators currentPath="/calc/year-end-bonus" />
        </div>
      </main>
    </>
  );
}
