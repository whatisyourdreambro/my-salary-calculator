"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Sparkles,
  Lightbulb,
  Plus,
  Trash2,
  TrendingUp,
  Coins,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// 사업부 분배 모델
// 총 재원 = 영업이익 × 재원비율
// 부문 재원 = 총 재원 × 부문비율  (전체 인원 균등 분배)
// 사업부 재원 = 총 재원 × 사업부비율  (인원×사업부가중치로 분배)
// 1인당 = 부문 1인당 + 사업부 가중분
// ────────────────────────────────────────────────────────────

type Division = {
  id: "memory" | "common" | "foundry";
  label: string;
  color: string;
  bgTint: string;
  defaultCount: number;
  defaultRatio: number;
};

const DIVISIONS: Division[] = [
  {
    id: "memory",
    label: "메모리",
    color: "#0145F2",
    bgTint: "#0145F20D",
    defaultCount: 27400,
    defaultRatio: 1.0,
  },
  {
    id: "common",
    label: "공통",
    color: "#F59E0B",
    bgTint: "#F59E0B0D",
    defaultCount: 29000,
    defaultRatio: 0.7,
  },
  {
    id: "foundry",
    label: "파운드리·시스템LSI",
    color: "#EF4444",
    bgTint: "#EF44440D",
    defaultCount: 20900,
    defaultRatio: 0.0,
  },
];

// ────────────────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────────────────

function fmtManwon(n: number) {
  return Math.round(n).toLocaleString("ko-KR") + "만원";
}

function fmtEok(n: number) {
  const eok = n / 10000;
  return eok >= 1 ? `≈ ${eok.toFixed(2)}억` : "";
}

function fmtTrillion(manwon: number) {
  return (manwon / 1e8).toFixed(1);
}

function fmtEokInt(manwon: number) {
  return Math.round(manwon / 10000).toLocaleString("ko-KR");
}

