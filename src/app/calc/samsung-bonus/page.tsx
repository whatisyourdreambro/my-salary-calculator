// src/app/calc/samsung-bonus/page.tsx
//
// 삼성전자 성과급 계산기/시뮬레이터.
// SEO 키워드: 삼성전자 성과급, OPI, 성과급 계산기, 영업이익 10.5%, RSU, 자사주, 메모리/파운드리 1인당.

import type { Metadata } from "next";
import Link from "next/link";
import { buildToolMetadata } from "@/lib/seo";
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
  Calculator,
  Coins,
  TrendingUp,
} from "lucide-react";
import SamsungBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

// ─────────────────────────────────────────────────────────────
// FAQ — Rich Results 노출용 (질문 길이/답변 풍부)
// ─────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: "삼성전자 성과급은 어떻게 계산되나요?",
    answer:
      "삼성전자의 성과급은 회사 연간 영업이익에서 일정 비율(공개 노사 합의 보도상 약 10.5%)을 성과급 풀로 책정하고, 이를 '부문(전체 인원 균등 분배)'과 '사업부(인원×사업부 비율 가중 분배)' 두 갈래로 4:6 비율로 나눠 사업부별 1인당 성과급을 산정합니다. 본 계산기는 영업이익(조원)·사업부별 인원·사업부 가중치 3가지만 입력하면 메모리·공통·파운드리·시스템LSI 사업부별 평균 1인당 성과급을 즉시 산출합니다.",
  },
  {
    question: "연봉 8천만원이면 성과급을 얼마나 받나요?",
    answer:
      "본 계산기 상단 결과는 평균 직원 연봉 8,000만원 기준 사업부별 1인당 평균이며, 본인 연봉에 비례해 다릅니다. '내 연봉으로 계산' 섹션에 본인 연봉을 입력하면 본인 케이스의 세전·세후 실수령액이 자동 산출됩니다. 일반적으로 메모리 호황기 1인당 성과급은 6,000~10,000만원, 공통 5,000~8,000만원, 파운드리·시스템LSI는 적자 영향으로 부문 분배분만 받게 됩니다.",
  },
  {
    question: "영업이익 10.5%는 어디서 나온 수치인가요?",
    answer:
      "공개된 2026년 노사 합의 보도와 회의록 형식 문서에 명시된 성과급 재원 비율입니다. 본 계산기는 이 10.5%를 고정값으로 적용하며, 부문:사업부 비율도 4:6으로 고정합니다. 다만 사업부 인원과 가중치는 회사 정책과 사업부 영업이익 기여도에 따라 매년 달라질 수 있어 사용자가 직접 조정할 수 있도록 했습니다.",
  },
  {
    question: "사업부별 인원과 가중치는 어떻게 정해지나요?",
    answer:
      "사업부 인원은 매년 사업보고서·언론 보도로 공개됩니다. 본 계산기 디폴트는 메모리 27,400명, 공통 29,000명, 파운드리·시스템LSI 20,900명입니다. 사업부 가중치는 영업이익 기여도·전략적 중요도에 따라 책정되며, 메모리는 1.0(표준), 공통은 0.7(평균 70%), 파운드리·시스템LSI는 적자 시 0.0(사업부 분배 제외)이 일반적입니다.",
  },
  {
    question: "다년도 RSU 시뮬레이션은 무엇을 보여주나요?",
    answer:
      "회의록상 매년 다르게 풀리는 주식(RSU) 매도 제한을 그대로 반영해, 여러 해 누적한 RSU를 한 번에 매도할 때의 총 가치를 추정합니다. 각 연도 행마다 1인당 성과급·주식 비중·풀린 비율·그 해 주가를 입력하면 누적 매도 가능 주식 수가 자동 합산되고, 하단의 '기준 매도가' 시나리오로 매도 시 총 가치를 비교할 수 있습니다. 우측 그래프는 연도별 누적 가치 추이를 라인 차트로 시각화합니다.",
  },
  {
    question: "성과급 세금은 어떻게 빠지나요?",
    answer:
      "성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%)이 적용됩니다. 여기에 지방소득세(소득세의 10%), 국민연금 4.5%(보수월액 상한 적용), 건강보험 3.545%, 장기요양 0.46%(건강보험의 12.95%), 고용보험 0.9%가 추가로 빠집니다. 일반적으로 성과급 실효세율은 28~38% 수준이며, 연봉 1억 이상 책임·수석급은 38% 구간까지 진입해 세금이 더 커집니다.",
  },
  {
    question: "주식 매도 제한이 매년 다른 이유는?",
    answer:
      "삼성전자가 임직원에게 지급하는 RSU(Restricted Stock Unit, 양도제한조건부주식)는 매년 받은 단위마다 별도 베스팅(vesting) 일정이 있습니다. 회의록상 매년 풀리는 비율이 다르게 명시되어 있고, 가장 오래된 RSU부터 100% 풀리고 작년 RSU는 25%, 올해 RSU는 0% 식으로 점진적으로 매도 가능 비율이 늘어납니다. 본 계산기는 이 매년 다른 풀림 비율을 사용자가 직접 입력할 수 있게 했습니다.",
  },
  {
    question: "SK하이닉스 성과급과 어떻게 다른가요?",
    answer:
      "SK하이닉스는 PS(Profit Sharing) 제도를 운영하며 기본급의 일정 배수(예: 1,500%) 형태로 지급하는 방식이고, 삼성전자는 영업이익 풀을 부문·사업부로 분배하는 방식입니다. 산정 기준이 다르므로 직접 비교는 어렵지만, 본 계산기에서 참고 박스로 SK하이닉스 추정치(영업이익 250조 × 10% ÷ 35,000명 ≈ 7.14억)를 함께 제공합니다.",
  },
  {
    question: "이 계산기 결과를 회사 발표 전 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개된 노사 합의 보도와 사업보고서, 일반적인 영업이익 분배 모델을 기반으로 한 추정 시뮬레이터입니다. 실제 지급은 본인 사업부의 정확한 영업이익, 평가 등급, 호봉, 기본급 비율 등에 따라 ±20~30% 차이가 날 수 있습니다. 본인 케이스의 정확한 금액은 사내 HR 시스템 명세서를 참고하세요.",
  },
  {
    question: "성과급 받으면 어떻게 절세할 수 있나요?",
    answer:
      "성과급 자체의 세율은 낮출 수 없지만 환급액을 키우는 방법은 있습니다. (1) IRP·연금저축 추가 납입 (연 900만원 한도, 연봉 5,500만 이하 16.5% / 초과 13.2% 세액공제 → 최대 148.5만원 환급), (2) 우리사주조합 출연 (연 400만원 한도 비과세 + 시가차익 분리과세), (3) 의료비·교육비·기부금 세액공제 극대화, (4) 고향사랑기부 (10만원까지 100% 세액공제). 성과급 입금 직후 IRP에 1년치 한도를 채우는 게 가장 효과 큽니다.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "영업이익 입력",
    text:
      "회사 연간 영업이익(조원)을 입력합니다. 분기 영업이익이면 4배 환산. 디폴트 350조는 예시값이며 실제 발표치로 조정 가능.",
  },
  {
    name: "사업부 인원·가중치 확인",
    text:
      "메모리/공통/파운드리·시스템LSI의 인원과 사업부 가중치를 확인. 회사 정책에 따라 조정 가능. 적자 사업부는 가중치 0으로 두면 사업부 분배에서 제외.",
  },
  {
    name: "사업부별 1인당 평균 확인",
    text:
      "부문(40%) + 사업부(60%) 분배 결과로 메모리·공통·파운드리 사업부별 1인당 평균 성과급이 자동 산출됩니다.",
  },
  {
    name: "내 연봉으로 본인 케이스 계산",
    text:
      "본인 연봉을 입력하고 소속 사업부를 선택하면 본인 케이스의 세전·세후 성과급이 산출됩니다. 평균 직원 연봉 8,000만원 기준 비례 모델.",
  },
  {
    name: "다년도 RSU 매도 시뮬",
    text:
      "연도별 1인당 성과급·주식 비중·풀린 비율·주가를 입력. 누적 매도 가능 주식이 합산되고, 기준 매도가 입력 시 통합 매도 시 가치가 산출됩니다.",
  },
];

