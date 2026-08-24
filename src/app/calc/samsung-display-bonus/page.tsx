// src/app/calc/samsung-display-bonus/page.tsx
//
// 삼성디스플레이 성과급 계산기 — 삼성 계열 공통 OPI + TAI 이원 구조.
// OPI: 2025년 실적분 연봉의 36% (전 사업부 공통, 2026-01-30 지급) / 2024년 실적분 40%
// TAI: 2025년 하반기 대형·중소형 모두 월 기본급의 50% (2025-12-24 지급)
// 출처: 연합뉴스·디지털타임스 2026-01-28, 뉴시스 2025-12-22, SBS Biz 2025-07-01

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
import { InArticleAd, CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Monitor, AlertTriangle, Info } from "lucide-react";
import SamsungDisplayBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/samsung-display-bonus";
const PAGE_TITLE = "삼성디스플레이 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "삼성디스플레이 성과급 계산기. OPI(2025년 실적분 연봉의 36%, 전 사업부 공통) + TAI(월 기본급 %, 반기별) 합산. 본인 연봉만 입력하면 세전·세후 실수령액이 즉시. 연합뉴스·뉴시스 보도 기준 2026 최신.";

const FAQ_ITEMS = [
  {
    question: "삼성디스플레이 성과급은 어떻게 구성되나요?",
    answer:
      "삼성 계열 공통 2축 구조입니다. (1) OPI(초과이익성과급): 연 1회 1월 지급, 사업부 실적이 연초 목표를 초과하면 초과이익의 20% 재원 한도 내에서 개인 연봉의 최대 50%까지 지급. 삼성디스플레이는 대형·중소형 사업부 구분 없이 전 사업부 공통 지급률이 적용됩니다. (2) TAI(목표달성장려금): 상·하반기 각 1회(7월·12월), 월 기본급의 최대 100%까지 사업부별 차등 지급됩니다.",
  },
  {
    question: "2026년 삼성디스플레이 OPI는 얼마인가요?",
    answer:
      "2025년 실적분 OPI는 연봉의 36%(전 사업부 공통)로, 2026년 1월 30일 지급됐습니다 (연합뉴스·디지털타임스 2026-01-28 보도). 전년인 2024년 실적분은 연봉의 40%였습니다 (2025년 1월 지급, 연합뉴스 2026-01-28 기사 내 전년 수치 인용). 본 계산기는 두 해 실적분과 상한 50% 시나리오를 모두 제공합니다.",
  },
  {
    question: "TAI는 최근 얼마나 나왔나요?",
    answer:
      "2025년 하반기 TAI는 대형·중소형 사업부 모두 월 기본급의 50%로, 2025년 12월 24일 지급됐습니다 (뉴시스 2025-12-22 보도). 2025년 상반기 확정치는 보도로 확인되지 않았으며, 이청 대표 발언 기준 '중소형 75% 이상·대형 50% 이상' 전망이 보도된 바 있습니다 (SBS Biz 2025-07-01). 본 계산기는 상·하반기 %를 각각 조정할 수 있습니다.",
  },
  {
    question: "삼성전자 성과급과 무엇이 다른가요?",
    answer:
      "제도 골격(OPI + TAI)은 동일하지만, 삼성전자는 DS·DX 등 부문·사업부별로 OPI 지급률이 크게 차등되는 반면, 삼성디스플레이는 최근 지급(2026-01) 기준 대형·중소형 구분 없이 전 사업부 공통 지급률이 적용됐습니다. TAI는 두 회사 모두 사업부별 차등입니다. '삼성전자 성과급 시뮬레이터' 페이지에서 비교해 보세요.",
  },
  {
    question: "기본급은 어떻게 정의되나요?",
    answer:
      "삼성 계열 TAI 기준 기본급은 통상 연봉의 1/20입니다. 예를 들어 연봉 8,000만원이면 월 기본급 400만원이고, TAI 50%면 반기당 200만원입니다. 본 계산기는 연봉을 입력하면 기본급과 TAI를 자동 산출합니다.",
  },
  {
    question: "삼성디스플레이 평균 연봉은 얼마인가요?",
    answer:
      "삼성디스플레이는 비상장사로, 사업보고서 기반 평균연봉 보도값은 확인되지 않았습니다. 참고치로 사람인(국민연금 데이터 기반 추정)의 2024년 기준 평균연봉 약 1억 333만원이 있으나 공시값이 아닌 추정치입니다. 직급별 상세는 '삼성디스플레이 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "OPI·TAI 모두 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험(국민연금 4.75%, 건강보험 3.595% 등)이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 연 7,908만원) 적용. 본 계산기는 연봉 기준 세금과 연봉+성과급 합산 세금의 차이를 성과급에 귀속시키는 marginal 방식으로 정확하게 산출합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "연합뉴스·디지털타임스(2026-01-28)·뉴시스(2025-12-22)·SBS Biz(2025-07-01) 공개 보도 기반 추정 모델입니다. 실제 지급은 본인 사업부·평가·근속·기본급 산정 방식에 따라 차이가 날 수 있으며, 2026년 실적분(2027년 1월 지급 예정) OPI는 미확정입니다. 정확한 본인 케이스는 사내 시스템에서 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  { name: "OPI 시나리오 선택", text: "2025 실적분 36%(확정) / 2024 실적분 40% / 상한 50% / 직접 입력 중 선택." },
  { name: "본인 연봉 입력", text: "연 기본 연봉 입력. 기본급(연봉 ÷ 20) 자동 산출." },
  { name: "TAI 반기별 % 설정", text: "상반기·하반기 TAI %를 각각 설정. 2025 하반기 확정치 50% 프리셋 제공." },
  { name: "결과 확인", text: "OPI + TAI 합산 세전 성과급 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 marginal 방식 자동 계산." },
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
    "삼성디스플레이 성과급",
    "삼성디스플레이 OPI",
    "삼성디스플레이 TAI",
    "삼성디스플레이 성과급 계산기",
    "삼성디스플레이 보너스",
    "삼성디스플레이 초과이익성과급",
    "삼성디스플레이 목표달성장려금",
    "삼성디스플레이 성과급 2026",
    "삼성 계열사 성과급",
    "디스플레이 성과급",
  ],
};

