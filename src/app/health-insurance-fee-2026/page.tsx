// src/app/health-insurance-fee-2026/page.tsx
// 건강보험료 계산기 — 직장가입자 / 지역가입자 / 피부양자 전환 시점 확인

import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import HealthInsuranceFeeClient from "./HealthInsuranceFeeClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 건강보험료 계산기 — 직장가입자·지역가입자·임의계속 비교",
  description:
    "월급 400만원이면 본인 건보료 약 16만원, 600만원이면 약 24만원. 2026 직장가입자 보험료율 3.545% + 장기요양 0.459% 자동 계산. 지역가입자·임의계속가입 비교까지.",
  path: "/health-insurance-fee-2026",
  keywords: [
    "건강보험료 계산기",
    "2026 건보료",
    "건강보험료 계산",
    "직장가입자 건보료",
    "지역가입자 건보료",
    "임의계속 가입",
    "피부양자 조건",
    "건강보험료율",
    "장기요양보험료",
  ],
});

const FAQS = [
  {
    q: "2026년 건강보험료율은 얼마인가요?",
    a: "직장가입자는 보수월액의 7.09%(본인 3.545% + 회사 3.545%) + 장기요양보험료 12.95%(건보료의)를 추가 부담합니다. 본인 총 부담은 약 4.004%(3.545% + 0.459%) 수준입니다. 즉 월 400만원이면 본인 약 16만원, 회사도 16만원을 분담합니다.",
  },
  {
    q: "지역가입자 건강보험료는 어떻게 계산되나요?",
    a: "지역가입자는 소득·재산·자동차 점수를 합산해 점수당 약 200원(2026 기준)을 곱해 산정합니다. 자영업·프리랜서·은퇴자에 해당하며, 점수 산정 방식이 복잡해 평균 부담은 직장가입자보다 큽니다. 통상 월 20~40만원 수준이지만 재산이 많으면 100만원 이상도 가능합니다.",
  },
  {
    q: "퇴직 후 건강보험료는 어떻게 되나요?",
    a: "퇴직하면 자동으로 지역가입자로 전환되며 보험료가 크게 오를 수 있습니다. 이를 막기 위해 ① 가족(배우자·부모·자녀)의 피부양자로 등록 (소득·재산 요건 충족 시), 또는 ② 임의계속가입 신청(퇴직 후 2개월 이내, 최대 36개월간 직장가입자 보험료로 납부) 두 가지 옵션이 있습니다.",
  },
  {
    q: "피부양자 등록 요건은 어떻게 되나요?",
    a: "① 연소득 2,000만원 이하 (사업소득은 사실상 0원, 근로·연금소득은 합산 2,000만원), ② 재산세 과세표준 5억 4천만원 이하 (소득 있으면 더 엄격), ③ 본인 직장가입자에 부양받을 가족 관계. 2022년 11월 요건 강화로 이전 피부양자 다수가 지역가입자로 전환됐습니다.",
  },
  {
    q: "임의계속가입은 무엇이고 왜 좋나요?",
    a: "퇴직 후 2개월 이내 신청하면 최대 36개월간 직장가입자 시절 보험료(본인 + 회사분 모두 본인 부담)로 납부할 수 있습니다. 지역가입자 전환 시 보험료가 2~3배 뛰는 경우가 많아, 재산은 있는데 소득은 줄어든 은퇴자에게 절대적으로 유리합니다.",
  },
  {
    q: "본인부담상한제는 무엇인가요?",
    a: "1년간 본인이 부담한 의료비가 일정 한도(소득 분위별 87만원~808만원)를 넘으면 다음해 8월 자동 환급됩니다. 큰 수술이나 만성질환으로 본인부담이 컸다면 별도 신청 없이 환급되니, 건강보험공단에서 본인 분위와 환급 예정 금액을 확인하세요.",
  },
];

const HOWTO_STEPS = [
  { name: "가입 유형 선택", text: "직장가입자 / 지역가입자 중 본인 상황 선택." },
  { name: "월 보수액 입력", text: "직장가입자는 비과세 제외 월 보수액 (식대 20만원 등 제외)." },
  { name: "결과 확인", text: "본인 부담 건보료 + 장기요양보험료 + 회사 분담분(직장)이 표시됩니다." },
];

