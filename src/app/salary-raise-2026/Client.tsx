"use client";

import { useState, useMemo } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";

// 간이세액표 기반 누진세
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

function empDeduction(total: number): number {
  if (total <= 5_000_000) return total * 0.7;
  if (total <= 15_000_000) return 3_500_000 + (total - 5_000_000) * 0.4;
  if (total <= 45_000_000) return 7_500_000 + (total - 15_000_000) * 0.15;
  if (total <= 100_000_000) return 12_000_000 + (total - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (total - 100_000_000) * 0.02, 20_000_000);
}

function calcTax(taxable: number): number {
  if (taxable <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.limit)
      return Math.max(0, Math.round(taxable * b.rate - b.deduction));
  }
  return 0;
}

// 연봉 → 연 실수령액 추정 (4대보험 + 누진세 + 세액공제 약 20% 가정)
function calcAnnualNet(salary: number): number {
  if (salary <= 0) return 0;
  const basicDeduct = 1_500_000;
  const empDed = empDeduction(salary);
  const taxable = Math.max(0, salary - empDed - basicDeduct);
  const incomeTax = calcTax(taxable) * 0.8; // 세액공제 20% 가정
  const localTax = incomeTax * 0.1;

  // 4대보험 (본인 부담)
  const pensionCap = 79_080_000; // 국민연금 기준소득월액 상한 월 659만원 (2026.7~2027.6)
  const pension = Math.min(salary, pensionCap) * 0.0475;
  const health = salary * 0.03595;
  const ltc = health * 0.1314;
  const employment = salary * 0.009;
  const insurance = pension + health + ltc + employment;

  return salary - incomeTax - localTax - insurance;
}

function formatInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}
function fmtManwon(n: number) {
  return Math.round(n / 10000).toLocaleString("ko-KR");
}

