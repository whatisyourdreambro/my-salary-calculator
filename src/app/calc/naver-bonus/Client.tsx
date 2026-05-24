"use client";

import { useMemo, useState } from "react";
import { Settings, Lock, Coins, Search } from "lucide-react";
import { calcBonusNet, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

const PI_SCENARIOS = [
  { value: 10, label: "10% (낮은 평가)" },
  { value: 20, label: "20% (보통)" },
  { value: 30, label: "30% (높음)" },
  { value: 40, label: "40% (최상위)" },
] as const;

const DEFAULT_SALARY_MANWON = 8000; // 네이버 평균 8천만~1억
const DEFAULT_NAVER_STOCK = 230_000;
const DEFAULT_RSU_SHARES = 50; // 일반 직원 RSU 가정

export default function NaverBonusClient() {
  const [salaryManwon, setSalaryManwon] = useState(DEFAULT_SALARY_MANWON);
  const [piPercent, setPiPercent] = useState<number>(20);
  const [rsuShares, setRsuShares] = useState(DEFAULT_RSU_SHARES);
  const [stockPrice, setStockPrice] = useState(DEFAULT_NAVER_STOCK);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creditRate, setCreditRate] = useState(30);
  const [applyInsurance, setApplyInsurance] = useState(true);

  const calc = useMemo(() => {
    const salaryWon = salaryManwon * 10_000;
    // 기본급(월) = 연봉 / 12 (네이버는 별도 상여 없는 연봉제 가정)
    const monthlyBasicWon = salaryWon / 12;

    const piWon = monthlyBasicWon * (piPercent / 100) * 12; // 연 PI = 월 기본급 × % × 12 (단순화: 연봉 × %)
    // 다시 보면 PI는 연봉 대비 %로 보는 게 일반적 — 연봉 × % 로 단순화
    const piWonSimple = salaryWon * (piPercent / 100);

    const rsuValueWon = rsuShares * stockPrice;
    const totalGross = piWonSimple + rsuValueWon;

    const tax = calcBonusNet(salaryWon, totalGross, creditRate, applyInsurance);

    return {
      piWon: piWonSimple,
      rsuValueWon,
      totalGross,
      tax,
      bonusToSalaryRatio: salaryWon > 0 ? (totalGross / salaryWon) * 100 : 0,
    };
  }, [salaryManwon, piPercent, rsuShares, stockPrice, creditRate, applyInsurance]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4">1단계 · 본인 연봉</h2>
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
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[5500, 7000, 9000, 12000, 15000].map((m) => (
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
        <p className="mt-2 text-xs text-faint">
          네이버 신입 5,500만원~ / 평균 8,000만원~1.2억 / 시니어 1.5억+
        </p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          2단계 · PI (정기 인센티브) 평가
        </h2>
        <p className="text-sm text-faint mb-3">연봉의 % 형태로 연 1회 지급.</p>
        <div className="grid grid-cols-4 gap-2">
          {PI_SCENARIOS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setPiPercent(s.value)}
              className={`p-3 rounded-xl border-2 text-left transition ${
                piPercent === s.value
                  ? "border-primary bg-primary/10"
                  : "border-canvas-deep hover:border-primary/40"
              }`}
            >
              <div className="font-bold text-lg">{s.value}%</div>
              <div className="text-[10px] text-faint mt-0.5">{s.label.split(" ")[1]?.replace(/[()]/g, "")}</div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-faint">
          PI 금액 = 연봉 {salaryManwon}만 × {piPercent}% ={" "}
          <strong className="text-primary">{fmtManwon(calc.piWon)}</strong>
        </p>
      </section>

      <section className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          3단계 · RSU (자사주 보상)
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-bold">RSU 부여 주식 수 (주)</span>
            <input
              type="number"
              value={rsuShares}
              onChange={(e) => setRsuShares(Number(e.target.value) || 0)}
              step="1"
              min="0"
              className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
            />
            <div className="mt-2 grid grid-cols-4 gap-1">
              {[10, 50, 100, 300].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRsuShares(n)}
                  className="py-1 rounded text-xs font-bold border border-canvas-deep hover:border-primary/40"
                >
                  {n}주
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-bold">네이버 주가 (원)</span>
            <input
              type="number"
              value={stockPrice}
              onChange={(e) => setStockPrice(Number(e.target.value) || 0)}
              step="1000"
              min="0"
              className="w-full mt-2 p-3 rounded-lg border border-canvas-deep text-lg font-bold tabular-nums focus:outline-none focus:border-primary"
            />
            <div className="mt-2 grid grid-cols-4 gap-1">
              {[200_000, 230_000, 260_000, 300_000].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setStockPrice(p)}
                  className="py-1 rounded text-xs font-bold border border-canvas-deep hover:border-primary/40"
                >
                  {(p / 10000).toFixed(0)}만
                </button>
              ))}
            </div>
          </label>
        </div>
        <p className="mt-3 text-xs text-faint">
          RSU 가치 = {rsuShares}주 × {(stockPrice / 10000).toFixed(0)}만원 ={" "}
          <strong className="text-primary">{fmtManwon(calc.rsuValueWon)}</strong>
          {" "}(2025년 평균 RSU 1인당 약 2,765만원, 임원·핵심 인재 위주)
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
          내 성과급 + RSU 계산 결과
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ResultCard label="정기 PI" value={fmtManwon(calc.piWon)} sub={`= 연봉 × ${piPercent}%`} />
          <ResultCard label="RSU 가치" value={fmtManwon(calc.rsuValueWon)} sub={`${rsuShares}주 × ${(stockPrice / 10000).toFixed(0)}만원`} />
        </div>

        <div className="rounded-xl bg-white border border-primary/30 p-5">
          <p className="text-xs font-bold text-faint mb-1">📊 PI + RSU 총 (세전)</p>
          <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">
            {fmtEok(calc.totalGross)}
          </p>
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
          <p className="mt-3 text-faint">
            * RSU는 가득 시점 시가가 근로소득으로 과세. 코스피 상장주 매도 시 일반 직원은 양도세 비과세.
          </p>
        </details>
      </section>
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
