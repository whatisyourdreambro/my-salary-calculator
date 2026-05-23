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
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// 고정 정책 변수 (회의록 기반)
// ────────────────────────────────────────────────────────────
const FIXED_RERATE = 10.5; // 성과급 재원 비율 — 영업이익의 10.5%
const FIXED_BU_RATIO = 4; // 부문 : 사업부 = 4 : 6
const FIXED_SA_RATIO = 6;
const REFERENCE_SALARY = 80_000_000; // 본인 연봉 비례 기준 (평균 8천만원)

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

function calcBonusNet(salary: number, bonusWon: number) {
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
  const incomeTaxOnBonus =
    (calcTax(totalTaxable) - calcTax(baseTaxable)) * 0.7;
  const localTax = incomeTaxOnBonus * 0.1;

  const pensionCap = 74_040_000;
  const pensionBase = Math.max(0, pensionCap - salary);
  const nationalPension = Math.min(bonusWon, pensionBase) * 0.045;
  const healthIns = bonusWon * 0.03545;
  const longTermCare = healthIns * 0.1295;
  const employment = bonusWon * 0.009;
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
// 사업부 데이터
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
  const [profitStr, setProfitStr] = useState("350"); // 조원 (자유 입력)

  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(DIVISIONS.map((d) => [d.id, d.defaultCount]))
  );
  const [ratios, setRatios] = useState<Record<string, number>>(
    Object.fromEntries(DIVISIONS.map((d) => [d.id, d.defaultRatio]))
  );

  const profit = Math.max(0, Number(profitStr) || 0);

  const result = useMemo(() => {
    const totalFundManwon = profit * 1e8 * (FIXED_RERATE / 100);
    const buFund = totalFundManwon * (FIXED_BU_RATIO / 10);
    const saFund = totalFundManwon * (FIXED_SA_RATIO / 10);

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
  }, [profit, counts, ratios]);

  return (
    <div className="space-y-4 mb-10">
      {/* 영업이익 + 고정 정책 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 transition-shadow hover:shadow-md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5">
          주요 변수
        </p>

        {/* 영업이익 자유 입력 */}
        <div className="mb-5">
          <div className="flex items-end justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-faint-blue">
              영업이익 (조원)
            </span>
            <span
              className="text-3xl font-black tabular-nums"
              style={{ color: "#0145F2" }}
            >
              {profit.toLocaleString("ko-KR")}
              <span className="text-base ml-0.5">조</span>
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={profitStr}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setProfitStr(v);
              }}
              className="w-full rounded-xl px-4 py-3 text-2xl font-black tabular-nums focus:outline-none transition-all pr-12 text-electric"
              style={{
                backgroundColor: "#0145F208",
                border: "2px solid #0145F2",
              }}
              placeholder="350"
              aria-label="영업이익 (조원)"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              조원
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[30, 50, 100, 200, 350, 500, 1000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setProfitStr(String(v))}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white transition-colors"
              >
                {v}조
              </button>
            ))}
          </div>
        </div>

        {/* 고정 정책 — 재원비율 10.5%, 부문:사업부 4:6 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FixedPolicyCard
            label="성과급 재원 비율"
            value="10.5%"
            note="영업이익의 10.5% — 회의록 고정"
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

      {/* 1인당 평균 결과 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1">
          1인당 성과급 결과 (세전 · 평균 직원 기준)
        </p>
        <p className="text-[11px] text-faint-blue mb-5">
          이 결과는 사업부 평균이며, 아래 "내 연봉으로 계산"에서 본인 케이스를
          확인하세요.
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

      {/* 내 연봉으로 계산 — 핵심 신규 섹션 */}
      <MySalaryCalculator perDivision={result.perDivision} />

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

      {/* 다년도 RSU 시뮬레이터 */}
      <MultiYearRSUSimulator memoryPerPerson={result.perDivision[0].total} />

      <p className="text-center text-[11px] text-faint-blue">
        * 만원 단위 반올림 · 본 계산기는 공개 노사 합의 보도 기반 추정치
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 내 연봉으로 계산 (세전·세후)
// ────────────────────────────────────────────────────────────

