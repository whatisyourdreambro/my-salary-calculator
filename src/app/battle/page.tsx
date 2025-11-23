"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import { Swords, Trophy, TrendingUp, Clock, Heart, Building2, Search } from "lucide-react";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { CompanyComparator, ComparisonResult } from "@/lib/versusEngine";
import { CompanyProfile, JobLevel } from "@/types/company";
import AdUnit from "@/components/AdUnit";

// --- Components ---

const CompanySelector = ({
    label,
    selectedId,
    onSelect,
    companies,
}: {
    label: string;
    selectedId: string;
    onSelect: (id: string) => void;
    companies: CompanyProfile[];
}) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                <select
                    value={selectedId}
                    onChange={(e) => onSelect(e.target.value)}
                    className="w-full p-4 bg-card border-2 border-border rounded-xl text-lg font-bold appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                    <option value="" disabled>
                        선수 입장...
                    </option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.logo} {c.name.ko}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    ▼
                </div>
            </div>
        </div>
    );
};

const StatBar = ({
    label,
    valueA,
    valueB,
    unit = "",
    winner,
}: {
    label: string;
    valueA: number;
    valueB: number;
    unit?: string;
    winner: "a" | "b" | "draw";
}) => {
    const max = Math.max(valueA, valueB) * 1.2;
    const percentA = (valueA / max) * 100;
    const percentB = (valueB / max) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
                <span className={winner === "a" ? "text-blue-500 font-bold" : "text-muted-foreground"}>
                    {valueA.toLocaleString()}
                    {unit}
                </span>
                <span className="text-foreground font-bold">{label}</span>
                <span className={winner === "b" ? "text-red-500 font-bold" : "text-muted-foreground"}>
                    {valueB.toLocaleString()}
                    {unit}
                </span>
            </div>
            <div className="flex h-4 bg-secondary rounded-full overflow-hidden relative">
                {/* Center Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-background z-10" />

                {/* Bar A (Left, Blue) */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }}
                    className="w-1/2 flex justify-end bg-secondary"
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(valueA / (valueA + valueB)) * 100}%` }}
                        className={`h-full ${winner === "a" ? "bg-blue-500" : "bg-blue-300/50"}`}
                    />
                </motion.div>

                {/* Bar B (Right, Red) */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }}
                    className="w-1/2 flex justify-start bg-secondary"
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(valueB / (valueA + valueB)) * 100}%` }}
                        className={`h-full ${winner === "b" ? "bg-red-500" : "bg-red-300/50"}`}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default function BattlePage() {
    const companies = companyRepository.getAll();
    const [companyAId, setCompanyAId] = useState<string>(companies[0].id);
    const [companyBId, setCompanyBId] = useState<string>(companies[1].id);
    const [jobLevel, setJobLevel] = useState<JobLevel>("entry");

    const companyA = companyRepository.getById(companyAId);
    const companyB = companyRepository.getById(companyBId);

    const result: ComparisonResult | null = useMemo(() => {
        if (!companyA || !companyB) return null;
        return CompanyComparator.compare(companyA, companyB, jobLevel);
    }, [companyA, companyB, jobLevel]);

    return (
        <main className="w-full min-h-screen bg-zinc-950 text-white pb-20 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative py-16 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />

                <div className="relative z-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block mb-4"
                    >
                        <span className="px-4 py-1 rounded-full border border-red-500/50 bg-red-500/10 text-red-400 text-sm font-bold tracking-widest uppercase">
                            Versus Engine™
                        </span>
                    </motion.div>
                    <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter mb-2">
                        SALARY <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-red-500">FIGHT</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        계급장 떼고 붙어보자! 적나라한 연봉/복지 데스매치
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 relative z-20">
                {/* Controls */}
                <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 mb-12 shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <CompanySelector
                            label="Player 1 (Blue Corner)"
                            selectedId={companyAId}
                            onSelect={setCompanyAId}
                            companies={companies}
                        />

                        <div className="flex flex-col items-center gap-2 min-w-[120px]">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
                                <Swords className="w-6 h-6 text-zinc-400" />
                            </div>
                            <select
                                value={jobLevel}
                                onChange={(e) => setJobLevel(e.target.value as JobLevel)}
                                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm font-medium text-center"
                            >
                                <option value="entry">신입 (Entry)</option>
                                <option value="junior">주니어 (Junior)</option>
                                <option value="senior">시니어 (Senior)</option>
                                <option value="lead">리드 (Lead)</option>
                                <option value="executive">임원 (Exec)</option>
                            </select>
                        </div>

                        <CompanySelector
                            label="Player 2 (Red Corner)"
                            selectedId={companyBId}
                            onSelect={setCompanyBId}
                            companies={companies}
                        />
                    </div>
                </div>

                {/* Battle Arena */}
                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Stats (Player 1) */}
                        <div className="lg:col-span-3 order-2 lg:order-1 text-center lg:text-left space-y-6">
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-zinc-900/50 border border-blue-500/30 p-6 rounded-2xl"
                            >
                                <div className="text-6xl mb-4">{result.companyA.logo}</div>
                                <h2 className="text-2xl font-bold text-blue-400 mb-1">{result.companyA.name.ko}</h2>
                                <p className="text-sm text-zinc-400 mb-4">{result.companyA.industry}</p>

                                <div className="space-y-4">
                                    <div className="bg-zinc-950/50 p-3 rounded-xl">
                                        <p className="text-xs text-zinc-500 uppercase">Total Comp</p>
                                        <p className="text-xl font-bold text-white">
                                            {(result.metrics.totalComp.a / 10000).toLocaleString()}만원
                                        </p>
                                    </div>
                                    <div className="bg-zinc-950/50 p-3 rounded-xl">
                                        <p className="text-xs text-zinc-500 uppercase">Real Hourly</p>
                                        <p className="text-xl font-bold text-white">
                                            {Math.round(result.metrics.realHourlyWage.a).toLocaleString()}원
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Center Radar & Verdict */}
                        <div className="lg:col-span-6 order-1 lg:order-2">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                            >
                                {/* Radar Chart */}
                                <div className="h-[300px] w-full mb-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.radarData}>
                                            <PolarGrid stroke="#333" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name={result.companyA.name.ko}
                                                dataKey="A"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fill="#3b82f6"
                                                fillOpacity={0.3}
                                            />
                                            <Radar
                                                name={result.companyB.name.ko}
                                                dataKey="B"
                                                stroke="#ef4444"
                                                strokeWidth={3}
                                                fill="#ef4444"
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Verdict Box */}
                                <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 p-6 rounded-xl text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
                                    <h3 className="text-lg font-bold text-zinc-300 mb-2 flex items-center justify-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        AI 심판 판정
                                    </h3>
                                    <p className="text-xl font-medium text-white leading-relaxed">
                                        &quot;{result.verdict}&quot;
                                    </p>
                                </div>

                                {/* Detailed Stat Bars */}
                                <div className="mt-8 space-y-6">
                                    <StatBar
                                        label="총 보상 (연봉+인센)"
                                        valueA={result.metrics.totalComp.a}
                                        valueB={result.metrics.totalComp.b}
                                        unit="원"
                                        winner={result.metrics.totalComp.winner}
                                    />
                                    <StatBar
                                        label="실질 시급 (가성비)"
                                        valueA={Math.round(result.metrics.realHourlyWage.a)}
                                        valueB={Math.round(result.metrics.realHourlyWage.b)}
                                        unit="원"
                                        winner={result.metrics.realHourlyWage.winner}
                                    />
                                    <StatBar
                                        label="워라밸 점수"
                                        valueA={Math.round(result.metrics.workLifeScore.a)}
                                        valueB={Math.round(result.metrics.workLifeScore.b)}
                                        unit="점"
                                        winner={result.metrics.workLifeScore.winner}
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Stats (Player 2) */}
                        <div className="lg:col-span-3 order-3 text-center lg:text-right space-y-6">
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-zinc-900/50 border border-red-500/30 p-6 rounded-2xl"
                            >
                                <div className="text-6xl mb-4">{result.companyB.logo}</div>
                                <h2 className="text-2xl font-bold text-red-400 mb-1">{result.companyB.name.ko}</h2>
                                <p className="text-sm text-zinc-400 mb-4">{result.companyB.industry}</p>

                                <div className="space-y-4">
                                    <div className="bg-zinc-950/50 p-3 rounded-xl">
                                        <p className="text-xs text-zinc-500 uppercase">Total Comp</p>
                                        <p className="text-xl font-bold text-white">
                                            {(result.metrics.totalComp.b / 10000).toLocaleString()}만원
                                        </p>
                                    </div>
                                    <div className="bg-zinc-950/50 p-3 rounded-xl">
                                        <p className="text-xs text-zinc-500 uppercase">Real Hourly</p>
                                        <p className="text-xl font-bold text-white">
                                            {Math.round(result.metrics.realHourlyWage.b).toLocaleString()}원
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Ad Unit */}
                <div className="mt-16">
                    <AdUnit slotId="9998887776" format="auto" label="Battle Page Bottom" />
                </div>
            </div>
        </main>
    );
}
