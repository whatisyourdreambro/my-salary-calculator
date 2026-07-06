"use client";

// TAI(목표달성장려금) 미니 계산기 — 월 기본급 × 지급률(%).
// 지급률 프리셋은 2026년 상반기 실제 발표값(taiData.ts). 세금은 OPI와 동일하게
// 근로소득 합산 과세되므로, 세후까지 보려면 위 '내 연봉으로 계산' 가정을 참고하도록 안내.

import { useMemo, useState } from "react";
import { Target } from "lucide-react";
import {
  fmtManwon,
  formatNumberInput,
  parseNumberInput,
  useCountUp,
} from "./shared";
import { TAI_RATES_2026_H1 } from "./taiData";

export default function TaiCalculator() {
  const [baseSalaryFmt, setBaseSalaryFmt] = useState("5,000,000");
  const [rate, setRate] = useState(100); // 월 기본급 대비 % — 디폴트 메모리 100%
  const [selectedId, setSelectedId] = useState<string>("memory");

  const baseSalary = parseNumberInput(baseSalaryFmt);

  const result = useMemo(() => {
    const onceWon = baseSalary * (rate / 100);
    return {
      onceManwon: onceWon / 10000,
      // 상·하반기 동일 지급률 가정 시 연간 (참고치)
      yearlyManwon: (onceWon * 2) / 10000,
    };
  }, [baseSalary, rate]);

  const animOnce = useCountUp(result.onceManwon);

  return (
    <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1 inline-flex items-center gap-1.5">
        <Target size={11} className="text-electric" aria-hidden /> TAI 미니
        계산기 — 이번 지급분
      </p>
      <p className="text-[11px] text-faint-blue mb-5 leading-relaxed">
        TAI는 <strong>월 기본급 대비 %</strong>로 지급됩니다. 사업부를 누르면
        2026년 상반기 실제 발표 지급률이 적용됩니다.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="tai-base-salary"
            className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
          >
            내 월 기본급 (세전)
          </label>
          <div className="relative">
            <input
              id="tai-base-salary"
              type="text"
              inputMode="numeric"
              value={baseSalaryFmt}
              onChange={(e) => setBaseSalaryFmt(formatNumberInput(e.target.value))}
              className="w-full rounded-xl px-4 py-3 text-2xl font-black focus:outline-none transition pr-12 text-electric tabular-nums"
              style={{
                backgroundColor: "#0145F208",
                border: "2px solid #0145F2",
              }}
              placeholder="5,000,000"
              aria-label="월 기본급 입력 (원)"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              원
            </span>
          </div>
          <p className="text-[10px] text-faint-blue mt-1.5 leading-relaxed">
            기본급은 연봉 총액이 아닌 급여명세서의 기본급 항목입니다 (통상 연봉의
            60~75% 수준).
          </p>
        </div>

        <div>
          <div className="flex items-end justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-faint-blue">
              지급률 (2026 상반기 발표값)
            </span>
            <span className="text-2xl font-black tabular-nums text-electric">
              {rate}%
            </span>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="사업부별 TAI 지급률 선택"
          >
            {TAI_RATES_2026_H1.map((t) => {
              const active = selectedId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(t.id);
                    setRate(t.rate);
                  }}
                  aria-pressed={active}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                    active
                      ? "bg-electric text-white"
                      : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white"
                  }`}
                >
                  {t.division} {t.rate}%
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-xl px-5 py-4 flex flex-wrap items-end justify-between gap-3"
          style={{
            background: "linear-gradient(90deg, #0145F210 0%, #7C83FF10 100%)",
          }}
          aria-live="polite"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-faint-blue mb-1">
              이번 TAI (세전)
            </p>
            <p className="text-3xl font-black tabular-nums text-electric">
              {fmtManwon(animOnce)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-faint-blue mb-1">
              연간 2회 기준 (참고)
            </p>
            <p className="text-base font-black tabular-nums text-navy dark:text-canvas-50">
              {fmtManwon(result.yearlyManwon)}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-faint-blue leading-relaxed">
          ※ TAI도 OPI와 같이 근로소득에 합산되어 누진세율로 과세됩니다. 하반기
          지급률은 12월 말 별도 발표되며 상반기와 다를 수 있습니다.
        </p>
      </div>
    </div>
  );
}
