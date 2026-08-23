// src/app/calc/hanwha-aerospace-bonus/page.tsx
//
// 한화에어로스페이스 성과급(BPI+VEI) 계산기.
// BPI(전사 공통 경영성과급) + VEI(조직별 성과급) 2단 구조, 월 기본급 대비 % 지급.
// FY2025 실적분(2026-02 지급): 사업부별 차등 — 지상방산(LS) 725% / 유도무기(PGM) 702.8%
//   / MRO 510.6% / 항공 494.8% / 그 외 497~507%대 + 전 임직원 정액 400만원
//   (한국경제TV 단독·알파경제 2026-02-13).
// FY2024 실적분(2025-02 지급): 기본급의 710% + 일시금 500만원 (뉴스1·파이낸셜뉴스 2025-02-19).
// FY2026 실적분(2027년 초 지급 예상): 미확정 — 2027년 2월경 보도 확인 후 갱신 필요.

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
import { Rocket, AlertTriangle, Info } from "lucide-react";
import HanwhaAerospaceBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/hanwha-aerospace-bonus";
const PAGE_TITLE = "한화에어로스페이스 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "한화에어로스페이스 성과급(BPI·VEI) 계산기. 소속 사업부와 본인 월 기본급만 입력하면 지상방산 725%·유도무기 702.8%·MRO 510.6%·항공 494.8% 등 사업부별 차등 지급률 + 정액 인센티브 400만원 합산 세전·세후 실수령액이 즉시 계산됩니다. 2026년 2월 지급 실적(최대 725%)과 전년(710%+500만원) 비교까지.";

