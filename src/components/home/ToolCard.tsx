// src/components/home/ToolCard.tsx
//
// Premium Tools 그리드의 카드.
// Toss 스타일: 큰 아이콘 + 명확한 위계 + subtle hover lift.

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ToolCardProps {
 icon: React.ElementType;
 title: string;
 description: string;
 href: string;
 delay?: number;
 wide?: boolean;
}

export default function ToolCard({
 icon: Icon,
 title,
 description,
 href,
 delay = 0,
 wide = false,
}: ToolCardProps) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
 className={wide ? "md:col-span-2" : ""}
 >
 <Link
 href={href}
 className="group relative flex h-full flex-col gap-3 no-underline no-tap-highlight bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-electric hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
 >
 {/* Top row: 아이콘 + 화살표 */}
 <div className="flex items-start justify-between">
 <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-electric-5 text-electric border border-electric-10 transition-colors duration-200 group-hover:bg-electric group-hover:text-white group-hover:border-electric">
 <Icon className="w-[22px] h-[22px]" aria-hidden="true" />
 </div>
 <span className="flex h-7 w-7 items-center justify-center rounded-full text-faint-blue group-hover:text-electric group-hover:bg-electric-5 transition-all duration-200">
 <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
 </span>
 </div>

 {/* Bottom: 제목 + 설명 */}
 <div className="mt-auto">
 <p className="font-extrabold text-navy dark:text-canvas-50 text-[15.5px] tracking-tight mb-1 group-hover:text-electric transition-colors">
 {title}
 </p>
 <p className="text-[13px] text-muted-blue dark:text-canvas-300 leading-relaxed line-clamp-2">
 {description}
 </p>
 </div>
 </Link>
 </motion.div>
 );
}
