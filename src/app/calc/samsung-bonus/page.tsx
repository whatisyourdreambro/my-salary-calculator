// src/app/calc/samsung-bonus/page.tsx
//
// 삼성전자 OPI1·OPI2 성과급 계산기.
// 키워드: "삼성전자 성과급", "OPI 계산", "OPI1 OPI2", "삼성 OPI 계산기"

import type { Metadata } from "next";
import Link from "next/link";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Sparkles, Info, AlertTriangle, ArrowRight } from "lucide-react";
import SamsungBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const FAQ_ITEMS = [
  {
    question: "OPI1과 OPI2는 어떻게 다른가요?",
    answer:
      "OPI1은 기존 운영되던 초과이익성과금으로, 사업부 영업이익 목표 초과분에 따라 기본급의 최대 50%까지 지급됩니다. OPI2는 2026년 노사 합의로 신설되는 추가 풀로, 사업부 연간 영업이익의 10.5%를 재원으로 사업부 소속 인원에게 분배되는 구조입니다. 둘은 별도로 산정되어 합산 지급되며, 평가 등급에 따라 동일한 가중치가 적용됩니다.",
  },
  {
    question: "사업부 영업이익은 어디서 확인하나요?",
    answer:
      "삼성전자 분기·연간 잠정실적 발표(IR 공시)와 사업보고서에 사업부별 영업이익이 공개됩니다. DS 부문은 메모리/파운드리·시스템LSI로 세분 공시되며, DX 부문은 MX/VD·DA/Harman 등으로 구분됩니다. 본 계산기는 사업부 선택 시 최근 흐름 기반 추정 영업이익을 디폴트로 제시하고, 본인이 직접 조정할 수 있습니다.",
  },
  {
    question: "왜 영업이익이 적자인 사업부는 OPI2가 0인가요?",
    answer:
      "OPI2는 사업부 영업이익의 10.5%를 재원으로 분배하므로 영업이익이 0 이하이면 분배할 재원이 없어 OPI2가 산정되지 않습니다. 다만 OPI1은 기본급 기준이고 임금협상 인상분과 별개로 운영되므로, 적자 사업부도 OPI1과 임금 인상 소급분은 받을 수 있습니다.",
  },
  {
    question: "연봉 8천만원이면 기본급은 얼마로 잡나요?",
    answer:
      "삼성전자 기본급은 통상 연봉의 65~70% 수준입니다. 본 계산기는 기본 67%로 가정하므로 연봉 8천만원이면 연 기본급 약 5,360만원, 월 기본급 약 447만원입니다. 명세서의 정확한 본봉 비율로 슬라이더를 조정해 정밀하게 계산할 수 있습니다. OPI1은 기본급 기준이므로 이 값이 정확해야 합니다.",
  },
  {
    question: "성과급 받을 때 세금이 왜 그렇게 많이 빠지나요?",
    answer:
      "OPI는 별도 분리과세가 아니라 근로소득에 합산되어 누진세율(6~45%)이 적용됩니다. 연봉 8천만원 구간은 24% 한계세율이지만 OPI 합산 시 35% 구간까지 진입하는 경우가 많고, 여기에 지방소득세 10%와 4대보험(국민연금·건강·고용·장기요양)이 추가됩니다. 일반적으로 OPI 실효세율은 28~38% 수준입니다.",
  },
  {
    question: "OPI 세금을 줄일 수 있는 방법이 있나요?",
    answer:
      "OPI 자체의 세율을 낮출 수는 없지만 환급액을 키울 수 있는 방법은 있습니다. (1) IRP/연금저축 추가 납입(연 900만원 한도, 13.2~16.5% 세액공제), (2) 우리사주조합 출연(연 400만원 한도 비과세), (3) 의료비·교육비·기부금 공제 극대화, (4) 고향사랑기부(10만원까지 100% 세액공제) 등입니다. OPI 수령 직후 IRP에 1년치 한도를 채워두는 게 가장 효과 큽니다.",
  },
  {
    question: "OPI 외에 다른 성과급도 있나요?",
    answer:
      "있습니다. (1) 임금협상 결과에 따른 1월 1일자 소급분(잠정합의 시점까지의 누적 인상분 일시 지급), (2) 명절선물비·휴양시설·자기개발비 등 복지성 지원, (3) 자사주 보상(임원·핵심인재 한정), (4) 신규 채용 사이닝 보너스 등이 있습니다. 본 계산기는 OPI1·OPI2 두 축과 임금협상 소급분(고급 옵션)을 다룹니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "삼성전자 OPI 성과급 계산기",
  tagline: "OPI1 + OPI2 사업부별 영업이익 10.5% 풀 반영",
  description:
    "삼성전자 OPI1(기본급 50% 상한)과 OPI2(영업이익 10.5% 풀) 세후 실수령을 사업부·평가등급별로 계산합니다. 2026년 노사 합의로 신설된 OPI2 구조와 절세 팁까지.",
  path: "/calc/samsung-bonus",
  keywords: [
    "삼성전자 성과급",
    "삼성전자 OPI",
    "OPI1 OPI2",
    "삼성 성과급 계산기",
    "OPI 계산",
    "삼성 보너스",
    "초과이익성과금",
    "삼성전자 성과급 세금",
    "사업부 영업이익 10.5%",
  ],
});

