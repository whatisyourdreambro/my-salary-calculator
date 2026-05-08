// src/app/en/working-in-korea/page.tsx
// English landing page — Working in Korea expat hub.

import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowRight, Calculator, Globe } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "Working in Korea 2026 — The Complete Expat Hub",
 description:
 "Complete guide for foreigners working in Korea: visas, salaries, tax (Flat 19% vs progressive), 4 insurances, banking, IRP, leaving Korea checklist.",
 path: "/en/working-in-korea",
 keywords: ["Working in Korea", "Korea Expat", "Korean Tax Foreigners", "Korea Visa"],
});

const STEPS = [
 { name: "Step 1. Choose Your Visa", text: "E-1 (Professor), E-2 (English Teacher), E-7 (Special Skill), F-2-7 (Points-based residency). Apply via your sponsor company." },
 { name: "Step 2. Open a Bank Account", text: "Visit Shinhan, KB, or Hana with ARC + Passport. Receive debit card same day." },
 { name: "Step 3. Choose Tax Option", text: "Flat 19% for first 5 years (high earners) or Standard Progressive (with deductions)." },
 { name: "Step 4. Year-End Tax Adjustment", text: "Each February, claim deductions for credit card, medical, IRP, donations, monthly rent." },
 { name: "Step 5. Build Long-Term Wealth", text: "Open IRP for 1.485M annual tax credit + retirement savings. Invest in Korean ETFs and US stocks." },
];

const FAQ_ITEMS = [
 { question: "What's the average salary in Korea?", answer: "Average annual: 42M KRW (~$30,400). IT/Tech: 50~120M. Foreign professionals typically earn well above local average." },
 { question: "Should I choose Flat 19% or Progressive?", answer: "Flat 19% if salary > 70M and few dependents. Standard Progressive if you have a family or significant rent/medical expenses." },
 { question: "How much tax will I pay?", answer: "Standard rates: 6% (under 14M) to 45% (over 1B). Plus 10% local tax. With deductions, effective rate is usually 15~25% for foreign professionals." },
 { question: "Do I need to learn Korean?", answer: "For multinational/IT roles, English is sufficient. For most local Korean companies, intermediate Korean (TOPIK 3+) is required." },
 { question: "How does Korean health insurance work?", answer: "Mandatory for all employees. Covers most medical costs at 10% co-pay. Spouse/dependents free. Foreigners may exempt from National Pension under bilateral agreements." },
];

const TOOLS = [
 { href: "/en", label: "💰 Salary Calculator", desc: "Net pay after taxes & insurance" },
 { href: "/en/flat-tax", label: "💸 Flat Tax 19%", desc: "Compare Flat vs Progressive" },
 { href: "/en/salary-converter", label: "💱 Salary Converter", desc: "Annual ↔ Monthly conversion" },
 { href: "/en/guides/working-in-korea-expat", label: "📚 Expat Guide", desc: "Complete starter guide" },
 { href: "/en/guides/korean-tax-system-foreigners", label: "🧾 Tax System", desc: "Resident vs non-resident" },
 { href: "/en/guides/four-insurances-korea", label: "🛡️ 4 Insurances", desc: "Pension, Health, Care, Employment" },
 { href: "/en/guides/year-end-tax-adjustment", label: "📅 Year-End Tax", desc: "Yeonmaljeongsan process" },
 { href: "/en/guides/renting-in-korea", label: "🏠 Renting in Korea", desc: "Jeonse vs monthly rent" },
 { href: "/en/guides/korea-cost-of-living-2026", label: "🏙️ Cost of Living", desc: "Seoul vs Busan vs Daejeon" },
 { href: "/en/guides/korea-banking-for-foreigners", label: "🏦 Banking", desc: "Open account, transfers" },
 { href: "/en/guides/korea-investing-for-foreigners", label: "📊 Investing", desc: "Stocks, ETFs, taxes" },
 { href: "/en/guides/korea-pension-401k-equivalent", label: "💼 IRP (Korean 401k)", desc: "Tax credits & strategy" },
 { href: "/en/guides/korea-career-growth-foreigner", label: "🚀 Career Growth", desc: "Job change strategy" },
 { href: "/en/guides/leaving-korea-final-tax", label: "✈️ Leaving Korea", desc: "Final tax & pension" },
 { href: "/en/guides/korean-salary-statistics", label: "📈 Salary Statistics", desc: "Where do you stand?" },
];

export default function WorkingInKoreaPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 breadcrumbLd([{ name: "Home", path: "/en" }, { name: "Working in Korea", path: "/en/working-in-korea" }]),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "Working in Korea — 5 Steps", description: "Visa to retirement", totalTime: "P5Y", steps: STEPS }),
 articleLd({ title: "Working in Korea 2026 — Expat Hub", description: "Complete guide", slug: "working-in-korea", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Globe className="w-4 h-4" /> Expat Hub
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">Working in Korea</span> 2026
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 Complete guide for foreigners working in Korea — visa, salary, tax, insurance, retirement, and leaving Korea.
 </p>
 </div>

 <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
 {TOOLS.map((t) => (
 <Link key={t.href} href={t.href} className="bg-white p-4 rounded-2xl border border-canvas hover:border-electric transition group">
 <p className="text-sm font-black text-navy">{t.label}</p>
 <p className="text-xs text-muted-blue mt-1">{t.desc}</p>
 <ArrowRight className="w-4 h-4 mt-2 text-electric group-hover:translate-x-1 transition" />
 </Link>
 ))}
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 5 Steps to Success</h2>
 <div className="space-y-3">
 {STEPS.map((s, i) => (
 <div key={s.name} className="bg-white p-5 rounded-2xl border border-canvas flex gap-4">
 <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center font-black text-navy">{i + 1}</div>
 <div>
 <p className="font-black text-navy mb-1">{s.name}</p>
 <p className="text-sm text-muted-blue">{s.text}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">FAQ</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
 <details key={item.question} className="bg-white rounded-2xl p-5 border border-canvas group">
 <summary className="font-black text-navy cursor-pointer list-none flex justify-between items-start">
 <span>{item.question}</span>
 <ArrowRight className="w-5 h-5 text-electric flex-shrink-0 ml-3 transition-transform group-open:rotate-90" />
 </summary>
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>
 </div>
 </main>
 );
}
