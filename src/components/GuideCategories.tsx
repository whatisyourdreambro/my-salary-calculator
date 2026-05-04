// src/components/GuideCategories.tsx
//
// 메인 페이지 가이드 카테고리별 진입 카드.
// 50+ 가이드를 카테고리로 한눈에 보여주고 빠른 진입 유도.

import Link from "next/link";
import {
 Wallet,
 Receipt,
 TrendingUp,
 Home,
 Briefcase,
 Sparkles,
 ArrowRight,
} from "lucide-react";
import { guides } from "@/lib/guidesData";

const CATEGORY_META: Record<
 string,
 { icon: React.ElementType; description: string; color: string }
> = {
 연봉: {
 icon: Wallet,
 description: "실수령액·협상·티어",
 color: "bg-electric-10 text-electric",
 },
 세금: {
 icon: Receipt,
 description: "연말정산·종소세·절세",
 color: "bg-electric-10 text-electric",
 },
 투자: {
 icon: TrendingUp,
 description: "ETF·ISA·주식·채권",
 color: "bg-electric-10 text-electric",
 },
 부동산: {
 icon: Home,
 description: "내집 마련·전세·대출",
 color: "bg-electric-10 text-electric",
 },
 커리어: {
 icon: Briefcase,
 description: "이직·연봉협상·승진",
 color: "bg-electric-10 text-electric",
 },
 기초: {
 icon: Sparkles,
 description: "신용점수·노후·보험",
 color: "bg-electric-10 text-electric",
 },
};

export default function GuideCategories() {
 // 카테고리별 가이드 수 집계
 const counts = guides.reduce<Record<string, number>>((acc, g) => {
 acc[g.category] = (acc[g.category] || 0) + 1;
 return acc;
 }, {});

 const categories = Object.entries(CATEGORY_META).map(([name, meta]) => ({
 name,
 count: counts[name] || 0,
 ...meta,
 }));

 return (
 <section className="py-16 bg-canvas">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-electric font-bold text-xs mb-3 border border-canvas-200">
 카테고리별
 </p>
 <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight mb-2">
 어디부터 알아볼까요?
 </h2>
 <p className="text-sm text-muted-blue">
 100+ 금융 가이드를 카테고리별로 빠르게
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
 {categories.map((cat) => {
 const Icon = cat.icon;
 return (
 <Link
 key={cat.name}
 href={`/guides?q=${encodeURIComponent(cat.name)}`}
 className="group flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric hover:shadow-md transition-all"
 >
 <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${cat.color}`}>
 <Icon className="w-6 h-6" />
 </div>
 <p className="font-bold text-navy text-sm mb-1">{cat.name}</p>
 <p className="text-xs text-faint-blue mb-2 line-clamp-2">{cat.description}</p>
 <span className="text-xs font-black text-electric mt-auto">
 {cat.count}편
 </span>
 </Link>
 );
 })}
 </div>

 <div className="text-center mt-8">
 <Link
 href="/guides"
 className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-canvas-200 rounded-xl text-navy font-bold text-sm hover:border-electric hover:text-electric transition-colors"
 >
 전체 가이드 보기
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </section>
 );
}