const SCENARIOS = [
  {
    title: "DS 메모리 호황 · GD 평가",
    detail:
      "OPI1 50% + 영업이익 22조 기준 OPI2. HBM·D램 슈퍼사이클 모범 사례.",
    bonus: "OPI1+OPI2 합산 큰 폭",
    color: "#0145F2",
  },
  {
    title: "MX 모바일 · VG 평가",
    detail:
      "OPI1 35% + 영업이익 12조 기준. 갤럭시 플래그십 견조 + VG 가중 1.1배.",
    bonus: "OPI1 중심, OPI2 보조",
    color: "#0D5BFF",
  },
  {
    title: "DS 파운드리 · GD 평가",
    detail:
      "OPI1 12% + 영업이익 적자 → OPI2 = 0. 임금협상 인상 소급분으로 보전.",
    bonus: "OPI1만 일부, OPI2 0",
    color: "#7B92FF",
  },
  {
    title: "VD·DA 가전 · GD 평가",
    detail:
      "OPI1 22% + 영업이익 1.5조. 프리미엄 TV·가전 비중에 따라 변동.",
    bonus: "균형형 OPI",
    color: "#A8B9D6",
  },
];

const TAX_TIPS = [
  {
    title: "IRP·연금저축에 즉시 입금",
    body:
      "OPI 1월 입금 직후 연 900만원 한도까지 IRP·연금저축에 넣으면 최대 148.5만원 환급. 자동이체 설정해두면 무의식 절세.",
  },
  {
    title: "우리사주 출연으로 비과세",
    body:
      "삼성전자 우리사주조합 출연금은 연 400만원까지 비과세 + 시가 차익 분리과세. 단, 1년 보호예수.",
  },
  {
    title: "가족 의료비·교육비 영수증 정리",
    body:
      "OPI로 한계세율이 상승한 해는 의료비·교육비 세액공제 효과가 큼. 연말정산 간소화 자료 사전 확인.",
  },
  {
    title: "고향사랑기부 활용",
    body:
      "연 500만원까지 가능. 10만원까지는 전액 세액공제 + 답례품. OPI 받은 해는 더 적극 활용.",
  },
];

export default function SamsungBonusCalculatorPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "삼성전자 OPI 성과급 계산기",
            description:
              "삼성전자 OPI1·OPI2 성과급 세후 실수령을 사업부·영업이익·평가등급별로 계산합니다.",
            url: "/calc/samsung-bonus",
          }),
          autoBreadcrumbLd("/calc/samsung-bonus", {
            leafName: "삼성전자 OPI 성과급 계산기",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} /> 2026 노사합의 OPI2 신설 반영
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50"
              style={{ letterSpacing: "-0.04em" }}
            >
              삼성전자 OPI 성과급 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              <strong className="text-electric">OPI1 + OPI2</strong> 사업부 영업이익 ·
              평가등급별 세후 실수령
            </p>
            <p className="text-sm text-faint-blue mt-3 max-w-xl mx-auto leading-relaxed">
              기존 OPI1(기본급 50% 상한)에 2026년 노사 합의로 신설된 OPI2(사업부
              영업이익 10.5% 풀)까지 한 번에. 본인 연봉·사업부·영업이익·평가만
              입력하면 1월 입금 실수령액이 나옵니다.
            </p>
          </header>

          <SamsungBonusClient />

          <InArticleAd />

          {/* OPI1 vs OPI2 설명 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              OPI1 vs OPI2, 구조부터 정확히
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 p-5 bg-white dark:bg-canvas-900 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                  OPI1 (기존)
                </p>
                <ul className="space-y-2 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                  <li>
                    • <strong>산정 방식:</strong> 기본급 × OPI% × 평가가중치
                  </li>
                  <li>
                    • <strong>상한:</strong> 기본급의 50%
                  </li>
                  <li>
                    • <strong>기준:</strong> 사업부 영업이익 목표 초과분
                  </li>
                  <li>
                    • <strong>지급 시기:</strong> 연 1회 (보통 1월)
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 p-5 bg-white dark:bg-canvas-900 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs font-black uppercase tracking-widest text-navy dark:text-canvas-50 mb-2">
                  OPI2 (신규 · 2026 합의)
                </p>
                <ul className="space-y-2 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                  <li>
                    • <strong>산정 방식:</strong> 영업이익 × 10.5% ÷ 사업부 인원
                  </li>
                  <li>
                    • <strong>상한:</strong> 별도 상한 없음 (영업이익 연동)
                  </li>
                  <li>
                    • <strong>기준:</strong> 사업부 연간 영업이익 직접 연동
                  </li>
                  <li>
                    • <strong>특징:</strong> 적자 사업부는 OPI2 = 0
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-faint-blue mt-3 leading-relaxed">
              ※ OPI1과 OPI2는 별도로 산정되어 합산 지급되며, 인사평가 등급에 따라
              동일한 가중치(EX×1.2 / VG×1.1 / GD×1.0 / NI×0.5)가 적용됩니다.
            </p>
          </section>

          {/* 시나리오 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              사업부별 OPI 시나리오 (연봉 8천 기준)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl bg-white dark:bg-canvas-900 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderLeft: `4px solid ${s.color}` }}
                >
                  <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-2">
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-blue mb-3 leading-relaxed">
                    {s.detail}
                  </p>
                  <p
                    className="text-sm font-black"
                    style={{ color: s.color }}
                  >
                    {s.bonus}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-faint-blue mt-3">
              ※ 본인 사업부 영업이익·OPI1·평가등급을 위 계산기에 입력하면 정확한
              세후 금액이 즉시 산출됩니다.
            </p>
          </section>

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              인사평가 등급이 OPI에 미치는 영향
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              같은 사업부에서도 평가 등급에 따라 OPI가 달라집니다. 본 계산기는
              다음 가중치를 적용합니다.
            </p>
            <div className="not-prose overflow-x-auto rounded-2xl border border-canvas-200 dark:border-canvas-800 my-4">
              <table className="w-full text-sm bg-white dark:bg-canvas-900">
                <thead className="bg-canvas dark:bg-canvas-800">
                  <tr>
                    <th className="p-4 text-left font-bold text-navy dark:text-canvas-50">
                      평가 등급
                    </th>
                    <th className="p-4 text-left font-bold text-navy dark:text-canvas-50">
                      비율
                    </th>
                    <th className="p-4 text-left font-bold text-electric">
                      OPI 가중치
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-canvas-200 dark:border-canvas-800">
                    <td className="p-4 font-semibold">EX (최우수)</td>
                    <td className="p-4 text-muted-blue">상위 ~10%</td>
                    <td className="p-4 font-black text-electric">×1.2</td>
                  </tr>
                  <tr className="border-t border-canvas-200 dark:border-canvas-800">
                    <td className="p-4 font-semibold">VG (우수)</td>
                    <td className="p-4 text-muted-blue">상위 ~25%</td>
                    <td className="p-4 font-bold text-electric">×1.1</td>
                  </tr>
                  <tr className="border-t border-canvas-200 dark:border-canvas-800">
                    <td className="p-4 font-semibold">GD (보통)</td>
                    <td className="p-4 text-muted-blue">중위 ~55%</td>
                    <td className="p-4 font-bold text-navy dark:text-canvas-50">
                      ×1.0
                    </td>
                  </tr>
                  <tr className="border-t border-canvas-200 dark:border-canvas-800">
                    <td className="p-4 font-semibold">NI (개선필요)</td>
                    <td className="p-4 text-muted-blue">하위 ~10%</td>
                    <td className="p-4 font-bold text-rose-500">×0.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-faint-blue">
              ※ 가중치는 공식 발표 수치가 아닌 통상적 운용 관행에 기반한 본
              계산기 가정치입니다. 사업부별·연도별로 가중치 폭이 달라질 수
              있습니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              왜 OPI는 실효세율이 30%를 넘기 쉬울까
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              연봉 8천만원 본봉만 받을 때는 한계세율이 24% 구간(과세표준 5천만~
              8천8백만)에 머무릅니다. 그런데 OPI1+OPI2 합산으로 연 3천만원이 추가되면
              과세표준이 35% 구간(8천8백만~1억5천만)에 진입하면서 추가분의 세금
              부담이 크게 늘어납니다. 여기에 지방소득세 10%, 국민연금 상한선까지의
              4.5%, 건강보험 3.545% + 장기요양 0.46%, 고용보험 0.9%가 더해져 실효세율
              30%를 쉽게 넘깁니다.
            </p>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              연봉이 1억을 넘는 책임·수석급은 OPI 합산 시 38% 구간(1억5천만 ~3억)
              일부까지 들어가므로 세금 부담이 더 크고, 그만큼 IRP·연금저축·우리사주
              한도 활용의 절세 효과가 커집니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              OPI 받고 바로 해야 할 4가지 절세 액션
            </h2>
            <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {TAX_TIPS.map((tip, i) => (
                <div
                  key={tip.title}
                  className="rounded-2xl border border-canvas-200 dark:border-canvas-800 p-5 bg-white dark:bg-canvas-900 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric-10 flex items-center justify-center font-black text-electric text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-2">
                        {tip.title}
                      </p>
                      <p className="text-xs text-muted-blue leading-relaxed">
                        {tip.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              2026 임금협상 핵심 (참고)
            </h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>평균 인상률 6.5%</strong> = 기본인상 4.0% + 성과인상률 2.5%
              </li>
              <li>
                <strong>OPI2 신설</strong> — 사업부 영업이익의 10.5%를 재원으로
                추가 지급
              </li>
              <li>
                <strong>가족수당·휴양시설·자기개발비·명절선물비</strong> 복지 항목
                확대 합의
              </li>
              <li>
                <strong>본인 의료비 한도 상향</strong> — 사내 병원/제휴 의료기관
                이용 시 적용
              </li>
              <li>
                <strong>소급 적용</strong>: 잠정합의 시점에 1월 1일자 인상분을
                일시 정산해 지급
              </li>
            </ul>
          </article>

          {/* 경고 박스 */}
          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle
              size={20}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1"
            />
            <div>
              <p className="font-black text-amber-900 dark:text-amber-200 mb-1">
                참고용 계산기입니다
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                본 계산기는 공개된 노사 합의 보도와 통상적 운영 관행을 바탕으로 한
                추정 계산이며, 본인 사업부의 실제 OPI1 지급률, OPI2 분배 방식,
                기본급 비중, 평가등급별 차등 폭과 차이가 있을 수 있습니다. 정확한
                금액은 삼성전자 사내 HR 시스템의 본인 명세서를 확인하세요.
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
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group"
                >
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}
                    <span className="text-electric group-open:rotate-180 transition-transform">
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
              본 계산기는 2026년 소득세법과 삼성전자 공개 노사 합의 보도 기준
              추정치이며 참고용입니다. 실제 지급은 본인 사업부의 영업이익,
              평가 등급, 기본급 비중에 따라 달라집니다. 본인 명세서를 함께
              확인하세요.
            </p>
          </div>

          <div className="mt-8 mb-8">
            <ShareButtons
              title="삼성전자 OPI 성과급 계산기 — OPI1+OPI2 세후 실수령"
              description="2026 노사 합의 OPI2(영업이익 10.5% 풀)까지 반영한 사업부·평가등급별 세후 실수령액."
            />
          </div>

          <RelatedCalculators currentPath="/calc/samsung-bonus" />
        </div>
      </main>
    </>
  );
}
