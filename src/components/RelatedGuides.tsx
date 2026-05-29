// src/components/RelatedGuides.tsx
//
// 가이드 cross-link 카드 (프레젠테이션 전용, 클라이언트).
// 후보 선별·스코어링은 서버 헬퍼 getRelatedGuides() 가 수행하고, 여기서는
// content 가 제거된 가벼운 메타데이터(items)만 받아 렌더한다.
// (이전: guides 전체 배열을 직접 import → 본문 ~888KB 가 클라이언트 번들에 유입되어
//  /salary/[amount]·/calc/[slug]·/guides/[slug] 등 First Load JS 를 키웠음)

"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { RelatedGuideItem } from "@/lib/relatedGuides";
import { trackGuideCTAClick } from "@/lib/analytics";

interface RelatedGuidesProps {
  items: RelatedGuideItem[];
  title?: string;
}

export default function RelatedGuides({
  items,
  title = "이런 가이드도 함께 읽어보세요",
}: RelatedGuidesProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="my-12">
      <div className="flex items-center gap-2 mb-5">
        <BookOpen size={20} className="text-electric" />
        <h2 className="text-lg font-black text-navy dark:text-canvas-50">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            onClick={() => trackGuideCTAClick(g.slug, "related-guide")}
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
