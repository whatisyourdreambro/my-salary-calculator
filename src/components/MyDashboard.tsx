"use client";

import type { StoredSalaryData } from "@/app/types";
import CountUp from "react-countup";
import Link from "next/link"; // Link 컴포넌트 import 추가

interface MyDashboardProps {
  data: StoredSalaryData;
  onReset: () => void; // 데이터를 초기화하고 계산기 화면으로 돌아가는 함수
}

const formatNumber = (num: number) => num.toLocaleString();

export default function MyDashboard({ data, onReset }: MyDashboardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 text-center">
      <div className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
        <p className="text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary">
          저장된 나의 연봉 정보
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-light-text dark:text-dark-text my-4">
          월 실수령액{" "}
          <span className="text-signature-blue">
            <CountUp end={data.monthlyNet} separator="," />원
          </span>
        </h2>
        <div className="mt-6 pt-6 border-t dark:border-gray-700 grid grid-cols-2 md:grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">기준 연봉</p>
            <p className="font-bold text-lg">
              {formatNumber(data.annualSalary)}원
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">
              부양가족(본인포함)
            </p>
            <p className="font-bold text-lg">{data.dependents}명</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">비과세액(월)</p>
            <p className="font-bold text-lg">
              {formatNumber(data.nonTaxableAmount)}원
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          {/* [수정] Link 컴포넌트를 사용하여 리포트 페이지로 이동 */}
          <Link
            href="/report"
            className="w-full py-3 bg-signature-blue text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            종합 리포트 보기
          </Link>
          <button
            onClick={onReset}
            className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            다시 계산하기
          </button>
        </div>
      </div>
    </div>
  );
}
