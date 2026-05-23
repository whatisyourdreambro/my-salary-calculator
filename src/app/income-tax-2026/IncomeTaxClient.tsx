"use client";

import { useMemo, useState } from "react";

const BRACKETS: Array<{ ceil: number; rate: number; deduction: number }> = [
  { ceil: 14_000_000, rate: 0.06, deduction: 0 },
  { ceil: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { ceil: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { ceil: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { ceil: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { ceil: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { ceil: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { ceil: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function calcIncomeTax(taxableBase: number): {
  rate: number;
  deduction: number;
  baseTax: number;
} {
  if (taxableBase <= 0) return { rate: 0, deduction: 0, baseTax: 0 };
  const bracket = BRACKETS.find((b) => taxableBase <= b.ceil)!;
  const baseTax = Math.max(0, taxableBase * bracket.rate - bracket.deduction);
  return { rate: bracket.rate, deduction: bracket.deduction, baseTax };
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function IncomeTaxClient() {
  const [grossIncome, setGrossIncome] = useState(70_000_000);
  const [deductions, setDeductions] = useState(15_000_000);

  const result = useMemo(() => {
    const taxableBase = Math.max(0, grossIncome - deductions);
    const { rate, deduction, baseTax } = calcIncomeTax(taxableBase);
    const localTax = baseTax * 0.1;
    const total = baseTax + localTax;
    const effectiveRate = grossIncome > 0 ? (total / grossIncome) * 100 : 0;
    return { taxableBase, rate, deduction, baseTax, localTax, total, effectiveRate };
  }, [grossIncome, deductions]);

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 종합소득세 즉시 계산
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            연 총소득 (원)
          </label>
          <input
            type="number"
            value={grossIncome}
            onChange={(e) => setGrossIncome(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={1_000_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="연 총소득 (원)"
          />
          <p className="mt-2 text-xs text-faint-blue">
            {fmt(grossIncome / 10000)}만원
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            총 공제액 (원)
          </label>
          <input
            type="number"
            value={deductions}
            onChange={(e) => setDeductions(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={500_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="총 공제액 (원)"
          />
          <p className="mt-2 text-xs text-faint-blue">
            근로소득공제 + 인적공제(1인 150만원) + 연금·보험료 + 신용카드 등
          </p>
        </div>

        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            총 부담세액 (산출세액 + 지방소득세)
          </p>
          <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
            {fmt(result.total)}원
          </p>
          <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>과세표준</span>
              <span>{fmt(result.taxableBase)}원</span>
            </div>
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>적용 세율</span>
              <span>{(result.rate * 100).toFixed(0)}% (누진공제 {fmt(result.deduction)}원)</span>
            </div>
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>산출세액</span>
              <span>{fmt(result.baseTax)}원</span>
            </div>
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>지방소득세 (10%)</span>
              <span>+{fmt(result.localTax)}원</span>
            </div>
            <div className="flex justify-between text-navy dark:text-canvas-50 font-bold pt-2 border-t border-electric-20 mt-2">
              <span>실효세율</span>
              <span>{result.effectiveRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 본 계산기는 종합소득세 기준입니다. 분리과세(이자·배당 2천만원 이하 등)는 별도 적용.
          정확한 신고는 국세청 홈택스 모의계산 또는 세무사 상담을 권장합니다.
        </p>
      </div>
    </section>
  );
}
