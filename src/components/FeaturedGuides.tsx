// src/components/FeaturedGuides.tsx
//
// 메인 페이지 인기 가이드 4개 카드. 가이드 → 메인 cross-link으로
// /guides 페이지 트래픽 상승 + 가이드 본문 깊이 노출.

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { guides } from "@/lib/guidesData";

export default function FeaturedGuides() {
 // 인기 가이드 4개 — views 기준 상위 + 시즌 가이드 우선
 const featured = [...guides]
 .sort((a, b) => b.views - a.views)
 .slice(0, 8) // 후보 8개 중
 .filter((g) => g.content && g.content.length > 1500) // unique 본문만 (boilerplate 제외)
 .slice(0, 4); // 4개 선택

 // 만약 unique 본문 가이드가 4개 미만이면 view 상위로 fallback
 const items = featured.length >= 4
 ? featured
 : [...guides].sort((a, b) => b.views - a.views).slice(0, 4);

 return (
 <section className="py-16 bg-white">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
 <div>
 <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs mb-3">
 <BookOpen className="w-3 h-3" />
 인기 가이드
 </p>
 <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
 직장인이 가장 많이 본 가이드
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
 {items.map((guide) => (
 <Link
 key={guide.slug}
 href={`/guides/${guide.slug}`}
 className="group flex flex-col p-5 bg-canvas rounded-2xl border border-canvas-200 hover:border-electric hover:bg-white transition-all"
 >
 <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-electric-10 text-electric uppercase tracking-widest mb-3 self-start">
 {guide.category}
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
 ))}
 </div>
 </div>
 </section>
 );
}
