"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
interface TableHeroProps {
 badgeText: string;
 title: React.ReactNode;
 description: React.ReactNode;
 adSlotId?: string;
}

export default function TableHero({ badgeText, title, description, adSlotId = "5492837410" }: TableHeroProps) {
 return (
 <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden text-center mb-0 bg-white border-b border-canvas ">
 {/* Top Blue Accent Line instead of old giant glow */}
 <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

 <div className="relative z-10 max-w-3xl mx-auto px-4">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
 >
 {/* 배지 */}
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 /20 border border-electric/20 text-electric 400 font-bold text-sm mb-6">
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

 {/* 상단 인피드 광고 */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.4 }}
 className="mt-10"
 >
 </motion.div>
 </div>
 </section>
 );
}
