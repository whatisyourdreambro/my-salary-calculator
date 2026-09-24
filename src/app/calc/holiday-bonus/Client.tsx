"use client";

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";
import { calcBonusNet } from "@/lib/bonusTaxCalc";

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

  // 성과급 계산기 23종 공통 엔진 — 소득세 = 연간 결정세액(연봉 + 상여) − 연간 결정세액(연봉).
  // 2026-09-25 A18: 종전 인라인 '산출세액 차이 × 0.7(세액공제 30% 가정)'·하드코딩 요율 대체.
  const result = useMemo(() => {
    const r = calcBonusNet(salary, bonus);
    const insurance = r.pensionDelta + r.healthDelta + r.empInsDelta;
    const rate = bonus > 0 ? (r.totalDeductions / bonus) * 100 : 0;
    return {
      net: r.net,
      totalDeduction: r.totalDeductions,
      rate,
      incomeTax: r.incomeTaxDelta,
      localTax: r.localTaxDelta,
      insurance,
    };
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
              style={{ borderBottom: i < arr.length - 1 ? "1px solid hsl(var(--border))" : "none" }}
            >
              <span className="text-sm font-medium text-muted-blue dark:text-canvas-300">{row.label}</span>
              <span className="text-sm font-black tabular-nums text-rose-500">-{fmt(row.value)}원</span>
            </div>
          ))}
        </div>
      </div>

      {/* 결과 직하 광고 */}
      <CalcResultAd />
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
        <NumberInput
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatInput(e.target.value))}
          className="w-full rounded-xl px-4 py-4 text-xl font-black focus:outline-none transition pr-10"
          style={{
            backgroundColor: highlight ? "hsl(var(--accent))" : "hsl(var(--card))",
            border: highlight ? "2px solid #0145F2" : "1.5px solid hsl(var(--border))",
            color: highlight ? "hsl(var(--link))" : "hsl(var(--foreground))",
          }}
          placeholder="0"
          aria-label={label}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
      </div>
    </div>
  );
}
