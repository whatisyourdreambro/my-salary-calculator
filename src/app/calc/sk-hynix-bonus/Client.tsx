"use client";

import { useMemo, useState } from "react";
import { TrendingUp, User, Settings, Lock, Coins, Layers } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";
import {
  AGREEMENT_2026,
  BASIC_RATIO,
  DEFAULT_PROFIT_TRILLION,
  EMPLOYEES,
  PI_2026,
  PI_SCENARIOS,
  PROFIT_SCENARIOS,
  REFERENCE_SALARY,
} from "./psData";

// 지급 방식 — 신 체계(2026 잠정합의)·구 체계(2025년분까지)·주식 100% 선택권.
// 세 방식 모두 항상 계산하고 토글은 "어느 쪽을 크게 보여줄지"만 결정한다
// (잠정합의 미확정 상태에서 한쪽만 보여주면 오정보 리스크).
type PayoutMode = "new" | "old" | "stock100";

const PAYOUT_MODES: { id: PayoutMode; label: string; sub: string }[] = [
  { id: "new", label: "신 체계 40/60", sub: "현금 40% + 자사주 60% (잠정합의)" },
  { id: "old", label: "구 체계 80/20", sub: "현금 80% + 이연 현금 20% (2025년분까지)" },
  { id: "stock100", label: "주식 100%", sub: "본인 선택 시 (이연 20%p 동일 가정)" },
];

