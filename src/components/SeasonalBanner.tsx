// src/components/SeasonalBanner.tsx
//
// 현재 월을 기반으로 가장 관련성 높은 시즌 페이지를 자동 노출.
// 메인 페이지/계산기 페이지에서 시즌 트래픽 유도.

import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

interface SeasonalContent {
 month: number[]; // 1-12
 title: string;
 subtitle: string;
 href: string;
 cta: string;
}

const SEASONAL_CALENDAR: SeasonalContent[] = [
 {
 month: [4, 5],
 title: "5월 종합소득세 신고",
 subtitle: "프리랜서·N잡러는 5/31까지 꼭 신고해야 환급 가능",
 href: "/year-end-tax-2026",
 cta: "신고 가이드 보기",
 },
 {
 month: [6, 7],
 title: "7월 건강보험료 정산",
 subtitle: "작년 소득 기준 정산금이 7월 급여에서 차감/환급",
 href: "/health-insurance-2026",
 cta: "정산 가이드 보기",
 },
 {
 month: [11, 12, 1],
 title: "12월 연말정산 + 성과급",
 subtitle: "13월의 월급 극대화하는 6대 점검 항목",
 href: "/year-end-tax-settlement-2026",
 cta: "절세 가이드 보기",
 },
 {
 month: [2, 3],
 title: "3월 신입 연봉 협상",
 subtitle: "직군별 평균 초봉과 ±10% 협상법",
 href: "/new-employee-2026",
 cta: "협상 가이드 보기",
 },
];

function getCurrentSeasonal(): SeasonalContent | null {
 const month = new Date().getMonth() + 1;
 return SEASONAL_CALENDAR.find((s) => s.month.includes(month)) || null;
}

interface SeasonalBannerProps {
 className?: string;
}

export default function SeasonalBanner({ className = "" }: SeasonalBannerProps) {
 const seasonal = getCurrentSeasonal();
 if (!seasonal) return null;

 return (
 <section className={`px-4 sm:px-6 lg:px-8 ${className}`}>
 <Link
 href={seasonal.href}
 className="group flex items-center justify-between gap-4 max-w-5xl mx-auto p-5 sm:p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
 >
 <div className="flex items-start gap-4 min-w-0">
 <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
 <Calendar className="w-6 h-6" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-bold opacity-80 mb-1">시즌 핫 이슈</p>
 <p className="font-black text-base sm:text-lg mb-1 truncate">
 {seasonal.title}
 </p>
 <p className="text-xs sm:text-sm opacity-90 line-clamp-2">
 {seasonal.subtitle}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2 flex-shrink-0">
 <span className="hidden sm:inline text-xs font-bold opacity-90">
 {seasonal.cta}
 </span>
 <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
 </div>
 </Link>
 </section>
 );
}
