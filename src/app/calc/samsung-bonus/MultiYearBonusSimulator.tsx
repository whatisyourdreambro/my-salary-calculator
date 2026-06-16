"use client";

// 다년도 누적 성과급 시뮬레이터 — Client.tsx 에서 next/dynamic(ssr:false) 으로 지연 로드.
// 3,900줄 Client 본체에서 분리해 메인 계산기 First Load 를 경량화한다.

import { useState, useMemo } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  Lock,
  Pencil,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import {
  DIVISIONS,
  FIXED_RERATE,
  FIXED_BU_RATIO,
  FIXED_SA_RATIO,
  FIXED_OPI1_RATE,
  REFERENCE_SALARY,
  getThreshold,
  calcBonusNet,
  fmtManwon,
  fmtManwonInt,
  fmtEok,
  parseNumberInput,
  useCountUp,
} from "./shared";
import { SALARY_PERCENTILES, AGE_GROUPS } from "@/data/salaryRankData";

// ────────────────────────────────────────────────────────────
// 다년도 누적 성과급 시뮬레이터
// 사업부 선택 + 연도별 영업이익 입력만으로 자동 계산
// 임계값 자동 적용 (26~28: 200조, 29~35: 100조)
// 본인 연봉 비례 + 세후 계산 + 누적 막대 그래프
// ────────────────────────────────────────────────────────────

type YearProfitRow = {
  id: string;
  year: number;
  profitTrillionFmt: string; // 그 해 영업이익 (조)
  /** manual 모드용 — 그 해 본인 연봉 (만원 단위 입력값). 빈 값/0이면 메인 연봉 사용 */
  yearlySalaryManwonFmt?: string;
  /** perYearClEnabled 시 그 해 본인 CL (옵션 — 진급 시나리오) */
  myClPerYear?: MyCl;
  /** CL4 일 때 그 해 본인 평가 등급 (가/나/일반). 평가 OFF 또는 CL≠CL4 면 무시 */
  myEvalGrade?: EvalGrade;
};

/**
 * 다년도 연봉 모드.
 * - fixed: 모든 연도 동일 (메인 시뮬 연봉)
 * - growth: 첫 해 연봉에 매년 평균 인상률 복리 적용
 * - manual: 연도별 직접 입력
 */
type SalaryMode = "fixed" | "growth" | "manual";

/** 본인 CL (Career Level) — 삼성전자 직급 체계. CL4 만 가/나고과 분포 적용 대상. */
type MyCl = "cl1" | "cl2" | "cl3" | "cl4";

/** CL4 평가 등급 — 가(상위)/나(중위)/일반. 가중치 1.4/1.2/1.0. */
type EvalGrade = "ga" | "na" | "normal";

/** 사업부별 CL4 가/나고과 인원 (문자열로 보관 — 입력값 그대로) */
type DivEvalCounts = Record<
  "memory" | "common" | "foundry",
  { gaCount: string; naCount: string }
>;

/** 영업이익 일괄 입력 — 구간별 시작/끝 연도와 영업이익 */
type BulkRange = {
  id: string;
  startYear: number;
  endYear: number;
  profitTrillionFmt: string;
};

// ────────────────────────────────────────────────────────────
// CL4 평가 등급 배수 — 보도 기준 가 1.4 / 나 1.2 / 일반 1.0
// 사업부 풀(60%) 안에서 효과 인원 가중에 적용. 부문 풀(40%)은 균등 유지.
// ────────────────────────────────────────────────────────────
const CL4_EVAL_MULT = {
  ga: 1.4,
  na: 1.2,
  normal: 1.0,
} as const;

const CL_OPTIONS: { id: MyCl; label: string; desc: string }[] = [
  { id: "cl1", label: "CL1", desc: "고졸·전문대졸" },
  { id: "cl2", label: "CL2", desc: "대졸 사원·대리" },
  { id: "cl3", label: "CL3", desc: "과장·차장" },
  { id: "cl4", label: "CL4", desc: "부장·수석" },
];

const EVAL_OPTIONS: { id: EvalGrade; label: string; shortLabel: string; mult: number; color: string }[] = [
  { id: "normal", label: "일반 (1.0배)", shortLabel: "일반", mult: 1.0, color: "#64748B" },
  { id: "na", label: "나고과 (1.2배)", shortLabel: "나", mult: 1.2, color: "#10B981" },
  { id: "ga", label: "가고과 (1.4배)", shortLabel: "가", mult: 1.4, color: "#F59E0B" },
];

