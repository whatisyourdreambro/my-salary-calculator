// /calc/child-deduction — 자녀 인적공제 + 자녀세액공제 계산기

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import { GuideMidAd } from "@/components/AdPlacement";
import { Info, Heart } from "lucide-react";
import ChildDeductionClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "자녀 인적공제와 자녀세액공제는 다른가요?",
    answer:
      "기본 인적공제는 요건을 충족하는 자녀 1명당 종합소득금액에서 150만원을 공제합니다. 자녀세액공제는 기본공제 대상 자녀·손자녀 중 만 8세 이상 인원에 따라 소득세에서 공제합니다. 소득공제액과 세액공제액은 서로 다른 금액이므로 더해서 환급액으로 계산하지 않습니다.",
  },
  {
    question: "만 8세 이상 자녀의 세액공제는 얼마인가요?",
    answer:
      "2026년 귀속 기준으로 기본공제 대상 자녀·손자녀 중 만 8세 이상이 1명은 25만원, 2명은 합계 55만원, 3명 이상은 55만원에 2명을 초과하는 인원당 40만원을 더합니다. 3명은 95만원, 4명은 135만원입니다. 만 7세는 이 세액공제 대상이 아닙니다.",
  },
  {
    question: "8세 미만 자녀는 어떤 혜택이 있나요?",
    answer:
      "기본공제 요건을 충족하면 1명당 150만원 소득공제가 가능합니다. 6세 이하라는 이유로 100만원 소득공제가 추가되지는 않습니다. 해당 연도에 출산하거나 입양신고한 공제 대상 자녀는 첫째 30만원, 둘째 50만원, 셋째 이후 각 70만원의 출산·입양 세액공제를 따로 확인합니다.",
  },
  {
    question: "맞벌이 부부 누가 자녀공제를 받는 게 유리한가요?",
    answer:
      "같은 자녀를 부부가 중복 공제할 수는 없습니다. 소득공제는 과세표준과 세율의 영향을 받지만, 의료비 문턱·다른 공제·남은 세액도 달라지므로 연봉이 높은 사람에게 무조건 유리하다고 단정할 수 없습니다. 부부 각자의 전체 연말정산 조건으로 비교하세요.",
  },
  {
    question: "자녀공제 한도가 있나요?",
    answer:
      "일반적으로 만 20세 이하, 연간 소득금액 100만원 이하인 부양 자녀가 대상입니다. 근로소득만 있으면 총급여 500만원 이하 기준을 적용합니다. 장애인은 나이 제한이 없지만 소득 요건은 확인해야 합니다. 이 계산기는 조건을 충족하는 인원을 직접 입력하며, 입력 편의를 위해 각 인원 항목을 20명까지 제공합니다. 이는 법정 인원 한도가 아닙니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "자녀 인적공제·세액공제 계산기",
  tagline: "2026 귀속 소득공제·세액공제 구분",
  description:
    "2026년 귀속 기본공제 대상 인원과 만 8세 기준으로 소득공제액·자녀세액공제·출산입양 세액공제를 나눠 계산합니다. 대상 요건과 실제 환급액의 차이도 확인하세요.",
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
              2026년 귀속 <strong className="text-electric">소득공제액과 세액공제액</strong>을 나눠 확인하세요
            </p>
          </header>

          <ChildDeductionClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">어떤 금액을 계산하나요? (2026년 귀속)</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li><strong>기본 인적공제</strong>: 요건을 충족하는 자녀·손자녀 1명당 150만원 (소득공제)</li>
              <li><strong>출산·입양 세액공제</strong>: 첫째 30만, 둘째 50만, 셋째 이상 70만원</li>
              <li><strong>자녀세액공제(기본공제 대상 중 만 8세 이상)</strong>: 1명 25만, 2명 합 55만, 3명부터 40만씩 추가 (소득세 기준)</li>
            </ul>
            <h3>입력 사례로 확인하기</h3>
            <p>만 7세 자녀 1명이 기본공제 대상이고 올해 출산·입양이 없다면 소득공제액은 150만원, 자녀세액공제는 0원입니다. 만 8세 자녀 1명이면 소득공제액은 같은 150만원이고 자녀세액공제 계산액은 25만원입니다.</p>
            <p>첫째·둘째 쌍둥이를 올해 출산했다면 두 명을 8세 미만 인원에 포함하고 출산 항목에서 첫째 1명·둘째 1명을 선택합니다. 기본공제 300만원과 출산 세액공제 80만원은 각각 표시하며 환급액으로 합산하지 않습니다.</p>
            <h3>계산 근거와 확인일</h3>
            <p>2026년 9월 9일 확인. 2027년 시행을 제안한 개편안은 이 계산에 선반영하지 않습니다.</p>
            <ul>
              <li><a href="https://b.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596" target="_blank" rel="noopener noreferrer">국세청: 자녀·출산입양 세액공제</a></li>
              <li><a href="https://www.law.go.kr/법령/소득세법/제50조" target="_blank" rel="noopener noreferrer">소득세법 제50조: 기본공제 요건</a></li>
              <li><a href="https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031622827" target="_blank" rel="noopener noreferrer">소득세법 제51조: 추가공제</a></li>
            </ul>
          </article>

          {/* 본문-FAQ 사이 광고 */}
          <GuideMidAd />

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
              실제 환급액은 최종 결정세액과 기납부세액을 함께 알아야 계산할 수 있습니다. 여기서는 대상 요건을 충족한다고 입력한 인원의 공제액만 계산하며, 소득·부양·중복 공제 요건을 자동 판정하지 않습니다.
            </p>
          </div>

          {/* 연말정산 시리즈 클러스터 — 마지막 광고 아래·RelatedCalculators 직전 고정 (L14', 2026-09-05) */}
          <YearEndTaxCluster />

          <RelatedCalculators currentPath="/calc/child-deduction" />
        </div>
      </main>
    </>
  );
}
