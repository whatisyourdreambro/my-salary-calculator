// src/app/calc/incentive-tax/page.tsx
//
// 인센티브 분리과세 계산기
// 키워드: "인센티브 세금", "성과급 분리과세", "퇴직소득 분리과세"

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { Sparkles, Info, AlertTriangle } from "lucide-react";
import IncentiveClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "인센티브 분리과세란 무엇인가요?",
    answer:
      "분리과세는 다른 소득과 합산하지 않고 인센티브 자체에만 별도 세율을 적용하는 방식입니다. 한국 소득세법상 일반 인센티브는 분리과세 대상이 아니며 근로소득에 합산되지만, 일부 특수한 경우(주식매수선택권 행사이익 일부, 퇴직소득 형태로 지급되는 인센티브 등)에 분리과세가 적용될 수 있습니다.",
  },
  {
    question: "성과급과 인센티브의 세금 차이가 있나요?",
    answer:
      "법적으로 성과급(상여금)과 인센티브는 모두 근로소득으로 동일하게 처리됩니다. 회사가 어떤 명칭으로 부르든 정기·비정기 여부에 따라 4대보험 부과 방식이 약간 다를 수 있지만, 세금 계산 방식 자체는 동일합니다. '인센티브'라는 이름이 붙어 있다고 해서 분리과세가 자동 적용되지 않습니다.",
  },
  {
    question: "주식매수선택권(스톡옵션) 행사이익은 어떻게 과세되나요?",
    answer:
      "벤처기업의 스톡옵션 행사이익은 일정 한도(연 5,000만원, 누적 5억원)까지 비과세 또는 분리과세(20% 세율) 혜택을 받을 수 있습니다. 일반 기업의 스톡옵션은 근로소득에 합산되어 누진세율이 적용되며, 분리과세 혜택은 적용되지 않습니다. 자세한 요건은 조세특례제한법 제16조의2를 참고하세요.",
  },
  {
    question: "인센티브 세금을 줄이는 합법적 방법은?",
    answer:
      "(1) IRP·연금저축 추가 납입(연 900만원 한도, 13.2~16.5% 세액공제), (2) 인센티브 수령 연도에 의료비·교육비·기부금 공제 최대화, (3) 우리사주조합 출연금 한도 활용(연 400만원 한도 비과세), (4) 주택청약 납입 등이 있습니다. 인센티브 자체의 세율을 낮출 수는 없지만 다른 공제로 환급액을 키울 수 있습니다.",
  },
  {
    question: "외국계 기업 인센티브는 다르게 과세되나요?",
    answer:
      "한국 거주자(연 183일 이상 거주)라면 국적·회사 소속 국가와 무관하게 한국 소득세법에 따라 과세됩니다. 외국 본사에서 직접 지급되는 인센티브도 한국에서 신고·납부 의무가 있으며, 이중과세 방지 협정에 따라 외국에서 납부한 세액은 한국 세액에서 공제될 수 있습니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "인센티브 분리과세 계산기",
  tagline: "인센티브·스톡옵션 세금 — 합산과세 vs 분리과세 비교",
  description:
    "인센티브와 성과급의 세금 차이, 스톡옵션 분리과세 한도, 절세 전략까지. 한국 소득세법 2026 기준으로 합산과세와 분리과세를 비교해 실수령액을 계산합니다.",
  path: "/calc/incentive-tax",
  keywords: [
    "인센티브 세금",
    "인센티브 분리과세",
    "스톡옵션 세금",
    "성과급 분리과세",
    "벤처기업 스톡옵션",
    "인센티브 실수령",
  ],
});

export default function IncentiveTaxPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "인센티브 분리과세 계산기",
            description:
              "인센티브·스톡옵션의 합산과세와 분리과세 세금을 비교 계산합니다.",
            url: "/calc/incentive-tax",
          }),
          autoBreadcrumbLd("/calc/incentive-tax", {
            leafName: "인센티브 분리과세 계산기",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} /> 합산 vs 분리 비교
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              인센티브 분리과세 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              일반 인센티브 vs <strong className="text-electric">벤처 스톡옵션 분리과세</strong> 비교
            </p>
          </header>

          <IncentiveClient />

          {/* 콘텐츠 */}
          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              합산과세 vs 분리과세, 무엇이 다른가?
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              <strong>합산과세</strong>는 인센티브를 다른 근로소득과 합쳐 누진세율(6%~45%)을 적용합니다.
              연봉 1억에 인센티브 5천만원을 받으면 합계 1억 5천만원에 대해 35% 구간 세율이
              적용됩니다. 반면 <strong>분리과세</strong>는 인센티브 자체에만 별도 세율(보통 20% 안팎)을
              적용해 다른 소득과 분리합니다. 분리과세는 고소득자에게 유리할 수 있지만,
              한국에서는 매우 제한된 경우(벤처 스톡옵션, 일부 퇴직소득)에만 적용됩니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              벤처기업 스톡옵션 분리과세 (조특법 제16조의2)
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              <strong>벤처기업이 지정된 임직원에게 부여한 스톡옵션</strong>의 행사이익은 다음 한도까지
              분리과세 또는 비과세 혜택을 받습니다.
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>연 5,000만원 한도</strong> 비과세 (행사 시점 시가 - 행사가)
              </li>
              <li>
                <strong>누적 5억원 한도</strong> 분리과세 20% (한도 초과분)
              </li>
              <li>벤처확인서·이사회 결의·2년 이상 근무 등 요건 필요</li>
              <li>
                일반 기업 스톡옵션은 <strong className="text-rose-500">근로소득 합산과세</strong>만 가능
              </li>
            </ul>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              인센티브 절세 핵심 4가지
            </h2>
            <ol className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong className="text-navy dark:text-canvas-50">IRP/연금저축 활용</strong> — 연 900만원, 최대 148.5만원 환급
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">우리사주 조합 출연</strong> — 연 400만원 한도 비과세
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">중소기업 취업 청년 감면</strong> — 일정 요건 시 90% 감면 (연 200만원 한도)
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">고향사랑기부</strong> — 연 500만원, 10만원까지 100% 세액공제
              </li>
            </ol>
          </article>

          {/* 경고 박스 */}
          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-black text-amber-900 dark:text-amber-200 mb-1">
                일반 인센티브는 분리과세 불가
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                회사가 '인센티브'로 명명했더라도 정기·비정기 보너스는 모두 근로소득에 합산되어
                누진세율이 적용됩니다. 분리과세는 벤처 스톡옵션 등 법적으로 명시된 경우에만
                가능하며, 회사 임의로 적용할 수 없습니다.
              </p>
            </div>
          </div>

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

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산은 2026년 소득세법·조세특례제한법 기준이며 참고용입니다. 실제 분리과세
              적용 여부는 세무사 또는 국세청 상담을 통해 확인하시기 바랍니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/incentive-tax" />
        </div>
      </main>
    </>
  );
}