export default function HealthInsuranceFee2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/health-insurance-fee-2026", { leafName: "2026 건강보험료 계산기" }),
          softwareApplicationLd({
            name: "2026 건강보험료 계산기",
            description: "직장가입자/지역가입자 건강보험료 + 장기요양보험료 자동 산출",
            url: "/health-insurance-fee-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026 건강보험료 계산법",
            description: "월 보수액으로 직장가입자/지역가입자 건보료 1분 산출",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/health-insurance-fee-2026" leafName="건강보험료 계산기 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            국민건강보험 NHIS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            2026 건강보험료 계산기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            월 보수액 또는 소득·재산 점수를 입력하면 본인 부담 건강보험료 + 장기요양보험료를 즉시
            계산합니다. 직장가입자(3.545% + 0.459%) vs 지역가입자(점수 기반) 비교, 퇴직 후
            임의계속가입 vs 피부양자 전환 시뮬레이션 가능. 2026년 보험료율 기준입니다.
          </p>
        </header>

        <HomeTopAd />

        <HealthInsuranceFeeClient />

        <CalcResultAd />

        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            직장가입자 vs 지역가입자 — 어떤 차이가 있나?
          </h2>
          <p>
            <strong>직장가입자</strong>는 보수월액의 7.09%를 회사와 절반씩 분담하며, 부양가족은
            피부양자로 무료 등재됩니다. <strong>지역가입자</strong>는 자영업·프리랜서·은퇴자가
            해당하며, 소득·재산·자동차 점수 합산으로 산정해 단독 부담합니다. 동일 소득이라도
            지역가입자 보험료가 1.5~2배 높은 경우가 일반적입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            퇴직 후 건강보험 — 3가지 옵션
          </h2>
          <ol>
            <li><strong>피부양자 등재 (무료)</strong>: 가족 직장가입자에 등록. 단 연소득 2천만원 이하 + 재산세 과세표준 5.4억 이하 필요.</li>
            <li><strong>임의계속가입 (직장 시절 수준)</strong>: 퇴직 후 2개월 이내 신청, 최대 36개월간 본인+회사분 모두 본인 부담. 재산은 있는데 소득 줄어든 은퇴자에게 유리.</li>
            <li><strong>지역가입자 (점수 기반)</strong>: 위 둘 다 안 되면 자동 전환. 재산 많으면 매월 100만원+도 가능.</li>
          </ol>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            건강보험료 절감 전략
          </h2>
          <ul>
            <li><strong>비과세 식대 활용</strong>: 월 20만원 비과세는 보수월액에서 제외 → 건보료도 줄어듦 (연 약 9~10만원 절감)</li>
            <li><strong>피부양자 적극 등재</strong>: 무직·저소득 가족을 본인 피부양자로 등록</li>
            <li><strong>임의계속가입 검토</strong>: 퇴직 직전 재산이 많다면 거의 무조건 유리</li>
            <li><strong>본인부담상한제 환급 확인</strong>: 의료비 부담 컸다면 다음해 8월 자동 환급</li>
          </ul>
        </section>

        <InArticleAd />

        <section className="my-10">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
                  Q. {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-blue dark:text-canvas-300">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />

        {/* 14차 — RelatedCalculators 추가 (dead-end 차단) */}
        <RelatedCalculators currentPath="/health-insurance-fee-2026" title="건보료와 함께 보면 좋은 도구" />

        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">함께 보면 좋은 계산기</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">연봉 실수령액 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">4대보험·소득세 자동 공제</p>
            </Link>
            <Link href="/health-insurance-2026" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">7월 건보료 정산 가이드</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">작년 소득 기준 정산금</p>
            </Link>
            <Link href="/national-pension-estimate-2026" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">국민연금 예상수령액</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">가입기간별 월 수령액</p>
            </Link>
            <Link href="/income-tax-2026" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">종합소득세 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">8단계 누진세율 산출</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
