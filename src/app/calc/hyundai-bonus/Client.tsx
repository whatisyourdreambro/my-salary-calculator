"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";
import NumberInput from "@/components/NumberInput";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";

// 2026 임협 타결(8/31 찬반투표 가결) / 2025 합의(전년 실지급) 시나리오
// 2026 타결 수치 출처: 머니투데이·한국경제 2026-09-01 보도 (찬성 61.55%·투표율 78.63%).
// 운영자 승인 2026-09-03 — 2026 노조 요구안(800%·순이익 30%) 시나리오는 타결로 종료돼 제거.
const SCENARIOS = [
  {
    id: "2026-agreed",
    label: "2026 임협 타결 보도 (8/31 가결)",
    bonusPercent: 400,
    fixedAmount: 12_700_000, // 1,270만원
    freeShares: 15,
    voucher: 500_000, // 복지포인트 50만 (원 환산)
    voucherLabel: "복지포인트 50만",
    desc: "성과금 400% + 정액 1,270만 / 주식 15주 / 복지포인트 50만 / 기본급 월 +10만 (하계휴가비 +20만 별도)",
  },
  {
    id: "2025-agreed",
    label: "2025 합의 보도 시나리오",
    bonusPercent: 450,
    fixedAmount: 15_800_000, // 1,580만원
    freeShares: 30,
    voucher: 200_000,
    voucherLabel: "전통시장 상품권 20만",
    desc: "성과금 350% + 700만 / 격려금 100% + 380만 / 추가 500만 / 무상주 30주 / 상품권 20만",
  },
] as const;

const DEFAULT_SALARY_MANWON = 500; // 성과금 산정에 쓰는 월 기준금액 예시
const DEFAULT_HYUNDAI_STOCK = 230_000; // 비교용 주가 예시, 실시간 시세가 아님

