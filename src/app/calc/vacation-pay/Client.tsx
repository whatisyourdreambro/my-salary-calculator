"use client";

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";
import { calcVacationPay } from "@/lib/vacationPay";

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

  // 1일 통상임금 = 연봉 ÷ 12 ÷ 209 × 8 (정본 computeOrdinaryWage), 세금·4대보험 = 정본 calcBonusNet.
  // 종전 연봉 ÷ 240·고정 세율은 실수령을 16~30% 과대 표시했다 (2026-10-05 감사 code7-01) — src/lib/vacationPay.ts
  const result = useMemo(() => calcVacationPay(salary, numDays), [salary, numDays]);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vp-salary" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">연봉 (세전)</label>
          <div className="relative">
            <NumberInput id="vp-salary" type="text" inputMode="numeric" value={salaryFmt}
              onChange={(e) => setSalaryFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-4 text-xl font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-10"
              aria-label="연봉" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
          </div>
        </div>
        <div>
          <label htmlFor="vp-days" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">미사용 연차 일수</label>
          <div className="relative">
            <NumberInput id="vp-days" type="text" inputMode="numeric" value={days}
              onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded-xl px-4 py-4 text-2xl font-black focus:outline-none transition pr-10"
              style={{ backgroundColor: "hsl(var(--accent))", border: "2px solid hsl(var(--input))", color: "hsl(var(--link))" }}
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

      {/* 결과 직하 광고 */}
      <CalcResultAd />
    </div>
  );
}
