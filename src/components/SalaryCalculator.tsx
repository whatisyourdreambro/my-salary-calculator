"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { calculateNetSalary } from "@/lib/calculator";
import CurrencyInput from "./CurrencyInput";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function SalaryCalculator() {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [payBasis, setPayBasis] = useState<"annual" | "monthly">("annual");
  const [severanceType, setSeveranceType] = useState<"separate" | "included">(
    "separate"
  );
  const [salaryInput, setSalaryInput] = useState("");
  const [nonTaxableAmount, setNonTaxableAmount] = useState("200,000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [overtimePay, setOvertimePay] = useState("");
  const [result, setResult] = useState({
    monthlyNet: 0,
    totalDeduction: 0,
    pension: 0,
    health: 0,
    longTermCare: 0,
    employment: 0,
    incomeTax: 0,
    localTax: 0,
  });

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const decodedState = JSON.parse(atob(data));
        setPayBasis(decodedState.payBasis || "annual");
        setSeveranceType(decodedState.severanceType || "separate");
        setSalaryInput(decodedState.salaryInput || "");
        setNonTaxableAmount(decodedState.nonTaxableAmount || "200,000");
        setDependents(decodedState.dependents || 1);
        setChildren(decodedState.children || 0);
      } catch (error) {
        console.error("Failed to parse shared data:", error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const salary = parseNumber(salaryInput);
    const nonTaxable = parseNumber(nonTaxableAmount) * 12;
    let annualSalary = payBasis === "annual" ? salary : salary * 12;
    if (severanceType === "included" && annualSalary > 0) {
      annualSalary = (annualSalary / 13) * 12;
    }
    const annualOvertime = parseNumber(overtimePay);
    const newResult = calculateNetSalary(
      annualSalary,
      nonTaxable,
      dependents,
      children,
      annualOvertime
    );
    setResult(newResult);
  }, [
    payBasis,
    severanceType,
    salaryInput,
    nonTaxableAmount,
    dependents,
    children,
    overtimePay,
  ]);

  const handleReset = () => {
    setPayBasis("annual");
    setSeveranceType("separate");
    setSalaryInput("");
    setNonTaxableAmount("200,000");
    setDependents(1);
    setChildren(0);
    setOvertimePay("");
  };

  const handleShareLink = () => {
    const stateToShare = {
      payBasis,
      severanceType,
      salaryInput,
      nonTaxableAmount,
      dependents,
      children,
      overtimePay,
    };
    const encodedState = btoa(JSON.stringify(stateToShare));
    const shareUrl = `${window.location.origin}/?tab=salary&data=${encodedState}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        alert("결과가 포함된 링크가 클립보드에 복사되었습니다.");
      },
      () => {
        alert("링크 복사에 실패했습니다.");
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-8">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            필수 입력
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                급여 기준
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setPayBasis("annual")}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    payBasis === "annual"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  연봉
                </button>
                <button
                  onClick={() => setPayBasis("monthly")}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    payBasis === "monthly"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  월급
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                퇴직금
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setSeveranceType("separate")}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    severanceType === "separate"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  별도
                </button>
                <button
                  onClick={() => setSeveranceType("included")}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    severanceType === "included"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  포함
                </button>
              </div>
            </div>
          </div>
          <CurrencyInput
            label={payBasis === "annual" ? "연봉" : "월급"}
            value={salaryInput}
            onValueChange={setSalaryInput}
            quickAmounts={[10000000, 1000000, 100000]}
          />
        </div>
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            선택 입력
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                부양 가족 수 (본인포함)
              </label>
              <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => setDependents((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  -
                </button>
                <span className="font-bold text-lg text-light-text dark:text-dark-text">
                  {dependents} 명
                </span>
                <button
                  onClick={() => setDependents((p) => p + 1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                20세 이하 자녀 수
              </label>
              <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => setChildren((p) => Math.max(0, p - 1))}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  -
                </button>
                <span className="font-bold text-lg text-light-text dark:text-dark-text">
                  {children} 명
                </span>
                <button
                  onClick={() => setChildren((p) => p + 1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              비과세액 (월 기준)
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                value={nonTaxableAmount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setNonTaxableAmount(v ? formatNumber(Number(v)) : "");
                }}
                className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">
                원
              </span>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              야근수당 (연간 총액)
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                value={overtimePay}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setOvertimePay(v ? formatNumber(Number(v)) : "");
                }}
                className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">
                원
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={resultCardRef}
        className="bg-signature-blue dark:bg-dark-card text-white dark:text-dark-text p-6 rounded-xl flex flex-col h-full shadow-lg relative overflow-hidden"
      >
        <div className="flex-grow">
          <p className="font-semibold text-blue-200 dark:text-dark-text-secondary text-sm">
            월 예상 실수령액
          </p>
          <p className="text-4xl sm:text-5xl font-bold my-2 text-white dark:text-dark-text">
            {formatNumber(result.monthlyNet)} 원
          </p>
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700 space-y-3 text-sm">
            {Object.entries({
              국민연금: result.pension,
              건강보험: result.health,
              장기요양: result.longTermCare,
              고용보험: result.employment,
              소득세: result.incomeTax,
              지방소득세: result.localTax,
            }).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-blue-200 dark:text-dark-text-secondary">
                  {label}
                </span>
                <span className="text-white dark:text-dark-text font-bold">
                  {formatNumber(value)} 원
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700 flex justify-between font-bold text-white dark:text-dark-text">
            <span>총 공제액 합계</span>
            <span>{formatNumber(result.totalDeduction)} 원</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleShareLink}
            className="py-3 bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-white dark:text-gray-300 transition"
          >
            링크 공유
          </button>
          <button
            onClick={handleReset}
            className="py-3 bg-white/20 hover:bg-white/30 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-white dark:text-gray-300 transition"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
