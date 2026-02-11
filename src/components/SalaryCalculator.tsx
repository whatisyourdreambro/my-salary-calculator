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

const formatNumber = (num: number) => num.toLocaleString();
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
      case "happy": return "bg-pink-100 border-pink-300";
      case "shocked": return "bg-red-100 border-red-300";
      case "cool": return "bg-blue-100 border-blue-300";
      default: return "bg-yellow-100 border-yellow-300";
    }
  };

  return (
    <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl shadow-lg transition-all duration-500 transform hover:scale-110 ${getColor()}`}>
      {getEmoji()}
      {mood === "shocked" && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
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
    <div className="space-y-12 pb-20">
      <LoadingInterstitial isOpen={isCalculating} onClose={handleInterstitialClose} />

      {/* Hero / Input Section */}
      <div className="pt-12 px-6 flex flex-col items-center">
         <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">2026 Edition</span>
            <Sparkles size={14} className="text-[#FFD700]" />
         </div>
         <h1 className="text-2xl font-black text-slate-800 mb-8">얼마나 받으시나요?</h1>

         <MoneyInput 
            label={incomeType === "regular" ? (payBasis === "annual" ? "계약 연봉" : "세전 월급") : "지급 총액"}
            value={salaryInput} 
            onValueChange={setSalaryInput} 
         />

         {/* Quick Toggles */}
         <div className="w-full max-w-xs mt-8 p-1 bg-slate-100 rounded-2xl flex">
            {(["regular", "freelancer", "part_time"] as const).map((type) => (
               <button
                  key={type}
                  onClick={() => setIncomeType(type)}
                  className={cn(
                     "flex-1 py-3 rounded-xl text-xs font-black transition-all",
                     incomeType === type ? "bg-white text-[#0F4C81] shadow-lg scale-105" : "text-slate-400 hover:text-slate-600"
                  )}
               >
                  {type === "regular" ? "직장인" : type === "freelancer" ? "프리랜서" : "알바"}
               </button>
            ))}
         </div>

         {incomeType === "regular" && (
            <div className="mt-6 flex gap-4">
               <button 
                  onClick={() => setPayBasis(payBasis === "annual" ? "monthly" : "annual")}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm"
               >
                  <Calculator size={14} /> {payBasis === "annual" ? "연봉 기준" : "월급 기준"}
               </button>
               <button 
                  onClick={() => setActiveSheet("nonTaxable")}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm"
               >
                  <Zap size={14} className="text-[#FFD700]" /> 비과세 {nonTaxableAmount}원
               </button>
            </div>
         )}

         <button
            onClick={handleCalculateClick}
            className="w-full max-w-xs mt-12 py-5 bg-gradient-to-r from-[#0F4C81] to-[#0c406e] text-white text-lg font-black rounded-[2rem] shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-3"
         >
            실수령액 계산하기 <ChevronRight size={20} />
         </button>
      </div>

      {/* Result Section */}
      {showResult && (
        <div id="calculation-result" className="px-6 space-y-12 animate-fade-in-up">
          <div className="flex flex-col items-center relative">
             <div className="absolute -top-16 z-20">
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
                  localTax: result.localTax
                }}
             />
          </div>

          <WealthChart monthlyNetSalary={result.monthlyNet} />
          
          <SalaryTierCard annualSalary={annualSalary} />

          {/* Social / Actions */}
          <div className="grid grid-cols-2 gap-4">
             <button onClick={handleShare} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                <Share2 size={18} /> 결과 공유
             </button>
             <button onClick={handleSaveData} className="py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                <CheckCircle size={18} /> 저장하기
             </button>
          </div>

          <AdUnit slotId="5492837410" format="auto" />
          
          <DetailedAnalysis 
            annualSalary={annualSalary} 
            result={result} 
            monthlyExpenses={parseNumber(monthlyExpenses)} 
          />
        </div>
      )}

      {/* Bottom Sheets (Same as before but with consistent styling) */}
      <BottomSheet isOpen={activeSheet === "nonTaxable"} onClose={() => setActiveSheet(null)} title="비과세액 설정">
         <div className="p-8 space-y-6">
            <MoneyInput label="월 비과세액" value={nonTaxableAmount} onValueChange={setNonTaxableAmount} />
            <button onClick={() => setActiveSheet(null)} className="w-full py-4 bg-[#0F4C81] text-white font-black rounded-2xl">저장 후 닫기</button>
         </div>
      </BottomSheet>
    </div>
  );
}
