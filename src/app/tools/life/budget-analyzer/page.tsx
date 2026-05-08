"use client";

// src/app/tools/life/budget-analyzer/page.tsx
// 가계부 자동 분석 — 카테고리별 비중 + 권장 비교 + 절약 가능액.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

const RECOMMENDED = {
 housing: 0.30,
 food: 0.15,
 transport: 0.10,
 utilities: 0.07,
 entertainment: 0.08,
 savings: 0.20,
 misc: 0.10,
};

export default function BudgetAnalyzerPage() {
 const [income, setIncome] = useState(3_500_000);
 const [housing, setHousing] = useState(800_000);
 const [food, setFood] = useState(600_000);
 const [transport, setTransport] = useState(200_000);
 const [utilities, setUtilities] = useState(180_000);
 const [entertainment, setEntertainment] = useState(400_000);
 const [savings, setSavings] = useState(500_000);
 const [misc, setMisc] = useState(820_000);

 const result = useMemo(() => {
 const total = housing + food + transport + utilities + entertainment + savings + misc;
 const surplus = income - total;
 const categories = [
 { key: "housing", label: "🏠 주거", actual: housing, rec: RECOMMENDED.housing },
 { key: "food", label: "🍽️ 식비", actual: food, rec: RECOMMENDED.food },
 { key: "transport", label: "🚇 교통", actual: transport, rec: RECOMMENDED.transport },
 { key: "utilities", label: "💡 공과금·통신", actual: utilities, rec: RECOMMENDED.utilities },
 { key: "entertainment", label: "🎬 여가·외식", actual: entertainment, rec: RECOMMENDED.entertainment },
 { key: "savings", label: "💰 저축·투자", actual: savings, rec: RECOMMENDED.savings },
 { key: "misc", label: "📦 기타", actual: misc, rec: RECOMMENDED.misc },
 ].map((c) => ({
 ...c,
 actualRatio: c.actual / income,
 diff: c.actual / income - c.rec,
 over: c.actual / income > c.rec,
 }));

 // 절약 가능 카테고리
 const overspending = categories.filter((c) => c.over && c.key !== "savings");
 const totalOverspend = overspending.reduce((sum, c) => sum + (c.actualRatio - c.rec) * income, 0);

 // 저축률 평가
 const savingsRatio = savings / income;
 const isSavingsHealthy = savingsRatio >= 0.15;

 // 점수
 let score = 100;
 categories.forEach((c) => {
 if (c.over) score -= Math.abs(c.diff) * 100;
 });
 if (savingsRatio < 0.1) score -= 20;
 score = Math.max(0, Math.round(score));

 return { total, surplus, categories, overspending, totalOverspend, savingsRatio, isSavingsHealthy, score };
 }, [income, housing, food, transport, utilities, entertainment, savings, misc]);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Wallet className="w-4 h-4" /> 가계부 자동 분석
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">가계부</span> 자동 분석
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">카테고리별 비중 + 권장 비교 + 절약 가능액</p>
 </div>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">월 실수령액 (세후)</label>
 <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value) || 1)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" step={100_000} />

 <h3 className="text-sm font-black text-navy mb-3">카테고리별 월 지출</h3>
 {[
 { label: "🏠 주거 (월세·관리비·대출)", value: housing, set: setHousing },
 { label: "🍽️ 식비", value: food, set: setFood },
 { label: "🚇 교통", value: transport, set: setTransport },
 { label: "💡 공과금·통신", value: utilities, set: setUtilities },
 { label: "🎬 여가·외식", value: entertainment, set: setEntertainment },
 { label: "💰 저축·투자", value: savings, set: setSavings },
 { label: "📦 기타", value: misc, set: setMisc },
 ].map((c) => (
 <div key={c.label} className="mb-3">
 <label className="text-xs font-bold text-muted-blue block mb-1">{c.label}</label>
 <input type="number" value={c.value} onChange={(e) => c.set(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" step={50_000} />
 </div>
 ))}
 </section>

 <section className="bg-primary p-6 rounded-3xl text-center mb-4">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-1">가계 건강 점수</p>
 <p className="text-5xl font-black text-navy">{result.score}<span className="text-xl">/100</span></p>
 <p className="text-sm text-navy/70 mt-2">월 잉여: {fmt(result.surplus)}원 {result.surplus < 0 && "(적자)"}</p>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">📊 카테고리별 비중 vs 권장</h2>
 <div className="space-y-3">
 {result.categories.map((c) => (
 <div key={c.key}>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-muted-blue">{c.label}</span>
 <span className={`font-black ${c.over ? "text-electric" : "text-navy"}`}>
 {(c.actualRatio * 100).toFixed(1)}% / 권장 {(c.rec * 100).toFixed(0)}%
 </span>
 </div>
 <div className="w-full h-2 bg-canvas-dark rounded-full overflow-hidden flex">
 <div className={`h-full ${c.over ? "bg-electric" : "bg-success"}`} style={{ width: `${Math.min(100, c.actualRatio * 100)}%` }} />
 </div>
 </div>
 ))}
 </div>
 </section>

 {result.overspending.length > 0 && (
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2 flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-electric" /> 과지출 카테고리
 </h2>
 <p className="text-sm text-muted-blue mb-2">월 약 <strong className="text-electric">{fmt(result.totalOverspend)}원</strong> 절약 가능</p>
 <ul className="text-sm text-muted-blue space-y-1">
 {result.overspending.map((c) => (
 <li key={c.key}>• {c.label}: {fmt(c.actual)} → 권장 {fmt(c.rec * income)}원 (-{fmt(c.actual - c.rec * income)}원)</li>
 ))}
 </ul>
 </section>
 )}

 {result.isSavingsHealthy ? (
 <section className="bg-success/5 border border-success/20 rounded-2xl p-5 mb-4">
 <p className="text-sm font-black text-success flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4" /> 저축률 양호 ({(result.savingsRatio * 100).toFixed(0)}%)
 </p>
 <p className="text-xs text-muted-blue mt-1">권장 15%+ 충족. 추가 ETF·연금저축 검토.</p>
 </section>
 ) : (
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <p className="text-sm font-black text-electric">⚠️ 저축률 부족 ({(result.savingsRatio * 100).toFixed(0)}%)</p>
 <p className="text-xs text-muted-blue mt-1">권장 15%+. 과지출 카테고리 줄여 저축 증가.</p>
 </section>
 )}

 <section className="grid grid-cols-3 gap-2 mb-4">
 <Link href="/calc/monthly-budget-50-30-20" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">50/30/20</p>
 </Link>
 <Link href="/calc/emergency-fund" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">비상금</p>
 </Link>
 <Link href="/tools/career/financial-health" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">재무 건강</p>
 </Link>
 </section>
 </div>
 </main>
 );
}
