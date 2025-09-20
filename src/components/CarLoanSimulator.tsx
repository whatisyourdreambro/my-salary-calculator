"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
// [수정] 아이콘과 계산 로직의 import 경로를 명확하게 분리했습니다.
import {
  Car as CarIcon, // 'Car' 타입과의 이름 충돌을 피하기 위해 아이콘에 별칭(alias)을 부여합니다.
  Truck,
  Gem,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  type Car, // [수정] 'Car'는 타입으로만 가져옵니다.
  type CarLoanResult,
  calculateCarLoan,
  recommendCarsBySalary,
} from "@/lib/carLoanCalculator";

const formatNumber = (num: number) => num.toLocaleString();

type CarWithLoan = {
  car: Car;
  loan: CarLoanResult;
};

// [고도화] 카테고리별 아이콘 매핑
const categoryIcons: { [key: string]: React.ElementType } = {
  경차: CarIcon, // [수정] 별칭을 사용한 아이콘 컴포넌트를 참조합니다.
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

export default function CarLoanSimulator() {
  const [annualSalary, setAnnualSalary] = useState("60,000,000");
  const [loanTerm, setLoanTerm] = useState(5);
  const [interestRate, setInterestRate] = useState(5.5);

  const comparisonResults: CarWithLoan[] = useMemo(() => {
    const salary = Number(annualSalary.replace(/,/g, ""));
    const recommendedCars = recommendCarsBySalary(salary);

    return recommendedCars.map((car: Car) => {
      // [수정] car 매개변수에 명시적으로 타입을 지정합니다.
      const loan = calculateCarLoan(car.price, {
        annualSalary: salary,
        loanTerm,
        interestRate,
      });
      return { car, loan };
    });
  }, [annualSalary, loanTerm, interestRate]);

  const groupedCars = useMemo(() => {
    return comparisonResults.reduce((acc, current) => {
      const category = current.car.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(current);
      return acc;
    }, {} as Record<string, CarWithLoan[]>);
  }, [comparisonResults]);

  return (
    <div className="space-y-8">
      {/* 1. 기본 정보 입력 */}
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">1. 나의 구매력 확인하기</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrencyInput
            label="세전 연봉"
            value={annualSalary}
            onValueChange={setAnnualSalary}
            quickAmounts={[10000000, 5000000, 1000000]}
          />
          <div>
            <label className="text-sm font-medium">할부 기간 (년)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium">예상 금리 (%)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="20"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* 2. 추천 차량 및 할부금 비교 */}
      <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center">
          2. 연봉{" "}
          <span className="text-signature-blue">
            {formatNumber(Number(annualSalary.replace(/,/g, "")))}원
          </span>
          을 위한 추천 차량
        </h2>
        {comparisonResults.length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedCars).map(([category, cars]) => {
              const Icon = categoryIcons[category] || CarIcon;
              return (
                <section key={category}>
                  <div className="flex items-center mb-4">
                    <Icon className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                    <h3 className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {category}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cars.map(({ car, loan }) => (
                      <div
                        key={car.name}
                        className="p-4 border-2 rounded-lg text-left transition bg-gray-50 dark:bg-gray-800/50 hover:border-signature-blue hover:shadow-md"
                      >
                        <p className="font-bold text-lg">{car.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatNumber(car.price)}원
                        </p>
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                          <p className="text-xs text-gray-500">
                            월 예상 납입금
                          </p>
                          <p className="text-xl font-bold text-signature-blue">
                            <CountUp end={loan.monthlyPayment} separator="," />{" "}
                            원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            추천 드릴 차량이 없습니다. 연봉을 조절해보세요.
          </p>
        )}
      </div>
    </div>
  );
}
