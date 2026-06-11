"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, ArrowRight, BookOpen, TrendingUp, Calculator, Sparkles, Calendar } from "lucide-react";
import type { GuideCardMeta } from "@/lib/guidesData";
import { HomeTopAd, GuideMidAd } from "@/components/AdPlacement";

export default function EnLandingClient({ guides }: { guides: GuideCardMeta[] }) {
 const featuredStockGuides = guides;

 return (
 <div className="w-full overflow-x-hidden">
 {/* ═══ Hero ════════════════════════════════════════════════ */}
 {/* 다크모드 대응 — 고정 hex 대신 토큰 클래스 (bg-canvas 등) 사용 */}
 <section
 className="hero-section bg-canvas"
 style={{
 position: "relative",
 display: "flex",
 flexDirection: "column",
 alignItems: "center",
 justifyContent: "center",
 padding: "5rem 1.5rem 3rem",
 overflow: "hidden",
 }}
 >
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
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: 0.15 }}
 className="border border-primary/20 bg-electric-10 text-electric"
 style={{
 marginBottom: "2rem",
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "0.5rem 1rem",
 borderRadius: "9999px",
 fontSize: "13px",
 fontWeight: 700,
 }}
 >
 <Globe size={14} /> Working in Korea · 2026 Tax Law
 </motion.div>

 <h1
 className="text-navy"
 style={{
 fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
 fontWeight: 900,
 letterSpacing: "-0.025em",
 lineHeight: 1.1,
 marginBottom: "1.25rem",
 }}
 >
 Salary, Stocks &amp; Tax<br />
 <span className="text-electric">Made Clear in English</span>
 </h1>

 <p
 className="text-muted-blue"
 style={{
 fontSize: "clamp(1rem, 2vw, 1.25rem)",
 maxWidth: "560px",
 margin: "0 auto 2.25rem",
 lineHeight: 1.6,
 fontWeight: 500,
 }}
 >
 Korea's #1 salary calculator now in English. Calculate net pay,
 analyze Samsung &amp; SK Hynix stocks, and master ESOP / ISA strategies.
 </p>

 <div
 style={{
 display: "flex",
 flexWrap: "wrap",
 gap: "0.75rem",
 justifyContent: "center",
 }}
 >
 <Link
 href="/en/salary-converter"
 className="bg-electric text-white"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "14px 28px",
 borderRadius: "12px",
 fontWeight: 700,
 fontSize: "16px",
 textDecoration: "none",
 boxShadow: "0 8px 24px -4px #0145F244",
 transition: "all 0.15s ease",
 }}
 >
 <Calculator size={18} /> Salary Converter
 </Link>
 <Link
 href="/en/flat-tax"
 className="bg-white text-electric border-2 border-electric"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "14px 28px",
 borderRadius: "12px",
 fontWeight: 700,
 fontSize: "16px",
 textDecoration: "none",
 transition: "all 0.15s ease",
 }}
 >
 19% Flat Tax (Expats) <ArrowRight size={18} />
 </Link>
 <Link
 href="/en/guides"
 className="bg-white text-muted-blue border border-canvas-200"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "14px 28px",
 borderRadius: "12px",
 fontWeight: 700,
 fontSize: "16px",
 textDecoration: "none",
 transition: "all 0.15s ease",
 }}
 >
 <BookOpen size={18} /> All Guides
 </Link>
 </div>
 </motion.div>
 </section>

 {/* ═══ Top Ad ═════════════════════════════════════════════════ */}
 <div className="max-w-5xl mx-auto px-4 mt-10">
 <HomeTopAd />
 </div>

 {/* ═══ Featured Stock Guides ═════════════════════════════════ */}
 <section className="page-width py-16">
 <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
 <div>
 <div
 className="text-electric"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 fontSize: "14px",
 fontWeight: 700,
 marginBottom: "0.5rem",
 }}
 >
 <TrendingUp size={16} /> Trending in 2026
 </div>
 <h2
 className="text-navy"
 style={{
 fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
 fontWeight: 900,
 letterSpacing: "-0.02em",
 }}
 >
 Samsung &amp; SK Hynix Stock Guides
 </h2>
 </div>
 <Link
 href="/en/guides"
 className="text-electric"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.25rem",
 fontSize: "14px",
 fontWeight: 700,
 textDecoration: "none",
 }}
 >
 All Guides <ArrowRight size={16} />
 </Link>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {featuredStockGuides.map((guide, index) => (
 <motion.div
 key={guide.slug}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05, duration: 0.4 }}
 className="group h-full"
 >
 <Link href={`/en/guides/${guide.slug}`} className="block h-full no-underline">
 <div className="relative h-full flex flex-col duotone-card hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300">
 <div className="p-7 flex flex-col flex-grow relative z-10">
 <div className="flex items-center justify-between mb-5">
 <span
 className="bg-electric-5 text-electric border border-primary/20"
 style={{
 display: "inline-flex",
 alignItems: "center",
 padding: "0.25rem 0.75rem",
 borderRadius: "8px",
 fontSize: "11px",
 fontWeight: 700,
 }}
 >
 {guide.category}
 </span>
 <span
 className="bg-amber-500/10 text-amber-600"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.25rem",
 padding: "0.25rem 0.5rem",
 borderRadius: "9999px",
 fontSize: "11px",
 fontWeight: 700,
 }}
 >
 <Sparkles size={11} /> NEW
 </span>
 </div>

 <h3
 className="text-navy"
 style={{
 fontSize: "18px",
 fontWeight: 700,
 marginBottom: "0.75rem",
 lineHeight: 1.4,
 }}
 >
 {guide.title}
 </h3>

 <p
 className="text-muted-blue"
 style={{
 fontSize: "14px",
 lineHeight: 1.6,
 marginBottom: "1.25rem",
 flexGrow: 1,
 display: "-webkit-box",
 WebkitLineClamp: 3,
 WebkitBoxOrient: "vertical",
 overflow: "hidden",
 }}
 >
 {guide.description}
 </p>

 <div
 className="border-t border-canvas-200 text-faint-blue"
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 paddingTop: "1.25rem",
 fontSize: "12px",
 }}
 >
 <div className="flex items-center gap-1">
 <Calendar size={12} />
 <span>{new Date(guide.publishedDate).toLocaleDateString("en-US")}</span>
 </div>
 <div
 className="text-electric"
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.25rem",
 fontWeight: 700,
 }}
 >
 Read <ArrowRight size={12} />
 </div>
 </div>
 </div>
 </div>
 </Link>
 </motion.div>
 ))}
 </div>
 </section>

 {/* ═══ Mid-content Ad ═════════════════════════════════════════ */}
 <div className="max-w-5xl mx-auto px-4 mb-12">
 <GuideMidAd />
 </div>

 {/* ═══ Korean Site CTA ═══════════════════════════════════════ */}
 <section
 style={{
 background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)",
 padding: "4rem 1.5rem",
 }}
 >
 <div
 style={{
 maxWidth: "720px",
 margin: "0 auto",
 textAlign: "center",
 color: "#FFFFFF",
 }}
 >
 <BookOpen size={40} style={{ margin: "0 auto 1rem", opacity: 0.85 }} />
 <h2
 style={{
 fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
 fontWeight: 900,
 marginBottom: "1rem",
 letterSpacing: "-0.02em",
 }}
 >
 Korean version is also available
 </h2>
 <p
 style={{
 fontSize: "1.0625rem",
 lineHeight: 1.6,
 opacity: 0.9,
 marginBottom: "2rem",
 maxWidth: "520px",
 margin: "0 auto 2rem",
 }}
 >
 For 100+ calculators, 50+ Korean guides, and the full company salary database, visit the Korean version of Moneysalary.
 </p>
 <Link
 href="/"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "14px 28px",
 borderRadius: "12px",
 backgroundColor: "#FFFFFF",
 color: "#0145F2",
 fontWeight: 700,
 fontSize: "16px",
 textDecoration: "none",
 transition: "all 0.15s ease",
 }}
 >
 Go to Korean Site <ArrowRight size={18} />
 </Link>
 </div>
 </section>
 </div>
 );
}
