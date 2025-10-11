"use client";

import { useMemo, useEffect } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { PlusCircle, Trash2, TrendingUp, Shield, Rocket, ArrowRight, MousePointerClick } from "lucide-react";
import { useFireCalculatorStore, FireInputs, LifeEvent, CalculationStep, InvestmentStrategy } from "../stores/fireCalculatorStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

const strategyReturns = { conservative: 4, balanced: 7, aggressive: 10 };

const calculateFireDate = (inputs: FireInputs, lifeEvents: LifeEvent[]) => {
  const { currentAge, currentSavings, monthlySavings, salaryGrowthRate, investmentStrategy, customReturn, monthlySpending, retirementIncome } = inputs;
  const inflationRate = 0.02;
  const annualReturnRate = (parseFloat(customReturn) || strategyReturns[investmentStrategy]) / 100;
  const annualSalaryGrowth = parseFloat(salaryGrowthRate) / 100;
  const targetAmount = (parseNumber(monthlySpending) * 12 - parseNumber(retirementIncome) * 12) * 25;

  if (parseNumber(currentSavings) >= targetAmount) {
    return { yearsToFire: 0, finalAge: parseInt(currentAge, 10), chartData: [], finalTargetAmount: targetAmount, totalContributions: parseNumber(currentSavings), totalReturns: 0 };
  }

  let futureValue = parseNumber(currentSavings);
  let currentMonthlySavings = parseNumber(monthlySavings);
  let totalContributions = parseNumber(currentSavings);
  let years = 0;
  const age = parseInt(currentAge, 10);
  const chartData = [{ year: 0, age: age, assets: futureValue, contribution: totalContributions }];
  let currentTargetAmount = targetAmount;

  while (futureValue < currentTargetAmount && years < 100) {
    years++;
    currentMonthlySavings *= 1 + annualSalaryGrowth;
    totalContributions += currentMonthlySavings * 12;
    futureValue = futureValue * (1 + annualReturnRate) + currentMonthlySavings * 12;

    const eventForYear = lifeEvents.find((e) => e.year === years);
    if (eventForYear) {
      const eventAmount = parseNumber(eventForYear.amount);
      if (eventForYear.type === "oneTimeExpense") futureValue -= eventAmount;
      else { futureValue += eventAmount; totalContributions += eventAmount; }
    }

    currentTargetAmount *= 1 + inflationRate;
    chartData.push({ year: years, age: age + years, assets: Math.round(futureValue), contribution: Math.round(totalContributions) });
  }

  const finalYears = years >= 100 ? Infinity : years;
  return { yearsToFire: finalYears, finalAge: finalYears === Infinity ? Infinity : age + finalYears, chartData, finalTargetAmount: Math.round(currentTargetAmount), totalContributions: Math.round(totalContributions), totalReturns: Math.round(futureValue - totalContributions) };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalAssets = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    const contribution = payload.find((p: any) => p.dataKey === 'contribution')?.value || 0;
    const returns = totalAssets - contribution;
    return (
      <Card>
        <CardContent className="p-4">
          <p className="font-bold text-lg">{`${label}세`}</p>
          <p style={{ color: 'hsl(var(--primary))' }}>{`총 납입 원금: ${formatNumber(contribution)}원`}</p>
          <p style={{ color: 'hsl(var(--secondary))' }}>{`총 투자 수익: ${formatNumber(returns)}원`}</p>
          <hr className="my-2 border-border" />
          <p className="font-bold">{`총 자산: ${formatNumber(contribution + returns)}원`}</p>
        </CardContent>
      </Card>
    );
  }
  return null;
};

