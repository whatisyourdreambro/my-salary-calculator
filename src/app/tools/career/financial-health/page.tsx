"use client";

// src/app/tools/career/financial-health/page.tsx
// 재무 건강 진단 — 자산·부채·소득·저축 → 점수 + 액션 추천.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Heart, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function FinancialHealthPage() {
 const [step, setStep] = useState(1);
 const [age, setAge] = useState(35);
 const [annualIncome, setAnnualIncome] = useState(60_000_000);
 const [totalAssets, setTotalAssets] = useState(150_000_000);
 const [totalDebt, setTotalDebt] = useState(80_000_000);
 const [monthlySavings, setMonthlySavings] = useState(800_000);
 const [emergencyFund, setEmergencyFund] = useState(20_000_000);
 const [hasInsurance, setHasInsurance] = useState(true);
 const [hasIRP, setHasIRP] = useState(false);

 const result = useMemo(() => {
 // 점수 계산 (각 카테고리 100점 만점)
 const monthlyIncome = annualIncome / 12;
 const monthlyExpenseEst = monthlyIncome - monthlySavings;
 const netWorth = totalAssets - totalDebt;
 const debtToIncome = totalDebt / annualIncome;
 const savingsRate = (monthlySavings * 12) / annualIncome;
 const emergencyMonths = emergencyFund / monthlyExpenseEst;

 // 자산 점수 (나이 대비 권장 자산)
 const expectedNetWorth = annualIncome * (age - 22) * 0.5; // 나이 × 연봉 × 0.5
 const assetScore = Math.min(100, (netWorth / expectedNetWorth) * 100);

 // 부채 점수 (DTI 기준)
 const debtScore = debtToIncome < 1.0 ? 100 : debtToIncome < 2.0 ? 70 : debtToIncome < 3.0 ? 40 : 10;

 // 저축 점수 (저축률 기준)
 const savingsScore = savingsRate >= 0.3 ? 100 : savingsRate >= 0.2 ? 80 : savingsRate >= 0.1 ? 60 : 30;

 // 비상금 점수 (6개월 권장)
 const emergencyScore = emergencyMonths >= 6 ? 100 : emergencyMonths >= 3 ? 70 : emergencyMonths >= 1 ? 40 : 10;

 // 보장 점수 (보험·IRP)
 const protectionScore = (hasInsurance ? 50 : 0) + (hasIRP ? 50 : 0);

 const totalScore = Math.round(
 assetScore * 0.25 + debtScore * 0.2 + savingsScore * 0.25 + emergencyScore * 0.15 + protectionScore * 0.15
 );

 const grade = totalScore >= 85 ? "A+" : totalScore >= 75 ? "A" : totalScore >= 65 ? "B" : totalScore >= 50 ? "C" : "D";
 const gradeColor = totalScore >= 75 ? "text-success" : totalScore >= 50 ? "text-electric" : "text-red-500";

 // 추천 액션
 const actions: { priority: number; title: string; reason: string }[] = [];
 if (assetScore < 60) actions.push({ priority: 1, title: "자산 형성 가속", reason: `나이 대비 자산 부족. 권장 ${fmt(expectedNetWorth / 10000)}만원 대비 본인 ${fmt(netWorth / 10000)}만원.` });
 if (debtScore < 60) actions.push({ priority: 1, title: "부채 상환 우선", reason: `부채/연소득 ${(debtToIncome * 100).toFixed(0)}% — 200% 초과 시 위험. 고금리 부채부터 상환.` });
 if (savingsScore < 60) actions.push({ priority: 2, title: "저축률 ↑", reason: `현재 ${(savingsRate * 100).toFixed(0)}% — 권장 20%+. 월 ${fmt(monthlySavings)}원 → ${fmt((monthlyIncome * 0.2))}원으로 늘리기.` });
 if (emergencyScore < 60) actions.push({ priority: 2, title: "비상금 확보", reason: `${emergencyMonths.toFixed(1)}개월치 — 6개월 권장. CMA·MMF에 즉시 가용 자금.` });
 if (!hasIRP) actions.push({ priority: 3, title: "IRP·연금저축 가입", reason: "최대 900만 세액공제 (16.5~13.2%). 노후 자금 + 절세." });
 if (!hasInsurance) actions.push({ priority: 3, title: "실손·정기보험 가입", reason: "의료비 + 가족 보장. 미가입 시 큰 사고 시 재무 위험." });

 actions.sort((a, b) => a.priority - b.priority);

 return {
 totalScore,
 grade,
 gradeColor,
 assetScore: Math.round(assetScore),
 debtScore: Math.round(debtScore),
 savingsScore: Math.round(savingsScore),
 emergencyScore: Math.round(emergencyScore),
 protectionScore: Math.round(protectionScore),
 netWorth,
 expectedNetWorth,
 savingsRate,
 debtToIncome,
 emergencyMonths,
 actions: actions.slice(0, 5),
 };
 }, [age, annualIncome, totalAssets, totalDebt, monthlySavings, emergencyFund, hasInsurance, hasIRP]);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Heart className="w-4 h-4" /> 재무 건강 진단
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">재무 건강</span> 점수
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">자산·부채·저축·비상금·보장 5개 영역 종합 진단</p>
 </div>

 <div className="flex justify-center gap-2 mb-8">
 {[1, 2, 3, 4].map((s) => (
 <div key={s} className={`h-2 w-12 rounded-full transition ${step >= s ? "bg-primary" : "bg-canvas-dark"}`} />
 ))}
 </div>

 {step === 1 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 1 / 4</p>
 <h2 className="text-xl font-black text-navy mb-4">기본 정보</h2>
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">현재 나이 (만)</label>
 <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" min={18} max={80} />
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">연 소득 (세전)</label>
 <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 font-black text-navy outline-none focus:border-primary" step={1_000_000} />
 <p className="text-xs text-muted-blue mt-1">{fmt(annualIncome / 10000)}만원</p>
 <button onClick={() => setStep(2)} className="w-full mt-6 bg-primary text-navy font-black py-3 rounded-xl">다음 →</button>
 </section>
 )}

 {step === 2 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 2 / 4</p>
 <h2 className="text-xl font-black text-navy mb-4">자산·부채</h2>
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">총 자산 (부동산·주식·예금 등)</label>
 <input type="number" value={totalAssets} onChange={(e) => setTotalAssets(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" step={10_000_000} />
 <p className="text-xs text-muted-blue -mt-2 mb-4">{fmt(totalAssets / 10000)}만원</p>
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">총 부채 (대출 합계)</label>
 <input type="number" value={totalDebt} onChange={(e) => setTotalDebt(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 font-black text-navy outline-none focus:border-primary" step={10_000_000} />
 <p className="text-xs text-muted-blue mt-1">{fmt(totalDebt / 10000)}만원 (순자산: {fmt((totalAssets - totalDebt) / 10000)}만원)</p>
 <div className="flex gap-2 mt-6">
 <button onClick={() => setStep(1)} className="flex-1 bg-canvas-dark font-black py-3 rounded-xl">← 이전</button>
 <button onClick={() => setStep(3)} className="flex-1 bg-primary text-navy font-black py-3 rounded-xl">다음 →</button>
 </div>
 </section>
 )}

 {step === 3 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 3 / 4</p>
 <h2 className="text-xl font-black text-navy mb-4">저축·비상금</h2>
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">월 저축액</label>
 <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" step={100_000} />
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">비상금 (즉시 인출 가능)</label>
 <input type="number" value={emergencyFund} onChange={(e) => setEmergencyFund(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 font-black text-navy outline-none focus:border-primary" step={1_000_000} />
 <p className="text-xs text-muted-blue mt-1">{fmt(emergencyFund / 10000)}만원</p>
 <div className="flex gap-2 mt-6">
 <button onClick={() => setStep(2)} className="flex-1 bg-canvas-dark font-black py-3 rounded-xl">← 이전</button>
 <button onClick={() => setStep(4)} className="flex-1 bg-primary text-navy font-black py-3 rounded-xl">다음 →</button>
 </div>
 </section>
 )}

 {step === 4 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 4 / 4</p>
 <h2 className="text-xl font-black text-navy mb-4">보장 · 절세</h2>
 <div className="space-y-3">
 <label className="flex items-center gap-3 p-4 border-2 border-canvas rounded-xl cursor-pointer hover:border-electric">
 <input type="checkbox" checked={hasInsurance} onChange={(e) => setHasInsurance(e.target.checked)} className="w-5 h-5" />
 <div>
 <p className="font-black text-navy">실손의료보험 가입</p>
 <p className="text-xs text-muted-blue">의료비 본인부담 보장</p>
 </div>
 </label>
 <label className="flex items-center gap-3 p-4 border-2 border-canvas rounded-xl cursor-pointer hover:border-electric">
 <input type="checkbox" checked={hasIRP} onChange={(e) => setHasIRP(e.target.checked)} className="w-5 h-5" />
 <div>
 <p className="font-black text-navy">IRP·연금저축 가입</p>
 <p className="text-xs text-muted-blue">최대 900만 세액공제 + 노후 자금</p>
 </div>
 </label>
 </div>
 <div className="flex gap-2 mt-6">
 <button onClick={() => setStep(3)} className="flex-1 bg-canvas-dark font-black py-3 rounded-xl">← 이전</button>
 <button onClick={() => setStep(5)} className="flex-1 bg-primary text-navy font-black py-3 rounded-xl">진단 결과 →</button>
 </div>
 </section>
 )}

 {step === 5 && (
 <>
 <section className="bg-primary p-8 rounded-3xl text-center mb-4">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">재무 건강 점수</p>
 <p className={`text-7xl font-black ${result.gradeColor}`}>{result.grade}</p>
 <p className="text-3xl font-black text-navy mt-2">{result.totalScore}<span className="text-base">/100</span></p>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">📊 영역별 점수</h2>
 <div className="space-y-3">
 {[
 { label: "자산 (나이 대비)", score: result.assetScore, weight: 25 },
 { label: "부채 관리 (DTI)", score: result.debtScore, weight: 20 },
 { label: "저축률", score: result.savingsScore, weight: 25 },
 { label: "비상금", score: result.emergencyScore, weight: 15 },
 { label: "보장·절세", score: result.protectionScore, weight: 15 },
 ].map((c) => (
 <div key={c.label}>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-muted-blue">{c.label} <span className="text-xs">({c.weight}%)</span></span>
 <span className="font-black text-navy">{c.score}/100</span>
 </div>
 <div className="w-full h-2 bg-canvas-dark rounded-full overflow-hidden">
 <div className={`h-full ${c.score >= 75 ? "bg-success" : c.score >= 50 ? "bg-primary" : "bg-electric"}`} style={{ width: `${c.score}%` }} />
 </div>
 </div>
 ))}
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3 flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-electric" /> 핵심 지표
 </h2>
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div className="p-3 bg-canvas-dark rounded-xl"><p className="text-xs text-muted-blue">순자산</p><p className="font-black text-navy">{fmt(result.netWorth / 10000)}만</p></div>
 <div className="p-3 bg-canvas-dark rounded-xl"><p className="text-xs text-muted-blue">권장 자산 (나이 대비)</p><p className="font-black text-navy">{fmt(result.expectedNetWorth / 10000)}만</p></div>
 <div className="p-3 bg-canvas-dark rounded-xl"><p className="text-xs text-muted-blue">저축률</p><p className="font-black text-navy">{(result.savingsRate * 100).toFixed(0)}%</p></div>
 <div className="p-3 bg-canvas-dark rounded-xl"><p className="text-xs text-muted-blue">DTI</p><p className="font-black text-navy">{(result.debtToIncome * 100).toFixed(0)}%</p></div>
 </div>
 </section>

 {result.actions.length > 0 && (
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-6 mb-4">
 <h2 className="text-base font-black text-navy mb-3 flex items-center gap-2">
 <AlertTriangle className="w-5 h-5 text-electric" /> 우선순위 액션
 </h2>
 <div className="space-y-3">
 {result.actions.map((a, i) => (
 <div key={i} className="flex gap-3">
 <div className="flex-shrink-0 w-7 h-7 bg-electric text-white rounded-full flex items-center justify-center font-black text-xs">{i + 1}</div>
 <div>
 <p className="font-black text-navy text-sm">{a.title}</p>
 <p className="text-xs text-muted-blue mt-0.5">{a.reason}</p>
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 <section className="grid grid-cols-2 gap-3 mb-4">
 <Link href="/calc/emergency-fund" className="bg-white p-4 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-sm font-black text-navy">비상금 목표</p>
 </Link>
 <Link href="/tools/finance/irp" className="bg-white p-4 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-sm font-black text-navy">IRP 절세</p>
 </Link>
 </section>

 <button onClick={() => setStep(1)} className="w-full bg-canvas-dark text-navy font-black py-3 rounded-xl">🔄 다시 진단</button>
 </>
 )}
 </div>
 </main>
 );
}
