// src/app/calc/sk-innovation-bonus/page.tsx
//
// SK이노베이션 성과급 계산기.
// 임단협 기반 PS(초과이익분배금) + LTI(롱텀인센티브) + STI(단기성과급) 복합 구조.
// FY2024 실적분(2025년 지급): 총 660% = PS 280 + LTI 70 + STI 190(7월) + 하반기 120
//   (디지털타임스 단독·EBN 2025-02-06, SBS Biz).
// 2022년부터 계열 자회사 간 차등 지급 — FY2024 기준 SK엔무브 800% / SK어스온 400% /
//   SK온 0% (EBN 2025-02-06). FY2023도 0~800% 차등, 울산CLX PS 612%
//   (뉴스핌 2024-02-16·이데일리 단독).
// FY2025 실적분(2026년 초 지급)은 보도 미확보 — 미확정 명시. 2027년 초 갱신 체크포인트.

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
import { Factory, AlertTriangle, Info } from "lucide-react";
import SkInnovationBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/sk-innovation-bonus";
const PAGE_TITLE = "SK이노베이션 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "SK이노베이션 성과급 계산기. 본인 월 기본급만 입력하면 FY2024 실적분 총 660%(PS 280% + LTI 70% + STI 190% + 하반기 120%) 세전·세후 실수령액이 즉시 계산됩니다. SK엔무브 800%·SK어스온 400%·SK온 0% 계열사 차등 시나리오 비교. FY2025 실적분(2026년)은 미확정.";

