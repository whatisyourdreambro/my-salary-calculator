"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Info } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

// 2026 주식 양도소득세 (국내 대주주 & 해외주식)
function calcStockTax(profit: number, holdPeriod: "short" | "long", isOverseas: boolean): {
  basicDeduction: number; taxableProfit: number; tax: number; localTax: number; total: number; effectiveRate: number;
} {
  const basicDeduction = isOverseas ? 2_500_000 : 0; // 해외주식 250만원 기본공제
  const taxableProfit = Math.max(0, profit - basicDeduction);

  let taxRate = 0;
  if (isOverseas) {
    taxRate = 0.22; // 해외주식: 22% (소득세 20% + 지방소득세 2%)
  } else {
    // 국내 대주주 (소액주주는 비과세)
    taxRate = holdPeriod === "short" ? 0.30 : 0.20;
  }

  const combinedTax = Math.round(taxableProfit * taxRate);
  const tax = isOverseas ? Math.round(taxableProfit * 0.20) : Math.round(taxableProfit * (holdPeriod === "short" ? 0.30 : 0.20));
  const localTax = isOverseas ? Math.round(taxableProfit * 0.02) : 0;
  const total = tax + localTax;
  const effectiveRate = profit > 0 ? (total / profit) * 100 : 0;

  return { basicDeduction, taxableProfit, tax, localTax, total, effectiveRate };
}

export default function StockTaxPage() {
  const [profit, setProfit] = useState(10_000_000);
  const [holdPeriod, setHoldPeriod] = useState<"short" | "long">("long");
  const [isOverseas, setIsOverseas] = useState(true);
  const [loss, setLoss] = useState(0);

  const netProfit = Math.max(0, profit - loss);
  const r = useMemo(() => calcStockTax(netProfit, holdPeriod, isOverseas), [netProfit, holdPeriod, isOverseas]);

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 pb-10 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6"><TrendingUp size={14} /> 2026 세법 기준</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">주식 양도소득세 계산기</h1>
          <p className="text-slate-500 font-medium">해외주식 및 국내 대주주의 2026년 주식 양도소득세를 계산합니다</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button onClick={() => setIsOverseas(true)} className={`py-3 rounded-xl text-sm font-black border transition-all ${isOverseas ? "bg-primary text-white border-primary" : "border-gray-200 text-slate-600 hover:border-primary"}`}>해외주식</button>
            <button onClick={() => setIsOverseas(false)} className={`py-3 rounded-xl text-sm font-black border transition-all ${!isOverseas ? "bg-primary text-white border-primary" : "border-gray-200 text-slate-600 hover:border-primary"}`}>국내 대주주</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">매매 차익 (원)</label>
              <input type="number" value={profit} onChange={e => setProfit(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">손실 차감 (결손 통산)</label>
              <input type="number" value={loss} onChange={e => setLoss(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
          {!isOverseas && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">보유 기간</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setHoldPeriod("short")} className={`py-3 rounded-xl text-sm font-bold border transition-all ${holdPeriod === "short" ? "bg-primary text-white border-primary" : "border-gray-200 text-slate-600"}`}>1년 미만 (30%)</button>
                <button onClick={() => setHoldPeriod("long")} className={`py-3 rounded-xl text-sm font-bold border transition-all ${holdPeriod === "long" ? "bg-primary text-white border-primary" : "border-gray-200 text-slate-600"}`}>1년 이상 (20%)</button>
              </div>
            </div>
          )}
        </div>

        <motion.div key={r.total} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6">
          <div className="bg-primary p-8 text-center">
            <p className="text-slate-900/70 text-xs font-black uppercase tracking-widest mb-2">납부 세금 합계</p>
            <p className="text-5xl font-black text-slate-900 tracking-tight">{fmt(r.total)}<span className="text-2xl ml-1">원</span></p>
            <p className="text-slate-900/70 text-sm mt-2">실효세율: {r.effectiveRate.toFixed(1)}%</p>
            <p className="text-slate-900 font-bold mt-1">순수익: {fmt(netProfit - r.total)}원</p>
          </div>
          <div className="bg-white p-6 space-y-3">
            {[
              { label: isOverseas ? "기본 공제 (250만원)" : "기본 공제", value: -r.basicDeduction },
              { label: "과세 대상 양도차익", value: r.taxableProfit },
              { label: "양도소득세", value: r.tax },
              ...(isOverseas ? [{ label: "지방소득세 (×10%)", value: r.localTax }] : []),
              { label: "세금 합계", value: r.total, main: true },
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
            <strong>해외주식</strong>: 연간 이익 250만원 초과분에 22%(소득세 20%+지방소득세 2%) 적용. 매년 5월 종합소득세 신고 필요.
            <strong>국내주식</strong>: 소액주주 비과세, 대주주(10억원 이상 보유)만 과세 대상.
          </p>
        </div>
        <AdUnit slotId="stock_tax_bottom" format="auto" label="주식세금 하단" />
      </div>
    </main>
  );
}
