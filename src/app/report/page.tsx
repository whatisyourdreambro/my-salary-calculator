// src/app/report/page.tsx

"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import type { StoredFinancialData } from "@/app/types";
import { findSalaryRank } from "@/lib/salaryData";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import Link from "next/link";
import CountUp from "react-countup";

const formatNumber = (num: number) => num.toLocaleString();

const COLORS = ["#0052ff", "#ffc82c", "#00C49F"];

// 파이 차트 라벨 렌더링 함수 (타입 최종 수정)
const RADIAN = Math.PI / 180;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Report = () => {
  const [data, setData] = useState<StoredFinancialData | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("moneysalary-financial-data");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        if (parsedData.salary) {
          const { rank: calculatedRank } = findSalaryRank(
            parsedData.salary.annualSalary,
            "all-all-all-all"
          );
          setRank(calculatedRank);
        }
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  const handleDownload = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current, {
        backgroundColor: null,
        scale: 2,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `Moneysalary_종합금융리포트.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  if (!data) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h1 className="text-3xl font-bold">리포트 데이터를 불러오는 중...</h1>
        <p className="mt-4">
          저장된 금융 정보가 없습니다.{" "}
          <Link href="/" className="text-primary font-bold">
            홈으로 돌아가
          </Link>{" "}
          계산 결과를 먼저 저장해주세요.
        </p>
      </main>
    );
  }

  const { salary, severance, homeLoan } = data;
  const netAnnual = salary ? salary.monthlyNet * 12 : 0;
  const totalDeduction = salary ? salary.annualSalary - netAnnual : 0;

  const chartData = [
    { name: "연간 실수령액", value: netAnnual },
    { name: "연간 총 공제액", value: totalDeduction },
    { name: "예상 퇴직금", value: severance?.estimatedSeverancePay || 0 },
  ].filter((item) => item.value > 0);

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div
        ref={reportRef}
        className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-lg border"
      >
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-primary">
            나의 종합 금융 리포트
          </h1>
          <p className="text-sm text-gray-500">
            마지막 업데이트: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center mb-8">
          {salary && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                월 실수령액
              </p>
              <p className="text-3xl font-bold text-primary">
                <CountUp end={salary.monthlyNet} separator="," />원
              </p>
            </div>
          )}
          {rank !== null && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                연봉 순위
              </p>
              <p className="text-3xl font-bold text-light-text dark:text-dark-text">
                상위 {rank}%
              </p>
            </div>
          )}
          {severance && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                예상 퇴직금
              </p>
              <p className="text-3xl font-bold text-light-text dark:text-dark-text">
                <CountUp end={severance.estimatedSeverancePay} separator="," />
                원
              </p>
            </div>
          )}
          {homeLoan && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                월 대출 상환액
              </p>
              <p className="text-3xl font-bold text-danger">
                <CountUp end={homeLoan.monthlyPayment} separator="," />원
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h3 className="text-xl font-bold mb-4 text-center">
            자산 구성 (연 단위)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, index) => (
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
        </div>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleDownload}
          className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition"
        >
          리포트 이미지로 저장하기
        </button>
        <Link
          href="/dashboard"
          className="w-full text-center py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    </main>
  );
};

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading Report...</div>}>
      <Report />
    </Suspense>
  );
}
