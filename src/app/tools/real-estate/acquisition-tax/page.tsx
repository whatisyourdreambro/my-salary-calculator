"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Home, Info } from "lucide-react";
const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

// 2026 취득세율 — 아파트·단독주택 모두 주택 세율 체계 적용, 토지는 4%
function calcAcquisitionTax(price: number, isFirst: boolean, type: "apt" | "single" | "land", isOver85: boolean): {
 taxRate: number; tax: number; localEdu: number; agriSpecial: number; total: number;
} {
 let taxRate = 0.04; // 토지 등 일반 부동산 4%

 if (type === "apt" || type === "single") {
 // 주택 유상취득 표준세율
 if (price <= 600_000_000) {
 taxRate = 0.01; // 6억 이하 1%
 } else if (price <= 900_000_000) {
 // 6억 초과 ~ 9억 이하: 점증 공식 (가액 × 2/3억 − 3) ÷ 100 (소수점 넷째 자리 반올림)
 taxRate = Math.round(((price * 2) / 300_000_000 - 3) * 10000) / 10000 / 100;
 } else {
 taxRate = 0.03; // 9억 초과 3%
 }
 // 2주택 이상 중과 (조정대상지역 2주택·비조정 3주택 기준 8%)
 if (!isFirst) taxRate = 0.08;
 }

 const tax = Math.round(price * taxRate);
 const localEdu = Math.round(tax * 0.1); // 지방교육세
 // 농어촌특별세: 전용면적 85㎡ 초과 주택만 0.2% (85㎡ 이하 면제)
 const agriSpecial = (type === "apt" || type === "single") && isOver85 ? Math.round(price * 0.002) : 0;
 const total = tax + localEdu + agriSpecial;

 return { taxRate: taxRate * 100, tax, localEdu, agriSpecial, total };
}

export default function AcquisitionTaxPage() {
 const [price, setPrice] = useState(500_000_000);
 const [isFirst, setIsFirst] = useState(true);
 const [propType, setPropType] = useState<"apt" | "single" | "land">("apt");
 const [isOver85, setIsOver85] = useState(false);

 const r = useMemo(() => calcAcquisitionTax(price, isFirst, propType, isOver85), [price, isFirst, propType, isOver85]);

 return (
 <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
 <div className="max-w-3xl mx-auto">
 <div className="text-center mb-12 pb-10 border-b border-canvas">
 <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6"><Home size={14} /> 2026 세법 기준</div>
 <h1 className="text-4xl font-black text-navy tracking-tight mb-3">부동산 취득세 계산기</h1>
 <p className="text-faint-blue font-medium">2026년 기준 주택 취득세·지방교육세·농특세를 계산합니다</p>
 </div>

 <div className="bg-white border border-canvas rounded-2xl p-8 mb-6 shadow-sm space-y-6">
 <div>
 <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">매매 가격 (원)</label>
 <input type="number" inputMode="numeric" value={price} onChange={e => setPrice(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3.5 text-xl font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 <p className="text-xs text-faint-blue mt-1.5">{fmt(price)}원 ({(price / 100_000_000).toFixed(2)}억원)</p>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-3">주택 유형</label>
 <div className="grid grid-cols-3 gap-2">
 {[{v:"apt",l:"아파트"},{v:"single",l:"단독주택"},{v:"land",l:"토지"}].map(t => (
 <button key={t.v} onClick={() => setPropType(t.v as any)}
 className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${propType === t.v ? "bg-primary text-white border-primary" : "border-canvas text-muted-blue hover:border-primary"}`}>
 {t.l}
 </button>
 ))}
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-3">주택 보유 현황</label>
 <div className="grid grid-cols-2 gap-2">
 {[{v:true,l:"생애최초/1주택"},{v:false,l:"2주택 이상"}].map(t => (
 <button key={String(t.v)} onClick={() => setIsFirst(t.v)}
 className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${isFirst === t.v ? "bg-primary text-white border-primary" : "border-canvas text-muted-blue hover:border-primary"}`}>
 {t.l}
 </button>
 ))}
 </div>
 </div>
 </div>
 {propType !== "land" && (
 <div>
 <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-3">전용면적 (농어촌특별세 기준)</label>
 <div className="grid grid-cols-2 gap-2">
 {[{v:false,l:"85㎡ 이하 (농특세 면제)"},{v:true,l:"85㎡ 초과 (농특세 0.2%)"}].map(t => (
 <button key={String(t.v)} onClick={() => setIsOver85(t.v)}
 className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${isOver85 === t.v ? "bg-primary text-white border-primary" : "border-canvas text-muted-blue hover:border-primary"}`}>
 {t.l}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>

 <motion.div key={r.total} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
 className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6">
 <div className="bg-primary p-8 text-center">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">취득세 합계</p>
 <p className="text-5xl font-black text-navy tracking-tight">{fmt(r.total)}<span className="text-2xl ml-1">원</span></p>
 <p className="text-navy/70 text-sm mt-2">적용 세율: {r.taxRate.toFixed(2)}%</p>
 </div>
 <div className="bg-white p-6 space-y-3">
 {[
 { label: "취득세", value: r.tax },
 { label: "지방교육세 (취득세×10%)", value: r.localEdu },
 { label: isOver85 ? "농어촌특별세 (0.2%)" : "농어촌특별세 (85㎡ 이하 면제)", value: r.agriSpecial },
 { label: "합계", value: r.total, main: true },
 ].map(item => (
 <div key={item.label} className={`flex justify-between items-center py-2 ${item.main ? "border-t-2 border-primary pt-4" : "border-b border-canvas"}`}>
 <span className={`text-sm font-medium ${item.main ? "font-black text-navy" : "text-faint-blue"}`}>{item.label}</span>
 <span className={`font-black tabular-nums ${item.main ? "text-primary text-xl" : "text-navy"}`}>{fmt(item.value)}원</span>
 </div>
 ))}
 </div>
 </motion.div>

 <div className="p-5 bg-canvas border border-canvas rounded-xl flex gap-3 mb-8">
 <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
 <p className="text-xs text-muted-blue leading-relaxed">
 2026년 기준 생애최초 주택 취득 시 취득세 200만원 한도 감면 혜택이 적용될 수 있습니다.
 주택 취득세는 6억 이하 1%, 6~9억 점증(1~3%), 9억 초과 3%이며, 6~9억 구간은 (취득가액 × 2/3억 − 3)% 공식으로 계산됩니다.
 다주택자 중과세율은 조정대상지역 2주택·비조정지역 3주택 8%, 조정대상지역 3주택 이상·비조정지역 4주택 이상 12%입니다.
 농어촌특별세는 전용면적 85㎡ 초과 주택에만 부과되며 85㎡ 이하는 면제됩니다.
 </p>
 </div>
 </div>
 </main>
 );
}
