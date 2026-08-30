// src/app/calc/gs-caltex-bonus/page.tsx
//
// GS칼텍스 경영성과급 계산기.
// 정식 명칭 없는 연 1회 경영성과급 — 통상 1월 말 전 직원 일괄 지급,
// 전년도 경영성과(영업이익·정제마진)에 따라 규모 결정.
// 보도 관행상 "기본연봉의 %"와 "월 기본급의 %"가 병용됨:
//   기본급 % = 연봉 % × 20 (예: 기본급 800% = 연봉 40%).
// 최근 지급: 연봉 50%(2022 실적) → 40%(2023) → 12.5%(2024) → 25%(2025).
// 2026년 실적분(2027년 초 지급)은 미확정.

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
import { Fuel, AlertTriangle, Info } from "lucide-react";
import GsCaltexBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/gs-caltex-bonus";
const PAGE_TITLE = "GS칼텍스 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "GS칼텍스 경영성과급 계산기. 본인 기본연봉만 입력하면 2026년 초 지급된 기본연봉의 25%(기본급 500% 환산)를 포함해 최근 4개년 지급 실적(50%·40%·12.5%·25%) 시나리오별 세전·세후 실수령액이 즉시 계산됩니다. 기본급 % ↔ 연봉 % 환산(×20)까지 자동. 2026 세법 기준.";

const FAQ_ITEMS = [
  {
    question: "GS칼텍스 성과급은 어떻게 결정되나요?",
    answer:
      "GS칼텍스는 삼성 OPI 같은 정식 명칭의 산식 공표형 제도가 아니라, 전년도 경영성과(영업이익·정제마진)에 따라 회사가 규모를 정해 연 1회 지급하는 경영성과급 방식입니다. 통상 1월 말 전 직원에게 일괄 지급되며, '기본연봉의 %' 형태로 사내 공지됩니다. 호황기에는 격려금·온누리상품권 같은 부가 지급 사례도 보도됐습니다.",
  },
  {
    question: "2026년(2025년 실적분) 성과급은 얼마였나요?",
    answer:
      "SBS Biz 2026년 2월 22일 보도 기준, 2025년 실적에 대한 성과급은 기본연봉의 25%였습니다. 직전 지급(12.5%)의 2배로 늘었지만, 2023년 초 지급된 50%나 2024년 초의 40%보다는 낮은 수준입니다. 기본급 기준으로 환산하면 500%에 해당합니다.",
  },
  {
    question: "'기본급 250%'와 '연봉 12.5%'는 무슨 차이인가요?",
    answer:
      "같은 금액을 다르게 표현한 것입니다. GS칼텍스 성과급 보도에는 '기본연봉의 %'와 '월 기본급의 %' 두 표현이 병용되는데, 월 기본급을 연봉의 1/20로 보면 기본급 % = 연봉 % × 20 관계가 성립합니다. 예를 들어 기본급 250% = 연봉 12.5%, 기본급 800% = 연봉 40%입니다. 본 계산기는 두 표현을 자동 환산해 함께 보여줍니다.",
  },
  {
    question: "최근 4년 지급 추이는 어떻게 되나요?",
    answer:
      "언론 보도 기준으로 2022년 실적분(2023년 1월 지급) 기본연봉의 50% → 2023년 실적분(2024-01-31 지급) 40% → 2024년 실적분(2025-01-24 지급) 12.5% → 2025년 실적분(2026년 초 지급) 25%입니다. 2024년 실적분이 급감한 것은 2024년 1~3분기 누적 영업이익이 2,717억원으로 전년 대비 -81.8% 감소(2년 연속 감소)했기 때문입니다(디지털타임스 2025-01-21).",
  },
  {
    question: "상품권이나 격려금도 받나요?",
    answer:
      "2025년 1월 24일 지급 때는 성과급(기본급 250%)과 함께 온누리상품권 15만원이 지급됐습니다(디지털타임스 2025-01-21). 호황기였던 2023년 1월에는 기본급 1,000% + 격려금 200% 지급 보도(뉴스저널리즘)도 있었습니다. 다만 같은 시기 남도일보는 '기본연봉의 50%(평균 5천만원 예상)'로 보도해 매체 간 표현 차이가 있으며, 본 계산기는 기본연봉 50% 기준으로 계산합니다.",
  },
  {
    question: "GS칼텍스 평균 연봉은 얼마인가요?",
    answer:
      "2023년 사업보고서 기준 1인당 평균 급여는 약 1억 6,575만원입니다(디지털타임스 2025-03-19 보도). 2024년 기준 '1억 6,500만원' 수치도 돌아다니지만 취업포털 인용이라, 공시를 직접 인용한 보도로는 2023년 수치가 가장 확실합니다. 생산직·사무직·근속이 합산된 평균이라 개인 편차는 큽니다. 자세한 직급별 정보는 'GS칼텍스 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원)이 적용돼 연봉이 이미 상한 이상이면 추가 부과가 없습니다. 본 계산기는 연봉+성과급 합산 세금에서 연봉만 기준 세금을 뺀 marginal 방식으로 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개 언론 보도(SBS Biz 2026-02-22, 디지털타임스 2025-01-21, 파이낸셜뉴스 2024-02-05, 남도일보 2023-01, 뉴스저널리즘) 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. '기본연봉'의 정의(계약연봉 범위)나 입사 시기·휴직 여부에 따라 개인 수령액은 달라질 수 있습니다. 2026년 실적분(2027년 초 지급)은 미확정입니다. 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  { name: "지급 연도 시나리오 선택", text: "최근 4개년 지급 실적(연봉의 25%/12.5%/40%/50%) 중 선택. 직접 입력도 가능." },
  { name: "본인 기본연봉 입력", text: "연 기본연봉을 만원 단위로 입력. 평균 공시 연봉은 1억 6,575만원(2023 사업보고서)." },
  { name: "환산 확인", text: "월 기본급 = 연봉 ÷ 20 자동 환산. 기본급 % = 연봉 % × 20 관계도 함께 표시." },
  { name: "결과 확인", text: "기본연봉 × 지급률 + 상품권(해당 연도) 합산 세전 성과급이 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산." },
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
    "GS칼텍스 성과급",
    "GS칼텍스 성과급 계산기",
    "지에스칼텍스 성과급",
    "GS칼텍스 경영성과급",
    "GS칼텍스 성과급 2026",
    "GS칼텍스 보너스",
    "GS칼텍스 연봉",
    "GS칼텍스 기본급 500%",
    "정유사 성과급",
    "GS칼텍스 인센티브",
  ],
};

