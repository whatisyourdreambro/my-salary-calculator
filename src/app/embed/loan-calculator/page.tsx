// src/app/embed/loan-calculator/page.tsx
// 임베드 가능한 미니 대출 한도 계산기 (DSR 40% 기준).

"use client";

import { useState, useMemo } from "react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function EmbedLoanCalculator() {
 const [salary, setSalary] = useState(50_000_000);
 const [rate, setRate] = useState(5.0);
 const [years, setYears] = useState(30);

 const result = useMemo(() => {
 // DSR 40% 한도 = 연봉 × 40% / 12
 const monthlyLimit = (salary * 0.4) / 12;
 // 원리금균등상환식: PMT = P × r(1+r)^n / ((1+r)^n - 1)
 const r = rate / 100 / 12;
 const n = years * 12;
 const factor = (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
 const principal = monthlyLimit * factor;
 return { monthlyLimit, principal };
 }, [salary, rate, years]);

 return (
 <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
 <h2 className="text-lg font-black text-navy mb-3">대출 한도 (DSR 40%)</h2>
 <div className="space-y-3">
 <div>
 <label className="text-xs font-bold text-gray-600 block mb-1">연봉 (세전)</label>
 <input
 type="number"
 value={salary}
 onChange={(e) => setSalary(Number(e.target.value) || 0)}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
 step={1000000}
 />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-xs font-bold text-gray-600 block mb-1">금리 %</label>
 <input
 type="number"
 value={rate}
 onChange={(e) => setRate(Number(e.target.value) || 0)}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
 step={0.1}
 />
 </div>
 <div>
 <label className="text-xs font-bold text-gray-600 block mb-1">기간 (년)</label>
 <input
 type="number"
 value={years}
 onChange={(e) => setYears(Number(e.target.value) || 0)}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
 step={5}
 min={5}
 max={50}
 />
 </div>
 </div>
 </div>

 <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
 <p className="text-xs text-gray-600 mb-1">대출 가능 원금</p>
 <p className="text-2xl font-black text-blue-600">{fmt(result.principal / 10000)}만원</p>
 <p className="text-xs text-gray-500 mt-1">월 상환 한도 {fmt(result.monthlyLimit)}원</p>
 </div>

 <a href="https://www.moneysalary.com/home-loan" target="_blank" rel="noopener" className="block mt-3 text-center text-xs text-blue-600 hover:underline font-bold">
 정확한 주담대 시뮬 보기 →
 </a>
 </div>
 );
}
