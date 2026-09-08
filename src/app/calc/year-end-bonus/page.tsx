// src/app/calc/year-end-bonus/page.tsx
//
// 성과급 세금 계산기 (시즌 페이지)
// 키워드: "성과급 세금", "성과급 실수령액", "보너스 실수령"
// /tools/finance/bonus와 차별화: 직급별·연봉별 성과급 시나리오 표 중심.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import FavoritesButton from "@/components/FavoritesButton";
import RelatedCalculators from "@/components/RelatedCalculators";
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { Calculator, ArrowRight, Sparkles, Info } from "lucide-react";
import YearEndBonusClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "성과급 세금은 왜 이렇게 많이 떼이나요?",
    answer:
      "과세 대상 성과급은 근로소득에 포함됩니다. 다만 누진세율(6%~45%)은 연봉 자체가 아니라 근로소득공제와 소득공제 등을 반영한 과세표준에 적용됩니다. 연봉 5천만원에 성과급 1천만원을 더했다고 그 1천만원 전부에 곧바로 24%가 적용되는 것은 아닙니다. 지급 시 원천징수액과 연말정산의 최종 세액도 구분해야 합니다.",
  },
  {
    question: "성과급은 사회보험료에 어떻게 반영되나요?",
    answer:
      "성과급의 보수 포함 여부와 신고·정산 시점에 따라 보험료에 미치는 영향이 달라집니다. 국민연금은 결정된 기준소득월액, 건강보험은 보수월액과 정산 규정 등을 적용하며 두 제도 모두 상한이 있습니다. 따라서 성과급을 받는 달에 계산기 금액이 그대로 추가 차감된다고 볼 수 없습니다. 이 페이지의 보험료는 비교를 위한 간이 추정치이므로 실제 공제는 급여명세서와 사업장 안내를 확인하세요.",
  },
  {
    question: "성과급으로 한계세율 구간이 바뀌면 어떻게 되나요?",
    answer:
      "공제 후 과세표준이 8천만원에서 9천만원으로 증가한 예를 보면, 증가분 중 800만원에는 24%, 8,800만원을 넘는 200만원에는 35%의 기본세율이 적용됩니다. 이는 총급여가 아닌 과세표준 예시이며 세액공제 전 계산입니다. IRP·연금저축은 요건을 충족한 납입액에 대해 산출세액에서 공제하는 제도이므로, 납입액만큼 과세표준이나 한계세율 구간을 낮추는 소득공제와 다릅니다.",
  },
  {
    question: "성과급 세금을 줄이는 방법이 있나요?",
    answer:
      "연금계좌 세액공제 등 본인이 충족하는 공제 요건을 확인할 수 있습니다. 일반적인 연간 세액공제 대상 납입한도는 연금저축 600만원, 연금저축과 IRP 등 퇴직연금계좌를 합해 900만원입니다. 소득세 공제율은 12% 또는 15%이며, 근로소득만 있으면 총급여 5,500만원 이하에 15%가 적용됩니다. 다른 종합소득이 있으면 종합소득금액 요건도 확인해야 합니다. 기존 납입액과 공제 전 세액에 따라 실제 공제 효과가 달라지고, 공제액이 같은 금액의 현금 환급을 보장하지는 않습니다.",
  },
  {
    question: "원천징수 세금과 연말정산 결과가 다른 이유는?",
    answer:
      "회사는 상여의 지급대상기간 등을 반영한 원천징수 규정으로 세금을 미리 차감합니다. 이후 귀속연도의 근로소득과 공제 내역을 연말정산해 결정세액을 구하고, 이미 낸 세금과 비교해 환급 또는 추가 납부액을 정합니다. 지급월의 원천징수액이나 계산기의 연간 세금 증가분이 최종 세액과 반드시 일치하는 것은 아닙니다.",
  },
];

