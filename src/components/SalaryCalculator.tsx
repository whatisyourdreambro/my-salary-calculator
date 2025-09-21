// src/components/SalaryCalculator.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { calculateNetSalary } from "@/lib/calculator";
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
// [수정] StoredFinancialData 타입을 import 합니다.
import type { StoredSalaryData, StoredFinancialData } from "@/app/types";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type CalculationResult = ReturnType<typeof calculateNetSalary>;

const generateWaterfallData = (
  grossSalary: number,
  result: CalculationResult
) => {
  const { pension, health, employment, incomeTax, localTax, monthlyNet } =
    result;
  const monthlyGross = grossSalary / 12;

  const data = [
    { name: "세전월급", value: monthlyGross, color: "#007FFF" },
    { name: "국민연금", value: -pension, color: "#FF6384" },
    { name: "건강보험", value: -health, color: "#FF9F40" },
    { name: "고용보험", value: -employment, color: "#FFCD56" },
    { name: "소득세 등", value: -(incomeTax + localTax), color: "#4BC0C0" },
    { name: "실수령액", value: monthlyNet, color: "#36A2EB" },
  ];

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
  const searchParams = useSearchParams();
  const [payBasis, setPayBasis] = useState<"annual" | "monthly">("annual");
  const [severanceType, setSeveranceType] = useState<"separate" | "included">(
    "separate"
  );
  const [salaryInput, setSalaryInput] = useState("50000000");
  const [nonTaxableAmount, setNonTaxableAmount] = useState("200000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [overtimePay, setOvertimePay] = useState("");

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
    let annual = payBasis === "annual" ? salary : salary * 12;
    if (severanceType === "included" && annual > 0) {
      annual = (annual / 13) * 12;
    }
    return annual;
  }, [salaryInput, payBasis, severanceType]);

  const waterfallData = useMemo(
    () => generateWaterfallData(annualSalary, result),
    [annualSalary, result]
  );

  const runCalculation = useCallback(() => {
    const nonTaxable = parseNumber(nonTaxableAmount) * 12;
    const annualOvertime = parseNumber(overtimePay);

    setResult(
      calculateNetSalary(
        annualSalary,
        nonTaxable,
        dependents,
        children,
        annualOvertime,
        { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 }
      )
    );
  }, [annualSalary, nonTaxableAmount, dependents, children, overtimePay]);

  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const decodedState = JSON.parse(atob(data));
        setPayBasis(decodedState.payBasis || "annual");
        setSeveranceType(decodedState.severanceType || "separate");
        setSalaryInput(decodedState.salaryInput || "50000000");
        setNonTaxableAmount(decodedState.nonTaxableAmount || "200000");
        setDependents(decodedState.dependents || 1);
        setChildren(decodedState.children || 0);
        setOvertimePay(decodedState.overtimePay || "");
      } catch (error) {
        console.error("Failed to parse shared data:", error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (payBasis === "monthly") {
      setSeveranceType("separate");
    }
  }, [payBasis]);

  const handleDependentChange = (
    field: "dependents" | "children",
    delta: number
  ) => {
    const currentVal = field === "dependents" ? dependents : children;
    const newVal = Math.max(field === "dependents" ? 1 : 0, currentVal + delta);

    if (field === "dependents") setDependents(newVal);
    else setChildren(newVal);
  };

  // [수정] 계산 결과를 새로운 통합 데이터 구조에 맞게 저장하는 함수로 변경합니다.
  const handleSaveData = () => {
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
      alert(
        "연봉 정보가 대시보드에 저장되었습니다! 페이지를 새로고침하여 확인해보세요."
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  const handleReset = () => {
    setPayBasis("annual");
    setSeveranceType("separate");
    setSalaryInput("50000000");
    setNonTaxableAmount("200000");
    setDependents(1);
    setChildren(0);
    setOvertimePay("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-6">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            필수 입력
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
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
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  연봉
                </button>
                <button
                  onClick={() => setPayBasis("monthly")}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    payBasis === "monthly"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
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
                      : "text-gray-500 dark:text-gray-400"
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
                      : "text-gray-500 dark:text-gray-400"
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
          <CurrencyInput
            label={payBasis === "annual" ? "연봉" : "월급"}
            value={salaryInput}
            onValueChange={setSalaryInput}
            quickAmounts={[10000000, 1000000, 100000]}
          />
        </div>
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            선택 입력
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                부양 가족 수 (본인포함)
              </label>
              <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => handleDependentChange("dependents", -1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  -
                </button>
                <span className="font-bold text-lg text-light-text dark:text-dark-text">
                  {dependents} 명
                </span>
                <button
                  onClick={() => handleDependentChange("dependents", 1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
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
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  -
                </button>
                <span className="font-bold text-lg text-light-text dark:text-dark-text">
                  {children} 명
                </span>
                <button
                  onClick={() => handleDependentChange("children", 1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
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
                className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">
                원
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border">
          <h2 className="text-xl font-bold mb-4">월급 상세 분석</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="font-semibold text-sm text-gray-500">
                월 예상 실수령액
              </p>
              <p className="text-4xl font-bold my-1 text-signature-blue">
                <CountUp end={result.monthlyNet} duration={0.5} separator="," />{" "}
                원
              </p>
              <p className="font-semibold text-sm text-gray-500 mt-4">
                총 공제액 합계
              </p>
              <p className="text-2xl font-bold text-red-500">
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
          {/* [수정] '내 연봉으로 저장' 버튼의 이름을 '대시보드에 저장'으로 변경하여 일관성을 확보합니다. */}
          <div className="mt-6 pt-6 border-t dark:border-gray-700 grid grid-cols-2 gap-4">
            <button
              onClick={handleReset}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              초기화
            </button>
            <button
              onClick={handleSaveData}
              className="w-full py-3 bg-signature-blue text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              대시보드에 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
