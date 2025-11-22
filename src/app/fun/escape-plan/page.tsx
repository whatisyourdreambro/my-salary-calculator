"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import NumberStepper from "@/components/NumberStepper";
import { motion } from "framer-motion";
import { Coffee, Beer, Plane, Rocket, BedDouble, DoorOpen, Sun, Umbrella, Palmtree } from "lucide-react";
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
  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-6 overflow-hidden relative">
    <motion.div
      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 relative"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(percentage, 100)}%` }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
    </motion.div>
    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 mix-blend-difference">
      {percentage.toFixed(1)}%
    </div>
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
    { name: "월요병", value: Math.floor(yearsToTarget * 52), icon: BedDouble, unit: "번" },
    { name: "아메리카노", value: Math.floor(yearsToTarget * 250 * 2), icon: Coffee, unit: "잔" },
    { name: "야근 식대", value: Math.floor(yearsToTarget * 100), icon: Beer, unit: "번" },
    { name: "여름 휴가", value: Math.floor(yearsToTarget), icon: Plane, unit: "번" },
  ];

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-6 shadow-lg shadow-blue-500/30">
            <DoorOpen size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            FREEDOM <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">DASHBOARD</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            회사 탈출까지 남은 시간을 계산하고, 당신만의 자유 계획을 세워보세요.
          </p>
        </div>

        {/* Ad Unit: Top */}
        <div className="mb-12 max-w-3xl mx-auto">
          <AdUnit slotId="1122334455" format="auto" label="Escape Plan Top Ad" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                현재 자산 현황
              </h2>
              <div className="space-y-6">
                <CurrencyInput label="현재 모은 돈 (총 자산)" value={currentAssets} onValueChange={setCurrentAssets} quickAmounts={[10000000, 50000000]} />
                <CurrencyInput label="월 저축/투자 가능액" value={monthlySaving} onValueChange={setMonthlySaving} quickAmounts={[1000000, 2000000]} />
                <CurrencyInput label="은퇴 후 월 희망 생활비" value={monthlyCost} onValueChange={setMonthlyCost} quickAmounts={[2000000, 3000000]} />
                <NumberStepper label="예상 연평균 수익률" value={returnRate} onValueChange={setReturnRate} unit="%" />
              </div>
            </div>

            {/* Ad Unit: Side (Mobile only or small desktop) */}
            <div className="lg:hidden">
              <AdUnit slotId="5544332211" format="rectangle" label="Escape Plan Side Ad" />
            </div>
          </div>

          {/* Right Column: Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Result Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <h2 className="text-lg font-medium text-slate-400 mb-1">경제적 자유 목표액 (FIRE)</h2>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl md:text-5xl font-black tracking-tight">{formatNumber(targetAmount)}</span>
                  <span className="text-xl font-medium text-slate-400">원</span>
                </div>

                <div className="space-y-2 mb-8">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-blue-400">진행률</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar percentage={progressPercentage} />
                </div>

                <div className="pt-8 border-t border-white/10">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">예상 탈출 시점</h3>
                  {yearsToTarget === 0 ? (
                    <div className="flex items-center gap-3 text-green-400">
                      <Rocket className="w-8 h-8 animate-bounce" />
                      <span className="text-3xl font-bold">지금 당장 사표 가능! 🎉</span>
                    </div>
                  ) : isFinite(yearsToTarget) ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-white">{yearsToTarget.toFixed(1)}</span>
                      <span className="text-xl text-slate-400">년 후</span>
                      <span className="text-sm text-slate-500 ml-2">({new Date().getFullYear() + Math.floor(yearsToTarget)}년)</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-red-400">계획 수정이 필요합니다... 🥲</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Fun Metrics Grid */}
            {isFinite(yearsToTarget) && yearsToTarget > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {funMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-600 dark:text-slate-400">
                      <metric.icon size={20} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-medium mb-1">남은 {metric.name}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatNumber(metric.value)} <span className="text-sm font-normal text-slate-400">{metric.unit}</span>
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Motivation */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 text-center border border-blue-100 dark:border-blue-900/30">
          <Palmtree className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">자유를 향한 여정</h3>
          <p className="text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
            "가장 큰 부자는 자신의 시간을 마음대로 쓸 수 있는 사람이다." <br />
            오늘의 절약과 투자가 당신의 내일을 자유롭게 만듭니다.
          </p>
        </div>

        {/* Ad Unit: Bottom */}
        <div className="mt-12">
          <AdUnit slotId="9988776655" format="auto" label="Escape Plan Bottom Ad" />
        </div>
      </div>
    </main>
  );
}