export default function MultiYearBonusSimulator({
  counts,
  ratios,
  salary,
  creditRate,
  applyInsurance,
  defaultDivId,
}: {
  counts: Record<string, string>;
  ratios: Record<string, string>;
  salary: number;
  creditRate: number;
  applyInsurance: boolean;
  defaultDivId: string;
}) {
  const [targetDivId, setTargetDivId] = useState<string>(defaultDivId);
  const [rows, setRows] = useState<YearProfitRow[]>([
    { id: "y1", year: 2026, profitTrillionFmt: "350" },
    { id: "y2", year: 2027, profitTrillionFmt: "400" },
    { id: "y3", year: 2028, profitTrillionFmt: "380" },
  ]);

  // ── 연봉 모드 (2026-05-25 추가) ──────────────────────────────
  // 고정/인상률 자동/연도별 직접 입력 3가지 모드. UI 카드로 선택.
  const [salaryMode, setSalaryMode] = useState<SalaryMode>("fixed");
  const [growthRate, setGrowthRate] = useState(5); // 평균 인상률 % (디폴트 5%)

  // ── CL4 가/나고과 시스템 (2026-05-25 추가) ──────────────────
  // 사업부별 CL4 가고과·나고과 인원 설정 → 사업부 풀(60%) 안에서 효과 인원 가중 적용.
  // ON 이면 CL4 가/나고과 인력은 1.4/1.2배 받고, 나머지(CL1~3 + CL4 일반)는 적게 받음.
  const [evalEnabled, setEvalEnabled] = useState(false);
  const [divEvalCounts, setDivEvalCounts] = useState<DivEvalCounts>({
    memory: { gaCount: "0", naCount: "0" },
    common: { gaCount: "0", naCount: "0" },
    foundry: { gaCount: "0", naCount: "0" },
  });

  // ── 본인 CL ─────────────────────────────────────────────
  // CL1~CL3: 평가 가중치 1.0 고정 (다른 사람의 가/나고과 영향 받음 → 본인 풀이 줄어듦)
  // CL4: 연도별 가/나/일반 선택 가능
  const [myCl, setMyCl] = useState<MyCl>("cl3");
  const [perYearClEnabled, setPerYearClEnabled] = useState(false); // 연도별 CL 변경 옵션

  // ── 영업이익 일괄 입력 (구간별) ─────────────────────────
  const [bulkExpanded, setBulkExpanded] = useState(false);
  const [bulkRanges, setBulkRanges] = useState<BulkRange[]>([
    { id: "b1", startYear: 2026, endYear: 2028, profitTrillionFmt: "350" },
  ]);

  function updateBulkRange(id: string, patch: Partial<BulkRange>) {
    setBulkRanges((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addBulkRange() {
    const last = bulkRanges[bulkRanges.length - 1];
    const nextStart = last ? Math.min(2036, last.endYear + 1) : 2026;
    setBulkRanges((prev) => [
      ...prev,
      {
        id: `b${Date.now()}`,
        startYear: nextStart,
        endYear: Math.min(2036, nextStart + 2),
        profitTrillionFmt: last?.profitTrillionFmt ?? "300",
      },
    ]);
  }
  function removeBulkRange(id: string) {
    setBulkRanges((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }
  /** 일괄 입력값을 현재 rows 에 적용 — 해당 연도 영업이익 update */
  function applyBulkRanges() {
    setRows((prev) =>
      prev.map((row) => {
        const matched = bulkRanges.find(
          (b) => row.year >= b.startYear && row.year <= b.endYear,
        );
        if (matched) {
          return { ...row, profitTrillionFmt: matched.profitTrillionFmt };
        }
        return row;
      }),
    );
  }
  /** 일괄 입력 구간을 rows 로 확장 — 구간에 해당하는 연도들을 자동 생성 */
  function expandBulkToRows() {
    const newRows: YearProfitRow[] = [];
    let idx = 1;
    bulkRanges.forEach((b) => {
      for (let y = b.startYear; y <= b.endYear; y++) {
        if (y < 2026 || y > 2036) continue;
        newRows.push({
          id: `auto-${idx++}-${y}`,
          year: y,
          profitTrillionFmt: b.profitTrillionFmt,
        });
      }
    });
    if (newRows.length > 0) {
      setRows(newRows);
    }
  }

  function updateRow(id: string, patch: Partial<YearProfitRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }
  function addRow() {
    const last = rows[rows.length - 1];
    const newYear = last ? Math.min(2036, last.year + 1) : 2026;
    setRows((prev) => [
      ...prev,
      {
        id: `y${Date.now()}`,
        year: newYear,
        profitTrillionFmt: last?.profitTrillionFmt ?? "300",
      },
    ]);
  }
  function removeRow(id: string) {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev
    );
  }

  const targetDivision = DIVISIONS.find((d) => d.id === targetDivId) ?? DIVISIONS[0];

  const computed = useMemo(() => {
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
    // ── 사업부별 효과 인원 (CL4 가/나고과 가중 반영) ──────────
    // evalEnabled 이면 가 ×1.4, 나 ×1.2, 나머지 ×1.0 합산.
    // OFF 면 총 인원 그대로.
    const effCounts: Record<string, number> = {};
    DIVISIONS.forEach((d) => {
      const total = countNums[d.id] || 0;
      if (evalEnabled) {
        const ga = Math.max(0, parseNumberInput(divEvalCounts[d.id].gaCount));
        const na = Math.max(0, parseNumberInput(divEvalCounts[d.id].naCount));
        const rest = Math.max(0, total - ga - na);
        effCounts[d.id] = ga * CL4_EVAL_MULT.ga + na * CL4_EVAL_MULT.na + rest * CL4_EVAL_MULT.normal;
      } else {
        effCounts[d.id] = total;
      }
    });
    // wTotal' = Σ(가중치 × 효과인원) — 사업부 풀 분배의 기준
    const wTotal = DIVISIONS.reduce(
      (acc, d) => acc + (effCounts[d.id] || 0) * (ratioNums[d.id] || 0),
      0
    );
    const targetWeight = ratioNums[targetDivId] || 0;

    let cumOpi1 = 0;
    let cumOpi2 = 0;
    let cumOpi2Bu = 0;
    let cumOpi2Sa = 0;
    let cumGross = 0;
    let cumNet = 0;
    let triggeredCount = 0;
    let blockedCount = 0;

    // 첫 행 연도를 인상률 모드 base year 로 사용
    const baseYearForGrowth = rows[0]?.year ?? 2026;

    const enriched = rows.map((row) => {
      // ── 연도별 연봉 계산 (모드별) ──────────────────────────
      let yearSalary = salary;
      if (salaryMode === "growth") {
        const yearDiff = Math.max(0, row.year - baseYearForGrowth);
        yearSalary = salary * Math.pow(1 + growthRate / 100, yearDiff);
      } else if (salaryMode === "manual") {
        const manualWon = parseNumberInput(row.yearlySalaryManwonFmt ?? "") * 10000;
        yearSalary = manualWon > 0 ? manualWon : salary;
      }

      // ── 연도별 본인 CL/평가 (옵션) ───────────────────────────
      const effectiveCl: MyCl =
        perYearClEnabled && row.myClPerYear ? row.myClPerYear : myCl;
      const effectiveGrade: EvalGrade =
        effectiveCl === "cl4" && evalEnabled ? row.myEvalGrade ?? "normal" : "normal";
      // 본인 사업부 풀 배수 — CL4 + 평가 ON 일 때만 가/나 1.4/1.2 적용
      const myEvalMult = CL4_EVAL_MULT[effectiveGrade];

      // OPI1 = 그 해 연봉의 50%
      const opi1Won = yearSalary * (FIXED_OPI1_RATE / 100);
      const opi1Manwon = opi1Won / 10000;
      const personalRatio = yearSalary / REFERENCE_SALARY;

      const profit = Math.max(0, Number(row.profitTrillionFmt) || 0);
      const th = getThreshold(row.year);
      const ok = th === 0 ? true : profit >= th;
      const effectiveProfit = ok ? profit : 0;

      const totalFundManwon = effectiveProfit * 1e8 * (FIXED_RERATE / 100);
      const buFund = totalFundManwon * (FIXED_BU_RATIO / 10);
      const saFund = totalFundManwon * (FIXED_SA_RATIO / 10);
      // 부문 풀은 균등 분배 — 가/나고과 영향 받지 않음
      const buPer = totalCount > 0 ? buFund / totalCount : 0;
      // 사업부 풀 단위 — 효과 인원 기준
      const saUnit = wTotal > 0 ? saFund / wTotal : 0;
      // 사업부 평균 (1.0배 기준) — UI 표시용
      const avgPerPersonManwon = buPer + saUnit * targetWeight;

      // OPI2 — 부문(균등) + 사업부(가/나 가중) + 그 해 연봉 비례
      const opi2BuManwon = buPer * personalRatio;
      // 사업부분에 myEvalMult 적용 (CL4 가/나/일반 배수)
      const opi2SaManwon = saUnit * targetWeight * myEvalMult * personalRatio;
      const opi2Manwon = opi2BuManwon + opi2SaManwon;
      const opi2Won = opi2Manwon * 10000;

      // 합산 — 세금은 OPI1+OPI2 합산에 그 해 연봉 기준 누진세 적용
      const totalGrossManwon = opi1Manwon + opi2Manwon;
      const totalGrossWon = opi1Won + opi2Won;

      const tax = calcBonusNet(
        yearSalary,
        totalGrossWon,
        creditRate,
        applyInsurance
      );
      const myNetManwon = tax.net / 10000;

      cumOpi1 += opi1Manwon;
      cumOpi2 += opi2Manwon;
      cumOpi2Bu += opi2BuManwon;
      cumOpi2Sa += opi2SaManwon;
      cumGross += totalGrossManwon;
      cumNet += myNetManwon;
      if (ok && profit > 0) triggeredCount++;
      if (!ok && profit > 0) blockedCount++;

      return {
        ...row,
        profit,
        threshold: th,
        triggered: ok,
        avgPerPersonManwon,
        opi1Manwon,
        opi2Manwon,
        opi2BuManwon,
        opi2SaManwon,
        myGrossManwon: totalGrossManwon,
        myNetManwon,
        myDeductManwon: totalGrossManwon - myNetManwon,
        // UI 표시용
        appliedSalaryManwon: yearSalary / 10000,
        appliedCl: effectiveCl,
        appliedGrade: effectiveGrade,
        myEvalMult,
      };
    });

    return {
      enriched,
      cumOpi1,
      cumOpi2,
      cumOpi2Bu,
      cumOpi2Sa,
      cumGross,
      cumNet,
      cumDeduct: cumGross - cumNet,
      triggeredCount,
      blockedCount,
      maxVal: Math.max(...enriched.map((r) => r.myGrossManwon), 1),
    };
  }, [rows, counts, ratios, targetDivId, salary, creditRate, applyInsurance, salaryMode, growthRate, evalEnabled, divEvalCounts, myCl, perYearClEnabled]);

  const animCumOpi1 = useCountUp(computed.cumOpi1);
  const animCumOpi2 = useCountUp(computed.cumOpi2);
  const animCumGross = useCountUp(computed.cumGross);
  const animCumNet = useCountUp(computed.cumNet);

  return (
    <section className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-2 inline-flex items-center gap-1.5">
        <Calendar size={11} className="text-electric" aria-hidden /> 다년도 누적
        성과급 시뮬레이션
      </p>
      <p className="text-[11px] text-faint-blue mb-5 leading-relaxed">
        사업부를 선택하고 연도별 영업이익만 입력하세요. <strong>OPI1(연봉×50%) +
        OPI2(특별경영성과금)</strong>을 합산해 세금까지 자동 계산. 위 메인 시뮬의
        인원·가중치·본인 연봉을 그대로 사용. 26~28년 200조, 29~35년 100조 미달
        연도는 OPI2만 0원이 되고 OPI1은 그대로 지급.
      </p>

      {/* 사업부 선택 */}
      <div className="mb-5">
        <label
          id="div-multiyear-label"
          className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
        >
          사업부 선택
        </label>
        <div
          className="grid grid-cols-3 gap-2"
          role="tablist"
          aria-labelledby="div-multiyear-label"
        >
          {DIVISIONS.map((d) => {
            const active = targetDivId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTargetDivId(d.id)}
                className={`rounded-xl px-3 py-2 text-xs font-black border transition-all inline-flex items-center justify-center gap-1.5 ${
                  active ? "text-white scale-[1.02] shadow-md" : "bg-white dark:bg-canvas-900 hover:scale-[1.01]"
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

      {/* ── 본인 CL 선택 (2026-05-25 추가) ───────────────────── */}
      <div className="mb-5">
        <label
          id="my-cl-label"
          className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue inline-flex items-center gap-1.5"
        >
          <User size={11} className="text-electric" aria-hidden />
          본인 CL (Career Level)
        </label>
        <div
          className="grid grid-cols-4 gap-2"
          role="tablist"
          aria-labelledby="my-cl-label"
        >
          {CL_OPTIONS.map((c) => {
            const active = myCl === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMyCl(c.id)}
                className={`rounded-xl px-2 py-2 text-center border-2 transition-all ${
                  active ? "border-electric bg-electric-10 scale-[1.02]" : "border-canvas-200 bg-white dark:bg-canvas-900 hover:border-electric/40"
                }`}
              >
                <div className={`text-[13px] font-black ${active ? "text-electric" : "text-navy dark:text-canvas-50"}`}>
                  {c.label}
                </div>
                <div className="text-[9px] text-faint-blue mt-0.5 leading-tight">
                  {c.desc}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-faint-blue mt-2 leading-relaxed">
          {myCl === "cl4"
            ? "🟡 CL4 선택 — 아래 'CL4 가/나고과 설정'에서 본인이 그 해 가/나/일반 등급을 받았는지 연도별로 선택할 수 있어요."
            : `💡 ${myCl.toUpperCase()} 본인은 평가 가중치 1.0배 고정. 단, CL4 가/나고과 설정 ON 시 회사 사업부 풀에서 가/나고과 인력이 더 가져가므로 본인 OPI2 사업부분이 줄어듭니다.`}
        </p>
      </div>

      {/* ── CL4 가/나고과 설정 (2026-05-25 추가) ───────────── */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => setEvalEnabled(!evalEnabled)}
          aria-pressed={evalEnabled}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
            evalEnabled
              ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
              : "border-canvas-200 bg-white dark:bg-canvas-900 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                evalEnabled ? "bg-amber-500 text-white" : "bg-canvas-100 dark:bg-canvas-800 text-faint-blue"
              }`}
            >
              <AlertCircle size={16} aria-hidden />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-navy dark:text-canvas-50">
                CL4 가/나고과 분포 설정
                <span className={`ml-2 text-[10px] font-black px-1.5 py-0.5 rounded ${
                  evalEnabled ? "bg-amber-500 text-white" : "bg-canvas-200 text-faint-blue"
                }`}>
                  {evalEnabled ? "ON" : "OFF"}
                </span>
              </p>
              <p className="text-[10px] text-faint-blue mt-0.5">
                {evalEnabled
                  ? "사업부 풀에서 가(1.4배)·나(1.2배) 인력 가중 → 일반 인력 적게 받음"
                  : "OFF: 모든 인력 1.0배 동일 (기존 동작)"}
              </p>
            </div>
          </div>
          <div
            className={`w-10 h-5 rounded-full transition-colors relative ${
              evalEnabled ? "bg-amber-500" : "bg-canvas-300 dark:bg-canvas-700"
            }`}
            aria-hidden
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                evalEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>

        {evalEnabled && (
          <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-canvas-900 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                사업부별 CL4 가/나고과 인원
              </p>
              <p className="text-[9px] text-faint-blue">
                가 1.4× / 나 1.2× / 일반 1.0×
              </p>
            </div>
            <div className="space-y-2">
              {DIVISIONS.map((d) => {
                const ev = divEvalCounts[d.id];
                const totalCount = parseNumberInput(counts[d.id]);
                const gaNum = Math.max(0, parseNumberInput(ev.gaCount));
                const naNum = Math.max(0, parseNumberInput(ev.naCount));
                const restNum = Math.max(0, totalCount - gaNum - naNum);
                const exceed = gaNum + naNum > totalCount;
                return (
                  <div key={d.id} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 items-center">
                    <span
                      className="text-[11px] font-black text-center py-1.5 rounded-md"
                      style={{ backgroundColor: `${d.color}15`, color: d.color }}
                    >
                      {d.shortLabel}
                    </span>
                    <div>
                      <label className="text-[9px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                        가 (1.4배)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={ev.gaCount}
                        onChange={(e) =>
                          setDivEvalCounts((prev) => ({
                            ...prev,
                            [d.id]: { ...prev[d.id], gaCount: e.target.value.replace(/[^0-9,]/g, "") },
                          }))
                        }
                        className="w-full px-2 py-1 rounded text-xs font-bold tabular-nums bg-white dark:bg-canvas-900 border border-amber-300 focus:outline-none focus:border-amber-500"
                        aria-label={`${d.label} 가고과 인원`}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        나 (1.2배)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={ev.naCount}
                        onChange={(e) =>
                          setDivEvalCounts((prev) => ({
                            ...prev,
                            [d.id]: { ...prev[d.id], naCount: e.target.value.replace(/[^0-9,]/g, "") },
                          }))
                        }
                        className="w-full px-2 py-1 rounded text-xs font-bold tabular-nums bg-white dark:bg-canvas-900 border border-emerald-300 focus:outline-none focus:border-emerald-500"
                        aria-label={`${d.label} 나고과 인원`}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-faint-blue block mb-0.5">
                        일반 (자동)
                      </label>
                      <div className={`px-2 py-1 rounded text-xs font-bold tabular-nums ${
                        exceed ? "bg-rose-50 text-rose-600" : "bg-canvas-100 dark:bg-canvas-800 text-navy dark:text-canvas-50"
                      }`}>
                        {exceed ? "초과!" : restNum.toLocaleString("ko-KR")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-faint-blue mt-3 leading-relaxed">
              💡 사업부 풀에서 가/나고과 인력이 가중치 더 받음 → 같은 사업부 일반
              인력은 적게 받음. 보도 기준: 가고과 약 10~15% / 나고과 약 20~30% 분포.
            </p>
          </div>
        )}
      </div>

      {/* 연봉 모드 — 고정 / 자동 인상 / 직접 입력 */}
      <div className="mb-5">
        <label
          id="salary-mode-label"
          className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue inline-flex items-center gap-1.5"
        >
          <User size={11} className="text-electric" aria-hidden />
          연도별 연봉 모드
        </label>
        <div
          className="grid grid-cols-3 gap-2"
          role="tablist"
          aria-labelledby="salary-mode-label"
        >
          <SalaryModeCard
            mode="fixed"
            active={salaryMode === "fixed"}
            onClick={() => setSalaryMode("fixed")}
            title="고정"
            desc={`매년 ${(salary / 10000).toLocaleString("ko-KR")}만원`}
            iconName="lock"
          />
          <SalaryModeCard
            mode="growth"
            active={salaryMode === "growth"}
            onClick={() => setSalaryMode("growth")}
            title="자동 인상"
            desc={`매년 +${growthRate}% 복리`}
            iconName="trending"
          />
          <SalaryModeCard
            mode="manual"
            active={salaryMode === "manual"}
            onClick={() => setSalaryMode("manual")}
            title="직접 입력"
            desc="연도별 연봉 수동"
            iconName="edit"
          />
        </div>

        {/* growth 모드 — 인상률 슬라이더 */}
        {salaryMode === "growth" && (
          <div
            className="mt-3 rounded-xl bg-gradient-to-br from-electric-5 to-electric-10 border border-electric-20 p-4"
            role="region"
            aria-label="평균 인상률 조정"
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-faint-blue">
                평균 인상률 (복리)
              </span>
              <span className="text-lg font-black tabular-nums text-electric">
                +{growthRate}%/년
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={growthRate}
              onChange={(e) => setGrowthRate(Number(e.target.value))}
              className="w-full accent-electric"
              aria-label="평균 인상률"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[2, 3, 5, 7, 10].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setGrowthRate(r)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black border transition-all ${
                    growthRate === r
                      ? "bg-electric text-white border-electric"
                      : "bg-white dark:bg-canvas-900 border-canvas-200 dark:border-canvas-700 text-faint-blue hover:border-electric"
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
            <p className="text-[10px] text-faint-blue mt-2 leading-relaxed">
              💡 첫 행 연도({baseYearForGrowthDisplay(rows)}) 기준 매년 복리로
              인상. 예: 8,000만 + 5% → 1년 후 8,400만, 5년 후 ≈ 10,210만.
              삼성전자 평균 인상률은 3~6% 수준입니다.
            </p>
          </div>
        )}

        {/* manual 모드 — 안내 */}
        {salaryMode === "manual" && (
          <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3">
            <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
              ✏️ 각 연도 카드의 <strong>연봉 입력 필드</strong>에 그 해 본인
              연봉을 만원 단위로 입력하세요. 빈 칸은 메인 연봉(
              {(salary / 10000).toLocaleString("ko-KR")}만원)이 사용됩니다.
            </p>
          </div>
        )}
      </div>

      {/* ── 영업이익 일괄 입력 (구간별) — 토글 가능 ─────────── */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setBulkExpanded(!bulkExpanded)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all ${
            bulkExpanded
              ? "border-electric bg-electric-10"
              : "border-canvas-200 bg-white dark:bg-canvas-900 hover:border-electric/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings size={14} className={bulkExpanded ? "text-electric" : "text-faint-blue"} aria-hidden />
            <span className="text-xs font-black uppercase tracking-widest text-navy dark:text-canvas-50">
              영업이익 일괄 입력 (귀찮은 분들용)
            </span>
          </div>
          <span className="text-xs font-bold text-faint-blue">{bulkExpanded ? "▲" : "▼"}</span>
        </button>

        {bulkExpanded && (
          <div className="mt-2 rounded-xl border border-electric-20 bg-electric-5 p-4">
            <p className="text-[11px] text-faint-blue mb-3 leading-relaxed">
              📅 구간별로 한 번에 입력 — 예: "2026~2028년 = 350조". 적용하면 위 연도
              행들의 영업이익이 일괄 변경됩니다. "구간 → 연도 자동 생성" 누르면 위
              연도 행이 구간 기준으로 재생성됩니다.
            </p>
            <div className="space-y-2">
              {bulkRanges.map((b) => (
                <div key={b.id} className="grid grid-cols-[1fr_auto_1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="number"
                    min={2026}
                    max={2036}
                    value={b.startYear}
                    onChange={(e) =>
                      updateBulkRange(b.id, {
                        startYear: Math.min(2036, Math.max(2026, Number(e.target.value) || b.startYear)),
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-md text-sm font-bold tabular-nums bg-white dark:bg-canvas-900 border border-canvas-200 focus:outline-none focus:border-electric"
                    aria-label="시작 연도"
                  />
                  <span className="text-faint-blue font-bold text-xs">~</span>
                  <input
                    type="number"
                    min={2026}
                    max={2036}
                    value={b.endYear}
                    onChange={(e) =>
                      updateBulkRange(b.id, {
                        endYear: Math.min(2036, Math.max(b.startYear, Number(e.target.value) || b.endYear)),
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-md text-sm font-bold tabular-nums bg-white dark:bg-canvas-900 border border-canvas-200 focus:outline-none focus:border-electric"
                    aria-label="끝 연도"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={b.profitTrillionFmt}
                      onChange={(e) =>
                        updateBulkRange(b.id, {
                          profitTrillionFmt: e.target.value.replace(/[^0-9.]/g, ""),
                        })
                      }
                      className="w-full px-2 py-1.5 pr-7 rounded-md text-sm font-bold tabular-nums bg-white dark:bg-canvas-900 border border-electric-30 focus:outline-none focus:border-electric"
                      aria-label="영업이익 (조)"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
                      조
                    </span>
                  </div>
                  {bulkRanges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBulkRange(b.id)}
                      className="p-1.5 rounded-md text-faint-blue hover:text-rose-500"
                      aria-label="구간 삭제"
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                type="button"
                onClick={addBulkRange}
                className="px-3 py-2 rounded-lg text-[11px] font-bold border border-dashed border-canvas-300 text-faint-blue hover:border-electric hover:text-electric transition-colors"
              >
                <Plus size={12} className="inline mr-1" /> 구간 추가
              </button>
              <button
                type="button"
                onClick={applyBulkRanges}
                className="px-3 py-2 rounded-lg text-[11px] font-black bg-electric text-white hover:opacity-90 transition-opacity"
              >
                ✓ 위 연도에 일괄 적용
              </button>
              <button
                type="button"
                onClick={expandBulkToRows}
                className="px-3 py-2 rounded-lg text-[11px] font-black bg-amber-500 text-white hover:opacity-90 transition-opacity"
              >
                🔄 구간 → 연도 자동 생성
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 연도별 CL 옵션 (진급 시나리오) ─────────────────── */}
      <div className="mb-3 flex items-center justify-between px-3 py-2 rounded-lg bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700">
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-faint-blue" aria-hidden />
          <span className="text-[11px] font-bold text-navy dark:text-canvas-50">
            연도별 CL 따로 선택 (진급 시나리오)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setPerYearClEnabled(!perYearClEnabled)}
          aria-pressed={perYearClEnabled}
          className={`w-9 h-5 rounded-full transition-colors relative ${
            perYearClEnabled ? "bg-electric" : "bg-canvas-300 dark:bg-canvas-700"
          }`}
          aria-label="연도별 CL 옵션"
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              perYearClEnabled ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* 연도 행들 */}
      <div className="space-y-2 mb-3">
        {computed.enriched.map((r) => (
          <YearProfitRowCard
            key={r.id}
            row={r}
            canRemove={rows.length > 1}
            salaryMode={salaryMode}
            defaultSalaryManwon={salary / 10000}
            evalEnabled={evalEnabled}
            globalMyCl={myCl}
            perYearClEnabled={perYearClEnabled}
            onUpdate={(patch) => updateRow(r.id, patch)}
            onRemove={() => removeRow(r.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-canvas-300 dark:border-canvas-700 text-faint-blue text-xs font-black uppercase tracking-widest hover:border-electric hover:text-electric transition-colors mb-5"
      >
        <Plus size={14} aria-hidden /> 연도 추가 (~2036)
      </button>

      {/* 막대 그래프 */}
      <BonusBarChart
        enriched={computed.enriched}
        maxVal={computed.maxVal}
        color={targetDivision.color}
        salaryManwon={salary / 10000}
      />

      {/* 누적 합계 — 톤다운 정돈 (헤더 띠 + 본문 white) */}
      <div className="mt-5 rounded-2xl overflow-hidden border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900">
        {/* 헤더 띠 */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ backgroundColor: targetDivision.color }}
        >
          <p className="text-sm font-black text-white">
            {targetDivision.label} · {rows.length}개 연도 누적
          </p>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">
            OPI1 + OPI2
          </span>
        </div>

        {/* 메인 결과: 누적 세전 / 세후 */}
        <div className="grid grid-cols-2 divide-x divide-canvas-200 dark:divide-canvas-800 border-b border-canvas-200 dark:border-canvas-800">
          <div className="px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-faint-blue mb-1.5">
              누적 세전 (합산)
            </p>
            <p className="text-2xl sm:text-3xl font-black tabular-nums text-navy dark:text-canvas-50">
              {fmtManwon(animCumGross)}
            </p>
            <p className="text-[11px] text-faint-blue mt-1 tabular-nums">
              {fmtEok(computed.cumGross)}
            </p>
          </div>
          <div
            className="px-5 py-5"
            style={{ backgroundColor: `${targetDivision.color}08` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5"
              style={{ color: targetDivision.color }}
            >
              누적 세후
            </p>
            <p
              className="text-3xl sm:text-4xl font-black tabular-nums"
              style={{ color: targetDivision.color }}
            >
              {fmtManwon(animCumNet)}
            </p>
            <p className="text-[11px] text-faint-blue mt-1 tabular-nums">
              {fmtEok(computed.cumNet)} · 공제 -{fmtManwonInt(computed.cumDeduct)}만원
            </p>
          </div>
        </div>

        {/* OPI 분해: OPI1 / OPI2 / 부문 / 사업부 */}
        <div className="px-5 py-4 bg-canvas-50 dark:bg-canvas-800/50 space-y-3">
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <span className="w-1 h-7 rounded-full bg-faint-blue/40" aria-hidden />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-faint-blue">
                  OPI1 누적
                </p>
                <p className="text-[10px] text-faint-blue">
                  연봉×50% × {rows.length}년
                </p>
              </div>
            </div>
            <p className="text-base font-black tabular-nums text-navy dark:text-canvas-50">
              {fmtManwon(animCumOpi1)}
            </p>
          </div>

          <div className="rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-1 h-7 rounded-full"
                  style={{ backgroundColor: targetDivision.color }}
                  aria-hidden
                />
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: targetDivision.color }}
                >
                  OPI2 누적 · 특별경영성과금
                </p>
              </div>
              <p className="text-base font-black tabular-nums text-navy dark:text-canvas-50">
                {fmtManwon(animCumOpi2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg px-3 py-2 bg-canvas-50 dark:bg-canvas-800">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-faint-blue mb-0.5">
                  부문 누적 (40%)
                </p>
                <p className="text-sm font-black tabular-nums text-navy dark:text-canvas-50">
                  {fmtManwon(computed.cumOpi2Bu)}
                </p>
              </div>
              <div
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: `${targetDivision.color}10` }}
              >
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5"
                  style={{ color: targetDivision.color }}
                >
                  사업부 누적 (60%)
                </p>
                <p
                  className="text-sm font-black tabular-nums"
                  style={{ color: targetDivision.color }}
                >
                  {fmtManwon(computed.cumOpi2Sa)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 임계값 정보 띠 */}
        <div className="px-5 py-3 border-t border-canvas-200 dark:border-canvas-800 flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            ✓ 임계값 충족 {computed.triggeredCount}년
          </span>
          {computed.blockedCount > 0 && (
            <span className="text-rose-500 font-bold">
              ⚠ 미달 {computed.blockedCount}년 (OPI2만 0)
            </span>
          )}
          <span className="text-faint-blue">
            OPI1은 임계값 무관 매년 지급
          </span>
        </div>
      </div>

      <p className="text-[10px] text-faint-blue mt-3 leading-relaxed">
        ※ 본인 연봉 {(salary / 10000).toLocaleString("ko-KR")}만원 비례 적용 ·
        세액공제 {creditRate}% · 4대보험 {applyInsurance ? "ON" : "OFF"} (위 본인
        케이스 가정 동일). 인원·가중치는 메인 시뮬 그대로.
      </p>
    </section>
  );
}

function YearProfitRowCard({
  row,
  canRemove,
  salaryMode,
  defaultSalaryManwon,
  evalEnabled,
  globalMyCl,
  perYearClEnabled,
  onUpdate,
  onRemove,
}: {
  row: YearProfitRow & {
    profit: number;
    threshold: number;
    triggered: boolean;
    opi1Manwon: number;
    opi2Manwon: number;
    opi2BuManwon: number;
    opi2SaManwon: number;
    myGrossManwon: number;
    myNetManwon: number;
    appliedSalaryManwon: number;
    appliedCl: MyCl;
    appliedGrade: EvalGrade;
    myEvalMult: number;
  };
  canRemove: boolean;
  salaryMode: SalaryMode;
  defaultSalaryManwon: number;
  evalEnabled: boolean;
  globalMyCl: MyCl;
  perYearClEnabled: boolean;
  onUpdate: (patch: Partial<YearProfitRow>) => void;
  onRemove: () => void;
}) {
  const blocked = !row.triggered && row.profit > 0;
  // CL4 본인이고 평가 ON 이면 가/나/일반 선택 가능
  const showEvalPicker = row.appliedCl === "cl4" && evalEnabled;
  return (
    <div
      className="rounded-xl border p-4 transition-all"
      style={{
        borderColor: blocked ? "#EF444455" : row.triggered && row.profit > 0 ? "#10B98155" : "#DDE4EC",
        backgroundColor: blocked ? "#EF44440A" : "#F8FAFB",
      }}
    >
      {/* 상단 — 연도 + 영업이익 + 연봉 + 삭제 */}
      <div className={`grid gap-3 items-end ${
        salaryMode === "manual"
          ? "grid-cols-[70px_1fr_1fr_auto] sm:grid-cols-[85px_1fr_1fr_auto]"
          : "grid-cols-[80px_1fr_auto] sm:grid-cols-[100px_1fr_auto]"
      }`}>
        {/* 연도 */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-widest block mb-1 text-faint-blue">
            연도
          </label>
          <input
            type="number"
            min={2026}
            max={2036}
            value={row.year}
            onChange={(e) =>
              onUpdate({ year: Math.min(2036, Math.max(2026, Number(e.target.value) || row.year)) })
            }
            className="w-full px-2 py-1.5 rounded-md text-base font-black tabular-nums bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 focus:outline-none focus:border-electric text-navy dark:text-canvas-50"
            aria-label="연도"
          />
        </div>

        {/* 영업이익 */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-widest block mb-1 text-faint-blue">
            영업이익 <span className="opacity-70 font-medium">(조)</span>
            <span
              className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-black"
              style={{
                backgroundColor: row.threshold === 0 ? "#A8B9D622" : blocked ? "#EF444422" : "#10B98122",
                color: row.threshold === 0 ? "#7B8FA1" : blocked ? "#EF4444" : "#10B981",
              }}
            >
              {row.threshold === 0
                ? "범위 외"
                : `임계 ${row.threshold}조`}
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={row.profitTrillionFmt}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                onUpdate({ profitTrillionFmt: v });
              }}
              className="w-full rounded-md px-2 py-1.5 pr-9 text-base font-black tabular-nums focus:outline-none transition-all bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50"
              style={{
                border: blocked ? "1.5px solid #EF444466" : "1.5px solid #0145F233",
              }}
              aria-label={`${row.year}년 영업이익 (조원)`}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
              조
            </span>
          </div>
        </div>

        {/* manual 모드 — 연봉 입력 필드 (만원) */}
        {salaryMode === "manual" && (
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest block mb-1 text-faint-blue inline-flex items-center gap-1">
              <Pencil size={9} aria-hidden /> 연봉 <span className="opacity-70 font-medium">(만원)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={row.yearlySalaryManwonFmt ?? ""}
                placeholder={`${defaultSalaryManwon.toLocaleString("ko-KR")}`}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9,]/g, "");
                  onUpdate({ yearlySalaryManwonFmt: v });
                }}
                className="w-full rounded-md px-2 py-1.5 pr-9 text-base font-black tabular-nums focus:outline-none focus:border-electric border border-amber-300 dark:border-amber-700 bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50"
                aria-label={`${row.year}년 본인 연봉 (만원)`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
                만
              </span>
            </div>
          </div>
        )}

        {/* 삭제 */}
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-md text-faint-blue hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors self-end mb-1"
            aria-label={`${row.year}년 행 삭제`}
          >
            <Trash2 size={14} aria-hidden />
          </button>
        )}
      </div>

      {/* 자동 인상 / 고정 모드 — 적용된 연봉 작게 표시 */}
      {salaryMode !== "manual" && (
        <p className="mt-2 text-[10px] text-faint-blue inline-flex items-center gap-1">
          {salaryMode === "growth" ? (
            <>
              <TrendingUp size={10} className="text-electric" aria-hidden />
              <span>
                적용 연봉:{" "}
                <strong className="text-electric tabular-nums">
                  {Math.round(row.appliedSalaryManwon).toLocaleString("ko-KR")}만원
                </strong>{" "}
                ({row.year}년 자동 적용)
              </span>
            </>
          ) : (
            <>
              <Lock size={10} className="text-faint-blue" aria-hidden />
              <span>
                고정 연봉:{" "}
                <strong className="tabular-nums">
                  {Math.round(row.appliedSalaryManwon).toLocaleString("ko-KR")}만원
                </strong>
              </span>
            </>
          )}
        </p>
      )}

      {/* ── 연도별 CL 선택 (옵션) ──────────────────────────── */}
      {perYearClEnabled && (
        <div className="mt-2.5 flex items-center gap-2 flex-wrap p-2 rounded-md bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700">
          <span className="text-[10px] font-bold text-faint-blue uppercase tracking-widest mr-1">
            {row.year}년 CL:
          </span>
          {CL_OPTIONS.map((c) => {
            const active = row.appliedCl === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onUpdate({ myClPerYear: c.id })}
                className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all ${
                  active
                    ? "border-electric bg-electric text-white"
                    : "border-canvas-200 bg-white dark:bg-canvas-900 text-faint-blue hover:border-electric/40"
                }`}
              >
                {c.label}
              </button>
            );
          })}
          {row.myClPerYear && row.myClPerYear !== globalMyCl && (
            <button
              type="button"
              onClick={() => onUpdate({ myClPerYear: undefined })}
              className="px-2 py-0.5 rounded text-[10px] font-bold border border-canvas-200 text-faint-blue hover:text-rose-500"
              aria-label="기본값으로 되돌리기"
            >
              ↺ 기본
            </button>
          )}
        </div>
      )}

      {/* ── CL4 본인 + 평가 ON 일 때 가/나/일반 선택 ─────────── */}
      {showEvalPicker && (
        <div className="mt-2 flex items-center gap-2 flex-wrap p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mr-1">
            {row.year}년 본인 평가:
          </span>
          {EVAL_OPTIONS.map((ev) => {
            const active = row.appliedGrade === ev.id;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => onUpdate({ myEvalGrade: ev.id })}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black border transition-all ${
                  active ? "text-white scale-[1.02] shadow-sm" : "bg-white dark:bg-canvas-900 hover:scale-[1.01]"
                }`}
                style={{
                  backgroundColor: active ? ev.color : undefined,
                  borderColor: active ? ev.color : `${ev.color}40`,
                  color: active ? "#fff" : ev.color,
                }}
              >
                {ev.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── 본인 적용 배수 표시 (CL4 가/나 일 때 강조) ─────── */}
      {row.myEvalMult !== 1.0 && (
        <p className="mt-1.5 text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
          <strong>📈 본인 사업부 풀 배수 ×{row.myEvalMult}</strong>
          <span className="text-faint-blue">
            (OPI2 사업부분: {fmtManwon(row.opi2SaManwon)})
          </span>
        </p>
      )}

      {/* OPI1 / OPI2 분리 — OPI2는 부문·사업부 세부 */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_1.4fr] gap-2 text-[11px]">
        <div className="rounded-lg px-3 py-2 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700">
          <p className="text-[9px] font-bold uppercase tracking-widest text-faint-blue mb-0.5">
            OPI1 · 연봉×50%
          </p>
          <p className="font-black tabular-nums text-sm text-navy dark:text-canvas-50">
            {fmtManwon(row.opi1Manwon)}
          </p>
        </div>
        <div
          className="rounded-lg px-3 py-2 border"
          style={{
            backgroundColor: blocked ? "#EF44440A" : "#0145F208",
            borderColor: blocked ? "#EF444433" : "#0145F233",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-faint-blue">
              OPI2 · 특별경영성과금
            </p>
            <p
              className="font-black tabular-nums text-sm"
              style={{ color: blocked ? "#EF4444" : "#0A1829" }}
            >
              {blocked ? "0원 (미달)" : fmtManwon(row.opi2Manwon)}
            </p>
          </div>
          {!blocked && (
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex justify-between px-1">
                <span className="text-faint-blue">부문 40%</span>
                <span className="tabular-nums font-bold text-muted-blue">
                  {fmtManwonInt(row.opi2BuManwon)}
                </span>
              </div>
              <div className="flex justify-between px-1">
                <span className="text-faint-blue">사업부 60%</span>
                <span className="tabular-nums font-bold text-electric">
                  {fmtManwonInt(row.opi2SaManwon)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 합산 세전/세후 */}
      <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg px-3 py-2 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700">
          <p className="text-[9px] font-bold uppercase tracking-widest text-faint-blue mb-0.5">
            합산 세전 (OPI1+OPI2)
          </p>
          <p
            className="font-black tabular-nums text-sm"
            style={{ color: blocked ? "#EF4444" : "#0A1829" }}
          >
            {fmtManwon(row.myGrossManwon)}
          </p>
        </div>
        <div className="rounded-lg px-3 py-2 bg-electric-5 border border-electric-20">
          <p className="text-[9px] font-bold uppercase tracking-widest text-faint-blue mb-0.5">
            합산 세후
          </p>
          <p
            className="font-black tabular-nums text-sm"
            style={{ color: blocked ? "#EF4444" : "#0145F2" }}
          >
            {fmtManwon(row.myNetManwon)}
          </p>
        </div>
      </div>
    </div>
  );
}

function BonusBarChart({
  enriched,
  maxVal,
  color,
  salaryManwon,
}: {
  enriched: Array<{
    year: number;
    profit: number;
    triggered: boolean;
    myGrossManwon: number;
    myNetManwon: number;
  }>;
  maxVal: number;
  color: string;
  salaryManwon: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [view, setView] = useState<"bar" | "pie" | "compare">("bar");
  const [ageGroup, setAgeGroup] = useState<string>("30s_late");

  const n = enriched.length;
  if (n === 0) return null;

  // 누적/평균 — 파이·비교 뷰용 (enriched에서 직접 도출, 추가 가정 없음)
  const cumGross = enriched.reduce((s, d) => s + d.myGrossManwon, 0);
  const cumNet = enriched.reduce((s, d) => s + d.myNetManwon, 0);
  const cumTax = Math.max(0, cumGross - cumNet);
  const avgGrossManwon = n > 0 ? cumGross / n : 0;
  // 비교 기준 = 연봉 + 평균 연성과급(세전). 성과급은 보수의 일부이므로 합산해 비교.
  const myComp = salaryManwon + avgGrossManwon;

  const width = Math.max(320, n * 50);
  const height = 280;
  const padL = 44;
  const padR = 16;
  const padT = 24;
  const padB = 38;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const groupWidth = innerW / Math.max(n, 1);
  const barWidth = Math.max(10, groupWidth * 0.55);

  function groupCenter(i: number) {
    return padL + groupWidth * i + groupWidth / 2;
  }
  function yPos(v: number) {
    return padT + innerH - (v / maxVal) * innerH;
  }
  function barH(v: number) {
    return Math.max(0, (v / maxVal) * innerH);
  }

  return (
    <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue">
          연도별 본인 케이스
        </p>
        <ChartViewToggle view={view} setView={setView} color={color} />
      </div>

      {view === "bar" && (
      <div className="overflow-x-auto">
      <p className="text-[10px] text-faint-blue mb-2">세전 막대 · 세후 진하게</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="다년도 누적 성과급 막대 그래프"
        style={{ minWidth: 320 }}
      >
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

        {/* 막대들 — 세전(연한 색) 위에 세후(진한 색) 오버레이 */}
        {enriched.map((d, i) => {
          const blocked = !d.triggered && d.profit > 0;
          const center = groupCenter(i);
          const grossY = yPos(d.myGrossManwon);
          const grossH = barH(d.myGrossManwon);
          const netY = yPos(d.myNetManwon);
          const netH = barH(d.myNetManwon);
          const isHover = hoverIdx === i;
          return (
            <g key={i}>
              {/* 세전 막대 (배경) */}
              <rect
                x={center - barWidth / 2}
                y={grossY}
                width={barWidth}
                height={grossH}
                fill={blocked ? "#EF4444" : color}
                opacity={blocked ? 0.18 : 0.32}
                rx="3"
              />
              {/* 세후 막대 (전경, 진한) */}
              {!blocked && (
                <rect
                  x={center - barWidth / 2}
                  y={netY}
                  width={barWidth}
                  height={netH}
                  fill={color}
                  rx="3"
                  style={{
                    filter: isHover
                      ? `drop-shadow(0 2px 6px ${color}55)`
                      : "none",
                  }}
                />
              )}
              {/* 미달 마크 */}
              {blocked && (
                <text
                  x={center}
                  y={padT + innerH - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="900"
                  fill="#EF4444"
                >
                  ✕
                </text>
              )}
              {/* 호버 hit-area */}
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
                x={center}
                y={height - padB + 18}
                textAnchor="middle"
                fontSize="10"
                fill={isHover ? color : "#7B8FA1"}
                fontWeight="700"
              >
                {d.year}
              </text>
            </g>
          );
        })}

        {/* 호버 툴팁 */}
        {hoverIdx !== null && enriched[hoverIdx] && (
          <g pointerEvents="none">
            <rect
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 140
              )}
              y={padT - 6}
              width="140"
              height="58"
              rx="6"
              fill="#0A1829"
            />
            <text
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 140
              ) + 8}
              y={padT + 9}
              fontSize="10"
              fill="#fff"
              fontWeight="700"
            >
              {enriched[hoverIdx].year}년 · 영업이익{" "}
              {enriched[hoverIdx].profit}조
            </text>
            <text
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 140
              ) + 8}
              y={padT + 24}
              fontSize="9"
              fill="#A8B9D6"
            >
              세전: {fmtManwon(enriched[hoverIdx].myGrossManwon)}
            </text>
            <text
              x={Math.min(
                Math.max(groupCenter(hoverIdx) - 65, padL),
                width - padR - 140
              ) + 8}
              y={padT + 36}
              fontSize="9"
              fill="#fff"
              fontWeight="700"
            >
              세후: {fmtManwon(enriched[hoverIdx].myNetManwon)}
            </text>
            {!enriched[hoverIdx].triggered && enriched[hoverIdx].profit > 0 && (
              <text
                x={Math.min(
                  Math.max(groupCenter(hoverIdx) - 65, padL),
                  width - padR - 140
                ) + 8}
                y={padT + 48}
                fontSize="9"
                fill="#FCA5A5"
              >
                ⚠ 임계값 미달 — 0원
              </text>
            )}
          </g>
        )}
      </svg>

      <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-muted-blue">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color, opacity: 0.32 }}
            aria-hidden
          />
          세전
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-blue">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          세후
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-blue">
          <span className="text-rose-500 font-black">✕</span>
          임계값 미달 (0원)
        </span>
      </div>
      </div>
      )}

      {view === "pie" && (
        <BonusPieView
          cumNet={cumNet}
          cumTax={cumTax}
          cumGross={cumGross}
          color={color}
        />
      )}

      {view === "compare" && (
        <AgeCompareView
          ageGroup={ageGroup}
          setAgeGroup={setAgeGroup}
          myComp={myComp}
          salaryManwon={salaryManwon}
          avgGrossManwon={avgGrossManwon}
          color={color}
        />
      )}
    </div>
  );
}

// ── 차트 뷰 전환 토글 (막대 / 파이 / 나이대 비교) ───────────────
function ChartViewToggle({
  view,
  setView,
  color,
}: {
  view: "bar" | "pie" | "compare";
  setView: (v: "bar" | "pie" | "compare") => void;
  color: string;
}) {
  const opts: Array<{ key: "bar" | "pie" | "compare"; label: string }> = [
    { key: "bar", label: "막대" },
    { key: "pie", label: "파이" },
    { key: "compare", label: "나이대 비교" },
  ];
  return (
    <div
      role="tablist"
      aria-label="차트 보기 방식"
      className="inline-flex rounded-lg border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-0.5"
    >
      {opts.map((o) => {
        const active = view === o.key;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setView(o.key)}
            className="px-2.5 py-1 rounded-md text-[11px] font-black transition-colors"
            style={{
              backgroundColor: active ? color : "transparent",
              color: active ? "#fff" : "#7B8FA1",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── 파이(도넛) 뷰 — 누적 세후 실수령 vs 세금·공제 ───────────────
// 모든 값은 enriched 합산에서 직접 계산 (추가 가정/외부 데이터 없음).
function BonusPieView({
  cumNet,
  cumTax,
  cumGross,
  color,
}: {
  cumNet: number;
  cumTax: number;
  cumGross: number;
  color: string;
}) {
  if (cumGross <= 0) {
    return (
      <p className="text-xs text-faint-blue py-8 text-center">
        세전 합계가 0원이라 표시할 구성이 없습니다. 영업이익·연봉을 입력해
        주세요.
      </p>
    );
  }
  const netPct = (cumNet / cumGross) * 100;
  const taxPct = 100 - netPct;
  // 도넛 — stroke-dasharray로 두 세그먼트 표현
  const R = 54;
  const C = 2 * Math.PI * R;
  const netLen = (netPct / 100) * C;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 py-2">
      <svg
        viewBox="0 0 140 140"
        className="w-36 h-36 flex-shrink-0"
        role="img"
        aria-label={`누적 성과급 구성: 세후 실수령 ${netPct.toFixed(
          0
        )}%, 세금·공제 ${taxPct.toFixed(0)}%`}
      >
        <g transform="rotate(-90 70 70)">
          {/* 세금·공제 (배경 전체) */}
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={color}
            strokeOpacity={0.22}
            strokeWidth="20"
          />
          {/* 세후 실수령 (진한 호) */}
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeDasharray={`${netLen} ${C - netLen}`}
            strokeLinecap="butt"
          />
        </g>
        <text
          x="70"
          y="65"
          textAnchor="middle"
          fontSize="11"
          fill="#7B8FA1"
          fontWeight="700"
        >
          세후 비중
        </text>
        <text
          x="70"
          y="84"
          textAnchor="middle"
          fontSize="20"
          fill={color}
          fontWeight="900"
        >
          {netPct.toFixed(0)}%
        </text>
      </svg>
      <div className="flex-1 w-full space-y-2">
        <PieLegendRow
          dot={color}
          label="세후 실수령 (누적)"
          value={fmtManwon(cumNet)}
          pct={netPct}
        />
        <PieLegendRow
          dot={color}
          dotOpacity={0.22}
          label="세금·4대보험 공제 (누적)"
          value={fmtManwon(cumTax)}
          pct={taxPct}
        />
        <div className="border-t border-canvas-200 dark:border-canvas-700 pt-2 flex items-center justify-between text-xs">
          <span className="font-bold text-faint-blue">세전 합계</span>
          <span className="font-black tabular-nums text-navy dark:text-canvas-50">
            {fmtManwon(cumGross)}
          </span>
        </div>
        <p className="text-[10px] text-faint-blue leading-relaxed">
          여러 해 누적 성과급 중 실제로 손에 쥐는 비율입니다. 세액공제율·4대보험
          토글 설정에 따라 달라집니다.
        </p>
      </div>
    </div>
  );
}

function PieLegendRow({
  dot,
  dotOpacity = 1,
  label,
  value,
  pct,
}: {
  dot: string;
  dotOpacity?: number;
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 text-muted-blue min-w-0">
        <span
          className="w-3 h-3 rounded-sm flex-shrink-0"
          style={{ backgroundColor: dot, opacity: dotOpacity }}
          aria-hidden
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="tabular-nums font-bold text-navy dark:text-canvas-50 flex-shrink-0">
        {value}{" "}
        <span className="text-faint-blue font-normal">
          ({pct.toFixed(0)}%)
        </span>
      </span>
    </div>
  );
}

// ── 나이대 비교 뷰 — 연봉+평균성과급 vs 연령대 연봉 백분위 ───────
// 데이터: src/data/salaryRankData.ts (통계청·고용노동부 기반 추정치, 참고용).
// 지어낸 수치 없음. 순자산 비교는 검증된 데이터가 없어 제외.
function AgeCompareView({
  ageGroup,
  setAgeGroup,
  myComp,
  salaryManwon,
  avgGrossManwon,
  color,
}: {
  ageGroup: string;
  setAgeGroup: (v: string) => void;
  myComp: number;
  salaryManwon: number;
  avgGrossManwon: number;
  color: string;
}) {
  // [상위 1%, 5%, 10%, 25%, 50%(중위), 75%] — 만원
  const pct = SALARY_PERCENTILES[ageGroup] ?? SALARY_PERCENTILES["30s_late"];
  const labels = ["상위 1%", "상위 5%", "상위 10%", "상위 25%", "중위(50%)", "상위 75%"];
  // 내 위치(상위 %) 계산 — 임계값 사이를 선형 보간
  const tiers = [1, 5, 10, 25, 50, 75];
  let myTopPct = 99;
  if (myComp >= pct[0]) myTopPct = 1;
  else if (myComp <= pct[pct.length - 1]) myTopPct = 90;
  else {
    for (let i = 0; i < pct.length - 1; i++) {
      if (myComp <= pct[i] && myComp >= pct[i + 1]) {
        const ratio = (myComp - pct[i + 1]) / (pct[i] - pct[i + 1] || 1);
        myTopPct = Math.round(tiers[i + 1] + ratio * (tiers[i] - tiers[i + 1]));
        break;
      }
    }
  }
  const axisMax = Math.max(pct[0], myComp) * 1.05;
  return (
    <div className="py-1">
      {/* 연령대 선택 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <label className="text-[11px] font-bold text-faint-blue">연령대</label>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="text-xs font-bold rounded-lg border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 px-2 py-1 text-navy dark:text-canvas-50"
          aria-label="비교할 연령대 선택"
        >
          {AGE_GROUPS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* 내 위치 배지 */}
      <div
        className="rounded-xl px-4 py-3 mb-3 flex items-center justify-between"
        style={{ backgroundColor: `${color}10` }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint-blue">
            내 연봉+평균성과급 (세전)
          </p>
          <p className="text-xl font-black tabular-nums" style={{ color }}>
            {fmtManwon(myComp)}
          </p>
          <p className="text-[10px] text-faint-blue tabular-nums mt-0.5">
            연봉 {fmtManwonInt(salaryManwon)}만 + 평균 성과급{" "}
            {fmtManwonInt(avgGrossManwon)}만
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint-blue">
            추정 위치
          </p>
          <p className="text-xl font-black" style={{ color }}>
            상위 {myTopPct}%
          </p>
        </div>
      </div>

      {/* 백분위 가로 막대 */}
      <div className="space-y-1.5">
        {pct.map((v, i) => {
          const w = Math.min(100, (v / axisMax) * 100);
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-faint-blue w-16 flex-shrink-0 text-right">
                {labels[i]}
              </span>
              <div className="flex-1 h-4 rounded bg-canvas-100 dark:bg-canvas-800 relative overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{ width: `${w}%`, backgroundColor: color, opacity: 0.3 }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-muted-blue w-14 flex-shrink-0">
                {fmtManwonInt(v)}만
              </span>
            </div>
          );
        })}
        {/* 내 위치 막대 (강조) */}
        <div className="flex items-center gap-2 pt-1">
          <span
            className="text-[10px] font-black w-16 flex-shrink-0 text-right"
            style={{ color }}
          >
            나
          </span>
          <div className="flex-1 h-4 rounded bg-canvas-100 dark:bg-canvas-800 relative overflow-hidden">
            <div
              className="h-full rounded"
              style={{
                width: `${Math.min(100, (myComp / axisMax) * 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span
            className="text-[10px] tabular-nums font-black w-14 flex-shrink-0"
            style={{ color }}
          >
            {fmtManwonInt(myComp)}만
          </span>
        </div>
      </div>

      <p className="text-[10px] text-faint-blue leading-relaxed mt-3">
        ※ 비교 기준은 연봉 + 평균 연성과급(세전) 합산입니다. 연령대 백분위는
        통계청·고용노동부 자료 기반 <strong>추정치(참고용)</strong>이며, 실제
        분포와 차이가 있을 수 있습니다.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SalaryModeCard — 다년도 시뮬레이션 연봉 모드 선택 카드.
// 3개 모드(고정/자동인상/직접입력) 카드형 UI.
// ────────────────────────────────────────────────────────────
function SalaryModeCard({
  mode,
  active,
  onClick,
  title,
  desc,
  iconName,
}: {
  mode: SalaryMode;
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  iconName: "lock" | "trending" | "edit";
}) {
  const Icon = iconName === "lock" ? Lock : iconName === "trending" ? TrendingUp : Pencil;
  // 모드별 색상 — 고정(slate) / 인상(electric) / 입력(amber)
  const accent =
    mode === "fixed"
      ? { color: "#64748B", bg: "#64748B" }
      : mode === "growth"
      ? { color: "#0145F2", bg: "#0145F2" }
      : { color: "#D97706", bg: "#D97706" };
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative rounded-xl px-3 py-3 text-left transition-all border-2 group ${
        active
          ? "shadow-md scale-[1.02]"
          : "bg-white dark:bg-canvas-900 hover:scale-[1.01] hover:shadow-sm"
      }`}
      style={{
        backgroundColor: active ? `${accent.bg}12` : undefined,
        borderColor: active ? accent.color : "#DDE4EC",
      }}
    >
      {/* 활성 시 우상단 체크 */}
      {active && (
        <span
          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: accent.color }}
          aria-hidden
        >
          <Check size={10} className="text-white" />
        </span>
      )}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors"
        style={{
          backgroundColor: active ? accent.color : `${accent.color}15`,
          color: active ? "#fff" : accent.color,
        }}
      >
        <Icon size={16} aria-hidden />
      </div>
      <p
        className="text-[12px] font-black mb-0.5"
        style={{ color: active ? accent.color : "#0A1829" }}
      >
        {title}
      </p>
      <p className="text-[10px] text-faint-blue leading-tight">{desc}</p>
    </button>
  );
}

// 첫 행 연도(인상률 모드 base year) — display 헬퍼
function baseYearForGrowthDisplay(rows: YearProfitRow[]): number {
  return rows[0]?.year ?? 2026;
}