const FAQ_ITEMS = [
  {
    question: "한화에어로스페이스 성과급은 어떻게 계산되나요?",
    answer:
      "한화에어로스페이스 성과급은 BPI(전사 공통 경영성과급) + VEI(조직별 성과급)의 2단 구조로, 월 기본급 대비 %로 지급됩니다. BPI는 전사 동일 비율이 적용되고, VEI는 사업부·실별 KPI 달성도에 따라 차등 산정됩니다(한국경제TV 단독·알파경제 2026-02-13 보도). 여기에 목표 영업이익을 초과 달성하면 전 임직원 정액 인센티브가 별도로 지급됩니다 — 2026년에는 400만원이었습니다. 본 계산기는 '월 기본급 × 사업부 지급률 + 정액'으로 세전 총액을 구한 뒤 누진세율·4대보험을 반영한 세후 실수령액을 계산합니다.",
  },
  {
    question: "2026년 2월 지급된 사업부별 지급률은 얼마였나요?",
    answer:
      "FY2025 실적분으로 2026년 2월 지급된 성과급은 월 기본급 기준 최대 725%였습니다. 사업부별로는 지상방산(LS) 725%, 유도무기(PGM) 702.8%, MRO 510.6%, 항공 494.8%였고 그 외 사업부는 497~507%대로 보도됐습니다. 여기에 전 임직원 정액 인센티브 400만원이 별도 지급됐습니다(한국경제TV 단독·알파경제, 2026-02-13). 본 계산기의 '그 외 사업부' 옵션은 보수적으로 구간 하한인 497%를 적용합니다.",
  },
  {
    question: "왜 사업부마다 성과급이 다른가요?",
    answer:
      "VEI(조직별 성과급)가 사업부·실별 KPI 달성도에 따라 차등 산정되기 때문입니다(한국경제TV 단독 2026-02-13). K9 자주포·천무 등 수출이 집중된 지상방산(LS)이 725%로 가장 높았고, 유도무기(PGM)가 702.8%로 뒤를 이었으며, MRO(510.6%)·항공(494.8%)은 상대적으로 낮았습니다. 최고-최저 격차가 230%p 이상이므로 본인 소속 사업부 선택이 계산 정확도에 가장 큰 영향을 줍니다.",
  },
  {
    question: "작년(2025년 2월)에는 얼마나 받았나요?",
    answer:
      "FY2024 실적분으로 2025년 2월에는 기본급의 710% + 일시금 500만원이 지급됐습니다(뉴스1·파이낸셜뉴스, 2025-02-19). 본 계산기에서 'FY2024 실적분' 시나리오를 선택하면 해당 기준으로 계산할 수 있어, 올해 지급분과 작년 지급분을 비교해 볼 수 있습니다.",
  },
  {
    question: "내년(2027년 초) 성과급은 얼마나 될까요?",
    answer:
      "FY2026 실적분(2027년 초 지급 예상)은 미확정입니다. 참고로 2026년 임금단체협상에서 노조가 기본급 43만9,700원(약 11.14%) 인상 + 타결금 2,000만원 + 생산성 격려금 2,000만원을 요구하며 협상이 진행 중인 것으로 보도됐습니다(뉴스웨이, 2026-04-08). 임단협 결과와 연간 실적이 확정되면 본 페이지에 반영할 예정입니다.",
  },
  {
    question: "한화에어로스페이스 평균 연봉은 얼마인가요?",
    answer:
      "FY2025 사업보고서(DART, 2026-03-16 제출) 기준 직원 평균 급여는 1억 2,400만원입니다(소비자가만드는신문 2026-03-26 보도 교차 확인). 직원 8,168명, 연간 급여총액 1조 154억원이며, 전년 1억 1,800만원 대비 +5.1%로 방산업계 최고 수준입니다. 성과급이 포함된 수치라 사업부·직급별 편차가 큽니다. 자세한 내용은 '한화에어로스페이스 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "성과급·정액 인센티브 모두 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상이면 추가 부과가 없습니다. 본 계산기는 '연봉+성과급 합산 세금 − 연봉만 기준 세금'을 성과급에 귀속시키는 marginal 방식으로 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 언론 보도(한국경제TV 단독·알파경제 2026-02-13, 뉴스1·파이낸셜뉴스 2025-02-19)와 사업보고서 공시 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 지급액은 본인 소속 조직의 VEI 산정 결과·개인 평가·근속에 따라 달라질 수 있습니다. 결과는 참고용으로만 사용하시고, 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "지급 연도 선택",
    text: "FY2025 실적분(2026년 2월 지급) / FY2024 실적분(2025년 2월 지급) / 직접 입력 중 선택.",
  },
  {
    name: "소속 사업부 선택",
    text: "지상방산(LS) 725% / 유도무기(PGM) 702.8% / MRO 510.6% / 항공 494.8% / 그 외 사업부 중 본인 소속 선택.",
  },
  {
    name: "본인 월 기본급 입력",
    text: "급여명세서의 월 기본급을 만원 단위로 입력. BPI·VEI는 월 기본급 대비 %로 지급됩니다.",
  },
  {
    name: "연봉 입력",
    text: "누진세율 계산용 본인 연봉 입력. 디폴트는 FY2025 공시 평균 1억 2,400만원.",
  },
  {
    name: "결과 확인",
    text: "기본급 × 지급률 + 정액 인센티브 합산 세전 총액과 누진세율·4대보험 반영 세후 실수령액이 즉시 표시.",
  },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "한화에어로스페이스 성과급",
    "한화에어로 성과급",
    "한화에어로스페이스 성과급 계산기",
    "한화에어로스페이스 BPI",
    "한화에어로스페이스 VEI",
    "한화에어로스페이스 725%",
    "한화 방산 성과급",
    "지상방산 성과급",
    "한화에어로스페이스 연봉",
    "한화에어로스페이스 성과급 2026",
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

export default function HanwhaAerospaceBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "한화에어로스페이스 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "한화에어로스페이스 성과급 계산하는 방법",
            description:
              "지급 연도·소속 사업부·본인 월 기본급으로 BPI+VEI 성과급 세전 총액과 세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Rocket className="w-3.5 h-3.5" />
              2026년 2월 지급 — 사업부 최대 725% + 정액 400만원
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              한화에어로스페이스 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              소속 사업부와 본인 월 기본급만 입력하면{" "}
              <strong>
                사업부별 차등 지급률 (지상방산 725% ~ 항공 494.8%) + 정액 인센티브 400만원
              </strong>{" "}
              합산 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <HanwhaAerospaceBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">한화에어로스페이스 성과급 구조</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">
                  📋 FY2025 실적분 (2026년 2월 지급)
                </h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>
                    • 지상방산(LS) <strong>725%</strong> — 사업부 최고
                  </li>
                  <li>
                    • 유도무기(PGM) <strong>702.8%</strong>
                  </li>
                  <li>
                    • MRO <strong>510.6%</strong>
                  </li>
                  <li>
                    • 항공 <strong>494.8%</strong>
                  </li>
                  <li>
                    • 그 외 사업부 <strong>497~507%대</strong>
                  </li>
                  <li>
                    • 전 임직원 정액 인센티브 <strong>400만원</strong> (목표 영업이익 초과
                    달성)
                  </li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  월 기본급 대비 %. 출처: 한국경제TV 단독·알파경제, 2026-02-13 보도.
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">
                  📊 FY2024 실적분 (2025년 2월 지급)
                </h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>
                    • 기본급의 <strong>710%</strong>
                  </li>
                  <li>
                    • 일시금 <strong>500만원</strong>
                  </li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  출처: 뉴스1·파이낸셜뉴스, 2025-02-19 보도. K-방산 수출 호황에 따른 역대급
                  실적이 배경입니다.
                </p>
              </article>
            </div>
            <div className="mt-4 rounded-xl border border-canvas-deep p-5 bg-canvas/30">
              <h3 className="font-bold mb-2">🧩 BPI + VEI 2단 구조</h3>
              <p className="text-sm leading-relaxed">
                한화에어로스페이스 성과급은 <strong>BPI(전사 공통 경영성과급)</strong>와{" "}
                <strong>VEI(조직별 성과급)</strong>로 나뉩니다. BPI는 전사 동일 비율,
                VEI는 사업부·실별 KPI 달성도에 따라 차등 산정되어 사업부 간 지급률 격차가
                발생합니다(2026년 최고 725% vs 최저 494.8%, 격차 230%p 이상). 목표
                영업이익 초과 달성 시 전 임직원 정액 인센티브가 별도로 지급됩니다.
              </p>
            </div>
          </section>

          <div className="mt-10">
            <GuideMidAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">2026 임단협 진행 상황</h2>
            <p className="text-sm leading-relaxed">
              2026년 임금단체협상에서 노조는{" "}
              <strong>
                기본급 43만9,700원(약 11.14%) 인상 + 타결금 2,000만원 + 생산성 격려금
                2,000만원
              </strong>
              을 요구하고 있으며, 2026년 4월 기준 미타결 상태입니다(뉴스웨이,
              2026-04-08). 임단협 결과는 차기 성과급·기본급 산정에 영향을 줄 수 있으므로
              타결 시 본 페이지에 반영할 예정입니다. FY2026 실적분(2027년 초 지급 예상)
              지급률은 <strong>미확정</strong>입니다.
            </p>
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
                <strong className="block mb-1 text-amber-900">
                  ⚠️ 추정 시뮬레이터입니다
                </strong>
                <span className="text-amber-800">
                  언론 보도(한국경제TV 단독·알파경제 2026-02-13, 뉴스1·파이낸셜뉴스
                  2025-02-19) 기반 추정 모델로 회사 공식 자료가 아닙니다. 실제 지급은
                  소속 조직 VEI 산정·개인 평가·근속에 따라 차이가 날 수 있으며, FY2026
                  실적분(2027년 초)은 미확정입니다.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/hyundai-rotem-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">현대로템 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">같은 K-방산 수출 호황 수혜 기업</p>
            </Link>
            <Link
              href="/salary-db/hanwha-aerospace"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">한화에어로스페이스 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">
                평균 연봉 1억 2,400만원(FY2025 공시), 직급별 연봉·복지 전체
              </p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />
          </div>

          <BonusClusterLinks currentSlug="hanwha-aerospace-bonus" />

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: FY2025 실적분 사업부별 지급률·정액 400만원 —
                한국경제TV 단독·알파경제 (2026-02-13). FY2024 실적분 710%+500만원 —
                뉴스1·파이낸셜뉴스 (2025-02-19). 2026 임단협 노조 요구안 — 뉴스웨이
                (2026-04-08). 평균연봉 1억 2,400만원 — DART 사업보고서 (2026-03-16 제출,
                소비자가만드는신문 2026-03-26 교차 확인). 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
