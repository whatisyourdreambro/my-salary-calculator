"use client";

import { useState, useMemo } from "react";
import Image from "next/image"; // next/image import 추가
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
  calculateCarLoan,
  recommendCarsBySalary,
} from "@/lib/carLoanCalculator";

const formatNumber = (num: number) => num.toLocaleString();

export default function CarLoanSimulator() {
  const [annualSalary, setAnnualSalary] = useState("50000000");
  const [loanTerm, setLoanTerm] = useState(5);
  const [interestRate, setInterestRate] = useState(5.5);
  const [selectedCarPrice, setSelectedCarPrice] = useState(0);

  const recommendedCars = useMemo(
    () => recommendCarsBySalary(Number(annualSalary.replace(/,/g, ""))),
    [annualSalary]
  );

  const loanResult = useMemo(
    () =>
      calculateCarLoan(selectedCarPrice, {
        annualSalary: Number(annualSalary.replace(/,/g, "")),
        loanTerm,
        interestRate,
      }),
    [selectedCarPrice, annualSalary, loanTerm, interestRate]
  );

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
          <div>
            <label className="text-sm font-medium">
              할부 기간: <strong>{loanTerm}년</strong>
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              예상 금리: <strong>{interestRate}%</strong>
            </label>
            <input
              type="range"
              min="3"
              max="10"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
            />
          </div>
        </div>
      </div>

      {/* 2. 추천 차량 */}
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">2. 내 연봉에 맞는 추천 차량</h2>
        {recommendedCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedCars.map((car) => (
              <button
                key={car.grade}
                onClick={() => setSelectedCarPrice(car.price)}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  selectedCarPrice === car.price
                    ? "border-signature-blue bg-blue-50 dark:bg-blue-900/20"
                    : "hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                {/* <img> 태그를 <Image> 컴포넌트로 교체 */}
                <div className="relative w-full h-32 mb-2">
                  <Image
                    src={car.imageUrl}
                    alt={car.description}
                    layout="fill"
                    className="object-cover rounded-md"
                  />
                </div>
                <p className="font-bold">{car.grade}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {car.description}
                </p>
                <p className="text-lg font-bold text-signature-blue mt-1">
                  {formatNumber(car.price)}원
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            연봉에 맞는 추천 차량이 없습니다. 연봉을 조절해보세요.
          </p>
        )}
      </div>

      {/* 3. 시뮬레이션 결과 */}
      {selectedCarPrice > 0 && (
        <div className="sticky bottom-4">
          <div className="bg-signature-blue text-white p-6 rounded-xl shadow-2xl animate-fade-in-up">
            <h2 className="text-2xl font-bold text-center mb-4">
              📊 최종 시뮬레이션 결과
            </h2>
            <div className="text-center bg-white/20 p-4 rounded-lg">
              <p className="text-lg font-semibold text-blue-200">
                {formatNumber(selectedCarPrice)}원 차량 구매 시 월 예상 납입금
              </p>
              <p className="text-5xl font-bold my-2">
                <CountUp end={loanResult.monthlyPayment} separator="," /> 원
              </p>
            </div>
            <div className="mt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="opacity-80">총 납부이자</span>
                <strong>{formatNumber(loanResult.totalInterest)} 원</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">총 납부금액</span>
                <strong>{formatNumber(loanResult.totalPayment)} 원</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
