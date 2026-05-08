"use client";

// src/app/tools/career/job-change-decision/page.tsx
// 이직 결정 도구 — 현재 직장 vs 새 오퍼 가중 점수 비교 + 5년 자산 차이.

import { useState, useMemo } from "react";
import Link from "next/link";
import { GitCompare, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

interface CompanyEval {
 name: string;
 salary: number;
 workLifeBalance: number; // 1~10
 growthPotential: number; // 1~10
 stability: number; // 1~10
 commuteScore: number; // 1~10
 benefits: number; // 1~10
}

const WEIGHTS = {
 salary: 0.3,
 workLifeBalance: 0.2,
 growthPotential: 0.15,
 stability: 0.15,
 commuteScore: 0.1,
 benefits: 0.1,
};

export default function JobChangeDecisionPage() {
 const [step, setStep] = useState(1);
 const [current, setCurrent] = useState<CompanyEval>({
 name: "현재 회사",
 salary: 60_000_000,
 workLifeBalance: 6,
 growthPotential: 5,
 stability: 8,
 commuteScore: 7,
 benefits: 6,
 });
 const [offer, setOffer] = useState<CompanyEval>({
 name: "새 오퍼",
 salary: 75_000_000,
 workLifeBalance: 5,
 growthPotential: 8,
 stability: 6,
 commuteScore: 6,
 benefits: 7,
 });

 const result = useMemo(() => {
 // 연봉을 0~10 점으로 정규화 (둘 중 큰 게 10점)
 const maxSalary = Math.max(current.salary, offer.salary);
 const currentSalaryScore = (current.salary / maxSalary) * 10;
 const offerSalaryScore = (offer.salary / maxSalary) * 10;

 // 가중 점수 계산
 const currentScore =
 currentSalaryScore * WEIGHTS.salary +
 current.workLifeBalance * WEIGHTS.workLifeBalance +
 current.growthPotential * WEIGHTS.growthPotential +
 current.stability * WEIGHTS.stability +
 current.commuteScore * WEIGHTS.commuteScore +
 current.benefits * WEIGHTS.benefits;

 const offerScore =
 offerSalaryScore * WEIGHTS.salary +
 offer.workLifeBalance * WEIGHTS.workLifeBalance +
 offer.growthPotential * WEIGHTS.growthPotential +
 offer.stability * WEIGHTS.stability +
 offer.commuteScore * WEIGHTS.commuteScore +
 offer.benefits * WEIGHTS.benefits;

 const winner = offerScore > currentScore ? "offer" : "current";
 const scoreDiff = Math.abs(offerScore - currentScore);
 const decision = scoreDiff < 0.5 ? "비슷" : scoreDiff < 1.0 ? "약간 차이" : scoreDiff < 2.0 ? "분명한 차이" : "큰 차이";

 // 5년 자산 차이 (연 5% 저축 가정)
 const salaryDiff = offer.salary - current.salary;
 const fiveYearGain = salaryDiff * 5 * 0.6; // 세후 약 60% 가정
 const fiveYearSaving = fiveYearGain * 0.5; // 50% 저축 가정

 // 항목별 비교
 const breakdown = [
 { label: "연봉", current: currentSalaryScore, offer: offerSalaryScore, weight: WEIGHTS.salary, currentRaw: current.salary, offerRaw: offer.salary, isMoney: true },
 { label: "워라밸", current: current.workLifeBalance, offer: offer.workLifeBalance, weight: WEIGHTS.workLifeBalance },
 { label: "성장 가능성", current: current.growthPotential, offer: offer.growthPotential, weight: WEIGHTS.growthPotential },
 { label: "안정성", current: current.stability, offer: offer.stability, weight: WEIGHTS.stability },
 { label: "통근", current: current.commuteScore, offer: offer.commuteScore, weight: WEIGHTS.commuteScore },
 { label: "복지", current: current.benefits, offer: offer.benefits, weight: WEIGHTS.benefits },
 ];

 // 추천 의사결정
 let recommendation = "";
 if (decision === "큰 차이" && winner === "offer") recommendation = "이직 강력 추천. 종합 점수 큰 차이.";
 else if (decision === "분명한 차이" && winner === "offer") recommendation = "이직 권장. 5년 후 자산 + 성장 측면 유리.";
 else if (decision === "약간 차이" && winner === "offer") recommendation = "이직 검토. 본인 우선순위 재확인.";
 else if (decision === "비슷") recommendation = "현 직장 유지 권장. 큰 차이 없으니 이직 리스크 (학습·관계 새로 시작)을 감수할 가치 작음.";
 else recommendation = "현 직장 유지 권장. 종합 점수 우위.";

 return {
 currentScore: currentScore.toFixed(1),
 offerScore: offerScore.toFixed(1),
 winner,
 scoreDiff: scoreDiff.toFixed(1),
 decision,
 fiveYearGain,
 fiveYearSaving,
 salaryDiff,
 breakdown,
 recommendation,
 };
 }, [current, offer]);

 const setCurrentField = (key: keyof CompanyEval, value: any) => setCurrent((c) => ({ ...c, [key]: value }));
 const setOfferField = (key: keyof CompanyEval, value: any) => setOffer((o) => ({ ...o, [key]: value }));

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <GitCompare className="w-4 h-4" /> 이직 결정 도구
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">이직 결정</span> 도구
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">현 직장 vs 새 오퍼 가중 점수 비교 + 5년 자산 차이</p>
 </div>

 <div className="flex justify-center gap-2 mb-8">
 {[1, 2, 3].map((s) => <div key={s} className={`h-2 w-12 rounded-full transition ${step >= s ? "bg-primary" : "bg-canvas-dark"}`} />)}
 </div>

 {step === 1 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 1 / 3</p>
 <h2 className="text-xl font-black text-navy mb-4">현재 회사 평가</h2>
 <input value={current.name} onChange={(e) => setCurrentField("name", e.target.value)} className="w-full border border-canvas rounded-xl px-4 py-2 mb-3 font-black text-navy outline-none focus:border-primary" placeholder="회사명" />
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-1">연봉</label>
 <input type="number" value={current.salary} onChange={(e) => setCurrentField("salary", Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-2 mb-3 font-black text-navy outline-none focus:border-primary" step={1_000_000} />
 {[
 { key: "workLifeBalance" as const, label: "워라밸 (1~10)" },
 { key: "growthPotential" as const, label: "성장 가능성 (1~10)" },
 { key: "stability" as const, label: "안정성 (1~10)" },
 { key: "commuteScore" as const, label: "통근 (1=먼/10=가까운)" },
 { key: "benefits" as const, label: "복지 (1~10)" },
 ].map((f) => (
 <div key={f.key} className="mb-3">
 <label className="text-xs font-bold text-muted-blue block mb-1">{f.label}: <strong>{current[f.key]}</strong></label>
 <input type="range" min={1} max={10} value={current[f.key] as number} onChange={(e) => setCurrentField(f.key, Number(e.target.value))} className="w-full" />
 </div>
 ))}
 <button onClick={() => setStep(2)} className="w-full mt-4 bg-primary text-navy font-black py-3 rounded-xl">다음 →</button>
 </section>
 )}

 {step === 2 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 2 / 3</p>
 <h2 className="text-xl font-black text-navy mb-4">새 오퍼 평가</h2>
 <input value={offer.name} onChange={(e) => setOfferField("name", e.target.value)} className="w-full border border-canvas rounded-xl px-4 py-2 mb-3 font-black text-navy outline-none focus:border-primary" placeholder="회사명" />
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-1">제안 연봉</label>
 <input type="number" value={offer.salary} onChange={(e) => setOfferField("salary", Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-2 mb-3 font-black text-navy outline-none focus:border-primary" step={1_000_000} />
 {[
 { key: "workLifeBalance" as const, label: "워라밸 (1~10)" },
 { key: "growthPotential" as const, label: "성장 가능성 (1~10)" },
 { key: "stability" as const, label: "안정성 (1~10)" },
 { key: "commuteScore" as const, label: "통근 (1=먼/10=가까운)" },
 { key: "benefits" as const, label: "복지 (1~10)" },
 ].map((f) => (
 <div key={f.key} className="mb-3">
 <label className="text-xs font-bold text-muted-blue block mb-1">{f.label}: <strong>{offer[f.key]}</strong></label>
 <input type="range" min={1} max={10} value={offer[f.key] as number} onChange={(e) => setOfferField(f.key, Number(e.target.value))} className="w-full" />
 </div>
 ))}
 <div className="flex gap-2 mt-4">
 <button onClick={() => setStep(1)} className="flex-1 bg-canvas-dark font-black py-3 rounded-xl">← 이전</button>
 <button onClick={() => setStep(3)} className="flex-1 bg-primary text-navy font-black py-3 rounded-xl">결과 →</button>
 </div>
 </section>
 )}

 {step === 3 && (
 <>
 <section className={`p-6 rounded-3xl text-center mb-4 ${result.winner === "offer" ? "bg-electric/10 border-2 border-electric" : "bg-success/10 border-2 border-success"}`}>
 <div className="flex items-center justify-center gap-2 mb-2">
 {result.winner === "offer" ? <ArrowRight className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-success" />}
 <p className="text-xs font-black uppercase tracking-widest">{result.winner === "offer" ? "이직 우위" : "현 직장 우위"}</p>
 </div>
 <p className="text-2xl font-black text-navy mb-1">
 {result.winner === "offer" ? offer.name : current.name}
 </p>
 <p className="text-sm text-muted-blue">{result.decision} ({result.scoreDiff}점 차)</p>
 </section>

 <section className="grid grid-cols-2 gap-3 mb-4">
 <div className={`p-4 rounded-2xl text-center border-2 ${result.winner === "current" ? "border-success bg-success/5" : "border-canvas bg-white"}`}>
 <p className="text-xs text-muted-blue mb-1">{current.name}</p>
 <p className="text-3xl font-black text-navy">{result.currentScore}</p>
 <p className="text-xs text-muted-blue">/10</p>
 </div>
 <div className={`p-4 rounded-2xl text-center border-2 ${result.winner === "offer" ? "border-electric bg-electric/5" : "border-canvas bg-white"}`}>
 <p className="text-xs text-muted-blue mb-1">{offer.name}</p>
 <p className="text-3xl font-black text-navy">{result.offerScore}</p>
 <p className="text-xs text-muted-blue">/10</p>
 </div>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">📊 항목별 비교</h2>
 <div className="space-y-3 text-sm">
 {result.breakdown.map((b) => {
 const winner = b.offer > b.current ? "offer" : b.current > b.offer ? "current" : "tie";
 return (
 <div key={b.label}>
 <div className="flex justify-between text-xs mb-1">
 <span className="text-muted-blue">{b.label} <span className="text-[10px]">({(b.weight * 100).toFixed(0)}%)</span></span>
 <span className="text-muted-blue">{b.isMoney ? `${fmt(b.currentRaw! / 10000)}만 vs ${fmt(b.offerRaw! / 10000)}만` : `${b.current.toFixed(1)} vs ${b.offer.toFixed(1)}`}</span>
 </div>
 <div className="flex gap-1">
 <div className="flex-1 bg-canvas-dark rounded h-2 overflow-hidden"><div className={`h-full ${winner === "current" ? "bg-success" : "bg-canvas-dark"}`} style={{ width: `${(b.current / 10) * 100}%` }} /></div>
 <div className="flex-1 bg-canvas-dark rounded h-2 overflow-hidden"><div className={`h-full ${winner === "offer" ? "bg-electric" : "bg-canvas-dark"}`} style={{ width: `${(b.offer / 10) * 100}%` }} /></div>
 </div>
 </div>
 );
 })}
 </div>
 </section>

 {result.salaryDiff !== 0 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-2">💰 5년 자산 차이</h2>
 <p className="text-sm text-muted-blue mb-2">
 연봉 차이 <strong className="text-navy">{fmt(result.salaryDiff / 10000)}만원/년</strong> (세전)
 </p>
 <p className="text-xs text-muted-blue">→ 5년 누적 세후 약 <strong className="text-electric">{fmt(result.fiveYearGain / 10000)}만원</strong></p>
 <p className="text-xs text-muted-blue">→ 50% 저축 시 자산 차이 약 <strong className="text-electric">{fmt(result.fiveYearSaving / 10000)}만원</strong></p>
 </section>
 )}

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2 flex items-center gap-2">
 {result.winner === "offer" ? <ArrowRight className="w-4 h-4 text-electric" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
 추천
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed">{result.recommendation}</p>
 </section>

 <section className="grid grid-cols-3 gap-2 mb-4">
 <Link href="/tools/career/negotiation-simulator" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">연봉 협상</p>
 </Link>
 <Link href="/career-change-2026" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">이직 가이드</p>
 </Link>
 <Link href="/salary-db" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">회사 DB</p>
 </Link>
 </section>

 <button onClick={() => setStep(1)} className="w-full bg-canvas-dark text-navy font-black py-3 rounded-xl">🔄 다시 평가</button>
 </>
 )}
 </div>
 </main>
 );
}
