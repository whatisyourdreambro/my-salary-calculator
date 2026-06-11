// src/app/salary-raise-2026/page.tsx
//
// 연봉 인상·협상 시뮬레이터.
// 키워드: "연봉 인상", "연봉 협상", "인상률 계산", "이직 인상률", "월급 인상"

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
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";
import SalaryRaiseClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/salary-raise-2026";
const PAGE_TITLE = "연봉 인상 협상 시뮬레이터 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "연봉 인상 협상 시뮬레이터 — 현재 연봉과 인상률을 입력하면 인상 후 세전·세후 실수령액, 월 실수령 차이, 5년 누적 효과까지 즉시 계산. 임금협상·승진·이직 시 인상률 의사결정에 활용하세요.";

const FAQ_ITEMS = [
  {
    question: "연봉 인상률은 보통 얼마인가요?",
    answer:
      "업계 평균 연 임금협상은 3~6% 수준입니다. 우수 평가·승진 시 7~12%, 이직 시 보통 10~20%, 시니어 핵심인재 또는 역할 변경 시 30%+가 일반적입니다. 2026년 삼성전자·SK하이닉스 등 반도체 대기업은 평균 6.5% 안팎으로 알려져 있습니다.",
  },
  {
    question: "10% 인상하면 실제로 월급은 얼마나 늘어나나요?",
    answer:
      "현재 연봉 5,000만원 + 10% 인상 = 5,500만원 기준 세후 연 실수령은 약 350~390만원 증가, 월 약 29~32만원 늘어납니다. 누진세 구간 진입 정도에 따라 다르며, 본 계산기에서 정확한 본인 케이스를 시뮬레이션할 수 있습니다.",
  },
  {
    question: "이직과 내부 승진 중 어떤 게 유리한가요?",
    answer:
      "단순 인상률만 보면 이직이 평균 10~20%로 내부 승진(7~12%)보다 높습니다. 다만 이직은 (1) 적응 비용, (2) 스톡옵션·RSU 베스팅 손실, (3) 사내 신뢰자산 리셋 등 비용이 있습니다. 5년 누적 차이로 보면 단기 +15% 이직 vs 매년 +8% 내부 승진이 비슷한 경우도 많아, 본 계산기로 시나리오 비교 후 의사결정 권장합니다.",
  },
  {
    question: "5년 누적 차이는 어떻게 계산되나요?",
    answer:
      "이번 인상률이 매년 동일하게 유지된다고 가정한 5년치 세후 누적 차이입니다. 예) 연봉 5,000만원 + 매년 10% 인상 5년차 = 8,053만원 (vs 무인상 5,000만원 유지). 세후 차이는 인상 구간이 35% 누진세율 진입 여부에 따라 달라집니다. 실제로는 매년 인상률이 다르므로 보수적 추정으로 활용하세요.",
  },
  {
    question: "연봉 협상 전에 준비할 것은?",
    answer:
      "(1) 객관적 시장가 자료 — 동종업계·동급 연차 평균 연봉 (회사별 연봉 DB 활용), (2) 본인 성과 정량 자료 — 매출 기여/프로젝트 성과 수치화, (3) 협상 BATNA — 대안 옵션 (다른 회사 오퍼) 확보, (4) 인상 후 실수령 시뮬 — 본 계산기로 본인 목표 인상률의 가치 검증. 협상은 감정이 아닌 데이터로.",
  },
  {
    question: "협상 시 인상률 vs 인상액 어느 쪽으로 요청해야 하나요?",
    answer:
      "회사가 인상 예산을 '%로 책정'하는 경우가 많아 인상률(%) 기반 요청이 일반적입니다. 다만 본인 목표가 명확하면 인상액(원)으로 요청하는 게 회사 입장에서 거절하기 어렵습니다. 예) '12% 인상' 대신 '연 600만원 인상 = 월 50만원' 식으로 구체화하면 협상 효과 증가.",
  },
  {
    question: "연봉 인상 후 세금이 얼마나 더 빠지나요?",
    answer:
      "누진세율 구간 진입 여부가 핵심입니다. 연봉 5,000만→5,500만 인상은 15% 구간 내라 세금 부담이 적지만, 8,800만→9,500만은 24%→35% 구간 진입으로 추가 인상분의 35%+ 가 세금으로 빠집니다. 본 계산기의 '실수령 유지율' 지표로 인상액 중 본인 몫이 얼마인지 즉시 확인 가능합니다.",
  },
  {
    question: "신입 1년차에 이직해도 되나요?",
    answer:
      "단순 연봉만 보면 1년차 이직 인상률이 가장 높을 수 있지만(15~25%), 신입 1년차는 (1) 경력 축적, (2) 사내 네트워크, (3) 첫 직장 평판 측면에서 손실이 큽니다. 일반적으로 2~3년 경력 후 이직이 시장가 인정 + 협상력 균형점입니다. 본인 케이스에 따라 본 계산기로 5년 누적 효과를 따져보세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "현재 연봉 입력",
    text: "현재 세전 연봉을 입력합니다. 본봉 + 고정 수당 합계 기준.",
  },
  {
    name: "인상률 선택",
    text: "협상·승진·이직 등 시나리오에 맞는 인상률(%)을 슬라이더나 빠른선택 칩으로 설정. 3%(임금협상)/10%(승진)/15%(이직)/20%+(핵심인재) 등.",
  },
  {
    name: "세후 차이 확인",
    text: "월 실수령 차이, 세후 연 실수령 차이, 실수령 유지율(인상액 중 본인 몫)을 즉시 확인.",
  },
  {
    name: "5년 누적 효과 분석",
    text: "이번 인상률이 5년간 유지된다고 가정한 누적 세후 추가 수령액 확인. 의사결정 기준으로 활용.",
  },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "연봉 인상",
    "연봉 인상률",
    "연봉 협상",
    "연봉 협상 시뮬레이터",
    "연봉 인상 계산기",
    "임금협상 인상률",
    "이직 인상률",
    "이직 연봉",
    "승진 연봉",
    "내 연봉 적정",
    "연봉 협상 가이드",
    "연봉 5년 누적",
    "인상 후 실수령",
    "월급 인상 계산",
    "연봉 협상 전략",
    "직장인 연봉 협상",
    "신입 연봉 협상",
    "경력 이직 연봉",
    "스카웃 인상률",
    "BATNA 협상",
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
          "연봉 인상 협상 시뮬레이터"
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
  },
};

