// /calc/ordinary-wage — 통상임금 계산기 (2026-08-30 신설, 승인 배치)
// 2024-12-19 대법원 전원합의체(2020다247190) 고정성 폐기 반영 — 재직조건부 정기상여 포함.
// 계산 로직은 src/lib/ordinaryWage.ts (단위테스트: laborCalc.test.ts, 고용부 예시 대조).

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd } from "@/components/AdPlacement";
import { Scale, Info } from "lucide-react";
import OrdinaryWageClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "통상임금이란 무엇인가요?",
    answer:
      "근로자에게 소정근로의 대가로 정기적·일률적으로 지급하기로 정한 임금입니다. 연장·야간·휴일근로 가산수당과 연차수당·해고예고수당의 산정 기준이 됩니다. 2024년 12월 19일 대법원 전원합의체 판결(2020다247190)로 40여 년간 유지되던 '고정성' 요건이 폐기되어, 재직 조건이나 최소 근무일수 조건이 붙은 정기상여금도 통상임금에 포함됩니다.",
  },
  {
    question: "재직조건부 정기상여금도 통상임금에 들어가나요?",
    answer:
      "네. 2024-12-19 대법원 전원합의체 판결로 '지급일 재직 조건'이나 '15일 이상 근무 조건'이 붙은 정기상여금도 통상임금에 포함됩니다(판결 선고 이후 산정분부터 적용). 고용노동부도 2025년 2월 지침을 개정해 지급주기가 1개월을 넘는 분기·연 단위 상여도 제외되지 않음을 명확히 했습니다. 연간 상여 총액을 12로 나눠 월 통상임금에 산입합니다.",
  },
  {
    question: "209시간은 어떻게 나온 숫자인가요?",
    answer:
      "주 40시간 근무 시 유급 주휴 8시간을 더한 주 48시간에, 1년 평균 주 수(365÷7÷12 ≈ 4.345주)를 곱하면 월 208.57시간 → 209시간입니다(근로기준법 시행령 제6조). 시간급 통상임금 = 월 통상임금 ÷ 209시간입니다.",
  },
  {
    question: "통상임금이 오르면 무엇이 달라지나요?",
    answer:
      "연장근로(×1.5)·야간근로(+0.5 가산)·휴일근로(8시간 이내 ×1.5, 초과 ×2.0) 수당과 미사용 연차수당(1일 통상임금 × 일수), 해고예고수당이 전부 통상임금에 비례해 늘어납니다. 정기상여금이 통상임금에 포함되면 이 수당들이 함께 오르는 구조입니다.",
  },
  {
    question: "어떤 수당이 통상임금에 포함되나요?",
    answer:
      "명칭이 아니라 실질 기준으로 판단합니다. 정기적·일률적으로 지급되는 기본급·직책수당·자격수당·정기상여금 등은 포함되고, 실제 근무 실적에 따라 달라지는 성과급이나 비정기적 금품은 제외되는 것이 원칙입니다. 개별 수당의 포함 여부는 사안별 판단이 필요하므로 구체적 분쟁은 노무사 등 전문가와 상담하세요.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "통상임금 계산기",
  tagline: "2024 대법원 전원합의체 판결 반영 — 시간급·수당 파급액 즉시 계산",
  description:
    "기본급·고정수당·정기상여를 입력하면 209시간 기준 시간급 통상임금과 연장·야간·휴일·연차수당 파급액을 즉시 계산합니다. 2024-12 대법원 전합 판결(고정성 폐기·재직조건부 상여 포함) 반영.",
  path: "/calc/ordinary-wage",
  keywords: ["통상임금 계산기", "통상임금 계산방법", "통상임금 209시간", "정기상여금 통상임금", "통상임금 시급"],
});

export default function OrdinaryWagePage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "통상임금 계산기",
            description: "시간급 통상임금과 연장·야간·휴일·연차수당 파급액을 자동 계산합니다.",
            url: "/calc/ordinary-wage",
          }),
          autoBreadcrumbLd("/calc/ordinary-wage", { leafName: "통상임금 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Scale size={12} /> 2024 전합 판결 반영
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              통상임금 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              시간급 통상임금과 <strong className="text-electric">연장·야간·휴일·연차수당</strong> 파급액 즉시 계산
            </p>
          </header>

          <OrdinaryWageClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">2024년 대법원 판결로 무엇이 바뀌었나</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              2024년 12월 19일 대법원 전원합의체(2020다247190)는 통상임금의{" "}
              <strong>&lsquo;고정성&rsquo; 요건을 대법관 전원일치로 폐기</strong>했습니다. 이전에는
              &ldquo;지급일에 재직 중일 것&rdquo; 같은 조건이 붙은 정기상여금은 통상임금에서
              빠졌지만, 판결 이후에는 <strong>재직조건부·최소근무일수 조건부 정기상여금도
              통상임금에 포함</strong>됩니다(판결 선고 이후 산정분부터). 고용노동부도 2025년 2월
              지침을 개정해 분기·연 단위 상여도 제외되지 않음을 명확히 했습니다. 정기상여 비중이
              큰 회사일수록 연장·휴일수당과 연차수당이 크게 달라집니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">계산 방법 (근로기준법 시행령 6조)</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>월 통상임금 = 기본급 + 정기·일률 수당 + (연간 정기상여 ÷ 12)</li>
              <li>시간급 = 월 통상임금 ÷ 209시간 (주 40시간 + 주휴 8시간 × 4.345주)</li>
              <li>1일 통상임금 = 시간급 × 8시간 — 미사용 연차수당 1일분</li>
              <li>연장·야간 +50% 가산(중복 가능), 휴일 8시간 이내 ×1.5·초과 ×2.0</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              내 연차가 몇 개 발생했는지는{" "}
              <Link href="/calc/annual-leave-days" className="text-electric font-bold hover:underline">
                연차 개수 계산기
              </Link>
              에서, 미사용 연차의 세후 수당은{" "}
              <Link href="/calc/vacation-pay" className="text-electric font-bold hover:underline">
                연차수당 계산기
              </Link>
              에서 확인할 수 있습니다.
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
              통상임금 포함 여부는 수당의 명칭이 아닌 실질로 판단하며, 취업규칙·단체협약이 법정
              기준보다 유리하면 그 조항이 우선합니다. 본 계산기는 일반적 산식에 따른 참고용으로,
              구체적 분쟁·소급 청구는 노무사 등 전문가 상담을 권합니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/ordinary-wage" />
        </div>
      </main>
    </>
  );
}
