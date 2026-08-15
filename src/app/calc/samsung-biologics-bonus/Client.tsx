"use client";

import { useMemo, useState } from "react";
import { Settings, Lock, Coins } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// 삼성바이오로직스 OPI 지급 이력 (보도 기준)
// - 2025 실적분: 연봉의 50% 상한 (아시아경제 2025-12-27, 산경투데이·컨슈머타임스 2025-12-26)
// - 2024 실적분: 연봉의 50% 상한 (한국경제 2025-07-08)
const SCENARIOS = [
  {
    id: "2025-cap",
    label: "2025 실적분 · 50% (상한)",
    percent: 50,
    hint: "2026-01 지급 예상 · 아시아경제",
  },
  {
    id: "2024-cap",
    label: "2024 실적분 · 50% (상한)",
    percent: 50,
    hint: "2025-01 지급 · 한국경제",
  },
] as const;

const DEFAULT_SALARY_MANWON = 8000;
const BASIC_RATIO = 20; // 삼성 표준 — TAI 기준 월 기본급 = 연봉 / 20
const TAI_H1_CONFIRMED = 100; // 2025 상반기 TAI 100% 확정 (한국경제 등 2025-07-08)
const TAI_H2_DEFAULT = 100; // 하반기 확정치 보도 미확보 — 기본값 100% 가정 (조정 가능)

export default function SamsungBiologicsBonusClient() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIOS)[number]["id"]>("2025-cap");
  const [salaryManwon, setSalaryManwon] = useState(DEFAULT_SALARY_MANWON);
  const [includeTai, setIncludeTai] = useState(true);
  const [taiH1Percent, setTaiH1Percent] = useState(TAI_H1_CONFIRMED);
  const [taiH2Percent, setTaiH2Percent] = useState(TAI_H2_DEFAULT);
  const [customMode, setCustomMode] = useState(false);
  const [customOpiPercent, setCustomOpiPercent] = useState(50);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const salaryWon = salaryManwon * 10_000;
    const monthlyBasicWon = salaryWon / BASIC_RATIO;
    const opiPct = customMode ? customOpiPercent : scenario.percent;

    // OPI: 연봉 × %
    const opiWon = salaryWon * (opiPct / 100);
    // TAI: 월 기본급 × (상반기 % + 하반기 %)
    const taiWon = includeTai
      ? monthlyBasicWon * ((taiH1Percent + taiH2Percent) / 100)
      : 0;
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
  }, [scenarioId, salaryManwon, includeTai, taiH1Percent, taiH2Percent, customMode, customOpiPercent, creditRate, applyInsurance, scenario]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · OPI 시나리오</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setScenarioId(s.id); setCustomMode(false); }}
              className={`p-4 rounded-xl border-2 text-left transition ${
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
          🎛️ 직접 OPI % 입력 (향후 연도 가정)
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
        <p className="mt-3 text-xs text-faint">
          2024·2025 실적분 모두 상한(연봉의 50%) 도달 — 보도 확인값. 향후 연도는
          미확정이므로 직접 입력으로 가정 비교 가능.
        </p>
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
          {[5000, 7000, 9000, 11400, 15000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSalaryManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {(m / 10000).toFixed(2).replace(/\.?0+$/, "")}억
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          기본급(TAI 기준) = 연봉 ÷ 20 = <strong>{fmtManwon(calc.monthlyBasicWon)}</strong> ·
          2025 사업보고서 평균 보수 1억 1,400만원 (MTN 2026-03-19)
        </p>
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
            <p className="font-bold">TAI 포함 (월 기본급 × 상·하반기 각 최대 100%)</p>
            <p className="text-xs text-faint mt-0.5">
              2025 상반기 100% 확정 (한국경제 등 2025-07-08). 하반기 확정치는
              보도 미확보 — 아래에서 직접 조정.
            </p>
          </div>
        </label>
        {includeTai && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                상반기 TAI: <span className="text-primary">{taiH1Percent}%</span>
                <span className="ml-2 text-[10px] font-normal text-faint">2025년 100% 확정 지급</span>
              </label>
              <input
                type="range" min={0} max={100} step={25}
                value={taiH1Percent}
                onChange={(e) => setTaiH1Percent(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                하반기 TAI: <span className="text-primary">{taiH2Percent}%</span>
                <span className="ml-2 text-[10px] font-normal text-faint">2025년 확정치 미확정 — 가정값</span>
              </label>
              <input
                type="range" min={0} max={100} step={25}
                value={taiH2Percent}
                onChange={(e) => setTaiH2Percent(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        )}
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
          <ResultCard
            label="OPI"
            value={fmtManwon(calc.opiWon)}
            sub={`연봉 × ${customMode ? customOpiPercent : scenario.percent}%`}
          />
          <ResultCard
            label="TAI"
            value={fmtManwon(calc.taiWon)}
            sub={includeTai ? `월 기본 × (상 ${taiH1Percent}% + 하 ${taiH2Percent}%)` : "포함 안 함"}
          />
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
