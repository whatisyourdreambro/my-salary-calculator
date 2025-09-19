"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type CalculationMode = "bySpending" | "byTarget";

interface FireInputs {
  currentAge: string;
  monthlySpending: string;
  currentSavings: string;
  monthlySavings: string;
  annualReturn: string;
  inflationRate: string;
  targetAmount: string; // 목표 금액 추가
}

const calculateFireDate = (inputs: FireInputs, mode: CalculationMode) => {
  const {
    currentAge,
    currentSavings,
    monthlySavings,
    annualReturn,
    inflationRate,
    monthlySpending,
    targetAmount: targetAmountInput,
  } = inputs;

  const targetAmount =
    mode === "bySpending"
      ? parseNumber(monthlySpending) * 12 * 25
      : parseNumber(targetAmountInput);

  if (parseNumber(currentSavings) >= targetAmount && mode === "byTarget") {
    return {
      yearsToFire: 0,
      finalAge: parseInt(currentAge, 10),
      chartData: [],
      finalTargetAmount: targetAmount,
    };
  }

  let futureValue = parseNumber(currentSavings);
  let years = 0;
  const monthlyRate = parseFloat(annualReturn) / 100 / 12;
  const inflation = parseFloat(inflationRate) / 100;
  const monthlySave = parseNumber(monthlySavings);

  const chartData = [
    {
      year: 0,
      age: parseInt(currentAge, 10),
      assets: futureValue,
      target: targetAmount,
    },
  ];

  let currentTargetAmount = targetAmount;

  while (futureValue < currentTargetAmount && years < 100) {
    for (let i = 0; i < 12; i++) {
      futureValue = futureValue * (1 + monthlyRate) + monthlySave;
    }
    years++;

    if (mode === "bySpending") {
      currentTargetAmount *= 1 + inflation;
    }

    chartData.push({
      year: years,
      age: parseInt(currentAge, 10) + years,
      assets: Math.round(futureValue),
      target: Math.round(currentTargetAmount),
    });
  }

  return {
    yearsToFire: years >= 100 ? Infinity : years,
    finalAge: years >= 100 ? Infinity : parseInt(currentAge, 10) + years,
    chartData,
    finalTargetAmount: Math.round(currentTargetAmount),
  };
};

export default function FireCalculator() {
  const [mode, setMode] = useState<CalculationMode>("bySpending");
  // [수정] 초기값에 1,000단위 구분 기호를 적용합니다.
  const [inputs, setInputs] = useState<FireInputs>({
    currentAge: "30",
    monthlySpending: "3,000,000",
    currentSavings: "50,000,000",
    monthlySavings: "1,500,000",
    annualReturn: "7",
    inflationRate: "2",
    targetAmount: "1,000,000,000", // 목표금액 초기값 추가
  });

  const handleInputChange = (field: keyof FireInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const { finalTargetAmount, yearsToFire, finalAge, chartData } = useMemo(
    () => calculateFireDate(inputs, mode),
    [inputs, mode]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
      <div className="lg:col-span-2 space-y-6 bg-light-card dark:bg-dark-card p-6 rounded-xl border">
        <h2 className="text-xl font-bold text-center">
          나의 FIRE 계획 입력하기
        </h2>

        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mt-1">
          <button
            onClick={() => setMode("bySpending")}
            className={`flex-1 p-2 rounded-md text-sm font-semibold ${
              mode === "bySpending" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
            }`}
          >
            생활비 기반
          </button>
          <button
            onClick={() => setMode("byTarget")}
            className={`flex-1 p-2 rounded-md text-sm font-semibold ${
              mode === "byTarget" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
            }`}
          >
            목표액 기반
          </button>
        </div>

        <div>
          <label className="text-sm font-medium">
            현재 나이: <strong>{inputs.currentAge}세</strong>
          </label>
          <input
            type="range"
            min="20"
            max="60"
            value={inputs.currentAge}
            onChange={(e) => handleInputChange("currentAge", e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        {mode === "bySpending" ? (
          <CurrencyInput
            label="은퇴 후 월 목표 생활비 (현재 가치)"
            value={inputs.monthlySpending}
            onValueChange={(v) => handleInputChange("monthlySpending", v)}
            quickAmounts={[100000, 500000]}
          />
        ) : (
          <CurrencyInput
            label="FIRE 목표 금액"
            value={inputs.targetAmount}
            onValueChange={(v) => handleInputChange("targetAmount", v)}
            quickAmounts={[100000000, 50000000]}
          />
        )}

        <CurrencyInput
          label="현재 모은 돈 (순자산)"
          value={inputs.currentSavings}
          onValueChange={(v) => handleInputChange("currentSavings", v)}
          quickAmounts={[10000000, 5000000]}
        />
        <CurrencyInput
          label="월 저축/투자 금액"
          value={inputs.monthlySavings}
          onValueChange={(v) => handleInputChange("monthlySavings", v)}
          quickAmounts={[100000, 500000]}
        />

        {/* [수정] 수익률, 물가상승률 입력 제한 해제 */}
        <div>
          <label className="text-sm font-medium">연평균 투자 수익률 (%)</label>
          <input
            type="number"
            value={inputs.annualReturn}
            onChange={(e) => handleInputChange("annualReturn", e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            예상 연평균 물가상승률 (%)
          </label>
          <input
            type="number"
            value={inputs.inflationRate}
            onChange={(e) => handleInputChange("inflationRate", e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
          />
        </div>
      </div>
      <div className="lg:col-span-3 space-y-6 bg-gradient-to-br from-signature-blue to-violet-500 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">
          🔥 당신의 경제적 자유, D-DAY는?
        </h2>
        <div className="bg-white/20 p-6 rounded-lg text-center">
          <p className="font-semibold text-blue-200 text-lg">
            파이어(FIRE) 목표 금액
          </p>
          <p className="text-4xl font-bold my-1">
            <CountUp end={finalTargetAmount} separator="," /> 원
          </p>
        </div>
        <div className="bg-white/20 p-6 rounded-lg text-center">
          {yearsToFire === Infinity ? (
            <>
              <p className="text-4xl font-bold my-1 text-yellow-300">
                달성 불가 😥
              </p>
              <p className="font-semibold text-lg mt-2">
                저축액을 늘리거나 수익률을 높여보세요!
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-lg">
                당신은{" "}
                <strong className="text-yellow-300">{yearsToFire}년 후,</strong>
              </p>
              <p className="text-5xl font-bold my-2">
                <CountUp end={finalAge} /> 세
              </p>
              <p className="font-semibold text-lg">
                경제적 자유를 달성할 수 있습니다!
              </p>
            </>
          )}
        </div>
        <div className="bg-white/20 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-4 text-center">
            자산 성장 시뮬레이션
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="age" unit="세" />
              <YAxis
                tickFormatter={(value) =>
                  `${((value as number) / 100000000).toFixed(1)}억`
                }
              />
              <Tooltip
                formatter={(value: number) => [`${formatNumber(value)}원`]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="assets"
                name="예상 자산"
                stroke="#FFD700"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="목표 금액"
                stroke="#FF8042"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
