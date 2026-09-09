"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ArrowRight, Zap, BookOpen } from "lucide-react";
import Link from "@/components/AppLink";
import HeroBadge from "@/components/HeroBadge";
import DeferredHomeCalculator from "@/components/home/DeferredHomeCalculator";
import { HomeTopAd, GuideMidAd, Display2Ad, MultiplexAd } from "@/components/AdPlacement";

const CalculatorTabs = dynamic(
 () => import("@/components/CalculatorTabs"),
 {
 ssr: false,
 loading: () => (
 <div
 style={{
 width: "100%",
 // 실제 계산기 UI 높이 근사치 예약 — 12rem이던 시절 로드 완료 시
 // 아래 광고·섹션이 수백 px 밀리는 시프트 발생 (2026-07-06 감사)
 minHeight: "560px",
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

const CoupangBanner = dynamic(
 () => import("@/components/CoupangBanner"),
 { ssr: false }
);
const SeasonalBanner = dynamic(
 () => import("@/components/SeasonalBanner"),
 { ssr: false }
);

/* ── Stats Bar ─────────────────────────────────────────────────── */
const stats = [
 { value: "2026", label: "세법 즉시 반영" },
 { value: "100+", label: "금융 계산기" },
 { value: "5초", label: "실시간 계산" },
];

/* ── Homepage (client island) ──────────────────────────────────── */
export default function HomeClient({ featuredGuides, socialProof, guideCategories, toolsSection, trafficEngines }: {
 featuredGuides: ReactNode; socialProof: ReactNode; guideCategories: ReactNode; toolsSection: ReactNode; trafficEngines: ReactNode;
}) {
 return (
 <>
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

 {/* H1·부제·CTA 는 LCP 보호를 위해 정적 렌더 — JS 로드 전에도 즉시 표시 */}
 <div className="text-center max-w-[760px] w-full relative z-10">
 {/* Static badge wrapper: no motion runtime or pre-hydration hiding. */}
 <div
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
 </div>

 {/* H1 */}
 <h1 className="font-black text-[clamp(2.2rem,6vw,4.5rem)] tracking-[-0.045em] leading-[1.08] text-navy mb-5">
 2026 연봉 계산기
 <br />
 <span className="text-electric">세후 월급을 한눈에.</span>
 </h1>

 {/* Subheading — 구체 수치로 신뢰도↑ */}
 <p className="max-w-[560px] mx-auto mb-3 text-[clamp(1rem,2vw,1.2rem)] text-muted-blue font-medium leading-[1.65]">
 4대보험·소득세·연말정산·퇴직금까지.
 <br />
 내 조건을 입력해 공제액과 예상 실수령액을 확인하세요.
 </p>
 <p className="max-w-[560px] mx-auto mb-10 text-sm text-faint-blue font-medium">
 예) 연봉 5,000만원 → 월 실수령 약 352만원 · 연 4,225만원
 </p>

 {/* CTA Buttons */}
 <div className="flex flex-wrap justify-center gap-3">
 <a
 href="#calculator-section"
 className="btn-primary text-base px-8 py-3.5"
 >
 <Zap className="w-[18px] h-[18px]" aria-hidden="true" />
 내 연봉 실수령액 계산
 </a>
 <Link
 href="/salary-db"
 className="btn-secondary text-[15px] px-6 py-3.5"
 >
 회사별 연봉 비교
 <ArrowRight className="w-[15px] h-[15px]" aria-hidden="true" />
 </Link>
 </div>

 {/* Static stats remain visible in the first server response. */}
 <div
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
 </div>
 </div>
 </section>

 {/* ═══ 광고 (홈 상단) — Hero 직하, above-fold 노출 ═════════ */}
 <div className="page-width">
 <HomeTopAd />
 </div>

 {/* ═══ Trust signals — E-E-A-T strengthen ══════════════════ */}
 {socialProof}

 {/* ═══ 시즌 배너 — 현재 월 자동 인식 ════════════════════════ */}
 <div className="py-8 bg-canvas">
 <SeasonalBanner />
 </div>

 {/* ═══ Calculator Section ══════════════════════════════════ */}
 <section id="calculator-section" className="page-width section-lg scroll-mt-24">
 <noscript><p className="mb-6 rounded-xl border border-border bg-background p-5">계산기를 사용하려면 자바스크립트를 켜 주세요. <a href="/table/2026/annual" className="font-bold underline">2026 연봉별 실수령액 표</a>는 바로 읽을 수 있습니다.</p></noscript>
 <div>
 <CalculatorTabs />
 </div>

 {/* 계산기 직하 — 이전의 InArticleAd 는 SalaryResultCard 내부 "결과 직하" 광고
     (동일 fluid 슬롯)를 dedup 으로 영구 차단하고 있었다 (사이트 최고 CTR 자리 사망).
     Display2Ad 로 교체: 신규 유닛 발급 전엔 미렌더, 결과 직하 광고는 즉시 부활. */}
 <div className="mt-10 max-w-3xl mx-auto">
 <Display2Ad />
 </div>
 </section>

 {/* Server-rendered discovery cards: no entrance-animation hydration. */}
 {toolsSection}

 {/* ═══ Traffic Engines Nav — 회사·직업·산업·지역별 연봉 진입 ═══
     사이트 유입의 대부분이 "{회사}/{직업}/{지역} 연봉" 검색이므로,
     홈에서 4개 허브로 직접 보내는 진입로를 Premium Tools 직후에 배치. */}
 {trafficEngines}

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
 <DeferredHomeCalculator kind="loan" />
 </div>
 </div>
 <div>
 <h3 className="text-[15px] font-bold text-navy mb-3 flex items-center gap-2">
 <span className="inline-block w-[5px] h-5 rounded-full bg-electric opacity-50" aria-hidden="true" />
 적금 이자 계산기
 </h3>
 <div className="duotone-card p-5">
 <DeferredHomeCalculator kind="deposit" />
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ═══ Featured Guides — 인기 가이드 4개 cross-link ════════ */}
 {featuredGuides}

 {/* ═══ Guide Categories — 카테고리별 진입 ══════════════════ */}
 {guideCategories}

 {/* ═══ 하단 InArticle 제거(운영자 승인 2026-08-30, 결정 ①): 이 유닛이
 IN_ARTICLE 슬롯을 선점해 SalaryResultCard 내부 "결과 직하" 광고를
 dedup 으로 죽이고 있었음. IN_ARTICLE 은 결과 직하 전용 — 홈 본문에
 재추가 금지. 하단 커버리지는 자동광고가 담당(2026-08-30 실측). ═══ */}

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

 {/* ═══ 마지막 광고 — 중단 InArticleAd 와 슬롯 중복(dedup skip) 방지 위해 GuideMidAd ═══ */}
 <section className="bg-white border-t border-canvas-200 section-pad">
 <div className="max-w-3xl mx-auto px-6">
 <GuideMidAd />
 </div>
 </section>

 {/* ═══ 최하단 exit 멀티플렉스(관련 콘텐츠형) — MULTIPLEX 슬롯 홈 미사용,
 목록형 하단이라는 설계 용도 그대로 (운영자 일괄 승인 2026-08-23) ═══ */}
 <section className="bg-white section-pad">
 <div className="max-w-5xl mx-auto px-6">
 <MultiplexAd />
 </div>
 </section>

 </div>
 </>
 );
}
