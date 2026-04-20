"use client";

import { useState, useMemo } from "react";
import {
 Search,
 Sparkles,
 BookOpen,
 Share2,
 RotateCw,
 Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { glossaryData } from "@/data/glossaryData";

const categories = [
 "전체",
 "4대 보험 & 세금",
 "급여 & 근로기준법",
 "금융 & 투자",
 "부동산 & 대출",
 "경제 용어",
];

export default function GlossaryPage() {
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedCategory, setSelectedCategory] = useState("전체");
 const [randomTerm, setRandomTerm] = useState(glossaryData[0]);

 const filteredData = useMemo(() => {
 return glossaryData.filter((item) => {
 const matchesSearch =
 item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.summary.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesCategory =
 selectedCategory === "전체" || item.category === selectedCategory;
 return matchesSearch && matchesCategory;
 });
 }, [searchTerm, selectedCategory]);

 const handleRandomTerm = () => {
 const randomIndex = Math.floor(Math.random() * glossaryData.length);
 setRandomTerm(glossaryData[randomIndex]);
 };

 const handleShare = (title: string) => {
 if (navigator.share) {
 navigator.share({
 title: `머니샐러리 용어사전: ${title}`,
 text: `${title}에 대해 알아보세요!`,
 url: window.location.href,
 });
 } else {
 alert("브라우저가 공유 기능을 지원하지 않습니다.");
 }
 };

 return (
 <main className="w-full bg-canvas -[#191F28] min-h-screen pb-20">
 {/* Hero Section */}
 <section className="relative pt-28 pb-16 overflow-hidden text-center">
 <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary/80 -[#0f1623] -[#191F28] -[#1a2035] -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 /100/15 rounded-full blur-[120px] -z-10" />

 <div className="relative z-10 max-w-4xl mx-auto px-4">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/100/10 border border-electric/20 text-electric 400 font-bold text-sm mb-6">
 <BookOpen className="w-4 h-4" />
 <span>금융 문맹 탈출 프로젝트</span>
 </div>
 <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-navy mb-5 leading-[1.15]">
 금융 용어, <br className="sm:hidden" />
 <span className="text-electric">당신의 돈이 말을 거는 순간</span>
 </h1>
 <p className="text-lg sm:text-xl text-faint-blue leading-relaxed max-w-2xl mx-auto font-medium">
 더 이상 어렵고 복잡한 용어에 주눅 들지 마세요. <br className="hidden sm:block" />
 당신의 월급봉투와 통장, 그리고 미래를 이해하는 가장 확실한 열쇠를 드립니다.
 </p>
 </motion.div>

 {/* Search Bar */}
 <motion.div
 className="mt-10 max-w-xl mx-auto relative"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.2 }}
 >
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-faint-blue w-5 h-5 pointer-events-none" />
 <input
 type="text"
 placeholder="궁금한 용어를 검색해보세요 (예: 국민연금, IRP)"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="toss-input pl-14"
 />
 </motion.div>
 </div>
 </section>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
 {/* Today's Term Card */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="max-w-3xl mx-auto mb-16"
 >
 <div className="bg-gradient-to-br from-[#EDF1F5] to-[#DDE4EC] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
 <Sparkles className="w-32 h-32 text-primary" />
 </div>

 <div className="flex items-center justify-between mb-6 relative z-10">
 <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
 <Sparkles className="w-4 h-4" />
 <span>Today's Pick</span>
 </div>
 <button
 onClick={handleRandomTerm}
 className="p-2 hover:bg-white/10 rounded-full transition-colors text-faint-blue hover:text-navy"
 title="다른 용어 보기"
 >
 <RotateCw className="w-5 h-5" />
 </button>
 </div>

 <div className="relative z-10">
 <div className="flex items-center gap-4 mb-4">
 <div className="p-3 bg-primary/20 rounded-2xl text-primary">
 <randomTerm.icon className="w-8 h-8" />
 </div>
 <h2 className="text-3xl font-bold text-navy">{randomTerm.title}</h2>
 </div>
 <p className="text-xl text-faint-blue font-light italic mb-6">
 &quot;{randomTerm.summary}&quot;
 </p>
 <div className="bg-white/5 rounded-xl p-6 border border-white/5">
 <p className="text-faint-blue leading-relaxed">
 {randomTerm.content}
 </p>
 </div>
 </div>
 </div>
 </motion.div>

 {/* Category Filter */}
 <div className="flex flex-wrap justify-center gap-3 mb-12">
 {categories.map((category, index) => (
 <motion.button
 key={category}
 onClick={() => setSelectedCategory(category)}
 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedCategory === category
 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background"
 : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border hover:border-primary/50"
 }`}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: index * 0.05 }}
 >
 {category}
 </motion.button>
 ))}
 </div>

 {/* Ad Unit */}
 

 {/* Glossary Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <AnimatePresence mode="popLayout">
 {filteredData.map((item, index) => (
 <motion.div
 key={item.title}
 layout
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 transition={{ duration: 0.3, delay: index * 0.05 }}
 className="group relative bg-card/50 backdrop-blur-sm /30 border border-border/50 rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
 >
 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

 <div className="relative z-10 flex-1">
 <div className="flex items-start justify-between mb-5">
 <div className="p-3 bg-secondary/50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
 <item.icon className="w-6 h-6" />
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => handleShare(item.title)}
 className="p-2 text-muted-foreground hover:text-primary transition-colors"
 >
 <Share2 size={16} />
 </button>
 </div>
 </div>

 <div className="mb-4">
 <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50">
 {item.category}
 </span>
 </div>

 <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors tracking-tight">
 {item.title}
 </h3>

 <p className="text-sm font-medium text-muted-foreground mb-6 italic border-l-2 border-primary/30 pl-3">
 &quot;{item.summary}&quot;
 </p>

 <p className="text-base text-foreground/80 leading-relaxed mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">
 {item.content}
 </p>
 </div>

 <div className="relative z-10 space-y-3 pt-6 border-t border-border/50 mt-auto">
 <div className="bg-secondary/30 p-4 rounded-2xl">
 <p className="text-sm text-foreground/90">
 <span className="font-bold flex items-center gap-2 mb-2 text-foreground">
 <Hash className="w-4 h-4 text-muted-foreground" />
 쉽게 말하면
 </span>
 {item.analogy}
 </p>
 </div>
 <div className="bg-primary/5 p-4 rounded-2xl border border-electric/10">
 <p className="text-sm text-foreground/90">
 <span className="font-bold text-electric flex items-center gap-2 mb-2">
 <Sparkles className="w-4 h-4" />
 Honey Tip
 </span>
 {item.tip}
 </p>
 </div>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>

 {filteredData.length === 0 && (
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
 </main>
 );
}
