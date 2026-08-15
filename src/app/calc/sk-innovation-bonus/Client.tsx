"use client";

import { useMemo, useState } from "react";
import { Building2, User, Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// ────────────────────────────────────────────────────────────
// SK이노베이션 성과급 시나리오 (공개 보도 기반 — 수치 창작 금지)
// FY2024 실적분(2025년 지급): 총 660% = PS 280 + LTI 70 + STI 190(7월) + 하반기 120
//   (디지털타임스 단독·EBN, 2025-02-06 / SBS Biz)
// 동시점 계열사 차등: SK엔무브 800% / SK어스온 400% / SK온 0% (EBN 2025-02-06)
// FY2023 실적분(2024년 지급): 계열사별 0~800%, 울산CLX PS 612% (뉴스핌 2024-02-16·이데일리 단독)
// FY2025 실적분(2026년)은 보도 미확보 — 미확정이므로 시나리오에 넣지 않는다.
// ────────────────────────────────────────────────────────────

type Breakdown = { name: string; pct: number };

type Scenario = {
  id: string;
  label: string;
  year: string;
  totalPercent: number;
  breakdown: Breakdown[] | null;
  desc: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "fy2024-innovation",
    label: "SK이노베이션(울산CLX) 660%",
    year: "FY2024 실적 · 2025년 지급",
    totalPercent: 660,
    breakdown: [
      { name: "PS 초과이익분배금", pct: 280 },
      { name: "LTI 롱텀인센티브", pct: 70 },
      { name: "STI 단기성과급 (7월)", pct: 190 },
      { name: "하반기 추가분", pct: 120 },
    ],
    desc: "PS 280% + LTI 70% + STI 190%(7월) + 하반기 120% = 총 660% (디지털타임스 단독·EBN, 2025-02-06)",
  },
  {
    id: "fy2024-enmove",
    label: "SK엔무브 800% (계열 최대)",
    year: "FY2024 실적 · 2025년 지급",
    totalPercent: 800,
    breakdown: null,
    desc: "FY2024 계열사 중 최대 지급률 (EBN, 2025-02-06)",
  },
  {
    id: "fy2024-earthon",
    label: "SK어스온 400%",
    year: "FY2024 실적 · 2025년 지급",
    totalPercent: 400,
    breakdown: null,
    desc: "자원개발 계열 (EBN, 2025-02-06)",
  },
  {
    id: "fy2024-on",
    label: "SK온 0% (미지급)",
    year: "FY2024 실적 · 2025년 지급",
    totalPercent: 0,
    breakdown: null,
    desc: "2024년 1조 1,270억원 적자로 성과급 0% (EBN, 2025-02-06)",
  },
  {
    id: "fy2023-clx",
    label: "울산CLX PS 612% (전년 비교)",
    year: "FY2023 실적 · 2024년 지급",
    totalPercent: 612,
    breakdown: null,
    desc: "PS만 확인된 수치 — LTI·STI 등 타 구성 미포함 주의 (뉴스핌 2024-02-16·이데일리 단독)",
  },
];

const DEFAULT_BASIC_MANWON = 400; // 월 기본급 디폴트 400만원
const DEFAULT_SALARY_MANWON = 10_000; // 세후 계산용 연봉 디폴트 1억

