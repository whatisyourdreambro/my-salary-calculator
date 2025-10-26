// src/components/MyDashboard.tsx

"use client";

import type { StoredFinancialData } from "@/app/types";
import {
  calculateHealthScore,
  getFinancialAdvice,
} from "@/lib/dashboardAnalysis";
import CountUp from "react-countup";
import Link from "next/link";
import { Sparkles, RefreshCw } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface MyDashboardProps {
  data: StoredFinancialData;
  onReset: () => void;
}

const formatNumber = (num: number) => num.toLocaleString();

const HealthScoreGauge = ({ score, rating }: { score: number; rating: string; }) => {
  const scoreColorClass =
    score >= 80 ? "text-success"
    : score >= 60 ? "text-primary"
    : score >= 40 ? "text-warning"
    : "text-destructive";

  const scoreFillColor =
    score >= 80 ? "hsl(var(--success))"
    : score >= 60 ? "hsl(var(--primary))"
    : score >= 40 ? "hsl(var(--warning))"
    : "hsl(var(--destructive))";

  return (
    <div className="relative h-48 w-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: score }]} startAngle={180} endAngle={-180} barSize={20}>
          <RadialBar background dataKey="value" cornerRadius={10} fill={scoreFillColor} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${scoreColorClass}`}>
        <p className="text-4xl font-bold">
          {score}
          <span className="text-2xl">점</span>
        </p>
        <p className="font-semibold text-sm">{rating}</p>
      </div>
    </div>
  );
};

const AdviceCard = ({ title, message, link, linkText }: { title: string; message: string; link: string; linkText: string; }) => (
  <div className="bg-background p-6 rounded-xl border border-border flex flex-col">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="w-5 h-5 text-primary" />
      <h4 className="font-bold text-lg text-foreground">{title}</h4>
    </div>
    <p className="text-sm text-muted-foreground flex-grow">{message}</p>
    <Link href={link} className="mt-4 text-sm font-semibold text-primary self-start hover:underline">
      {linkText} →
    </Link>
  </div>
);

export default function MyDashboard({ data, onReset }: MyDashboardProps) {
  const { salary, severance, rank, futureSalary } = data;
  const { score, rating } = calculateHealthScore(data);
  const advice = getFinancialAdvice(data);

  const netAnnual = salary ? salary.monthlyNet * 12 : 0;
  const totalDeduction = salary ? salary.annualSalary - netAnnual : 0;
  const incomeBreakdownData = [
    { name: "연간 실수령액", value: netAnnual },
    { name: "연간 총 공제액", value: totalDeduction },
  ].filter((item) => item.value > 0);

  const pieChartColors = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];

  return (
    <div className="w-full space-y-10 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">나의 종합 금융 대시보드</h1>
        <p className="text-muted-foreground">마지막 업데이트: {new Date(data.lastUpdated).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
            <h3 className="text-xl font-bold mb-4 text-center">핵심 지표</h3>
            <div className="space-y-4">
              {salary && (
                <div className="flex justify-between items-baseline p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-semibold text-muted-foreground">월 실수령액</span>
                  <p className="text-2xl font-bold text-primary"><CountUp end={salary.monthlyNet} separator="," />원</p>
                </div>
              )}
              {rank && (
                <div className="flex justify-between items-baseline p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-semibold text-muted-foreground">연봉 순위</span>
                  <p className="text-2xl font-bold text-foreground">상위 {rank.rank}%</p>
                </div>
              )}
              {futureSalary && (
                <div className="flex justify-between items-baseline p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-semibold text-muted-foreground">{futureSalary.years}년 후 연봉</span>
                  <p className="text-2xl font-bold text-foreground"><CountUp end={futureSalary.finalSalary} separator="," />원</p>
                </div>
              )}
              {severance && (
                <div className="flex justify-between items-baseline p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-semibold text-muted-foreground">예상 퇴직금</span>
                  <p className="text-2xl font-bold text-foreground"><CountUp end={severance.estimatedSeverancePay} separator="," />원</p>
                </div>
              )}
            </div>
            <Link href="/report" className="w-full mt-6 inline-block text-center py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-95 transition-all">
              상세 리포트 보기
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1 bg-card p-6 rounded-2xl shadow-lg border border-border flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold mb-4">나의 금융 건강 점수</h3>
          <HealthScoreGauge score={score} rating={rating} />
        </div>

        <div className="lg:col-span-1 bg-card p-6 rounded-2xl shadow-lg border border-border">
          <h3 className="text-xl font-bold mb-4">연봉 분석</h3>
          {salary ? (
            <div className="text-center">
              <p className="font-semibold text-muted-foreground">세전 연봉 {formatNumber(salary.annualSalary)}원</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                      {incomeBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${formatNumber(value)} 원`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">연봉 데이터가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
        <h3 className="text-2xl font-bold mb-6 text-center">AI 기반 맞춤 조언</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advice.length > 0 ? (
            advice.map((adv, index) => <AdviceCard key={index} {...adv} />)
          ) : (
            <p className="md:col-span-2 text-center text-muted-foreground py-8">더 많은 정보를 입력하면 맞춤형 조언을 받을 수 있습니다.</p>
          )}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex justify-center items-center">
        <button onClick={onReset} className="py-3 px-6 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2">
          <RefreshCw size={16} />
          대시보드 초기화
        </button>
      </div>
    </div>
  );
}
