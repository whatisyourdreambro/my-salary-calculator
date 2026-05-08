"use client";

// src/app/tools/finance/debt-consolidation/page.tsx
// 부채 통합 시뮬 — 여러 부채 → 통합 대출 비교 (이자·기간 절약).

import { useState, useMemo } from "react";
import Link from "next/link";
import { CreditCard, TrendingDown } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

interface Debt {
 name: string;
 principal: number;
 rate: number; // %
 monthlyPayment: number;
}

export default function DebtConsolidationPage() {
 const [debts, setDebts] = useState<Debt[]>([
 { name: "신용카드 할부", principal: 5_000_000, rate: 18, monthlyPayment: 250_000 },
 { name: "마이너스 통장", principal: 10_000_000, rate: 7, monthlyPayment: 150_000 },
 { name: "신용대출", principal: 30_000_000, rate: 6, monthlyPayment: 600_000 },
 ]);
 const [consolidationRate, setConsolidationRate] = useState(5);
 const [consolidationYears, setConsolidationYears] = useState(5);

 const result = useMemo(() => {
 const totalPrincipal = debts.reduce((sum, d) => sum + d.principal, 0);
 const totalMonthly = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
 // 현재 부채 평균 잔여 기간 추정
 const avgRemainingMonths = totalMonthly > 0 ? Math.ceil(totalPrincipal / totalMonthly) : 0;
 const totalInterestNow = debts.reduce((sum, d) => {
 const months = d.monthlyPayment > 0 ? Math.ceil(d.principal / d.monthlyPayment) : 0;
 const r = d.rate / 100 / 12;
 return sum + (d.monthlyPayment * months - d.principal);
 }, 0);

 // 통합 후 (원리금균등)
 const r = consolidationRate / 100 / 12;
 const n = consolidationYears * 12;
 const newMonthly = totalPrincipal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
 const newTotalInterest = newMonthly * n - totalPrincipal;
 const interestSaving = totalInterestNow - newTotalInterest;
 const monthlyChange = newMonthly - totalMonthly;
 const isWorthIt = interestSaving > 0;

 // 가중평균 현재 금리
 const weightedAvgRate = debts.reduce((sum, d) => sum + d.principal * d.rate, 0) / Math.max(1, totalPrincipal);

 return {
 totalPrincipal,
 totalMonthly,
 avgRemainingMonths,
 totalInterestNow,
 newMonthly,
 newTotalInterest,
 interestSaving,
 monthlyChange,
 isWorthIt,
 weightedAvgRate,
 };
 }, [debts, consolidationRate, consolidationYears]);

 const updateDebt = (i: number, field: keyof Debt, value: any) => {
 setDebts((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
 };

 const addDebt = () => setDebts((prev) => [...prev, { name: "기타 부채", principal: 1_000_000, rate: 5, monthlyPayment: 100_000 }]);
 const removeDebt = (i: number) => setDebts((prev) => prev.filter((_, idx) => idx !== i));

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <CreditCard className="w-4 h-4" /> 부채 통합 시뮬
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">부채 통합</span> 시뮬레이터
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">여러 부채 → 통합 대출 절약액 즉시 비교</p>
 </div>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">현재 부채 목록</h2>
 <div className="space-y-3">
 {debts.map((d, i) => (
 <div key={i} className="bg-canvas p-3 rounded-xl">
 <div className="flex items-center gap-2 mb-2">
 <input value={d.name} onChange={(e) => updateDebt(i, "name", e.target.value)} className="flex-1 border border-canvas rounded-lg px-2 py-1 font-black text-navy text-sm outline-none" />
 <button onClick={() => removeDebt(i)} className="text-electric font-black text-xs">×</button>
 </div>
 <div className="grid grid-cols-3 gap-2 text-xs">
 <div>
 <label className="text-muted-blue">원금</label>
 <input type="number" value={d.principal} onChange={(e) => updateDebt(i, "principal", Number(e.target.value) || 0)} className="w-full border border-canvas rounded px-2 py-1 font-black outline-none" step={1_000_000} />
 </div>
 <div>
 <label className="text-muted-blue">금리 %</label>
 <input type="number" value={d.rate} onChange={(e) => updateDebt(i, "rate", Number(e.target.value) || 0)} className="w-full border border-canvas rounded px-2 py-1 font-black outline-none" step={0.5} />
 </div>
 <div>
 <label className="text-muted-blue">월 상환</label>
 <input type="number" value={d.monthlyPayment} onChange={(e) => updateDebt(i, "monthlyPayment", Number(e.target.value) || 0)} className="w-full border border-canvas rounded px-2 py-1 font-black outline-none" step={50_000} />
 </div>
 </div>
 </div>
 ))}
 <button onClick={addDebt} className="w-full py-2 bg-canvas-dark text-navy rounded-xl font-black text-sm">+ 부채 추가</button>
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">통합 대출 조건</h2>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">통합 금리 (%)</label>
 <input type="number" value={consolidationRate} onChange={(e) => setConsolidationRate(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" step={0.1} />
 </div>
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">기간 (년)</label>
 <input type="number" value={consolidationYears} onChange={(e) => setConsolidationYears(Number(e.target.value) || 1)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" min={1} max={30} />
 </div>
 </div>
 <p className="text-xs text-muted-blue mt-2">현재 가중 평균 금리: <strong className="text-navy">{result.weightedAvgRate.toFixed(2)}%</strong></p>
 </section>

 <section className={`p-6 rounded-3xl text-center mb-4 ${result.isWorthIt ? "bg-success/10 border-2 border-success" : "bg-electric/10 border-2 border-electric"}`}>
 <p className="text-xs font-black uppercase tracking-widest text-navy mb-1">{result.isWorthIt ? "✓ 통합 유리" : "⚠ 통합 불리"}</p>
 <p className="text-3xl font-black text-navy">
 {result.isWorthIt ? "+" : ""}{fmt(result.interestSaving)}원
 </p>
 <p className="text-sm text-muted-blue mt-1">{consolidationYears}년 총 이자 차이</p>
 </section>

 <section className="grid grid-cols-2 gap-3 mb-4">
 <div className="bg-white p-4 rounded-xl border border-canvas">
 <p className="text-xs text-muted-blue mb-1">현재 월 상환</p>
 <p className="text-xl font-black text-navy">{fmt(result.totalMonthly)}원</p>
 </div>
 <div className="bg-white p-4 rounded-xl border border-canvas">
 <p className="text-xs text-muted-blue mb-1">통합 후 월 상환</p>
 <p className="text-xl font-black text-electric">{fmt(result.newMonthly)}원</p>
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3 flex items-center gap-2">
 <TrendingDown className="w-5 h-5 text-electric" /> 비교 요약
 </h2>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between"><span className="text-muted-blue">총 부채</span><span className="font-black text-navy">{fmt(result.totalPrincipal)}원</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">현재 잔여 평균 기간</span><span className="font-black text-navy">{result.avgRemainingMonths}개월</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">현재 총 이자 (잔여)</span><span className="font-black text-navy">{fmt(result.totalInterestNow)}원</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">통합 후 총 이자</span><span className="font-black text-electric">{fmt(result.newTotalInterest)}원</span></div>
 <div className="flex justify-between border-t border-canvas pt-2"><span className="text-muted-blue font-black">월 상환 변화</span><span className={`font-black ${result.monthlyChange < 0 ? "text-success" : "text-electric"}`}>{result.monthlyChange < 0 ? "" : "+"}{fmt(result.monthlyChange)}원</span></div>
 </div>
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2">💡 부채 통합 팁</h2>
 <ul className="text-xs text-muted-blue space-y-1 leading-relaxed">
 <li>• 카드론·캐피탈 (15%+) → 1금융권 신용대출 (5~7%) 갈아타기</li>
 <li>• 마통 + 신용대출 → 단일 신용대출로 통합</li>
 <li>• 통합 시 중도상환 수수료 1~3% 차감 후 절약액 비교</li>
 <li>• 신용회복위 채무조정 → 더 큰 절약 (단, 신용도 영향)</li>
 </ul>
 </section>

 <section className="grid grid-cols-3 gap-2 mb-4">
 <Link href="/calc/debt-payoff-snowball" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">상환 계획</p>
 </Link>
 <Link href="/calc/debt-refinance-saving" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">갈아타기</p>
 </Link>
 <Link href="/calc/personal-rehabilitation" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">개인회생</p>
 </Link>
 </section>
 </div>
 </main>
 );
}
