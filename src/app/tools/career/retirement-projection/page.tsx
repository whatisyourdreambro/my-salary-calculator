"use client";

// src/app/tools/career/retirement-projection/page.tsx
// 노후 자금 시뮬레이터 — 3층 연금 + 자산 + 인플레이션 반영.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sunset, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function RetirementProjectionPage() {
 const [step, setStep] = useState(1);
 const [currentAge, setCurrentAge] = useState(35);
 const [retirementAge, setRetirementAge] = useState(60);
 const [currentAssets, setCurrentAssets] = useState(100_000_000);
 const [monthlySavings, setMonthlySavings] = useState(1_000_000);
 const [annualReturn, setAnnualReturn] = useState(6);
 const [nationalPensionMonthly, setNationalPensionMonthly] = useState(1_200_000);
 const [targetMonthlyIncome, setTargetMonthlyIncome] = useState(3_500_000);

 const result = useMemo(() => {
 const yearsToRetire = Math.max(1, retirementAge - currentAge);
 const monthsToRetire = yearsToRetire * 12;
 const r = annualReturn / 100 / 12;
 const inflation = 0.025; // 연 2.5%

 // 은퇴 시점 자산 (현재 자산 복리 + 월 적립 복리)
 const assetGrowth = currentAssets * Math.pow(1 + r, monthsToRetire);
 const savingsGrowth = monthlySavings * (Math.pow(1 + r, monthsToRetire) - 1) / r;
 const retirementAssets = assetGrowth + savingsGrowth;

 // 4% 룰 인출 가능액 (월)
 const monthlyWithdrawal = (retirementAssets * 0.04) / 12;

 // 국민연금 시작 (65세 이후)
 const nationalPensionStart = 65;
 const beforePension = nationalPensionStart - retirementAge; // 은퇴 후 국민연금 시작 전 갭

 // 인플레이션 반영 목표 월 소득 (은퇴 시점 가치)
 const targetInflated = targetMonthlyIncome * Math.pow(1 + inflation, yearsToRetire);

 // 종합 가용 월 소득 (은퇴 즉시)
 const totalMonthlyAtRetire = monthlyWithdrawal + (retirementAge >= 65 ? nationalPensionMonthly : 0);

 // 65세 이후 가용 (자산 인출 + 국민연금)
 const totalMonthlyAt65 = monthlyWithdrawal + nationalPensionMonthly;

 const isOnTrack = totalMonthlyAt65 >= targetInflated;
 const shortfall = Math.max(0, targetInflated - totalMonthlyAt65);
 const requiredAdditional = shortfall > 0 ? (shortfall * 12 * 25) : 0; // 4% 룰 역산
 const additionalMonthlyNeeded = requiredAdditional / monthsToRetire / Math.pow(1 + r, monthsToRetire / 2);

 // 30년 자산 시뮬 (인출 후)
 const yearlyData: { year: number; assets: number; income: number }[] = [];
 let assets = retirementAssets;
 for (let i = 0; i <= 30; i++) {
 const ageAtYear = retirementAge + i;
 const income = monthlyWithdrawal * 12 + (ageAtYear >= 65 ? nationalPensionMonthly * 12 : 0);
 yearlyData.push({ year: ageAtYear, assets, income });
 assets = assets * (1 + annualReturn / 100) - monthlyWithdrawal * 12;
 if (assets < 0) assets = 0;
 }

 return {
 yearsToRetire,
 retirementAssets,
 monthlyWithdrawal,
 nationalPensionStart,
 beforePension,
 targetInflated,
 totalMonthlyAtRetire,
 totalMonthlyAt65,
 isOnTrack,
 shortfall,
 requiredAdditional,
 additionalMonthlyNeeded: Math.max(0, additionalMonthlyNeeded),
 yearlyData,
 };
 }, [currentAge, retirementAge, currentAssets, monthlySavings, annualReturn, nationalPensionMonthly, targetMonthlyIncome]);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Sunset className="w-4 h-4" /> 노후 자금 시뮬
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">노후 자금</span> 시뮬레이터
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">자산 + 국민연금 + 인플레이션 반영 30년 시뮬</p>
 </div>

 <div className="flex justify-center gap-2 mb-8">
 {[1, 2, 3].map((s) => <div key={s} className={`h-2 w-12 rounded-full transition ${step >= s ? "bg-primary" : "bg-canvas-dark"}`} />)}
 </div>

 {step === 1 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 1 / 3</p>
 <h2 className="text-xl font-black text-navy mb-4">현재 상황</h2>
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">현재 나이</label>
 <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" min={18} max={80} />
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">은퇴 희망 나이</label>
 <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" min={40} max={75} />
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">현재 자산 (퇴직금·예금·투자 합계)</label>
 <input type="number" value={currentAssets} onChange={(e) => setCurrentAssets(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 font-black text-navy outline-none focus:border-primary" step={10_000_000} />
 <p className="text-xs text-muted-blue mt-1">{fmt(currentAssets / 10000)}만원</p>
 <button onClick={() => setStep(2)} className="w-full mt-6 bg-primary text-navy font-black py-3 rounded-xl">다음 →</button>
 </section>
 )}

 {step === 2 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 2 / 3</p>
 <h2 className="text-xl font-black text-navy mb-4">저축·수익률</h2>
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">월 저축액 (모든 노후 저축)</label>
 <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" step={100_000} />
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">연 수익률 (%) — 권장 5~7%</label>
 <input type="number" value={annualReturn} onChange={(e) => setAnnualReturn(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" step={0.5} />
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">국민연금 예상 월 수령액 (65세부터)</label>
 <input type="number" value={nationalPensionMonthly} onChange={(e) => setNationalPensionMonthly(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 font-black text-navy outline-none focus:border-primary" step={100_000} />
 <p className="text-xs text-muted-blue mt-1">NPS '내 연금' 조회 시 정확. 평균 80~150만</p>
 <div className="flex gap-2 mt-6">
 <button onClick={() => setStep(1)} className="flex-1 bg-canvas-dark font-black py-3 rounded-xl">← 이전</button>
 <button onClick={() => setStep(3)} className="flex-1 bg-primary text-navy font-black py-3 rounded-xl">다음 →</button>
 </div>
 </section>
 )}

 {step === 3 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 3 / 3</p>
 <h2 className="text-xl font-black text-navy mb-4">목표 노후 생활</h2>
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">희망 월 생활비 (현재 가치)</label>
 <input type="number" value={targetMonthlyIncome} onChange={(e) => setTargetMonthlyIncome(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 font-black text-navy outline-none focus:border-primary" step={100_000} />
 <p className="text-xs text-muted-blue mt-1">검소 250만 / 보통 350만 / 풍족 500만+</p>
 <div className="flex gap-2 mt-6">
 <button onClick={() => setStep(2)} className="flex-1 bg-canvas-dark font-black py-3 rounded-xl">← 이전</button>
 <button onClick={() => setStep(4)} className="flex-1 bg-primary text-navy font-black py-3 rounded-xl">시뮬 결과 →</button>
 </div>
 </section>
 )}

 {step === 4 && (
 <>
 <section className={`p-8 rounded-3xl text-center mb-4 ${result.isOnTrack ? "bg-success/10 border-2 border-success" : "bg-electric/10 border-2 border-electric"}`}>
 <div className="flex items-center justify-center gap-2 mb-3">
 {result.isOnTrack ? <CheckCircle2 className="w-6 h-6 text-success" /> : <AlertTriangle className="w-6 h-6 text-electric" />}
 <p className="text-xs font-black uppercase tracking-widest text-navy">{result.isOnTrack ? "✓ 목표 달성 가능" : "⚠ 추가 저축 필요"}</p>
 </div>
 <p className="text-4xl font-black text-navy mb-2">{fmt(result.retirementAssets / 10000)}만원</p>
 <p className="text-sm text-muted-blue">{retirementAge}세 은퇴 시점 자산</p>
 </section>

 <section className="grid grid-cols-2 gap-3 mb-4">
 <div className="bg-white p-4 rounded-xl border border-canvas">
 <p className="text-xs text-muted-blue mb-1">월 인출 (4% 룰)</p>
 <p className="text-xl font-black text-navy">{fmt(result.monthlyWithdrawal)}원</p>
 </div>
 <div className="bg-white p-4 rounded-xl border border-canvas">
 <p className="text-xs text-muted-blue mb-1">+ 국민연금 (65세+)</p>
 <p className="text-xl font-black text-electric">{fmt(result.totalMonthlyAt65)}원</p>
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">📊 월 가용 소득 vs 목표</h2>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="text-muted-blue">목표 월 소득 (인플레 반영)</span>
 <span className="font-black text-navy">{fmt(result.targetInflated)}원</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-blue">{retirementAge}~64세 (자산만)</span>
 <span className={`font-black ${result.totalMonthlyAtRetire >= result.targetInflated ? "text-success" : "text-electric"}`}>{fmt(result.totalMonthlyAtRetire)}원</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-blue">65세+ (자산 + 국민연금)</span>
 <span className={`font-black ${result.totalMonthlyAt65 >= result.targetInflated ? "text-success" : "text-electric"}`}>{fmt(result.totalMonthlyAt65)}원</span>
 </div>
 </div>
 {!result.isOnTrack && (
 <div className="mt-4 p-3 bg-electric/10 rounded-xl">
 <p className="text-xs text-navy font-black mb-1">월 부족액 약 {fmt(result.shortfall)}원</p>
 <p className="text-xs text-muted-blue">→ 추가 저축 권장: 월 {fmt(result.additionalMonthlyNeeded)}원 (현재 + α)</p>
 </div>
 )}
 </section>

 {result.beforePension > 0 && (
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2">⏱️ 60~64세 갭 (국민연금 시작 전)</h2>
 <p className="text-xs text-muted-blue leading-relaxed">
 {retirementAge}세 은퇴 후 국민연금 시작(65세)까지 <strong className="text-navy">{result.beforePension}년</strong> 갭. 이 기간엔 자산 인출만으로 생활. 약 {fmt(result.monthlyWithdrawal * 12 * result.beforePension)}원 추가 자금 필요.
 </p>
 </section>
 )}

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">📈 30년 자산 추이 (5년 단위)</h2>
 <table className="w-full text-xs">
 <thead><tr className="text-muted-blue"><th className="text-left py-1">나이</th><th className="text-right">자산</th><th className="text-right">연 소득</th></tr></thead>
 <tbody>
 {result.yearlyData.filter((_, i) => i % 5 === 0).map((d) => (
 <tr key={d.year} className="border-t border-canvas">
 <td className="py-2 text-muted-blue font-black">{d.year}세</td>
 <td className="py-2 text-right text-navy tabular-nums">{fmt(d.assets / 10000)}만</td>
 <td className="py-2 text-right text-electric tabular-nums">{fmt(d.income / 10000)}만</td>
 </tr>
 ))}
 </tbody>
 </table>
 </section>

 <section className="grid grid-cols-3 gap-2 mb-4">
 <Link href="/tools/finance/irp" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">IRP 절세</p>
 </Link>
 <Link href="/calc/national-pension-estimate" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">국민연금</p>
 </Link>
 <Link href="/fire-calculator" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">FIRE</p>
 </Link>
 </section>

 <button onClick={() => setStep(1)} className="w-full bg-canvas-dark text-navy font-black py-3 rounded-xl">🔄 다시 시뮬</button>
 </>
 )}
 </div>
 </main>
 );
}
