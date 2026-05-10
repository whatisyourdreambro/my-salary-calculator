"use client";

/**
 * /calc 100개 계산기 인덱스 — 검색 + 카테고리 필터 + URL 동기화.
 * 토스/네이버 금융 패턴: 검색바 위, 카테고리 칩 가로 스크롤, 그 아래 카드 그리드.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calculator, Search, X } from "lucide-react";

import { allCalculators } from "@/lib/simpleCalculators";
import { HomeTopAd } from "@/components/AdPlacement";
import { Badge } from "@/components/ui/Badge";

const CATEGORY_ORDER: Array<{ id: string; label: string }> = [
  { id: "all", label: "전체" },
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

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export default function CalcIndexClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const initialCat = searchParams.get("cat") ?? "all";

  const [query, setQuery] = useState(initialQuery);
  const [activeCat, setActiveCat] = useState(initialCat);

  // URL 동기화 — 검색·필터 변경 시 query string 업데이트 (브라우저 history 안 쌓이게 replace)
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeCat && activeCat !== "all") params.set("cat", activeCat);
    const next = params.toString();
    router.replace(next ? `/calc?${next}` : "/calc", { scroll: false });
  }, [query, activeCat, router]);

  // 카테고리별 카운트 — 칩 옆에 표시
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: allCalculators.length };
    for (const c of allCalculators) m[c.category] = (m[c.category] ?? 0) + 1;
    return m;
  }, []);

  // 필터링 + 그룹화
  const grouped = useMemo(() => {
    const q = normalize(query);
    return CATEGORY_ORDER.filter((c) => c.id !== "all")
      .map((cat) => ({
        ...cat,
        items: allCalculators.filter((calc) => {
          if (calc.category !== cat.id) return false;
          if (activeCat !== "all" && activeCat !== cat.id) return false;
          if (!q) return true;
          const haystack = normalize(
            `${calc.title} ${calc.description} ${calc.categoryLabel} ${calc.keywords.join(" ")}`
          );
          return haystack.includes(q);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [query, activeCat]);

  const totalMatches = grouped.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <Badge intent="info" size="md" className="mb-6">
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          100가지 단순 계산기
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
          한 페이지로 끝내는 <span className="text-electric">계산기 모음</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
          세금·연봉·대출·투자·부동산·보험·사업자·일상까지
          자주 쓰는 100가지 계산기를 한곳에서.
        </p>
      </div>

      {/* Search bar */}
      <div className="sticky top-[72px] z-10 -mx-4 px-4 sm:mx-0 sm:px-0 mb-5 bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85 py-3">
        <label htmlFor="calc-search" className="sr-only">
          계산기 검색
        </label>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-faint-blue pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="calc-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="계산기 이름·키워드로 검색 (예: 연봉, 대출, 부가세)"
            className="w-full pl-12 pr-12 py-3.5 bg-white rounded-2xl text-[15px] font-semibold text-navy placeholder:text-faint-blue placeholder:font-medium border-2 border-canvas-200 focus:border-electric focus:outline-none focus:ring-4 focus:ring-primary-10 transition-all duration-150 shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-faint-blue hover:bg-canvas-100 hover:text-navy transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Category chips — 모바일 가로 스크롤, 데스크톱 wrap */}
      <div
        className="no-scrollbar flex sm:flex-wrap gap-2 mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
        role="tablist"
        aria-label="카테고리 필터"
      >
        {CATEGORY_ORDER.map((cat) => {
          const active = activeCat === cat.id;
          const count = counts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCat(cat.id)}
              className={[
                "flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 no-tap-highlight",
                active
                  ? "bg-electric text-white shadow-primary-md"
                  : "bg-white text-muted-blue border border-canvas-200 hover:border-electric hover:text-electric",
              ].join(" ")}
            >
              {cat.label}
              <span
                className={[
                  "text-[11px] font-extrabold tabular-nums",
                  active ? "text-white/80" : "text-faint-blue",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 결과 카운트 */}
      {(query || activeCat !== "all") && (
        <p className="text-sm font-bold text-muted-blue mb-4">
          {totalMatches > 0 ? (
            <>
              <span className="text-electric">{totalMatches}개</span>의 계산기 매칭
            </>
          ) : (
            "일치하는 계산기가 없습니다. 다른 키워드를 시도해보세요."
          )}
        </p>
      )}

      {/* Grouped grid */}
      {grouped.map((cat, idx) => (
        <div key={cat.id}>
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-black text-navy">{cat.label}</h2>
              <span className="text-xs font-bold text-faint-blue tabular-nums">
                ({cat.items.length}개)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.items.map((calc) => (
                <Link
                  key={calc.slug}
                  href={`/calc/${calc.slug}`}
                  className="group flex flex-col p-4 bg-white rounded-2xl border border-canvas-200 hover:border-electric hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
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
          {idx === 2 && !query && activeCat === "all" && <HomeTopAd />}
        </div>
      ))}
    </div>
  );
}