const SCENARIOS = [
  {
    title: "연 임금협상 (+3~6%)",
    desc: "일반적 연 임금협상. 물가 상승률·회사 실적·산업 평균 반영. 누적 차이는 작지만 안정적.",
    color: "#A8B9D6",
  },
  {
    title: "우수 평가·승진 (+7~12%)",
    desc: "상위 평가 또는 직급 승진. 인사평가 등급 EX/VG, 책임/수석 진급 시점.",
    color: "#0145F2",
  },
  {
    title: "이직 (+10~20%)",
    desc: "동급 직군 이직. 시장가 재책정. 단, 적응 비용·RSU 베스팅 손실 고려.",
    color: "#7C83FF",
  },
  {
    title: "핵심인재 스카웃 (+20~40%)",
    desc: "역할 상향·시니어 스카웃·전문 영역 이동. 회사 입장에서 즉시 가치 창출 기대.",
    color: "#10B981",
  },
];

const CHECKLIST = [
  "동종업계·동급 연차 평균 연봉 확인 (회사 연봉 DB 활용)",
  "본인 성과 정량 자료 정리 (매출 기여·프로젝트 KPI)",
  "BATNA 확보 (다른 회사 오퍼·헤드헌터 컨택)",
  "목표 인상률의 세후 실수령 시뮬레이션 (본 계산기)",
  "인상 후 5년 누적 차이 = 자산 형성 영향 가늠",
  "협상 시 인상액(원) vs 인상률(%) 표현 선택",
  "복지·휴가·재택 등 비현금 옵션도 협상 카드로",
  "감정이 아닌 데이터로 — 사전 시나리오 정리",
];

