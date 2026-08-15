"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// ────────────────────────────────────────────────────────────
// GS칼텍스 경영성과급 시나리오 (전부 공개 언론 보도 기반 — 수치 창작 없음)
// 지급률은 "기본연봉의 %" 기준. 기본급 % = 연봉 % × 20 환산 (기본급 = 연봉/20).
// ────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: "fy2025",
    label: "2025 실적분 (2026년 초 지급)",
    pctOfSalary: 25,
    voucher: 0,
    desc: "기본연봉의 25% (기본급 500% 환산). 직전 12.5%의 2배 — SBS Biz 2026-02-22 보도.",
  },
  {
    id: "fy2024",
    label: "2024 실적분 (2025-01-24 지급)",
    pctOfSalary: 12.5,
    voucher: 150_000,
    desc: "기본급 250% = 연봉 12.5% + 온누리상품권 15만원 — 디지털타임스 단독 2025-01-21 보도.",
  },
  {
    id: "fy2023",
    label: "2023 실적분 (2024-01-31 지급)",
    pctOfSalary: 40,
    voucher: 0,
    desc: "연봉의 40% = 기본급 800% — 파이낸셜뉴스 2024-02-05 보도.",
  },
  {
    id: "fy2022",
    label: "2022 실적분 (2023-01 지급)",
    pctOfSalary: 50,
    voucher: 0,
    desc: "기본연봉의 50%, 평균 5천만원 수준 — 남도일보 2023-01 보도. 기본급 1,000%+격려금 200% 보도(뉴스저널리즘)도 있어 매체 간 차이 존재.",
  },
] as const;

const DEFAULT_SALARY_MANWON = 10_000; // 1억 (평균 공시 1억 6,575만원보다 보수적 디폴트)
const BASIC_RATIO = 20; // 월 기본급 = 연봉 / 20 → 기본급 % = 연봉 % × 20

