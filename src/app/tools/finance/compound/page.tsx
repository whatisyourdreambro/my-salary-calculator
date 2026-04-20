"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, RefreshCw } from "lucide-react";
const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function CompoundCalculatorPage() {
 const [principal, setPrincipal] = useState(10_000_000);
 const [monthly, setMonthly] = useState(500_000);
 const [rate, setRate] = useState(7);
 const [years, setYears] = useState(20);
 const [mode, setMode] = useState<"yearly" | "monthly">("monthly");

 const r = useMemo(() => {
 const monthlyRate = rate / 100 / 12;
 const months = years * 12;
 let balance = principal;
 const data: {year: number; balance: number; principal: number; interest: number}[] = [];
 let totalPrincipal = principal;
 for (let m = 1; m <= months; m++) {
 balance = balance * (1 + monthlyRate) + monthly;
 totalPrincipal += monthly;
 if (m % 12 === 0) {
 data.push({ year: m / 12, balance: Math.round(balance), principal: Math.round(totalPrincipal), interest: Math.round(balance - totalPrincipal) });
 }
 }
 return { finalBalance: Math.round(balance), totalPrincipal: Math.round(totalPrincipal), totalInterest: Math.round(balance - totalPrincipal), data };
 }, [principal, monthly, rate, years]);

 const barMax = r.data.length > 0 ? r.data[r.data.length - 1].balance : 1;

 return (
 <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
 <div className="max-w-3xl mx-auto">
 <div className="text-center mb-12 pb-10 border-b border-canvas">
 <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6"><TrendingUp size={14} /> 복리 시뮬레이션</div>
 <h1 className="text-4xl font-black text-navy tracking-tight mb-3">복리 계산기</h1>
 <p className="text-faint-blue font-medium">원금 + 월 적립 + 복리 수익률로 미래 자산을 계산합니다</p>
 </div>

 <div className="bg-white border border-canvas rounded-2xl p-8 mb-6 shadow-sm space-y-5">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">초기 투자금 (원)</label>
 <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3 font-bold text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 </div>
 <div>
 <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">월 적립금 (원)</label>
 <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3 font-bold text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">연 수익률 ({rate}%)</label>
 <input type="range" min={1} max={20} step={0.5} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full accent-primary" />
 <div className="flex justify-between text-xs text-faint-blue mt-1"><span>1%</span><span className="text-primary font-bold">{rate}%</span><span>20%</span></div>
 </div>
 <div>
 <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">투자 기간 ({years}년)</label>
 <input type="range" min={1} max={40} value={years} onChange={e => setYears(Number(e.target.value))} className="w-full accent-primary" />
 <div className="flex justify-between text-xs text-faint-blue mt-1"><span>1년</span><span className="text-primary font-bold">{years}년</span><span>40년</span></div>
 </div>
 </div>
 </div>

 <motion.div key={r.finalBalance} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
 className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6">
 <div className="bg-primary p-8 text-center">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">{years}년 후 최종 자산</p>
 <p className="text-5xl font-black text-navy tracking-tight">{fmt(r.finalBalance)}<span className="text-2xl ml-1">원</span></p>
 <div className="flex justify-center gap-8 mt-5 pt-5 border-t border-white/20">
 <div className="text-center"><p className="text-navy/60 text-xs mb-1">총 납입원금</p><p className="text-navy font-black">{fmt(r.totalPrincipal)}원</p></div>
 <div className="w-px bg-white/20" />
 <div className="text-center"><p className="text-navy/60 text-xs mb-1">이자·수익</p><p className="text-navy font-black">{fmt(r.totalInterest)}원</p></div>
 <div className="w-px bg-white/20" />
 <div className="text-center"><p className="text-navy/60 text-xs mb-1">수익 배율</p><p className="text-navy font-black">{(r.finalBalance / r.totalPrincipal).toFixed(2)}배</p></div>
 </div>
 </div>
 <div className="bg-white p-6">
 <div className="h-2 bg-canvas-dark rounded-full overflow-hidden mb-2">
 <div className="h-full bg-primary/30 rounded-full" style={{ width: `${(r.totalPrincipal / r.finalBalance * 100).toFixed(1)}%` }} />
 <div className="h-full bg-primary rounded-full -mt-2" style={{ width: `${(r.totalPrincipal / r.finalBalance * 100).toFixed(1)}%`, maxWidth: '100%' }} />
 </div>
 <div className="flex justify-between text-xs text-faint-blue">
 <span>원금 비율: {(r.totalPrincipal / r.finalBalance * 100).toFixed(1)}%</span>
 <span>수익 비율: {(r.totalInterest / r.finalBalance * 100).toFixed(1)}%</span>
 </div>
 </div>
 </motion.div>

 {/* Year Table */}
 <div className="border border-canvas rounded-2xl overflow-hidden mb-8">
 <div className="bg-canvas px-6 py-4 border-b border-canvas flex justify-between">
 <h3 className="font-black text-navy text-sm">연도별 자산 시뮬레이션</h3>
 </div>
 <div className="divide-y divide-canvas max-h-64 overflow-y-auto">
 {r.data.map(d => (
 <div key={d.year} className="flex items-center gap-4 px-6 py-3">
 <span className="text-xs font-bold text-faint-blue w-12">{d.year}년</span>
 <div className="flex-1">
 <div className="h-2 bg-canvas-dark rounded-full overflow-hidden">
 <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, d.balance / barMax * 100).toFixed(1)}%` }} />
 </div>
 </div>
 <span className="text-xs font-black text-navy w-28 text-right">{fmt(d.balance)}원</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </main>
 );
}
