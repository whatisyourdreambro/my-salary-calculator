"use client";

// 다년도 RSU 매도 시뮬레이터 — Client.tsx 에서 next/dynamic(ssr:false) 으로 지연 로드.
// 3,900줄 Client 본체에서 분리해 메인 계산기 First Load 를 경량화한다.

import { useState, useMemo } from "react";
import { Coins, Plus, Trash2, TrendingUp } from "lucide-react";
import {
  fmtManwon,
  fmtEok,
  fmtPlain,
  formatNumberInput,
  parseNumberInput,
  useCountUp,
} from "./shared";

// ────────────────────────────────────────────────────────────
// 다년도 RSU 시뮬레이터 + 누적 그래프
// ────────────────────────────────────────────────────────────

type YearRow = {
  id: string;
  year: number;
  perPersonFmt: string; // 1인당 성과급 (만원, 콤마)
  stockRatio: number; // 주식 비중 %
  vestedPct: number; // 풀린 % (누적)
  stockPriceFmt: string; // 주가 (원/주, 콤마)
};

// 주가는 예시값 — 2026년 증권가 목표가(40만원대 후반 보도) 언저리 시나리오.
// 사용자가 본인 시점 실제 주가로 수정해 사용하는 것을 전제로 한다.
const DEFAULT_YEAR_ROWS: YearRow[] = [
  { id: "y1", year: 2026, perPersonFmt: "6,000", stockRatio: 30, vestedPct: 100, stockPriceFmt: "300,000" },
  { id: "y2", year: 2027, perPersonFmt: "8,000", stockRatio: 30, vestedPct: 75, stockPriceFmt: "350,000" },
  { id: "y3", year: 2028, perPersonFmt: "10,000", stockRatio: 30, vestedPct: 50, stockPriceFmt: "400,000" },
  { id: "y4", year: 2029, perPersonFmt: "9,000", stockRatio: 30, vestedPct: 25, stockPriceFmt: "380,000" },
  { id: "y5", year: 2030, perPersonFmt: "7,500", stockRatio: 30, vestedPct: 0, stockPriceFmt: "350,000" },
];

