"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  PlusCircle,
  Trash2,
  TrendingUp,
  Shield,
  Rocket,
  ArrowRight,
  MousePointerClick,
  Flame,
  Target,
  Coins,
  Coffee,
  Palmtree,
  Info,
  CheckCircle2,
  Sparkles,
  PiggyBank
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import AdUnit from "@/components/AdUnit";
import confetti from "canvas-confetti";

// --- Types & Utilities ---

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type CalculationStep =
  | "intro"
  | "essentials"
  | "investment"
  | "events"
  | "result";
type InvestmentStrategy = "conservative" | "balanced" | "aggressive";

interface LifeEvent {
  year: number;
  type: "oneTimeExpense" | "oneTimeIncome";
  amount: string;
  description: string;
}

interface FireInputs {
  currentAge: string;
  monthlySpending: string;
  currentSavings: string;
  monthlySavings: string;
  salaryGrowthRate: string;
  investmentStrategy: InvestmentStrategy;
  customReturn: string;
  retirementIncome: string;
  withdrawalRate: string;
}

const strategyReturns = {
  conservative: 4,
  balanced: 7,
  aggressive: 10,
};

// --- Calculation Logic ---

const calculateFireDate = (inputs: FireInputs, lifeEvents: LifeEvent[]) => {
  const {
    currentAge,
    currentSavings,
    monthlySavings,
    salaryGrowthRate,
    investmentStrategy,
    customReturn,
    monthlySpending,
    retirementIncome,
    withdrawalRate,
  } = inputs;

  const inflationRate = 0.02; // 2%
  const annualReturnRate =
    (parseFloat(customReturn) || strategyReturns[investmentStrategy]) / 100;
  const annualSalaryGrowth = parseFloat(salaryGrowthRate) / 100;
  const safeWithdrawalRate = parseFloat(withdrawalRate) / 100;

  // Target Amount = (Annual Spending - Annual Pension) / Withdrawal Rate
  const annualSpending = parseNumber(monthlySpending) * 12;
  const annualPension = parseNumber(retirementIncome) * 12;
  const targetAmount = (annualSpending - annualPension) / safeWithdrawalRate;

  // Coast FIRE Target: Amount needed NOW to grow to Target Amount by age 65 without further contributions
  const yearsTo65 = 65 - parseInt(currentAge, 10);
  const coastFireTarget = targetAmount / Math.pow(1 + annualReturnRate, yearsTo65);

  // Barista FIRE Target: Target Amount if you cover 50% of expenses with part-time work
  const baristaTargetAmount = (annualSpending * 0.5 - annualPension) / safeWithdrawalRate;

  if (parseNumber(currentSavings) >= targetAmount) {
    return {
      yearsToFire: 0,
      finalAge: parseInt(currentAge, 10),
      chartData: [],
      finalTargetAmount: targetAmount,
      totalContributions: parseNumber(currentSavings),
      totalReturns: 0,
      coastFireTarget,
      baristaTargetAmount,
    };
  }

  let futureValue = parseNumber(currentSavings);
  let currentMonthlySavings = parseNumber(monthlySavings);
  let totalContributions = parseNumber(currentSavings);
  let years = 0;
  const age = parseInt(currentAge, 10);

  const chartData = [
    {
      year: 0,
      age: age,
      assets: futureValue,
      contribution: totalContributions,
      target: targetAmount,
      coast: coastFireTarget * Math.pow(1 + annualReturnRate, 0),
    },
  ];
  let currentTargetAmount = targetAmount;

  while (futureValue < currentTargetAmount && years < 100) {
    years++;
    currentMonthlySavings *= 1 + annualSalaryGrowth;
    totalContributions += currentMonthlySavings * 12;

    futureValue = futureValue * (1 + annualReturnRate);
    futureValue += currentMonthlySavings * 12;

    const eventForYear = lifeEvents.find((e) => e.year === years);
    if (eventForYear) {
      const eventAmount = parseNumber(eventForYear.amount);
      if (eventForYear.type === "oneTimeExpense") {
        futureValue -= eventAmount;
      } else {
        futureValue += eventAmount;
        totalContributions += eventAmount;
      }
    }

    currentTargetAmount *= 1 + inflationRate; // Target grows with inflation

    chartData.push({
      year: years,
      age: age + years,
      assets: Math.round(futureValue),
      contribution: Math.round(totalContributions),
      target: Math.round(currentTargetAmount),
      coast: 0,
    });
  }

  const finalYears = years >= 100 ? Infinity : years;
  return {
    yearsToFire: finalYears,
    finalAge: finalYears === Infinity ? Infinity : age + finalYears,
    chartData,
    finalTargetAmount: Math.round(currentTargetAmount),
    totalContributions: Math.round(totalContributions),
    totalReturns: Math.round(futureValue - totalContributions),
    coastFireTarget: Math.round(coastFireTarget),
    baristaTargetAmount: Math.round(baristaTargetAmount),
  };
};

