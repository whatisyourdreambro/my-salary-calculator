// src/app/calc/samsung-bonus/page.tsx
//
// 삼성전자 OPI·TAI 성과급 계산기.
// 키워드: "삼성전자 성과급 계산", "OPI 계산", "TAI 계산", "삼성 보너스"

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
import { Sparkles, Info, AlertTriangle, ArrowRight, Users } from "lucide-react";
import SamsungBonusClient from "./Client";

// DS 부문 인원 (2025 사업보고서 기준)
const DS_HEADCOUNT = [
  {
    name: "메모리",
    count: 26_226,
    color: "#0145F2",
    note: "HBM·D램·NAND. OPI 상한 50%에 근접하는 호황 사례 다수.",
  },
  {
    name: "파운드리 + 시스템LSI",
    count: 20_356,
    color: "#7B92FF",
    note: "TSMC와의 격차·적자 누적 영향. OPI 10%대 머무는 해 많음.",
  },
  {
    name: "공통 (스태프·연구소·DSR)",
    count: 28_178,
    color: "#A8B9D6",
    note: "특정 사업부에 속하지 않는 인력. DS 전체 평균에 준해 지급.",
  },
];
const DS_TOTAL = DS_HEADCOUNT.reduce((s, d) => s + d.count, 0);

const FAQ_ITEMS = [
  {
    question: "DS 부문 사업부별 인원은 어떻게 되나요?",
    answer:
      "2025년 사업보고서 기준 DS 부문 총원은 약 74,760명입니다. 사업부별로는 메모리 26,226명(35.1%), 파운드리(FDRY)+시스템LSI 20,356명(27.2%), 공통(스태프·연구소·DSR 등) 28,178명(37.7%)으로 구성됩니다. 같은 DS 부문이라도 메모리/파운드리 영업이익이 달라 OPI 지급률은 사업부별로 분리 산정됩니다. 공통 인력은 통상 DS 전체 평균에 준해 지급되는 경우가 많습니다.",
  },
  {
    question: "삼성전자 OPI와 TAI는 어떻게 다른가요?",
    answer:
      "OPI(Operating Profit Incentive, 초과이익성과금)는 사업부 영업이익이 목표를 초과하면 연 1회(보통 1월) 지급되며 기본급의 최대 50%까지 받을 수 있습니다. TAI(Target Achievement Incentive, 목표달성장려금)는 반기 KPI 평가에 따라 연 2회(1월·7월) 지급되며 월 기본급의 0~100%까지 차등 지급됩니다. 같은 사업부 안에서도 평가 등급에 따라 금액이 달라집니다.",
  },
  {
    question: "연봉 8천만원이면 기본급은 얼마로 잡나요?",
    answer:
      "삼성전자 기본급은 통상 연봉의 65~70% 수준입니다. 본 계산기는 67%로 기본 가정하므로 연봉 8천만원이면 연 기본급 약 5,360만원, 월 기본급 약 447만원입니다. 따라서 OPI 50% 지급 시 약 2,680만원(세전), TAI 100%를 연 2회 받으면 약 894만원(세전)이 추가됩니다. 본인의 명세서상 기본급으로 더 정확하게 환산할 수 있습니다.",
  },
  {
    question: "성과급 받을 때 세금이 왜 그렇게 많이 빠지나요?",
    answer:
      "성과급은 별도 분리과세가 아니라 근로소득에 합산되어 누진세율(6~45%)이 적용됩니다. 연봉 8천만원 구간은 24% 한계세율이지만 성과급이 더해지면서 35% 구간까지 진입하는 경우가 많고, 여기에 지방소득세 10%와 4대보험(국민연금·건강·고용·장기요양)이 추가됩니다. 일반적으로 성과급 실효세율은 28~38% 수준입니다.",
  },
  {
    question: "2026년 사업부별 OPI는 어느 정도가 예상되나요?",
    answer:
      "공식 발표 전이라 확정은 아니지만, 2024~2025 흐름을 보면 DS 메모리는 HBM·고용량 D램 슈퍼사이클로 상한(50%)에 근접할 가능성이 높고, MX는 갤럭시 플래그십 호조로 35% 안팎, VD/DA·Harman은 20% 내외, 파운드리·시스템LSI는 10% 초중반대가 컨센서스입니다. 본 계산기의 사업부 프리셋이 이 추정치를 반영합니다.",
  },
  {
    question: "성과급 세금을 줄일 수 있는 방법이 있나요?",
    answer:
      "성과급 자체의 세율을 낮출 수는 없지만 환급액을 키울 수 있는 방법은 있습니다. (1) IRP/연금저축 추가 납입(연 900만원 한도, 13.2~16.5% 세액공제), (2) 우리사주조합 출연(연 400만원 한도 비과세), (3) 의료비·교육비·기부금 공제 극대화, (4) 고향사랑기부(10만원까지 100% 세액공제) 등입니다. 성과급 수령 직후 IRP에 1년치 한도를 채워두는 게 가장 효과 큽니다.",
  },
  {
    question: "OPI·TAI 외에 다른 성과급도 있나요?",
    answer:
      "있습니다. (1) 임금협상 결과에 따른 1월 1일자 소급분(잠정합의 시점까지의 누적 인상분 일시 지급), (2) 명절선물비·휴양시설·자기개발비 등 복지성 지원, (3) 자사주 보상(임원·핵심인재 한정), (4) 신규 채용 사이닝 보너스 등이 있습니다. 본 계산기는 통상적인 OPI+TAI 두 축만 다루며, 소급분은 별도 계산이 필요합니다.",
  },
  {
    question: "노조원만 받는 성과급도 있나요?",
    answer:
      "삼성전자 노조 가입률은 약 25% 수준이며, 단체협약상 성과급 지급 기준은 비조합원에도 사실상 동일하게 적용됩니다. 다만 노사 합의로 신설되는 일부 복지(휴양시설 지원, 자기개발비 등)는 합의 적용 범위가 쟁점이 되기도 합니다. 본인 사업부와 직군의 정확한 적용 범위는 사내 HR 시스템에서 확인하시기 바랍니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "삼성전자 성과급 계산기",
  tagline: "OPI · TAI · 연봉 8천 사례까지 세후 실수령 즉시",
  description:
    "삼성전자 OPI(초과이익성과금)와 TAI(목표달성장려금) 세후 실수령을 사업부·평가등급별로 계산합니다. 연봉 8000만원 기준 메모리·파운드리·MX 사례부터 절세 팁까지, 2026년 임금협상 합의 기준으로 정확히.",
  path: "/calc/samsung-bonus",
  keywords: [
    "삼성전자 성과급",
    "삼성전자 성과급 계산기",
    "OPI 계산",
    "TAI 계산",
    "삼성 보너스",
    "삼성전자 OPI",
    "삼성전자 TAI",
    "삼성 연봉 8000",
    "초과이익성과금",
    "목표달성장려금",
    "삼성전자 성과급 세금",
  ],
});

