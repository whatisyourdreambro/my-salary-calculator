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
  PiggyBank,
  Landmark,
  Gem
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
    <div className="space-y-4 group">
      <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-accent" />}
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full py-4 text-3xl font-serif font-bold bg-transparent border-b-2 border-stone-200 dark:border-stone-800 focus:border-primary transition-all text-foreground placeholder-stone-300 outline-none"
        />
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 font-serif text-xl pointer-events-none group-focus-within:text-primary transition-colors">
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
              className="px-4 py-2 text-xs font-bold bg-stone-100 dark:bg-stone-900 text-stone-500 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-primary transition-all uppercase tracking-wider"
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
        colors: ['#cc9254', '#26594C', '#E7E5E4']
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
    <main className="w-full min-h-screen bg-stone-50/50 dark:bg-[#0c0a09] pb-20 selection:bg-accent/30 selection:text-accent-foreground">
      {/* Texture Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />

      {/* Content Wrapper */}
      <div className="relative z-10 w-full pt-12">
        {/* Header Logo Area */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm text-stone-500 font-serif text-sm tracking-widest uppercase mb-6 shadow-sm">
            <Landmark className="w-4 h-4" />
            <span>Private Wealth Management</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif font-medium text-foreground tracking-tight">
            FIRE Calculator
          </h1>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatePresence mode="wait">
            {step === "intro" ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white dark:bg-[#1C1917] p-8 sm:p-20 rounded-[3rem] shadow-2xl border border-stone-100 dark:border-stone-800 text-center relative overflow-hidden group"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-xl mx-auto space-y-16 relative z-10">
                  <div className="space-y-6">
                    <p className="text-xl sm:text-2xl font-serif text-stone-500 leading-relaxed">
                      "Financial Independence, Retire Early"<br />
                      <span className="text-foreground font-medium">경제적 자유</span>를 향한 당신의 여정을 설계해드립니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                      { icon: Target, label: "GOAL", desc: "명확한 목표 설정" },
                      { icon: TrendingUp, label: "STRATEGY", desc: "맞춤형 투자 전략" },
                      { icon: Gem, label: "FREEDOM", desc: "진정한 자유 달성" },
                    ].map(({ icon: Icon, label, desc }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="flex flex-col items-center gap-4 group/item"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 flex items-center justify-center text-stone-400 group-hover/item:text-accent group-hover/item:border-accent/30 transition-all duration-500 shadow-sm group-hover/item:shadow-lg">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="block font-bold font-serif text-foreground text-lg mb-1">{label}</span>
                          <span className="text-xs text-stone-400 font-bold tracking-widest uppercase">{desc}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    layoutId="next-button"
                    onClick={() => setStep("essentials")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full max-w-sm mx-auto py-6 bg-primary text-white font-serif font-bold tracking-wider rounded-xl text-lg hover:shadow-xl hover:shadow-primary/20 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      START SIMULATION <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1C1917] rounded-[3rem] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
              >
                {/* Modern Step Indicator */}
                <div className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-8 py-10">
                  <div className="max-w-3xl mx-auto relative">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 dark:bg-stone-800 -translate-y-1/2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(['essentials', 'investment', 'events', 'result'].indexOf(step) / 3) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    </div>

                    <div className="flex justify-between relative z-10">
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
                            <div key={name} className="flex flex-col items-center gap-4">
                              <motion.div
                                animate={{
                                  scale: isCurrent ? 1.2 : 1,
                                  backgroundColor: isActive ? "#CC9254" : "var(--background)",
                                  borderColor: isActive ? "#CC9254" : "var(--border)"
                                }}
                                className={`w-4 h-4 rounded-full border-2 transition-colors duration-500 ${isActive ? "shadow-[0_0_15px_rgba(204,146,84,0.4)]" : "bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700"}`}
                              />
                              <span className={`text-[10px] font-bold tracking-widest uppercase ${isActive ? "text-accent" : "text-stone-400"}`}>
                                {name}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 sm:p-16 relative min-h-[600px] flex items-center">
                  {step === "essentials" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-16 max-w-2xl mx-auto w-full"
                    >
                      <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Current Status</h2>
                        <p className="text-stone-500 font-sans">현재의 재무 상태를 입력해주세요.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="space-y-4 group">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">현재 나이</label>
                          <input
                            type="number"
                            value={inputs.currentAge}
                            onChange={(e) => handleInputChange("currentAge", e.target.value)}
                            className="w-full py-4 text-3xl font-serif font-bold bg-transparent border-b-2 border-stone-200 dark:border-stone-800 focus:border-primary transition-all text-foreground outline-none"
                          />
                        </div>
                        <CurrencyInput
                          label="현재 순자산"
                          value={inputs.currentSavings}
                          onValueChange={(v) => handleInputChange("currentSavings", v)}
                          quickAmounts={[10000000, 50000000]}
                          icon={Coins}
                        />
                        <CurrencyInput
                          label="월 저축/투자액"
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
                        className="w-full py-5 bg-stone-900 dark:bg-white text-white dark:text-black font-serif font-bold rounded-xl text-lg hover:shadow-xl transition-all mt-8 tracking-wide"
                      >
                        NEXT STEP
                      </motion.button>
                    </motion.div>
                  )}

                  {step === "investment" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-16 max-w-4xl mx-auto w-full"
                    >
                      <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Investment Strategy</h2>
                        <p className="text-stone-500">투자 성향에 따른 포트폴리오 전략을 선택하세요.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                          { id: "conservative", Icon: Shield, label: "CONSERVATIVE", return: 4, desc: "안정 추구형 (예금 위주)" },
                          { id: "balanced", Icon: TrendingUp, label: "BALANCED", return: 7, desc: "시장 수익형 (주식+채권)" },
                          { id: "aggressive", Icon: Rocket, label: "AGGRESSIVE", return: 10, desc: "고수익 추구형 (주식 위주)" },
                        ].map(({ id, Icon, label, return: returnValue, desc }) => (
                          <button
                            key={id}
                            onClick={() => handleInputChange("investmentStrategy", id as InvestmentStrategy)}
                            className={`group relative p-8 rounded-[2rem] border transition-all text-center space-y-6 overflow-hidden ${inputs.investmentStrategy === id
                              ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                              : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700"
                              }`}
                          >
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${inputs.investmentStrategy === id ? "bg-accent text-white shadow-lg shadow-accent/30" : "bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700"
                              }`}>
                              <Icon className="w-6 h-6" />
                            </div>

                            <div className="relative z-10">
                              <p className={`font-serif font-bold text-base mb-2 tracking-widest ${inputs.investmentStrategy === id ? "text-accent" : "text-stone-500"}`}>{label}</p>
                              <p className="text-xs text-stone-400 leading-relaxed font-sans">{desc}</p>
                            </div>
                            <div className={`text-3xl font-serif font-black ${inputs.investmentStrategy === id ? "text-foreground" : "text-stone-300"}`}>
                              {returnValue}%
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-stone-100 dark:border-stone-800">
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block">소득 상승률 (%)</label>
                          <input
                            type="number"
                            value={inputs.salaryGrowthRate}
                            onChange={(e) => handleInputChange("salaryGrowthRate", e.target.value)}
                            className="w-full py-3 text-xl font-bold bg-transparent border-b border-stone-200 dark:border-stone-800 focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block mb-3">은퇴 후 추가 소득 (월)</label>
                          <input
                            type="text"
                            value={inputs.retirementIncome}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              handleInputChange("retirementIncome", Number(raw).toLocaleString())
                            }}
                            className="w-full py-3 text-xl font-bold bg-transparent border-b border-stone-200 dark:border-stone-800 focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                            4% 룰 (인출률)
                            <div className="group relative">
                              <Info className="w-3 h-3 text-stone-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-stone-900 text-stone-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 font-sans z-50">
                                은퇴 자금의 몇 %를 매년 꺼내 쓸지 결정합니다. 낮을수록 안전합니다.
                              </div>
                            </div>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={inputs.withdrawalRate}
                              onChange={(e) => handleInputChange("withdrawalRate", e.target.value)}
                              className="w-full py-3 text-xl font-bold bg-transparent border-b border-stone-200 dark:border-stone-800 focus:border-primary outline-none"
                            />
                            <span className="font-bold text-stone-400 font-serif">%</span>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        layoutId="next-button"
                        onClick={() => setStep("events")}
                        className="w-full py-5 bg-stone-900 dark:bg-white text-white dark:text-black font-serif font-bold rounded-xl text-lg hover:shadow-xl transition-all mt-8 tracking-wide"
                      >
                        NEXT STEP
                      </motion.button>
                    </motion.div>
                  )}

                  {step === "events" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-16 max-w-3xl mx-auto w-full"
                    >
                      <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Life Events</h2>
                        <p className="text-stone-500">결혼, 주택 구입 등 큰 자금의 흐름을 미리 계획하세요.</p>
                      </div>

                      <div className="space-y-4 min-h-[300px]">
                        <AnimatePresence>
                          {lifeEvents.map((event, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-6 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl flex items-center gap-6 flex-wrap shadow-sm"
                            >
                              <div className="flex items-center gap-2 bg-white dark:bg-black p-3 rounded-xl border border-stone-100 dark:border-stone-800 shadow-inner">
                                <input
                                  type="number"
                                  value={event.year}
                                  onChange={(e) => updateLifeEvent(index, "year", Number(e.target.value))}
                                  className="w-12 text-center bg-transparent font-bold outline-none text-foreground border-none p-0"
                                />
                                <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Years Later</span>
                              </div>

                              <input
                                type="text"
                                placeholder="Event Name (e.g. Wedding)"
                                value={event.description}
                                onChange={(e) => updateLifeEvent(index, "description", e.target.value)}
                                className="flex-grow p-2 bg-transparent border-b border-stone-200 dark:border-stone-700 focus:border-primary outline-none text-foreground placeholder-stone-400 text-lg font-serif"
                              />

                              <select
                                value={event.type}
                                onChange={(e) => updateLifeEvent(index, "type", e.target.value)}
                                className="p-2 bg-transparent font-bold text-sm text-stone-500 focus:text-foreground outline-none cursor-pointer"
                              >
                                <option value="oneTimeExpense">EXPENSE (-)</option>
                                <option value="oneTimeIncome">INCOME (+)</option>
                              </select>

                              <div className="flex items-center gap-2 ml-auto">
                                <input
                                  type="text"
                                  value={formatNumber(parseNumber(event.amount))}
                                  onChange={(e) => updateLifeEvent(index, "amount", e.target.value.replace(/[^0-9]/g, ""))}
                                  className="w-32 text-right bg-transparent border-b border-stone-200 dark:border-stone-700 focus:border-primary outline-none font-bold text-xl font-serif text-foreground"
                                />
                                <span className="text-sm text-stone-400">원</span>
                              </div>

                              <button onClick={() => removeLifeEvent(index)} className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                                <Trash2 size={18} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <button
                          onClick={addLifeEvent}
                          className="w-full py-6 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl text-stone-400 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-wider text-sm"
                        >
                          <PlusCircle size={20} /> Add Life Event
                        </button>
                      </div>

                      <motion.button
                        layoutId="next-button"
                        onClick={() => setStep("result")}
                        className="w-full py-5 bg-gradient-to-r from-primary to-emerald-800 text-white font-serif font-bold rounded-xl text-lg hover:shadow-xl hover:shadow-primary/20 transition-all tracking-wide"
                      >
                        VIEW FULL REPORT
                      </motion.button>
                    </motion.div>
                  )}

                  {step === "result" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-16 w-full"
                    >
                      <div className="text-center space-y-8">
                        {yearsToFire === Infinity ? (
                          <div className="p-12 bg-stone-100 rounded-[3rem] border border-stone-200">
                            <h2 className="text-4xl font-serif font-bold text-stone-400 mb-4">Goal Unattainable</h2>
                            <p className="text-stone-500">현재 조건으로는 목표 달성이 어렵습니다. 투자 전략을 수정해보세요.</p>
                          </div>
                        ) : (
                          <div className="relative p-12 sm:p-20 bg-primary/5 dark:bg-stone-900 rounded-[3rem] border border-primary/10 overflow-hidden">
                            {/* Floral/Abstract Pattern */}
                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

                            <div className="relative z-10">
                              <p className="text-sm text-accent font-bold mb-6 uppercase tracking-[0.2em]">Financial Independence</p>
                              <h2 className="text-7xl sm:text-9xl font-serif font-medium text-foreground mb-8 tracking-tighter">
                                <CountUp end={yearsToFire} duration={2} />
                                <span className="text-4xl sm:text-6xl text-stone-300 ml-4 italic">Years</span>
                              </h2>
                              <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-white dark:bg-black border border-stone-200 dark:border-stone-800 text-2xl text-stone-500 shadow-xl">
                                <span className="font-bold text-foreground">{finalAge}세</span>에 은퇴 가능합니다
                                <Sparkles className="w-5 h-5 text-accent fill-accent" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                          { label: "Final Goal", value: finalTargetAmount, color: "text-foreground" },
                          { label: "Total Principal", value: totalContributions, color: "text-stone-400" },
                          { label: "Total Returns", value: totalReturns, color: "text-emerald-600 dark:text-emerald-400" },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] text-center border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all"
                          >
                            <p className="text-xs text-stone-400 font-bold mb-4 uppercase tracking-[0.15em]">{item.label}</p>
                            <p className={`text-3xl font-serif font-bold ${item.color}`}>
                              <CountUp end={item.value} separator="," />원
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#cc9254]/10 p-10 rounded-[2.5rem] border border-[#cc9254]/20 relative overflow-hidden group">
                          <div className="absolute -right-12 -top-12 text-[#cc9254]/10 group-hover:text-[#cc9254]/20 transition-colors duration-500">
                            <Palmtree size={200} />
                          </div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6 text-[#cc9254]">
                              <div className="p-3 rounded-2xl bg-[#cc9254]/20">
                                <Palmtree className="w-6 h-6" />
                              </div>
                              <h3 className="font-serif font-bold text-2xl tracking-tight">Coast FIRE</h3>
                            </div>
                            <p className="text-sm text-stone-500 mb-8 leading-relaxed max-w-xs font-medium">
                              지금 은퇴하진 않지만, <br />더 이상 노후 대비 저축을 하지 않아도 되는 상태
                            </p>
                            <p className="text-4xl font-serif font-bold text-foreground">
                              <CountUp end={coastFireTarget} separator="," />원
                            </p>
                            <p className="text-xs text-stone-400 mt-3 font-bold uppercase tracking-wider">
                              Target Principal
                            </p>
                          </div>
                        </div>
                        <div className="bg-[#26594c]/10 p-10 rounded-[2.5rem] border border-[#26594c]/20 relative overflow-hidden group">
                          <div className="absolute -right-12 -top-12 text-[#26594c]/10 group-hover:text-[#26594c]/20 transition-colors duration-500">
                            <Coffee size={200} />
                          </div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6 text-[#26594c]">
                              <div className="p-3 rounded-2xl bg-[#26594c]/20">
                                <Coffee className="w-6 h-6" />
                              </div>
                              <h3 className="font-serif font-bold text-2xl tracking-tight">Barista FIRE</h3>
                            </div>
                            <p className="text-sm text-stone-500 mb-8 leading-relaxed max-w-xs font-medium">
                              생활비의 50%를 소일거리로 충당하며 <br />반은퇴 상태를 즐기는 목표액
                            </p>
                            <p className="text-4xl font-serif font-bold text-foreground">
                              <CountUp end={baristaTargetAmount} separator="," />원
                            </p>
                            <p className="text-xs text-stone-400 mt-3 font-bold uppercase tracking-wider">
                              Target Principal
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
