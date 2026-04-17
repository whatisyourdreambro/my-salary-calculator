"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Info } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

// 2026 증여세 계산
function calcGiftTax(amount: number, relation: "spouse" | "child" | "parent" | "other"): {
  deduction: number; taxableAmount: number; tax: number; marginalRate: number;
} {
  const deductions: Record<string, number> = {
    spouse: 600_000_000,    // 배우자: 6억원
    child: 50_000_000,      // 자녀·직계비속: 5천만원
    parent: 50_000_000,     // 직계존속: 5천만원 (미성년 5천만원)
    other: 10_000_000,      // 기타 친족: 1천만원
  };

  const deduction = deductions[relation];
  const taxableAmount = Math.max(0, amount - deduction);

  let tax = 0;
  let marginalRate = 0;
  if (taxableAmount <= 100_000_000) { tax = taxableAmount * 0.10; marginalRate = 10; }
  else if (taxableAmount <= 500_000_000) { tax = 10_000_000 + (taxableAmount - 100_000_000) * 0.20; marginalRate = 20; }
  else if (taxableAmount <= 1_000_000_000) { tax = 90_000_000 + (taxableAmount - 500_000_000) * 0.30; marginalRate = 30; }
  else if (taxableAmount <= 3_000_000_000) { tax = 240_000_000 + (taxableAmount - 1_000_000_000) * 0.40; marginalRate = 40; }
  else { tax = 1_040_000_000 + (taxableAmount - 3_000_000_000) * 0.50; marginalRate = 50; }

  return { deduction, taxableAmount, tax: Math.round(tax), marginalRate };
}

export default function GiftTaxPage() {
  const [amount, setAmount] = useState(100_000_000);
  const [relation, setRelation] = useState<"spouse" | "child" | "parent" | "other">("child");

  const r = useMemo(() => calcGiftTax(amount, relation), [amount, relation]);
  const net = amount - r.tax;

  const relations = [
    { v: "spouse", l: "배우자", deduct: "6억원" },
    { v: "child", l: "자녀", deduct: "5천만원" },
    { v: "parent", l: "부모·조부모", deduct: "5천만원" },
    { v: "other", l: "기타 친족", deduct: "1천만원" },
  ];

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 pb-10 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6"><Heart size={14} /> 2026 세법 기준</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">증여세 계산기</h1>
          <p className="text-slate-500 font-medium">2026년 기준 가족 간 증여세와 공제액을 계산합니다</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">증여 금액 (원)</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            <p className="text-xs text-slate-400 mt-1.5">{fmt(amount)}원 ({(amount / 100_000_000).toFixed(2)}억원)</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">증여 관계</label>
            <div className="grid grid-cols-2 gap-2">
              {relations.map(r => (
                <button key={r.v} onClick={() => setRelation(r.v as any)}
                  className={`p-4 rounded-xl border text-left transition-all ${relation === r.v ? "bg-primary text-white border-primary" : "border-gray-200 text-slate-700 hover:border-primary hover:bg-primary/5"}`}>
                  <p className="font-bold text-sm">{r.l}</p>
                  <p className={`text-xs mt-0.5 ${relation === r.v ? "text-white/70" : "text-slate-400"}`}>공제한도: {r.deduct}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div key={r.tax} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6">
          <div className="bg-primary p-8 text-center">
            <p className="text-slate-900/70 text-xs font-black uppercase tracking-widest mb-2">납부 증여세</p>
            <p className="text-5xl font-black text-slate-900 tracking-tight">{fmt(r.tax)}<span className="text-2xl ml-1">원</span></p>
            <p className="text-slate-900/70 text-sm mt-2">한계세율: {r.marginalRate}% · 실수령: {fmt(net)}원</p>
          </div>
          <div className="bg-white p-6 space-y-3">
            {[
              { label: "증여 금액", value: amount },
              { label: `공제액 (${relations.find(r2 => r2.v === relation)?.l})`, value: -r.deduction },
              { label: "과세표준", value: r.taxableAmount },
              { label: "증여세", value: r.tax, main: true },
            ].map(item => (
              <div key={item.label} className={`flex justify-between items-center py-2 ${item.main ? "border-t-2 border-primary pt-4" : "border-b border-gray-100"}`}>
                <span className={`text-sm font-medium ${item.main ? "font-black text-slate-900" : "text-slate-500"}`}>{item.label}</span>
                <span className={`font-black tabular-nums ${item.main ? "text-primary text-xl" : item.value < 0 ? "text-slate-400" : "text-slate-900"}`}>{item.value < 0 ? "-" : ""}{fmt(Math.abs(item.value))}원</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="p-5 bg-slate-50 border border-gray-100 rounded-xl flex gap-3 mb-8">
          <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            증여 공제는 <strong>10년 합산</strong> 기준입니다. 10년 내 동일인으로부터 받은 증여액을 합산하여 계산합니다.
            자녀 미성년자의 경우 공제한도 2천만원이 적용됩니다.
          </p>
        </div>
        <AdUnit slotId="gift_tax_bottom" format="auto" label="증여세 하단" />
      </div>
    </main>
  );
}
