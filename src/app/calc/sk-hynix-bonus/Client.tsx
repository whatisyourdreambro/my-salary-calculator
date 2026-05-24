"use client";

import { useMemo, useState } from "react";
import { TrendingUp, User, Settings, Lock, Coins } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// ────────────────────────────────────────────────────────────
// SK하이닉스 PS·PI 정책 고정값 (공개 보도/노사 합의 기반)
// ────────────────────────────────────────────────────────────
const EMPLOYEES = 35_000; // SK하이닉스 직원 수 (사업보고서 기준 추정)
const REFERENCE_SALARY = 100_000_000; // 평균 직원 연봉 1억 (보도 기준)
const PS_POOL_RATE = 0.10; // 영업이익의 10%
const BASIC_RATIO = 20; // 기본급 = 연봉 / 20
const CURRENT_PAYOUT_RATE = 0.80; // 80% 당해 지급 / 20% 2년 이연

// 영업이익 시나리오 (조 단위)
const OPI_SCENARIOS = [
  { id: "conservative", label: "보수", trillion: 8, hint: "다운사이클 가정" },
  { id: "normal", label: "평년", trillion: 17, hint: "최근 5년 평균" },
  { id: "actual2024", label: "2024 실적", trillion: 23.4, hint: "HBM 폭증" },
  { id: "boom", label: "호황", trillion: 30, hint: "2025-26 가이던스" },
] as const;

// PI 시나리오 (반기당 %)
const PI_SCENARIOS = [
  { value: 0, label: "0% (영업적자)" },
  { value: 75, label: "75% (평년)" },
  { value: 100, label: "100% (양호)" },
  { value: 150, label: "150% (최대치)" },
] as const;

