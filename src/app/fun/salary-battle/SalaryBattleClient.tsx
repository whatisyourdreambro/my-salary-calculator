"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy } from "lucide-react";
import { CompanyComparator, ComparisonResult } from "@/lib/versusEngine";
import type { CompanyProfile, JobLevel } from "@/types/company";
import BoxingGame from "@/components/BoxingGame";
import Link from "@/components/AppLink";
import ShareButtons from "@/components/ShareButtons";
import { InArticleAd } from "@/components/AdPlacement";

// 배틀 RadarChart(recharts)만 지연 로드 — recharts가 무거워 First Load 에서 제외.
const SalaryBattleRadar = dynamic(() => import("@/components/charts/SalaryBattleRadar"), {
 ssr: false,
 loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-canvas-100" />,
});

// 서버(page.tsx)가 내려주는 셀렉터용 경량 목록 — 회사 전체 프로필(~860KB 청크)을
// First Load 번들에서 제거하기 위한 3필드 축약형.
export interface BattleCompanyOption {
 id: string;
 nameKo: string;
 logo: string;
}

// 전체 저장소는 FIGHT 시점에만 지연 로드 (HeaderSearch 의 캐시드 promise 패턴).
// 광고 push·첫 페인트가 698KB JS 파싱보다 먼저 일어나게 하는 것이 목적.
let repoPromise: Promise<typeof import("@/lib/salary-data/CompanyRepository")> | null = null;
function loadRepo() {
 if (!repoPromise) repoPromise = import("@/lib/salary-data/CompanyRepository");
 return repoPromise;
}

interface BattleState {
 companyA: CompanyProfile;
 companyB: CompanyProfile;
 result: ComparisonResult;
}