export default function SkHynixBonusClient() {
  const [opiTrillion, setOpiTrillion] = useState<number>(DEFAULT_PROFIT_TRILLION); // 영업이익 (조원)
  const [salaryManwon, setSalaryManwon] = useState(10000); // 본인 연봉 (만원, 디폴트 1억)
  const [piHalf1, setPiHalf1] = useState<number>(PI_2026.h1.rate); // 상반기 150% 확정
  const [piHalf2, setPiHalf2] = useState(150); // 하반기 시나리오
  const [payoutMode, setPayoutMode] = useState<PayoutMode>("new");

  // 고급 옵션
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30); // 세액공제율 %
  const [applyInsurance, setApplyInsurance] = useState(true);

  const calc = useMemo(() => {
    const salaryWon = salaryManwon * 10_000;
    const basicWon = salaryWon / BASIC_RATIO;
    const opiWon = opiTrillion * 1_000_000_000_000; // 조 → 원

    // PS: 영업이익 × 10% ÷ 직원수 × (본인연봉/평균) — 연봉 비례 보정 모델
    const psPoolWon = opiWon * AGREEMENT_2026.poolRate;
    const psAvgWon = psPoolWon / EMPLOYEES;
    const psPersonalWon = psAvgWon * (salaryWon / REFERENCE_SALARY);

    // PI: 기본급 × PI% × 2회 (개편 대상은 PS — PI는 현금 유지 가정)
    const piHalf1Won = basicWon * (piHalf1 / 100);
    const piHalf2Won = basicWon * (piHalf2 / 100);
    const piAnnualWon = piHalf1Won + piHalf2Won;

    // ── 지급 방식별 분할 (항상 3종 모두 계산) ──
    // 구 체계: 당해 현금 80% + 이연 현금 10%p × 2년
    const old = {
      cashNow: psPersonalWon * (AGREEMENT_2026.oldSplit.cashNowPct / 100),
      cashY1: psPersonalWon * (AGREEMENT_2026.oldSplit.cashYear1Pct / 100),
      cashY2: psPersonalWon * (AGREEMENT_2026.oldSplit.cashYear2Pct / 100),
      stockNow: 0,
    };
    // 신 체계: 당해 현금 40% + 자사주 40%p(즉시 매도 가능) + 이연 주식 10%p × 2
    const neo = {
      cashNow: psPersonalWon * (AGREEMENT_2026.newSplit.cashNowPct / 100),
      stockNow: psPersonalWon * (AGREEMENT_2026.newSplit.stockNowPct / 100),
      stockY1: psPersonalWon * (AGREEMENT_2026.newSplit.stockYear1Pct / 100),
      stockY2: psPersonalWon * (AGREEMENT_2026.newSplit.stockYear2Pct / 100),
    };
    // 주식 100% 선택권: 현금 0 + 당해 주식 80%p + 이연 주식 10%p × 2 (이연 동일 가정)
    const stock100 = {
      cashNow: 0,
      stockNow: psPersonalWon * 0.8,
      stockY1: psPersonalWon * 0.1,
      stockY2: psPersonalWon * 0.1,
    };

    // 당해 연도 수령분 (세전) — 세 방식 모두 PS의 80% + PI (구성만 다름).
    // 주식 지급분은 하방 보전(지급 첫날 종가 기준)으로 산정액 가치가 보장되므로
    // 산정액 그대로 평가. 지급 시점 시가 기준 근로소득 과세 가정.
    const psCurrentWon = psPersonalWon * 0.8;
    const psDeferredWon = psPersonalWon * 0.2;
    const totalGross = psPersonalWon + piAnnualWon;
    const currentYearGross = psCurrentWon + piAnnualWon;

    // 세후 — 산정총액 기준 / 당해 수령분 기준
    const tax = calcBonusNet(salaryWon, totalGross, creditRate, applyInsurance);
    const taxCurrent = calcBonusNet(salaryWon, currentYearGross, creditRate, applyInsurance);

    return {
      basicWon,
      psPoolWon,
      psAvgWon,
      psPersonalWon,
      psCurrentWon,
      psDeferredWon,
      piHalf1Won,
      piHalf2Won,
      piAnnualWon,
      totalGross,
      currentYearGross,
      old,
      neo,
      stock100,
      tax,
      taxCurrent,
      bonusToSalaryRatio: salaryWon > 0 ? (totalGross / salaryWon) * 100 : 0,
    };
  }, [opiTrillion, salaryManwon, piHalf1, piHalf2, creditRate, applyInsurance]);

  // 현재 토글에 따른 지급 타임라인 행
  const timeline = useMemo(() => {
    if (payoutMode === "old") {
      return [
        { when: "2027년 초 (당해)", what: "현금 80%", amount: calc.old.cashNow },
        { when: "2028년", what: "이연 현금 10%", amount: calc.old.cashY1 },
        { when: "2029년", what: "이연 현금 10%", amount: calc.old.cashY2 },
      ];
    }
    const d = payoutMode === "new" ? calc.neo : calc.stock100;
    const rows = [
      { when: "2027년 2월 (당해)", what: "현금", amount: d.cashNow },
      { when: "2027년 4월 (당해)", what: "자사주 — 즉시 매도 가능", amount: d.stockNow },
      { when: "2028년", what: "자사주 10% — 수령 즉시 처분 가능", amount: d.stockY1 },
      { when: "2029년", what: "자사주 10% — 수령 즉시 처분 가능", amount: d.stockY2 },
    ];
    return payoutMode === "stock100" ? rows.filter((r) => r.amount > 0) : rows;
  }, [payoutMode, calc]);

  return (
    <div className="space-y-6">
      {/* 1. 영업이익 시나리오 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          1단계 · 영업이익 시나리오
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {PROFIT_SCENARIOS.map((s) => (
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
            max="400"
            enterKeyHint="done"
            className="w-full mt-1 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
          />
        </label>
        <p className="mt-3 text-xs text-faint leading-relaxed">
          연간 영업이익 × <strong>10%</strong> 풀 ÷ 직원{" "}
          {EMPLOYEES.toLocaleString()}명 ={" "}
          <strong className="text-primary">{fmtEok(calc.psAvgWon)}</strong> 1인
          평균 PS (평균 연봉 1억 기준). 2026 상반기 실적만 98.2조원(Q1 37.6 +
          Q2 60.5)입니다.
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
            enterKeyHint="done"
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
          3단계 · PI (생산성 격려금)
        </h2>
        <p className="text-sm text-faint mb-4">
          반기별 영업이익률 연동, 기본급의 0~150% × 2회.{" "}
          <strong className="text-primary">
            2026 상반기는 150% 확정(7/28 지급)
          </strong>
          되었습니다. 하반기는 시나리오를 선택하세요.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-2">
              상반기 PI{" "}
              <span className="text-primary font-black">— 150% 확정</span>
            </label>
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
            <label className="block text-xs font-bold mb-2">
              하반기 PI <span className="text-faint font-normal">(2027-01 발표 예정)</span>
            </label>
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

      {/* 4. 지급 방식 — 2026 잠정합의 신구 비교 */}
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          4단계 · PS 지급 방식
        </h2>
        <p className="text-sm text-faint mb-4">
          {AGREEMENT_2026.status === "rejected" ? (
            <>
              2026-08-20 잠정합의안(<strong>8/25 총투표 부결 — 재협상 중</strong>)
              기준 — 부결된 안의 신 체계(현금 40% + 자사주 60%)와 구 체계를
              비교해 보세요.
            </>
          ) : (
            <>
              2026-08-20 임단협 <strong>잠정합의</strong> 기준 — 2026년
              성과급부터 현금 40% + 자사주 60%로 개편 예정. 구 체계와 비교해
              보세요.
            </>
          )}
        </p>
        <div className="grid sm:grid-cols-3 gap-2">
          {PAYOUT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPayoutMode(m.id)}
              className={`p-3 rounded-xl border-2 text-left transition ${
                payoutMode === m.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-canvas-deep hover:border-primary/40"
              }`}
            >
              <div className="text-sm font-black">{m.label}</div>
              <div className="text-[10px] opacity-70 mt-0.5 leading-snug">{m.sub}</div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-faint leading-relaxed">
          자사주는 3개 시점(1월 실적 발표일·2월 현금 지급일·4월 주식 지급일)
          종가 중 <strong>최저가</strong>로 주식 수를 산정하고, 지급 첫날 종가
          기준 가치가 산정액에 못 미치면 부족분을 현금으로 보전합니다(지급 후
          하락분은 보전 없음). 본 계산기는 주식 지급분을 산정액 가치로
          평가합니다.
        </p>
      </section>

      {/* 5. 세금 가정 (고급) */}
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

      {/* 6. 결과 */}
      <section className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          내 성과급 계산 결과
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard
            label="PS 산정 총액"
            value={fmtEok(calc.psPersonalWon)}
            sub={`= 영업이익 ${opiTrillion}조 × 10% ÷ ${EMPLOYEES.toLocaleString()}명 × (연봉/1억)`}
          />
          <ResultCard
            label="연간 PI 합계"
            value={fmtEok(calc.piAnnualWon)}
            sub={`= 기본급 × (${piHalf1}% + ${piHalf2}%) — 현금 지급`}
          />
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

        {/* 지급 타임라인 — 선택한 방식 기준 */}
        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-3">
            🗓️ PS 지급 타임라인 —{" "}
            {PAYOUT_MODES.find((m) => m.id === payoutMode)?.label}
            {payoutMode !== "old" && (
              <span className="ml-1 font-normal">
                {AGREEMENT_2026.status === "rejected"
                  ? "(부결된 잠정합의안 기준 · 재협상 중)"
                  : "(잠정합의 기준 · 2026년 성과급부터)"}
              </span>
            )}
          </p>
          <ul className="space-y-2">
            {timeline.map((row) => (
              <li
                key={row.when + row.what}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-faint whitespace-nowrap">{row.when}</span>
                <span className="flex-1 border-b border-dashed border-canvas-deep" aria-hidden />
                <span className="font-bold">{row.what}</span>
                <span className="font-black tabular-nums text-primary">
                  {fmtEok(row.amount)}
                </span>
              </li>
            ))}
          </ul>
          {payoutMode === "new" && (
            <p className="mt-3 text-[11px] text-faint leading-relaxed">
              💡 당해 수령 비율(80%)은 구 체계와 같습니다 — 달라지는 건 그중
              40%p가 <strong>자사주</strong>(즉시 매도 가능)로 지급된다는 점.
              최저가 기준 산정 + 지급일 하방 보전으로{" "}
              <strong>지급 시점 기준 가치는 산정액 이상</strong>이며, 주가
              변동 리스크는 지급 후 보유 구간에만 있습니다.
            </p>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-white border border-canvas-deep p-5">
          <p className="text-xs font-bold text-faint mb-1">
            💰 당해 수령분 (PS 80%
            {payoutMode === "stock100" ? " · 전액 주식" : payoutMode === "new" ? " · 현금+주식" : " · 전액 현금"}{" "}
            + PI 100%) — 세후 실수령
          </p>
          <p className="text-2xl sm:text-3xl font-black tabular-nums">
            {fmtEok(calc.taxCurrent.net)}
          </p>
          <p className="text-xs text-faint mt-1">
            세전 {fmtEok(calc.currentYearGross)} − 공제{" "}
            {fmtEok(calc.taxCurrent.totalDeductions)} (실효세율{" "}
            <strong>{calc.taxCurrent.effectiveRate}%</strong>)
          </p>
          <p className="text-[10px] text-faint mt-2 leading-relaxed">
            * 주식 지급분도 지급 시점 시가 기준 근로소득 합산 과세로
            가정했습니다. 실제 세무 처리는 회사 안내를 확인하세요.
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
            * PS 이연분 {fmtEok(calc.psDeferredWon)} 은{" "}
            {payoutMode === "old"
              ? "2년에 걸쳐 현금 10%씩 분할 지급"
              : "1·2년 후 자사주 10%p씩 지급(수령 즉시 처분 가능)"}{" "}
            — 수령 연도 소득에 합산 과세되어 여기 세후에는 미반영.
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
