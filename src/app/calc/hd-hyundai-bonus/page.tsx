// src/app/calc/hd-hyundai-bonus/page.tsx
//
// HD현대중공업 성과급 계산기 — 조선업 슈퍼사이클.
// 2025 연말 통합 HD현대중공업 600%대 / HD현대삼호 837% 실 지급.
// 2026 노조 요구: 영업이익 30% 성과배분 (영업이익 2조 기준 1인당 7,000만+).

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
import { Ship, AlertTriangle, Info } from "lucide-react";
import HdHyundaiBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/hd-hyundai-bonus";
const PAGE_TITLE = "HD현대중공업 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "HD현대중공업 성과급 계산기. 조선업 슈퍼사이클 호황 기준 본인 기본급만 입력하면 세전·세후 실수령액이 즉시. 2025 연말 600% + HD현대삼호 837% 실 지급 + 2026 노조 영업이익 30% 요구안 시나리오 비교.";

const FAQ_ITEMS = [
  {
    question: "HD현대중공업 성과급은 어떻게 결정되나요?",
    answer:
      "HD현대중공업 성과급은 매년 임단협 결과와 사업부 영업이익 연동으로 결정됩니다. 2025년 연말에는 통합 HD현대중공업이 600%대, HD현대삼호중공업이 837%를 지급했습니다. 2026년에는 노조가 영업이익의 최소 30%를 조합원(8,000명)에 배분하라고 요구 중이며, 작년 영업이익 약 2조 기준 1인당 7,000만원이 넘는 수준입니다.",
  },
  {
    question: "왜 조선업 성과급이 갑자기 폭증한 건가요?",
    answer:
      "2022~2024년 글로벌 LNG·VLCC·컨테이너선 발주 폭증으로 조선업이 슈퍼사이클에 진입했습니다. HD현대중공업은 세계 1위 조선소로 수주잔량이 4~5년치를 채워 영업이익이 2024년 2조원 수준까지 회복했습니다. SK하이닉스가 쏘아 올린 성과급 논쟁이 조선·정유·중공업으로 확산되며 노조 요구도 강해졌습니다.",
  },
  {
    question: "HD현대삼호중공업과 HD현대중공업 성과급 차이는?",
    answer:
      "두 회사는 같은 HD현대 그룹 산하지만 별도 법인입니다. 2025년 연말 HD현대삼호중공업이 837%를 지급해 통합 HD현대중공업(600%대)보다 더 많은 비율을 받았습니다. 이는 사업부별 영업이익과 노사 협상 결과 차이입니다. 본 계산기는 HD현대중공업 기준이지만 HD현대삼호 시나리오(837%)도 선택 가능합니다.",
  },
  {
    question: "2026년 노조 요구안 영업이익 30%는 얼마인가요?",
    answer:
      "2025년 영업이익 약 2조원 기준 30% = 6,000억원이 성과급 풀이 됩니다. 조합원 8,000여명에 단순 분배하면 1인당 약 7,500만원이지만, 사측이 그대로 수용할 가능성은 낮고 협상 결과는 보통 요구안의 30~50% 수준에서 타결됩니다. 본 계산기에 '노조 요구안' 시나리오로 비교 가능합니다.",
  },
  {
    question: "기본급은 어떻게 정의하나요?",
    answer:
      "HD현대중공업 임단협의 '기본급'은 월 통상임금(기본급+직무수당 등 매월 정기 지급 항목)입니다. 2026년 노조는 호봉승급분 3만 5천원 제외 14만 9,600원 인상을 요구 중입니다. 본인의 정확한 기본급은 급여명세서 '기본급/통상임금' 항목 확인.",
  },
  {
    question: "세금은 어떻게 계산되나요?",
    answer:
      "성과급은 근로소득에 합산되어 누진세율(6~45%) + 지방세(소득세의 10%) + 4대보험이 부과됩니다. 본 계산기는 marginal 방식(연봉만 vs 연봉+성과급 합산 세금 차이)으로 정확하게 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 2025년 연말 실 지급 사례(아주경제·ZDNet) + 2026년 노조 요구안 공개 보도(이투데이·뉴스핌·국민일보) 기반 추정 모델입니다. 실제 지급은 직군·근속·평가에 따라 ±10% 차이 가능. 2026년 최종 합의안은 미확정.",
  },
];

const HOW_TO_STEPS = [
  { name: "시나리오 선택", text: "평년(400%)/최근 600%/HD삼호 837%/노조 요구안 중 선택." },
  { name: "본인 월 기본급 입력", text: "월 통상임금 입력. 보통 350~600만원 범위." },
  { name: "결과 확인", text: "기본급 × 시나리오 % = 세전 성과급 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산." },
  { name: "다년도 비교", text: "여러 시나리오로 호황·평년 모두 시뮬레이션." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "HD현대중공업 성과급",
    "현대중공업 성과급",
    "HD현대 성과급 계산기",
    "HD현대중공업 임단협",
    "조선업 성과급",
    "HD현대중공업 보너스",
    "HD현대삼호 성과급",
    "현대중공업 격려금",
    "HD현대중공업 2026",
    "조선 슈퍼사이클 성과급",
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

export default function HdHyundaiBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "HD현대중공업 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "HD현대중공업 성과급 계산하는 방법",
            description: "조선업 사이클 시나리오·본인 기본급으로 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Ship className="w-3.5 h-3.5" />
              조선 슈퍼사이클 · 2025 600% + HD삼호 837% 실 지급
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              HD현대중공업 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              조선업 슈퍼사이클 호황 시나리오와 본인 기본급만 입력하면{" "}
              <strong>세전·세후 실수령액</strong>이 즉시 계산됩니다. 2025
              연말 실제 지급 + 2026 노조 영업이익 30% 요구안 비교.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <HdHyundaiBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">HD현대중공업 성과급 지급 이력</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-canvas-deep">
                    <th className="py-2 px-3 text-left font-bold">시점</th>
                    <th className="py-2 px-3 text-right font-bold">지급 (월 기본급 %)</th>
                    <th className="py-2 px-3 text-left font-bold">맥락</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 px-3 font-bold">2025년 연말 (통합 HD중공업)</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-primary">600%대</td>
                    <td className="py-2 px-3 text-faint">슈퍼사이클 영업이익 회복</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 px-3 font-bold">2025년 연말 (HD현대삼호)</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-primary">837%</td>
                    <td className="py-2 px-3 text-faint">사업부별 영업이익 차등</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">2026 노조 요구</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-amber-600">~1,400%</td>
                    <td className="py-2 px-3 text-faint">영업이익 30% 분배 (2조 × 30% ÷ 8천명)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-faint mt-3">
              ※ 보도 기준. 실제 지급은 직군·근속·평가에 따라 편차.
            </p>
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
                  2025 실 지급 보도 + 2026 노조 요구안 기반 추정. 실제 지급은
                  직군·근속·평가에 따라 ±10% 차이 가능. 2026년 최종 합의 미확정.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/salary-db/hd-hyundai-heavy"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">HD현대중공업 평균 연봉·워라밸 →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 복지 전체</p>
            </Link>
            <Link
              href="/calc/samsung-bonus"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">삼성전자 성과급 →</p>
              <p className="text-sm text-faint mt-1">반도체 OPI + TAI 분배</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />
          </div>

          <RelatedCalculators currentPath={PAGE_PATH} limit={4} title="다음 계산기도 함께 보세요" />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: 2025년 12월 연말 성과급 보도(아주경제·ZDNet),
                2026년 5월 노조 요구안 (이투데이·뉴스핌·국민일보·머니데이). 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
