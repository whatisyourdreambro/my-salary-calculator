// /calc/dependent-check — 연말정산 부양가족 인적공제 판정기 (2026-08-31 신설, 승인 배치)
// 룰 판정형: 소득세법 50~53조 요건(관계·나이·소득·생계)을 문항으로 받아
// 기본공제 150만원 가능/불가 + 추가공제를 판정한다. 룰 정본은
// src/lib/dependentEligibility.ts (금액은 yearEndTaxCalculator 인라인 값과 정합).
// 갱신 슬롯: 2026-12 말 — 소득요건 완화(100만→300만) 개편안 통과 여부 확인

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { Users, Info } from "lucide-react";
import DependentCheckClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "부양가족의 '연간 소득금액 100만원'은 무엇을 기준으로 하나요?",
    answer:
      "총수입이 아니라 소득금액(수입에서 필요경비·법정공제를 뺀 금액)입니다. 근로소득만 있는 가족은 특례로 총급여 500만원 이하면 충족합니다. 일용근로소득(분리과세)·기초연금 등 비과세·분리과세 소득은 소득금액에 넣지 않지만, 사업·연금·금융소득은 물론 그 해의 양도소득·퇴직소득까지 합산해 100만원을 넘으면 공제 대상이 아닙니다. 2026년 귀속분(2027년 1~2월 정산) 기준입니다.",
  },
  {
    question: "따로 사는 부모님도 기본공제를 받을 수 있나요?",
    answer:
      "네. 직계존속은 주거 형편상 별거해도 실제로 부양(생활비 지원 등)하고 있으면 생계를 같이 하는 것으로 봅니다(소득세법 53조 2항). 만 60세 이상·소득금액 100만원 이하 요건을 충족하면 공제 가능합니다. 단, 형제 여러 명이 같은 부모님을 각자 공제받을 수는 없으므로 형제간에 한 명만 공제 신고해야 합니다.",
  },
  {
    question: "국민연금을 받는 부모님도 인적공제 대상이 되나요?",
    answer:
      "과세대상 연금액에 달려 있습니다. 공적연금은 연금소득공제를 빼고 남는 연금소득금액이 100만원 이하여야 하는데, 연금소득공제 구조상 과세대상 연금액이 연 약 516만원 이하면 충족합니다. 2001년 이전 가입기간에 해당하는 국민연금 수령분과 기초연금은 과세 제외라 계산에 넣지 않습니다. 연금 외 다른 소득이 있으면 합산해 판단합니다.",
  },
  {
    question: "만 20세가 넘은 자녀는 아무 공제도 못 받나요?",
    answer:
      "기본공제(150만원)는 만 20세 이하(2026년 귀속은 2006년 이후 출생)까지만 가능하고, 장애인인 자녀는 나이와 무관하게 가능합니다. 다만 나이 요건을 초과한 자녀라도 소득금액 100만원 이하라면 그 자녀를 위해 지출한 교육비·의료비·신용카드 사용액 등 일부 항목은 공제받을 수 있습니다(나이 요건은 기본공제에만 적용).",
  },
  {
    question: "장인·장모, 시부모님도 공제 대상인가요? 며느리·사위는요?",
    answer:
      "배우자의 직계존속(장인·장모·시부모)은 직계존속과 동일하게 만 60세 이상·소득 요건 충족 시 공제 가능합니다. 반면 며느리·사위, 삼촌·이모, 조카는 원칙적으로 기본공제 대상이 아닙니다. 예외로 기본공제 대상인 직계비속과 그 배우자가 모두 장애인이면 그 배우자(며느리·사위)도 공제 대상에 포함됩니다(소득세법 50조).",
  },
  {
    question: "소득요건이 300만원으로 완화된다던데 이번 연말정산에 적용되나요?",
    answer:
      "아닙니다. 2026년 8월 3일 발표된 세제개편안에 부양가족 소득요건을 연 100만원에서 300만원으로 완화하는 내용이 담겼지만, 국회 통과가 필요하고 통과되더라도 2027년 귀속분(2028년 초 정산)부터 적용됩니다. 2026년 귀속분인 이번 정산(2027년 1~2월)은 종전대로 소득금액 100만원(근로소득만 있으면 총급여 500만원) 기준으로 판정해야 합니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "부양가족 인적공제 판정기",
  tagline: "관계·나이·소득으로 기본공제 150만원 즉시 판정",
  description:
    "부모님·배우자·자녀·형제자매가 연말정산 기본공제(150만원) 대상인지 관계·출생연도·소득·동거 여부로 즉시 판정합니다. 경로우대·장애인 추가공제와 미충족 사유까지 소득세법 50~53조 기준으로 안내.",
  path: "/calc/dependent-check",
  keywords: [
    "부양가족 인적공제",
    "인적공제 기준",
    "부양가족 기준",
    "부모님 인적공제 나이",
    "인적공제 소득기준 100만원",
    "연말정산 부양가족 등록",
  ],
});

