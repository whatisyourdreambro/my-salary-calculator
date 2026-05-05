"use client";

import { useState, useMemo, useCallback } from "react";

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

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

function formatInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

export default function IncentiveClient() {
  const [salaryFmt, setSalaryFmt] = useState("80,000,000");
  const [incentiveFmt, setIncentiveFmt] = useState("30,000,000");

  const salary = parseInput(salaryFmt);
  const incentive = parseInput(incentiveFmt);

  const result = useMemo(() => {
    const basicDeduct = 1_500_000;

    // 합산과세
    const totalIncome = salary + incentive;
    const taxableNew = Math.max(0, totalIncome - calcEmpDeduction(totalIncome) - basicDeduct);
    const taxableBase = Math.max(0, salary - calcEmpDeduction(salary) - basicDeduct);
    const combinedIncentiveTax = (calcTax(taxableNew) - calcTax(taxableBase)) * 0.7; // 세액공제 ~30%
    const combinedLocal = combinedIncentiveTax * 0.1;
    const combined4Insurance =
      Math.min(incentive, Math.max(0, 74_040_000 - salary)) * 0.045 +
      incentive * 0.03545 +
      incentive * 0.03545 * 0.1295 +
      incentive * 0.009;
    const combinedTotal = combinedIncentiveTax + combinedLocal + combined4Insurance;
    const combinedNet = incentive - combinedTotal;

    // 분리과세 (벤처 스톡옵션 가정: 5천만 비과세 + 초과분 20%)
    const taxFreeLimit = 50_000_000;
    const taxFreeAmount = Math.min(incentive, taxFreeLimit);
    const taxedAmount = Math.max(0, incentive - taxFreeLimit);
    const separateTax = taxedAmount * 0.2;
    const separateLocal = separateTax * 0.1;
    // 4대보험은 분리과세 적용 시 보통 부과 안 됨 (스톡옵션 행사이익은 근로소득세만)
    const separateTotal = separateTax + separateLocal;
    const separateNet = incentive - separateTotal;

    return {
      combinedNet,
      combinedTotal,
      combinedRate: incentive > 0 ? (combinedTotal / incentive) * 100 : 0,
      separateNet,
      separateTotal,
      separateRate: incentive > 0 ? (separateTotal / incentive) * 100 : 0,
      benefit: separateNet - combinedNet,
      taxFreeAmount,
      taxedAmount,
    };
  }, [salary, incentive]);

  return (
    <div className="space-y-5 mb-10">
      {/* 입력 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-5">
        <div>
          <label htmlFor="salary-input" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
            연봉 (세전)
          </label>
          <div className="relative">
            <input
              id="salary-input"
              type="text"
              inputMode="numeric"
              value={salaryFmt}
              onChange={(e) => setSalaryFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-4 text-xl font-black focus:outline-none focus:ring-2 focus:ring-electric/50 transition pr-12 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50"
              placeholder="예: 80,000,000"
              aria-label="세전 연봉 입력"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-faint-blue">
              원
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="incentive-input" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
            인센티브 / 스톡옵션 행사이익 (세전)
          </label>
          <div className="relative">
            <input
              id="incentive-input"
              type="text"
              inputMode="numeric"
              value={incentiveFmt}
              onChange={(e) => setIncentiveFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-4 text-2xl font-black focus:outline-none transition pr-12 text-electric"
              style={{ backgroundColor: "#0145F208", border: "2px solid #0145F2" }}
              placeholder="예: 30,000,000"
              aria-label="인센티브 입력"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              원
            </span>
          </div>
        </div>
      </div>

      {/* 결과 비교 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 합산과세 */}
        <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
          <p className="text-xs font-black uppercase tracking-widest text-faint-blue mb-2">
            ① 합산과세 (일반 인센티브)
          </p>
          <p className="text-3xl font-black text-navy dark:text-canvas-50 mb-2">
            {fmt(result.combinedNet)}원
          </p>
          <p className="text-xs text-rose-500 mb-4 font-bold">
            세금 -{fmt(result.combinedTotal)}원 ({result.combinedRate.toFixed(1)}%)
          </p>
          <ul className="space-y-1 text-xs text-muted-blue dark:text-canvas-400">
            <li>• 누진세율 6~45% 적용</li>
            <li>• 4대보험 부과 (국민연금·건강·고용)</li>
            <li>• 일반 성과급·인센티브에 적용</li>
          </ul>
        </div>

        {/* 분리과세 */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)",
            boxShadow: "0 8px 32px #0145F230",
          }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
            ② 분리과세 (벤처 스톡옵션)
          </p>
          <p className="text-3xl font-black mb-2">{fmt(result.separateNet)}원</p>
          <p className="text-xs mb-4 font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
            세금 -{fmt(result.separateTotal)}원 ({result.separateRate.toFixed(1)}%)
          </p>
          <ul className="space-y-1 text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
            <li>• 5천만원 비과세 + 초과분 20% 분리과세</li>
            <li>• 4대보험 부과 안 됨 (행사이익 분리)</li>
            <li>• 벤처기업 임직원·요건 충족 시</li>
          </ul>
        </div>
      </div>

      {/* 차이 박스 */}
      {result.benefit > 0 && (
        <div className="rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            분리과세 절세 효과
          </p>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
            +{fmt(result.benefit)}원
          </p>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
            벤처 스톡옵션 분리과세가 적용되면 합산과세 대비 위 금액만큼 더 받습니다.
          </p>
        </div>
      )}
    </div>
  );
}
