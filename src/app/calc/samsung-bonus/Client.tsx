"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Sparkles, Lightbulb } from "lucide-react";

// ────────────────────────────────────────────────────────────
// 모델
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
  return eok >= 1 ? `≈ ${eok.toFixed(1)}억` : "";
}

function fmtTrillion(manwon: number) {
  return (manwon / 1e8).toFixed(1);
}

function fmtEokInt(manwon: number) {
  return Math.round(manwon / 10000).toLocaleString("ko-KR");
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
  const [profit, setProfit] = useState(350); // 조원
  const [rerate, setRerate] = useState(15); // 재원비율 %
  const [buSteps, setBuSteps] = useState(7); // 0~10 (부문비율 0~100%)

  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(DIVISIONS.map((d) => [d.id, d.defaultCount]))
  );
  const [ratios, setRatios] = useState<Record<string, number>>(
    Object.fromEntries(DIVISIONS.map((d) => [d.id, d.defaultRatio]))
  );

  const burate = buSteps * 10; // 부문비율 %
  const sarate = 100 - burate; // 사업부비율 %

  const result = useMemo(() => {
    // 영업이익 (조) × 1e8 = 만원 단위
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
      {/* 주요 변수 카드 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 transition-shadow hover:shadow-md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5">
          주요 변수
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
            <div className="relative">
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
            </div>
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
              부문 = 전체 인원 균등 분배 · 사업부 = 인원×사업부 비율로 가중 분배
            </p>
          </div>
        </div>

        {/* 총 재원 */}
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

      {/* 결과 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5">
          1인당 성과급 결과
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
            <Lightbulb className="w-5 h-5 mt-0.5" style={{ color: "#10B981" }} />
          </div>
          <div className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
            <p className="font-black text-emerald-700 dark:text-emerald-400 mb-1">
              SK하이닉스 성과급 예상치
            </p>
            <p>
              영업이익 <strong className="text-navy dark:text-canvas-50">250조</strong>{" "}
              · 재원비율{" "}
              <strong className="text-navy dark:text-canvas-50">10%</strong> · 직원{" "}
              <strong className="text-navy dark:text-canvas-50">35,000명</strong> 기준
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

      <p className="text-center text-[11px] text-faint-blue">
        * 만원 단위 반올림 · 개인 호봉·고과 미반영 추정치
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 하위 컴포넌트
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
        <span
          className="text-2xl font-black tabular-nums"
          style={{ color }}
        >
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
        value={
          decimals > 0
            ? Number(value).toFixed(decimals)
            : Math.round(value)
        }
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-lg px-3 py-2 text-sm font-black tabular-nums focus:outline-none transition-all bg-canvas-50 dark:bg-canvas-800 text-navy dark:text-canvas-50"
        style={{
          border: `1.5px solid ${color}33`,
        }}
        onFocus={(e) => (e.target.style.borderColor = color)}
        onBlur={(e) => (e.target.style.borderColor = `${color}33`)}
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
      <p
        className="text-sm font-black mb-2"
        style={{ color }}
      >
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
      <p
        className="text-xl font-black tabular-nums"
        style={{ color }}
      >
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

// SAMSUNG 시뮬레이터 뱃지 마커 (page 상단에서 사용 가능하도록 export 불필요)
export function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-electric-10 text-electric border border-electric-30">
      <Sparkles size={12} /> Samsung 성과급 시뮬레이터
    </div>
  );
}
