// src/app/embed/insurance-calculator/page.tsx
// 임베드 가능한 미니 4대보험 계산기.

"use client";

import { useState, useMemo } from "react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function EmbedInsuranceCalculator() {
 const [monthly, setMonthly] = useState(3_000_000);

 const insurance = useMemo(() => {
 const base = monthly - 200_000; // 비과세 식대 20만 차감
 const np = base * 0.045;
 const hi = base * 0.03545;
 const ltc = hi * 0.1295;
 const ei = base * 0.009;
 const total = np + hi + ltc + ei;
 return { np, hi, ltc, ei, total };
 }, [monthly]);

 return (
 <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
 <h2 className="text-lg font-black text-navy mb-3">4대보험 계산기</h2>
 <label className="text-xs font-bold text-gray-600 block mb-2">월급 (세전)</label>
 <input
 type="number"
 value={monthly}
 onChange={(e) => setMonthly(Number(e.target.value) || 0)}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
 step={100000}
 min={100000}
 max={50000000}
 />
 <p className="text-xs text-gray-500 mt-1">{fmt(monthly / 10000)}만원/월</p>

 <div className="mt-4 space-y-2 text-sm">
 {[
 { label: "국민연금 4.5%", value: insurance.np },
 { label: "건강보험 3.545%", value: insurance.hi },
 { label: "장기요양 ~0.46%", value: insurance.ltc },
 { label: "고용보험 0.9%", value: insurance.ei },
 ].map((i) => (
 <div key={i.label} className="flex justify-between border-b border-gray-100 pb-2">
 <span className="text-gray-600">{i.label}</span>
 <span className="font-bold tabular-nums">{fmt(i.value)}원</span>
 </div>
 ))}
 <div className="flex justify-between pt-2">
 <span className="font-bold text-navy">본인 합계</span>
 <span className="font-black text-blue-600 tabular-nums text-lg">{fmt(insurance.total)}원</span>
 </div>
 </div>

 <a href="https://www.moneysalary.com" target="_blank" rel="noopener" className="block mt-3 text-center text-xs text-blue-600 hover:underline font-bold">
 정확한 실수령액 보기 →
 </a>
 </div>
 );
}
