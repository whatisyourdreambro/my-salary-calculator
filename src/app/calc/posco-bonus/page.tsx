// src/app/calc/posco-bonus/page.tsx
//
// 포스코 성과급 계산기 — 철강 사이클 PI + PS 구조.
// 직고용 대상 상여 400% + 성과급 최소 800% 사례 반영.

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
import { Factory, AlertTriangle, Info } from "lucide-react";
import PoscoBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/posco-bonus";
const PAGE_TITLE = "포스코 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "포스코 POSCO 성과급 계산기. 철강 사이클별 시나리오(적자 100% ~ 슈퍼사이클 1,000%)와 본인 기본급만 입력하면 세전·세후 실수령액이 즉시. 직고용 대상 상여 400%+성과급 800% 사례 포함.";

const FAQ_ITEMS = [
  {
    question: "포스코 성과급은 어떻게 구성되나요?",
    answer:
      "포스코 성과급은 (1) 상여금(연 정기 지급, 보통 400% 수준), (2) 경영성과급(PS, 연 1회 영업이익 연동), (3) 생산성격려금(PI, 반기별 사업장 KPI 연동) 3가지로 구성됩니다. 철강 업황(중국 수요·원료가·환율)에 따라 변동이 큰 편이며, 평균 연봉 약 1.14억원(2024 사업보고서) 기준 신입 5,783만원·시니어 1.5억+ 분포입니다.",
  },
  {
    question: "왜 철강 성과급은 사이클이 큰가요?",
    answer:
      "철강업은 (1) 중국 부동산·인프라 수요, (2) 원료(철광석·코크스) 가격, (3) 환율, (4) 미국·유럽 관세 정책에 매우 민감합니다. 2022~2023 호황기에는 영업이익 7조원 돌파, 2024~2025 다운사이클에서는 영업이익 절반 수준으로 감소했습니다. 본 계산기는 사이클별 4단계 시나리오(적자/평년/호황/슈퍼사이클)로 시뮬레이션 가능합니다.",
  },
  {
    question: "2025년 4월 직고용 대상 성과급 사례는?",
    answer:
      "2025년 4월 포스코는 협력사 직고용 로드맵에서 직고용 대상자에게 상여금 400% + 경영성과급 최소 800%를 지급한다고 발표했습니다. 본 계산기 '호황' 시나리오가 이 수준에 해당합니다. 정규직은 직고용 대상보다 더 높을 수 있으며 정확한 본인 케이스는 사내 시스템 확인.",
  },
  {
    question: "기본급은 어떻게 정의되나요?",
    answer:
      "포스코의 '기본급'은 월 통상임금(매월 정기 지급 본봉)입니다. 성과급은 기본급의 일정 % 형태로 지급되며, 본인 기본급은 급여명세서 '기본급/통상임금' 항목 확인. 본 계산기에서는 본인 기본급 입력으로 추정 연봉(기본급 × 17~18)도 자동 산출됩니다.",
  },
  {
    question: "성과급 세금은 어떻게 떼나요?",
    answer:
      "성과급은 근로소득에 합산되어 누진세율(6~45%) + 지방세(소득세의 10%) + 4대보험(국민연금 4.75%, 건강 3.595%, 장기요양·고용) 부과. 국민연금은 보수월액 상한(2026.7~2027.6 연 7,908만원) 적용. 본 계산기는 marginal 방식(연봉만 vs 연봉+성과급 합산 세금 차이)으로 정확하게 계산.",
  },
  {
    question: "포스코홀딩스와 포스코의 차이는?",
    answer:
      "포스코홀딩스는 지주회사(이차전지·수소 등 신사업 + 자회사 관리), 포스코는 철강 사업회사입니다. 본 계산기는 철강 사업회사인 '포스코' 기준이며, 포스코홀딩스 임직원은 별도 보상체계입니다. 자회사(포스코퓨처엠·포스코인터내셔널·포스코E&C 등)는 별도 임단협.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 보도(국민일보·부산일보 2025-04 직고용 발표) + 잡플래닛/인크루트 연봉 데이터 + 일반적인 철강 사업 PS·PI 모델 기반 추정입니다. 실제 지급은 사업장(포항·광양)·직군·근속·평가에 따라 ±15% 차이 가능. 정확한 본인 케이스는 사내 시스템 확인.",
  },
];

