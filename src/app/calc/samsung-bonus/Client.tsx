"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown,
  Sparkles,
  Calendar,
  PiggyBank,
  Users,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// 세금/공제 로직
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

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

function fmtManwon(n: number) {
  return Math.round(n / 10000).toLocaleString("ko-KR");
}

function formatInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

// ────────────────────────────────────────────────────────────
// 정적 데이터
// ────────────────────────────────────────────────────────────

// DS 부문 사업부별 인원 (2025 사업보고서 기반 추정치)
const DS_HEADCOUNT = {
  memory: 26_226,
  foundryLsi: 20_356,
  common: 28_178,
  total: 74_760,
};

type Division = {
  id: string;
  name: string;
  opi: number;
  taiH1: number;
  taiH2: number;
  note: string;
  headcount?: number; // DS 부문에 한해 인원수 표기
  unit?: string; // 단위 그룹
};

const DIVISIONS: Division[] = [
  {
    id: "ds-memory-up",
    name: "DS 메모리 (호황)",
    opi: 50,
    taiH1: 100,
    taiH2: 100,
    note: "HBM·D램 슈퍼사이클. 2024~2025 사례 상단.",
    headcount: DS_HEADCOUNT.memory,
    unit: "DS",
  },
  {
    id: "ds-memory-mid",
    name: "DS 메모리 (보통)",
    opi: 30,
    taiH1: 75,
    taiH2: 75,
    note: "안정 구간 평균치.",
    headcount: DS_HEADCOUNT.memory,
    unit: "DS",
  },
  {
    id: "ds-foundry",
    name: "DS 파운드리·시스템LSI",
    opi: 12,
    taiH1: 50,
    taiH2: 50,
    note: "TSMC 격차·적자 누적. 임금협상 인상으로 보전.",
    headcount: DS_HEADCOUNT.foundryLsi,
    unit: "DS",
  },
  {
    id: "ds-common",
    name: "DS 공통 (스태프·연구소)",
    opi: 25,
    taiH1: 75,
    taiH2: 75,
    note: "DS 전체 평균에 준해 지급되는 경우가 많음.",
    headcount: DS_HEADCOUNT.common,
    unit: "DS",
  },
  {
    id: "mx",
    name: "MX (모바일·네트워크)",
    opi: 35,
    taiH1: 75,
    taiH2: 100,
    note: "갤럭시 플래그십 견조.",
    unit: "DX",
  },
  {
    id: "vd-da",
    name: "VD·DA (영상·생활가전)",
    opi: 22,
    taiH1: 50,
    taiH2: 75,
    note: "프리미엄 TV·가전 비중에 따라 변동.",
    unit: "DX",
  },
  {
    id: "harman",
    name: "Harman (전장·오디오)",
    opi: 18,
    taiH1: 75,
    taiH2: 75,
    note: "전장 수주 증가 추세.",
    unit: "기타",
  },
  {
    id: "custom",
    name: "직접 입력",
    opi: 0,
    taiH1: 0,
    taiH2: 0,
    note: "본인 사업부 수치로 직접 조정.",
    unit: "직접",
  },
];

type Grade = { id: string; name: string; weight: number; share: string };
const GRADES: Grade[] = [
  { id: "ex", name: "EX", weight: 1.2, share: "최우수 상위 ~10%" },
  { id: "vg", name: "VG", weight: 1.1, share: "우수 상위 ~25%" },
  { id: "gd", name: "GD", weight: 1.0, share: "보통 중위 ~55%" },
  { id: "ni", name: "NI", weight: 0.5, share: "개선필요 하위 ~10%" },
];

// ────────────────────────────────────────────────────────────
// 카운트업 훅
// ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 500): number {
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
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────

