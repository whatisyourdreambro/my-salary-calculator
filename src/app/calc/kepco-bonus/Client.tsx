"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// 한국전력 공공기관 경영평가 성과급 시나리오.
// 등급별 지급률(공기업 직원 기준 월 기본급의 %): S 250 / A 200 / B 150 / C 100 / D·E 0
// — 비즈니스포스트 2024-06-17 보도. 한전 등급 이력은 아시아경제 2026-06-20 회고,
// 2025년도 A등급(2년 연속)은 이투데이 2026-06-19.
const SCENARIOS = [
  {
    id: "2025-a",
    label: "2025년도 평가 A등급 (2026년 지급)",
    percent: 200,
    desc: "2년 연속 A(우수). 공기업 A등급 직원 성과급 = 월 기본급의 200% 상당 (이투데이 2026-06-19)",
  },
  {
    id: "2024-a",
    label: "2024년도 평가 A등급 (2025년 지급)",
    percent: 200,
    desc: "A등급(우수) 복귀 — 월 기본급의 200% 상당 (아시아경제 2026-06-20 회고)",
  },
  {
    id: "2023-b",
    label: "2023년도 평가 B등급 (2024년 지급)",
    percent: 150,
    desc: "B등급(양호) = 월 기본급의 150% 상당 (지급률 표: 비즈니스포스트 2024-06-17)",
  },
  {
    id: "2022-d",
    label: "2022년도 평가 D등급 (미지급)",
    percent: 0,
    desc: "D등급(미흡)은 지급률 0% — 성과급 미지급 (아시아경제 2026-06-20 회고)",
  },
] as const;

// 등급 직접 선택 프리셋 (커스텀 모드)
const GRADE_PRESETS = [
  { grade: "S", percent: 250 },
  { grade: "A", percent: 200 },
  { grade: "B", percent: 150 },
  { grade: "C", percent: 100 },
  { grade: "D·E", percent: 0 },
] as const;

const DEFAULT_BASIC_MANWON = 300;
// 알리오(ALIO) 2025년 정규직 1인당 평균보수 9,638만원 (매일경제 2026-05-06 보도 인용)
const DEFAULT_ANNUAL_MANWON = 9638;

export default function KepcoBonusClient() {
  const [scenarioId, setScenarioId] =
    useState<(typeof SCENARIOS)[number]["id"]>("2025-a");
  const [customMode, setCustomMode] = useState(false);
  const [pctOverride, setPctOverride] = useState(200);

  const [monthlyBasicManwon, setMonthlyBasicManwon] = useState(DEFAULT_BASIC_MANWON);
  const [annualManwon, setAnnualManwon] = useState(DEFAULT_ANNUAL_MANWON);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const activePercent = customMode ? pctOverride : scenario.percent;

  const calc = useMemo(() => {
    const monthlyBasicWon = monthlyBasicManwon * 10_000;
    const annualSalaryWon = annualManwon * 10_000;

    const grossBonusWon = monthlyBasicWon * (activePercent / 100);
    const tax = calcBonusNet(annualSalaryWon, grossBonusWon, creditRate, applyInsurance);

    return {
      monthlyBasicWon,
      annualSalaryWon,
      grossBonusWon,
      tax,
      bonusToSalaryRatio:
        annualSalaryWon > 0 ? (grossBonusWon / annualSalaryWon) * 100 : 0,
    };
  }, [monthlyBasicManwon, annualManwon, activePercent, creditRate, applyInsurance]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 평가연도(시나리오) 선택</h2>
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
              <div className="text-xs text-faint mt-1 leading-relaxed">{s.desc}</div>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCustomMode(!customMode)}
          className={`mt-3 w-full p-3 rounded-xl border-2 text-sm font-bold transition ${
            customMode
              ? "border-primary bg-primary/10"
              : "border-canvas-deep hover:border-primary/40"
          }`}
        >
          🎛️ 등급 직접 선택 (커스텀 시나리오)
        </button>
        {customMode && (
          <div className="mt-3 space-y-3 p-4 rounded-xl bg-canvas/30">
            <div>
              <p className="text-xs font-bold text-faint mb-2">
                경영평가 등급 프리셋 (공기업 직원 기준 지급률 — 비즈니스포스트 2024-06-17)
              </p>
              <div className="grid grid-cols-5 gap-2">
                {GRADE_PRESETS.map((g) => (
                  <button
                    key={g.grade}
                    type="button"
                    onClick={() => setPctOverride(g.percent)}
                    className={`py-2 rounded-md border text-xs font-bold transition ${
                      pctOverride === g.percent
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-canvas-deep hover:border-primary/40"
                    }`}
                  >
                    {g.grade}
                    <span className="block text-[10px] font-normal">{g.percent}%</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-faint w-32">
                지급률 % (월 기본급 대비)
              </span>
              <input
                type="number"
                value={pctOverride}
                onChange={(e) => setPctOverride(Number(e.target.value) || 0)}
                step="10"
                min="0"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">2단계 · 본인 월 기본급</h2>
        <label className="block">
          <span className="text-sm font-bold">월 기본급 (만원)</span>
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
          {[200, 250, 300, 350, 400].map((m) => (
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
          경평 성과급은 <strong>월 기본급 × 등급 지급률</strong>로 산정됩니다. 성과급
          산정 기준보수는 내부 규정에 따라 다를 수 있으니 급여명세서의 기본급을
          입력하세요.
        </p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">3단계 · 연 총보수 (세금 계산용)</h2>
        <label className="block">
          <span className="text-sm font-bold">본인 연 총보수 (만원)</span>
          <input
            type="number"
            value={annualManwon}
            onChange={(e) => setAnnualManwon(Number(e.target.value) || 0)}
            step="100"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[6000, 8000, 9638, 11000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setAnnualManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {m.toLocaleString("ko-KR")}만
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          기본값 9,638만원은 알리오(ALIO) 2025년 정규직 1인당 평균보수(매일경제
          2026-05-06 보도 인용)입니다. 성과급 세금은 연간 근로소득에 합산돼 누진세율이
          적용되므로 본인 총보수에 가깝게 입력할수록 정확합니다.
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
          내 경영평가 성과급 계산 결과
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard
            label="적용 지급률"
            value={`${activePercent}%`}
            sub={
              customMode
                ? "커스텀 시나리오 (등급 직접 선택)"
                : scenario.label
            }
          />
          <ResultCard
            label="경평 성과급 (세전)"
            value={fmtManwon(calc.grossBonusWon)}
            sub={`= 월 기본급 ${monthlyBasicManwon}만 × ${activePercent}%`}
          />
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 총 성과급 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.grossBonusWon)}
          </p>
          <p className="text-xs text-faint mt-1">
            연 총보수 대비 <strong>{calc.bonusToSalaryRatio.toFixed(1)}%</strong>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">💰 세후 실수령</p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">
            {fmtEok(calc.tax.net)}
          </p>
          <p className="text-xs text-faint mt-1">
            세전 {fmtEok(calc.grossBonusWon)} − 공제 {fmtEok(calc.tax.totalDeductions)}{" "}
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

        <p className="mt-4 text-[11px] text-faint leading-relaxed">
          ※ 등급별 지급률(S 250 / A 200 / B 150 / C 100 / D·E 0%)은 공기업 직원 기준
          보도값(비즈니스포스트 2024-06-17)이며, 실제 개인 지급액은 내부평가 차등·직급·
          산정 기준보수에 따라 달라질 수 있습니다.
        </p>
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
