"use client";

// 국민연금 인상(2026 9.5%→2027 10.0%) 월급 영향 계산 — 검증값 2026-08-30:
// 근로자 부담 2026년 4.75% → 2027년 5.0% (연금개혁법 법정 스케줄, 매년 +0.25%p,
// 2033년 총 13% 도달). 기준소득월액 상한 659만·하한 41만 (2026-07~2027-06 적용,
// 2027-07 재조정 예정 — 조정폭 미정).

import { useState } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "@/lib/taxConstants2026";
import { INSURANCE_RATES_2027 } from "@/lib/taxConstants2027";
import NumberInput from "@/components/NumberInput";
import { calculatePensionHike } from "@/lib/pensionHike";
import { pctLabel } from "@/config/currentRates";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";

// 2026 요율·상하한은 정본(taxConstants2026)에서 가져온다 — verify:tax 게이트(정본 밖 리터럴 금지).
// 2026-08-30 신설 이후 리터럴 하드코딩으로 CI verify:tax 가 매 푸시 실패하던 원인(2026-09-05 수정).
const RATE_2026 = INSURANCE_RATES_2026.NATIONAL_PENSION;
const RATE_2027 = INSURANCE_RATES_2027.NATIONAL_PENSION; // 2027-01-01 법정 스케줄(연금개혁법) — 2027 정본(2026-09-25 N3 신설)
const BASE_CAP = PENSION_BASE_2026.MAX_MONTHLY; // 기준소득월액 상한 (2026-07~2027-06)
const BASE_FLOOR = PENSION_BASE_2026.MIN_MONTHLY; // 하한

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function PensionHikeClient() {
  const [salaryFmt, setSalaryFmt] = useState("3,500,000");

  const r = calculatePensionHike(salaryFmt);
  const measurement = useCalculatorMeasurement({ calcType: "pension-hike-2027", valid: r !== null, resultKey: salaryFmt });

  return (
    <div className="space-y-5 mb-10">
      <div {...measurement.inputProps} className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <label htmlFor="ph-salary" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
          월급 (세전, 월 소득)
        </label>
        <div className="relative max-w-md">
          <NumberInput
            id="ph-salary"
            type="text"
            inputMode="numeric"
            value={salaryFmt}
            onChange={(e) => setSalaryFmt(e.target.value)}
            maxLength={15}
            aria-invalid={!r}
            aria-describedby="ph-input-help"
            className="w-full rounded-xl px-4 py-4 text-2xl font-black focus:outline-none transition pr-9"
            style={{ backgroundColor: "hsl(var(--accent))", border: "2px solid #0145F2", color: "hsl(var(--link))" }}
            aria-label="월급"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-electric">원</span>
        </div>
        <p id="ph-input-help" className="mt-2 text-[11px] font-bold text-electric">
          {!r ? "0보다 큰 월 소득을 입력해 주세요." : r.capped
            ? `상한 ${fmt(BASE_CAP)}원 적용 · 2027년 7월 이후 기준은 미반영`
            : r.floored ? `하한 ${fmt(BASE_FLOOR)}원 적용 · 실제 가입·납부 대상 여부를 확인해 주세요.`
            : `기준소득월액 ${fmt(r.base)}원 · 천 원 미만 절사`}
        </p>
      </div>

      <div ref={measurement.resultRef} role="region" aria-label="국민연금 보험료 계산 결과" className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
            2027년 1월부터 매달 더 내는 연금보험료
          </p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {r ? `+${fmt(r.diffMonthly)}원` : "입력 대기"}
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            {r ? `같은 조건을 12개월 유지하면 +${fmt(r.annualizedDifference)}원` : "월 소득을 입력하면 연금보험료 증가분을 계산합니다."}
          </p>
        </div>
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-3">
            <div className="text-xs text-faint-blue mb-0.5">2026년 본인 부담 ({pctLabel(RATE_2026)})</div>
            <div className="font-black tabular-nums text-navy dark:text-canvas-50">{r ? `월 ${fmt(r.p2026)}원` : "—"}</div>
          </div>
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-3">
            <div className="text-xs text-faint-blue mb-0.5">2027년 본인 부담 ({pctLabel(RATE_2027)})</div>
            <div className="font-black tabular-nums text-electric">{r ? `월 ${fmt(r.p2027)}원` : "—"}</div>
          </div>
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-3">
            <div className="text-xs text-faint-blue mb-0.5">회사 부담 합산 총 보험료 ({pctLabel(RATE_2027 * 2)})</div>
            <div className="font-black tabular-nums text-navy dark:text-canvas-50">{r ? `월 ${fmt(r.totalWithEmployer2027)}원` : "—"}</div>
          </div>
        </div>
      </div>

      {/* 결과 직하 광고 */}
      <CalcResultAd />
      <p className="text-xs leading-relaxed text-faint-blue">
        직장가입자의 국민연금 보험료만 비교한 추정치입니다. 소득세·건강보험 등 다른 공제는 계산하지 않아 전체 실수령액 차이와 다를 수 있습니다.
        2026년 7월~2027년 6월 상·하한을 양쪽에 동일하게 적용하며, 12개월 환산액은 2027년 7월 기준 변경을 예측하지 않습니다.
      </p>
    </div>
  );
}
