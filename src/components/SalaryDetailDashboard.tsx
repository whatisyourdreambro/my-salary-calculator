// src/components/SalaryDetailDashboard.tsx

"use client";

import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CalculationResult } from "@/lib/calculator";
// [수정] SalaryStat 타입을 salaryData에서 직접 가져오도록 변경합니다.
import type { SalaryStat } from "@/lib/salaryData";

const formatNumber = (num: number) => num.toLocaleString();

interface Props {
  annualSalary: number;
  calculationResult: CalculationResult;
  rank: number;
  rankData: SalaryStat;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#ff4d4d",
];

export default function SalaryDetailDashboard({
  annualSalary,
  calculationResult,
  rank,
  rankData,
}: Props) {
  const {
    monthlyNet,
    totalDeduction,
    pension,
    health,
    longTermCare,
    employment,
    incomeTax,
    localTax,
  } = calculationResult;

  const deductionData = [
    { name: "국민연금", value: pension },
    { name: "건강보험", value: health },
    { name: "장기요양", value: longTermCare },
    { name: "고용보험", value: employment },
    { name: "소득세", value: incomeTax },
    { name: "지방소득세", value: localTax },
  ].filter((d) => d.value > 0);

  const recommendedGuides = [
    annualSalary <= 40000000 && {
      title: "2025년 최저임금 완벽정리",
      href: "/guides/minimum-wage",
    },
    annualSalary <= 50000000 && {
      title: "주휴수당 계산법 및 지급 조건",
      href: "/guides/holiday-allowance",
    },
    annualSalary > 50000000 && {
      title: "연말정산 A to Z: 13월의 월급 제대로 챙기기",
      href: "/guides/year-end-tax-settlement",
    },
    annualSalary > 70000000 && {
      title: "퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기",
      href: "/guides/severance-tax",
    },
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center p-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
        <p className="text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary">
          연봉{" "}
          <span className="font-bold text-signature-blue">
            {formatNumber(annualSalary)}
          </span>
          원의 분석 결과
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-light-text dark:text-dark-text my-4">
          월{" "}
          <span className="text-signature-blue">
            {formatNumber(monthlyNet)}
          </span>
          원
        </h1>
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
          대한민국 전체 근로자 중{" "}
          <span className="text-signature-blue">상위 {rank}%</span>에
          해당합니다.
        </p>
        <div className="mt-6 pt-6 border-t dark:border-gray-700 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              그룹 중위연봉
            </p>
            <p className="text-xl font-bold">
              {formatNumber(rankData.median / 10000)}만원
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              그룹 평균연봉
            </p>
            <p className="text-xl font-bold">
              {formatNumber(rankData.average / 10000)}만원
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 공제 내역 분석 */}
        <div className="lg:col-span-2 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4">
            월 공제 내역 분석 (총 {formatNumber(totalDeduction)}원)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deductionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {deductionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${formatNumber(value)}원`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex flex-col justify-center">
              {deductionData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center text-base"
                >
                  <div className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-light-text dark:text-dark-text">
                    {formatNumber(item.value)}원
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 맞춤형 가이드 */}
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4">당신을 위한 맞춤 가이드</h2>
          <div className="space-y-4">
            {recommendedGuides.map(
              (guide) =>
                guide && (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="block p-4 border rounded-lg hover:shadow-lg transition-shadow bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
                  >
                    <p className="font-semibold text-signature-blue">
                      {guide.title}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                      자세히 보기 →
                    </span>
                  </Link>
                )
            )}
            <Link
              href="/guides"
              className="block p-4 border border-dashed rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                더 많은 가이드 전체 보기
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
