"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, X } from "lucide-react";

type CalcItem = {
  slug: string;
  title: string;
  description: string;
  category: string;
};

type Grouped = {
  id: string;
  label: string;
  items: CalcItem[];
};

type Featured = {
  href: string;
  title: string;
  description: string;
  season: string;
};

export default function CalcIndexClient({
  grouped,
  featured,
}: {
  grouped: Grouped[];
  featured: Featured[];
}) {
  const [query, setQuery] = useState("");

  // 검색 결과 (전체에서 필터)
  const allItems = useMemo(() => {
    const dyn = grouped.flatMap((g) =>
      g.items.map((c) => ({
        ...c,
        href: `/calc/${c.slug}`,
        season: g.label,
        isDynamic: true,
      }))
    );
    const fixed = featured.map((f) => ({
      ...f,
      slug: f.href.replace(/^\//, ""),
      category: "featured",
      isDynamic: false,
    }));
    return [...fixed, ...dyn];
  }, [grouped, featured]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? allItems.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
    : null;

  // 카테고리 점프 네비
  const allCats = useMemo(
    () =>
      [
        { id: "featured", label: "시즌 핵심", count: featured.length },
        ...grouped.map((g) => ({
          id: g.id,
          label: g.label,
          count: g.items.length,
        })),
      ],
    [featured.length, grouped]
  );

  return (
    <>
      {/* 검색 + 카테고리 점프 — sticky */}
      <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 bg-canvas/95 backdrop-blur-md py-3 border-b border-canvas-200 sm:rounded-2xl sm:border sm:bg-white sm:py-4 sm:px-4">
        <div className="relative mb-3">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint-blue pointer-events-none"
            aria-hidden
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${allItems.length}개 계산기 검색 (예: 연봉, 부동산, 보험)`}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-canvas-200 bg-white text-sm font-medium text-navy placeholder:text-faint-blue focus:outline-none focus:border-electric"
            aria-label="계산기 검색"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-canvas-100 text-faint-blue"
              aria-label="검색어 지우기"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {!filtered && (
          <div
            className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin"
            role="navigation"
            aria-label="카테고리 점프"
          >
            {allCats.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas-50 dark:bg-canvas-800 text-muted-blue text-xs font-bold hover:bg-electric hover:text-white transition-colors whitespace-nowrap"
              >
                {cat.label}
                <span className="text-[10px] opacity-70">
                  {cat.count}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 검색 결과 표시 */}
      {filtered && (
        <section className="mb-10">
          <h2 className="text-lg font-black text-navy mb-4 flex items-center gap-2">
            검색 결과
            <span className="text-sm font-bold text-electric">
              {filtered.length}건
            </span>
          </h2>
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white border border-canvas-200 p-8 text-center">
              <p className="text-sm text-muted-blue mb-2">
                &quot;{query}&quot;에 해당하는 계산기가 없습니다.
              </p>
              <p className="text-xs text-faint-blue">
                다른 단어로 검색하거나 카테고리에서 직접 찾아보세요.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 text-xs font-bold text-electric hover:underline"
              >
                전체 보기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((calc) => (
                <Link
                  key={calc.slug}
                  href={
                    "href" in calc && calc.href
                      ? calc.href
                      : `/calc/${calc.slug}`
                  }
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
          )}
        </section>
      )}

      {/* 검색 X — 평소 노출 */}
      {!filtered && (
        <>
          {/* 시즌 핵심 */}
          <section id="cat-featured" className="mb-12 scroll-mt-32">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-black text-navy">
                2026 시즌 핵심 계산기
              </h2>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-electric text-white">
                NEW
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {featured.map((calc) => (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group flex flex-col p-4 bg-white rounded-2xl border border-electric-20 hover:border-electric hover:shadow-md transition-all relative"
                >
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-electric-10 text-electric">
                    {calc.season}
                  </span>
                  <p className="font-bold text-navy text-sm mb-1 leading-tight pr-16 group-hover:text-electric transition-colors">
                    {calc.title}
                  </p>
                  <p className="text-xs text-faint-blue line-clamp-2 leading-relaxed flex-1 mt-1">
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

          {grouped.map((cat) => (
            <section
              key={cat.id}
              id={`cat-${cat.id}`}
              className="mb-10 scroll-mt-32"
            >
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
        </>
      )}
    </>
  );
}
