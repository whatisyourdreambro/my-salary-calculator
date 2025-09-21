// src/components/HomeLoanSimulator.tsx

"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import type { StoredFinancialData, StoredHomeLoanData } from "@/app/types";
import { useRouter } from "next/navigation";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type RepaymentType = "equalPrincipalAndInterest" | "equalPrincipal";
type UserType = "none" | "newlywed" | "firstTimeBuyer";

export default function HomeLoanSimulator() {
  const [homePrice, setHomePrice] = useState("600000000");
  const [downPayment, setDownPayment] = useState("120000000");
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(4.5);
  const [annualIncome, setAnnualIncome] = useState("60000000");

  const [userType, setUserType] = useState<UserType>("none");
  const [repaymentType, setRepaymentType] = useState<RepaymentType>(
    "equalPrincipalAndInterest"
  );

  const router = useRouter();

  const { monthlyPayment, totalInterest, totalPayment, loanSuggestion } =
    useMemo(() => {
      const principal = parseNumber(homePrice) - parseNumber(downPayment);
      const income = parseNumber(annualIncome);

      let suggestedRate = interestRate;
      let suggestion = "일반 보금자리론을 추천합니다.";

      if (
        userType === "firstTimeBuyer" &&
        income <= 70000000 &&
        parseNumber(homePrice) <= 500000000
      ) {
        suggestion =
          "생애최초 주택구매자용 디딤돌 대출을 추천합니다! (금리 우대 적용)";
        suggestedRate = Math.max(2.15, interestRate - 1.0);
      } else if (
        userType === "newlywed" &&
        income <= 85000000 &&
        parseNumber(homePrice) <= 500000000
      ) {
        suggestion = "신혼부부 디딤돌 대출을 추천합니다! (금리 우대 적용)";
        suggestedRate = Math.max(2.15, interestRate - 0.7);
      }

      if (principal <= 0)
        return {
          monthlyPayment: 0,
          totalInterest: 0,
          totalPayment: 0,
          loanSuggestion: "대출 원금을 확인해주세요.",
        };

      const monthlyRate = suggestedRate / 100 / 12;
      const numberOfMonths = loanTerm * 12;

      let monthly = 0;
      let total = 0;

      if (repaymentType === "equalPrincipalAndInterest") {
        monthly =
          (principal *
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths))) /
          (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
        total = monthly * numberOfMonths;
      } else {
        const principalPayment = principal / numberOfMonths;
        const firstMonthInterest = principal * monthlyRate;
        monthly = principalPayment + firstMonthInterest;

        let remainingPrincipal = principal;
        for (let i = 0; i < numberOfMonths; i++) {
          total += principalPayment + remainingPrincipal * monthlyRate;
          remainingPrincipal -= principalPayment;
        }
      }

      const interest = total - principal;

      return {
        monthlyPayment: Math.round(monthly),
        totalInterest: Math.round(interest),
        totalPayment: Math.round(total),
        loanSuggestion: suggestion,
      };
    }, [
      homePrice,
      downPayment,
      loanTerm,
      interestRate,
      annualIncome,
      userType,
      repaymentType,
    ]);

  const handleSaveData = () => {
    if (monthlyPayment <= 0) {
      alert("대출 정보가 올바르지 않습니다. 입력값을 확인해주세요.");
      return;
    }
    try {
      const existingDataJSON = localStorage.getItem(
        "moneysalary-financial-data"
      );
      const existingData: StoredFinancialData = existingDataJSON
        ? JSON.parse(existingDataJSON)
        : { lastUpdated: new Date().toISOString() };
      const homeLoanDataToStore: StoredHomeLoanData = {
        monthlyPayment,
        loanSuggestion,
      };
      const updatedData: StoredFinancialData = {
        ...existingData,
        homeLoan: homeLoanDataToStore,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        "moneysalary-financial-data",
        JSON.stringify(updatedData)
      );
      alert("주택담보대출 정보가 대시보드에 저장되었습니다!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-6 bg-light-card dark:bg-dark-card p-6 rounded-xl border">
        <h2 className="text-xl font-bold">대출 정보 입력</h2>
        <CurrencyInput
          label="주택 가격"
          value={homePrice}
          onValueChange={setHomePrice}
          quickAmounts={[100000000, 50000000, 10000000]}
        />
        <CurrencyInput
          label="자기 자본"
          value={downPayment}
          onValueChange={setDownPayment}
          quickAmounts={[50000000, 10000000, 5000000]}
        />
        <div>
          <label className="text-sm font-medium">
            대출 기간: <strong>{loanTerm}년</strong>
          </label>
          <input
            type="range"
            min="5"
            max="40"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            기준 금리: <strong>{interestRate}%</strong>
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
          />
        </div>
        <CurrencyInput
          label="나의 세전 연소득"
          value={annualIncome}
          onValueChange={setAnnualIncome}
          quickAmounts={[10000000, 5000000, 1000000]}
        />
        <div>
          <label className="text-sm font-medium">상환 방식</label>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mt-1">
            <button
              onClick={() => setRepaymentType("equalPrincipalAndInterest")}
              className={`flex-1 p-2 rounded-md text-sm font-semibold ${
                repaymentType === "equalPrincipalAndInterest"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : ""
              }`}
            >
              원리금 균등
            </button>
            <button
              onClick={() => setRepaymentType("equalPrincipal")}
              className={`flex-1 p-2 rounded-md text-sm font-semibold ${
                repaymentType === "equalPrincipal"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : ""
              }`}
            >
              원금 균등
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">우대 조건</label>
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <button
              onClick={() =>
                setUserType(userType === "newlywed" ? "none" : "newlywed")
              }
              className={`flex-1 p-2 rounded-md text-sm font-semibold border-2 ${
                userType === "newlywed"
                  ? "border-primary bg-blue-50 dark:bg-blue-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              신혼부부
            </button>
            <button
              onClick={() =>
                setUserType(
                  userType === "firstTimeBuyer" ? "none" : "firstTimeBuyer"
                )
              }
              className={`flex-1 p-2 rounded-md text-sm font-semibold border-2 ${
                userType === "firstTimeBuyer"
                  ? "border-primary bg-blue-50 dark:bg-blue-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              생애최초
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-6 bg-primary text-white p-6 rounded-xl shadow-lg flex flex-col">
        <h2 className="text-2xl font-bold text-center">📊 시뮬레이션 결과</h2>
        <div className="bg-white/10 p-3 rounded-lg text-center font-semibold text-sm">
          {loanSuggestion}
        </div>
        <div className="bg-white/20 p-6 rounded-lg text-center flex-grow flex flex-col justify-center">
          <p className="font-semibold text-blue-200 text-lg">
            {repaymentType === "equalPrincipal" ? "첫 달 " : ""}월 상환액
          </p>
          <p className="text-4xl sm:text-5xl font-bold my-2">
            <CountUp end={monthlyPayment} separator="," /> 원
          </p>
        </div>
        <div className="text-sm space-y-2 mt-4">
          <div className="flex justify-between">
            <span className="opacity-80">총 예상 이자</span>
            <strong>{formatNumber(totalInterest)} 원</strong>
          </div>
          <hr className="border-white/30 my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>총 상환 금액</span>
            <span>{formatNumber(totalPayment)} 원</span>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <button
            onClick={handleSaveData}
            className="w-full py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-200 transition"
          >
            대시보드에 저장
          </button>
        </div>
      </div>
    </div>
  );
}
