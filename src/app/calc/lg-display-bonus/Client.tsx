"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// LG디스플레이 경영성과급 시나리오 (정률형 — 기본급의 %)
// 수치 출처: EBN·한국경제·아주경제·서울경제TV 2026-01-29 보도(150%),
// MTN 2015-01-30 보도(과거 300% 이력). 적자 연도(FY2022~FY2024)는 미지급.
const SCENARIOS = [
  {
    id: "2026-actual",
    label: "FY2025 실적분 (2026년 2월 실제 지급)",
    bonusPercent: 150,
    desc: "기본급의 150% — 전 사업부 일괄, 4년 만의 지급 재개 (EBN·한국경제 2026-01-29 보도)",
  },
  {
    id: "deficit",
    label: "적자 시나리오 (FY2022~FY2024 실제)",
    bonusPercent: 0,
    desc: "3년 연속 영업적자로 경영성과급 미지급 — 0% (EBN·한국경제 2026-01-29 보도)",
  },
  {
    id: "2015-ref",
    label: "과거 호황 이력 (2015년 1월, 참고용)",
    bonusPercent: 300,
    desc: "월 기본급의 300% 지급 (MTN 2015-01-30 보도). 11년 전 이력으로 참고용입니다.",
  },
] as const;

const DEFAULT_BASIC_MANWON = 400; // 월 기본급(만원) 기본값
const DEFAULT_ANNUAL_MANWON = 8000; // 연봉(만원) 기본값 — FY2023 공시 평균연봉 8,000만원 (뉴시스 2024-03-14)

export default function LgDisplayBonusClient() {
  const [scenarioId, setScenarioId] =
    useState<(typeof SCENARIOS)[number]["id"]>("2026-actual");
  const [monthlyBasicManwon, setMonthlyBasicManwon] =
    useState(DEFAULT_BASIC_MANWON);
  const [annualSalaryManwon, setAnnualSalaryManwon] =
    useState(DEFAULT_ANNUAL_MANWON);

  const [customMode, setCustomMode] = useState(false);
  const [bonusPctOverride, setBonusPctOverride] = useState(150);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const activePercent = customMode ? bonusPctOverride : scenario.bonusPercent;

  const calc = useMemo(() => {
    const monthlyBasicWon = monthlyBasicManwon * 10_000;
    const annualSalaryWon = annualSalaryManwon * 10_000;

    const grossBonusWon = monthlyBasicWon * (activePercent / 100);
    const tax = calcBonusNet(
      annualSalaryWon,
      grossBonusWon,
      creditRate,
      applyInsurance,
    );

    return {
      annualSalaryWon,
      grossBonusWon,
      tax,
      bonusToSalaryRatio:
        annualSalaryWon > 0 ? (grossBonusWon / annualSalaryWon) * 100 : 0,
    };
  }, [
    monthlyBasicManwon,
    annualSalaryManwon,
    activePercent,
    creditRate,
    applyInsurance,
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
              <div className="text-2xl font-black text-primary mt-1 tabular-nums">
                {s.bonusPercent}%
              </div>
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
          <div className="mt-3 flex items-center gap-2 p-4 rounded-xl bg-canvas/30">
            <span className="text-xs font-bold text-faint w-40">
              경영성과급 % (월 기본급 대비)
            </span>
            <input
              type="number"
              value={bonusPctOverride}
              onChange={(e) => setBonusPctOverride(Number(e.target.value) || 0)}
              step="10"
              min="0"
              className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
            />
            <span className="text-sm">%</span>
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
          {[300, 350, 400, 450, 500].map((m) => (
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
          LG디스플레이 경영성과급은 <strong>고정급(기본급)의 %</strong>로
          지급됩니다 (한국경제 2026-01-29 보도). 급여명세서의 월 기본급을
          입력하세요.
        </p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">
          3단계 · 본인 연봉 (세금 계산용)
        </h2>
        <label className="block">
          <span className="text-sm font-bold">연 기본 연봉 (만원)</span>
          <input
            type="number"
            value={annualSalaryManwon}
            onChange={(e) =>
              setAnnualSalaryManwon(Number(e.target.value) || 0)
            }
            step="100"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[6000, 7000, 8000, 9000, 10000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setAnnualSalaryManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {m.toLocaleString("ko-KR")}만
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          성과급은 연봉에 합산돼 누진세율이 적용되므로 연봉이 높을수록
          세금이 커집니다. 참고: FY2023 사업보고서 기준 평균연봉 8,000만원
          (뉴시스 2024-03-14 보도).
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
          내 경영성과급 계산 결과
        </h2>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">
            📊 경영성과급 (세전)
          </p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.grossBonusWon)}
          </p>
          <p className="text-xs text-faint mt-1">
            = 월 기본급 {monthlyBasicManwon.toLocaleString("ko-KR")}만원 ×{" "}
            {activePercent}% · 연봉 대비{" "}
            <strong>{calc.bonusToSalaryRatio.toFixed(1)}%</strong>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">💰 세후 실수령</p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">
            {fmtEok(calc.tax.net)}
          </p>
          <p className="text-xs text-faint mt-1">
            세전 {fmtEok(calc.grossBonusWon)} − 공제{" "}
            {fmtEok(calc.tax.totalDeductions)} (실효세율{" "}
            <strong>{calc.tax.effectiveRate}%</strong>)
          </p>
        </div>

        {activePercent === 0 && (
          <p className="mt-4 text-sm font-bold text-faint">
            적자 시나리오에서는 경영성과급이 지급되지 않습니다 —
            FY2022~FY2024 3년간 실제로 미지급이었습니다.
          </p>
        )}

        <details className="mt-4 text-xs">
          <summary className="cursor-pointer font-bold text-faint">
            🧾 세금 상세 공제 내역
          </summary>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <DeductItem
              label="소득세"
              value={fmtManwon(calc.tax.incomeTaxDelta)}
            />
            <DeductItem
              label="지방세"
              value={fmtManwon(calc.tax.localTaxDelta)}
            />
            <DeductItem
              label="국민연금"
              value={fmtManwon(calc.tax.pensionDelta)}
            />
            <DeductItem
              label="건강+요양"
              value={fmtManwon(calc.tax.healthDelta)}
            />
            <DeductItem
              label="고용보험"
              value={fmtManwon(calc.tax.empInsDelta)}
            />
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
