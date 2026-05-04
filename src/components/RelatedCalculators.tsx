// src/components/RelatedCalculators.tsx
//
// 페이지 하단 cross-link 추천 카드.
// 결과창 직하 또는 페이지 끝에 배치하여 평균 세션 페이지뷰 증가.

import Link from "next/link";
import {
 ArrowRight,
 Calculator,
 Receipt,
 Home,
 Briefcase,
 Building2,
 Percent,
 Scale,
 CreditCard,
 Gift,
 Laptop,
 Zap,
 TrendingUp,
 PiggyBank,
 Flame,
 Heart,
 Users,
 Fuel,
 RefreshCw,
} from "lucide-react";
import { getRelatedCalculators } from "@/lib/relatedCalculators";

const ICON_MAP: Record<string, React.ElementType> = {
 Calculator,
 Receipt,
 Home,
 Briefcase,
 Building2,
 Percent,
 Scale,
 CreditCard,
 Gift,
 Laptop,
 Zap,
 TrendingUp,
 PiggyBank,
 Flame,
 Heart,
 Users,
 Fuel,
 RefreshCw,
};

interface RelatedCalculatorsProps {
 currentPath: string;
 /** 표시할 개수 (기본 4) */
 limit?: number;
 /** 섹션 제목 (기본: "이런 계산기도 함께 보세요") */
 title?: string;
 className?: string;
}

export default function RelatedCalculators({
 currentPath,
 limit = 4,
 title = "이런 계산기도 함께 보세요",
 className = "",
}: RelatedCalculatorsProps) {
 const items = getRelatedCalculators(currentPath, limit);

 if (items.length === 0) return null;

 return (
 <section className={`my-12 ${className}`}>
 <h2 className="text-lg font-black text-navy mb-4 px-1">
 {title}
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {items.map((item) => {
 const Icon = item.icon ? ICON_MAP[item.icon] || Calculator : Calculator;
 return (
 <Link
 key={item.path}
 href={item.path}
 className="group flex flex-col gap-2 p-4 rounded-2xl bg-white border border-canvas-200 hover:border-electric hover:bg-electric-5 transition-all"
 >
 <div className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center group-hover:bg-electric-10 transition-colors">
 <Icon className="w-5 h-5 text-electric" />
 </div>
 <p className="text-sm font-bold text-navy mt-1 leading-tight">
 {item.title}
 </p>
 <p className="text-xs text-faint-blue line-clamp-2">
 {item.description}
 </p>
 <div className="flex items-center gap-1 text-xs font-bold text-electric mt-auto pt-1">
 바로가기
 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
 </div>
 </Link>
 );
 })}
 </div>
 </section>
 );
}
