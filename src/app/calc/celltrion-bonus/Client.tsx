"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// 셀트리온 경영성과급 시나리오.
// 공식 명칭 없는 연 1회 경영성과급 — 기본급 연봉 대비 % 책정, 인사평가 등급별
// 차등이며 보도 수치는 최고 등급 상한 기준. 지급 시기는 연초 1월.
// 2025년 실적분부터 1월 약 43% 선지급 + 3월 평가 확정 후 잔여 지급 구조 보도.
const SCENARIOS = [
  {
    id: "2025-perf",
    label: "2025년 실적분 (2026년 1월 지급)",
    rate: 50,
    prepaidRate: 43,
    desc: "최대 50% 수준 · 1월 약 43% 선지급 + 3월 평가 확정 후 잔여 지급 (데일리메디 2026-02-02)",
  },
  {
    id: "2024-perf",
    label: "2024년 실적분 (2025-01-08 지급)",
    rate: 53,
    prepaidRate: 0,
    desc: "최고 등급 연봉의 최대 53% — 역대 최대. 2024년 3분기 누적 매출이 2023년 연간 매출 초과.",
  },
  {
    id: "2023-perf",
    label: "2023년 실적분 (2024년 초 지급)",
    rate: 42,
    prepaidRate: 0,
    desc: "연봉의 42% (파이낸셜뉴스 2025-01-05 · 알티케이뉴스 2025-01-08 보도)",
  },
] as const;

const DEFAULT_SALARY_MANWON = 5_000; // 기본급 연봉 5,000만원

export default function CelltrionBonusClient() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIOS)[number]["id"]>("2025-perf");
  const [baseSalaryManwon, setBaseSalaryManwon] = useState(DEFAULT_SALARY_MANWON);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rateOverride, setRateOverride] = useState(50);
  const [customMode, setCustomMode] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const baseSalaryWon = baseSalaryManwon * 10_000;

    const rate = customMode ? rateOverride : scenario.rate;
    const totalGross = baseSalaryWon * (rate / 100);

    // 2025년 실적분: 1월 약 43% 선지급 + 3월 평가 확정 후 잔여 (커스텀 모드 제외)
    const prepaidWon =
      !customMode && scenario.prepaidRate > 0
        ? baseSalaryWon * (scenario.prepaidRate / 100)
        : 0;
    const remainderWon = prepaidWon > 0 ? Math.max(0, totalGross - prepaidWon) : 0;

    const tax = calcBonusNet(baseSalaryWon, totalGross, creditRate, applyInsurance);

    return {
      baseSalaryWon,
      rate,
      totalGross,
      prepaidWon,
      remainderWon,
      tax,
    };
  }, [scenarioId, baseSalaryManwon, customMode, rateOverride, creditRate, applyInsurance, scenario]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 시나리오 선택</h2>
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
          🎛️ 직접 입력 (커스텀 시나리오)
        </button>
        {customMode && (
          <div className="mt-3 space-y-3 p-4 rounded-xl bg-canvas/30">
            <Row label="지급률 (기본급 연봉 대비)">
              <input
                type="number"
                value={rateOverride}
                onChange={(e) => setRateOverride(Number(e.target.value) || 0)}
                step="1"
                min="0"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </Row>
            <p className="text-xs text-faint">
              보도 수치는 인사평가 최고 등급 상한입니다. 본인 등급에 맞춰 지급률을 낮춰 시뮬레이션해 보세요.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">2단계 · 본인 기본급 연봉</h2>
        <label className="block">
          <span className="text-sm font-bold">기본급 연봉 (만원)</span>
          <input
            type="number"
            value={baseSalaryManwon}
            onChange={(e) => setBaseSalaryManwon(Number(e.target.value) || 0)}
            step="100"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[3000, 4000, 5000, 6000, 8000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setBaseSalaryManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {m.toLocaleString("ko-KR")}만
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          셀트리온 성과급은 <strong>성과급·수당을 제외한 기본급 연봉</strong> 대비 %로 책정된다고
          보도됐습니다. 계약 연봉이 아닌 기본급 연봉을 입력하세요.
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
            value={`${calc.rate}%`}
            sub="기본급 연봉 대비 · 보도 수치는 최고 등급 상한"
          />
          <ResultCard
            label="성과급 산정액"
            value={fmtManwon(calc.totalGross)}
            sub={`= 기본급 연봉 ${baseSalaryManwon.toLocaleString("ko-KR")}만 × ${calc.rate}%`}
          />
          {calc.prepaidWon > 0 && (
            <>
              <ResultCard
                label="1월 선지급분 (약 43%)"
                value={fmtManwon(calc.prepaidWon)}
                sub="2025년 실적분부터 1월 선지급 구조 보도"
              />
              <ResultCard
                label="잔여 지급분"
                value={fmtManwon(calc.remainderWon)}
                sub="3월 인사평가 확정 후 지급 검토 (등급별 차등)"
              />
            </>
          )}
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 총 성과급 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            기본급 연봉 대비 <strong>{calc.rate}%</strong>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-faint w-32">{label}</span>
      {children}
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
