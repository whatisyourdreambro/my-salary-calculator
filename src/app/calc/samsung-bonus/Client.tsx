"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Lightbulb,
  Plus,
  Trash2,
  TrendingUp,
  Coins,
  User,
  Lock,
  Check,
  Info,
  Settings,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// 고정 정책 변수 (공개 노사 합의 보도 기반)
// ────────────────────────────────────────────────────────────
const FIXED_RERATE = 10.5; // 영업이익의 10.5%
const FIXED_BU_RATIO = 4; // 부문 : 사업부 = 4 : 6
const FIXED_SA_RATIO = 6;
const REFERENCE_SALARY = 80_000_000; // 본인 연봉 비례 기준 (평균 8천만원)

// 회의록 임계값:
// • 2026~2028: 영업이익 200조 이상 → 성과급 풀 활성화
// • 2029~2035 (향후 7년): 영업이익 100조 이상 → 성과급 풀 활성화
function getThreshold(year: number): number {
  if (year >= 2026 && year <= 2028) return 200;
  if (year >= 2029 && year <= 2035) return 100;
  return 0; // 합의 범위 외 — 임계값 정보 없음
}
function getThresholdPeriod(year: number): string {
  if (year >= 2026 && year <= 2028) return "26~28년 (200조 이상)";
  if (year >= 2029 && year <= 2035) return "29~35년 (100조 이상)";
  return "합의 범위 외";
}

// ────────────────────────────────────────────────────────────
// 세금 로직
// ────────────────────────────────────────────────────────────

const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06, deduction: 0 },
  { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function calcEmpDeduction(total: number): number {
  if (total <= 5_000_000) return total * 0.7;
  if (total <= 15_000_000) return 3_500_000 + (total - 5_000_000) * 0.4;
  if (total <= 45_000_000) return 7_500_000 + (total - 15_000_000) * 0.15;
  if (total <= 100_000_000) return 12_000_000 + (total - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (total - 100_000_000) * 0.02, 20_000_000);
}

function calcTax(taxable: number): number {
  if (taxable <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.limit)
      return Math.max(0, Math.round(taxable * b.rate - b.deduction));
  }
  return 0;
}

// 세금/4대보험 계산. credit = 세액공제율(0~50%), applyInsurance = 4대보험 추가 부과 적용 여부
function calcBonusNet(
  salary: number,
  bonusWon: number,
  credit: number,
  applyInsurance: boolean
) {
  if (bonusWon <= 0)
    return { net: 0, deduct: 0, effRate: 0, breakdown: emptyBreakdown() };

  const basicDeduct = 1_500_000;
  const baseTaxable = Math.max(
    0,
    salary - calcEmpDeduction(salary) - basicDeduct
  );
  const total = salary + bonusWon;
  const totalTaxable = Math.max(
    0,
    total - calcEmpDeduction(total) - basicDeduct
  );
  const grossIncomeTaxOnBonus = calcTax(totalTaxable) - calcTax(baseTaxable);
  const incomeTaxOnBonus = grossIncomeTaxOnBonus * (1 - credit / 100);
  const localTax = incomeTaxOnBonus * 0.1;

  let nationalPension = 0;
  let healthIns = 0;
  let longTermCare = 0;
  let employment = 0;
  if (applyInsurance) {
    // 국민연금: 보수월액 연 7,404만원 상한 — 본봉이 상한 미달일 때만 추가 부과
    const pensionCap = 74_040_000;
    const pensionBase = Math.max(0, pensionCap - salary);
    nationalPension = Math.min(bonusWon, pensionBase) * 0.045;
    // 건강·고용은 상한 없음. 다만 보수정산 시점에 일시 부과되며 회사가 일부 분담.
    healthIns = bonusWon * 0.03545;
    longTermCare = healthIns * 0.1295;
    employment = bonusWon * 0.009;
  }
  const insurance = nationalPension + healthIns + longTermCare + employment;

  const deduct = incomeTaxOnBonus + localTax + insurance;
  return {
    net: bonusWon - deduct,
    deduct,
    effRate: (deduct / bonusWon) * 100,
    breakdown: {
      incomeTax: incomeTaxOnBonus,
      localTax,
      nationalPension,
      healthIns,
      longTermCare,
      employment,
    },
  };
}

