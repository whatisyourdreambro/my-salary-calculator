// src/components/SalaryCalculator.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import MoneyInput from "./ui/MoneyInput"; // New UI Component
import SalaryResultCard from "./SalaryResultCard"; // New UI Component
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, CheckCircle, Info, Calculator, Zap, Sparkles, ChevronRight } from "lucide-react";
import type {
  StoredSalaryData,
  StoredFinancialData,
  AdvancedSettings,
} from "@/app/types";
import SalaryAnalysis from "./SalaryAnalysis";
import DetailedAnalysis from "./DetailedAnalysis";
import NumberStepper from "./NumberStepper";
import SalaryPieChart from "./SalaryPieChart";
import WealthChart from "./WealthChart";
import SalaryTierCard from "./SalaryTierCard"; // New Import
import LoadingInterstitial from "./LoadingInterstitial";
import AdUnit from "./AdUnit";
import BottomSheet from "./BottomSheet";

const formatNumber = (num: number) => num.toLocaleString('ko-KR');
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

// Unified Result Type
type CalculationResult = {
  monthlyNet: number;
  totalDeduction: number;
  pension: number;
  health: number;
  longTermCare: number;
  employment: number;
  incomeTax: number;
  localTax: number;
};

type IncomeType = "regular" | "freelancer" | "part_time";

