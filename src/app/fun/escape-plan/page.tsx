// src/app/fun/escape-plan/page.tsx
"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import NumberStepper from "@/components/NumberStepper";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Coffee, Beer, Plane, Rocket, BedDouble } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

// 4% 룰에 기반한 목표 금액 계산
const calculateTargetAmount = (monthlyCost: number) => (monthlyCost * 12) / 0.04;

// 목표 달성까지 남은 기간(년) 계산
const calculateYearsToTarget = (currentAssets: number, monthlySaving: number, returnRate: number, targetAmount: number) => {
  if (currentAssets >= targetAmount) return 0;
  if (returnRate === 0) {
    const requiredSavings = targetAmount - currentAssets;
    return requiredSavings / (monthlySaving * 12);
  }

  const annualSaving = monthlySaving * 12;
  const r = returnRate / 100;
  let years = 0;
  let futureValue = currentAssets;

  while (futureValue < targetAmount && years < 100) {
    futureValue = futureValue * (1 + r) + annualSaving;
    years++;
  }
  return years >= 100 ? Infinity : years;
};

const ProgressBar = ({ percentage }: { percentage: number }) => (
  <div className="w-full bg-secondary rounded-full h-8 border border-border shadow-inner">
    <motion.div
      className="bg-primary h-8 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(percentage, 100)}%` }}
      transition={{ duration: 1, type: "spring" }}
    >
      {percentage.toFixed(1)}%
    </motion.div>
  </div>
);

export default function EscapePlanPage() {
  const [currentAssets, setCurrentAssets] = useState("50000000");
  const [monthlySaving, setMonthlySaving] = useState("1500000");
  const [monthlyCost, setMonthlyCost] = useState("3000000");
  const [returnRate, setReturnRate] = useState(8);

  const parsedValues = useMemo(() => ({
    currentAssets: parseNumber(currentAssets),
    monthlySaving: parseNumber(monthlySaving),
    monthlyCost: parseNumber(monthlyCost),
  }), [currentAssets, monthlySaving, monthlyCost]);

  const targetAmount = useMemo(() => calculateTargetAmount(parsedValues.monthlyCost), [parsedValues.monthlyCost]);
  const yearsToTarget = useMemo(() => calculateYearsToTarget(parsedValues.currentAssets, parsedValues.monthlySaving, returnRate, targetAmount), [parsedValues, returnRate, targetAmount]);

  const progressPercentage = (parsedValues.currentAssets / targetAmount) * 100;

  const funMetrics = [
    { name: "월요병", value: yearsToTarget * 52, icon: BedDouble, unit: "번" },
    { name: "아메리카노", value: yearsToTarget * 250 * 2, icon: Coffee, unit: "잔" },
    { name: "치맥", value: yearsToTarget * 52, icon: Beer, unit: "번" },
    { name: "해외여행", value: yearsToTarget * 1, icon: Plane, unit: "번" },
  ];

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">회사 탈출 계산기</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">당신의 퇴사 시계를 맞춰보세요. 자유가 얼마 남지 않았습니다!</p>
      </div>

      {/* Ad Unit: Top */}
      <div className="mb-8">
        <AdUnit slotId="1122334455" format="auto" label="Escape Plan Top Ad" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-card p-6 rounded-2xl border border-border">
          <h2 className="text-xl font-bold">나의 현재 상태</h2>
          <CurrencyInput label="현재 총 자산" value={currentAssets} onValueChange={setCurrentAssets} quickAmounts={[]} />
          <CurrencyInput label="월 평균 저축/투자액" value={monthlySaving} onValueChange={setMonthlySaving} quickAmounts={[]} />
          <CurrencyInput label="탈출 후 월 최소 생활비" value={monthlyCost} onValueChange={setMonthlyCost} quickAmounts={[]} />
          <NumberStepper label="연평균 투자 수익률" value={returnRate} onValueChange={setReturnRate} unit="%" />
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="bg-card p-6 rounded-2xl shadow-2xl border border-border text-center">
            <h2 className="text-xl font-bold mb-2">탈출 목표 금액 (파이어족 기준)</h2>
            <p className="text-4xl font-bold text-primary">{formatNumber(targetAmount)}원</p>
            <p className="text-xs text-muted-foreground mt-1">* 연 생활비의 25배, 4% 인출 법칙 기준</p>
            <div className="mt-6">
              <p className="text-sm font-semibold mb-2">현재 진행률</p>
              <ProgressBar percentage={progressPercentage} />
            </div>
          </motion.div>

          {/* Ad Unit: Middle */}
          <div className="my-4">
            <AdUnit slotId="5544332211" format="auto" label="Escape Plan Middle Ad" />
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="bg-card p-6 rounded-2xl shadow-2xl border border-border text-center">
            <h2 className="text-xl font-bold mb-2">예상 탈출 시점</h2>
            {yearsToTarget === 0 ? (
              <p className="text-4xl font-bold text-primary">🎉 지금 바로 탈출 가능! 🎉</p>
            ) : isFinite(yearsToTarget) ? (
              <p className="text-4xl font-bold text-primary">약 {yearsToTarget.toFixed(1)}년 후</p>
            ) : (
              <p className="text-3xl font-bold text-destructive">탈출 계획을 다시 세워보세요...</p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {isFinite(yearsToTarget) && yearsToTarget > 0 && funMetrics.map(metric => (
                <div key={metric.name} className="bg-secondary p-3 rounded-lg">
                  <metric.icon className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm font-semibold">{metric.name}</p>
                  <p className="text-lg font-bold">{formatNumber(metric.value)} {metric.unit}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