function emptyBreakdown() {
  return {
    incomeTax: 0,
    localTax: 0,
    nationalPension: 0,
    healthIns: 0,
    longTermCare: 0,
    employment: 0,
  };
}

// ────────────────────────────────────────────────────────────
// 사업부 데이터 — 색맹 보강용 패턴/아이콘 동반
// ────────────────────────────────────────────────────────────

type Division = {
  id: "memory" | "common" | "foundry";
  label: string;
  shortLabel: string;
  color: string;
  bgTint: string;
  defaultCount: number;
  defaultRatio: number;
};

const DIVISIONS: Division[] = [
  {
    id: "memory",
    label: "메모리",
    shortLabel: "M",
    color: "#0145F2",
    bgTint: "#0145F20D",
    defaultCount: 27400,
    defaultRatio: 1.0,
  },
  {
    id: "common",
    label: "공통",
    shortLabel: "C",
    color: "#F59E0B",
    bgTint: "#F59E0B0D",
    defaultCount: 29000,
    defaultRatio: 0.7,
  },
  {
    id: "foundry",
    label: "파운드리·시스템LSI",
    shortLabel: "F",
    color: "#EF4444",
    bgTint: "#EF44440D",
    defaultCount: 20900,
    defaultRatio: 0.0,
  },
];

// ────────────────────────────────────────────────────────────
// 유틸 — 모든 큰 숫자 입력은 콤마 포맷으로 통일
// ────────────────────────────────────────────────────────────