// --- Components ---

const CurrencyInput = ({
  label,
  value,
  onValueChange,
  quickAmounts,
  icon: Icon
}: {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  quickAmounts?: number[];
  icon?: any;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(Number(rawValue))) {
      onValueChange(Number(rawValue).toLocaleString());
    }
  };

  return (
    <div className="space-y-2 group">
      <label className="text-sm font-medium text-slate-400 group-focus-within:text-primary transition-colors flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full p-4 pl-4 text-lg font-bold bg-zinc-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white placeholder:text-zinc-700"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium group-focus-within:text-white transition-colors">
          원
        </span>
      </div>
      {quickAmounts && (
        <div className="flex gap-2 flex-wrap">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                const current = Number(value.replace(/,/g, "")) || 0;
                onValueChange((current + amount).toLocaleString());
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-white/5 text-slate-300 rounded-full hover:bg-white/10 hover:text-white border border-white/5 transition-all"
            >
              +{amount / 10000}만
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function FireCalculatorPage() {
  const [step, setStep] = useState<CalculationStep>("intro");
  const [inputs, setInputs] = useState<FireInputs>({
    currentAge: "30",
    monthlySpending: "3,000,000",
    currentSavings: "50,000,000",
    monthlySavings: "1,500,000",
    salaryGrowthRate: "5",
    investmentStrategy: "balanced",
    customReturn: "",
    retirementIncome: "0",
    withdrawalRate: "4",
  });
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);

  const handleInputChange = (
    field: keyof FireInputs,
    value: string | InvestmentStrategy
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value as any }));
  };

  const {
    yearsToFire,
    finalAge,
    chartData,
    finalTargetAmount,
    totalContributions,
    totalReturns,
    coastFireTarget,
    baristaTargetAmount,
  } = useMemo(
    () => calculateFireDate(inputs, lifeEvents),
    [inputs, lifeEvents]
  );

  useEffect(() => {
    if (step === 'result' && yearsToFire !== Infinity) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6']
      });
    }
  }, [step, yearsToFire]);

  const addLifeEvent = () =>
    setLifeEvents([
      ...lifeEvents,
      {
        year: 1,
        type: "oneTimeExpense",
        amount: "10,000,000",
        description: "이벤트",
      },
    ]);

  const updateLifeEvent = (
    index: number,
    field: keyof LifeEvent,
    value: string | number
  ) => {
    const newEvents = [...lifeEvents];
    // @ts-ignore
    newEvents[index] = { ...newEvents[index], [field]: value };
    setLifeEvents(newEvents);
  };

  const removeLifeEvent = (index: number) =>
    setLifeEvents(lifeEvents.filter((_, i) => i !== index));

  return (
    <main className="w-full min-h-screen bg-black pb-20 selection:bg-indigo-500/30">
      {/* Deep Space Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-black pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-1000" />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 overflow-hidden text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto px-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 text-indigo-300 font-medium text-sm mb-8 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]">
              <Flame className="w-4 h-4 text-indigo-400" />
              <span className="tracking-wide">FIRE Movement Simulator</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
              Design Your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                Financial Freedom
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              단순히 돈을 모으는 것이 아닙니다. <br className="hidden sm:block" />
              당신의 시간을 되찾는 가장 정교한 시뮬레이션을 경험하세요.
            </p>
          </motion.div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative">
          <AnimatePresence mode="wait">
            {step === "intro" ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
                className="glass-card bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden group"
              >
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-xl mx-auto space-y-12 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { icon: Target, label: "목표 설정", desc: "나만의 기준" },
                      { icon: TrendingUp, label: "투자 전략", desc: "복리의 마법" },
                      { icon: Sparkles, label: "자유 달성", desc: "새로운 삶" },
                    ].map(({ icon: Icon, label, desc }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 ring-1 ring-white/10">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="block font-bold text-white text-lg mb-1">{label}</span>
                          <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">{desc}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-slate-300 text-lg leading-relaxed">
                      현재 자산부터 은퇴 후 꿈꾸는 라이프스타일까지,<br />
                      AI 알고리즘이 당신의 <span className="text-indigo-400 font-bold">경제적 자유 시점</span>을 예측해드립니다.
                    </p>
                  </div>

                  <motion.button
                    layoutId="next-button"
                    onClick={() => setStep("essentials")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl text-lg hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      시뮬레이션 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden"
              >
                {/* Modern Step Indicator */}
                <div className="bg-zinc-950/50 border-b border-white/5 px-4 pt-8 pb-0">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center relative pb-8">
                      {/* Progress Line */}
                      <div className="absolute top-4 left-0 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(['essentials', 'investment', 'events', 'result'].indexOf(step) / 3) * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                      </div>

                      {(["기본 정보", "투자 전략", "생애 이벤트", "결과 확인"] as const).map(
                        (name, index) => {
                          const stepOrder: CalculationStep[] = [
                            "essentials",
                            "investment",
                            "events",
                            "result",
                          ];
                          const currentIdx = stepOrder.indexOf(step);
                          const isActive = currentIdx >= index;
                          const isCurrent = currentIdx === index;

                          return (
                            <div key={name} className="relative z-10 flex flex-col items-center gap-3 w-20">
                              <motion.div
                                animate={{
                                  scale: isCurrent ? 1.2 : 1,
                                  backgroundColor: isActive ? "#6366f1" : "rgba(255,255,255,0.05)",
                                  borderColor: isActive ? "#818cf8" : "rgba(255,255,255,0.1)"
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-black border transition-colors ${isActive ? "text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "text-slate-500 border-white/10"}`}
                              >
                                {isActive ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                              </motion.div>
                              <span className={`text-[11px] font-bold tracking-tight uppercase ${isActive ? "text-white" : "text-slate-600"}`}>
                                {name}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-12 relative">
                  {step === "essentials" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10 max-w-2xl mx-auto"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-3">현재 상황을 입력해주세요</h2>
                        <p className="text-slate-400 text-lg">가장 기본적인 데이터를 바탕으로 시작합니다.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group">
                          <label className="text-sm font-medium text-slate-400 group-focus-within:text-primary transition-colors">현재 나이</label>
                          <input
                            type="number"
                            value={inputs.currentAge}
                            onChange={(e) => handleInputChange("currentAge", e.target.value)}
                            className="w-full p-4 text-lg font-bold bg-zinc-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white"
                          />
                        </div>
                        <CurrencyInput
                          label="현재 모은 돈 (순자산)"
                          value={inputs.currentSavings}
                          onValueChange={(v) => handleInputChange("currentSavings", v)}
                          quickAmounts={[10000000, 50000000]}
                          icon={Coins}
                        />
                        <CurrencyInput
                          label="월 저축/투자 금액"
                          value={inputs.monthlySavings}
                          onValueChange={(v) => handleInputChange("monthlySavings", v)}
                          quickAmounts={[100000, 500000]}
                          icon={PiggyBank}
                        />
                        <CurrencyInput
                          label="은퇴 후 월 목표 생활비"
                          value={inputs.monthlySpending}
                          onValueChange={(v) => handleInputChange("monthlySpending", v)}
                          quickAmounts={[100000, 500000]}
                          icon={Coffee}
                        />
                      </div>

                      <motion.button
                        layoutId="next-button"
                        onClick={() => setStep("investment")}
                        className="w-full py-5 bg-white text-black font-bold rounded-2xl text-lg hover:bg-slate-200 transition-all mt-8"
                      >
                        다음 단계로
                      </motion.button>
                    </motion.div>
                  )}

                  {step === "investment" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10 max-w-3xl mx-auto"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-3">미래 계획 설계</h2>
                        <p className="text-slate-400 text-lg">투자 성향에 따른 기대 수익률을 설정합니다.</p>
                      </div>

                      <div className="space-y-6">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center block mb-6">투자 성향 선택</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          {[
                            { id: "conservative", Icon: Shield, label: "안정형", return: 4, desc: "예금 위주 / 잃지 않는 투자" },
                            { id: "balanced", Icon: TrendingUp, label: "균형형", return: 7, desc: "주식+채권 / 시장 평균 추구" },
                            { id: "aggressive", Icon: Rocket, label: "공격형", return: 10, desc: "주식 위주 / 고수익 추구" },
                          ].map(({ id, Icon, label, return: returnValue, desc }) => (
                            <button
                              key={id}
                              onClick={() => handleInputChange("investmentStrategy", id as InvestmentStrategy)}
                              className={`group relative p-6 rounded-2xl border-2 transition-all text-center space-y-4 overflow-hidden ${inputs.investmentStrategy === id
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-800"
                                }`}
                            >
                              <div className={`relative z-10 w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all ${inputs.investmentStrategy === id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-white/5 text-slate-400 group-hover:bg-white/10"
                                }`}>
                                <Icon className="w-6 h-6" />
                              </div>

                              <div className="relative z-10">
                                <p className={`font-bold text-lg mb-1 ${inputs.investmentStrategy === id ? "text-white" : "text-slate-300"}`}>{label}</p>
                                <p className="text-xs text-slate-500 line-clamp-2">{desc}</p>
                              </div>
                              <div className={`relative z-10 text-2xl font-black ${inputs.investmentStrategy === id ? "text-indigo-400" : "text-slate-600"}`}>
                                {returnValue}%
                              </div>

                              {inputs.investmentStrategy === id && (
                                <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-400 block">소득 상승률 (%)</label>
                          <input
                            type="number"
                            value={inputs.salaryGrowthRate}
                            onChange={(e) => handleInputChange("salaryGrowthRate", e.target.value)}
                            className="w-full p-3 font-bold bg-zinc-900/50 border border-white/10 rounded-lg text-white focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-400 block">은퇴 후 추가 소득 (월)</label>
                          <CurrencyInput
                            label=""
                            value={inputs.retirementIncome}
                            onValueChange={(v) => handleInputChange("retirementIncome", v)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            4% 룰 (인출률)
                            <div className="group relative">
                              <Info className="w-3 h-3 text-slate-500 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-zinc-800 text-zinc-300 text-xs rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                은퇴 자금의 몇 %를 매년 꺼내 쓸지 결정합니다. 낮을수록 안전합니다.
                              </div>
                            </div>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={inputs.withdrawalRate}
                              onChange={(e) => handleInputChange("withdrawalRate", e.target.value)}
                              className="w-full p-3 font-bold bg-zinc-900/50 border border-white/10 rounded-lg text-white focus:border-indigo-500"
                            />
                            <span className="font-bold text-slate-500">%</span>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        layoutId="next-button"
                        onClick={() => setStep("events")}
                        className="w-full py-5 bg-white text-black font-bold rounded-2xl text-lg hover:bg-slate-200 transition-all mt-8"
                      >
                        다음 단계로
                      </motion.button>
                    </motion.div>
                  )}

                  {step === "events" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10 max-w-3xl mx-auto"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-3">라이프 이벤트</h2>
                        <p className="text-slate-400 text-lg">결혼, 주택 구입 등 큰 자금의 흐름을 미리 계획하세요.</p>
                      </div>

                      <div className="space-y-4 min-h-[300px]">
                        <AnimatePresence>
                          {lifeEvents.map((event, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 bg-zinc-800/40 border border-white/5 rounded-2xl flex items-center gap-3 flex-wrap"
                            >
                              <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-lg border border-white/5">
                                <input
                                  type="number"
                                  value={event.year}
                                  onChange={(e) => updateLifeEvent(index, "year", Number(e.target.value))}
                                  className="w-12 text-center bg-transparent font-bold outline-none text-white border-b border-transparent focus:border-indigo-500 transition-colors"
                                />
                                <span className="text-sm text-slate-500">년 후</span>
                              </div>

                              <input
                                type="text"
                                placeholder="이벤트명 (예: 결혼)"
                                value={event.description}
                                onChange={(e) => updateLifeEvent(index, "description", e.target.value)}
                                className="flex-grow p-2 bg-transparent border-b border-white/10 focus:border-indigo-500 outline-none text-white placeholder:text-slate-600 transition-colors"
                              />

                              <select
                                value={event.type}
                                onChange={(e) => updateLifeEvent(index, "type", e.target.value)}
                                className="p-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-slate-300 focus:text-white outline-none"
                              >
                                <option value="oneTimeExpense">지출 (-)</option>
                                <option value="oneTimeIncome">수입 (+)</option>
                              </select>

                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={formatNumber(parseNumber(event.amount))}
                                  onChange={(e) => updateLifeEvent(index, "amount", e.target.value.replace(/[^0-9]/g, ""))}
                                  className="w-28 text-right bg-transparent border-b border-white/10 focus:border-indigo-500 outline-none font-bold text-white"
                                />
                                <span className="text-sm text-slate-500">원</span>
                              </div>

                              <button onClick={() => removeLifeEvent(index)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all">
                                <Trash2 size={18} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <button
                          onClick={addLifeEvent}
                          className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <PlusCircle size={20} /> 이벤트 추가하기
                        </button>
                      </div>

                      <motion.button
                        layoutId="next-button"
                        onClick={() => setStep("result")}
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl text-lg hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all"
                      >
                        결과 확인하기
                      </motion.button>
                    </motion.div>
                  )}

                  {step === "result" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-12"
                    >
                      <div className="text-center space-y-6">
                        {yearsToFire === Infinity ? (
                          <div className="p-10 bg-red-500/5 rounded-[2rem] border border-red-500/20 backdrop-blur-md">
                            <h2 className="text-3xl font-bold text-red-400 mb-2">목표 달성이 어렵습니다 😥</h2>
                            <p className="text-slate-400">저축액을 늘리거나, 목표 생활비를 조금 조정해보세요.</p>
                          </div>
                        ) : (
                          <div className="relative p-10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2rem] border border-indigo-500/20 backdrop-blur-md overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                            <div className="relative z-10">
                              <p className="text-lg text-indigo-300 font-medium mb-4 uppercase tracking-wider">Financial Freedom</p>
                              <h2 className="text-6xl sm:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
                                <CountUp end={yearsToFire} duration={2} />
                                <span className="text-4xl sm:text-6xl text-white/50 ml-2">Years</span>
                              </h2>
                              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xl text-slate-300">
                                <span className="font-bold text-white">{finalAge}세</span>에 은퇴 가능합니다
                                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { label: "최종 목표 금액", value: finalTargetAmount, color: "text-white" },
                          { label: "총 납입 원금", value: totalContributions, color: "text-slate-400" },
                          { label: "총 투자 수익", value: totalReturns, color: "text-emerald-400" },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="bg-white/5 p-6 rounded-3xl text-center border border-white/5 hover:bg-white/10 transition-colors"
                          >
                            <p className="text-sm text-slate-500 font-medium mb-2 uppercase tracking-wide">{item.label}</p>
                            <p className={`text-2xl sm:text-3xl font-bold ${item.color}`}>
                              <CountUp end={item.value} separator="," />원
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-8 rounded-3xl border border-orange-500/20 relative overflow-hidden group">
                          <div className="absolute -right-10 -top-10 text-orange-500/10 group-hover:text-orange-500/20 transition-colors">
                            <Palmtree size={150} />
                          </div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4 text-orange-400">
                              <div className="p-2 rounded-lg bg-orange-500/20">
                                <Palmtree className="w-6 h-6" />
                              </div>
                              <h3 className="font-bold text-xl">Coast FIRE</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                              지금 당장 은퇴하진 않지만, <br />더 이상 노후 대비 저축을 하지 않아도 되는 상태
                            </p>
                            <p className="text-3xl font-bold text-white">
                              <CountUp end={coastFireTarget} separator="," />원
                            </p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">
                              * 현재 이 금액이 있다면 저축 중단 가능
                            </p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
                          <div className="absolute -right-10 -top-10 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                            <Coffee size={150} />
                          </div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4 text-emerald-400">
                              <div className="p-2 rounded-lg bg-emerald-500/20">
                                <Coffee className="w-6 h-6" />
                              </div>
                              <h3 className="font-bold text-xl">Barista FIRE</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                              생활비의 50%를 소일거리로 충당하며 <br />반은퇴 상태를 즐기는 목표액
                            </p>
                            <p className="text-3xl font-bold text-white">
                              <CountUp end={baristaTargetAmount} separator="," />원
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="h-[500px] w-full bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 sm:p-8 backdrop-blur-sm relative">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-400" />
                          자산 성장 시뮬레이션
                        </h3>
                        <ResponsiveContainer width="100%" height="90%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} stroke="#ffffff" vertical={false} />
                            <XAxis
                              dataKey="age"
                              unit="세"
                              stroke="#94a3b8"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12 }}
                              dy={10}
                            />
                            <YAxis
                              tickFormatter={(v) => `${(v / 100000000).toFixed(0)}억`}
                              stroke="#94a3b8"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                                padding: '16px'
                              }}
                              itemStyle={{ color: '#fff' }}
                              formatter={(value: number) => `${formatNumber(value)}원`}
                              labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area
                              type="monotone"
                              dataKey="assets"
                              name="총 자산"
                              stroke="#6366f1"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorAssets)"
                              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                            />
                            <Area
                              type="monotone"
                              dataKey="contribution"
                              name="납입 원금"
                              stroke="#94a3b8"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              fill="transparent"
                              opacity={0.5}
                            />
                            <Area
                              type="monotone"
                              dataKey="target"
                              name="목표 금액 (인플레이션)"
                              stroke="#fb923c"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              fill="transparent"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex justify-center pt-8">
                        <button
                          onClick={() => setStep("essentials")}
                          className="px-8 py-4 border border-white/10 bg-white/5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-all text-sm font-bold tracking-wide uppercase"
                        >
                          조건 변경하여 다시 계산하기
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Ad */}
          <div className="mt-20">
            <AdUnit slotId="9988776655" format="auto" label="FIRE Bottom Ad" />
          </div>
        </div>
      </div>
    </main>
  );
}
