// src/app/calc/severance-vs-pension/page.tsx
//
// 퇴직금 vs 퇴직연금 비교 계산기
// 키워드: "퇴직금 퇴직연금 차이", "DB DC 비교", "퇴직금 vs IRP"

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
import { Sparkles, Info, Briefcase, Building2 } from "lucide-react";
import SeveranceClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "퇴직금과 퇴직연금의 가장 큰 차이는?",
    answer:
      "퇴직금은 회사가 사내에 적립해 두었다가 퇴사 시 일시 지급하는 제도이고, 퇴직연금은 외부 금융기관에 매년 적립해 안전하게 보관·운용하는 제도입니다. 퇴직연금은 다시 DB(확정급여형)·DC(확정기여형)·IRP(개인형)로 나뉘며, 운용 주체와 수익률 변동성이 다릅니다.",
  },
  {
    question: "DB형과 DC형, 어느 것이 유리한가요?",
    answer:
      "임금상승률이 높고 안정적이면 DB형이 유리합니다. DB형 퇴직금 = 직전 3개월 평균 월급 × 근속연수이므로 마지막 연봉이 높을수록 받는 금액이 늘어납니다. 반면 DC형은 매년 일정 금액(연 임금 1/12)이 적립되어 본인이 운용하므로 운용 수익률이 좋으면 DB보다 유리할 수 있습니다. 임금피크제 적용 회사라면 DB가 불리해질 수 있어 DC 전환을 고려하기도 합니다.",
  },
  {
    question: "퇴직금을 IRP로 받으면 세금이 얼마나 줄어드나요?",
    answer:
      "IRP로 이전하면 퇴직소득세 과세가 이연됩니다. 일시 수령 시 즉시 분리과세(보통 6.6~22% 수준)되지만, IRP에 두고 연금으로 수령하면 연 1,500만원까지 3.3~5.5% 분리과세 또는 종합과세 선택이 가능해 절세 효과가 큽니다. 퇴직금 수령 시 자동으로 IRP 계좌가 만들어지며, 이전하지 않으면 즉시 과세됩니다.",
  },
  {
    question: "근속 1년 미만이면 퇴직금을 못 받나요?",
    answer:
      "네, 근로자퇴직급여보장법상 1년 이상 계속 근로한 직원에게만 지급 의무가 있습니다(주 15시간 이상). 1년 미만 단기 근로자는 법정 퇴직금 청구권이 없습니다. 단, 회사 자체 규정으로 지급하는 경우는 있습니다.",
  },
  {
    question: "퇴직금 중간정산이 가능한 경우는?",
    answer:
      "법적으로 정해진 사유(주택구입, 6개월 이상 의료비, 본인·배우자 파산선고, 6개월 이상 요양 등)에만 중간정산이 허용됩니다. 사유 없이 중간정산하면 회사가 근로자퇴직급여보장법 위반으로 처벌받을 수 있습니다. 퇴직연금은 더 엄격해서 일부 사유에만 중도인출이 가능합니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "퇴직금 vs 퇴직연금 비교",
  tagline: "DB · DC · IRP — 어느 방식이 가장 많이 받나?",
  description:
    "퇴직금(법정), 퇴직연금 DB형·DC형, IRP 일시 수령·연금 수령의 실수령액과 세금을 비교 계산합니다. 근속연수·연봉 상승률·운용 수익률에 따라 최적 선택이 달라집니다.",
  path: "/calc/severance-vs-pension",
  keywords: [
    "퇴직금 계산기",
    "퇴직연금 비교",
    "DB DC 차이",
    "퇴직금 vs IRP",
    "퇴직소득세",
    "퇴직금 일시 vs 연금",
    "IRP 절세",
  ],
});

