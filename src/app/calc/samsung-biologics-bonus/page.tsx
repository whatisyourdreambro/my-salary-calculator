// src/app/calc/samsung-biologics-bonus/page.tsx
//
// 삼성바이오로직스 성과급 계산기 — 삼성 계열 공통 OPI + TAI 구조.
// OPI: 2024·2025 실적분 2년 연속 연봉의 50%(상한) 지급.
// TAI: 2025 상반기 월 기본급 100%(최대치) 확정, 하반기 확정치 보도 미확보.

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
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
import { GuideMidAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { FlaskConical, AlertTriangle, Info } from "lucide-react";
import SamsungBiologicsBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/samsung-biologics-bonus";
const PAGE_TITLE = "삼성바이오로직스 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "삼성바이오로직스 성과급 계산기. OPI(2024·2025 실적분 2년 연속 연봉의 50% 상한) + TAI(월 기본급 최대 100% × 연 2회) 합산. 본인 연봉만 입력하면 세전·세후 실수령액이 즉시 계산됩니다.";

const FAQ_ITEMS = [
  {
    question: "삼성바이오로직스 성과급은 어떻게 구성되나요?",
    answer:
      "삼성 계열 공통 2축 구조입니다. (1) OPI(초과이익성과급): 매년 1월, 직전년도 경영실적 기준 초과이익의 20% 한도 내에서 연봉의 최대 50%까지 지급. (2) TAI(목표달성장려금): 상·하반기 각 1회, 소속 사업부문·사업부 평가 합산으로 월 기본급의 최대 100%까지 지급. 본 계산기는 두 항목을 합산해 세전·세후를 산출합니다.",
  },
  {
    question: "최근 OPI는 얼마나 지급됐나요?",
    answer:
      "2년 연속 상한(연봉의 50%)입니다. 2024년 실적분은 연봉의 50%로 2025년 1월 지급(한국경제 2025-07-08 보도), 2025년 실적분도 연봉의 50%(상한)로 책정 공지되어 2026년 1월 지급 예상(아시아경제 2025-12-27, 산경투데이·컨슈머타임스 2025-12-26 보도)입니다. 매년 사상 최대 실적을 경신하면서 지급률이 상한에 연속 도달한 결과입니다.",
  },
  {
    question: "TAI는 얼마나 지급됐나요?",
    answer:
      "2025년 상반기 TAI는 월 기본급의 100%(최대치)로 확정되어 2025년 7월 지급됐습니다(한국경제·데일리안·뉴데일리경제 2025-07-08 보도). 2025년 하반기(12월 지급분) 확정치는 보도가 확인되지 않아 미확정입니다. 본 계산기에서는 상·하반기 TAI 비율을 직접 조정할 수 있습니다.",
  },
  {
    question: "OPI 상한 50%는 왜 계속 도달하나요?",
    answer:
      "OPI는 사업부 실적이 연초 목표를 초과하면 초과이익의 20%를 재원으로 연봉의 최대 50%까지 지급하는 구조입니다. 삼성바이오로직스는 CDMO(위탁개발생산) 수주 확대로 매년 사상 최대 실적을 경신해 왔고, 그 결과 2024·2025 실적분 모두 상한인 연봉의 50%에 도달했습니다. 다만 상한 도달이 제도적으로 보장되는 것은 아니며 향후 실적에 따라 달라질 수 있습니다.",
  },
  {
    question: "삼성전자 성과급과 어떻게 다른가요?",
    answer:
      "제도 자체(OPI + TAI)는 삼성 계열 공통으로 동일합니다. 차이는 실적입니다. 삼성전자는 사업부별 편차가 커서 OPI가 0~50% 사이에서 크게 갈리지만, 삼성바이오로직스는 최근 2년 연속 전사 상한(50%)에 도달했습니다. '삼성전자 성과급 시뮬레이터' 페이지에서 비교해볼 수 있습니다.",
  },
  {
    question: "TAI 기준 기본급은 어떻게 계산하나요?",
    answer:
      "삼성 계열의 TAI 기준 월 기본급은 통상 연봉의 1/20으로 봅니다. 예: 연봉 1억원이면 월 기본급 500만원, TAI 100% × 연 2회 = 1,000만원 추가. 본 계산기는 연봉 입력 시 기본급·TAI를 자동 산출합니다.",
  },
  {
    question: "삼성바이오로직스 평균 연봉은?",
    answer:
      "2025년 사업보고서 기준 직원 평균 보수(대표·임원 제외)는 1억 1,400만원입니다(MTN 머니투데이방송 2026-03-19, DART 인용). 2021년 7,900만원 대비 4년 새 44% 증가했는데, 상한 OPI 연속 지급이 큰 몫을 했습니다. 직급별 상세는 '삼성바이오로직스 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "OPI·TAI 모두 근로소득에 합산되어 누진세율(6~45%) + 지방세(소득세의 10%) + 4대보험이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 연 7,908만원) 적용. 본 계산기는 marginal 방식으로 성과급 수령 전후 세금 차액을 정확하게 산출합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "아시아경제(2025-12-27)·산경투데이·컨슈머타임스(2025-12-26)·한국경제·데일리안·뉴데일리경제(2025-07-08) 공개 보도 기반 추정 모델입니다. 실제 지급은 본인 사업부문·평가·근속에 따라 차이 날 수 있고, 2025년 하반기 TAI와 향후 연도 지급률은 미확정입니다. 정확한 본인 케이스는 사내 시스템을 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  { name: "OPI 시나리오 선택", text: "2025 실적분 50% / 2024 실적분 50% / 직접 입력 중 선택." },
  { name: "본인 연봉 입력", text: "연 기본 연봉 입력. 기본급(연봉/20) 자동 산출. 평균 1억 1,400만원." },
  { name: "TAI 설정", text: "상반기 100% 확정 반영, 하반기(미확정)는 직접 조정." },
  { name: "결과 확인", text: "OPI + TAI 합산 세전 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세 + 4대보험 marginal 자동 계산." },
];

export const metadata: Metadata = {
  // canonical/OG/twitter/robots/hreflang은 buildPageMetadata(src/lib/seo.ts) 정본으로 생성 —
  // 수기 canonical 드리프트 방지. 기존 출력값은 유지되고 헬퍼 자동 필드만 추가된다.
  ...buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: PAGE_PATH,
  }),
  // 페이지 고유 키워드 — 헬퍼의 DEFAULT_KEYWORDS 병합으로 기존 keywords 출력이
  // 바뀌지 않도록 기존 값 그대로 override.
  keywords: [
    "삼성바이오로직스 성과급",
    "삼성바이오로직스 OPI",
    "삼성바이오로직스 TAI",
    "삼성바이오로직스 성과급 계산기",
    "삼성바이오 성과급",
    "삼바 성과급",
    "삼성바이오로직스 연봉",
    "삼성바이오로직스 보너스",
    "삼성 계열사 성과급",
    "삼성바이오로직스 2026",
  ],
};

