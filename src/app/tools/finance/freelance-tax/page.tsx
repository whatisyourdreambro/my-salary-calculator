"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Laptop, Info } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

// 2026 프리랜서/사업소득 종합소득세
function calcFreelanceTax(revenue: number, expenses: number, deductions: number): {
  netIncome: number; businessDeduction: number; taxableIncome: number;
  tax: number; localTax: number; totalTax: number; netIncome2: number; effectiveRate: number;
} {
  const netIncome = Math.max(0, revenue - expenses);
  // 기본공제 (본인 150만원) + 입력 추가 공제액
  const totalDeductions = 1_500_000 + deductions;
  const taxableIncome = Math.max(0, netIncome - totalDeductions);

  let tax = 0;
  if (taxableIncome <= 14_000_000) tax = taxableIncome * 0.06;
  else if (taxableIncome <= 50_000_000) tax = taxableIncome * 0.15 - 1_260_000;
  else if (taxableIncome <= 88_000_000) tax = taxableIncome * 0.24 - 5_760_000;
  else if (taxableIncome <= 150_000_000) tax = taxableIncome * 0.35 - 15_440_000;
  else if (taxableIncome <= 300_000_000) tax = taxableIncome * 0.38 - 19_940_000;
  else if (taxableIncome <= 500_000_000) tax = taxableIncome * 0.40 - 25_940_000;
  else if (taxableIncome <= 1_000_000_000) tax = taxableIncome * 0.42 - 35_940_000;
  else tax = taxableIncome * 0.45 - 65_940_000;

  tax = Math.max(0, Math.round(tax));
  const localTax = Math.round(tax * 0.1);
  const totalTax = tax + localTax;
  const netIncome2 = netIncome - totalTax;
  const effectiveRate = netIncome > 0 ? (totalTax / netIncome) * 100 : 0;

  return { netIncome, businessDeduction: totalDeductions, taxableIncome, tax, localTax, totalTax, netIncome2, effectiveRate };
}

export default function FreelanceTaxPage() {
  const [revenue, setRevenue] = useState(60_000_000);
  const [expenses, setExpenses] = useState(5_000_000);
  const [deductions, setDeductions] = useState(0);

  const r = useMemo(() => calcFreelanceTax(revenue, expenses, deductions), [revenue, expenses, deductions]);

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 pb-10 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6"><Laptop size={14} /> 2026 세법 기준</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">프리랜서 종합소득세 계산기</h1>
          <p className="text-slate-500 font-medium">사업소득·프리랜서 수입의 2026년 종합소득세를 계산합니다</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">연간 수입 (매출)</label>
            <input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">필요경비 (장비, 통신비 등 업무 관련 비용)</label>
            <input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            <p className="text-xs text-slate-400 mt-1">영수증·증빙 있는 실제 경비만 인정됩니다</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">추가 소득공제 (연금저축, IRP 등)</label>
            <input type="number" value={deductions} onChange={e => setDeductions(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        </div>

        <motion.div key={r.totalTax} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6">
          <div className="bg-primary p-8 text-center">
            <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-2">실수령 순이익 (세후)</p>
            <p className="text-5xl font-black text-white tracking-tight">{fmt(r.netIncome2)}<span className="text-2xl ml-1">원</span></p>
            <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-white/20">
              <div className="text-center"><p className="text-white/60 text-xs mb-1">순이익(세전)</p><p className="text-white font-black">{fmt(r.netIncome)}원</p></div>
              <div className="w-px bg-white/20" />
              <div className="text-center"><p className="text-white/60 text-xs mb-1">세금 합계</p><p className="text-white font-black">{fmt(r.totalTax)}원</p></div>
              <div className="w-px bg-white/20" />
              <div className="text-center"><p className="text-white/60 text-xs mb-1">실효세율</p><p className="text-white font-black">{r.effectiveRate.toFixed(1)}%</p></div>
            </div>
          </div>
          <div className="bg-white p-6 space-y-3">
            {[
              { label: "연간 수입", value: revenue },
              { label: "필요경비 차감", value: -expenses },
              { label: "순사업소득", value: r.netIncome },
              { label: "소득공제 차감", value: -r.businessDeduction },
              { label: "과세표준", value: r.taxableIncome },
              { label: "종합소득세", value: r.tax },
              { label: "지방소득세", value: r.localTax },
              { label: "세후 순이익", value: r.netIncome2, main: true },
            ].map(item => (
              <div key={item.label} className={`flex justify-between items-center py-2 ${item.main ? "border-t-2 border-primary pt-4" : "border-b border-gray-100"}`}>
                <span className={`text-sm font-medium ${item.main ? "font-black text-slate-900" : "text-slate-500"}`}>{item.label}</span>
                <span className={`font-black tabular-nums ${item.main ? "text-primary text-xl" : item.value < 0 ? "text-red-500" : "text-slate-900"}`}>{item.value < 0 ? "-" : ""}{fmt(Math.abs(item.value))}원</span>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="p-5 bg-slate-50 border border-gray-100 rounded-xl flex gap-3 mb-8">
          <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            프리랜서·사업소득자는 <strong>매년 5월 종합소득세를 신고</strong>해야 합니다. 국민연금·건강보험료 지역가입자 보험료는 별도입니다.
            소득이 발생한 다음 해 5월 31일까지 신고 납부하세요.
          </p>
        </div>
        <AdUnit slotId="freelance_bottom" format="auto" label="프리랜서 하단" />
      </div>
    </main>
  );
}
