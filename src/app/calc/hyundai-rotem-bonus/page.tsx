// src/app/calc/hyundai-rotem-bonus/page.tsx
//
// 현대로템 임단협 경영성과금 계산기.
// "월 기본급 × N% + 정액금" 구조, 연 1회, 임단협 타결(통상 연말) 후 지급.
// 2025 임단협(2025-12-24 가결, 찬성률 59.38%): 기본급 450% + 1,620만 + 온누리상품권 20만
//   — 조합원 평균 3,380만원. 2024년: 500% + 1,800만, 평균 3,508만원.
// 2025년 영업이익 1조56억(2023년 2,100억의 약 5배) 역대급 실적 대비 성과급 축소로
// 2026년 노사 성과배분 갈등 진행 중 보도(뉴스웨이) — 시즌 aside에서 "확정 아님" 명시.

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
import { InArticleAd, CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { TrainFront, AlertTriangle, Info } from "lucide-react";
import HyundaiRotemBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/hyundai-rotem-bonus";
const PAGE_TITLE = "현대로템 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "현대로템 임단협 성과급 계산기. 월 기본급만 입력하면 2025년 타결안(기본급 450% + 정액 1,620만원 + 온누리상품권 20만원, 조합원 평균 3,380만원)과 2024년(500% + 1,800만원) 시나리오별 세전·세후 실수령액이 즉시 계산됩니다. 2026년 성과배분 논의 현황까지 정리.";

const FAQ_ITEMS = [
  {
    question: "현대로템 성과급은 어떻게 계산되나요?",
    answer:
      "현대로템 경영성과금은 매년 임금·단체협약(임단협) 결과로 결정되는 '월 기본급 × N% + 정액금' 구조입니다. 연 1회, 임단협 타결(통상 연말) 후 지급됩니다. 2025년 타결안은 기본급 450% + 정액 1,620만원 + 온누리상품권 20만원이며, 본 계산기는 본인 월 기본급을 입력하면 정률·정액을 합산해 세전·세후 실수령액을 산출합니다.",
  },
  {
    question: "2025년 임단협 성과급은 얼마인가요?",
    answer:
      "2025년 12월 24일 가결(찬성률 59.38%)된 타결안 기준 기본급 450% + 정액 1,620만원 + 온누리상품권 20만원으로, 조합원 평균 약 3,380만원 수준으로 보도됐습니다(데일리안·아시아경제 2025-12-24). 개인별 실제 수령액은 본인 월 기본급 수준에 따라 달라집니다.",
  },
  {
    question: "2024년보다 성과급이 줄어든 이유는 무엇인가요?",
    answer:
      "2024년 임단협은 기본급 500% + 정액 1,800만원(평균 3,508만원)이었는데, 2025년은 450% + 1,620만원(평균 3,380만원)으로 축소됐습니다. 현대차그룹 계열사는 관행상 그룹 맏형인 현대차 성과급(450%)을 넘기지 않는 경향이 있다는 보도(디지털타임스 2025-12-02)가 배경으로 꼽힙니다.",
  },
  {
    question: "역대급 실적인데 왜 노사 갈등이 있나요?",
    answer:
      "현대로템의 2025년 영업이익은 1조56억원으로 2023년(약 2,100억원)의 약 5배에 달하는 역대급 실적이었습니다. 그런데 성과급은 오히려 전년 대비 축소되면서 내부 불만이 나왔고, 2026년 7월 보도 기준 노사 간 성과배분 갈등이 진행 중인 것으로 알려졌습니다(뉴스웨이). 추가 성과배분 여부는 아직 확정된 것이 없습니다.",
  },
  {
    question: "성과급 지급 시기는 언제인가요?",
    answer:
      "현대로템 경영성과금은 연 1회, 임단협 타결 이후 지급됩니다. 임단협은 통상 연말에 타결되며, 2025년 임단협도 12월 24일 조합원 찬반투표 가결로 확정됐습니다. 따라서 성과급 입금은 통상 연말~연초에 이뤄집니다.",
  },
  {
    question: "평균 3,380만원은 어떻게 나온 숫자인가요?",
    answer:
      "언론 보도 기준 2025년 타결안의 조합원 평균 수령액입니다. '기본급 450% + 1,620만원' 산식으로 역산하면 월 기본급 약 390만원 수준에 해당합니다. 본인 월 기본급이 평균보다 높으면 정률 부분(450%)이 커져 평균보다 많이 받게 됩니다.",
  },
  {
    question: "현대차·기아 성과급과 비교하면 어떤가요?",
    answer:
      "2025년 기준 현대차는 성과금 450% + 정액 1,580만원 + 무상주 30주, 기아는 450% + 1,600만원 + 무상주 53주였습니다. 현대로템은 450% + 1,620만원으로 정액 부분은 그룹 완성차 2사보다 오히려 많지만 무상주가 없다는 차이가 있습니다. 정률 450%는 그룹 관행에 맞춰진 수치입니다.",
  },
  {
    question: "성과금 세금은 어떻게 계산되나요?",
    answer:
      "경영성과금·정액금·상품권 모두 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상은 추가 부과가 없습니다. 본 계산기는 연봉 기준 세금과 연봉+성과급 합산 세금의 차이를 성과급에 귀속시키는 marginal 방식으로 정확하게 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 2025년 임단협 타결 보도(데일리안·아시아경제 2025-12-24)와 디지털타임스(2025-12-02)·뉴스웨이(2026-07) 보도 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 지급은 본인 직군·근속·기본급 정의에 따라 차이가 날 수 있고, 2026년 추가 성과배분은 미확정입니다. 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  { name: "시나리오 선택", text: "2025년 타결안(450% + 1,620만) / 2024년(500% + 1,800만) / 직접 입력 중 선택." },
  { name: "본인 월 기본급 입력", text: "월 기본급을 만원 단위로 입력. 보도 평균 3,380만원 역산 시 월 기본급 약 390만원 수준." },
  { name: "연봉 추정 확인", text: "세율 추정용 연봉은 기본급 × 18로 자동 산출되며, 세금 가정에서 직접 입력으로 바꿀 수 있습니다." },
  { name: "결과 확인", text: "% × 기본급 + 정액 + 상품권 합산이 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "현대로템 성과급",
    "현대로템 성과금",
    "현대로템 임단협",
    "현대로템 성과급 계산기",
    "현대로템 경영성과금",
    "현대로템 성과급 2026",
    "현대로템 보너스",
    "현대로템 임단협 타결",
    "현대로템 연봉",
    "방산 성과급",
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

export default function HyundaiRotemBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "현대로템 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "현대로템 성과급 계산하는 방법",
            description: "임단협 시나리오·본인 월 기본급으로 정률+정액 성과금 합산 + 세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <TrainFront className="w-3.5 h-3.5" />
              2025 임단협 가결 반영 · 2026 성과배분 논의 진행 중
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              현대로템 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              임단협 타결안 기준 본인 월 기본급만 입력하면{" "}
              <strong>기본급 450% + 정액 1,620만원 + 온누리상품권 20만원</strong>{" "}
              합산 세전·세후 실수령액이 즉시 계산됩니다. 2024년(500% + 1,800만원)
              시나리오 비교 제공.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          {/* 시즌 노티스 — 2026 성과배분 갈등 진행 중 (확정 시 이 블록을 확정값으로 교체) */}
          <aside
            className="mb-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6"
            aria-label="2026 성과배분 논의 진행 안내"
          >
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">
              ⏰ 2026 성과배분 논의 진행 중 — 아직 확정 아님
            </p>
            <p className="text-sm leading-relaxed text-navy">
              현대로템의 2025년 영업이익은 <strong>1조56억원</strong>으로
              2023년(약 2,100억원)의 <strong>약 5배</strong>에 달하는 역대급
              실적이었습니다. 그런데 성과급은 전년 대비 오히려 축소(500% +
              1,800만 → 450% + 1,620만)되면서 내부 불만이 있었고, 2026년 7월
              보도 기준 <strong>노사 간 성과배분 갈등이 진행 중</strong>인
              것으로 알려졌습니다(뉴스웨이).
            </p>
            <p className="text-xs text-faint mt-2 leading-relaxed">
              강조하면, 추가 성과배분·2026년 임단협 결과는{" "}
              <strong>아직 확정된 것이 없습니다</strong>. 본 계산기는 2025년
              12월 24일 가결된 타결안 기준으로 계산하며, 새 합의가 확정 발표되면
              즉시 이 페이지에 반영하겠습니다.
            </p>
          </aside>

          <HyundaiRotemBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">현대로템 임단협 성과급 구조</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📋 2025년 임단협 타결안 (실제 지급)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 경영성과금 <strong>기본급 450% + 1,620만원</strong></li>
                  <li>• 온누리상품권 <strong>20만원</strong></li>
                  <li>• 조합원 평균 <strong>약 3,380만원</strong></li>
                  <li>• 2025-12-24 찬반투표 가결 (찬성률 <strong>59.38%</strong>)</li>
                  <li>• 연 1회, 임단협 타결 후 지급</li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  출처: 데일리안·아시아경제 2025-12-24 보도.
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">📉 전년 대비 축소 배경</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 2024년 임단협: <strong>500% + 1,800만원</strong> (평균 3,508만원)</li>
                  <li>• 2025년 영업이익 <strong>1조56억원</strong> — 2023년의 약 5배</li>
                  <li>• 그룹 관행상 <strong>현대차 성과급(450%)을 넘기지 않는 경향</strong> 보도 (디지털타임스 2025-12-02)</li>
                  <li>• 실적 대비 축소로 내부 불만 → 2026년 성과배분 갈등 진행 중 (뉴스웨이)</li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  추가 성과배분은 미확정. 확정 시 본 페이지에 반영 예정.
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

          <div className="mt-10">
            <GuideMidAd />
          </div>

          <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="block mb-1 text-amber-900">⚠️ 추정 시뮬레이터입니다</strong>
                <span className="text-amber-800">
                  2025년 임단협 타결 보도 기반 추정 모델이며 회사 공식 자료가
                  아닙니다. 실제 지급은 직군·근속·기본급 정의에 따라 차이가 날 수
                  있고, 2026년 추가 성과배분은 미확정입니다.
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
              href="/salary-db/hyundai-rotem"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">현대로템 연봉·복지 DB →</p>
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
                <strong>데이터 출처</strong>: 2025년 현대로템 임단협 가결 보도
                (데일리안·아시아경제 2025-12-24), 디지털타임스(2025-12-02),
                뉴스웨이(2026-07 성과배분 갈등 보도). 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
