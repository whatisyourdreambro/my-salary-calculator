// src/components/SalaryCalculator.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculateNetSalary } from "@/lib/calculator";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Share2 } from "lucide-react";
import type {
  StoredSalaryData,
  StoredFinancialData,
  AdvancedSettings,
} from "@/app/types";
import SalaryAnalysis from "./SalaryAnalysis";
import FinancialHealthAnalysis from "./FinancialHealthAnalysis";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type CalculationResult = ReturnType<typeof calculateNetSalary>;
type IncomeType = "regular" | "freelancer" | "part_time";

const generateWaterfallData = (
  grossSalary: number,
  result: CalculationResult,
  incomeType: IncomeType,
  payBasis: "annual" | "monthly"
) => {
  const { pension, health, employment, incomeTax, localTax, monthlyNet } =
    result;

  let monthlyGross: number;
  if (incomeType === "regular") {
    monthlyGross =
      payBasis === "annual" ? Math.round(grossSalary / 12) : grossSalary;
  } else {
    monthlyGross = grossSalary;
  }

  if (grossSalary <= 0) {
    return [];
  }

  const data = [
    { name: "세전소득", value: monthlyGross, color: "#0052ff" },
    { name: "국민연금", value: -pension, color: "#ff8c00" },
    { name: "건강보험", value: -health, color: "#ff6384" },
    { name: "고용보험", value: -employment, color: "#ffcd56" },
    { name: "소득세 등", value: -(incomeTax + localTax), color: "#4bc0c0" },
    { name: "실수령액", value: monthlyNet, color: "#36a2eb" },
  ].filter((item) => item.value !== 0);

  let cumulative = 0;
  return data.map((d) => {
    const base = cumulative;
    let range: [number, number];
    if (d.name === "실수령액") {
      range = [0, d.value];
    } else {
      cumulative += d.value;
      range = [Math.min(base, cumulative), Math.max(base, cumulative)];
    }
    return { ...d, range };
  });
};

export default function SalaryCalculator() {
  const router = useRouter();
  const [incomeType, setIncomeType] = useState<IncomeType>("regular");
  const [payBasis, setPayBasis] = useState<"annual" | "monthly">("annual");
  const [severanceType, setSeveranceType] = useState<"separate" | "included">(
    "separate"
  );
  const [salaryInput, setSalaryInput] = useState("50000000");
  const [nonTaxableAmount, setNonTaxableAmount] = useState("200000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState("");

  // [고도화] 상세 설정 State 추가
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

  const waterfallData = useMemo(
    () =>
      generateWaterfallData(
        parseNumber(salaryInput),
        result,
        incomeType,
        payBasis
      ),
    [salaryInput, result, incomeType, payBasis]
  );

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
        // 장애인/경로우대 부양가족 수는 전체 부양가족 수를 넘을 수 없음
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
    setSalaryInput("50000000");
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-bold">소득 정보</h2>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 my-4">
              <button
                onClick={() => setIncomeType("regular")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                  incomeType === "regular"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                정규직
              </button>
              <button
                onClick={() => setIncomeType("freelancer")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                  incomeType === "freelancer"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                프리랜서(3.3%)
              </button>
              <button
                onClick={() => setIncomeType("part_time")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                  incomeType === "part_time"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                아르바이트
              </button>
            </div>

            {incomeType === "regular" && (
              <div className="grid grid-cols-2 gap-4 my-4">
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                    급여 기준
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setPayBasis("annual")}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                        payBasis === "annual"
                          ? "bg-white dark:bg-gray-700 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      연봉
                    </button>
                    <button
                      onClick={() => setPayBasis("monthly")}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                        payBasis === "monthly"
                          ? "bg-white dark:bg-gray-700 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      월급
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                    퇴직금
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setSeveranceType("separate")}
                      disabled={payBasis === "monthly"}
                      className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                        severanceType === "separate"
                          ? "bg-white dark:bg-gray-700 shadow-sm"
                          : "text-gray-500"
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
                          ? "bg-white dark:bg-gray-700 shadow-sm"
                          : "text-gray-500"
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
              quickAmounts={[10000000, 1000000, 100000]}
            />
          </div>

          {incomeType === "regular" && (
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold">상세 설정</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    부양 가족 수 (본인포함)
                  </label>
                  <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => handleDependentChange("dependents", -1)}
                      className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg">{dependents} 명</span>
                    <button
                      onClick={() => handleDependentChange("dependents", 1)}
                      className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    20세 이하 자녀 수
                  </label>
                  <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => handleDependentChange("children", -1)}
                      className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg">{children} 명</span>
                    <button
                      onClick={() => handleDependentChange("children", 1)}
                      className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    70세 이상 (경로우대)
                  </label>
                  <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() =>
                        handleDependentChange("seniorDependents", -1)
                      }
                      className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
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
                      className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    장애인
                  </label>
                  <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() =>
                        handleDependentChange("disabledDependents", -1)
                      }
                      className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
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
                      className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  비과세액 (월 기준)
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={nonTaxableAmount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      setNonTaxableAmount(v ? formatNumber(Number(v)) : "0");
                    }}
                    className="w-full p-3 pr-12 border rounded-lg dark:bg-dark-card dark:border-gray-700"
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-gray-500">
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
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="isSmeYouth"
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
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
          )}
        </div>

        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border">
          <h2 className="text-xl font-bold mb-4">월급 상세 분석</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="font-semibold text-sm text-gray-500">
                월 예상 실수령액
              </p>
              <p className="text-4xl font-bold my-1 text-primary">
                <CountUp end={result.monthlyNet} duration={0.5} separator="," />{" "}
                원
              </p>
              <p className="font-semibold text-sm text-gray-500 mt-4">
                총 공제액 합계
              </p>
              <p className="text-2xl font-bold text-danger">
                -{" "}
                <CountUp
                  end={result.totalDeduction}
                  duration={0.5}
                  separator=","
                />{" "}
                원
              </p>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={waterfallData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
                >
                  <XAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis hide={true} domain={[0, "dataMax + 100000"]} />
                  <Tooltip
                    formatter={(value: number, name, props) => {
                      if (Array.isArray(props.payload.range)) {
                        const actualValue = Math.abs(
                          props.payload.range[1] - props.payload.range[0]
                        );
                        return `${formatNumber(Math.round(actualValue))} 원`;
                      }
                      return `${formatNumber(Math.abs(value))} 원`;
                    }}
                  />
                  <Bar dataKey="range" isAnimationActive={false}>
                    {waterfallData.map((d, i) => (
                      <Cell key={`cell-${i}`} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-6 border-t dark:border-gray-700 grid grid-cols-3 gap-2 mt-6">
            <button
              onClick={handleReset}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              초기화
            </button>
            <button
              onClick={handleSaveData}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
              disabled={incomeType !== "regular"}
            >
              대시보드 저장
            </button>
            <button
              onClick={handleShare}
              className="w-full py-3 bg-accent text-light-text font-bold rounded-lg hover:bg-accent-hover transition flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={incomeType !== "regular"}
            >
              <Share2 size={16} /> 결과 공유
            </button>
          </div>
        </div>
      </div>
      {annualSalary > 0 && incomeType === "regular" && (
        <SalaryAnalysis
          annualSalary={annualSalary}
          monthlyNet={result.monthlyNet}
        />
      )}
      {parseNumber(monthlyExpenses) > 0 && incomeType === "regular" && (
        <FinancialHealthAnalysis
          monthlyNet={result.monthlyNet}
          monthlyExpenses={parseNumber(monthlyExpenses)}
        />
      )}
    </div>
  );
}
