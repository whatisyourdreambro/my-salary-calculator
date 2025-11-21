"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface TableHeroProps {
    badgeText: string;
    title: React.ReactNode;
    description: React.ReactNode;
}

export default function TableHero({ badgeText, title, description }: TableHeroProps) {
    return (
        <section className="relative py-20 sm:py-28 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white text-center shadow-2xl mb-12">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[100px] -z-10 animate-pulse-glow" />

            <div className="relative z-10 max-w-3xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground font-medium text-sm mb-6">
                        <TrendingUp className="w-4 h-4" />
                        <span>{badgeText}</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                        {title}
                    </h1>
                    <div className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                        {description}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
