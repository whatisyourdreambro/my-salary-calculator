"use client";

// 용어 사전 탐색기 — 클라이언트 아일랜드.
// 카드 마크업은 서버에서 렌더링되어 cards(ReactNode[])로 전달받고,
// 이 컴포넌트는 경량 검색 인덱스(index)만으로 표시/숨김을 제어한다.
// → 96KB glossaryData·framer-motion이 이 페이지의 클라이언트 번들에서 제거됨.
import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { Search, Sparkles, RotateCw, ArrowRight } from "lucide-react";

export interface GlossaryIndexItem {
  title: string;
  category: string;
  /** title + summary + content 소문자 결합 — 검색 매칭용 */
  search: string;
}

export interface GlossaryPick {
  title: string;
  summary: string;
  content: string;
  slug: string;
}

const categories = [
  "전체",
  "4대 보험 & 세금",
  "급여 & 근로기준법",
  "금융 & 투자",
  "부동산 & 대출",
  "경제 용어",
];

interface Props {
  index: GlossaryIndexItem[];
  picks: GlossaryPick[];
  cards: ReactNode[];
  /** 카테고리 필터 직후 광고 슬롯 (서버에서 주입) */
  topAd?: ReactNode;
  /** 페이지 하단 광고 슬롯 (서버에서 주입) */
  bottomAd?: ReactNode;
}

export default function GlossaryExplorer({
  index,
  picks,
  cards,
  topAd,
  bottomAd,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [pickIndex, setPickIndex] = useState(0);

  const visible = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return index.map(
      (item) =>
        (q === "" || item.search.includes(q)) &&
        (selectedCategory === "전체" || item.category === selectedCategory)
    );
  }, [index, searchTerm, selectedCategory]);

  const visibleCount = visible.filter(Boolean).length;
  const pick = picks[pickIndex % picks.length];

  return (
    <>
      {/* Search Bar — 히어로 하단에 겹치도록 배치 */}
      <div className="max-w-xl mx-auto relative px-4 -mt-4 mb-4">
        <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-faint-blue w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder="궁금한 용어를 검색해보세요 (예: 국민연금, IRP)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="toss-input pl-14"
        />
      </div>

      <div className="page-width relative z-20 pt-8">
        {/* Today's Term Card */}
        <div className="max-w-3xl mx-auto mb-16">
          {/* dark: 변형 필수 — 라이트 고정 배경 + .dark의 text-navy 흰색 반전으로
              다크모드에서 제목이 안 보이던 버그 (2026-07-06 감사) */}
          <div className="bg-gradient-to-br from-[#EDF1F5] to-[#DDE4EC] dark:from-[#162E4A] dark:to-[#0A1829] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-32 h-32 text-primary" />
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Today&apos;s Pick</span>
              </div>
              <button
                onClick={() => setPickIndex((i) => i + 1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-faint-blue hover:text-navy"
                title="다른 용어 보기"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-navy">{pick.title}</h2>
              </div>
              <p className="text-xl text-faint-blue font-light italic mb-6">
                &quot;{pick.summary}&quot;
              </p>
              <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                <p className="text-faint-blue leading-relaxed">{pick.content}</p>
              </div>
              <Link
                href={`/glossary/${pick.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-electric hover:gap-2 transition-all"
              >
                자세히 보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border hover:border-primary/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 카테고리 필터 직후 광고 — 의도 정점 */}
        {topAd && <div className="max-w-3xl mx-auto mb-10">{topAd}</div>}

        {/* Glossary Grid — 서버 렌더링된 카드를 hidden 토글로만 필터링 (SEO: 전체 카드가 항상 DOM에 존재) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div key={index[i].title} className={visible[i] ? "" : "hidden"}>
              {card}
            </div>
          ))}
        </div>

        {/* 페이지 하단 광고 + 쿠팡 — 모든 용어 본 후 노출 */}
        {visibleCount > 0 && bottomAd && (
          <div className="mt-16 max-w-3xl mx-auto">{bottomAd}</div>
        )}

        {visibleCount === 0 && (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              검색 결과가 없습니다
            </h3>
            <p className="text-lg text-muted-foreground">
              다른 용어로 검색해보시거나 카테고리를 변경해보세요.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
