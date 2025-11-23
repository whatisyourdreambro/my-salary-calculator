"use client";

import { useState, useMemo } from "react";
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
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import AdUnit from "@/components/AdUnit";

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
  withdrawalRate: string; // New: 4% rule adjustment
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
      coast: coastFireTarget * Math.pow(1 + annualReturnRate, 0), // Coast line grows? No, Coast target is static present value usually, but for chart we can show "Coast Path"
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
      coast: 0, // Placeholder
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
}: {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  quickAmounts?: number[];
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(Number(rawValue))) {
      onValueChange(Number(rawValue).toLocaleString());
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full p-4 text-lg font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
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
              className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
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
    setInputs((prev) => ({ ...prev, [field]: value }));
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
    <main className="w-full min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300 font-medium text-sm mb-6">
              <Flame className="w-4 h-4" />
              <span>FIRE Movement Simulator</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              경제적 자유를 향한 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                가장 현실적인 로드맵
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              단순한 계산을 넘어, 당신의 인생 계획을 시뮬레이션합니다. <br className="hidden sm:block" />
              언제쯤 일에서 해방될 수 있을지 확인해보세요.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <AnimatePresence mode="wait">
          {step === "intro" ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-3xl shadow-2xl border border-border p-8 sm:p-12 text-center"
            >
              <div className="max-w-lg mx-auto space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Target, label: "목표 설정" },
                    { icon: TrendingUp, label: "투자 전략" },
                    { icon: Rocket, label: "자유 달성" },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={label} className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-2xl">
                      <Icon className="w-8 h-8 text-primary" />
                      <span className="font-medium text-sm">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  현재 자산, 저축액, 그리고 예상되는 미래의 이벤트들을 입력하면
                  AI 알고리즘이 당신의 은퇴 시기를 예측해드립니다.
                </p>
                <button
                  onClick={() => setStep("essentials")}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                >
                  시뮬레이션 시작하기
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              {/* Progress Bar */}
              <div className="bg-secondary/30 border-b border-border p-4">
                <div className="flex justify-center items-center gap-2 sm:gap-4">
                  {(["기본 정보", "투자 전략", "생애 이벤트", "결과 확인"] as const).map(
                    (name, index) => {
                      const stepOrder: CalculationStep[] = [
                        "essentials",
                        "investment",
                        "events",
                        "result",
                      ];
                      const isActive = stepOrder.indexOf(step) >= index;
                      return (
                        <div key={name} className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                              }`}
                          >
                            {index + 1}
                          </div>
                          <span className={`hidden sm:inline text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                            {name}
                          </span>
                          {index < 3 && <div className="w-8 h-[2px] bg-border mx-2 hidden sm:block" />}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-10">
                {step === "essentials" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8 max-w-2xl mx-auto"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">현재 상황을 알려주세요</h2>
                      <p className="text-muted-foreground">정확한 진단을 위해 솔직하게 입력해주세요.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">현재 나이</label>
                        <input
                          type="number"
                          value={inputs.currentAge}
                          onChange={(e) => handleInputChange("currentAge", e.target.value)}
                          className="w-full p-4 text-lg font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <CurrencyInput
                        label="현재 모은 돈 (순자산)"
                        value={inputs.currentSavings}
                        onValueChange={(v) => handleInputChange("currentSavings", v)}
                        quickAmounts={[10000000, 50000000]}
                      />
                      <CurrencyInput
                        label="월 저축/투자 금액"
                        value={inputs.monthlySavings}
                        onValueChange={(v) => handleInputChange("monthlySavings", v)}
                        quickAmounts={[100000, 500000]}
                      />
                      <CurrencyInput
                        label="은퇴 후 월 목표 생활비"
                        value={inputs.monthlySpending}
                        onValueChange={(v) => handleInputChange("monthlySpending", v)}
                        quickAmounts={[100000, 500000]}
                      />
                    </div>

                    <button
                      onClick={() => setStep("investment")}
                      className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all mt-8"
                    >
                      다음 단계로
                    </button>
                  </motion.div>
                )}

                {step === "investment" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8 max-w-2xl mx-auto"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">미래 계획을 세워볼까요?</h2>
                      <p className="text-muted-foreground">투자 성향과 예상 소득 변화를 입력하세요.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">연평균 소득 상승률 (%)</label>
                        <input
                          type="number"
                          value={inputs.salaryGrowthRate}
                          onChange={(e) => handleInputChange("salaryGrowthRate", e.target.value)}
                          className="w-full p-4 text-lg font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <CurrencyInput
                        label="은퇴 후 월 추가소득 (국민연금 등)"
                        value={inputs.retirementIncome}
                        onValueChange={(v) => handleInputChange("retirementIncome", v)}
                        quickAmounts={[100000, 500000]}
                      />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          인출률 (Withdrawal Rate)
                          <div className="group relative">
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                              은퇴 자금에서 매년 꺼내 쓸 비율입니다. 통상적으로 4%가 안전하다고 알려져 있습니다.
                            </div>
                          </div>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={inputs.withdrawalRate}
                            onChange={(e) => handleInputChange("withdrawalRate", e.target.value)}
                            className="w-full p-4 text-lg font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50"
                          />
                          <span className="font-bold">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-muted-foreground">투자 성향 선택</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: "conservative", Icon: Shield, label: "안정형", return: 4, desc: "예금 위주" },
                          { id: "balanced", Icon: TrendingUp, label: "균형형", return: 7, desc: "주식+채권" },
                          { id: "aggressive", Icon: Rocket, label: "공격형", return: 10, desc: "주식 위주" },
                        ].map(({ id, Icon, label, return: returnValue, desc }) => (
                          <button
                            key={id}
                            onClick={() => handleInputChange("investmentStrategy", id as InvestmentStrategy)}
                            className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${inputs.investmentStrategy === id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-accent"
                              }`}
                          >
                            <Icon className={`w-8 h-8 mx-auto ${inputs.investmentStrategy === id ? "text-primary" : "text-muted-foreground"}`} />
                            <div>
                              <p className="font-bold">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <div className="text-sm font-bold text-primary">연 {returnValue}%</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("events")}
                      className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all mt-8"
                    >
                      다음 단계로
                    </button>
                  </motion.div>
                )}

                {step === "events" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8 max-w-2xl mx-auto"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">특별한 이벤트가 있나요?</h2>
                      <p className="text-muted-foreground">결혼, 주택 구입 등 큰 지출이나 수입을 예상해보세요.</p>
                    </div>

                    <div className="space-y-4 min-h-[200px]">
                      {lifeEvents.map((event, index) => (
                        <div key={index} className="p-4 bg-secondary/30 border border-border rounded-xl flex items-center gap-3 flex-wrap animate-fade-in-up">
                          <div className="flex items-center gap-2 bg-background p-2 rounded-lg border border-border">
                            <input
                              type="number"
                              value={event.year}
                              onChange={(e) => updateLifeEvent(index, "year", Number(e.target.value))}
                              className="w-12 text-center bg-transparent font-bold outline-none"
                            />
                            <span className="text-sm text-muted-foreground">년 후</span>
                          </div>

                          <input
                            type="text"
                            placeholder="이벤트명 (예: 결혼)"
                            value={event.description}
                            onChange={(e) => updateLifeEvent(index, "description", e.target.value)}
                            className="flex-grow p-2 bg-transparent border-b border-border focus:border-primary outline-none"
                          />

                          <select
                            value={event.type}
                            onChange={(e) => updateLifeEvent(index, "type", e.target.value)}
                            className="p-2 bg-background border border-border rounded-lg text-sm"
                          >
                            <option value="oneTimeExpense">지출 (-)</option>
                            <option value="oneTimeIncome">수입 (+)</option>
                          </select>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formatNumber(parseNumber(event.amount))}
                              onChange={(e) => updateLifeEvent(index, "amount", e.target.value.replace(/[^0-9]/g, ""))}
                              className="w-24 text-right bg-transparent border-b border-border focus:border-primary outline-none font-bold"
                            />
                            <span className="text-sm">원</span>
                          </div>

                          <button onClick={() => removeLifeEvent(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={addLifeEvent}
                        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={20} /> 이벤트 추가하기
                      </button>
                    </div>

                    <button
                      onClick={() => setStep("result")}
                      className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all mt-8"
                    >
                      결과 확인하기
                    </button>
                  </motion.div>
                )}

                {step === "result" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-4">
                      {yearsToFire === Infinity ? (
                        <div className="p-8 bg-destructive/10 rounded-2xl border border-destructive/20">
                          <h2 className="text-2xl font-bold text-destructive mb-2">목표 달성이 어렵습니다 😥</h2>
                          <p className="text-muted-foreground">저축액을 늘리거나, 목표 생활비를 조정해보세요.</p>
                        </div>
                      ) : (
                        <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
                          <p className="text-lg text-muted-foreground mb-2">경제적 자유까지</p>
                          <h2 className="text-5xl sm:text-7xl font-bold text-foreground mb-4">
                            <CountUp end={yearsToFire} />년
                          </h2>
                          <p className="text-xl">
                            <span className="font-bold text-primary">{finalAge}세</span>에 은퇴 가능합니다! 🎉
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: "최종 목표 금액", value: finalTargetAmount, color: "text-foreground" },
                        { label: "총 납입 원금", value: totalContributions, color: "text-muted-foreground" },
                        { label: "총 투자 수익", value: totalReturns, color: "text-green-500" },
                      ].map((item) => (
                        <div key={item.label} className="bg-secondary/30 p-6 rounded-xl text-center border border-border">
                          <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
                          <p className={`text-xl font-bold ${item.color}`}>
                            <CountUp end={item.value} separator="," />원
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
                          <Palmtree className="w-5 h-5" />
                          <h3 className="font-bold">Coast FIRE</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          지금 당장 은퇴하진 않지만, 더 이상 노후 대비 저축을 하지 않아도 되는 상태입니다.
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          <CountUp end={coastFireTarget} separator="," />원
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (현재 이 금액이 있다면 저축 중단 가능)
                        </p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                          <Coffee className="w-5 h-5" />
                          <h3 className="font-bold">Barista FIRE</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          생활비의 50%를 아르바이트 등으로 충당하며 반은퇴 상태를 즐기는 목표액입니다.
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          <CountUp end={baristaTargetAmount} separator="," />원
                        </p>
                      </div>
                    </div>

                    <div className="h-[400px] w-full bg-card border border-border rounded-xl p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                          <XAxis dataKey="age" unit="세" />
                          <YAxis tickFormatter={(v) => `${(v / 100000000).toFixed(0)}억`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            formatter={(value: number) => `${formatNumber(value)}원`}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="assets"
                            name="총 자산"
                            stroke="#8884d8"
                            fillOpacity={1}
                            fill="url(#colorAssets)"
                          />
                          <Area
                            type="monotone"
                            dataKey="contribution"
                            name="납입 원금"
                            stroke="#82ca9d"
                            fill="transparent"
                            strokeDasharray="5 5"
                          />
                          <Area
                            type="monotone"
                            dataKey="target"
                            name="목표 금액 (인플레이션 반영)"
                            stroke="#ff7300"
                            fill="transparent"
                            strokeDasharray="3 3"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center pt-8">
                      <button
                        onClick={() => setStep("essentials")}
                        className="px-8 py-3 border border-border rounded-full hover:bg-secondary transition-colors text-sm font-medium"
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
        <div className="mt-12">
          <AdUnit slotId="9988776655" format="auto" label="FIRE Bottom Ad" />
        </div>
      </div>
    </main>
  );
}

