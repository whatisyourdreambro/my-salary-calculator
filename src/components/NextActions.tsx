// src/components/NextActions.tsx
//
// 결과창 직하 3-CTA 카드.
// 사용자가 결과를 본 직후 가장 자연스러운 다음 액션 3개를 제시.
// RelatedCalculators보다 더 구체적이고 컨텍스트 인식형.

"use client";

import Link from "next/link";
import {
 ArrowRight,
 Home,
 Building2,
 Calculator,
 Shield,
 TrendingUp,
 PiggyBank,
 Receipt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NextActionCategory =
 | "salary"
 | "loan"
 | "tax"
 | "insurance"
 | "investment"
 | "real-estate";

interface NextActionsProps {
 /** 현재 연봉 (없으면 generic CTA) */
 annualSalary?: number;
 /** 컨텍스트 카테고리 — 카테고리별로 다른 3 CTA 표시 */
 category?: NextActionCategory;
 className?: string;
}

interface ActionItem {
 icon: LucideIcon;
 title: string;
 description: string;
 href: string;
}

function buildActions(
 category: NextActionCategory | undefined,
 annualSalary: number | undefined
): ActionItem[] {
 const formatManwon = (amount: number) =>
 `${Math.round(amount / 10000).toLocaleString("ko-KR")}만원`;
 const dsrLimit = annualSalary
 ? Math.round((annualSalary * 0.4) / 10000).toLocaleString("ko-KR")
 : null;

 // 카테고리별 분기
 if (category === "loan" || category === "real-estate") {
 return [
 {
 icon: Home,
 title: "주택담보대출 한도",
 description: dsrLimit
 ? `DSR 40% 기준 연 ${dsrLimit}만원 한도`
 : "DSR/LTV 한도와 월 상환액",
 href: "/home-loan",
 },
 {
 icon: PiggyBank,
 title: "전세자금대출 비교",
 description: "전세금 80% · 금리 비교",
 href: "/calc/jeonse-loan",
 },
 {
 icon: Calculator,
 title: "원리금 균등 상환 계산",
 description: "월 상환액·총이자 분석",
 href: "/calc/loan-amortization",
 },
 ];
 }
 if (category === "tax") {
 return [
 {
 icon: Receipt,
 title: "연말정산 환급금 계산",
 description: "13월의 월급 미리 받기",
 href: "/year-end-tax-2026",
 },
 {
 icon: Calculator,
 title: "종합소득세 신고 도움",
 description: "5월 종소세 환급 시뮬",
 href: "/calc/comprehensive-income-tax",
 },
 {
 icon: Building2,
 title: "이 회사 연봉으로 환급은?",
 description: "회사별 평균 환급액 비교",
 href: "/salary-db",
 },
 ];
 }
 if (category === "insurance") {
 return [
 {
 icon: Shield,
 title: "건강보험료 자동 계산",
 description: "직장/지역 가입자 비교",
 href: "/calc/health-insurance-2026",
 },
 {
 icon: Calculator,
 title: "실비보험 적정 보험료",
 description: "나이/성별 평균 보험료",
 href: "/calc/insurance-premium",
 },
 {
 icon: PiggyBank,
 title: "노후 대비 보험 시뮬",
 description: "은퇴 후 필요 자금 분석",
 href: "/fire-calculator",
 },
 ];
 }
 if (category === "investment") {
 return [
 {
 icon: TrendingUp,
 title: "복리 시뮬레이션",
 description: "월 적립 → 10년 후 자산",
 href: "/calc/compound-interest",
 },
 {
 icon: Calculator,
 title: "주식 양도세 계산",
 description: "2026 금투세 기준",
 href: "/calc/stock-tax",
 },
 {
 icon: PiggyBank,
 title: "FIRE 은퇴 자금 계산",
 description: "조기 은퇴 필요 자산",
 href: "/fire-calculator",
 },
 ];
 }

 // 기본(salary 또는 미지정) — 연봉 보유 여부에 따른 CTA
 return annualSalary
 ? [
 {
 icon: Home,
 title: "이 연봉으로 받을 수 있는 대출",
 description: dsrLimit
 ? `DSR 40% 기준 연 ${dsrLimit}만원 한도`
 : `연봉 ${formatManwon(annualSalary)} → DSR 40% 한도`,
 href: "/home-loan",
 },
 {
 icon: Building2,
 title: "동급 연봉 회사 보기",
 description: "비슷한 연봉대 기업 평균·복지 비교",
 href: "/salary-db",
 },
 {
 icon: Receipt,
 title: "연말정산 환급금 계산",
 description: "13월의 월급 미리 받기",
 href: "/year-end-tax-2026",
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
 href: "/year-end-tax-2026",
 },
 ];
}

export default function NextActions({
 annualSalary,
 category,
 className = "",
}: NextActionsProps) {
 const actions = buildActions(category, annualSalary);

 return (
 <section className={`mt-8 ${className}`}>
 <h3 className="text-sm font-black text-navy mb-3 px-1">다음 단계로</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {actions.map((action) => {
 const Icon = action.icon;
 return (
 <Link
 key={action.href + action.title}
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
