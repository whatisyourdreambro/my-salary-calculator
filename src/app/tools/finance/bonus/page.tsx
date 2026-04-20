"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Gift, ChevronDown, ChevronUp, Info, ArrowRight, Users,
  Share2, Copy, Check, TrendingDown, Zap, Shield,
  AlertCircle, BarChart3, Sparkles,
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
          className="rounded-2xl p-6 mb-8"
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

        {/* ── 관련 계산기 ── */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#7A9AB5" }}>
            관련 계산기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "연봉 실수령액 계산기",   href: "/" },
              { label: "퇴직금 세금 계산기",     href: "/tools/finance/severance" },
              { label: "IRP 세액공제 계산기",    href: "/tools/finance/irp" },
              { label: "연말정산 계산기",         href: "/year-end-tax" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex items-center justify-between p-4 rounded-xl transition-all group"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #DDE4EC",
                  color: "#3D5E78",
                  textDecoration: "none",
                }}
              >
                <span className="text-sm font-bold">{l.label}</span>
                <ArrowRight size={14} style={{ color: "#0145F2" }} />
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
