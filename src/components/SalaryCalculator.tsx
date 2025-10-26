// src/components/SalaryCalculator.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculateNetSalary } from "@/lib/calculator";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator"; // 함수 import 추가
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import { Share2 } from "lucide-react";
import type {
  StoredSalaryData,
  StoredFinancialData,
  AdvancedSettings,
} from "@/app/types";
import SalaryAnalysis from "./SalaryAnalysis";
import DetailedAnalysis from "./DetailedAnalysis";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type CalculationResult = ReturnType<typeof calculateNetSalary>;
type IncomeType = "regular" | "freelancer" | "part_time";

export default function SalaryCalculator() {
  const router = useRouter();
  const [incomeType, setIncomeType] = useState<IncomeType>("regular");
  const [payBasis, setPayBasis] = useState<"annual" | "monthly">("annual");
  const [severanceType, setSeveranceType] = useState<"separate" | "included">(
    "separate"
  );
  const [salaryInput, setSalaryInput] = useState("50,000,000");
  const [nonTaxableAmount, setNonTaxableAmount] = useState("200000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState("");

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
        longTermCare: 0, // 프리랜서/알바는 장기요양보험료 별도 계산 필요 (여기선 0으로 처리)
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
      console.log("Google Ads Conversion (Main Calculator) Fired!");
    }
  }, [result]);

  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  const handleDependentChange = (
    field:
      | "dependents"
      | "children"
      | "disabledDependents"
      | "seniorDependents",
    delta: number
  ) => {
    if (field === "dependents" || field === "children") {
      const currentVal = field === "dependents" ? dependents : children;
      const newVal = Math.max(
        field === "dependents" ? 1 : 0,
        currentVal + delta
      );
      if (field === "dependents") setDependents(newVal);
      else setChildren(newVal);
    } else {
      setAdvancedSettings((prev) => {
        const currentVal = prev[field];
        const newVal = Math.max(0, currentVal + delta);
        if (
          field === "disabledDependents" &&
          newVal + prev.seniorDependents > dependents
        )
          return prev;
        if (
          field === "seniorDependents" &&
          newVal + prev.disabledDependents > dependents
        )
          return prev;
        return { ...prev, [field]: newVal };
      });
    }
  };

  const handleSaveData = () => {
    if (incomeType !== "regular") {
      alert("정규직 소득만 대시보드에 저장할 수 있습니다.");
      return;
    }
    try {
      const existingDataJSON = localStorage.getItem(
        "moneysalary-financial-data"
      );
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
      localStorage.setItem(
        "moneysalary-financial-data",
        JSON.stringify(updatedData)
      );
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
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border h-full">
            <h2 className="text-lg font-bold">소득 정보</h2>
            <div className="flex bg-secondary rounded-lg p-1 my-4">
              <button
                onClick={() => setIncomeType("regular")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                  incomeType === "regular"
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                정규직
              </button>
              <button
                onClick={() => setIncomeType("freelancer")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                  incomeType === "freelancer"
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                프리랜서(3.3%)
              </button>
              <button
                onClick={() => setIncomeType("part_time")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                  incomeType === "part_time"
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                아르바이트
              </button>
            </div>

            {incomeType === "regular" && (
              <div className="grid grid-cols-2 gap-4 my-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    급여 기준
                  </label>
                  <div className="flex bg-secondary rounded-lg p-1">
                    <button
                      onClick={() => setPayBasis("annual")}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                        payBasis === "annual"
                          ? "bg-card shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      연봉
                    </button>
                    <button
                      onClick={() => setPayBasis("monthly")}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                        payBasis === "monthly"
                          ? "bg-card shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      월급
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    퇴직금
                  </label>
                  <div className="flex bg-secondary rounded-lg p-1">
                    <button
                      onClick={() => setSeveranceType("separate")}
                      disabled={payBasis === "monthly"}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                        severanceType === "separate"
                          ? "bg-card shadow-sm"
                          : "text-muted-foreground"
                      } ${
                        payBasis === "monthly"
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      별도
                    </button>
                    <button
                      onClick={() => setSeveranceType("included")}
                      disabled={payBasis === "monthly"}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                        severanceType === "included"
                          ? "bg-card shadow-sm"
                          : "text-muted-foreground"
                      } ${
                        payBasis === "monthly"
                          ? "cursor-not-allowed opacity-50"
                          : ""
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
                <div className="mt-6 pt-6 border-t">
                  <h2 className="text-lg font-bold">상세 설정</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        부양 가족 수 (본인포함)
                      </label>
                      <div className="flex items-center justify-between p-2 mt-1 border rounded-lg">
                        <button
                          onClick={() =>
                            handleDependentChange("dependents", -1)
                          }
                          className="w-8 h-8 text-xl rounded-full hover:bg-secondary"
                        >
                          -
                        </button>
                        <span className="font-bold text-lg">
                          {dependents} 명
                        </span>
                        <button
                          onClick={() => handleDependentChange("dependents", 1)}
                          className="w-8 h-8 text-xl rounded-full hover:bg-secondary"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        20세 이하 자녀 수
                      </label>
                      <div className="flex items-center justify-between p-2 mt-1 border rounded-lg">
                        <button
                          onClick={() => handleDependentChange("children", -1)}
                          className="w-8 h-8 text-xl rounded-full hover:bg-secondary"
                        >
                          -
                        </button>
                        <span className="font-bold text-lg">{children} 명</span>
                        <button
                          onClick={() => handleDependentChange("children", 1)}
                          className="w-8 h-8 text-xl rounded-full hover:bg-secondary"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        70세 이상 (경로우대)
                      </label>
                      <div className="flex items-center justify-between p-2 mt-1 border rounded-lg">
                        <button
                          onClick={() =>
                            handleDependentChange("seniorDependents", -1)
                          }
                          className="w-8 h-8 text-xl rounded-full hover:bg-secondary"
                        >
                          -
                        </button>
                        <span className="font-bold text-lg">
                          {advancedSettings.seniorDependents} 명
                        </span>
                        <button
                          onClick={() =>
                            handleDependentChange("seniorDependents", 1)
                          }
                          className="w-8 h-8 text-xl rounded-full hover:bg-secondary"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        장애인
                      </label>
                      <div className="flex items-center justify-between p-2 mt-1 border rounded-lg">
                        <button
                          onClick={() =>
                            handleDependentChange("disabledDependents", -1)
                          }
                          className="w-8 h-8 text-xl rounded-full hover:bg-secondary"
                        >
                          -
                        </button>
                        <span className="font-bold text-lg">
                          {advancedSettings.disabledDependents} 명
                        </span>
                        <button
                          onClick={() =>
                            handleDependentChange("disabledDependents", 1)
                          }
                          className="w-8 h-8 text-xl rounded-full hover:bg-secondary"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-foreground">
                      비과세액 (월 기준)
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={nonTaxableAmount}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "");
                          setNonTaxableAmount(
                            v ? formatNumber(Number(v)) : "0"
                          );
                        }}
                        className="w-full p-3 pr-12 border rounded-lg bg-card border-border"
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-muted-foreground">
                        원
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isSmeYouth"
                        checked={advancedSettings.isSmeYouth}
                        onChange={(e) =>
                          setAdvancedSettings((prev) => ({
                            ...prev,
                            isSmeYouth: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="isSmeYouth"
                        className="ml-2 block text-sm text-foreground"
                      >
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
          </div>
        </div>

        {/* 오른쪽: 결과 요약 및 버튼 */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <div className="bg-card p-6 rounded-xl shadow-lg border">
              <h2 className="text-xl font-bold mb-4">월 예상 실수령액</h2>
              <p className="text-4xl font-bold my-1 text-primary">
                <CountUp end={result.monthlyNet} duration={0.5} separator="," />{" "}
                원
              </p>
              <p className="font-semibold text-sm text-destructive mt-2">
                (공제액 합계: -{" "}
                <CountUp
                  end={result.totalDeduction}
                  duration={0.5}
                  separator=","
                />{" "}
                원)
              </p>
            </div>
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-secondary font-semibold rounded-lg hover:bg-secondary/80 transition"
                >
                  초기화
                </button>
                <button
                  onClick={handleSaveData}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                  disabled={incomeType !== "regular"}
                >
                  대시보드 저장
                </button>
                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-accent/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={incomeType !== "regular"}
                >
                  <Share2 size={16} /> 결과 공유
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {annualSalary > 0 && incomeType === "regular" && (
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