export default function MultiYearRSUSimulator({
  memoryPerPerson,
}: {
  memoryPerPerson: number;
}) {
  const [rows, setRows] = useState<YearRow[]>(DEFAULT_YEAR_ROWS);
  const [sellPriceFmt, setSellPriceFmt] = useState("450,000");
  // '채우기'로 덮어쓰기 직전 상태 — 실수 클릭 복구용 (1회)
  const [undoRows, setUndoRows] = useState<YearRow[] | null>(null);

  const sellPrice = parseNumberInput(sellPriceFmt);

  function syncFromMemory() {
    if (memoryPerPerson <= 0) return;
    const v = Math.round(memoryPerPerson).toLocaleString("ko-KR");
    setRows((prev) => {
      setUndoRows(prev);
      return prev.map((r) => ({ ...r, perPersonFmt: v }));
    });
  }

  function undoSync() {
    if (undoRows) {
      setRows(undoRows);
      setUndoRows(null);
    }
  }

  function updateRow(id: string, patch: Partial<YearRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  function addRow() {
    const last = rows[rows.length - 1];
    const newYear = last ? last.year + 1 : new Date().getFullYear();
    setRows((prev) => [
      ...prev,
      {
        id: `y${Date.now()}`,
        year: newYear,
        perPersonFmt: last?.perPersonFmt ?? "6,000",
        stockRatio: last?.stockRatio ?? 30,
        vestedPct: 0,
        stockPriceFmt: last?.stockPriceFmt ?? "100,000",
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev
    );
  }

  const computed = useMemo(() => {
    let cumRsuShares = 0;
    let cumVestedShares = 0;
    let cumRsuValueManwon = 0;
    let cumYearlySaleValue = 0;

    const enriched = rows.map((r) => {
      const perPerson = parseNumberInput(r.perPersonFmt);
      const stockPrice = parseNumberInput(r.stockPriceFmt);

      const rsuValueManwon = (perPerson * r.stockRatio) / 100;
      const rsuValueWon = rsuValueManwon * 10000;
      const rsuShares = stockPrice > 0 ? rsuValueWon / stockPrice : 0;
      const vestedShares = rsuShares * (r.vestedPct / 100);
      const yearSaleValueWon = vestedShares * stockPrice;
      const yearSaleValueManwon = yearSaleValueWon / 10000;

      cumRsuShares += rsuShares;
      cumVestedShares += vestedShares;
      cumRsuValueManwon += rsuValueManwon;
      cumYearlySaleValue += yearSaleValueManwon;

      return {
        ...r,
        perPerson,
        stockPrice,
        rsuValueManwon,
        rsuShares,
        vestedShares,
        yearSaleValueManwon,
        cumVestedShares,
        cumRsuShares,
        cumRsuValueManwon,
        cumYearlySaleValue,
      };
    });

    const totalSellAtPriceManwon = (cumVestedShares * sellPrice) / 10000;
    return {
      enriched,
      cumRsuShares,
      cumVestedShares,
      cumRsuValueManwon,
      cumYearlySaleValue,
      totalSellAtPriceManwon,
    };
  }, [rows, sellPrice]);

  const animatedTotalSell = useCountUp(computed.totalSellAtPriceManwon);
  const animatedVestedShares = useCountUp(computed.cumVestedShares);

  return (
    <section
      className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
      aria-labelledby="rsu-section-title"
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p
          id="rsu-section-title"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue inline-flex items-center gap-1.5"
        >
          <Coins size={11} className="text-electric" aria-hidden /> 다년도 RSU 매도 시뮬레이션
        </p>
        <div className="flex items-center gap-1.5">
          {undoRows && (
            <button
              type="button"
              onClick={undoSync}
              className="text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-canvas-50 dark:bg-canvas-800 text-muted-blue border border-canvas-200 dark:border-canvas-700 hover:text-rose-500 transition-colors"
            >
              ↺ 되돌리기
            </button>
          )}
          <button
            type="button"
            onClick={syncFromMemory}
            disabled={memoryPerPerson <= 0}
            className="text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-electric-5 text-electric border border-electric-30 hover:bg-electric-10 transition-colors inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            title={
              memoryPerPerson <= 0
                ? "상단 시뮬 OPI2가 0원(임계값 미달 등)이라 채울 값이 없습니다"
                : undefined
            }
          >
            <TrendingUp size={10} aria-hidden /> 메모리 OPI2 1인당으로 채우기
          </button>
        </div>
      </div>
      <p className="text-[11px] text-faint-blue mb-5 leading-relaxed">
        성과급 중 주식(RSU) 비중 + 매년 풀리는 매도 제한 + 연도별 주가 입력. 누적
        매도 가능 주식이 자동 합산되고, 하단 기준 매도가로 통합 매도 시 가치까지
        즉시 산출됩니다. '채우기' 버튼은 OPI2(영업이익 분배분) 기준이며, OPI1
        포함 총액으로 보려면 직접 입력으로 조정하세요.
      </p>

      {/* 좌: 행 / 우: 누적 그래프 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-3">
          {computed.enriched.map((r) => (
            <YearRowCard
              key={r.id}
              row={r}
              canRemove={rows.length > 1}
              onUpdate={(patch) => updateRow(r.id, patch)}
              onRemove={() => removeRow(r.id)}
            />
          ))}
          <button
            type="button"
            onClick={addRow}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-canvas-300 dark:border-canvas-700 text-faint-blue text-xs font-black uppercase tracking-widest hover:border-electric hover:text-electric transition-colors"
          >
            <Plus size={14} aria-hidden /> 연도 추가
          </button>
        </div>

        <CumulativeChart
          data={computed.enriched.map((r) => ({
            year: r.year,
            cumValue: r.cumYearlySaleValue,
            cumShares: r.cumVestedShares,
            cumRsuValue: r.cumRsuValueManwon,
          }))}
          sellPrice={sellPrice}
        />
      </div>

      {/* 누적 합계 */}
      <div className="mt-5 rounded-xl p-4 bg-canvas-50 dark:bg-canvas-800">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-3">
          누적 합계
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Stat
            label="누적 RSU 가치"
            value={fmtManwon(computed.cumRsuValueManwon)}
            sub={fmtEok(computed.cumRsuValueManwon)}
          />
          <Stat
            label="누적 RSU 주식"
            value={`${fmtPlain(computed.cumRsuShares)}주`}
          />
          <Stat
            label="누적 매도 가능"
            value={`${fmtPlain(animatedVestedShares)}주`}
            highlight
          />
          <Stat
            label="연도별 매도 누적"
            value={fmtManwon(computed.cumYearlySaleValue)}
            sub={fmtEok(computed.cumYearlySaleValue)}
          />
        </div>
      </div>

      {/* 기준 매도가 */}
      <div
        className="mt-4 rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, #0145F208 0%, #7C83FF08 100%)",
          border: "1px solid #0145F230",
        }}
      >
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <div>
            <label
              htmlFor="sell-price"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-electric mb-1 block"
            >
              기준 매도가 (원/주)
            </label>
            <p className="text-[11px] text-muted-blue">
              누적 매도 가능 주식을 이 가격에 일괄 매도한다고 가정
            </p>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="기준 매도가 빠른선택"
          >
            {[250000, 300000, 400000, 500000, 700000].map((p) => {
              const active = sellPrice === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSellPriceFmt(p.toLocaleString("ko-KR"))}
                  aria-pressed={active}
                  className={`text-[10px] font-black px-2.5 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-electric text-white border-electric"
                      : "bg-white dark:bg-canvas-900 text-muted-blue border-canvas-200 dark:border-canvas-700 hover:border-electric"
                  }`}
                >
                  {(p / 10000).toFixed(0)}만
                </button>
              );
            })}
          </div>
        </div>
        <div className="relative">
          <input
            id="sell-price"
            type="text"
            inputMode="numeric"
            value={sellPriceFmt}
            onChange={(e) => setSellPriceFmt(formatNumberInput(e.target.value))}
            className="w-full rounded-xl px-4 py-3 text-2xl font-black tabular-nums focus:outline-none transition pr-12 text-electric bg-white dark:bg-canvas-900"
            style={{ border: "2px solid #0145F2" }}
            aria-label="기준 매도가 (원/주)"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
            원/주
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-electric-20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1">
            매도 시 총 가치
          </p>
          <p
            className="text-4xl sm:text-5xl font-black tabular-nums text-navy dark:text-canvas-50"
            aria-live="polite"
          >
            {fmtManwon(animatedTotalSell)}
          </p>
          <p className="text-sm text-electric font-bold mt-1">
            {fmtEok(animatedTotalSell)}
          </p>
          <p className="text-[11px] text-faint-blue mt-2 leading-relaxed">
            누적 매도 가능 {fmtPlain(computed.cumVestedShares)}주 ×{" "}
            {fmtPlain(sellPrice)}원/주
          </p>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// 누적 그래프
