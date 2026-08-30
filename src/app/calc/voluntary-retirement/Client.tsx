"use client";

// /calc/voluntary-retirement — 입력·결과 클라이언트.
// 세액 로직은 전량 src/lib/severanceCalculator.ts calculateSeveranceTax 재사용 (신규 세액 로직 금지).
// 위로금(명예퇴직수당)은 소득세법 제22조에 따라 퇴직소득 — 법정퇴직금과 합산해 한 번에 과세.
// "위로금만의 한계 세부담" = 합산 세액 − 법정퇴직금만의 세액 (동일 정본 함수 2회 호출로 산출).

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import { calculateSeveranceTax } from "@/lib/severanceCalculator";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  return d ? Number(d).toLocaleString("ko-KR") : "";
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

type SevMode = "auto" | "manual";
type CompMode = "months" | "amount";

const AVG_DAYS_PER_MONTH = 365 / 12; // 근속 개월 → 일수 환산 (역산용 근사)

export default function VoluntaryRetirementClient() {
  // 근속
  const [years, setYears] = useState("10");
  const [months, setMonths] = useState("0");
  // 월평균임금 (평균임금 30일분 근사 — 위로금 개월 환산·법정퇴직금 추정 공용)
  const [avgMonthly, setAvgMonthly] = useState("5,000,000");
  // 법정퇴직금: 자동 추정 vs 직접 입력
  const [sevMode, setSevMode] = useState<SevMode>("auto");
  const [manualSev, setManualSev] = useState("50,000,000");
  // 위로금: 월급 × N개월 vs 금액 직접 입력
  const [compMode, setCompMode] = useState<CompMode>("months");
  const [compMonths, setCompMonths] = useState("24");
  const [compAmount, setCompAmount] = useState("120,000,000");

  const r = useMemo(() => {
    const y = Math.max(0, Math.floor(Number(years.replace(/[^0-9]/g, "")) || 0));
    const m = Math.max(0, Math.floor(Number(months.replace(/[^0-9]/g, "")) || 0));
    const totalDays = Math.round(y * 365 + m * AVG_DAYS_PER_MONTH);
    const wage = parseInput(avgMonthly);

    // 법정퇴직금: 평균임금 30일분 × (재직일수/365) 근사 — 정확 산정은 /tools/finance/severance
    const legalSeverance =
      sevMode === "manual" ? parseInput(manualSev) : Math.round(wage * (totalDays / 365));

    const nMonths = Math.max(0, Number(compMonths.replace(/[^0-9.]/g, "")) || 0);
    const comp = compMode === "months" ? Math.round(wage * nMonths) : parseInput(compAmount);

    // 정본 세액 함수 재사용: 합산 1회 + 법정퇴직금 단독 1회 → 차액이 위로금 한계 세부담
    const combined = calculateSeveranceTax(legalSeverance + comp, totalDays);
    const legalOnly = calculateSeveranceTax(legalSeverance, totalDays);
    const combinedTax = combined.incomeTax + combined.localTax;
    const legalOnlyTax = legalOnly.incomeTax + legalOnly.localTax;
    const compMarginalTax = Math.max(0, combinedTax - legalOnlyTax);
    const compMarginalRate = comp > 0 ? (compMarginalTax / comp) * 100 : 0;

    return {
      totalDays,
      underOneYear: totalDays < 365,
      legalSeverance,
      comp,
      gross: legalSeverance + comp,
      combinedTax,
      incomeTax: combined.incomeTax,
      localTax: combined.localTax,
      net: combined.netSeverancePay,
      serviceYearDeduction: combined.details.serviceYearDeduction,
      compMarginalTax,
      compMarginalRate,
      compNet: comp - compMarginalTax,
    };
  }, [years, months, avgMonthly, sevMode, manualSev, compMode, compMonths, compAmount]);

  const toggleBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
      active
        ? "bg-electric text-white"
        : "bg-canvas-100 dark:bg-canvas-800 text-muted-blue dark:text-canvas-300"
    }`;

  const inputCls =
    "w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-12";

  const rows = [
    { label: "법정퇴직금 (세전)", value: `${fmt(r.legalSeverance)}원`, sub: sevMode === "auto" ? "월평균임금 × 근속연수 근사치" : "직접 입력값" },
    { label: "희망퇴직 위로금 (세전)", value: `${fmt(r.comp)}원`, sub: compMode === "months" ? "월평균임금 × 개월 수" : "직접 입력값" },
    { label: "퇴직소득세 합계", value: `−${fmt(r.combinedTax)}원`, sub: `소득세 ${fmt(r.incomeTax)}원 + 지방소득세 ${fmt(r.localTax)}원` },
    { label: "근속연수공제", value: `${fmt(r.serviceYearDeduction)}원`, sub: "소득세법 48조 — 근속이 길수록 커짐" },
    { label: "위로금만의 추가 세부담", value: `−${fmt(r.compMarginalTax)}원`, sub: "합산 세액 − 법정퇴직금만의 세액" },
    { label: "위로금 한계 실효세율", value: `${r.compMarginalRate.toFixed(1)}%`, sub: `위로금 세후 수령분 ${fmt(r.compNet)}원` },
  ];

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-5">
        {/* 근속 + 월평균임금 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="vr-years" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
              근속 연수
            </label>
            <div className="relative">
              <input
                id="vr-years"
                type="text"
                inputMode="numeric"
                value={years}
                placeholder="10"
                onChange={(e) => setYears(e.target.value.replace(/[^0-9]/g, ""))}
                className={inputCls}
                aria-label="근속 연수"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">년</span>
            </div>
          </div>
          <div>
            <label htmlFor="vr-months" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
              추가 개월
            </label>
            <div className="relative">
              <input
                id="vr-months"
                type="text"
                inputMode="numeric"
                value={months}
                placeholder="0"
                onChange={(e) => setMonths(e.target.value.replace(/[^0-9]/g, ""))}
                className={inputCls}
                aria-label="근속 추가 개월"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">개월</span>
            </div>
          </div>
          <div className="col-span-2">
            <label htmlFor="vr-wage" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
              월평균임금 (세전 — 상여 포함 3개월 평균)
            </label>
            <div className="relative">
              <input
                id="vr-wage"
                type="text"
                inputMode="numeric"
                value={avgMonthly}
                placeholder="5,000,000"
                onChange={(e) => setAvgMonthly(formatInput(e.target.value))}
                className={inputCls}
                aria-label="월평균임금"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
            </div>
          </div>
        </div>

        {/* 법정퇴직금 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-tight text-faint-blue">법정퇴직금</span>
            <div className="flex gap-1.5" role="group" aria-label="법정퇴직금 입력 방식">
              <button type="button" onClick={() => setSevMode("auto")} className={toggleBtn(sevMode === "auto")}>
                자동 추정
              </button>
              <button type="button" onClick={() => setSevMode("manual")} className={toggleBtn(sevMode === "manual")}>
                직접 입력
              </button>
            </div>
          </div>
          {sevMode === "manual" ? (
            <div className="relative">
              <input
                id="vr-sev"
                type="text"
                inputMode="numeric"
                value={manualSev}
                placeholder="50,000,000"
                onChange={(e) => setManualSev(formatInput(e.target.value))}
                className={inputCls}
                aria-label="법정퇴직금 직접 입력"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
            </div>
          ) : (
            <p className="text-xs text-faint-blue rounded-xl bg-canvas-50 dark:bg-canvas-800 px-4 py-3">
              월평균임금 × 근속연수로 근사 추정 — 현재{" "}
              <strong className="text-navy dark:text-canvas-50 tabular-nums">{fmt(r.legalSeverance)}원</strong>.
              정확한 평균임금 기준 산정은 퇴직금 상세 도구에서 확인하세요.
            </p>
          )}
        </div>

        {/* 위로금 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-tight text-faint-blue">희망퇴직 위로금</span>
            <div className="flex gap-1.5" role="group" aria-label="위로금 입력 방식">
              <button type="button" onClick={() => setCompMode("months")} className={toggleBtn(compMode === "months")}>
                월급 × N개월
              </button>
              <button type="button" onClick={() => setCompMode("amount")} className={toggleBtn(compMode === "amount")}>
                금액 직접 입력
              </button>
            </div>
          </div>
          {compMode === "months" ? (
            <div className="relative">
              <input
                id="vr-comp-months"
                type="text"
                inputMode="numeric"
                value={compMonths}
                placeholder="24"
                onChange={(e) => setCompMonths(e.target.value.replace(/[^0-9]/g, ""))}
                className={inputCls}
                aria-label="위로금 개월 수"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">개월분</span>
            </div>
          ) : (
            <div className="relative">
              <input
                id="vr-comp-amount"
                type="text"
                inputMode="numeric"
                value={compAmount}
                placeholder="120,000,000"
                onChange={(e) => setCompAmount(formatInput(e.target.value))}
                className={inputCls}
                aria-label="위로금 금액 직접 입력"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
            </div>
          )}
          <p className="mt-2 text-[11px] text-faint-blue">
            위로금 규모(월급 × N개월)는 법정 기준이 없어 회사·직급·근속마다 다릅니다. 회사가 제시한 조건을 그대로 입력하세요.
          </p>
        </div>
      </div>

      {/* 결과 */}
      {r.underOneYear ? (
        <div className="rounded-2xl p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">근속 1년 미만은 계산 대상이 아닙니다</p>
          <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
            근로자퇴직급여보장법상 법정퇴직금은 계속근로 1년 이상부터 발생하며, 본 계산기의 퇴직소득세
            산식도 근속 1년 이상을 전제로 합니다. 근속 연수를 확인해 주세요.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
          <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
              퇴직금 + 위로금 세후 실수령액
            </p>
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
              {fmt(r.net)}원
            </div>
            <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              세전 합계 {fmt(r.gross)}원 − 퇴직소득세 {fmt(r.combinedTax)}원 (합산 과세)
            </p>
          </div>
          <div className="bg-white dark:bg-canvas-900 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-canvas-100 dark:border-canvas-800 pb-2">
                <div>
                  <div className="font-bold text-navy dark:text-canvas-50">{row.label}</div>
                  <div className="text-[11px] text-faint-blue">{row.sub}</div>
                </div>
                <div className="font-black tabular-nums text-electric shrink-0">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결과 직하 광고 */}
      <CalcResultAd />
    </div>
  );
}
