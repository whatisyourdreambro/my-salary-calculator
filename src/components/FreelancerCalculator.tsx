// src/components/FreelancerCalculator.tsx

"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
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

export default function FreelancerCalculator() {
  const [income, setIncome] = useState("3000000");
  const [taxType, setTaxType] = useState<"freelancer" | "part_time">(
    "freelancer"
  );

  const result = useMemo(
    () => calculatePartTimeSalary(Number(income.replace(/,/g, "")), taxType),
    [income, taxType]
  );

  const chartData = useMemo(() => {
    const data = [
      { name: "실수령액", value: result.netPay, color: "#0052ff" },
      { name: "소득세", value: result.incomeTax, color: "#ff8c00" },
      { name: "지방소득세", value: result.localTax, color: "#ff6384" },
    ];
    if (taxType === "part_time") {
      data.push(
        { name: "국민연금", value: result.nationalPension, color: "#ffcd56" },
        { name: "건강보험", value: result.healthInsurance, color: "#4bc0c0" },
        {
          name: "고용보험",
          value: result.employmentInsurance,
          color: "#36a2eb",
        }
      );
    }
    return data.filter((d) => d.value > 0);
  }, [result, taxType]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border">
        <h2 className="text-lg font-bold mb-4">소득 정보 입력</h2>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
          <button
            onClick={() => setTaxType("freelancer")}
            className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
              taxType === "freelancer"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "text-gray-500"
            }`}
          >
            프리랜서 (3.3%)
          </button>
          <button
            onClick={() => setTaxType("part_time")}
            className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
              taxType === "part_time"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "text-gray-500"
            }`}
          >
            아르바이트 (4대보험)
          </button>
        </div>
        <CurrencyInput
          label="월 소득 (세전)"
          value={income}
          onValueChange={setIncome}
          quickAmounts={[500000, 100000, 50000]}
        />
      </div>

      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border">
        <h2 className="text-xl font-bold mb-4">예상 실수령액</h2>
        <div className="text-center">
          <p className="text-4xl font-bold my-1 text-primary">
            <CountUp end={result.netPay} duration={0.5} separator="," /> 원
          </p>
          <p className="font-semibold text-sm text-gray-500 mt-2">
            총 공제액: -{" "}
            <CountUp end={result.totalDeduction} duration={0.5} separator="," />{" "}
            원
          </p>
        </div>
        <div className="h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                formatter={(value: number) => `${formatNumber(value)} 원`}
              />
              <Bar dataKey="value" barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
