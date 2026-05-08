"use client";

// src/app/tools/real-estate/first-home-plan/page.tsx
// 첫 주택 자금 시뮬 — 자기자본·대출·청약·정책자금 통합.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Home, AlertTriangle, CheckCircle2 } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function FirstHomePlanPage() {
 const [targetPrice, setTargetPrice] = useState(500_000_000);
 const [annualIncome, setAnnualIncome] = useState(60_000_000);
 const [currentSavings, setCurrentSavings] = useState(80_000_000);
 const [monthlySavings, setMonthlySavings] = useState(1_200_000);
 const [age, setAge] = useState(33);
 const [isMarried, setIsMarried] = useState(false);
 const [region, setRegion] = useState<"adjusted" | "general">("general");

 const result = useMemo(() => {
 // LTV 한도
 const ltvLimit = region === "adjusted" ? 0.6 : 0.7;
 // 생애최초·청년 우대 80%
 const isFirstTime = age >= 30 || isMarried;
 const ltvAdjusted = isFirstTime ? 0.8 : ltvLimit;
 const maxLoan = targetPrice * ltvAdjusted;

 // DSR 한도 (40%)
 const dsrLimit = annualIncome * 0.4;
 // 30년 만기, 4% 금리 가정 → 월 상환액
 const r = 0.04 / 12;
 const n = 360;
 const monthlyMaxByDsr = dsrLimit / 12;
 const dsrPrincipal = monthlyMaxByDsr * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
 const finalLoan = Math.min(maxLoan, dsrPrincipal);

 const requiredSelfMoney = targetPrice - finalLoan;
 const acquisitionTax = targetPrice * 0.07;
 const totalSelfNeeded = requiredSelfMoney + acquisitionTax;

 // 본인 자본 부족 시 추가 저축 기간
 const shortfall = Math.max(0, totalSelfNeeded - currentSavings);
 const monthsToSave = monthlySavings > 0 ? Math.ceil(shortfall / monthlySavings) : 999;
 const yearsToSave = monthsToSave / 12;

 // 월 상환액
 const monthlyPayment = finalLoan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
 const totalInterest = monthlyPayment * n - finalLoan;

 // 디딤돌 대출 자격 (소득 7천 이하 + 6억 이하 주택)
 const isEligibleDigimdol = annualIncome <= 70_000_000 && targetPrice <= 600_000_000 && age >= 30;
 const isEligibleBogeumjari = annualIncome <= 70_000_000 && targetPrice <= 900_000_000;

 // 청약 1순위 자격 (단순)
 const subscriptionEligible = age >= 19; // 단순화

 return {
 maxLoan: finalLoan,
 ltvUsed: ltvAdjusted,
 requiredSelfMoney,
 acquisitionTax,
 totalSelfNeeded,
 currentSavings,
 shortfall,
 monthsToSave,
 yearsToSave,
 monthlyPayment,
 totalInterest,
 isReady: shortfall <= 0,
 isEligibleDigimdol,
 isEligibleBogeumjari,
 subscriptionEligible,
 };
 }, [targetPrice, annualIncome, currentSavings, monthlySavings, age, isMarried, region]);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Home className="w-4 h-4" /> 첫 주택 자금 시뮬
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">첫 주택</span> 자금 계획
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">자기자본 + 대출 + 청약 + 정책자금 통합 시뮬</p>
 </div>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h3 className="text-base font-black text-navy mb-3">목표 주택 + 본인 정보</h3>
 <label className="text-xs font-bold text-muted-blue block mb-1">목표 주택 가격</label>
 <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-2 mb-3 font-black text-navy outline-none focus:border-primary" step={50_000_000} />
 <p className="text-xs text-muted-blue -mt-2 mb-3">{fmt(targetPrice / 10000)}만원 = 약 {(targetPrice / 100_000_000).toFixed(1)}억</p>

 <div className="grid grid-cols-2 gap-3 mb-3">
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">연 소득</label>
 <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" step={1_000_000} />
 </div>
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">나이</label>
 <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3 mb-3">
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">현재 저축</label>
 <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" step={10_000_000} />
 </div>
 <div>
 <label className="text-xs font-bold text-muted-blue block mb-1">월 저축</label>
 <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-3 py-2 font-black text-navy outline-none focus:border-primary" step={100_000} />
 </div>
 </div>

 <div className="flex gap-2">
 <button onClick={() => setRegion("general")} className={`flex-1 py-2 rounded-lg text-sm font-black ${region === "general" ? "bg-primary text-navy" : "bg-canvas-dark text-muted-blue"}`}>일반지역 LTV 70%</button>
 <button onClick={() => setRegion("adjusted")} className={`flex-1 py-2 rounded-lg text-sm font-black ${region === "adjusted" ? "bg-primary text-navy" : "bg-canvas-dark text-muted-blue"}`}>조정지역 60%</button>
 </div>
 <label className="flex items-center gap-2 mt-3">
 <input type="checkbox" checked={isMarried} onChange={(e) => setIsMarried(e.target.checked)} className="w-4 h-4" />
 <span className="text-sm text-muted-blue">기혼 (생애최초 우대 80%)</span>
 </label>
 </section>

 <section className={`p-6 rounded-3xl text-center mb-4 ${result.isReady ? "bg-success/10 border-2 border-success" : "bg-electric/10 border-2 border-electric"}`}>
 <div className="flex items-center justify-center gap-2 mb-2">
 {result.isReady ? <CheckCircle2 className="w-6 h-6 text-success" /> : <AlertTriangle className="w-6 h-6 text-electric" />}
 <p className="text-xs font-black uppercase tracking-widest">
 {result.isReady ? "✓ 매수 가능" : `${result.yearsToSave.toFixed(1)}년 후 매수 가능`}
 </p>
 </div>
 <p className="text-3xl font-black text-navy">{fmt(result.maxLoan / 10000)}만원 대출 가능</p>
 <p className="text-sm text-muted-blue mt-2">LTV {(result.ltvUsed * 100).toFixed(0)}%</p>
 </section>

 <section className="grid grid-cols-2 gap-3 mb-4">
 <div className="bg-white p-4 rounded-2xl border border-canvas">
 <p className="text-xs text-muted-blue mb-1">필요 자기자본</p>
 <p className="text-xl font-black text-navy">{fmt(result.totalSelfNeeded / 10000)}만</p>
 <p className="text-xs text-muted-blue mt-1">매수가 + 취득세</p>
 </div>
 <div className="bg-white p-4 rounded-2xl border border-canvas">
 <p className="text-xs text-muted-blue mb-1">현재 자본</p>
 <p className="text-xl font-black text-navy">{fmt(currentSavings / 10000)}만</p>
 {result.shortfall > 0 && <p className="text-xs text-electric mt-1">부족: {fmt(result.shortfall / 10000)}만</p>}
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h3 className="text-sm font-black text-navy mb-3">💰 30년 대출 시 부담</h3>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between"><span className="text-muted-blue">월 상환액</span><span className="font-black text-navy">{fmt(result.monthlyPayment)}원</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">30년 총 이자</span><span className="font-black text-navy">{fmt(result.totalInterest / 10000)}만원</span></div>
 <div className="flex justify-between"><span className="text-muted-blue">취득세 (7%)</span><span className="font-black text-navy">{fmt(result.acquisitionTax / 10000)}만원</span></div>
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h3 className="text-sm font-black text-navy mb-3">🏛️ 정책자금·청약 자격</h3>
 <div className="space-y-2 text-sm">
 <div className={`flex items-center gap-2 ${result.isEligibleDigimdol ? "text-success" : "text-muted-blue"}`}>
 {result.isEligibleDigimdol ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
 <span>디딤돌 대출 (소득 7천 이하 + 주택 6억 이하 + 30세+)</span>
 </div>
 <div className={`flex items-center gap-2 ${result.isEligibleBogeumjari ? "text-success" : "text-muted-blue"}`}>
 {result.isEligibleBogeumjari ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
 <span>보금자리론 (소득 7천 이하 + 주택 9억 이하)</span>
 </div>
 <div className={`flex items-center gap-2 ${result.subscriptionEligible ? "text-success" : "text-muted-blue"}`}>
 {result.subscriptionEligible ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
 <span>주택청약 1순위 (24개월+ 가입)</span>
 </div>
 </div>
 </section>

 {result.shortfall > 0 && (
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2 flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-electric" /> 추가 자금 필요
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed">
 매수까지 약 <strong className="text-navy">{result.yearsToSave.toFixed(1)}년</strong> ({result.monthsToSave}개월) 추가 저축 필요. 월 {fmt(monthlySavings)}원 기준.
 </p>
 <p className="text-xs text-muted-blue mt-2">→ 빠른 매수 원하면: 1) 월 저축 ↑ 2) 더 작은 주택 검토 3) 디딤돌 대출 활용</p>
 </section>
 )}

 <section className="grid grid-cols-3 gap-2 mb-4">
 <Link href="/tools/real-estate/dsr" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">DSR 한도</p>
 </Link>
 <Link href="/tools/real-estate/ltv" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">LTV 한도</p>
 </Link>
 <Link href="/calc/housing-subscription-points" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">청약 가점</p>
 </Link>
 </section>
 </div>
 </main>
 );
}