export default function GsCaltexBonusClient() {
  const [scenarioId, setScenarioId] =
    useState<(typeof SCENARIOS)[number]["id"]>("fy2025");
  const [salaryManwon, setSalaryManwon] = useState(DEFAULT_SALARY_MANWON);

  const [customMode, setCustomMode] = useState(false);
  const [pctOverride, setPctOverride] = useState(25);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const annualWon = salaryManwon * 10_000;
    const monthlyBasicWon = annualWon / BASIC_RATIO;

    const pct = customMode ? pctOverride : scenario.pctOfSalary;
    const bonusWon = annualWon * (pct / 100);
    const voucherWon = customMode ? 0 : scenario.voucher;
    const totalGross = bonusWon + voucherWon;

    const tax = calcBonusNet(annualWon, totalGross, creditRate, applyInsurance);

    return {
      annualWon,
      monthlyBasicWon,
      pct,
      basicPctEquiv: pct * BASIC_RATIO, // 연봉 % → 기본급 % 환산
      bonusWon,
      voucherWon,
      totalGross,
      tax,
      bonusToSalaryRatio: annualWon > 0 ? (totalGross / annualWon) * 100 : 0,
    };
  }, [scenarioId, salaryManwon, customMode, pctOverride, creditRate, applyInsurance, scenario]);

  return (
    <div className="space-y-6">
      {/* 1. 시나리오 선택 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 지급 연도 시나리오 선택</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setScenarioId(s.id);
                setCustomMode(false);
              }}
              className={`p-4 rounded-xl border-2 text-left transition ${
                scenarioId === s.id && !customMode
                  ? "border-primary bg-primary/10"
                  : "border-canvas-deep hover:border-primary/40"
              }`}
            >
              <div className="font-bold text-sm">{s.label}</div>
              <div className="text-lg font-black text-primary mt-0.5">
                연봉의 {s.pctOfSalary}%
              </div>
              <div className="text-xs text-faint mt-1 leading-relaxed">{s.desc}</div>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCustomMode(!customMode)}
          className={`mt-3 w-full p-3 rounded-xl border-2 text-sm font-bold transition ${
            customMode ? "border-primary bg-primary/10" : "border-canvas-deep hover:border-primary/40"
          }`}
        >
          🎛️ 직접 입력 (커스텀 지급률)
        </button>
        {customMode && (
          <div className="mt-3 space-y-2 p-4 rounded-xl bg-canvas/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-faint w-32">기본연봉 대비 %</span>
              <input
                type="number"
                value={pctOverride}
                onChange={(e) => setPctOverride(Number(e.target.value) || 0)}
                step="2.5"
                min="0"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </div>
            <p className="text-xs text-faint">
              기본급 % 환산 = <strong>{(pctOverride * BASIC_RATIO).toLocaleString("ko-KR")}%</strong>{" "}
              (기본급 % = 연봉 % × 20)
            </p>
          </div>
        )}
      </section>

      {/* 2. 본인 기본연봉 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">2단계 · 본인 기본연봉</h2>
        <label className="block">
          <span className="text-sm font-bold">연 기본연봉 (만원)</span>
          <input
            type="number"
            value={salaryManwon}
            onChange={(e) => setSalaryManwon(Number(e.target.value) || 0)}
            step="100"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[7000, 10000, 13000, 16000, 20000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSalaryManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {(m / 10000).toFixed(1).replace(/\.0$/, "")}억
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-faint leading-relaxed">
          월 기본급 환산 = 연봉 ÷ 20 ={" "}
          <strong className="text-primary">{fmtManwon(calc.monthlyBasicWon)}</strong>.
          참고: GS칼텍스 평균 연봉은 2023년 사업보고서 기준{" "}
          <strong>1억 6,575만원</strong> (디지털타임스 2025-03-19 보도).
        </p>
      </section>

      {/* 3. 세금 가정 (고급) */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 font-bold text-base"
        >
          <Settings className="w-4 h-4" />
          세금 계산 가정 조정 {showAdvanced ? "▲" : "▼"}
        </button>
        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                세액공제율: <span className="text-primary">{creditRate}%</span>
                <span className="text-xs text-faint ml-2 font-normal">
                  (자녀·연금·의료비·기부 등 반영)
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={creditRate}
                onChange={(e) => setCreditRate(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={applyInsurance}
                onChange={(e) => setApplyInsurance(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="font-bold">4대보험 추가 부과 적용</span>
              <span className="text-xs text-faint">
                (국민연금은 보수월액 상한 적용)
              </span>
            </label>
          </div>
        )}
      </section>

      {/* 4. 결과 */}
      <section className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          내 성과급 계산 결과
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard
            label="경영성과급"
            value={fmtEok(calc.bonusWon)}
            sub={`= 기본연봉 ${fmtEok(calc.annualWon)} × ${calc.pct}% (기본급 ${calc.basicPctEquiv.toLocaleString("ko-KR")}% 환산)`}
          />
          <ResultCard
            label="온누리상품권"
            value={fmtManwon(calc.voucherWon)}
            sub={
              calc.voucherWon > 0
                ? "2025-01 지급 시 15만원 (디지털타임스 보도)"
                : "해당 시나리오는 상품권 지급 보도 없음"
            }
          />
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 총 성과급 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            기본연봉 대비 <strong>{calc.bonusToSalaryRatio.toFixed(1)}%</strong>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">💰 세후 실수령</p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">
            {fmtEok(calc.tax.net)}
          </p>
          <p className="text-xs text-faint mt-1">
            세전 {fmtEok(calc.totalGross)} − 공제 {fmtEok(calc.tax.totalDeductions)}{" "}
            (실효세율 <strong>{calc.tax.effectiveRate}%</strong>)
          </p>
        </div>

        <details className="mt-4 text-xs">
          <summary className="cursor-pointer font-bold text-faint">
            🧾 세금 상세 공제 내역
          </summary>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <DeductItem label="소득세" value={fmtManwon(calc.tax.incomeTaxDelta)} />
            <DeductItem label="지방세" value={fmtManwon(calc.tax.localTaxDelta)} />
            <DeductItem label="국민연금" value={fmtManwon(calc.tax.pensionDelta)} />
            <DeductItem label="건강+요양" value={fmtManwon(calc.tax.healthDelta)} />
            <DeductItem label="고용보험" value={fmtManwon(calc.tax.empInsDelta)} />
          </div>
        </details>
      </section>
    </div>
  );
}

function ResultCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white border border-canvas-deep p-4">
      <p className="text-[10px] font-bold text-faint uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] text-faint mt-1 leading-relaxed">{sub}</p>
    </div>
  );
}

function DeductItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 rounded bg-canvas/40">
      <p className="text-[10px] text-faint font-bold">{label}</p>
      <p className="font-bold tabular-nums">{value}</p>
    </div>
  );
}