const CompanySelector = ({
 label,
 selectedId,
 onSelect,
 companies,
}: {
 label: string;
 selectedId: string;
 onSelect: (id: string) => void;
 companies: BattleCompanyOption[];
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
 회사를 선택하세요...
 </option>
 {companies.map((c) => (
 <option key={c.id} value={c.id}>
 {c.logo} {c.nameKo}
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
 return (
 <div className="space-y-2">
 <div className="flex justify-between text-sm font-medium">
 <span className={winner === "a" ? "text-electric font-bold" : "text-muted-foreground"}>
 {valueA.toLocaleString('ko-KR')}
 {unit}
 </span>
 <span className="text-foreground font-bold">{label}</span>
 <span className={winner === "b" ? "text-primary font-bold" : "text-muted-foreground"}>
 {valueB.toLocaleString('ko-KR')}
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
 className={`h-full ${winner === "a" ? "bg-primary" : "bg-blue-300/50"}`}
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
 className={`h-full ${winner === "b" ? "bg-primary" : "bg-primary/10"}`}
 />
 </motion.div>
 </div>
 </div>
 );
};

export default function SalaryBattleClient({ options }: { options: BattleCompanyOption[] }) {
 const [companyAId, setCompanyAId] = useState<string>(options[0]?.id ?? "");
 const [companyBId, setCompanyBId] = useState<string>(options[1]?.id ?? "");
 const [jobLevel, setJobLevel] = useState<JobLevel>("entry");
 const [isPlaying, setIsPlaying] = useState(false);
 const [showResult, setShowResult] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [battle, setBattle] = useState<BattleState | null>(null);

 const handleFight = async () => {
 if (isLoading) return;
 setIsLoading(true);
 setShowResult(false);
 try {
 const { companyRepository } = await loadRepo();
 const companyA = companyRepository.getById(companyAId);
 const companyB = companyRepository.getById(companyBId);
 if (!companyA || !companyB) return;
 const result = CompanyComparator.compare(companyA, companyB, jobLevel);
 setBattle({ companyA, companyB, result });
 setIsPlaying(true);
 } finally {
 setIsLoading(false);
 }
 };

 const handleFinishGame = () => {
 setIsPlaying(false);
 setShowResult(true);
 };

 const result = battle?.result ?? null;

 return (
 <main className="w-full min-h-screen bg-canvas text-navy pb-20 overflow-x-hidden">
 {/* Game Overlay */}
 <AnimatePresence>
 {isPlaying && battle && (
 <BoxingGame
 companyA={battle.companyA}
 companyB={battle.companyB}
 result={battle.result}
 onFinish={handleFinishGame}
 />
 )}
 </AnimatePresence>

 {/* Hero Section */}
 <section className="relative py-16 text-center overflow-hidden">
 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />

 <div className="relative z-10">
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="inline-block mb-4"
 >
 <span className="px-4 py-1 rounded-full border border-primary/50 bg-primary/10 text-primary text-sm font-bold tracking-widest uppercase">
 Versus Engine — 기업 비교 배틀
 </span>
 </motion.div>
 <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter mb-2">
 SALARY <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-primary/50 to-red-500">FIGHT</span>
 </h1>
 <p className="text-faint-blue text-lg">
 실전 배틀! 연봉/복지/워라벨 비교
 </p>
 </div>
 </section>

 <div className="max-w-6xl mx-auto px-4 relative z-20">
 {/* Controls */}
 <div className="bg-white/50 backdrop-blur-md border border-canvas rounded-2xl p-6 mb-12 shadow-2xl">
 <div className="flex flex-col md:flex-row gap-6 items-center">
 <CompanySelector
 label="Player 1 (Blue Corner)"
 selectedId={companyAId}
 onSelect={setCompanyAId}
 companies={options}
 />

 <div className="flex flex-col items-center gap-4 min-w-[120px]">
 <div className="w-12 h-12 rounded-full bg-canvas-dark flex items-center justify-center border-2 border-canvas">
 <Swords className="w-6 h-6 text-faint-blue" />
 </div>
 <select
 value={jobLevel}
 onChange={(e) => setJobLevel(e.target.value as JobLevel)}
 className="bg-canvas-dark border border-canvas rounded-lg px-3 py-1 text-sm font-medium text-center w-full"
 >
 <option value="entry">신입 (Entry)</option>
 <option value="junior">주니어(Junior)</option>
 <option value="senior">시니어(Senior)</option>
 <option value="lead">리드 (Lead)</option>
 <option value="executive">임원 (Exec)</option>
 </select>

 <button
 onClick={handleFight}
 disabled={isLoading}
 className="w-full py-3 bg-gradient-to-r from-red-600 to-primary/80 rounded-xl font-black italic text-xl shadow-lg hover:scale-105 transition-transform animate-pulse disabled:opacity-60 disabled:hover:scale-100"
 >
 {isLoading ? "LOADING…" : "FIGHT!"}
 </button>
 </div>

 <CompanySelector
 label="Player 2 (Red Corner)"
 selectedId={companyBId}
 onSelect={setCompanyBId}
 companies={options}
 />
 </div>
 </div>

 {/* Battle Arena */}
 {result && showResult ? (
 <>
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
 {/* Left Stats (Player 1) */}
 <div className="lg:col-span-3 order-2 lg:order-1 text-center lg:text-left space-y-6">
 <motion.div
 initial={{ x: -50, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 className="bg-white/50 border border-electric/30 p-6 rounded-2xl"
 >
 <div className="text-6xl mb-4">{result.companyA.logo}</div>
 <h2 className="text-2xl font-bold text-navy mb-1">{result.companyA.name.ko}</h2>
 <p className="text-sm text-faint-blue mb-4">{result.companyA.industry}</p>

 <div className="space-y-4">
 <div className="bg-canvas/50 p-3 rounded-xl">
 <p className="text-xs text-faint-blue uppercase">Total Comp</p>
 <p className="text-xl font-bold text-navy">
 {(result.metrics.totalComp.a / 10000).toLocaleString('ko-KR')}만원
 </p>
 </div>
 <div className="bg-canvas/50 p-3 rounded-xl">
 <p className="text-xs text-faint-blue uppercase">Real Hourly</p>
 <p className="text-xl font-bold text-navy">
 {Math.round(result.metrics.realHourlyWage.a).toLocaleString('ko-KR')}원
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
 className="bg-white/80 border border-canvas rounded-3xl p-6 shadow-2xl relative overflow-hidden"
 >
 {/* Radar Chart */}
 <div className="h-[300px] w-full mb-8">
 <SalaryBattleRadar
 data={result.radarData}
 nameA={result.companyA.name.ko}
 nameB={result.companyB.name.ko}
 />
 </div>

 {/* Verdict Box */}
 <div className="bg-gradient-to-r from-primary to-primary/80 border border-canvas p-6 rounded-xl text-center relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary/50 to-red-500" />
 <h3 className="text-lg font-bold text-muted-blue mb-2 flex items-center justify-center gap-2">
 <Trophy className="w-5 h-5 text-primary" />
 AI 최종 판정
 </h3>
 <p className="text-xl font-medium text-navy leading-relaxed">
 &quot;{result.verdict}&quot;
 </p>
 </div>

 {/* Detailed Stat Bars */}
 <div className="mt-8 space-y-6">
 <StatBar
 label="총보상 (연봉+인센+주식·사이닝 포함)"
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
 label="워라벨"
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
 className="bg-white/50 border border-primary/30 p-6 rounded-2xl"
 >
 <div className="text-6xl mb-4">{result.companyB.logo}</div>
 <h2 className="text-2xl font-bold text-primary mb-1">{result.companyB.name.ko}</h2>
 <p className="text-sm text-faint-blue mb-4">{result.companyB.industry}</p>

 <div className="space-y-4">
 <div className="bg-canvas/50 p-3 rounded-xl">
 <p className="text-xs text-faint-blue uppercase">Total Comp</p>
 <p className="text-xl font-bold text-navy">
 {(result.metrics.totalComp.b / 10000).toLocaleString('ko-KR')}만원
 </p>
 </div>
 <div className="bg-canvas/50 p-3 rounded-xl">
 <p className="text-xs text-faint-blue uppercase">Real Hourly</p>
 <p className="text-xl font-bold text-navy">
 {Math.round(result.metrics.realHourlyWage.b).toLocaleString('ko-KR')}원
 </p>
 </div>
 </div>
 </motion.div>
 </div>
 </div>

 {/* 결과 인접 광고 */}
 <div className="mt-10">
 <InArticleAd />
 </div>

 {/* 공유 CTA + 코어 페이지 전환 동선 — 바이럴 유입을 계산기로 연결 */}
 <div className="mt-10 flex flex-col items-center gap-4 border-t border-canvas-200 pt-8">
 <p className="text-sm font-bold text-faint-blue">
 이 매치업, 친구에게 공유하기
 </p>
 <ShareButtons
 title={`${result.companyA.name.ko} vs ${result.companyB.name.ko} 연봉 배틀 결과 | 머니샐러리`}
 description="두 회사의 총보상·실질 시급·워라밸을 1:1로 비교했어요. 우리 회사도 배틀시켜 보세요!"
 />
 <Link
 href="/"
 className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-electric hover:underline"
 >
 내 연봉 실수령액도 계산해보기 →
 </Link>
 </div>
 </>
 ) : (
 <div className="text-center py-20 animate-pulse">
 <p className="text-2xl text-faint-blue font-bold">
 연봉 배틀의 <span className="text-primary">FIGHT!</span> 버튼을 눌러주세요.
 </p>
 </div>
 )}

 </div>
 </main>
 );
}