const FAQ_ITEMS = [
  {
    question: "SK이노베이션 성과급은 어떤 구조인가요?",
    answer:
      "임단협(노사 합의) 기반으로 월 기본급의 % 형태로 지급되며, 구성이 복합적입니다. PS(초과이익분배금, 회사 실적 연동) + LTI(롱텀인센티브) + STI(단기성과급, 통상 7월 지급) + 하반기 추가분으로 나뉩니다. FY2024 실적분(2025년 지급)은 PS 280% + LTI 70% + STI 190% + 하반기 120% = 총 660%였습니다 (디지털타임스 단독·EBN, 2025-02-06 보도).",
  },
  {
    question: "2025년에 지급된 성과급은 정확히 얼마였나요?",
    answer:
      "FY2024 실적 기준으로 SK이노베이션은 월 기본급의 총 660%를 지급했습니다. 구성은 PS 280% + LTI 70% + STI 190%(7월) + 하반기 추가 120%이며, 같은 합의에서 임금인상률은 기본급의 2.3%였습니다 (디지털타임스 단독 2025-02-06, EBN 2025-02-06, SBS Biz 보도).",
  },
  {
    question: "계열사마다 성과급이 왜 다른가요?",
    answer:
      "SK이노베이션은 2022년부터 계열 자회사 간 차등 지급 제도를 도입했습니다 (이전엔 계열 일괄 지급). 자회사·실적별로 기본급의 0~800%까지 차이가 납니다. FY2024 실적 기준으로 SK엔무브 800%, SK어스온 400%, SK온 0%였고 (EBN 2025-02-06), FY2023 실적 기준에도 0~800% 차등 — 울산CLX PS 612%, SK엔무브 800%, SK온 0% — 이 있었습니다 (뉴스핌 2024-02-16, 이데일리 단독 2024-02).",
  },
  {
    question: "SK온은 왜 성과급이 0%였나요?",
    answer:
      "배터리 계열사 SK온은 2024년 1조 1,270억원의 영업적자를 기록해 FY2024 실적분 성과급이 0%였습니다 (EBN 2025-02-06 보도). FY2023 실적분에서도 마찬가지로 0%였습니다. 실적 연동 차등 지급 구조라 적자 자회사는 지급이 없을 수 있습니다.",
  },
  {
    question: "울산CLX(정유 부문) PS는 어떻게 변해왔나요?",
    answer:
      "울산CLX의 PS는 2023년 지급분 800% → 2024년 지급분 612% → 2025년 지급분 280%로 3년 연속 감소했습니다 (디지털타임스 2025-02-06 보도). 정유 업황(정제마진)에 따라 PS 변동이 큰 것이 특징입니다. 단 2025년 지급분은 PS 외에 LTI·STI·하반기 추가분을 합쳐 총 660%였으므로 총액 기준으로는 단순 비교에 주의가 필요합니다.",
  },
  {
    question: "FY2025 실적분(2026년 지급) 성과급은 얼마인가요?",
    answer:
      "미확정입니다. FY2025 실적 기준 지급률 보도는 아직 확인되지 않았습니다. 참고로 2026년 2분기 영업이익 3조 4,873억원 흑자전환 보도(CBC뉴스, 2026-07)가 있어 차기 지급에 대한 기대가 있으나, 확정 지급률이 발표되면 본 페이지에 즉시 반영하겠습니다. 그 전에는 계산기의 '직접 입력' 모드로 예상 시나리오를 시뮬레이션해 보세요.",
  },
  {
    question: "성과급 계산 기준인 '기본급'은 무엇인가요?",
    answer:
      "성과급 지급률(660%, 800% 등)은 상여·수당을 제외한 월 기본급 대비 비율입니다. 예를 들어 월 기본급 400만원인 직원이 660%를 받으면 세전 2,640만원입니다. 본인 정확한 기본급은 사내 급여 명세서에서 확인하세요. 본 계산기는 월 기본급 × 지급률(%)로 세전 성과급을 산출합니다.",
  },
  {
    question: "SK이노베이션 평균 연봉은 얼마인가요?",
    answer:
      "FY2025 사업보고서(DART, 2026-03-16 제출) 기준 평균연봉 1억 4,600만원, 평균 근속 10.9년, 직원 2,064명입니다. 단 이는 지주회사 기준(SK E&S CIC 합병 반영)으로, 2024년 1억 6,800만원 대비 하락했습니다. 울산CLX 현장 인력 다수는 자회사 SK에너지 소속이므로 법인 구분에 유의하세요. 자세한 내용은 'SK이노베이션 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상은 추가 부과가 없습니다. 본 계산기는 연봉+성과급 합산 세금에서 연봉만 기준 세금을 뺀 marginal 방식으로 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개 언론 보도(디지털타임스·EBN·SBS Biz 2025-02, 뉴스핌·이데일리 2024-02)와 사업보고서 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 지급은 소속 법인·직군·근속·평가에 따라 차이가 날 수 있고, FY2025 실적분(2026년)은 미확정입니다. 결과는 참고용으로만 사용하시고 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "시나리오 선택",
    text: "FY2024 실적분 SK이노베이션 660% / SK엔무브 800% / SK어스온 400% / SK온 0% / FY2023 울산CLX PS 612% 또는 직접 입력 중 선택.",
  },
  { name: "본인 월 기본급 입력", text: "상여·수당 제외한 월 기본급을 만원 단위로 입력. 보통 300~700만원 범위." },
  { name: "본인 연봉 입력", text: "세후 계산용 연 기본 연봉 입력. 누진세율 구간 판단에 사용됩니다." },
  { name: "결과 확인", text: "월 기본급 × 지급률(%) 세전 성과급이 PS·LTI·STI 구성별로 즉시 표시." },
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
    "SK이노베이션 성과급",
    "SK이노베이션 PS",
    "SK이노베이션 성과급 계산기",
    "SK이노베이션 660%",
    "SK엔무브 성과급",
    "SK온 성과급",
    "SK어스온 성과급",
    "울산CLX 성과급",
    "SK에너지 성과급",
    "SK이노베이션 LTI",
    "SK이노베이션 STI",
    "SK이노베이션 성과급 2026",
  ],
};

