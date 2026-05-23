﻿"use client";

import dynamic from "next/dynamic";
import {
 Calculator,
 ArrowRight,
 PiggyBank,
 Briefcase,
 Globe,
 FileText,
 GitCompare,
 Receipt,
 TrendingUp,
 Zap,
 Shield,
 BarChart3,
 Sparkles,
 BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import ToolCard from "@/components/home/ToolCard";
import TrafficEnginesNav from "@/components/home/TrafficEnginesNav";
import { HomeTopAd, CalcResultAd, InArticleAd } from "@/components/AdPlacement";
import NextActions from "@/components/NextActions";
import JsonLd from "@/components/JsonLd";
import { faqLd, howToLd } from "@/lib/structuredData";

const CalculatorTabs = dynamic(
 () => import("@/components/CalculatorTabs"),
 {
 ssr: false,
 loading: () => (
 <div
 style={{
 width: "100%",
 height: "12rem",
 display: "flex",
 justifyContent: "center",
 alignItems: "center",
 }}
 >
 <div
 style={{
 width: "36px",
 height: "36px",
 border: "3px solid #DDE4EC",
 borderTop: "3px solid #0145F2",
 borderRadius: "999px",
 animation: "spin 0.7s linear infinite",
 }}
 />
 </div>
 ),
 }
);

const LoanCalculator = dynamic(
 () => import("@/components/LoanCalculator"),
 { ssr: false }
);
const DepositCalculator = dynamic(
 () => import("@/components/DepositCalculator"),
 { ssr: false }
);
const ExtraFinancialCalculators = dynamic(
 () => import("@/components/ExtraFinancialCalculators"),
 { ssr: false }
);
const CoupangBanner = dynamic(
 () => import("@/components/CoupangBanner"),
 { ssr: false }
);
const SocialProof = dynamic(
 () => import("@/components/SocialProof"),
 { ssr: false }
);
const SeasonalBanner = dynamic(
 () => import("@/components/SeasonalBanner"),
 { ssr: false }
);
const FeaturedGuides = dynamic(
 () => import("@/components/FeaturedGuides"),
 { ssr: false }
);
const HeroBadge = dynamic(
 () => import("@/components/HeroBadge"),
 { ssr: false, loading: () => <span>2026년 세법 완벽 반영</span> }
);
const GuideCategories = dynamic(
 () => import("@/components/GuideCategories"),
 { ssr: false }
);

/* ── ToolCard 분리됨 → src/components/home/ToolCard.tsx ──────── */

/* ── Stats Bar ─────────────────────────────────────────────────── */
const stats = [
 { value: "2026", label: "세법 즉시 반영" },
 { value: "100+", label: "금융 계산기" },
 { value: "5초", label: "실시간 계산" },
];

/* ── Home Page Structured Data ─────────────────────────────────── */
const HOME_FAQ = faqLd([
 {
  question: "연봉 계산기로 무엇을 계산할 수 있나요?",
  answer:
   "2026년 최신 세법 기준으로 연봉 실수령액, 4대보험(국민연금·건강보험·고용보험·장기요양보험), 소득세, 지방소득세를 즉시 계산할 수 있습니다. 퇴직금, 연말정산 환급액, 주택담보대출 한도까지 100가지 이상의 금융 계산기를 완전 무료로 제공합니다.",
 },
 {
  question: "연봉 실수령액과 세후 월급은 어떻게 다른가요?",
  answer:
   "연봉 실수령액은 세금·4대보험을 모두 공제한 연간 총 수령액이고, 세후 월급은 이를 12로 나눈 월별 금액입니다. 예를 들어 연봉 5,000만원이면 2026년 세율 기준 월 실수령액은 약 366만원입니다.",
 },
 {
  question: "4대보험 요율은 얼마인가요?",
  answer:
   "2026년 기준 근로자 부담 4대보험 요율: 국민연금 4.5%, 건강보험 3.545%, 장기요양보험(건강보험료의 12.95%), 고용보험 0.9%입니다. 회사가 동일하거나 더 높은 비율을 추가로 부담합니다.",
 },
 {
  question: "머니샐러리 연봉 계산기는 얼마나 정확한가요?",
  answer:
   "국세청 소득세법, 국민연금법, 건강보험법, 고용보험법에 근거한 2026년 공식 요율을 사용합니다. 계산 결과는 참고용이며 개인별 공제 항목에 따라 실제 세액과 차이가 있을 수 있습니다.",
 },
 {
  question: "연봉 3000만원 실수령액은 얼마인가요?",
  answer:
   "연봉 3,000만원 기준(비과세 식대 20만원, 본인 1인 공제) 2026년 월 실수령액은 약 228만원입니다. 자세한 내역은 머니샐러리 /salary/30000000 페이지에서 확인하세요.",
 },
]);

const HOME_HOWTO = howToLd({
 name: "연봉 실수령액 계산하는 방법 (2026년)",
 description:
  "머니샐러리에서 2026년 최신 세법 기준 연봉 실수령액을 단계별로 계산합니다.",
 totalTime: "PT1M",
 steps: [
  {
   name: "연봉 입력",
   text: "연봉 계산기에 세전 연봉(예: 5,000만원)을 입력하세요.",
  },
  {
   name: "개인 공제 설정",
   text: "부양가족 수, 비과세 식대(기본 20만원), 추가 공제 항목을 선택하세요.",
  },
  {
   name: "결과 확인",
   text:
    "월 실수령액, 국민연금·건강보험·고용보험·소득세 세부 내역이 즉시 표시됩니다.",
  },
 ],
});

/* ── Homepage ──────────────────────────────────────────────────── */
export default function HomePage() {
 const scrollToCalculator = () => {
 document.getElementById("calculator-section")?.scrollIntoView({
 behavior: "smooth",
 });
 };

 return (
 <>
 <JsonLd data={[HOME_FAQ, HOME_HOWTO]} />
 <div className="w-full overflow-x-hidden">

 {/* ═══ Hero ════════════════════════════════════════════════ */}
 <section className="hero-section relative overflow-hidden bg-canvas px-6 pt-20 pb-12 flex flex-col items-center justify-center">
 {/* BG decoration — 모바일 친화: viewport 추종 */}
 <div
 style={{
 position: "absolute",
 top: 0,
 left: "50%",
 transform: "translateX(-50%)",
 width: "min(700px, 90vw)",
 height: "min(500px, 60vw)",
 borderRadius: "999px",
 background: "radial-gradient(circle, #0145F211 0%, transparent 70%)",
 pointerEvents: "none",
 zIndex: 0,
 }}
 />

 <motion.div
 initial={{ opacity: 0, y: 28 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
 className="text-center max-w-[760px] w-full relative z-10"
 >
 {/* Badge */}
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: 0.15 }}
 className="duotone-badge"
 style={{ marginBottom: "2rem", display: "inline-flex" }}
 >
 <span style={{ position: "relative", display: "flex", width: "8px", height: "8px" }}>
 <span
 style={{
 position: "absolute",
 inset: 0,
 borderRadius: "999px",
 backgroundColor: "#0145F2",
 opacity: 0.6,
 animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
 }}
 />
 <span
 style={{
 position: "relative",
 display: "inline-flex",
 borderRadius: "999px",
 width: "8px",
 height: "8px",
 backgroundColor: "#0145F2",
 }}
 />
 </span>
 <HeroBadge />
 </motion.div>

 {/* H1 */}
 <h1 className="font-black text-[clamp(2.2rem,6vw,4.5rem)] tracking-[-0.045em] leading-[1.08] text-navy mb-5">
 내 연봉의 모든 것,
 <br />
 <span className="text-electric">가장 쉽고 정확하게.</span>
 </h1>

 {/* Subheading — 구체 수치로 신뢰도↑ */}
 <p className="max-w-[560px] mx-auto mb-3 text-[clamp(1rem,2vw,1.2rem)] text-muted-blue font-medium leading-[1.65]">
 4대보험·소득세·연말정산·퇴직금까지.
 <br />
 2026 세법 기준, 5초 만에 정확하게.
 </p>
 <p className="max-w-[560px] mx-auto mb-10 text-sm text-faint-blue font-medium">
 예) 연봉 5,000만원 → 월 실수령 약 357만원 · 연 4,290만원
 </p>

 {/* CTA Buttons */}
 <div className="flex flex-wrap justify-center gap-3">
 <button
 onClick={scrollToCalculator}
 className="btn-primary text-base px-8 py-3.5"
 >
 <Zap className="w-[18px] h-[18px]" aria-hidden="true" />
 내 연봉 실수령액 5초 계산
 </button>
 <Link
 href="/salary-db"
 className="btn-secondary text-[15px] px-6 py-3.5"
 >
 회사별 연봉 비교
 <ArrowRight className="w-[15px] h-[15px]" aria-hidden="true" />
 </Link>
 </div>

 {/* Stats */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="mt-[clamp(2rem,5vw,4rem)] flex flex-wrap justify-center py-6 border-y border-canvas-200"
 style={{ columnGap: "clamp(1.25rem, 4vw, 3rem)", rowGap: "1rem" }}
 >
 {stats.map((stat, i) => (
 <div key={i} className="text-center">
 <p className="text-[clamp(1.4rem,3vw,2rem)] font-black text-electric tracking-[-0.04em] mb-0.5">
 {stat.value}
 </p>
 <p className="text-[11.5px] font-bold text-faint-blue tracking-[0.04em] uppercase">
 {stat.label}
 </p>
 </div>
 ))}
 </motion.div>
 </motion.div>
 </section>

 {/* ═══ 광고 (홈 상단) — Hero 직하, above-fold 노출 ═════════ */}
 <div className="page-width">
 <HomeTopAd />
 </div>

 {/* ═══ Trust signals — E-E-A-T strengthen ══════════════════ */}
 <SocialProof />

 {/* ═══ 시즌 배너 — 현재 월 자동 인식 ════════════════════════ */}
 <div className="py-8 bg-canvas">
 <SeasonalBanner />
 </div>

 {/* ═══ Calculator Section ══════════════════════════════════ */}
 <section id="calculator-section" className="page-width section-lg">
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-80px" }}
 transition={{ duration: 0.5 }}
 >
 <CalculatorTabs />
 </motion.div>

 {/* 계산기 결과 직하 — 사용자 의도 가장 높음 */}
 <div className="mt-10 max-w-3xl mx-auto">
 <CalcResultAd />
 <NextActions />
 </div>
 </section>

 {/* ═══ Premium Tools Grid ══════════════════════════════════ */}
 <section
 className="section-lg"
 style={{
 backgroundColor: "#EDF1F5",
 borderTop: "1px solid #DDE4EC",
 }}
 >
 <div className="page-width">
 <div style={{ marginBottom: "2.5rem" }}>
 <p
 className="duotone-badge"
 style={{
 display: "inline-flex",
 marginBottom: "1rem",
 }}
 >
 <Sparkles style={{ width: "12px", height: "12px" }} />
 Premium Tools
 </p>
 <h2
 style={{
 fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
 fontWeight: 900,
 color: "#0A1829",
 letterSpacing: "-0.035em",
 marginBottom: "0.5rem",
 }}
 >
 프리미엄 금융 도구
 </h2>
 <p style={{ color: "#3D5E78", fontSize: "15px", fontWeight: 500 }}>
 당신의 재정 건강을 위한 필수 도구들
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 <ToolCard
 icon={Calculator}
 title="정규직 계산기"
 description="2026년 최신 세율 · 실수령액 정확 계산"
 href="/?tab=salary"
 delay={0}
 badge="인기"
 />
 <ToolCard
 icon={PiggyBank}
 title="퇴직금 계산기"
 description="예상 퇴직금과 IRP 절세 효과 분석"
 href="/?tab=severance"
 delay={0.05}
 />
 <ToolCard
 icon={Briefcase}
 title="알바/프리랜서"
 description="3.3% 공제 및 주휴수당 계산"
 href="/?tab=freelancer"
 delay={0.1}
 />
 <ToolCard
 icon={Globe}
 title="환율 영향"
 description="내 연봉의 글로벌 구매력 비교"
 href="/?tab=exchange"
 delay={0.15}
 />
 <ToolCard
 icon={FileText}
 title="연말정산 설계"
 description="13월의 월급을 위한 필승 시뮬레이션"
 href="/year-end-tax"
 delay={0.2}
 badge="HOT"
 />
 <ToolCard
 icon={Receipt}
 title="급여명세서"
 description="나만의 급여 명세서 생성"
 href="/fun/salary-slip"
 delay={0.25}
 />
 <ToolCard
 icon={TrendingUp}
 title="미래 연봉 예측"
 description="커리어 성장 곡선과 은퇴 목표 분석"
 href="/?tab=future"
 delay={0.3}
 />
 <ToolCard
 icon={GitCompare}
 title="기업 오퍼 비교"
 description="두 회사의 시급·복지 정밀 비교"
 href="/company/compare"
 delay={0.35}
 />
 <ToolCard
 icon={BarChart3}
 title="연봉 순위"
 description="전국 소득 분포에서 내 위치 확인"
 href="/?tab=rank"
 delay={0.4}
 />
 <ToolCard
 icon={Shield}
 title="종합 계산기 허브"
 description="30+ 금융 계산기 한곳에 모아보기"
 href="/tools"
 delay={0.45}
 />
 </div>
 </div>
 </section>

 {/* ═══ Traffic Engines Nav — 회사·직업·산업·지역별 연봉 진입 ═══
     사이트 유입의 대부분이 "{회사}/{직업}/{지역} 연봉" 검색이므로,
     홈에서 4개 허브로 직접 보내는 진입로를 Premium Tools 직후에 배치. */}
 <TrafficEnginesNav />

 {/* ═══ Coupang Partners Banner — 섹션 구분 자리 ══════════════ */}
 <section
 className="section-sm"
 style={{
 backgroundColor: "#FFFFFF",
 borderTop: "1px solid #DDE4EC",
 }}
 >
 <div className="page-width">
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 </div>
 </section>

 {/* ═══ Loan & Deposit Section ══════════════════════════════ */}
 <section
 className="section-lg"
 style={{
 backgroundColor: "#FFFFFF",
 borderTop: "1px solid #DDE4EC",
 }}
 >
 <div className="page-width">
 <div style={{ marginBottom: "2.5rem" }}>
 <p
 className="duotone-badge"
 style={{ display: "inline-flex", marginBottom: "1rem" }}
 >
 Financial Tools
 </p>
 <h2
 style={{
 fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
 fontWeight: 900,
 color: "#0A1829",
 letterSpacing: "-0.035em",
 marginBottom: "0.5rem",
 }}
 >
 대출 &amp; 예적금
 </h2>
 <p style={{ color: "#3D5E78", fontSize: "15px", fontWeight: 500 }}>
 스마트한 레버리지와 자산 불리기
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div>
 <h3 className="text-[15px] font-bold text-navy mb-3 flex items-center gap-2">
 <span className="inline-block w-[5px] h-5 rounded-full bg-electric" aria-hidden="true" />
 대출 이자 계산기
 </h3>
 <div className="duotone-card p-5">
 <LoanCalculator />
 </div>
 </div>
 <div>
 <h3 className="text-[15px] font-bold text-navy mb-3 flex items-center gap-2">
 <span className="inline-block w-[5px] h-5 rounded-full bg-electric opacity-50" aria-hidden="true" />
 적금 이자 계산기
 </h3>
 <div className="duotone-card p-5">
 <DepositCalculator />
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ═══ Featured Guides — 인기 가이드 4개 cross-link ════════ */}
 <FeaturedGuides />

 {/* ═══ Guide Categories — 카테고리별 진입 ══════════════════ */}
 <GuideCategories />

 {/* ═══ Guide CTA ═══════════════════════════════════════════ */}
 <section
 className="section-lg"
 style={{
 backgroundColor: "#EDF1F5",
 borderTop: "1px solid #DDE4EC",
 textAlign: "center",
 }}
 >
 <div className="page-width">
 <div
 style={{
 width: "56px",
 height: "56px",
 borderRadius: "16px",
 backgroundColor: "#0145F21A",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 margin: "0 auto 1.5rem",
 border: "1.5px solid #0145F233",
 }}
 >
 <BookOpen style={{ width: "26px", height: "26px", color: "#0145F2" }} />
 </div>
 <h2
 style={{
 fontSize: "clamp(1.375rem, 3vw, 2rem)",
 fontWeight: 900,
 color: "#0A1829",
 letterSpacing: "-0.035em",
 marginBottom: "0.75rem",
 }}
 >
 금융 지식 가이드
 </h2>
 <p
 style={{
 color: "#3D5E78",
 marginBottom: "2.5rem",
 maxWidth: "420px",
 margin: "0 auto 2.5rem",
 fontSize: "15px",
 fontWeight: 500,
 }}
 >
 직장인이 꼭 알아야 할 세금, 투자, 절세 꿀팁을 무료로 제공합니다
 </p>
 <Link
 href="/guides"
 className="btn-primary"
 style={{ fontSize: "15.5px", padding: "14px 36px", display: "inline-flex" }}
 >
 가이드 전체 보기
 <ArrowRight style={{ width: "16px", height: "16px" }} />
 </Link>
 </div>
 </section>

 {/* ═══ 마지막 광고 ═════════════════════════════════════════ */}
 <section className="bg-white border-t border-canvas-200 section-pad">
 <div className="max-w-3xl mx-auto px-6">
 <InArticleAd />
 </div>
 </section>

 </div>
 </>
 );
}
