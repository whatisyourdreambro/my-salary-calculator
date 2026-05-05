// src/app/calc/january-bonus/page.tsx
//
// 13월의 월급 (연말정산 환급) 시뮬레이터
// 키워드: "13월의 월급", "연말정산 환급", "연말정산 미리보기"
// 시즌: 매년 1~3월 검색량 폭증

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
import { Sparkles, Info, Calendar, Gift } from "lucide-react";
import JanuaryBonusClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "왜 1월에 받는 월급이 '13월의 월급'이라고 불리나요?",
    answer:
      "한국에서는 연말정산 환급금이 보통 1월~3월 사이 월급에 합산되어 지급되기 때문에 '13월의 월급'이라는 별명이 붙었습니다. 한 해 동안 회사가 매월 미리 떼어간 세금(원천징수)이 실제 확정 세액보다 많았다면 그 차액이 환급되어 1월 월급이 평소보다 많아 보이게 됩니다.",
  },
  {
    question: "환급액이 0원이거나 추징되는 이유는?",
    answer:
      "회사가 1년 동안 정확히 맞는 세금만 원천징수했거나(0원), 부족하게 떼었다면(추징) 환급이 없을 수 있습니다. 특히 연봉이 중간에 급격히 오른 경우, 두 곳 이상에서 근로소득을 받은 경우, 인적공제 변경(결혼·출산)을 회사에 알리지 않은 경우에 추징될 가능성이 높습니다.",
  },
  {
    question: "환급액을 늘리는 방법이 있나요?",
    answer:
      "12월 31일 이전에 다음 항목을 챙기면 환급을 늘릴 수 있습니다: (1) IRP·연금저축 추가 납입(연 900만원 한도, 13.2~16.5% 세액공제), (2) 의료비 영수증 정리(총급여 3% 초과분 15% 공제), (3) 기부금(10만원까지 100% 세액공제), (4) 신용카드·체크카드 사용액 25% 초과분 공제, (5) 주택청약 납입(소득 7천만원 이하 시 40% 공제).",
  },
  {
    question: "맞벌이 부부 연말정산 전략은?",
    answer:
      "총급여가 더 높은 배우자가 인적공제를 받는 것이 유리합니다(높은 한계세율 구간이므로 절세 효과가 큼). 의료비·교육비·기부금은 한 사람에게 몰아서 신청하면 공제 임계값(3%, 600만원 한도 등)을 더 효율적으로 넘길 수 있습니다. 부부 연말정산 시뮬레이션을 해서 최적 조합을 찾으세요.",
  },
  {
    question: "환급금은 정확히 언제 받나요?",
    answer:
      "회사가 2월 말까지 연말정산을 마치고, 보통 2월 또는 3월 급여에 환급금이 합산되어 지급됩니다. 일부 회사는 별도 계좌로 따로 입금하기도 합니다. 5월 종합소득세 신고 대상자(N잡러·프리랜서 등)는 5월에 환급받습니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "13월의 월급 시뮬레이터",
  tagline: "연말정산 환급액 미리보기 — 카드·의료비·IRP까지",
  description:
    "13월의 월급, 즉 연말정산 환급액을 미리 계산해보세요. 신용카드 사용액, IRP 납입, 의료비 공제 등 주요 공제 항목을 입력하면 환급/추징 예상액을 즉시 확인할 수 있습니다.",
  path: "/calc/january-bonus",
  keywords: [
    "13월의 월급",
    "연말정산 환급",
    "연말정산 미리보기",
    "환급금 계산기",
    "연말정산 시뮬레이터",
    "1월 월급",
    "환급액 계산",
  ],
});

export default function JanuaryBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "13월의 월급 시뮬레이터",
            description: "연말정산 환급/추징 예상액을 카드·IRP·의료비 입력으로 미리 계산합니다.",
            url: "/calc/january-bonus",
          }),
          autoBreadcrumbLd("/calc/january-bonus", {
            leafName: "13월의 월급 시뮬레이터",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Gift size={12} /> 시즌 1~3월
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              13월의 월급 시뮬레이터
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              내 환급액 <strong className="text-electric">미리 확인</strong>하고 절세 전략 세우기
            </p>
          </header>

          <JanuaryBonusClient />

          {/* 콘텐츠 */}
          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              연말정산 환급, 어떻게 계산되나?
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              회사는 매월 월급 지급 시 <strong>간이세액표</strong> 기준으로 세금을 미리 떼어
              국세청에 납부합니다. 하지만 실제 확정 세액은 1년치 소득과 공제 항목을 모두
              합산한 후 다음해 1~2월 연말정산에서 재계산됩니다. 두 금액이 차이가 나면
              <strong className="text-emerald-600"> 환급</strong> 또는
              <strong className="text-rose-600"> 추징</strong>이 발생합니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              환급 극대화 5단계 전략
            </h2>
            <ol className="space-y-3 text-muted-blue dark:text-canvas-300">
              <li>
                <strong className="text-navy dark:text-canvas-50">신용카드 25% 초과분 공제</strong>
                <br />
                총급여의 25%를 초과한 카드·체크카드·현금영수증 사용액의 일정 비율(15~30%)을
                소득공제. 한도 250~300만원.
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">IRP/연금저축 납입</strong>
                <br />
                연 900만원 한도, 13.2~16.5% 세액공제. 12월 말 일시납으로도 가능. 환급
                극대화의 가장 강력한 도구.
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">의료비 공제</strong>
                <br />
                총급여의 3%를 초과한 의료비의 15% 세액공제. 부양가족 의료비 합산 가능.
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">기부금 공제</strong>
                <br />
                기부금 10만원까지 100% 세액공제, 초과분은 15~30% 세액공제. 종교단체·정당·
                인증 비영리단체 모두 가능.
              </li>
              <li>
                <strong className="text-navy dark:text-canvas-50">월세 세액공제</strong>
                <br />
                총급여 7천만원 이하 무주택자, 연 750만원 한도, 15~17% 세액공제. 소득에 따라
                다름.
              </li>
            </ol>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              연말정산 일정표 (2026년)
            </h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>1/15~2/15</strong> — 회사에 연말정산 자료 제출 (간소화서비스 + 누락분)
              </li>
              <li>
                <strong>2월 말</strong> — 회사 연말정산 완료, 환급/추징 결정
              </li>
              <li>
                <strong>2~3월 급여</strong> — 환급금 합산 또는 추징금 차감
              </li>
              <li>
                <strong>5월</strong> — 종합소득세 신고 (N잡러·프리랜서 추가 정산)
              </li>
            </ul>
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

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 시뮬레이션은 주요 공제 항목만 반영한 추정치입니다. 정확한 환급액은 국세청
              연말정산 간소화 서비스(<Link href="/year-end-tax-2026" className="text-electric font-bold underline">2026 가이드</Link>)에서 자료를 제출한 후 회사가 산정합니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/january-bonus" />
        </div>
      </main>
    </>
  );
}
