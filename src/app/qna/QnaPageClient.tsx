"use client";

// /qna 클라이언트 — 검색/카테고리 필터 + 아코디언만 담당.
// qnaData(80KB)는 더 이상 import하지 않고, 서버에서 slug까지 계산된
// items를 props로 받는다 → 클라이언트 번들 경량화.
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  Wallet,
  Landmark,
  Briefcase,
  TrendingUp,
  ChevronDown,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Calculator,
} from "lucide-react";
import type { ElementType } from "react";
import type { QnaItem } from "@/data/qnaData";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export type QnaListItem = QnaItem & { slug: string };

const categories: {
  id: string;
  name: string;
  icon: ElementType;
}[] = [
  { id: "전체", name: "전체보기", icon: HelpCircle },
  { id: "연봉 & 수당", name: "연봉/수당", icon: Wallet },
  { id: "4대보험 & 세금", name: "4대보험/세금", icon: Landmark },
  { id: "퇴직 & 이직", name: "퇴직/이직", icon: Briefcase },
  { id: "연말정산 & 세금", name: "연말정산", icon: Calculator },
  { id: "사회초년생 & 재테크", name: "재테크", icon: TrendingUp },
];

export default function QnaPageClient({ items }: { items: QnaListItem[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(
    items[0]?.slug ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const filteredData = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch =
        activeCategory === "전체" || item.category === activeCategory;
      const searchMatch =
        searchTerm === "" ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.conclusion.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [items, searchTerm, activeCategory]);

  const groupedByCategory = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as Record<string, QnaListItem[]>);
  }, [filteredData]);

  const toggleAccordion = (slug: string) => {
    setActiveSlug(activeSlug === slug ? null : slug);
  };

  return (
    <>
      {/* Search & Filter Section — sticky 제거: 고정 시 광고·본문을 가려 이탈 유발 */}
      <section className="relative z-30 -mt-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl bg-white/80">
            <div className="relative mb-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="궁금한 점을 검색해보세요 (예: 퇴직금, 연말정산)"
                className="w-full pl-14 pr-4 py-4 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg font-medium"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 border ${
                    activeCategory === id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                      : "bg-background hover:bg-secondary text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 검색바 직후 광고 — 사용자 의도 정점 */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <HomeTopAd />
      </div>

      {/* Q&A List Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="space-y-16">
          {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-8 pl-4 border-l-4 border-primary">
                {category}
                <span className="text-sm font-normal text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {categoryItems.length}개
                </span>
              </h2>

              <div className="space-y-4">
                {categoryItems.map((item) => {
                  const isActive = activeSlug === item.slug;

                  return (
                    <div
                      key={item.slug}
                      className={`group rounded-3xl border transition-all duration-300 overflow-hidden ${
                        isActive
                          ? "bg-card border-primary shadow-xl ring-1 ring-primary/20"
                          : "bg-card/50 border-border hover:border-primary/50 hover:bg-card hover:shadow-lg"
                      }`}
                    >
                      <button
                        onClick={() => toggleAccordion(item.slug)}
                        className="w-full flex justify-between items-center p-6 sm:p-8 text-left"
                      >
                        <div className="flex items-start gap-5 pr-4">
                          <span
                            className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-sm ${
                              isActive
                                ? "bg-primary text-primary-foreground scale-110"
                                : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                            }`}
                          >
                            Q
                          </span>
                          <h3
                            className={`text-lg sm:text-xl font-bold transition-colors leading-relaxed ${
                              isActive
                                ? "text-primary"
                                : "text-foreground group-hover:text-primary"
                            }`}
                          >
                            {item.question}
                          </h3>
                        </div>
                        <ChevronDown
                          className={`w-6 h-6 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                            isActive
                              ? "rotate-180 text-primary"
                              : "group-hover:text-primary"
                          }`}
                        />
                      </button>

                      {/* 답변은 항상 DOM에 렌더하고 CSS로만 접는다 — FAQPage 구조화 데이터와 실콘텐츠 일치 */}
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                          isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden min-h-0">
                          <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2 border-t border-border/50">
                            <div className="space-y-8">
                              {/* Conclusion Box */}
                              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                  <GraduationCap className="w-24 h-24" />
                                </div>
                                <div className="flex gap-4 relative z-10">
                                  <span className="text-3xl">💡</span>
                                  <div>
                                    <p className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">
                                      Key Point
                                    </p>
                                    <p className="text-foreground font-bold text-lg leading-relaxed">
                                      {item.answer.conclusion}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="pl-2 sm:pl-4 border-l-2 border-border space-y-6">
                                <h4 className="font-bold text-foreground flex items-center gap-2 text-lg">
                                  <Sparkles className="w-5 h-5 text-primary" />
                                  상세 설명
                                </h4>
                                <ul className="space-y-4 text-muted-foreground">
                                  {item.answer.details.map((detail, i) => (
                                    <li
                                      key={i}
                                      dangerouslySetInnerHTML={{
                                        __html: detail,
                                      }}
                                      className="text-base leading-relaxed [&>strong]:text-foreground [&>strong]:font-bold [&>strong]:bg-secondary/50 [&>strong]:px-1 [&>strong]:rounded"
                                    />
                                  ))}
                                </ul>
                              </div>

                              {/* Tip */}
                              {item.answer.tip && (
                                <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20">
                                  <p className="text-base">
                                    <span className="font-bold text-primary mr-2 flex items-center gap-2 mb-2">
                                      <Sparkles className="w-4 h-4" />
                                      Honey Tip 🍯
                                    </span>
                                    <span className="text-foreground/90 leading-relaxed block">
                                      {item.answer.tip}
                                    </span>
                                  </p>
                                </div>
                              )}

                              {/* Action Button */}
                              <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                  href={item.answer.action.href}
                                  className="group/btn flex items-center justify-center px-8 py-4 bg-foreground hover:bg-primary text-background hover:text-white font-bold rounded-2xl transition-all duration-300 gap-2 shadow-lg hover:shadow-primary/30 hover:-translate-y-1"
                                >
                                  {item.answer.action.text}
                                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                  href={`/qna/${item.slug}`}
                                  className="flex items-center justify-center px-6 py-4 bg-secondary text-foreground font-bold rounded-2xl border border-border hover:border-primary transition-colors gap-2"
                                >
                                  이 질문 전용 페이지 보기
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 페이지 하단 광고 + 쿠팡 — 모든 Q&A 본 후 노출 */}
          {filteredData.length > 0 && (
            <div className="mt-16 max-w-3xl mx-auto">
              <InArticleAd />
              <CoupangBanner
                responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
              />
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="text-center py-32">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                검색 결과가 없습니다
              </h3>
              <p className="text-lg text-muted-foreground">
                다른 키워드로 검색해보시거나 카테고리를 변경해보세요.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
