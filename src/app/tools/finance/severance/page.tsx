"use client";

import { useState, useMemo } from "react";
import { Briefcase, Info } from "lucide-react";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";
import { calcLegalSeveranceResult, DEFAULT_END_DATE, DEFAULT_START_DATE } from "./legalSeverance";
// 2026 퇴직소득세 계산 (환산급여 방식) — '퇴직금 직접 입력' 모드 전용
// ('법정 퇴직금 자동계산' 모드는 정본 calculateSeverancePay 의 세액을 그대로 쓴다 — legalSeverance.ts)
function calcSeveranceTax(severancePay: number, workYears: number): {
 tax: number; localTax: number; totalTax: number; netPay: number;
 annualizedPay: number; taxableIncome: number; effectiveRate: number;
} {
 const safePay = Math.max(0, severancePay);
 // 근속연수: 1년 미만 단수는 1년으로 본다 (소득세법 시행령)
 const safeYears = Math.max(1, Math.ceil(workYears));

 // 근속연수공제 (현행 4단계, 2023 개정 이후)
 let yearsDeduction = 0;
 if (safeYears <= 5) yearsDeduction = safeYears * 1_000_000;
 else if (safeYears <= 10) yearsDeduction = 5_000_000 + (safeYears - 5) * 2_000_000;
 else if (safeYears <= 20) yearsDeduction = 15_000_000 + (safeYears - 10) * 2_500_000;
 else yearsDeduction = 40_000_000 + (safeYears - 20) * 3_000_000;
 const afterYearsDeduction = Math.max(0, safePay - yearsDeduction);

 // 환산급여 = (퇴직금 - 근속연수 공제) / 근속연수 × 12
 const annualizedPay = (afterYearsDeduction / safeYears) * 12;

 // 환산급여 공제 (현행 구간표)
 let annualizedDeduction = 0;
 if (annualizedPay <= 8_000_000) annualizedDeduction = annualizedPay;
 else if (annualizedPay <= 70_000_000) annualizedDeduction = 8_000_000 + (annualizedPay - 8_000_000) * 0.6;
 else if (annualizedPay <= 100_000_000) annualizedDeduction = 45_200_000 + (annualizedPay - 70_000_000) * 0.55;
 else if (annualizedPay <= 300_000_000) annualizedDeduction = 61_700_000 + (annualizedPay - 100_000_000) * 0.45;
 else annualizedDeduction = 151_700_000 + (annualizedPay - 300_000_000) * 0.35;

 const taxableIncome = Math.max(0, annualizedPay - annualizedDeduction);

 // 세율 적용 (2026 누진세율)
 let annualTax = 0;
 if (taxableIncome <= 14_000_000) annualTax = taxableIncome * 0.06;
 else if (taxableIncome <= 50_000_000) annualTax = taxableIncome * 0.15 - 1_260_000;
 else if (taxableIncome <= 88_000_000) annualTax = taxableIncome * 0.24 - 5_760_000;
 else if (taxableIncome <= 150_000_000) annualTax = taxableIncome * 0.35 - 15_440_000;
 else if (taxableIncome <= 300_000_000) annualTax = taxableIncome * 0.38 - 19_940_000;
 else if (taxableIncome <= 500_000_000) annualTax = taxableIncome * 0.40 - 25_940_000;
 else if (taxableIncome <= 1_000_000_000) annualTax = taxableIncome * 0.42 - 35_940_000;
 else annualTax = taxableIncome * 0.45 - 65_940_000;

 // 환산세액을 다시 실제 세액으로 변환
 const tax = Math.max(0, Math.round((annualTax / 12) * safeYears));
 const localTax = Math.round(tax * 0.1);
 const totalTax = tax + localTax;
 const netPay = safePay - totalTax;
 const effectiveRate = safePay > 0 ? (totalTax / safePay) * 100 : 0;

 return { tax, localTax, totalTax, netPay, annualizedPay, taxableIncome, effectiveRate };
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function SeveranceCalculatorPage() {
 const [mode, setMode] = useState<"custom" | "calculate">("calculate");
 const [monthlySalary, setMonthlySalary] = useState(4_000_000);
 const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
 const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
 const [annualBonus, setAnnualBonus] = useState(0);
 const [annualLeavePay, setAnnualLeavePay] = useState(0);
 // 근속 년수는 '퇴직금 직접 입력' 모드의 세율 계산에만 쓴다(자동계산 모드는 입·퇴사일)
 const [workYears, setWorkYears] = useState(5);
 const [customSeverance, setCustomSeverance] = useState(20_000_000);

 // 법정 퇴직금 = 정본 엔진(홈 퇴직금 탭과 같은 식) — 상여금·연차수당 3/12 반영, 세액까지 정본 값
 const legal = useMemo(
 () => calcLegalSeveranceResult({ startDate, endDate, monthlySalary, annualBonus, annualLeavePay }),
 [startDate, endDate, monthlySalary, annualBonus, annualLeavePay]
 );
 const custom = useMemo(
 () => calcSeveranceTax(customSeverance, workYears),
 [customSeverance, workYears]
 );
 const severancePay = mode === "calculate" ? legal.severancePay : customSeverance;
 const r = mode === "calculate" ? legal : custom;

 return (
 <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
 <div className="max-w-3xl mx-auto">
 <div className="text-center mb-12 pb-10 border-b border-canvas">
 <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6">
 <Briefcase size={14} /> 2026 세법 기준
 </div>
 <h1 className="text-4xl font-black text-navy tracking-tight mb-3">퇴직금 세금 계산기</h1>
 <p className="text-faint-blue font-medium text-lg">법정 퇴직금과 실수령액을 2026년 퇴직소득세법으로 계산합니다</p>
 </div>

 {/* Mode Toggle */}
 <div className="flex gap-2 mb-8 mt-8 p-1 bg-canvas-dark rounded-xl">
 {[{ v: "calculate", l: "법정 퇴직금 자동계산" }, { v: "custom", l: "퇴직금 직접 입력" }].map(m => (
 <button
 key={m.v}
 onClick={() => setMode(m.v as "custom" | "calculate")}
 className={`flex-1 py-3 rounded-lg text-sm font-black transition-all ${mode === m.v ? "bg-white shadow text-primary" : "text-faint-blue"}`}
 >
 {m.l}
 </button>
 ))}
 </div>

 <div className="bg-white border border-canvas rounded-2xl p-8 mb-6 shadow-sm space-y-6">
 {mode === "calculate" ? (
 <>
 <div>
 <label htmlFor="severance-monthly-salary" className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">3개월 평균 월 급여 (세전)</label>
 <NumberInput id="severance-monthly-salary" type="number" inputMode="numeric" value={monthlySalary} onChange={e => setMonthlySalary(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3.5 text-xl font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 <p className="text-xs text-faint-blue mt-1.5">{fmt(monthlySalary)}원/월 · 연봉 {fmt(monthlySalary * 12)}원</p>
 </div>
 {/* 날짜 칸은 좌우 여백 px-3 — 360px 폭 안드로이드(드롭다운 화살표 포함)에서도 '2021. 10. 1.'이 잘리지 않게 */}
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label htmlFor="severance-start-date" className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">입사일</label>
 <input id="severance-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
 className="w-full border border-canvas rounded-xl px-3 py-3.5 font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 </div>
 <div>
 <label htmlFor="severance-end-date" className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">퇴사일</label>
 <input id="severance-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
 className="w-full border border-canvas rounded-xl px-3 py-3.5 font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 </div>
 </div>
 {/* 종전 '법정 퇴직금' 미리보기 상자 자리 — 입력 2칸 + 산식 한 줄로 바꿔 광고(CalcResultAd) 위 높이를 늘리지 않는다.
 금액은 아래 결과 카드 '세전 퇴직금' 행에 그대로 나온다. */}
 <div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label htmlFor="severance-annual-bonus" className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">연간 상여금</label>
 <NumberInput id="severance-annual-bonus" type="number" inputMode="numeric" min={0} value={annualBonus} onChange={e => setAnnualBonus(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3.5 font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 </div>
 <div>
 <label htmlFor="severance-annual-leave-pay" className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">연차수당</label>
 <NumberInput id="severance-annual-leave-pay" type="number" inputMode="numeric" min={0} value={annualLeavePay} onChange={e => setAnnualLeavePay(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3.5 font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 </div>
 </div>
 <p className="text-xs text-faint-blue mt-1.5">1일 평균임금 × 30일 × 재직일수 ÷ 365</p>
 </div>
 </>
 ) : (
 <div>
 <label htmlFor="severance-custom-amount" className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">수령 예정 퇴직금 (세전)</label>
 <NumberInput id="severance-custom-amount" type="number" inputMode="numeric" value={customSeverance} onChange={e => setCustomSeverance(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3.5 text-xl font-black text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 <div className="mt-4 grid grid-cols-2 gap-4">
 <div>
 <label htmlFor="severance-tax-work-years" className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">근속 년수 (세율 계산용)</label>
 <NumberInput id="severance-tax-work-years" type="number" inputMode="numeric" min={1} value={workYears} onChange={e => setWorkYears(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3.5 font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Result */}
 <div key={r.netPay}
 className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
 <div className="bg-primary p-8 text-center">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">실수령 퇴직금 (세후)</p>
 <p className="text-5xl font-black text-navy tracking-tight">{fmt(r.netPay)}<span className="text-2xl ml-1">원</span></p>
 <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-white/20">
 <div className="text-center"><p className="text-navy/60 text-xs mb-1">세금 합계</p><p className="text-navy font-black">{fmt(r.totalTax)}원</p></div>
 <div className="w-px bg-white/20" />
 <div className="text-center"><p className="text-navy/60 text-xs mb-1">실효세율</p><p className="text-navy font-black">{r.effectiveRate.toFixed(2)}%</p></div>
 </div>
 </div>
 <div className="bg-white p-6 space-y-3">
 {[
 { label: "세전 퇴직금", value: severancePay },
 { label: "퇴직소득세", value: -r.tax },
 { label: "지방소득세 (×10%)", value: -r.localTax },
 { label: "세후 실수령액", value: r.netPay, main: true },
 ].map(item => (
 <div key={item.label} className={`flex justify-between items-center py-2 ${item.main ? "border-t-2 border-primary pt-4" : "border-b border-canvas"}`}>
 <span className={`text-sm font-medium ${item.main ? "font-black text-navy" : "text-faint-blue"}`}>{item.label}</span>
 <span className={`font-black tabular-nums ${item.main ? "text-primary text-xl" : item.value < 0 ? "text-electric" : "text-navy"}`}>
 {item.value < 0 ? "-" : ""}{fmt(Math.abs(item.value))}원
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* 결과 직후 광고 */}
 <CalcResultAd />

 <div className="p-5 bg-canvas border border-canvas rounded-xl flex gap-3">
 <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
 <p className="text-xs text-muted-blue leading-relaxed">
 퇴직소득세는 <strong>환산급여 방식(2026 세법)</strong>으로 계산됩니다. 근속연수공제 및 환산급여공제가 적용되어
 일반 근로소득세보다 낮은 세율이 적용됩니다. IRP 이전 시 세금이 이연됩니다.
 </p>
 </div>

 </div>
 </main>
 );
}
