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

export default function YearEndBonusTaxClient() {
  const [salaryFmt, setSalaryFmt] = useState("60,000,000");
  const [bonusFmt, setBonusFmt] = useState("15,000,000");
  const [nextYearSalaryFmt, setNextYearSalaryFmt] = useState("60,000,000");

  const salary = parseInput(salaryFmt);
  const bonus = parseInput(bonusFmt);
  const nextSalary = parseInput(nextYearSalaryFmt);

  const result = useMemo(() => {
    const basicDeduct = 1_500_000;

    // 시나리오 A: 12월에 일시 지급 (당해 연도 합산)
    const totalA = salary + bonus;
    const taxableBaseA = Math.max(0, salary - calcEmpDeduction(salary) - basicDeduct);
    const taxableNewA = Math.max(0, totalA - calcEmpDeduction(totalA) - basicDeduct);
    const incomeTaxBonusA = (calcTax(taxableNewA) - calcTax(taxableBaseA)) * 0.7;

    // 시나리오 B: 1월에 다음해 지급 (다음해 합산)
    const totalB = nextSalary + bonus;
    const taxableBaseB = Math.max(0, nextSalary - calcEmpDeduction(nextSalary) - basicDeduct);
    const taxableNewB = Math.max(0, totalB - calcEmpDeduction(totalB) - basicDeduct);
    const incomeTaxBonusB = (calcTax(taxableNewB) - calcTax(taxableBaseB)) * 0.7;

    // 4대보험 동일 (양쪽 모두 부과)
    const insurance =
      Math.min(bonus, Math.max(0, 74_040_000 - Math.min(salary, nextSalary))) * 0.045 +
      bonus * 0.03545 +
      bonus * 0.03545 * 0.1295 +
      bonus * 0.009;

    const totalA_deduction = incomeTaxBonusA + incomeTaxBonusA * 0.1 + insurance;
    const totalB_deduction = incomeTaxBonusB + incomeTaxBonusB * 0.1 + insurance;

    const netA = bonus - totalA_deduction;
    const netB = bonus - totalB_deduction;

    return {
      netA,
      totalA: totalA_deduction,
      rateA: bonus > 0 ? (totalA_deduction / bonus) * 100 : 0,
      netB,
      totalB: totalB_deduction,
      rateB: bonus > 0 ? (totalB_deduction / bonus) * 100 : 0,
      diff: netB - netA,
    };
  }, [salary, bonus, nextSalary]);

  const isBetter = result.diff > 0;

  return (
    <div className="space-y-5 mb-10">
      {/* 입력 카드 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-5">
        <Field
          id="salary"
          label="올해 연봉 (세전)"
          value={salaryFmt}
          onChange={setSalaryFmt}
        />
        <Field
          id="bonus"
          label="연말 보너스 (세전)"
          value={bonusFmt}
          onChange={setBonusFmt}
          highlight
        />
        <Field
          id="nextSalary"
          label="다음해 예상 연봉 (세전)"
          value={nextYearSalaryFmt}
          onChange={setNextYearSalaryFmt}
        />
        <p className="text-xs text-faint-blue">
          💡 다음해 소득이 줄어들면(이직/육아휴직 등) 1월 수령이 유리할 수 있습니다.
        </p>
      </div>

      {/* 결과 비교 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: !isBetter ? "2px solid #0145F2" : "1.5px solid #DDE4EC",
            boxShadow: !isBetter ? "0 8px 24px #0145F220" : "none",
          }}
        >
          {!isBetter && (
            <div className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-electric text-white">
              유리 ✓
            </div>
          )}
          <p className="text-xs font-black uppercase tracking-widest text-faint-blue mb-2">
            ① 12월 일시 지급
          </p>
          <p className="text-3xl font-black text-navy mb-2">{fmt(result.netA)}원</p>
          <p className="text-xs text-rose-500 mb-2 font-bold">
            세금 -{fmt(result.totalA)}원 ({result.rateA.toFixed(1)}%)
          </p>
          <p className="text-xs text-muted-blue">올해 연봉에 합산 과세</p>
        </div>

        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: isBetter ? "2px solid #0145F2" : "1.5px solid #DDE4EC",
            boxShadow: isBetter ? "0 8px 24px #0145F220" : "none",
          }}
        >
          {isBetter && (
            <div className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-electric text-white">
              유리 ✓
            </div>
          )}
          <p className="text-xs font-black uppercase tracking-widest text-faint-blue mb-2">
            ② 1월 다음해 지급
          </p>
          <p className="text-3xl font-black text-navy mb-2">{fmt(result.netB)}원</p>
          <p className="text-xs text-rose-500 mb-2 font-bold">
            세금 -{fmt(result.totalB)}원 ({result.rateB.toFixed(1)}%)
          </p>
          <p className="text-xs text-muted-blue">다음해 연봉에 합산 과세</p>
        </div>
      </div>

      {/* 차이 박스 */}
      {Math.abs(result.diff) > 1000 && (
        <div
          className="rounded-2xl p-5 border"
          style={{
            backgroundColor: isBetter ? "#ECFDF5" : "#FEF3F2",
            borderColor: isBetter ? "#A7F3D0" : "#FECACA",
          }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{
            color: isBetter ? "#065F46" : "#991B1B"
          }}>
            {isBetter ? "1월 지급" : "12월 지급"} 절세 효과
          </p>
          <p className="text-2xl font-black" style={{
            color: isBetter ? "#065F46" : "#991B1B"
          }}>
            +{fmt(Math.abs(result.diff))}원
          </p>
          <p className="text-xs mt-1" style={{
            color: isBetter ? "#047857" : "#B91C1C"
          }}>
            다음해 소득 감소가 예상되면 1월 지급 협의를, 그렇지 않다면 차이가 거의 없거나
            12월 지급이 유리합니다.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  highlight = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  highlight?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
      >
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
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">
          원
        </span>
      </div>
    </div>
  );
}