export default function FireCalculator() {
  const { step, inputs, lifeEvents, setStep, handleInputChange, addLifeEvent, updateLifeEvent, removeLifeEvent, reset } = useFireCalculatorStore();
  useEffect(() => () => reset(), [reset]);
  const { yearsToFire, finalAge, chartData, finalTargetAmount, totalContributions, totalReturns } = useMemo(() => calculateFireDate(inputs, lifeEvents), [inputs, lifeEvents]);

  if (step === "intro") {
    return (
      <div className="text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">나의 경제적 자유,<br />그 여정을 시작합니다</h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">당신의 재정 정보를 바탕으로, 경제적 독립과 조기 은퇴(FIRE)를 향한<br />가장 현실적인 로드맵을 시뮬레이션합니다.</p>
        <Button size="lg" className="mt-10" onClick={() => setStep("essentials")}>여정 시작하기 <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Step Indicator could be a separate component too */}
      <Card>
        <CardContent className="p-6 sm:p-10">
          {step === "essentials" && (
            <div className="animate-fade-in-up space-y-6">
              <h2 className="text-2xl font-bold text-center">1. 당신의 현재를 알려주세요</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="space-y-2"><Label htmlFor="currentAge">현재 나이</Label><Input id="currentAge" type="number" value={inputs.currentAge} onChange={(e) => handleInputChange("currentAge", e.target.value)} /></div>
                <CurrencyInput label="현재 모은 돈 (순자산)" value={inputs.currentSavings} onValueChange={(v) => handleInputChange("currentSavings", v)} quickAmounts={[10000000, 5000000]} />
                <CurrencyInput label="월 저축/투자 금액" value={inputs.monthlySavings} onValueChange={(v) => handleInputChange("monthlySavings", v)} quickAmounts={[100000, 500000]} />
                <CurrencyInput label="은퇴 후 월 목표 생활비" value={inputs.monthlySpending} onValueChange={(v) => handleInputChange("monthlySpending", v)} quickAmounts={[100000, 500000]} />
              </div>
              <div className="text-center pt-4"><Button onClick={() => setStep("investment")}>다음 단계로 <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
            </div>
          )}
          {step === "investment" && (
            <div className="animate-fade-in-up space-y-6">
              <h2 className="text-2xl font-bold text-center">2. 당신의 미래 계획을 알려주세요</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="space-y-2"><Label htmlFor="salaryGrowthRate">연평균 소득 상승률 (%)</Label><Input id="salaryGrowthRate" type="number" value={inputs.salaryGrowthRate} onChange={(e) => handleInputChange("salaryGrowthRate", e.target.value)} /></div>
                <CurrencyInput label="은퇴 후 월 추가소득 (연금 등)" value={inputs.retirementIncome} onValueChange={(v) => handleInputChange("retirementIncome", v)} quickAmounts={[100000, 50000]} />
                <div className="md:col-span-2 space-y-2"><Label>투자 성향</Label><div className="grid grid-cols-3 gap-2 mt-2">{[ { id: "conservative", Icon: Shield, label: "안정형", return: 4 }, { id: "balanced", Icon: TrendingUp, label: "균형형", return: 7 }, { id: "aggressive", Icon: Rocket, label: "공격형", return: 10 } ].map(({ id, Icon, label, return: returnValue }) => (<Button key={id} variant={inputs.investmentStrategy === id ? "default" : "outline"} onClick={() => handleInputChange("investmentStrategy", id as InvestmentStrategy)} className="h-auto flex-col py-3"><Icon className="w-6 h-6 mb-1" /><p className="font-semibold">{label}</p><p className="text-xs">연 {returnValue}%</p></Button>))}</div></div>
              </div>
              <div className="text-center pt-4"><Button onClick={() => setStep("events")}>다음 단계로 <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
            </div>
          )}
          {step === "events" && (
            <div className="animate-fade-in-up space-y-6">
              <h2 className="text-2xl font-bold text-center">3. 예상되는 생애 이벤트가 있나요? (선택)</h2>
              <div className="max-w-3xl mx-auto space-y-4">
                {lifeEvents.map((event, index) => (<div key={index} className="p-4 bg-muted rounded-lg flex items-center gap-2 flex-wrap"><Input type="number" value={event.year} onChange={(e) => updateLifeEvent(index, "year", Number(e.target.value))} className="w-20" min="1" /><span>년 후,</span><Input type="text" placeholder="예: 결혼" value={event.description} onChange={(e) => updateLifeEvent(index, "description", e.target.value)} className="flex-grow" /><Select value={event.type} onValueChange={(value) => updateLifeEvent(index, "type", value as LifeEvent['type'])}><SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="oneTimeExpense">지출</SelectItem><SelectItem value="oneTimeIncome">수입</SelectItem></SelectContent></Select><Input type="text" value={formatNumber(parseNumber(event.amount))} onChange={(e) => updateLifeEvent(index, "amount", e.target.value.replace(/[^0-9]/g, ""))} className="w-32" /><span>원</span><Button variant="ghost" size="icon" onClick={() => removeLifeEvent(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>))}
                <Button variant="secondary" onClick={addLifeEvent} className="w-full"><PlusCircle size={18} className="mr-2" /> 이벤트 추가</Button>
              </div>
              <div className="text-center pt-4"><Button onClick={() => setStep("result")}>결과 확인하기 <MousePointerClick className="ml-2 h-4 w-4" /></Button></div>
            </div>
          )}
          {step === "result" && (
            <div className="animate-fade-in-up">
              <div className="text-center"><h2 className="text-3xl font-bold text-destructive">{yearsToFire === Infinity ? "목표를 달성하기 어렵습니다 😥" : <> <p className="font-semibold text-lg text-primary">당신은 <strong className="text-yellow-600 dark:text-yellow-300 text-xl">{yearsToFire}년 후,</strong></p><h2 className="text-6xl font-bold my-2"><CountUp end={finalAge} /> 세</h2><p className="font-semibold text-lg text-primary">경제적 자유를 달성할 수 있습니다!</p></>}</h2><p className="mt-2 text-muted-foreground">{yearsToFire === Infinity && "저축액을 늘리거나 투자 전략을 변경하여 다시 시도해보세요."}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center my-6">{[ { label: "최종 목표 금액", value: finalTargetAmount }, { label: "총 납입 원금", value: totalContributions }, { label: "총 투자 수익", value: totalReturns, isPositive: true } ].map(item => (<Card key={item.label}><CardHeader><CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle></CardHeader><CardContent><p className={cn("text-xl font-bold", item.isPositive && "text-green-600 dark:text-green-400")}>{item.isPositive && "+ "}<CountUp end={item.value} separator="," /> 원</p></CardContent></Card>))}
              </div>
              <div className="mt-8 h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}><defs><linearGradient id="colorContribution" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient><linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="age" unit="세" stroke="hsl(var(--foreground))" /><YAxis tickFormatter={(v) => `${(v / 100000000).toFixed(1)}억`} stroke="hsl(var(--foreground))" /><Tooltip content={<CustomTooltip />} /><Legend /><ReferenceLine y={finalTargetAmount} label="FIRE 목표" stroke="hsl(var(--destructive))" strokeDasharray="3 3" /><Area type="monotone" dataKey="contribution" stackId="1" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorContribution)" name="총 납입 원금" /><Area type="monotone" dataKey={(data) => data.assets - data.contribution} stackId="1" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorReturns)" name="총 투자 수익" /></AreaChart></ResponsiveContainer></div>
              <div className="text-center mt-8"><Button variant="secondary" onClick={() => setStep("essentials")}>조건 변경하여 다시 계산하기</Button></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