function fmtPlain(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

// 카운트업 훅
function useCountUp(target: number, duration = 450): number {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);
  const prevValue = useRef(target);

  useEffect(() => {
    if (Math.abs(prevTarget.current - target) < 1) {
      setValue(target);
      prevTarget.current = target;
      prevValue.current = target;
      return;
    }
    const start = prevValue.current;
    const startTime = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      prevValue.current = current;
      setValue(current);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else {
        prevTarget.current = target;
        prevValue.current = target;
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

// ────────────────────────────────────────────────────────────
// 메인
// ────────────────────────────────────────────────────────────

export default function SamsungBonusClient() {
  // 1년치 시뮬레이터
  const [profit, setProfit] = useState(350);
  const [rerate, setRerate] = useState(15);
  const [buSteps, setBuSteps] = useState(7);

  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(DIVISIONS.map((d) => [d.id, d.defaultCount]))
  );
  const [ratios, setRatios] = useState<Record<string, number>>(
    Object.fromEntries(DIVISIONS.map((d) => [d.id, d.defaultRatio]))
  );

  const burate = buSteps * 10;
  const sarate = 100 - burate;

  const result = useMemo(() => {
    const totalFundManwon = profit * 1e8 * (rerate / 100);
    const buFund = totalFundManwon * (burate / 100);
    const saFund = totalFundManwon * (sarate / 100);

    const totalCount = DIVISIONS.reduce(
      (acc, d) => acc + (counts[d.id] || 0),
      0
    );
    const buPer = totalCount > 0 ? buFund / totalCount : 0;

    const wTotal = DIVISIONS.reduce(
      (acc, d) => acc + (counts[d.id] || 0) * (ratios[d.id] || 0),
      0
    );
    const saUnit = wTotal > 0 ? saFund / wTotal : 0;

    const perDivision = DIVISIONS.map((d) => {
      const r = ratios[d.id] || 0;
      const saPart = saUnit * r;
      const total = buPer + saPart;
      return { ...d, buPart: buPer, saPart, total };
    });

    const max = Math.max(...perDivision.map((r) => r.total), 1);

    return {
      totalFundManwon,
      totalFundTrillion: fmtTrillion(totalFundManwon),
      totalFundEok: fmtEokInt(totalFundManwon),
      perDivision,
      max,
    };
  }, [profit, rerate, burate, sarate, counts, ratios]);

  return (
    <div className="space-y-4 mb-10">
      {/* 주요 변수 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 transition-shadow hover:shadow-md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5">
          주요 변수 — 1년치 시뮬레이션
        </p>
        <div className="space-y-5">
          <SliderField
            label="영업이익"
            value={profit}
            unit="조"
            onChange={setProfit}
            min={10}
            max={500}
            step={10}
            color="#0145F2"
          />
          <SliderField
            label="성과급 재원 비율"
            value={rerate}
            unit="%"
            onChange={setRerate}
            min={1}
            max={30}
            step={0.5}
            color="#7C83FF"
            decimals={1}
          />
          <div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-faint-blue">
                부문 : 사업부
              </span>
              <span
                className="text-2xl font-black tabular-nums"
                style={{ color: "#F59E0B" }}
              >
                {buSteps} : {10 - buSteps}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={buSteps}
              onChange={(e) => setBuSteps(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all"
              style={{
                background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${
                  (buSteps / 10) * 100
                }%, #DDE4EC ${(buSteps / 10) * 100}%, #DDE4EC 100%)`,
                accentColor: "#F59E0B",
              }}
              aria-label="부문 사업부 비율"
            />
            <div className="flex justify-between text-[10px] font-bold text-faint-blue mt-1.5 px-0.5">
              <span>0:10</span>
              <span>2:8</span>
              <span>4:6</span>
              <span>5:5</span>
              <span>6:4</span>
              <span>8:2</span>
              <span>10:0</span>
            </div>
            <p className="text-[11px] text-faint-blue mt-2 leading-relaxed">
              부문 = 전체 인원 균등 분배 · 사업부 = 인원×사업부 비율 가중 분배
            </p>
          </div>
        </div>

        <div
          className="mt-5 rounded-xl px-4 py-3 flex justify-between items-center"
          style={{
            background:
              "linear-gradient(90deg, #0145F210 0%, #7C83FF10 100%)",
          }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-faint-blue">
            총 재원
          </span>
          <span className="text-navy dark:text-canvas-50 font-black tabular-nums">
            {result.totalFundTrillion}조{" "}
            <span className="text-faint-blue font-bold text-sm">
              ({result.totalFundEok}억원)
            </span>
          </span>
        </div>
      </div>

      {/* 사업부 설정 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5">
          사업부 설정
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DIVISIONS.map((d) => (
            <div key={d.id}>
              <p
                className="text-sm font-black mb-3 inline-flex items-center gap-1.5"
                style={{ color: d.color }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.label}
              </p>
              <div className="space-y-3">
                <NumberInput
                  label="인원 (명)"
                  value={counts[d.id]}
                  onChange={(v) =>
                    setCounts((prev) => ({ ...prev, [d.id]: v }))
                  }
                  step={100}
                  color={d.color}
                />
                <NumberInput
                  label="사업부 비율 (가중치)"
                  value={ratios[d.id]}
                  onChange={(v) =>
                    setRatios((prev) => ({ ...prev, [d.id]: v }))
                  }
                  step={0.1}
                  min={0}
                  max={2}
                  decimals={1}
                  color={d.color}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1년치 결과 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5">
          1인당 성과급 결과 (세전)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.perDivision.map((r) => (
            <ResultCard
              key={r.id}
              label={r.label}
              color={r.color}
              bgTint={r.bgTint}
              buPart={r.buPart}
              saPart={r.saPart}
              total={r.total}
              max={result.max}
            />
          ))}
        </div>
      </div>

      {/* SK하이닉스 비교 */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "#10B98108",
          border: "1px solid #10B98133",
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          style={{ color: "#10B981" }}
        >
          참고 · 비교
        </p>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Lightbulb
              className="w-5 h-5 mt-0.5"
              style={{ color: "#10B981" }}
            />
          </div>
          <div className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
            <p className="font-black text-emerald-700 dark:text-emerald-400 mb-1">
              SK하이닉스 성과급 예상치
            </p>
            <p>
              영업이익{" "}
              <strong className="text-navy dark:text-canvas-50">250조</strong> ·
              재원비율{" "}
              <strong className="text-navy dark:text-canvas-50">10%</strong> ·
              직원{" "}
              <strong className="text-navy dark:text-canvas-50">35,000명</strong>{" "}
              기준
            </p>
            <p className="mt-1">
              → 인당 예상{" "}
              <strong
                className="text-lg font-black"
                style={{ color: "#10B981" }}
              >
                ≈ 7.14억
              </strong>
              <span className="text-xs text-faint-blue ml-2">
                (단일 사업부 균등 분배 가정)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ───── 다년도 RSU 시뮬레이터 ───── */}
      <MultiYearRSUSimulator memoryPerPerson={result.perDivision[0].total} />

      <p className="text-center text-[11px] text-faint-blue">
        * 만원 단위 반올림 · 개인 호봉·고과 미반영 추정치
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 다년도 RSU 시뮬레이터
// 회의록상 매년 매도 제한이 다르게 풀리는 구조를 반영.
// 행마다: 연도 · 1인당 성과급 · 주식 비중 · 그해까지 풀린 % · 그해 주가
// 누적 매도 가능 주식 수 + 기준 매도가 입력 → 매도 시 총 가치
// ────────────────────────────────────────────────────────────

type YearRow = {
  id: string;
  year: number;
  perPerson: number; // 만원
  stockRatio: number; // 주식 비중 %
  vestedPct: number; // 그 해 RSU의 현재까지 풀린 % (누적)
  stockPrice: number; // 그 해 주가 (원)
};

const DEFAULT_YEAR_ROWS: YearRow[] = [
  { id: "y1", year: 2026, perPerson: 6000, stockRatio: 30, vestedPct: 100, stockPrice: 85000 },
  { id: "y2", year: 2027, perPerson: 8000, stockRatio: 30, vestedPct: 75, stockPrice: 100000 },
  { id: "y3", year: 2028, perPerson: 10000, stockRatio: 30, vestedPct: 50, stockPrice: 120000 },
  { id: "y4", year: 2029, perPerson: 9000, stockRatio: 30, vestedPct: 25, stockPrice: 110000 },
  { id: "y5", year: 2030, perPerson: 7500, stockRatio: 30, vestedPct: 0, stockPrice: 95000 },
];

function MultiYearRSUSimulator({
  memoryPerPerson,
}: {
  memoryPerPerson: number;
}) {
  const [rows, setRows] = useState<YearRow[]>(DEFAULT_YEAR_ROWS);
  const [sellPrice, setSellPrice] = useState(150000); // 기준 매도가 (원)

  // 메모리 1인당으로 모든 행 채우기
  function syncFromMemory() {
    setRows((prev) =>
      prev.map((r) => ({ ...r, perPerson: Math.round(memoryPerPerson) }))
    );
  }

  function updateRow(id: string, patch: Partial<YearRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    const last = rows[rows.length - 1];
    const newYear = last ? last.year + 1 : new Date().getFullYear();
    setRows((prev) => [
      ...prev,
      {
        id: `y${Date.now()}`,
        year: newYear,
        perPerson: last?.perPerson ?? 6000,
        stockRatio: last?.stockRatio ?? 30,
        vestedPct: 0,
        stockPrice: last?.stockPrice ?? 100000,
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  const computed = useMemo(() => {
    let cumRsuShares = 0; // 누적 RSU 주식 수
    let cumVestedShares = 0; // 누적 매도 가능 주식 수
    let cumRsuValueManwon = 0; // 누적 RSU 가치 (받은 만원)
    let cumYearlySaleValue = 0; // 매년 자기 해 주가로 매도 가정 누적

    const enriched = rows.map((r) => {
      const rsuValueManwon = (r.perPerson * r.stockRatio) / 100; // 만원
      const rsuValueWon = rsuValueManwon * 10000;
      const rsuShares = r.stockPrice > 0 ? rsuValueWon / r.stockPrice : 0;
      const vestedShares = rsuShares * (r.vestedPct / 100);
      const yearSaleValueWon = vestedShares * r.stockPrice;
      const yearSaleValueManwon = yearSaleValueWon / 10000;

      cumRsuShares += rsuShares;
      cumVestedShares += vestedShares;
      cumRsuValueManwon += rsuValueManwon;
      cumYearlySaleValue += yearSaleValueManwon;

      return {
        ...r,
        rsuValueManwon,
        rsuShares,
        vestedShares,
        yearSaleValueManwon,
        cumVestedShares,
      };
    });

    const totalSellAtPriceWon = cumVestedShares * sellPrice;
    const totalSellAtPriceManwon = totalSellAtPriceWon / 10000;

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
    <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue inline-flex items-center gap-1.5">
          <Coins size={11} className="text-electric" /> 다년도 RSU 매도 시뮬레이션
        </p>
        <button
          type="button"
          onClick={syncFromMemory}
          className="text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-electric-5 text-electric border border-electric-30 hover:bg-electric-10 transition-colors inline-flex items-center gap-1"
        >
          <TrendingUp size={10} /> 메모리 1인당으로 채우기
        </button>
      </div>
      <p className="text-[11px] text-faint-blue mb-5 leading-relaxed">
        성과급 중 주식(RSU) 비중 + 회의록상 매년 풀리는 매도 제한 비율 + 연도별
        주가를 입력. 누적 매도 가능 주식이 자동 합산되고, 하단의 기준 매도가로
        통합 매도 시 가치까지 즉시 산출.
      </p>

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
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-canvas-300 dark:border-canvas-700 text-faint-blue text-xs font-black uppercase tracking-widest hover:border-electric hover:text-electric transition-colors"
      >
        <Plus size={14} /> 연도 추가
      </button>

      {/* 누적 합계 */}
      <div className="mt-5 rounded-xl p-4 bg-canvas-50 dark:bg-canvas-800">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-3">
          누적 합계
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat
            label="누적 RSU 가치 (받은 액)"
            value={fmtManwon(computed.cumRsuValueManwon)}
            sub={fmtEok(computed.cumRsuValueManwon)}
          />
          <Stat
            label="누적 RSU 주식 수"
            value={`${fmtPlain(computed.cumRsuShares)}주`}
          />
          <Stat
            label="누적 매도 가능 주식"
            value={`${fmtPlain(animatedVestedShares)}주`}
            highlight
          />
          <Stat
            label="연도별 주가 매도 누적"
            value={fmtManwon(computed.cumYearlySaleValue)}
            sub={fmtEok(computed.cumYearlySaleValue)}
          />
        </div>
      </div>

      {/* 기준 매도가 입력 */}
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-electric mb-1">
              기준 매도가
            </p>
            <p className="text-[11px] text-muted-blue">
              누적 매도 가능 주식을 이 가격에 일괄 매도한다고 가정
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[80000, 100000, 150000, 200000, 300000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSellPrice(p)}
                className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-colors ${
                  sellPrice === p
                    ? "bg-electric text-white border-electric"
                    : "bg-white dark:bg-canvas-900 text-muted-blue border-canvas-200 dark:border-canvas-700 hover:border-electric"
                }`}
              >
                {(p / 10000).toFixed(0)}만
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(Math.max(0, Number(e.target.value) || 0))}
            step={1000}
            min={0}
            className="w-full rounded-xl px-4 py-3 text-2xl font-black tabular-nums focus:outline-none transition pr-12 text-electric bg-white dark:bg-canvas-900"
            style={{ border: "2px solid #0145F2" }}
            aria-label="기준 매도가 입력 (원)"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
            원
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-electric-20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1">
            매도 시 총 가치
          </p>
          <p className="text-4xl sm:text-5xl font-black tabular-nums text-navy dark:text-canvas-50">
            {fmtManwon(animatedTotalSell)}
          </p>
          <p className="text-sm text-electric font-bold mt-1">
            {fmtEok(animatedTotalSell)}
          </p>
          <p className="text-[11px] text-faint-blue mt-2 leading-relaxed">
            누적 매도 가능 {fmtPlain(computed.cumVestedShares)}주 × {fmtPlain(sellPrice)}원 = 위 금액
          </p>
        </div>
      </div>
    </div>
  );
}

function YearRowCard({
  row,
  canRemove,
  onUpdate,
  onRemove,
}: {
  row: YearRow & {
    rsuValueManwon: number;
    rsuShares: number;
    vestedShares: number;
    yearSaleValueManwon: number;
    cumVestedShares: number;
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
            className="p-1.5 rounded-md text-faint-blue hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            aria-label="이 연도 삭제"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <CompactInput
          label="1인당 성과급"
          unit="만원"
          value={row.perPerson}
          onChange={(v) => onUpdate({ perPerson: v })}
          step={100}
        />
        <CompactInput
          label="주식 비중"
          unit="%"
          value={row.stockRatio}
          onChange={(v) => onUpdate({ stockRatio: v })}
          step={5}
          min={0}
          max={100}
        />
        <CompactInput
          label="풀린 비율"
          unit="%"
          value={row.vestedPct}
          onChange={(v) => onUpdate({ vestedPct: v })}
          step={5}
          min={0}
          max={100}
          accent="#10B981"
        />
        <CompactInput
          label="그 해 주가"
          unit="원"
          value={row.stockPrice}
          onChange={(v) => onUpdate({ stockPrice: v })}
          step={1000}
          min={0}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <MiniInfo
          label="RSU 가치"
          value={fmtManwon(row.rsuValueManwon)}
        />
        <MiniInfo
          label="RSU 주식"
          value={`${fmtPlain(row.rsuShares)}주`}
        />
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

function CompactInput({
  label,
  unit,
  value,
  onChange,
  step,
  min,
  max,
  accent,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  accent?: string;
}) {
  const color = accent ?? "#0145F2";
  return (
    <div>
      <label className="text-[9px] font-bold uppercase tracking-widest block mb-1 text-faint-blue">
        {label} <span className="opacity-60">({unit})</span>
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-md px-2 py-1.5 text-sm font-black tabular-nums focus:outline-none transition-all bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50"
        style={{ border: `1.5px solid ${color}33` }}
        onFocus={(e) => (e.currentTarget.style.borderColor = color)}
        onBlur={(e) => (e.currentTarget.style.borderColor = `${color}33`)}
      />
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
          highlight ? "text-electric text-xl" : "text-navy dark:text-canvas-50 text-base"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-faint-blue">{sub}</p>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 1년치 시뮬레이터 하위 컴포넌트
// ────────────────────────────────────────────────────────────

function SliderField({
  label,
  value,
  unit,
  onChange,
  min,
  max,
  step,
  color,
  decimals = 0,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  color: string;
  decimals?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-faint-blue">
          {label}
        </span>
        <span className="text-2xl font-black tabular-nums" style={{ color }}>
          {decimals > 0 ? value.toFixed(decimals) : value}
          <span className="text-base ml-0.5">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #DDE4EC ${pct}%, #DDE4EC 100%)`,
          accentColor: color,
        }}
        aria-label={label}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  decimals = 0,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
  color: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 text-faint-blue">
        {label}
      </label>
      <input
        type="number"
        value={decimals > 0 ? Number(value).toFixed(decimals) : Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-lg px-3 py-2 text-sm font-black tabular-nums focus:outline-none transition-all bg-canvas-50 dark:bg-canvas-800 text-navy dark:text-canvas-50"
        style={{ border: `1.5px solid ${color}33` }}
        onFocus={(e) => (e.currentTarget.style.borderColor = color)}
        onBlur={(e) => (e.currentTarget.style.borderColor = `${color}33`)}
      />
    </div>
  );
}

function ResultCard({
  label,
  color,
  bgTint,
  buPart,
  saPart,
  total,
  max,
}: {
  label: string;
  color: string;
  bgTint: string;
  buPart: number;
  saPart: number;
  total: number;
  max: number;
}) {
  const animTotal = useCountUp(total);
  const barPct = (total / max) * 100;
  return (
    <div
      className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        background: `linear-gradient(135deg, ${bgTint}, transparent)`,
        border: `1px solid ${color}33`,
      }}
    >
      <p className="text-sm font-black mb-2" style={{ color }}>
        {label}
      </p>
      <div className="text-[11px] text-muted-blue leading-relaxed mb-2">
        <div className="flex justify-between">
          <span>부문</span>
          <span className="text-navy dark:text-canvas-50 font-bold tabular-nums">
            {fmtManwon(buPart)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>사업부</span>
          <span className="text-navy dark:text-canvas-50 font-bold tabular-nums">
            {fmtManwon(saPart)}
          </span>
        </div>
      </div>
      <p className="text-xl font-black tabular-nums" style={{ color }}>
        {fmtManwon(animTotal)}
      </p>
      <p className="text-[11px] text-faint-blue mt-0.5">{fmtEok(total)}</p>
      <div className="mt-2 h-1.5 rounded-full bg-canvas-100 dark:bg-canvas-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barPct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
