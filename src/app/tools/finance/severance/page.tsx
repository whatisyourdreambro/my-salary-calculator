"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Briefcase, Info, ArrowRight } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// 2026 퇴직소득세 계산 (환산급여 방식)
function calcSeveranceTax(severancePay: number, workYears: number): {
  tax: number; localTax: number; totalTax: number; netPay: number;
  annualizedPay: number; taxableIncome: number; effectiveRate: number;
} {
  const safePay = Math.max(0, severancePay);
  const safeYears = Math.max(1, workYears);

  // 퇴직소득공제: 근속연수 × 200만원 (최대), 2026 기준
  const yearsDeduction = Math.min(safeYears, 20) * 2_000_000
    + Math.max(0, safeYears - 20) * 2_500_000;
  const afterYearsDeduction = Math.max(0, safePay - yearsDeduction);

  // 환산급여 = (퇴직금 - 근속연수 공제) / 근속연수 × 12
  const annualizedPay = (afterYearsDeduction / safeYears) * 12;

  // 환산급여 공제
  let annualizedDeduction = 0;
  if (annualizedPay <= 8_000_000) annualizedDeduction = annualizedPay;
  else if (annualizedPay <= 70_000_000) annualizedDeduction = 8_000_000 + (annualizedPay - 8_000_000) * 0.6;
  else if (annualizedPay <= 140_000_000) annualizedDeduction = 45_200_000 + (annualizedPay - 70_000_000) * 0.55;
  else if (annualizedPay <= 300_000_000) annualizedDeduction = 83_700_000 + (annualizedPay - 140_000_000) * 0.45;
  else annualizedDeduction = 155_700_000 + (annualizedPay - 300_000_000) * 0.35;

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

// 법정 퇴직금 계산
function calcLegalSeverance(monthlySalary: number, workYears: number, workMonths: number = 0): number {
  const totalMonths = workYears * 12 + workMonths;
  if (totalMonths < 12) return 0;
  return Math.round(monthlySalary * (totalMonths / 12));
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function SeveranceCalculatorPage() {
  const [mode, setMode] = useState<"custom" | "calculate">("calculate");
  const [monthlySalary, setMonthlySalary] = useState(4_000_000);
  const [workYears, setWorkYears] = useState(5);
  const [workMonths, setWorkMonths] = useState(0);
  const [customSeverance, setCustomSeverance] = useState(20_000_000);

  const legalSeverance = useMemo(
    () => calcLegalSeverance(monthlySalary, workYears, workMonths),
    [monthlySalary, workYears, workMonths]
  );
  const severancePay = mode === "calculate" ? legalSeverance : customSeverance;
  const r = useMemo(
    () => calcSeveranceTax(severancePay, workYears + workMonths / 12),
    [severancePay, workYears, workMonths]
  );

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 pb-10 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6">
            <Briefcase size={14} /> 2026 세법 기준
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">퇴직금 세금 계산기</h1>
          <p className="text-slate-500 font-medium text-lg">법정 퇴직금과 실수령액을 2026년 퇴직소득세법으로 계산합니다</p>
        </div>

        <AdUnit slotId="severance_top" format="auto" label="퇴직금 상단" />

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8 mt-8 p-1 bg-slate-100 rounded-xl">
          {[{ v: "calculate", l: "법정 퇴직금 자동계산" }, { v: "custom", l: "퇴직금 직접 입력" }].map(m => (
            <button
              key={m.v}
              onClick={() => setMode(m.v as any)}
              className={`flex-1 py-3 rounded-lg text-sm font-black transition-all ${mode === m.v ? "bg-white shadow text-primary" : "text-slate-500"}`}
            >
              {m.l}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm space-y-6">
          {mode === "calculate" ? (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">3개월 평균 월 급여 (세전)</label>
                <input type="number" value={monthlySalary} onChange={e => setMonthlySalary(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                <p className="text-xs text-slate-400 mt-1.5">{fmt(monthlySalary)}원/월 · 연봉 {fmt(monthlySalary * 12)}원</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">근속 년수</label>
                  <input type="number" min={0} value={workYears} onChange={e => setWorkYears(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">추가 개월 수</label>
                  <input type="number" min={0} max={11} value={workMonths} onChange={e => setWorkMonths(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">법정 퇴직금</p>
                <p className="text-3xl font-black text-primary">{fmt(legalSeverance)}원</p>
                <p className="text-xs text-slate-500 mt-1">월급여 × 총 근속 개월수 / 12</p>
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">수령 예정 퇴직금 (세전)</label>
              <input type="number" value={customSeverance} onChange={e => setCustomSeverance(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-black text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">근속 년수 (세율 계산용)</label>
                  <input type="number" min={1} value={workYears} onChange={e => setWorkYears(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <motion.div key={r.netPay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6">
          <div className="bg-primary p-8 text-center">
            <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-2">실수령 퇴직금 (세후)</p>
            <p className="text-5xl font-black text-white tracking-tight">{fmt(r.netPay)}<span className="text-2xl ml-1">원</span></p>
            <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-white/20">
              <div className="text-center"><p className="text-white/60 text-xs mb-1">세금 합계</p><p className="text-white font-black">{fmt(r.totalTax)}원</p></div>
              <div className="w-px bg-white/20" />
              <div className="text-center"><p className="text-white/60 text-xs mb-1">실효세율</p><p className="text-white font-black">{r.effectiveRate.toFixed(2)}%</p></div>
            </div>
          </div>
          <div className="bg-white p-6 space-y-3">
            {[
              { label: "세전 퇴직금", value: severancePay },
              { label: "퇴직소득세", value: -r.tax },
              { label: "지방소득세 (×10%)", value: -r.localTax },
              { label: "세후 실수령액", value: r.netPay, main: true },
            ].map(item => (
              <div key={item.label} className={`flex justify-between items-center py-2 ${item.main ? "border-t-2 border-primary pt-4" : "border-b border-gray-100"}`}>
                <span className={`text-sm font-medium ${item.main ? "font-black text-slate-900" : "text-slate-500"}`}>{item.label}</span>
                <span className={`font-black tabular-nums ${item.main ? "text-primary text-xl" : item.value < 0 ? "text-red-500" : "text-slate-900"}`}>
                  {item.value < 0 ? "-" : ""}{fmt(Math.abs(item.value))}원
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="p-5 bg-slate-50 border border-gray-100 rounded-xl flex gap-3">
          <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            퇴직소득세는 <strong>환산급여 방식(2026 세법)</strong>으로 계산됩니다. 근속연수공제 및 환산급여공제가 적용되어
            일반 근로소득세보다 낮은 세율이 적용됩니다. IRP 이전 시 세금이 이연됩니다.
          </p>
        </div>

        <AdUnit slotId="severance_bottom" format="auto" label="퇴직금 하단" />
      </div>
    </main>
  );
}
