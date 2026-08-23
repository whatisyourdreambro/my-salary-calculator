// src/app/calc/sk-hynix-bonus/page.tsx
//
// SK하이닉스 PS·PI 성과급 계산기.
// PS(Profit Sharing): 영업이익의 10% 재원, 연 1회 지급. 2025-09 노사합의로
//   기본급 1,000% 상한 폐지.
// PI(생산성 격려금): 반기별 영업이익률 기반, 기본급의 최대 150% × 2회.
// 기본급 = 통상 연봉 / 20.
//
// 2026-08-23 전면 개편: 2026-08-20 임단협 잠정합의(당해 현금 40% + 자사주 60%,
// 기준가 3시점 최저가, 지급 첫날 하방 보전, 주식 100% 선택권) 반영.
// 수치·합의 조항은 ./psData.ts 단일 소스 — 총투표 결과는 psData 의
// AGREEMENT_2026.status 만 바꾸면 배너·FAQ 문구가 일괄 전환된다.

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
import { Sparkles, Coins, Info, ShieldCheck } from "lucide-react";
import SkHynixBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";
import {
  AGREEMENT_2026,
  EMPLOYEES,
  LAST_UPDATED,
  PS_HISTORY,
  SOURCES,
} from "./psData";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/sk-hynix-bonus";
const PAGE_TITLE = "SK하이닉스 성과급 계산기 2026 — PS 현금·자사주";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "SK하이닉스 PS·PI 성과급 계산기. 2026 임단협 잠정합의(현금 40%+자사주 60%) 반영 — 영업이익·연봉만 입력하면 주식 지급분·하방 보전·세후 실수령까지 무료 시뮬레이션. 2026 상반기 PI 150% 확정.";

// 잠정합의 상태별 문구 (psData.AGREEMENT_2026.status 로 일괄 분기)
const STATUS = AGREEMENT_2026.status;
const STATUS_BADGE =
  STATUS === "ratified"
    ? "🔔 2026 임단협 최종 타결 · 현금 40% + 자사주 60%"
    : STATUS === "rejected"
      ? "🔔 2026 임단협 잠정합의 부결 — 재협상 중"
      : "🔔 2026-08-20 임단협 잠정합의 · 현금 40% + 자사주 60%";
const STATUS_SENTENCE =
  STATUS === "ratified"
    ? "조합원 총투표를 통과해 최종 타결됐습니다."
    : STATUS === "rejected"
      ? "조합원 총투표에서 부결되어 재협상 중입니다 — 아래 내용은 부결된 잠정합의안 기준이며, 새 합의가 나오면 즉시 갱신합니다."
      : `아직 최종 확정이 아닙니다 — ${AGREEMENT_2026.voteNote}이며, 투표 결과에 따라 내용이 바뀔 수 있습니다.`;

