// src/app/calc/celltrion-bonus/page.tsx
//
// 셀트리온 경영성과급 계산기.
// 공식 명칭 없는 연 1회 경영성과급 — 기본급 연봉 대비 % 책정, 인사평가 등급별
// 차등(보도 수치는 최고 등급 상한). 지급 시기 연초 1월.
// 지급률 추이: 2023년 실적분 42% → 2024년 실적분 최대 53%(역대 최대) →
// 2025년 실적분 최대 50% 수준 (1월 약 43% 선지급 + 3월 평가 확정 후 잔여).

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
import { FlaskConical, AlertTriangle, Info } from "lucide-react";
import CelltrionBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/celltrion-bonus";
const PAGE_TITLE = "셀트리온 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "셀트리온 경영성과급 계산기. 기본급 연봉만 입력하면 2025년 실적분 최대 50% / 2024년 실적분 최대 53%(역대 최대) / 2023년 실적분 42% 시나리오별 세전·세후 실수령액이 즉시 계산됩니다. 1월 약 43% 선지급 + 3월 평가 확정 후 잔여 지급 구조 반영.";

const FAQ_ITEMS = [
  {
    question: "셀트리온 성과급은 어떻게 계산되나요?",
    answer:
      "셀트리온의 경영성과급은 공식 명칭이 따로 없는 연 1회 성과급으로, 기본급 연봉 대비 %로 책정됩니다. 인사평가 등급에 따라 차등 지급되며, 언론에 보도되는 수치는 최고 등급이 받는 상한입니다. 지급 시기는 실적 확정 직후인 연초 1월입니다. 본 계산기는 기본급 연봉 × 지급률(%)로 세전 성과급을 산출하고, 누진세율 기반으로 세후 실수령액까지 계산합니다.",
  },
  {
    question: "2026년 1월(2025년 실적분) 성과급은 얼마였나요?",
    answer:
      "데일리메디 2026년 2월 2일 보도에 따르면 2025년 실적분 성과급은 최대 50% 수준으로, 2026년 1월에 약 43%를 먼저 지급하고 3월 인사평가 확정 후 잔여분 지급을 검토하는 구조입니다. 직전 해(2024년 실적분)의 최대 53%보다는 소폭 낮지만 2년 연속 50%대의 높은 수준입니다.",
  },
  {
    question: "역대 지급률 추이는 어떻게 되나요?",
    answer:
      "보도 기준으로 2023년 실적분(2024년 초 지급)은 연봉의 42%, 2024년 실적분(2025년 1월 8일 지급)은 최고 등급 기준 연봉의 최대 53%로 역대 최대, 2025년 실적분(2026년 1월 지급)은 최대 50% 수준입니다. 2024년 3분기 누적 매출(2조4,936억원)이 2023년 연간 매출(2조1,764억원)을 넘어선 실적 급성장이 배경입니다.",
  },
  {
    question: "왜 지급률에 '최대'라는 표현이 붙나요?",
    answer:
      "셀트리온 성과급은 인사평가 등급별로 차등 지급되고, 언론에 보도되는 수치는 최고 등급이 받는 상한이기 때문입니다. 본인 평가 등급이 최고 등급이 아니라면 실제 지급률은 보도 수치보다 낮을 수 있습니다. 본 계산기의 '직접 입력' 모드에서 본인 예상 지급률로 조정해 시뮬레이션해 보세요.",
  },
  {
    question: "선지급 + 잔여 지급 구조는 무엇인가요?",
    answer:
      "2025년 실적분부터 1월에 약 43%를 선지급하고, 3월 인사평가가 확정된 뒤 등급에 따라 잔여분을 지급하는 구조가 보도됐습니다(데일리메디 2026-02-02). 즉 1월 입금액이 최종 성과급 전부가 아닐 수 있으며, 평가 결과에 따라 3월 이후 추가 입금이 있을 수 있습니다. 본 계산기는 2025년 실적분 시나리오에서 선지급분과 잔여분을 나눠 보여줍니다.",
  },
  {
    question: "삼성바이오로직스 성과급과 비교하면 어떤가요?",
    answer:
      "같은 바이오 대형사인 삼성바이오로직스는 삼성 계열의 OPI(초과이익성과급) 제도로 연봉의 50%를 지급한 것으로 보도돼 셀트리온과 자주 비교됩니다. 셀트리온의 2024년 실적분 최대 53%는 이를 웃도는 수준이었고, 2025년 실적분 최대 50%는 비슷한 수준입니다. 다만 두 회사 모두 평가 등급·기준 연봉 정의에 따라 개인별 실수령은 달라집니다.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "경영성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험(국민연금·건강·고용)이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상은 추가 부과가 없습니다. 본 계산기는 연봉 기준 세금과 연봉+성과급 합산 세금의 차이를 성과급에 귀속시키는 marginal 방식으로 정확하게 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 언론 보도(파이낸셜뉴스 2025-01-05, 알티케이뉴스 2025-01-08, 데일리메디 2026-02-02) 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 보도 수치는 최고 등급 상한이므로 본인 평가 등급·기본급 연봉 정의에 따라 실제 지급액은 달라질 수 있습니다. 결과는 참고용으로만 사용하시고, 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  { name: "시나리오 선택", text: "2025년 실적분(최대 50%) / 2024년 실적분(최대 53%) / 2023년 실적분(42%) / 직접 입력 중 선택." },
  { name: "본인 기본급 연봉 입력", text: "성과급·수당을 제외한 기본급 연봉을 만원 단위로 입력. 셀트리온 성과급은 기본급 연봉 대비 %로 책정됩니다." },
  { name: "지급률 조정 (선택)", text: "직접 입력 모드에서 본인 평가 등급에 맞는 지급률(%)로 조정 가능. 보도 수치는 최고 등급 상한." },
  { name: "결과 확인", text: "기본급 연봉 × 지급률 산정액이 즉시 표시. 2025년 실적분은 1월 선지급(약 43%)과 잔여분을 구분해 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "셀트리온 성과급",
    "셀트리온 경영성과급",
    "셀트리온 성과급 계산기",
    "셀트리온 인센티브",
    "셀트리온 보너스",
    "셀트리온 성과급 2026",
    "셀트리온 성과급 지급일",
    "셀트리온 연봉",
    "바이오 성과급",
    "제약회사 성과급",
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

export default function CelltrionBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "셀트리온 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "셀트리온 성과급 계산하는 방법",
            description: "실적연도 시나리오·본인 기본급 연봉으로 경영성과급 + 세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <FlaskConical className="w-3.5 h-3.5" />
              2025년 실적분 최대 50% · 2024년 실적분 역대 최대 53%
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              셀트리온 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              기본급 연봉만 입력하면{" "}
              <strong>연봉의 최대 50%(2025년 실적분) · 최대 53%(2024년 실적분) · 42%(2023년 실적분)</strong>{" "}
              시나리오별 세전·세후 실수령액이 즉시 계산됩니다. 1월 약 43% 선지급 +
              3월 평가 확정 후 잔여 지급 구조까지 반영.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <CelltrionBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">셀트리온 경영성과급 구조</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📋 지급 방식</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 공식 명칭 없는 <strong>연 1회 경영성과급</strong></li>
                  <li>• <strong>기본급 연봉 대비 %</strong>로 책정</li>
                  <li>• 인사평가 등급별 차등 (보도 수치는 최고 등급 상한)</li>
                  <li>• 지급 시기: 실적 확정 직후 <strong>연초 1월</strong></li>
                  <li>• 2025년 실적분부터 <strong>1월 약 43% 선지급</strong> + 3월 평가 확정 후 잔여 지급 구조 보도</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">📈 연도별 지급률 추이</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 2023년 실적분: 연봉의 <strong>42%</strong></li>
                  <li>• 2024년 실적분: 최고 등급 <strong>최대 53%</strong> — 역대 최대</li>
                  <li>• 2025년 실적분: <strong>최대 50% 수준</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  2024년 3분기 누적 매출 2조4,936억원으로 2023년 연간 매출(2조1,764억원)을
                  초과한 실적 급성장이 배경. 삼성바이오로직스(OPI, 연봉의 50%)와 비교 보도됨.
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
                  언론 보도 기반 추정 모델이며 회사 공식 자료가 아닙니다. 보도
                  수치는 인사평가 최고 등급 상한이므로 본인 등급·기본급 연봉
                  정의에 따라 실제 지급액은 달라질 수 있습니다.
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
              <p className="text-sm text-faint mt-1">
                OPI + TAI 구조 · 삼성바이오로직스 OPI는 연봉의 50% 보도
              </p>
            </Link>
            <Link
              href="/salary-db/celltrion"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">셀트리온 연봉·복지 DB →</p>
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
                <strong>데이터 출처</strong>: 파이낸셜뉴스(2025-01-05) ·
                알티케이뉴스(2025-01-08) · 데일리메디(2026-02-02) 보도.
                2026 세법(소득세율·4대보험 요율) 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
