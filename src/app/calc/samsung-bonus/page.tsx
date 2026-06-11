// src/app/calc/samsung-bonus/page.tsx
//
// 삼성전자 성과급 계산기.
// title.absolute로 사이트명 한 번만 적용 (layout template과 중복 방지).

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
import { InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import {
  Sparkles,
  Info,
  AlertTriangle,
  ArrowRight,
  Coins,
  ShieldCheck,
} from "lucide-react";
import SamsungBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/samsung-bonus";
const PAGE_TITLE = "삼성전자 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "삼성전자 성과급 계산기. 영업이익 기반 부문/사업부 분배로 사업부별 1인당 성과급을 추정하고, 본인 연봉별 세전·세후, 다년도 RSU 매도 시뮬레이션까지 한 번에. 공개 노사 합의 보도 기반 추정 시뮬레이터.";

// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: "삼성전자 성과급은 어떻게 계산되나요?",
    answer:
      "공개 보도에 따르면 삼성전자의 성과급 풀은 회사 연간 영업이익에서 일정 비율(약 10.5%)을 떼어내는 구조로 알려져 있습니다. 본 계산기는 그 풀을 부문(전체 인원 균등 분배 40%)과 사업부(인원×사업부 가중치 분배 60%) 두 갈래로 나눠 사업부별 1인당 평균을 산출합니다. 영업이익(조원)·사업부별 인원·사업부 가중치 3가지만 입력하면 메모리·공통·파운드리·시스템LSI 사업부별 1인당 평균이 즉시 산출됩니다. 정확한 분배 정책은 회사 공식 발표를 참고하세요.",
  },
  {
    question: "본인 연봉이 다르면 성과급도 다른가요?",
    answer:
      "본 계산기 상단의 1인당 평균은 평균 직원 연봉 8,000만원 기준입니다. '내 연봉으로 계산' 섹션에 본인 연봉을 입력하면 비례 모델로 본인 케이스의 세전 성과급과 세후 실수령액이 산출됩니다. 실제 회사 정책은 기본급 비례·평가 등급·호봉 등 복합 요인이 작용하므로 본 결과는 추정치이며, 정확한 금액은 회사 명세서를 확인하세요.",
  },
  {
    question: "세금 계산 가정을 직접 조정할 수 있나요?",
    answer:
      "네, '내 연봉으로 계산' 섹션 안의 '세금 계산 가정 조정'에서 (1) 세액공제율을 0~50%까지 슬라이더로 조정 (디폴트 20%, 자녀·연금·의료비·기부 등 공제 반영 비율), (2) 4대보험 추가 부과 적용 여부를 체크박스로 ON/OFF 할 수 있습니다. 성과급은 보수에 합산되어 4대보험 정산되지만, 국민연금은 보수월액 상한(연 7,644만원)이 있어 고소득자는 추가 부과액이 적습니다.",
  },
  {
    question: "사업부 가중치는 무엇인가요?",
    answer:
      "사업부 가중치는 사업부의 영업이익 기여도·전략적 중요도를 반영한 상대값입니다. 1.0이 표준이고, 0.55면 55% 가중, 0.05면 거의 사업부 분배 제외(부문 균등 분배만 수령)됩니다. 본 계산기 디폴트는 메모리 1.0 / 공통 0.55 / 파운드리·시스템LSI 0.05로, 보도된 791%/553%/252% 결과에 매칭되도록 역산 보정한 값입니다. 회의록 원본 가중치는 1.0/0.7/0.0이지만 영업이익 350조 가정에서는 보도값과 정합되지 않아 보도값 매칭을 우선했습니다. 사용자가 회의록 원본 값으로 자유롭게 조정 가능합니다.",
  },
  {
    question: "다년도 RSU 시뮬레이션은 무엇을 보여주나요?",
    answer:
      "매년 다르게 풀리는 주식(RSU) 매도 제한을 반영해, 여러 해 누적한 RSU를 한 번에 매도할 때의 총 가치를 추정합니다. 각 연도 행마다 1인당 성과급·RSU 비중·풀린 비율(누적)·그 해 주가를 입력하면 누적 매도 가능 주식 수가 자동 합산되고, 하단의 '기준 매도가' 시나리오로 매도 시 총 가치를 비교할 수 있습니다. 우측 그래프는 연도별 누적 가치 추이를 라인 차트로 시각화합니다.",
  },
  {
    question: "성과급 세금은 어떻게 빠지나요?",
    answer:
      "성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%)이 적용됩니다. 여기에 지방소득세(소득세의 10%), 그리고 4대보험은 보수에 합산되어 정산되지만 국민연금은 보수월액 상한(연 7,644만원) 적용, 건강·고용보험은 상한 없음으로 처리됩니다. 일반적으로 성과급 실효세율은 20~38% 수준이며, 세액공제 활용도와 적용되는 4대보험 부과 방식에 따라 차이가 큽니다.",
  },
  {
    question: "주식 매도 제한이 매년 다른 이유는?",
    answer:
      "삼성전자가 임직원에게 지급하는 RSU(Restricted Stock Unit, 양도제한조건부주식)는 받은 단위마다 별도 베스팅(vesting) 일정이 있습니다. 일반적으로 받은 해 0%, 1~4년차에 25%씩 누적 풀리는 구조이며, 회사 정책에 따라 cliff 형태(1년차까지 0%)나 5년 균등 등 변형이 가능합니다. 본 계산기는 매년 풀리는 비율을 사용자가 직접 입력할 수 있어 다양한 vesting 시나리오를 검토할 수 있습니다.",
  },
  {
    question: "SK하이닉스 성과급과 어떻게 다른가요?",
    answer:
      "SK하이닉스는 PS(Profit Sharing)를 기본급의 일정 배수로 지급하는 방식이고, 삼성전자는 영업이익 풀을 부문·사업부로 분배하는 방식으로 알려져 있습니다. 산정 기준이 달라 직접 비교가 어렵지만, 본 계산기 참고 박스에 SK하이닉스 단순 추정치(2024 실적 기준 영업이익 23.4조 × 10% ÷ 35,000명 ≈ 인당 평균 약 6,700만원)를 함께 제공합니다. 정밀 계산은 SK하이닉스 성과급 계산기(/calc/sk-hynix-bonus)를 이용하세요.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개된 노사 합의 보도, 사업보고서, 일반적인 영업이익 분배 모델을 기반으로 한 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 지급은 본인 사업부의 정확한 영업이익, 평가 등급, 호봉, 기본급 비율 등에 따라 ±20~30% 차이가 날 수 있습니다. 결과는 의사결정 참고용으로만 사용하시고, 정확한 본인 케이스는 사내 HR 시스템 명세서를 확인하세요.",
  },
  {
    question: "성과급 받으면 어떻게 절세할 수 있나요?",
    answer:
      "성과급 자체의 세율은 낮출 수 없지만 환급액을 키우는 방법은 있습니다. (1) IRP·연금저축 추가 납입 (연 900만원 한도, 연봉 5,500만 이하 16.5% / 초과 13.2% 세액공제), (2) 우리사주조합 출연 (연 400만원 한도 비과세), (3) 의료비·교육비·기부금 세액공제 극대화, (4) 고향사랑기부 (10만원까지 100% 세액공제). 성과급 입금 직후 IRP 한도를 채우는 게 가장 효과 큽니다.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "영업이익 입력",
    text:
      "회사 연간 영업이익(조원)을 입력합니다. 분기 영업이익이면 4배 환산. 30·100·350·1000조 등 다양한 시나리오를 빠른선택 칩으로 비교 가능합니다.",
  },
  {
    name: "사업부 인원·가중치 확인",
    text:
      "메모리·공통·파운드리·시스템LSI의 인원과 사업부 가중치를 확인. 회사 정책에 따라 조정 가능. 적자 사업부는 가중치 0으로 두면 사업부 분배에서 제외.",
  },
  {
    name: "사업부별 1인당 평균 확인",
    text:
      "부문(40%) + 사업부(60%) 분배 결과로 사업부별 1인당 평균이 자동 산출됩니다.",
  },
  {
    name: "내 연봉으로 본인 케이스 계산",
    text:
      "본인 연봉과 소속 사업부를 선택하면 본인 케이스의 세전·세후 성과급이 산출됩니다. 세액공제율·4대보험 부과 적용도 직접 조정 가능.",
  },
  {
    name: "다년도 RSU 매도 시뮬",
    text:
      "연도별 1인당 성과급·RSU 비중·풀린 비율·주가를 입력. 누적 매도 가능 주식이 합산되고, 기준 매도가 입력 시 통합 매도 시 가치와 누적 그래프가 산출됩니다.",
  },
];

