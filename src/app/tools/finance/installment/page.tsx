"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function InstallmentPage() {
  const [principal, setPrincipal] = useState(2_000_000);
  const [months, setMonths] = useState(12);
  const [annualRate, setAnnualRate] = useState(15.9);

  const r = useMemo(() => {
    const r = annualRate / 100 / 12;
    if (r === 0) {
      const monthly = Math.round(principal / months);
      return { monthly, totalPayment: monthly * months, totalInterest: 0 };
    }
    const monthly = Math.round(principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
    const totalPayment = monthly * months;
    return { monthly, totalPayment, totalInterest: totalPayment - principal };
  }, [principal, months, annualRate]);

  const presets = [
    { label: "신용카드 무이자", months: 3, rate: 0 },
    { label: "카드론", months: 12, rate: 15.9 },
    { label: "신용대출", months: 36, rate: 6.5 },
    { label: "자동차 할부", months: 60, rate: 4.5 },
  ];

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 pb-10 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6"><CreditCard size={14} /></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">할부 이자 계산기</h1>
          <p className="text-slate-500 font-medium">월 납부액과 총 이자를 즉시 계산합니다</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setMonths(p.months); setAnnualRate(p.rate); }}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${months === p.months && annualRate === p.rate ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-slate-700 hover:border-primary"}`}>
              <p>{p.label}</p>
              <p className="font-normal mt-0.5 opacity-70">{p.months}개월 / {p.rate}%</p>
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">할부 원금 (원)</label>
            <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">할부 개월 ({months}개월)</label>
              <input type="range" min={1} max={84} value={months} onChange={e => setMonths(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1개월</span><span className="text-primary font-bold">{months}개월</span><span>84개월</span></div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">연 이자율 ({annualRate}%)</label>
              <input type="number" step={0.1} value={annualRate} onChange={e => setAnnualRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
        </div>

        <motion.div key={r.monthly} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-8">
          <div className="bg-primary p-8 text-center">
            <p className="text-slate-900/70 text-xs font-black uppercase tracking-widest mb-2">월 납부액</p>
            <p className="text-5xl font-black text-slate-900 tracking-tight">{fmt(r.monthly)}<span className="text-2xl ml-1">원</span></p>
            <div className="flex justify-center gap-8 mt-5 pt-5 border-t border-white/20">
              <div className="text-center"><p className="text-slate-900/60 text-xs mb-1">총 납부액</p><p className="text-slate-900 font-black">{fmt(r.totalPayment)}원</p></div>
              <div className="w-px bg-white/20" />
              <div className="text-center"><p className="text-slate-900/60 text-xs mb-1">총 이자</p><p className="text-slate-900 font-black">{fmt(r.totalInterest)}원</p></div>
              <div className="w-px bg-white/20" />
              <div className="text-center"><p className="text-slate-900/60 text-xs mb-1">이자 비율</p><p className="text-slate-900 font-black">{r.totalPayment > 0 ? (r.totalInterest / r.totalPayment * 100).toFixed(1) : 0}%</p></div>
            </div>
          </div>
        </motion.div>
        <AdUnit slotId="installment_bottom" format="auto" label="할부 하단" />
      </div>
    </main>
  );
}
