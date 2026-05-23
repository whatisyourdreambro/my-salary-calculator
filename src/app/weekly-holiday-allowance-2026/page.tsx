// src/app/weekly-holiday-allowance-2026/page.tsx
// 주휴수당 계산기 — 알바·파트타임 검색량 매우 높은 키워드 전용 페이지

import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import WeeklyHolidayAllowanceClient from "./WeeklyHolidayAllowanceClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 주휴수당 계산기 — 시급·근무시간별 정확 산출 (최저시급 10,320원)",
  description:
    "2026 최저시급 10,320원 기준 주휴수당 자동 계산. 시급·주 근무시간 입력하면 주휴수당과 주급 총액을 즉시 산출. 주 15시간 이상 알바·파트타임 필수.",
  path: "/weekly-holiday-allowance-2026",
  keywords: [
    "주휴수당 계산기",
    "2026 주휴수당",
    "주휴수당 계산",
    "주휴수당 조건",
    "알바 주휴수당",
    "주휴수당 시급",
    "주휴수당 받는 법",
    "최저시급 주휴수당",
    "주 15시간 주휴수당",
  ],
});

const FAQS = [
  {
    q: "주휴수당이란 무엇인가요?",
    a: "주휴수당은 1주 동안 약속한 근무일을 모두 출근한 근로자에게 1주에 1일(평균 일 소정근로시간)분의 유급휴일 임금을 지급하는 제도입니다. 근로기준법 제55조에 명시되어 있으며, 알바·파트타임도 조건만 충족하면 받을 수 있습니다.",
  },
  {
    q: "주휴수당 받는 조건은?",
    a: "① 1주 소정근로시간이 15시간 이상이고, ② 1주 동안 약속한 근무일을 모두 출근(개근)해야 합니다. 결근하면 그 주의 주휴수당이 발생하지 않습니다. 단, 지각·조퇴는 결근으로 보지 않으며, 약정 휴가·휴일은 출근으로 간주됩니다.",
  },
  {
    q: "주휴수당 계산 공식은 어떻게 되나요?",
    a: "주휴수당 = 시급 × (1주 소정근로시간 ÷ 40 × 8). 즉 주 40시간 근무자는 8시간분, 주 20시간 근무자는 4시간분의 임금이 추가됩니다. 예: 시급 10,320원 × 8시간 = 82,560원이 풀타임 주휴수당입니다.",
  },
  {
    q: "주 15시간 미만 근무도 주휴수당을 받을 수 있나요?",
    a: "아닙니다. 법적으로 1주 소정근로시간 15시간 미만(이른바 '초단시간 근로자')은 주휴수당 대상에서 제외됩니다. 단, 사업장과의 별도 계약으로 지급 약정이 있다면 그에 따라 받을 수 있습니다.",
  },
  {
    q: "포괄임금제·월급제도 주휴수당이 따로 나오나요?",
    a: "월급제 근로자는 이미 월급에 주휴수당이 포함되어 있는 것이 일반적입니다. 예: 월급 환산 시 한 달 약 209시간(주 40시간 × 4.345주 + 주휴 8시간 × 4.345주 ≒ 209시간)으로 계산되며, 이때 8시간분이 주휴수당입니다. 시급제·일급제 알바만 별도 주휴수당 계산이 필요합니다.",
  },
  {
    q: "주휴수당 안 주면 어떻게 해야 하나요?",
    a: "근로기준법 위반으로 사업주는 3년 이하 징역 또는 3,000만원 이하의 벌금에 처해질 수 있습니다(근기법 제110조). 미지급 시 ① 사업주에게 지급 요청 → ② 미지급분에 대해 고용노동부에 진정 → ③ 미지급액과 부가금(법정수당의 100%) 청구가 가능합니다. 임금채권 소멸시효는 3년이니 그 이내에 청구해야 합니다.",
  },
  {
    q: "주휴수당과 연차수당은 어떻게 다른가요?",
    a: "주휴수당은 매주 발생하는 유급휴일(주 1회) 임금이고, 연차수당은 1년에 한 번 부여되는 유급연차휴가를 사용하지 않았을 때 받는 보상입니다. 모두 별도로 계산되며, 둘 다 받을 수 있습니다. 연차수당은 머니샐러리 '연차수당 계산기'에서 확인하세요.",
  },
  {
    q: "주 5일 vs 주 6일 근무 시 주휴수당이 다른가요?",
    a: "동일합니다. 주휴수당은 '주당 총 소정근로시간'에 비례해 산정되며, 며칠 근무하느냐가 아니라 몇 시간 근무하느냐가 기준입니다. 주 6일 × 6.67시간 = 40시간이라면 주 5일 × 8시간 근무자와 동일한 8시간분 주휴수당을 받습니다.",
  },
];

const HOWTO_STEPS = [
  {
    name: "시급 입력",
    text: "본인의 시급을 원 단위로 입력합니다. 2026년 최저시급은 10,320원입니다.",
  },
  {
    name: "1주 소정근로시간 입력",
    text: "1주에 약속된 총 근무시간을 시간 단위로 입력합니다. 주 5일 × 8시간 풀타임이면 40시간.",
  },
  {
    name: "출근 조건 확인",
    text: "1주 15시간 이상이고 약속된 근무일을 모두 출근(개근)해야 주휴수당이 발생합니다.",
  },
  {
    name: "결과 확인",
    text: "주휴수당과 주급 총액(기본급 + 주휴수당)을 확인합니다. 월 환산액도 함께 표시됩니다.",
  },
];

