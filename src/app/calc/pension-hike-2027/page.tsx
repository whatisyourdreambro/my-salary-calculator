// /calc/pension-hike-2027 — 국민연금 인상 월급 영향 계산기 (2026-08-30 신설, 성장 제안 ⑨)
// 2027-01-01 요율 총 9.5%→10.0%(근로자 4.75%→5.0%) 법정 확정 이벤트 대응.
// ★ 갱신 체크포인트: 2027-07 기준소득월액 상·하한 재조정(통상 3월 고시) 반영,
//   2028-01 요율 10.5% 인상 시 연도 상수 갱신(매년 +0.5%p, 2033년 13% 도달).

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd } from "@/components/AdPlacement";
import { TrendingUp, Info } from "lucide-react";
import PensionHikeClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "국민연금 보험료가 왜 오르나요?",
    answer:
      "2025년 통과된 국민연금법 개정(연금개혁)으로 보험료율이 법에 명시된 스케줄대로 오릅니다. 2026년 총 9.5%(근로자 4.75%)에서 시작해 매년 1월 1일 0.5%포인트씩 인상되어 2033년 총 13%에 도달합니다. 2027년 1월 1일부터는 총 10.0%, 근로자 부담 5.0%가 적용됩니다.",
  },
  {
    question: "내 월급에서 실제로 얼마나 더 빠지나요?",
    answer:
      "근로자 부담률이 4.75%에서 5.0%로 0.25%포인트 오르므로, 월급 300만원이면 매달 7,500원(연 9만원), 월급 500만원이면 매달 12,500원(연 15만원)을 더 냅니다. 회사도 같은 금액을 추가 부담합니다. 기준소득월액 상한(659만원) 이상 고소득자는 월 16,475원이 늘어납니다.",
  },
  {
    question: "기준소득월액 상한·하한이 무엇인가요?",
    answer:
      "연금보험료를 매기는 소득의 상·하한선입니다. 2026년 7월부터 2027년 6월까지는 상한 659만원·하한 41만원이 적용되어, 월급이 659만원을 넘어도 659만원 기준으로만 보험료를 냅니다. 상·하한은 가입자 평균소득 변동에 연동해 매년 7월 재조정되므로(통상 3월 고시), 2027년 7월부터는 상한이 다시 올라갈 예정입니다.",
  },
  {
    question: "회사도 같이 더 내나요?",
    answer:
      "네. 직장가입자의 연금보험료는 근로자와 회사가 절반씩 부담합니다. 2027년 총 보험료율 10.0% 중 근로자 5.0%, 회사 5.0%입니다. 지역가입자(자영업자 등)는 전액 본인이 부담하므로 인상 폭이 두 배로 체감됩니다.",
  },
  {
    question: "더 내는 만큼 연금도 더 받나요?",
    answer:
      "이번 개혁은 보험료율 인상(9%→13%)과 함께 소득대체율을 43%로 올리는 내용을 포함합니다. 보험료를 더 내는 만큼 가입 기간의 소득 기록이 커져 노후 연금액도 늘어나는 구조입니다. 내 예상 수령액은 국민연금 예상수령액 계산기에서 확인할 수 있습니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "국민연금 인상 계산기",
  tagline: "2027년 요율 10% 인상 — 내 월급에서 얼마나 더 빠지나",
  description:
    "2027년 1월부터 국민연금 보험료율이 총 9.5%에서 10.0%(근로자 5.0%)로 오릅니다. 월급만 입력하면 매달 더 내는 금액과 연간 부담 증가액을 즉시 계산합니다. 기준소득월액 상한 659만원 반영.",
  path: "/calc/pension-hike-2027",
  keywords: ["국민연금 인상", "국민연금 요율 2027", "연금보험료 인상", "국민연금 10%", "연금개혁 보험료"],
});

export default function PensionHike2027Page() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "국민연금 인상 계산기",
            description: "2027년 연금 요율 인상으로 월급에서 더 빠지는 금액을 자동 계산합니다.",
            url: "/calc/pension-hike-2027",
          }),
          autoBreadcrumbLd("/calc/pension-hike-2027", { leafName: "국민연금 인상 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <TrendingUp size={12} /> 2027-01-01 시행 확정
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              국민연금 인상 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              요율 9.5% → <strong className="text-electric">10.0%</strong> — 내 월급에서 얼마나 더 빠지나
            </p>
          </header>

          <PensionHikeClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">2027년 국민연금, 무엇이 바뀌나</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              2025년 연금개혁으로 국민연금 보험료율이 <strong>법정 스케줄</strong>에 따라
              오릅니다: 2026년 총 9.5% → 2027년 10.0% → 매년 0.5%p씩 → 2033년 13%. 직장가입자는
              회사와 절반씩 부담하므로 근로자 몫은 2027년부터 <strong>월 소득의 5.0%</strong>입니다.
              보험료를 매기는 기준소득월액은 상한 659만원·하한 41만원(2027년 6월까지)이며,
              매년 7월 재조정됩니다.
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>월급 300만원: 월 +7,500원 (연 +9만원)</li>
              <li>월급 500만원: 월 +12,500원 (연 +15만원)</li>
              <li>월급 659만원 이상(상한): 월 +16,475원 — 2027년 7월 상한 인상 시 추가 증가</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              연금·4대보험이 모두 반영된 내년 세후 월급은{" "}
              <Link href="/table/2026/annual" className="text-electric font-bold hover:underline">
                연봉 실수령액 표
              </Link>
              에서, 은퇴 후 받을 금액은{" "}
              <Link href="/national-pension-estimate-2026" className="text-electric font-bold hover:underline">
                국민연금 예상수령액 계산기
              </Link>
              에서 확인하세요.
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
              직장가입자 기준이며, 기준소득월액은 실제로는 전년 소득으로 산정한 뒤 매년 7월
              갱신됩니다(본 계산기는 입력 월급 기준 근사). 상한 659만원은 2027년 6월 30일까지
              적용되고 7월부터 재조정됩니다. 지역가입자는 전액 본인 부담입니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/pension-hike-2027" />
        </div>
      </main>
    </>
  );
}
