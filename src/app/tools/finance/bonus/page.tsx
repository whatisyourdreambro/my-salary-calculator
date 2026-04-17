"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, ChevronDown, ChevronUp, Info, ArrowRight, Users } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import type { Metadata } from "next";

// ── 2026 Korean Income Tax Law ──────────────────────────────────────────────

/** 근로소득공제 (2026년 기준) */
function calcEmploymentDeduction(salary: number): number {
  if (salary <= 5_000_000) return salary * 0.70;
  if (salary <= 15_000_000) return 3_500_000 + (salary - 5_000_000) * 0.40;
  if (salary <= 45_000_000) return 7_500_000 + (salary - 15_000_000) * 0.15;
  if (salary <= 100_000_000) return 12_000_000 + (salary - 45_000_000) * 0.05;
  return Math.min(14_500_000 + (salary - 100_000_000) * 0.02, 20_000_000);
}

/** 누진세 계산 (2026) */
function calcProgressiveTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const brackets = [
    { limit: 14_000_000, rate: 0.06, deduction: 0 },
    { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
    { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
    { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
    { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
    { limit: 500_000_000, rate: 0.40, deduction: 25_940_000 },
    { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
    { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
  ];
  for (const b of brackets) {
    if (taxableIncome <= b.limit) {
      return Math.max(0, Math.round(taxableIncome * b.rate - b.deduction));
    }
  }
  return 0;
}

/** 근로소득세액공제 */
function calcTaxCredit(incomeTax: number): number {
  if (incomeTax <= 1_300_000) return Math.round(incomeTax * 0.55);
  return Math.round(715_000 + (incomeTax - 1_300_000) * 0.30);
}

interface CalcResult {
  grossBonus: number;
  taxBeforeBonus: number;
  taxAfterBonus: number;
  bonusTax: number;
  localTax: number;
  totalTax: number;
  netBonus: number;
  effectiveRate: number;
  marginalRate: number;
  taxableIncomeBase: number;
  taxableIncomeNew: number;
}

function calculate(
  annualSalary: number,
  bonus: number,
  dependents: number,
  isSingle: boolean
): CalcResult {
  const personalDeduction = 1_500_000 * (1 + dependents + (isSingle ? 0 : 1));

  // BASE: salary only
  const empDeductBase = calcEmploymentDeduction(annualSalary);
  const taxableBase = Math.max(0, annualSalary - empDeductBase - personalDeduction);
  const grossTaxBase = calcProgressiveTax(taxableBase);
  const creditBase = calcTaxCredit(grossTaxBase);
  const taxBeforeBonus = Math.max(0, grossTaxBase - creditBase);

  // NEW: salary + bonus
  const totalIncome = annualSalary + bonus;
  const empDeductNew = calcEmploymentDeduction(totalIncome);
  const taxableNew = Math.max(0, totalIncome - empDeductNew - personalDeduction);
  const grossTaxNew = calcProgressiveTax(taxableNew);
  const creditNew = calcTaxCredit(grossTaxNew);
  const taxAfterBonus = Math.max(0, grossTaxNew - creditNew);

  const bonusTax = Math.max(0, taxAfterBonus - taxBeforeBonus);
  const localTax = Math.round(bonusTax * 0.1);
  const totalTax = bonusTax + localTax;
  const netBonus = bonus - totalTax;
  const effectiveRate = bonus > 0 ? (totalTax / bonus) * 100 : 0;

  // Marginal rate from brackets
  const brackets = [
    { limit: 14_000_000, rate: 6 },
    { limit: 50_000_000, rate: 15 },
    { limit: 88_000_000, rate: 24 },
    { limit: 150_000_000, rate: 35 },
    { limit: 300_000_000, rate: 38 },
    { limit: 500_000_000, rate: 40 },
    { limit: 1_000_000_000, rate: 42 },
    { limit: Infinity, rate: 45 },
  ];
  const marginalRate = brackets.find((b) => taxableNew <= b.limit)?.rate ?? 45;

  return {
    grossBonus: bonus,
    taxBeforeBonus,
    taxAfterBonus,
    bonusTax,
    localTax,
    totalTax,
    netBonus,
    effectiveRate,
    marginalRate,
    taxableIncomeBase: taxableBase,
    taxableIncomeNew: taxableNew,
  };
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

type Preset = { label: string; salary: number; bonus: number };
const PRESETS: Preset[] = [
  { label: "대리 (연봉 4천)", salary: 40_000_000, bonus: 5_000_000 },
  { label: "과장 (연봉 6천)", salary: 60_000_000, bonus: 10_000_000 },
  { label: "차장 (연봉 8천)", salary: 80_000_000, bonus: 16_000_000 },
  { label: "부장 (연봉 1.2억)", salary: 120_000_000, bonus: 30_000_000 },
];

export default function BonusCalculatorPage() {
  const [salary, setSalary] = useState(60_000_000);
  const [bonus, setBonus] = useState(10_000_000);
  const [dependents, setDependents] = useState(0);
  const [isSingle, setIsSingle] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  const r = useMemo(
    () => calculate(salary, bonus, dependents, isSingle),
    [salary, bonus, dependents, isSingle]
  );

  const pct = ((r.netBonus / r.grossBonus) * 100).toFixed(1);

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12 pb-10 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6">
            <Gift size={14} /> 2026 세법 기준
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            성과급 세금 계산기
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            연봉 합산 세율 방식으로 성과급 실수령액을 정확히 계산합니다
          </p>
        </div>

        <AdUnit slotId="bonus_top" format="auto" label="성과급 상단" />

        {/* Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-8">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setSalary(p.salary); setBonus(p.bonus); }}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                salary === p.salary && bonus === p.bonus
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 text-slate-700 hover:border-primary hover:bg-primary/5"
              }`}
            >
              <p>{p.label}</p>
              <p className={`mt-1 font-normal ${salary === p.salary && bonus === p.bonus ? "text-white/70" : "text-slate-400"}`}>
                성과급 {(p.bonus / 10000).toFixed(0)}만원
              </p>
            </button>
          ))}
        </div>

        {/* Input Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">입력 정보</h2>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">연간 기본급 (세전, 원)</label>
              <div className="relative">
                <input
                  type="number"
                  value={salary}
                  onChange={e => setSalary(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-black text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">원</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{fmt(salary)}원 ({(salary / 10000).toLocaleString()}만원)</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">성과급 / 인센티브 (세전, 원)</label>
              <div className="relative">
                <input
                  type="number"
                  value={bonus}
                  onChange={e => setBonus(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-black text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">원</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{fmt(bonus)}원 ({(bonus / 10000).toLocaleString()}만원)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  <Users size={12} className="inline mr-1" />부양가족 수 (본인 제외)
                </label>
                <select
                  value={dependents}
                  onChange={e => setDependents(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {[0,1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}명</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">배우자 유무</label>
                <div className="flex gap-2 mt-1">
                  {[{ v: true, label: "미혼/해당없음" }, { v: false, label: "배우자 있음" }].map(opt => (
                    <button
                      key={String(opt.v)}
                      onClick={() => setIsSingle(opt.v)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${
                        isSingle === opt.v
                          ? "bg-primary text-white border-primary"
                          : "border-gray-200 text-slate-600 hover:border-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Card */}
        <motion.div
          key={`${r.netBonus}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-primary mb-6 shadow-lg"
        >
          {/* Top: Net Bonus */}
          <div className="bg-primary p-8 text-center">
            <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-2">실수령 성과급 (세후)</p>
            <p className="text-5xl font-black text-white tracking-tight">
              {fmt(r.netBonus)}<span className="text-2xl ml-1">원</span>
            </p>
            <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-white/20">
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">세금 합계</p>
                <p className="text-white font-black">{fmt(r.totalTax)}원</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">실효세율</p>
                <p className="text-white font-black">{r.effectiveRate.toFixed(1)}%</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">수령 비율</p>
                <p className="text-white font-black">{pct}%</p>
              </div>
            </div>
          </div>

          {/* Bottom: Breakdown */}
          <div className="bg-white p-6 space-y-3">
            {[
              { label: "세전 성과급", value: r.grossBonus, highlight: false },
              { label: "소득세 (성과급 귀속분)", value: -r.bonusTax, highlight: false },
              { label: "지방소득세 (소득세×10%)", value: -r.localTax, highlight: false },
              { label: "세후 실수령액", value: r.netBonus, highlight: true },
            ].map(item => (
              <div key={item.label} className={`flex justify-between items-center py-2 ${item.highlight ? "border-t-2 border-primary pt-4" : "border-b border-gray-100"}`}>
                <span className={`text-sm font-medium ${item.highlight ? "font-black text-slate-900" : "text-slate-500"}`}>
                  {item.label}
                </span>
                <span className={`font-black tabular-nums ${
                  item.highlight ? "text-primary text-xl" :
                  item.value < 0 ? "text-red-500" : "text-slate-900"
                }`}>
                  {item.value < 0 ? "-" : ""}{fmt(Math.abs(item.value))}원
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detail Toggle */}
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="w-full flex items-center justify-between p-5 border border-gray-200 rounded-2xl mb-6 hover:bg-slate-50 transition-colors"
        >
          <span className="font-bold text-slate-700 text-sm">세금 계산 상세 내역 보기</span>
          {showDetail ? <ChevronUp size={18} className="text-primary" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        <AnimatePresence>
          {showDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-black text-slate-900 text-sm">2026 근로소득세 계산 과정</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: "① 연봉 + 성과급 합계", value: fmt(salary + bonus) + "원", sub: "총 근로소득" },
                    { label: "② 근로소득공제 차감", value: "-" + fmt(calcEmploymentDeduction(salary + bonus)) + "원", sub: "소득 규모별 공제" },
                    { label: "③ 인적공제 차감", value: "-" + fmt(1_500_000 * (1 + dependents + (isSingle ? 0 : 1))) + "원", sub: `본인 + 부양가족${dependents}명${!isSingle ? " + 배우자" : ""}` },
                    { label: "④ 과세표준 (합산 후)", value: fmt(r.taxableIncomeNew) + "원", sub: "세율이 적용되는 금액" },
                    { label: "⑤ 한계세율 구간", value: r.marginalRate + "%", sub: "성과급 구간의 최고 세율" },
                    { label: "⑥ 산출세액 (합산 후)", value: fmt(calcProgressiveTax(r.taxableIncomeNew)) + "원", sub: "누진세 적용 후" },
                    { label: "⑦ 근로소득세액공제", value: "-" + fmt(calcTaxCredit(calcProgressiveTax(r.taxableIncomeNew))) + "원", sub: "최대 74만원 (130만원 이하 구간)" },
                    { label: "⑧ 결정세액 (합산 후)", value: fmt(r.taxAfterBonus) + "원", sub: "실제 납부 소득세" },
                    { label: "⑨ 성과급 귀속 소득세", value: fmt(r.bonusTax) + "원", sub: "합산전후 세액 차이" },
                    { label: "⑩ 지방소득세 (×10%)", value: fmt(r.localTax) + "원", sub: "주민세" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-start px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{row.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{row.sub}</p>
                      </div>
                      <p className="text-sm font-black text-slate-700 tabular-nums text-right">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3">
                <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  본 계산기는 <strong>2026년 근로소득 간이세액표 기준</strong>으로 산출되며, 국민연금·건강보험료 등 4대 보험료는 별도입니다.
                  실제 원천징수액은 다른 소득공제 항목에 따라 달라질 수 있습니다.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AdUnit slotId="bonus_bottom" format="auto" label="성과급 하단" />

        {/* Related */}
        <div className="mt-10">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">관련 계산기</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "연봉 실수령액 계산기", href: "/" },
              { label: "퇴직금 세금 계산기", href: "/tools/finance/severance" },
              { label: "IRP 세액공제 계산기", href: "/tools/finance/irp" },
              { label: "프리랜서 종합소득세", href: "/tools/finance/freelance-tax" },
            ].map(l => (
              <a key={l.href} href={l.href} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group">
                <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{l.label}</span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
