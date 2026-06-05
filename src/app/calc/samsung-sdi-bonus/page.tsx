// src/app/calc/samsung-sdi-bonus/page.tsx
//
// 삼성SDI 성과급 계산기 — 삼성 OPI + TAI 구조, 배터리 사이클 영향.
// 2024: 배터리 32% / 전자재료 18% / 본사 28%
// 2025-26: 전기차 캐즘 → 배터리 OPI 0%, 전자재료 3~5%

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
import { Battery, AlertTriangle, Info } from "lucide-react";
import SamsungSdiBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/samsung-sdi-bonus";
const PAGE_TITLE = "삼성SDI 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "삼성SDI 성과급 계산기. OPI(연봉의 0~48%) + TAI(월 기본급 100% × 2회) 합산. 배터리·전자재료·본사 사업부별 시나리오와 본인 연봉만 입력하면 세전·세후 실수령액이 즉시.";

const FAQ_ITEMS = [
  {
    question: "삼성SDI 성과급은 어떻게 구성되나요?",
    answer:
      "삼성SDI는 삼성 그룹 표준 보상체계 — OPI(연봉의 0~50%, 사업부별 영업이익 연동) + TAI(월 기본급 최대 100% × 연 2회) 구조입니다. OPI는 1월에 연 1회, TAI는 6·12월에 연 2회 지급됩니다. 사업부별로 차등 지급되며 본 계산기는 사업부 시나리오 + 본인 연봉으로 정확하게 산출합니다.",
  },
  {
    question: "2024년 vs 2026년 삼성SDI OPI 차이는?",
    answer:
      "2024년 초 지급 OPI: 배터리 32% / 전자재료 18% / 본사 28% — 전기차 호황 마지막 시기. 2026년(2025년 실적 기준): 전기차 캐즘으로 영업적자 전환, 배터리·본사 OPI 0%, 전자재료만 3~5%. 본 계산기 '캐즘' 시나리오가 2026년 현실. 회복기 200%, 호황기 48% 등 시나리오 비교 가능.",
  },
  {
    question: "전기차 캐즘이 왜 성과급에 큰 영향?",
    answer:
      "삼성SDI 매출의 70% 이상이 배터리(중대형 + 소형). 전기차 캐즘(수요 둔화) 시 (1) 매출 감소, (2) ESS 전환 비용, (3) 미국 IRA 정책 불확실성으로 영업이익 급감 → OPI 풀이 사라짐. 다만 전자재료(폴더블·OLED 소재)는 안정적이라 OPI 일부 지급. 2027년 ESS·LFP 시장 회복 시 다시 200%대로 복구 전망.",
  },
  {
    question: "삼성전자 성과급과 비교하면?",
    answer:
      "동일한 OPI + TAI 구조이지만 (1) 삼성전자는 영업이익 풀을 부문·사업부로 분배, (2) 삼성SDI는 사업부별 영업이익 직접 연동입니다. 삼성전자는 사업부 적자 시에도 부문 균등 분배 일부 받지만, 삼성SDI는 사업부 적자면 거의 0. 변동성은 SDI가 더 큼. '삼성전자 성과급 시뮬레이터' 페이지에서 비교 가능.",
  },
  {
    question: "기본급은 어떻게 정의되나요?",
    answer:
      "삼성SDI는 삼성 표준 — TAI 기준 기본급은 통상 연봉의 1/20입니다. 예: 연봉 1억이면 기본급 500만/월, TAI 100% × 2회 = 1,000만원 추가. 본 계산기에서는 본인이 연봉을 입력하면 기본급·TAI 자동 산출됩니다.",
  },
  {
    question: "세금은 어떻게 떼나요?",
    answer:
      "성과급은 근로소득 합산 누진세율(6~45%) + 지방세 + 4대보험(국민연금 4.75%, 건강 3.595%, 장기요양 등). 국민연금은 보수월액 상한(2026 연 7,644만원) 적용. 본 계산기는 marginal 방식으로 정확하게 산출합니다.",
  },
  {
    question: "LG에너지솔루션과 어떻게 다른가요?",
    answer:
      "두 회사 모두 배터리 사이클에 민감하지만 (1) LG엔솔은 단순 %(50~900%) 단일 풀, (2) 삼성SDI는 OPI + TAI 분리 구조. 캐즘 시 LG엔솔도 75%로 떨어졌고 삼성SDI는 배터리 0%. 다만 SDI는 전자재료 사업부가 일부 OPI 받음. '/calc/lg-energy-bonus' 비교 가능.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "공개 보도(CEOSCOREDAILY·파이낸셜포스트·전자신문) + 삼성SDI 분기 실적 기반 추정 모델. 실제 지급은 본인 사업부·평가·근속에 따라 ±20% 차이 가능. 정확한 본인 케이스는 사내 시스템 확인.",
  },
];

const HOW_TO_STEPS = [
  { name: "사업부 시나리오 선택", text: "캐즘 0% / 전자재료 3-5% / 회복 18% / 평년 28% / 호황 48%." },
  { name: "본인 연봉 입력", text: "연 기본 연봉 입력. 기본급(연봉/20)·TAI 자동 산출." },
  { name: "TAI 포함 여부", text: "TAI(월 기본급 100% × 2회) 자동 합산. 회사 적자 시 TAI도 감소." },
  { name: "결과 확인", text: "OPI + TAI 합산 세전 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세 + 4대보험 marginal 자동 계산." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "삼성SDI 성과급",
    "삼성SDI OPI",
    "삼성SDI TAI",
    "삼성SDI 성과급 계산기",
    "삼성SDI 보너스",
    "배터리 성과급",
    "삼성SDI 2026",
    "전자재료 OPI",
    "전기차 캐즘 성과급",
    "삼성 계열사 성과급",
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

export default function SamsungSdiBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "삼성SDI 성과급" }),
          softwareApplicationLd({ name: PAGE_TITLE, description: PAGE_DESC, url: `${SITE_URL}${PAGE_PATH}` }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "삼성SDI 성과급 계산하는 방법",
            description: "사업부 시나리오·본인 연봉으로 OPI+TAI 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Battery className="w-3.5 h-3.5" />
              2024 배터리 32% / 2026 캐즘 0% (전자재료만 3-5%)
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              삼성SDI 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              삼성 표준 <strong>OPI + TAI</strong> 구조. 사업부 시나리오와 본인
              연봉만 입력하면 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <SamsungSdiBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

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
                  <p className="mt-3 text-sm leading-relaxed text-faint pl-7">{item.answer}</p>
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
                  CEOSCOREDAILY·파이낸셜포스트·전자신문 보도 + 분기 실적 기반 추정.
                  실제 지급은 사업부·평가·근속에 따라 ±20% 차이 가능.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/samsung-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">삼성전자 성과급 시뮬레이터 →</p>
              <p className="text-sm text-faint mt-1">반도체 OPI + TAI 사업부별 분배</p>
            </Link>
            <Link
              href="/salary-db/samsung-sdi"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">삼성SDI 평균 연봉·복지 →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 워라밸 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />
          </div>

          <RelatedCalculators currentPath={PAGE_PATH} limit={4} title="다음 계산기도 함께 보세요" />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: CEOSCOREDAILY·파이낸셜포스트·전자신문
                삼성 계열사 OPI 보도 (2026-01·12), 삼성SDI 분기 실적. 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
