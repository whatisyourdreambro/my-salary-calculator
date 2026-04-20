"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Gift, ChevronDown, ChevronUp, Info, ArrowRight, Users,
  Share2, Copy, Check, TrendingDown, Zap, Shield,
  AlertCircle, BarChart3, Sparkles, BookOpen,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 2026 세법 기준 로직 (소득세법 제47조, 제55조, 제59조)
// ─────────────────────────────────────────────────────────────────────────────

/** 근로소득공제 (소득세법 제47조) — 최대 2,000만원 */
function calcEmpDeduction(totalIncome: number): number {
  if (totalIncome <= 5_000_000)   return totalIncome * 0.70;
  if (totalIncome <= 15_000_000)  return 3_500_000 + (totalIncome - 5_000_000) * 0.40;
  if (totalIncome <= 45_000_000)  return 7_500_000 + (totalIncome - 15_000_000) * 0.15;
  if (totalIncome <= 100_000_000) return 12_000_000 + (totalIncome - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (totalIncome - 100_000_000) * 0.02, 20_000_000);
}

/** 기본공제 (소득세법 제50조) — 1인당 150만원 */
function calcBasicDeduction(dependents: number, hasSpouse: boolean): number {
  // 본인(1) + 배우자(조건) + 부양가족
  const spouseCount = hasSpouse ? 1 : 0;
  return 1_500_000 * (1 + spouseCount + dependents);
}

/** 누진세 계산 (소득세법 제55조 — 2026 세율표) */
const TAX_BRACKETS = [
  { limit: 14_000_000,    rate: 0.06,  deduction: 0          },
  { limit: 50_000_000,    rate: 0.15,  deduction: 1_260_000  },
  { limit: 88_000_000,    rate: 0.24,  deduction: 5_760_000  },
  { limit: 150_000_000,   rate: 0.35,  deduction: 15_440_000 },
  { limit: 300_000_000,   rate: 0.38,  deduction: 19_940_000 },
  { limit: 500_000_000,   rate: 0.40,  deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42,  deduction: 35_940_000 },
  { limit: Infinity,      rate: 0.45,  deduction: 65_940_000 },
];

function calcProgressiveTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxableIncome <= b.limit) {
      return Math.max(0, Math.round(taxableIncome * b.rate - b.deduction));
    }
  }
  return 0;
}

function getMarginalRate(taxableIncome: number): number {
  for (const b of TAX_BRACKETS) {
    if (taxableIncome <= b.limit) return Math.round(b.rate * 100);
  }
  return 45;
}

/**
 * 근로소득세액공제 (소득세법 제59조)
 * 2025~2026: 총급여액 구간별 한도 적용
 */
function calcTaxCredit(incomeTax: number, totalIncome: number): number {
  if (incomeTax <= 0) return 0;
  // 세액공제액 계산
  let credit: number;
  if (incomeTax <= 1_300_000) {
    credit = Math.round(incomeTax * 0.55);
  } else {
    credit = Math.round(715_000 + (incomeTax - 1_300_000) * 0.30);
  }
  // 총급여 구간별 한도
  let limit: number;
  if (totalIncome > 120_000_000)     limit = 500_000;
  else if (totalIncome > 70_000_000) limit = 660_000;
  else if (totalIncome > 33_000_000) limit = 740_000;
  else                                limit = credit; // 한도 없음(상한 없음)
  return Math.min(credit, limit);
}

/**
 * 성과급에 대한 4대보험 계산
 * - 국민연금: 4.5% (상한: 월 617만원 기준 → 연 7,404만원 이상이면 상한 적용)
 * - 건강보험: 3.545% + 장기요양 0.4591%
 * - 고용보험: 0.9%
 * 성과급은 비정기 상여금으로 4대보험 부과 대상
 */
function calcInsurance(bonus: number, annualSalary: number): {
  pension: number; health: number; longTerm: number; employment: number; total: number;
} {
  // 국민연금: 연 소득 상한 6,170만원×12월×4.5% 기준
  //   → 연봉이 이미 상한 초과 시 성과급에는 추가 부과 없음
  const pensionCeiling = 74_040_000; // 617만×12
  const pensionBase = Math.min(bonus, Math.max(0, pensionCeiling - annualSalary));
  const pension = Math.round(pensionBase * 0.045);

  // 건강보험 + 장기요양 (상한 없음, 정산 방식)
  const health    = Math.round(bonus * 0.03545);
  const longTerm  = Math.round(health * 0.1295); // 건강보험료 × 12.95%

  // 고용보험
  const employment = Math.round(bonus * 0.009);

  return {
    pension,
    health,
    longTerm,
    employment,
    total: pension + health + longTerm + employment,
  };
}

