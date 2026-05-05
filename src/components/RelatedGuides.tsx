// src/components/RelatedGuides.tsx
//
// 가이드 페이지 cross-link — 같은 카테고리/태그 기반 추천.
// 페이지 하단에 mount하여 평균 PV/세션·체류 시간 향상.

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { guides, type Guide } from "@/lib/guidesData";

interface RelatedGuidesProps {
  currentSlug: string;
  category?: string;
  tags?: string[];
  limit?: number;
  title?: string;
}

function score(target: Guide, currentCategory?: string, currentTags?: string[]): number {
  let s = 0;
  if (currentCategory && target.category === currentCategory) s += 10;
  if (currentTags) {
    const overlap = target.tags.filter((t) => currentTags.includes(t)).length;
    s += overlap * 3;
  }
  s += Math.min(target.views / 1000, 5); // 인기도 약간 가산
  return s;
}

export default function RelatedGuides({
  currentSlug,
  category,
  tags,
  limit = 6,
  title = "이런 가이드도 함께 읽어보세요",
}: RelatedGuidesProps) {
  const candidates = guides
    .filter((g) => g.slug !== currentSlug)
    .map((g) => ({ guide: g, score: score(g, category, tags) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.guide);

  if (candidates.length === 0) return null;

  return (
    <section className="my-12">
      <div className="flex items-center gap-2 mb-5">
        <BookOpen size={20} className="text-electric" />
        <h2 className="text-lg font-black text-navy dark:text-canvas-50">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {candidates.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="group flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 hover:border-electric hover:bg-electric-5 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-electric-10 text-electric uppercase tracking-wider">
                {g.category}
              </span>
              <span className="text-[10px] text-faint-blue">{g.level}</span>
            </div>
            <p className="text-sm font-bold text-navy dark:text-canvas-50 leading-tight line-clamp-2">
              {g.title}
            </p>
            <p className="text-xs text-muted-blue dark:text-canvas-300 line-clamp-2 leading-relaxed">
              {g.description}
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-electric mt-auto pt-1">
              읽어보기
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
