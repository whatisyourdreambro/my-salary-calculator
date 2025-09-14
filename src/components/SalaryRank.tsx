"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";

// 데이터 출처: 고용노동부 임금직무정보시스템 '임금분포현황' (2023년 기준, 백분위 재가공)
// 각 'percentile'은 해당 소득을 받는 근로자가 하위 몇 %에 위치하는지를 의미합니다.
const salaryDistributionData = [
  { percentile: 10, income: 20550000 },
  { percentile: 20, income: 25800000 },
  { percentile: 25, income: 28310000 }, // 1사분위 (하위 25%)
  { percentile: 30, income: 30860000 },
  { percentile: 40, income: 36000000 },
  { percentile: 50, income: 41880000 }, // 2사분위 (중위값, 하위 50%)
  { percentile: 60, income: 48990000 },
  { percentile: 70, income: 58520000 },
  { percentile: 75, income: 64160000 }, // 3사분위 (하위 75%)
  { percentile: 80, income: 72000000 },
  { percentile: 90, income: 96950000 },
  { percentile: 95, income: 128410000 },
  { percentile: 99, income: 215440000 },
];

// 사용자의 연봉이 어느 분위에 속하는지 찾아내는 함수
const findSalaryRank = (annualSalary: number) => {
  if (annualSalary <= 0) return null;

  // 내림차순으로 정렬된 데이터에서 내 연봉보다 낮은 첫 번째 구간을 찾습니다.
  const rank = [...salaryDistributionData]
    .reverse()
    .find((data) => annualSalary >= data.income);

  // rank가 없으면 최하위 구간, 있으면 해당 구간의 백분위를 반환
  const percentile = rank ? rank.percentile : 0;
  return 100 - percentile; // 상위 %로 변환하여 반환
};

export default function SalaryRank() {
  const [salaryInput, setSalaryInput] = useState("");
  const [rank, setRank] = useState<number | null>(null);

  const annualSalary = useMemo(
    () => Number(salaryInput.replace(/,/g, "")),
    [salaryInput]
  );

  const handleCalculateRank = () => {
    const result = findSalaryRank(annualSalary);
    setRank(result);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-16 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text mb-2">
        💰 내 연봉은 대한민국에서 몇 등일까?
      </h2>
      <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-6">
        세전 연봉을 입력하고 내 소득 위치를 확인해보세요.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <CurrencyInput
            label="세전 연봉 입력"
            value={salaryInput}
            onValueChange={setSalaryInput}
            quickAmounts={[5000000, 1000000, 100000]}
          />
        </div>
        <button
          onClick={handleCalculateRank}
          className="w-full sm:w-auto px-8 py-3 bg-signature-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors self-end h-[58px] sm:h-auto mt-2 sm:mt-7"
        >
          결과 확인
        </button>
      </div>

      {rank !== null && (
        <div className="mt-8 text-center">
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
            당신의 연봉{" "}
            <strong className="text-signature-blue font-bold">
              {annualSalary.toLocaleString()}원
            </strong>
            은...
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold my-2 text-light-text dark:text-dark-text">
            대한민국 근로자 중{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
              상위 {rank}%
            </span>{" "}
            입니다!
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-teal-400 h-4 rounded-full"
              style={{ width: `${100 - rank}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            * 고용노동부 임금직무정보시스템 데이터를 기반으로 한 추정치입니다.
          </p>
        </div>
      )}
    </div>
  );
}
