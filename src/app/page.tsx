"use client";

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
import { HomeTopAd, CalcResultAd, InArticleAd } from "@/components/AdPlacement";
import NextActions from "@/components/NextActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Stat } from "@/components/ui/Stat";

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

const websiteStructuredData = {
 "@context": "https://schema.org",
 "@type": "WebSite",
 name: "Moneysalary",
 url: "https://www.moneysalary.com",
 potentialAction: {
 "@type": "SearchAction",
 target: "https://www.moneysalary.com/salary/{search_term_string}",
 "query-input": "required name=search_term_string",
 },
};

/* ── ToolCard 분리됨 → src/components/home/ToolCard.tsx ──────── */

/* ── Stats Bar ───────────────────────────────────────────────────
 number 값은 CountUp 애니메이션, string 값은 그대로 표시.
 가짜 사용자 수는 절대 사용하지 않음 — 객관적 숫자만. */
const stats: Array<{ value: number | string; suffix?: string; label: string }> = [
 { value: 2026, suffix: "년", label: "최신 세법" },
 { value: 100, suffix: "+", label: "금융 계산기" },
 { value: "무료", label: "완전 무료" },
];

/* ── Homepage ──────────────────────────────────────────────────── */
export default function HomePage() {
 const scrollToCalculator = () => {
 document.getElementById("calculator-section")?.scrollIntoView({
 behavior: "smooth",
 });
 };

 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify(websiteStructuredData),
 }}
 />
 <div className="w-full overflow-x-hidden">

 {/* ═══ Hero ════════════════════════════════════════════════ */}
 <section
 className="hero-section"
 style={{
 position: "relative",
 display: "flex",
 flexDirection: "column",
 alignItems: "center",
 justifyContent: "center",
 backgroundColor: "#EDF1F5",
 overflow: "hidden",
 }}
 >
 {/* BG decoration */}
 <div
 style={{
 position: "absolute",
 top: 0,
 left: "50%",
 transform: "translateX(-50%)",
 width: "700px",
 height: "500px",
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
 style={{
 textAlign: "center",
 maxWidth: "760px",
 width: "100%",
 position: "relative",
 zIndex: 1,
 }}
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
 <h1
 style={{
 fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
 fontWeight: 900,
 letterSpacing: "-0.045em",
 lineHeight: 1.08,
 color: "#0A1829",
 marginBottom: "1.25rem",
 }}
 >
 내 연봉의 모든 것,
 <br />
 <span style={{ color: "#0145F2" }}>가장 쉽고 정확하게.</span>
 </h1>

 {/* Subheading */}
 <p
 style={{
 maxWidth: "520px",
 margin: "0 auto 2.5rem",
 fontSize: "clamp(1rem, 2vw, 1.2rem)",
 color: "#3D5E78",
 fontWeight: 500,
 lineHeight: 1.65,
 }}
 >
 복잡한 세금 계산부터 숨어있는 환급금까지.
 <br />
 대한민국 1등 연봉 계산기 머니샐러리.
 </p>

 {/* CTA Buttons — Toss style: 1차 채움 + 2차 채움(secondary) */}
 <div className="flex flex-wrap justify-center gap-3">
 <Button
 onClick={scrollToCalculator}
 intent="primary"
 size="lg"
 aria-label="지금 바로 계산기로 이동"
 >
 <Zap className="h-[18px] w-[18px]" aria-hidden="true" />
 지금 바로 계산하기
 </Button>
 <Link
 href="/guides"
 className="btn-secondary"
 style={{ fontSize: "15px", padding: "14px 24px" }}
 >
 금융 가이드 보기
 <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
 </Link>
 </div>

 {/* Stats — Stat 컴포넌트로 통일 */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="mt-8 md:mt-12 py-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 border-y border-canvas-200"
 >
 {stats.map((stat, i) => (
 <Stat
 key={i}
 value={stat.value}
 suffix={stat.suffix}
 label={stat.label}
 size="md"
 align="center"
 />
 ))}
 </motion.div>
 </motion.div>
 </section>

 {/* ═══ Trust signals — E-E-A-T strengthen ══════════════════ */}
 <SocialProof />

 {/* ═══ 시즌 배너 — 현재 월 자동 인식 ════════════════════════ */}
 <div className="py-8 bg-canvas">
 <SeasonalBanner />
 </div>

 {/* ═══ 광고 (홈 상단) — 의도가 형성된 시점에 노출 ═══════════
      Hero/SocialProof/SeasonalBanner 로 가치·신뢰·시즌을 인지한 뒤,
      계산기 진입 직전에 광고를 보여주는 것이 토스/네이버 패턴. */}
 <div className="page-width">
 <HomeTopAd />
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
 <Section spacing="lg" background="canvas" divider="top">
 <SectionHeader
 badge={
 <Badge intent="info" size="md">
 <Sparkles className="h-3 w-3" aria-hidden="true" />
 Premium Tools
 </Badge>
 }
 title="프리미엄 금융 도구"
 description="당신의 재정 건강을 위한 필수 도구들"
 />

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
 <ToolCard
 icon={Calculator}
 title="정규직 계산기"
 description="2026년 최신 세율 · 실수령액 정확 계산"
 href="/?tab=salary"
 delay={0}
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
 </Section>

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
 <Section spacing="lg" background="white" divider="top">
 <SectionHeader
 badge={<Badge intent="info" size="md">Financial Tools</Badge>}
 title="대출 & 예적금"
 description="스마트한 레버리지와 자산 불리기"
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <h3
 style={{
 fontSize: "15px",
 fontWeight: 700,
 color: "#0A1829",
 marginBottom: "12px",
 display: "flex",
 alignItems: "center",
 gap: "8px",
 }}
 >
 <span
 style={{
 width: "5px",
 height: "20px",
 backgroundColor: "#0145F2",
 borderRadius: "999px",
 display: "inline-block",
 }}
 />
 대출 이자 계산기
 </h3>
 <div
 className="duotone-card"
 style={{ padding: "20px" }}
 >
 <LoanCalculator />
 </div>
 </div>
 <div>
 <h3
 style={{
 fontSize: "15px",
 fontWeight: 700,
 color: "#0A1829",
 marginBottom: "12px",
 display: "flex",
 alignItems: "center",
 gap: "8px",
 }}
 >
 <span
 style={{
 width: "5px",
 height: "20px",
 backgroundColor: "#0145F2",
 borderRadius: "999px",
 display: "inline-block",
 opacity: 0.5,
 }}
 />
 적금 이자 계산기
 </h3>
 <div
 className="duotone-card"
 style={{ padding: "20px" }}
 >
 <DepositCalculator />
 </div>
 </div>
 </div>
 </Section>

 {/* ═══ Featured Guides — 인기 가이드 4개 cross-link ════════ */}
 <FeaturedGuides />

 {/* ═══ Guide Categories — 카테고리별 진입 ══════════════════ */}
 <GuideCategories />

 {/* ═══ Guide CTA ═══════════════════════════════════════════ */}
 <Section spacing="lg" background="canvas" divider="top" className="text-center">
 <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-10 border border-primary-20">
 <BookOpen className="h-[26px] w-[26px] text-primary" aria-hidden="true" />
 </div>
 <h2 className="text-[clamp(1.375rem,3vw,2rem)] font-black tracking-tight text-text mb-3">
 금융 지식 가이드
 </h2>
 <p className="mx-auto max-w-md text-[15px] font-medium text-muted-blue mb-10">
 직장인이 꼭 알아야 할 세금, 투자, 절세 꿀팁을 무료로 제공합니다
 </p>
 <Link
 href="/guides"
 className="btn-primary inline-flex"
 style={{ fontSize: "15.5px", padding: "14px 36px" }}
 >
 가이드 전체 보기
 <ArrowRight className="h-4 w-4" aria-hidden="true" />
 </Link>
 </Section>

 {/* ═══ 마지막 광고 ═════════════════════════════════════════ */}
 <section
 style={{
 backgroundColor: "#FFFFFF",
 borderTop: "1px solid #DDE4EC",
 padding: "3rem 1.5rem",
 }}
 >
 <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
 <InArticleAd />
 </div>
 </section>

 </div>
 </>
 );
}