// ─────────────────────────────────────────────────────────────
// SEO Metadata — 키워드 폭넓게
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = buildToolMetadata({
  name: "삼성전자 성과급 계산기",
  tagline: "영업이익 10.5% × 부문/사업부 분배 + 다년도 RSU 매도 시뮬",
  description:
    "삼성전자 성과급 계산기 — 회사 영업이익 기반 사업부별 1인당 성과급을 즉시 계산. 메모리·공통·파운드리·시스템LSI 사업부별 부문 40% 균등 + 사업부 60% 가중 분배, 본인 연봉별 세전·세후 실수령, 다년도 RSU 매도 제한·자사주 누적 매도 시뮬레이션과 SK하이닉스 비교까지. 2026 노사합의 영업이익 10.5% 재원·4:6 분배 기준.",
  path: "/calc/samsung-bonus",
  keywords: [
    // 핵심
    "삼성전자 성과급",
    "삼성전자 성과급 계산기",
    "삼성전자 성과급 시뮬레이터",
    "삼성 성과급",
    "삼성 성과급 계산",
    "삼성전자 보너스",
    "삼성 보너스 계산",
    // OPI 관련
    "삼성 OPI",
    "삼성전자 OPI",
    "OPI 계산기",
    "삼성 OPI 계산",
    "초과이익성과금",
    // 영업이익/분배
    "삼성 영업이익 10.5%",
    "삼성 성과급 분배",
    "삼성 1인당 성과급",
    "삼성 부문 사업부",
    "사업부 영업이익",
    // 사업부
    "삼성 메모리 성과급",
    "메모리 사업부 성과급",
    "삼성 파운드리 성과급",
    "삼성 시스템LSI 성과급",
    "DS 부문 성과급",
    // RSU/주식
    "삼성전자 RSU",
    "삼성 RSU 매도",
    "삼성전자 자사주",
    "RSU 매도 제한",
    "삼성 주식 보상",
    "양도제한조건부주식",
    // 세금
    "성과급 세금",
    "성과급 세후",
    "성과급 실수령",
    "삼성 성과급 세금",
    // 비교
    "SK하이닉스 성과급",
    "SK하이닉스 PS",
    "반도체 성과급",
    // 연도
    "삼성 성과급 2026",
    "2026 삼성전자 성과급",
    "삼성 임금협상 2026",
    // 액션
    "삼성 보너스 얼마",
    "삼성 1월 성과급",
    "삼성 OPI 얼마",
  ],
});

