"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculateNetSalary } from "@/lib/calculator";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import { Share2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  StoredSalaryData,
  StoredFinancialData,
  AdvancedSettings,
} from "@/app/types";
import dynamic from "next/dynamic";
import IncomeTypeSelector from "./IncomeTypeSelector";
import DetailedSettings from "./DetailedSettings";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Toaster, toast } from "sonner";

const SalaryAnalysis = dynamic(() => import("./SalaryAnalysis"), {
  loading: () => <div className="h-48 rounded-xl animate-pulse bg-muted" />,
});
const DetailedAnalysis = dynamic(() => import("./DetailedAnalysis"), {
  loading: () => <div className="h-96 rounded-xl animate-pulse bg-muted" />,
});

const parseNumber = (str: string) => Number(String(str).replace(/,/g, ""));

type CalculationResult = ReturnType<typeof calculateNetSalary>;
export type IncomeType = "regular" | "freelancer" | "part_time";

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
      toast.error("정규직 소득만 대시보드에 저장할 수 있습니다.");
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
      toast.success("연봉 정보가 대시보드에 저장되었습니다!", {
        action: {
          label: "이동",
          onClick: () => router.push("/dashboard"),
        },
      });
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      toast.error("데이터 저장에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    if (incomeType !== "regular") {
      toast.error("정규직 소득만 공유할 수 있습니다.");
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
      toast.success("결과 공유 링크가 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("Sharing failed:", error);
      toast.error("공유 링크 복사에 실패했습니다.");
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
    toast.info("입력값이 초기화되었습니다.");
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="space-y-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>소득 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <IncomeTypeSelector
                  incomeType={incomeType}
                  onIncomeTypeChange={(type) =>
                    setIncomeType(type as IncomeType)
                  }
                />

                {incomeType === "regular" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Tabs
                      value={payBasis}
                      onValueChange={(value) =>
                        setPayBasis(value as "annual" | "monthly")
                      }
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="annual">연봉</TabsTrigger>
                        <TabsTrigger value="monthly">월급</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Tabs
                      value={severanceType}
                      onValueChange={(value) =>
                        setSeveranceType(value as "separate" | "included")
                      }
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                          value="separate"
                          disabled={payBasis === "monthly"}
                        >
                          퇴직금 별도
                        </TabsTrigger>
                        <TabsTrigger
                          value="included"
                          disabled={payBasis === "monthly"}
                        >
                          퇴직금 포함
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
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
                  quickAmounts={[10000000, 1000000, 100000]}
                />

                {incomeType === "regular" && (
                  <DetailedSettings
                    dependents={dependents}
                    children={children}
                    advancedSettings={advancedSettings}
                    nonTaxableAmount={nonTaxableAmount}
                    monthlyExpenses={monthlyExpenses}
                    handleDependentChange={handleDependentChange}
                    setNonTaxableAmount={setNonTaxableAmount}
                    setAdvancedSettings={setAdvancedSettings}
                    setMonthlyExpenses={setMonthlyExpenses}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>월 예상 실수령액</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold my-1 text-primary text-center">
                    <CountUp
                      end={result.monthlyNet}
                      duration={0.5}
                      separator=","
                    />{" "}
                    원
                  </p>
                  <p className="font-semibold text-sm text-destructive text-center mt-2">
                    (공제액 합계: -{" "}
                    <CountUp
                      end={result.totalDeduction}
                      duration={0.5}
                      separator=","
                    />{" "}
                    원)
                  </p>
                </CardContent>
              </Card>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw size={16} className="mr-2" /> 초기화
                </Button>
                <Button
                  onClick={handleSaveData}
                  disabled={incomeType !== "regular"}
                  className="w-full"
                >
                  <Save size={16} className="mr-2" /> 저장
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={incomeType !== "regular"}
                  variant="secondary"
                  className="w-full"
                >
                  <Share2 size={16} className="mr-2" /> 공유
                </Button>
              </div>
            </div>
          </div>
        </div>

        {annualSalary > 0 && incomeType === "regular" && (
          <div className="space-y-8">
            <DetailedAnalysis
              annualSalary={annualSalary}
              result={result}
              monthlyExpenses={parseNumber(monthlyExpenses)}
            />
            <SalaryAnalysis
              annualSalary={annualSalary}
              monthlyNet={result.monthlyNet}
            />
          </div>
        )}
      </div>
    </>
  );
}
