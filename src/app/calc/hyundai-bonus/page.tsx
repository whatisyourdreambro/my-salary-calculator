// src/app/calc/hyundai-bonus/page.tsx
//
// 현대자동차 임단협 성과급·격려금 계산기.
// 임단협 합의 결과를 기준으로 한 본인 받을 금액 계산기.
// 2025 합의: 기본급 +10만 / 성과금 450%+1,580만 / 무상주 30주 / 상품권 20만.
// 2026 노조 요구: 기본급 +14.96만 / 성과급 30%(순이익 비례) / 상여 800%.

import type { Metadata } from "next";
import Link from "next/link";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Car, AlertTriangle, Info } from "lucide-react";
import HyundaiBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/hyundai-bonus";
const PAGE_TITLE = "현대차 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "현대자동차 임단협 성과급·격려금 계산기. 본인 기본급(월)만 입력하면 성과금 450% + 정액 1,580만원 + 무상주 30주 + 상품권 20만원 합산 세전·세후 실수령액이 즉시. 2025 합의안 + 2026 노조 요구안 양쪽 시나리오 비교.";

const FAQ_ITEMS = [
  {
    question: "현대차 성과급은 어떻게 계산되나요?",
    answer:
      "현대차 성과급은 매년 임금·단체협상(임단협) 결과로 결정되는 정률(%) + 정액 + 무상주 + 상품권의 4가지 구성입니다. 2025년 합의는 경영성과금 350% + 700만원 / 생산판매 격려금 100% + 380만원 / 추가 500만원 / 무상주 30주 / 전통시장 상품권 20만원 으로, 합산 성과금 450% + 정액 1,580만원이 됐습니다. 본 계산기는 본인의 월 기본급(통상임금)을 입력하면 % 부분을 자동 환산합니다.",
  },
  {
    question: "기본급은 어떻게 정하나요?",
    answer:
      "현대차 임단협의 '기본급'은 월 통상임금(기본급+직무수당+직책수당 등 매월 정기 지급 항목)을 의미합니다. 보통 정기 인상은 호봉승급분 포함 월 10만원 수준이며, 2025년에는 10만원, 2026년 노조는 14만 9,600원(호봉승급 제외)을 요구하고 있습니다. 본인의 정확한 통상임금은 급여 명세서 '기본급' 또는 '통상임금' 항목을 확인하세요.",
  },
  {
    question: "무상주 30주는 얼마나 가치가 있나요?",
    answer:
      "2025년 합의의 무상주 30주는 현대차 보통주 30주를 지급한다는 의미입니다. 본 계산기에서는 시점별 주가를 입력할 수 있게 했으며, 2026년 상반기 평균 주가(약 22~26만원 사이) 기준 한 주당 약 23만원이면 30주 = 약 690만원의 가치입니다. 단, 무상주는 양도제한 기간이 있을 수 있으니 매도 시점을 확인하세요. 매도 시 양도소득세는 대주주가 아니라면 비과세입니다(코스피 상장주식).",
  },
  {
    question: "성과금 450% 는 무엇의 450%인가요?",
    answer:
      "월 통상임금의 450%입니다. 예를 들어 월 통상임금이 500만원이면 500만 × 450% = 2,250만원이 정률 성과금입니다. 여기에 정액 1,580만원과 무상주 30주(약 690만원) + 상품권 20만원을 합치면 총 약 4,540만원이 됩니다. 본 계산기는 본인 기본급을 입력하면 이 모든 항목을 자동 합산합니다.",
  },
  {
    question: "2026년 노조 요구안은 어떻게 다른가요?",
    answer:
      "2026년 5월 노조는 (1) 월 기본급 14만 9,600원 인상(호봉승급 제외), (2) 작년 순이익의 30% 성과급 지급, (3) 상여금 750%→800% 인상, (4) 정년 최장 65세 연장, (5) AI 관련 고용 보장 등을 요구했습니다. 협상 중이므로 최종 결과는 9~10월경 결정될 가능성이 높습니다. 본 계산기는 노조 요구안 시나리오를 별도 옵션으로 제공하지만 확정 합의안이 아니므로 참고용입니다.",
  },
  {
    question: "성과금 세금은 어떻게 계산되나요?",
    answer:
      "성과금·격려금·정액 보너스 모두 근로소득에 합산되어 누진세율(6~45%) + 지방세(소득세의 10%) + 4대보험이 부과됩니다. 무상주는 시가 기준 근로소득으로 과세되며, 매도 시점이 아닌 지급 시점에 과세됩니다. 본 계산기는 marginal 방식(연봉만 vs 연봉+성과급 합산 세금 차이)으로 정확하게 계산합니다.",
  },
  {
    question: "기아와 비교하면?",
    answer:
      "기아는 현대차와 같은 그룹사라서 임단협 결과가 거의 동일한 패턴입니다. 2025년 기아도 성과금 450% + 1,600만원 + 무상주 53주(현대차 30주보다 많음) 으로 합의했습니다. 무상주 수가 다른 이유는 기아 주가가 현대차의 약 절반(약 12만원)이라 동일 가치 분배를 위해 더 많이 주는 구조입니다. '기아 성과급 계산기' 페이지에서 비교 가능합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 2025년 임단협 잠정합의안 + 2026년 노조 요구안 공개 보도(머니투데이·이투데이·녹색경제 등) 기반 추정 모델이며 회사 공식 자료가 아닙니다. 실제 지급은 본인 직군(생산·기술·사무)·근속·평가 등에 따라 ±10% 차이가 가능합니다. 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  { name: "시나리오 선택", text: "2025 잠정합의 / 2026 노조 요구안 / 직접 입력 중 선택합니다." },
  { name: "본인 기본급(월) 입력", text: "월 통상임금을 입력. 보통 400~600만원 범위입니다." },
  { name: "무상주 주가 확인", text: "현대차 보통주 현재가를 입력 (디폴트 23만원). 2026년 현재 23~26만원 범위." },
  { name: "결과 확인", text: "% × 기본급 + 정액 + 무상주 + 상품권 합산이 즉시 표시됩니다." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산됩니다." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "현대차 성과급",
    "현대자동차 성과급",
    "현대차 임단협",
    "현대차 성과금 계산기",
    "현대차 격려금",
    "현대차 무상주",
    "현대차 성과급 2026",
    "현대차 보너스",
    "현대자동차 임단협 합의",
    "현대차 상여금",
  ],
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: PAGE_TITLE_FULL,
    description: PAGE_DESC,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE_FULL,
    description: PAGE_DESC,
  },
};

