// src/components/DetailedAnalysis.tsx
"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CalculationResult } from "@/lib/calculator";
import { Calendar, TrendingDown } from "lucide-react";
import CountUp from "react-countup"; // CountUp import 추가

const formatNumber = (num: number) => num.toLocaleString();

const COLORS = ["#0052ff", "#e11d48"];
const DEDUCTION_COLORS = [
  "#ff8c00",
  "#ff6384",
  "#ffcd56",
  "#4bc0c0",
  "#9966ff",
  "#ff9f40",
];

interface DetailedAnalysisProps {
  annualSalary: number;
  result: CalculationResult;
}

export default function DetailedAnalysis({
  annualSalary,
  result,
}: DetailedAnalysisProps) {
  const monthlyGross = useMemo(
    () => Math.round(annualSalary / 12),
    [annualSalary]
  );

  const compositionData = [
    { name: "월 실수령액", value: result.monthlyNet },
    { name: "월 총 공제액", value: result.totalDeduction },
  ];

  const deductionDetails = [
    { name: "국민연금", value: result.pension, rate: "4.5%" },
    { name: "건강보험", value: result.health, rate: "3.545%" },
    { name: "장기요양", value: result.longTermCare, rate: "건강보험의 12.95%" },
    { name: "고용보험", value: result.employment, rate: "0.9%" },
    { name: "소득세", value: result.incomeTax, rate: "소득 구간별" },
    { name: "지방소득세", value: result.localTax, rate: "소득세의 10%" },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border">
      <h2 className="text-xl font-bold mb-6 text-center">월급 상세 분석</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Donut Chart & Composition */}
        <div className="flex flex-col items-center">
          <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">
            월 세전 급여: {formatNumber(monthlyGross)}원
          </p>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${formatNumber(value)} 원`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Deduction Details Table */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-6 h-6 text-danger" />
            <h3 className="text-lg font-bold">상세 공제 내역</h3>
          </div>
          <div className="space-y-2 text-sm">
            {deductionDetails.map((item, index) => (
              <div
                key={item.name}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md"
              >
                <div className="flex items-center">
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        DEDUCTION_COLORS[index % DEDUCTION_COLORS.length],
                    }}
                  ></span>
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.rate})
                  </span>
                </div>
                <span className="font-mono font-semibold">
                  {formatNumber(item.value)}원
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Calendar */}
      <div className="mt-10 pt-6 border-t dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-bold">연봉 달력</h3>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <p className="text-xs font-bold text-gray-500">{i + 1}월</p>
              <p className="text-sm font-semibold text-primary">
                +
                {(result.monthlyNet / 10000).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                만
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
          <p className="font-bold text-lg text-primary">
            12개월 후, 당신의 통장에는 총{" "}
            <CountUp end={result.monthlyNet * 12} separator="," duration={1} />
            원이 쌓입니다!
          </p>
        </div>
      </div>
    </div>
  );
}
