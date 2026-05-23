// src/app/national-pension-estimate-2026/page.tsx
// 국민연금 예상수령액 계산기 — 40·50대 검색 폭증 키워드

import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import NationalPensionClient from "./NationalPensionClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 국민연금 예상수령액 계산기 — 가입기간·평균소득별 월 연금액",
  description:
    "가입 30년 평균소득 400만원이면 월 약 130~150만원, 40년 가입 시 월 약 170~190만원 수령 예상. 2026 국민연금 가입기간·소득대체율 41.5%·노령연금 수급 시점까지 즉시 확인.",
  path: "/national-pension-estimate-2026",
  keywords: [
    "국민연금 계산기",
    "국민연금 예상수령액",
    "2026 국민연금",
    "노령연금 수령액",
    "국민연금 가입기간",
    "국민연금 소득대체율",
    "국민연금 수령 시점",
    "조기노령연금",
    "국민연금 임의가입",
  ],
});

const FAQS = [
  {
    q: "국민연금 수령 시점은 언제부터인가요?",
    a: "1969년생 이후는 만 65세부터 노령연금을 받습니다(2033년 도달 시점). 출생연도별로 단계적으로 수령 개시 연령이 늦춰져 있으며, 1953~1956년생 만 61세, 1957~1960년생 만 62세, 1961~1964년생 만 63세, 1965~1968년생 만 64세, 1969년 이후 만 65세입니다. 만 60세부터 조기노령연금 신청도 가능하나 1년 조기 수령 시 약 6% 감액됩니다.",
  },
  {
    q: "가입기간이 짧으면 어떻게 되나요?",
    a: "최소 10년(120개월) 이상 가입해야 노령연금을 받을 수 있습니다. 10년 미만이면 반환일시금(납입한 보험료 + 이자)으로 받게 됩니다. 가입기간이 부족한 경우 만 60세 이후라도 임의계속가입(최대 5년)으로 가입기간을 채울 수 있습니다.",
  },
  {
    q: "국민연금 소득대체율 41.5%는 무엇인가요?",
    a: "40년 가입 시 가입 중 평균소득의 약 41.5%를 연금으로 받게 된다는 의미입니다. 즉 평균소득 400만원이라면 월 약 166만원이 노령연금으로 지급됩니다. 가입기간이 짧을수록 비례 감소하며, 30년이면 약 31%, 20년이면 약 20.75% 수준입니다.",
  },
  {
    q: "국민연금 보험료는 얼마를 내나요?",
    a: "직장가입자는 보수월액의 9%(본인 4.5% + 회사 4.5%)를 분담합니다. 지역가입자(자영업·프리랜서)는 본인이 9% 전액 부담합니다. 보수월액 상한 590만원(2026 기준)까지 적용되어 월 최대 보험료는 약 53만원이며, 그 이상 소득은 추가 보험료 없습니다.",
  },
  {
    q: "조기노령연금을 받으면 얼마나 손해인가요?",
    a: "정상 수령 연령보다 5년 일찍 받으면 매년 6%씩 총 30% 감액됩니다(평생). 예: 월 100만원 수령 예정자가 60세에 조기 수령하면 평생 월 70만원만 받습니다. 단 70세 이후까지 일하지 않을 계획이거나 건강이 좋지 않다면 조기 수령이 유리할 수도 있어 본인 상황에 따라 결정해야 합니다.",
  },
  {
    q: "주부·전업주부도 국민연금을 받을 수 있나요?",
    a: "임의가입(만 18~60세, 본인 신청)으로 국민연금에 가입할 수 있습니다. 보험료는 본인이 신고한 소득(중위소득 기준 약 9만~53만원 사이)을 기준으로 산정되며, 10년 이상 납입하면 노령연금 수급 자격이 생깁니다. 평균 임의가입자는 월 9~15만원 납입으로 가입을 유지합니다.",
  },
];

const HOWTO_STEPS = [
  { name: "가입기간 입력", text: "현재까지 또는 예상되는 총 가입기간(년)을 입력합니다." },
  { name: "평균 월소득 입력", text: "가입기간 중 평균 월소득(현재 가치 기준)을 입력합니다." },
  { name: "결과 확인", text: "소득대체율 41.5% 기반 예상 월 노령연금액이 표시됩니다." },
];

