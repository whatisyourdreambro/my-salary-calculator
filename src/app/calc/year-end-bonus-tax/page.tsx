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
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { CURRENT_RATES_YEAR, INSURANCE_RATES_BY_YEAR, rateLabels } from "@/config/currentRates";
import { Info, Calendar } from "lucide-react";
import YearEndBonusTaxClient from "./Client";
import { staticRouteLastModified } from "@/app/sitemap";

// 2027 요율 문구는 연도 정본(taxConstants2027.ts)에서 파생 — 요율 리터럴을 두지 않는다(verify:tax).
// 계산기 두 카드는 현행 포인터(2026) 요율로 계산하므로, 포인터가 2026 인 동안만 접힌 FAQ 에 그 차이를 밝힌다.
const R27 = rateLabels(INSURANCE_RATES_BY_YEAR[2027]);

// 귀속연도 기준(2026-11-15 N2-calc-01): 급여는 근로제공일이 속한 해, 성과급은 보통 개인별 지급액이 확정된 해의 소득이다
// (국세청 근로소득 수입시기 안내 · 사전-2025-법규소득-1070, 2026-03-11 답변). 입금일만 1월로 미뤄도 소득 연도는 그대로다.
const FAQ_ITEMS = [
  {
    question: "연말 보너스를 12월에 받는 게 좋을까, 1월에 받는 게 좋을까?",
    answer:
      "보너스가 어느 해 소득인지(귀속연도)가 먼저입니다. 급여는 근로를 제공한 날이 속한 해의 소득이고, 성과급은 보통 개인별 지급액이 확정된 해의 소득이라, 올해 금액이 정해진 보너스는 1월에 입금돼도 올해 연봉에 합산됩니다. 위 계산기의 '1월 지급'은 금액 확정까지 다음해로 넘어가 다음해 소득이 되는 경우입니다. 그 경우 연봉이 매년 비슷하다면 차이가 거의 없고, 다음해 소득이 크게 줄면(퇴사·육아휴직 등) 1월 쪽이, 크게 늘면 12월 쪽이 유리할 수 있습니다." +
      (CURRENT_RATES_YEAR === 2026
        ? ` 두 경우 모두 2026년 4대보험 요율로 계산했으며, 2027년 국민연금 ${R27.pension}·장기요양 ${R27.ltcRatio}(건강보험료 대비)를 반영하면 1월 쪽 4대보험이 보너스의 최대 약 0.3% 늘어납니다.`
        : ""),
  },
  {
    question: "보너스를 분할 지급하면 세금이 줄어드나요?",
    answer:
      "같은 해 소득이라면 나눠 받아도 연말정산에서 합산되므로 최종 세금은 같고, 원천징수 시점의 부담만 달라질 수 있습니다. 입금일만 다음해로 미룬다고 소득 연도가 바뀌지는 않습니다(국세청은 개인별 지급액이 확정된 뒤 일부를 다음해 이후에 나눠 지급한 사안에서 확정된 연도를 귀속연도로 봄, 사전-2025-법규소득-1070). 금액 확정까지 다음해로 넘어가 다음해 소득이 되는 경우에만 다음해 소득에 합산되어 누진세율 구간이 달라질 수 있습니다. 귀속연도는 회사 급여 담당자에게 확인하세요.",
  },
  {
    question: "보너스에 4대보험이 부과되는 게 맞나요?",
    answer:
      "네, 정기든 비정기든 근로의 대가로 지급되는 모든 금품에는 4대보험이 부과됩니다. 단, 국민연금은 월 659만원(2026.7~2027.6) 상한이 있어 연봉이 이미 상한을 넘었다면 보너스에 추가 부과되지 않습니다. 산재보험은 사업주 전액 부담이라 근로자가 직접 부담하는 것은 국민연금·건강보험·고용보험 3가지입니다.",
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
  tagline: "12월 vs 1월 보너스 — 수령 시점별 세금 비교",
  description:
    "연말 보너스가 올해 소득일 때와 다음해 소득일 때의 세금·4대보험·실수령액을 비교합니다. 지급일이 아니라 귀속연도가 기준입니다. 2026년 누진세율 기준.",
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
            description: "귀속연도(올해·다음해)에 따른 보너스 세금·실수령액 차이를 비교 계산합니다.",
            url: "/calc/year-end-bonus-tax",
            dateModified: staticRouteLastModified("/calc/year-end-bonus-tax"),
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

            {/* 본문 중간 광고 */}
            <GuideMidAd />

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              연말 보너스 절세 5가지 핵심
            </h2>
            <ol className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong className="text-navy dark:text-canvas-50">12월 IRP 일시납</strong> — 보너스 일부를 IRP에 즉시 납입하면 세액공제 + 환급 극대화
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">연금계좌 세액공제 확인</strong> — IRP·연금저축은 요건을 충족한 납입액에 세액공제를 적용하며 과세표준 구간을 직접 낮추지 않습니다.
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

          {/* 본문-FAQ 사이 광고 */}
          <InArticleAd />

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