function fmtManwon(n: number) {
  return Math.round(n).toLocaleString("ko-KR") + "만원";
}
function fmtManwonInt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
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
function formatNumberInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
function parseNumberInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

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
  const [year, setYear] = useState(2026); // 적용 연도
  const [profitFmt, setProfitFmt] = useState("350"); // 조원 — 자유 입력
  const [counts, setCounts] = useState<Record<string, string>>(
    Object.fromEntries(
      DIVISIONS.map((d) => [d.id, d.defaultCount.toLocaleString("ko-KR")])
    )
  );
  const [ratios, setRatios] = useState<Record<string, string>>(
    Object.fromEntries(DIVISIONS.map((d) => [d.id, String(d.defaultRatio)]))
  );

  const profit = Math.max(0, Number(profitFmt) || 0);
  const threshold = getThreshold(year);
  // 임계값 정보 없는 연도(범위 외)는 체크 없이 영업이익 그대로 적용
  const thresholdMet = threshold > 0 ? profit >= threshold : true;
  const triggered = thresholdMet;

  const result = useMemo(() => {
    // 임계값 미달이면 성과급 풀 = 0
    const effectiveProfit = triggered ? profit : 0;
    const totalFundManwon = effectiveProfit * 1e8 * (FIXED_RERATE / 100);
    const buFund = totalFundManwon * (FIXED_BU_RATIO / 10);
    const saFund = totalFundManwon * (FIXED_SA_RATIO / 10);

    const countNums = Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, parseNumberInput(v)])
    );
    const ratioNums = Object.fromEntries(
      Object.entries(ratios).map(([k, v]) => [k, Number(v) || 0])
    );

    const totalCount = DIVISIONS.reduce(
      (acc, d) => acc + (countNums[d.id] || 0),
      0
    );
    const buPer = totalCount > 0 ? buFund / totalCount : 0;

    const wTotal = DIVISIONS.reduce(
      (acc, d) => acc + (countNums[d.id] || 0) * (ratioNums[d.id] || 0),
      0
    );
    const saUnit = wTotal > 0 ? saFund / wTotal : 0;
    const ratioSum = DIVISIONS.reduce(
      (acc, d) => acc + (ratioNums[d.id] || 0),
      0
    );

    const perDivision = DIVISIONS.map((d) => {
      const r = ratioNums[d.id] || 0;
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
      ratioSum,
    };
  }, [profit, counts, ratios, triggered]);

  return (
    <div className="space-y-4 mb-10">
      {/* 영업이익 + 고정 정책 */}
      <section
        className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 transition-shadow hover:shadow-md"
        aria-labelledby="profit-section-title"
      >
        <p
          id="profit-section-title"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5"
        >
          주요 변수
        </p>

        {/* 적용 연도 선택 — 임계값 자동 결정 */}
        <div className="mb-5">
          <div className="flex items-end justify-between mb-2">
            <label
              htmlFor="year-input"
              className="text-xs font-bold uppercase tracking-widest text-faint-blue inline-flex items-center gap-1.5"
            >
              <Calendar size={11} aria-hidden /> 적용 연도
            </label>
            <span
              className="text-2xl font-black tabular-nums"
              style={{ color: "#7C83FF" }}
            >
              {year}년
            </span>
          </div>
          <input
            id="year-input"
            type="range"
            min={2026}
            max={2035}
            step={1}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all"
            style={{
              background: `linear-gradient(to right, #7C83FF 0%, #7C83FF ${
                ((year - 2026) / (2035 - 2026)) * 100
              }%, #DDE4EC ${
                ((year - 2026) / (2035 - 2026)) * 100
              }%, #DDE4EC 100%)`,
              accentColor: "#7C83FF",
            }}
            aria-label="적용 연도"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[2026, 2027, 2028, 2029, 2030, 2032, 2035].map((y) => {
              const active = year === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  aria-pressed={active}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    active
                      ? "text-white"
                      : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:text-white"
                  }`}
                  style={{
                    backgroundColor: active ? "#7C83FF" : undefined,
                  }}
                >
                  {y}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-faint-blue mt-2 leading-relaxed">
            회의록 임계값: <strong className="text-navy dark:text-canvas-50">{getThresholdPeriod(year)}</strong>{" "}
            — 영업이익이 이 기준에 미달하면 성과급 풀 미활성.
          </p>
        </div>

        {/* 영업이익 자유 입력 — 콤마 포맷 통일 */}
        <div className="mb-5">
          <div className="flex items-end justify-between mb-2">
            <label
              htmlFor="profit-input"
              className="text-xs font-bold uppercase tracking-widest text-faint-blue"
            >
              회사 연간 영업이익
            </label>
            <span
              className="text-3xl font-black tabular-nums"
              style={{ color: triggered ? "#0145F2" : "#EF4444" }}
              aria-live="polite"
            >
              {profit.toLocaleString("ko-KR")}
              <span className="text-base ml-0.5">조원</span>
            </span>
          </div>
          <div className="relative">
            <input
              id="profit-input"
              type="text"
              inputMode="decimal"
              value={profitFmt}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setProfitFmt(v);
              }}
              className="w-full rounded-xl px-4 py-3 text-2xl font-black tabular-nums focus:outline-none transition-all pr-14 text-electric"
              style={{
                backgroundColor: "#0145F208",
                border: "2px solid #0145F2",
              }}
              placeholder="350"
              aria-label="회사 연간 영업이익 (조원)"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              조원
            </span>
          </div>
          {/* 임계값 게이지 — 영업이익 vs 임계값 시각화 */}
          {threshold > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-faint-blue">
                  임계값 기준 ({threshold}조)
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-black ${
                    triggered ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {triggered ? (
                    <>
                      <CheckCircle2 size={12} aria-hidden />
                      충족 (+{Math.round(((profit - threshold) / threshold) * 100)}%)
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} aria-hidden />
                      미달 ({Math.round(((threshold - profit) / threshold) * 100)}% 부족)
                    </>
                  )}
                </span>
              </div>
              <div className="relative h-2.5 rounded-full bg-canvas-100 dark:bg-canvas-800 overflow-hidden">
                {/* 영업이익 막대 */}
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (profit / (threshold * 1.5)) * 100)}%`,
                    backgroundColor: triggered ? "#10B981" : "#EF4444",
                  }}
                />
                {/* 임계값 마커 */}
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${(threshold / (threshold * 1.5)) * 100}%`,
                    backgroundColor: "#0A1829",
                  }}
                  aria-hidden
                />
                <span
                  className="absolute -top-0.5 text-[9px] font-black"
                  style={{
                    left: `${(threshold / (threshold * 1.5)) * 100}%`,
                    transform: "translateX(-50%) translateY(-100%)",
                    color: "#0A1829",
                  }}
                  aria-hidden
                >
                  ▼ {threshold}조
                </span>
              </div>
              {!triggered && (
                <div className="mt-2 rounded-lg p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className="text-rose-500 flex-shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <div className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                    <strong>{year}년 임계값 {threshold}조 미달</strong> — 회의록상
                    이 연도는 영업이익 {threshold}조 이상일 때만 성과급 풀이
                    활성화됩니다. 현재 영업이익으로는 사업부별 1인당 성과급이
                    0원으로 산정됩니다.
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            className="flex flex-wrap gap-1.5 mt-2"
            role="group"
            aria-label="영업이익 빠른선택"
          >
            {[30, 50, 100, 200, 350, 500, 1000].map((v) => {
              const active = profitFmt === String(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setProfitFmt(String(v))}
                  aria-pressed={active}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    active
                      ? "bg-electric text-white"
                      : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white"
                  }`}
                >
                  {v}조
                </button>
              );
            })}
          </div>
        </div>

        {/* 고정 정책 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FixedPolicyCard
            label="성과급 재원 비율"
            value="10.5%"
            note="영업이익의 10.5% — 공개 노사 합의 보도 기반 고정"
            color="#7C83FF"
          />
          <FixedPolicyCard
            label="부문 : 사업부"
            value="4 : 6"
            note="부문 균등 40% · 사업부 가중 60%"
            color="#F59E0B"
          />
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
          <span
            className="text-navy dark:text-canvas-50 font-black tabular-nums"
            aria-live="polite"
          >
            {result.totalFundTrillion}조{" "}
            <span className="text-faint-blue font-bold text-sm">
              ({result.totalFundEok}억원)
            </span>
          </span>
        </div>
      </section>

      {/* 사업부 설정 */}
      <section
        className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
        aria-labelledby="division-section-title"
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p
            id="division-section-title"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue"
          >
            사업부 설정
          </p>
          <p className="text-[11px] text-faint-blue">
            가중치 합계{" "}
            <span className="text-navy dark:text-canvas-50 font-black tabular-nums">
              {result.ratioSum.toFixed(1)}
            </span>{" "}
            (상대값 — 1.0이 표준)
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DIVISIONS.map((d) => (
            <div key={d.id}>
              <p
                className="text-sm font-black mb-3 inline-flex items-center gap-1.5"
                style={{ color: d.color }}
              >
                <span
                  className="w-3 h-3 rounded-full inline-flex items-center justify-center text-[8px] font-black text-white"
                  style={{ backgroundColor: d.color }}
                  aria-hidden
                >
                  {d.shortLabel}
                </span>
                {d.label}
              </p>
              <div className="space-y-3">
                <LabeledCommaInput
                  label="인원"
                  unit="명"
                  value={counts[d.id]}
                  onChange={(v) =>
                    setCounts((prev) => ({ ...prev, [d.id]: v }))
                  }
                  color={d.color}
                />
                <LabeledDecimalInput
                  label="사업부 가중치"
                  unit="× 표준"
                  value={ratios[d.id]}
                  onChange={(v) =>
                    setRatios((prev) => ({ ...prev, [d.id]: v }))
                  }
                  color={d.color}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-faint-blue mt-4 leading-relaxed">
          가중치는 절대 합이 1일 필요 없는 <strong>상대값</strong>입니다.
          1.0이 표준, 0.7이 70% 가중, 0.0이면 사업부 분배 제외. 사업부 풀(60%)을
          Σ(인원×가중치)로 정규화해 분배합니다.
        </p>
      </section>

      {/* 1인당 평균 결과 */}
      <section
        className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
        aria-labelledby="avg-result-title"
      >
        <p
          id="avg-result-title"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1"
        >
          1인당 성과급 결과 (세전 · 평균 직원 기준)
        </p>
        <p className="text-[11px] text-faint-blue mb-5">
          이 값은 사업부 평균이며, 본인 케이스는 아래 "내 연봉으로 계산"에서
          확인.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.perDivision.map((r) => (
            <ResultCard
              key={r.id}
              label={r.label}
              color={r.color}
              bgTint={r.bgTint}
              shortLabel={r.shortLabel}
              buPart={r.buPart}
              saPart={r.saPart}
              total={r.total}
              max={result.max}
            />
          ))}
        </div>
      </section>

      {/* 내 연봉으로 계산 */}
      <MySalaryCalculator perDivision={result.perDivision} />

      {/* SK하이닉스 비교 */}
      <aside
        className="rounded-2xl p-5"
        style={{
          background: "#10B98108",
          border: "1px solid #10B98133",
        }}
        aria-label="SK하이닉스 비교 참고 박스"
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          style={{ color: "#10B981" }}
        >
          참고 · 비교
        </p>
        <div className="flex items-start gap-3">
          <Lightbulb
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color: "#10B981" }}
            aria-hidden
          />
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
      </aside>

      {/* 다년도 RSU 시뮬레이터 */}
      <MultiYearRSUSimulator memoryPerPerson={result.perDivision[0].total} />

      <p className="text-center text-[11px] text-faint-blue">
        * 만원 단위 반올림 · 공개 노사 합의 보도 기반 추정 시뮬레이터
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 내 연봉으로 계산 — 세금 가정 사용자 조정 가능
// ────────────────────────────────────────────────────────────

