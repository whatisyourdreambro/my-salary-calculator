"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

// 기아 임단협 시나리오 (현대차와 동일 패턴, 무상주·정액 차이)
const SCENARIOS = [
  {
    id: "2025-agreed",
    label: "2025 잠정합의 (실제 지급)",
    bonusPercent: 450,
    fixedAmount: 16_000_000, // 1,600만원
    freeShares: 53,
    voucher: 200_000,
    desc: "성과금 350% + 700만 / 격려금 100% + 400만 / World Car 500만 / 무상주 53주 / 상품권 20만",
  },
  {
    id: "2026-union",
    label: "2026 노조 요구안 (협상 중)",
    bonusPercent: 800,
    fixedAmount: 0,
    freeShares: 53,
    voucher: 200_000,
    desc: "상여 800% (정률) + 순이익 30% (정액 가변) + 무상주 + 상품권. 최종 합의 미확정.",
  },
] as const;

const DEFAULT_SALARY_MANWON = 500;
const DEFAULT_KIA_STOCK = 120_000; // 기아 보통주 12만원 (2026)

export default function KiaBonusClient() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIOS)[number]["id"]>("2025-agreed");
  const [monthlyBasicManwon, setMonthlyBasicManwon] = useState(DEFAULT_SALARY_MANWON);
  const [stockPrice, setStockPrice] = useState(DEFAULT_KIA_STOCK);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bonusPctOverride, setBonusPctOverride] = useState(450);
  const [fixedOverride, setFixedOverride] = useState(16_000_000);
  const [sharesOverride, setSharesOverride] = useState(53);
  const [customMode, setCustomMode] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const monthlyBasicWon = monthlyBasicManwon * 10_000;
    const estimatedAnnualSalary = monthlyBasicWon * 18;

    const bp = customMode ? bonusPctOverride : scenario.bonusPercent;
    const fx = customMode ? fixedOverride : scenario.fixedAmount;
    const sh = customMode ? sharesOverride : scenario.freeShares;

    const percentBonusWon = monthlyBasicWon * (bp / 100);
    const fixedBonusWon = fx;
    const freeShareValueWon = sh * stockPrice;
    const voucherWon = scenario.voucher;

    const totalGross = percentBonusWon + fixedBonusWon + freeShareValueWon + voucherWon;
    const tax = calcBonusNet(estimatedAnnualSalary, totalGross, creditRate, applyInsurance);

    return {
      estimatedAnnualSalary,
      percentBonusWon,
      fixedBonusWon,
      freeShareValueWon,
      voucherWon,
      totalGross,
      tax,
      bonusToSalaryRatio: estimatedAnnualSalary > 0 ? (totalGross / estimatedAnnualSalary) * 100 : 0,
    };
  }, [scenarioId, monthlyBasicManwon, stockPrice, customMode, bonusPctOverride, fixedOverride, sharesOverride, creditRate, applyInsurance, scenario]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 시나리오 선택</h2>
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
            customMode ? "border-primary bg-primary/10" : "border-canvas-deep hover:border-primary/40"
          }`}
        >
          🎛️ 직접 입력 (커스텀 시나리오)
        </button>
        {customMode && (
          <div className="mt-3 space-y-3 p-4 rounded-xl bg-canvas/30">
            <Row label="성과금 % (월 기본급 대비)">
              <input
                type="number"
                value={bonusPctOverride}
                onChange={(e) => setBonusPctOverride(Number(e.target.value) || 0)}
                step="10"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </Row>
            <Row label="정액 (원)">
              <input
                type="number"
                value={fixedOverride}
                onChange={(e) => setFixedOverride(Number(e.target.value) || 0)}
                step="100000"
                className="w-40 p-2 rounded border border-canvas-deep tabular-nums"
              />
            </Row>
            <Row label="무상주 (주)">
              <input
                type="number"
                value={sharesOverride}
                onChange={(e) => setSharesOverride(Number(e.target.value) || 0)}
                step="1"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">주</span>
            </Row>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">2단계 · 본인 월 통상임금</h2>
        <label className="block">
          <span className="text-sm font-bold">월 기본급(통상임금) (만원)</span>
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
          추정 연봉(기본급 × 18) = <strong>{fmtEok(calc.estimatedAnnualSalary)}</strong>
        </p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">3단계 · 기아 주가</h2>
        <label className="block">
          <span className="text-sm font-bold">기아 보통주 1주 가격 (원)</span>
          <input
            type="number"
            value={stockPrice}
            onChange={(e) => setStockPrice(Number(e.target.value) || 0)}
            step="1000"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[100_000, 120_000, 140_000, 160_000].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setStockPrice(p)}
              className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition"
            >
              {(p / 10000).toFixed(0)}만
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">2026년 평균 10~14만원 범위.</p>
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
          <ResultCard label="정률 성과금" value={fmtManwon(calc.percentBonusWon)} sub={`= 월 기본급 ${monthlyBasicManwon}만 × ${customMode ? bonusPctOverride : scenario.bonusPercent}%`} />
          <ResultCard label="정액 격려금" value={fmtManwon(calc.fixedBonusWon)} sub="합의안 명시 정액 (World Car 포함)" />
          <ResultCard label="무상주 가치" value={fmtManwon(calc.freeShareValueWon)} sub={`${customMode ? sharesOverride : scenario.freeShares}주 × ${(stockPrice / 10000).toFixed(0)}만원`} />
          <ResultCard label="상품권" value={fmtManwon(calc.voucherWon)} sub="전통시장 상품권" />
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 총 성과급 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            추정 연봉 대비 <strong>{calc.bonusToSalaryRatio.toFixed(0)}%</strong>
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
