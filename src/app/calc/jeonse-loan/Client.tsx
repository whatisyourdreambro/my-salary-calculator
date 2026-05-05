"use client";

import { useState, useMemo } from "react";

function fmt(n: number) { return Math.round(n).toLocaleString("ko-KR"); }
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  return d ? Number(d).toLocaleString("ko-KR") : "";
}
function parseInput(s: string): number { return Number(s.replace(/[^0-9]/g, "")) || 0; }

const PRODUCTS = [
  { name: "일반 전세대출", rate: 5.0, maxRate: 0.8 },
  { name: "버팀목 전세대출", rate: 2.4, maxRate: 0.8 },
  { name: "신혼부부 버팀목", rate: 1.7, maxRate: 0.8 },
  { name: "청년 전세 (만 19~34)", rate: 2.5, maxRate: 0.8 },
];

export default function JeonseLoanClient() {
  const [depositFmt, setDepositFmt] = useState("300,000,000");
  const [salaryFmt, setSalaryFmt] = useState("60,000,000");

  const deposit = parseInput(depositFmt);
  const salary = parseInput(salaryFmt);

  const results = useMemo(() => {
    return PRODUCTS.map((p) => {
      const limit = Math.min(deposit * p.maxRate, salary * 4); // 보증금×80%, 연봉×4 중 작은 값
      const monthlyInterest = (limit * (p.rate / 100)) / 12;
      const annualInterest = limit * (p.rate / 100);
      return {
        name: p.name,
        rate: p.rate,
        limit,
        monthlyInterest,
        annualInterest,
      };
    });
  }, [deposit, salary]);

  const cheapest = results.reduce((min, r) => r.annualInterest < min.annualInterest ? r : min, results[0]);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="jl-deposit" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">전세보증금</label>
          <div className="relative">
            <input id="jl-deposit" type="text" inputMode="numeric" value={depositFmt}
              onChange={(e) => setDepositFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-4 text-xl font-black focus:outline-none transition pr-10"
              style={{ backgroundColor: "#0145F208", border: "2px solid #0145F2", color: "#0145F2" }}
              aria-label="전세보증금" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-electric">원</span>
          </div>
        </div>
        <div>
          <label htmlFor="jl-salary" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">본인 연소득</label>
          <div className="relative">
            <input id="jl-salary" type="text" inputMode="numeric" value={salaryFmt}
              onChange={(e) => setSalaryFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-4 text-xl font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-10"
              aria-label="연소득" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.map((r) => {
          const isBest = r.name === cheapest.name;
          return (
            <div key={r.name}
              className="rounded-2xl p-5 relative"
              style={{
                backgroundColor: isBest ? "#0145F2" : "#FFFFFF",
                border: isBest ? "none" : "1.5px solid #DDE4EC",
                color: isBest ? "#FFFFFF" : "#0A1829",
                boxShadow: isBest ? "0 8px 24px #0145F230" : "none",
              }}>
              {isBest && (
                <div className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-electric">
                  최저 비용
                </div>
              )}
              <p className="text-xs font-black uppercase tracking-widest mb-2"
                style={{ color: isBest ? "rgba(255,255,255,0.7)" : "#7A9AB5" }}>
                {r.name}
              </p>
              <p className="text-2xl font-black tabular-nums mb-1">{fmt(r.limit)}원</p>
              <p className="text-xs mb-3"
                style={{ color: isBest ? "rgba(255,255,255,0.85)" : "#3D5E78" }}>
                금리 연 {r.rate.toFixed(1)}%
              </p>
              <div className="flex justify-between text-xs"
                style={{ color: isBest ? "rgba(255,255,255,0.8)" : "#7A9AB5", borderTop: isBest ? "1px solid rgba(255,255,255,0.2)" : "1px solid #EDF1F5", paddingTop: "8px" }}>
                <span>월 이자</span>
                <span className="font-black">{fmt(r.monthlyInterest)}원</span>
              </div>
              <div className="flex justify-between text-xs mt-1"
                style={{ color: isBest ? "rgba(255,255,255,0.8)" : "#7A9AB5" }}>
                <span>연 이자</span>
                <span className="font-black">{fmt(r.annualInterest)}원</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