export default function SalaryRaiseClient() {
  const [currentFmt, setCurrentFmt] = useState("50,000,000");
  const [raisePct, setRaisePct] = useState(10);

  const current = parseInput(currentFmt);
  const newSalary = current * (1 + raisePct / 100);

  const r = useMemo(() => {
    const currentNet = calcAnnualNet(current);
    const newNet = calcAnnualNet(newSalary);
    const grossDiff = newSalary - current;
    const netDiff = newNet - currentNet;
    const grossKept = grossDiff > 0 ? (netDiff / grossDiff) * 100 : 0;

    // 5년 누적 차이 (단순 동일 인상률 유지 가정)
    let cum5Gross = 0;
    let cum5Net = 0;
    let salG = current;
    let salN = current;
    for (let i = 0; i < 5; i++) {
      salG = salG * (1 + raisePct / 100);
      salN = salN * (1 + raisePct / 100);
      cum5Gross += salG - current;
      cum5Net += calcAnnualNet(salG) - calcAnnualNet(current);
    }

    return {
      currentNet,
      newNet,
      grossDiff,
      netDiff,
      grossKept,
      monthlyCurrentNet: currentNet / 12,
      monthlyNewNet: newNet / 12,
      monthlyDiff: (newNet - currentNet) / 12,
      cum5Net,
    };
  }, [current, newSalary, raisePct]);

  return (
    <div className="space-y-4 mb-10">
      {/* 입력 카드 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5">
          입력
        </p>

        <div className="mb-5">
          <label
            htmlFor="current-salary"
            className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
          >
            현재 연봉 (세전)
          </label>
          <div className="relative">
            <input
              id="current-salary"
              type="text"
              inputMode="numeric"
              value={currentFmt}
              onChange={(e) => setCurrentFmt(formatInput(e.target.value))}
              className="w-full rounded-xl px-4 py-3 text-2xl font-black focus:outline-none transition pr-12 text-electric tabular-nums"
              style={{
                backgroundColor: "#0145F208",
                border: "2px solid #0145F2",
              }}
              placeholder="50,000,000"
              aria-label="현재 연봉"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              원
            </span>
          </div>
          <div
            className="flex flex-wrap gap-1.5 mt-2"
            role="group"
            aria-label="연봉 빠른선택"
          >
            {[35_000_000, 50_000_000, 70_000_000, 100_000_000, 140_000_000].map(
              (v) => {
                const active = current === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCurrentFmt(v.toLocaleString("ko-KR"))}
                    aria-pressed={active}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                      active
                        ? "bg-electric text-white"
                        : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white"
                    }`}
                  >
                    {(v / 10000).toLocaleString("ko-KR")}만
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between mb-2">
            <label
              htmlFor="raise-pct"
              className="text-xs font-bold uppercase tracking-widest text-faint-blue"
            >
              인상률 (%)
            </label>
            <span
              className="text-3xl font-black tabular-nums"
              style={{ color: "#0145F2" }}
            >
              {raisePct}%
            </span>
          </div>
          <input
            id="raise-pct"
            type="range"
            min={1}
            max={50}
            step={1}
            value={raisePct}
            onChange={(e) => setRaisePct(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #0145F2 0%, #0145F2 ${
                ((raisePct - 1) / 49) * 100
              }%, #DDE4EC ${((raisePct - 1) / 49) * 100}%, #DDE4EC 100%)`,
              accentColor: "#0145F2",
            }}
            aria-label="인상률"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[3, 5, 10, 15, 20, 30].map((v) => {
              const active = raisePct === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRaisePct(v)}
                  aria-pressed={active}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    active
                      ? "bg-electric text-white"
                      : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white"
                  }`}
                >
                  +{v}%
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-faint-blue mt-2 leading-relaxed">
            업계 평균 연 임금협상은 3~6%, 우수 평가/승진 시 7~12%, 이직 시 보통
            10~20%. 30%+는 시니어 핵심인재 이직·역할 변경 시.
          </p>
        </div>
      </div>

      {/* 메인 결과 */}
      <div
        className="rounded-3xl p-6 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0145F2 0%, #0D5BFF 60%, #2563EB 100%)",
          boxShadow: "0 16px 48px #0145F235",
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(#fff, transparent 70%)" }}
          aria-hidden
        />
        <p
          className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 inline-flex items-center gap-2"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          <TrendingUp size={12} aria-hidden /> 인상 후 세후 연봉
        </p>
        <p
          className="text-5xl sm:text-6xl font-black mb-3 tracking-tight tabular-nums"
          style={{ letterSpacing: "-0.04em" }}
        >
          {fmtManwon(r.newNet)}
          <span className="text-2xl ml-1 opacity-80">만원</span>
        </p>
        <div
          className="text-sm tabular-nums"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          세전 {fmtManwon(newSalary)}만원 · 월 실수령 약{" "}
          {fmtManwon(r.monthlyNewNet)}만원
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20">
          <Mini
            label="월 실수령 +"
            value={`+${fmtManwon(r.monthlyDiff)}만`}
          />
          <Mini
            label="세후 연 +"
            value={`+${fmtManwon(r.netDiff)}만`}
          />
          <Mini
            label="실수령 유지율"
            value={`${r.grossKept.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* 인상 전/후 비교 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CompareCard
          label="현재"
          gross={current}
          net={r.currentNet}
          monthly={r.monthlyCurrentNet}
          tint="#A8B9D6"
        />
        <CompareCard
          label="인상 후"
          gross={newSalary}
          net={r.newNet}
          monthly={r.monthlyNewNet}
          tint="#0145F2"
          highlight
        />
      </div>

      {/* 5년 누적 효과 */}
      <div
        className="rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(90deg, #10B98108 0%, #34D39908 100%)",
          border: "1px solid #10B98133",
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          style={{ color: "#10B981" }}
        >
          5년 누적 세후 차이
        </p>
        <p className="text-3xl sm:text-4xl font-black tabular-nums text-navy dark:text-canvas-50">
          +{fmtManwon(r.cum5Net)}만원
        </p>
        <p className="text-xs text-muted-blue mt-1 leading-relaxed">
          이번 인상률 +{raisePct}%가 매년 동일하게 유지된다고 가정한 5년간
          누적 세후 추가 수령액입니다. 이 차이는 자산 형성·주택 마련에 결정적인
          영향을 줍니다.
        </p>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        {label}
      </p>
      <p className="text-lg font-black tabular-nums">{value}</p>
    </div>
  );
}

function CompareCard({
  label,
  gross,
  net,
  monthly,
  tint,
  highlight = false,
}: {
  label: string;
  gross: number;
  net: number;
  monthly: number;
  tint: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: highlight ? `${tint}10` : "#fff",
        border: `1.5px solid ${tint}${highlight ? "55" : "33"}`,
      }}
    >
      <p
        className="text-xs font-black uppercase tracking-widest mb-3 inline-flex items-center gap-1.5"
        style={{ color: tint }}
      >
        {highlight && <ArrowRight size={11} aria-hidden />}
        {label}
      </p>
      <p className="text-[11px] text-faint-blue mb-1">세전 연봉</p>
      <p className="text-lg font-black text-navy dark:text-canvas-50 tabular-nums mb-2">
        {fmtManwon(gross)}만원
      </p>
      <p className="text-[11px] text-faint-blue mb-1">세후 연 실수령</p>
      <p
        className="text-xl font-black tabular-nums mb-2"
        style={{ color: tint }}
      >
        {fmtManwon(net)}만원
      </p>
      <p className="text-[11px] text-faint-blue mb-1">월 평균</p>
      <p className="text-sm font-bold text-navy dark:text-canvas-50 tabular-nums">
        {fmtManwon(monthly)}만원
      </p>
    </div>
  );
}
