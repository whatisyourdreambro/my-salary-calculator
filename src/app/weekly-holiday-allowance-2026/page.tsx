// src/app/weekly-holiday-allowance-2026/page.tsx
// 주휴수당 계산기 — 알바·파트타임 검색량 매우 높은 키워드 전용 페이지

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd, GuideMidAd, MultiplexAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import WeeklyHolidayAllowanceClient from "./WeeklyHolidayAllowanceClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 주휴수당 계산기 — 4주 평균시간·개근 조건 확인",
  description:
    "4주 평균 소정근로시간과 시급으로 주휴수당을 계산합니다. 주 5일·40시간 사업장 가정, 개근·근로관계 유지 조건과 변동 근로의 확인 사항을 안내합니다.",
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
    a: "① 4주 동안(4주 미만 근로 시 그 기간)을 평균한 1주 소정근로시간이 15시간 이상이고, ② 해당 주의 소정근로일을 개근하며 1주간 근로관계가 유지되어야 합니다. 소정근로시간은 약정한 시간으로 실제 일한 시간과 다릅니다. 지각·조퇴는 결근과 구분하며, 휴가·휴업이나 입퇴사가 있으면 구체적 주별 조건을 확인해야 합니다.",
  },
  {
    q: "주휴수당 계산 공식은 어떻게 되나요?",
    a: "이 계산기는 통상근로자가 주 5일·40시간 근무하는 사업장을 가정하여 시급 × (4주 평균 1주 소정근로시간 ÷ 40 × 8)로 계산합니다. 예를 들어 평균 주 20시간이면 4시간분입니다. 단시간근로자의 일반 산정은 4주 소정근로시간을 같은 기간 통상근로자의 총 소정근로일수로 나누는 방식이므로, 사업장의 근무일수가 다르면 이 간이식을 그대로 적용하지 않습니다.",
  },
  {
    q: "주 15시간 미만 근무도 주휴수당을 받을 수 있나요?",
    a: "한 주만 보고 판단하지 않습니다. 4주 평균(4주 미만 근로 시 해당 기간 평균) 1주 소정근로시간이 15시간 미만이면 법정 주휴일 규정 적용 대상에서 제외됩니다. 실제 근무시간이 일시적으로 15시간을 넘었다고 약정 시간도 바뀌는 것은 아닙니다. 별도 지급 약정이 있는지도 확인하세요.",
  },
  {
    q: "포괄임금제·월급제도 주휴수당이 따로 나오나요?",
    a: "월급제 근로자는 이미 월급에 주휴수당이 포함되어 있는 것이 일반적입니다. 예: 월급 환산 시 한 달 약 209시간(주 40시간 × 4.345주 + 주휴 8시간 × 4.345주 ≒ 209시간)으로 계산되며, 이때 8시간분이 주휴수당입니다. 시급제·일급제 알바만 별도 주휴수당 계산이 필요합니다.",
  },
  {
    q: "주휴수당 안 주면 어떻게 해야 하나요?",
    a: "근로계약·근무 기록과 미지급액을 정리해 사업주에게 지급을 요청하고, 해결되지 않으면 노동포털에서 임금체불 진정을 제기할 수 있습니다. 원금의 100%가 자동 가산되는 제도는 아닙니다. 근로기준법 제43조의8의 고의·반복 체불 등 요건에 해당하면 법원에 3배 이내의 금액 지급을 청구할 수 있으며 법원이 판단합니다. 임금채권의 일반적인 소멸시효는 3년이고, 진정만으로 민사상 시효가 중단된다고 가정해서는 안 됩니다.",
  },
  {
    q: "주휴수당과 연차수당은 어떻게 다른가요?",
    a: "주휴수당은 매주 발생하는 유급휴일(주 1회) 임금이고, 연차수당은 1년에 한 번 부여되는 유급연차휴가를 사용하지 않았을 때 받는 보상입니다. 모두 별도로 계산되며, 둘 다 받을 수 있습니다. 연차수당은 머니샐러리 '연차수당 계산기'에서 확인하세요.",
  },
  {
    q: "주 5일 vs 주 6일 근무 시 주휴수당이 다른가요?",
    a: "본인의 근무일수만으로 같거나 다르다고 단정할 수 없습니다. 단시간근로자는 본인의 소정근로시간과 해당 사업장 통상근로자의 소정근로일수를 함께 확인해야 합니다. 이 계산기의 ÷40×8 비례식은 통상근로자가 주 5일·40시간 근무하는 사업장 가정이며, 통상근로자도 주 6일 근무하는 사업장 등에 일괄 적용하지 않습니다.",
  },
];