export default function SamsungDisplayBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "삼성디스플레이 성과급" }),
          softwareApplicationLd({ name: PAGE_TITLE, description: PAGE_DESC, url: `${SITE_URL}${PAGE_PATH}` }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "삼성디스플레이 성과급 계산하는 방법",
            description: "OPI 시나리오·본인 연봉·반기별 TAI로 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Monitor className="w-3.5 h-3.5" />
              2026-01 OPI 36% 확정 · 2025 하반기 TAI 50%
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              삼성디스플레이 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              삼성 계열 공통 <strong>OPI + TAI</strong> 이원 구조. OPI 시나리오와
              본인 연봉만 입력하면 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <SamsungDisplayBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 성과급 구조 · 지급 이력 — 본문 콘텐츠 */}
          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="sdc-structure-heading"
          >
            <h2 id="sdc-structure-heading" className="text-2xl font-black mb-4">
              삼성디스플레이 성과급 구조 — OPI · TAI
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">OPI (초과이익성과급)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 연 1회 지급 (통상 1월 말)</li>
                  <li>• 초과이익의 20% 재원 한도 내 <strong>연봉의 최대 50%</strong></li>
                  <li>• 삼성디스플레이는 <strong>전 사업부(대형·중소형) 공통</strong> 지급률</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">TAI (목표달성장려금)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 상·하반기 각 1회 (7월·12월)</li>
                  <li>• 월 기본급의 <strong>최대 100%</strong>, 사업부별 차등</li>
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
                    <th className="py-2 font-bold">출처·시점</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">OPI 2025년 실적분 (2026-01-30 지급)</td>
                    <td className="py-2 pr-4"><strong>연봉의 36%</strong> (전 사업부 공통)</td>
                    <td className="py-2">연합뉴스·디지털타임스 2026-01-28</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">OPI 2024년 실적분 (2025년 1월 지급)</td>
                    <td className="py-2 pr-4">연봉의 40%</td>
                    <td className="py-2">연합뉴스 2026-01-28 (전년 수치 인용)</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">TAI 2025년 하반기 (2025-12-24 지급)</td>
                    <td className="py-2 pr-4">대형·중소형 모두 <strong>월 기본급의 50%</strong></td>
                    <td className="py-2">뉴시스 2025-12-22</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">TAI 2025년 상반기 (7월 지급)</td>
                    <td className="py-2 pr-4">확정치 보도 미확보 — 중소형 75%·대형 50% 이상 전망</td>
                    <td className="py-2">SBS Biz 2025-07-01 (이청 대표 발언)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-faint mt-3">
              ※ 공개 보도 기반. 실제 지급률은 사업부·평가에 따라 달라질 수 있으며,
              2026년 실적분(2027년 1월 지급 예정)은 미확정입니다.
            </p>
          </section>

          <div className="mt-10">
            <GuideMidAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">OPI 36%는 실제로 얼마일까</h2>
            <p className="text-sm leading-relaxed text-faint mb-4">
              2025년 실적분 OPI 36%를 연봉 구간별로 환산하면 다음과 같습니다. TAI(상·하반기
              각 월 기본급 50% 가정)를 더한 합산도 함께 표시합니다. 세전 기준이며, 세후
              실수령액은 위 계산기에서 본인 조건으로 확인하세요.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-canvas-deep text-left">
                    <th className="py-2 pr-4 font-bold">연봉</th>
                    <th className="py-2 pr-4 font-bold">OPI 36%</th>
                    <th className="py-2 pr-4 font-bold">TAI (50%×2회)</th>
                    <th className="py-2 font-bold">합산 (세전)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">5,500만원</td>
                    <td className="py-2 pr-4">1,980만원</td>
                    <td className="py-2 pr-4">275만원</td>
                    <td className="py-2 font-bold">2,255만원</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">8,000만원</td>
                    <td className="py-2 pr-4">2,880만원</td>
                    <td className="py-2 pr-4">400만원</td>
                    <td className="py-2 font-bold">3,280만원</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">1억원</td>
                    <td className="py-2 pr-4">3,600만원</td>
                    <td className="py-2 pr-4">500만원</td>
                    <td className="py-2 font-bold">4,100만원</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">1억 2,000만원</td>
                    <td className="py-2 pr-4">4,320만원</td>
                    <td className="py-2 pr-4">600만원</td>
                    <td className="py-2 font-bold">4,920만원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-faint mt-3">
              ※ 기본급 = 연봉 ÷ 20 가정. TAI 상반기는 확정치 보도가 없어 하반기와 동일한
              50%로 가정한 예시 표입니다.
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
                  연합뉴스·디지털타임스(2026-01-28)·뉴시스(2025-12-22)·SBS Biz(2025-07-01)
                  공개 보도 기반 추정. 실제 지급은 사업부·평가·근속·기본급 산정 방식에 따라
                  차이 가능하며, 2026년 실적분 OPI와 2026년 TAI는 미확정입니다.
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
              href="/salary-db/samsung-display"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">삼성디스플레이 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 워라밸 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />
          </div>

          <BonusClusterLinks currentSlug="samsung-display-bonus" />

          <RelatedCalculators currentPath={PAGE_PATH} limit={4} title="다음 계산기도 함께 보세요" />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: OPI 2025년 실적분 36%·2024년 실적분 40% —
                연합뉴스·디지털타임스 2026-01-28 보도 / TAI 2025년 하반기 50% — 뉴시스
                2025-12-22 보도 / TAI 2025년 상반기 전망 — SBS Biz 2025-07-01 보도.
                2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
