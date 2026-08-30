"use client";

// 장병내일준비적금 간이 계산 — /military-pay-2026 내장 (라우트 아님).
// 매칭 구조: 납입 원금의 100% 정부 매칭(2024년 이후 납입분, 전역 시 일괄).
// 은행 이자는 은행·시점별 상이라 계산에서 제외하고 문구로만 안내 (추정 금지).

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import { MILITARY_SAVINGS_2026 } from "@/lib/civilServantPay";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function SavingsCalc() {
  const [months, setMonths] = useState("18");
  const [monthly, setMonthly] = useState("550,000");

  const m = Math.min(24, Math.max(0, Number(months.replace(/[^0-9]/g, "")) || 0));
  const payRaw = Number(monthly.replace(/[^0-9]/g, "")) || 0;
  const pay = Math.min(MILITARY_SAVINGS_2026.monthlyCap, payRaw);

  const r = useMemo(() => {
    const principal = pay * m;
    const match = principal * MILITARY_SAVINGS_2026.matchRate;
    return { principal, match, total: principal + match };
  }, [pay, m]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white border border-canvas-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ms-months" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
            납입 개월 수 (육군 18개월 기준)
          </label>
          <div className="relative">
            <input
              id="ms-months"
              type="text"
              inputMode="numeric"
              value={months}
              onChange={(e) => setMonths(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded-xl px-4 py-4 text-xl font-black bg-canvas-50 border border-canvas-200 text-navy focus:outline-none focus:ring-2 focus:ring-electric/50 pr-12"
              aria-label="납입 개월 수"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">개월</span>
          </div>
        </div>
        <div>
          <label htmlFor="ms-monthly" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
            월 납입액 (한도 {fmt(MILITARY_SAVINGS_2026.monthlyCap)}원)
          </label>
          <div className="relative">
            <input
              id="ms-monthly"
              type="text"
              inputMode="numeric"
              value={monthly}
              onChange={(e) => {
                const d = e.target.value.replace(/[^0-9]/g, "");
                setMonthly(d ? Number(d).toLocaleString("ko-KR") : "");
              }}
              className="w-full rounded-xl px-4 py-4 text-xl font-black focus:outline-none transition pr-9"
              style={{ backgroundColor: "#0145F208", border: "2px solid #0145F2", color: "#0145F2" }}
              aria-label="월 납입액"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-electric">원</span>
          </div>
          {payRaw > MILITARY_SAVINGS_2026.monthlyCap && (
            <p className="mt-1 text-[11px] font-bold text-electric">한도 55만원으로 계산합니다 (은행별 30만원 → 2개 은행 분산 필요).</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-8 py-7 text-center" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
            전역 시 예상 수령액 (원금 + 정부 매칭, 이자 별도)
          </p>
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {fmt(r.total)}원
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            원금 {fmt(r.principal)}원 + 매칭 지원금 {fmt(r.match)}원 (납입액의 100%)
          </p>
        </div>
        <div className="bg-white px-6 py-3">
          <p className="text-[11px] leading-5 text-muted-blue">
            은행 이자(기본+우대 금리)는 은행·가입 시점에 따라 달라 별도로 더해집니다. 매칭
            지원금은 월급이 아니라 <strong className="text-navy">전역 시 일괄 수령</strong>하며,
            비과세 혜택은 2026-12-31 가입분까지입니다. 기준일 2026-08-30.
          </p>
        </div>
      </div>

      {/* 결과 직하 광고 */}
      <CalcResultAd />
    </div>
  );
}
