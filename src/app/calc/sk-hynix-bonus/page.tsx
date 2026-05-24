// src/app/calc/sk-hynix-bonus/page.tsx
//
// SK하이닉스 PS·PI 성과급 계산기.
// PS(Profit Sharing): 영업이익의 10% 재원, 연 1회 지급. 2025-09 노사합의로
//   기본급 1,000% 상한 폐지(상한 없는 새 제도).
// PI(생산성 격려금): 반기별 영업이익률 기반, 기본급의 최대 150% × 2회.
// 80% 당해 지급, 20% 2년 이연 (10%/년).
// 기본급 = 통상 연봉 / 20.

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
import { Sparkles, Coins, AlertTriangle, Info } from "lucide-react";
import SkHynixBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/sk-hynix-bonus";
const PAGE_TITLE = "SK하이닉스 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "SK하이닉스 PS·PI 성과급 계산기. 영업이익(조원)·본인 연봉만 입력하면 PS(영업이익 10% 풀) + PI(반기 기본급 150% × 2회) 합산 세전·세후 실수령액이 즉시 계산됩니다. 2025-09 노사합의(기본급 1,000% 상한 폐지) 반영. 2025년 PS+PI 3,264% 지급 사례 포함.";

const FAQ_ITEMS = [
  {
    question: "SK하이닉스 PS는 어떻게 계산되나요?",
    answer:
      "PS(Profit Sharing, 초과이익분배금)는 회사 연간 영업이익의 10%를 전 직원에게 분배하는 제도입니다. 2025년 9월 노사 합의로 기존 '기본급 1,000% 상한'이 폐지되어, 영업이익이 클수록 1인당 지급액이 비례 증가합니다. 본 계산기는 영업이익(조원) ÷ 직원 수(약 35,000명) × 10% 로 1인당 평균을 추정하고, 본인 연봉 비례 보정으로 개인 PS를 산출합니다. 80%는 당해 지급되고 20%는 2년에 걸쳐 이연됩니다.",
  },
  {
    question: "SK하이닉스 PI는 PS와 어떻게 다른가요?",
    answer:
      "PI(Productivity Incentive, 생산성 격려금)는 반기별로 사업부 생산성·영업이익률을 평가해 지급하는 격려금으로, 기본급의 최대 150%까지 받을 수 있습니다. 연 2회(상반기·하반기) 지급되므로 연간 최대 300%까지 가능합니다. PS는 회사 전체 이익 기반·연 1회인 반면, PI는 사업부 효율 기반·반기마다 지급되는 차이가 있습니다. 본 계산기는 시나리오별 PI 지급률(0%~150%×2)을 선택해 합산할 수 있습니다.",
  },
  {
    question: "2025년 실제 SK하이닉스 PS+PI는 얼마였나요?",
    answer:
      "2025년 보도에 따르면 SK하이닉스는 PS와 PI를 합쳐 총 3,264%를 지급했으며, 연봉 1억원 직원 기준 약 1억 4,820만원을 받은 것으로 알려졌습니다. HBM(고대역폭메모리) 호황으로 2024년 영업이익이 23.4조원에 달해 PS 풀이 폭증한 결과입니다. 본 계산기 호황(30조) 시나리오가 이 결과에 근접합니다.",
  },
  {
    question: "기본급(통상임금)은 어떻게 정의되나요?",
    answer:
      "SK하이닉스에서 PI 계산의 기준이 되는 '기본급'은 통상 연봉의 1/20로 산정됩니다. 예를 들어 연봉 1억원이면 기본급은 500만원, PI 150% 한 번 지급 시 750만원이 됩니다. 본 계산기는 본인이 입력한 연봉 ÷ 20 으로 기본급을 자동 산출합니다.",
  },
  {
    question: "이연 지급(80/20)은 왜 있는 건가요?",
    answer:
      "SK하이닉스 PS는 개인별 산정액의 80%를 당해 일시 지급하고, 나머지 20%를 매년 10%씩 2년에 걸쳐 분할 지급합니다. 우수 인재 장기 보유(리텐션)와 회사 실적 변동성에 대비한 완충 장치 역할입니다. 따라서 같은 해 산정된 PS라도 실제 통장 입금은 3년에 걸쳐 들어옵니다. 본 계산기는 '산정 총액'을 보여주며, '당해 지급분'은 80%로 별도 표시합니다.",
  },
  {
    question: "세금은 어떻게 떼나요?",
    answer:
      "성과급은 별도 분리과세가 아닌 연간 근로소득에 합산되어 누진세율(6~45%)이 적용됩니다. 여기에 지방소득세(소득세의 10%)와 4대보험(국민연금·건강·고용)이 추가로 부과됩니다. 단 국민연금은 보수월액 상한(2026년 기준 연 7,404만원) 이상은 추가 부과 없음. 본 계산기는 연봉+성과급 합산 세금에서 연봉만 기준 세금을 뺀 marginal 방식으로 정확하게 계산합니다.",
  },
  {
    question: "삼성전자 성과급과 비교하면?",
    answer:
      "삼성전자는 OPI(영업이익 10.5% 풀을 부문·사업부로 분배) + TAI(월 기본급 100% × 연 2회) 구조이고, SK하이닉스는 PS(영업이익 10% 전사 균등) + PI(반기 기본급 150% × 2회) 구조입니다. SK하이닉스는 사업부 구분 없이 균등 분배되는 게 큰 차이입니다. 2024년 영업이익 기준 삼성 32.7조 / SK 23.4조였으나, SK가 직원 수가 적어(35,000명 vs 12만) 1인당 PS는 SK가 더 컸습니다. 자세한 삼성 계산은 '삼성전자 성과급 시뮬레이터' 페이지를 참고하세요.",
  },
  {
    question: "성과급 받고 절세할 방법은?",
    answer:
      "(1) IRP·연금저축 연 900만원 한도(세액공제 13.2~16.5%), (2) 우리사주조합 출연 연 400만원 비과세, (3) 의료비·교육비·기부금 세액공제 극대화, (4) 고향사랑기부 10만원까지 100% 세액공제. PS 입금 직후 IRP 한도를 우선 채우는 게 효과 가장 큽니다. SK하이닉스는 자사주 매입 비중도 높아 우리사주 활용 시 절세+자산 동시 효과.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개 노사 합의 보도(2025-09)·언론 보도·사업보고서 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 PS는 본인 평가 등급·근속·직급, PI는 사업부별 영업이익률에 따라 ±15~25% 차이가 날 수 있습니다. 결과는 의사결정 참고용으로만 사용하시고, 정확한 본인 케이스는 사내 시스템 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  { name: "영업이익 시나리오 선택", text: "보수(8조) / 평년(17조) / 호황(30조) 중 선택. 직접 입력도 가능. 2024년 실적은 23.4조였습니다." },
  { name: "본인 연봉 입력", text: "본인 연 기본 연봉을 만원 단위로 입력. 기본급(연봉/20)은 자동 계산됩니다." },
  { name: "PI 시나리오 선택", text: "반기 PI 비율을 0%/75%/100%/150% 중 선택. 연 2회 누적 계산됩니다." },
  { name: "결과 확인", text: "PS(영업이익 10% 풀 ÷ 인원 × 본인 연봉/평균) + PI(기본급 × PI% × 2회) 합산이 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산. 80% 당해 지급분도 별도 표시." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "SK하이닉스 성과급",
    "SK하이닉스 PS",
    "SK하이닉스 PI",
    "SK하이닉스 성과급 계산기",
    "하이닉스 성과급 2026",
    "하이닉스 PS 계산",
    "하이닉스 PI 계산",
    "반도체 성과급",
    "HBM 성과급",
    "SK하이닉스 영업이익 성과급",
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

export default function SkHynixBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "SK하이닉스 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "SK하이닉스 PS·PI 성과급 계산하는 방법",
            description: "영업이익·본인 연봉·PI 시나리오로 PS+PI 합산 + 세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              2025-09 노사합의 반영 · 1,000% 상한 폐지
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              SK하이닉스 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              PS(영업이익 10% 풀) + PI(반기 기본급 150% × 2회) 합산 시뮬레이터.
              영업이익 시나리오와 본인 연봉만 입력하면 세전·세후 실수령액이
              즉시 계산됩니다. 2025년 PS+PI 3,264% 지급 사례 포함.
            </p>
            <div className="mt-5">
              <ShareButtons
                title={PAGE_TITLE_FULL}
                description={PAGE_DESC}
              />
            </div>
          </header>

          {/* Calculator */}
          <SkHynixBonusClient />

          {/* 결과 직후 광고 */}
          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 정책 개요 */}
          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8" aria-labelledby="policy-heading">
            <h2 id="policy-heading" className="text-2xl font-black mb-4 flex items-center gap-2">
              <Coins className="w-6 h-6 text-primary" />
              SK하이닉스 성과급 구조 — PS · PI
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">PS (Profit Sharing)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 회사 연간 <strong>영업이익의 10%</strong> 재원</li>
                  <li>• 전 직원 균등 분배 (사업부 구분 없음)</li>
                  <li>• 연 1회 지급 (보통 1~2월)</li>
                  <li>• <strong>2025-09 합의로 기본급 1,000% 상한 폐지</strong></li>
                  <li>• 80% 당해 + 20% 2년 이연 (10%/년)</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">PI (Productivity Incentive)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 반기 사업부 <strong>영업이익률</strong> 연동</li>
                  <li>• 기본급의 <strong>최대 150%</strong> × 2회</li>
                  <li>• 연 2회 지급 (보통 7월·1월)</li>
                  <li>• 사업부별 차등 가능</li>
                  <li>• 기본급 = 통상 연봉의 1/20</li>
                </ul>
              </article>
            </div>
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
                  본 계산기는 공개 보도(2025-09 노사 합의, 언론 보도, 사업보고서)
                  기반 추정 모델이며 회사 공식 자료가 아닙니다. 실제 지급은 본인
                  평가·근속·사업부 등에 따라 ±15~25% 차이가 발생할 수 있습니다.
                </span>
              </span>
            </p>
          </aside>

          {/* 관련 회사 계산기 */}
          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/samsung-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">삼성전자 성과급 시뮬레이터 →</p>
              <p className="text-sm text-faint mt-1">
                영업이익 → 부문·사업부 분배 / OPI + TAI
              </p>
            </Link>
            <Link
              href="/salary-db/sk-hynix"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">SK하이닉스 연봉·복지 DB →</p>
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
                <strong>데이터 출처</strong>: 2025-09 SK하이닉스 노사 PS 제도
                개편 합의 보도, 2025-2026 언론 보도(ZDNet·M투데이·위키트리),
                SK하이닉스 사업보고서. 2026년 세법(소득세율·4대보험 요율) 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