export default function GsCaltexBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "GS칼텍스 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "GS칼텍스 성과급 계산하는 방법",
            description: "최근 4개년 지급 실적 시나리오·본인 기본연봉으로 경영성과급 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Fuel className="w-3.5 h-3.5" />
              2026년 초 지급분 반영 · 기본연봉의 25%
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              GS칼텍스 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              본인 기본연봉만 입력하면{" "}
              <strong>기본연봉의 25% (2025 실적분, 기본급 500% 환산)</strong>를
              포함한 최근 4개년 지급 실적 시나리오별 세전·세후 실수령액이 즉시
              계산됩니다. 기본급 % ↔ 연봉 % 환산(×20)도 자동입니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <GsCaltexBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 제도 개요 */}
          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">GS칼텍스 경영성과급 구조</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">⛽ 제도 특징</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 정식 명칭 없는 <strong>연 1회 경영성과급</strong></li>
                  <li>• 통상 <strong>1월 말</strong> 전 직원 일괄 지급</li>
                  <li>• 전년도 <strong>영업이익·정제마진</strong>에 따라 규모 결정</li>
                  <li>• &lsquo;기본연봉의 %&rsquo;와 &lsquo;월 기본급의 %&rsquo; 표현 병용</li>
                  <li>• 호황기 격려금·온누리상품권 부가 지급 사례</li>
                </ul>
              </article>
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📈 최근 4개년 지급 추이</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 2022 실적분 (2023-01): <strong>연봉의 50%</strong></li>
                  <li>• 2023 실적분 (2024-01-31): <strong>연봉의 40%</strong> (기본급 800%)</li>
                  <li>• 2024 실적분 (2025-01-24): <strong>연봉의 12.5%</strong> (기본급 250%) + 상품권 15만원</li>
                  <li>• 2025 실적분 (2026년 초): <strong>연봉의 25%</strong> (기본급 500%)</li>
                  <li>• 2026 실적분 (2027년 초): <strong>미확정</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  SBS Biz·디지털타임스·파이낸셜뉴스·남도일보 보도 기준.
                </p>
              </article>
            </div>
          </section>

          <div className="mt-8">
            <GuideMidAd />
          </div>

          {/* 환산 공식 */}
          <section className="mt-8 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              &lsquo;기본급 800%&rsquo; = &lsquo;연봉 40%&rsquo; — 환산 공식
            </h2>
            <p className="text-sm leading-relaxed text-navy">
              GS칼텍스 성과급 뉴스에는 <strong>&lsquo;기본연봉의 %&rsquo;</strong>와{" "}
              <strong>&lsquo;월 기본급의 %&rsquo;</strong> 두 표현이 섞여 나와
              헷갈리기 쉽습니다. 월 기본급을 연봉의 1/20로 보면{" "}
              <strong className="text-primary">기본급 % = 연봉 % × 20</strong>{" "}
              관계가 성립합니다. 예: 기본급 250% = 연봉 12.5%, 기본급 500% =
              연봉 25%, 기본급 800% = 연봉 40%. 본 계산기는 어떤 표현으로
              보도되든 두 값을 자동 환산해 함께 표시합니다.
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
                <strong className="block mb-1 text-amber-900">⚠️ 추정 시뮬레이터입니다</strong>
                <span className="text-amber-800">
                  공개 언론 보도(SBS Biz 2026-02-22, 디지털타임스 2025-01-21 등)
                  기반 추정 모델이며 회사 공식 자료가 아닙니다. &lsquo;기본연봉&rsquo;
                  정의·입사 시기에 따라 개인 수령액 차이 가능. 2026년 실적분
                  (2027년 초 지급)은 미확정.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/incentive-tax"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">🧾 함께 보기</p>
              <p className="font-black text-lg">성과급 세금 계산기 →</p>
              <p className="text-sm text-faint mt-1">인센티브 실수령액 상세 시뮬레이션</p>
            </Link>
            <Link
              href="/salary-db/gs-caltex"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">GS칼텍스 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 워라밸, 복지 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "square", desktop: "rectangle" }} />
          </div>

          <BonusClusterLinks currentSlug="gs-caltex-bonus" />

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: SBS Biz 2026-02-22 (2025 실적분
                연봉의 25%), 디지털타임스 단독 2025-01-21 (2024 실적분 기본급
                250%+상품권 15만원), 파이낸셜뉴스 2024-02-05 (2023 실적분 연봉의
                40%), 남도일보 2023-01·뉴스저널리즘 (2022 실적분), 디지털타임스
                2025-03-19 (평균연봉 1억 6,575만원 — 2023 사업보고서 기준).
                2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