function MySalaryCalculator({
  perDivision,
}: {
  perDivision: Array<{
    id: string;
    label: string;
    color: string;
    bgTint: string;
    total: number;
  }>;
}) {
  const [salaryFmt, setSalaryFmt] = useState("80,000,000");
  const [selectedDivId, setSelectedDivId] = useState<string>("memory");

  const salary = parseNumberInput(salaryFmt);
  const selected =
    perDivision.find((d) => d.id === selectedDivId) ?? perDivision[0];

  const personal = useMemo(() => {
    // 평균 결과(만원)는 평균 직원 연봉 8,000만원 기준이라고 가정.
    // 본인 연봉 비례로 환산 (기본급 비례 모델).
    const ratio = salary / REFERENCE_SALARY;
    const myGrossManwon = selected.total * ratio;
    const myGrossWon = myGrossManwon * 10000;

    const tax = calcBonusNet(salary, myGrossWon);
    return {
      grossWon: myGrossWon,
      netWon: tax.net,
      deductWon: tax.deduct,
      effRate: tax.effRate,
      breakdown: tax.breakdown,
      grossManwon: myGrossManwon,
      netManwon: tax.net / 10000,
    };
  }, [salary, selected]);

  const animGross = useCountUp(personal.grossManwon);
  const animNet = useCountUp(personal.netManwon);

  return (
    <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1 inline-flex items-center gap-1.5">
        <User size={11} className="text-electric" /> 내 연봉으로 계산 — 세전·세후
      </p>
      <p className="text-[11px] text-faint-blue mb-5 leading-relaxed">
        위 평균 결과는 평균 직원 연봉 8,000만원 기준입니다. 본인 연봉에 비례해
        받는 성과급과 세금·4대보험 공제 후 실수령액을 계산합니다.
      </p>

      <div className="space-y-4">
        {/* 본인 연봉 */}
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
              aria-label="내 연봉 입력"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              원
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              50_000_000,
              80_000_000,
              100_000_000,
              140_000_000,
              200_000_000,
            ].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSalaryFmt(v.toLocaleString("ko-KR"))}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white transition-colors"
              >
                {(v / 10000).toLocaleString("ko-KR")}만
              </button>
            ))}
          </div>
        </div>

        {/* 사업부 선택 */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
            내 사업부 선택
          </label>
          <div className="grid grid-cols-3 gap-2">
            {perDivision.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDivId(d.id)}
                className={`rounded-xl px-3 py-2 text-xs font-black border transition-all ${
                  selectedDivId === d.id
                    ? "text-white scale-[1.02] shadow-md"
                    : "bg-white dark:bg-canvas-900 hover:scale-[1.01]"
                }`}
                style={{
                  backgroundColor:
                    selectedDivId === d.id ? d.color : undefined,
                  borderColor:
                    selectedDivId === d.id ? d.color : `${d.color}55`,
                  color:
                    selectedDivId === d.id
                      ? "#fff"
                      : d.color,
                }}
                aria-pressed={selectedDivId === d.id}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${selected.color} 0%, ${selected.color}DD 100%)`,
            boxShadow: `0 12px 32px ${selected.color}30`,
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(#fff, transparent 70%)",
            }}
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
            </div>
          </div>
        </div>

        {/* 공제 상세 */}
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
                label="소득세 (누진세율 · 세액공제 30% 가정)"
                value={personal.breakdown.incomeTax}
              />
              <DeductRow
                label="지방소득세 (소득세의 10%)"
                value={personal.breakdown.localTax}
              />
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
              <div className="border-t border-canvas-200 dark:border-canvas-700 mt-2 pt-2">
                <DeductRow
                  label="총 공제"
                  value={personal.deductWon}
                  bold
                />
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
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
  perPerson: number;
  stockRatio: number;
  vestedPct: number;
  stockPrice: number;
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
  const [sellPrice, setSellPrice] = useState(150000);

  function syncFromMemory() {
    setRows((prev) =>
      prev.map((r) => ({ ...r, perPerson: Math.round(memoryPerPerson) }))
    );
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
        perPerson: last?.perPerson ?? 6000,
        stockRatio: last?.stockRatio ?? 30,
        vestedPct: 0,
        stockPrice: last?.stockPrice ?? 100000,
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
      const rsuValueManwon = (r.perPerson * r.stockRatio) / 100;
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
        cumRsuShares,
        cumRsuValueManwon,
        cumYearlySaleValue,
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
        성과급 중 주식(RSU) 비중 + 회의록상 매년 풀리는 매도 제한 + 연도별 주가
        입력. 누적 매도 가능 주식이 자동 합산되고 하단 기준 매도가로 통합 매도 시
        가치까지 즉시 산출. 우측 그래프는 연도별 누적 가치 추이를 보여줍니다.
      </p>

      {/* 좌: 행 카드 / 우: 누적 그래프 */}
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
            <Plus size={14} /> 연도 추가
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
            onChange={(e) =>
              setSellPrice(Math.max(0, Number(e.target.value) || 0))
            }
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
            누적 매도 가능 {fmtPlain(computed.cumVestedShares)}주 ×{" "}
            {fmtPlain(sellPrice)}원
          </p>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 누적 그래프 (SVG)
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
  const padL = 38;
  const padR = 18;
  const padT = 30;
  const padB = 40;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  // 두 시리즈: cumYearSaleValue (그 해 주가 기준 매도) + cumSellPriceValue (기준 매도가 기준)
  const enrichedData = data.map((d) => ({
    ...d,
    cumSellPriceValue: (d.cumShares * sellPrice) / 10000, // 만원
  }));

  const maxVal = Math.max(
    ...enrichedData.flatMap((d) => [d.cumValue, d.cumSellPriceValue]),
    1
  );

  function xPos(i: number) {
    return data.length <= 1
      ? padL + innerW / 2
      : padL + (i / (data.length - 1)) * innerW;
  }
  function yPos(v: number) {
    return padT + innerH - (v / maxVal) * innerH;
  }

  // 라인 path
  const yearPath = enrichedData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(d.cumValue)}`)
    .join(" ");
  const sellPath = enrichedData
    .map(
      (d, i) =>
        `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(d.cumSellPriceValue)}`
    )
    .join(" ");
  const yearArea =
    yearPath +
    ` L ${xPos(data.length - 1)} ${padT + innerH} L ${xPos(0)} ${padT + innerH} Z`;

  return (
    <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-2">
        연도별 누적 매도 가능 가치
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="다년도 누적 매도 가능 가치 그래프"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0145F2" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0145F2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 그리드 라인 */}
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

        {/* 면적 (그 해 주가 매도 기준) */}
        <path d={yearArea} fill="url(#areaGrad)" />

        {/* 라인 — 기준 매도가 시리즈 */}
        <path
          d={sellPath}
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* 라인 — 그 해 주가 시리즈 */}
        <path d={yearPath} fill="none" stroke="#0145F2" strokeWidth="2.5" />

        {/* 데이터 포인트 */}
        {enrichedData.map((d, i) => (
          <g key={i}>
            <circle
              cx={xPos(i)}
              cy={yPos(d.cumSellPriceValue)}
              r="3"
              fill="#10B981"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <circle
              cx={xPos(i)}
              cy={yPos(d.cumValue)}
              r="4"
              fill="#0145F2"
              stroke="#fff"
              strokeWidth="2"
            />
            {/* hover hit-area */}
            <rect
              x={xPos(i) - 18}
              y={padT}
              width="36"
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              onTouchStart={() => setHoverIdx(i)}
              style={{ cursor: "pointer" }}
            />
            {/* x축 라벨 */}
            <text
              x={xPos(i)}
              y={height - padB + 18}
              textAnchor="middle"
              fontSize="10"
              fill="#7B8FA1"
              fontWeight="700"
            >
              {d.year}
            </text>
          </g>
        ))}

        {/* 호버 툴팁 */}
        {hoverIdx !== null && enrichedData[hoverIdx] && (
          <g pointerEvents="none">
            <line
              x1={xPos(hoverIdx)}
              x2={xPos(hoverIdx)}
              y1={padT}
              y2={padT + innerH}
              stroke="#0145F2"
              strokeOpacity="0.3"
              strokeWidth="1"
            />
            <rect
              x={Math.min(
                Math.max(xPos(hoverIdx) - 60, padL),
                width - padR - 120
              )}
              y={padT - 6}
              width="120"
              height="62"
              rx="6"
              fill="#0A1829"
            />
            <text
              x={Math.min(
                Math.max(xPos(hoverIdx) - 60, padL),
                width - padR - 120
              ) + 8}
              y={padT + 9}
              fontSize="10"
              fill="#fff"
              fontWeight="700"
            >
              {enrichedData[hoverIdx].year}년
            </text>
            <text
              x={Math.min(
                Math.max(xPos(hoverIdx) - 60, padL),
                width - padR - 120
              ) + 8}
              y={padT + 24}
              fontSize="9"
              fill="#7C83FF"
            >
              그 해 주가: {fmtEok(enrichedData[hoverIdx].cumValue)}
            </text>
            <text
              x={Math.min(
                Math.max(xPos(hoverIdx) - 60, padL),
                width - padR - 120
              ) + 8}
              y={padT + 37}
              fontSize="9"
              fill="#10B981"
            >
              기준가: {fmtEok(enrichedData[hoverIdx].cumSellPriceValue)}
            </text>
            <text
              x={Math.min(
                Math.max(xPos(hoverIdx) - 60, padL),
                width - padR - 120
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
            className="w-3 h-0.5"
            style={{ backgroundColor: "#0145F2" }}
          />
          연도별 그 해 주가 기준
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-blue">
          <span
            className="w-3 h-0.5"
            style={{
              backgroundImage:
                "linear-gradient(to right, #10B981 50%, transparent 50%)",
              backgroundSize: "5px 2px",
            }}
          />
          기준 매도가 ({(sellPrice / 10000).toFixed(0)}만원)
        </span>
      </div>
      <p className="text-[10px] text-faint-blue mt-2 leading-relaxed">
        호버하면 연도별 누적 가치 비교. 두 선의 격차가 클수록 주가 변동 영향이
        큽니다.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 행 카드
// ────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────
// 기타 헬퍼 컴포넌트
// ────────────────────────────────────────────────────────────

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
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}33`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-faint-blue inline-flex items-center gap-1.5">
          <Lock size={9} /> {label}
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