const HOW_TO_STEPS = [
  { name: "사이클 시나리오 선택", text: "적자(100%) / 평년(400%) / 호황(800%) / 슈퍼사이클(1,000%) 중 선택." },
  { name: "본인 월 기본급 입력", text: "월 통상임금 입력. 보통 350~600만원 범위." },
  { name: "결과 확인", text: "기본급 × 시나리오 % = 세전 성과급 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산." },
  { name: "다년도 비교", text: "여러 시나리오로 호황·평년 모두 시뮬레이션." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "포스코 성과급",
    "POSCO 성과급",
    "포스코 PI",
    "포스코 PS",
    "포스코 성과급 계산기",
    "철강 성과급",
    "포스코 보너스",
    "포스코 격려금",
    "포스코 성과급 2026",
    "포스코 임단협",
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

export default function PoscoBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "포스코 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "포스코 성과급 계산하는 방법",
            description: "철강 사이클 시나리오·본인 기본급으로 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Factory className="w-3.5 h-3.5" />
              직고용 대상 상여 400% + 성과급 최소 800% 사례 (2025-04)
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              포스코 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              철강 사이클별 시나리오와 본인 기본급만 입력하면{" "}
              <strong>세전·세후 실수령액</strong>이 즉시 계산됩니다.
              적자(100%)부터 슈퍼사이클(1,000%)까지 4가지 시나리오 비교.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <PoscoBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 성과급 구조 · 지급 이력 — 본문 콘텐츠 (광고 사이 배치) */}
          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="posco-structure-heading"
          >
            <h2 id="posco-structure-heading" className="text-2xl font-black mb-4">
              포스코 성과급 구조 — 상여금 · PS · PI
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">상여금</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 연 정기 지급, 보통 <strong>400%</strong> 수준</li>
                  <li>• 업황 영향이 작은 안정 항목</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">경영성과급 (PS)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 연 1회, <strong>영업이익 연동</strong></li>
                  <li>• 철강 사이클에 따라 변동 큼</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">생산성격려금 (PI)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 반기별, <strong>사업장 KPI</strong> 연동</li>
                  <li>• 포항·광양 사업장별 차등 가능</li>
                </ul>
              </article>
            </div>
            <h3 className="font-bold text-lg mb-3">철강 사이클별 성과급 시나리오 (기본급 기준)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-canvas-deep text-left">
                    <th className="py-2 pr-4 font-bold">사이클</th>
                    <th className="py-2 pr-4 font-bold">성과급 (월 기본급 기준)</th>
                    <th className="py-2 font-bold">참고</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">적자</td>
                    <td className="py-2 pr-4">100%</td>
                    <td className="py-2">다운사이클 — 영업이익 절반 수준 (2024~2025)</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">평년</td>
                    <td className="py-2 pr-4">400%</td>
                    <td className="py-2">정기 상여 수준</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">호황</td>
                    <td className="py-2 pr-4">800%</td>
                    <td className="py-2">2025-04 직고용 대상 '경영성과급 최소 800%' 사례</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">슈퍼사이클</td>
                    <td className="py-2 pr-4">1,000%</td>
                    <td className="py-2">2022~2023 영업이익 7조 돌파기 수준</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-faint mt-3">
              ※ 국민일보·부산일보 2025-04 직고용 발표 보도 기반. 실제 지급률은
              사업장·직군·평가에 따라 달라질 수 있습니다.
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
                  <p className="mt-3 text-sm leading-relaxed text-faint pl-7">{item.answer}</p>
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
                  보도(국민일보·부산일보 2025-04) + 잡플래닛·인크루트 데이터 기반 추정.
                  실제 지급은 사업장(포항·광양)·직군·근속·평가에 따라 ±15% 차이 가능.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/salary-db/posco"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">포스코 평균 연봉·워라밸 →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 복지 전체</p>
            </Link>
            <Link
              href="/calc/hd-hyundai-bonus"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">HD현대중공업 성과급 →</p>
              <p className="text-sm text-faint mt-1">조선업 슈퍼사이클 600~1,400%</p>
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
                <strong>데이터 출처</strong>: 2025-04 포스코 직고용 발표(국민일보·부산일보),
                잡플래닛·인크루트 연봉 데이터, 포스코 사업보고서. 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
