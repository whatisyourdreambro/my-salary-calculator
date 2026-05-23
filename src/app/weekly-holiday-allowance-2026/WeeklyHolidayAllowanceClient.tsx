"use client";

import { useMemo, useState } from "react";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function WeeklyHolidayAllowanceClient() {
  const [hourlyWage, setHourlyWage] = useState(10320);
  const [weeklyHours, setWeeklyHours] = useState(40);

  const result = useMemo(() => {
    if (weeklyHours < 15) {
      return {
        eligible: false,
        weeklyAllowance: 0,
        weeklyBaseline: hourlyWage * weeklyHours,
        weeklyTotal: hourlyWage * weeklyHours,
        monthlyTotal: hourlyWage * weeklyHours * 4.345,
        allowanceHours: 0,
      };
    }
    const allowanceHours = (weeklyHours / 40) * 8;
    const weeklyAllowance = hourlyWage * allowanceHours;
    const weeklyBaseline = hourlyWage * weeklyHours;
    const weeklyTotal = weeklyBaseline + weeklyAllowance;
    const monthlyTotal = weeklyTotal * 4.345;
    return {
      eligible: true,
      weeklyAllowance,
      weeklyBaseline,
      weeklyTotal,
      monthlyTotal,
      allowanceHours,
    };
  }, [hourlyWage, weeklyHours]);

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 주휴수당 즉시 계산
        </h2>

        {/* 시급 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            시급 (원)
          </label>
          <input
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={10}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="시급 (원)"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {[10320, 12000, 15000, 20000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setHourlyWage(v)}
                className="px-3 py-1 text-xs rounded-lg bg-canvas-100 dark:bg-canvas-800 text-muted-blue dark:text-canvas-300 hover:bg-electric-10 hover:text-electric transition-colors"
              >
                {v.toLocaleString("ko-KR")}원
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-faint-blue">
            2026년 최저시급: 10,320원 (2025년 대비 2.9% 인상)
          </p>
        </div>

        {/* 주 근무시간 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            1주 소정근로시간: {weeklyHours}시간
          </label>
          <input
            type="range"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            min={1}
            max={60}
            step={1}
            className="w-full"
            aria-label="1주 소정근로시간"
          />
          <div className="flex justify-between text-xs text-faint-blue mt-1">
            <span>1시간</span>
            <span className={weeklyHours >= 15 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
              15시간 (최소)
            </span>
            <span>40시간 (풀타임)</span>
            <span>60시간</span>
          </div>
        </div>

        {/* 결과 */}
        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          {result.eligible ? (
            <>
              <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
                주휴수당 (1주)
              </p>
              <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
                {fmt(result.weeklyAllowance)}원
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300 mb-4">
                = 시급 {fmt(hourlyWage)}원 × {result.allowanceHours.toFixed(1)}시간 (주 {weeklyHours}시간 ÷ 40 × 8)
              </p>
              <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>주급 (기본)</span>
                  <span>{fmt(result.weeklyBaseline)}원</span>
                </div>
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>주휴수당</span>
                  <span>+{fmt(result.weeklyAllowance)}원</span>
                </div>
                <div className="flex justify-between text-navy dark:text-canvas-50 font-bold pt-2 border-t border-electric-20 mt-2">
                  <span>주급 총액</span>
                  <span>{fmt(result.weeklyTotal)}원</span>
                </div>
                <div className="flex justify-between text-electric font-black pt-2">
                  <span>월 환산 (×4.345주)</span>
                  <span>{fmt(result.monthlyTotal)}원</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                주휴수당 대상 아님
              </p>
              <p className="text-2xl font-black text-rose-600 mb-3">
                0원
              </p>
              <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                1주 소정근로시간이 15시간 미만(초단시간 근로자)이라 근로기준법상 주휴수당 대상이
                아닙니다. 주 15시간 이상 근무 약정으로 계약을 변경하면 주휴수당을 받을 수 있습니다.
              </p>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 주휴수당은 1주 소정근로시간 15시간 이상이면서 약속된 근무일을 모두 출근(개근)했을 때만
          지급됩니다. 결근이 있으면 그 주의 주휴수당이 발생하지 않습니다. 본 계산기는 근로기준법
          제55조 기준 추정치이며 실제 지급액은 회사와의 계약 조건에 따라 다를 수 있습니다.
        </p>
      </div>
    </section>
  );
}
