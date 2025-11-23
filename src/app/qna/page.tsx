"use client";

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
  MessageCircle,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ElementType } from "react";
import { qnaData, QnaItem } from "@/data/qnaData";

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

import { Calculator } from "lucide-react";

export default function QnAPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const filteredData = useMemo(() => {
    return qnaData.filter((item) => {
      const categoryMatch =
        activeCategory === "전체" || item.category === activeCategory;
      const searchMatch =
        searchTerm === "" ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.conclusion.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [searchTerm, activeCategory]);

  const groupedByCategory = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as Record<string, typeof qnaData>);
  }, [filteredData]);

  const toggleAccordion = (question: string) => {
    // Find the global index of the item with this question
    const globalIndex = qnaData.findIndex((item) => item.question === question);
    setActiveIndex(activeIndex === globalIndex ? null : globalIndex);
  };

  return (
    <div className="w-full space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden rounded-b-[3rem] bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white text-center shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[100px] -z-10 animate-pulse-glow" />

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground font-medium text-sm mb-6">
              <MessageCircle className="w-4 h-4" />
              <span>무엇이든 물어보세요</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              금융에 대한 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">모든 질문과 해답</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-light">
              급여, 세금, 퇴직금부터 재테크까지.<br className="hidden sm:block" />
              알아두면 피가 되고 살이 되는 금융 지식을 명쾌하게 알려드립니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="sticky top-24 z-30 -mt-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl bg-white/80 dark:bg-black/80"
          >
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
                  className={`px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 border ${activeCategory === id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                    : "bg-background hover:bg-secondary text-muted-foreground border-border hover:border-primary/50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Q&A List Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="space-y-16">
          {Object.entries(groupedByCategory).map(([category, items], sectionIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-8 pl-4 border-l-4 border-primary">
                {category}
                <span className="text-sm font-normal text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {items.length}개
                </span>
              </h2>

              <div className="space-y-4">
                {items.map((item, index) => {
                  const globalIndex = qnaData.findIndex(
                    (q) => q.question === item.question
                  );
                  const isActive = activeIndex === globalIndex;

                  return (
                    <motion.div
                      key={index}
                      layout
                      className={`group rounded-3xl border transition-all duration-300 overflow-hidden ${isActive
                        ? "bg-card border-primary shadow-xl ring-1 ring-primary/20"
                        : "bg-card/50 border-border hover:border-primary/50 hover:bg-card hover:shadow-lg"
                        }`}
                    >
                      <button
                        onClick={() => toggleAccordion(item.question)}
                        className="w-full flex justify-between items-center p-6 sm:p-8 text-left"
                      >
                        <div className="flex items-start gap-5 pr-4">
                          <span className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-sm ${isActive ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                            }`}>
                            Q
                          </span>
                          <h3 className={`text-lg sm:text-xl font-bold transition-colors leading-relaxed ${isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                            }`}>
                            {item.question}
                          </h3>
                        </div>
                        <ChevronDown
                          className={`w-6 h-6 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isActive ? "rotate-180 text-primary" : "group-hover:text-primary"
                            }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
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
                                      <p className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Key Point</p>
                                      <p className="text-foreground font-bold text-lg leading-relaxed">
                                        {item.answer.conclusion}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Details */}
                                <div className="pl-2 sm:pl-4 border-l-2 border-border space-y-6">
                                  <h4 className="font-bold text-foreground flex items-center gap-2 text-lg">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
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
                                  <div className="p-5 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                                    <p className="text-base">
                                      <span className="font-bold text-yellow-600 dark:text-yellow-400 mr-2 flex items-center gap-2 mb-2">
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
                                <Link
                                  href={item.answer.action.href}
                                  className="group/btn flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-foreground hover:bg-primary text-background hover:text-white font-bold rounded-2xl transition-all duration-300 gap-2 mx-auto sm:mx-0 shadow-lg hover:shadow-primary/30 hover:-translate-y-1"
                                >
                                  {item.answer.action.text}
                                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

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
    </div>
  );
}
