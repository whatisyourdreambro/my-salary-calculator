// src/components/FeaturedGuides.tsx
//
// 메인 페이지 인기 가이드 8개 카드. 시즌 이슈(2026-05 반도체 임금협상)
// 가이드를 첫 슬롯에 우선 노출하여 메인 → 가이드 유입을 강화.

import Link from "next/link";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { guides } from "@/lib/guidesData";

// 시즌 우선 노출 슬러그 (2026-05 반도체 임금협상 시즌)
const PRIORITY_SLUGS = [
 "samsung-wage-negotiation-2026",
 "sk-hynix-wage-2026",
];

export default function FeaturedGuides() {
 // 1) 시즌 우선 슬러그를 첫 자리에 고정
 const prioritized = PRIORITY_SLUGS
 .map((slug) => guides.find((g) => g.slug === slug && g.lang !== "en"))
 .filter((g): g is NonNullable<typeof g> => Boolean(g));

 // 2) 인기 가이드 — views 기준 상위 + unique 본문(boilerplate 제외)
 const popular = [...guides]
 .filter((g) => g.lang !== "en")
 .filter((g) => !PRIORITY_SLUGS.includes(g.slug))
 .sort((a, b) => b.views - a.views)
 .filter((g) => g.content && g.content.length > 1500)
 .slice(0, 8 - prioritized.length);

 const items = [...prioritized, ...popular];

 // unique 본문 가이드가 부족하면 fallback (영문 제외 전체에서 views 상위)
 if (items.length < 8) {
 const fallback = [...guides]
 .filter((g) => g.lang !== "en")
 .filter((g) => !items.find((it) => it.slug === g.slug))
 .sort((a, b) => b.views - a.views)
 .slice(0, 8 - items.length);
 items.push(...fallback);
 }

 return (
 <section className="py-16 bg-white">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
 <div>
 <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs mb-3">
 <BookOpen className="w-3 h-3" />
 인기 + 시즌 가이드
 </p>
 <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
 지금 가장 많이 읽히는 가이드
 </h2>
 </div>
 <Link
 href="/guides"
 className="inline-flex items-center gap-1 text-sm font-bold text-electric hover:text-blue-600 transition-colors"
 >
 전체 보기
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {items.map((guide, idx) => {
 const isSeasonal = PRIORITY_SLUGS.includes(guide.slug);
 return (
 <Link
 key={guide.slug}
 href={`/guides/${guide.slug}`}
 className={`group flex flex-col p-5 rounded-2xl border transition-all ${
 isSeasonal
 ? "bg-electric-10 border-electric hover:bg-white"
 : "bg-canvas border-canvas-200 hover:border-electric hover:bg-white"
 }`}
 >
 <span
 className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-3 self-start ${
 isSeasonal
 ? "bg-electric text-white"
 : "bg-electric-10 text-electric"
 }`}
 >
 {isSeasonal && <TrendingUp className="w-2.5 h-2.5" />}
 {isSeasonal ? "시즌 이슈" : guide.category}
 </span>
 <h3 className="font-bold text-navy text-sm mb-2 leading-tight line-clamp-2 group-hover:text-electric transition-colors">
 {guide.title}
 </h3>
 <p className="text-xs text-faint-blue line-clamp-2 leading-relaxed mb-4 flex-1">
 {guide.description}
 </p>
 <div className="flex items-center gap-1 text-xs font-bold text-electric mt-auto">
 자세히 읽기
 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
 </div>
 </Link>
 );
 })}
 </div>
 </div>
 </section>
 );
}