const FAQ_ITEMS = [
  {
    question: "SK하이닉스 성과급을 주식으로 준다는 게 확정인가요?",
    answer:
      `2026년 8월 20일 노사가 잠정합의했습니다(복수 언론 보도). PS 재원(연간 영업이익의 10%)은 유지하되 지급 방식을 '당해 현금 40% + 자사주 60%'로 바꾸는 내용입니다. ${STATUS_SENTENCE} 적용은 ${AGREEMENT_2026.appliesFrom}입니다. 본 계산기는 신·구 체계를 모두 계산해 비교할 수 있습니다.`,
  },
  {
    question: "자사주 60%는 언제 팔 수 있나요?",
    answer:
      "잠정합의 보도 기준으로 자사주 60%p 중 40%p는 당해(4월경) 지급 즉시 매도할 수 있고, 나머지 20%p는 1년 후 10%p·2년 후 10%p씩 주식으로 이연 지급되며 수령 즉시 처분할 수 있습니다. 즉 '팔 수 없는 기간'이 있는 게 아니라, 일부가 늦게 지급되는 구조입니다.",
  },
  {
    question: "주식 수는 어떤 가격으로 계산하나요?",
    answer:
      "①1월 경영성과 발표일 ②2월 PS 현금 지급일 ③4월 주식 지급일 — 세 시점의 SK하이닉스 종가 중 가장 낮은 가격을 기준가로 주식 수를 산정하는 것으로 보도됐습니다. 최저가 기준이므로 지급 시점 주가가 기준가보다 높으면 그 차익은 직원 몫이 됩니다.",
  },
  {
    question: "주가가 떨어지면 성과급이 줄어드나요?",
    answer:
      "하방 보전 장치가 포함된 것으로 보도됐습니다 — 주식이 실제 지급된 첫날 종가 기준으로 지급 주식의 가치 총액이 당초 성과급 금액에 못 미치면, 부족분을 회사가 현금으로 추가 지급합니다. 단 보전은 지급 첫날 기준 1회이며, 지급 이후의 주가 하락분은 보전되지 않습니다. 따라서 지급 시점 기준 가치는 산정액 이상이 보장되고, 리스크는 '지급 후 보유 구간'에만 있습니다.",
  },
  {
    question: "성과급을 주식 100%로 받을 수도 있나요?",
    answer:
      "본인이 요청하면 주식 비중을 100%까지 높일 수 있는 선택권이 포함된 것으로 보도됐습니다. 주가 상승을 기대하는 직원은 현금 40%까지 주식으로 전환해 받을 수 있는 구조입니다. 다만 주식 100% 선택 시 이연 구조가 어떻게 되는지는 보도되지 않아, 본 계산기는 '이연 20%p 동일' 가정으로 계산합니다.",
  },
  {
    question: "주식으로 받으면 세금은 어떻게 되나요?",
    answer:
      "본 계산기는 자사주 지급분도 지급 시점 시가 기준 근로소득으로 합산 과세되는 것으로 가정합니다(자사주 성과급의 일반적 처리 방식). 수령 후 매도할 때의 차익은 상장주식 장내 매도 기준 대주주 요건에 해당하지 않으면 양도소득세 없이 증권거래세만 부과됩니다. 확정 세무 처리는 회사 안내와 세무 전문가 확인이 필요합니다.",
  },
  {
    question: "2026년 SK하이닉스 PS는 1인당 얼마나 될까요?",
    answer:
      "증권가의 2026년 영업이익 컨센서스 250조원이 실현되면 PS 재원은 그 10%인 25조원, 임직원 약 3만 5천 명 기준 1인 평균 세전 약 7억원(현금 약 2.8억 + 자사주 약 4.2억)으로 추정하는 보도가 있습니다. 위 계산기의 '컨센서스(250조)' 시나리오가 이 수치를 재현합니다. 실제 실적·개인 평가에 따라 크게 달라지는 추정치입니다.",
  },
  {
    question: "2026년 상반기 PI는 확정됐나요?",
    answer:
      "네. 2026년 상반기 PI는 최대치인 월 기본급의 150%로 확정되어 7월 28일 급여와 함께 지급됐습니다(복수 언론 보도). 상반기 영업이익 98.2조원으로 영업이익률이 150% 구간(30% 이상)을 크게 웃돈 결과입니다. 하반기 PI는 2027년 1월경 발표 예정이며, 산정 기준은 반기 영업이익률 30% 이상 150% / 15~30% 125% / 0~15% 100% / -10~0% 50% / -10% 미만 0%로 보도됐습니다.",
  },
  {
    question: "직전(2025년분) PS·PI는 얼마나 지급됐나요?",
    answer:
      "보도 기준으로 2025년 연간 PS는 기본급의 2,964%(상한 1,000% 폐지 후 첫 적용)가 2026년 2월 5일 지급됐고, 2025년 하반기 PI 150%는 2026년 1월 30일 지급됐습니다. PS+PI 합계 3,264%로, 연봉 1억원 직원 기준 약 1억 5천만원 수준입니다. 2025년 연간 영업이익 47조 2,063억원이 근거였습니다.",
  },
  {
    question: "SK하이닉스 PS는 어떻게 계산되나요?",
    answer:
      `PS(Profit Sharing, 초과이익분배금)는 회사 연간 영업이익의 10%를 재원으로 전 직원에게 분배하는 제도입니다. 2025년 9월 노사 합의로 '기본급 1,000% 상한'이 폐지되어 영업이익이 클수록 지급액이 비례 증가합니다. 본 계산기는 영업이익 × 10% ÷ 직원 수(사업보고서 기준 ${EMPLOYEES.toLocaleString()}명)로 1인당 평균을 구하고, 본인 연봉 비례 보정으로 개인 PS를 추정합니다.`,
  },
  {
    question: "SK하이닉스 PI는 PS와 어떻게 다른가요?",
    answer:
      "PI(Productivity Incentive, 생산성 격려금)는 반기별 영업이익률을 평가해 지급하는 격려금으로, 기본급의 최대 150% × 연 2회(최대 300%)입니다. PS는 회사 전체 이익 기반·연 1회, PI는 반기마다 지급되는 차이가 있습니다. 이번 잠정합의의 주식 지급 개편은 PS가 대상이며, 본 계산기는 PI를 현금 지급 유지로 가정합니다.",
  },
  {
    question: "기본급(통상임금)은 어떻게 정의되나요?",
    answer:
      "PI 계산의 기준이 되는 '기본급'은 통상 연봉의 1/20로 산정됩니다. 연봉 1억원이면 기본급 500만원, PI 150% 한 번에 750만원입니다. 본 계산기는 입력한 연봉 ÷ 20으로 자동 산출합니다. 참고로 이번 합의에는 기본급(직무급+경력급) 6.3% 인상도 포함됐습니다.",
  },
  {
    question: "성과급 세금은 어떻게 떼나요?",
    answer:
      "성과급은 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%)이 적용되고, 지방소득세(소득세의 10%)와 4대보험이 추가 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상이면 추가 부과가 없습니다. 본 계산기는 '연봉+성과급 합산 세금 − 연봉만 세금' marginal 방식으로 계산합니다.",
  },
  {
    question: "삼성전자 성과급과 비교하면?",
    answer:
      "삼성전자는 OPI(영업이익 일부를 부문·사업부로 분배) + TAI(월 기본급 최대 100% × 연 2회) 구조이고, SK하이닉스는 PS(영업이익 10% 전사 분배) + PI(반기 기본급 최대 150% × 2회) 구조입니다. SK하이닉스는 사업부 구분 없이 분배되고 직원 수(약 3만 5천 명)가 삼성전자(12만 명+)보다 적어, 같은 이익이면 1인당 몫이 커지는 구조입니다. 자세한 삼성 계산은 '삼성전자 성과급 계산기' 페이지를 참고하세요.",
  },
  {
    question: "성과급 받고 절세할 방법은?",
    answer:
      "(1) IRP·연금저축 연 900만원 한도(세액공제 13.2~16.5%), (2) 우리사주조합 출연 연 400만원 소득공제, (3) 의료비·교육비·기부금 세액공제, (4) 고향사랑기부 10만원까지 100% 세액공제. PS 입금 직후 IRP 한도를 우선 채우는 게 효과가 큽니다. 자사주로 받는 분량이 커지는 만큼, 매도 시점 분산도 함께 고려하세요.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 2026-08-20 잠정합의 등 공개 보도·사업보고서 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 PS·PI는 본인 평가·근속·직급 등에 따라 ±15~25% 차이가 날 수 있고, 잠정합의 내용은 총투표 결과에 따라 바뀔 수 있습니다. 결과는 참고용으로만 사용하시고, 정확한 본인 케이스는 사내 시스템 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "영업이익 시나리오 선택",
    text: "2025 실적(47.2조) / 보수(150조) / 상반기 연환산(196.4조) / 컨센서스(250조) 중 선택하거나 직접 입력합니다. 2026 상반기 실적만 98.2조원입니다.",
  },
  {
    name: "본인 연봉 입력",
    text: "연 기본 연봉을 만원 단위로 입력하면 기본급(연봉÷20)이 자동 계산됩니다.",
  },
  {
    name: "PI 확인·선택",
    text: "2026 상반기 PI는 150% 확정(7/28 지급)이 기본 적용되고, 하반기는 시나리오를 선택합니다.",
  },
  {
    name: "PS 지급 방식 선택",
    text: "신 체계(현금 40%+자사주 60%, 잠정합의) / 구 체계(현금 80%+이연 20%) / 주식 100% 선택권을 토글해 비교합니다.",
  },
  {
    name: "결과·세후 확인",
    text: "PS+PI 산정 총액, 연도별 지급 타임라인(현금·주식 구성), 당해 수령분 세후 실수령액을 확인합니다.",
  },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    // 핵심
    "SK하이닉스 성과급 계산기",
    "하이닉스 성과급 계산기",
    "SK하이닉스 성과급",
    "하이닉스 성과급",
    "SK하이닉스 성과급 계산",
    "SK하이닉스 성과급 시뮬레이터",
    // 2026 잠정합의 (뉴스 대응)
    "SK하이닉스 성과급 주식",
    "SK하이닉스 자사주 성과급",
    "SK하이닉스 성과급 현금 40 주식 60",
    "SK하이닉스 임단협 2026",
    "SK하이닉스 잠정합의",
    "SK하이닉스 성과급 1인당",
    "SK하이닉스 성과급 7억",
    // PS
    "SK하이닉스 PS",
    "하이닉스 PS 계산",
    "SK하이닉스 PS 지급일",
    "하이닉스 PS 2964",
    "초과이익분배금",
    // PI
    "SK하이닉스 PI",
    "SK하이닉스 PI 150",
    "SK하이닉스 PI 지급일",
    "SK하이닉스 생산성격려금",
    // 세금
    "성과급 주식 지급 세금",
    "하이닉스 성과급 세후",
    "성과급 실수령액",
    // 기타
    "반도체 성과급",
    "HBM 성과급",
    "SK하이닉스 영업이익",
    "SK하이닉스 연봉",
  ].join(", "),
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
    languages: {
      "ko-KR": `${SITE_URL}${PAGE_PATH}`,
      "x-default": `${SITE_URL}${PAGE_PATH}`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: SITE_NAME,
    title: PAGE_TITLE_FULL,
    description: PAGE_DESC,
    images: [
      {
        url: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(
          "SK하이닉스 성과급 계산기"
        )}`,
        width: 1200,
        height: 630,
        alt: PAGE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE_FULL,
    description: PAGE_DESC,
    images: [
      `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(
        "SK하이닉스 성과급 계산기"
      )}`,
    ],
  },
  other: {
    "article:modified_time": LAST_UPDATED,
  },
};

export default function SkHynixBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "SK하이닉스 성과급" }),
          {
            ...softwareApplicationLd({
              name: PAGE_TITLE,
              description: PAGE_DESC,
              url: `${SITE_URL}${PAGE_PATH}`,
            }),
            dateModified: LAST_UPDATED,
          },
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "SK하이닉스 PS·PI 성과급 계산하는 방법",
            description:
              "영업이익·연봉·PI에 2026 잠정합의 지급 방식(현금 40%+자사주 60%)까지 반영해 세후 실수령액을 산출하는 5단계 가이드",
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
              {STATUS_BADGE}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              SK하이닉스 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              PS(영업이익 10% 풀) + PI(반기 기본급 최대 150% × 2회) 합산
              시뮬레이터. 2026 임단협 잠정합의의{" "}
              <strong>현금 40% + 자사주 60%</strong> 지급 방식과 구 체계를
              나란히 비교하고, 세전·세후 실수령액까지 즉시 계산합니다.
            </p>
            <div className="mt-5">
              <ShareButtons
                title={PAGE_TITLE_FULL}
                description={PAGE_DESC}
              />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          {/* 시즌 노티스 — 2026-08-20 임단협 잠정합의 (투표 결과는 psData.status 로 전환) */}
          <aside
            className="mb-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6"
            aria-label="2026 임단협 잠정합의 안내"
          >
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">
              {STATUS === "ratified"
                ? "✅ 2026 임단협 최종 타결"
                : STATUS === "rejected"
                  ? "⚠️ 잠정합의 부결 — 재협상 중"
                  : "⏰ 2026 임단협 잠정합의 — 총투표 전"}
            </p>
            <p className="text-sm leading-relaxed text-navy">
              <strong>2026년 8월 20일</strong> SK하이닉스 노사가 임금{" "}
              <strong>6.3% 인상</strong>과 PS 지급 방식 개편에 잠정합의했습니다
              (복수 언론 보도). PS의 <strong>40%는 당해 현금</strong>,{" "}
              <strong>60%는 자사주</strong>(40%p 즉시 매도 가능 + 1·2년 후
              10%p씩 이연)로 지급하며, 주가 하락 시 현금 보전 장치가
              포함됐습니다. {STATUS_SENTENCE}
            </p>
            <p className="text-xs text-faint mt-2 leading-relaxed">
              한편 <strong>2026 상반기 PI는 최대치 150%로 확정</strong>되어 7월
              28일 지급됐습니다(상반기 영업이익 98.2조원). 아래 계산기는 두
              내용을 모두 반영했으며, 투표 결과가 나오면 즉시 갱신합니다.
            </p>
          </aside>

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
                  <li>• 전 직원 분배 (사업부 구분 없음), 연 1회 (1~2월)</li>
                  <li>• <strong>2025-09 합의로 기본급 1,000% 상한 폐지</strong></li>
                  <li>
                    • 2025년분까지: 현금 80% 당해 + 20% 2년 이연 (10%/년)
                  </li>
                  <li>
                    • <strong className="text-primary">2026년분부터(잠정합의): 현금
                    40% + 자사주 60%</strong>
                  </li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">PI (Productivity Incentive)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 반기 <strong>영업이익률</strong> 연동</li>
                  <li>• 기본급의 <strong>최대 150%</strong> × 연 2회 (7월·1월)</li>
                  <li>
                    • <strong className="text-primary">2026 상반기 150% 확정</strong>{" "}
                    (7/28 지급)
                  </li>
                  <li>• 기본급 = 통상 연봉의 1/20</li>
                  <li>• 이번 주식 지급 개편의 대상 아님 (현금 유지 가정)</li>
                </ul>
              </article>
            </div>

            {/* 연도별 PS·PI 이력 표 — psData.PS_HISTORY 서버 렌더 */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[560px]">
                <caption className="text-left text-base font-black mb-3">
                  연도별 PS·PI 실지급 이력 (보도 기준)
                </caption>
                <thead>
                  <tr className="border-b-2 border-canvas-deep text-left">
                    <th className="py-2 pr-3 font-bold">실적 연도</th>
                    <th className="py-2 pr-3 font-bold">PS (기본급 대비)</th>
                    <th className="py-2 pr-3 font-bold">연간 PI 합계</th>
                    <th className="py-2 pr-3 font-bold">영업이익</th>
                    <th className="py-2 font-bold">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {PS_HISTORY.map((row) => (
                    <tr key={row.year} className="border-b border-canvas-deep/60">
                      <td className="py-2 pr-3 font-bold">{row.year}년</td>
                      <td className="py-2 pr-3 tabular-nums">
                        {row.psRatePct === null
                          ? "—"
                          : row.psRatePct === 0
                            ? "0% (미지급)"
                            : `${row.psRatePct.toLocaleString()}%`}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {row.piTotalPct === null ? "—" : `${row.piTotalPct}%`}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {row.opTril < 0 ? `−${Math.abs(row.opTril)}조` : `${row.opTril}조`}
                      </td>
                      <td className="py-2 text-faint">{row.note ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-faint">
                * 2026년분 PS는 2027년 초 확정·지급 예정 — 잠정합의 기준
                신 체계(현금 40%+자사주 60%)가 첫 적용될 전망입니다.
              </p>
            </div>
          </section>

          {/* 정책 개요 ↔ 잠정합의 정리 섹션 사이 광고 */}
          <div className="mt-8">
            <GuideMidAd />
          </div>

          {/* 2026-08-20 잠정합의 전면 정리 (구 "자사주 검토" 섹션 자리) */}
          <section
            className="mt-8 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="agreement-heading"
          >
            <h2
              id="agreement-heading"
              className="text-xl sm:text-2xl font-black mb-3 flex items-center gap-2"
            >
              <Info className="w-5 h-5 text-primary" />
              2026 잠정합의 전면 정리 — 현금 40% + 자사주 60%
            </h2>
            <p className="text-sm leading-relaxed text-navy">
              2026년 8월 20일 노사가 마련한 잠정합의안의 핵심은 PS 지급
              방식의 개편입니다. <strong>재원(영업이익의 10%)과 상한 폐지는
              그대로 유지</strong>하되, 지급 형태가 바뀝니다.{" "}
              {STATUS_SENTENCE}
            </p>

            {/* 지급 스케줄 타임라인 */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[560px]">
                <caption className="text-left font-bold mb-2 text-base">
                  신 체계 지급 스케줄 (2026년 성과급 기준)
                </caption>
                <thead>
                  <tr className="border-b-2 border-canvas-deep text-left">
                    <th className="py-2 pr-3 font-bold">시점</th>
                    <th className="py-2 pr-3 font-bold">형태</th>
                    <th className="py-2 pr-3 font-bold">비중</th>
                    <th className="py-2 font-bold">비고</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-canvas-deep/60">
                    <td className="py-2 pr-3">2027년 2월경</td>
                    <td className="py-2 pr-3 font-bold">현금</td>
                    <td className="py-2 pr-3 tabular-nums font-black text-primary">40%</td>
                    <td className="py-2 text-faint">당해 일시 지급</td>
                  </tr>
                  <tr className="border-b border-canvas-deep/60">
                    <td className="py-2 pr-3">2027년 4월경</td>
                    <td className="py-2 pr-3 font-bold">자사주</td>
                    <td className="py-2 pr-3 tabular-nums font-black text-primary">40%</td>
                    <td className="py-2 text-faint">지급 즉시 매도 가능</td>
                  </tr>
                  <tr className="border-b border-canvas-deep/60">
                    <td className="py-2 pr-3">2028년</td>
                    <td className="py-2 pr-3 font-bold">자사주</td>
                    <td className="py-2 pr-3 tabular-nums font-black text-primary">10%</td>
                    <td className="py-2 text-faint">수령 즉시 처분 가능</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">2029년</td>
                    <td className="py-2 pr-3 font-bold">자사주</td>
                    <td className="py-2 pr-3 tabular-nums font-black text-primary">10%</td>
                    <td className="py-2 text-faint">수령 즉시 처분 가능</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 핵심 조항 카드 */}
            <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm leading-relaxed">
              <div className="rounded-xl border border-canvas-deep p-4 bg-canvas/30">
                <p className="font-bold mb-1">📐 기준가 — 3개 시점 최저가</p>
                <p className="text-faint">
                  {AGREEMENT_2026.basePriceRule}. 최저가 기준이므로 지급 시점
                  주가가 더 높으면 차익은 직원 몫입니다.
                </p>
              </div>
              <div className="rounded-xl border border-canvas-deep p-4 bg-canvas/30">
                <p className="font-bold mb-1">🛡️ 하방 보전 — 지급 첫날 1회</p>
                <p className="text-faint">{AGREEMENT_2026.downsideProtection}.</p>
              </div>
              <div className="rounded-xl border border-canvas-deep p-4 bg-canvas/30">
                <p className="font-bold mb-1">🔁 주식 100% 선택권</p>
                <p className="text-faint">
                  본인 요청 시 주식 비중을 100%까지 상향할 수 있습니다. 이연
                  구조는 미보도 — 본 계산기는 이연 20%p 동일로 가정합니다.
                </p>
              </div>
              <div className="rounded-xl border border-canvas-deep p-4 bg-canvas/30">
                <p className="font-bold mb-1">⚖️ 구 체계와 비교</p>
                <p className="text-faint">
                  구 체계(2025년분까지)는 현금 80% 당해 + 현금 10%p×2년
                  이연이었습니다. 당해 수령 비율(80%)은 같고, 그중 40%p가
                  주식으로 바뀌는 것이 핵심 차이입니다.
                </p>
              </div>
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
                  <p className="mt-3 text-sm leading-relaxed text-faint pl-7 faq-answer">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 근거 · 한계 · 면책 */}
          <section
            className="mt-10 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="basis-heading"
          >
            <h2
              id="basis-heading"
              className="text-xl font-black mb-4 inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-primary" aria-hidden />
              근거 · 한계 · 면책
            </h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <p className="font-bold mb-1">근거</p>
                <p className="text-faint">
                  지급 방식(현금 40%+자사주 60%)·기준가 3시점 최저가·하방
                  보전·주식 100% 선택권·임금 6.3% 인상은{" "}
                  <strong>2026-08-20 임단협 잠정합의에 대한 복수 언론
                  보도</strong>{STATUS === "ratified" ? "(이후 총투표 가결)" : ""}
                  를, PS 재원(영업이익 10%)·상한 폐지는 2025-09 노사 합의
                  보도를, 직원 수({EMPLOYEES.toLocaleString()}명)·실적은
                  사업보고서·실적 공시를 근거로 합니다. 2026년 세법(소득세율·
                  4대보험 요율)을 반영했습니다.
                </p>
              </div>
              <div>
                <p className="font-bold mb-1">한계</p>
                <ul className="text-faint space-y-1 list-disc pl-5">
                  {STATUS === "tentative" && (
                    <li>
                      <strong>잠정합의는 총투표 전 미확정</strong> — 부결 시 지급
                      방식 내용이 바뀔 수 있습니다.
                    </li>
                  )}
                  <li>
                    개인 PS는 &lsquo;평균 × 연봉 비례&rsquo; 추정 모델 — 실제는
                    평가·근속·직급에 따라 ±15~25% 차이.
                  </li>
                  <li>
                    주식 100% 선택 시 이연 구조, 하방 보전의 이연 트랜치 적용
                    여부는 보도되지 않아 가정을 사용했습니다(각 지급 시점별 적용
                    가정).
                  </li>
                  <li>
                    자사주 지급분 세금은 &lsquo;지급 시점 시가 근로소득 합산
                    과세&rsquo; 가정 — 확정 세무 처리는 회사 안내 기준.
                  </li>
                  <li>
                    직원 수는 사업보고서 {EMPLOYEES.toLocaleString()}명 기준 —
                    보도의 &lsquo;약 3만 5천 명&rsquo;과 미세한 차이가 있을 수
                    있습니다.
                  </li>
                  <li>
                    영업이익 컨센서스(250조)는 증권가 전망치이며 실적이
                    아닙니다.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-1">면책</p>
                <p className="text-faint">
                  본 계산기는 의사결정 참고용 시뮬레이터이며 회사 공식 자료가
                  아닙니다. 자사주 지급분은 지급 이후 주가 변동에 따라{" "}
                  <strong>원금 손실이 발생할 수 있으며</strong>, 본 페이지의
                  어떤 내용도 투자 조언이 아닙니다. 재무·법무·세무 의사결정은
                  전문가 자문을 받으시고, 정확한 본인 케이스는 사내 시스템
                  명세서를 확인하세요.
                </p>
              </div>
            </div>
          </section>

          {/* 관련 회사 계산기 */}
          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/samsung-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">삼성전자 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">
                OPI·TAI — 영업이익 → 부문·사업부 분배
              </p>
            </Link>
            <Link
              href="/salary-db/sk-hynix"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">SK하이닉스 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">
                CL 직급별 평균 연봉, 워라밸, 복지 전체
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
                <strong>데이터 출처</strong>:{" "}
                {SOURCES.map((s) => `${s.outlet}(${s.date}) — ${s.fact}`).join(
                  " · "
                )}
                . 기사 본문을 인용하지 않으며 보도된 사실 수치만 사용합니다.
                마지막 갱신 {LAST_UPDATED}.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
