"use client";

// 추석 상여금 실수령 미니 계산기 — 연봉·상여금 2입력.
// 세금 로직은 공용 모듈 bonusTaxCalc(calcBonusNet) 재사용:
// 한계세율 방식 소득세 + 4대보험(연금 상한 자동 처리).
// 정밀 계산(부양가족·세액공제)은 /calc/holiday-bonus 로 링크 유도.

import { useMemo, useState } from "react";
import Link from "@/components/AppLink";
import { ArrowRight, Calculator } from "lucide-react";
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { trackCalcSubmit } from "@/lib/analytics";

const fmtWon = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export default function ChuseokBonusClient() {
  const [salary, setSalary] = useState(42_000_000); // 평균 연봉대 기본값
  const [bonus, setBonus] = useState(1_000_000); // 추석 상여 100만원 기본값
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => calcBonusNet(salary, bonus), [salary, bonus]);

  const handleChange =
    (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = Number(e.target.value.replace(/,/g, ""));
      if (!isNaN(num) && num >= 0) {
        setter(num);
        if (!touched) {
          setTouched(true);
          trackCalcSubmit("chuseok_bonus_mini");
        }
      }
    };

  return (
    <section className="p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
      <h2 className="text-xl font-black text-navy mb-1 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-electric" />
        추석 상여금 실수령 간편 계산
      </h2>
      <p className="text-xs text-faint-blue mb-6">
        상여금은 근로소득으로 합산 과세 — 내 연봉 구간의 한계세율과 4대보험이 적용됩니다
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-navy mb-2">내 연봉 (원)</label>
          <input
            type="text"
            inputMode="numeric"
            value={salary.toLocaleString("ko-KR")}
            onChange={handleChange(setSalary)}
            className="w-full px-4 py-3 bg-canvas rounded-xl text-base font-bold text-navy border border-transparent focus:border-electric focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-navy mb-2">
            추석 상여금 (원)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={bonus.toLocaleString("ko-KR")}
            onChange={handleChange(setBonus)}
            className="w-full px-4 py-3 bg-canvas rounded-xl text-base font-bold text-navy border border-transparent focus:border-electric focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-electric rounded-2xl text-white">
        <p className="text-xs font-bold opacity-90 mb-1">세후 실수령 추석 상여금</p>
        <p className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums mb-4">
          {fmtWon(result.net)}
        </p>
        <div className="border-t border-white/20 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-white/80">소득세 + 지방소득세</span>
            <span className="font-bold tabular-nums">
              -{fmtWon(result.incomeTaxDelta + result.localTaxDelta)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">4대보험 (연금·건보·고용)</span>
            <span className="font-bold tabular-nums">
              -{fmtWon(result.pensionDelta + result.healthDelta + result.empInsDelta)}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-white/20">
            <span className="text-white/90 font-bold">실효 공제율</span>
            <span className="font-black tabular-nums">
              {result.effectiveRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/calc/holiday-bonus"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-electric hover:underline"
      >
        부양가족·세액공제까지 반영한 정밀 계산기
        <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}
