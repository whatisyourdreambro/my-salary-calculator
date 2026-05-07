"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, ArrowRight, BookOpen, TrendingUp, Calculator, Sparkles, Calendar } from "lucide-react";
import { enGuides } from "@/lib/guidesData";
import { HomeTopAd, GuideMidAd } from "@/components/AdPlacement";
import EmailCaptureCard from "@/components/EmailCaptureCard";

export default function GlobalLandingPage() {
 const featuredStockGuides = enGuides.slice(0, 6);

 return (
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
 padding: "5rem 1.5rem 3rem",
 backgroundColor: "#EDF1F5",
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
 style={{
 marginBottom: "2rem",
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "0.5rem 1rem",
 borderRadius: "9999px",
 border: "1px solid #0145F233",
 backgroundColor: "#0145F20D",
 color: "#0145F2",
 fontSize: "13px",
 fontWeight: 700,
 }}
 >
 <Globe size={14} /> Working in Korea · 2026 Tax Law
 </motion.div>

 <h1
 style={{
 fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
 fontWeight: 900,
 letterSpacing: "-0.025em",
 lineHeight: 1.1,
 color: "#0A1829",
 marginBottom: "1.25rem",
 }}
 >
 Salary, Stocks &amp; Tax<br />
 <span style={{ color: "#0145F2" }}>Made Clear in English</span>
 </h1>

 <p
 style={{
 fontSize: "clamp(1rem, 2vw, 1.25rem)",
 color: "#3D5E78",
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
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "14px 28px",
 borderRadius: "12px",
 backgroundColor: "#0145F2",
 color: "#FFFFFF",
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
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "14px 28px",
 borderRadius: "12px",
 backgroundColor: "#FFFFFF",
 color: "#0145F2",
 border: "2px solid #0145F2",
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
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "14px 28px",
 borderRadius: "12px",
 backgroundColor: "#FFFFFF",
 color: "#3D5E78",
 border: "1.5px solid #DDE4EC",
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
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
 <div>
 <div
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 fontSize: "14px",
 fontWeight: 700,
 color: "#0145F2",
 marginBottom: "0.5rem",
 }}
 >
 <TrendingUp size={16} /> Trending in 2026
 </div>
 <h2
 style={{
 fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
 fontWeight: 900,
 color: "#0A1829",
 letterSpacing: "-0.02em",
 }}
 >
 Samsung &amp; SK Hynix Stock Guides
 </h2>
 </div>
 <Link
 href="/en/guides"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.25rem",
 fontSize: "14px",
 fontWeight: 700,
 color: "#0145F2",
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
 <div className="relative h-full flex flex-col toss-card hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300">
 <div className="p-7 flex flex-col flex-grow relative z-10">
 <div className="flex items-center justify-between mb-5">
 <span
 style={{
 display: "inline-flex",
 alignItems: "center",
 padding: "0.25rem 0.75rem",
 borderRadius: "8px",
 backgroundColor: "#0145F20D",
 color: "#0145F2",
 fontSize: "11px",
 fontWeight: 700,
 border: "1px solid #0145F233",
 }}
 >
 {guide.category}
 </span>
 <span
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.25rem",
 padding: "0.25rem 0.5rem",
 borderRadius: "9999px",
 backgroundColor: "#FFA50015",
 color: "#FF8800",
 fontSize: "11px",
 fontWeight: 700,
 }}
 >
 <Sparkles size={11} /> NEW
 </span>
 </div>

 <h3
 style={{
 fontSize: "18px",
 fontWeight: 700,
 color: "#0A1829",
 marginBottom: "0.75rem",
 lineHeight: 1.4,
 }}
 >
 {guide.title}
 </h3>

 <p
 style={{
 fontSize: "14px",
 color: "#3D5E78",
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
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 paddingTop: "1.25rem",
 borderTop: "1px solid #DDE4EC",
 fontSize: "12px",
 color: "#7A8FA6",
 }}
 >
 <div className="flex items-center gap-1">
 <Calendar size={12} />
 <span>{new Date(guide.publishedDate).toLocaleDateString("en-US")}</span>
 </div>
 <div
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.25rem",
 fontWeight: 700,
 color: "#0145F2",
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

 {/* ═══ Email Capture (English audience) ═══════════════════════ */}
 <div className="max-w-2xl mx-auto px-4 mb-12">
 <EmailCaptureCard context="general" />
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
