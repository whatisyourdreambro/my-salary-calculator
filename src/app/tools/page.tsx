import Link from "next/link";
import { Metadata } from "next";
import {
    Calculator,
    Heart,
    Calendar,
    Smile,
    TrendingUp,
    Percent,
    DollarSign,
    Activity,
    Clock,
    Coffee,
    GraduationCap,
    Scale,
    ArrowRightLeft,
    Home,
    Briefcase,
    Fuel,
    Users,
    Dices
} from "lucide-react";

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
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        tools: [
            { name: "대출 이자 계산기", href: "/tools/loan", icon: DollarSign },
            { name: "예적금 계산기", href: "/tools/deposit", icon: Calculator },
            { name: "부가세(VAT) 계산기", href: "/tools/finance/vat", icon: Percent },
            { name: "CAGR(연평균성장률)", href: "/tools/finance/cagr", icon: TrendingUp },
            { name: "ROI(투자수익률)", href: "/tools/finance/roi", icon: Activity },
            { name: "적정 주가 계산기", href: "/tools/finance/fair-value", icon: Scale },
        ],
    },
    {
        id: "real-estate",
        name: "부동산 (Real Estate)",
        description: "내 집 마련을 위한 필수 도구",
        icon: Home,
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
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
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        tools: [
            { name: "D-Day 계산기", href: "/tools/date/d-day", icon: Calendar },
            { name: "만 나이 계산기", href: "/tools/date/age", icon: Smile },
            { name: "영업일 계산기", href: "/tools/date/work-days", icon: Briefcase },
        ],
    },
    {
        id: "life",
        name: "생활 & 편의",
        description: "일상을 편리하게 만드는 도구",
        icon: Coffee,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
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
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
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
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        tools: [
            { name: "BMI 비만도 계산기", href: "/tools/health/bmi", icon: Scale },
            { name: "BMR 기초대사량", href: "/tools/health/bmr", icon: Activity },
            { name: "일일 필요 칼로리", href: "/tools/health/calories", icon: Coffee },
            { name: "물 섭취량 계산기", href: "/tools/health/water", icon: Activity },
        ],
    },
];

export default function ToolsHubPage() {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                            Moneysalary
                        </span>{" "}
                        Tools
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        금융부터 건강, 생활 편의까지.<br className="hidden sm:block" />
                        당신의 삶에 필요한 <span className="text-white font-bold">모든 계산기</span>를 준비했습니다.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CATEGORIES.map((category) => (
                        <div
                            key={category.id}
                            className={`rounded-3xl border ${category.border} ${category.bg} p-8 backdrop-blur-sm transition-transform hover:scale-[1.02]`}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-2xl bg-zinc-900/50 ${category.color}`}>
                                    <category.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                                    <p className="text-zinc-400 text-sm">{category.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {category.tools.map((tool) => (
                                    <Link
                                        key={tool.name}
                                        href={tool.href}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                                    >
                                        <div className="p-2 rounded-lg bg-zinc-950 text-zinc-400 group-hover:text-white transition-colors">
                                            <tool.icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-zinc-300 group-hover:text-white">
                                            {tool.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
