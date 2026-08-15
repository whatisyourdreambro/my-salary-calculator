"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// 두산에너빌리티 경영성과급 시나리오.
// 제도: 영업이익 목표 달성률 기준, 상한 기본급 530% / 하한 100%
//   (서울경제 2026-05-21). 총재원 차등 배분형이라 개인별 일괄 % 공표가
//   없으므로 상한·하한·직전 실적(연봉 27% 재원, 조선일보 2026-05-12)
//   3개 구간 시뮬레이션으로 설계.
const SCENARIOS = [
  {
    id: "2025-actual",
    label: "2025 지급 실적 기준 (연봉의 약 27%)",
    kind: "salaryPct",
    pct: 27,
    desc: "전 직원 연봉의 약 27%를 재원으로 평가에 따라 차등 지급 (조선일보 2026-05-12 보도). 본인 연봉 × 27%로 평균치를 추정.",
  },
  {
    id: "cap-530",
    label: "상한 시나리오 — 기본급의 530%",
    kind: "basicPct",
    pct: 530,
    desc: "영업이익 목표 초과 달성 시 상한. 월 기본급 × 530% (서울경제 2026-05-21 보도).",
  },
  {
    id: "floor-100",
    label: "하한 시나리오 — 기본급의 100%",
    kind: "basicPct",
    pct: 100,
    desc: "영업이익 목표 달성률 50% 미만이어도 보장되는 하한. 월 기본급 × 100% (서울경제 2026-05-21 보도).",
  },
] as const;

const DEFAULT_ANNUAL_MANWON = 8_000; // 연봉 8,000만원 (FY2025 평균 1억원보다 보수적)
const DEFAULT_BASIC_MANWON = 400; // 월 기본급 400만원

export default function DoosanEnerbilityBonusClient() {
  const [scenarioId, setScenarioId] =
    useState<(typeof SCENARIOS)[number]["id"]>("2025-actual");
  const [annualSalaryManwon, setAnnualSalaryManwon] = useState(DEFAULT_ANNUAL_MANWON);
  const [monthlyBasicManwon, setMonthlyBasicManwon] = useState(DEFAULT_BASIC_MANWON);
  const [evalRate, setEvalRate] = useState(100); // 개인·조직 평가 차등 70~130%

  const [customMode, setCustomMode] = useState(false);
  const [basicPctOverride, setBasicPctOverride] = useState(300);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const annualWon = annualSalaryManwon * 10_000;
    const basicWon = monthlyBasicManwon * 10_000;

    const baseGross = customMode
      ? basicWon * (basicPctOverride / 100)
      : scenario.kind === "salaryPct"
        ? annualWon * (scenario.pct / 100)
        : basicWon * (scenario.pct / 100);

    const totalGross = Math.max(0, baseGross * (evalRate / 100));
    const tax = calcBonusNet(annualWon, totalGross, creditRate, applyInsurance);

    return {
      annualWon,
      basicWon,
      baseGross,
      totalGross,
      tax,
      basicPctEquiv: basicWon > 0 ? (totalGross / basicWon) * 100 : 0,
      salaryRatio: annualWon > 0 ? (totalGross / annualWon) * 100 : 0,
    };
  }, [
    scenario,
    annualSalaryManwon,
    monthlyBasicManwon,
    evalRate,
    customMode,
    basicPctOverride,
    creditRate,
    applyInsurance,
  ]);

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
          🎛️ 직접 입력 (기본급 대비 % 지정)
        </button>
        {customMode && (
          <div className="mt-3 space-y-3 p-4 rounded-xl bg-canvas/30">
            <Row label="성과급 % (월 기본급 대비)">
              <input
                type="number"
                value={basicPctOverride}
                onChange={(e) => setBasicPctOverride(Number(e.target.value) || 0)}
                step="10"
                min="0"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </Row>
            <p className="text-xs text-faint">
              현행 제도 범위는 100~530% (서울경제 2026-05-21). 노조가 상한 폐지를
              요구 중이라 530% 초과 값도 입력 가능하게 열어 뒀습니다.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">2단계 · 본인 연봉·월 기본급</h2>
        <div className="grid sm:grid-cols-2 gap-4">
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
            <span className="mt-1 block text-xs text-faint">
              &lsquo;연봉 27%&rsquo; 시나리오와 세후 계산 기준.
            </span>
          </label>
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
            <span className="mt-1 block text-xs text-faint">
              상한 530%·하한 100% 시나리오 기준.
            </span>
          </label>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[6_000, 7_000, 8_000, 10_000, 12_000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setAnnualSalaryManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {m >= 10_000 ? `${m / 10_000}억` : `${m / 1_000}천만`}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          FY2025 사업보고서 기준 평균 연봉 1억원 (DART 2026-03-20 제출).
        </p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-1">3단계 · 개인 평가 차등</h2>
        <p className="text-xs text-faint mb-4">
          회사 실적 + 개인·조직 평가에 따라 차등 지급되는 구조 (조선일보
          2026-05-12). 본인 예상 평가를 반영해 보세요.
        </p>
        <label className="block text-sm font-bold mb-2">
          평가 차등 배율: <span className="text-primary">{evalRate}%</span>
        </label>
        <input
          type="range"
          min={70}
          max={130}
          step={5}
          value={evalRate}
          onChange={(e) => setEvalRate(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-faint mt-1">
          <span>70% (하위 평가)</span>
          <span>100% (평균)</span>
          <span>130% (상위 평가)</span>
        </div>
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

        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <ResultCard
            label="기준 성과급 (차등 전)"
            value={fmtManwon(calc.baseGross)}
            sub={
              customMode
                ? `= 월 기본급 ${monthlyBasicManwon}만 × ${basicPctOverride}%`
                : scenario.kind === "salaryPct"
                  ? `= 연봉 ${annualSalaryManwon.toLocaleString("ko-KR")}만 × ${scenario.pct}%`
                  : `= 월 기본급 ${monthlyBasicManwon}만 × ${scenario.pct}%`
            }
          />
          <ResultCard
            label="평가 차등 반영"
            value={fmtManwon(calc.totalGross)}
            sub={`기준 × ${evalRate}% (개인·조직 평가)`}
          />
          <ResultCard
            label="기본급 환산율"
            value={`${calc.basicPctEquiv.toFixed(0)}%`}
            sub="현행 제도 범위 100~530%"
          />
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 총 성과급 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            연봉 대비 <strong>{calc.salaryRatio.toFixed(1)}%</strong>
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
