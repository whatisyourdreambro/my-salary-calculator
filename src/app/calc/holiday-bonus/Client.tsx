"use client";

import { useState, useMemo } from "react";

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

function calcEmpDeduction(t: number): number {
  if (t <= 5_000_000) return t * 0.7;
  if (t <= 15_000_000) return 3_500_000 + (t - 5_000_000) * 0.4;
  if (t <= 45_000_000) return 7_500_000 + (t - 15_000_000) * 0.15;
  if (t <= 100_000_000) return 12_000_000 + (t - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (t - 100_000_000) * 0.02, 20_000_000);
}

function calcTax(t: number): number {
  if (t <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (t <= b.limit) return Math.max(0, Math.round(t * b.rate - b.deduction));
  }
  return 0;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  if (!d) return "";
  return Number(d).toLocaleString("ko-KR");
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

export default function HolidayBonusClient() {
  const [salaryFmt, setSalaryFmt] = useState("48,000,000");
  const [bonusFmt, setBonusFmt] = useState("1,000,000");

  const salary = parseInput(salaryFmt);
  const bonus = parseInput(bonusFmt);

  const result = useMemo(() => {
    const basicDeduct = 1_500_000;
    const total = salary + bonus;
    const taxableBase = Math.max(0, salary - calcEmpDeduction(salary) - basicDeduct);
    const taxableNew = Math.max(0, total - calcEmpDeduction(total) - basicDeduct);
    const incomeTax = (calcTax(taxableNew) - calcTax(taxableBase)) * 0.7;
    const localTax = incomeTax * 0.1;

    const pension = Math.min(bonus, Math.max(0, 74_040_000 - salary)) * 0.045;
    const health = bonus * 0.03545;
    const longTerm = health * 0.1295;
    const employment = bonus * 0.009;
    const insurance = pension + health + longTerm + employment;

    const totalDeduction = incomeTax + localTax + insurance;
    const net = bonus - totalDeduction;
    const rate = bonus > 0 ? (totalDeduction / bonus) * 100 : 0;

    return { net, totalDeduction, rate, incomeTax, localTax, insurance };
  }, [salary, bonus]);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field id="salary" label="연봉 (세전)" value={salaryFmt} onChange={setSalaryFmt} />
        <Field id="bonus" label="명절 상여금 (세전)" value={bonusFmt} onChange={setBonusFmt} highlight />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div
          className="px-8 py-8 text-center"
          style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
            명절 상여 실수령
          </p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {fmt(result.net)}원
          </div>
          <p className="text-sm font-bold mt-1 mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
            세전 {fmt(bonus)}원 → 세금 -{fmt(result.totalDeduction)}원 ({result.rate.toFixed(1)}%)
          </p>
        </div>
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 space-y-0">
          {[
            { label: "소득세", value: result.incomeTax },
            { label: "지방소득세", value: result.localTax },
            { label: "4대보험 (국민연금·건강·고용)", value: result.insurance },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-3"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid #EDF1F5" : "none" }}
            >
              <span className="text-sm font-medium text-muted-blue dark:text-canvas-300">{row.label}</span>
              <span className="text-sm font-black tabular-nums text-rose-500">-{fmt(row.value)}원</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  id, label, value, onChange, highlight = false,
}: { id: string; label: string; value: string; onChange: (v: string) => void; highlight?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatInput(e.target.value))}
          className="w-full rounded-xl px-4 py-4 text-xl font-black focus:outline-none transition pr-10"
          style={{
            backgroundColor: highlight ? "#0145F208" : "#F8FAFB",
            border: highlight ? "2px solid #0145F2" : "1.5px solid #DDE4EC",
            color: highlight ? "#0145F2" : "#0A1829",
          }}
          placeholder="0"
          aria-label={label}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
      </div>
    </div>
  );
}