export default function DependentCheckPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "부양가족 인적공제 판정기",
            description: "관계·나이·소득·동거 여부로 연말정산 기본공제 가능 여부와 추가공제를 즉시 판정합니다.",
            url: "/calc/dependent-check",
          }),
          autoBreadcrumbLd("/calc/dependent-check", { leafName: "부양가족 인적공제 판정기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Users size={12} /> 2026년 귀속 연말정산
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              부양가족 인적공제 판정기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              관계·나이·소득 몇 문항으로 <strong className="text-electric">기본공제 150만원</strong> 가능 여부 즉시 판정
            </p>
          </header>

          <DependentCheckClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">기본공제 요건 한눈에 (소득세법 50·53조)</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              부양가족 1명이 기본공제 대상이 되면 <strong>과세표준에서 150만원이 차감</strong>됩니다.
              요건은 세 가지 — ① 나이, ② 소득, ③ 생계를 같이 할 것 — 이며 셋 중 하나라도
              어긋나면 공제받을 수 없습니다. 관계별 나이 기준(2026년 귀속)은 다음과 같습니다.
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li><strong>직계존속</strong>(부모·조부모, 배우자의 직계존속 포함): 만 60세 이상 — 1966년 12월 31일 이전 출생</li>
              <li><strong>배우자</strong>: 나이 요건 없음</li>
              <li><strong>직계비속·입양자</strong>(자녀·손자녀): 만 20세 이하 — 2006년 1월 1일 이후 출생</li>
              <li><strong>형제자매</strong>: 만 20세 이하 또는 만 60세 이상</li>
              <li><strong>장애인</strong>: 관계 요건만 맞으면 나이 요건 면제 (소득 요건은 동일하게 적용)</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              소득 요건은 <strong>연간 소득금액 100만원 이하</strong>(근로소득만 있으면 총급여
              500만원 이하)입니다. 생계 요건은 관계마다 달라서, 배우자·직계비속은 따로 살아도
              무방하고, 직계존속은 주거 형편상 별거 시 실제 부양하면 인정되며, 형제자매만
              동거(취학·요양·근무·사업상 일시 퇴거는 허용)가 필요합니다(소득세법 53조).
            </p>

            {/* 본문 중간 광고 — 기본공제 요건/추가공제 섹션 경계 — 전면 최적화 (운영자 지시 2026-09-02) */}
            <GuideMidAd />

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">추가공제 4종 (소득세법 51조)</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li><strong>경로우대 100만원</strong>: 기본공제 대상자가 만 70세 이상(1956년 이전 출생)이면 1명당 추가</li>
              <li><strong>장애인 200만원</strong>: 기본공제 대상자가 소득세법상 장애인이면 1명당 추가</li>
              <li><strong>부녀자 50만원</strong>: 근로자 본인이 종합소득금액 3,000만원 이하 여성으로, 배우자가 있거나 기본공제 부양가족이 있는 세대주인 경우</li>
              <li><strong>한부모 100만원</strong>: 근로자 본인이 배우자 없이 기본공제 대상 직계비속·입양자를 부양하는 경우 (부녀자 공제와 중복 시 한부모만 적용)</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              경로우대·장애인 공제는 판정기가 자동 반영하며, 부녀자·한부모 공제는 부양가족이
              아니라 <strong>근로자 본인의 요건</strong>이므로 결과와 별도로 본인 조건을 확인해
              적용하면 됩니다. 판정을 마쳤다면{" "}
              <Link href="/year-end-tax" className="text-electric font-bold hover:underline">
                연말정산 계산기
              </Link>
              에 공제 대상자 수를 넣어 환급액을 확인하고, 자녀가 있다면{" "}
              <Link href="/calc/child-deduction" className="text-electric font-bold hover:underline">
                자녀공제 계산기
              </Link>
              에서 자녀세액공제까지 함께 계산해 보세요.
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
              본 판정기는 소득세법 50~53조와 국세청 연말정산 안내(2026년 귀속, 기준일
              2026-08-31)에 따른 일반 기준입니다. 같은 부양가족을 맞벌이 부부·형제가 중복
              공제할 수 없고, 소득금액 산정(비과세·분리과세 구분 등)은 개별 사정에 따라
              달라질 수 있으니 홈택스 간소화 자료와 함께 최종 확인하세요.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/dependent-check" />
        </div>
      </main>
    </>
  );
}