export default function SalaryRaisePage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "연봉 인상 협상 시뮬레이터",
            description: PAGE_DESC,
            url: PAGE_PATH,
          }),
          autoBreadcrumbLd(PAGE_PATH, {
            leafName: "연봉 인상 협상 시뮬레이터",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "연봉 인상 협상하는 방법",
            description:
              "현재 연봉과 인상률 입력 → 세후 실수령 차이·5년 누적 효과·협상 체크리스트까지 4단계.",
            steps: HOW_TO_STEPS,
            totalTime: "PT2M",
          }),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} aria-hidden /> Salary Raise 2026
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50"
              style={{ letterSpacing: "-0.04em" }}
            >
              연봉 인상 협상 시뮬레이터
            </h1>
            <p className="text-base sm:text-lg font-medium text-muted-blue dark:text-canvas-300">
              현재 연봉 + 인상률 →{" "}
              <strong className="text-electric">
                세전·세후 실수령 + 5년 누적
              </strong>
            </p>
            <p className="text-sm text-faint-blue mt-3 max-w-md mx-auto leading-relaxed">
              임금협상·승진·이직·스카웃 시나리오별 인상률의 진짜 가치를 즉시
              계산하세요. 누진세율·4대보험 반영, 5년 누적 차이까지.
            </p>
          </header>

          <HomeTopAd />

          <SalaryRaiseClient />

          <InArticleAd />

          {/* 시나리오별 인상률 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              시나리오별 일반적 인상률
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl bg-white dark:bg-canvas-900 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderLeft: `4px solid ${s.color}` }}
                >
                  <p
                    className="font-black mb-2"
                    style={{ color: s.color }}
                  >
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 협상 체크리스트 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              연봉 협상 전 체크리스트 8가지
            </h2>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
              <ol className="space-y-3 text-sm">
                {CHECKLIST.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-electric-10 flex items-center justify-center font-black text-electric text-xs">
                      {i + 1}
                    </div>
                    <span className="text-muted-blue dark:text-canvas-300 leading-relaxed pt-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              인상률 % vs 세후 실수령 — 누진세의 함정
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              연봉 인상의 진짜 가치는 인상률(%)이 아니라 세후 실수령액 차이로
              봐야 합니다. 누진세율 구간을 넘어가는 인상은 추가분의 24%, 35%,
              38%, 40%, 42%가 세금으로 빠지므로 인상률 대비 실수령 증가는 줄어듭니다.
              본 계산기의 "실수령 유지율" 지표는 인상액 중 실제 본인이 가져가는
              비율을 보여줍니다. 예) 24% 구간 내 인상은 유지율 70~75%, 35% 구간
              진입 후 인상은 60~65% 수준입니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              5년 누적 — 자산 형성 결정적 차이
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              매년 인상률 차이는 단기로 작아 보이지만 5년 누적 차이는
              주택 매수, 자녀 교육비, 은퇴 자산 형성에 결정적 영향을 줍니다.
              연봉 5,000만 기준 매년 5% 인상 vs 매년 10% 인상은 5년 누적 세후
              차이가 약 1,200만원에 달합니다. 본 계산기에서 본인 인상률 시나리오의
              5년 효과를 정량 확인하세요.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              이직 vs 내부 승진 — 의사결정 프레임
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              이직은 평균 +10~20% 인상으로 단기 임팩트가 크지만, (1) 적응 비용
              (3~6개월 생산성 저하), (2) RSU·스톡옵션 베스팅 손실, (3) 사내
              신뢰자산 리셋 등 비용이 있습니다. 내부 승진은 매년 +7~12%지만
              누적될 경우 5년 후 격차가 줄어드는 경우가 많습니다. 이직 결정 전
              본 계산기로 이직 시 +15% vs 내부 +8% 매년 시나리오를 5년 누적으로
              비교해 의사결정 근거를 확보하세요.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              협상 스크립트 — 데이터로 말하기
            </h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300 leading-relaxed">
              <li>
                ❌ <strong>피하기</strong>: &quot;물가도 오르고 힘들어서요...&quot; →
                감정 요청, 약함
              </li>
              <li>
                ✅ <strong>권장</strong>: &quot;동종업계 동급 평균 연봉이 X만원,
                제 성과 기여가 Y(구체 수치)였으므로 Z% 인상이 적정 시장가
                입니다.&quot; → 데이터 + BATNA
              </li>
              <li>
                ✅ <strong>구체화</strong>: &quot;12% 인상&quot; 대신 &quot;연 600만원 인상
                = 월 50만원&quot;으로 구체적 숫자 제시.
              </li>
              <li>
                ✅ <strong>비현금 옵션</strong>: 인상률이 막히면 휴가 +3일, 재택 +1일,
                교육비 지원, RSU 추가 베스팅 등 비현금 옵션으로 가치 확보.
              </li>
            </ul>
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
                세후 계산은 누진세율 + 4대보험 + 세액공제 20% 가정 기반 추정치.
                실제 금액은 부양가족, 의료비·기부 등 세액공제 활용도, 회사
                비과세 항목에 따라 다를 수 있습니다. 5년 누적은 매년 동일 인상률
                유지 가정.
              </p>
            </div>
          </div>

          {/* 관련 페이지 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            <Link
              href="/salary-db"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                협상 자료
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                회사별 연봉 DB
              </p>
              <p className="text-xs text-muted-blue mb-3">
                480+ 기업 신입~시니어 평균 연봉 비교
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                동급 평균 확인{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                실수령 계산
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                연봉 실수령액 계산기
              </p>
              <p className="text-xs text-muted-blue mb-3">
                인상 후 월급·세금·4대보험 정확 계산
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                계산하기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/career-stages-2026"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                연차별 분석
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                직장인 단계별 평균 연봉
              </p>
              <p className="text-xs text-muted-blue mb-3">
                20~50대 연차별 평균 연봉·자산
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                연차별 보기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/guides/salary-negotiation-real-scripts-2026"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                실전 가이드
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                협상 스크립트 가이드
              </p>
              <p className="text-xs text-muted-blue mb-3">
                실제 사례 +18% 인상 스크립트
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                스크립트 보기{" "}
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
              aria-hidden
            />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 시뮬레이터는 누진세율·4대보험 기반 추정치이며 참고용입니다.
              세액공제율 20% 가정 디폴트, 5년 누적은 매년 동일 인상률 유지 가정.
              실제 인상은 회사·산업·평가에 따라 달라집니다.
            </p>
          </div>

          <div className="mt-8 mb-8">
            <ShareButtons
              title={PAGE_TITLE}
              description="연봉 인상 협상 시뮬레이터 — 세전·세후 + 5년 누적 효과"
            />
          </div>

          <RelatedCalculators currentPath={PAGE_PATH} />
        </div>
      </main>

      {/* 사용 안 함 회피 */}
      <span className="hidden" aria-hidden>
        <TrendingUp />
      </span>
    </>
  );
}
