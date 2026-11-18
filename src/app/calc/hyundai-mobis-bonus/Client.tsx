"use client";

import { useMemo, useState } from "react";
import { Settings, Lock } from "lucide-react";
import { calcBonusNet, DEFAULT_BONUS_CREDIT_RATE, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";
import NumberInput from "@/components/NumberInput";

// 현대모비스 임단협 시나리오 (현대차그룹 연동형 — 정률 + 정액 + 주식 패키지)
// 출처: 2026 타결 — 더팩트 2026-08-26 (잠정합의안: 기본급 10만원 인상·성과급 400%+1,320만원·주식 8주·복지포인트 50만원)·
//   더팩트 2026-09-04 (올해 임단협 마무리), DART 2026-10-30 주요사항보고서(자기주식처분결정, rcpNo 20261030000571:
//   2026년 단체교섭에 따른 회사주식 지급 96,136주, 처분 예정일 2026-11-30, 처분 상대방 회사 직원).
//   2025 타결 — 전자신문·서울경제·아주경제 2025-10-17.
// 2026-11-17 운영자 승인(N2-calc-19): 2026 타결을 기본값으로, 버튼 수는 그대로 — 두 번째 칩이던 2024 임협 합의
//   (머니S 단독 2024-07-09: 성과금·격려금 총 500% + 1,520만 + 주식 36주)는 2026 타결 칩으로 바꿨다.
//   2024 수치는 page.tsx 의 '최근 지급 연혁' 표와 FAQ 에 그대로 남는다.
const SCENARIOS = [
  {
    id: "2026-settled",
    label: "2026 임단협 타결 (최신)",
    bonusPercent: 400,
    fixedAmount: 13_200_000, // 1,320만원
    freeShares: 8, // 주식 8주 (DART 공시 기준 2026-11-30 지급)
    voucher: 500_000, // 복지포인트 50만 (원 환산)
    voucherLabel: "복지포인트",
    desc: "성과금 400% + 격려금 1,320만 + 주식 8주 + 복지포인트 50만 (주식 11/30 지급, 기본급 월 +10만 별도)",
  },
  {
    id: "2025-settled",
    label: "2025 임단협 타결 (실제 지급)",
    bonusPercent: 450,
    fixedAmount: 14_200_000, // 1,420만원
    freeShares: 17, // 우리사주 17주
    voucher: 200_000, // 재래시장상품권 20만원
    voucherLabel: "재래시장상품권",
    desc: "성과금 450% + 격려금 1,420만 + 우리사주 17주 + 재래시장상품권 20만 (2025-10-17 타결, 기본급 10만원 인상 별도)",
  },
] as const;

const DEFAULT_SALARY_MANWON = 500;
// 주가 기본값 = DART 2026-10-30 주요사항보고서(자기주식처분결정, rcpNo 20261030000571)의 처분 대상 주식가격(보통주)
//   353,000원 — 이사회 결의 전일(2026-10-29) 종가이고, 공시는 '향후 주가 변동에 따라 변동될 수 있음'이라고 적는다.
//   지급일(11/30) 주가 예측이 아니라 날짜가 박힌 공시 기준가다. 2026-11-18 다시 읽어 확인.
// 2026-11-18 운영자 승인(질문 C-11, 광고가 내려가지 않을 때만): 28만 → 35.3만, 빠른 값 버튼 24·28·32·36만 → 27·32·37·42만
//   (버튼 수 그대로, 라벨 폭은 자리마다 종전 이하). 폭 확인은 src/lib/__tests__/r4bMisc2MobisPrice.test.ts.
const DEFAULT_MOBIS_STOCK = 353_000;

export default function HyundaiMobisBonusClient() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIOS)[number]["id"]>("2026-settled");
  const [monthlyBasicManwon, setMonthlyBasicManwon] = useState(DEFAULT_SALARY_MANWON);
  const [stockPrice, setStockPrice] = useState(DEFAULT_MOBIS_STOCK);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bonusPctOverride, setBonusPctOverride] = useState(400);
  const [fixedOverride, setFixedOverride] = useState(13_200_000);
  const [sharesOverride, setSharesOverride] = useState(8);
  const [customMode, setCustomMode] = useState(false);
  const [creditRate, setCreditRate] = useState(DEFAULT_BONUS_CREDIT_RATE);
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
    const shareValueWon = sh * stockPrice;
    const voucherWon = customMode ? 0 : scenario.voucher;

    const totalGross = percentBonusWon + fixedBonusWon + shareValueWon + voucherWon;
    const tax = calcBonusNet(estimatedAnnualSalary, totalGross, creditRate, applyInsurance);

    return {
      estimatedAnnualSalary,
      percentBonusWon,
      fixedBonusWon,
      shareValueWon,
      voucherWon,
      totalGross,
      tax,
      bonusToSalaryRatio: estimatedAnnualSalary > 0 ? (totalGross / estimatedAnnualSalary) * 100 : 0,
    };
  }, [monthlyBasicManwon, stockPrice, customMode, bonusPctOverride, fixedOverride, sharesOverride, creditRate, applyInsurance, scenario]);

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
              <NumberInput
                allowNegative={false}
                aria-label="성과금 % (월 기본급 대비)"
                type="number"
                value={bonusPctOverride}
                onChange={(e) => setBonusPctOverride(Number(e.target.value) || 0)}
                step="10"
                className="w-32 p-2 rounded border border-canvas-deep tabular-nums"
              />
              <span className="text-sm">%</span>
            </Row>
            <Row label="정액 격려금 (원)">
              <NumberInput
                allowNegative={false}
                aria-label="정액 격려금 (원)"
                type="number"
                value={fixedOverride}
                onChange={(e) => setFixedOverride(Number(e.target.value) || 0)}
                step="100000"
                className="w-40 p-2 rounded border border-canvas-deep tabular-nums"
              />
            </Row>
            <Row label="지급 주식 (주)">
              <NumberInput
                allowNegative={false}
                aria-label="지급 주식 (주)"
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
        <h2 className="text-xl font-black mb-4">2단계 · 본인 월 기본급</h2>
        <label className="block">
          <span className="text-sm font-bold">월 기본급(통상임금) (만원)</span>
          <NumberInput
            allowNegative={false}
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
        <h2 className="text-xl font-black mb-4">3단계 · 현대모비스 주가</h2>
        <label className="block">
          <span className="text-sm font-bold">현대모비스 보통주 1주 가격 (원)</span>
          <NumberInput
            allowNegative={false}
            type="number"
            value={stockPrice}
            onChange={(e) => setStockPrice(Number(e.target.value) || 0)}
            step="1000"
            min="0"
            className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[270_000, 320_000, 370_000, 420_000].map((p) => (
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
          기본값은 DART 10/30 공시 처분가(10/29 종가). 지급일 주가로 고쳐 입력하세요.
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
              <label htmlFor="ms-hyundai-mobis-bonus-credit" className="block text-sm font-bold mb-2">
                추가 세액공제: <span className="text-primary">{creditRate}%</span>
              </label>
              <input id="ms-hyundai-mobis-bonus-credit"
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
          <ResultCard label="정액 격려금" value={fmtManwon(calc.fixedBonusWon)} sub="임단협 합의 명시 정액" />
          <ResultCard label="주식(우리사주) 가치" value={fmtManwon(calc.shareValueWon)} sub={`${customMode ? sharesOverride : scenario.freeShares}주 × ${(stockPrice / 10000).toFixed(1).replace(/\.0$/, "")}만원`} />
          <ResultCard label="포인트·상품권" value={fmtManwon(calc.voucherWon)} sub={calc.voucherWon > 0 ? scenario.voucherLabel : "해당 시나리오 상품권 없음"} />
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
          {/* '세전 ' 앞말은 뺐다(C-11, 2026-11-18) — 바로 위 '총 성과급 (세전)' 상자와 같은 값이고, 기본 주가 35.3만에서
              이 줄이 종전(28만, '세전 3,594만원 − 공제 1,221만원 (실효세율 34%)')보다 넓어져 결과 광고 위 상자가 한 줄 늘지 않게 */}
          <p className="text-xs text-faint mt-1">
            {fmtEok(calc.totalGross)} − 공제 {fmtEok(calc.tax.totalDeductions)}{" "}
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