export default function SamsungBonusClient() {
  const [salaryFmt, setSalaryFmt] = useState("80,000,000");
  const [baseRatio, setBaseRatio] = useState(67); // 기본급 비율 (60~75%)
  const [divisionId, setDivisionId] = useState<string>("ds-memory-up");
  const [opi, setOpi] = useState<number>(50);
  const [taiH1, setTaiH1] = useState<number>(100);
  const [taiH2, setTaiH2] = useState<number>(100);
  const [gradeId, setGradeId] = useState<string>("gd");

  // 고급 옵션
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [retroFmt, setRetroFmt] = useState("0"); // 임금협상 소급분
  const [signingFmt, setSigningFmt] = useState("0"); // 사이닝/리텐션
  const [irpFmt, setIrpFmt] = useState("0"); // IRP/연금저축 납입

  const salary = parseInput(salaryFmt);
  const retroBonus = parseInput(retroFmt);
  const signing = parseInput(signingFmt);
  const irpDeposit = Math.min(parseInput(irpFmt), 9_000_000); // 연 900만원 한도

  const division =
    DIVISIONS.find((d) => d.id === divisionId) ?? DIVISIONS[0];
  const grade = GRADES.find((g) => g.id === gradeId) ?? GRADES[2];

  function applyDivision(id: string) {
    setDivisionId(id);
    const d = DIVISIONS.find((x) => x.id === id);
    if (d && id !== "custom") {
      setOpi(d.opi);
      setTaiH1(d.taiH1);
      setTaiH2(d.taiH2);
    }
  }

  const result = useMemo(() => {
    const ratio = baseRatio / 100;
    const baseAnnual = salary * ratio;
    const baseMonthly = baseAnnual / 12;

    const opiGross = baseAnnual * (opi / 100) * grade.weight;
    const taiH1Gross = baseMonthly * (taiH1 / 100) * grade.weight;
    const taiH2Gross = baseMonthly * (taiH2 / 100) * grade.weight;
    const taiAnnualGross = taiH1Gross + taiH2Gross;

    const otherBonus = retroBonus + signing;
    const totalBonusGross =
      opiGross + taiAnnualGross + otherBonus;

    const basicDeduct = 1_500_000;
    const baseTaxable = Math.max(
      0,
      salary - calcEmpDeduction(salary) - basicDeduct
    );
    const totalIncome = salary + totalBonusGross;
    const totalTaxable = Math.max(
      0,
      totalIncome - calcEmpDeduction(totalIncome) - basicDeduct
    );

    const incomeTaxOnBonus =
      (calcTax(totalTaxable) - calcTax(baseTaxable)) * 0.7;
    const localTax = incomeTaxOnBonus * 0.1;

    // 4대보험
    const pensionCap = 74_040_000;
    const pensionBase = Math.max(0, pensionCap - salary);
    const nationalPension =
      Math.min(totalBonusGross, pensionBase) * 0.045;
    const healthIns = totalBonusGross * 0.03545;
    const longTermCare = healthIns * 0.1295;
    const employment = totalBonusGross * 0.009;
    const insurance =
      nationalPension + healthIns + longTermCare + employment;

    const totalDeduct = incomeTaxOnBonus + localTax + insurance;
    const totalNet = totalBonusGross - totalDeduct;

    const effectiveRate =
      totalBonusGross > 0 ? totalDeduct / totalBonusGross : 0;
    const opiNet = opiGross * (1 - effectiveRate);
    const taiH1Net = taiH1Gross * (1 - effectiveRate);
    const taiH2Net = taiH2Gross * (1 - effectiveRate);

    // IRP 절세
    const baseTax = calcTax(baseTaxable);
    const baseRate =
      baseTax > 0 && baseTaxable > 0
        ? baseTax / baseTaxable
        : 0;
    // 5,500만 이하 16.5%, 초과 13.2% (지방세 포함)
    const irpRate = salary <= 55_000_000 ? 0.165 : 0.132;
    void baseRate;
    const irpRefund = irpDeposit * irpRate;
    const netAfterIrp = totalNet + irpRefund;

    return {
      baseAnnual,
      baseMonthly,
      opiGross,
      opiNet,
      taiH1Gross,
      taiH1Net,
      taiH2Gross,
      taiH2Net,
      taiAnnualGross,
      taiAnnualNet: taiH1Net + taiH2Net,
      retroBonus,
      signing,
      totalBonusGross,
      totalNet,
      totalDeduct,
      incomeTaxOnBonus,
      localTax,
      insurance,
      nationalPension,
      healthIns,
      longTermCare,
      employment,
      effectiveRate: effectiveRate * 100,
      bonusToSalaryRatio:
        salary > 0 ? (totalBonusGross / salary) * 100 : 0,
      irpRefund,
      netAfterIrp,
      monthlyAfter: (salary + totalBonusGross) / 12,
    };
  }, [
    salary,
    baseRatio,
    opi,
    taiH1,
    taiH2,
    grade,
    retroBonus,
    signing,
    irpDeposit,
  ]);

  const animatedNet = useCountUp(result.totalNet);
  const animatedGross = useCountUp(result.totalBonusGross);
  const animatedRefund = useCountUp(result.irpRefund);

  return (
    <div className="space-y-5 mb-10">
      {/* ───── 입력 카드 ───── */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-6 transition-shadow hover:shadow-md">
        {/* 연봉 */}
        <div>
          <label
            htmlFor="salary-input"
            className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
          >
            연봉 (세전 · 기본급 + 고정 OT + 정기상여)
          </label>
          <div className="relative">
            <input
              id="salary-input"
              type="text"
              inputMode="numeric"
              value={salaryFmt}
              onChange={(e) =>
                setSalaryFmt(formatInput(e.target.value))
              }
              className="w-full rounded-xl px-4 py-4 text-2xl font-black focus:outline-none transition-all pr-12 text-electric"
              style={{
                backgroundColor: "#0145F208",
                border: "2px solid #0145F2",
              }}
              placeholder="예: 80,000,000"
              aria-label="세전 연봉 입력"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              원
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[60_000_000, 80_000_000, 100_000_000, 140_000_000].map(
              (v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setSalaryFmt(v.toLocaleString("ko-KR"))
                  }
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white transition-colors"
                >
                  {fmtManwon(v)}만
                </button>
              )
            )}
          </div>
        </div>

        {/* 기본급 비율 슬라이더 */}
        <SliderField
          id="base-ratio"
          label="기본급 비율 (연봉 대비)"
          value={baseRatio}
          onChange={setBaseRatio}
          min={60}
          max={75}
          step={1}
          unit="%"
          hint={`연 기본급 ${fmt(result.baseAnnual)}원 · 월 기본급 ${fmt(result.baseMonthly)}원 — 명세서 본봉으로 정확 조정 가능`}
          accentColor="navy"
        />

        {/* 사업부 프리셋 */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-3 text-faint-blue">
            소속 사업부 (선택 시 OPI·TAI 자동 입력)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DIVISIONS.map((d) => {
              const active = divisionId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => applyDivision(d.id)}
                  className={`text-left rounded-xl px-4 py-3 border text-xs font-bold transition-all duration-200 ${
                    active
                      ? "bg-electric text-white border-electric scale-[1.02] shadow-lg shadow-electric/20"
                      : "bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50 border-canvas-200 dark:border-canvas-700 hover:border-electric hover:scale-[1.01]"
                  }`}
                  aria-pressed={active}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black">
                      {d.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        active
                          ? "bg-white/20"
                          : "bg-canvas-50 dark:bg-canvas-800 text-faint-blue"
                      }`}
                    >
                      {d.unit}
                    </span>
                  </div>
                  {d.headcount && (
                    <div
                      className={`text-[11px] font-bold mt-1 inline-flex items-center gap-1 ${
                        active ? "opacity-90" : "text-electric"
                      }`}
                    >
                      <Users size={10} />
                      {d.headcount.toLocaleString("ko-KR")}명
                    </div>
                  )}
                  <p
                    className={`text-[11px] mt-1 leading-relaxed font-medium ${
                      active
                        ? "opacity-85"
                        : "text-muted-blue dark:text-canvas-400"
                    }`}
                  >
                    {d.note}
                  </p>
                </button>
              );
            })}
          </div>
          {division.unit === "DS" && division.headcount && (
            <DsHeadcountBar
              divisionId={divisionId}
              animated
            />
          )}
        </div>

        {/* 슬라이더들 */}
        <SliderField
          id="opi"
          label="OPI 지급률 (기본급의 %)"
          value={opi}
          onChange={(v) => {
            setOpi(v);
            setDivisionId("custom");
          }}
          min={0}
          max={50}
          step={5}
          unit="%"
          hint="삼성전자 OPI 상한 = 기본급의 50% (사업부 영업이익 목표 초과분)"
        />

        <SliderField
          id="taiH1"
          label="TAI 상반기 (월 기본급의 %)"
          value={taiH1}
          onChange={(v) => {
            setTaiH1(v);
            setDivisionId("custom");
          }}
          min={0}
          max={100}
          step={25}
          unit="%"
          hint="상반기 KPI 평가 결과 (0/25/50/75/100%)"
        />

        <SliderField
          id="taiH2"
          label="TAI 하반기 (월 기본급의 %)"
          value={taiH2}
          onChange={(v) => {
            setTaiH2(v);
            setDivisionId("custom");
          }}
          min={0}
          max={100}
          step={25}
          unit="%"
          hint="하반기 KPI 평가 결과 (0/25/50/75/100%)"
        />

        {/* 평가등급 */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
            인사평가 등급 (성과급 가중치)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GRADES.map((g) => {
              const active = gradeId === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGradeId(g.id)}
                  className={`rounded-xl px-3 py-3 border font-bold transition-all duration-200 text-center ${
                    active
                      ? "bg-navy text-white border-navy scale-105 shadow-md"
                      : "bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50 border-canvas-200 dark:border-canvas-700 hover:border-electric hover:scale-[1.02]"
                  }`}
                  aria-pressed={active}
                >
                  <div className="text-sm font-black">{g.name}</div>
                  <div
                    className={`text-[10px] mt-1 ${
                      active ? "opacity-85" : "opacity-70"
                    }`}
                  >
                    ×{g.weight}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      active ? "opacity-70" : "opacity-60"
                    }`}
                  >
                    {g.share}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 고급 옵션 토글 */}
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-canvas-50 dark:bg-canvas-800 hover:bg-electric-10 transition-colors"
          aria-expanded={advancedOpen}
        >
          <span className="text-xs font-black uppercase tracking-widest text-navy dark:text-canvas-50">
            고급 옵션 — 소급분 · 사이닝 · IRP 절세
          </span>
          <ChevronDown
            size={16}
            className={`text-electric transition-transform duration-300 ${
              advancedOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-all duration-300 ${
            advancedOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
          aria-hidden={!advancedOpen}
        >
          <div className="overflow-hidden">
            <div className="pt-2 space-y-5">
              <MoneyField
                id="retro"
                label="임금협상 소급분 (선택)"
                hint="잠정합의 시 1월 1일자 인상분을 일시 정산. 평균 6.5% × 5~8개월치"
                value={retroFmt}
                onChange={setRetroFmt}
              />
              <MoneyField
                id="signing"
                label="사이닝/리텐션 보너스 (선택)"
                hint="이직·핵심인재 유지용. 통상 1~3년 의무근무 조건"
                value={signingFmt}
                onChange={setSigningFmt}
              />
              <MoneyField
                id="irp"
                label="IRP·연금저축 납입액 (절세 시뮬)"
                hint={`연 900만원 한도. 연봉 ${salary <= 55_000_000 ? "5,500만 이하 → 환급률 16.5%" : "5,500만 초과 → 환급률 13.2%"}`}
                value={irpFmt}
                onChange={setIrpFmt}
                highlight
              />
            </div>
          </div>
        </div>
      </div>

      {/* ───── 메인 결과 카드 ───── */}
      <div
        className="rounded-3xl p-7 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0145F2 0%, #0D5BFF 60%, #2563EB 100%)",
          boxShadow: "0 16px 48px #0145F235",
        }}
      >
        {/* 데코 도형 */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(#fff, transparent 70%)" }}
        />
        <p
          className="text-xs font-black uppercase tracking-widest mb-3 inline-flex items-center gap-2"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          <Sparkles size={12} /> 연간 성과급 세후 실수령
        </p>
        <p
          className="text-5xl sm:text-6xl font-black mb-3 tracking-tight tabular-nums"
          style={{ letterSpacing: "-0.04em" }}
        >
          {fmt(animatedNet)}
          <span className="text-2xl sm:text-3xl ml-1 opacity-80">원</span>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span
            className="tabular-nums"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            세전 {fmt(animatedGross)}원
          </span>
          <span style={{ color: "rgba(255,255,255,0.75)" }}>
            공제 -{fmt(result.totalDeduct)}원 ·{" "}
            {result.effectiveRate.toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20">
          <MiniStat
            label="연봉 대비"
            value={`+${result.bonusToSalaryRatio.toFixed(1)}%`}
          />
          <MiniStat
            label={`평가 ${grade.name}`}
            value={`×${grade.weight}`}
          />
          <MiniStat
            label="월 환산 (성과급 포함)"
            value={`${fmtManwon(result.monthlyAfter)}만`}
          />
        </div>
      </div>

      {/* ───── IRP 절세 카드 (입력 시만) ───── */}
      {irpDeposit > 0 && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5 flex items-start gap-4 animate-[fadeIn_0.4s_ease-out]">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <PiggyBank size={22} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
              IRP·연금저축 세액공제 환급
            </p>
            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-200 tabular-nums">
              +{fmt(animatedRefund)}원
            </p>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
              {fmt(irpDeposit)}원 납입 시 환급 ·{" "}
              {salary <= 55_000_000 ? "16.5%" : "13.2%"} (지방세 포함) 세액공제
              {irpDeposit === 9_000_000 && " · 연 한도 최대 활용"}
            </p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-2">
              IRP 환급 합산 실수령 = {fmt(result.netAfterIrp)}원
            </p>
          </div>
        </div>
      )}

      {/* ───── 월별 캐시플로우 ───── */}
      <MonthlyCashflow
        opi={result.opiGross}
        opiNet={result.opiNet}
        taiH1={result.taiH1Gross}
        taiH1Net={result.taiH1Net}
        taiH2={result.taiH2Gross}
        taiH2Net={result.taiH2Net}
        retro={result.retroBonus}
      />

      {/* ───── 세부 분해 ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <BreakdownCard
          label="OPI"
          subLabel="초과이익성과금 · 1월"
          gross={result.opiGross}
          net={result.opiNet}
          highlight
        />
        <BreakdownCard
          label="TAI 상반기"
          subLabel="목표달성장려금 · 7월"
          gross={result.taiH1Gross}
          net={result.taiH1Net}
        />
        <BreakdownCard
          label="TAI 하반기"
          subLabel="목표달성장려금 · 다음해 1월"
          gross={result.taiH2Gross}
          net={result.taiH2Net}
        />
      </div>

      {/* ───── 공제 상세 ───── */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <p className="text-xs font-black uppercase tracking-widest text-faint-blue mb-4">
          공제 항목 상세 (성과급 귀속분)
        </p>
        <div className="space-y-2 text-sm">
          <Row
            label="소득세 (누진세율, 세액공제 30% 가정 후)"
            value={result.incomeTaxOnBonus}
          />
          <Row
            label="지방소득세 (소득세의 10%)"
            value={result.localTax}
          />
          <Row
            label="국민연금 (4.5%, 보수월액 상한 적용)"
            value={result.nationalPension}
          />
          <Row label="건강보험 (3.545%)" value={result.healthIns} />
          <Row
            label="장기요양 (건강보험의 12.95%)"
            value={result.longTermCare}
          />
          <Row label="고용보험 (0.9%)" value={result.employment} />
          <div className="border-t border-canvas-200 dark:border-canvas-800 pt-2 mt-2">
            <Row label="총 공제" value={result.totalDeduct} bold />
          </div>
        </div>
        <p className="text-xs text-faint-blue mt-4 leading-relaxed">
          ※ 소득세는 성과급이 연 근로소득에 합산되어 발생하는 누진 증가분
          기준. 연말정산 시 자녀·연금·의료비·기부 등 추가 세액공제에 따라 환급
          변동. 국민연금은 보수월액 상한선(2026년 약 617만원, 연 7,404만원)
          초과분에 부과되지 않습니다.
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 하위 컴포넌트
// ────────────────────────────────────────────────────────────

function DsHeadcountBar({
  divisionId,
  animated,
}: {
  divisionId: string;
  animated: boolean;
}) {
  const total = DS_HEADCOUNT.total;
  const segments = [
    {
      id: "ds-memory",
      label: "메모리",
      count: DS_HEADCOUNT.memory,
      color: "#0145F2",
      match: ["ds-memory-up", "ds-memory-mid"],
    },
    {
      id: "ds-foundry",
      label: "FDRY + S.LSI",
      count: DS_HEADCOUNT.foundryLsi,
      color: "#7B92FF",
      match: ["ds-foundry"],
    },
    {
      id: "ds-common",
      label: "공통",
      count: DS_HEADCOUNT.common,
      color: "#A8B9D6",
      match: ["ds-common"],
    },
  ];

  return (
    <div className="mt-4 rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-black uppercase tracking-widest text-faint-blue">
          DS 부문 사업부별 인원 구조
        </p>
        <p className="text-[11px] font-bold text-muted-blue">
          총 {total.toLocaleString("ko-KR")}명
        </p>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-canvas-200 dark:bg-canvas-700">
        {segments.map((s) => {
          const pct = (s.count / total) * 100;
          const active = s.match.includes(divisionId);
          return (
            <div
              key={s.id}
              className={`h-full transition-all duration-300 ${
                animated ? "" : ""
              }`}
              style={{
                width: `${pct}%`,
                backgroundColor: s.color,
                opacity: active ? 1 : 0.55,
                boxShadow: active
                  ? "inset 0 0 0 2px #fff, 0 0 0 2px " + s.color
                  : "none",
              }}
              title={`${s.label} ${s.count.toLocaleString("ko-KR")}명 (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {segments.map((s) => {
          const pct = (s.count / total) * 100;
          const active = s.match.includes(divisionId);
          return (
            <div
              key={s.id}
              className={`text-[11px] transition-opacity ${
                active ? "opacity-100" : "opacity-65"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-bold text-navy dark:text-canvas-50">
                  {s.label}
                </span>
              </div>
              <div className="text-faint-blue mt-0.5 tabular-nums">
                {s.count.toLocaleString("ko-KR")}명 · {pct.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyCashflow({
  opi,
  opiNet,
  taiH1,
  taiH1Net,
  taiH2,
  taiH2Net,
  retro,
}: {
  opi: number;
  opiNet: number;
  taiH1: number;
  taiH1Net: number;
  taiH2: number;
  taiH2Net: number;
  retro: number;
}) {
  // 1월: OPI + (전년) TAI 하반기 (= 입력의 taiH2) - 모델 단순화: 현 시점 기준 향후 12개월
  // 단순 시각화: 1월(OPI + 소급분) / 7월(TAI 상반기) / 내년 1월(TAI 하반기)
  const events = [
    {
      month: "1월",
      label: "OPI · 소급분",
      gross: opi + retro,
      net: opiNet + retro * 0.7, // 소급분 대략 30% 공제 가정
      color: "#0145F2",
    },
    {
      month: "7월",
      label: "TAI 상반기",
      gross: taiH1,
      net: taiH1Net,
      color: "#0D5BFF",
    },
    {
      month: "내년 1월",
      label: "TAI 하반기",
      gross: taiH2,
      net: taiH2Net,
      color: "#7B92FF",
    },
  ];
  const max = Math.max(...events.map((e) => e.gross), 1);

  return (
    <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
      <p className="text-xs font-black uppercase tracking-widest text-faint-blue mb-4 inline-flex items-center gap-2">
        <Calendar size={12} /> 월별 캐시플로우 (지급 시점)
      </p>
      <div className="space-y-4">
        {events.map((e) => {
          const pct = (e.gross / max) * 100;
          return (
            <div key={e.month}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-navy dark:text-canvas-50 w-16">
                    {e.month}
                  </span>
                  <span className="text-[11px] font-bold text-muted-blue">
                    {e.label}
                  </span>
                </div>
                <div className="text-right tabular-nums">
                  <span className="text-sm font-black text-navy dark:text-canvas-50">
                    {fmt(e.net)}원
                  </span>
                  <span className="text-[10px] text-faint-blue ml-2">
                    세전 {fmt(e.gross)}원
                  </span>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-canvas-100 dark:bg-canvas-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: e.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-faint-blue mt-4 leading-relaxed">
        ※ OPI와 TAI 하반기는 모두 1월에 지급되지만, 본 차트는 발생 기준
        구분을 위해 다른 행에 표기했습니다. 실제 명세서에는 1월에 합산
        지급됩니다.
      </p>
    </div>
  );
}

function BreakdownCard({
  label,
  subLabel,
  gross,
  net,
  highlight = false,
}: {
  label: string;
  subLabel: string;
  gross: number;
  net: number;
  highlight?: boolean;
}) {
  const animatedNet = useCountUp(net);
  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        highlight
          ? "bg-electric-5 border-electric-30"
          : "bg-white dark:bg-canvas-900 border-canvas-200 dark:border-canvas-800"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-widest mb-1 ${
          highlight ? "text-electric" : "text-faint-blue"
        }`}
      >
        {label}
      </p>
      <p className="text-[10px] font-bold text-muted-blue mb-3">
        {subLabel}
      </p>
      <p className="text-xl font-black text-navy dark:text-canvas-50 tabular-nums">
        {fmt(animatedNet)}원
      </p>
      <p className="text-xs text-muted-blue mt-1 tabular-nums">
        세전 {fmt(gross)}원
      </p>
    </div>
  );
}

function Row({
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
          bold
            ? "font-black text-navy dark:text-canvas-50"
            : "text-muted-blue dark:text-canvas-300"
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${
          bold
            ? "font-black text-rose-500 text-lg"
            : "font-bold text-navy dark:text-canvas-50"
        }`}
      >
        -{fmt(value)}원
      </span>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        {label}
      </p>
      <p className="text-lg font-black tabular-nums">{value}</p>
    </div>
  );
}

function SliderField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "%",
  hint,
  accentColor = "electric",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: string;
  accentColor?: "electric" | "navy";
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = accentColor === "navy" ? "#0A1829" : "#0145F2";
  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <label
          htmlFor={id}
          className="text-xs font-bold uppercase tracking-widest text-faint-blue"
        >
          {label}
        </label>
        <span
          className="text-2xl font-black tabular-nums"
          style={{ color }}
        >
          {value}
          <span className="text-base ml-0.5">{unit}</span>
        </span>
      </div>
      <input
        id={id}
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
      {hint && (
        <p className="text-[11px] text-faint-blue mt-1.5 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function MoneyField({
  id,
  label,
  hint,
  value,
  onChange,
  highlight = false,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  highlight?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatInput(e.target.value))}
          className="w-full rounded-xl px-4 py-3 text-lg font-black focus:outline-none transition pr-10"
          style={{
            backgroundColor: highlight ? "#10B98115" : "#F8FAFB",
            border: highlight
              ? "2px solid #10B981"
              : "1.5px solid #DDE4EC",
            color: highlight ? "#047857" : "#0A1829",
          }}
          placeholder="0"
          aria-label={label}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
          style={{ color: highlight ? "#10B981" : "#7B8FA1" }}
        >
          원
        </span>
      </div>
      {hint && (
        <p className="text-[11px] text-faint-blue mt-1.5 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}
