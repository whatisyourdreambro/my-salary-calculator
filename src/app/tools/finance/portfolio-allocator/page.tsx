"use client";

// src/app/tools/finance/portfolio-allocator/page.tsx
// 포트폴리오 자산 배분 — 나이·성향·목표별 권장 배분.

import { useState, useMemo } from "react";
import Link from "next/link";
import { PieChart, Target } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function PortfolioAllocatorPage() {
 const [age, setAge] = useState(35);
 const [riskTolerance, setRiskTolerance] = useState<"conservative" | "balanced" | "aggressive">("balanced");
 const [goalYears, setGoalYears] = useState(20);
 const [totalAmount, setTotalAmount] = useState(50_000_000);
 const [targetAmount, setTargetAmount] = useState(500_000_000);

 const result = useMemo(() => {
 // 연령 기반 기본 (110 - 나이 = 주식 비중)
 const baseEquity = Math.max(20, 110 - age);

 // 성향 조정
 const adjustment = riskTolerance === "conservative" ? -15 : riskTolerance === "aggressive" ? 15 : 0;

 // 목표 기간 조정 (10년 미만은 보수적, 30년 이상은 공격적)
 const yearAdjustment = goalYears < 10 ? -10 : goalYears > 30 ? 10 : 0;

 const equity = Math.max(10, Math.min(95, baseEquity + adjustment + yearAdjustment));
 const bond = Math.max(5, Math.min(70, 100 - equity - 10));
 const cash = Math.max(0, 100 - equity - bond);

 // 주식 세부 (국내 vs 해외 vs 신흥국)
 const usEquity = Math.round(equity * 0.5);
 const koreaEquity = Math.round(equity * 0.3);
 const emergingEquity = equity - usEquity - koreaEquity;

 // 채권 세부 (국채 vs 회사채)
 const govBond = Math.round(bond * 0.6);
 const corporateBond = bond - govBond;

 // 예상 연 수익률
 const expectedReturn =
 (equity / 100) * 0.08 + // 주식 8%
 (bond / 100) * 0.04 + // 채권 4%
 (cash / 100) * 0.03; // 현금 3%

 // 목표 달성 시뮬
 const totalReturn = totalAmount * Math.pow(1 + expectedReturn, goalYears);
 const monthlyAddNeeded = (targetAmount - totalReturn) / (goalYears * 12);

 return {
 equity,
 bond,
 cash,
 usEquity,
 koreaEquity,
 emergingEquity,
 govBond,
 corporateBond,
 expectedReturn: expectedReturn * 100,
 totalReturn,
 monthlyAddNeeded: Math.max(0, monthlyAddNeeded),
 willReachGoal: totalReturn >= targetAmount,
 };
 }, [age, riskTolerance, goalYears, totalAmount, targetAmount]);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <PieChart className="w-4 h-4" /> 포트폴리오 배분
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 자산 <span className="text-electric">배분</span> 추천
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">나이·성향·목표 기간 기반 추천 포트폴리오</p>
 </div>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <div className="grid grid-cols-2 gap-3 mb-4">
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">현재 나이</label>
 <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" />
 </div>
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">목표 기간 (년)</label>
 <input type="number" value={goalYears} onChange={(e) => setGoalYears(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" />
 </div>
 </div>

 <label className="text-xs font-bold text-muted-blue block mb-2">투자 성향</label>
 <div className="grid grid-cols-3 gap-2 mb-4">
 {[
 { v: "conservative" as const, label: "🟢 보수적" },
 { v: "balanced" as const, label: "🟡 균형" },
 { v: "aggressive" as const, label: "🔴 공격적" },
 ].map((opt) => (
 <button key={opt.v} onClick={() => setRiskTolerance(opt.v)} className={`py-3 rounded-xl text-sm font-black transition ${riskTolerance === opt.v ? "bg-primary text-navy" : "bg-canvas-dark text-muted-blue"}`}>
 {opt.label}
 </button>
 ))}
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">현재 투자금</label>
 <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" step={1_000_000} />
 </div>
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">목표 금액</label>
 <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" step={10_000_000} />
 </div>
 </div>
 </section>

 <section className="bg-primary p-6 rounded-3xl text-center mb-4">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">추천 포트폴리오</p>
 <div className="flex justify-around mt-3">
 <div><p className="text-3xl font-black text-navy">{result.equity}%</p><p className="text-xs text-navy/70">주식</p></div>
 <div><p className="text-3xl font-black text-navy">{result.bond}%</p><p className="text-xs text-navy/70">채권</p></div>
 <div><p className="text-3xl font-black text-navy">{result.cash}%</p><p className="text-xs text-navy/70">현금</p></div>
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">📊 세부 배분</h2>
 <div className="space-y-3 text-sm">
 <p className="font-black text-electric">주식 {result.equity}%</p>
 <div className="ml-4 space-y-1 text-xs">
 <div className="flex justify-between"><span className="text-muted-blue">미국 (S&P500·VOO)</span><span className="font-black">{result.usEquity}%</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">한국 (코스피·KODEX 200)</span><span className="font-black">{result.koreaEquity}%</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">신흥국·기타 (VWO)</span><span className="font-black">{result.emergingEquity}%</span></div>
 </div>
 <p className="font-black text-electric mt-3">채권 {result.bond}%</p>
 <div className="ml-4 space-y-1 text-xs">
 <div className="flex justify-between"><span className="text-muted-blue">국채 (TLT·KODEX 국채)</span><span className="font-black">{result.govBond}%</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">회사채</span><span className="font-black">{result.corporateBond}%</span></div>
 </div>
 <p className="font-black text-electric mt-3">현금·예금 {result.cash}%</p>
 <p className="text-xs text-muted-blue ml-4">CMA·MMF·예적금 (비상금 + 기회 자금)</p>
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3 flex items-center gap-2">
 <Target className="w-5 h-5 text-electric" /> 목표 달성 시뮬
 </h2>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between"><span className="text-muted-blue">예상 연 수익률</span><span className="font-black text-navy">{result.expectedReturn.toFixed(1)}%</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">{goalYears}년 후 자산 (현 투자금만)</span><span className="font-black text-navy">{fmt(result.totalReturn / 10000)}만</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">목표 금액</span><span className="font-black text-navy">{fmt(targetAmount / 10000)}만</span></div>
 {!result.willReachGoal && (
 <div className="p-3 bg-electric/10 rounded-xl mt-3">
 <p className="text-xs text-navy font-black mb-1">목표 미달</p>
 <p className="text-xs text-muted-blue">→ 추가 월 적립 필요: <strong className="text-electric">{fmt(result.monthlyAddNeeded)}원</strong></p>
 </div>
 )}
 {result.willReachGoal && (
 <div className="p-3 bg-success/10 rounded-xl mt-3">
 <p className="text-xs text-success font-black">✓ 목표 달성 가능 (현 투자금만으로)</p>
 </div>
 )}
 </div>
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2">💡 실행 팁</h2>
 <ul className="text-xs text-muted-blue space-y-1 leading-relaxed">
 <li>• ETF (수수료 0.1~0.3%) 위주로 시작 — 펀드는 1%+ 수수료로 비효율</li>
 <li>• 분기 1회 리밸런싱 (5%p 이상 차이날 때만)</li>
 <li>• ISA·연금저축·IRP 등 절세 계좌 우선 활용</li>
 <li>• 시장 폭락 시 추가 매수 (정기 적립 유지)</li>
 <li>• 60세 이후엔 채권·현금 비중 높여 안정성 ↑</li>
 </ul>
 </section>

 <section className="grid grid-cols-3 gap-2 mb-4">
 <Link href="/tools/finance/compound" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">복리 시뮬</p>
 </Link>
 <Link href="/tools/finance/cagr" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">CAGR</p>
 </Link>
 <Link href="/tools/finance/irp" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">IRP 절세</p>
 </Link>
 </section>
 </div>
 </main>
 );
}
