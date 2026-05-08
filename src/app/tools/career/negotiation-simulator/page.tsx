"use client";

// src/app/tools/career/negotiation-simulator/page.tsx
// 인터랙티브 연봉 협상 시뮬레이터.
// 본인 연봉·시장 평균 → 추천 협상폭 + 멘트 + 예상 결과.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Target, ArrowRight, Calculator } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

const JOB_MARKETS: Record<string, { name: string; avgEntry: number; avgMid: number; avgSenior: number }> = {
 "backend-developer": { name: "백엔드 개발자", avgEntry: 45_000_000, avgMid: 65_000_000, avgSenior: 95_000_000 },
 "frontend-developer": { name: "프론트엔드 개발자", avgEntry: 42_000_000, avgMid: 60_000_000, avgSenior: 85_000_000 },
 "data-scientist": { name: "데이터 사이언티스트", avgEntry: 55_000_000, avgMid: 80_000_000, avgSenior: 120_000_000 },
 "product-manager": { name: "프로덕트 매니저", avgEntry: 50_000_000, avgMid: 75_000_000, avgSenior: 110_000_000 },
 "marketing-manager": { name: "마케팅 매니저", avgEntry: 42_000_000, avgMid: 65_000_000, avgSenior: 100_000_000 },
 "designer": { name: "디자이너", avgEntry: 40_000_000, avgMid: 58_000_000, avgSenior: 80_000_000 },
 "general": { name: "일반 사무직", avgEntry: 35_000_000, avgMid: 50_000_000, avgSenior: 75_000_000 },
 "finance": { name: "금융 직군", avgEntry: 50_000_000, avgMid: 75_000_000, avgSenior: 120_000_000 },
 "sales": { name: "영업", avgEntry: 38_000_000, avgMid: 60_000_000, avgSenior: 100_000_000 },
};

