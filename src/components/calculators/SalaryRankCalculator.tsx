"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, RefreshCw, Trophy, TrendingUp, Users, Crown, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";
import { calculateSalaryRank } from "@/data/salaryRankData";
import AdUnit from "@/components/AdUnit";
import html2canvas from "html2canvas";

export default function SalaryRankCalculator() {
    const [salary, setSalary] = useState("");
    const [ageGroup, setAgeGroup] = useState("30s");
    const [result, setResult] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleCalculate = () => {
        const salaryVal = Number(salary.replace(/[^0-9]/g, ""));
        if (!salaryVal) return;

        setIsCalculating(true);
        setTimeout(() => {
            const rank = calculateSalaryRank(ageGroup, salaryVal);
            setResult(rank);
            setIsCalculating(false);
        }, 2000); // Longer suspense for premium feel
    };

    const handleShare = async () => {
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, {
                    backgroundColor: "#000000",
                    scale: 2
                });
                const link = document.createElement("a");
                link.download = "Moneysalary_Tier_Card.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            } catch (e) {
                console.error("Share failed", e);
            }
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-500/30 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                    <Crown className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-4 tracking-tight">
                    Private Salary Ranking
                </h2>
                <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
                    대한민국 상위 1%를 향한 여정. 귀하의 연봉 위치를 프라이빗하게 분석해드립니다.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Input Section */}
                <div className="bg-zinc-950 rounded-[2.5rem] p-8 sm:p-10 border border-zinc-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />

                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                        <CreditCard className="w-6 h-6 text-yellow-500" />
                        <span className="font-serif tracking-wide">ENTER DETAILS</span>
                    </h3>

                    <div className="space-y-8 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Age Group</label>
                            <div className="grid grid-cols-4 gap-3">
                                {["20s", "30s", "40s", "50s"].map((age) => (
                                    <button
                                        key={age}
                                        onClick={() => setAgeGroup(age)}
                                        className={`py-4 rounded-2xl font-bold transition-all duration-300 ${ageGroup === age
                                            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105"
                                            : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                                            }`}
                                    >
                                        {age.replace("s", "")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Annual Salary (KRW)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={salary}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        setSalary(Number(val).toLocaleString());
                                    }}
                                    className="w-full p-6 text-3xl font-black bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-yellow-500/50 outline-none text-white placeholder-zinc-800 transition-all text-right tracking-tight"
                                    placeholder="0"
                                />
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-serif text-xl">₩</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={isCalculating || !salary}
                            className="w-full py-6 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 group"
                        >
                            {isCalculating ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                                    ANALYZING...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" /> ANALYZE RANK
                                </>
                            )}
                        </button>
                    </div>

                    {/* Ad Unit */}
                    <div className="mt-10 pt-8 border-t border-zinc-900">
                        <AdUnit slotId="5556667777" format="rectangle" label="Salary Rank Input Ad" />
                    </div>
                </div>

                {/* Result Section */}
                <div className="relative min-h-[600px] perspective-1000">
                    <AnimatePresence mode="wait">
                        {!result && !isCalculating && (
                            <motion.div
                                initial={{ opacity: 0, rotateX: 20 }}
                                animate={{ opacity: 1, rotateX: 0 }}
                                exit={{ opacity: 0, rotateX: -20 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 bg-zinc-950 rounded-[2.5rem] border border-zinc-900 border-dashed"
                            >
                                <Crown className="w-24 h-24 mb-6 opacity-10" />
                                <p className="font-serif text-xl opacity-50">Awaiting Data Input...</p>
                            </motion.div>
                        )}

                        {isCalculating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 rounded-[2.5rem] border border-zinc-800 z-20"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-zinc-800 rounded-full" />
                                    <div className="absolute inset-0 w-24 h-24 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(234,179,8,0.4)]" />
                                </div>
                                <p className="text-yellow-500 font-bold mt-8 animate-pulse tracking-widest text-sm">ACCESSING GLOBAL DB...</p>
                            </motion.div>
                        )}

                        {result && !isCalculating && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                                className="w-full h-full relative"
                            >
                                {/* The Black Card */}
                                <div
                                    ref={cardRef}
                                    className="w-full bg-black rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden relative p-8 sm:p-10 flex flex-col h-full"
                                >
                                    {/* Card Texture */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                    <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${result.color} opacity-20 blur-[100px] pointer-events-none`} />

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-12 relative z-10">
                                        <div>
                                            <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] mb-2">MEMBERSHIP TIER</p>
                                            <h3 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${result.color} tracking-tight`}>
                                                {result.name.toUpperCase()}
                                            </h3>
                                        </div>
                                        <div className="w-16 h-10 bg-zinc-800/50 rounded-lg border border-white/10 flex items-center justify-center">
                                            <div className="w-10 h-6 bg-gradient-to-br from-yellow-200 to-yellow-600 rounded opacity-80" />
                                        </div>
                                    </div>

                                    {/* Main Stat */}
                                    <div className="mb-12 relative z-10">
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-7xl font-black text-white tracking-tighter">
                                                {result.percentile}%
                                            </span>
                                            <span className="text-zinc-400 font-medium text-lg">Top Percentile</span>
                                        </div>
                                        <div className="w-full h-3 bg-zinc-900 rounded-full mt-6 overflow-hidden border border-zinc-800">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${100 - result.percentile}%` }}
                                                transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                                                className={`h-full bg-gradient-to-r ${result.color} shadow-[0_0_20px_rgba(255,255,255,0.5)]`}
                                            />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-8 mb-auto relative z-10">
                                        <div>
                                            <p className="text-zinc-600 text-xs font-bold uppercase mb-2">Peer Comparison</p>
                                            <p className="text-white font-medium leading-relaxed">
                                                You earn more than <span className="text-yellow-500 font-bold">{100 - result.percentile}%</span> of people in their {ageGroup.replace("s", "0s")}.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-zinc-600 text-xs font-bold uppercase mb-2">Status</p>
                                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                                <CheckCircle2 className="w-5 h-5" />
                                                VERIFIED
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-end relative z-10">
                                        <div>
                                            <p className="text-zinc-600 text-[10px] font-mono mb-1">CARD HOLDER</p>
                                            <p className="text-zinc-300 font-mono tracking-widest">ANONYMOUS VIP</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-zinc-600 text-[10px] font-mono mb-1">VALID THRU</p>
                                            <p className="text-zinc-300 font-mono">12/99</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="absolute -bottom-20 left-0 right-0 flex gap-4">
                                    <button
                                        onClick={() => setResult(null)}
                                        className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2 border border-zinc-800"
                                    >
                                        <RefreshCw className="w-4 h-4" /> RESET
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="flex-1 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                                    >
                                        <Share2 className="w-4 h-4" /> SAVE CARD
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-zinc-600 text-xs mt-24 font-mono">
                * DATA BASED ON NATIONAL STATISTICS. FOR ENTERTAINMENT PURPOSES ONLY.<br />
                Moneysalary Private Banking Service © 2025
            </p>
        </div>
    );
}