// ─────────────────────────────────────────────────────────────
// 사업부 시나리오 데이터 (SEO 본문 보강)
// ─────────────────────────────────────────────────────────────

const DIVISION_SCENARIOS = [
  {
    name: "메모리",
    profitLow: "5~10조",
    profitHigh: "20~30조 (호황기)",
    perPersonRange: "4,000~10,000만원",
    color: "#0145F2",
    note:
      "HBM·D램·NAND 슈퍼사이클 진입 시 1인당 평균 6,000~10,000만원. 본 모델의 부문(40%) + 사업부 가중 1.0 풀 기준.",
  },
  {
    name: "공통 (스태프·연구소)",
    profitLow: "—",
    profitHigh: "DS 평균에 준함",
    perPersonRange: "3,000~7,000만원",
    color: "#F59E0B",
    note:
      "특정 사업부에 속하지 않는 인력. 본 계산기 디폴트 가중치 0.7(평균 70%) 적용.",
  },
  {
    name: "파운드리·시스템LSI",
    profitLow: "적자",
    profitHigh: "1~3조",
    perPersonRange: "1,500~2,500만원",
    color: "#EF4444",
    note:
      "적자 시 사업부 가중치 0 → 부문 분배분만 수령. TSMC 격차·수율 개선에 따라 가중치 회복 여지.",
  },
];

