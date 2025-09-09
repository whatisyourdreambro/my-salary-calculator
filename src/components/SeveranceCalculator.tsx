"use client";

import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { calculateSeverancePay } from "@/lib/severanceCalculator";
import CurrencyInput from "./CurrencyInput";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function SeveranceCalculator() {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [startDate, setStartDate] = useState(
    oneYearAgo.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today);
  const [monthlySalary, setMonthlySalary] = useState("");
  const [annualBonus, setAnnualBonus] = useState("");
  const [annualLeavePay, setAnnualLeavePay] = useState("");
  const [result, setResult] = useState({
    averageDailyWage: 0,
    estimatedSeverancePay: 0,
  });

  useEffect(() => {
    const newResult = calculateSeverancePay(
      startDate,
      endDate,
      parseNumber(monthlySalary),
      parseNumber(annualBonus),
      parseNumber(annualLeavePay)
    );
    setResult(newResult);
  }, [startDate, endDate, monthlySalary, annualBonus, annualLeavePay]);

  const handleReset = () => {
    setStartDate(oneYearAgo.toISOString().split("T")[0]);
    setEndDate(today);
    setMonthlySalary("");
    setAnnualBonus("");
    setAnnualLeavePay("");
  };

  const handleCapture = () => {
    if (resultCardRef.current) {
      html2canvas(resultCardRef.current, {
        backgroundColor: null,
        useCORS: true,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = "severance_pay_result.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numericValue = value.replace(/[^0-9]/g, "");
      setter(numericValue ? formatNumber(Number(numericValue)) : "");
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-8">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            필수 입력
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="startDate"
                className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
              >
                입사일
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
              >
                퇴사일 (마지막 근무일)
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
              />
            </div>
          </div>
          <CurrencyInput
            label="월급 (세전, 3개월 평균)"
            value={monthlySalary}
            onValueChange={setMonthlySalary}
            quickAmounts={[1000000, 100000, 10000]}
          />
        </div>
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            선택 입력 (1년치 총액)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                연간 상여금
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={annualBonus}
                  onChange={handleInputChange(setAnnualBonus)}
                  className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
                />
                <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">
                  원
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                연차수당
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={annualLeavePay}
                  onChange={handleInputChange(setAnnualLeavePay)}
                  className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
                />
                <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">
                  원
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={resultCardRef}
        className="bg-gradient-to-br from-signature-blue to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white p-6 rounded-xl flex flex-col h-full shadow-lg"
      >
        <div className="flex-grow">
          <p className="font-semibold text-blue-200 dark:text-gray-400 text-sm">
            예상 퇴직금
          </p>
          <p className="text-4xl sm:text-5xl font-bold my-2 text-white">
            {formatNumber(result.estimatedSeverancePay)} 원
          </p>
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700 flex justify-between text-sm">
            <span className="text-blue-200 dark:text-gray-400">
              1일 평균 임금
            </span>
            <span className="text-white dark:text-dark-text font-medium">
              {formatNumber(result.averageDailyWage)} 원
            </span>
          </div>
        </div>
        <div className="mt-6 flex space-x-2">
          <button
            onClick={handleCapture}
            className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold text-white transition"
          >
            캡쳐하기
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold text-white transition"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
