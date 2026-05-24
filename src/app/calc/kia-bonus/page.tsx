// src/app/calc/kia-bonus/page.tsx
//
// 기아 임단협 성과급·격려금 계산기.
// 2025 합의: 기본급 +10만 / 성과금 450%+1,600만 / 무상주 53주 / 상품권 20만.
// 기아는 5년 연속 무파업 타결. 현대차 그룹과 동일 패턴이지만 무상주 53주 (현대차 30주).

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
import KiaBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/kia-bonus";
const PAGE_TITLE = "기아 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "기아 임단협 성과급·격려금 계산기. 본인 기본급(월)만 입력하면 성과금 450% + 정액 1,600만원 + 무상주 53주 + 상품권 20만원 합산 세전·세후 실수령액이 즉시. 2025 잠정합의 + 2026 노조 요구안 양쪽 시나리오 비교.";

const FAQ_ITEMS = [
  {
    question: "기아 성과급은 어떻게 계산되나요?",
    answer:
      "기아 성과급은 매년 임단협 결과로 결정되는 정률(%) + 정액 + 무상주 + 상품권의 4가지 구성입니다. 2025년 합의는 경영성과금 350% + 700만원 / 생산판매 격려금 100% + 400만원 / World Car Awards 2년 연속 수상 격려금 500만원 / 무상주 53주 / 전통시장 상품권 20만원 으로, 합산 성과금 450% + 정액 1,600만원 + 무상주 53주가 됐습니다.",
  },
  {
    question: "기아와 현대차 성과급 차이는?",
    answer:
      "두 회사는 같은 현대차그룹이라 임단협 결과가 거의 동일합니다. 차이는 (1) 정액 부분 — 기아 1,600만 vs 현대차 1,580만 (기아 +20만), (2) 무상주 — 기아 53주 vs 현대차 30주, (3) World Car Awards 같은 회사 고유 시상금 포함 여부. 무상주가 다른 이유는 두 회사 주가 차이 때문 — 기아 약 12만원 vs 현대차 약 23만원으로, 동일한 가치를 분배하려면 기아는 더 많은 주가 필요합니다.",
  },
  {
    question: "5년 연속 무파업 임단협의 의미는?",
    answer:
      "기아 노사는 2021년부터 2025년까지 5년 연속 무파업으로 임단협을 타결했습니다. 미국 관세, 전동화 전환 둔화 같은 외부 위기에도 노사 상생을 우선시한 결과로 평가됩니다. 이는 같은 그룹사인 현대차와도 일부 차이가 있는 점이며, 안정적 성과급 지급의 배경입니다.",
  },
  {
    question: "무상주 53주는 얼마인가요?",
    answer:
      "2025년 합의의 무상주 53주는 기아 보통주 53주 지급입니다. 2026년 평균 주가 약 12만원 기준 53주 = 약 636만원의 가치입니다. 본 계산기는 시점별 주가를 직접 입력 가능합니다. 무상주는 양도제한 기간이 있을 수 있으니 매도 시점을 확인하시고, 코스피 상장주식이므로 대주주가 아닌 일반 직원은 매도 시 양도세 비과세입니다.",
  },
  {
    question: "기아 정확한 평균 연봉은?",
    answer:
      "2024년 기아 사업보고서 기준 1인당 평균 급여는 약 1억 2,800만원 (등기임원 제외)입니다. 사무·기술직과 생산직 평균이 합산된 수치라 직군별 편차는 큽니다. 자세한 직급별 평균은 '기아 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과금 세금은 어떻게 계산되나요?",
    answer:
      "성과금·격려금·정액 보너스 모두 근로소득에 합산되어 누진세율(6~45%) + 지방세(소득세의 10%) + 4대보험이 부과됩니다. 무상주는 시가 기준 근로소득으로 과세되며 매도 시점이 아닌 지급 시점에 과세됩니다. 본 계산기는 marginal 방식으로 정확하게 계산합니다.",
  },
  {
    question: "2026년 노조 요구안은?",
    answer:
      "2026년 5월 기아 노조도 현대차와 비슷하게 (1) 기본급 14만원대 인상, (2) 순이익 30% 성과급, (3) 상여 800% 인상, (4) 정년 65세 연장, (5) AI 고용 보장 등을 요구하고 있습니다. 최종 합의는 9~10월경 결정될 가능성이 높으며, 본 계산기는 양 시나리오 비교 제공합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 2025년 9월 기아 임단협 잠정합의안 + 2026년 노조 요구안 공개 보도(녹색경제·전자신문·지피코리아·삼프로TV) 기반 추정 모델입니다. 실제 지급은 본인 직군(생산·기술·사무)·근속·평가에 따라 ±10% 차이 가능. 정확한 본인 케이스는 사내 급여 명세서 확인.",
  },
];

const HOW_TO_STEPS = [
  { name: "시나리오 선택", text: "2025 잠정합의 / 2026 노조 요구안 / 직접 입력 중 선택." },
  { name: "본인 기본급(월) 입력", text: "월 통상임금 입력. 보통 400~600만원 범위." },
  { name: "무상주 주가 확인", text: "기아 보통주 현재가 입력 (디폴트 12만원). 2026년 10~14만원 범위." },
  { name: "결과 확인", text: "% × 기본급 + 정액 + 무상주 + 상품권 합산 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "기아 성과급",
    "기아자동차 성과급",
    "기아 임단협",
    "기아 성과금 계산기",
    "기아 격려금",
    "기아 무상주",
    "기아 성과급 2026",
    "기아 보너스",
    "기아 임단협 합의",
    "기아 상여금",
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
  twitter: { card: "summary_large_image", title: PAGE_TITLE_FULL, description: PAGE_DESC },
};

export default function KiaBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "기아 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "기아 성과급 계산하는 방법",
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
              2025 5년 연속 무파업 합의 + 2026 노조 요구안
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              기아 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              임단협 합의 기준 본인 기본급만 입력하면{" "}
              <strong>성과금 450% + 정액 1,600만 + 무상주 53주 + 상품권 20만</strong>{" "}
              합산 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <KiaBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">기아 임단협 합의 구조</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📋 2025년 잠정합의 (실제 지급)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 10만원 인상 (호봉승급 포함)</li>
                  <li>• 경영성과금 <strong>350% + 700만원</strong></li>
                  <li>• 생산판매 격려금 <strong>100% + 400만원</strong></li>
                  <li>• World Car 격려금 <strong>500만원</strong></li>
                  <li>• 무상주 <strong>53주</strong> (현대차 30주보다 많음)</li>
                  <li>• 전통시장 상품권 <strong>20만원</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  합산: <strong>450% + 정액 1,600만 + 무상주 53주</strong>
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">📢 2026년 노조 요구안 (협상 중)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 <strong>14만원대 인상</strong> 요구</li>
                  <li>• 성과급 <strong>전년 순이익의 30%</strong></li>
                  <li>• 상여금 <strong>750% → 800% 인상</strong></li>
                  <li>• 정년 <strong>최장 65세</strong> 연장</li>
                  <li>• AI 관련 고용 보장</li>
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
                  실제 지급은 직군·근속·평가에 따라 ±10% 차이 가능, 2026년 최종 합의안 미확정.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/hyundai-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">현대차 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">450% + 1,580만 + 무상주 30주</p>
            </Link>
            <Link
              href="/salary-db/kia"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">기아 연봉·복지 DB →</p>
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
                <strong>데이터 출처</strong>: 2025년 9월 기아 임단협 잠정합의안
                (녹색경제·전자신문·지피코리아·삼프로TV), 2026년 5월 노조 요구안.
                2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