function MySalaryCalculator({
  perDivision,
}: {
  perDivision: Array<{
    id: string;
    label: string;
    color: string;
    bgTint: string;
    shortLabel: string;
    total: number;
  }>;
}) {
  const [salaryFmt, setSalaryFmt] = useState("80,000,000");
  const [selectedDivId, setSelectedDivId] = useState<string>("memory");
  const [creditRate, setCreditRate] = useState<number>(20); // 세액공제율 % (평균 직장인 수준)
  const [applyInsurance, setApplyInsurance] = useState<boolean>(true); // 디폴트 ON (보수정산 반영)

  const salary = parseNumberInput(salaryFmt);
  const selected =
    perDivision.find((d) => d.id === selectedDivId) ?? perDivision[0];

  const personal = useMemo(() => {
    const ratio = salary / REFERENCE_SALARY;
    const myGrossManwon = selected.total * ratio;
    const myGrossWon = myGrossManwon * 10000;

    const tax = calcBonusNet(salary, myGrossWon, creditRate, applyInsurance);
    const grossPct = salary > 0 ? (myGrossWon / salary) * 100 : 0;
    const netPct = salary > 0 ? (tax.net / salary) * 100 : 0;
    return {
      grossWon: myGrossWon,
      netWon: tax.net,
      deductWon: tax.deduct,
      effRate: tax.effRate,
      breakdown: tax.breakdown,
      grossManwon: myGrossManwon,
      netManwon: tax.net / 10000,
      grossPct,
      netPct,
      grossMultiplier: salary > 0 ? myGrossWon / salary : 0,
    };
  }, [salary, selected, creditRate, applyInsurance]);

  const animGross = useCountUp(personal.grossManwon);
  const animNet = useCountUp(personal.netManwon);

  return (
    <section
      className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
      aria-labelledby="my-calc-title"
    >
      <p
        id="my-calc-title"
        className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1 inline-flex items-center gap-1.5"
      >
        <User size={11} className="text-electric" aria-hidden /> 내 연봉으로
        계산 — 세전·세후
      </p>
      <p className="text-[11px] text-faint-blue mb-5 leading-relaxed">
        평균 결과는 평균 직원 연봉 8,000만원 기준입니다. 본인 연봉에 비례해
        받는 성과급과 세금 공제 후 실수령액을 계산합니다.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="my-salary"
            className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
          >
            내 연봉 (세전)
          </label>
          <div className="relative">
            <input
              id="my-salary"
              type="text"
              inputMode="numeric"
              value={salaryFmt}
              onChange={(e) =>
                setSalaryFmt(formatNumberInput(e.target.value))
              }
              className="w-full rounded-xl px-4 py-3 text-2xl font-black focus:outline-none transition pr-12 text-electric tabular-nums"
              style={{
                backgroundColor: "#0145F208",
                border: "2px solid #0145F2",
              }}
              placeholder="80,000,000"
              aria-label="내 연봉 입력 (원)"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              원
            </span>
          </div>
          <div
            className="flex flex-wrap gap-1.5 mt-2"
            role="group"
            aria-label="연봉 빠른선택"
          >
            {[
              50_000_000,
              80_000_000,
              100_000_000,
              140_000_000,
              200_000_000,
            ].map((v) => {
              const active = parseNumberInput(salaryFmt) === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSalaryFmt(v.toLocaleString("ko-KR"))}
                  aria-pressed={active}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    active
                      ? "bg-electric text-white"
                      : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white"
                  }`}
                >
                  {(v / 10000).toLocaleString("ko-KR")}만
                </button>
              );
            })}
          </div>
        </div>

        {/* 사업부 선택 — 탭 ARIA */}
        <div>
          <label
            id="div-tabs-label"
            className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
          >
            내 사업부 선택
          </label>
          <div
            className="grid grid-cols-3 gap-2"
            role="tablist"
            aria-labelledby="div-tabs-label"
          >
            {perDivision.map((d) => {
              const active = selectedDivId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedDivId(d.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-black border transition-all inline-flex items-center justify-center gap-1.5 ${
                    active
                      ? "text-white scale-[1.02] shadow-md"
                      : "bg-white dark:bg-canvas-900 hover:scale-[1.01]"
                  }`}
                  style={{
                    backgroundColor: active ? d.color : undefined,
                    borderColor: active ? d.color : `${d.color}55`,
                    color: active ? "#fff" : d.color,
                  }}
                >
                  {active && <Check size={12} aria-hidden />}
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 세금 가정 조정 */}
        <details className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4 group">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-faint-blue inline-flex items-center gap-1.5 list-none">
            <Settings size={12} className="text-electric" aria-hidden /> 세금
            계산 가정 조정
            <span className="ml-auto text-electric group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-faint-blue">
                  세액공제율 (가정)
                </span>
                <span
                  className="text-lg font-black tabular-nums"
                  style={{ color: "#0145F2" }}
                >
                  {creditRate}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={creditRate}
                onChange={(e) => setCreditRate(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #0145F2 0%, #0145F2 ${
                    (creditRate / 50) * 100
                  }%, #DDE4EC ${(creditRate / 50) * 100}%, #DDE4EC 100%)`,
                  accentColor: "#0145F2",
                }}
                aria-label="세액공제율 가정"
              />
              <p className="text-[10px] text-faint-blue mt-1 leading-relaxed">
                자녀·연금·의료비·기부 등 세액공제로 소득세가 줄어드는 비율.
                디폴트 20% (평균 직장인). IRP·기부 적극 활용 시 30%+, 단순
                기본공제만이면 10% 내외.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyInsurance}
                onChange={(e) => setApplyInsurance(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-electric flex-shrink-0"
                aria-describedby="insurance-help"
              />
              <span className="text-xs">
                <span className="font-bold text-navy dark:text-canvas-50">
                  4대보험 추가 부과 적용
                </span>
                <span
                  id="insurance-help"
                  className="block text-faint-blue mt-1 leading-relaxed"
                >
                  성과급은 보수에 합산되어 4대보험 정산 시 추가 부과됩니다.
                  단 국민연금은 보수월액 상한(연 7,404만원)이 있어 고소득자는
                  추가 부과액이 적습니다. 체크하지 않으면 4대보험은
                  포함하지 않고 소득세·지방세만 공제합니다.
                </span>
              </span>
            </label>
          </div>
        </details>

        {/* 결과 카드 */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${selected.color} 0%, ${selected.color}DD 100%)`,
            boxShadow: `0 12px 32px ${selected.color}30`,
          }}
          aria-live="polite"
        >
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(#fff, transparent 70%)" }}
            aria-hidden
          />
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-3"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {selected.label} · 본인 케이스
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p
                className="text-[10px] font-bold mb-1"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                세전 성과급
              </p>
              <p className="text-2xl sm:text-3xl font-black tabular-nums">
                {fmtManwon(animGross)}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {fmtEok(personal.grossManwon)}
              </p>
              <div
                className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums"
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#fff",
                }}
              >
                연봉의 {personal.grossPct.toFixed(1)}%
              </div>
            </div>
            <div>
              <p
                className="text-[10px] font-bold mb-1"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                세후 실수령
              </p>
              <p className="text-2xl sm:text-3xl font-black tabular-nums">
                {fmtManwon(animNet)}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                공제 {personal.effRate.toFixed(1)}%
              </p>
              <div
                className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums"
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#fff",
                }}
              >
                연봉의 {personal.netPct.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* 연봉 대비 산식 한 줄 */}
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              산식
            </p>
            <p
              className="text-xs leading-relaxed tabular-nums"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              연봉{" "}
              <strong>{(salary / 10000).toLocaleString("ko-KR")}만원</strong> ×{" "}
              <strong>{personal.grossMultiplier.toFixed(2)}배</strong> = 세전{" "}
              <strong>{fmtManwon(personal.grossManwon)}</strong>
            </p>
          </div>
        </div>

        {/* 공제 상세 + 면책 */}
        {personal.grossWon > 0 && (
          <details className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4 group">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-faint-blue flex items-center justify-between">
              공제 항목 상세
              <span className="text-electric group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <div className="mt-3 space-y-1.5 text-xs">
              <DeductRow
                label={`소득세 (누진세율 · 세액공제 ${creditRate}% 가정)`}
                value={personal.breakdown.incomeTax}
              />
              <DeductRow
                label="지방소득세 (소득세의 10%)"
                value={personal.breakdown.localTax}
              />
              {applyInsurance && (
                <>
                  <DeductRow
                    label="국민연금 (4.5% · 보수월액 상한 적용)"
                    value={personal.breakdown.nationalPension}
                  />
                  <DeductRow
                    label="건강보험 (3.545%)"
                    value={personal.breakdown.healthIns}
                  />
                  <DeductRow
                    label="장기요양 (건강보험의 12.95%)"
                    value={personal.breakdown.longTermCare}
                  />
                  <DeductRow
                    label="고용보험 (0.9%)"
                    value={personal.breakdown.employment}
                  />
                </>
              )}
              <div className="border-t border-canvas-200 dark:border-canvas-700 mt-2 pt-2">
                <DeductRow
                  label="총 공제"
                  value={personal.deductWon}
                  bold
                />
              </div>
              <p className="text-[10px] text-faint-blue mt-3 leading-relaxed">
                ※ 본 계산은 추정치이며 실제 회사 원천징수와 다릅니다. 세액공제율
                {creditRate}% 가정은 사용자 조정 가능.{" "}
                {applyInsurance
                  ? "4대보험은 보수 정산 방식에 따라 회사가 일부 분담하므로 실제 본인 부담은 더 작을 수 있습니다."
                  : "4대보험 추가 부과를 적용하지 않은 상태입니다. 위의 토글을 켜면 부과 결과를 확인할 수 있습니다."}
              </p>
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

function DeductRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`${
          bold ? "font-black text-navy dark:text-canvas-50" : "text-muted-blue"
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${
          bold
            ? "font-black text-rose-500 text-sm"
            : "font-bold text-navy dark:text-canvas-50"
        }`}
      >
        -{Math.round(value).toLocaleString("ko-KR")}원
      </span>
    </div>
  );
}

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

const DEFAULT_YEAR_ROWS: YearRow[] = [
  { id: "y1", year: 2026, perPersonFmt: "6,000", stockRatio: 30, vestedPct: 100, stockPriceFmt: "85,000" },
  { id: "y2", year: 2027, perPersonFmt: "8,000", stockRatio: 30, vestedPct: 75, stockPriceFmt: "100,000" },
  { id: "y3", year: 2028, perPersonFmt: "10,000", stockRatio: 30, vestedPct: 50, stockPriceFmt: "120,000" },
  { id: "y4", year: 2029, perPersonFmt: "9,000", stockRatio: 30, vestedPct: 25, stockPriceFmt: "110,000" },
  { id: "y5", year: 2030, perPersonFmt: "7,500", stockRatio: 30, vestedPct: 0, stockPriceFmt: "95,000" },
];

function MultiYearRSUSimulator({
  memoryPerPerson,
}: {
  memoryPerPerson: number;
}) {
  const [rows, setRows] = useState<YearRow[]>(DEFAULT_YEAR_ROWS);
  const [sellPriceFmt, setSellPriceFmt] = useState("150,000");

  const sellPrice = parseNumberInput(sellPriceFmt);

  function syncFromMemory() {
    const v = Math.round(memoryPerPerson).toLocaleString("ko-KR");
    setRows((prev) => prev.map((r) => ({ ...r, perPersonFmt: v })));
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
        <button
          type="button"
          onClick={syncFromMemory}
          className="text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-electric-5 text-electric border border-electric-30 hover:bg-electric-10 transition-colors inline-flex items-center gap-1"
        >
          <TrendingUp size={10} aria-hidden /> 메모리 1인당으로 채우기
        </button>
      </div>
      <p className="text-[11px] text-faint-blue mb-5 leading-relaxed">
        성과급 중 주식(RSU) 비중 + 매년 풀리는 매도 제한 + 연도별 주가 입력. 누적
        매도 가능 주식이 자동 합산되고, 하단 기준 매도가로 통합 매도 시 가치까지
        즉시 산출됩니다.
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
            {[80000, 100000, 150000, 200000, 300000].map((p) => {
              const active = sellPrice === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSellPriceFmt(p.toLocaleString("ko-KR"))}
                  aria-pressed={active}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-colors ${
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

              {/* hover hit-area (그룹 전체) */}
              <rect
                x={padL + groupWidth * i}
                y={padT}
                width={groupWidth}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onTouchStart={() => setHoverIdx(i)}
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
              그 해 주가: {fmtEok(enrichedData[hoverIdx].cumValue)}
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
              기준 매도가: {fmtEok(enrichedData[hoverIdx].cumSellPriceValue)}
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
            className="p-1.5 rounded-md text-faint-blue hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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
// 입력 컴포넌트들 (콤마 자동·단위 일관)
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
          className="w-full rounded-md px-2 py-1.5 pr-9 text-sm font-black tabular-nums focus:outline-none transition-all bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50"
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
          className="w-full rounded-md px-2 py-1.5 pr-7 text-sm font-black tabular-nums focus:outline-none transition-all bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50"
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

function LabeledCommaInput({
  label,
  unit,
  value,
  onChange,
  color,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 text-faint-blue">
        {label} <span className="opacity-70 font-medium">({unit})</span>
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatNumberInput(e.target.value))}
          className="w-full rounded-lg px-3 py-2 pr-9 text-sm font-black tabular-nums focus:outline-none transition-all bg-canvas-50 dark:bg-canvas-800 text-navy dark:text-canvas-50"
          style={{ border: `1.5px solid ${color}33` }}
          onFocus={(e) => (e.currentTarget.style.borderColor = color)}
          onBlur={(e) => (e.currentTarget.style.borderColor = `${color}33`)}
          aria-label={`${label} (${unit})`}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function LabeledDecimalInput({
  label,
  unit,
  value,
  onChange,
  color,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 text-faint-blue">
        {label} <span className="opacity-70 font-medium">({unit})</span>
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "");
            onChange(v);
          }}
          className="w-full rounded-lg px-3 py-2 pr-10 text-sm font-black tabular-nums focus:outline-none transition-all bg-canvas-50 dark:bg-canvas-800 text-navy dark:text-canvas-50"
          style={{ border: `1.5px solid ${color}33` }}
          onFocus={(e) => (e.currentTarget.style.borderColor = color)}
          onBlur={(e) => (e.currentTarget.style.borderColor = `${color}33`)}
          aria-label={`${label} (${unit})`}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
          {unit}
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

function FixedPolicyCard({
  label,
  value,
  note,
  color,
}: {
  label: string;
  value: string;
  note: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{ backgroundColor: `${color}10`, border: `1px solid ${color}33` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-faint-blue inline-flex items-center gap-1.5">
          <Lock size={9} aria-hidden /> {label}
        </span>
      </div>
      <p
        className="text-2xl font-black tabular-nums mb-1"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-blue leading-relaxed">{note}</p>
    </div>
  );
}

function ResultCard({
  label,
  color,
  bgTint,
  shortLabel,
  buPart,
  saPart,
  total,
  max,
}: {
  label: string;
  color: string;
  bgTint: string;
  shortLabel: string;
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
        className="text-sm font-black mb-2 inline-flex items-center gap-1.5"
        style={{ color }}
      >
        <span
          className="w-3 h-3 rounded-full inline-flex items-center justify-center text-[8px] font-black text-white"
          style={{ backgroundColor: color }}
          aria-hidden
        >
          {shortLabel}
        </span>
        {label}
      </p>
      <div className="text-[11px] text-muted-blue leading-relaxed mb-2">
        <div className="flex justify-between">
          <span>부문</span>
          <span className="text-navy dark:text-canvas-50 font-bold tabular-nums">
            {fmtManwonInt(buPart)}만원
          </span>
        </div>
        <div className="flex justify-between">
          <span>사업부</span>
          <span className="text-navy dark:text-canvas-50 font-bold tabular-nums">
            {fmtManwonInt(saPart)}만원
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

// 사용 안 함 경고 회피
void Info;