export default function SeveranceVsPensionPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "퇴직금 vs 퇴직연금 비교",
            description: "DB·DC·IRP 일시·연금 수령의 실수령액과 세금을 비교 계산합니다.",
            url: "/calc/severance-vs-pension",
          }),
          autoBreadcrumbLd("/calc/severance-vs-pension", {
            leafName: "퇴직금 vs 퇴직연금 비교",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Briefcase size={12} /> 퇴직 준비 필수
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              퇴직금 vs 퇴직연금
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              <strong className="text-electric">DB · DC · IRP</strong> 어느 쪽이 가장 많이 받나?
            </p>
          </header>

          <SeveranceClient />

          {/* 콘텐츠 */}
          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              4가지 퇴직 방식 차이 한눈에 정리
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-canvas-200 dark:border-canvas-800 not-prose">
              <table className="w-full text-sm">
                <thead className="bg-electric text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-black">구분</th>
                    <th className="px-4 py-3 text-left font-black">법정 퇴직금</th>
                    <th className="px-4 py-3 text-left font-black">DB형 퇴직연금</th>
                    <th className="px-4 py-3 text-left font-black">DC형 퇴직연금</th>
                    <th className="px-4 py-3 text-left font-black">IRP 연금 수령</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-canvas-900 divide-y divide-canvas-200 dark:divide-canvas-800">
                  <tr>
                    <td className="px-4 py-3 font-bold">적립 주체</td>
                    <td className="px-4 py-3">회사 사내</td>
                    <td className="px-4 py-3">금융기관</td>
                    <td className="px-4 py-3">금융기관 + 본인</td>
                    <td className="px-4 py-3">본인 IRP 계좌</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">받는 금액</td>
                    <td className="px-4 py-3">평균임금 × 근속</td>
                    <td className="px-4 py-3">평균임금 × 근속</td>
                    <td className="px-4 py-3">매년 적립 + 운용</td>
                    <td className="px-4 py-3">이전금 + 운용</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">위험</td>
                    <td className="px-4 py-3 text-rose-500">회사 도산 위험</td>
                    <td className="px-4 py-3 text-emerald-500">안전</td>
                    <td className="px-4 py-3">운용 손익</td>
                    <td className="px-4 py-3">운용 손익</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">세금</td>
                    <td className="px-4 py-3">퇴직소득세 6~28%</td>
                    <td className="px-4 py-3">퇴직소득세 6~28%</td>
                    <td className="px-4 py-3">퇴직소득세 6~28%</td>
                    <td className="px-4 py-3 text-emerald-500">3.3~5.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              퇴직소득세 계산 핵심 공식
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              퇴직소득세는 <strong>환산급여 방식</strong>으로 계산됩니다. 일반 근로소득세와 달리 근속연수
              공제, 환산급여 공제 등이 단계별로 적용되어 일반적으로 6~28%의 분리과세율이 적용됩니다.
            </p>
            <ol className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                ① <strong>퇴직소득금액</strong> = 퇴직급여 - 비과세 항목
              </li>
              <li>
                ② <strong>근속연수공제</strong> 차감 (근속 5년 이하: 100만원/년, 10년 이하: 200만원/년 등)
              </li>
              <li>③ <strong>환산급여</strong> = (① - ②) × 12 ÷ 근속연수</li>
              <li>④ <strong>환산급여공제</strong> 차감 후 누진세율 적용</li>
              <li>⑤ <strong>최종 퇴직소득세</strong> = 산출세액 × 근속연수 ÷ 12</li>
            </ol>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              IRP 연금 수령의 절세 효과
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              퇴직금을 IRP에 두고 만 55세 이후 10년 이상 분할 수령하면 다음 절세 효과가 있습니다.
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>연 1,500만원 이하</strong> 수령 시 연금소득세 3.3~5.5% (저율 분리과세)
              </li>
              <li>
                <strong>일시 수령 대비 약 30~50% 절세</strong> 가능
              </li>
              <li>운용 기간 수익에 대한 과세도 이연 → 복리 효과 극대화</li>
              <li>
                <Link href="/tools/finance/irp" className="text-electric font-bold underline">
                  IRP 추가 납입
                </Link>
                으로 연 900만원 한도 13.2~16.5% 세액공제
              </li>
            </ul>
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
              본 계산은 추정치이며, 정확한 퇴직급여는 회사 인사부 또는 퇴직연금 운용 금융기관에서
              확인하셔야 합니다. DC형과 IRP는 운용 수익률에 따라 결과가 크게 달라질 수 있습니다.
              상세 계산은 <Link href="/tools/finance/severance" className="text-electric font-bold underline">
                퇴직금 정밀 계산기
              </Link>를 이용하세요.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/severance-vs-pension" />
        </div>
      </main>
    </>
  );
}