export default function HyundaiBonusClient() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIOS)[number]["id"]>("2026-agreed");
  const [monthlyBasicManwon, setMonthlyBasicManwon] = useState(DEFAULT_SALARY_MANWON);
  const [stockPrice, setStockPrice] = useState(DEFAULT_HYUNDAI_STOCK);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bonusPctOverride, setBonusPctOverride] = useState(400);
  const [fixedOverride, setFixedOverride] = useState(12_700_000);
  const [sharesOverride, setSharesOverride] = useState(15);
  const [customMode, setCustomMode] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const calc = useMemo(() => {
    const monthlyBasicWon = monthlyBasicManwon * 10_000;
    // 세금 비교 모델의 연봉 가정: 월 기준금액 × 18. 실제 개인 연봉이 아님.
    const estimatedAnnualSalary = monthlyBasicWon * 18;

    const bp = customMode ? bonusPctOverride : scenario.bonusPercent;
    const fx = customMode ? fixedOverride : scenario.fixedAmount;
    const sh = customMode ? sharesOverride : scenario.freeShares;

    const percentBonusWon = monthlyBasicWon * (bp / 100);
    const fixedBonusWon = fx;
    const freeShareValueWon = sh * stockPrice;
    // 커스텀 입력 시에는 시나리오의 복지포인트·상품권을 합산하지 않는다.
    // 종전에는 직전에 눌렀던 시나리오의 voucher 가 계속 더해져, 화면에 보이는
    // 커스텀 입력이 완전히 같아도 총 성과급이 최대 30만원 달라졌다.
    // (gs-caltex-bonus 가 이미 쓰는 패턴과 통일)
    const voucherWon = customMode ? 0 : scenario.voucher;

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

  const inputsValid = Number.isFinite(monthlyBasicManwon) && monthlyBasicManwon > 0
    && Number.isFinite(stockPrice) && stockPrice >= 0
    && Number.isFinite(creditRate) && creditRate >= 0 && creditRate <= 50
    && (!customMode || [bonusPctOverride, fixedOverride, sharesOverride]
      .every(value => Number.isFinite(value) && value >= 0));
  const measurement = useCalculatorMeasurement({
    calcType: "hyundai-bonus",
    valid: inputsValid && [calc.totalGross, calc.tax.net, calc.tax.totalDeductions]
      .every(Number.isFinite),
    resultKey: calc,
  });

  return (
    <div className="space-y-6">
      {/* 시나리오 */}
      <section {...measurement.inputProps} className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 시나리오 선택</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={scenarioId === s.id && !customMode}
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
            <Row label="성과금 % (월 기준금액 대비)">
              <NumberInput
                type="number"
                value={bonusPctOverride}
                onChange={(e) => setBonusPctOverride(Number(e.target.value) || 0)}
                step="10"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </Row>
            <Row label="정액 (원)">
              <NumberInput
                type="number"
                value={fixedOverride}
                onChange={(e) => setFixedOverride(Number(e.target.value) || 0)}
                step="100000"
                className="w-40 p-2 rounded border border-canvas-deep tabular-nums"
              />
            </Row>
            <Row label="무상주 (주)">
              <NumberInput
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

      {/* 회사 지급 안내에서 확인한 월 기준금액 */}
      <section {...measurement.inputProps} id="hyundai-bonus-input" className="scroll-mt-28 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">2단계 · 성과금 산정 월 기준금액</h2>
        <label className="block">
          <span className="text-sm font-bold">회사 지급 안내의 월 기준금액 (만원)</span>
          <NumberInput
            type="number"
            value={monthlyBasicManwon}
            onChange={(e) => setMonthlyBasicManwon(Number(e.target.value) || 0)}
            step="10"
            min="0"
            aria-describedby="hyundai-basis-help"
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
        <p id="hyundai-basis-help" className="mt-2 text-xs leading-relaxed text-faint">
          기본급·통상임금·연봉 ÷ 12가 서로 같다고 가정하지 마세요. 회사 합의안이나 지급 안내에서 성과금 산정 기준을 확인해 입력합니다.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-faint">
          세금 비교에 쓰는 연봉 가정(월 기준금액 × 18) ={" "}
          <strong>{fmtEok(calc.estimatedAnnualSalary)}</strong>
          . 실제 연봉이나 개인별 원천징수액을 재현하는 계산은 아닙니다.
        </p>
      </section>

      {/* 주가 */}
      <section {...measurement.inputProps} className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">3단계 · 주식 가치 비교용 주가</h2>
        <label className="block">
          <span className="text-sm font-bold">현대차 보통주 1주 가격 가정 (원)</span>
          <NumberInput
            type="number"
            value={stockPrice}
            onChange={(e) => setStockPrice(Number(e.target.value) || 0)}
            step="1000"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[200_000, 230_000, 260_000, 300_000].map((p) => (
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
        <p className="mt-2 text-xs text-faint">
          기본값 23만원은 계산용 예시입니다. 현재가·평균 주가가 아니며, 주식 평가액은 입력한 주가 × 주식 수로 계산합니다.
        </p>
      </section>

      {/* 세금 가정 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          aria-controls="hyundai-tax-assumptions"
          className="flex items-center gap-2 font-bold text-base"
        >
          <Settings className="w-4 h-4" />
          세금 계산 가정 조정 {showAdvanced ? "▲" : "▼"}
        </button>
        {showAdvanced && (
          <div {...measurement.inputProps} id="hyundai-tax-assumptions" className="mt-4 space-y-4">
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
            <p className="text-xs leading-relaxed text-faint">
              연봉과 성과급을 합산한 세금 차이를 비교하는 모델입니다. 기본 공제율 30%는 가정이며,
              실제 상여 지급대상기간·개인별 공제·보험료 정산은 회사 급여명세서에서 확인하세요.
            </p>
          </div>
        )}
      </section>

      {/* 결과 */}
      <section ref={measurement.resultRef} className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          입력 가정에 따른 성과급 비교
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard label="정률 성과금" value={fmtManwon(calc.percentBonusWon)} sub={`= 월 기준금액 ${monthlyBasicManwon}만 × ${customMode ? bonusPctOverride : scenario.bonusPercent}%`} />
          <ResultCard label="정액 성과금·격려금" value={fmtManwon(calc.fixedBonusWon)} sub={customMode ? "직접 입력한 정액" : "선택한 보도 시나리오의 정액"} />
          <ResultCard label="주식 평가액" value={fmtManwon(calc.freeShareValueWon)} sub={`${customMode ? sharesOverride : scenario.freeShares}주 × ${stockPrice.toLocaleString("ko-KR")}원 (주가 가정)`} />
          <ResultCard label="포인트·상품권" value={fmtManwon(calc.voucherWon)} sub={customMode ? "직접 입력 모드 — 시나리오 포인트 미포함" : scenario.voucherLabel} />
        </div>

        <dl className="mb-5 space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt className="text-faint">현금 항목 합계 (세전)</dt>
            <dd className="font-bold tabular-nums">{fmtManwon(calc.percentBonusWon + calc.fixedBonusWon)}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt className="text-faint">주식·포인트 평가액 (비현금)</dt>
            <dd className="font-bold tabular-nums">{fmtManwon(calc.freeShareValueWon + calc.voucherWon)}</dd>
          </div>
        </dl>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">현금·비현금 합산 가치 (공제 전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
          <p className="text-xs text-faint mt-1">
            추정 연봉 대비 <strong>{calc.bonusToSalaryRatio.toFixed(0)}%</strong>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">예상 공제 후 합산 가치</p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">
            {fmtEok(calc.tax.net)}
          </p>
          <p className="text-xs text-faint mt-1">
            합산 {fmtEok(calc.totalGross)} − 예상 공제{" "}
            {fmtEok(calc.tax.totalDeductions)} (합산 가치 대비 공제 비율{" "}
            <strong>{calc.tax.effectiveRate}%</strong>)
          </p>
          <p className="mt-3 text-xs leading-relaxed text-faint">
            주식·포인트 평가액이 포함된 비교값입니다. 전액을 현금으로 받는다는 뜻이 아니며,
            실제 입금액은 지급 항목·원천징수·정산 조건에 따라 달라집니다.
          </p>
        </div>

        <details className="mt-4 text-xs">
          <summary className="cursor-pointer font-bold text-faint">
            예상 공제 내역과 계산 범위
          </summary>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <DeductItem label="소득세" value={fmtManwon(calc.tax.incomeTaxDelta)} />
            <DeductItem label="지방세" value={fmtManwon(calc.tax.localTaxDelta)} />
            <DeductItem label="국민연금" value={fmtManwon(calc.tax.pensionDelta)} />
            <DeductItem label="건강+요양" value={fmtManwon(calc.tax.healthDelta)} />
            <DeductItem label="고용보험" value={fmtManwon(calc.tax.empInsDelta)} />
          </div>
          <p className="mt-3 text-faint">
            이 모델은 주식·포인트도 합산 소득처럼 처리합니다. 비현금 항목의 실제 과세 여부·평가 시점과
            주식 처분 시 세금은 지급 조건에 따라 별도 확인해야 합니다. 상여 지급월의 원천징수액과는 다를 수 있습니다.
          </p>
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
