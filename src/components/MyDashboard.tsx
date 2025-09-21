// src/components/MyDashboard.tsx

"use client";

import type { StoredFinancialData } from "@/app/types";
import CountUp from "react-countup";
import Link from "next/link";
import {
  Home,
  LogOut,
  Wallet,
  BarChart2,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
}) => {
  const router = useRouter();

  return (
    <div className="bg-gray-50 dark:bg-dark-bg p-6 rounded-xl flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-gray-200 dark:border-gray-800">
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
      <button
        onClick={() => router.push(link)}
        className="mt-4 text-sm font-semibold text-primary self-start hover:underline"
      >
        {linkText} →
      </button>
    </div>
  );
};

const AddDataCard = () => (
  <Link
    href="/"
    className="bg-gray-100 dark:bg-dark-bg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center text-center transition-all hover:border-primary hover:bg-blue-50 dark:hover:bg-primary/10"
  >
    <PlusCircle className="w-10 h-10 text-gray-400 dark:text-gray-600 mb-3" />
    <h3 className="font-bold text-light-text dark:text-dark-text">
      데이터 추가하기
    </h3>
    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
      새로운 금융 정보를 계산하고 대시보드를 채워보세요.
    </p>
  </Link>
);

export default function MyDashboard({ data, onReset }: MyDashboardProps) {
  const { salary, severance, homeLoan, rank, futureSalary, lastUpdated } = data;

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          나의 종합 금융 대시보드
        </h1>
        <p className="mt-3 text-light-text-secondary dark:text-dark-text-secondary">
          마지막 업데이트: {new Date(lastUpdated).toLocaleString()}
        </p>
      </div>

      {salary && (
        <div className="mb-10 p-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-lg border text-center animate-fade-in-up">
          <p className="text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary">
            월 예상 실수령액
          </p>
          <h2 className="text-5xl sm:text-6xl font-bold text-primary my-2">
            <CountUp end={salary.monthlyNet} separator="," duration={1.5} />원
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        {rank ? (
          <InfoCard
            icon={BarChart2}
            title={`연봉 순위 (${rank.condition})`}
            value={rank.rank}
            unit="%"
            link="/?tab=rank"
            linkText="순위 다시 계산하기"
          />
        ) : (
          <AddDataCard />
        )}

        {futureSalary ? (
          <InfoCard
            icon={TrendingUp}
            title={`${futureSalary.years}년 후 예상 연봉`}
            value={futureSalary.finalSalary}
            unit="원"
            link="/?tab=future"
            linkText="미래 다시 예측하기"
          />
        ) : (
          <AddDataCard />
        )}

        {severance ? (
          <InfoCard
            icon={LogOut}
            title="예상 퇴직금"
            value={severance.estimatedSeverancePay}
            unit="원"
            link="/?tab=severance"
            linkText="퇴직금 다시 계산하기"
          />
        ) : (
          <AddDataCard />
        )}

        {homeLoan ? (
          <InfoCard
            icon={Home}
            title="주택대출 월 상환액"
            value={homeLoan.monthlyPayment}
            unit="원"
            link="/home-loan"
            linkText="대출 다시 계산하기"
          />
        ) : (
          <AddDataCard />
        )}
      </div>

      <div className="mt-12 pt-8 border-t dark:border-gray-800 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link
          href="/report"
          className="py-3 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition"
        >
          상세 리포트 보기
        </Link>
        <button
          onClick={onReset}
          className="py-3 px-6 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          데이터 초기화
        </button>
      </div>
    </div>
  );
}
