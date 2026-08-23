// src/app/calc/lg-display-bonus/page.tsx
//
// LG디스플레이 경영성과급 계산기 (정률형 — 기본급의 %).
// FY2025 실적분: 기본급 150%, 2026-02 지급 — 4년 만의 지급 재개
// (EBN·한국경제·아주경제·서울경제TV 2026-01-29 보도).
// FY2022~FY2024는 3년 연속 영업적자로 미지급.
// 갱신 체크포인트: 매년 1~2월 지급률 발표 시 시나리오·본문 갱신.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import BonusClusterLinks from "@/components/BonusClusterLinks";
import { InArticleAd, CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Monitor, AlertTriangle, Info, Coins } from "lucide-react";
import LgDisplayBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/lg-display-bonus";
const PAGE_TITLE = "LG디스플레이 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "LG디스플레이 경영성과급 계산기. 본인 월 기본급만 입력하면 기본급의 150%(2026년 2월 실제 지급, 4년 만의 재개) 기준 세전·세후 실수령액이 즉시 계산됩니다. FY2025 흑자전환(영업이익 5,170억원) 배경, 적자 3년 미지급 이력, 과거 300% 이력까지 보도 기반으로 정리.";

const FAQ_ITEMS = [
  {
    question: "LG디스플레이 경영성과급은 어떻게 지급되나요?",
    answer:
      "정식 명칭은 '경영 성과급'으로, 연 1회 — 통상 이듬해 1~2월 발표, 2월 급여와 함께 지급됩니다. 지급률은 고정급(기본급)의 % 형태이며, 전사 실적(흑자 여부)·전사 전략 과제 달성도·중장기 경쟁력 강화 노력을 종합 고려해 결정됩니다(한국경제 2026-01-29 보도). 관련 비용은 직전 연도 4분기 실적에 반영됩니다.",
  },
  {
    question: "2026년에는 얼마가 지급됐나요?",
    answer:
      "FY2025 실적 기준으로 기본급의 150%가 2026년 2월 지급됐습니다 — 사업부 차등 없이 전 사업부 일괄 적용이며, 4년 만의 지급 재개입니다(EBN·한국경제·아주경제·서울경제TV 2026-01-29 보도). 배경은 FY2025 매출 25조8,101억원·영업이익 5,170억원 흑자전환입니다.",
  },
  {
    question: "왜 4년 동안 성과급이 없었나요?",
    answer:
      "LG디스플레이는 적자 연도에는 경영성과급을 지급하지 않습니다. FY2022~FY2024 3년 연속 영업적자(2022년 -2조850억원 등)로 성과급이 없었고(EBN·한국경제 2026-01-29 보도), FY2025 흑자전환으로 2026년 2월에 4년 만에 지급이 재개됐습니다.",
  },
  {
    question: "다음(2027년 초) 성과급은 얼마인가요?",
    answer:
      "미확정입니다. FY2026 연간 실적(흑자 여부·전략 과제 달성도)에 따라 2027년 1~2월경 결정·발표될 전망입니다. 확정 보도가 나오면 본 페이지에 즉시 반영할 예정이며, 그 전에는 계산기의 '직접 입력' 모드로 예상 지급률을 시뮬레이션해 보세요.",
  },
  {
    question: "과거에는 얼마나 받았나요?",
    answer:
      "보도로 확인되는 과거 이력은 2015년 1월 월 기본급의 300%(MTN 2015-01-30 보도), 2009년 1월 기본급의 300%(아주경제 2009-01-12 보도)입니다. 직전 지급은 약 4년 전인 2022년 초(FY2021 영업이익 2조3,306억원 기준)였으나 당시 지급률 수치는 보도로 확인되지 않아 본 계산기에는 사용하지 않았습니다.",
  },
  {
    question: "기본급 150%면 실제로 얼마인가요?",
    answer:
      "월 기본급이 400만원이면 세전 600만원(400만 × 150%)입니다. 다만 성과급은 연간 근로소득에 합산돼 누진세율이 적용되므로, 연봉 8,000만원 직원 기준 세후 실수령은 이보다 줄어듭니다. 정확한 세후 금액은 위 계산기에서 본인 기본급·연봉을 입력해 확인하세요.",
  },
  {
    question: "LG디스플레이 평균 연봉은 얼마인가요?",
    answer:
      "FY2023 사업보고서(DART) 기준 평균연봉 8,000만원입니다 — 전년(9,400만원) 대비 15% 감소했는데, 적자에 따른 성과급 미지급 영향이 컸습니다(뉴시스·파이낸셜뉴스 2024-03-14 보도). 자세한 직급별 연봉은 'LG디스플레이 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "경영성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험(국민연금·건강·고용)이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상이면 추가 부과가 없습니다. 본 계산기는 연봉+성과급 합산 세금에서 연봉만 기준 세금을 뺀 marginal 방식으로 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개 언론 보도(EBN·한국경제·아주경제·서울경제TV 2026-01-29, MTN 2015-01-30 등)와 사업보고서 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 지급액은 본인 기본급 구성·근속·직급에 따라 차이가 날 수 있습니다. 결과는 참고용으로만 사용하시고, 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "지급률 시나리오 선택",
    text: "FY2025 실적분 150%(2026-02 실제 지급) / 적자 0% / 과거 호황 300%(2015-01 참고) 중 선택. 직접 입력도 가능.",
  },
  {
    name: "본인 월 기본급 입력",
    text: "급여명세서의 월 기본급을 만원 단위로 입력. 경영성과급은 기본급의 %로 지급됩니다.",
  },
  {
    name: "본인 연봉 입력",
    text: "세금 계산용 연 기본 연봉 입력. FY2023 공시 평균연봉은 8,000만원.",
  },
  {
    name: "결과 확인",
    text: "월 기본급 × 지급률 = 세전 경영성과급이 즉시 표시됩니다.",
  },
  {
    name: "세후 실수령 확인",
    text: "누진세율 + 4대보험 추가 부과를 반영한 세후 실수령액이 자동 계산됩니다.",
  },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "LG디스플레이 성과급",
    "LG디스플레이 경영성과급",
    "LGD 성과급",
    "LG디스플레이 성과급 150",
    "LG디스플레이 성과급 계산기",
    "엘지디스플레이 성과급",
    "LG디스플레이 보너스",
    "LG디스플레이 성과급 2026",
    "LG디스플레이 연봉",
    "디스플레이 성과급",
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

export default function LgDisplayBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "LG디스플레이 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "LG디스플레이 경영성과급 계산하는 방법",
            description:
              "지급률 시나리오·본인 월 기본급·연봉으로 경영성과급 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Monitor className="w-3.5 h-3.5" />
              2026-02 기본급 150% 지급 — 4년 만의 재개
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              LG디스플레이 성과급 계산기{" "}
              <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              본인 월 기본급만 입력하면{" "}
              <strong>경영성과급 150% (2026년 2월 실제 지급)</strong> 기준
              세전·세후 실수령액이 즉시 계산됩니다. FY2025 흑자전환으로 4년
              만에 재개된 성과급 — 적자 3년 미지급 이력과 과거 300% 이력까지
              시나리오로 비교해 보세요.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          {/* Calculator */}
          <LgDisplayBonusClient />

          {/* 결과 직후 광고 */}
          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 제도 개요 */}
          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="policy-heading"
          >
            <h2
              id="policy-heading"
              className="text-2xl font-black mb-4 flex items-center gap-2"
            >
              <Coins className="w-6 h-6 text-primary" />
              LG디스플레이 경영성과급 구조
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">제도 골격 (정률형)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>
                    • 연 1회 — 통상 이듬해 1~2월 발표, <strong>2월 지급</strong>
                  </li>
                  <li>
                    • <strong>고정급(기본급)의 %</strong> 형태로 지급
                  </li>
                  <li>
                    • 산정 기준: 전사 실적(흑자 여부) · 전사 전략 과제 달성도 ·
                    중장기 경쟁력 강화 노력 종합 (한국경제 2026-01-29)
                  </li>
                  <li>
                    • <strong>적자 연도에는 미지급</strong> — FY2022~FY2024
                    3년 연속 미지급
                  </li>
                  <li>• 비용은 직전 연도 4분기 실적에 반영</li>
                </ul>
              </article>
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">
                  📋 보도로 확인된 지급 이력
                </h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>
                    • FY2025 실적분: <strong>기본급의 150%</strong>, 2026-02
                    지급 — 전 사업부 일괄 (EBN·한국경제 2026-01-29)
                  </li>
                  <li>
                    • FY2022~FY2024: <strong>미지급 (0%)</strong> — 3년 연속
                    영업적자
                  </li>
                  <li>
                    • 2022년 초: 지급 있었으나 지급률 보도 미확인 (FY2021
                    영업이익 2조3,306억원 기준)
                  </li>
                  <li>
                    • 2015-01: 월 기본급의 <strong>300%</strong> (MTN
                    2015-01-30)
                  </li>
                  <li>
                    • 2009-01: 기본급의 <strong>300%</strong> (아주경제
                    2009-01-12)
                  </li>
                </ul>
              </article>
            </div>
          </section>

          {/* 본문 중간 광고 */}
          <div className="mt-8">
            <GuideMidAd />
          </div>

          {/* 흑자전환 배경 */}
          <section
            className="mt-8 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="turnaround-heading"
          >
            <h2
              id="turnaround-heading"
              className="text-xl sm:text-2xl font-black mb-3 flex items-center gap-2"
            >
              <Info className="w-5 h-5 text-primary" />
              왜 4년 만에 재개됐나 — FY2025 흑자전환
            </h2>
            <p className="text-sm leading-relaxed text-navy">
              LG디스플레이는 FY2022년 <strong>영업적자 -2조850억원</strong>을
              시작으로 FY2024년까지 3년 연속 적자를 기록해 경영성과급이 계속
              미지급이었습니다. FY2025년 <strong>매출 25조8,101억원 · 영업이익
              5,170억원</strong>으로 흑자전환에 성공하면서, 2026년 1월 29일
              전 사업부 일괄 <strong>기본급의 150%</strong> 지급이 공지됐고 2월
              급여와 함께 지급됐습니다 (EBN·한국경제·아주경제·서울경제TV
              2026-01-29 보도).
            </p>
            <p className="text-sm leading-relaxed text-navy mt-3">
              다음 지급(FY2026 실적분, 2027년 초)은{" "}
              <strong className="text-primary">아직 미확정</strong>입니다.
              흑자 유지 여부와 전략 과제 달성도에 따라 결정되며, 확정 보도가
              나오면 본 페이지에 즉시 반영합니다.
            </p>
          </section>

          {/* FAQ 앞 광고 */}
          <div className="mt-10">
            <InArticleAd />
          </div>

          {/* FAQ */}
          <section className="mt-12" aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl font-black mb-6"
            >
              자주 묻는 질문
            </h2>
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

          {/* 면책 */}
          <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="block mb-1 text-amber-900">
                  ⚠️ 추정 시뮬레이터입니다
                </strong>
                <span className="text-amber-800">
                  본 계산기는 공개 언론 보도(EBN·한국경제·아주경제·서울경제TV
                  2026-01-29 등)와 사업보고서 기반 추정 모델이며 회사 공식
                  자료가 아닙니다. 실제 지급은 본인 기본급 구성·근속·직급에
                  따라 차이가 날 수 있고, FY2026 실적분(2027년 초) 지급률은
                  미확정입니다.
                </span>
              </span>
            </p>
          </aside>

          {/* 관련 회사 계산기 + 회사 DB */}
          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/lg-energy-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">
                📊 비교 계산기
              </p>
              <p className="font-black text-lg">
                LG에너지솔루션 성과급 계산기 →
              </p>
              <p className="text-sm text-faint mt-1">
                같은 LG그룹 계열사 성과급 비교
              </p>
            </Link>
            <Link
              href="/salary-db/lg-display"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">LG디스플레이 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">
                직급별 평균 연봉, 워라밸, 복지 전체
              </p>
            </Link>
          </section>

          {/* 쿠팡 + 관련 계산기 */}
          <div className="mt-10">
            <CoupangBanner
              responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
            />
          </div>

          <BonusClusterLinks currentSlug="lg-display-bonus" />

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          {/* 출처 */}
          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: 기본급 150%·4년 만의 지급
                재개·FY2025 실적 — EBN·한국경제·아주경제·서울경제TV 2026-01-29
                보도. 과거 300% 이력 — MTN 2015-01-30, 아주경제 2009-01-12
                보도. 평균연봉 8,000만원 — FY2023 사업보고서(DART),
                뉴시스·파이낸셜뉴스 2024-03-14 보도. 2026년 세법(소득세율·4대보험
                요율) 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
