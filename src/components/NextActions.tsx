// src/components/NextActions.tsx
//
// 결과창 직하 3-CTA 카드.
// 사용자가 결과를 본 직후 가장 자연스러운 다음 액션 3개를 제시.
// RelatedCalculators보다 더 구체적이고 컨텍스트 인식형.

"use client";

import Link from "next/link";
import { ArrowRight, Home, Building2, Calculator } from "lucide-react";

interface NextActionsProps {
 /** 현재 연봉 (없으면 generic CTA) */
 annualSalary?: number;
 className?: string;
}

export default function NextActions({ annualSalary, className = "" }: NextActionsProps) {
 const formatManwon = (amount: number) =>
 `${Math.round(amount / 10000).toLocaleString("ko-KR")}만원`;

 const actions = annualSalary
 ? [
 {
 icon: Home,
 title: "이 연봉으로 받을 수 있는 대출",
 description: `연봉 ${formatManwon(annualSalary)} → DSR 40% 한도`,
 href: "/home-loan",
 },
 {
 icon: Building2,
 title: "동급 연봉 회사 보기",
 description: "비슷한 연봉대 기업 평균·복지 비교",
 href: "/salary-db",
 },
 {
 icon: Calculator,
 title: "연말정산 환급금 계산",
 description: "13월의 월급 미리 받기",
 href: "/year-end-tax",
 },
 ]
 : [
 {
 icon: Home,
 title: "주택담보대출 계산",
 description: "DSR/LTV 한도와 월 상환액",
 href: "/home-loan",
 },
 {
 icon: Building2,
 title: "회사별 연봉 비교",
 description: "기업 평균·복지·워라밸",
 href: "/salary-db",
 },
 {
 icon: Calculator,
 title: "연말정산 시뮬",
 description: "환급금 미리 계산",
 href: "/year-end-tax",
 },
 ];

 return (
 <section className={`mt-8 ${className}`}>
 <h3 className="text-sm font-black text-navy mb-3 px-1">다음 단계로</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {actions.map((action) => {
 const Icon = action.icon;
 return (
 <Link
 key={action.href}
 href={action.href}
 className="group flex items-start gap-3 p-4 bg-white rounded-2xl border border-canvas-200 hover:border-electric hover:shadow-md transition-all"
 >
 <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-electric-10 flex items-center justify-center group-hover:bg-electric group-hover:text-white transition-colors">
 <Icon className="w-5 h-5 text-electric group-hover:text-white" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-navy text-sm mb-0.5 leading-tight">
 {action.title}
 </p>
 <p className="text-xs text-faint-blue line-clamp-2">
 {action.description}
 </p>
 </div>
 <ArrowRight className="flex-shrink-0 w-4 h-4 text-faint-blue group-hover:text-electric group-hover:translate-x-0.5 transition-all" />
 </Link>
 );
 })}
 </div>
 </section>
 );
}