export default function SkInnovationBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "SK이노베이션 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "SK이노베이션 성과급 계산하는 방법",
            description:
              "지급 실적 시나리오·본인 월 기본급으로 PS+LTI+STI 합산 세전 성과급 + 세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Factory className="w-3.5 h-3.5" />
              FY2024 총 660% 지급 · 계열사 차등 0~800%
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              SK이노베이션 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              본인 월 기본급만 입력하면{" "}
              <strong>PS 280% + LTI 70% + STI 190% + 하반기 120% = 총 660%</strong>{" "}
              (FY2024 실적분) 세전·세후 실수령액이 즉시 계산됩니다. SK엔무브
              800%·SK어스온 400%·SK온 0% 계열사 차등 시나리오 비교 제공.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          {/* Calculator */}
          <SkInnovationBonusClient />

          {/* 결과 직후 광고 */}
          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 제도 구조 */}
          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="policy-heading"
          >
            <h2 id="policy-heading" className="text-2xl font-black mb-4">
              SK이노베이션 성과급 구조 — PS · LTI · STI
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📋 FY2024 실적분 (2025년 실제 지급)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• PS 초과이익분배금 <strong>280%</strong> (실적 연동)</li>
                  <li>• LTI 롱텀인센티브 <strong>70%</strong></li>
                  <li>• STI 단기성과급 <strong>190%</strong> (7월 지급)</li>
                  <li>• 하반기 추가분 <strong>120%</strong></li>
                  <li>• 임금인상률 기본급의 <strong>2.3%</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  합산: <strong>월 기본급의 총 660%</strong> (디지털타임스 단독·EBN,
                  2025-02-06)
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">🏭 계열사 차등 지급 (2022년~ 도입)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• FY2024: SK엔무브 <strong>800%</strong> / SK어스온 <strong>400%</strong> / SK온 <strong>0%</strong> (1조 1,270억 적자)</li>
                  <li>• FY2023: 계열사별 <strong>0~800%</strong> — 울산CLX PS 612% / SK엔무브 800% / SK온 0%</li>
                  <li>• 울산CLX PS 추이: <strong>800% → 612% → 280%</strong> (3년 연속 감소)</li>
                  <li>• 정유 부문은 업황(정제마진)에 따라 PS 변동 큼</li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  출처: EBN 2025-02-06, 뉴스핌 2024-02-16, 이데일리 단독 2024-02,
                  디지털타임스 2025-02-06
                </p>
              </article>
            </div>
          </section>

          {/* 본문 중간 광고 */}
          <div className="mt-8">
            <GuideMidAd />
          </div>

          {/* FY2025 미확정 안내 */}
          <section
            className="mt-8 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="fy2025-heading"
          >
            <h2
              id="fy2025-heading"
              className="text-xl sm:text-2xl font-black mb-3 flex items-center gap-2"
            >
              <Info className="w-5 h-5 text-primary" />
              FY2025 실적분(2026년 지급)은 아직 미확정입니다
            </h2>
            <p className="text-sm leading-relaxed text-navy">
              FY2025 실적 기준 성과급 지급률은 <strong>보도가 확인되지 않았습니다</strong>.
              통상 SK이노베이션 성과급은 연초(2월 전후) 임단협 합의로 확정·보도됩니다.
              참고로 2026년 2분기 영업이익 3조 4,873억원 <strong>흑자전환</strong> 보도(CBC뉴스,
              2026-07)가 있어 차기 지급에 대한 관심이 높습니다.
            </p>
            <p className="text-sm leading-relaxed text-navy mt-3">
              확정 지급률이 발표되면 즉시 이 페이지에 반영하겠습니다. 그 전에는 위
              계산기의 <strong className="text-primary">직접 입력(0~800%) 모드</strong>로 예상
              시나리오를 시뮬레이션해 보세요.
            </p>
          </section>

          <div className="mt-10">
            <InArticleAd />
          </div>

          {/* FAQ */}
          <section className="mt-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black mb-6">
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
                <strong className="block mb-1 text-amber-900">⚠️ 추정 시뮬레이터입니다</strong>
                <span className="text-amber-800">
                  본 계산기는 공개 언론 보도(디지털타임스·EBN·SBS Biz 2025-02,
                  뉴스핌·이데일리 2024-02)와 사업보고서 기반 추정 모델이며 회사 공식
                  자료가 아닙니다. 실제 지급은 소속 법인(SK에너지·SK엔무브·SK온 등)·
                  직군·근속·평가에 따라 차이가 날 수 있으며, FY2025 실적분(2026년)은
                  미확정입니다.
                </span>
              </span>
            </p>
          </aside>

          {/* 관련 회사 계산기 */}
          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/sk-hynix-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">SK하이닉스 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">
                PS(영업이익 10% 풀) + PI(반기 150% × 2회)
              </p>
            </Link>
            <Link
              href="/salary-db/sk-innovation"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">SK이노베이션 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">
                평균 연봉 1억 4,600만원(FY2025 공시), 복지 전체
              </p>
            </Link>
          </section>

          {/* 쿠팡 + 관련 계산기 */}
          <div className="mt-10">
            <CoupangBanner
              responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
            />
          </div>

          <BonusClusterLinks currentSlug="sk-innovation-bonus" />

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
                <strong>데이터 출처</strong>: FY2024 실적분 총 660%·구성 내역(PS
                280%+LTI 70%+STI 190%+하반기 120%)·울산CLX PS 3년 추이 — 디지털타임스
                단독(2025-02-06)·EBN(2025-02-06)·SBS Biz(2025-02). 계열사 차등(SK엔무브
                800%·SK어스온 400%·SK온 0%) — EBN(2025-02-06). FY2023 계열 차등
                0~800%·울산CLX PS 612% — 뉴스핌(2024-02-16)·이데일리 단독(2024-02).
                2026년 2분기 흑자전환 — CBC뉴스(2026-07). 평균연봉 — DART FY2025
                사업보고서(2026-03-16 제출). 2026년 세법(소득세율·4대보험 요율) 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
