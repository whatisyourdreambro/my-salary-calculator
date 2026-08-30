// /calc/annual-leave-days — 연차 개수 계산기 (2026-08-30 신설, 승인 배치)
// 근로기준법 60조 + 대법 2021다227100(만 1년 퇴직 시 15일 미발생) + 회계연도 비례부여
// (고용부 근기 68207-620). 계산 로직: src/lib/annualLeave.ts (laborCalc.test.ts 검증).

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd } from "@/components/AdPlacement";
import { CalendarDays, Info } from "lucide-react";
import AnnualLeaveDaysClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "연차는 1년에 몇 개 발생하나요?",
    answer:
      "1년간 80% 이상 출근하면 15일이 발생하고, 3년 이상 계속 근로하면 최초 1년을 초과하는 매 2년마다 1일씩 가산됩니다(근로기준법 60조). 공식은 15 + (근속연수−1)÷2의 내림값이며 상한은 25일입니다. 예: 만 3년차 16일, 만 7년차 18일, 만 21년 이상 25일.",
  },
  {
    question: "입사 1년 미만인데 연차가 있나요?",
    answer:
      "네. 1개월 개근할 때마다 1일씩, 최대 11일까지 발생합니다. 이 1년 미만 연차는 입사일로부터 1년 안에 쓰지 않으면 소멸합니다(2020년 3월 개정). 만 1년이 되는 날의 다음 날까지 재직하면 추가로 15일이 발생해 최대 26일이 됩니다.",
  },
  {
    question: "정확히 1년(365일)만 근무하고 퇴사하면 연차는 몇 개인가요?",
    answer:
      "11일입니다. 대법원 판결(2021다227100)에 따라 연차는 '1년간 근로를 마친 다음 날' 발생하므로, 365일 근무 후 바로 퇴직하면 15일분은 발생하지 않습니다. 366일째에 재직해야 15일이 발생해 총 26일이 됩니다. 고용노동부도 2021년 12월 행정해석을 이에 맞춰 변경했습니다.",
  },
  {
    question: "회사가 회계연도(1월 1일) 기준으로 연차를 주는데, 계산이 다른가요?",
    answer:
      "노무관리 편의상 매년 1월 1일에 일괄 부여하는 방식으로, 입사 다음 해 1월 1일에는 비례연차(15 × 입사연도 재직일수 ÷ 365)를 부여합니다(고용노동부 행정해석 근기 68207-620). 근로자에게 불리하지 않아야 하며, 퇴직 시점에 입사일 기준보다 적게 받았다면 그 차이를 수당으로 정산받을 수 있습니다. 소수점 처리는 회사 규정에 따르며 올림 처리가 일반적입니다.",
  },
  {
    question: "쓰지 못한 연차는 어떻게 되나요?",
    answer:
      "발생일로부터 1년(1년 미만 연차는 입사일로부터 1년) 안에 사용하지 않으면 소멸하고, 회사가 연차사용촉진 절차를 거치지 않았다면 미사용 일수만큼 연차수당(1일 통상임금 × 일수)을 청구할 수 있습니다. 예상 수당은 연차수당 계산기에서 확인하세요.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "연차 개수 계산기",
  tagline: "입사일만 넣으면 연도별 연차 발생 내역 — 입사일 vs 회계연도 비교",
  description:
    "입사일을 입력하면 근로기준법 60조 기준 연차 발생 개수를 연도별로 계산합니다. 1년 미만 월차·비례연차·회계연도 방식 비교, 만 1년 퇴직 시 15일 미발생 판례까지 반영.",
  path: "/calc/annual-leave-days",
  keywords: ["연차 개수 계산기", "연차 발생기준", "연차 계산", "회계연도 연차", "1년 미만 연차"],
});

export default function AnnualLeaveDaysPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "연차 개수 계산기",
            description: "입사일 기준 연차 발생 개수를 연도별로 자동 계산합니다.",
            url: "/calc/annual-leave-days",
          }),
          autoBreadcrumbLd("/calc/annual-leave-days", { leafName: "연차 개수 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <CalendarDays size={12} /> 근로기준법 60조
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              연차 개수 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              입사일 하나로 <strong className="text-electric">입사일 기준 vs 회계연도 기준</strong> 발생 내역 비교
            </p>
          </header>

          <AnnualLeaveDaysClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">연차 발생 규칙 (근로기준법 60조)</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>1년 미만: 1개월 개근 시 1일 (최대 11일, 입사 1년 내 사용)</li>
              <li>1년 이상(80% 이상 출근): 15일 — 만 1년이 되는 날의 <strong>다음 날 재직</strong>해야 발생</li>
              <li>3년 이상: 최초 1년 초과 매 2년마다 +1일 (만 3년 16일, 만 5년 17일…)</li>
              <li>상한 25일 (만 21년 이후)</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              발생한 연차를 쓰지 못했다면{" "}
              <Link href="/calc/vacation-pay" className="text-electric font-bold hover:underline">
                연차수당 계산기
              </Link>
              에서 세후 수당을, 수당의 기준이 되는 1일 통상임금은{" "}
              <Link href="/calc/ordinary-wage" className="text-electric font-bold hover:underline">
                통상임금 계산기
              </Link>
              에서 정확히 계산할 수 있습니다.
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
              개근·80% 출근을 가정한 법정 최소 기준입니다. 취업규칙·단체협약이 더 유리하면 그
              기준이 우선하며, 회계연도 방식의 비례연차 소수점 처리와 육아휴직·휴직 기간 처리는
              회사 규정 확인이 필요합니다. 구체적 분쟁은 노무사 상담을 권합니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/annual-leave-days" />
        </div>
      </main>
    </>
  );
}
