"use client";

// SK하이닉스 자사주 성과급 — 주가 시나리오 시뮬레이터 (독립 입력 위젯).
// 위 메인 계산기와 상태를 공유하지 않는다 (삼성 TaiCalculator 패턴).
// 신 체계(현금 40% + 자사주 60%: 당해 40%p + 1·2년 이연 10%p씩) 기준.
// 하방 보전은 "각 트랜치의 지급 첫날 종가 기준 1회" 가정 (보도 공백 — 가정 명시).

import { useMemo, useState } from "react";
import { fmtEok } from "@/lib/bonusTaxCalc";
import { AGREEMENT_2026 } from "./psData";

const CHANGE_PRESETS = [-50, -30, -10, 0, 20, 50, 100];

type Tranche = {
  label: string;
  /** PS 산정액 대비 % */
  pct: number;
  /** 기준가 대비 지급 첫날 변동률 state key */
  key: "now" | "y1" | "y2";
};

const TRANCHES: Tranche[] = [
  { label: "당해 4월 자사주", pct: AGREEMENT_2026.newSplit.stockNowPct, key: "now" },
  { label: "1년 후 자사주", pct: AGREEMENT_2026.newSplit.stockYear1Pct, key: "y1" },
  { label: "2년 후 자사주", pct: AGREEMENT_2026.newSplit.stockYear2Pct, key: "y2" },
];