interface CalcResult {
  grossBonus: number;
  // 소득세
  taxBeforeBonus: number;
  taxAfterBonus: number;
  bonusIncomeTax: number;
  localTax: number;
  totalIncomeTax: number;
  // 4대보험
  insurance: ReturnType<typeof calcInsurance>;
  // 합계
  totalDeduction: number;
  netBonus: number;
  effectiveRate: number;
  marginalRate: number;
  // 세금 계산 내역
  totalIncome: number;
  empDeductNew: number;
  basicDeduct: number;
  taxableNew: number;
  taxableBase: number;
  grossTaxNew: number;
  creditNew: number;
}

function calculate(
  annualSalary: number,
  bonus: number,
  dependents: number,
  hasSpouse: boolean,
): CalcResult {
  const basicDeduct = calcBasicDeduction(dependents, hasSpouse);

  // ① 기본급만의 세금
  const empDeductBase = calcEmpDeduction(annualSalary);
  const taxableBase   = Math.max(0, annualSalary - empDeductBase - basicDeduct);
  const grossTaxBase  = calcProgressiveTax(taxableBase);
  const creditBase    = calcTaxCredit(grossTaxBase, annualSalary);
  const taxBeforeBonus = Math.max(0, grossTaxBase - creditBase);

  // ② 기본급 + 성과급 합산 세금
  const totalIncome   = annualSalary + bonus;
  const empDeductNew  = calcEmpDeduction(totalIncome);
  const taxableNew    = Math.max(0, totalIncome - empDeductNew - basicDeduct);
  const grossTaxNew   = calcProgressiveTax(taxableNew);
  const creditNew     = calcTaxCredit(grossTaxNew, totalIncome);
  const taxAfterBonus = Math.max(0, grossTaxNew - creditNew);

  // ③ 성과급 귀속 소득세
  const bonusIncomeTax = Math.max(0, taxAfterBonus - taxBeforeBonus);
  const localTax       = Math.round(bonusIncomeTax * 0.1);
  const totalIncomeTax = bonusIncomeTax + localTax;

  // ④ 4대보험
  const insurance = calcInsurance(bonus, annualSalary);

  // ⑤ 합계
  const totalDeduction = totalIncomeTax + insurance.total;
  const netBonus       = bonus - totalDeduction;
  const effectiveRate  = bonus > 0 ? (totalDeduction / bonus) * 100 : 0;
  const marginalRate   = getMarginalRate(taxableNew);

  return {
    grossBonus: bonus,
    taxBeforeBonus,
    taxAfterBonus,
    bonusIncomeTax,
    localTax,
    totalIncomeTax,
    insurance,
    totalDeduction,
    netBonus,
    effectiveRate,
    marginalRate,
    totalIncome,
    empDeductNew,
    basicDeduct,
    taxableNew,
    taxableBase,
    grossTaxNew,
    creditNew,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

function toEok(n: number): string {
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000);
    const man = Math.floor((n % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (n >= 10_000) return `${Math.floor(n / 10_000).toLocaleString()}만원`;
  return `${n.toLocaleString()}원`;
}

/** 입력값을 포맷: 숫자만 남기고 1000단위 콤마 */
function formatInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

function parseInput(formatted: string): number {
  return Number(formatted.replace(/[^0-9]/g, "")) || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// 프리셋
// ─────────────────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: "사원/대리", sub: "연봉 4,000만원", salary: 40_000_000, bonus: 3_000_000 },
  { label: "과장/차장", sub: "연봉 6,000만원", salary: 60_000_000, bonus: 8_000_000 },
  { label: "부장/팀장", sub: "연봉 9,000만원", salary: 90_000_000, bonus: 15_000_000 },
  { label: "임원급",    sub: "연봉 1.5억",     salary: 150_000_000, bonus: 30_000_000 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────────────────────
export default function BonusCalculatorPage() {
  const [salaryFmt, setSalaryFmt]   = useState("60,000,000");
  const [bonusFmt, setBonusFmt]     = useState("10,000,000");
  const [dependents, setDependents] = useState(0);
  const [hasSpouse, setHasSpouse]   = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [copied, setCopied]         = useState(false);

  const salary = parseInput(salaryFmt);
  const bonus  = parseInput(bonusFmt);

  const r = useMemo(
    () => calculate(salary, bonus, dependents, hasSpouse),
    [salary, bonus, dependents, hasSpouse]
  );

  const receiveRatio = bonus > 0 ? ((r.netBonus / bonus) * 100).toFixed(1) : "0.0";

  // 입력 핸들러
  const handleSalary = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryFmt(formatInput(e.target.value));
  }, []);
  const handleBonus = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBonusFmt(formatInput(e.target.value));
  }, []);

  // 공유
  const handleShare = async () => {
    const text = `💰 성과급 세금 계산 결과\n세전: ${fmt(bonus)}원\n실수령: ${fmt(r.netBonus)}원 (${receiveRatio}%)\n세금: ${fmt(r.totalDeduction)}원 (${r.effectiveRate.toFixed(1)}%)\n\n머니샐러리에서 내 성과급 세금 계산 → https://www.moneysalary.com/tools/finance/bonus`;
    if (navigator.share) {
      await navigator.share({ title: "성과급 세금 계산기", text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 충격 메시지
  const shockMsg = (() => {
    const rate = r.effectiveRate;
    if (rate >= 40) return { emoji: "😱", text: `성과급의 절반 가까이 세금으로!`, color: "#E63B5A" };
    if (rate >= 30) return { emoji: "😤", text: `3분의 1이 세금으로 빠져나가요`, color: "#F59E0B" };
    if (rate >= 20) return { emoji: "😅", text: `5분의 1이 세금입니다`, color: "#0145F2" };
    return { emoji: "😊", text: `비교적 합리적인 세율이에요`, color: "#10B981" };
  })();

  return (
    <main
      className="min-h-screen pb-32 pt-24 px-4 font-sans"
      style={{ backgroundColor: "#EDF1F5" }}
    >
      <div className="max-w-2xl mx-auto">

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5"
            style={{ backgroundColor: "#0145F21A", color: "#0145F2", border: "1.5px solid #0145F233" }}
          >
            <Sparkles size={12} /> 2026 세법 완벽 반영
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-black tracking-tight mb-3"
            style={{ color: "#0A1829", letterSpacing: "-0.04em" }}
          >
            성과급 세금 계산기
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-lg font-medium"
            style={{ color: "#3D5E78" }}
          >
            소득세 + 4대보험까지 <strong style={{ color: "#0145F2" }}>전부 정확하게</strong> 계산합니다
          </motion.p>
        </div>

        {/* ── 프리셋 ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {PRESETS.map((p) => {
            const active = salary === p.salary && bonus === p.bonus;
            return (
              <button
                key={p.label}
                onClick={() => {
                  setSalaryFmt(p.salary.toLocaleString("ko-KR"));
                  setBonusFmt(p.bonus.toLocaleString("ko-KR"));
                }}
                className="p-3 rounded-xl text-left transition-all text-xs font-bold"
                style={{
                  backgroundColor: active ? "#0145F2" : "#FFFFFF",
                  border: `1.5px solid ${active ? "#0145F2" : "#DDE4EC"}`,
                  color: active ? "#FFFFFF" : "#3D5E78",
                  boxShadow: active ? "0 4px 16px #0145F230" : "none",
                }}
              >
                <div style={{ color: active ? "#FFFFFF" : "#0A1829", fontWeight: 900 }}>{p.label}</div>
                <div style={{ color: active ? "rgba(255,255,255,0.65)" : "#7A9AB5", marginTop: "2px", fontWeight: 500 }}>
                  {p.sub}
                </div>
                <div style={{ color: active ? "rgba(255,255,255,0.8)" : "#0145F2", fontWeight: 700, marginTop: "4px" }}>
                  성과급 {toEok(p.bonus)}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 입력 카드 ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-5"
          style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC", boxShadow: "0 2px 16px #0145F20A" }}
        >
          <h2 className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: "#7A9AB5" }}>
            입력 정보
          </h2>
          <div className="space-y-5">

            {/* 연봉 */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7A9AB5" }}>
                연간 기본급 (세전 연봉)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryFmt}
                  onChange={handleSalary}
                  className="w-full rounded-xl px-4 py-4 text-xl font-black focus:outline-none transition pr-12"
                  style={{
                    backgroundColor: "#F8FAFB",
                    border: "1.5px solid #DDE4EC",
                    color: "#0A1829",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0145F2";
                    e.target.style.boxShadow = "0 0 0 3px #0145F215";
                    e.target.select();
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#DDE4EC";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="예: 60,000,000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "#7A9AB5" }}>원</span>
              </div>
              <p className="text-xs mt-1.5 font-medium" style={{ color: "#7A9AB5" }}>
                = {toEok(salary)}
              </p>
            </div>

            {/* 성과급 */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7A9AB5" }}>
                성과급 / 인센티브 (세전)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={bonusFmt}
                  onChange={handleBonus}
                  className="w-full rounded-xl px-4 py-4 text-2xl font-black focus:outline-none transition pr-12"
                  style={{
                    backgroundColor: "#0145F208",
                    border: "2px solid #0145F2",
                    color: "#0145F2",
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 3px #0145F218";
                    e.target.select();
                  }}
                  onBlur={(e) => { e.target.style.boxShadow = "none"; }}
                  placeholder="예: 10,000,000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "#0145F2" }}>원</span>
              </div>
              <p className="text-xs mt-1.5 font-medium" style={{ color: "#0145F2" }}>
                = {toEok(bonus)}
              </p>
            </div>

            {/* 부양가족 + 배우자 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7A9AB5" }}>
                  <Users size={11} className="inline mr-1" />부양가족 (본인 제외)
                </label>
                <select
                  value={dependents}
                  onChange={(e) => setDependents(Number(e.target.value))}
                  className="w-full rounded-xl px-4 py-3.5 font-bold focus:outline-none"
                  style={{ backgroundColor: "#F8FAFB", border: "1.5px solid #DDE4EC", color: "#0A1829" }}
                >
                  {[0,1,2,3,4,5].map((n) => (
                    <option key={n} value={n}>{n}명</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7A9AB5" }}>
                  배우자 공제
                </label>
                <div className="flex gap-2">
                  {[{ v: false, label: "없음" }, { v: true, label: "있음" }].map((opt) => (
                    <button
                      key={String(opt.v)}
                      onClick={() => setHasSpouse(opt.v)}
                      className="flex-1 py-3.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: hasSpouse === opt.v ? "#0145F2" : "#F8FAFB",
                        border: `1.5px solid ${hasSpouse === opt.v ? "#0145F2" : "#DDE4EC"}`,
                        color: hasSpouse === opt.v ? "#FFFFFF" : "#3D5E78",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 결과 카드 ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${r.netBonus}-${r.totalDeduction}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl overflow-hidden mb-4"
            style={{ boxShadow: "0 8px 40px #0145F225" }}
          >
            {/* 상단 파란 결과 */}
            <div
              className="px-8 py-8 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", transform: "translate(30%,-30%)" }}
              />
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                실수령 성과급 (세후)
              </p>
              <div className="text-5xl sm:text-6xl font-black tracking-tight" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
                <CountUp
                  end={r.netBonus}
                  duration={0.8}
                  separator=","
                  suffix="원"
                  preserveValue
                />
              </div>
              <p className="text-sm font-bold mt-1 mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                세전 {fmt(bonus)}원의 실수령
              </p>

              {/* 충격 배지 */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}
              >
                <span>{shockMsg.emoji}</span>
                <span>{shockMsg.text}</span>
              </div>

              {/* 3열 요약 */}
              <div
                className="grid grid-cols-3 gap-1 pt-5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
              >
                {[
                  { label: "총 공제액",    value: fmt(r.totalDeduction) + "원" },
                  { label: "실효세율",     value: r.effectiveRate.toFixed(1) + "%" },
                  { label: "실수령 비율",  value: receiveRatio + "%" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
                    <div className="text-sm font-black" style={{ color: "#FFFFFF" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 흰 공제 내역 */}
            <div className="bg-white px-6 py-4 space-y-0">
              {[
                { label: "세전 성과급",            value: bonus,             sign: ""  },
                { label: "소득세 (누진세 합산)",    value: r.bonusIncomeTax,  sign: "-" },
                { label: "지방소득세 (소득세×10%)", value: r.localTax,        sign: "-" },
                { label: "국민연금 (4.5%)",         value: r.insurance.pension,     sign: "-" },
                { label: "건강보험 (3.545%)",       value: r.insurance.health,      sign: "-" },
                { label: "장기요양보험",            value: r.insurance.longTerm,    sign: "-" },
                { label: "고용보험 (0.9%)",         value: r.insurance.employment,  sign: "-" },
              ].map((row, i) => {
                const isLast  = i === 0;
                const isTotal = false;
                return (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-3"
                    style={{ borderBottom: i < 6 ? "1px solid #EDF1F5" : "none" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "#3D5E78" }}>{row.label}</span>
                    <span
                      className="text-sm font-black tabular-nums"
                      style={{ color: row.sign === "-" ? "#E63B5A" : "#0A1829" }}
                    >
                      {row.sign}{fmt(row.value)}원
                    </span>
                  </div>
                );
              })}
              {/* 총계 */}
              <div
                className="flex justify-between items-center py-4 mt-1"
                style={{ borderTop: "2px solid #0145F2" }}
              >
                <span className="font-black text-base" style={{ color: "#0A1829" }}>세후 실수령액</span>
                <span className="text-xl font-black" style={{ color: "#0145F2" }}>
                  {fmt(r.netBonus)}원
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── 한계세율 경고 배너 ── */}
        {r.marginalRate >= 35 && bonus > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 mb-4 flex gap-3"
            style={{
              backgroundColor: "#FFF8E7",
              border: "1.5px solid #F59E0B44",
            }}
          >
            <AlertCircle size={20} style={{ color: "#F59E0B", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p className="text-sm font-black mb-1" style={{ color: "#92400E" }}>
                한계세율 {r.marginalRate}% 구간 진입!
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#78350F" }}>
                성과급으로 인해 소득이 상위 세율 구간에 진입했습니다.
                IRP 추가 납입(연 900만원 한도, 세액공제 16.5%)이나
                연금저축으로 절세 효과를 높이는 것을 검토하세요.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── 공유 버튼 ── */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all mb-4"
          style={{
            backgroundColor: "#0145F2",
            color: "#FFFFFF",
            boxShadow: "0 4px 16px #0145F230",
          }}
        >
          {copied ? <Check size={18} /> : <Share2 size={18} />}
          {copied ? "클립보드에 복사됐어요!" : "결과 공유하기 — 친구한테 세금 자랑(?)하기"}
        </button>

        {/* ── 세금 계산 상세 ── */}
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl mb-4 transition-all"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #DDE4EC",
            color: "#3D5E78",
          }}
        >
          <span className="font-bold text-sm flex items-center gap-2">
            <BarChart3 size={16} style={{ color: "#0145F2" }} />
            세금 계산 상세 내역 보기
          </span>
          {showDetail
            ? <ChevronUp size={18} style={{ color: "#0145F2" }} />
            : <ChevronDown size={18} style={{ color: "#7A9AB5" }} />
          }
        </button>

        <AnimatePresence>
          {showDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1.5px solid #DDE4EC" }}
              >
                <div className="px-6 py-4 flex items-center gap-2" style={{ backgroundColor: "#0145F2" }}>
                  <Zap size={14} style={{ color: "rgba(255,255,255,0.8)" }} />
                  <h3 className="font-black text-sm" style={{ color: "#FFFFFF" }}>
                    2026 근로소득세 계산 과정 (누진세 합산 방식)
                  </h3>
                </div>

                <div style={{ backgroundColor: "#FFFFFF" }}>
                  {[
                    { step: "①", label: "연봉 + 성과급 합계",    value: fmt(r.totalIncome) + "원",      sub: "총 근로소득" },
                    { step: "②", label: "근로소득공제",           value: "-" + fmt(r.empDeductNew) + "원", sub: "소득 규모별 체감 공제" },
                    { step: "③", label: "기본 인적공제",          value: "-" + fmt(r.basicDeduct) + "원",  sub: `본인+${hasSpouse ? "배우자+" : ""}부양가족 ${dependents}명` },
                    { step: "④", label: "과세표준",                value: fmt(r.taxableNew) + "원",         sub: "세율이 적용되는 금액" },
                    { step: "⑤", label: "산출세액",                value: fmt(r.grossTaxNew) + "원",        sub: "누진세율 적용" },
                    { step: "⑥", label: "근로소득세액공제",        value: "-" + fmt(r.creditNew) + "원",    sub: "총급여 구간별 한도 적용" },
                    { step: "⑦", label: "결정세액 (합산 후)",      value: fmt(r.taxAfterBonus) + "원",      sub: "실납부 소득세" },
                    { step: "⑧", label: "성과급 귀속 소득세",      value: fmt(r.bonusIncomeTax) + "원",     sub: "합산전후 세액 차이" },
                    { step: "⑨", label: "지방소득세 (×10%)",       value: fmt(r.localTax) + "원",           sub: "주민세" },
                    { step: "⑩", label: "한계세율 구간",            value: r.marginalRate + "%",             sub: "성과급 가산 구간 최고 세율" },
                  ].map((row, i) => (
                    <div
                      key={row.step}
                      className="flex justify-between items-start px-6 py-4"
                      style={{ borderBottom: i < 9 ? "1px solid #EDF1F5" : "none" }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: "#0145F21A", color: "#0145F2" }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold" style={{ color: "#0A1829" }}>{row.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#7A9AB5" }}>{row.sub}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black tabular-nums" style={{ color: "#3D5E78" }}>{row.value}</p>
                    </div>
                  ))}
                </div>

                {/* 면책 */}
                <div className="px-6 py-4 flex gap-3" style={{ backgroundColor: "#F8FAFB", borderTop: "1px solid #DDE4EC" }}>
                  <Info size={14} style={{ color: "#0145F2", flexShrink: 0, marginTop: "2px" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#7A9AB5" }}>
                    본 계산기는 <strong style={{ color: "#0A1829" }}>2026년 소득세법 기준</strong>으로,
                    누진세 합산 방식(연간 정산)으로 산출됩니다. 실제 원천징수는 월 지급 시점의
                    간이세액표를 적용하므로 차이가 있을 수 있으며, 연말정산에서 정산됩니다.
                    국민연금 상한액(월 617만원)은 연봉 기준으로 적용되어 이미 상한을 초과하면
                    성과급에 추가 국민연금이 부과되지 않습니다.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 절세 팁 카드 ── */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} style={{ color: "#0145F2" }} />
            <h3 className="font-black text-sm" style={{ color: "#0A1829" }}>
              성과급 세금 줄이는 꿀팁
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { title: "IRP 추가 납입",     desc: "연 900만원 한도로 세액공제 최대 16.5% = 최대 148.5만원 절세" },
              { title: "연금저축 납입",      desc: "연 600만원 한도, IRP 포함 900만원까지 공제. 소득에 따라 13.2~16.5% 공제" },
              { title: "의료비·교육비 공제", desc: "연말정산 시 성과급으로 인한 세 부담을 의료비 공제로 상쇄 가능" },
              { title: "주택청약 납입",      desc: "소득공제 연 최대 300만원 (납입액 40% 공제), 급여 7천만원 이하 적용" },
            ].map((tip) => (
              <div key={tip.title} className="flex gap-3">
                <Zap size={14} style={{ color: "#0145F2", flexShrink: 0, marginTop: "3px" }} />
                <div>
                  <span className="text-sm font-black" style={{ color: "#0A1829" }}>{tip.title}</span>
                  <span className="text-sm ml-1" style={{ color: "#3D5E78" }}>— {tip.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 성과급 비교하기 ── */}
        <BonusComparison baseResult={r} baseSalary={salary} baseBonus={bonus} />

        {/* ── 성과급 용어사전 ── */}
        <BonusGlossary />

      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 성과급 비교 컴포넌트
// ─────────────────────────────────────────────────────────────────────────────

const COMPARE_PRESETS = [
  {
    group: "직급별",
    items: [
      { label: "사원",  salary: 32_000_000,  bonus: 2_000_000  },
      { label: "대리",  salary: 42_000_000,  bonus: 4_000_000  },
      { label: "과장",  salary: 56_000_000,  bonus: 8_000_000  },
      { label: "차장",  salary: 72_000_000,  bonus: 12_000_000 },
      { label: "부장",  salary: 92_000_000,  bonus: 18_000_000 },
      { label: "임원",  salary: 150_000_000, bonus: 40_000_000 },
    ],
  },
  {
    group: "업종별",
    items: [
      { label: "스타트업", salary: 50_000_000,  bonus: 5_000_000  },
      { label: "중견기업", salary: 55_000_000,  bonus: 8_000_000  },
      { label: "대기업",   salary: 72_000_000,  bonus: 15_000_000 },
      { label: "금융권",   salary: 80_000_000,  bonus: 25_000_000 },
      { label: "IT/테크",  salary: 85_000_000,  bonus: 20_000_000 },
      { label: "외국계",   salary: 90_000_000,  bonus: 30_000_000 },
    ],
  },
  {
    group: "비율별",
    items: [
      { label: "연봉 10%",  salary: 60_000_000, bonus: 6_000_000  },
      { label: "연봉 25%",  salary: 60_000_000, bonus: 15_000_000 },
      { label: "연봉 50%",  salary: 60_000_000, bonus: 30_000_000 },
      { label: "연봉 100%", salary: 60_000_000, bonus: 60_000_000 },
      { label: "연봉 150%", salary: 60_000_000, bonus: 90_000_000 },
      { label: "연봉 200%", salary: 60_000_000, bonus: 120_000_000 },
    ],
  },
];

function BonusComparison({
  baseResult,
  baseSalary,
  baseBonus,
}: {
  baseResult: CalcResult;
  baseSalary: number;
  baseBonus: number;
}) {
  const [activeGroup, setActiveGroup] = useState(0);
  const group = COMPARE_PRESETS[activeGroup];

  const rows = group.items.map((item) => {
    const res = calculate(item.salary, item.bonus, 0, false);
    const isBase = item.salary === baseSalary && item.bonus === baseBonus;
    return { ...item, res, isBase };
  });

  const maxNet = Math.max(...rows.map((row) => row.res.netBonus), 1);

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0145F21A" }}>
          <BarChart3 size={16} style={{ color: "#0145F2" }} />
        </div>
        <div>
          <h2 className="font-black text-lg" style={{ color: "#0A1829", letterSpacing: "-0.03em" }}>성과급 비교하기</h2>
          <p className="text-xs" style={{ color: "#7A9AB5" }}>직급·업종·비율별 실수령액 한눈에 비교</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ backgroundColor: "#EDF1F5" }}>
        {COMPARE_PRESETS.map((g, i) => (
          <button
            key={g.group}
            onClick={() => setActiveGroup(i)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              backgroundColor: activeGroup === i ? "#0145F2" : "transparent",
              color: activeGroup === i ? "#FFFFFF" : "#7A9AB5",
              boxShadow: activeGroup === i ? "0 2px 8px #0145F230" : "none",
            }}
          >{g.group}</button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #DDE4EC", backgroundColor: "#FFFFFF" }}>
        {/* 헤더 */}
        <div className="grid grid-cols-12 gap-1 px-4 py-3 text-xs font-black uppercase tracking-widest" style={{ backgroundColor: "#0145F2", color: "rgba(255,255,255,0.75)" }}>
          <div className="col-span-2">구분</div>
          <div className="col-span-3 text-right">세전 성과급</div>
          <div className="col-span-2 text-right">세금</div>
          <div className="col-span-3 text-right">실수령</div>
          <div className="col-span-2 text-right">세율</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeGroup} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {rows.map((row, i) => {
              const barPct = (row.res.netBonus / maxNet) * 100;
              const isTop = row.res.netBonus === Math.max(...rows.map((r) => r.res.netBonus));
              return (
                <div key={row.label} style={{ borderBottom: i < rows.length - 1 ? "1px solid #EDF1F5" : "none", backgroundColor: row.isBase ? "#0145F208" : "transparent" }}>
                  <div className="grid grid-cols-12 gap-1 px-4 py-3.5 items-center">
                    <div className="col-span-2 flex items-center gap-1">
                      <span className="text-xs font-black" style={{ color: "#0A1829" }}>{row.label}</span>
                      {row.isBase && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#0145F2", color: "#FFF" }}>나</span>}
                      {isTop && !row.isBase && <span className="text-[11px]">🏆</span>}
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="text-xs font-bold tabular-nums" style={{ color: "#7A9AB5" }}>{toEok(row.bonus)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-bold tabular-nums" style={{ color: "#E63B5A" }}>-{toEok(row.res.totalDeduction)}</span>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="text-xs font-black tabular-nums" style={{ color: "#0145F2" }}>{toEok(row.res.netBonus)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: row.res.effectiveRate >= 30 ? "#FEE2E2" : "#EDF1F5", color: row.res.effectiveRate >= 30 ? "#E63B5A" : "#3D5E78" }}>
                        {row.res.effectiveRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* 막대 */}
                  <div className="px-4 pb-2">
                    <div className="w-full rounded-full overflow-hidden" style={{ height: "4px", backgroundColor: "#EDF1F5" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ duration: 0.45, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: row.isBase ? "#0145F2" : isTop ? "#10B981" : "#C0D0E8" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* 내 결과 고정 */}
        <div className="grid grid-cols-12 gap-1 px-4 py-3.5 items-center" style={{ backgroundColor: "#0145F2", borderTop: "2px solid #0145F2" }}>
          <div className="col-span-2"><span className="text-xs font-black" style={{ color: "#FFFFFF" }}>내 성과급</span></div>
          <div className="col-span-3 text-right"><span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.7)" }}>{toEok(baseBonus)}</span></div>
          <div className="col-span-2 text-right"><span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.8)" }}>-{toEok(baseResult.totalDeduction)}</span></div>
          <div className="col-span-3 text-right"><span className="text-xs font-black tabular-nums" style={{ color: "#FFFFFF" }}>{toEok(baseResult.netBonus)}</span></div>
          <div className="col-span-2 text-right"><span className="text-xs font-black" style={{ color: "#FFFFFF" }}>{baseResult.effectiveRate.toFixed(1)}%</span></div>
        </div>
      </div>

      {/* 인사이트 */}
      <div className="mt-3 rounded-xl px-4 py-3 flex gap-2 items-start" style={{ backgroundColor: "#0145F20D", border: "1px solid #0145F220" }}>
        <Sparkles size={13} style={{ color: "#0145F2", flexShrink: 0, marginTop: "2px" }} />
        <p className="text-xs leading-relaxed" style={{ color: "#3D5E78" }}>
          <strong style={{ color: "#0145F2" }}>세율 구간 주의:</strong>{" "}
          연봉 + 성과급 합계가 <strong>{fmt(88_000_000)}원</strong>을 넘으면 한계세율이 <strong style={{ color: "#E63B5A" }}>24% → 35%</strong>로 올라갑니다.
          IRP·연금저축으로 과세표준을 낮추면 구간 진입을 피할 수 있습니다.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 성과급 용어사전
// ─────────────────────────────────────────────────────────────────────────────

const GLOSSARY_TERMS = [
  { term: "성과급 (Performance Bonus)",   emoji: "🎯", def: "개인·팀·회사의 목표 달성도에 따라 기본급 외 추가 지급되는 변동 급여. 취업규칙·근로계약서에 명시된 경우 지급 의무가 생깁니다.", tip: "근로계약서에 지급 기준이 명시되면 회사가 임의 삭감 불가. 계약 시 반드시 확인하세요." },
  { term: "인센티브 (Incentive)",          emoji: "💡", def: "목표 달성을 독려하기 위한 변동 보상. 영업직 실적 비례 보상을 자주 가리키며, 근로소득으로 분류되어 누진세 적용을 받습니다.", tip: "인센티브가 클수록 연 세금이 급증합니다. 연말 IRP 납입으로 환급을 극대화하세요." },
  { term: "PS (이익배분제)",               emoji: "📊", def: "회사 영업이익 일부를 직원과 나누는 제도. 회사 전체 실적이 좋아야 지급됩니다. IT 대기업·외국계에서 많이 운영합니다.", tip: "PS는 매년 지급 여부가 달라지므로 생활비 계획에 고정 수입으로 반영하면 위험합니다." },
  { term: "누진세 (Progressive Tax)",      emoji: "📈", def: "소득이 많을수록 더 높은 세율이 적용되는 구조. 성과급이 클수록 합산 과세표준이 높아져 한계세율 구간이 올라갑니다. 한국은 6%~45% 8단계.", tip: "세전 1억 vs 500만원 성과급의 실효세율은 전혀 다릅니다. 반드시 합산 기준으로 계산하세요." },
  { term: "한계세율 (Marginal Rate)",       emoji: "⚠️", def: "추가 소득 1원에 적용되는 가장 높은 세율. 성과급 전체에 적용되는 게 아니라, 성과급으로 진입한 구간의 세율입니다.", tip: "한계세율 ≠ 실효세율. 성과급 전체가 35%인 게 아닙니다. 이 계산기로 정확히 확인하세요." },
  { term: "실효세율 (Effective Rate)",      emoji: "🔢", def: "실제로 낸 총세금 ÷ 성과급. 평균 세율이라고도 합니다. 한계세율보다 항상 낮습니다.", tip: "실효세율 20% = 성과급 1,000만원 중 200만원이 세금. 800만원 실수령." },
  { term: "근로소득세액공제",               emoji: "🛡️", def: "근로소득자에게만 주어지는 세액공제. 산출세액의 55%(130만원 이하) 또는 30%(초과분)를 차감. 총급여 기준으로 한도 50~74만원 적용.", tip: "성과급으로 총급여가 1.2억을 초과하면 세액공제 한도가 50만원으로 줄어 부담이 더 늘어납니다." },
  { term: "원천징수 vs 연말정산",           emoji: "💸", def: "회사는 성과급 지급 시 간이세액표 기준으로 미리 세금을 공제합니다. 확정 세액은 다음해 2월 연말정산에서 계산, 차액 환급·추납합니다.", tip: "연말정산 전 IRP 납입으로 공제를 늘리면 환급액을 키울 수 있습니다." },
  { term: "IRP (개인형 퇴직연금)",          emoji: "🏦", def: "연 최대 900만원 납입, 납입액의 13.2~16.5% 세액공제. 성과급 수령 후 IRP에 추가 납입하면 절세 효과가 극대화됩니다.", tip: "성과급 1,000만원 수령 → IRP 900만원 납입 → 최대 148.5만원 환급 가능." },
  { term: "4대보험 (성과급 부과)",          emoji: "🔐", def: "성과급도 근로소득이므로 국민연금·건강보험·고용보험이 부과됩니다. 단, 국민연금은 월 617만원 상한이 있어 연봉이 이미 초과하면 추가 없습니다.", tip: "산재보험료는 사업주 전액 부담이므로 근로자 부담 4대보험은 3가지입니다." },
];

function BonusGlossary() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0145F21A" }}>
          <BookOpen size={16} style={{ color: "#0145F2" }} />
        </div>
        <div>
          <h2 className="font-black text-lg" style={{ color: "#0A1829", letterSpacing: "-0.03em" }}>성과급 핵심 용어사전</h2>
          <p className="text-xs" style={{ color: "#7A9AB5" }}>계산 전 반드시 알아야 할 10가지</p>
        </div>
      </div>
      <div className="space-y-2">
        {GLOSSARY_TERMS.map((g, i) => {
          const isOpen = openIdx === i;
          return (
            <motion.div key={g.term} layout className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${isOpen ? "#0145F2" : "#DDE4EC"}`, backgroundColor: "#FFFFFF" }}>
              <button onClick={() => setOpenIdx(isOpen ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-sm font-black" style={{ color: isOpen ? "#0145F2" : "#0A1829" }}>{g.term}</span>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{ backgroundColor: isOpen ? "#0145F2" : "#EDF1F5", transform: isOpen ? "rotate(180deg)" : "none" }}>
                  <ChevronDown size={14} style={{ color: isOpen ? "#FFFFFF" : "#7A9AB5" }} />
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                    <div className="px-5 pb-5" style={{ borderTop: "1px solid #EDF1F5" }}>
                      <p className="text-sm leading-relaxed mt-4 mb-3" style={{ color: "#3D5E78" }}>{g.def}</p>
                      <div className="flex gap-2 p-3 rounded-xl" style={{ backgroundColor: "#0145F20D" }}>
                        <Zap size={13} style={{ color: "#0145F2", flexShrink: 0, marginTop: "2px" }} />
                        <p className="text-xs font-medium leading-relaxed" style={{ color: "#0145F2" }}><strong>TIP.</strong> {g.tip}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