export default function SamsungBiologicsBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "삼성바이오로직스 성과급" }),
          softwareApplicationLd({ name: PAGE_TITLE, description: PAGE_DESC, url: `${SITE_URL}${PAGE_PATH}` }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "삼성바이오로직스 성과급 계산하는 방법",
            description: "OPI 시나리오·본인 연봉으로 OPI+TAI 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <FlaskConical className="w-3.5 h-3.5" />
              OPI 2년 연속 연봉 50% 상한 + TAI 상반기 100%
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              삼성바이오로직스 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              삼성 계열 공통 <strong>OPI + TAI</strong> 구조. OPI는 2024·2025
              실적분 2년 연속 <strong>연봉의 50%(상한)</strong> — 본인 연봉만
              입력하면 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <SamsungBiologicsBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 성과급 구조 · 지급 이력 — 본문 콘텐츠 (광고 사이 배치) */}
          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="biologics-structure-heading"
          >
            <h2 id="biologics-structure-heading" className="text-2xl font-black mb-4">
              삼성바이오로직스 성과급 구조 — OPI · TAI
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">OPI (초과이익성과급)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 직전년도 초과이익의 <strong>20% 한도</strong> 재원</li>
                  <li>• <strong>연봉의 최대 50%</strong>, 매년 1월 지급</li>
                  <li>• 2024·2025 실적분 <strong>2년 연속 상한 50%</strong> 도달</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">TAI (목표달성장려금)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 월 기본급의 <strong>최대 100% × 연 2회</strong> (상·하반기)</li>
                  <li>• 사업부문·사업부 평가 합산으로 결정</li>
                  <li>• 기본급 = 통상 연봉의 1/20</li>
                </ul>
              </article>
            </div>
            <h3 className="font-bold text-lg mb-3">최근 지급 이력 (보도 기준)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-canvas-deep text-left">
                    <th className="py-2 pr-4 font-bold">항목</th>
                    <th className="py-2 pr-4 font-bold">지급률</th>
                    <th className="py-2 pr-4 font-bold">지급 시기</th>
                    <th className="py-2 font-bold">출처</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">OPI 2025년 실적분</td>
                    <td className="py-2 pr-4">연봉의 50% (상한)</td>
                    <td className="py-2 pr-4">2026년 1월 (예상)</td>
                    <td className="py-2">아시아경제 2025-12-27, 산경투데이·컨슈머타임스 2025-12-26</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">OPI 2024년 실적분</td>
                    <td className="py-2 pr-4">연봉의 50% (상한)</td>
                    <td className="py-2 pr-4">2025년 1월</td>
                    <td className="py-2">한국경제 2025-07-08</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">TAI 2025년 상반기</td>
                    <td className="py-2 pr-4">월 기본급의 100% (최대치)</td>
                    <td className="py-2 pr-4">2025년 7월</td>
                    <td className="py-2">한국경제·데일리안·뉴데일리경제 2025-07-08</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">TAI 2025년 하반기</td>
                    <td className="py-2 pr-4">미확정 (확정치 보도 미확보)</td>
                    <td className="py-2 pr-4">2025년 12월 지급분</td>
                    <td className="py-2">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-faint mt-3">
              ※ 공개 보도 기반. 실제 지급률은 사업부문·평가에 따라 달라질 수
              있으며, 향후 연도 지급률은 미확정입니다.
            </p>
          </section>

          <div className="mt-10">
            <GuideMidAd />
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
                  아시아경제·산경투데이·컨슈머타임스·한국경제·데일리안·뉴데일리경제
                  공개 보도 기반 추정. 2025년 하반기 TAI·향후 연도 지급률은
                  미확정이며, 실제 지급은 사업부문·평가·근속에 따라 차이 날 수
                  있습니다.
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
              <p className="text-sm text-faint mt-1">동일 OPI + TAI 구조, 사업부별 분배</p>
            </Link>
            <Link
              href="/salary-db/samsung-biologics"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">삼성바이오로직스 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">평균 연봉 1억 1,400만원, 복지 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "square", desktop: "rectangle" }} />
          </div>

          <BonusClusterLinks currentSlug="samsung-biologics-bonus" />

          <RelatedCalculators currentPath={PAGE_PATH} limit={4} title="다음 계산기도 함께 보세요" />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: OPI 2025 실적분 50% — 아시아경제
                (2025-12-27)·산경투데이·컨슈머타임스(2025-12-26) / OPI 2024
                실적분 50%·TAI 2025 상반기 100% — 한국경제·데일리안·뉴데일리경제
                (2025-07-08) / 평균 연봉 1억 1,400만원 — MTN 머니투데이방송
                (2026-03-19, 2025년 사업보고서 DART 인용). 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
