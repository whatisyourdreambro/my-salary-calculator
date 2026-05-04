// src/app/calc/page.tsx
// 100개 계산기 인덱스 페이지

import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";
import { allCalculators } from "@/lib/simpleCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "100가지 금융·생활 계산기 — 한 페이지에서 한눈에",
 description:
 "세금·연봉·대출·투자·부동산·보험·사업자·건강·생활까지 100가지 단순 계산기. 한 번에 입력하면 즉시 결과.",
 path: "/calc",
 keywords: ["100가지 계산기", "금융 계산기 모음", "생활 계산기"],
});

const CATEGORY_ORDER = [
 { id: "tax", label: "세금" },
 { id: "salary", label: "연봉·근로" },
 { id: "loan", label: "대출" },
 { id: "investment", label: "투자·저축" },
 { id: "real-estate", label: "부동산" },
 { id: "insurance", label: "보험" },
 { id: "business", label: "사업자" },
 { id: "life", label: "생활·일상" },
 { id: "currency", label: "환율" },
 { id: "health", label: "건강" },
 { id: "family", label: "결혼·육아" },
];

export default function CalcIndexPage() {
 const grouped = CATEGORY_ORDER.map((cat) => ({
 ...cat,
 items: allCalculators.filter((c) => c.category === cat.id),
 })).filter((g) => g.items.length > 0);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "계산기 100", path: "/calc" },
 ])}
 />

 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Calculator className="w-4 h-4" />
 100가지 단순 계산기
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 한 페이지로 끝내는 <span className="text-electric">계산기 모음</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 세금·연봉·대출·투자·부동산·보험·사업자·일상까지
 자주 쓰는 100가지 계산기를 한곳에서.
 </p>
 </div>

 {grouped.map((cat) => (
 <section key={cat.id} className="mb-10">
 <div className="flex items-center gap-2 mb-4">
 <h2 className="text-lg font-black text-navy">{cat.label}</h2>
 <span className="text-xs font-bold text-faint-blue">
 ({cat.items.length}개)
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {cat.items.map((calc) => (
 <Link
 key={calc.slug}
 href={`/calc/${calc.slug}`}
 className="group flex flex-col p-4 bg-white rounded-2xl border border-canvas-200 hover:border-electric hover:shadow-md transition-all"
 >
 <p className="font-bold text-navy text-sm mb-1 leading-tight group-hover:text-electric transition-colors">
 {calc.title}
 </p>
 <p className="text-xs text-faint-blue line-clamp-2 leading-relaxed flex-1">
 {calc.description}
 </p>
 <div className="flex items-center gap-1 text-xs font-bold text-electric mt-3">
 사용
 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
 </div>
 </Link>
 ))}
 </div>
 </section>
 ))}
 </div>
 </main>
 );
}
