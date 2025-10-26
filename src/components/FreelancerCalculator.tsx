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
  LabelList,
} from "recharts";

const formatNumber = (num: number) => num.toLocaleString();

// recharts가 전달하는 props 타입(string | number)과 호환되도록 수정
interface CustomBarLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: number | string;
}

// 차트 바에 표시될 커스텀 라벨 컴포넌트
const CustomBarLabel = (props: CustomBarLabelProps) => {
  const { x, y, width, value } = props;

  // props 값이 없을 경우 렌더링하지 않음
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    value === undefined
  ) {
    return null;
  }

  // props로 받은 값을 산술 연산 전에 안전하게 숫자형으로 변환
  const numX = Number(x);
  const numY = Number(y);
  const numWidth = Number(width);
  const numValue = Number(value);

  // 라벨 텍스트의 위치 계산
  const textX = numX + numWidth + 10;
  const textY = numY + 15;

  // 차트 바의 너비가 너무 좁으면 라벨을 숨김
  if (numWidth < 30) {
    return null;
  }

  return (
    <text
      x={textX}
      y={textY}
      fill="hsl(var(--muted-foreground))"
      textAnchor="start"
      className="font-semibold"
    >
      {`${formatNumber(numValue)}원`}
    </text>
  );
};

export default function FreelancerCalculator() {
  const [income, setIncome] = useState("3,000,000");
  const [taxType, setTaxType] = useState<"freelancer" | "part_time">(
    "freelancer"
  );

  const result = useMemo(
    () => calculatePartTimeSalary(Number(income.replace(/,/g, "")), taxType),
    [income, taxType]
  );

  const chartData = useMemo(() => {
    const data = [
      { name: "실수령액", value: result.netPay, color: "hsl(var(--primary))" },
      { name: "소득세", value: result.incomeTax, color: "hsl(var(--destructive))" },
      { name: "지방소득세", value: result.localTax, color: "hsl(var(--destructive))" },
    ];
    if (taxType === "part_time") {
      data.push(
        { name: "국민연금", value: result.nationalPension, color: "hsl(var(--secondary))" },
        { name: "건강보험", value: result.healthInsurance, color: "hsl(var(--secondary))" },
        {
          name: "고용보험",
          value: result.employmentInsurance,
          color: "hsl(var(--secondary))",
        }
      );
    }
    // 값이 0보다 큰 항목만 필터링하고, 값 기준으로 오름차순 정렬
    return data.filter((d) => d.value > 0).sort((a, b) => a.value - b.value);
  }, [result, taxType]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* 소득 정보 입력 섹션 */}
      <div className="bg-card p-6 rounded-xl border">
        <h2 className="text-lg font-bold mb-4">소득 정보 입력</h2>
        <div className="flex bg-secondary rounded-lg p-1 mb-4">
          <button
            onClick={() => setTaxType("freelancer")}
            className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
              taxType === "freelancer"
                ? "bg-card shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            프리랜서 (3.3%)
          </button>
          <button
            onClick={() => setTaxType("part_time")}
            className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
              taxType === "part_time"
                ? "bg-card shadow-sm"
                : "text-muted-foreground"
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

      {/* 예상 실수령액 섹션 */}
      <div className="bg-card p-6 rounded-xl shadow-lg border">
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
                formatter={(value: string | number) =>
                  `${formatNumber(Number(value))} 원`
                }
                cursor={{ fill: "transparent" }}
              />
              <Bar dataKey="value" barSize={25} radius={[4, 4, 4, 4]}>
                <LabelList dataKey="value" content={CustomBarLabel} />
                <LabelList
                  dataKey="name"
                  position="insideLeft"
                  offset={10}
                  className="font-semibold"
                  fill="hsl(var(--foreground))"
                />
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