"use client";

import { useMemo, useState } from "react";
import { Settings, Lock, Coins } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// 삼성디스플레이 OPI 시나리오 — 보도 확인값만 사용
// 36%: 2025년 실적분, 2026-01-30 지급, 전 사업부 공통 (연합뉴스·디지털타임스 2026-01-28)
// 40%: 2024년 실적분, 2025년 1월 지급 (연합뉴스 2026-01-28 기사 내 전년 수치 인용)
// 50%: 제도상 상한 (초과이익의 20% 재원 내 연봉의 최대 50%)
const OPI_SCENARIOS = [
  { id: "2026-paid", label: "2025 실적분 36%", percent: 36, hint: "2026-01-30 지급 · 전 사업부 공통 (확정)" },
  { id: "2025-paid", label: "2024 실적분 40%", percent: 40, hint: "2025년 1월 지급" },
  { id: "max", label: "상한 50%", percent: 50, hint: "제도상 최대치 시나리오" },
] as const;

const DEFAULT_SALARY_MANWON = 8000;
const BASIC_RATIO = 20; // 기본급 = 연봉 / 20 (삼성 표준)

// TAI 프리셋 근거:
// 하반기 50% — 2025년 하반기 대형·중소형 모두 월 기본급의 50%, 2025-12-24 지급 (뉴시스 2025-12-22)
// 상반기 50/75% — 확정치 보도 미확보. 이청 대표 발언 기준 '중소형 75%·대형 50% 이상' 전망 (SBS Biz 2025-07-01)
const TAI_PRESETS = [0, 25, 50, 75, 100];

export default function SamsungDisplayBonusClient() {
  const [scenarioId, setScenarioId] = useState<(typeof OPI_SCENARIOS)[number]["id"]>("2026-paid");
  const [salaryManwon, setSalaryManwon] = useState(DEFAULT_SALARY_MANWON);
  const [taiH1Percent, setTaiH1Percent] = useState(50);
  const [taiH2Percent, setTaiH2Percent] = useState(50);
  const [customMode, setCustomMode] = useState(false);
  const [customOpiPercent, setCustomOpiPercent] = useState(36);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = OPI_SCENARIOS.find((s) => s.id === scenarioId)!;
  const opiPct = customMode ? customOpiPercent : scenario.percent;

  const calc = useMemo(() => {
    const salaryWon = salaryManwon * 10_000;
    const monthlyBasicWon = salaryWon / BASIC_RATIO;

    // OPI: 연봉 × %
    const opiWon = salaryWon * (opiPct / 100);
    // TAI: 월 기본급 × 반기별 % (상·하반기 각 1회)
    const taiH1Won = monthlyBasicWon * (taiH1Percent / 100);
    const taiH2Won = monthlyBasicWon * (taiH2Percent / 100);
    const totalGross = opiWon + taiH1Won + taiH2Won;

    const tax = calcBonusNet(salaryWon, totalGross, creditRate, applyInsurance);

    return {
      monthlyBasicWon,
      opiWon,
      taiH1Won,
      taiH2Won,
      totalGross,
      tax,
      bonusToSalaryRatio: salaryWon > 0 ? (totalGross / salaryWon) * 100 : 0,
    };
  }, [salaryManwon, opiPct, taiH1Percent, taiH2Percent, creditRate, applyInsurance]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · OPI 시나리오 (연봉 대비 %)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {OPI_SCENARIOS.map((s) => (
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
        <p className="mt-2 text-xs text-faint">
          삼성디스플레이 OPI는 사업부(대형·중소형) 구분 없이 <strong>전 사업부 공통 지급률</strong>이
          적용됩니다 (2026-01 지급분 기준 보도).
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
          {[5500, 7000, 8500, 10000, 12000].map((m) => (
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
          기본급(TAI 기준) = 연봉 ÷ 20 = <strong>{fmtManwon(calc.monthlyBasicWon)}</strong>
        </p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          3단계 · TAI (월 기본급 대비 %, 반기별)
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <TaiInput
            label="상반기 TAI (7월 지급)"
            value={taiH1Percent}
            onChange={setTaiH1Percent}
            note="2025 상반기 확정치 보도 미확보 — 중소형 75%·대형 50% 이상 전망 (SBS Biz 2025-07-01)"
          />
          <TaiInput
            label="하반기 TAI (12월 지급)"
            value={taiH2Percent}
            onChange={setTaiH2Percent}
            note="2025 하반기: 대형·중소형 모두 50% 확정, 2025-12-24 지급 (뉴시스 2025-12-22)"
          />
        </div>
        <p className="mt-3 text-xs text-faint">
          TAI는 상·하반기 각 1회, 월 기본급의 최대 100%까지 사업부별 차등 지급됩니다.
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <ResultCard label="OPI" value={fmtManwon(calc.opiWon)} sub={`연봉 × ${opiPct}%`} />
          <ResultCard label="TAI 상반기" value={fmtManwon(calc.taiH1Won)} sub={`월 기본급 × ${taiH1Percent}%`} />
          <ResultCard label="TAI 하반기" value={fmtManwon(calc.taiH2Won)} sub={`월 기본급 × ${taiH2Percent}%`} />
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

function TaiInput({
  label,
  value,
  onChange,
  note,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-canvas-deep p-4">
      <label className="block">
        <span className="text-sm font-bold">{label}</span>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            step="5" min="0" max="100"
            className="flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold focus:outline-none focus:border-primary"
          />
          <span className="text-sm font-bold">%</span>
        </div>
      </label>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {TAI_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`py-1 rounded border text-[11px] font-bold transition ${
              value === p
                ? "border-primary bg-primary/10 text-primary"
                : "border-canvas-deep hover:border-primary/40"
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
      <p className="text-[10px] text-faint mt-2 leading-relaxed">{note}</p>
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
