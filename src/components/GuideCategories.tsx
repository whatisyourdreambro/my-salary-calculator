// src/components/GuideCategories.tsx
//
// 메인 페이지 가이드 카테고리별 진입 카드.
// 50+ 가이드를 카테고리로 한눈에 보여주고 빠른 진입 유도.

import Link from "@/components/AppLink";
import {
 Wallet,
 Receipt,
 TrendingUp,
 Home,
 Briefcase,
 Sparkles,
 ArrowRight,
} from "lucide-react";
// 카드 메타만 사용 — content 포함 guides 를 import 하면 이 (lazy) 청크에
// 가이드 본문 전체가 딸려 들어간다 (2026-08-23 번들 절감)
import { koGuideCards } from "@/lib/guidesData";
import { hubSlugByCategoryId } from "@/lib/guideCategories";
import { guideSearchHref } from "@/lib/guideDiscovery";

const CATEGORY_META: Record<
 string,
 { icon: React.ElementType; description: string; color: string }
> = {
 연봉: {
 icon: Wallet,
 description: "실수령액·협상·티어",
 color: "bg-secondary text-link",
 },
 세금: {
 icon: Receipt,
 description: "연말정산·종소세·절세",
 color: "bg-secondary text-link",
 },
 투자: {
 icon: TrendingUp,
 description: "ETF·ISA·주식·채권",
 color: "bg-secondary text-link",
 },
 부동산: {
 icon: Home,
 description: "내집 마련·전세·대출",
 color: "bg-secondary text-link",
 },
 커리어: {
 icon: Briefcase,
 description: "이직·연봉협상·승진",
 color: "bg-secondary text-link",
 },
 기초: {
 icon: Sparkles,
 description: "신용점수·노후·보험",
 color: "bg-secondary text-link",
 },
};

export default function GuideCategories() {
 // 카테고리별 가이드 수 집계
 const counts = koGuideCards.reduce<Record<string, number>>((acc, g) => {
 acc[g.category] = (acc[g.category] || 0) + 1;
 return acc;
 }, {});

 const categories = Object.entries(CATEGORY_META).map(([name, meta]) => ({
 name,
 count: counts[name] || 0,
 ...meta,
 }));

 return (
 <section className="ms-section border-t border-border bg-background" aria-labelledby="home-category-heading">
 <div className="page-width">
 <div className="mb-8 max-w-2xl">
 <p className="ms-eyebrow mb-3">
 카테고리별
 </p>
 <h2 id="home-category-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl mb-3">
 어디부터 알아볼까요?
 </h2>
 <p className="ms-description">
 급여·세금·투자의 기본부터, 필요한 주제를 골라 읽으세요.
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
 {categories.map((cat) => {
 const Icon = cat.icon;
 return (
 <Link
 key={cat.name}
 href={
 hubSlugByCategoryId[cat.name]
 ? `/guides/category/${hubSlugByCategoryId[cat.name]}`
 : guideSearchHref(cat.name)
 }
 rel={hubSlugByCategoryId[cat.name] ? undefined : "nofollow"}
 className="ms-surface ms-interactive group flex flex-col items-start p-5"
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cat.color}`}>
 <Icon className="w-5 h-5" aria-hidden="true" />
 </div>
 <p className="font-semibold text-foreground text-base mb-1">{cat.name}</p>
 <p className="text-sm leading-6 text-muted-foreground mb-3">{cat.description}</p>
 <span className="text-xs font-medium text-link mt-auto">
 {cat.count}편
 </span>
 </Link>
 );
 })}
 </div>

 <div className="mt-6">
 <Link
 href="/guides"
 className="ms-button ms-button-secondary"
 >
 전체 가이드 보기
 <ArrowRight className="w-4 h-4" aria-hidden="true" />
 </Link>
 </div>
 </div>
 </section>
 );
}