// --- Mung Mascot Component ---
const MungMascot = ({ mood }: { mood: "normal" | "happy" | "shocked" | "cool" }) => {
  const getEmoji = () => {
    switch (mood) {
      case "happy": return "🥰"; // Loves money
      case "shocked": return "😱"; // High tax
      case "cool": return "😎"; // High income
      default: return "🥔"; // Normal Potato Mung
    }
  };

  const getColor = () => {
    switch (mood) {
      case "happy": return "bg-slate-50 border-primary";
      case "shocked": return "bg-red-100 border-red-300";
      case "cool": return "bg-blue-100 border-blue-300";
      default: return "bg-primary/5 border-primary";
    }
  };

  return (
    <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl shadow-lg transition-all duration-500 transform hover:scale-110 ${getColor()}`}>
      {getEmoji()}
      {mood === "shocked" && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
          세금?!
        </div>
      )}
      {mood === "cool" && (
        <div className="absolute -bottom-2 -left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          FLEX
        </div>
      )}
    </div>
  );
};

export default function SalaryCalculator() {
  const router = useRouter();
  const [incomeType, setIncomeType] = useState<IncomeType>("regular");
  const [payBasis, setPayBasis] = useState<"annual" | "monthly">("annual");
  const [severanceType, setSeveranceType] = useState<"separate" | "included">("separate");
  const [salaryInput, setSalaryInput] = useState("50,000,000");
  const [nonTaxableAmount, setNonTaxableAmount] = useState("200000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [copied, setCopied] = useState(false);

  // Phase 1: Interstitial State
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  const [result, setResult] = useState<CalculationResult>({
    monthlyNet: 0,
    totalDeduction: 0,
    pension: 0,
    health: 0,
    longTermCare: 0,
    employment: 0,
    incomeTax: 0,
    localTax: 0,
  });

  // Mung's Mood State
  const [mungMood, setMungMood] = useState<"normal" | "happy" | "shocked" | "cool">("normal");

  // Load from Local Storage on Mount
  useEffect(() => {
    const saved = localStorage.getItem("moneysalary-user-input");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.salaryInput) setSalaryInput(parsed.salaryInput);
        if (parsed.incomeType) setIncomeType(parsed.incomeType);
        if (parsed.payBasis) setPayBasis(parsed.payBasis);
        if (parsed.dependents) setDependents(parsed.dependents);
        if (parsed.children) setChildren(parsed.children);
        if (parsed.nonTaxableAmount) setNonTaxableAmount(parsed.nonTaxableAmount);
      } catch (e) {
        console.error("Failed to load saved inputs", e);
      }
    }
  }, []);

  // Save to Local Storage - DEBOUNCED to prevent constant write/re-render cycles
  useEffect(() => {
    const timer = setTimeout(() => {
      const dataToSave = {
        salaryInput,
        incomeType,
        payBasis,
        dependents,
        children,
        nonTaxableAmount,
      };
      localStorage.setItem("moneysalary-user-input", JSON.stringify(dataToSave));
    }, 1000); // 1 second debounce
    return () => clearTimeout(timer);
  }, [salaryInput, incomeType, payBasis, dependents, children, nonTaxableAmount]);

  const annualSalary = useMemo(() => {
    const salary = parseNumber(salaryInput);
    if (incomeType !== "regular") return salary;

    let annual = payBasis === "annual" ? salary : salary * 12;
    if (severanceType === "included" && annual > 0) {
      annual = (annual / 13) * 12;
    }
    return annual;
  }, [salaryInput, payBasis, severanceType, incomeType]);

  // Pure Calculation Function (No side effects)
  const runCalculation = useCallback(() => {
    const salary = parseNumber(salaryInput);
    let newMood: "normal" | "happy" | "shocked" | "cool" = "normal";

    if (incomeType === "regular") {
      const taxResult = calculateSalary2026(annualSalary, parseNumber(nonTaxableAmount), dependents, children);
      const deductionRate = taxResult.totalDeductions / (annualSalary / 12);

      if (annualSalary >= 100_000_000) newMood = "cool";
      else if (deductionRate > 0.2) newMood = "shocked";
      else if (taxResult.netPay > 3_000_000) newMood = "happy";

      setResult({
        monthlyNet: taxResult.netPay,
        totalDeduction: taxResult.totalDeductions,
        pension: taxResult.nationalPension,
        health: taxResult.healthInsurance,
        longTermCare: taxResult.longTermCare,
        employment: taxResult.employmentInsurance,
        incomeTax: taxResult.incomeTax,
        localTax: taxResult.localIncomeTax,
      });
    } else {
      const partTimeResult = calculatePartTimeSalary(salary, incomeType);
      setResult({
        monthlyNet: partTimeResult.netPay,
        totalDeduction: partTimeResult.totalDeduction,
        pension: partTimeResult.nationalPension,
        health: partTimeResult.healthInsurance,
        longTermCare: 0,
        employment: partTimeResult.employmentInsurance,
        incomeTax: partTimeResult.incomeTax,
        localTax: partTimeResult.localTax,
      });
      if (partTimeResult.netPay > 2000000) newMood = "happy";
    }
    setMungMood(newMood);
  }, [annualSalary, nonTaxableAmount, dependents, children, incomeType, salaryInput]);

  // Analytics - Only fire once per actual result display
  useEffect(() => {
    if (showResult && result.monthlyNet > 0 && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "conversion", {
        send_to: `${process.env.NEXT_PUBLIC_ADS_ID}/${process.env.NEXT_PUBLIC_CONVERSION_LABEL_CALCULATION}`,
      });
    }
  }, [showResult]); // Trigger only when the result card is actually shown to the user

  const handleCalculateClick = () => {
    setIsCalculating(true);
    runCalculation();
  };

  const handleInterstitialClose = () => {
    setIsCalculating(false);
    setShowResult(true);

    setTimeout(() => {
      const resultElement = document.getElementById("calculation-result");
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: "smooth", block: "center" });
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#0F4C81', '#FFD700', '#f59e0b'], // Trust Blue & Gold
          zIndex: 9999,
        });
      }
    }, 100);
  };

  // ... (Handlers for Seniors/Disabled omitted for brevity but logic remains in state if needed for future extension, keeping UI cleaner for now as per design)
  // Re-adding essential handlers if specific inputs are exposed
  const handleSeniorDependentsChange = (newValue: number) => {
    if (newValue < 0) return;
    if (newValue + advancedSettings.disabledDependents <= dependents) {
      setAdvancedSettings(prev => ({ ...prev, seniorDependents: newValue }));
    }
  };

  const handleDisabledDependentsChange = (newValue: number) => {
    if (newValue < 0) return;
    if (newValue + advancedSettings.seniorDependents <= dependents) {
      setAdvancedSettings(prev => ({ ...prev, disabledDependents: newValue }));
    }
  };

  const handleSaveData = () => {
    if (incomeType !== "regular") {
      alert("정규직 소득만 대시보드에 저장할 수 있습니다.");
      return;
    }
    try {
      const existingDataJSON = localStorage.getItem("moneysalary-financial-data");
      const existingData: StoredFinancialData = existingDataJSON
        ? JSON.parse(existingDataJSON)
        : { lastUpdated: new Date().toISOString() };
      const salaryDataToStore: StoredSalaryData = {
        annualSalary,
        monthlyNet: result.monthlyNet,
        payBasis,
        severanceType,
        nonTaxableAmount: parseNumber(nonTaxableAmount),
        dependents,
        children,
        monthlyExpenses: parseNumber(monthlyExpenses),
      };
      const updatedData: StoredFinancialData = {
        ...existingData,
        salary: salaryDataToStore,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem("moneysalary-financial-data", JSON.stringify(updatedData));
      alert("연봉 정보가 대시보드에 저장되었습니다!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    const dataToShare = {
      annualSalary,
      nonTaxableAmount: parseNumber(nonTaxableAmount),
      dependents,
      children,
    };
    const encodedData = btoa(JSON.stringify(dataToShare));
    const shareUrl = `${window.location.origin}/share/${encodedData}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 복사되었습니다!");
    } catch (error) {
      console.error("Sharing failed", error);
    }
  };

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(result.monthlyNet.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleReset = () => {
    setIncomeType("regular");
    setPayBasis("annual");
    setSalaryInput("50,000,000");
    setShowResult(false);
    setMungMood("normal");
    localStorage.removeItem("moneysalary-user-input");
  };

  const [activeSheet, setActiveSheet] = useState<"dependents" | "children" | "nonTaxable" | null>(null);

  return (
    <div className="w-full space-y-6">
      <LoadingInterstitial isOpen={isCalculating} onClose={handleInterstitialClose} />

      {/* ── Row 1: 입력 + 실수령 결과 나란히 ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* 왼쪽: 입력 패널 */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-full">2026 세법 적용</span>
              <Sparkles size={14} className="text-primary" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">얼마나 받으시나요?</h2>
          </div>

          <MoneyInput
            label={incomeType === "regular" ? (payBasis === "annual" ? "계약 연봉" : "세전 월급") : "지급 총액"}
            value={salaryInput}
            onValueChange={setSalaryInput}
          />

          {/* 직장인/프리랜서/알바 탭 */}
          <div className="p-1 bg-slate-100 rounded-2xl flex">
            {(["regular", "freelancer", "part_time"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setIncomeType(type)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                  incomeType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {type === "regular" ? "직장인" : type === "freelancer" ? "프리랜서" : "알바"}
              </button>
            ))}
          </div>

          {incomeType === "regular" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPayBasis(payBasis === "annual" ? "monthly" : "annual")}
                  className="flex items-center justify-center gap-1.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-primary hover:text-primary transition-all"
                >
                  <Calculator size={15} className="text-slate-400" />
                  {payBasis === "annual" ? "연봉 기준" : "월급 기준"}
                </button>
                <button
                  onClick={() => setActiveSheet("nonTaxable")}
                  className="flex items-center justify-center gap-1.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-primary hover:text-primary transition-all"
                >
                  <Zap size={15} className="text-primary" />
                  비과세 {formatNumber(parseNumber(nonTaxableAmount))}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">부양가족 수 (본인 포함)</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDependents(Math.max(1, dependents - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 transition-colors">−</button>
                    <span className="font-bold text-slate-900 text-base w-6 text-center">{dependents}</span>
                    <button onClick={() => setDependents(Math.min(10, dependents + 1))} className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">8세~20세 자녀</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 transition-colors">−</button>
                    <span className="font-bold text-slate-900 text-base w-6 text-center">{children}</span>
                    <button onClick={() => setChildren(Math.min(10, children + 1))} className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleCalculateClick}
            className="w-full h-13 py-3.5 bg-primary rounded-2xl text-base font-black hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Zap size={18} className="text-white" />
            <span className="text-white">결과 확인하기</span>
          </button>
        </div>

        {/* 오른쪽: 실수령액 결과 */}
        <div>
          {!showResult ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center min-h-[280px] text-center gap-4">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-4xl">🥔</div>
              <div>
                <p className="font-bold text-slate-700 mb-1">연봉을 입력하세요</p>
                <p className="text-slate-400 text-sm">결과 확인하기를 누르면<br/>실수령액이 바로 계산됩니다</p>
              </div>
            </div>
          ) : (
            <motion.div
              id="calculation-result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              {/* 마스코트 + 결과 카드 */}
              <div className="relative pt-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                  <MungMascot mood={mungMood} />
                </div>
                <SalaryResultCard
                  monthlyNet={result.monthlyNet}
                  totalDeduction={result.totalDeduction}
                  breakdown={{
                    pension: result.pension,
                    health: result.health,
                    longTermCare: result.longTermCare,
                    employment: result.employment,
                    incomeTax: result.incomeTax,
                    localTax: result.localTax,
                  }}
                />
              </div>

              {/* 공유/저장 */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleShare} className="py-3 bg-slate-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all">
                  <Share2 size={16} className="text-white" />
                  <span className="text-white">결과 공유</span>
                </button>
                <button onClick={handleSaveData} className="py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
                  <CheckCircle size={16} className="text-slate-900" />
                  <span className="text-slate-900">저장하기</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Row 2: 보조 패널 3열 (결과 있을 때만) ──────────────────── */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* 1. 연봉 티어 카드 */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <SalaryTierCard annualSalary={annualSalary} />
          </div>

          {/* 2. 자산 성장 시뮬레이션 */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block" />
              자산 성장 시뮬레이션
            </p>
            <WealthChart monthlyNetSalary={result.monthlyNet} />
          </div>

          {/* 3. 월급 상세 분석 */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-primary rounded-full inline-block" />
              월급 상세 분석
            </p>
            <DetailedAnalysis
              annualSalary={annualSalary}
              result={result}
              monthlyExpenses={parseNumber(monthlyExpenses)}
            />
          </div>
        </motion.div>
      )}

      {/* Bottom Sheet: 비과세 설정 */}
      <BottomSheet isOpen={activeSheet === "nonTaxable"} onClose={() => setActiveSheet(null)} title="비과세액 설정">
        <div className="p-8 space-y-6">
          <MoneyInput label="월 비과세액" value={nonTaxableAmount} onValueChange={setNonTaxableAmount} />
          <button onClick={() => setActiveSheet(null)} className="w-full py-4 bg-primary font-black rounded-2xl flex items-center justify-center">
            <span className="text-white">저장 후 닫기</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}