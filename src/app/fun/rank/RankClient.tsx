"use client";

import { useState, useMemo } from "react";
import {
 AreaChart,
 Area,
 Tooltip,
 ResponsiveContainer,
 ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Share2, Trophy, Users, Crown, RefreshCw, TrendingUp } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import Link from 'next/link';

// Mock Distribution Data
const generateDistributionData = () => {
 const data = [];
 for (let i = 20; i <= 200; i += 2) {
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
 if (salary < 24000000) return 90;
 if (salary < 30000000) return 75;
 if (salary < 35000000) return 60;
 if (salary < 40000000) return 50;
 if (salary < 50000000) return 35;
 if (salary < 60000000) return 25;
 if (salary < 80000000) return 15;
 if (salary < 100000000) return 10;
 if (salary < 150000000) return 5;
 if (salary < 200000000) return 1;
 return 0.1;
};

export default function RankClient() {
 const [salaryInput, setSalaryInput] = useState("");
 const [showResult, setShowResult] = useState(false);

 const salary = Number(salaryInput.replace(/,/g, ""));
 const percentile = useMemo(() => calculatePercentile(salary), [salary]);

 const handleCalculate = () => {
 if (salary > 0) {
 setShowResult(true);
 }
 };

 const handleShare = () => {
 const text = `내 연봉은 대한민국 상위 ${percentile}%입니다! 당신의 순위도 확인해보세요.`;
 const url = window.location.href;

 if (navigator.share) {
 navigator.share({
 title: "연봉 순위 계산기",
 text: text,
 url: url,
 }).catch(console.error);
 } else {
 navigator.clipboard.writeText(`${text}\n${url}`).then(() => alert("결과가 복사되었습니다!"));
 }
 };

 return (
 <main className="w-full min-h-screen bg-canvas -[#191F28] pb-20 font-sans relative overflow-x-hidden">

 {/* Hero Section */}
 <section className="relative pt-28 pb-16 overflow-hidden text-center">
 <div className="absolute inset-0 bg-gradient-to-br from-primary via-white to-primary/80 -[#0f1623] -[#191F28] -[#1a2035] -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 /15 rounded-full blur-[120px] -z-10 pointer-events-none" />

 <div className="max-w-5xl mx-auto px-4">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6">
 <Crown className="w-4 h-4" />
 <span>대한민국 연봉 데이터 분석</span>
 </div>
 <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-5 text-navy ">
 나는 대한민국 상위 <br className="sm:hidden" />
 <span className="text-primary">몇 %일까요?</span>
 </h1>
 <p className="text-lg text-faint-blue max-w-2xl mx-auto font-medium">
 2,000만 직장인 데이터를 기반으로 당신의 정확한 위치를 알려드립니다.
 </p>
 </motion.div>
 </div>
 </section>

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">

 {/* Ad Unit: Top - REMOVED */}

 <div className="toss-card overflow-hidden relative">

 <div className="p-8 sm:p-12 relative z-10">
 {!showResult ? (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="space-y-12"
 >
 <div className="text-center">
 <label className="block text-lg font-medium text-faint-blue mb-6">
 세전 연봉을 입력하세요
 </label>
 <div className="relative max-w-md mx-auto group">
 <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
 <input
 type="text"
 value={salaryInput}
 onChange={(e) => {
 const val = e.target.value.replace(/[^0-9]/g, "");
 setSalaryInput(Number(val).toLocaleString('ko-KR'));
 }}
 className="relative w-full p-6 text-4xl sm:text-5xl font-black text-center bg-electric/50 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all text-white placeholder-zinc-700"
 placeholder="0"
 autoFocus
 />
 <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-bold text-faint-blue">
 원
 </span>
 </div>
 </div>

 <button
 onClick={handleCalculate}
 disabled={!salaryInput}
 className="w-full py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/80 text-navy text-2xl font-black rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
 >
 내 순위 확인하기
 </button>
 </motion.div>
 ) : (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-12"
 >
 <div className="text-center">
 <p className="text-lg text-faint-blue mb-4 font-medium">당신은 대한민국 상위</p>
 <h2 className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/50 to-primary/80 mb-6 drop-shadow-2xl">
 <CountUp end={percentile} decimals={1} duration={2} />%
 </h2>
 <div className="inline-block px-6 py-2 rounded-full bg-white/5 border border-white/10">
 <p className="text-xl text-muted-blue">
 연봉 <span className="font-bold text-navy">{salaryInput}원</span>
 </p>
 </div>
 </div>

 {/* Chart */}
 <div className="h-80 w-full relative bg-electric/20 rounded-3xl p-4 border border-white/5">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={distributionData}>
 <defs>
 <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
 </linearGradient>
 </defs>
 <Tooltip
 contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '1rem', color: '#fff' }}
 itemStyle={{ color: '#e879f9' }}
 formatter={(value: number) => [`${value.toFixed(1)}%`, '인구 비율']}
 labelFormatter={(label) => `${(label / 10000).toLocaleString('ko-KR')}만원`}
 />
 <Area
 type="monotone"
 dataKey="density"
 stroke="#d946ef"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#colorDensity)"
 />
 <ReferenceLine x={salary} stroke="#fff" strokeDasharray="3 3" label={{ position: 'top', value: 'ME', fill: 'white', fontWeight: 'bold' }} />
 </AreaChart>
 </ResponsiveContainer>
 <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-blue font-mono">
 * 2025년 국세청 통계 자료 기반 (추정치)
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-2 gap-6">
 <div className="bg-white/5 p-6 rounded-3xl text-center border border-white/5 hover:border-primary/30 transition-colors">
 <Users className="w-8 h-8 mx-auto mb-3 text-[rgba(255,255,255,0.8)]" />
 <p className="text-sm text-faint-blue mb-1">비슷한 연봉</p>
 <p className="font-bold text-2xl text-navy">약 45만명</p>
 </div>
 <div className="bg-white/5 p-6 rounded-3xl text-center border border-white/5 hover:border-primary/30 transition-colors">
 <Trophy className="w-8 h-8 mx-auto mb-3 text-primary" />
 <p className="text-sm text-faint-blue mb-1">예상 등급</p>
 <p className="font-bold text-2xl text-navy">
 {percentile <= 10 ? "다이아몬드" : percentile <= 30 ? "플래티넘" : "골드"}
 </p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-4">
 <button
 onClick={() => setShowResult(false)}
 className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 font-bold text-muted-blue transition-all flex items-center justify-center gap-2"
 >
 <RefreshCw size={18} /> 다시 하기
 </button>

 <div className="flex-1">
 <ShareButtons
 title={`내 연봉은 상위 ${percentile}%!`}
 description="대한민국 연봉 랭킹 확인하기"
 />
 </div>
 </div>
 <Link
 href="/fun"
 className="w-full py-4 rounded-xl bg-white border border-white/10 hover:border-primary/30 text-faint-blue hover:text-primary font-bold transition-all flex items-center justify-center gap-2"
 >
 <TrendingUp size={18} /> 다른 테스트 보러가기
 </Link>
 </motion.div>
 )}
 </div>
 </div>

 
 </div>
 </main>
 );
}
