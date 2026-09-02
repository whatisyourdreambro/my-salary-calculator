// /calc/voluntary-retirement — 희망퇴직 위로금 실수령 계산기 (2026-08-31 신설, P2 승인 배치)
// ★광고 실험 D2a 등 실험군 임의 편입 금지 (실험 동시 1개 원칙)
//
// 키워드 축: "희망퇴직 위로금 세금/실수령" 전용 — "퇴직금 계산기" 헤드어는 /tools/finance/severance 소유(침범 금지).
// 세액 로직 정본: src/lib/severanceCalculator.ts calculateSeveranceTax 재사용.
//   위로금(명예퇴직수당)은 소득세법 제22조에 따라 퇴직소득 → 법정퇴직금과 합산해 퇴직소득세로 과세.
// 갱신 슬롯: 2026-12 세법개정 확인 — 퇴직소득 근속연수공제·환산급여공제·기본세율 개정 여부
//   (개정 시 정본 모듈 severanceCalculator.ts와 본문 산식 설명을 함께 갱신)
// 갱신 슬롯: 실업급여 상·하한액 고시 변경 시 /unemployment-benefit 정본과 함께 점검 (본 페이지는 요건 서술만, 금액 미기재)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { Briefcase, Info, ArrowRight } from "lucide-react";
import VoluntaryRetirementClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "희망퇴직 위로금에도 세금이 붙나요?",
    answer:
      "네. 명예퇴직수당·희망퇴직 위로금처럼 퇴직을 원인으로 회사에서 받는 금품은 소득세법 제22조에 따라 퇴직소득으로 분류됩니다. 법정퇴직금과 합산해 한 번의 퇴직소득세로 과세되며, 회사가 지급 시 원천징수합니다. 다만 퇴직소득은 근로소득과 분리해 분류과세되므로 종합소득세에 합산되지 않고, 근속연수공제·환산급여공제가 적용되어 같은 금액의 근로소득보다 세부담이 낮은 편입니다.",
  },
  {
    question: "희망퇴직하면 실업급여를 받을 수 있나요?",
    answer:
      "조건부로 가능합니다. 실업급여(구직급여)는 이직 사유로 판단하는데, 고용보험법 시행규칙 별표2는 '사업의 양도·인수·합병, 일부 사업의 폐지·업종전환, 조직의 폐지·축소, 신기술 도입 등에 따른 경영상 필요에 의한 인원감축 방침에 따라 사업주로부터 퇴직을 권고받거나 희망퇴직 모집에 응하여 이직한 경우'를 정당한 이직 사유로 인정합니다. 즉 회사의 경영상 인원감축 방침에 따른 희망퇴직이어야 하고, 개인 사정에 의한 단순 자발적 사직은 인정되지 않습니다. 이직확인서의 이직 사유 코드가 중요하며, 최종 수급 자격 판단은 관할 고용센터가 합니다.",
  },
  {
    question: "위로금을 많이 받으면 실업급여가 깎이나요?",
    answer:
      "위로금 수령 자체가 수급 자격을 없애지는 않습니다. 다만 수급 자격은 위 별표2 요건(경영상 인원감축에 따른 권고·희망퇴직 모집 응모) 충족 여부로 판단하므로, 위로금을 받았는지가 아니라 '왜 이직했는지'가 핵심입니다. 구체적 사안은 고용센터에 이직확인서 기준으로 확인하세요.",
  },
  {
    question: "위로금 '월급 × N개월'은 법으로 정해져 있나요?",
    answer:
      "아니요. 법정 기준이 없습니다. 위로금 규모는 회사 사규·이사회 결의·노사 합의로 정하며, 같은 회사 안에서도 직급·근속·연령에 따라 다르게 설계되는 것이 일반적입니다. 본 계산기는 회사가 제시한 조건(개월 수 또는 금액)을 그대로 입력해 세후 금액을 확인하는 용도입니다.",
  },
  {
    question: "퇴직소득세는 어떻게 계산되나요?",
    answer:
      "① 퇴직급여(법정퇴직금+위로금)에서 근속연수공제를 빼고 ② 근속연수로 나눠 12를 곱해 환산급여를 만든 뒤 ③ 환산급여공제를 빼 과세표준을 구하고 ④ 기본세율(6~45%)을 적용한 환산산출세액을 ⑤ 다시 12로 나눠 근속연수를 곱합니다(소득세법 제48조·제55조). 연분연승 구조라서 근속이 길수록, 금액이 같아도 세금이 크게 줄어듭니다.",
  },
  {
    question: "위로금을 IRP로 받으면 세금을 아낄 수 있나요?",
    answer:
      "네. 퇴직급여를 IRP(개인형 퇴직연금)로 이전하면 퇴직소득세 과세가 이연되고, 55세 이후 연금으로 나눠 받으면 이연된 퇴직소득세의 30%(연금수령 11년차부터는 40%)가 감면됩니다. 55세 이전 퇴직 시 퇴직급여는 원칙적으로 IRP 계좌로 지급되며, 일시금으로 찾으면 감면 없이 즉시 과세됩니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "희망퇴직 위로금 실수령 계산기",
  tagline: "위로금 세금·퇴직소득세 합산 — 세후 실수령액",
  description:
    "희망퇴직 위로금(월급×N개월)과 법정퇴직금을 합산한 퇴직소득세·세후 실수령액을 계산합니다. 위로금에만 붙는 추가 세부담과 한계 실효세율, 실업급여 수급 요건까지. 소득세법 22조 합산 과세 기준.",
  path: "/calc/voluntary-retirement",
  keywords: [
    "희망퇴직 위로금 세금",
    "희망퇴직 위로금 실수령",
    "희망퇴직 위로금 계산",
    "명예퇴직금 세금",
    "위로금 퇴직소득세",
    "희망퇴직 실업급여",
  ],
});

