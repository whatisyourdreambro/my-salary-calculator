"use client";

// [수정] 사용하지 않는 'useRef'를 import 구문에서 제거했습니다.
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
        </div>
        <div className="text-center">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