// ────────────────────────────────────────────────────────────

// fmtEok은 1억 미만에서 빈 문자열을 반환 — 툴팁 값이 공백이 되지 않게 만원 폴백
function fmtEokOrManwon(manwon: number): string {
  return manwon >= 10000 ? fmtEok(manwon) : fmtManwon(manwon);
}

function CumulativeChart({
  data,
  sellPrice,
}: {
  data: Array<{
    year: number;
    cumValue: number;
    cumShares: number;
    cumRsuValue: number;
  }>;
  sellPrice: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 320;
  const height = 360;
  const padL = 42;
  const padR = 18;
  const padT = 30;
  const padB = 40;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const enrichedData = data.map((d) => ({
    ...d,
    cumSellPriceValue: (d.cumShares * sellPrice) / 10000,
  }));

  const maxVal = Math.max(
    ...enrichedData.flatMap((d) => [d.cumValue, d.cumSellPriceValue]),
    1
  );

  const n = enrichedData.length;
  const groupWidth = innerW / Math.max(n, 1);
  const barGap = 4;
  const barWidth = Math.max(8, (groupWidth - barGap * 3) / 2);

  function groupCenter(i: number) {
    return padL + groupWidth * i + groupWidth / 2;
  }
  function barX(i: number, which: "year" | "sell") {
    const center = groupCenter(i);
    if (which === "year") return center - barGap / 2 - barWidth;
    return center + barGap / 2;
  }
  function yPos(v: number) {
    return padT + innerH - (v / maxVal) * innerH;
  }
  function barH(v: number) {
    return (v / maxVal) * innerH;
  }

  return (
    <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-2">
        연도별 누적 매도 가능 가치
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="다년도 누적 매도 가능 가치 막대 그래프"
      >
        <defs>
          <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D5BFF" />
            <stop offset="100%" stopColor="#0145F2" />
          </linearGradient>
          <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* 그리드 */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={padL}
            x2={width - padR}
            y1={padT + innerH * (1 - g)}
            y2={padT + innerH * (1 - g)}
            stroke="#DDE4EC"
            strokeDasharray="2 2"
            strokeWidth="0.5"
          />
        ))}

        {/* y축 라벨 */}
        {[0, 0.5, 1].map((g) => {
          const v = maxVal * g;
          return (
            <text
              key={g}
              x={padL - 4}
              y={padT + innerH * (1 - g) + 3}
              textAnchor="end"
              fontSize="9"
              fill="#7B8FA1"
              fontWeight="700"
            >
              {v >= 10000 ? `${(v / 10000).toFixed(1)}억` : `${Math.round(v)}만`}
            </text>
          );
        })}

        {/* x축 baseline */}
        <line
          x1={padL}
          x2={width - padR}
          y1={padT + innerH}
          y2={padT + innerH}
          stroke="#A8B9D6"
          strokeWidth="0.8"
        />

        {/* 그룹 바 */}
        {enrichedData.map((d, i) => {
          const isActive = hoverIdx === i;
          return (
            <g key={i}>
              {/* hover 배경 (그룹 전체) */}
              {isActive && (
                <rect
                  x={padL + groupWidth * i}
                  y={padT}
                  width={groupWidth}
                  height={innerH}
                  fill="#0145F2"
                  opacity="0.05"
                  rx="4"
                  pointerEvents="none"
                />
              )}

              {/* 파란 막대 — 그 해 주가 기준 누적 */}
              <rect
                x={barX(i, "year")}
                y={yPos(d.cumValue)}
                width={barWidth}
                height={Math.max(0, barH(d.cumValue))}
                fill="url(#barBlue)"
                rx="2"
                style={{
                  filter: isActive
                    ? "drop-shadow(0 2px 6px rgba(1,69,242,0.35))"
                    : "none",
                  transition: "filter 0.15s",
                }}
              />

              {/* 녹색 막대 — 기준 매도가 누적 */}
              <rect
                x={barX(i, "sell")}
                y={yPos(d.cumSellPriceValue)}
                width={barWidth}
                height={Math.max(0, barH(d.cumSellPriceValue))}
                fill="url(#barGreen)"
                rx="2"
                style={{
                  filter: isActive
                    ? "drop-shadow(0 2px 6px rgba(16,185,129,0.35))"
                    : "none",
                  transition: "filter 0.15s",
                }}
              />

              {/* hover/터치 hit-area — 터치는 같은 그룹 재터치 시 툴팁 닫힘 */}
              <rect
                x={padL + groupWidth * i}
                y={padT}
                width={groupWidth}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onTouchStart={() =>
                  setHoverIdx((prev) => (prev === i ? null : i))
                }
                style={{ cursor: "pointer" }}
              />

              {/* x축 라벨 */}
              <text
                x={groupCenter(i)}
                y={height - padB + 18}
                textAnchor="middle"
                fontSize="10"
                fill={isActive ? "#0145F2" : "#7B8FA1"}
                fontWeight="700"
              >
                {d.year}
              </text>
            </g>
          );
        })}

        {/* 호버 툴팁 */}
        {hoverIdx !== null && enrichedData[hoverIdx] && (
          <g pointerEvents="none">
            <rect
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 130
              )}
              y={padT - 6}
              width="130"
              height="62"
              rx="6"
              fill="#0A1829"
            />
            <text
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 130
              ) + 8}
              y={padT + 9}
              fontSize="10"
              fill="#fff"
              fontWeight="700"
            >
              {enrichedData[hoverIdx].year}년 누적
            </text>
            <text
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 130
              ) + 8}
              y={padT + 24}
              fontSize="9"
              fill="#7C83FF"
            >
              그 해 주가: {fmtEokOrManwon(enrichedData[hoverIdx].cumValue)}
            </text>
            <text
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 130
              ) + 8}
              y={padT + 37}
              fontSize="9"
              fill="#34D399"
            >
              기준 매도가:{" "}
              {fmtEokOrManwon(enrichedData[hoverIdx].cumSellPriceValue)}
            </text>
            <text
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 130
              ) + 8}
              y={padT + 49}
              fontSize="9"
              fill="#A8B9D6"
            >
              매도가능: {fmtPlain(enrichedData[hoverIdx].cumShares)}주
            </text>
          </g>
        )}
      </svg>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-muted-blue">
          <span
            className="w-3 h-3 rounded-sm"
            style={{
              background: "linear-gradient(to bottom, #0D5BFF, #0145F2)",
            }}
            aria-hidden
          />
          그 해 주가 기준
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-blue">
          <span
            className="w-3 h-3 rounded-sm"
            style={{
              background: "linear-gradient(to bottom, #34D399, #10B981)",
            }}
            aria-hidden
          />
          기준 매도가 ({(sellPrice / 10000).toFixed(0)}만원)
        </span>
      </div>
      <p className="text-[10px] text-faint-blue mt-2 leading-relaxed">
        호버하면 연도별 누적 매도 가능 가치 비교. 두 막대 격차가 클수록 주가
        변동이 매도 가치에 미치는 영향이 큽니다.
      </p>

      {/* 스크린리더용 데이터 표 — 툴팁 전용 값의 접근 가능한 대체 */}
      <table className="sr-only">
        <caption>연도별 누적 매도 가능 가치</caption>
        <thead>
          <tr>
            <th scope="col">연도</th>
            <th scope="col">그 해 주가 기준 누적 (만원)</th>
            <th scope="col">기준 매도가 기준 누적 (만원)</th>
            <th scope="col">누적 매도 가능 주식 (주)</th>
          </tr>
        </thead>
        <tbody>
          {enrichedData.map((d, i) => (
            <tr key={`${d.year}-${i}`}>
              <td>{d.year}</td>
              <td>{Math.round(d.cumValue).toLocaleString("ko-KR")}</td>
              <td>
                {Math.round(d.cumSellPriceValue).toLocaleString("ko-KR")}
              </td>
              <td>{Math.round(d.cumShares).toLocaleString("ko-KR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 행 카드 — 입력 단위 명확화
// ────────────────────────────────────────────────────────────

function YearRowCard({
  row,
  canRemove,
  onUpdate,
  onRemove,
}: {
  row: YearRow & {
    perPerson: number;
    stockPrice: number;
    rsuValueManwon: number;
    rsuShares: number;
    vestedShares: number;
    yearSaleValueManwon: number;
  };
  canRemove: boolean;
  onUpdate: (patch: Partial<YearRow>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-canvas-200 dark:border-canvas-800 bg-canvas-50 dark:bg-canvas-800 p-4 transition-all hover:border-electric/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={row.year}
            onChange={(e) =>
              onUpdate({ year: Number(e.target.value) || row.year })
            }
            className="w-20 px-2 py-1 rounded-md text-lg font-black tabular-nums bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 focus:outline-none focus:border-electric text-navy dark:text-canvas-50"
            aria-label="연도"
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-faint-blue">
            년
          </span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2.5 rounded-md text-faint-blue hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            aria-label={`${row.year}년 행 삭제`}
          >
            <Trash2 size={14} aria-hidden />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <CompactCommaInput
          label="1인당 성과급"
          unit="만원"
          value={row.perPersonFmt}
          onChange={(v) => onUpdate({ perPersonFmt: v })}
        />
        <CompactCommaInput
          label="그 해 주가"
          unit="원/주"
          value={row.stockPriceFmt}
          onChange={(v) => onUpdate({ stockPriceFmt: v })}
        />
        <CompactPercentInput
          label="RSU 비중"
          value={row.stockRatio}
          onChange={(v) => onUpdate({ stockRatio: v })}
          max={100}
        />
        <CompactPercentInput
          label="풀린 비율 (누적)"
          value={row.vestedPct}
          onChange={(v) => onUpdate({ vestedPct: v })}
          max={100}
          accent="#10B981"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <MiniInfo label="RSU 가치" value={fmtManwon(row.rsuValueManwon)} />
        <MiniInfo label="RSU 주식" value={`${fmtPlain(row.rsuShares)}주`} />
        <MiniInfo
          label="매도 가능"
          value={`${fmtPlain(row.vestedShares)}주`}
          highlight
        />
      </div>
    </div>
  );
}

function MiniInfo({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-2.5 py-2 ${
        highlight
          ? "bg-electric-5 border border-electric-20"
          : "bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700"
      }`}
    >
      <p className="text-[9px] font-bold uppercase tracking-widest text-faint-blue mb-0.5">
        {label}
      </p>
      <p
        className={`font-black tabular-nums truncate ${
          highlight ? "text-electric" : "text-navy dark:text-canvas-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 입력/표시 보조 컴포넌트 (RSU 시뮬 전용)
// ────────────────────────────────────────────────────────────

function CompactCommaInput({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-faint-blue">
        {label} <span className="opacity-70 font-medium">({unit})</span>
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatNumberInput(e.target.value))}
          className="w-full rounded-md px-2 py-1.5 pr-9 text-base font-black tabular-nums focus:outline-none transition-all bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50"
          style={{ border: "1.5px solid #0145F233" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0145F2")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#0145F233")}
          aria-label={`${label} (${unit})`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function CompactPercentInput({
  label,
  value,
  onChange,
  max = 100,
  accent = "#0145F2",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  accent?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-faint-blue">
        {label} <span className="opacity-70 font-medium">(%)</span>
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const n = Math.max(0, Math.min(max, Number(e.target.value) || 0));
            onChange(n);
          }}
          step={5}
          min={0}
          max={max}
          className="w-full rounded-md px-2 py-1.5 pr-7 text-base font-black tabular-nums focus:outline-none transition-all bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50"
          style={{ border: `1.5px solid ${accent}33` }}
          onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
          onBlur={(e) => (e.currentTarget.style.borderColor = `${accent}33`)}
          aria-label={`${label} (%)`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
          %
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint-blue mb-1">
        {label}
      </p>
      <p
        className={`font-black tabular-nums ${
          highlight
            ? "text-electric text-xl"
            : "text-navy dark:text-canvas-50 text-base"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-faint-blue">{sub}</p>}
    </div>
  );
}
