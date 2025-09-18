// src/components/FireCalculator.tsx

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

// [수정] inputs 타입을 명확하게 정의했습니다.
interface FireInputs {
  currentAge: string;
  monthlySpending: string;
  currentSavings: string;
  monthlySavings: string;
  annualReturn: string;
}

// 4% 룰에 기반한 목표 금액 계산
const calculateFireTarget = (monthlySpending: number) => {
  return monthlySpending * 12 * 25;
};

// 경제적 자유 달성 시점 계산
const calculateFireDate = (inputs: FireInputs) => {
  const { currentAge, currentSavings, monthlySavings, annualReturn } = inputs;
  const targetAmount = calculateFireTarget(parseNumber(inputs.monthlySpending));

  if (parseNumber(currentSavings) >= targetAmount) {
    return {
      yearsToFire: 0,
      finalAge: parseInt(currentAge, 10),
      chartData: [],
    };
  }

  let futureValue = parseNumber(currentSavings);
  let years = 0;
  const monthlyRate = parseFloat(annualReturn) / 100 / 12;
  const monthlySave = parseNumber(monthlySavings);
  const chartData = [
    { year: 0, age: parseInt(currentAge, 10), assets: futureValue },
  ];

  while (futureValue < targetAmount && years < 60) {
    for (let i = 0; i < 12; i++) {
      futureValue = futureValue * (1 + monthlyRate) + monthlySave;
    }
    years++;
    chartData.push({
      year: years,
      age: parseInt(currentAge, 10) + years,
      assets: Math.round(futureValue),
    });
  }

  return {
    yearsToFire: years >= 60 ? Infinity : years,
    finalAge: years >= 60 ? Infinity : parseInt(currentAge, 10) + years,
    chartData,
  };
};

export default function FireCalculator() {
  const [inputs, setInputs] = useState<FireInputs>({
    currentAge: "30",
    monthlySpending: "3000000",
    currentSavings: "50000000",
    monthlySavings: "1500000",
    annualReturn: "7",
  });

  const handleInputChange = (field: keyof FireInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const { targetAmount, yearsToFire, finalAge, chartData } = useMemo(() => {
    const target = calculateFireTarget(parseNumber(inputs.monthlySpending));
    const result = calculateFireDate(inputs);
    return { targetAmount: target, ...result };
  }, [inputs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
      {/* 입력 섹션 */}
      <div className="lg:col-span-2 space-y-6 bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-center">
          나의 FIRE 계획 입력하기
        </h2>
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
        <CurrencyInput
          label="은퇴 후 월 목표 생활비"
          value={inputs.monthlySpending}
          onValueChange={(v) => handleInputChange("monthlySpending", v)}
          quickAmounts={[100000, 500000]}
        />
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
        <div>
          <label className="text-sm font-medium">
            연평균 투자 수익률: <strong>{inputs.annualReturn}%</strong>
          </label>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={inputs.annualReturn}
            onChange={(e) => handleInputChange("annualReturn", e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
      </div>

      {/* 결과 섹션 */}
      <div className="lg:col-span-3 space-y-6 bg-gradient-to-br from-signature-blue to-violet-500 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">
          🔥 당신의 경제적 자유, D-DAY는?
        </h2>

        <div className="bg-white/20 p-6 rounded-lg text-center">
          <p className="font-semibold text-blue-200 text-lg">
            파이어(FIRE) 목표 금액
          </p>
          <p className="text-4xl font-bold my-1">
            <CountUp end={targetAmount} separator="," /> 원
          </p>
          <p className="text-xs text-blue-200">(4% 룰 기준)</p>
        </div>

        <div className="bg-white/20 p-6 rounded-lg text-center">
          {yearsToFire === Infinity ? (
            <>
              <p className="text-4xl font-bold my-1 text-yellow-300">
                달성 불가 😥
              </p>
              <p className="font-semibold text-lg mt-2">
                월 저축액을 늘리거나 투자 수익률을 높여보세요!
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
                formatter={(value: number) => [
                  `${formatNumber(value)}원`,
                  "예상 자산",
                ]}
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
