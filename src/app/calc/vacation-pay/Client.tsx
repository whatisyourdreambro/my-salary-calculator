"use client";

import { useState, useMemo } from "react";

function fmt(n: number) { return Math.round(n).toLocaleString("ko-KR"); }
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  return d ? Number(d).toLocaleString("ko-KR") : "";
}
function parseInput(s: string): number { return Number(s.replace(/[^0-9]/g, "")) || 0; }

export default function VacationPayClient() {
  const [salaryFmt, setSalaryFmt] = useState("48,000,000");
  const [days, setDays] = useState("10");

  const salary = parseInput(salaryFmt);
  const numDays = Math.max(0, Number(days) || 0);

  const result = useMemo(() => {
    // 통상임금 = 연봉 / 240 (월 209시간 기준 1일 8시간)
    const dailyWage = salary / 240;
    const grossPay = dailyWage * numDays;
    // 세금 추정: 평균 한계세율 약 22~28% 가정
    const estTaxRate = salary > 88_000_000 ? 0.28 : salary > 50_000_000 ? 0.22 : salary > 14_000_000 ? 0.16 : 0.07;
    const tax = grossPay * estTaxRate;
    const insurance = grossPay * 0.085; // 4대보험 합산 약 8.5%
    const totalDeduction = tax + insurance;
    const net = grossPay - totalDeduction;
    return { dailyWage, grossPay, tax, insurance, totalDeduction, net };
  }, [salary, numDays]);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vp-salary" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">연봉 (세전)</label>
          <div className="relative">
            <input id="vp-salary" type="text" inputMode="numeric" value={salaryFmt}
              onChange={(e) => setSalaryFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-4 text-xl font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-10"
              aria-label="연봉" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
          </div>
        </div>
        <div>
          <label htmlFor="vp-days" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">미사용 연차 일수</label>
          <div className="relative">
            <input id="vp-days" type="text" inputMode="numeric" value={days}
              onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded-xl px-4 py-4 text-2xl font-black focus:outline-none transition pr-10"
              style={{ backgroundColor: "#0145F208", border: "2px solid #0145F2", color: "#0145F2" }}
              aria-label="미사용 연차 일수" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-electric">일</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>연차수당 실수령</p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {fmt(result.net)}원
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            세전 {fmt(result.grossPay)}원 ({numDays}일 × {fmt(result.dailyWage)}원/일)
          </p>
        </div>
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 grid grid-cols-3 gap-2 text-sm">
          <div><div className="text-xs text-faint-blue">소득세 추정</div><div className="font-black tabular-nums text-rose-500">-{fmt(result.tax)}원</div></div>
          <div><div className="text-xs text-faint-blue">4대보험</div><div className="font-black tabular-nums text-rose-500">-{fmt(result.insurance)}원</div></div>
          <div><div className="text-xs text-faint-blue">실수령</div><div className="font-black tabular-nums text-electric">{fmt(result.net)}원</div></div>
        </div>
      </div>
    </div>
  );
}
