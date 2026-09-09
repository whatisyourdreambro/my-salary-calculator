// src/components/FeaturedGuides.tsx
//
// 메인 페이지 편집 추천 가이드 8개 카드. 명시된 시즌 이슈
// 가이드를 첫 슬롯에 우선 노출하여 메인 → 가이드 유입을 강화.

import Link from "@/components/AppLink";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
// 카드 메타만 사용 — 본문 포함 guidesContent 를 import 하면 홈 청크에
// 가이드 본문 전체가 실린다 (2026-08-26 Phase 4 물리 분리)
import { koGuideCards } from "@/lib/guidesData";
import { compareGuideDates } from "@/lib/guideDiscovery";

// 시즌 우선 노출 슬러그 — 월별 분기 (빌드 시점 기준. CF Pages는 배포마다 재빌드)
const PRIORITY_SLUGS_BY_SEASON: Record<string, string[]> = {
 // 임금협상 시즌 (3~5월)
 negotiation: ["samsung-wage-negotiation-2026", "sk-hynix-wage-2026"],
 // 성과급 지급 시즌 (6~8월 TAI·12~2월 OPI/PS)
 bonus: ["samsung-opi-tai-complete-2026", "sk-hynix-ps-history-2026-prospect"],
};

function getSeasonSlugs(): string[] {
 const month = new Date().getMonth() + 1;
 if ([6, 7, 8, 12, 1, 2].includes(month)) return PRIORITY_SLUGS_BY_SEASON.bonus;
 return PRIORITY_SLUGS_BY_SEASON.negotiation;
}

export default function FeaturedGuides() {
 const prioritySlugs = getSeasonSlugs();
 // 1) 시즌 우선 슬러그를 첫 자리에 고정
 const prioritized = prioritySlugs
 .map((slug) => koGuideCards.find((g) => g.slug === slug))
 .filter((g): g is NonNullable<typeof g> => Boolean(g));

 // 2) 시즌 후보 다음에는 본문을 갖춘 가이드를 실제 수정일(없으면 발행일) 순서로 선택.
 const recent = [...koGuideCards]
 .filter((g) => !prioritySlugs.includes(g.slug))
 .sort(compareGuideDates)
 .filter((g) => g.contentChars > 1500)
 .slice(0, 8 - prioritized.length);

 const items = [...prioritized, ...recent];

 // 본문 길이 기준 후보가 부족하면 나머지 한국어 가이드를 최신순으로 보충.
 if (items.length < 8) {
 const fallback = [...koGuideCards]
 .filter((g) => !items.find((it) => it.slug === g.slug))
 .sort(compareGuideDates)
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
 편집 추천 · 시즌 가이드
 </p>
 <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
 지금 함께 읽을 가이드
 </h2>
 <p className="text-sm text-muted-blue mt-2">시즌 주제를 먼저, 나머지는 최근 수정·발행된 글부터 골랐습니다.</p>
 </div>
 <Link
 href="/guides"
 className="inline-flex items-center gap-1 text-sm font-bold text-electric hover:text-blue-600 transition-colors"
 >
 금융 가이드 전체 보기
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {items.map((guide) => {
 const isSeasonal = prioritySlugs.includes(guide.slug);
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
