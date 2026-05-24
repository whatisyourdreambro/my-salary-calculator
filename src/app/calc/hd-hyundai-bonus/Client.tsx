"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// HD현대중공업 시나리오
const SCENARIOS = [
  { id: "average", label: "평년 (400%)", percent: 400, hint: "사이클 평균" },
  { id: "current", label: "2025 연말 (600%)", percent: 600, hint: "통합 HD현대중공업" },
  { id: "samho", label: "HD현대삼호 (837%)", percent: 837, hint: "사업부별 차등" },
  { id: "union", label: "2026 노조 요구 (~1,400%)", percent: 1400, hint: "영업이익 30% 분배" },
] as const;

const DEFAULT_BASIC_MANWON = 450;

export default function HdHyundaiBonusClient() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIOS)[number]["id"]>("current");
  const [monthlyBasicManwon, setMonthlyBasicManwon] = useState(DEFAULT_BASIC_MANWON);
  const [customMode, setCustomMode] = useState(false);
  const [customPercent, setCustomPercent] = useState(500);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const monthlyBasicWon = monthlyBasicManwon * 10_000;
    const estimatedAnnualSalary = monthlyBasicWon * 18; // 조선업도 상여 포함

    const pct = customMode ? customPercent : scenario.percent;
    const bonusWon = monthlyBasicWon * (pct / 100);

    const tax = calcBonusNet(estimatedAnnualSalary, bonusWon, creditRate, applyInsurance);

    return {
      estimatedAnnualSalary,
      bonusWon,
      tax,
      bonusToSalaryRatio: estimatedAnnualSalary > 0 ? (bonusWon / estimatedAnnualSalary) * 100 : 0,
      allScenarios: SCENARIOS.map((s) => ({
        label: s.label,
        gross: monthlyBasicWon * (s.percent / 100),
      })),
    };
  }, [scenarioId, monthlyBasicManwon, customMode, customPercent, creditRate, applyInsurance, scenario]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 시나리오 선택</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setScenarioId(s.id);
                setCustomMode(false);
              }}
              className={`p-3 rounded-xl border-2 text-left transition ${
                scenarioId === s.id && !customMode
                  ? "border-primary bg-primary/10"
                  : "border-canvas-deep hover:border-primary/40"
              }`}
            >
              <div className="font-bold text-sm">{s.label}</div>
              <div className="text-[10px] text-faint mt-0.5">{s.hint}</div>
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
          🎛️ 직접 % 입력
        </button>
        {customMode && (
          <div className="mt-3 p-4 rounded-xl bg-canvas/30 flex items-center gap-2">
            <span className="text-sm font-bold w-32">성과급 (월 기본급 대비)</span>
            <input
              type="number"
              value={customPercent}
              onChange={(e) => setCustomPercent(Number(e.target.value) || 0)}
              step="10"
              min="0"
              max="2000"
              className="flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold"
            />
            <span className="text-sm font-bold">%</span>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">2단계 · 본인 월 기본급</h2>
        <label className="block">
          <span className="text-sm font-bold">월 기본급(통상임금) (만원)</span>
          <input
            type="number"
            value={monthlyBasicManwon}
            onChange={(e) => setMonthlyBasicManwon(Number(e.target.value) || 0)}
            step="10"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[350, 400, 450, 500, 600].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonthlyBasicManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {m}만
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          추정 연봉(기본급 × 18) = <strong>{fmtEok(calc.estimatedAnnualSalary)}</strong>
        </p>
      </section>

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
            </label>
          </div>
        )}
      </section>

      <section className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          내 성과급 계산 결과
        </h2>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">
            📊 세전 성과급 ({customMode ? customPercent : scenario.percent}%)
          </p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.bonusWon)}
          </p>
          <p className="text-xs text-faint mt-1">
            = 월 기본급 {monthlyBasicManwon}만 × {customMode ? customPercent : scenario.percent}% ·
            추정 연봉 대비 <strong>{calc.bonusToSalaryRatio.toFixed(0)}%</strong>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">💰 세후 실수령</p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">{fmtEok(calc.tax.net)}</p>
          <p className="text-xs text-faint mt-1">
            세전 {fmtEok(calc.bonusWon)} − 공제 {fmtEok(calc.tax.totalDeductions)}{" "}
            (실효세율 <strong>{calc.tax.effectiveRate}%</strong>)
          </p>
        </div>

        <div className="mt-5 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-3">
            🔄 본인 기본급 {monthlyBasicManwon}만 기준 — 4개 시나리오 동시 비교 (세전)
          </p>
          <div className="space-y-2">
            {calc.allScenarios.map((s) => {
              const ratio = calc.allScenarios[3].gross > 0 ? (s.gross / calc.allScenarios[3].gross) * 100 : 0;
              return (
                <div key={s.label} className="flex items-center gap-3 text-sm">
                  <span className="w-32 font-bold text-xs">{s.label}</span>
                  <div className="flex-1 h-2 bg-canvas/60 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${ratio}%` }} />
                  </div>
                  <span className="w-24 text-right tabular-nums font-bold">{fmtManwon(s.gross)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <details className="mt-4 text-xs">
          <summary className="cursor-pointer font-bold text-faint">🧾 세금 상세 공제 내역</summary>
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

function DeductItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 rounded bg-canvas/40">
      <p className="text-[10px] text-faint font-bold">{label}</p>
      <p className="font-bold tabular-nums">{value}</p>
    </div>
  );
}
