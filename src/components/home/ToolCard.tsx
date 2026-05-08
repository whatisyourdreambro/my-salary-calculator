// src/components/home/ToolCard.tsx
//
// 메인 페이지 Premium Tools 그리드의 카드 컴포넌트.
// duotone-card 유틸 기반으로 SSR/다크모드 일관성 확보.

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ToolCardProps {
 icon: React.ElementType;
 title: string;
 description: string;
 href: string;
 iconBg?: string;
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
 transition={{ duration: 0.4, delay }}
 className={wide ? "md:col-span-2" : ""}
 >
 <Link
 href={href}
 className="duotone-card no-tap-highlight flex items-center gap-4 px-5 py-4 hover:-translate-y-0.5 group"
 >
 <div className="flex items-center justify-center flex-shrink-0 w-[46px] h-[46px] rounded-xl bg-electric-5 text-electric border border-electric/20 group-hover:bg-electric-10 transition-colors">
 <Icon className="w-[22px] h-[22px]" />
 </div>

 <div className="flex-1 min-w-0">
 <p className="font-bold text-navy text-[15px] tracking-tight mb-0.5 truncate">
 {title}
 </p>
 <p className="text-faint-blue text-[13.5px] truncate">
 {description}
 </p>
 </div>

 <ChevronRight className="text-faint-blue group-hover:text-electric flex-shrink-0 w-4 h-4 transition-colors" />
 </Link>
 </motion.div>
 );
}