const SCENARIOS = [
  {
    title: "DS 메모리 (HBM 호황) · GD 평가",
    detail:
      "OPI 50% + TAI 100/100. 호황기 기준 모범 사례 — 연봉의 50% 안팎이 추가로 들어옵니다.",
    bonus: "약 3,574만원 (세전)",
    net: "약 2,365만원 (세후)",
  },
  {
    title: "MX 모바일 · VG 평가",
    detail:
      "OPI 35% + TAI 75/100. 갤럭시 플래그십 견조 + 우수 평가 1.1배 가중.",
    bonus: "약 2,724만원 (세전)",
    net: "약 1,820만원 (세후)",
  },
  {
    title: "DS 파운드리 · GD 평가",
    detail:
      "OPI 12% + TAI 50/50. 적자 누적 영향. 임금협상 인상 소급분으로 보전.",
    bonus: "약 1,015만원 (세전)",
    net: "약 720만원 (세후)",
  },
  {
    title: "VD·DA 가전 · GD 평가",
    detail:
      "OPI 22% + TAI 50/75. 프리미엄 TV·가전 비중에 따라 변동.",
    bonus: "약 1,645만원 (세전)",
    net: "약 1,140만원 (세후)",
  },
];

const TAX_TIPS = [
  {
    title: "IRP·연금저축에 즉시 입금",
    body:
      "성과급 1월 입금 직후 연 900만원 한도까지 IRP·연금저축에 넣으면 최대 148.5만원 환급. 자동이체 설정해두면 무의식 절세.",
  },
  {
    title: "우리사주 출연으로 비과세",
    body:
      "삼성전자 우리사주조합 출연금은 연 400만원까지 비과세 + 시가 차익 분리과세. 단, 1년 보호예수.",
  },
  {
    title: "가족 의료비·교육비 영수증 정리",
    body:
      "성과급으로 한계세율이 상승한 해는 의료비·교육비 세액공제 효과가 큼. 연말정산 간소화 자료 사전 확인.",
  },
  {
    title: "고향사랑기부 활용",
    body:
      "연 500만원까지 가능. 10만원까지는 전액 세액공제 + 답례품. 성과급 받은 해는 더 적극 활용.",
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
              "삼성전자 OPI·TAI 성과급의 세후 실수령액을 사업부·평가등급별로 계산합니다.",
            url: "/calc/samsung-bonus",
          }),
          autoBreadcrumbLd("/calc/samsung-bonus", {
            leafName: "삼성전자 성과급 계산기",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} /> 2026 임금협상 합의 반영
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50"
              style={{ letterSpacing: "-0.04em" }}
            >
              삼성전자 성과급 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              <strong className="text-electric">OPI + TAI</strong> 사업부·평가
              등급별 세후 실수령
            </p>
            <p className="text-sm text-faint-blue mt-3 max-w-xl mx-auto leading-relaxed">
              연봉 8천만원 기준 사례부터 임원·책임·수석까지. 메모리·파운드리·MX
              사업부 프리셋과 EX/VG/GD 평가 가중치까지 한 번에.
            </p>
          </header>

          <SamsungBonusClient />

          <InArticleAd />

          {/* 시나리오 박스 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              연봉 8천만원 기준 — 사업부별 사례 비교
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5"
                >
                  <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-2">
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-blue mb-3 leading-relaxed">
                    {s.detail}
                  </p>
                  <p className="text-lg font-black text-electric">{s.net}</p>
                  <p className="text-xs text-faint-blue mt-1">{s.bonus}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-faint-blue mt-3">
              ※ 위 수치는 본 계산기의 기본 가정(기본급 = 연봉×67%, 4대보험 일반
              부과, 세액공제 30% 가정)에 따른 추정. 실제 명세서와 차이가 있을
              수 있습니다.
            </p>
          </section>

          {/* DS 부문 인원 구조 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-3 flex items-center gap-2">
              <Users className="w-6 h-6 text-electric" />
              DS 부문 사업부별 인원 구조
            </h2>
            <p className="text-sm text-muted-blue dark:text-canvas-300 mb-5 leading-relaxed">
              같은 DS 부문 안에서도 메모리와 파운드리는 영업이익이 달라
              OPI 지급률이 분리 산정됩니다. 본인이 속한 인력 풀의 비중을
              먼저 파악하면 성과급 협상·이직 의사결정의 베이스라인이
              잡힙니다.
            </p>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
              <div className="flex items-end justify-between mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-faint-blue">
                  DS 부문 총원
                </p>
                <p className="text-2xl font-black text-navy dark:text-canvas-50 tabular-nums">
                  {DS_TOTAL.toLocaleString("ko-KR")}명
                </p>
              </div>
              {/* Stacked Bar */}
              <div className="flex h-5 rounded-full overflow-hidden bg-canvas-100 dark:bg-canvas-800 mb-1">
                {DS_HEADCOUNT.map((d) => {
                  const pct = (d.count / DS_TOTAL) * 100;
                  return (
                    <div
                      key={d.name}
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: d.color,
                      }}
                      title={`${d.name} ${d.count.toLocaleString("ko-KR")}명 (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-faint-blue mb-5 tabular-nums">
                {DS_HEADCOUNT.map((d) => (
                  <span
                    key={d.name}
                    style={{
                      width: `${(d.count / DS_TOTAL) * 100}%`,
                      textAlign: "center",
                    }}
                  >
                    {((d.count / DS_TOTAL) * 100).toFixed(1)}%
                  </span>
                ))}
              </div>

              {/* Detail cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DS_HEADCOUNT.map((d) => (
                  <div
                    key={d.name}
                    className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      backgroundColor: d.color + "0F",
                      borderLeft: `4px solid ${d.color}`,
                    }}
                  >
                    <p className="text-xs font-black text-navy dark:text-canvas-50 mb-1">
                      {d.name}
                    </p>
                    <p
                      className="text-2xl font-black tabular-nums"
                      style={{ color: d.color }}
                    >
                      {d.count.toLocaleString("ko-KR")}
                      <span className="text-sm font-bold ml-1">명</span>
                    </p>
                    <p className="text-[11px] text-muted-blue mt-2 leading-relaxed">
                      {d.note}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-faint-blue mt-4 leading-relaxed">
                ※ 2025년 사업보고서·언론 보도 기반 추정. DSR(연구소), DSP
                등 일부 조직은 "공통"으로 집계되며 분기마다 인원 이동이
                있습니다.
              </p>
            </div>
          </section>

          {/* OPI vs TAI 설명 */}
          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              OPI vs TAI, 구조부터 정확히
            </h2>

            <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 p-5 bg-white dark:bg-canvas-900">
                <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                  OPI · 초과이익성과금
                </p>
                <ul className="space-y-2 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                  <li>• <strong>지급 시기:</strong> 연 1회 (보통 1월 말)</li>
                  <li>• <strong>산정 기준:</strong> 사업부 영업이익 목표 초과분</li>
                  <li>• <strong>한도:</strong> 기본급의 50% (사업부 차등)</li>
                  <li>• <strong>변동성:</strong> 크다 — 호황 50%, 불황 0%도 가능</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 p-5 bg-white dark:bg-canvas-900">
                <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                  TAI · 목표달성장려금
                </p>
                <ul className="space-y-2 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                  <li>• <strong>지급 시기:</strong> 반기 2회 (1월·7월)</li>
                  <li>• <strong>산정 기준:</strong> 부서·개인 KPI 반기 평가</li>
                  <li>• <strong>한도:</strong> 월 기본급의 100% (반기당)</li>
                  <li>• <strong>변동성:</strong> 중간 — 0/25/50/75/100% 등급</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              인사평가 등급이 성과급에 미치는 영향
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              같은 사업부에서도 평가 등급에 따라 성과급이 달라집니다. 본
              계산기는 다음 가중치를 적용합니다.
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
                      성과급 가중치
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
              왜 성과급은 실효세율이 30%를 넘기 쉬울까
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              연봉 8천만원 본봉만 받을 때는 한계세율이 24% 구간(과세표준 5천만~
              8천8백만)에 머무릅니다. 그런데 OPI·TAI로 연 3천만원이 추가되면
              과세표준이 35% 구간(8천8백만~1억5천만)에 진입하면서 추가분의 세금
              부담이 크게 늘어납니다. 여기에 지방소득세 10%, 국민연금
              상한선까지의 4.5%, 건강보험 3.545% + 장기요양 0.46%, 고용보험
              0.9%가 더해져 실효세율 30%를 쉽게 넘깁니다.
            </p>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              연봉이 1억을 넘는 책임·수석급은 OPI/TAI 합산 시 38% 구간(1억5천만
              ~3억) 일부까지 들어가므로 세금 부담이 더 크고, 그만큼 IRP·연금저축
              ·우리사주 한도 활용의 절세 효과가 커집니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              성과급 받고 바로 해야 할 4가지 절세 액션
            </h2>
            <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {TAX_TIPS.map((tip, i) => (
                <div
                  key={tip.title}
                  className="rounded-2xl border border-canvas-200 dark:border-canvas-800 p-5 bg-white dark:bg-canvas-900"
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
                <strong>평균 인상률 6.5%</strong> = 기본인상 4.0% + 성과인상률
                2.5%
              </li>
              <li>
                <strong>가족수당·휴양시설·자기개발비·명절선물비</strong> 복지
                항목 확대 합의
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
            <p className="text-xs text-faint-blue mt-3">
              ※ 본 계산기는 OPI/TAI 두 축만 다룹니다. 임금협상 소급분은 별도
              계산이며, 본인 명세서의 1월 분 차액으로 환산 가능합니다.
            </p>
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
                본 계산기는 공개된 정보와 통상적 운영 관행을 바탕으로 한 추정
                계산이며, 본인 사업부의 실제 OPI·TAI 지급률, 기본급 비중,
                평가등급별 차등 폭과 차이가 있을 수 있습니다. 정확한 금액은
                삼성전자 사내 HR 시스템의 본인 명세서를 확인하세요.
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
              본 계산기는 2026년 소득세법과 삼성전자 공개 자료 기준 추정치이며
              참고용입니다. 실제 지급은 본인 사업부의 영업이익, 평가 등급, 기본급
              비중에 따라 달라집니다. 본인 명세서를 함께 확인하세요.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/samsung-bonus" />
        </div>
      </main>
    </>
  );
}
