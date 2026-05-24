"use client";

import { useMemo, useState } from "react";
import { Settings, Lock, Coins } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

const SCENARIOS = [
  { id: "chasm", label: "캐즘 (0%)", percent: 0, hint: "2026 배터리·본사" },
  { id: "electromat", label: "전자재료 (5%)", percent: 5, hint: "2026 폴더블 OLED" },
  { id: "recovery", label: "회복기 (18%)", percent: 18, hint: "2024 전자재료" },
  { id: "normal", label: "평년 (28%)", percent: 28, hint: "2024 본사" },
  { id: "boom", label: "호황 (48%)", percent: 48, hint: "전기차 슈퍼사이클" },
] as const;

const DEFAULT_SALARY_MANWON = 8000;
const BASIC_RATIO = 20; // 기본급 = 연봉 / 20
const TAI_HALF = 1.0; // 반기당 월 기본급 100%
const TAI_PER_YEAR = 2; // 연 2회

export default function SamsungSdiBonusClient() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIOS)[number]["id"]>("chasm");
  const [salaryManwon, setSalaryManwon] = useState(DEFAULT_SALARY_MANWON);
  const [includeTai, setIncludeTai] = useState(true);
  const [customMode, setCustomMode] = useState(false);
  const [customOpiPercent, setCustomOpiPercent] = useState(28);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const salaryWon = salaryManwon * 10_000;
    const monthlyBasicWon = salaryWon / BASIC_RATIO;
    const opiPct = customMode ? customOpiPercent : scenario.percent;

    // OPI: 연봉 × 사업부 %
    const opiWon = salaryWon * (opiPct / 100);
    // TAI: 월 기본급 × 100% × 2회 (사업부 영향 받지 않는 안정 항목)
    const taiWon = includeTai ? monthlyBasicWon * TAI_HALF * TAI_PER_YEAR : 0;
    const totalGross = opiWon + taiWon;

    const tax = calcBonusNet(salaryWon, totalGross, creditRate, applyInsurance);

    return {
      monthlyBasicWon,
      opiWon,
      taiWon,
      totalGross,
      tax,
      bonusToSalaryRatio: salaryWon > 0 ? (totalGross / salaryWon) * 100 : 0,
    };
  }, [scenarioId, salaryManwon, includeTai, customMode, customOpiPercent, creditRate, applyInsurance, scenario]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 사업부 OPI 시나리오</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setScenarioId(s.id); setCustomMode(false); }}
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
          🎛️ 직접 OPI % 입력
        </button>
        {customMode && (
          <div className="mt-3 p-4 rounded-xl bg-canvas/30 flex items-center gap-2">
            <span className="text-sm font-bold w-32">OPI (연봉 대비)</span>
            <input
              type="number"
              value={customOpiPercent}
              onChange={(e) => setCustomOpiPercent(Number(e.target.value) || 0)}
              step="1" min="0" max="50"
              className="flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold"
            />
            <span className="text-sm font-bold">%</span>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">2단계 · 본인 연봉</h2>
        <label className="block">
          <span className="text-sm font-bold">연 기본 연봉 (만원)</span>
          <input
            type="number"
            value={salaryManwon}
            onChange={(e) => setSalaryManwon(Number(e.target.value) || 0)}
            step="100" min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[5500, 7000, 9000, 12000, 15000].map((m) => (
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
        <p className="mt-2 text-xs text-faint">기본급(TAI 기준) = 연봉 ÷ 20 = <strong>{fmtManwon(calc.monthlyBasicWon)}</strong></p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          3단계 · TAI (목표달성장려금)
        </h2>
        <label className="flex items-center gap-3 p-4 rounded-xl border border-canvas-deep cursor-pointer hover:bg-canvas/30">
          <input
            type="checkbox"
            checked={includeTai}
            onChange={(e) => setIncludeTai(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
          <div>
            <p className="font-bold">TAI 포함 (월 기본급 100% × 연 2회)</p>
            <p className="text-xs text-faint mt-0.5">
              회사 적자 시 TAI도 감소 가능. 포함 시 {fmtManwon(calc.monthlyBasicWon * 2)} 추가.
            </p>
          </div>
        </label>
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
              <input type="range" min={0} max={50} step={5} value={creditRate}
                onChange={(e) => setCreditRate(Number(e.target.value))}
                className="w-full accent-primary" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={applyInsurance}
                onChange={(e) => setApplyInsurance(e.target.checked)}
                className="w-4 h-4 accent-primary" />
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
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard label="OPI" value={fmtManwon(calc.opiWon)} sub={`연봉 × ${customMode ? customOpiPercent : scenario.percent}%`} />
          <ResultCard label="TAI" value={fmtManwon(calc.taiWon)} sub={includeTai ? "월 기본 × 100% × 2회" : "포함 안 함"} />
        </div>
        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 OPI + TAI (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">{fmtEok(calc.totalGross)}</p>
          <p className="text-xs text-faint mt-1">
            본인 연봉 대비 <strong>{calc.bonusToSalaryRatio.toFixed(0)}%</strong>
          </p>
        </div>
        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">💰 세후 실수령</p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">{fmtEok(calc.tax.net)}</p>
          <p className="text-xs text-faint mt-1">
            세전 {fmtEok(calc.totalGross)} − 공제 {fmtEok(calc.tax.totalDeductions)}{" "}
            (실효세율 <strong>{calc.tax.effectiveRate}%</strong>)
          </p>
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

function ResultCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white border border-canvas-deep p-4">
      <p className="text-[10px] font-bold text-faint uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] text-faint mt-1">{sub}</p>
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
