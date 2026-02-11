// src/components/SalaryCalculator.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculateSalary2026 } from "@/lib/TaxLogic"; // New 2026 Logic
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import { Share2, Copy, CheckCircle, Info } from "lucide-react";
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

  // Save to Local Storage on Change
  useEffect(() => {
    const dataToSave = {
      salaryInput,
      incomeType,
      payBasis,
      dependents,
      children,
      nonTaxableAmount,
    };
    localStorage.setItem("moneysalary-user-input", JSON.stringify(dataToSave));
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

  const runCalculation = useCallback(() => {
    const salary = parseNumber(salaryInput);
    
    // Reset mood initially
    let newMood: "normal" | "happy" | "shocked" | "cool" = "normal";

    if (incomeType === "regular") {
      const nonTaxableMonthly = parseNumber(nonTaxableAmount);
      
      // Use New 2026 Logic
      const taxResult = calculateSalary2026(
        annualSalary,
        nonTaxableMonthly,
        dependents,
        children
      );

      // Determine Mood based on logic
      const deductionRate = taxResult.totalDeductions / (annualSalary / 12);
      if (annualSalary >= 100_000_000) {
        newMood = "cool"; // High Earner
      } else if (deductionRate > 0.2) {
        newMood = "shocked"; // High Tax
      } else if (taxResult.netPay > 3_000_000) {
        newMood = "happy"; // Decent Net Pay
      }

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

  }, [
    annualSalary,
    nonTaxableAmount,
    dependents,
    children,
    advancedSettings,
    incomeType,
    salaryInput,
  ]);

  useEffect(() => {
    if (result && result.monthlyNet > 0 && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: `${process.env.NEXT_PUBLIC_ADS_ID}/${process.env.NEXT_PUBLIC_CONVERSION_LABEL_CALCULATION}`,
      });
    }
  }, [result]);

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
    <div className="space-y-8 mt-4 relative">
      <LoadingInterstitial isOpen={isCalculating} onClose={handleInterstitialClose} />

      {/* Mobile Bottom Sheets */}
      <BottomSheet isOpen={activeSheet === "dependents"} onClose={() => setActiveSheet(null)} title="부양 가족 수">
        <div className="p-4">
          <NumberStepper label="" value={dependents} onValueChange={setDependents} min={1} unit="명" />
          <button onClick={() => setActiveSheet(null)} className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-xl">확인</button>
        </div>
      </BottomSheet>
      <BottomSheet isOpen={activeSheet === "children"} onClose={() => setActiveSheet(null)} title="20세 이하 자녀 수">
        <div className="p-4">
          <NumberStepper label="" value={children} onValueChange={setChildren} min={0} unit="명" />
          <button onClick={() => setActiveSheet(null)} className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-xl">확인</button>
        </div>
      </BottomSheet>
      <BottomSheet isOpen={activeSheet === "nonTaxable"} onClose={() => setActiveSheet(null)} title="비과세액 (월 기준)">
         <div className="p-4 space-y-4">
            <CurrencyInput 
              label="" 
              value={nonTaxableAmount} 
              onValueChange={setNonTaxableAmount} 
              quickAmounts={[100000, 200000]}
            />
            <button onClick={() => setActiveSheet(null)} className="w-full mt-4 py-3 bg-primary text-white font-bold rounded-xl">확인</button>
         </div>
      </BottomSheet>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Input Card */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-xl relative overflow-hidden">
             {/* Decorative Background Element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>

            <div className="flex items-center justify-between border-b border-blue-100 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">💰</span> 급여 계산기
                </h2>
                {/* Mung Reaction Spot - Small Preview */}
                <div className="hidden sm:block">
                   <MungMascot mood={mungMood} />
                </div>
            </div>

            {/* Income Type Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              {(["regular", "freelancer", "part_time"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setIncomeType(type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    incomeType === type
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {type === "regular" ? "직장인" : type === "freelancer" ? "프리랜서" : "알바"}
                </button>
              ))}
            </div>

            {incomeType === "regular" && (
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setPayBasis("annual")} className={`px-4 py-2 rounded-lg border ${payBasis === "annual" ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "border-gray-200 text-gray-500"}`}>연봉</button>
                    <button onClick={() => setPayBasis("monthly")} className={`px-4 py-2 rounded-lg border ${payBasis === "monthly" ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "border-gray-200 text-gray-500"}`}>월급</button>
                </div>
            )}

            <CurrencyInput
              label={incomeType === "regular" ? (payBasis === "annual" ? "계약 연봉" : "세전 월급") : "지급 총액"}
              value={salaryInput}
              onValueChange={setSalaryInput}
              quickAmounts={[10000000, 1000000, 100000]}
            />

            {incomeType === "regular" && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Info size={18} className="text-blue-500"/> 상세 조건
                </h3>
                
                {/* Desktop Grid */}
                <div className="hidden sm:grid grid-cols-2 gap-4">
                    <NumberStepper label="부양가족 (본인포함)" value={dependents} onValueChange={setDependents} min={1} unit="명" />
                    <NumberStepper label="20세 이하 자녀" value={children} onValueChange={setChildren} min={0} unit="명" />
                </div>

                {/* Mobile Triggers */}
                <div className="sm:hidden grid grid-cols-2 gap-3">
                    <button onClick={() => setActiveSheet("dependents")} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
                        <div className="text-xs text-gray-500">부양가족</div>
                        <div className="font-bold text-lg">{dependents}명</div>
                    </button>
                    <button onClick={() => setActiveSheet("children")} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
                        <div className="text-xs text-gray-500">자녀</div>
                        <div className="font-bold text-lg">{children}명</div>
                    </button>
                </div>

                <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500 mb-1 block">비과세액 (식대 등)</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={nonTaxableAmount} 
                            onChange={(e) => setNonTaxableAmount(e.target.value)} // Simplified for brevity
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-right font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <span className="absolute right-12 top-3 text-gray-400">원</span>
                    </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCalculateClick}
              className="w-full mt-8 py-4 bg-gradient-to-r from-[#0F4C81] to-[#0c406e] text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              🚀 2026년 실수령액 확인하기
            </button>
          </div>
        </div>

        {/* Right: Result Card */}
        <div className="lg:col-span-2">
            {showResult ? (
                <div id="calculation-result" className="space-y-6 animate-fade-in-up">
                    <div className="bg-white p-6 rounded-2xl border-2 border-[#FFD700] shadow-2xl relative">
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                            <MungMascot mood={mungMood} />
                        </div>
                        
                        <div className="mt-8 text-center">
                            <h3 className="text-gray-500 font-medium">예상 월 실수령액</h3>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="text-4xl sm:text-5xl font-extrabold text-[#0F4C81] tracking-tight">
                                    <CountUp end={result.monthlyNet} duration={1.5} separator="," />
                                </span>
                                <span className="text-xl text-gray-600 font-bold">원</span>
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                             <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                <span>총 공제액 (세금+보험)</span>
                                <span className="font-bold text-red-500">-<CountUp end={result.totalDeduction} separator=","/>원</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                 <div 
                                    className="bg-red-400 h-2 rounded-full" 
                                    style={{ width: `${Math.min((result.totalDeduction / (annualSalary/12)) * 100, 100)}%` }}
                                 ></div>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-6">
                             <button onClick={handleCopyResult} className="py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                {copied ? <CheckCircle size={18}/> : <Copy size={18}/>} 복사
                             </button>
                             <button onClick={handleShare} className="py-3 bg-[#FFD700] text-[#381f15] font-bold rounded-xl hover:bg-[#e6c200] transition-colors flex items-center justify-center gap-2">
                                <Share2 size={18}/> 공유
                             </button>
                        </div>
                    </div>

                    {/* Ad Unit */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                        <span className="text-xs text-gray-400 block mb-2">SPONSORED</span>
                        <AdUnit slotId="5492837410" format="rectangle" />
                    </div>

                    <SalaryPieChart netPay={result.monthlyNet} totalDeduction={result.totalDeduction} />
                </div>
            ) : (
                <div className="hidden lg:flex h-full items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
                    <div>
                        <div className="text-6xl mb-4 grayscale opacity-50">🥔</div>
                        <p>좌측 정보를 입력하고<br/>버튼을 눌러주세요!</p>
                    </div>
                </div>
            )}
        </div>
      </div>
       
      {showResult && incomeType === "regular" && (
         <div className="mt-12 space-y-12 animate-fade-in-up delay-200">
            {/* Phase 2: Wealth Charting */}
            <div className="pt-8 border-t border-gray-100">
                <WealthChart monthlyNetSalary={result.monthlyNet} />
            </div>

            {/* Phase 3: Viral Tier Card */}
            <div className="pt-8 border-t border-gray-100">
                <SalaryTierCard annualSalary={annualSalary} />
            </div>

            <DetailedAnalysis 
                annualSalary={annualSalary} 
                result={result} 
                monthlyExpenses={parseNumber(monthlyExpenses)} 
            />
         </div>
      )}
    </div>
  );
}
