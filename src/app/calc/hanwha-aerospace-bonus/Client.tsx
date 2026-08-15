"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// 한화에어로스페이스 BPI(전사 경영성과급) + VEI(조직별 성과급) 시나리오.
// FY2025 실적분 사업부별 지급률: 한국경제TV 단독·알파경제 2026-02-13 보도.
// FY2024 실적분 710% + 500만: 뉴스1·파이낸셜뉴스 2025-02-19 보도.
const DIVISIONS = [
  {
    id: "ls",
    label: "지상방산 (LS)",
    percent: 725,
    desc: "K9·천무 등 지상방산 — 사업부 최고 지급률",
  },
  {
    id: "pgm",
    label: "유도무기 (PGM)",
    percent: 702.8,
    desc: "정밀유도무기 사업부",
  },
  {
    id: "mro",
    label: "MRO",
    percent: 510.6,
    desc: "항공기 정비 사업부",
  },
  {
    id: "aviation",
    label: "항공",
    percent: 494.8,
    desc: "항공엔진 사업부",
  },
  {
    id: "others",
    label: "그 외 사업부",
    percent: 497,
    desc: "보도 기준 497~507%대 — 보수적으로 하한 497% 적용",
  },
] as const;

const SCENARIOS = [
  {
    id: "fy2025",
    label: "FY2025 실적분 (2026년 2월 지급)",
    fixedAmount: 4_000_000, // 목표 영업이익 초과 달성 정액 인센티브 400만원
    desc: "사업부별 차등 494.8~725% + 전 임직원 정액 400만원 (한국경제TV 단독·알파경제 2026-02-13)",
  },
  {
    id: "fy2024",
    label: "FY2024 실적분 (2025년 2월 지급)",
    percent: 710,
    fixedAmount: 5_000_000, // 일시금 500만원
    desc: "기본급의 710% + 일시금 500만원 (뉴스1·파이낸셜뉴스 2025-02-19)",
  },
] as const;

const DEFAULT_BASIC_MANWON = 450; // 월 기본급 (만원)
const DEFAULT_ANNUAL_MANWON = 12_400; // FY2025 사업보고서 평균연봉 1억2,400만원 (DART)

export default function HanwhaAerospaceBonusClient() {
  const [scenarioId, setScenarioId] =
    useState<(typeof SCENARIOS)[number]["id"]>("fy2025");
  const [divisionId, setDivisionId] =
    useState<(typeof DIVISIONS)[number]["id"]>("ls");
  const [monthlyBasicManwon, setMonthlyBasicManwon] = useState(DEFAULT_BASIC_MANWON);
  const [annualSalaryManwon, setAnnualSalaryManwon] = useState(DEFAULT_ANNUAL_MANWON);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [bonusPctOverride, setBonusPctOverride] = useState(725);
  const [fixedOverride, setFixedOverride] = useState(4_000_000);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const division = DIVISIONS.find((d) => d.id === divisionId)!;

  const effectivePercent = customMode
    ? bonusPctOverride
    : scenarioId === "fy2025"
      ? division.percent
      : 710;
  const effectiveFixed = customMode ? fixedOverride : scenario.fixedAmount;

  const calc = useMemo(() => {
    const monthlyBasicWon = monthlyBasicManwon * 10_000;
    const annualSalaryWon = annualSalaryManwon * 10_000;

    const percentBonusWon = monthlyBasicWon * (effectivePercent / 100);
    const fixedBonusWon = effectiveFixed;
    const totalGross = percentBonusWon + fixedBonusWon;
    const tax = calcBonusNet(annualSalaryWon, totalGross, creditRate, applyInsurance);

    return {
      annualSalaryWon,
      percentBonusWon,
      fixedBonusWon,
      totalGross,
      tax,
      bonusToSalaryRatio:
        annualSalaryWon > 0 ? (totalGross / annualSalaryWon) * 100 : 0,
    };
  }, [
    monthlyBasicManwon,
    annualSalaryManwon,
    effectivePercent,
    effectiveFixed,
    creditRate,
    applyInsurance,
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 지급 연도 선택</h2>
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
          🎛️ 직접 입력 (커스텀 시나리오)
        </button>
        {customMode && (
          <div className="mt-3 space-y-3 p-4 rounded-xl bg-canvas/30">
            <Row label="성과급 % (월 기본급 대비)">
              <input
                type="number"
                value={bonusPctOverride}
                onChange={(e) => setBonusPctOverride(Number(e.target.value) || 0)}
                step="10"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </Row>
            <Row label="정액 인센티브 (원)">
              <input
                type="number"
                value={fixedOverride}
                onChange={(e) => setFixedOverride(Number(e.target.value) || 0)}
                step="100000"
                className="w-40 p-2 rounded border border-canvas-deep tabular-nums"
              />
            </Row>
          </div>
        )}
      </section>

      {scenarioId === "fy2025" && !customMode && (
        <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
          <h2 className="text-xl font-black mb-1">2단계 · 소속 사업부 선택</h2>
          <p className="text-xs text-faint mb-4">
            VEI(조직별 성과급)가 사업부·실별 KPI 달성도에 따라 차등 산정되어 사업부마다
            지급률이 다릅니다.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {DIVISIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDivisionId(d.id)}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  divisionId === d.id
                    ? "border-primary bg-primary/10"
                    : "border-canvas-deep hover:border-primary/40"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-sm">{d.label}</span>
                  <span className="font-black text-primary tabular-nums">
                    {d.percent}%
                  </span>
                </div>
                <div className="text-xs text-faint mt-1 leading-relaxed">{d.desc}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">
          {scenarioId === "fy2025" && !customMode ? "3단계" : "2단계"} · 본인 월 기본급
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
          {[300, 400, 450, 550, 650].map((m) => (
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
          BPI·VEI는 <strong>월 기본급 대비 %</strong>로 지급됩니다. 급여명세서의 기본급
          항목을 입력하세요.
        </p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">
          {scenarioId === "fy2025" && !customMode ? "4단계" : "3단계"} · 본인 연봉 (세금
          계산용)
        </h2>
        <label className="block">
          <span className="text-sm font-bold">연봉 (만원)</span>
          <input
            type="number"
            value={annualSalaryManwon}
            onChange={(e) => setAnnualSalaryManwon(Number(e.target.value) || 0)}
            step="100"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[8_000, 10_000, 12_400, 15_000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setAnnualSalaryManwon(m)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {m >= 10_000
                ? `${(m / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}억`
                : `${m.toLocaleString("ko-KR")}만`}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          누진세율 계산 기준. 디폴트 1억 2,400만원은 FY2025 사업보고서(DART) 평균연봉
          공시값입니다.
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
          <Lock className="w-5 h-5 text-primary" />내 성과급 계산 결과
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard
            label="정률 성과급 (BPI+VEI)"
            value={fmtManwon(calc.percentBonusWon)}
            sub={`= 월 기본급 ${monthlyBasicManwon.toLocaleString("ko-KR")}만 × ${effectivePercent}%${
              scenarioId === "fy2025" && !customMode ? ` (${division.label})` : ""
            }`}
          />
          <ResultCard
            label="정액 인센티브"
            value={fmtManwon(calc.fixedBonusWon)}
            sub={
              customMode
                ? "직접 입력값"
                : scenarioId === "fy2025"
                  ? "목표 영업이익 초과 달성 — 전 임직원 400만원"
                  : "2025년 2월 일시금 500만원"
            }
          />
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 총 성과급 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            연봉 대비 <strong>{calc.bonusToSalaryRatio.toFixed(0)}%</strong>
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
