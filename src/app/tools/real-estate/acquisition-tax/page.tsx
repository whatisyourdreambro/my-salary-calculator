"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Home, Info } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

// 2026 취득세율
function calcAcquisitionTax(price: number, isFirst: boolean, type: "apt" | "single" | "land"): {
  taxRate: number; tax: number; localEdu: number; agriSpecial: number; total: number;
} {
  let taxRate = 0.01; // 기본 1%

  if (type === "land") {
    taxRate = 0.04;
  } else if (type === "apt") {
    if (price <= 600_000_000) {
      taxRate = isFirst ? 0.01 : 0.01; // 1주택 1%
    } else if (price <= 900_000_000) {
      taxRate = isFirst ? 0.02 : 0.02;
    } else {
      taxRate = isFirst ? 0.03 : 0.03;
    }
    // 2주택 이상이면 8% (조정대상지역)
    if (!isFirst) taxRate = 0.08;
  }

  const tax = Math.round(price * taxRate);
  const localEdu = Math.round(tax * 0.1); // 지방교육세
  const agriSpecial = type === "apt" ? Math.round(price * 0.002) : 0; // 농특세 0.2%
  const total = tax + localEdu + agriSpecial;

  return { taxRate: taxRate * 100, tax, localEdu, agriSpecial, total };
}

export default function AcquisitionTaxPage() {
  const [price, setPrice] = useState(500_000_000);
  const [isFirst, setIsFirst] = useState(true);
  const [propType, setPropType] = useState<"apt" | "single" | "land">("apt");

  const r = useMemo(() => calcAcquisitionTax(price, isFirst, propType), [price, isFirst, propType]);

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 pb-10 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6"><Home size={14} /> 2026 세법 기준</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">부동산 취득세 계산기</h1>
          <p className="text-slate-500 font-medium">2026년 기준 주택 취득세·지방교육세·농특세를 계산합니다</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">매매 가격 (원)</label>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            <p className="text-xs text-slate-400 mt-1.5">{fmt(price)}원 ({(price / 100_000_000).toFixed(2)}억원)</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">주택 유형</label>
              <div className="grid grid-cols-3 gap-2">
                {[{v:"apt",l:"아파트"},{v:"single",l:"단독주택"},{v:"land",l:"토지"}].map(t => (
                  <button key={t.v} onClick={() => setPropType(t.v as any)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${propType === t.v ? "bg-primary text-white border-primary" : "border-gray-200 text-slate-600 hover:border-primary"}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">주택 보유 현황</label>
              <div className="grid grid-cols-2 gap-2">
                {[{v:true,l:"생애최초/1주택"},{v:false,l:"2주택 이상"}].map(t => (
                  <button key={String(t.v)} onClick={() => setIsFirst(t.v)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${isFirst === t.v ? "bg-primary text-white border-primary" : "border-gray-200 text-slate-600 hover:border-primary"}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div key={r.total} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6">
          <div className="bg-primary p-8 text-center">
            <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-2">취득세 합계</p>
            <p className="text-5xl font-black text-white tracking-tight">{fmt(r.total)}<span className="text-2xl ml-1">원</span></p>
            <p className="text-white/70 text-sm mt-2">적용 세율: {r.taxRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-6 space-y-3">
            {[
              { label: "취득세", value: r.tax },
              { label: "지방교육세 (취득세×10%)", value: r.localEdu },
              { label: "농어촌특별세 (0.2%)", value: r.agriSpecial },
              { label: "합계", value: r.total, main: true },
            ].map(item => (
              <div key={item.label} className={`flex justify-between items-center py-2 ${item.main ? "border-t-2 border-primary pt-4" : "border-b border-gray-100"}`}>
                <span className={`text-sm font-medium ${item.main ? "font-black text-slate-900" : "text-slate-500"}`}>{item.label}</span>
                <span className={`font-black tabular-nums ${item.main ? "text-primary text-xl" : "text-slate-900"}`}>{fmt(item.value)}원</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="p-5 bg-slate-50 border border-gray-100 rounded-xl flex gap-3 mb-8">
          <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            2026년 기준 생애최초 주택 취득 시 취득세 200만원 한도 감면 혜택이 적용될 수 있습니다.
            다주택자 취득 시 8%(조정지역) ~ 12%(비조정지역 3주택) 중과세율이 적용됩니다.
          </p>
        </div>
        <AdUnit slotId="acquisition_bottom" format="auto" label="취득세 하단" />
      </div>
    </main>
  );
}
