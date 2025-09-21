// src/components/MyDashboard.tsx

"use client";

import type { StoredFinancialData } from "@/app/types";
import CountUp from "react-countup";
import Link from "next/link";
// [수정] 필요한 아이콘들을 모두 import합니다.
import { Home, LogOut, Wallet, BarChart2, TrendingUp } from "lucide-react";

interface MyDashboardProps {
  data: StoredFinancialData;
  onReset: () => void;
}

const InfoCard = ({
  icon: Icon,
  title,
  value,
  unit,
  link,
  linkText,
}: {
  icon: React.ElementType;
  title: string;
  value: number;
  unit: string;
  link: string;
  linkText: string;
}) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl flex flex-col">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-6 h-6 text-gray-500" />
      <h3 className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">
        {title}
      </h3>
    </div>
    <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-1 flex-grow">
      <CountUp end={value} separator="," />
      <span className="text-xl ml-1">{unit}</span>
    </p>
    <Link
      href={link}
      className="mt-4 text-sm font-semibold text-signature-blue self-start hover:underline"
    >
      {linkText} →
    </Link>
  </div>
);

export default function MyDashboard({ data, onReset }: MyDashboardProps) {
  const { salary, severance, homeLoan, rank, futureSalary, lastUpdated } = data;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 text-center">
      <div className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
        <p className="text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary">
          나의 종합 금융 대시보드
        </p>

        {salary && (
          <h2 className="text-4xl sm:text-5xl font-bold text-light-text dark:text-dark-text my-4">
            월 실수령액{" "}
            <span className="text-signature-blue">
              <CountUp end={salary.monthlyNet} separator="," />원
            </span>
          </h2>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salary && (
            <InfoCard
              icon={Wallet}
              title="기준 연봉"
              value={salary.annualSalary}
              unit="원"
              link="/?tab=salary"
              linkText="급여 다시 계산하기"
            />
          )}
          {rank && (
            <InfoCard
              icon={BarChart2}
              title={`연봉 순위 (${rank.condition})`}
              value={rank.rank}
              unit="%"
              link="/?tab=rank"
              linkText="순위 다시 계산하기"
            />
          )}
          {futureSalary && (
            <InfoCard
              icon={TrendingUp}
              title={`${futureSalary.years}년 후 예상 연봉`}
              value={futureSalary.finalSalary}
              unit="원"
              link="/?tab=future"
              linkText="미래 다시 예측하기"
            />
          )}
          {severance && (
            <InfoCard
              icon={LogOut}
              title="예상 퇴직금"
              value={severance.estimatedSeverancePay}
              unit="원"
              link="/?tab=severance"
              linkText="퇴직금 다시 계산하기"
            />
          )}
          {homeLoan && (
            <InfoCard
              icon={Home}
              title="주택대출 월 상환액"
              value={homeLoan.monthlyPayment}
              unit="원"
              link="/home-loan"
              linkText="대출 다시 계산하기"
            />
          )}
        </div>

        <div className="mt-8 pt-6 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            마지막 저장: {new Date(lastUpdated).toLocaleString()}
          </p>
          <div className="flex gap-4">
            <button
              onClick={onReset}
              className="py-2 px-5 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              데이터 초기화
            </button>
            <Link
              href="/report"
              className="py-2 px-5 bg-signature-blue text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              종합 리포트 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
