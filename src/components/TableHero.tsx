"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import AdUnit from "@/components/AdUnit";

interface TableHeroProps {
    badgeText: string;
    title: React.ReactNode;
    description: React.ReactNode;
    adSlotId?: string;
}

export default function TableHero({ badgeText, title, description, adSlotId = "5492837410" }: TableHeroProps) {
    return (
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden text-center mb-0">
            {/* 배경: 라이트는 밝은 파란 그라데이션, 다크는 딥 네이비 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-[#0f1623] dark:via-[#191F28] dark:to-[#1a2035] -z-10" />

            {/* 블루 글로우 오브 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* 배지 */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6">
                        <TrendingUp className="w-4 h-4" />
                        <span>{badgeText}</span>
                    </div>

                    {/* 타이틀 */}
                    <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-slate-900 dark:text-white">
                        {title}
                    </h1>

                    {/* 서브 텍스트 */}
                    <div className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
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
                    <AdUnit slotId={adSlotId} format="auto" label="Table Hero Ad" />
                </motion.div>
            </div>
        </section>
    );
}