export default function WeeklyHolidayAllowance2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/weekly-holiday-allowance-2026", {
            leafName: "2026 주휴수당 계산기",
          }),
          softwareApplicationLd({
            name: "2026 주휴수당 계산기",
            description: "시급·근무시간별 주휴수당 정확 산출 (근로기준법 제55조)",
            url: "/weekly-holiday-allowance-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026 주휴수당 계산하는 방법",
            description: "시급과 1주 소정근로시간으로 주휴수당을 1분 안에 계산",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs
          path="/weekly-holiday-allowance-2026"
          leafName="주휴수당 계산기 2026"
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            근로기준법 제55조
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            2026 주휴수당 계산기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            시급과 1주 소정근로시간을 입력하면 근로기준법 제55조에 따른 주휴수당을 즉시 계산합니다.
            2026년 최저시급 10,320원 기준 주 40시간 풀타임 근무 시 주휴수당은{" "}
            <strong className="text-electric">82,560원</strong>입니다. 알바·파트타임도 주 15시간
            이상 근무하고 약속된 근무일을 모두 출근하면 반드시 받을 수 있습니다.
          </p>
        </header>

        <HomeTopAd />

        <WeeklyHolidayAllowanceClient />

        <CalcResultAd />

        {/* 가이드 콘텐츠 */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            주휴수당이 발생하는 조건 — 2가지 필수 요건
          </h2>
          <p>
            <strong>요건 1 — 주 15시간 이상 근무:</strong> 1주 소정근로시간이 15시간 이상이어야 합니다.
            소정근로시간은 근로계약서에 약정된 시간으로, 실제 근무시간과 다를 수 있습니다. 주 14시간
            이하 근무자(초단시간 근로자)는 주휴수당 대상에서 제외됩니다.
          </p>
          <p>
            <strong>요건 2 — 약속된 근무일 모두 출근:</strong> 1주 동안 약정된 모든 근무일에 출근해야
            합니다. 결근하면 그 주의 주휴수당이 발생하지 않습니다. 단 지각·조퇴는 결근으로 보지 않으며,
            본인이 신청한 약정 휴가·공휴일은 출근한 것으로 간주됩니다. 사용자가 임의로 휴무를 지정해도
            출근한 것으로 처리됩니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            주휴수당 계산 공식 — 단계별 풀이
          </h2>
          <p>
            <strong>공식:</strong> 주휴수당 = 시급 × (1주 소정근로시간 ÷ 40 × 8)
          </p>
          <p>
            <strong>풀타임 (주 40시간):</strong> 10,320원 × (40 ÷ 40 × 8) = 10,320원 × 8 ={" "}
            <strong className="text-electric">82,560원</strong>
          </p>
          <p>
            <strong>주 30시간 알바:</strong> 10,320원 × (30 ÷ 40 × 8) = 10,320원 × 6 = 61,920원
          </p>
          <p>
            <strong>주 20시간 알바:</strong> 10,320원 × (20 ÷ 40 × 8) = 10,320원 × 4 = 41,280원
          </p>
          <p>
            <strong>주 15시간 (최소 기준):</strong> 10,320원 × (15 ÷ 40 × 8) = 10,320원 × 3 = 30,960원
          </p>
          <p>
            <strong>주 14시간 이하:</strong> <strong className="text-rose-600">0원</strong> — 초단시간
            근로자라 주휴수당 대상이 아닙니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            2026년 최저시급 기준 풀타임 월 환산
          </h2>
          <p>
            2026년 최저시급 10,320원, 주 40시간 풀타임 근무 시 월 환산은 다음과 같습니다.
          </p>
          <ul>
            <li>주급 (기본): 10,320원 × 40시간 = 412,800원</li>
            <li>주휴수당: 82,560원</li>
            <li>주급 총액 (주휴 포함): <strong>495,360원</strong></li>
            <li>월급 (한 달 약 4.345주): <strong className="text-electric">2,156,880원</strong></li>
          </ul>
          <p>
            법정 월 최저임금(주휴 포함)이 2,156,880원이므로, 알바·파트타임도 풀타임 시 이 금액
            미만으로 받으면 임금체불에 해당할 수 있습니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            주휴수당을 못 받았을 때 대응 방법
          </h2>
          <p>
            사업주가 주휴수당을 미지급하면 근로기준법 제110조에 따라 3년 이하 징역 또는 3,000만원
            이하의 벌금에 처해질 수 있습니다. 미지급 시 다음 절차를 따르세요:
          </p>
          <ol>
            <li><strong>1단계:</strong> 근무 시간·근무일 기록(타임카드, 카톡 출근 인증 등) 확보</li>
            <li><strong>2단계:</strong> 사업주에게 정중하게 미지급 주휴수당 지급 요청</li>
            <li>
              <strong>3단계:</strong> 거부 시 고용노동부 임금체불 진정(고용노동청 방문 또는
              민원24·노동부 홈페이지)
            </li>
            <li>
              <strong>4단계:</strong> 미지급액 + 부가금(원금의 100%)까지 청구 가능. 임금채권 시효는
              3년이므로 그 안에 청구
            </li>
          </ol>
        </section>

        <InArticleAd />

        {/* FAQ */}
        <section className="my-10">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-5">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
                  Q. {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-blue dark:text-canvas-300">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        {/* 관련 도구 */}
        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
            함께 보면 좋은 계산기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/calc/vacation-pay"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                연차수당 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                미사용 연차 보상금 계산
              </p>
            </Link>
            <Link
              href="/table/2026/hourly"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                2026 시급 실수령액 표
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                시급별 월 환산 실수령액
              </p>
            </Link>
            <Link
              href="/table/2026/weekly"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                2026 주급 실수령액 표
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                주급별 월 환산·공제액
              </p>
            </Link>
            <Link
              href="/minimum-wage-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                2026 최저임금
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                10,320원 인상 분석
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
