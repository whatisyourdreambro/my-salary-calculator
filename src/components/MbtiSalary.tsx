"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Share2, RefreshCw, DollarSign, TrendingUp } from "lucide-react";
import html2canvas from "html2canvas";
import AdUnit from "@/components/AdUnit";

const MBTI_DATA: Record<string, { rank: number; avgSalary: string; desc: string; color: string }> = {
    "ENTJ": { rank: 1, avgSalary: "8,500", desc: "타고난 지도자, 연봉도 1위!", color: "from-purple-600 to-indigo-600" },
    "ESTJ": { rank: 2, avgSalary: "8,200", desc: "현실적인 관리자, 확실한 성과!", color: "from-blue-600 to-cyan-600" },
    "ENTP": { rank: 3, avgSalary: "7,800", desc: "뜨거운 논쟁을 즐기는 변론가!", color: "from-purple-500 to-pink-500" },
    "ISTJ": { rank: 4, avgSalary: "7,500", desc: "청렴결백한 논리주의자!", color: "from-blue-500 to-teal-500" },
    "ESTP": { rank: 5, avgSalary: "7,200", desc: "모험을 즐기는 사업가!", color: "from-yellow-500 to-orange-500" },
    "INTJ": { rank: 6, avgSalary: "7,100", desc: "용의주도한 전략가!", color: "from-purple-700 to-violet-700" },
    "ENFJ": { rank: 7, avgSalary: "6,900", desc: "정의로운 사회운동가!", color: "from-green-500 to-emerald-500" },
    "ISTP": { rank: 8, avgSalary: "6,700", desc: "만능 재주꾼!", color: "from-yellow-600 to-amber-600" },
    "ESFJ": { rank: 9, avgSalary: "6,500", desc: "사교적인 외교관!", color: "from-blue-400 to-sky-400" },
    "ENFP": { rank: 10, avgSalary: "6,300", desc: "재기발랄한 활동가!", color: "from-green-400 to-lime-400" },
    "INFJ": { rank: 11, avgSalary: "6,100", desc: "선의의 옹호자!", color: "from-green-600 to-teal-600" },
    "INTP": { rank: 12, avgSalary: "5,900", desc: "논리적인 사색가!", color: "from-purple-400 to-fuchsia-400" },
    "ISFJ": { rank: 13, avgSalary: "5,700", desc: "용감한 수호자!", color: "from-blue-300 to-cyan-300" },
    "ISFP": { rank: 14, avgSalary: "5,500", desc: "호기심 많은 예술가!", color: "from-yellow-400 to-orange-400" },
    "INFP": { rank: 15, avgSalary: "5,300", desc: "열정적인 중재자!", color: "from-green-300 to-emerald-300" },
    "ESFP": { rank: 16, avgSalary: "5,100", desc: "자유로운 영혼의 연예인!", color: "from-yellow-300 to-amber-300" },
};

export default function MbtiSalary() {
    const [selectedMbti, setSelectedMbti] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleSelect = (mbti: string) => {
        setSelectedMbti(mbti);
        setIsAnalyzing(true);
        setResult(null);

        setTimeout(() => {
            setResult(MBTI_DATA[mbti]);
            setIsAnalyzing(false);
        }, 1500);
    };

    const handleShare = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current, { backgroundColor: "#000000" });
            const link = document.createElement("a");
            link.download = `MBTI_Salary_${selectedMbti}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                    MBTI 연봉 순위
                </h2>
                <p className="text-zinc-400 text-lg">
                    내 MBTI의 평균 연봉은 얼마일까요? 재미로 보는 통계!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Selection Grid */}
                <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Brain className="text-purple-500" /> MBTI 선택
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.keys(MBTI_DATA).map((mbti) => (
                            <button
                                key={mbti}
                                onClick={() => handleSelect(mbti)}
                                className={`p-2 rounded-xl font-bold text-sm transition-all ${selectedMbti === mbti
                                    ? "bg-purple-600 text-white shadow-lg scale-105"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                                    }`}
                            >
                                {mbti}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <AdUnit slotId="9990001111" format="rectangle" label="MBTI Ad" />
                    </div>
                </div>

                {/* Result Section */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {!result && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed"
                            >
                                <Brain className="w-16 h-16 mb-4 opacity-20" />
                                <p>MBTI를 선택하고<br />연봉 순위를 확인하세요!</p>
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 rounded-3xl border border-zinc-800 z-10"
                            >
                                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-purple-400 font-bold animate-pulse">데이터 분석 중...</p>
                            </motion.div>
                        )}

                        {result && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full"
                            >
                                <div
                                    ref={cardRef}
                                    className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden relative p-8"
                                >
                                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${result.color}`} />

                                    <div className="text-center mb-8">
                                        <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${result.color} text-white font-bold text-sm mb-4`}>
                                            RANK #{result.rank}
                                        </div>
                                        <h3 className="text-5xl font-black text-white mb-2 tracking-tight">
                                            {selectedMbti}
                                        </h3>
                                        <p className="text-zinc-400 font-medium">{result.desc}</p>
                                    </div>

                                    <div className="bg-black/50 rounded-2xl p-6 backdrop-blur-sm border border-white/5 mb-6 text-center">
                                        <p className="text-zinc-500 text-sm font-bold mb-2">평균 연봉 (추정)</p>
                                        <div className="flex items-center justify-center gap-2 text-4xl font-black text-white">
                                            <DollarSign className="w-8 h-8 text-green-500" />
                                            {result.avgSalary}만원
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-zinc-600 mb-6">
                                            * 재미로 보는 통계입니다. 실제와 다를 수 있습니다.
                                        </p>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setSelectedMbti(null)}
                                                className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" /> 다시 하기
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className={`flex-1 py-3 bg-gradient-to-r ${result.color} text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg`}
                                            >
                                                <Share2 className="w-4 h-4" /> 공유하기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
