"use client";

import { useState, useMemo } from "react";

function fmt(n: number) { return Math.round(n).toLocaleString("ko-KR"); }

export default function ChildDeductionClient() {
  const [under6, setUnder6] = useState(0); // 6세 이하
  const [age7to20, setAge7to20] = useState(0); // 7~20세
  const [newborn, setNewborn] = useState<"none" | "first" | "second" | "third">("none"); // 출산
  const [salary, setSalary] = useState(60_000_000);

  const result = useMemo(() => {
    const totalChildren = under6 + age7to20;

    // 인적공제 (소득공제)
    const personalDeduction = totalChildren * 1_500_000;
    const under6ExtraDeduction = under6 * 1_000_000;

    // 자녀세액공제 (8세~20세, 단순화 7세부터 적용)
    let childTaxCredit = 0;
    if (age7to20 === 1) childTaxCredit = 250_000;
    else if (age7to20 === 2) childTaxCredit = 550_000;
    else if (age7to20 >= 3) childTaxCredit = 550_000 + (age7to20 - 2) * 300_000;

    // 출산·입양 세액공제
    const birthCredit = newborn === "first" ? 300_000 : newborn === "second" ? 500_000 : newborn === "third" ? 700_000 : 0;

    // 한계세율 추정
    const marginalRate = salary > 150_000_000 ? 0.35 : salary > 88_000_000 ? 0.35 : salary > 50_000_000 ? 0.24 : salary > 14_000_000 ? 0.15 : 0.06;

    const incomeReduction = personalDeduction + under6ExtraDeduction;
    const taxFromDeduction = incomeReduction * marginalRate;
    const totalSaving = taxFromDeduction + childTaxCredit + birthCredit;

    return {
      personalDeduction,
      under6ExtraDeduction,
      childTaxCredit,
      birthCredit,
      taxFromDeduction,
      totalSaving,
      marginalRate,
    };
  }, [under6, age7to20, newborn, salary]);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">연봉</label>
          <input type="range" min="20000000" max="300000000" step="5000000" value={salary}
            onChange={(e) => setSalary(Number(e.target.value))} className="w-full accent-electric" aria-label="연봉" />
          <div className="text-sm text-navy dark:text-canvas-50 font-bold mt-1">{fmt(salary)}원</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Counter label="6세 이하 자녀" value={under6} onChange={setUnder6} />
          <Counter label="7~20세 자녀" value={age7to20} onChange={setAge7to20} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">출산·입양 (해당 연도)</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: "none", label: "없음" },
              { v: "first", label: "첫째 +30만" },
              { v: "second", label: "둘째 +50만" },
              { v: "third", label: "셋째+ +70만" },
            ].map((o) => (
              <button key={o.v}
                onClick={() => setNewborn(o.v as typeof newborn)}
                className="py-3 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: newborn === o.v ? "#0145F2" : "#F8FAFB",
                  border: `1.5px solid ${newborn === o.v ? "#0145F2" : "#DDE4EC"}`,
                  color: newborn === o.v ? "#FFFFFF" : "#3D5E78",
                }}
                aria-pressed={newborn === o.v}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #10B981 0%, #14C997 100%)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>예상 절세 효과</p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {fmt(result.totalSaving)}원
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>
            한계세율 {(result.marginalRate * 100).toFixed(0)}% 기준
          </p>
        </div>
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 space-y-0">
          {[
            { label: "인적공제 (소득공제)", value: result.taxFromDeduction, sub: `${fmt(result.personalDeduction + result.under6ExtraDeduction)}원 × ${(result.marginalRate * 100).toFixed(0)}%` },
            { label: "자녀세액공제 (8~20세)", value: result.childTaxCredit, sub: `${age7to20}자녀` },
            { label: "출산·입양 세액공제", value: result.birthCredit, sub: newborn === "none" ? "해당 없음" : "" },
          ].map((row, i, arr) => (
            <div key={row.label} className="flex justify-between items-center py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid #EDF1F5" : "none" }}>
              <div>
                <div className="text-sm font-medium text-muted-blue dark:text-canvas-300">{row.label}</div>
                {row.sub && <div className="text-xs text-faint-blue mt-0.5">{row.sub}</div>}
              </div>
              <span className="text-sm font-black tabular-nums text-emerald-600">+{fmt(row.value)}원</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">{label}</label>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-xl bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-electric font-black text-xl"
          aria-label={`${label} 줄이기`}>−</button>
        <div className="flex-1 text-center text-2xl font-black text-navy dark:text-canvas-50">{value}명</div>
        <button onClick={() => onChange(Math.min(10, value + 1))}
          className="w-10 h-10 rounded-xl bg-electric text-white font-black text-xl"
          aria-label={`${label} 늘리기`}>+</button>
      </div>
    </div>
  );
}