const HOWTO_STEPS = [
  {
    name: "시급 입력",
    text: "본인의 시급을 원 단위로 입력합니다. 2026년 최저시급은 10,320원입니다.",
  },
  {
    name: "4주 평균 소정근로시간 입력",
    text: "4주 평균 1주 소정근로시간을 입력합니다. 매주 일정하면 약정한 주 시간을, 주마다 다르면 4주 합계를 4로 나눈 값을 사용합니다. 4주 미만이면 해당 기간을 평균합니다.",
  },
  {
    name: "출근 조건 확인",
    text: "평균 15시간 기준과 별도로 해당 주의 개근·1주간 근로관계 유지 조건을 확인합니다. 변동 근로의 주별 자격을 계산기가 자동 판정하지는 않습니다.",
  },
  {
    name: "결과 확인",
    text: "주 5일·40시간 사업장 가정의 주휴수당과 매주 동일 시간 근무 시 주급·월 단순 환산액을 확인합니다. 실제 지급액은 근로 기록·가산수당과 대조합니다.",
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
            description: "4주 평균시간과 주 5일·40시간 사업장 가정에 따른 주휴수당 간이 계산",
            url: "/weekly-holiday-allowance-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026 주휴수당 계산하는 방법",
            description: "시급과 4주 평균 소정근로시간으로 주휴수당을 계산하고 지급 조건 확인",
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
            4주 평균 소정근로시간과 시급으로 조건을 충족했을 때의 주휴수당을 계산합니다.
            주 5일·40시간 사업장, 개근과 1주간 근로관계 유지를 가정하면 2026년 최저시급
            10,320원 기준 주 40시간의 주휴수당은 <strong className="text-electric">82,560원</strong>입니다.
          </p>
        </header>

        <HomeTopAd />

        <WeeklyHolidayAllowanceClient />

        <CalcResultAd />

        {/* 가이드 콘텐츠 */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            주휴수당 계산 전 확인할 조건
          </h2>
          <p>
            <strong>시간 기준 — 4주 평균 15시간 이상:</strong> 4주 동안(4주 미만 근로 시 그 기간)을
            평균한 1주 소정근로시간으로 판단합니다. 소정근로시간은 약정한 시간이며 휴게시간이나
            일시적 대타·연장근로를 포함한 실제 근무시간과 같지 않습니다. 한 주가 15시간보다
            짧거나 길다는 이유만으로 지급 여부를 결정하지 마세요.
          </p>
          <p>
            <strong>주별 조건 — 개근·근로관계 유지:</strong> 해당 주의 소정근로일 개근과
            1주간 근로관계 유지 여부를 확인합니다. 지각·조퇴와 결근은 구분하며, 휴가·휴업·입퇴사
            등이 있으면 해당 주의 사실관계를 따로 확인해야 합니다. 평균시간이 같아도 실제
            근무 기록에 따라 모든 주의 지급 결과가 같지는 않습니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            주휴수당 계산 공식 — 단계별 풀이
          </h2>
          <p>
            <strong>이 계산기의 가정:</strong> 통상근로자가 주 5일·40시간 일하는 사업장에서
            주휴수당 = 시급 × (4주 평균 1주 소정근로시간 ÷ 40 × 8)로 계산합니다.
            아래 예시는 시급과 약정 시간이 매주 일정하고 지급 요건을 충족한 경우입니다.
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
            <strong>4주 평균 15시간 미만:</strong> 법정 주휴일 적용 대상에서 제외됩니다.
            회사의 별도 유급휴일 지급 약정은 따로 확인하세요.
          </p>
          <p>
            단시간근로자의 1일 소정근로시간은 4주 소정근로시간을 같은 기간 통상근로자의 총
            소정근로일수로 나누어 산정합니다. 통상근로자의 근무일수가 주 5일과 다르면 위 비례식
            대신 사업장 기준을 확인하세요. 근거: <a href="https://1350.moel.go.kr/rtmview.do?id=1000092981">고용노동부 주휴수당·단시간근로 상담 안내</a>
            (2026년 9월 9일 확인).
          </p>

          {/* 본문 섹션 경계 광고 (계산 공식 ↔ 월 환산) — 전면 최적화 (운영자 지시 2026-09-02) */}
          <GuideMidAd />

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
            <li>월 최저임금 (209시간 × 10,320원): <strong className="text-electric">2,156,880원</strong></li>
          </ul>
          <p>
            법정 월 최저임금(주휴 포함)이 2,156,880원이므로, 알바·파트타임도 풀타임 시 이 금액
            미만으로 받으면 임금체불에 해당할 수 있습니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            주휴수당을 못 받았을 때 대응 방법
          </h2>
          <p>
            주휴수당 지급 요건과 근무 기록, 이미 받은 임금을 먼저 대조하세요.
            지급 대상인데 받지 못했다면 다음 순서로 자료를 준비할 수 있습니다:
          </p>
          <ol>
            <li><strong>1단계:</strong> 근무 시간·근무일 기록(타임카드, 카톡 출근 인증 등) 확보</li>
            <li><strong>2단계:</strong> 사업주에게 정중하게 미지급 주휴수당 지급 요청</li>
            <li>
              <strong>3단계:</strong> 거부 시 고용노동부 임금체불 진정(고용노동청 방문 또는
              <a href="https://labor.moel.go.kr" className="underline">노동포털</a>)
            </li>
            <li>
              <strong>4단계:</strong> 미지급 임금 청구와 조건부 손해배상을 구분하세요. 자동 100% 가산이 아니며 임금채권 시효는
              3년이므로 그 안에 청구
            </li>
          </ol>
          <p><a href="/guides/wage-delayed-claim-2026" className="underline">임금체불 진정 준비·시효와 지원 제도 확인</a></p>
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

        {/* 14차 — RelatedCalculators 추가 (dead-end 차단) */}
        <RelatedCalculators currentPath="/weekly-holiday-allowance-2026" title="주휴수당과 함께 보면 좋은 도구" />

        {/* 14차 — ShareButtons (공유 유입) */}
        <div className="my-8">
          <ShareButtons title="2026 주휴수당 계산기" description="최저시급 10,320원 기준 주 40시간 = 82,560원" />
        </div>

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

        {/* 본문 끝 관련콘텐츠형 광고 — 관련 링크 직후, 전면 최적화 (운영자 지시 2026-09-02) */}
        <div className="my-10">
          <MultiplexAd />
        </div>
      </div>
    </main>
  );
}