export default function VoluntaryRetirementPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "희망퇴직 위로금 실수령 계산기",
            description:
              "희망퇴직 위로금과 법정퇴직금을 합산한 퇴직소득세·세후 실수령액, 위로금만의 한계 세부담을 자동 계산합니다.",
            url: "/calc/voluntary-retirement",
          }),
          autoBreadcrumbLd("/calc/voluntary-retirement", { leafName: "희망퇴직 위로금 실수령 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Briefcase size={12} /> 소득세법 22조 합산 과세
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              희망퇴직 위로금 실수령 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              위로금 + 법정퇴직금 <strong className="text-electric">합산 퇴직소득세</strong>와 세후 실수령액 즉시 계산
            </p>
          </header>

          <VoluntaryRetirementClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">위로금 세금, 왜 법정퇴직금과 합산하나</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              희망퇴직 위로금(명예퇴직수당)은 &ldquo;퇴직을 원인으로&rdquo; 회사에서 받는 금품이므로
              소득세법 제22조에 따라 <strong>근로소득이 아닌 퇴직소득</strong>으로 분류됩니다. 따라서
              법정퇴직금과 <strong>합산한 금액 전체에 한 번의 퇴직소득세</strong>가 매겨지고, 회사가
              지급하는 달에 원천징수를 마칩니다. 퇴직소득은 분류과세라서 다음 해 종합소득세나
              건강보험료 산정에 합산되지 않으며, 근속연수공제와 환산급여공제 덕분에 같은 금액을
              연봉으로 받을 때보다 세부담이 훨씬 낮습니다. 본 계산기는 합산 세액에서 법정퇴직금만의
              세액을 빼는 방식으로 <strong>&ldquo;위로금에만 붙는 추가 세부담&rdquo;</strong>과 한계
              실효세율을 함께 보여줍니다. (기준일 2026-08-31 현행 소득세법)
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">퇴직소득세 계산 구조 (소득세법 48조·55조)</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>퇴직급여 합계 = 법정퇴직금 + 희망퇴직 위로금 (합산 과세)</li>
              <li>근속연수공제 차감 → ÷ 근속연수 × 12 = 환산급여 (연분연승)</li>
              <li>환산급여공제 차감 → 과세표준 × 기본세율(6~45%) = 환산산출세액</li>
              <li>환산산출세액 ÷ 12 × 근속연수 = 산출세액 (+ 지방소득세 10%)</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              연분연승 구조 때문에 <strong>근속이 길수록 같은 위로금이라도 세금이 크게 줄어듭니다</strong>.
              법정퇴직금의 정확한 산정(퇴사 전 3개월 평균임금 기준)은 별도 상세 도구에서 확인하세요.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">실업급여는 &lsquo;조건부&rsquo;로만 가능</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              희망퇴직이라고 해서 실업급여(구직급여)가 무조건 나오는 것이 아닙니다. 고용보험법
              시행규칙 별표2는 <strong>&ldquo;경영상 필요에 의한 인원감축 방침에 따라 사업주로부터
              퇴직을 권고받거나 희망퇴직 모집에 응하여 이직한 경우&rdquo;만</strong> 수급이 가능한
              정당한 이직 사유로 인정합니다. 회사의 인원감축 방침 없이 개인 사정으로 사직서를 내면
              자발적 이직으로 분류되어 수급 자격이 없습니다. 이직확인서에 적히는 이직 사유가
              판단의 출발점이므로 퇴직 전 반드시 확인하고, 최종 자격 판단은 관할 고용센터가 합니다.
              위로금 수령 여부 자체는 수급 자격과 무관합니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">위로금 &lsquo;월급 × N개월&rsquo;은 회사마다 다르다</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              희망퇴직 위로금은 법정 기준이 없어 <strong>회사 사규·이사회 결의·노사 합의로 정해지며,
              같은 회사 안에서도 직급·근속·연령에 따라 조건이 다르게 설계</strong>되는 것이
              일반적입니다. 통상 &lsquo;월급 × N개월&rsquo; 방식이 널리 쓰이지만 N의 크기, 기준이
              되는 월급(기본급인지 평균임금인지), 별도 지원금(학자금·전직지원금 등) 포함 여부는
              전부 회사 제시 조건에 따릅니다. 본 계산기에는 회사가 제시한 조건을 그대로 입력하세요.
            </p>
          </article>

          {/* 본문-FAQ 사이 광고 */}
          <InArticleAd />

          {/* 광고 아래 내부링크 — 다음 단계 동선 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">다음 단계에서 확인할 것</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: "/unemployment-benefit", title: "실업급여 계산기", desc: "희망퇴직 후 구직급여 — 수급 요건·예상 수령액" },
                { href: "/tools/finance/severance", title: "퇴직금 상세 계산", desc: "퇴사 전 3개월 평균임금 기준 법정퇴직금 정밀 산정" },
                { href: "/calc/severance-vs-pension", title: "퇴직금 vs 퇴직연금 비교", desc: "DB·DC·IRP — 일시금과 연금 수령 실수령 비교" },
                { href: "/tools/finance/irp", title: "IRP 절세 계산기", desc: "위로금 IRP 이전 시 과세이연·연금수령 감면 효과" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 hover:border-electric transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-navy dark:text-canvas-50">{l.title}</span>
                    <ArrowRight size={16} className="text-electric shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-faint-blue leading-relaxed">{l.desc}</p>
                </Link>
              ))}
            </div>
          </section>

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

          {/* FAQ 직하 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
          <GuideMidAd />

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 2026-08-31 현행 소득세법(제22조·제48조·제55조) 기준의 참고용 시뮬레이션입니다.
              법정퇴직금은 월평균임금 기반 근사치이며 실제 지급액은 평균임금 산정·회사 규정에 따라
              달라질 수 있습니다. 실업급여 수급 자격(고용보험법 시행규칙 별표2)은 이직확인서 기준으로
              관할 고용센터가 최종 판단하며, 위로금 조건·세부 협의는 회사 공고와 노무사 등 전문가
              상담으로 확인하세요.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/voluntary-retirement" />
        </div>
      </main>
    </>
  );
}
