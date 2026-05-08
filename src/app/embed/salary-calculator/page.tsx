// src/app/embed/salary-calculator/page.tsx
// 임베드 가능한 미니 연봉 계산기.

"use client";

import { useState, useMemo } from "react";
import { calculateSalary2026 } from "@/lib/TaxLogic";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function EmbedSalaryCalculator() {
 const [salary, setSalary] = useState(50_000_000);
 const result = useMemo(() => calculateSalary2026(salary), [salary]);

 return (
 <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
 <h2 className="text-lg font-black text-navy mb-3">연봉 실수령액 계산기</h2>
 <label className="text-xs font-bold text-gray-600 block mb-2">연봉 (세전)</label>
 <input
 type="number"
 value={salary}
 onChange={(e) => setSalary(Number(e.target.value) || 0)}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
 step={1000000}
 min={1000000}
 max={500000000}
 />
 <p className="text-xs text-gray-500 mt-1">{fmt(salary / 10000)}만원</p>

 <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
 <p className="text-xs text-gray-600 mb-1">월 실수령액</p>
 <p className="text-2xl font-black text-blue-600">{fmt(result.netPay)}원</p>
 <p className="text-xs text-gray-500 mt-1">연 약 {fmt((result.netPay * 12) / 10000)}만원</p>
 </div>

 <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
 <div className="text-center p-2 bg-gray-50 rounded">
 <p className="text-gray-500">월 공제</p>
 <p className="font-bold">{fmt(salary / 12 - result.netPay)}원</p>
 </div>
 <div className="text-center p-2 bg-gray-50 rounded">
 <p className="text-gray-500">실효세율</p>
 <p className="font-bold">{(((salary / 12 - result.netPay) / (salary / 12)) * 100).toFixed(1)}%</p>
 </div>
 </div>

 <a
 href={`https://www.moneysalary.com/salary/${salary}`}
 target="_blank"
 rel="noopener"
 className="block mt-3 text-center text-xs text-blue-600 hover:underline font-bold"
 >
 더 자세한 분석 보기 →
 </a>
 </div>
 );
}