// 비교를 위한 가상 연봉·성과급 조합. 직급별 실측 평균 통계가 아니다.
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
  tagline: "성과급 실수령액 추정 — 연봉별 예시·공제 조건 비교",
  description:
    "성과급(보너스)의 예상 세후 금액을 가상 연봉·성과급 조합으로 비교합니다. 과세표준과 총급여, 지급 시 원천징수와 연말정산, 연금계좌 세액공제 조건을 구분해 확인하세요.",
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
              "가상 연봉·성과급 조합을 2026년 기본세율과 간이 공제 가정으로 비교하는 세후 금액 추정 계산기입니다.",
            url: "/calc/year-end-bonus",
            dateModified: "2026-09-09",
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
              <Sparkles size={12} /> 2026 기본세율 · 간이 추정
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              성과급 세금 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              가상 연봉·성과급 조합으로 <strong className="text-electric">예상 세후 금액 비교</strong>
            </p>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          {/* Client Calculator */}
          <YearEndBonusClient scenarios={SCENARIOS} />

          {/* Detailed Link to /tools/finance/bonus */}
          <div className="rounded-2xl bg-electric text-white p-6 mb-10 flex items-center gap-4">
            <Calculator className="flex-shrink-0" size={32} />
            <div className="flex-1">
              <p className="font-black text-base mb-1">본인 조건으로 비교하고 싶으신가요?</p>
              <p className="text-sm opacity-90">
                내 연봉·성과급·부양가족을 입력해 예상 금액 비교하기
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
              세율 구간은 <strong>공제 후 과세표준</strong>으로 판단합니다.
              총급여에 성과급을 더한 금액에서 근로소득공제와 적용 가능한 소득공제 등을 반영해야 하므로,
              연봉 8천만원과 성과급 1천만원을 단순 합산해 35% 구간이라고 판단하면 안 됩니다.
              회사가 지급할 때 미리 뗀 세금은 원천징수액이며, 귀속연도의 공제 내역을 반영한
              최종 결정세액과는 차이가 날 수 있습니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              연봉·성과급 비교 예시는 어떻게 정했나요?
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              위 표의 신입~임원 금액은 계산 차이를 살펴보기 위한 <strong>가상 입력값</strong>이며,
              한국 기업의 직급별 평균이나 실제 지급을 나타내는 통계가 아닙니다.
              실제 성과급은 회사의 지급 규정·실적·평가·근무기간 등에 따라 달라집니다.
              본인에게 적용되는 금액은 회사 공지와 급여명세서로 확인하세요.
            </p>

            {/* 본문 중간 광고 */}
            <GuideMidAd />

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              공제와 환급을 구분하는 네 가지 확인 사항
            </h2>
            <ol className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong className="text-navy dark:text-canvas-50">연금계좌의 합산 한도</strong> — 일반적인 세액공제 대상은 연금저축 연 600만원, IRP 등 퇴직연금계좌와 합산 연 900만원입니다. 이미 낸 금액도 합산합니다.
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">소득세 공제율</strong> — 12% 또는 15%를 적용하며, 근로소득만 있는 경우 총급여 5,500만원 이하가 15% 대상입니다. 지방소득세 효과는 별도로 구분합니다.
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">다른 공제의 요건</strong> — 주택·의료비·교육비 공제는 소득, 주택 보유, 지출 대상 등 각각의 요건을 확인해야 합니다. 성과급을 받았다는 이유만으로 적용되지 않습니다.
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">환급액 확인</strong> — 결정세액과 이미 낸 세금의 차이로 환급·추가 납부가 정해집니다. 납입액에 공제율을 곱한 금액을 받을 환급액으로 단정하지 마세요.
              </li>
            </ol>
          </article>

          {/* 본문-FAQ 사이 광고 */}
          <InArticleAd />

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
              계산 가정: 근로소득공제·본인 기본공제 150만원을 반영하고, 산출세액의 30%가 공제된다고
              일괄 가정합니다. 보험료도 단순 추정하므로 개인별 실제 세액공제·보험료 정산을 재현하지 않습니다.
              확정 세액이나 지급월 입금액은 원천징수영수증·급여명세서로 확인하세요. 설명 확인: 2026-09-09. 근거:{" "}
              <a className="underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594">국세청 과세표준·기본세율</a>,{" "}
              <a className="underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596">연금계좌 세액공제</a>,{" "}
              <a className="underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7862&mi=6583">상여 원천징수</a>,{" "}
              <a className="underline" href="https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0097M0.do">국민연금 기준소득월액</a>,{" "}
              <a className="underline" href="https://www.nhis.or.kr/lm/lmxsrv/law/lawFullContent.do?MODE=twoView&SEQ=27&SEQ_HISTORY=612967">건강보험 보수월액·보험료 상하한</a>.
            </p>
          </div>

          {/* Related */}
          <RelatedCalculators currentPath="/calc/year-end-bonus" />
        </div>
      </main>
    </>
  );
}