export default function NationalPensionEstimate2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/national-pension-estimate-2026", {
            leafName: "2026 국민연금 예상수령액 계산기",
          }),
          softwareApplicationLd({
            name: "2026 국민연금 예상수령액 계산기",
            description: "가입기간·평균소득별 월 노령연금 예상액 산출",
            url: "/national-pension-estimate-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026 국민연금 예상수령액 계산법",
            description: "가입기간과 평균 월소득으로 월 노령연금 예상액 1분 산출",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/national-pension-estimate-2026" leafName="국민연금 예상수령액 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            노후 준비 핵심 도구
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            2026 국민연금 예상수령액 계산기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            가입기간과 평균 월소득을 입력하면 만 65세부터 받게 될 월 노령연금 예상액을 즉시
            계산합니다. 40년 가입 기준 소득대체율 41.5%, 30년 약 31% 비례 적용. 임의가입·조기노령연금
            검토에도 활용하세요. 정확한 금액은 NPS(국민연금공단) 모의계산을 참고하세요.
          </p>
        </header>

        <HomeTopAd />

        <NationalPensionClient />

        <CalcResultAd />

        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            국민연금 = "최소 10년 가입 → 만 65세부터 평생 지급"
          </h2>
          <p>
            국민연금은 최소 10년(120개월) 이상 가입한 사람이 노령연금 수급 연령에 도달하면 평생 매월
            지급받는 공적 연금입니다. 가입기간이 길수록, 소득이 높을수록 연금액이 커집니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            가입기간별 소득대체율 (40년 기준 41.5%)
          </h2>
          <ul>
            <li><strong>40년 가입</strong>: 평균소득의 약 41.5% (예: 평균 400만원 → 월 166만원)</li>
            <li><strong>30년 가입</strong>: 평균소득의 약 31% (예: 평균 400만원 → 월 124만원)</li>
            <li><strong>20년 가입</strong>: 평균소득의 약 20.75% (예: 평균 400만원 → 월 83만원)</li>
            <li><strong>10년 가입</strong>: 평균소득의 약 10.4% (예: 평균 400만원 → 월 41만원)</li>
            <li><strong>10년 미만</strong>: 반환일시금 (납입금 + 이자)으로 종결</li>
          </ul>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            노령연금 수급 연령 (출생연도별)
          </h2>
          <ul>
            <li>1953~1956년생: 만 61세</li>
            <li>1957~1960년생: 만 62세</li>
            <li>1961~1964년생: 만 63세</li>
            <li>1965~1968년생: 만 64세</li>
            <li><strong>1969년 이후</strong>: 만 65세</li>
          </ul>
          <p>
            만 60세부터 <strong>조기노령연금</strong> 신청 가능하나 1년 조기 수령마다 6% 감액 (평생).
            반대로 수급 시기를 늦추는 <strong>연기연금</strong>은 1년 연기마다 7.2% 증액 (최대 5년).
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            국민연금 수령액 늘리는 5가지 전략
          </h2>
          <ol>
            <li><strong>임의계속가입</strong>: 만 60세 이후에도 최대 5년 추가 가입으로 가입기간 늘리기</li>
            <li><strong>연기연금 활용</strong>: 만 65세 도달 후 1년 연기마다 7.2% 증액 (5년 연기 시 +36%)</li>
            <li><strong>추후납부</strong>: 휴직·실직 등으로 못 낸 보험료를 나중에 일괄 납입 (최대 10년치)</li>
            <li><strong>임의가입 활용</strong>: 전업주부·학생도 가입해 가입기간 확보</li>
            <li><strong>건강 관리</strong>: 평생 지급이라 오래 살수록 누적 수령액 ↑ (남자 평균 84세까지 25년+ 수령)</li>
          </ol>
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
        <RelatedCalculators currentPath="/national-pension-estimate-2026" title="국민연금과 함께 보면 좋은 도구" />

        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">함께 보면 좋은 계산기</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tools/finance/irp" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">IRP·연금저축 세액공제</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">노후 + 세액공제 일석이조</p>
            </Link>
            <Link href="/fire-calculator" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">FIRE 조기은퇴 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">경제적 자유 도달 시뮬</p>
            </Link>
            <Link href="/tools/finance/severance" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">퇴직금 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">근속·평균임금별 산정</p>
            </Link>
            <Link href="/health-insurance-fee-2026" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">건강보험료 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">직장·지역 가입자별</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
