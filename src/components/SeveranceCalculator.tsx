"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { calculateSeverancePay } from "@/lib/severanceCalculator";
import CurrencyInput from "./CurrencyInput";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

// Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환하는 헬퍼 함수
const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function SeveranceCalculator() {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const today = useMemo(() => new Date(), []);
  const oneYearAgo = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }, []);

  // 상태를 'YYYY-MM-DD' 문자열 형식으로 관리합니다.
  const [startDate, setStartDate] = useState<string>(
    toInputDateString(oneYearAgo)
  );
  const [endDate, setEndDate] = useState<string>(toInputDateString(today));

  const [monthlySalary, setMonthlySalary] = useState("");
  const [annualBonus, setAnnualBonus] = useState("");
  const [annualLeavePay, setAnnualLeavePay] = useState("");
  const [result, setResult] = useState({
    averageDailyWage: 0,
    estimatedSeverancePay: 0,
  });

  const handleReset = useCallback(() => {
    setStartDate(toInputDateString(oneYearAgo));
    setEndDate(toInputDateString(today));
    setMonthlySalary("");
    setAnnualBonus("");
    setAnnualLeavePay("");
  }, [oneYearAgo, today]);

  useEffect(() => {
    const data = searchParams.get("data");
    const tab = searchParams.get("tab");
    if (data && tab === "severance") {
      try {
        const decodedState = JSON.parse(atob(data));
        setStartDate(
          decodedState.startDate
            ? toInputDateString(new Date(decodedState.startDate))
            : toInputDateString(oneYearAgo)
        );
        setEndDate(
          decodedState.endDate
            ? toInputDateString(new Date(decodedState.endDate))
            : toInputDateString(today)
        );
        setMonthlySalary(decodedState.monthlySalary || "");
        setAnnualBonus(decodedState.annualBonus || "");
        setAnnualLeavePay(decodedState.annualLeavePay || "");
      } catch (error) {
        console.error("Failed to parse shared data:", error);
      }
    }
  }, [searchParams, oneYearAgo, today]);

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

  const handleShareLink = () => {
    const stateToShare = {
      startDate,
      endDate,
      monthlySalary,
      annualBonus,
      annualLeavePay,
    };
    const encodedState = btoa(JSON.stringify(stateToShare));
    const shareUrl = `${window.location.origin}/?tab=severance&data=${encodedState}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        alert("결과가 포함된 링크가 클립보드에 복사되었습니다.");
      },
      () => {
        alert("링크 복사에 실패했습니다.");
      }
    );
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
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
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
                className="w-full mt-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card"
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
                className="w-full mt-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card"
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
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
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
        className="bg-signature-blue dark:bg-dark-card text-white dark:text-dark-text p-6 rounded-xl flex flex-col h-full shadow-lg relative overflow-hidden"
      >
        <div className="flex-grow">
          <p className="font-semibold text-blue-200 dark:text-dark-text-secondary text-sm">
            예상 퇴직금
          </p>
          <p className="text-4xl sm:text-5xl font-bold my-2 text-white dark:text-dark-text">
            {formatNumber(result.estimatedSeverancePay)} 원
          </p>
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700 flex justify-between text-sm">
            <span className="text-blue-200 dark:text-dark-text-secondary">
              1일 평균 임금
            </span>
            <span className="text-white dark:text-dark-text font-medium">
              {formatNumber(result.averageDailyWage)} 원
            </span>
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