export default function NegotiationSimulatorPage() {
 const [step, setStep] = useState(1);
 const [currentSalary, setCurrentSalary] = useState(50_000_000);
 const [job, setJob] = useState("backend-developer");
 const [yearsExp, setYearsExp] = useState(5);
 const [companyType, setCompanyType] = useState<"flexible" | "moderate" | "strict">("moderate");

 const result = useMemo(() => {
 const jobData = JOB_MARKETS[job];
 // 경력별 시장 평균 추정
 const marketAvg =
 yearsExp <= 2 ? jobData.avgEntry :
 yearsExp <= 7 ? jobData.avgMid :
 jobData.avgSenior;

 const positionRatio = currentSalary / marketAvg;
 const isUnderPaid = positionRatio < 0.9;
 const isOverPaid = positionRatio > 1.15;

 // 추천 협상폭
 let recommendedRaise = 0;
 if (isUnderPaid) recommendedRaise = (marketAvg - currentSalary) * 0.7; // 시장 평균의 70% 격차 좁히기
 else recommendedRaise = currentSalary * (companyType === "flexible" ? 0.1 : companyType === "moderate" ? 0.07 : 0.04);

 const targetSalary = Math.round(currentSalary + recommendedRaise);
 const conservativeAsk = Math.round(currentSalary + recommendedRaise * 0.7);
 const aggressiveAsk = Math.round(currentSalary + recommendedRaise * 1.5);

 // 협상 성공 확률 추정
 let successRate = 70;
 if (isUnderPaid) successRate = 85;
 if (isOverPaid) successRate = 35;
 if (companyType === "strict") successRate -= 15;
 if (companyType === "flexible") successRate += 10;

 // 추천 멘트
 const reasons = isUnderPaid
 ? ["시장 평균 대비 연봉이 낮음", "본인 직무 시장 가치 상승", "경력·기술 스택 확장"]
 : ["성과 + 책임 확대", "시장 평균 대비 적정성", "장기 기여 가치"];

 const mentToScript = `안녕하세요. 제 연봉 인상에 대해 협상하고 싶어 말씀드립니다. ${jobData.name} 직군의 ${yearsExp}년차 시장 평균(${fmt(marketAvg / 10000)}만원)과 비교하면 ${isUnderPaid ? "현재 제 연봉이 시장 대비 낮은 편" : "현재 제 연봉이 시장과 유사하거나 적정"}입니다. 지난 1년간 ${reasons[0]}와 ${reasons[1]}을(를) 고려하여, 연봉을 ${fmt(targetSalary / 10000)}만원으로 인상해 주실 수 있을지 검토 부탁드립니다.`;

 return {
 marketAvg,
 positionRatio,
 isUnderPaid,
 isOverPaid,
 targetSalary,
 conservativeAsk,
 aggressiveAsk,
 successRate,
 reasons,
 mentToScript,
 };
 }, [currentSalary, job, yearsExp, companyType]);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Target className="w-4 h-4" /> 인터랙티브 시뮬
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 연봉 <span className="text-electric">협상 시뮬레이터</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">
 본인 위치 분석 + 추천 협상폭 + 협상 멘트 자동 생성
 </p>
 </div>

 {/* Progress */}
 <div className="flex justify-center gap-2 mb-8">
 {[1, 2, 3, 4].map((s) => (
 <div
 key={s}
 className={`h-2 w-12 rounded-full transition ${step >= s ? "bg-primary" : "bg-canvas-dark"}`}
 />
 ))}
 </div>

 {step === 1 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 1</p>
 <h2 className="text-xl font-black text-navy mb-4">현재 연봉을 입력해주세요</h2>
 <input
 type="number"
 value={currentSalary}
 onChange={(e) => setCurrentSalary(Number(e.target.value) || 0)}
 className="w-full border border-canvas rounded-xl px-4 py-3.5 text-2xl font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
 step={1_000_000}
 />
 <p className="text-sm text-muted-blue mt-2">{fmt(currentSalary / 10000)}만원</p>
 <button onClick={() => setStep(2)} className="w-full mt-6 bg-primary text-navy font-black py-3 rounded-xl hover:opacity-90 transition">다음 →</button>
 </section>
 )}

 {step === 2 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 2</p>
 <h2 className="text-xl font-black text-navy mb-4">직군과 경력</h2>
 <select
 value={job}
 onChange={(e) => setJob(e.target.value)}
 className="w-full border border-canvas rounded-xl px-4 py-3 text-base font-bold mb-4 focus:border-primary outline-none"
 >
 {Object.entries(JOB_MARKETS).map(([key, val]) => (
 <option key={key} value={key}>{val.name}</option>
 ))}
 </select>
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">경력 년수</label>
 <input
 type="number"
 value={yearsExp}
 onChange={(e) => setYearsExp(Number(e.target.value) || 0)}
 className="w-full border border-canvas rounded-xl px-4 py-3 text-lg font-black text-navy focus:border-primary outline-none"
 min={0}
 max={40}
 />
 <div className="flex gap-2 mt-6">
 <button onClick={() => setStep(1)} className="flex-1 bg-canvas-dark text-navy font-black py-3 rounded-xl">← 이전</button>
 <button onClick={() => setStep(3)} className="flex-1 bg-primary text-navy font-black py-3 rounded-xl">다음 →</button>
 </div>
 </section>
 )}

 {step === 3 && (
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-6">
 <p className="text-xs font-black text-electric mb-2">STEP 3</p>
 <h2 className="text-xl font-black text-navy mb-4">회사 분위기</h2>
 <div className="space-y-2">
 {[
 { value: "flexible", label: "🟢 유연 (스타트업·외국계)", desc: "협상 친화적, 큰 인상 가능" },
 { value: "moderate", label: "🟡 보통 (대부분 회사)", desc: "표준 협상 가능" },
 { value: "strict", label: "🔴 엄격 (대기업·공공)", desc: "체계적, 협상 폭 제한" },
 ].map((opt) => (
 <button
 key={opt.value}
 onClick={() => setCompanyType(opt.value as any)}
 className={`w-full text-left p-4 rounded-xl border-2 transition ${companyType === opt.value ? "border-primary bg-primary/5" : "border-canvas hover:border-electric"}`}
 >
 <p className="font-black text-navy">{opt.label}</p>
 <p className="text-xs text-muted-blue mt-1">{opt.desc}</p>
 </button>
 ))}
 </div>
 <div className="flex gap-2 mt-6">
 <button onClick={() => setStep(2)} className="flex-1 bg-canvas-dark text-navy font-black py-3 rounded-xl">← 이전</button>
 <button onClick={() => setStep(4)} className="flex-1 bg-primary text-navy font-black py-3 rounded-xl">결과 보기 →</button>
 </div>
 </section>
 )}

 {step === 4 && (
 <>
 {/* 시장 위치 */}
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-lg font-black text-navy mb-3">📊 본인 시장 위치</h2>
 <p className="text-sm text-muted-blue mb-3">
 시장 평균 <strong className="text-navy">{fmt(result.marketAvg / 10000)}만원</strong> 대비 본인은{" "}
 <strong className={result.isUnderPaid ? "text-electric" : result.isOverPaid ? "text-success" : "text-navy"}>
 {(result.positionRatio * 100).toFixed(0)}%
 </strong>{" "}
 {result.isUnderPaid ? "(저평가)" : result.isOverPaid ? "(고평가)" : "(시장 평균)"}
 </p>
 <div className="w-full h-3 bg-canvas-dark rounded-full overflow-hidden">
 <div
 className={`h-full ${result.isUnderPaid ? "bg-electric" : result.isOverPaid ? "bg-success" : "bg-primary"}`}
 style={{ width: `${Math.min(100, result.positionRatio * 100)}%` }}
 />
 </div>
 </section>

 {/* 추천 협상폭 */}
 <section className="bg-primary p-6 rounded-3xl text-center mb-4">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">추천 목표 연봉</p>
 <p className="text-4xl font-black text-navy">{fmt(result.targetSalary / 10000)}만원</p>
 <p className="text-sm text-navy/70 mt-2">+ {fmt((result.targetSalary - currentSalary) / 10000)}만원 인상 ({(((result.targetSalary - currentSalary) / currentSalary) * 100).toFixed(1)}%)</p>
 </section>

 {/* 단계별 협상 옵션 */}
 <section className="grid grid-cols-3 gap-2 mb-4">
 <div className="bg-white p-3 rounded-xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">보수적</p>
 <p className="text-sm font-black text-navy">{fmt(result.conservativeAsk / 10000)}만</p>
 </div>
 <div className="bg-electric/10 p-3 rounded-xl border-2 border-electric text-center">
 <p className="text-xs text-electric font-black mb-1">권장</p>
 <p className="text-sm font-black text-navy">{fmt(result.targetSalary / 10000)}만</p>
 </div>
 <div className="bg-white p-3 rounded-xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">공격적</p>
 <p className="text-sm font-black text-navy">{fmt(result.aggressiveAsk / 10000)}만</p>
 </div>
 </section>

 {/* 성공 확률 */}
 <section className="bg-white p-5 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-2">🎯 협상 성공 확률 (추정)</h2>
 <div className="flex items-center gap-3">
 <p className="text-3xl font-black text-electric">{result.successRate}%</p>
 <p className="text-xs text-muted-blue">
 {result.successRate >= 75 ? "강하게 시도할 만함" : result.successRate >= 50 ? "신중히 접근" : "이직 카드 준비 권장"}
 </p>
 </div>
 </section>

 {/* 추천 멘트 */}
 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">💬 추천 협상 멘트</h2>
 <div className="bg-canvas-dark p-4 rounded-xl">
 <p className="text-sm text-navy leading-relaxed">{result.mentToScript}</p>
 </div>
 <button
 onClick={() => navigator.clipboard.writeText(result.mentToScript)}
 className="w-full mt-3 bg-primary text-navy font-black py-2 rounded-xl text-sm hover:opacity-90 transition"
 >
 멘트 복사하기 📋
 </button>
 </section>

 {/* 협상 근거 */}
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2">⭐ 협상 시 강조할 포인트</h2>
 <ul className="text-sm text-muted-blue space-y-1">
 {result.reasons.map((r, i) => <li key={i}>• {r}</li>)}
 </ul>
 </section>

 {/* 다른 직업 분석 */}
 <section className="grid grid-cols-2 gap-3 mb-4">
 <Link href={`/job/${job}/salary`} className="bg-white p-4 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-sm font-black text-navy">{JOB_MARKETS[job].name} 평균</p>
 <p className="text-xs text-muted-blue mt-1">상세 분석</p>
 </Link>
 <Link href="/career-change-2026" className="bg-white p-4 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-sm font-black text-navy">이직 가이드</p>
 <p className="text-xs text-muted-blue mt-1">시장 가치 평가</p>
 </Link>
 </section>

 <button
 onClick={() => setStep(1)}
 className="w-full bg-canvas-dark text-navy font-black py-3 rounded-xl mb-6"
 >
 🔄 다시 시뮬레이션
 </button>

 <div className="bg-white p-5 rounded-2xl border border-canvas">
 <p className="text-xs text-muted-blue leading-relaxed">
 ※ 본 시뮬레이터는 평균 데이터 + 경험적 추정값 기반입니다. 실제 협상은 본인 회사·직무·성과·관계 등 개별 상황을 고려해야 합니다. 본 결과를 참고로만 활용하세요.
 </p>
 </div>
 </>
 )}
 </div>
 </main>
 );
}
