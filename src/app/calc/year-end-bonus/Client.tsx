"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 간단한 누진세 계산 (2026)
const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06, deduction: 0 },
  { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function calcEmpDeduction(total: number): number {
  if (total <= 5_000_000) return total * 0.7;
  if (total <= 15_000_000) return 3_500_000 + (total - 5_000_000) * 0.4;
  if (total <= 45_000_000) return 7_500_000 + (total - 15_000_000) * 0.15;
  if (total <= 100_000_000) return 12_000_000 + (total - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (total - 100_000_000) * 0.02, 20_000_000);
}

function calcTax(taxable: number): number {
  if (taxable <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.limit) return Math.max(0, Math.round(taxable * b.rate - b.deduction));
  }
  return 0;
}

function quickEstimate(salary: number, bonus: number) {
  const basicDeduct = 1_500_000;
  const totalIncome = salary + bonus;

  // 기본급만 세금
  const taxableBase = Math.max(0, salary - calcEmpDeduction(salary) - basicDeduct);
  const taxBase = calcTax(taxableBase) * 0.7; // 세액공제 약 30% 가정

  // 합산 세금
  const taxableNew = Math.max(0, totalIncome - calcEmpDeduction(totalIncome) - basicDeduct);
  const taxNew = calcTax(taxableNew) * 0.7;

  const bonusTax = Math.max(0, taxNew - taxBase);
  const localTax = bonusTax * 0.1;

  // 4대보험 (성과급 부분)
  const pensionBase = Math.min(bonus, Math.max(0, 74_040_000 - salary));
  const pension = pensionBase * 0.045;
  const health = bonus * 0.03545;
  const longTerm = health * 0.1295;
  const employment = bonus * 0.009;

  const totalDeduction = bonusTax + localTax + pension + health + longTerm + employment;
  const netBonus = bonus - totalDeduction;
  const effectiveRate = bonus > 0 ? (totalDeduction / bonus) * 100 : 0;

  return { totalDeduction, netBonus, effectiveRate };
}

interface Scenario {
  rank: string;
  salary: number;
  bonus: number;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

function toEok(n: number): string {
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000);
    const man = Math.floor((n % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (n >= 10_000) return `${Math.floor(n / 10_000).toLocaleString()}만원`;
  return `${n.toLocaleString()}원`;
}

export default function YearEndBonusClient({ scenarios }: { scenarios: Scenario[] }) {
  const [selectedIdx, setSelectedIdx] = useState(2);
  const selected = scenarios[selectedIdx];

  const result = useMemo(
    () => quickEstimate(selected.salary, selected.bonus),
    [selected]
  );

  const allResults = useMemo(
    () => scenarios.map((s) => ({ ...s, ...quickEstimate(s.salary, s.bonus) })),
    [scenarios]
  );

  return (
    <div className="space-y-5 mb-10">
      {/* 직급 선택 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <h2 className="text-xs font-black uppercase tracking-widest mb-4 text-faint-blue">
          직급 선택
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {scenarios.map((s, i) => {
            const active = i === selectedIdx;
            return (
              <button
                key={s.rank}
                onClick={() => setSelectedIdx(i)}
                className="p-3 rounded-xl text-center transition-all"
                style={{
                  backgroundColor: active ? "#0145F2" : "#F8FAFB",
                  border: `1.5px solid ${active ? "#0145F2" : "#DDE4EC"}`,
                  color: active ? "#FFFFFF" : "#3D5E78",
                }}
                aria-pressed={active}
              >
                <div className="text-sm font-black">{s.rank}</div>
                <div
                  className="text-[10px] mt-1 font-medium"
                  style={{ color: active ? "rgba(255,255,255,0.75)" : "#7A9AB5" }}
                >
                  연 {toEok(s.salary)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 결과 카드 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 8px 40px #0145F225" }}
      >
        <div
          className="px-8 py-8 text-center"
          style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}
        >
          <p
            className="text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {selected.rank} 평균 성과급 실수령
          </p>
          <div
            className="text-5xl sm:text-6xl font-black tracking-tight text-white"
            style={{ letterSpacing: "-0.04em" }}
          >
            {fmt(result.netBonus)}원
          </div>
          <p className="text-sm font-bold mt-1 mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
            성과급 {toEok(selected.bonus)} → 세금 {fmt(result.totalDeduction)}원 차감
          </p>
          <div className="grid grid-cols-3 gap-1 pt-5 border-t border-white/20">
            <div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                실효세율
              </div>
              <div className="text-sm font-black text-white">
                {result.effectiveRate.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                세금
              </div>
              <div className="text-sm font-black text-white">
                {toEok(result.totalDeduction)}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                실수령
              </div>
              <div className="text-sm font-black text-white">{toEok(result.netBonus)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 전체 직급 비교 표 */}
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800">
        <div className="px-5 py-4 bg-electric-5">
          <h3 className="font-black text-sm text-navy dark:text-canvas-50">
            전체 직급 성과급 비교 (2026 기준)
          </h3>
        </div>
        <div className="divide-y divide-canvas-200 dark:divide-canvas-800">
          {allResults.map((r) => (
            <div key={r.rank} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm">
              <div className="col-span-3 font-black text-navy dark:text-canvas-50">
                {r.rank}
              </div>
              <div className="col-span-3 text-right text-faint-blue tabular-nums">
                연 {toEok(r.salary)}
              </div>
              <div className="col-span-3 text-right text-rose-500 tabular-nums">
                -{toEok(r.totalDeduction)}
              </div>
              <div className="col-span-3 text-right font-black text-electric tabular-nums">
                {toEok(r.netBonus)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
