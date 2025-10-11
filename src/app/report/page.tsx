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
import { Info, BarChart2, TrendingUp, Download, LayoutDashboard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formatNumber = (num: number) => num.toLocaleString();

const RADIAN = Math.PI / 180;

interface PieCustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

const renderCustomizedLabel = (props: object) => {
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
        useCORS: true,
        allowTaint: true,
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
      <main className="container py-12 sm:py-16 text-center">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>리포트 데이터를 불러오는 중...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              저장된 금융 정보가 없습니다.{" "}
              <Link href="/" className="text-primary font-bold hover:underline">
                홈으로 돌아가
              </Link>{" "}
              계산 결과를 먼저 저장해주세요.
            </p>
          </CardContent>
        </Card>
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
    <main className="container py-12 sm:py-16">
      <div ref={reportRef} className="bg-background p-8 rounded-2xl">
        <div className="text-center border-b pb-4 mb-8">
          <h1 className="text-4xl font-bold text-primary">종합 금융 리포트</h1>
          <p className="text-sm text-muted-foreground">
            Moneysalary | 최종 업데이트:{" "}
            {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="text-primary" />
                핵심 지표 요약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {salary && (
                  <div className="p-3 bg-muted rounded-xl">
                    <p className="text-sm font-semibold text-muted-foreground">
                      월 실수령액
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      <CountUp end={salary.monthlyNet} separator="," />원
                    </p>
                  </div>
                )}
                {rank !== null && (
                  <div className="p-3 bg-muted rounded-xl">
                    <p className="text-sm font-semibold text-muted-foreground">
                      연봉 순위
                    </p>
                    <p className="text-2xl font-bold">상위 {rank}%</p>
                  </div>
                )}
                {severance && (
                  <div className="p-3 bg-muted rounded-xl">
                    <p className="text-sm font-semibold text-muted-foreground">
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
                  <div className="p-3 bg-muted rounded-xl">
                    <p className="text-sm font-semibold text-muted-foreground">
                      월 상환액
                    </p>
                    <p className="text-2xl font-bold text-destructive">
                      <CountUp end={homeLoan.monthlyPayment} separator="," />원
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {salary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="text-primary" />
                  연간 소득 분석
                </CardTitle>
                <CardDescription>세전 {formatNumber(salary.annualSalary)}원 기준</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={annualCompositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={renderCustomizedLabel}>
                          {annualCompositionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${formatNumber(value)}원`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>실수령액 비중:</span>
                      <strong className="text-primary">
                        {financialRatios.netToGrossRatio}%
                      </strong>
                    </div>
                    {homeLoan && (
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>소득 대비 부채 비율(DTI):</span>
                        <strong className="text-destructive">
                          {financialRatios.debtToIncomeRatio}%
                        </strong>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground p-2">
                      소득 대비 부채 비율이 40%를 초과할 경우 재정적 위험이 높을 수
                      있습니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {futureSalary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-primary" />
                  {futureSalary.years}년 후 미래 연봉 예측
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={futureProjectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `${value / 10000}만원`} />
                      <Tooltip formatter={(value: number) => `${formatNumber(value)}원`} />
                      <Legend />
                      <Bar dataKey="내 연봉" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button onClick={handleDownload} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          리포트 이미지로 저장하기
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            대시보드로 돌아가기
          </Link>
        </Button>
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