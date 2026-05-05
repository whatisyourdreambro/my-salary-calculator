"use client";

import { useState, useMemo } from "react";

function fmt(n: number) { return Math.round(n).toLocaleString("ko-KR"); }

export default function HousingSubscriptionClient() {
  const [monthly, setMonthly] = useState(250_000);
  const [salary, setSalary] = useState(50_000_000);

  const result = useMemo(() => {
    const annualPayment = Math.min(monthly * 12, 3_000_000);
    const eligibleForDeduction = salary <= 70_000_000;
    const deduction = eligibleForDeduction ? annualPayment * 0.4 : 0;

    // 한계세율 추정
    const marginalRate = salary > 150_000_000 ? 0.35 : salary > 88_000_000 ? 0.35 : salary > 50_000_000 ? 0.24 : salary > 14_000_000 ? 0.15 : 0.06;
    const taxSaving = deduction * marginalRate;
    const yearlyContribution = monthly * 12;

    return {
      annualPayment,
      yearlyContribution,
      deduction,
      taxSaving,
      eligibleForDeduction,
      marginalRate,
      maxedOut: monthly >= 250_000,
    };
  }, [monthly, salary]);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">월 납입액</label>
          <input type="range" min="50000" max="500000" step="10000" value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))} className="w-full accent-electric"
            aria-label="월 납입액" />
          <div className="flex justify-between mt-2">
            <span className="text-2xl font-black text-electric">{fmt(monthly)}원</span>
            <span className="text-xs text-faint-blue">연 {fmt(result.yearlyContribution)}원</span>
          </div>
          {result.maxedOut && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
              ✓ 공제 한도 최대치 (월 25만원)
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">총급여</label>
          <input type="range" min="20000000" max="150000000" step="5000000" value={salary}
            onChange={(e) => setSalary(Number(e.target.value))} className="w-full accent-electric"
            aria-label="총급여" />
          <div className="text-sm text-navy dark:text-canvas-50 font-bold mt-1">{fmt(salary)}원</div>
          {!result.eligibleForDeduction && (
            <p className="text-xs text-rose-500 mt-1 font-bold">
              ⚠ 총급여 7천만원 초과 — 청약저축 소득공제 대상 아님
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-8 py-8 text-center"
          style={{
            background: result.eligibleForDeduction
              ? "linear-gradient(135deg, #10B981 0%, #14C997 100%)"
              : "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
          }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
            예상 절세 효과 (연간)
          </p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {fmt(result.taxSaving)}원
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>
            소득공제 {fmt(result.deduction)}원 × 한계세율 {(result.marginalRate * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-xs text-faint-blue">연 납입</div>
            <div className="font-black tabular-nums text-navy dark:text-canvas-50">{fmt(result.yearlyContribution)}원</div>
          </div>
          <div>
            <div className="text-xs text-faint-blue">공제 인정</div>
            <div className="font-black tabular-nums text-navy dark:text-canvas-50">{fmt(result.annualPayment)}원</div>
          </div>
          <div>
            <div className="text-xs text-faint-blue">소득공제</div>
            <div className="font-black tabular-nums text-emerald-600">{fmt(result.deduction)}원</div>
          </div>
        </div>
      </div>
    </div>
  );
}
