"use client";

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import { computeOrdinaryWage } from "@/lib/ordinaryWage";

function fmt(n: number) { return Math.round(n).toLocaleString("ko-KR"); }
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  return d ? Number(d).toLocaleString("ko-KR") : "";
}
function parseInput(s: string): number { return Number(s.replace(/[^0-9]/g, "")) || 0; }

const FIELDS = [
  { id: "ow-base", key: "base", label: "월 기본급", ph: "3,000,000" },
  { id: "ow-allow", key: "allow", label: "월 고정수당 (식대·직책 등 정기·일률분)", ph: "200,000" },
  { id: "ow-bonus", key: "bonus", label: "연간 정기상여 총액 (재직조건부 포함)", ph: "2,400,000" },
] as const;

export default function OrdinaryWageClient() {
  const [vals, setVals] = useState<Record<string, string>>({
    base: "3,000,000",
    allow: "200,000",
    bonus: "2,400,000",
  });

  const r = useMemo(
    () =>
      computeOrdinaryWage({
        monthlyBase: parseInput(vals.base),
        monthlyFixedAllowance: parseInput(vals.allow),
        annualBonus: parseInput(vals.bonus),
      }),
    [vals]
  );

  const rows = [
    { label: "월 통상임금", value: `${fmt(r.monthlyOrdinary)}원`, sub: "기본급 + 고정수당 + 연 상여÷12" },
    { label: "1일 통상임금 (8시간)", value: `${fmt(r.daily)}원`, sub: "시간급 × 8 — 연차수당 1일분" },
    { label: "연장근로 1시간", value: `${fmt(r.overtimeHourly)}원`, sub: "시간급 × 1.5 (근로기준법 56조)" },
    { label: "야간근로 가산 1시간", value: `+${fmt(r.nightExtraHourly)}원`, sub: "22시~06시, +50% (연장과 중복 가산)" },
    { label: "휴일근로 8시간", value: `${fmt(r.holiday8hPay)}원`, sub: "8시간 이내 ×1.5" },
    { label: "휴일 8시간 초과 1시간", value: `${fmt(r.holidayOver8Hourly)}원`, sub: "초과분 ×2.0" },
  ];

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.id} className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
              {f.label}
            </label>
            <div className="relative">
              <input
                id={f.id}
                type="text"
                inputMode="numeric"
                value={vals[f.key]}
                placeholder={f.ph}
                onChange={(e) => setVals((v) => ({ ...v, [f.key]: formatInput(e.target.value) }))}
                className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-9"
                aria-label={f.label}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
            시간급 통상임금
          </p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {fmt(r.hourly)}원
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            월 통상임금 {fmt(r.monthlyOrdinary)}원 ÷ 209시간 (주 40시간 기준)
          </p>
        </div>
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-canvas-100 dark:border-canvas-800 pb-2">
              <div>
                <div className="font-bold text-navy dark:text-canvas-50">{row.label}</div>
                <div className="text-[11px] text-faint-blue">{row.sub}</div>
              </div>
              <div className="font-black tabular-nums text-electric shrink-0">{row.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 결과 직하 광고 */}
      <CalcResultAd />
    </div>
  );
}
