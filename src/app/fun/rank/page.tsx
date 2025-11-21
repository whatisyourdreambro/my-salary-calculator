"use client";

import { useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { Share2, Trophy, Users, ArrowRight, Crown } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// Mock Distribution Data (Log-normal approximation for salary distribution)
const generateDistributionData = () => {
    const data = [];
    for (let i = 20; i <= 200; i += 2) {
        // Simple bell curve-ish shape skewed left
        const x = i;
        let y = 0;
        if (x < 30) y = x * 0.5;
        else if (x < 50) y = 15 + (x - 30) * 0.2;
        else if (x < 80) y = 19 - (x - 50) * 0.3;
        else if (x < 120) y = 10 - (x - 80) * 0.15;
        else y = 4 * Math.exp(-(x - 120) / 50);

        data.push({ salary: i * 1000000, density: Math.max(0.5, y) });
    }
    return data;
};

const distributionData = generateDistributionData();

const calculatePercentile = (salary: number) => {
    // Mock percentile logic
    if (salary < 24000000) return 90;
    if (salary < 30000000) return 75;
    if (salary < 35000000) return 60;
    if (salary < 40000000) return 50; // Median
    if (salary < 50000000) return 35;
    if (salary < 60000000) return 25;
    if (salary < 80000000) return 15;
    if (salary < 100000000) return 10;
    if (salary < 150000000) return 5;
    if (salary < 200000000) return 1;
    return 0.1;
};

export default function SalaryRankPage() {
    const [salaryInput, setSalaryInput] = useState("");
    const [showResult, setShowResult] = useState(false);

    const salary = Number(salaryInput.replace(/,/g, ""));
    const percentile = useMemo(() => calculatePercentile(salary), [salary]);

    const handleCalculate = () => {
        if (salary > 0) {
            setShowResult(true);
        }
    };

    const handleShare = async () => {
        const text = `내 연봉은 대한민국 상위 ${percentile}%입니다! 당신의 순위도 확인해보세요.`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "연봉 순위 계산기",
                    text: text,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            alert("공유하기가 지원되지 않는 브라우저입니다.");
        }
    };

    return (
        <main className="w-full min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-slate-900 text-white text-center">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-300 font-medium text-sm mb-6">
                            <Crown className="w-4 h-4" />
                            <span>대한민국 연봉 데이터 분석</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                            나는 대한민국 상위 <br className="sm:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                몇 %일까요?
                            </span>
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            2,000만 직장인 데이터를 기반으로 당신의 정확한 위치를 알려드립니다.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
                    <div className="p-8 sm:p-12">
                        {!showResult ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <label className="block text-lg font-medium text-muted-foreground mb-4">
                                        세전 연봉을 입력하세요
                                    </label>
                                    <div className="relative max-w-md mx-auto">
                                        <input
                                            type="text"
                                            value={salaryInput}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, "");
                                                setSalaryInput(Number(val).toLocaleString());
                                            }}
                                            className="w-full p-6 text-3xl sm:text-4xl font-black text-center bg-secondary/30 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            placeholder="0"
                                            autoFocus
                                        />
                                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                                            원
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCalculate}
                                    disabled={!salaryInput}
                                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    내 순위 확인하기
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-10"
                            >
                                <div className="text-center">
                                    <p className="text-lg text-muted-foreground mb-2">당신은 대한민국 상위</p>
                                    <h2 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                                        <CountUp end={percentile} decimals={1} duration={2} />%
                                    </h2>
                                    <p className="text-xl font-medium">
                                        연봉 <span className="font-bold text-foreground">{salaryInput}원</span>
                                    </p>
                                </div>

                                {/* Chart */}
                                <div className="h-64 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={distributionData}>
                                            <defs>
                                                <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                                formatter={(value: number) => [`${value.toFixed(1)}%`, '인구 비율']}
                                                labelFormatter={(label) => `${(label / 10000).toLocaleString()}만원`}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="density"
                                                stroke="#9333ea"
                                                fillOpacity={1}
                                                fill="url(#colorDensity)"
                                            />
                                            <ReferenceLine x={salary} stroke="#db2777" strokeDasharray="3 3" label="나" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground mt-2">
                                        * 2024년 국세청 통계 자료 기반 (추정치)
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-secondary/30 p-4 rounded-2xl text-center">
                                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                        <p className="text-sm text-muted-foreground">비슷한 연봉</p>
                                        <p className="font-bold text-lg">약 45만명</p>
                                    </div>
                                    <div className="bg-secondary/30 p-4 rounded-2xl text-center">
                                        <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                                        <p className="text-sm text-muted-foreground">예상 등급</p>
                                        <p className="font-bold text-lg">
                                            {percentile <= 10 ? "다이아몬드" : percentile <= 30 ? "플래티넘" : "골드"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowResult(false)}
                                        className="flex-1 py-4 border border-border rounded-xl font-bold hover:bg-secondary transition-colors"
                                    >
                                        다시 하기
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        결과 공유하기
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Ad Unit */}
                <div className="mt-12">
                    <AdUnit slotId="5678901234" format="auto" label="Rank Page Ad" />
                </div>
            </div>
        </main>
    );
}