// ─────────────────────────────────────────────────────────────
// SEO Metadata — title.absolute로 layout template 중복 차단
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE_FULL, // "삼성전자 성과급 계산기 2026 | 머니샐러리"
  },
  description: PAGE_DESC,
  keywords: [
    // 핵심
    "삼성전자 성과급 계산기",
    "삼성 성과급 계산",
    "삼성전자 성과급",
    "삼성 보너스",
    // OPI
    "삼성 OPI",
    "OPI 계산",
    "초과이익성과금",
    // 영업이익/분배
    "삼성 영업이익 분배",
    "삼성 1인당 성과급",
    "삼성 부문 사업부 분배",
    // 사업부
    "삼성 메모리 성과급",
    "삼성 파운드리 성과급",
    "삼성 시스템LSI 성과급",
    "DS 부문 성과급",
    // RSU
    "삼성전자 RSU",
    "삼성 RSU 매도",
    "양도제한조건부주식",
    "RSU 베스팅",
    // 세금
    "성과급 세금",
    "성과급 세후",
    "성과급 실수령액",
    // 비교
    "SK하이닉스 성과급",
    "반도체 성과급",
    "삼성 임금협상 2026",
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
          "삼성전자 성과급 계산기"
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
        "삼성전자 성과급 계산기"
      )}`,
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// 사업부 시나리오 (본문 보강)
// ─────────────────────────────────────────────────────────────

const DIVISION_SCENARIOS = [
  {
    name: "메모리",
    profitRange: "안정 5~10조 / 호황기 20~30조",
    perPersonRange: "3,000~8,000만원",
    color: "#0145F2",
    note:
      "HBM·D램·NAND. 호황 시 가중치 1.0 기준 사업부 풀 최대 수혜.",
  },
  {
    name: "공통 (스태프·연구소)",
    profitRange: "DS 평균에 준함",
    perPersonRange: "2,500~6,000만원",
    color: "#F59E0B",
    note: "특정 사업부에 속하지 않는 인력. 보도값 553% 매칭 디폴트 0.55 (회의록 원본 0.7).",
  },
  {
    name: "파운드리·시스템LSI",
    profitRange: "적자 ~ 1~3조",
    perPersonRange: "1,500~2,500만원",
    color: "#EF4444",
    note: "2026년 적자 → 보도값 매칭 디폴트 0.05 (회의록 원본 0.0). 2027년~ 성과 가변.",
  },
];

const RSU_SCHEDULE_EXAMPLES = [
  {
    title: "표준 4년 균등 vest",
    desc: "받은 해 0% → 1년 25% → 2년 50% → 3년 75% → 4년 100%",
  },
  {
    title: "Cliff 1년 + 3년 균등",
    desc: "1년차까지 0% (cliff) → 2년 33% → 3년 67% → 4년 100%",
  },
  {
    title: "5년 균등",
    desc: "매년 20%씩 풀려 5년차 100%",
  },
];

export default function SamsungBonusCalculatorPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "삼성전자 성과급 계산기",
            description: PAGE_DESC,
            url: PAGE_PATH,
          }),
          autoBreadcrumbLd(PAGE_PATH, {
            leafName: "삼성전자 성과급 계산기",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "삼성전자 성과급 계산하는 방법",
            description:
              "영업이익 입력부터 본인 연봉별 세후 실수령, 다년도 RSU 매도 시뮬까지 5단계.",
            steps: HOW_TO_STEPS,
            totalTime: "PT3M",
          }),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} aria-hidden /> Samsung 성과급 시뮬레이터
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50"
              style={{ letterSpacing: "-0.04em" }}
            >
              삼성전자 성과급 계산기
            </h1>
            <p className="text-base sm:text-lg font-medium text-muted-blue dark:text-canvas-300">
              영업이익 → 부문 40% + 사업부 60% 분배 →{" "}
              <strong className="text-electric">사업부별 1인당</strong>
            </p>
            <p className="text-sm text-faint-blue mt-3 max-w-md mx-auto leading-relaxed">
              영업이익{" "}
              <strong className="text-navy dark:text-canvas-50">10.5%</strong>{" "}
              재원·<strong className="text-navy dark:text-canvas-50">4:6</strong>{" "}
              분배 기준 (공개 노사 합의 보도 기반 추정). 사업부 1인당 평균 + 본인
              연봉별 세전·세후 + 다년도 RSU 매도 시뮬.
            </p>
          </header>

          <SamsungBonusClient />

          <InArticleAd />

          {/* 근거·한계·면책 — 별도 블록 */}
          <section
            className="mb-10 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
            aria-labelledby="basis-title"
          >
            <h2
              id="basis-title"
              className="text-xl font-black text-navy dark:text-canvas-50 mb-4 inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-electric" aria-hidden />
              근거 · 한계 · 면책
            </h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <p className="font-bold text-navy dark:text-canvas-50 mb-1">
                  근거
                </p>
                <p className="text-muted-blue dark:text-canvas-300">
                  본 계산기에 사용된 영업이익 10.5% 재원, 부문:사업부 4:6 분배
                  비율은 2026년 공개 노사 합의 보도와 사업보고서, 다수 언론
                  기사를 종합한 일반 모델입니다. 사업부 디폴트 인원은 사업보고서
                  공시 자료를 참고했습니다.
                </p>
              </div>
              <div>
                <p className="font-bold text-navy dark:text-canvas-50 mb-1">
                  한계
                </p>
                <ul className="text-muted-blue dark:text-canvas-300 space-y-1 list-disc pl-5">
                  <li>실제 분배 정책·가중치·평가 등급은 회사 비공개 영역.</li>
                  <li>
                    1인당 평균값이며 본인 호봉·평가·기본급 비율에 따라 ±20~30%
                    차이.
                  </li>
                  <li>
                    <strong>보도값 매칭 보정 적용</strong> — 보도된
                    791%/553%/252% 결과에 가장 근접하도록 가중치를{" "}
                    <strong>1.0 / 0.55 / 0.05</strong>로 역산 보정했습니다
                    (영업이익 350조 입력 시 약 858/579/269%). 회의록 원본
                    가중치 1.0/0.7/0.0은 보도값과 정합 불가(특히 공통 642% vs
                    553%)하므로 보도값 매칭을 우선했습니다.
                  </li>
                  <li>
                    <strong>2026년 한정</strong> — 회의록상 적자
                    사업부(파운드리·LSI) 가중치 0. 2027년 이후는 사업부 성과에
                    따라 조정 (흑자 전환 시 가중치 ↑). UI에서 직접 입력하세요.
                  </li>
                  <li>
                    세금은 누진세율 기준 추정. 4대보험은 회사 분담분·정산 시점
                    차이로 실제 본인 부담과 다름.
                  </li>
                  <li>
                    RSU 베스팅 일정은 회사·계약별 상이. 본인 RSU 약정서 확인 필요.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-navy dark:text-canvas-50 mb-1">
                  면책
                </p>
                <p className="text-muted-blue dark:text-canvas-300">
                  본 계산기는 의사결정 참고용 시뮬레이터이며 회사 공식 자료가
                  아닙니다. 결과를 근거로 한 재무·법무·세무 의사결정은 전문가
                  자문을 받으시고, 정확한 본인 케이스는 사내 HR 시스템 명세서를
                  확인하세요.
                </p>
              </div>
            </div>
          </section>

          {/* 사업부 시나리오 */}
          <section className="mb-10" aria-labelledby="scenario-title">
            <h2
              id="scenario-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5"
            >
              사업부별 1인당 성과급 시나리오
            </h2>
            <p className="text-sm text-muted-blue dark:text-canvas-300 mb-5 leading-relaxed">
              삼성전자 DS(반도체) 부문은 메모리·공통·파운드리·시스템LSI 세
              갈래로 구성되며, 사업부별 영업이익 기여도에 따라 1인당 성과급이
              크게 달라집니다. 아래는 본 계산기 디폴트 가정에 기반한 일반적
              시나리오 레인지입니다.
            </p>
            <div className="space-y-3">
              {DIVISION_SCENARIOS.map((s) => (
                <div
                  key={s.name}
                  className="rounded-2xl bg-white dark:bg-canvas-900 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderLeft: `4px solid ${s.color}` }}
                >
                  <p className="font-black text-navy dark:text-canvas-50 mb-2">
                    {s.name}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-2">
                    <div>
                      <p className="text-faint-blue mb-0.5">영업이익 범위</p>
                      <p className="text-muted-blue">{s.profitRange}</p>
                    </div>
                    <div>
                      <p className="text-faint-blue mb-0.5">1인당 성과급</p>
                      <p
                        className="font-black"
                        style={{ color: s.color }}
                      >
                        {s.perPersonRange}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    {s.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 다년도 RSU 모델 설명 */}
          <section className="mb-10" aria-labelledby="rsu-desc-title">
            <h2
              id="rsu-desc-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5 flex items-center gap-2"
            >
              <Coins className="w-6 h-6 text-electric" aria-hidden />
              다년도 RSU 매도 시뮬 — 어떻게 작동하나
            </h2>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
              <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                삼성전자가 임직원에게 지급하는 RSU(Restricted Stock Unit,
                양도제한조건부주식)는 받은 단위마다 별도 베스팅 일정을 따릅니다.
                매년 풀리는 비율이 회사 정책에 따라 다르게 적용되므로, 본 계산기는
                각 연도별 풀림 비율을 사용자가 자유롭게 입력하고 누적 매도 가능
                주식과 통합 매도가 기준 가치를 한 번에 비교할 수 있도록
                설계했습니다.
              </p>
              <div className="space-y-3 text-sm">
                <Step
                  num="1"
                  title="그 해 1인당 성과급 (만원)"
                  desc='위 시뮬레이터 결과를 가져오거나 직접 입력. "메모리 1인당으로 채우기" 버튼으로 일괄 적용.'
                />
                <Step
                  num="2"
                  title="RSU 비중 (%)"
                  desc="성과급 중 주식 보상으로 받는 비중. 디폴트 30%."
                />
                <Step
                  num="3"
                  title="풀린 비율 (%, 누적)"
                  desc="그 해 받은 RSU 중 현재 시점에 매도 가능한 누적 비율. 가장 오래된 RSU는 100%, 작년 RSU는 25% 등 자유 입력."
                  highlight
                />
                <Step
                  num="4"
                  title="그 해 주가 (원/주)"
                  desc="RSU 받은 시점의 주가. RSU 주식 수 = 가치 ÷ 그 해 주가."
                />
                <Step
                  num="="
                  title="누적 매도 가능 × 기준 매도가"
                  desc="모든 연도 매도 가능 주식을 합산하고, 기준 매도가 입력 시 통합 매도 시 가치 산출. 우측 그래프로 추이 비교."
                />
              </div>
            </div>
          </section>

          {/* Vesting 예시 */}
          <section className="mb-10" aria-labelledby="vest-title">
            <h2
              id="vest-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5"
            >
              자주 쓰이는 Vesting 일정 예시
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RSU_SCHEDULE_EXAMPLES.map((ex, i) => (
                <div
                  key={ex.title}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                    예시 {i + 1}
                  </p>
                  <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-2">
                    {ex.title}
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    {ex.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-faint-blue mt-3 leading-relaxed">
              ※ 실제 본인 RSU 일정은 약정서 별도 명시. 위 예시는 일반적 형태이며,
              본 계산기에서 매년 풀림 % 값을 직접 입력해 정확히 반영하세요.
            </p>
          </section>

          {/* 분배 모델 단계 */}
          <section className="mb-10" aria-labelledby="model-title">
            <h2
              id="model-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5"
            >
              분배 모델 — OPI1 + OPI2 어떻게 계산되나
            </h2>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
              <Step
                num="A"
                title="OPI1 (기본 성과인센티브) = 연봉 × 50%"
                desc="모든 사업부·연도 동일. 임계값 미달 연도에도 지급."
                highlight
              />
              <Step
                num="1"
                title="OPI2 재원 산정 (영업이익 × 10.5%)"
                desc="예) 350조 × 10.5% = 36.75조원. 영업이익 임계값(26~28년 200조, 29~35년 100조) 미달 시 OPI2만 0."
              />
              <Step
                num="2"
                title="OPI2 → 부문 40% : 사업부 60% 분할"
                desc="총 재원의 40%는 부문 풀(전체 인원 균등), 60%는 사업부 풀(인원×가중치 분배)."
              />
              <Step
                num="3"
                title="부문 1인당 (균등 분배)"
                desc="부문 재원 ÷ 전체 인원. 어느 사업부 소속이든 동일 금액."
              />
              <Step
                num="4"
                title="사업부 1인당 (가중치 분배)"
                desc="사업부 재원 × (본인 가중치) ÷ Σ(인원×가중치). 2026 적자 사업부 가중치 0 → 사업부 분배 0."
                mono
              />
              <Step
                num="="
                title="최종 1인당 = OPI1 + OPI2(부문 + 사업부)"
                desc="세전 합산 평균. 세금은 OPI1+OPI2를 합쳐 누진세 적용."
              />
            </div>
          </section>

          {/* 본문 */}
          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              영업이익 10.5% 재원 — 의미와 한계
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              공개 보도에 따르면 삼성전자는 영업이익의 일정 비율을 성과급 풀로
              책정하는 방식으로 알려져 있고, 본 계산기는 그 비율을 10.5%로 고정해
              시뮬레이션합니다. 다만 이 비율은 회사 공식 발표가 아닌 보도 기반
              가정이므로 실제 분배 정책과 차이가 있을 수 있습니다. 사용자가
              영업이익만 다양하게 바꿔가며 사업부별 1인당 추정치 변화를 빠르게
              비교하는 도구로 활용하세요.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              부문 4 : 사업부 6 — 분배 균형
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              부문 분배는 회사 전체 인원에 균등 지급하는 방식으로, 어느 사업부
              소속이든 동일 금액을 받습니다. 사업부 분배는 사업부별 가중치(영업이익
              기여도 반영)에 따라 차등 지급됩니다. 4:6 비율은 부문 안전망(균등)을
              유지하면서 사업부 성과 차이를 보상에 반영하는 균형점입니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              세후 실수령 — 가정 조정의 중요성
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              성과급은 별도 분리과세가 아닌 근로소득 합산 누진세율(6~45%) 적용
              대상이며, 세후는 다음 변수에 크게 좌우됩니다:
            </p>
            <ul className="space-y-1 text-muted-blue dark:text-canvas-300 leading-relaxed">
              <li>
                • <strong>세액공제율</strong> (자녀·연금·의료비·기부 등) — 본
                계산기는 0~50% 슬라이더로 직접 조정 가능
              </li>
              <li>
                • <strong>4대보험 부과 방식</strong> — 보수정산 시 추가 부과 여부를
                토글로 ON/OFF 가능. 국민연금은 보수월액 상한(연 7,644만원) 적용
              </li>
              <li>
                • <strong>한계세율 구간</strong> — 연봉 1억 이상은 35~38% 구간
                진입으로 세금 부담 증가
              </li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              가정에 따라 실효세율 20~38% 범위로 달라지므로, 본 계산기의 가정
              조정 패널로 본인 상황에 맞게 시뮬레이션하세요.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              RSU 누적 매도 전략의 고려 사항
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              성과급 일부는 현금이 아닌 RSU(양도제한조건부주식)로 지급되며, 매년
              풀리는 비율이 점진적으로 늘어나는 베스팅 구조가 일반적입니다.
              다년간 누적된 RSU를 한 번에 매도하면 매도 시점 주가에 매우
              민감해지므로, 본 계산기의 다년도 RSU 시뮬과 누적 그래프는 매도 시점
              결정에 참고가 됩니다. 단, 양도소득세·세금 신고 의무는 별도 검토
              필요합니다.
            </p>
          </article>

          {/* 경고 */}
          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle
              size={20}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1"
              aria-hidden
            />
            <div>
              <p className="font-black text-amber-900 dark:text-amber-200 mb-1">
                참고용 시뮬레이션입니다
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                본 계산기는 공개된 노사 합의 보도와 일반적인 영업이익 분배 모델
                기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 결과는
                의사결정 참고용으로만 사용하세요.
              </p>
            </div>
          </div>

          {/* 관련 페이지 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            <Link
              href="/samsung-negotiation-2026"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                시즌 가이드
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                삼성전자 2026 임금협상 분석
              </p>
              <p className="text-xs text-muted-blue mb-3">
                5가지 핵심 쟁점, 직급별 예상 인상폭, SK하이닉스 비교
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                자세히 보기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/company/samsung-electronics"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                회사 프로필
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                삼성전자 평균 연봉·복지
              </p>
              <p className="text-xs text-muted-blue mb-3">
                직급별 성장표, 1.35억 평균 연봉, 복지 비교
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                회사 보기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/guides/chip-stock-tax-guide"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                심화 가이드
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                반도체 RSU·자사주 절세 가이드
              </p>
              <p className="text-xs text-muted-blue mb-3">
                매도 시점·세금 구조·절세 4원칙
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                가이드 읽기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/tools/finance/bonus"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                일반 계산기
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                성과급·보너스 세금 계산기
              </p>
              <p className="text-xs text-muted-blue mb-3">
                회사 무관 일반 성과급 실수령액
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                계산하기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
          </section>

          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />

          {/* FAQ */}
          <section className="mb-10 mt-10" aria-labelledby="faq-title">
            <h2
              id="faq-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5"
            >
              자주 묻는 질문
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group transition-shadow hover:shadow-md"
                >
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between gap-3">
                    <span>{item.question}</span>
                    <span className="text-electric group-open:rotate-180 transition-transform flex-shrink-0">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info
              size={18}
              className="text-electric flex-shrink-0 mt-1"
              aria-hidden
            />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 공개된 노사 합의 보도와 영업이익 분배 모델 추정치이며
              참고용입니다. 영업이익 10.5% 재원·부문 사업부 4:6 비율은 보도 기반
              고정값, 사업부 인원·가중치·세금 가정은 사용자 조정 가능. 정확한
              본인 케이스는 회사 명세서 확인.
            </p>
          </div>

          <div className="mt-8 mb-8">
            <ShareButtons
              title={PAGE_TITLE}
              description="영업이익 → 사업부 1인당 분배 + 본인 연봉별 세전·세후 + 다년도 RSU 매도 시뮬"
            />
          </div>

          <RelatedCalculators currentPath={PAGE_PATH} />
        </div>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 보조 컴포넌트
// ─────────────────────────────────────────────────────────────

function Step({
  num,
  title,
  desc,
  highlight = false,
  mono = false,
}: {
  num: string;
  title: string;
  desc: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  const isResult = num === "=";
  const bg = isResult
    ? "bg-electric"
    : highlight
    ? "bg-emerald-100 dark:bg-emerald-900/30"
    : "bg-electric-10";
  const color = isResult
    ? "text-white"
    : highlight
    ? "text-emerald-600"
    : "text-electric";

  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg ${bg} flex items-center justify-center font-black ${color} text-sm`}
      >
        {num}
      </div>
      <div>
        <p
          className={`font-bold text-sm mb-1 ${
            isResult ? "text-electric" : "text-navy dark:text-canvas-50"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs text-muted-blue leading-relaxed ${
            mono ? "font-mono" : ""
          }`}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}
