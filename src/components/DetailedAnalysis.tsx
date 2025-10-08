// src/components/DetailedAnalysis.tsx
"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CalculationResult } from "@/lib/calculator";
import {
  Calendar,
  TrendingDown,
  Gift,
  Car,
  Home,
  Briefcase,
  PiggyBank,
} from "lucide-react";
import CountUp from "react-countup";

const formatNumber = (num: number) => num.toLocaleString();

const COLORS = ["#0052ff", "#e11d48"];
const DEDUCTION_COLORS = [
  "#ff8c00",
  "#ff6384",
  "#ffcd56",
  "#4bc0c0",
  "#9966ff",
  "#ff9f40",
];

// 마일스톤 데이터 및 아이콘 정의
const milestones = [
  { amount: 1500000, label: "국내 5성급 호텔 호캉스", Icon: Home },
  { amount: 3000000, label: "최신형 스마트폰 플렉스", Icon: Gift },
  { amount: 5000000, label: "유럽 왕복 항공권", Icon: Briefcase },
  { amount: 10000000, label: "천만원 종잣돈 마련!", Icon: PiggyBank },
  { amount: 25000000, label: "경차(캐스퍼) 현금 구매", Icon: Car },
  { amount: 50000000, label: "5천만원 종잣돈 달성!", Icon: PiggyBank },
];

interface DetailedAnalysisProps {
  annualSalary: number;
  result: CalculationResult;
}

export default function DetailedAnalysis({
  annualSalary,
  result,
}: DetailedAnalysisProps) {
  const monthlyGross = useMemo(
    () => Math.round(annualSalary / 12),
    [annualSalary]
  );

  const compositionData = [
    { name: "월 실수령액", value: result.monthlyNet },
    { name: "월 총 공제액", value: result.totalDeduction },
  ];

  const deductionDetails = [
    { name: "국민연금", value: result.pension, rate: "4.5%" },
    { name: "건강보험", value: result.health, rate: "3.545%" },
    { name: "장기요양", value: result.longTermCare, rate: "건강보험의 12.95%" },
    { name: "고용보험", value: result.employment, rate: "0.9%" },
    { name: "소득세", value: result.incomeTax, rate: "소득 구간별" },
    { name: "지방소득세", value: result.localTax, rate: "소득세의 10%" },
  ].filter((item) => item.value > 0);

  // 연봉 타임라인 데이터 생성 로직
  const timelineData = useMemo(() => {
    const data = [];
    let cumulativeNet = 0;
    let milestoneIndex = 0;
    for (let i = 1; i <= 12; i++) {
      cumulativeNet += result.monthlyNet;
      let achievedMilestone = null;
      if (
        milestoneIndex < milestones.length &&
        cumulativeNet >= milestones[milestoneIndex].amount
      ) {
        achievedMilestone = milestones[milestoneIndex];
        milestoneIndex++;
      }
      data.push({ month: i, cumulativeNet, milestone: achievedMilestone });
    }
    return data;
  }, [result.monthlyNet]);

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-8 text-center">월급 상세 분석</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        {/* Left: Donut Chart & Composition */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">
            월 세전 급여: {formatNumber(monthlyGross)}원
          </p>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${formatNumber(value)} 원`}
                />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Deduction Details Table */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-6 h-6 text-danger" />
            <h3 className="text-xl font-bold">상세 공제 내역</h3>
          </div>
          <div className="space-y-2 text-sm">
            {deductionDetails.map((item, index) => (
              <div
                key={item.name}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center">
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-3"
                    style={{
                      backgroundColor:
                        DEDUCTION_COLORS[index % DEDUCTION_COLORS.length],
                    }}
                  ></span>
                  <span className="font-semibold text-base">{item.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.rate})
                  </span>
                </div>
                <span className="font-mono font-bold text-base">
                  {formatNumber(item.value)}원
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Timeline */}
      <div className="mt-12 pt-8 border-t dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-7 h-7 text-green-500" />
          <h3 className="text-xl font-bold">연봉 타임라인: 12개월의 여정</h3>
        </div>
        <div className="relative pl-8">
          {/* Timeline Vertical Line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

          {timelineData.map((item) => (
            <div key={item.month} className="mb-8 relative">
              <div className="absolute -left-5 top-1.5 w-4 h-4 bg-primary rounded-full border-4 border-light-card dark:border-dark-card"></div>
              <p className="font-bold text-lg">{item.month}개월 후</p>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                누적 실수령액:{" "}
                <span className="font-bold text-primary">
                  {formatNumber(item.cumulativeNet)}원
                </span>
              </p>
              {item.milestone && (
                <div className="mt-2 flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400 animate-fade-in-up">
                  <item.milestone.Icon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <p className="font-semibold text-sm sm:text-base">
                    <span className="font-bold text-yellow-700 dark:text-yellow-300">
                      마일스톤 달성!
                    </span>{" "}
                    {item.milestone.label}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-800/20 rounded-lg text-center border border-green-200 dark:border-green-700">
          <p className="font-bold text-lg text-green-700 dark:text-green-300">
            1년 후, 당신은{" "}
            <CountUp
              end={result.monthlyNet * 12}
              separator=","
              duration={1}
              className="text-2xl"
            />
            원의 가치를 만들어냈습니다!
          </p>
        </div>
      </div>
    </div>
  );
}
