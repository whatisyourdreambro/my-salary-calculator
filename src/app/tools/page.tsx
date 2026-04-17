import Link from "next/link";
import { Metadata } from "next";
import {
    Calculator,
    Heart,
    Calendar,
    TrendingUp,
    Percent,
    DollarSign,
    Activity,
    Clock,
    Coffee,
    Scale,
    ArrowRightLeft,
    Home,
    Briefcase,
    Fuel,
    Users,
    Dices,
    ArrowRight,
    Zap
} from "lucide-react";
import AdUnit from "@/components/AdUnit";

export const metadata: Metadata = {
    title: "계산기 도구 모음 | Moneysalary",
    description: "금융, 건강, 생활, 수학 등 100여 가지의 유용한 계산기를 한곳에 모았습니다.",
};

const CATEGORIES = [
    {
        id: "finance",
        name: "금융 & 투자",
        description: "부자가 되기 위한 필수 계산기",
        icon: TrendingUp,
        iconColor: "text-slate-800",
        iconBg: "bg-primary/5 dark:bg-primary/30",
        borderColor: "border-primary dark:border-primary/50",
        tools: [
            { name: "대출 이자 계산기", href: "/tools/loan", icon: DollarSign },
            { name: "예적금 계산기", href: "/tools/deposit", icon: Calculator },
            { name: "부가세(VAT) 계산기", href: "/tools/finance/vat", icon: Percent },
            { name: "CAGR(연평균성장률)", href: "/tools/finance/cagr", icon: TrendingUp },
        ],
    },
    {
        id: "real-estate",
        name: "부동산",
        description: "내 집 마련을 위한 필수 도구",
        icon: Home,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50 dark:bg-blue-900/30",
        borderColor: "border-blue-100 dark:border-blue-800/50",
        tools: [
            { name: "DSR 계산기", href: "/tools/real-estate/dsr", icon: Activity },
            { name: "LTV 계산기", href: "/tools/real-estate/ltv", icon: Home },
        ],
    },
    {
        id: "date",
        name: "날짜 & 시간",
        description: "중요한 일정과 시간을 관리",
        icon: Clock,
        iconColor: "text-primary",
        iconBg: "bg-slate-50 dark:bg-primary/30",
        borderColor: "border-primary dark:border-primary/50",
        tools: [
            { name: "D-Day 계산기", href: "/tools/date/d-day", icon: Calendar },
            { name: "만 나이 계산기", href: "/tools/date/age", icon: Users },
            { name: "영업일 계산기", href: "/tools/date/work-days", icon: Briefcase },
        ],
    },
    {
        id: "life",
        name: "생활 & 편의",
        description: "일상을 편리하게 만드는 도구",
        icon: Coffee,
        iconColor: "text-primary",
        iconBg: "bg-primary/5 dark:bg-primary/30",
        borderColor: "border-primary dark:border-primary/50",
        tools: [
            { name: "N빵(더치페이) 계산기", href: "/tools/life/dutch-pay", icon: Users },
            { name: "유류비 계산기", href: "/tools/life/fuel-cost", icon: Fuel },
            { name: "단위 변환기", href: "/tools/life/unit-converter", icon: ArrowRightLeft },
        ],
    },
    {
        id: "math",
        name: "수학 & 랜덤",
        description: "복잡한 계산을 단순하게",
        icon: Calculator,
        iconColor: "text-indigo-600",
        iconBg: "bg-primary/10 dark:bg-primary/30",
        borderColor: "border-indigo-100 dark:border-indigo-800/50",
        tools: [
            { name: "퍼센트 계산기", href: "/tools/math/percent", icon: Percent },
            { name: "랜덤 숫자(로또)", href: "/tools/math/number-gen", icon: Dices },
        ],
    },
    {
        id: "health",
        name: "건강 & 피트니스",
        description: "내 몸을 위한 스마트한 관리",
        icon: Heart,
        iconColor: "text-primary",
        iconBg: "bg-red-50 dark:bg-red-900/30",
        borderColor: "border-red-100 dark:border-red-800/50",
        tools: [
            { name: "BMI 비만도 계산기", href: "/tools/health/bmi", icon: Scale },
            { name: "BMR 기초대사량", href: "/tools/health/bmr", icon: Activity },
            { name: "일일 필요 칼로리", href: "/tools/health/calories", icon: Coffee },
        ],
    },
];

export default function ToolsHubPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#191F28] pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6">
                        <Zap className="w-4 h-4" />
                        100+ 무료 계산기
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">
                        Moneysalary <span className="text-blue-600">Tools</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        금융부터 건강, 생활 편의까지.<br className="hidden sm:block" />
                        당신의 삶에 필요한 <span className="text-slate-900 dark:text-white font-bold">모든 계산기</span>를 준비했습니다.
                    </p>
                </div>

                {/* 상단 광고 */}
                <div className="mb-10">
                    <AdUnit slotId="5492837410" format="auto" label="Tools Hub Top Ad" />
                </div>

                {/* 카테고리 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((category) => (
                        <div
                            key={category.id}
                            className={`toss-card p-7 border ${category.borderColor}`}
                        >
                            {/* 카테고리 헤더 */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-[14px] ${category.iconBg}`}>
                                    <category.icon className={`w-7 h-7 ${category.iconColor}`} />
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-slate-900 dark:text-white">{category.name}</h2>
                                    <p className="text-slate-400 text-sm font-medium">{category.description}</p>
                                </div>
                            </div>

                            {/* 도구 목록 */}
                            <div className="space-y-2">
                                {category.tools.map((tool) => (
                                    <Link
                                        key={tool.name}
                                        href={tool.href}
                                        className="group flex items-center justify-between p-3.5 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-100 dark:hover:border-blue-800/50 transition-all duration-150"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                                                <tool.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                            <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                {tool.name}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 하단 광고 */}
                <div className="mt-14">
                    <AdUnit slotId="1397486615" format="auto" label="Tools Hub Bottom Ad" />
                </div>
            </div>
        </div>
    );
}
