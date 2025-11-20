// src/components/SalaryCalculator.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculateNetSalary } from "@/lib/calculator";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import { Share2, Copy, CheckCircle } from "lucide-react";
import type {
  StoredSalaryData,
  StoredFinancialData,
  AdvancedSettings,
} from "@/app/types";
import SalaryAnalysis from "./SalaryAnalysis";
import DetailedAnalysis from "./DetailedAnalysis";
import NumberStepper from "./NumberStepper";
import SalaryPieChart from "./SalaryPieChart";
import LoadingInterstitial from "./LoadingInterstitial";
import AdUnit from "./AdUnit";
import BottomSheet from "./BottomSheet";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type CalculationResult = ReturnType<typeof calculateNetSalary>;
type IncomeType = "regular" | "freelancer" | "part_time";

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
        // Don't auto-calculate or show result on load to force interaction
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

  // Phase 1: Contextual Keyword Logic
  const incomeContext = useMemo(() => {
    if (annualSalary >= 80000000) return "high_net_worth";
    if (annualSalary <= 35000000) return "entry_level";
    return "mid_level";
  }, [annualSalary]);

  const runCalculation = useCallback(() => {
    const salary = parseNumber(salaryInput);
    if (incomeType === "regular") {
      const nonTaxable = parseNumber(nonTaxableAmount) * 12;
      setResult(
        calculateNetSalary(
          annualSalary,
          nonTaxable,
          dependents,
          children,
          advancedSettings
        )
      );
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
    }
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

  useEffect(() => {
    // This useEffect will now only run when runCalculation changes,
    // but the actual calculation is triggered by handleCalculateClick
    // and the result display by handleInterstitialClose.
    // We can remove this useEffect if we only want calculation on button click.
    // For now, keeping it as it was, but the display logic is changed.
    // runCalculation(); // Removed to prevent auto-calculation on mount/dependency change
  }, [runCalculation]);

  const handleCalculateClick = () => {
    setIsCalculating(true);
    // Calculation happens immediately but result is hidden by interstitial
    runCalculation();
  };

  const handleInterstitialClose = () => {
    setIsCalculating(false);
    setShowResult(true);

    // Scroll to result
    setTimeout(() => {
      const resultElement = document.getElementById("calculation-result");
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

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
    if (incomeType !== "regular") {
      alert("정규직 소득만 공유할 수 있습니다.");
      return;
    }
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
      alert("결과 공유 링크가 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("Sharing failed:", error);
      alert("공유 링크 복사에 실패했습니다.");
    }
  };

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(result.monthlyNet.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy result", err);
    }
  };

  const handleReset = () => {
    setIncomeType("regular");
    setPayBasis("annual");
    setSeveranceType("separate");
    setSalaryInput("50,000,000");
    setNonTaxableAmount("200000");
    setDependents(1);
    setChildren(0);
    setMonthlyExpenses("");
    setAdvancedSettings({
      isSmeYouth: false,
      disabledDependents: 0,
      seniorDependents: 0,
    });
    setShowResult(false);
    localStorage.removeItem("moneysalary-user-input");
  };

  // Phase 3: Bottom Sheet State
  const [activeSheet, setActiveSheet] = useState<"dependents" | "children" | "nonTaxable" | null>(null);

  return (
    <div className="space-y-8 mt-4 relative">
      <LoadingInterstitial isOpen={isCalculating} onClose={handleInterstitialClose} />

      {/* Phase 3: Mobile Bottom Sheets */}
      <BottomSheet
        isOpen={activeSheet === "dependents"}
        onClose={() => setActiveSheet(null)}
        title="부양 가족 수 (본인포함)"
      >
        <div className="p-4">
          <NumberStepper
            label=""
            value={dependents}
            onValueChange={(v) => setDependents(v)}
            min={1}
            unit="명"
          />
          <button
            onClick={() => setActiveSheet(null)}
            className="w-full mt-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl"
          >
            확인
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === "children"}
        onClose={() => setActiveSheet(null)}
        title="20세 이하 자녀 수"
      >
        <div className="p-4">
          <NumberStepper
            label=""
            value={children}
            onValueChange={(v) => setChildren(v)}
            min={0}
            unit="명"
          />
          <button
            onClick={() => setActiveSheet(null)}
            className="w-full mt-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl"
          >
            확인
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === "nonTaxable"}
        onClose={() => setActiveSheet(null)}
        title="비과세액 (월 기준)"
      >
        <div className="p-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={nonTaxableAmount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setNonTaxableAmount(v ? formatNumber(Number(v)) : "0");
              }}
              className="w-full p-4 text-lg bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition text-right pr-12"
              autoFocus
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-muted-foreground">원</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[100000, 200000].map((amt) => (
              <button
                key={amt}
                onClick={() => setNonTaxableAmount(formatNumber(amt))}
                className="px-4 py-2 bg-secondary rounded-full text-sm whitespace-nowrap"
              >
                {formatNumber(amt)}원
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveSheet(null)}
            className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl"
          >
            확인
          </button>
        </div>
      </BottomSheet>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-bold border-b border-border pb-4 mb-4">소득 정보</h2>

            {/* Income Type Switcher */}
            <div className="flex flex-col sm:flex-row bg-secondary rounded-lg p-1 mb-4">
              <button
                onClick={() => setIncomeType("regular")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all active:scale-95 ${incomeType === "regular"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:bg-secondary/60"
                  }`}
              >
                정규직
              </button>
              <button
                onClick={() => setIncomeType("freelancer")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all active:scale-95 ${incomeType === "freelancer"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:bg-secondary/60"
                  }`}
              >
                프리랜서(3.3%)
              </button>
              <button
                onClick={() => setIncomeType("part_time")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all active:scale-95 ${incomeType === "part_time"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:bg-secondary/60"
                  }`}
              >
                아르바이트
              </button>
            </div>

            {incomeType === "regular" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    급여 기준
                  </label>
                  <div className="flex bg-secondary rounded-lg p-1">
                    <button
                      onClick={() => setPayBasis("annual")}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all active:scale-95 ${payBasis === "annual"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-secondary/60"
                        }`}
                    >
                      연봉
                    </button>
                    <button
                      onClick={() => setPayBasis("monthly")}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all active:scale-95 ${payBasis === "monthly"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-secondary/60"
                        }`}
                    >
                      월급
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    퇴직금
                  </label>
                  <div className="flex bg-secondary rounded-lg p-1">
                    <button
                      onClick={() => setSeveranceType("separate")}
                      disabled={payBasis === "monthly"}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${severanceType === "separate"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-secondary/60"
                        }`}
                    >
                      별도
                    </button>
                    <button
                      onClick={() => setSeveranceType("included")}
                      disabled={payBasis === "monthly"}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${severanceType === "included"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-secondary/60"
                        }`}
                    >
                      포함
                    </button>
                  </div>
                </div>
              </div>
            )}
            <CurrencyInput
              label={
                incomeType === "regular"
                  ? payBasis === "annual"
                    ? "연봉"
                    : "월급"
                  : "월 소득"
              }
              value={salaryInput}
              onValueChange={setSalaryInput}
              quickAmounts={[10000000, 100000, 100000]}
            />
            {incomeType === "regular" && (
              <>
                <div className="mt-6 pt-6 border-t border-border">
                  <h2 className="text-xl font-bold">상세 설정</h2>

                  {/* Desktop View: Grid */}
                  <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <NumberStepper label="부양 가족 수 (본인포함)" value={dependents} onValueChange={(v) => setDependents(v)} min={1} unit="명" />
                    <NumberStepper label="20세 이하 자녀 수" value={children} onValueChange={(v) => setChildren(v)} min={0} unit="명" />
                    <NumberStepper label="70세 이상 (경로우대)" value={advancedSettings.seniorDependents} onValueChange={handleSeniorDependentsChange} min={0} unit="명" />
                    <NumberStepper label="장애인" value={advancedSettings.disabledDependents} onValueChange={handleDisabledDependentsChange} min={0} unit="명" />
                  </div>

                  {/* Mobile View: Bottom Sheet Triggers */}
                  <div className="sm:hidden space-y-4 mt-4">
                    <button
                      onClick={() => setActiveSheet("dependents")}
                      className="w-full flex justify-between items-center p-4 bg-secondary/30 rounded-xl border border-border active:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium">부양 가족 수</span>
                      <span className="font-bold text-primary">{dependents}명</span>
                    </button>
                    <button
                      onClick={() => setActiveSheet("children")}
                      className="w-full flex justify-between items-center p-4 bg-secondary/30 rounded-xl border border-border active:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium">20세 이하 자녀</span>
                      <span className="font-bold text-primary">{children}명</span>
                    </button>
                    <button
                      onClick={() => setActiveSheet("nonTaxable")}
                      className="w-full flex justify-between items-center p-4 bg-secondary/30 rounded-xl border border-border active:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium">비과세액</span>
                      <span className="font-bold text-primary">{nonTaxableAmount}원</span>
                    </button>
                  </div>

                  <div className="mt-4 hidden sm:block">
                    <label className="text-sm font-medium text-muted-foreground">비과세액 (월 기준)</label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        value={nonTaxableAmount}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "");
                          setNonTaxableAmount(v ? formatNumber(Number(v)) : "0");
                        }}
                        className="w-full p-3 pr-12 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-muted-foreground">원</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isSmeYouth"
                        checked={advancedSettings.isSmeYouth}
                        onChange={(e) => setAdvancedSettings((prev) => ({ ...prev, isSmeYouth: e.target.checked }))}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label htmlFor="isSmeYouth" className="ml-2 block text-sm text-foreground">
                        중소기업 취업 청년 소득세 감면 대상
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <CurrencyInput
                      label="월평균 고정 지출 (주거비, 통신비 등)"
                      value={monthlyExpenses}
                      onValueChange={setMonthlyExpenses}
                      quickAmounts={[500000, 100000, 50000]}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Calculate Button */}
            <div className="mt-6">
              <button
                onClick={handleCalculateClick}
                className="w-full py-4 bg-gradient-to-r from-primary to-emerald-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
              >
                실수령액 계산하기
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-2">
          {showResult && (
            <div id="calculation-result" className="sticky top-24 space-y-6 animate-fade-in-up">
              <div className="bg-card p-4 sm:p-6 rounded-xl shadow-lg border border-border">
                <h2 className="text-base sm:text-lg font-bold mb-2 text-muted-foreground">월 예상 실수령액</h2>
                <div className="flex items-center gap-2">
                  <p className="text-3xl sm:text-4xl font-bold my-1 text-primary">
                    <CountUp end={result.monthlyNet} duration={0.5} separator="," /> 원
                  </p>
                  <button
                    onClick={handleCopyResult}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                    title="실수령액 복사"
                  >
                    {copied ? <CheckCircle className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
                  </button>
                </div>
                <p className="font-semibold text-sm text-destructive mt-2">
                  (공제액 합계: - <CountUp end={result.totalDeduction} duration={0.5} separator="," /> 원)
                </p>
              </div>

              {/* Phase 1: High-Attention Native Ad Injection */}
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded">AD</span>
                  <span className="text-xs text-muted-foreground">맞춤형 금융 상품 추천</span>
                </div>
                <AdUnit
                  slotId="5492837410" // Placeholder for Native Ad
                  format="fluid"
                  layoutKey="-fb+5w+4e-db+86" // Example layout key for native feed
                  className="w-full min-h-[120px] bg-card/50 rounded-xl border border-border shadow-sm"
                  label="Native Result Ad"
                />
              </div>

              {/* Visual Chart */}
              <SalaryPieChart netPay={result.monthlyNet} totalDeduction={result.totalDeduction} />

              <div className="pt-2 grid grid-cols-3 gap-2">
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  초기화
                </button>
                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={incomeType !== "regular"}
                >
                  <Share2 size={16} /> 공유
                </button>
                <button
                  onClick={handleSaveData}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-95 transition-all disabled:opacity-50"
                  disabled={incomeType !== "regular"}
                >
                  저장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase 1: Contextual Keyword Injection (Hidden for SEO/Ad Targeting) */}
      {showResult && annualSalary > 0 && (
        <div className="mt-8 opacity-0 h-0 overflow-hidden">
          {incomeContext === "high_net_worth" && (
            <div>
              <h3>VIP 자산 관리 및 절세 전략</h3>
              <p>고소득 전문직을 위한 프라이빗 뱅킹, 부동산 투자, 법인 전환 컨설팅, 프리미엄 신용카드 추천.</p>
            </div>
          )}
          {incomeContext === "entry_level" && (
            <div>
              <h3>청년 금융 지원 및 신용 관리</h3>
              <p>청년 도약 계좌, 중소기업 취업 청년 소득세 감면, 학자금 대출 상환, 신용 점수 올리기, 소액 투자.</p>
            </div>
          )}
          {incomeContext === "mid_level" && (
            <div>
              <h3>직장인 재테크 및 연말정산</h3>
              <p>IRP 퇴직연금 세액공제, 신용카드 소득공제 최적화, 주택 청약 종합 저축, ISA 계좌 활용.</p>
            </div>
          )}
        </div>
      )}

      {showResult && annualSalary > 0 && incomeType === "regular" && (
        <>
          <DetailedAnalysis
            annualSalary={annualSalary}
            result={result}
            monthlyExpenses={parseNumber(monthlyExpenses)}
          />
          <SalaryAnalysis
            annualSalary={annualSalary}
            monthlyNet={result.monthlyNet}
          />
        </>
      )}
    </div>
  );
}
