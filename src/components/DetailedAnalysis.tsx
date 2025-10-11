// src/components/DetailedAnalysis.tsx

"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { CalculationResult } from "@/app/types"; // 수정된 경로
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // 수정된 경로
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // 수정된 경로
import { Info, Wallet } from "lucide-react";

interface DetailedAnalysisProps {
  annualSalary: number;
  result: CalculationResult;
  monthlyExpenses: number;
}

const formatNumber = (num: number) => num.toLocaleString();

const COLORS = {
  netPay: "hsl(var(--primary))",
  pension: "hsl(var(--chart-1))",
  health: "hsl(var(--chart-2))",
  employment: "hsl(var(--chart-3))",
  tax: "hsl(var(--chart-4))",
};

const DEDUCTION_ITEMS = [
  { name: "국민연금", key: "pension", color: COLORS.pension },
  { name: "건강보험", key: "health", color: COLORS.health },
  { name: "고용보험", key: "employment", color: COLORS.employment },
  { name: "소득세(지방소득세 포함)", key: "tax", color: COLORS.tax },
];

const FinancialHealthAnalysis: React.FC<{ netToTotalRatio: number }> = ({
  netToTotalRatio,
}) => {
  let healthStatus = "";
  let description = "";
  let variant: "default" | "destructive" = "default";

  if (netToTotalRatio > 0.88) {
    healthStatus = "매우 건강";
    description =
      "실수령액 비중이 매우 높습니다. 절세 전략을 잘 활용하고 계십니다.";
    variant = "default";
  } else if (netToTotalRatio > 0.82) {
    healthStatus = "양호";
    description =
      "평균적인 수준의 실수령액 비중입니다. 비과세 항목을 점검해보세요.";
    variant = "default";
  } else {
    healthStatus = "주의 필요";
    description =
      "공제액 비중이 다소 높습니다. 연말정산을 통해 환급액을 높일 수 있습니다.";
    variant = "destructive";
  }

  return (
    <Alert variant={variant}>
      <Info className="h-4 w-4" />
      <AlertTitle>금융 건전성: {healthStatus}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default function DetailedAnalysis({
  annualSalary,
  result,
  monthlyExpenses,
}: DetailedAnalysisProps) {
  const monthlySalary = annualSalary / 12;
  const {
    monthlyNet,
    totalDeduction,
    pension,
    health,
    employment,
    incomeTax,
    localTax,
  } = result;

  const totalTax = incomeTax + localTax;

  const pieData = [
    { name: "실수령액", value: monthlyNet },
    { name: "국민연금", value: pension },
    { name: "건강보험", value: health },
    { name: "고용보험", value: employment },
    { name: "소득세", value: totalTax },
  ];

  const netToTotalRatio = monthlyNet / monthlySalary;
  const disposableIncome = monthlyNet - monthlyExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>월급 상세 분석</CardTitle>
        <CardDescription>
          매월 내 급여가 어떻게 구성되는지 자세히 살펴보세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={3}
                >
                  <Cell key={`cell-netPay`} fill={COLORS.netPay} />
                  <Cell key={`cell-pension`} fill={COLORS.pension} />
                  <Cell key={`cell-health`} fill={COLORS.health} />
                  <Cell key={`cell-employment`} fill={COLORS.employment} />
                  <Cell key={`cell-tax`} fill={COLORS.tax} />
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-lg font-semibold text-muted-foreground">
              월 세전 급여
            </p>
            <p className="text-3xl font-bold text-foreground mb-4">
              {formatNumber(monthlySalary)}원
            </p>
            <Separator />
            <p className="text-lg font-semibold text-muted-foreground mt-4">
              월 실수령액
            </p>
            <p className="text-3xl font-bold text-primary">
              {formatNumber(monthlyNet)}원
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">상세 공제 내역</h3>
          <div className="space-y-2 rounded-lg border p-4">
            {DEDUCTION_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex justify-between items-center py-1"
              >
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatNumber(
                    item.key === "tax"
                      ? totalTax
                      : (result[item.key as keyof CalculationResult] as number)
                  )}
                  원
                </span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between items-center pt-1 font-bold">
              <span className="text-foreground">총 공제액</span>
              <span className="text-destructive">
                {formatNumber(totalDeduction)}원
              </span>
            </div>
          </div>
        </div>

        {monthlyExpenses > 0 && (
          <Card className="bg-muted/50">
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
              <Wallet className="h-6 w-6 text-muted-foreground" />
              <CardTitle>월 가처분 소득</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatNumber(disposableIncome)} 원
              </p>
              <p className="text-xs text-muted-foreground">
                월 실수령액({formatNumber(monthlyNet)}원) - 월 고정지출(
                {formatNumber(monthlyExpenses)}원)
              </p>
            </CardContent>
          </Card>
        )}

        <FinancialHealthAnalysis netToTotalRatio={netToTotalRatio} />
      </CardContent>
    </Card>
  );
}
