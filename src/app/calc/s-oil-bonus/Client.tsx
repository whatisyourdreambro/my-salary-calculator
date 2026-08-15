"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// S-OIL 연 1회 경영성과급 — 최근 지급 실적 시나리오 (보도 기준)
const SCENARIOS = [
  {
    id: "2024-perf",
    label: "2024년 실적분 · 250% (2025-02 지급 확정)",
    bonusPercent: 250,
    desc: "영업이익 4,606억원(전년비 -66%) → 기본급 250% 확정. 데일리한국·네이트뉴스 2025-02-20 보도.",
  },
  {
    id: "2023-perf",
    label: "2023년 실적분 · 800% (2024년 초 지급)",
    bonusPercent: 800,
    desc: "데일리한국 2025-02-20 기사 내 전년 비교 인용 (250%는 800% 대비 550%p 감소).",
  },
  {
    id: "2022-perf",
    label: "2022년 실적분 · 1,500% (2023년 초 지급)",
    bonusPercent: 1500,
    desc: "파이낸셜뉴스 2024-02-05 기사 내 인용. 시사오늘은 1,470%로 보도 — 매체 간 수치 차이 존재.",
  },
] as const;

const DEFAULT_BASIC_MANWON = 600;
// 연봉 근사 = 월 기본급 × 20 (12개월 + 생산직 채용공고 기준 별도 상여금 800%)
const ANNUAL_MULTIPLIER = 20;

export default function SOilBonusClient() {
  const [scenarioId, setScenarioId] =
    useState<(typeof SCENARIOS)[number]["id"]>("2024-perf");
  const [monthlyBasicManwon, setMonthlyBasicManwon] =
    useState(DEFAULT_BASIC_MANWON);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bonusPctOverride, setBonusPctOverride] = useState(250);
  const [customMode, setCustomMode] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const monthlyBasicWon = monthlyBasicManwon * 10_000;
    const estimatedAnnualSalary = monthlyBasicWon * ANNUAL_MULTIPLIER;

    const bp = customMode ? bonusPctOverride : scenario.bonusPercent;
    const totalGross = monthlyBasicWon * (bp / 100);
    const tax = calcBonusNet(
      estimatedAnnualSalary,
      totalGross,
      creditRate,
      applyInsurance,
    );

    return {
      estimatedAnnualSalary,
      appliedPercent: bp,
      totalGross,
      tax,
      bonusToSalaryRatio:
        estimatedAnnualSalary > 0
          ? (totalGross / estimatedAnnualSalary) * 100
          : 0,
    };
  }, [
    scenarioId,
    monthlyBasicManwon,
    customMode,
    bonusPctOverride,
    creditRate,
    applyInsurance,
    scenario,
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 지급률 시나리오 선택</h2>
        <div className="grid sm:grid-cols-3 gap-3">
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
              <div className="text-xs text-faint mt-1 leading-relaxed">
                {s.desc}
              </div>
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
          🎛️ 직접 입력 (커스텀 지급률)
        </button>
        {customMode && (
          <div className="mt-3 p-4 rounded-xl bg-canvas/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-faint w-40">
                성과급 % (월 기본급 대비)
              </span>
              <input
                type="number"
                value={bonusPctOverride}
                onChange={(e) =>
                  setBonusPctOverride(Number(e.target.value) || 0)
                }
                step="10"
                min="0"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </div>
            <p className="mt-2 text-xs text-faint">
              예: 2022년 실적분을 시사오늘 보도값(1,470%)으로 계산하려면 1470
              입력. 2025년 실적분(2026년 지급)은 미확정이라 기본 시나리오에
              없습니다.
            </p>
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
            onChange={(e) =>
              setMonthlyBasicManwon(Number(e.target.value) || 0)
            }
            step="10"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[400, 500, 600, 700, 800].map((m) => (
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
          추정 연봉(기본급 × {ANNUAL_MULTIPLIER} = 12개월 + 상여 800%) ={" "}
          <strong>{fmtEok(calc.estimatedAnnualSalary)}</strong> — 세금 계산용
          근사치입니다.
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

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard
            label="적용 지급률"
            value={`${calc.appliedPercent.toLocaleString()}%`}
            sub={
              customMode
                ? "직접 입력 지급률"
                : scenario.label
            }
          />
          <ResultCard
            label="정률 경영성과급 (세전)"
            value={fmtManwon(calc.totalGross)}
            sub={`= 월 기본급 ${monthlyBasicManwon}만 × ${calc.appliedPercent.toLocaleString()}%`}
          />
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 총 성과급 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            추정 연봉 대비{" "}
            <strong>{calc.bonusToSalaryRatio.toFixed(0)}%</strong> · 월 기본급{" "}
            {(calc.appliedPercent / 100).toFixed(1)}개월치
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">💰 세후 실수령</p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">
            {fmtEok(calc.tax.net)}
          </p>
          <p className="text-xs text-faint mt-1">
            세전 {fmtEok(calc.totalGross)} − 공제{" "}
            {fmtEok(calc.tax.totalDeductions)} (실효세율{" "}
            <strong>{calc.tax.effectiveRate}%</strong>)
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

function ResultCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
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
