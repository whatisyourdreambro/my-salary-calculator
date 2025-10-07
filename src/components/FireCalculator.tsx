// src/components/FireCalculator.tsx
"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  PlusCircle,
  Trash2,
  TrendingUp,
  Shield,
  Rocket,
  ArrowRight,
  MousePointerClick,
} from "lucide-react";

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
}

const strategyReturns = {
  conservative: 4,
  balanced: 7,
  aggressive: 10,
};

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
  } = inputs;

  const inflationRate = 0.02; // 2%
  const annualReturnRate =
    (parseFloat(customReturn) || strategyReturns[investmentStrategy]) / 100;
  const annualSalaryGrowth = parseFloat(salaryGrowthRate) / 100;

  const targetAmount =
    (parseNumber(monthlySpending) * 12 - parseNumber(retirementIncome) * 12) *
    25;

  if (parseNumber(currentSavings) >= targetAmount) {
    return {
      yearsToFire: 0,
      finalAge: parseInt(currentAge, 10),
      chartData: [],
      finalTargetAmount: targetAmount,
      totalContributions: parseNumber(currentSavings),
      totalReturns: 0,
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

    currentTargetAmount *= 1 + inflationRate;

    chartData.push({
      year: years,
      age: age + years,
      assets: Math.round(futureValue),
      contribution: Math.round(totalContributions),
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
  };
};

export default function FireCalculator() {
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
    const event = { ...newEvents[index], [field]: value };
    newEvents[index] = event;
    setLifeEvents(newEvents);
  };

  const removeLifeEvent = (index: number) =>
    setLifeEvents(lifeEvents.filter((_, i) => i !== index));

  if (step === "intro") {
    return (
      <div className="text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-indigo-300">
          나의 경제적 자유,
          <br />그 여정을 시작합니다
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100">
          당신의 재정 정보를 바탕으로, 경제적 독립과 조기 은퇴(FIRE)를 향한
          <br />
          가장 현실적인 로드맵을 시뮬레이션합니다.
        </p>
        <button
          onClick={() => setStep("essentials")}
          className="mt-10 px-12 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-200 transition-transform transform hover:scale-105 shadow-lg shadow-violet-500/30 flex items-center gap-2 mx-auto"
        >
          여정 시작하기 <ArrowRight />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <div className="flex justify-center items-center gap-2 sm:gap-4 mb-8">
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
              <div key={name} className="flex items-center gap-2 sm:gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                    isActive
                      ? "bg-violet-500 border-violet-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`hidden sm:inline-block font-semibold transition-colors ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {name}
                </span>
                {index < 3 && (
                  <div
                    className={`hidden sm:block w-8 h-1 rounded-full transition-colors ${
                      isActive ? "bg-violet-500" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            );
          }
        )}
      </div>

      <div
        className="bg-black/30 backdrop-blur-md p-6 sm:p-10 rounded-2xl shadow-2xl border border-white/20"
        key={step}
      >
        {step === "essentials" && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-center">
              1. 당신의 현재를 알려주세요
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div>
                <label className="text-sm font-medium">현재 나이</label>
                <input
                  type="number"
                  value={inputs.currentAge}
                  onChange={(e) =>
                    handleInputChange("currentAge", e.target.value)
                  }
                  className="w-full p-3 mt-1 border rounded-lg bg-gray-800 border-gray-600"
                />
              </div>
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
              <CurrencyInput
                label="은퇴 후 월 목표 생활비"
                value={inputs.monthlySpending}
                onValueChange={(v) => handleInputChange("monthlySpending", v)}
                quickAmounts={[100000, 500000]}
              />
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => setStep("investment")}
                className="px-8 py-3 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-600 transition"
              >
                다음 단계로 <ArrowRight className="inline-block" />
              </button>
            </div>
          </div>
        )}

        {step === "investment" && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-center">
              2. 당신의 미래 계획을 알려주세요
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div>
                <label className="text-sm font-medium">
                  연평균 소득 상승률 (%)
                </label>
                <input
                  type="number"
                  value={inputs.salaryGrowthRate}
                  onChange={(e) =>
                    handleInputChange("salaryGrowthRate", e.target.value)
                  }
                  className="w-full p-3 mt-1 border rounded-lg bg-gray-800 border-gray-600"
                />
              </div>
              <CurrencyInput
                label="은퇴 후 월 추가소득 (연금 등)"
                value={inputs.retirementIncome}
                onValueChange={(v) => handleInputChange("retirementIncome", v)}
                quickAmounts={[100000, 50000]}
              />
              <div className="md:col-span-2">
                <label className="text-sm font-medium">투자 성향</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    {
                      id: "conservative",
                      Icon: Shield,
                      label: "안정형",
                      return: 4,
                    },
                    {
                      id: "balanced",
                      Icon: TrendingUp,
                      label: "균형형",
                      return: 7,
                    },
                    {
                      id: "aggressive",
                      Icon: Rocket,
                      label: "공격형",
                      return: 10,
                    },
                  ].map(({ id, Icon, label, return: returnValue }) => (
                    <button
                      key={id}
                      onClick={() =>
                        handleInputChange(
                          "investmentStrategy",
                          id as InvestmentStrategy
                        )
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        inputs.investmentStrategy === id
                          ? "border-violet-400 bg-violet-900/50"
                          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1" />
                      <p className="font-semibold">{label}</p>
                      <p className="text-xs">연 {returnValue}%</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => setStep("events")}
                className="px-8 py-3 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-600 transition"
              >
                다음 단계로 <ArrowRight className="inline-block" />
              </button>
            </div>
          </div>
        )}

        {step === "events" && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-center">
              3. 예상되는 생애 이벤트가 있나요? (선택)
            </h2>
            <div className="max-w-2xl mx-auto space-y-4">
              {lifeEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-800/50 rounded-lg flex items-center gap-2 flex-wrap"
                >
                  <input
                    type="number"
                    value={event.year}
                    onChange={(e) =>
                      updateLifeEvent(index, "year", Number(e.target.value))
                    }
                    className="w-16 p-2 border rounded bg-gray-700 border-gray-600"
                    min="1"
                  />
                  <span>년 후,</span>
                  <input
                    type="text"
                    placeholder="예: 결혼"
                    value={event.description}
                    onChange={(e) =>
                      updateLifeEvent(index, "description", e.target.value)
                    }
                    className="flex-grow p-2 border rounded bg-gray-700 border-gray-600"
                  />
                  <select
                    value={event.type}
                    onChange={(e) =>
                      updateLifeEvent(index, "type", e.target.value)
                    }
                    className="p-2 border rounded bg-gray-700 border-gray-600"
                  >
                    <option value="oneTimeExpense">지출</option>
                    <option value="oneTimeIncome">수입</option>
                  </select>
                  <input
                    type="text"
                    value={event.amount}
                    onChange={(e) =>
                      updateLifeEvent(
                        index,
                        "amount",
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    className="w-32 p-2 border rounded bg-gray-700 border-gray-600"
                  />
                  <span>원</span>
                  <button
                    onClick={() => removeLifeEvent(index)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={addLifeEvent}
                className="w-full flex items-center justify-center gap-2 p-3 bg-white/10 font-semibold rounded-lg hover:bg-white/20 transition"
              >
                <PlusCircle size={18} /> 이벤트 추가
              </button>
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => setStep("result")}
                className="px-8 py-3 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-600 transition"
              >
                결과 확인하기 <MousePointerClick className="inline-block" />
              </button>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="animate-fade-in-up">
            <div className="text-center">
              {yearsToFire === Infinity ? (
                <>
                  <h2 className="text-3xl font-bold text-yellow-400">
                    목표를 달성하기 어렵습니다 😥
                  </h2>
                  <p className="mt-2 text-gray-300">
                    저축액을 늘리거나 투자 전략을 변경하여 다시 시도해보세요.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-lg text-indigo-300">
                    당신은{" "}
                    <strong className="text-yellow-300 text-xl">
                      {yearsToFire}년 후,
                    </strong>
                  </p>
                  <h2 className="text-6xl font-bold my-2">
                    <CountUp end={finalAge} /> 세
                  </h2>
                  <p className="font-semibold text-lg text-indigo-300">
                    경제적 자유를 달성할 수 있습니다!
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center my-6">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm text-gray-400">최종 목표 금액</p>
                <p className="text-xl font-bold">
                  <CountUp end={finalTargetAmount} separator="," /> 원
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm text-gray-400">총 납입 원금</p>
                <p className="text-xl font-bold">
                  <CountUp end={totalContributions} separator="," /> 원
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm text-gray-400">총 투자 수익</p>
                <p className="text-xl font-bold text-green-400">
                  + <CountUp end={totalReturns} separator="," /> 원
                </p>
              </div>
            </div>

            <div className="mt-8 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="age" unit="세" stroke="#9ca3af" />
                  <YAxis
                    tickFormatter={(v) => `${(v / 100000000).toFixed(1)}억`}
                    stroke="#9ca3af"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30,30,30,0.8)",
                      borderColor: "#555",
                    }}
                    formatter={(value: number, name: string) => [
                      `${formatNumber(value)}원`,
                      name === "contribution" ? "총 납입 원금" : "총 자산",
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="contribution"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="총 납입 원금"
                  />
                  <Area
                    type="monotone"
                    dataKey={(data) => data.assets - data.contribution}
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="총 투자 수익"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => setStep("essentials")}
                className="px-8 py-3 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition"
              >
                조건 변경하여 다시 계산하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
