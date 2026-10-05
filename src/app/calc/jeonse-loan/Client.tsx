"use client";

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";
import { calcJeonseLoans, cheapestEligible } from "@/lib/jeonseLoanProducts";

function fmt(n: number) { return Math.round(n).toLocaleString("ko-KR"); }
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  return d ? Number(d).toLocaleString("ko-KR") : "";
}
function parseInput(s: string): number { return Number(s.replace(/[^0-9]/g, "")) || 0; }

// 상품 조건(소득 요건·보증금 비율·호당 한도·금리 하한)은 src/lib/jeonseLoanProducts.ts — 주택도시기금 상품 안내 2026-10-05 확인.
// 종전에는 네 상품 모두 min(보증금 x 80%, 연소득 x 4) 라 기본값에서 버팀목·청년도 2.4억이 나왔다 (감사 code3-03).

export default function JeonseLoanClient() {
  const [depositFmt, setDepositFmt] = useState("300,000,000");
  const [salaryFmt, setSalaryFmt] = useState("60,000,000");

  const deposit = parseInput(depositFmt);
  const salary = parseInput(salaryFmt);

  const results = useMemo(() => calcJeonseLoans(deposit, salary), [deposit, salary]);
  const cheapest = cheapestEligible(results);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="jl-deposit" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">전세보증금</label>
          <div className="relative">
            <NumberInput id="jl-deposit" type="text" inputMode="numeric" value={depositFmt}
              onChange={(e) => setDepositFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-4 text-xl font-black focus:outline-none transition pr-10"
              style={{ backgroundColor: "hsl(var(--accent))", border: "2px solid #0145F2", color: "hsl(var(--link))" }}
              aria-label="전세보증금" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-electric">원</span>
          </div>
        </div>
        <div>
          <label htmlFor="jl-salary" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">합산 연소득</label>
          <div className="relative">
            <NumberInput id="jl-salary" type="text" inputMode="numeric" value={salaryFmt}
              onChange={(e) => setSalaryFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-4 text-xl font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-10"
              aria-label="부부합산 연소득" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.map((r) => {
          const isBest = cheapest !== null && r.name === cheapest.name;
          return (
            <div key={r.name}
              className="rounded-2xl p-5 relative"
              style={{
                backgroundColor: isBest ? "#0145F2" : "hsl(var(--card))",
                border: isBest ? "none" : "1.5px solid hsl(var(--border))",
                color: isBest ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                boxShadow: isBest ? "0 8px 24px #0145F230" : "none",
              }}>
              {isBest && (
                <div className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-electric">
                  최저 비용
                </div>
              )}
              <p className="text-xs font-black uppercase tracking-widest mb-2"
                style={{ color: isBest ? "rgba(255,255,255,0.85)" : "hsl(var(--muted-foreground))" }}>
                {r.name}
              </p>
              <p className="text-2xl font-black tabular-nums mb-1">{r.eligible ? `${fmt(r.limit)}원` : "대상 아님"}</p>
              <p className="text-xs mb-3"
                style={{ color: isBest ? "rgba(255,255,255,0.85)" : "hsl(var(--muted-foreground))" }}>
                {r.eligible
                  ? `금리 연 ${r.rate.toFixed(1)}%${r.rateIsFloor ? "~" : ""}`
                  : `합산 소득 ${fmt(r.incomeLimit / 10_000)}만원 초과`}
              </p>
              <div className="flex justify-between text-xs"
                style={{ color: isBest ? "rgba(255,255,255,0.8)" : "hsl(var(--muted-foreground))", borderTop: isBest ? "1px solid rgba(255,255,255,0.2)" : "1px solid hsl(var(--border))", paddingTop: "8px" }}>
                <span>월 이자</span>
                <span className="font-black">{r.eligible ? `${fmt(r.monthlyInterest)}원` : "—"}</span>
              </div>
              <div className="flex justify-between text-xs mt-1"
                style={{ color: isBest ? "rgba(255,255,255,0.8)" : "hsl(var(--muted-foreground))" }}>
                <span>연 이자</span>
                <span className="font-black">{r.eligible ? `${fmt(r.annualInterest)}원` : "—"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 결과 직하 광고 */}
      <CalcResultAd />
    </div>
  );
}