export default function SkInnovationBonusClient() {
  const [scenarioId, setScenarioId] = useState<string>("fy2024-innovation");
  const [customMode, setCustomMode] = useState(false);
  const [customPct, setCustomPct] = useState(660);
  const [monthlyBasicManwon, setMonthlyBasicManwon] = useState(DEFAULT_BASIC_MANWON);
  const [annualSalaryManwon, setAnnualSalaryManwon] = useState(DEFAULT_SALARY_MANWON);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const calc = useMemo(() => {
    const monthlyBasicWon = monthlyBasicManwon * 10_000;
    const annualSalaryWon = annualSalaryManwon * 10_000;

    const pct = customMode ? customPct : scenario.totalPercent;
    const totalGross = monthlyBasicWon * (pct / 100);

    const breakdownWon =
      !customMode && scenario.breakdown
        ? scenario.breakdown.map((b) => ({
            ...b,
            amount: monthlyBasicWon * (b.pct / 100),
          }))
        : null;

    const tax = calcBonusNet(annualSalaryWon, totalGross, creditRate, applyInsurance);

    return {
      pct,
      monthlyBasicWon,
      annualSalaryWon,
      totalGross,
      breakdownWon,
      tax,
      bonusToSalaryRatio: annualSalaryWon > 0 ? (totalGross / annualSalaryWon) * 100 : 0,
    };
  }, [scenario, customMode, customPct, monthlyBasicManwon, annualSalaryManwon, creditRate, applyInsurance]);

  return (
    <div className="space-y-6">
      {/* 1. 시나리오 선택 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          1단계 · 지급 실적 시나리오 선택
        </h2>
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
              <div className="text-[10px] font-bold text-faint">{s.year}</div>
              <div className="font-bold text-sm mt-0.5">{s.label}</div>
              <div className="text-xs text-faint mt-1 leading-relaxed">{s.desc}</div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustomMode(true)}
            className={`p-4 rounded-xl border-2 text-left transition ${
              customMode
                ? "border-primary bg-primary/10"
                : "border-canvas-deep hover:border-primary/40"
            }`}
          >
            <div className="text-[10px] font-bold text-faint">직접 입력</div>
            <div className="font-bold text-sm mt-0.5">🎛️ 커스텀 지급률 (0~800%)</div>
            <div className="text-xs text-faint mt-1 leading-relaxed">
              FY2025 실적분(2026년) 미확정 — 예상치를 직접 넣어 시뮬레이션
            </div>
          </button>
        </div>
        {customMode && (
          <div className="mt-3 p-4 rounded-xl bg-canvas/30">
            <label className="block text-sm font-bold mb-2">
              지급률 (월 기본급 대비): <span className="text-primary">{customPct}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={800}
              step={10}
              value={customPct}
              onChange={(e) => setCustomPct(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={customPct}
                onChange={(e) => setCustomPct(Number(e.target.value) || 0)}
                step="10"
                min="0"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
              <span className="text-xs text-faint">
                최근 실적: 800(FY2022 CLX PS) → 612(FY2023 CLX PS) → 660(FY2024 총액)
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 2. 본인 월 기본급 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          2단계 · 본인 월 기본급
        </h2>
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
          {[300, 400, 500, 600, 700].map((m) => (
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
          SK이노베이션 성과급은 <strong>월 기본급의 %</strong> 형태로 지급됩니다 (상여·수당
          제외한 기본급 기준). 정확한 본인 기본급은 급여 명세서를 확인하세요.
        </p>
      </section>

      {/* 3. 연봉 (세후 계산용) */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">3단계 · 본인 연봉 (세후 계산용)</h2>
        <label className="block">
          <span className="text-sm font-bold">연 기본 연봉 (만원)</span>
          <input
            type="number"
            value={annualSalaryManwon}
            onChange={(e) => setAnnualSalaryManwon(Number(e.target.value) || 0)}
            step="100"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[8000, 10000, 12000, 14600, 16000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setAnnualSalaryManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {(m / 10000).toFixed(2).replace(/\.?0+$/, "")}억
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          성과급은 근로소득에 합산돼 누진세율이 적용되므로, 본인 연봉이 높을수록 성과급에서
          떼이는 세금이 커집니다. 참고: FY2025 사업보고서 기준 SK이노베이션(지주) 평균연봉
          1억 4,600만원.
        </p>
      </section>

      {/* 4. 세금 가정 (고급) */}
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
                (성과급은 보수 합산이지만 국민연금은 상한 적용)
              </span>
            </label>
          </div>
        )}
      </section>

      {/* 5. 결과 */}
      <section className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          내 성과급 계산 결과
        </h2>

        {calc.breakdownWon ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {calc.breakdownWon.map((b) => (
              <ResultCard
                key={b.name}
                label={b.name}
                value={fmtManwon(b.amount)}
                sub={`월 기본급 × ${b.pct}%`}
              />
            ))}
          </div>
        ) : (
          <div className="mb-5">
            <ResultCard
              label={customMode ? "커스텀 지급률" : scenario.label}
              value={fmtManwon(calc.totalGross)}
              sub={`= 월 기본급 ${monthlyBasicManwon}만 × ${calc.pct}%`}
            />
          </div>
        )}

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 총 성과급 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            월 기본급 대비 <strong>{calc.pct}%</strong> · 연봉 대비{" "}
            <strong>{calc.bonusToSalaryRatio.toFixed(0)}%</strong>
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