export default function HyundaiBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "현대차 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "현대차 성과급 계산하는 방법",
            description: "임단협 시나리오·본인 기본급으로 성과금+격려금+무상주 합산 + 세후 실수령을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Car className="w-3.5 h-3.5" />
              2025 잠정합의 + 2026 노조 요구안 양쪽 시나리오
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              현대차 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              임단협 합의 기준으로 본인 기본급만 입력하면{" "}
              <strong>성과금 450% + 정액 1,580만 + 무상주 30주 + 상품권 20만</strong>{" "}
              합산 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <HyundaiBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">
              현대차 임단협 합의 구조
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg flex items-center gap-2">
                  📋 2025년 잠정합의 (실제 지급)
                </h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 10만원 인상 (호봉승급 포함)</li>
                  <li>• 경영성과금 <strong>350% + 700만원</strong></li>
                  <li>• 생산판매 격려금 <strong>100% + 380만원</strong></li>
                  <li>• 추가 격려금 <strong>500만원</strong></li>
                  <li>• 무상주 <strong>30주</strong></li>
                  <li>• 전통시장 상품권 <strong>20만원</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  합산: <strong>450% + 정액 1,580만 + 무상주 30주</strong>
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg flex items-center gap-2">
                  📢 2026년 노조 요구안 (협상 중)
                </h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 <strong>14.96만원 인상</strong> (호봉승급 제외)</li>
                  <li>• 성과급 <strong>전년 순이익의 30%</strong></li>
                  <li>• 상여금 <strong>750% → 800% 인상</strong></li>
                  <li>• 정년 <strong>최장 65세</strong> 연장 (국민연금 수급 연동)</li>
                  <li>• AI 관련 고용 보장</li>
                  <li>• 완전 월급제 시행</li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  최종 결과는 9~10월 결정 가능성. 본 계산기는 양 시나리오 비교 제공.
                </p>
              </article>
            </div>
          </section>

          <div className="mt-10">
            <InArticleAd />
          </div>

          <section className="mt-12">
            <h2 className="text-2xl sm:text-3xl font-black mb-6">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-canvas-deep bg-white p-5 open:bg-canvas/30"
                >
                  <summary className="cursor-pointer font-bold text-base list-none flex items-start gap-3">
                    <span className="text-primary mt-0.5">Q.</span>
                    <span className="flex-1">{item.question}</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-faint pl-7">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="block mb-1 text-amber-900">⚠️ 추정 시뮬레이터입니다</strong>
                <span className="text-amber-800">
                  2025 임단협 잠정합의안 + 2026 노조 요구안 공개 보도 기반 추정.
                  실제 지급은 직군·근속·평가 등에 따라 ±10% 차이가 발생할 수 있으며,
                  2026년 최종 합의안은 미확정입니다.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/kia-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">기아 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">450% + 1,600만 + 무상주 53주</p>
            </Link>
            <Link
              href="/salary-db/hyundai-motor"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">현대차 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 워라밸 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />
          </div>

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: 2025년 9월 현대차 임단협 잠정합의안
                (현대차그룹 공식 발표·녹색경제·전자신문), 2026년 5월 노조 요구안
                (머니투데이·이투데이·인사이트코리아). 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
