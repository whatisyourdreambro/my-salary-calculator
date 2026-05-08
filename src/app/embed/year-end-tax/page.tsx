// src/app/embed/year-end-tax/page.tsx
// 임베드 가능한 미니 연말정산 환급 시뮬.

"use client";

import { useState, useMemo } from "react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function EmbedYearEndTax() {
 const [salary, setSalary] = useState(50_000_000);
 const [card, setCard] = useState(15_000_000);
 const [pension, setPension] = useState(0);

 const result = useMemo(() => {
 // 신용카드 공제 (총급여 25% 초과분 15%)
 const cardThreshold = salary * 0.25;
 const cardDeductible = Math.max(0, card - cardThreshold) * 0.15;
 // 연금저축 세액공제 (총급여 5,500만 이하 16.5%, 초과 13.2%)
 const pensionRate = salary <= 55_000_000 ? 0.165 : 0.132;
 const pensionRefund = Math.min(pension, 9_000_000) * pensionRate;
 // 추정 환급금
 const refund = cardDeductible + pensionRefund;
 return { cardDeductible, pensionRefund, refund };
 }, [salary, card, pension]);

 return (
 <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
 <h2 className="text-lg font-black text-navy mb-3">연말정산 환급 미리보기</h2>
 <div className="space-y-3">
 <div>
 <label className="text-xs font-bold text-gray-600 block mb-1">총급여 (연)</label>
 <input
 type="number"
 value={salary}
 onChange={(e) => setSalary(Number(e.target.value) || 0)}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
 step={1000000}
 />
 </div>
 <div>
 <label className="text-xs font-bold text-gray-600 block mb-1">연 신용카드 사용액</label>
 <input
 type="number"
 value={card}
 onChange={(e) => setCard(Number(e.target.value) || 0)}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
 step={500000}
 />
 </div>
 <div>
 <label className="text-xs font-bold text-gray-600 block mb-1">연금저축·IRP 납입액 (한도 900만)</label>
 <input
 type="number"
 value={pension}
 onChange={(e) => setPension(Number(e.target.value) || 0)}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
 step={500000}
 max={9000000}
 />
 </div>
 </div>

 <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
 <p className="text-xs text-gray-600 mb-1">예상 환급금 (간이)</p>
 <p className="text-2xl font-black text-blue-600">{fmt(result.refund)}원</p>
 <p className="text-xs text-gray-500 mt-1">정확한 계산은 신용카드·연금저축만 반영</p>
 </div>

 <a href="https://www.moneysalary.com/year-end-tax" target="_blank" rel="noopener" className="block mt-3 text-center text-xs text-blue-600 hover:underline font-bold">
 의료비·기부금 등 모든 공제 반영 →
 </a>
 </div>
 );
}