export default function SkHynixBonusClient() {
  const [opiTrillion, setOpiTrillion] = useState(23.4); // 영업이익 (조원)
  const [salaryManwon, setSalaryManwon] = useState(10000); // 본인 연봉 (만원, 디폴트 1억)
  const [piHalf1, setPiHalf1] = useState(100); // 상반기 PI %
  const [piHalf2, setPiHalf2] = useState(100); // 하반기 PI %

  // 고급 옵션
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30); // 세액공제율 %
  const [applyInsurance, setApplyInsurance] = useState(true);

  const calc = useMemo(() => {
    const salaryWon = salaryManwon * 10_000;
    const basicWon = salaryWon / BASIC_RATIO;
    const opiWon = opiTrillion * 1_000_000_000_000; // 조 → 원

    // PS: 영업이익 × 10% / 직원수 × (본인연봉/평균)
    const psPoolWon = opiWon * PS_POOL_RATE;
    const psAvgWon = psPoolWon / EMPLOYEES;
    const psPersonalWon = psAvgWon * (salaryWon / REFERENCE_SALARY);
    const psCurrentWon = psPersonalWon * CURRENT_PAYOUT_RATE; // 80% 당해 지급분

    // PI: 기본급 × PI% × 2회
    const piHalf1Won = basicWon * (piHalf1 / 100);
    const piHalf2Won = basicWon * (piHalf2 / 100);
    const piAnnualWon = piHalf1Won + piHalf2Won;

    // 총 산정액 (PS 산정총액 + 연 PI)
    const totalGross = psPersonalWon + piAnnualWon;

    // 당해 지급 기준 (PS 80% + PI 100%)
    const currentYearGross = psCurrentWon + piAnnualWon;

    // 세후 — 산정총액 기준
    const tax = calcBonusNet(salaryWon, totalGross, creditRate, applyInsurance);
    // 세후 — 당해 지급분 기준
    const taxCurrent = calcBonusNet(salaryWon, currentYearGross, creditRate, applyInsurance);

    return {
      basicWon,
      psPoolWon,
      psAvgWon,
      psPersonalWon,
      psCurrentWon,
      psDeferredWon: psPersonalWon - psCurrentWon,
      piHalf1Won,
      piHalf2Won,
      piAnnualWon,
      totalGross,
      currentYearGross,
      tax,
      taxCurrent,
      // 합산 후 연봉 대비 비율
      bonusToSalaryRatio: salaryWon > 0 ? (totalGross / salaryWon) * 100 : 0,
    };
  }, [opiTrillion, salaryManwon, piHalf1, piHalf2, creditRate, applyInsurance]);

  return (
    <div className="space-y-6">
      {/* 1. 영업이익 시나리오 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          1단계 · 영업이익 시나리오
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {OPI_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setOpiTrillion(s.trillion)}
              className={`p-3 rounded-xl border-2 text-left transition ${
                opiTrillion === s.trillion
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-canvas-deep hover:border-primary/40"
              }`}
            >
              <div className="text-xs font-bold opacity-70">{s.label}</div>
              <div className="text-lg font-black">{s.trillion}조</div>
              <div className="text-[10px] opacity-60 mt-0.5">{s.hint}</div>
            </button>
          ))}
        </div>
        <label className="block">
          <span className="text-xs font-bold text-faint">또는 직접 입력 (조원)</span>
          <input
            type="number"
            value={opiTrillion}
            onChange={(e) => setOpiTrillion(Number(e.target.value) || 0)}
            step="0.5"
            min="0"
            max="100"
            className="w-full mt-1 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <p className="mt-3 text-xs text-faint leading-relaxed">
          연간 영업이익 × <strong>10%</strong> 풀 ÷ 직원 약 35,000명 ={" "}
          <strong className="text-primary">{fmtManwon(calc.psAvgWon)}</strong>{" "}
          1인 평균 PS (평균 연봉 1억 기준)
        </p>
      </section>

      {/* 2. 본인 연봉 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          2단계 · 본인 연봉
        </h2>
        <label className="block">
          <span className="text-sm font-bold">연 기본 연봉 (만원)</span>
          <input
            type="number"
            value={salaryManwon}
            onChange={(e) => setSalaryManwon(Number(e.target.value) || 0)}
            step="100"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[7000, 10000, 13000, 16000, 20000].map((m) => (
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
        <p className="mt-3 text-xs text-faint">
          기본급 (PI 계산 기준) = 연봉 ÷ 20 ={" "}
          <strong className="text-primary">{fmtManwon(calc.basicWon)}</strong>
        </p>
      </section>

      {/* 3. PI 시나리오 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          3단계 · PI (생산성 격려금) 시나리오
        </h2>
        <p className="text-sm text-faint mb-4">
          반기별 사업부 영업이익률 연동. 기본급의 0~150% × 2회.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-2">상반기 PI</label>
            <div className="grid grid-cols-4 gap-1">
              {PI_SCENARIOS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setPiHalf1(s.value)}
                  className={`p-2 rounded text-xs font-bold border transition ${
                    piHalf1 === s.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-canvas-deep hover:border-primary/40"
                  }`}
                >
                  {s.value}%
                </button>
              ))}
            </div>
            <p className="text-[10px] text-faint mt-1">
              {fmtManwon(calc.piHalf1Won)} 지급
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold mb-2">하반기 PI</label>
            <div className="grid grid-cols-4 gap-1">
              {PI_SCENARIOS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setPiHalf2(s.value)}
                  className={`p-2 rounded text-xs font-bold border transition ${
                    piHalf2 === s.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-canvas-deep hover:border-primary/40"
                  }`}
                >
                  {s.value}%
                </button>
              ))}
            </div>
            <p className="text-[10px] text-faint mt-1">
              {fmtManwon(calc.piHalf2Won)} 지급
            </p>
          </div>
        </div>
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

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard label="PS 산정 총액" value={fmtEok(calc.psPersonalWon)} sub={`= 영업이익 ${opiTrillion}조 × 10% ÷ ${EMPLOYEES.toLocaleString()}명 × (연봉/1억)`} />
          <ResultCard label="연간 PI 합계" value={fmtEok(calc.piAnnualWon)} sub={`= 기본급 × (${piHalf1}% + ${piHalf2}%)`} />
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 PS + PI 산정 총액 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            본인 연봉 대비 <strong>{calc.bonusToSalaryRatio.toFixed(0)}%</strong>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">
            💰 당해 지급 (PS 80% + PI 100%) — 세후 실수령
          </p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">
            {fmtEok(calc.taxCurrent.net)}
          </p>
          <p className="text-xs text-faint mt-1">
            세전 {fmtEok(calc.currentYearGross)} − 공제{" "}
            {fmtEok(calc.taxCurrent.totalDeductions)} (실효세율{" "}
            <strong>{calc.taxCurrent.effectiveRate}%</strong>)
          </p>
        </div>

        <details className="mt-4 text-xs">
          <summary className="cursor-pointer font-bold text-faint">
            🧾 세금 상세 — 산정 총액 기준 공제 내역
          </summary>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <DeductItem label="소득세" value={fmtManwon(calc.tax.incomeTaxDelta)} />
            <DeductItem label="지방세" value={fmtManwon(calc.tax.localTaxDelta)} />
            <DeductItem label="국민연금" value={fmtManwon(calc.tax.pensionDelta)} />
            <DeductItem label="건강+요양" value={fmtManwon(calc.tax.healthDelta)} />
            <DeductItem label="고용보험" value={fmtManwon(calc.tax.empInsDelta)} />
          </div>
          <p className="mt-3 text-faint">
            * 산정 총액 {fmtEok(calc.totalGross)} 기준 세후 실수령 ={" "}
            <strong>{fmtEok(calc.tax.net)}</strong> (실효세율{" "}
            {calc.tax.effectiveRate}%)
          </p>
          <p className="mt-1 text-faint">
            * PS 이연분 {fmtEok(calc.psDeferredWon)} 은 향후 2년에 걸쳐 10%씩
            분할 지급 (당해 미수령)
          </p>
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
      <p className="text-xl sm:text-2xl font-black tabular-nums">{value}</p>
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
