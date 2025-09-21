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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import html2canvas from "html2canvas";
import Link from "next/link";
import CountUp from "react-countup";
import { Info, BarChart2, TrendingUp } from "lucide-react";

const formatNumber = (num: number) => num.toLocaleString();

const COLORS = ["#0052ff", "#ffc82c", "#00C49F", "#FF8042", "#8884d8"];

const RADIAN = Math.PI / 180;

// 타입 단언에 사용할 인터페이스를 정의합니다. (인덱스 시그니처 제거)
interface PieCustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

// 1. 함수의 인자 타입을 일반 object로 변경하여 타입 호환성 문제를 해결합니다.
const renderCustomizedLabel = (props: object) => {
  // 2. 함수 내부에서 'as'를 사용해 props의 타입을 단언해줍니다.
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } =
    props as PieCustomLabelProps;

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
      className="font-bold text-xs"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
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

  const { salary, severance, homeLoan, futureSalary } = data;
  const netAnnual = salary ? salary.monthlyNet * 12 : 0;
  const totalDeduction = salary ? salary.annualSalary - netAnnual : 0;

  const financialRatios = {
    netToGrossRatio:
      salary && salary.annualSalary > 0
        ? ((netAnnual / salary.annualSalary) * 100).toFixed(1)
        : 0,
    debtToIncomeRatio:
      homeLoan && salary && salary.annualSalary > 0
        ? (
            ((homeLoan.monthlyPayment * 12) / salary.annualSalary) *
            100
          ).toFixed(1)
        : 0,
  };

  const annualCompositionData = [
    { name: "실수령액", value: netAnnual },
    { name: "세금/보험료", value: totalDeduction },
  ].filter((item) => item.value > 0);

  const futureProjectionData =
    futureSalary && salary && futureSalary.years > 0
      ? Array.from({ length: futureSalary.years + 1 }, (_, i) => {
          const year = new Date().getFullYear() + i;
          const baseSalary = salary.annualSalary;
          const finalSalary = futureSalary.finalSalary;
          const estimatedSalary =
            baseSalary + ((finalSalary - baseSalary) / futureSalary.years) * i;
          return { year, "내 연봉": Math.round(estimatedSalary) };
        })
      : [];

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div
        ref={reportRef}
        className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-lg border"
      >
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-4xl font-bold text-primary">종합 금융 리포트</h1>
          <p className="text-sm text-gray-500">
            Moneysalary | 최종 업데이트:{" "}
            {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>

        {/* Section 1: Key Metrics */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Info className="text-primary" />
            핵심 지표 요약
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {salary && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  월 실수령액
                </p>
                <p className="text-2xl font-bold text-primary">
                  <CountUp end={salary.monthlyNet} separator="," />원
                </p>
              </div>
            )}
            {rank !== null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  연봉 순위
                </p>
                <p className="text-2xl font-bold">상위 {rank}%</p>
              </div>
            )}
            {severance && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  예상 퇴직금
                </p>
                <p className="text-2xl font-bold">
                  <CountUp
                    end={severance.estimatedSeverancePay}
                    separator=","
                  />
                  원
                </p>
              </div>
            )}
            {homeLoan && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  월 상환액
                </p>
                <p className="text-2xl font-bold text-danger">
                  <CountUp end={homeLoan.monthlyPayment} separator="," />원
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Annual Income Breakdown */}
        {salary && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart2 className="text-primary" />
              연간 소득 분석 (세전 {formatNumber(salary.annualSalary)}원)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={annualCompositionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {annualCompositionData.map((entry, index) => (
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
              <div className="text-sm space-y-2">
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <span>실수령액 비중:</span>
                  <strong className="text-primary">
                    {financialRatios.netToGrossRatio}%
                  </strong>
                </div>
                {homeLoan && (
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                    <span>소득 대비 부채 비율(DTI):</span>
                    <strong className="text-danger">
                      {financialRatios.debtToIncomeRatio}%
                    </strong>
                  </div>
                )}
                <p className="text-xs text-gray-500 p-2">
                  소득 대비 부채 비율이 40%를 초과할 경우 재정적 위험이 높을 수
                  있습니다.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Section 3: Future Projection */}
        {futureSalary && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary" />
              {futureSalary.years}년 후 미래 연봉 예측
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={futureProjectionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `${value / 10000}만원`} />
                  <Tooltip
                    formatter={(value: number) => `${formatNumber(value)}원`}
                  />
                  <Legend />
                  <Bar dataKey="내 연봉" fill="#0052ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
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
