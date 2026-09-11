"use client";

import { useMemo, useState } from "react";
import NumberInput from "@/components/NumberInput";
import { MINIMUM_WAGE_2026, MONTHLY_HOURS } from "@/config/minimumWage";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function WeeklyHolidayAllowanceClient() {
  const [hourlyWage, setHourlyWage] = useState(MINIMUM_WAGE_2026.hourly);
  const [weeklyHours, setWeeklyHours] = useState(40);

  // 월 환산 = 주급 × 209 ÷ 48 — 정본 MONTHLY_HOURS 기준(주 48시간 유급 = 209시간),
  // 최저임금 월 환산액·/calc/hourly-to-yearly 와 같은 잣대 (2026-09-12 SI-04).
  const result = useMemo(() => {
    if (weeklyHours < 15) {
      return {
        eligible: false,
        weeklyAllowance: 0,
        weeklyBaseline: hourlyWage * weeklyHours,
        weeklyTotal: hourlyWage * weeklyHours,
        monthlyTotal: (hourlyWage * weeklyHours * MONTHLY_HOURS) / 48,
        allowanceHours: 0,
      };
    }
    const allowanceHours = Math.min(8, (Math.min(weeklyHours, 40) / 40) * 8);
    const weeklyAllowance = hourlyWage * allowanceHours;
    const weeklyBaseline = hourlyWage * weeklyHours;
    const weeklyTotal = weeklyBaseline + weeklyAllowance;
    const monthlyTotal = (weeklyTotal * MONTHLY_HOURS) / 48;
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
          내 주휴수당 조건부 계산
        </h2>
        <p className="mb-5 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
          통상근로자가 주 5일·40시간 근무하는 사업장의 비례 계산입니다. 시급이 일정하고,
          해당 주의 소정근로일 개근과 1주간 근로관계 유지 요건을 충족했다고 가정합니다.
        </p>

        {/* 시급 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            시급 (원)
          </label>
          <NumberInput
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={10}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="시급 (원)"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {[MINIMUM_WAGE_2026.hourly, 12000, 15000, 20000].map((v) => (
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
            4주 평균 1주 소정근로시간: {weeklyHours}시간
          </label>
          <input
            type="range"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            min={1}
            max={40}
            step={0.25}
            className="w-full"
            aria-label="4주 평균 1주 소정근로시간"
            aria-describedby="weekly-hours-help"
          />
          <div className="flex justify-between text-xs text-faint-blue mt-1">
            <span>1시간</span>
            <span className={weeklyHours >= 15 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
              15시간 (최소)
            </span>
            <span>40시간 (풀타임)</span>
          </div>
          <p id="weekly-hours-help" className="mt-3 text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
            매주 약정 시간이 같으면 그 시간을 넣으세요. 주마다 다르면 산정 기준이 되는 4주의
            소정근로시간 합계를 4로 나눈 값을 사용합니다. 근로기간이 4주 미만이면 그 기간을
            평균합니다. 휴게시간·일시적인 대타·연장근로를 실제 근무시간이라는 이유로 더하지 마세요.
            이 계산기는 변동 근로의 각 주별 지급 요건과 금액을 자동 판정하지 않습니다.
          </p>
        </div>

        {/* 결과 */}
        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          {result.eligible ? (
            <>
              <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
                요건 충족 시 주휴수당 (1주)
              </p>
              <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
                {fmt(result.weeklyAllowance)}원
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300 mb-4">
                = 시급 {fmt(hourlyWage)}원 × {result.allowanceHours.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}시간
                {weeklyHours > 40
                  ? " (소정근로 40시간 상한 적용 — 초과분은 연장근로라 주휴수당에 산입되지 않습니다)"
                  : ` (4주 평균 주 ${weeklyHours}시간 ÷ 40 × 8)`}
              </p>
              <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>주 기본급 단순 환산</span>
                  <span>{fmt(result.weeklyBaseline)}원</span>
                </div>
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>주휴수당</span>
                  <span>+{fmt(result.weeklyAllowance)}원</span>
                </div>
                <div className="flex justify-between text-navy dark:text-canvas-50 font-bold pt-2 border-t border-electric-20 mt-2">
                  <span>주급 단순 환산</span>
                  <span>{fmt(result.weeklyTotal)}원</span>
                </div>
                <div className="flex justify-between text-electric font-black pt-2">
                  <span>월 단순 환산 (209시간 기준 ≈ ×4.354주)</span>
                  <span>{fmt(result.monthlyTotal)}원</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                입력 평균시간이 법정 기준 미만
              </p>
              <p className="text-2xl font-black text-rose-600 mb-3">
                0원
              </p>
              <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                4주 평균(4주 미만 근로 시 해당 기간 평균) 1주 소정근로시간이 15시간 미만이면
                법정 주휴일 규정 적용 대상에서 제외됩니다. 별도의 유급휴일 지급 약정이 있는지는
                근로계약·취업규칙에서 확인하세요.
              </p>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          주급·월 금액은 입력한 평균시간으로 매주 동일하게 근무한다고 본 세전 단순 환산액입니다.
          실제 변동 근로의 임금, 연장·야간·휴일 가산수당과 월 최저임금의 209시간 환산을 대신하지
          않습니다. 개근·휴가·휴업·입퇴사에 따른 주별 조건과 사업장의 통상근로일수가 다르면
          별도로 확인해야 합니다.
        </p>
      </div>
    </section>
  );
}
