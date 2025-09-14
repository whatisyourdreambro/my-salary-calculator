"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";

// --- 데이터 구조 업그레이드 ---
// 데이터 출처: 고용노동부 임금직무정보시스템 데이터를 기반으로 한 샘플 데이터
// 실제 서비스에서는 이 구조에 맞춰 전체 데이터를 로드해야 합니다.

type PercentileData = { percentile: number; income: number };

const salaryDataByJobAndExperience: Record<
  string,
  Record<string, PercentileData[]>
> = {
  all: {
    // 전체 근로자 데이터 (기존 데이터)
    all: [
      { percentile: 10, income: 20550000 },
      { percentile: 25, income: 28310000 },
      { percentile: 50, income: 41880000 },
      { percentile: 75, income: 64160000 },
      { percentile: 90, income: 96950000 },
      { percentile: 95, income: 128410000 },
    ],
  },
  management: {
    // 경영/사무 직군
    "1-3": [
      // 1~3년차
      { percentile: 10, income: 28000000 },
      { percentile: 25, income: 32000000 },
      { percentile: 50, income: 38000000 },
      { percentile: 75, income: 45000000 },
      { percentile: 90, income: 55000000 },
      { percentile: 95, income: 65000000 },
    ],
    "4-7": [
      // 4~7년차
      { percentile: 10, income: 40000000 },
      { percentile: 25, income: 48000000 },
      { percentile: 50, income: 58000000 },
      { percentile: 75, income: 70000000 },
      { percentile: 90, income: 85000000 },
      { percentile: 95, income: 100000000 },
    ],
    "8+": [
      // 8년차 이상
      { percentile: 10, income: 60000000 },
      { percentile: 25, income: 72000000 },
      { percentile: 50, income: 90000000 },
      { percentile: 75, income: 115000000 },
      { percentile: 90, income: 140000000 },
      { percentile: 95, income: 170000000 },
    ],
  },
  it_dev: {
    // IT/개발 직군
    "1-3": [
      { percentile: 10, income: 35000000 },
      { percentile: 25, income: 42000000 },
      { percentile: 50, income: 50000000 },
      { percentile: 75, income: 60000000 },
      { percentile: 90, income: 75000000 },
      { percentile: 95, income: 90000000 },
    ],
    "4-7": [
      { percentile: 10, income: 60000000 },
      { percentile: 25, income: 70000000 },
      { percentile: 50, income: 85000000 },
      { percentile: 75, income: 105000000 },
      { percentile: 90, income: 130000000 },
      { percentile: 95, income: 150000000 },
    ],
    "8+": [
      { percentile: 10, income: 90000000 },
      { percentile: 25, income: 110000000 },
      { percentile: 50, income: 130000000 },
      { percentile: 75, income: 160000000 },
      { percentile: 90, income: 200000000 },
      { percentile: 95, income: 250000000 },
    ],
  },
  design: {
    // 디자인 직군
    "1-3": [
      { percentile: 10, income: 27000000 },
      { percentile: 25, income: 31000000 },
      { percentile: 50, income: 36000000 },
      { percentile: 75, income: 42000000 },
      { percentile: 90, income: 50000000 },
      { percentile: 95, income: 60000000 },
    ],
    "4-7": [
      { percentile: 10, income: 38000000 },
      { percentile: 25, income: 45000000 },
      { percentile: 50, income: 55000000 },
      { percentile: 75, income: 65000000 },
      { percentile: 90, income: 80000000 },
      { percentile: 95, income: 95000000 },
    ],
    "8+": [
      { percentile: 10, income: 58000000 },
      { percentile: 25, income: 68000000 },
      { percentile: 50, income: 80000000 },
      { percentile: 75, income: 95000000 },
      { percentile: 90, income: 110000000 },
      { percentile: 95, income: 130000000 },
    ],
  },
};

const findSalaryRank = (
  annualSalary: number,
  job: string,
  experience: string
) => {
  if (annualSalary <= 0) return null;

  const distribution = salaryDataByJobAndExperience[job]?.[experience];
  if (!distribution) {
    // 선택한 조건의 데이터가 없으면 전체 데이터 사용
    return findSalaryRank(annualSalary, "all", "all");
  }

  const rank = [...distribution]
    .reverse()
    .find((data) => annualSalary >= data.income);

  const percentile = rank ? rank.percentile : 0;
  return 100 - percentile;
};

export default function SalaryRank() {
  const [salaryInput, setSalaryInput] = useState("");
  const [jobCategory, setJobCategory] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [result, setResult] = useState<{
    rank: number;
    condition: string;
  } | null>(null);

  const annualSalary = useMemo(
    () => Number(salaryInput.replace(/,/g, "")),
    [salaryInput]
  );

  const handleCalculateRank = () => {
    const rank = findSalaryRank(annualSalary, jobCategory, experienceLevel);
    let condition = "대한민국 전체 근로자";
    if (jobCategory !== "all" && experienceLevel !== "all") {
      const jobMap: Record<string, string> = {
        management: "경영/사무",
        it_dev: "IT/개발",
        design: "디자인",
      };
      const expMap: Record<string, string> = {
        "1-3": "1~3년차",
        "4-7": "4~7년차",
        "8+": "8년차 이상",
      };
      condition = `'${jobMap[jobCategory]}' 직군 '${expMap[experienceLevel]}' 경력`;
    }
    if (rank !== null) {
      setResult({ rank, condition });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-16 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text mb-2">
        💰 내 연봉, 동료들과 비교하면 몇 등일까?
      </h2>
      <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-6">
        직군과 경력을 선택하고 더 정확한 내 소득 위치를 확인해보세요.
      </p>

      {/* --- UI 업그레이드: 필터 추가 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="job-category"
            className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
          >
            직군 선택
          </label>
          <select
            id="job-category"
            value={jobCategory}
            onChange={(e) => setJobCategory(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card"
          >
            <option value="all">전체 직군</option>
            <option value="management">경영/사무</option>
            <option value="it_dev">IT/개발</option>
            <option value="design">디자인</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="experience-level"
            className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
          >
            경력 선택
          </label>
          <select
            id="experience-level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card"
          >
            <option value="all">전체 경력</option>
            <option value="1-3">1~3년</option>
            <option value="4-7">4~7년</option>
            <option value="8+">8년 이상</option>
          </select>
        </div>
      </div>

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

      {result && (
        <div className="mt-8 text-center">
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
            당신의 연봉{" "}
            <strong className="text-signature-blue font-bold">
              {annualSalary.toLocaleString()}원
            </strong>
            은...
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold my-2 text-light-text dark:text-dark-text">
            {result.condition} 중{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
              상위 {result.rank}%
            </span>{" "}
            입니다!
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-teal-400 h-4 rounded-full"
              style={{ width: `${100 - result.rank}%` }}
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