const RSU_SCHEDULE_EXAMPLES = [
  {
    title: "표준 4년 vest (회의록 흔한 형식)",
    desc: "받은 해 0% → 1년차 25% → 2년차 50% → 3년차 75% → 4년차 100%",
  },
  {
    title: "Cliff 1년 + 3년 균등",
    desc: "1년차까지 0% (cliff) → 2년차 33% → 3년차 67% → 4년차 100%",
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
            description:
              "삼성전자 영업이익 기반 사업부별 1인당 성과급을 계산하고, 본인 연봉별 세전·세후 실수령 + 다년도 RSU 매도 시뮬레이션까지 제공합니다.",
            url: "/calc/samsung-bonus",
          }),
          autoBreadcrumbLd("/calc/samsung-bonus", {
            leafName: "삼성전자 성과급 계산기",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "삼성전자 성과급 계산하는 방법",
            description:
              "영업이익 입력부터 본인 연봉별 세후 실수령, 다년도 RSU 매도 시뮬까지 5단계로 진행합니다.",
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
              <Sparkles size={12} /> Samsung 성과급 시뮬레이터
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
              2026 노사합의 영업이익 <strong className="text-navy dark:text-canvas-50">10.5%</strong>{" "}
              재원·<strong className="text-navy dark:text-canvas-50">4:6</strong> 분배 기준.
              메모리·공통·파운드리 1인당 평균 + 본인 연봉별 세전·세후 + 다년도
              RSU 매도 시뮬까지 한 번에.
            </p>
          </header>

          <SamsungBonusClient />

          <InArticleAd />

          {/* 사업부별 시나리오 — SEO 본문 보강 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              사업부별 1인당 성과급 시나리오
            </h2>
            <p className="text-sm text-muted-blue dark:text-canvas-300 mb-5 leading-relaxed">
              삼성전자 DS(반도체) 부문은 메모리·공통·파운드리·시스템LSI 세 갈래로
              구성되며, 사업부별 영업이익 기여도에 따라 1인당 성과급이 크게
              달라집니다. 아래는 공개 보도와 본 계산기 디폴트 가정에 기반한 시나리오
              레인지입니다.
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
                  <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                    <div>
                      <p className="text-faint-blue mb-0.5">영업이익 범위</p>
                      <p className="text-muted-blue">
                        {s.profitLow} ~ {s.profitHigh}
                      </p>
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
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5 flex items-center gap-2">
              <Coins className="w-6 h-6 text-electric" />
              다년도 RSU 매도 시뮬 — 어떻게 작동하나
            </h2>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
              <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                삼성전자가 임직원에게 지급하는 RSU(Restricted Stock Unit,
                양도제한조건부주식)는 매년 받은 단위마다 별도 베스팅 일정을 따릅니다.
                회의록상 매년 풀리는 비율이 다르게 명시되어 있어, 본 계산기는 사용자가
                각 연도별 풀림 비율을 자유롭게 입력하고 누적 매도 가능 주식·통합 매도가
                기준 가치를 한 번에 비교할 수 있도록 설계했습니다.
              </p>
              <div className="space-y-3 text-sm">
                <Step
                  num="1"
                  title="그 해 1인당 성과급"
                  desc='위 시뮬레이터의 결과를 가져오거나 직접 입력. "메모리 1인당으로 채우기" 버튼으로 일괄 적용 가능.'
                />
                <Step
                  num="2"
                  title="주식 비중 (%)"
                  desc="성과급 중 RSU(주식 보상)로 받는 비중. 디폴트 30%."
                />
                <Step
                  num="3"
                  title="풀린 비율 (%) — 회의록 매도 제한 해제"
                  desc="그 해 받은 RSU 중 현재 시점에 매도 가능한 누적 비율. 회의록상 매년 다르게 풀리는 정책을 그대로 입력하세요. 예) 가장 오래된 RSU는 100%, 작년 RSU는 25%."
                  highlight
                />
                <Step
                  num="4"
                  title="그 해 주가 (원)"
                  desc="RSU 받은 시점의 주가. RSU 주식 수 = 가치 ÷ 그 해 주가."
                />
                <Step
                  num="="
                  title="누적 매도 가능 × 기준 매도가"
                  desc="모든 연도의 매도 가능 주식을 합산하고, 하단의 기준 매도가에 일괄 매도한다고 가정한 총 가치를 산출. 주가 시나리오를 빠르게 비교할 수 있습니다."
                />
              </div>
            </div>
          </section>

          {/* Vesting 일정 예시 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
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
              ※ 실제 삼성전자 RSU 일정은 회의록 별도 명시. 위 예시는 일반적 형태이며,
              본 계산기에서 매년 풀림 % 값을 직접 입력해 정확히 반영하세요.
            </p>
          </section>

          {/* 분배 모델 단계별 설명 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              분배 모델 — 어떻게 계산되나
            </h2>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
              <Step
                num="1"
                title="총 재원 산정"
                desc="영업이익(조원) × 10.5% (고정). 예) 350조 × 10.5% = 36.75조원."
              />
              <Step
                num="2"
                title="부문 40% : 사업부 60% 분할 (고정)"
                desc="총 재원의 40%는 부문 풀(전체 인원 균등), 60%는 사업부 풀(인원×가중치 분배). 예) 36.75조 = 부문 14.7조 + 사업부 22.05조."
              />
              <Step
                num="3"
                title="부문 1인당 (균등 분배)"
                desc="부문 재원 ÷ 전체 인원. 어느 사업부 소속이든 동일 금액. 예) 14.7조 ÷ 77,300명 ≈ 1,902만원."
              />
              <Step
                num="4"
                title="사업부 1인당 (가중치 분배)"
                desc="사업부 재원 × (본인 비율) ÷ Σ(인원×비율). 본인 사업부 비율 0이면 사업부 분배 0. 비율 1.0이면 표준."
                mono
              />
              <Step
                num="="
                title="최종 1인당 = 부문 + 사업부"
                desc="세전 평균. 실수령은 세금·4대보험 공제 후 약 65~70%. '내 연봉으로 계산' 섹션에서 본인 케이스 세후 자동 산출."
              />
            </div>
          </section>

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              영업이익 10.5% 고정 — 그 의미
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              2026년 노사 합의 회의록에 명시된 '성과급 재원 = 영업이익 10.5%'는
              회사 전체 영업이익 중 일정 비율을 임직원 성과급 풀로 떼어내겠다는
              약속입니다. 이전에는 OPI 상한이 기본급 50%로 제한되었지만,
              영업이익 직접 연동 방식이 도입되면서 호황기에는 풀이 폭발적으로
              커지는 구조가 만들어졌습니다. 예를 들어 영업이익 350조 시점에서는
              총 재원이 36.75조에 이르며, 이는 직원 7만명 기준 1인당 평균 5억원
              수준이 됩니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              부문 4 : 사업부 6 — 분배 균형
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              부문 분배는 회사 전체 인원에게 균등 지급하는 방식으로, 어느 사업부
              소속이든 동일 금액을 받습니다. 사업부 분배는 사업부별 가중치(영업이익
              기여도 반영)에 따라 차등 지급됩니다. 4:6 비율은 부문 안전망(균등)을
              유지하면서도 사업부 성과 차이가 보상에 반영되도록 한 균형점입니다.
            </p>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              이 비율의 의미: 메모리 호황기에 1인당 6.5억을 받았다면, 그 중 약
              2.6억은 부문(균등), 나머지 3.9억은 사업부(가중) 분배입니다. 따라서
              파운드리·시스템LSI가 적자라도 부문 2.6억 정도는 안정적으로 받게 되는
              구조입니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              세후 실수령 환산 — 세금 28~38%
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              성과급은 별도 분리과세가 아닌 근로소득 합산 누진세율(6~45%) 적용 대상.
              세후는 다음과 같이 줄어듭니다:
            </p>
            <ul className="space-y-1 text-muted-blue dark:text-canvas-300 leading-relaxed">
              <li>• 소득세 (누진세율) — 평균 25~30%</li>
              <li>• 지방소득세 (소득세의 10%) — 평균 2.5~3%</li>
              <li>• 국민연금 (4.5%, 보수월액 상한 ~7,404만원)</li>
              <li>• 건강보험 (3.545%) + 장기요양 (건강보험의 12.95%)</li>
              <li>• 고용보험 (0.9%)</li>
              <li>• <strong>합산 실효세율 ≈ 28~38%</strong></li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              세전 6,500만원 → 세후 약 4,200~4,700만원 / 세전 1억 → 세후 약 6,500~7,000만원
              / 세전 6.5억 → 세후 약 4억 수준. 본 계산기의 '내 연봉으로 계산' 섹션이
              자동으로 산출해드립니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              주식(RSU) 매도 제한과 누적 매도 전략
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              성과급 중 일부는 현금이 아닌 RSU(양도제한조건부주식)로 지급됩니다.
              RSU는 받은 시점에 즉시 매도할 수 없고, 회의록상 매년 풀리는 비율이
              점진적으로 늘어나는 베스팅 구조입니다. 일반적인 4년 vest는 받은 해 0%,
              1년차 25%, 2년차 50%, 3년차 75%, 4년차 100% 형태입니다.
            </p>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              다년간 누적된 RSU를 한 번에 매도하면 단가 변동에 매우 민감해집니다.
              본 계산기의 다년도 RSU 시뮬은 연도별 주가 변동과 매도 제한 해제 일정을
              동시에 시뮬레이션할 수 있어, 매도 시점 결정에 참고가 됩니다.
            </p>
          </article>

          {/* 경고 */}
          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle
              size={20}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1"
            />
            <div>
              <p className="font-black text-amber-900 dark:text-amber-200 mb-1">
                참고용 시뮬레이션입니다
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                본 계산기는 공개된 노사 합의 보도, 사업보고서, 일반적인 영업이익 분배
                모델 기반 추정 시뮬레이터입니다. 실제 지급은 본인 사업부의 영업이익,
                평가 등급, 호봉, 기본급 비율에 따라 달라지며 ±20~30% 차이가 날 수
                있습니다. 본인 케이스 정확한 금액은 사내 HR 시스템 명세서 확인.
              </p>
            </div>
          </div>

          {/* 관련 페이지 CTA */}
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
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </section>

          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />

          {/* FAQ */}
          <section className="mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
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
            />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 2026년 공개 노사 합의 보도와 영업이익 기반 성과급 분배 모델
              추정치이며 참고용입니다. 영업이익 10.5% 재원·부문 사업부 4:6 비율은
              회의록 기반 고정값, 사업부 인원과 가중치는 사용자 조정 가능. 실수령은
              본인 호봉·평가에 따라 다릅니다.
            </p>
          </div>

          <div className="mt-8 mb-8">
            <ShareButtons
              title="삼성전자 성과급 계산기 — 영업이익 → 사업부 1인당 + 다년도 RSU 매도"
              description="영업이익 10.5%, 부문/사업부 4:6 분배, 본인 연봉별 세전·세후, 다년도 RSU 매도 시뮬까지."
            />
          </div>

          <RelatedCalculators currentPath="/calc/samsung-bonus" />
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

// 사용하지 않는 import 경고 회피 (Sparkles는 Hero에서 사용)
void Calculator;
void TrendingUp;
