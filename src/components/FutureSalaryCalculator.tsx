"use client";

import { useState, useMemo } from "react";
// [수정] 사용하지 않는 FutureSalaryResult 타입을 import 목록에서 제거합니다.
import { calculateFutureSalary } from "@/lib/futureCalculator";
import CurrencyInput from "./CurrencyInput";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function FutureSalaryCalculator() {
  const [currentSalary, setCurrentSalary] = useState("");
  const [years, setYears] = useState(10);
  const [rateType, setRateType] = useState<"average" | "individual">("average");
  const [averageRate, setAverageRate] = useState(5);
  const [individualRates, setIndividualRates] = useState<number[]>(
    Array(10).fill(5)
  );

  const futureSalaries = useMemo(() => {
    const rates = rateType === "average" ? [averageRate] : individualRates;
    return calculateFutureSalary(parseNumber(currentSalary), years, rates);
  }, [currentSalary, years, rateType, averageRate, individualRates]);

  const handleYearsChange = (num: number) => {
    const newYears = Math.max(1, Math.min(30, num));
    setYears(newYears);
    setIndividualRates(Array(newYears).fill(5));
  };

  const handleIndividualRateChange = (index: number, value: string) => {
    const newRates = [...individualRates];
    newRates[index] = Number(value) || 0;
    setIndividualRates(newRates);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-8">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            입력
          </h2>
          <div className="space-y-4">
            <CurrencyInput
              label="현재 연봉"
              value={currentSalary}
              onValueChange={setCurrentSalary}
              quickAmounts={[10000000, 1000000, 100000]}
            />
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                예상 기간 (년)
              </label>
              <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => handleYearsChange(years - 1)}
                  className="w-8 h-8 text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  -
                </button>
                <span className="font-bold text-lg">{years} 년</span>
                <button
                  onClick={() => handleYearsChange(years + 1)}
                  className="w-8 h-8 text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setRateType("average")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold ${
                  rateType === "average"
                    ? "bg-white dark:bg-gray-700 shadow"
                    : "text-gray-500"
                }`}
              >
                평균 상승률
              </button>
              <button
                onClick={() => setRateType("individual")}
                className={`flex-1 p-2 rounded-md text-sm font-semibold ${
                  rateType === "individual"
                    ? "bg-white dark:bg-gray-700 shadow"
                    : "text-gray-500"
                }`}
              >
                개별 상승률
              </button>
            </div>
            {rateType === "average" ? (
              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  평균 연봉 상승률 (%)
                </label>
                <input
                  type="number"
                  value={averageRate}
                  onChange={(e) => setAverageRate(Number(e.target.value))}
                  className="w-full p-3 mt-1 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  연차별 연봉 상승률 (%)
                </p>
                {Array.from({ length: years }, (_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-12">{i + 1}년차</span>
                    <input
                      type="number"
                      value={individualRates[i]}
                      onChange={(e) =>
                        handleIndividualRateChange(i, e.target.value)
                      }
                      className="flex-1 w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
          미래 연봉 예상 결과
        </h2>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">연도</th>
                <th className="p-2 text-right">예상 연봉</th>
                <th className="p-2 text-right">상승액</th>
              </tr>
            </thead>
            <tbody>
              {futureSalaries.map((item) => (
                <tr key={item.year} className="border-t dark:border-gray-700">
                  <td className="p-2 font-semibold">{item.year}년</td>
                  <td className="p-2 text-right text-signature-blue font-bold">
                    {formatNumber(item.salary)} 원
                  </td>
                  <td className="p-2 text-right text-green-600">
                    + {formatNumber(item.increaseAmount)} 원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          ※ 본 결과는 현재(2025년) 세전 기준이며, 미래의 실제 세율 및 공제액
          변동에 따라 실수령액은 달라질 수 있습니다.
        </p>
      </div>
    </div>
  );
}
