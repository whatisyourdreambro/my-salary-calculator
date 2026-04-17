"use client";

import { useState, useMemo } from "react";
import {
  Car as CarIcon,
  Truck,
  Gem,
  Rocket,
  Sparkles,
  Zap,
  Calculator,
  Gauge,
  Wallet,
  AlertCircle,
  Wrench,
  TrendingUp,
  Fuel,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import AdUnit from "@/components/AdUnit";
import {
  type Car,
  type CarLoanResult,
  calculateCarLoan,
  recommendCarsBySalary,
} from "@/lib/carLoanCalculator";

// Currency Input Component
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
      onValueChange(Number(rawValue).toLocaleString('ko-KR'));
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
                onValueChange((current + amount).toLocaleString('ko-KR'));
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

const categoryIcons: { [key: string]: any } = {
  경차: CarIcon,
  소형: CarIcon,
  준중형: CarIcon,
  중형: CarIcon,
  준대형: CarIcon,
  "소형 SUV": Truck,
  "준중형 SUV": Truck,
  "중형 SUV": Truck,
  "대형 SUV": Truck,
  미니밴: Truck,
  "수입 소형": CarIcon,
  "수입 준중형": CarIcon,
  "수입 중형": CarIcon,
  "수입 준대형": CarIcon,
  "수입 소형 SUV": Truck,
  "수입 준중형 SUV": Truck,
  "수입 중형 SUV": Truck,
  "수입 대형 SUV": Truck,
  "수입 하이브리드": Zap,
  전기차: Zap,
  프리미엄: Gem,
  "프리미엄 SUV": Gem,
  "프리미엄 전기차": Gem,
  "수입 프리미엄": Gem,
  플래그십: Sparkles,
  스포츠카: Rocket,
  "스포츠 SUV": Rocket,
  슈퍼카: Rocket,
  "럭셔리 스포츠": Rocket,
  럭셔리: Sparkles,
};

export default function CarLoanPage() {
  const [annualSalary, setAnnualSalary] = useState("60,000,000");
  const [loanTerm, setLoanTerm] = useState(60); // Months
  const [interestRate, setInterestRate] = useState(5.5);
  const [fuelCost, setFuelCost] = useState("200,000"); // Monthly fuel
  const [insuranceCost, setInsuranceCost] = useState("1,000,000"); // Annual insurance

  const salaryNum = Number(annualSalary.replace(/,/g, ""));
  const monthlySalary = Math.floor(salaryNum / 12);
  const monthlyFuel = Number(fuelCost.replace(/,/g, ""));
  const monthlyInsurance = Math.floor(Number(insuranceCost.replace(/,/g, "")) / 12);

  const comparisonResults = useMemo(() => {
    const recommendedCars = recommendCarsBySalary(salaryNum);
    return recommendedCars.map((car) => {
      const loan = calculateCarLoan(car.price, {
        annualSalary: salaryNum,
        loanTerm: loanTerm / 12,
        interestRate,
      });
      return { car, loan };
    });
  }, [salaryNum, loanTerm, interestRate]);

  const groupedCars = useMemo(() => {
    return comparisonResults.reduce((acc, current) => {
      const category = current.car.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(current);
      return acc;
    }, {} as Record<string, typeof comparisonResults>);
  }, [comparisonResults]);

  // Opportunity Cost Calculation (Simple S&P 500 assumption: 8% annual return)
  const calculateOpportunityCost = (monthlyPayment: number) => {
    const rate = 0.08 / 12;
    const months = loanTerm;
    // Future Value of Annuity formula: PMT * ((1 + r)^n - 1) / r
    const futureValue = monthlyPayment * (Math.pow(1 + rate, months) - 1) / rate;
    const totalPrincipal = monthlyPayment * months;
    return futureValue - totalPrincipal;
  };

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground font-medium text-sm mb-6">
              <CarIcon className="w-4 h-4" />
              <span>AI 기반 차량 추천 시스템</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              내 연봉으로 살 수 있는 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                드림카는 무엇일까요?
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              할부금뿐만 아니라 유지비, 기회비용까지 고려한 <br className="hidden sm:block" />
              가장 현실적이고 현명한 차량 구매 가이드를 제공합니다.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl shadow-xl border border-border p-6 sticky top-24"
            >
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">내 조건 입력</h2>
              </div>

              <div className="space-y-6">
                <CurrencyInput
                  label="세전 연봉"
                  value={annualSalary}
                  onValueChange={setAnnualSalary}
                  quickAmounts={[1000000, 5000000, 10000000]}
                />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-muted-foreground">할부 기간</label>
                    <span className="text-sm font-bold text-primary">{loanTerm}개월</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    step="12"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1년</span>
                    <span>10년</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-muted-foreground">이자율</label>
                    <span className="text-sm font-bold text-primary">{interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="pt-6 border-t border-border space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    유지비 설정 (월 평균)
                  </h3>
                  <CurrencyInput
                    label="예상 월 주유/충전비"
                    value={fuelCost}
                    onValueChange={setFuelCost}
                    quickAmounts={[50000, 100000]}
                  />
                  <CurrencyInput
                    label="연간 자동차 보험료"
                    value={insuranceCost}
                    onValueChange={setInsuranceCost}
                    quickAmounts={[100000, 500000]}
                  />
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="bg-primary/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm font-bold">월 예상 실수령액 (약)</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      <CountUp end={monthlySalary * 0.85} separator="," /> 원
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      * 세금 및 공제 제외 (약 15% 공제 가정)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar Ad */}
            <AdUnit slotId="1122334455" format="rectangle" label="Sidebar Ad" />
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-8 space-y-8">
            {/* Analysis Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500 to-primary/80 rounded-2xl shadow-xl p-6 text-slate-900 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <h3 className="text-lg font-medium opacity-90 mb-1">차량 구매 적정 예산</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    <CountUp end={salaryNum * 0.4} separator="," />
                  </span>
                  <span className="text-xl">원 ~</span>
                  <span className="text-4xl font-bold">
                    <CountUp end={salaryNum * 0.7} separator="," />
                  </span>
                  <span className="text-xl">원</span>
                </div>
                <p className="mt-4 text-sm opacity-80 bg-white/10 inline-block px-3 py-1 rounded-full">
                  💡 연봉의 40~70% 구간이 가장 경제적으로 부담 없는 적정선입니다.
                </p>
              </div>
            </motion.div>

            {/* Results Grid */}
            <div className="space-y-8">
              {Object.entries(groupedCars).map(([category, cars], idx) => {
                const Icon = categoryIcons[category] || CarIcon;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <h3 className="text-xl font-bold">{category}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cars.map(({ car, loan }) => {
                        const monthlyTotalCost = loan.monthlyPayment + monthlyFuel + monthlyInsurance;
                        const monthlyPaymentRatio = (monthlyTotalCost / (monthlySalary * 0.85)) * 100;
                        const isHighBurden = monthlyPaymentRatio > 20;
                        const opportunityCost = calculateOpportunityCost(loan.monthlyPayment);

                        return (
                          <div
                            key={car.name}
                            className="group bg-card hover:bg-accent/50 border border-border rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
                          >
                            {isHighBurden && (
                              <div className="absolute top-0 right-0 bg-primary/50 text-white text-xs px-2 py-1 rounded-bl-lg z-10 font-bold">
                                주의
                              </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                                  {car.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {Number(car.price).toLocaleString('ko-KR')}원
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center py-2 border-t border-border/50">
                                <span className="text-sm text-muted-foreground">월 할부금</span>
                                <span className="font-bold text-lg">
                                  <CountUp end={loan.monthlyPayment} separator="," />원
                                </span>
                              </div>

                              <div className="bg-secondary/30 p-3 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1"><Fuel className="w-3 h-3" />유지비 합계</span>
                                  <span className="font-medium">+{Number(monthlyFuel + monthlyInsurance).toLocaleString('ko-KR')}원</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border/50">
                                  <span className="font-bold text-foreground">월 총 지출</span>
                                  <span className="font-bold text-primary">{Number(monthlyTotalCost).toLocaleString('ko-KR')}원</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">월 실수령액 대비 지출</span>
                                  <span className={`font-bold ${isHighBurden ? "text-primary" : "text-primary"}`}>
                                    {monthlyPaymentRatio.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isHighBurden ? "bg-primary/50" : "bg-primary/50"}`}
                                    style={{ width: `${Math.min(monthlyPaymentRatio, 100)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="pt-2 border-t border-border/50">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>기회비용 (S&P500 투자 시 수익)</span>
                                </div>
                                <p className="text-sm font-medium text-blue-500">
                                  +{Math.round(opportunityCost / 10000).toLocaleString('ko-KR')}만원 손해
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}

              {comparisonResults.length === 0 && (
                <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                  <Gauge className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    추천할 수 있는 차량이 없습니다. <br />
                    연봉을 조금 더 올려보시거나, 할부 기간을 늘려보세요!
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Ad */}
            <AdUnit slotId="5544332211" format="auto" label="Bottom Ad" />
          </div>
        </div>
      </div>
    </main>
  );
}

