"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, RefreshCw, Trophy, TrendingUp, Users } from "lucide-react";
import { calculateSalaryRank } from "@/data/salaryRankData";
import AdUnit from "@/components/AdUnit";

export default function SalaryRankCalculator() {
    const [salary, setSalary] = useState("");
    const [ageGroup, setAgeGroup] = useState("30s");
    const [result, setResult] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleCalculate = () => {
        const salaryVal = Number(salary.replace(/[^0-9]/g, ""));
        if (!salaryVal) return;

        setIsCalculating(true);
        setTimeout(() => {
            const rank = calculateSalaryRank(ageGroup, salaryVal);
            setResult(rank);
            setIsCalculating(false);
        }, 1500);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: '내 연봉 티어 확인',
                text: `내 연봉은 상위 몇 %일까요? 나의 티어는 [${result.name}] 입니다! #Moneysalary #연봉서열`,
                url: window.location.href,
            });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                        정보 입력
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">나이대</label>
                            <div className="grid grid-cols-4 gap-2">
                                {["20s", "30s", "40s", "50s"].map((age) => (
                                    <button
                                        key={age}
                                        onClick={() => setAgeGroup(age)}
                                        className={`p-3 rounded-xl font-bold transition-all ${ageGroup === age
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                            }`}
                                    >
                                        {age.replace("s", "대")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">연봉 (원)</label>
                            <input
                                type="text"
                                value={salary}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    setSalary(Number(val).toLocaleString());
                                }}
                                className="w-full p-4 text-2xl font-bold bg-black border border-zinc-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-zinc-700 transition-colors"
                                placeholder="0"
                            />
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={isCalculating || !salary}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xl rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCalculating ? "분석 중..." : "내 티어 확인하기"}
                        </button>
                    </div>

                    {/* Ad Unit */}
                    <div className="mt-8">
                        <AdUnit slotId="5556667777" format="rectangle" label="Salary Rank Input Ad" />
                    </div>
                </div>

                {/* Result Section */}
                <div className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {!result && !isCalculating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed"
                            >
                                <Trophy className="w-16 h-16 mb-4 opacity-20" />
                                <p>연봉을 입력하고<br />나의 위치를 확인해보세요!</p>
                            </motion.div>
                        )}

                        {isCalculating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 rounded-3xl border border-zinc-800 z-10"
                            >
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-blue-400 font-bold animate-pulse">대한민국 데이터 분석 중...</p>
                            </motion.div>
                        )}

                        {result && !isCalculating && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full h-full bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden relative"
                            >
                                {/* Background Glow */}
                                <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${result.color} opacity-20 blur-3xl`} />

                                <div className="p-8 relative z-10 flex flex-col h-full">
                                    <div className="text-center mb-8">
                                        <p className="text-zinc-400 text-sm font-bold mb-2">당신의 연봉 계급은</p>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                                            className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${result.color} drop-shadow-lg`}
                                        >
                                            {result.name}
                                        </motion.div>
                                        <div className="text-4xl mt-4">{result.icon}</div>
                                    </div>

                                    <div className="bg-black/50 rounded-2xl p-6 backdrop-blur-sm border border-white/5 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-zinc-400">상위</span>
                                            <span className="text-2xl font-bold text-white">{result.percentile}%</span>
                                        </div>
                                        <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${100 - result.percentile}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className={`h-full bg-gradient-to-r ${result.color}`}
                                            />
                                        </div>
                                        <p className="text-center text-zinc-300 mt-4 font-medium">
                                            "{result.message}"
                                        </p>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setResult(null)}
                                            className="py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" /> 다시 하기
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className={`py-3 bg-gradient-to-r ${result.color} text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg`}
                                        >
                                            <Share2 className="w-4 h-4" /> 자랑하기
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-zinc-500 text-xs mt-8">
                * 본 결과는 통계청 자료 등을 바탕으로 추정한 근사치이며, 실제와 다를 수 있습니다.<br />
                재미로만 봐주세요!
            </p>
        </div>
    );
}
