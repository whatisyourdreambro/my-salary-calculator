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
 ChevronRight,
 Shield,
 BarChart3,
 Sparkles,
 BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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

/* ── Tool Card ─────────────────────────────────────────────────── */
const ToolCard = ({
 icon: Icon,
 title,
 description,
 href,
 delay = 0,
 wide = false,
}: {
 icon: React.ElementType;
 title: string;
 description: string;
 href: string;
 iconBg?: string;
 delay?: number;
 wide?: boolean;
}) => (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay }}
 style={wide ? { gridColumn: "span 2" } : undefined}
 className={wide ? "md:col-span-2" : ""}
 >
 <Link
 href={href}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "16px",
 padding: "18px 20px",
 backgroundColor: "#FFFFFF",
 borderRadius: "16px",
 border: "1.5px solid #DDE4EC",
 textDecoration: "none",
 transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
 }}
 onMouseEnter={(e) => {
 const el = e.currentTarget as HTMLElement;
 el.style.borderColor = "#0145F244";
 el.style.boxShadow = "0 4px 24px -4px #0145F222";
 el.style.transform = "translateY(-2px)";
 }}
 onMouseLeave={(e) => {
 const el = e.currentTarget as HTMLElement;
 el.style.borderColor = "#DDE4EC";
 el.style.boxShadow = "none";
 el.style.transform = "none";
 }}
 >
 {/* Icon */}
 <div
 style={{
 width: "46px",
 height: "46px",
 borderRadius: "12px",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 flexShrink: 0,
 backgroundColor: "#0145F20D",
 color: "#0145F2",
 border: "1.5px solid #0145F221",
 }}
 >
 <Icon style={{ width: "22px", height: "22px" }} />
 </div>

 {/* Text */}
 <div style={{ flex: 1, minWidth: 0 }}>
 <p
 style={{
 fontWeight: 700,
 color: "#0A1829",
 fontSize: "15px",
 marginBottom: "2px",
 letterSpacing: "-0.02em",
 }}
 >
 {title}
 </p>
 <p
 style={{
 color: "#7A9AB5",
 fontSize: "13.5px",
 overflow: "hidden",
 textOverflow: "ellipsis",
 whiteSpace: "nowrap",
 }}
 >
 {description}
 </p>
 </div>

 <ChevronRight
 style={{ width: "16px", height: "16px", color: "#C8D4E0", flexShrink: 0 }}
 />
 </Link>
 </motion.div>
);

/* ── Stats Bar ─────────────────────────────────────────────────── */
const stats = [
 { value: "2026년", label: "최신 세법" },
 { value: "100+", label: "금융 계산기" },
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
 <div style={{ width: "100%", overflowX: "hidden" }}>

 {/* ═══ Hero ════════════════════════════════════════════════ */}
 <section
 style={{
 position: "relative",
 minHeight: "88vh",
 display: "flex",
 flexDirection: "column",
 alignItems: "center",
 justifyContent: "center",
 padding: "7rem 1.5rem 4rem",
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
 2026년 세법 완벽 반영
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

 {/* CTA Buttons */}
 <div
 style={{
 display: "flex",
 flexWrap: "wrap",
 justifyContent: "center",
 gap: "12px",
 }}
 >
 <button
 onClick={scrollToCalculator}
 className="btn-primary"
 style={{ fontSize: "16px", padding: "14px 32px" }}
 >
 <Zap style={{ width: "18px", height: "18px" }} />
 지금 바로 계산하기
 </button>
 <Link
 href="/guides"
 className="btn-secondary"
 style={{ fontSize: "15px", padding: "14px 24px" }}
 >
 금융 가이드 보기
 <ArrowRight style={{ width: "15px", height: "15px" }} />
 </Link>
 </div>

 {/* Stats */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 style={{
 marginTop: "4rem",
 display: "flex",
 justifyContent: "center",
 gap: "3rem",
 padding: "1.5rem 0",
 borderTop: "1px solid #DDE4EC",
 borderBottom: "1px solid #DDE4EC",
 flexWrap: "wrap",
 }}
 >
 {stats.map((stat, i) => (
 <div key={i} style={{ textAlign: "center" }}>
 <p
 style={{
 fontSize: "clamp(1.4rem, 3vw, 2rem)",
 fontWeight: 900,
 color: "#0145F2",
 letterSpacing: "-0.04em",
 marginBottom: "2px",
 }}
 >
 {stat.value}
 </p>
 <p
 style={{
 fontSize: "11.5px",
 fontWeight: 700,
 color: "#7A9AB5",
 letterSpacing: "0.04em",
 textTransform: "uppercase",
 }}
 >
 {stat.label}
 </p>
 </div>
 ))}
 </motion.div>
 </motion.div>
 </section>

 {/* ═══ Calculator Section ══════════════════════════════════ */}
 <section
 id="calculator-section"
 style={{
 maxWidth: "80rem",
 margin: "0 auto",
 padding: "5rem 1.5rem",
 }}
 >
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-80px" }}
 transition={{ duration: 0.5 }}
 >
 <CalculatorTabs />
 </motion.div>
 </section>

 {/* ═══ Premium Tools Grid ══════════════════════════════════ */}
 <section
 style={{
 backgroundColor: "#EDF1F5",
 borderTop: "1px solid #DDE4EC",
 padding: "5rem 1.5rem",
 }}
 >
 <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
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

 <div
 style={{
 display: "grid",
 gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
 gap: "12px",
 }}
 >
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
 </div>
 </section>

 {/* ═══ Loan & Deposit Section ══════════════════════════════ */}
 <section
 style={{
 backgroundColor: "#FFFFFF",
 borderTop: "1px solid #DDE4EC",
 padding: "5rem 1.5rem",
 }}
 >
 <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
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

 <div
 style={{
 display: "grid",
 gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
 gap: "24px",
 }}
 >
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
 </div>
 </section>

 {/* ═══ Guide CTA ═══════════════════════════════════════════ */}
 <section
 style={{
 backgroundColor: "#EDF1F5",
 borderTop: "1px solid #DDE4EC",
 padding: "5rem 1.5rem",
 textAlign: "center",
 }}
 >
 <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
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

 </div>
 </>
 );
}
