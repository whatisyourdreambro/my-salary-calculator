"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
interface TableHeroProps {
 badgeText: string;
 title: React.ReactNode;
 description: React.ReactNode;
}

// 상단 여백은 table/2026 layout 의 탭 바가 헤더 높이를 확보하므로 작게 유지
export default function TableHero({ badgeText, title, description }: TableHeroProps) {
 return (
 <section className="relative pt-10 pb-16 sm:pt-12 sm:pb-20 overflow-hidden text-center mb-0 bg-white border-b border-canvas ">
 {/* Top Blue Accent Line instead of old giant glow */}
 <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

 <div className="relative z-10 max-w-3xl mx-auto px-4">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
 >
 {/* 배지 */}
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
 <TrendingUp className="w-4 h-4" />
 <span>{badgeText}</span>
 </div>

 {/* 타이틀 */}
 <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-navy ">
 {title}
 </h1>

 {/* 서브 텍스트 */}
 <div className="text-lg sm:text-xl text-faint-blue leading-relaxed font-medium">
 {description}
 </div>
 </motion.div>
 </div>
 </section>
 );
}
