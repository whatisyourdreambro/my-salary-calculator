"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ArrowRight, Calculator, BookOpen } from "lucide-react";
import Link from "@/components/AppLink";
import HeroBadge from "@/components/HeroBadge";
import DeferredHomeCalculator from "@/components/home/DeferredHomeCalculator";
import { HomeTopAd, GuideMidAd, Display2Ad, MultiplexAd } from "@/components/AdPlacement";

// Primary inputs load immediately; only the two lower calculators use DeferredSection.
const CalculatorTabs = dynamic(() => import("@/components/CalculatorTabs"), {
  ssr: false,
  loading: () => <div className="flex min-h-[560px] w-full items-center justify-center" role="status">
    <span className="text-sm text-muted-foreground">계산기를 준비하고 있습니다.</span>
  </div>,
});
const CoupangBanner = dynamic(() => import("@/components/CoupangBanner"), { ssr: false });
const SeasonalBanner = dynamic(() => import("@/components/SeasonalBanner"), { ssr: false });

export default function HomeClient({ featuredGuides, socialProof, guideCategories, toolsSection, trafficEngines }: {
  featuredGuides: ReactNode; socialProof: ReactNode; guideCategories: ReactNode; toolsSection: ReactNode; trafficEngines: ReactNode;
}) {
  return <div className="w-full bg-background text-foreground">
    {/* Title, explanation and anchor are present before client hydration. */}
    <section className="border-b border-border bg-background pb-10 pt-28 sm:pb-14 sm:pt-36" aria-labelledby="home-title">
      <div className="page-width">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
          <div className="min-w-0 max-w-3xl">
            <p className="ms-eyebrow mb-5"><HeroBadge /></p>
            <h1 id="home-title" className="text-[clamp(2.125rem,5.4vw,4rem)] font-bold leading-[1.15] tracking-[-0.045em]">
              2026 연봉 계산기<br /><span className="text-link">세후 월급을 한눈에.</span>
            </h1>
            <p className="ms-description mt-5 max-w-xl">연봉과 가족 조건을 입력해 공제액과 예상 실수령액을 확인하세요. 이직과 저축 계획의 출발점을 만들어 보세요.</p>
            <nav aria-label="계산 시작" className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
              <a href="#calculator-section" className="ms-button ms-button-primary justify-center"><Calculator className="h-[18px] w-[18px]" aria-hidden="true" />내 연봉 실수령액 계산</a>
              <Link href="/salary-db" className="ms-button ms-button-secondary justify-center">회사별 연봉 비교<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </nav>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">실제 급여와 차이가 날 수 있는 참고용 계산입니다. <Link href="/about" className="font-medium text-link underline underline-offset-4">계산·데이터 기준</Link></p>
          </div>
          <ol className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-label="계산 결과 확인 순서">
            {[["01", "조건 입력", "비과세·가족 조건을 함께"], ["02", "공제 확인", "보험료와 세금의 구성"], ["03", "다음 계획", "오퍼·대출·저축 비교"]].map(([number, title, text]) => <li key={number} className="flex items-start gap-3">
              <span className="mt-0.5 text-xs font-semibold tabular-nums text-muted-foreground" aria-hidden="true">{number}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>
            </li>)}
          </ol>
        </div>
      </div>
    </section>

    {/* Existing ad order and placements are unchanged. */}
    <div className="page-width"><HomeTopAd /></div>
    {socialProof}
    <div className="bg-background py-8"><SeasonalBanner /></div>

    <section id="calculator-section" className="page-width ms-section scroll-mt-24">
      <noscript><p className="ms-panel mb-6">계산기를 사용하려면 자바스크립트를 켜 주세요. <a href="/table/2026/annual" className="font-semibold text-link underline">2026 연봉별 실수령액 표</a>는 바로 읽을 수 있습니다.</p></noscript>
      <CalculatorTabs />
      <div className="mx-auto mt-10 max-w-3xl"><Display2Ad /></div>
    </section>

    {toolsSection}
    {trafficEngines}

    <section className="section-sm border-t border-border bg-card">
      <div className="page-width"><CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} /></div>
    </section>

    <section className="ms-section border-t border-border bg-background" aria-labelledby="home-finance-heading">
      <div className="page-width">
        <div className="mb-8 max-w-2xl"><p className="ms-eyebrow">매달의 현금 흐름</p><h2 id="home-finance-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl mt-3">대출과 저축, 조건을 바꾸며 비교하세요.</h2><p className="ms-description mt-3">금리와 기간에 따른 상환액·만기 금액을 확인하세요. 실제 상품 조건은 금융기관에서 확인해야 합니다.</p></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div><h3 className="mb-3 text-base font-semibold">대출 이자 계산기</h3><div className="ms-surface p-3 sm:p-5"><DeferredHomeCalculator kind="loan" /></div></div>
          <div><h3 className="mb-3 text-base font-semibold">적금 이자 계산기</h3><div className="ms-surface p-3 sm:p-5"><DeferredHomeCalculator kind="deposit" /></div></div>
        </div>
      </div>
    </section>

    {featuredGuides}
    {guideCategories}

    <section className="ms-section border-y border-border bg-card" aria-labelledby="home-guide-heading">
      <div className="page-width flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="max-w-xl"><p className="ms-eyebrow inline-flex items-center gap-2"><BookOpen className="h-4 w-4" aria-hidden="true" />계산 다음의 이해</p><h2 id="home-guide-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl mt-3">금융 지식 가이드</h2><p className="ms-description mt-3">세금·보험·급여의 기준을 읽고 내 결과를 해석하세요. 각 글의 출처와 확인 날짜를 함께 살펴보세요.</p></div>
        <Link href="/guides" className="ms-button ms-button-secondary shrink-0">가이드 전체 보기<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </section>

    <section className="section-pad border-t border-border bg-background"><div className="mx-auto max-w-3xl px-6"><GuideMidAd /></div></section>
    <section className="section-pad bg-background"><div className="mx-auto max-w-5xl px-6"><MultiplexAd /></div></section>
  </div>;
}