export default function StockScenarioSimulator() {
  const [psEok, setPsEok] = useState(7); // 내 PS 산정액 (억원) — 평균 7억 보도 기준
  const [basePrice, setBasePrice] = useState(500_000); // 기준가 (원) — 예시값, 직접 수정
  const [chg, setChg] = useState<Record<"now" | "y1" | "y2", number>>({
    now: 0,
    y1: 20,
    y2: 50,
  });

  const calc = useMemo(() => {
    const psWon = psEok * 100_000_000;
    const cashNow = psWon * (AGREEMENT_2026.newSplit.cashNowPct / 100);

    const rows = TRANCHES.map((t) => {
      const amount = psWon * (t.pct / 100);
      const shares = basePrice > 0 ? amount / basePrice : 0;
      const priceAt = basePrice * (1 + chg[t.key] / 100);
      const marketValue = shares * priceAt;
      // 하방 보전: 지급 첫날 가치가 산정액에 못 미치면 부족분 현금 보전 (1회)
      const topUp = Math.max(0, amount - marketValue);
      const received = marketValue + topUp; // = max(marketValue, amount)
      return { ...t, amount, shares, priceAt, marketValue, topUp, received };
    });

    const totalReceived = cashNow + rows.reduce((s, r) => s + r.received, 0);
    const totalTopUp = rows.reduce((s, r) => s + r.topUp, 0);
    return { psWon, cashNow, rows, totalReceived, totalTopUp };
  }, [psEok, basePrice, chg]);

  return (
    <div className="rounded-xl border border-canvas-deep bg-canvas/30 p-5">
      {/* 입력 */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-xs font-bold text-faint">내 PS 산정액 (억원)</span>
          <input
            type="number"
            value={psEok}
            onChange={(e) => setPsEok(Number(e.target.value) || 0)}
            step="0.5"
            min="0"
            max="100"
            enterKeyHint="done"
            className="w-full mt-1 p-2.5 rounded-lg border border-canvas-deep font-bold tabular-nums focus:outline-none focus:border-primary bg-white"
          />
          <span className="text-[10px] text-faint">
            위 계산기의 &lsquo;PS 산정 총액&rsquo;을 입력하세요
          </span>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-faint">
            기준가 (원) — 3개 시점 종가 중 최저가
          </span>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
            step="10000"
            min="1000"
            enterKeyHint="done"
            className="w-full mt-1 p-2.5 rounded-lg border border-canvas-deep font-bold tabular-nums focus:outline-none focus:border-primary bg-white"
          />
          <span className="text-[10px] text-faint">
            예시값입니다 — 실제 확정 기준가로 바꿔 입력하세요
          </span>
        </label>
      </div>

      {/* 시점별 변동률 */}
      <div className="space-y-3 mb-4">
        {TRANCHES.map((t) => (
          <div key={t.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">
                {t.label} ({t.pct}%p) — 지급 첫날 기준가 대비{" "}
                <strong className={chg[t.key] < 0 ? "text-red-500" : "text-primary"}>
                  {chg[t.key] > 0 ? "+" : ""}
                  {chg[t.key]}%
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={-50}
                max={100}
                step={5}
                value={chg[t.key]}
                onChange={(e) =>
                  setChg((prev) => ({ ...prev, [t.key]: Number(e.target.value) }))
                }
                className="flex-1 accent-primary"
                aria-label={`${t.label} 주가 변동률`}
              />
              <div className="flex gap-1">
                {CHANGE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setChg((prev) => ({ ...prev, [t.key]: p }))}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${
                      chg[t.key] === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-canvas-deep hover:border-primary/40"
                    }`}
                  >
                    {p > 0 ? `+${p}` : p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 트랜치 결과 표 */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border-collapse min-w-[520px] bg-white rounded-lg">
          <thead>
            <tr className="border-b-2 border-canvas-deep text-left">
              <th className="py-2 px-2 font-bold">트랜치</th>
              <th className="py-2 px-2 font-bold">산정액</th>
              <th className="py-2 px-2 font-bold">주식 수</th>
              <th className="py-2 px-2 font-bold">지급일 가치</th>
              <th className="py-2 px-2 font-bold">하방 보전</th>
              <th className="py-2 px-2 font-bold">수령 가치</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-canvas-deep/60">
              <td className="py-2 px-2 font-bold">당해 2월 현금</td>
              <td className="py-2 px-2 tabular-nums">{fmtEok(calc.cashNow)}</td>
              <td className="py-2 px-2">—</td>
              <td className="py-2 px-2 tabular-nums">{fmtEok(calc.cashNow)}</td>
              <td className="py-2 px-2">—</td>
              <td className="py-2 px-2 tabular-nums font-bold">{fmtEok(calc.cashNow)}</td>
            </tr>
            {calc.rows.map((r) => (
              <tr key={r.key} className="border-b border-canvas-deep/60">
                <td className="py-2 px-2 font-bold">{r.label}</td>
                <td className="py-2 px-2 tabular-nums">{fmtEok(r.amount)}</td>
                <td className="py-2 px-2 tabular-nums">
                  {Math.floor(r.shares).toLocaleString()}주
                </td>
                <td className="py-2 px-2 tabular-nums">{fmtEok(r.marketValue)}</td>
                <td className="py-2 px-2 tabular-nums">
                  {r.topUp > 0 ? (
                    <span className="text-primary font-bold">+{fmtEok(r.topUp)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2 px-2 tabular-nums font-bold">{fmtEok(r.received)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 합계 비교 */}
      <div className="grid sm:grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-white border border-canvas-deep p-3">
          <p className="text-[10px] font-bold text-faint mb-0.5">PS 산정액</p>
          <p className="text-lg font-black tabular-nums">{fmtEok(calc.psWon)}</p>
        </div>
        <div className="rounded-lg bg-white border border-canvas-deep p-3">
          <p className="text-[10px] font-bold text-faint mb-0.5">
            구 체계(전액 현금) 총액
          </p>
          <p className="text-lg font-black tabular-nums">{fmtEok(calc.psWon)}</p>
        </div>
        <div className="rounded-lg bg-white border-2 border-primary/40 p-3">
          <p className="text-[10px] font-bold text-primary mb-0.5">
            신 체계 시나리오 총 수령 가치
          </p>
          <p className="text-lg font-black tabular-nums text-primary">
            {fmtEok(calc.totalReceived)}
          </p>
          {calc.totalTopUp > 0 && (
            <p className="text-[10px] text-faint mt-0.5">
              보전 {fmtEok(calc.totalTopUp)} 포함
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-[10px] text-faint leading-relaxed">
        ⚠️ 본 시뮬레이션은 가정 기반 추정이며 <strong>투자 조언이
        아닙니다</strong>. 하방 보전을 각 트랜치의 지급 첫날에 1회 적용하는
        것으로 가정했으며(이연분 적용 여부는 미보도), 지급 이후 보유 주식은
        주가 하락 시 <strong>원금 손실이 발생할 수 있습니다</strong>. 값은
        세전이며 지급 시점 근로소득 과세는 위 메인 계산기를 참고하세요.
      </p>
    </div>
  );
}
