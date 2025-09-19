"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
  Car,
  CarLoanResult,
  calculateCarLoan,
  recommendCarsBySalary,
} from "@/lib/carLoanCalculator";

const formatNumber = (num: number) => num.toLocaleString();

type CarWithLoan = {
  car: Car;
  loan: CarLoanResult;
};

export default function CarLoanSimulator() {
  const [annualSalary, setAnnualSalary] = useState("50,000,000");
  const [loanTerm, setLoanTerm] = useState(5);
  const [interestRate, setInterestRate] = useState(5.5);

  const comparisonResults: CarWithLoan[] = useMemo(() => {
    const salary = Number(annualSalary.replace(/,/g, ""));
    const recommendedCars = recommendCarsBySalary(salary);

    return recommendedCars.map((car) => {
      const loan = calculateCarLoan(car.price, {
        annualSalary: salary,
        loanTerm,
        interestRate,
      });
      return { car, loan };
    });
  }, [annualSalary, loanTerm, interestRate]);

  return (
    <div className="space-y-8 mt-8">
      {/* 1. 기본 정보 입력 */}
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">1. 내 정보 입력하기</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrencyInput
            label="세전 연봉"
            value={annualSalary}
            onValueChange={setAnnualSalary}
            quickAmounts={[10000000, 5000000, 1000000]}
          />
          {/* [수정] 할부 기간 입력을 range에서 number로 변경 */}
          <div>
            <label className="text-sm font-medium">할부 기간 (년)</label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full p-2 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
              placeholder="예: 5"
            />
          </div>
          {/* [수정] 예상 금리 입력을 range에서 number로 변경 */}
          <div>
            <label className="text-sm font-medium">예상 금리 (%)</label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full p-2 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
              placeholder="예: 5.5"
            />
          </div>
        </div>
      </div>

      {/* 2. 추천 차량 및 할부금 비교 */}
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">
          2. 내 연봉에 맞는 추천 차량 & 할부금 비교
        </h2>
        {comparisonResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonResults.map(({ car, loan }, index) => (
              <div
                key={index}
                className="p-4 border-2 rounded-lg text-left transition bg-gray-50 dark:bg-gray-800/50"
              >
                <p className="font-bold text-lg">
                  {index + 1}. {car.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {car.category} / {formatNumber(car.price)}원
                </p>
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <p className="text-xs text-gray-500">월 예상 납입금</p>
                  <p className="text-xl font-bold text-signature-blue">
                    <CountUp end={loan.monthlyPayment} separator="," /> 원
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    총 예상 이자: {formatNumber(loan.totalInterest)}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            추천 드릴 차량이 없습니다. 연봉을 조절해보세요.
          </p>
        )}
      </div>
    </div>
  );
}
