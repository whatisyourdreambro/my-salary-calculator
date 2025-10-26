// src/components/DetailedAnalysis.tsx
"use client";

import { useMemo } from "react";
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
import { TrendingDown, AlertTriangle, ShieldCheck, Award } from "lucide-react";

const formatNumber = (num: number) => num.toLocaleString();

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))"];
const DEDUCTION_COLORS = [
  "#ff8c00",
  "#ff6384",
  "#ffcd56",
  "#4bc0c0",
  "#9966ff",
  "#ff9f40",
];

interface DetailedAnalysisProps {
  annualSalary: number;
  result: CalculationResult;
  monthlyExpenses: number;
}

export default function DetailedAnalysis({
  annualSalary,
  result,
  monthlyExpenses,
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

  const FinancialHealthSection = () => {
    if (result.monthlyNet <= 0 || monthlyExpenses <= 0) {
      return null;
    }

    const monthlySaving = result.monthlyNet - monthlyExpenses;
    const savingRate = Math.round((monthlySaving / result.monthlyNet) * 100);

    const getHealthStatus = () => {
      if (savingRate < 20) {
        return {
          Icon: AlertTriangle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          title: "위험: 재정 상태 점검이 시급합니다.",
          message: `현재 저축률은 ${savingRate}%로, 미래를 위한 재정적 준비가 부족한 상태입니다. 소비 습관을 점검하고 고정 지출을 줄이는 노력이 반드시 필요합니다.`,
          actionLink: "/guides/first-job-investment",
          actionText: "사회초년생 재테크 가이드 보기",
        };
      }
      if (savingRate < 50) {
        return {
          Icon: ShieldCheck,
          color: "text-primary",
          bgColor: "bg-primary/10",
          title: "안정: 잘하고 있지만, 더 발전할 수 있습니다.",
          message: `현재 저축률은 ${savingRate}%로, 안정적인 재무 흐름을 만들고 있습니다. 여기서 만족하지 말고, 투자 파이프라인을 구축하여 자산 증식 속도를 높여보세요.`,
          actionLink: "/guides/road-to-100m-part3-invest",
          actionText: "투자 파이프라인 구축 가이드 보기",
        };
      }
      return {
        Icon: Award,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        title: "우수: 훌륭한 재무 습관을 가지고 있습니다.",
        message: `현재 저축률은 ${savingRate}%로, 매우 훌륭한 저축 습관을 가지고 있습니다. 이제 N잡, 부수입 등을 통해 소득의 파이 자체를 키워 경제적 자유를 앞당기세요.`,
        actionLink: "/guides/road-to-100m-part2-sidejob",
        actionText: "N잡으로 월 100만원 더 벌기",
      };
    };

    const status = getHealthStatus();

    return (
      <div className="mt-12 pt-8 border-t">
        <div className={`p-6 rounded-2xl border ${status.bgColor}`}>
          <div className="flex items-center gap-4">
            <status.Icon className={`w-10 h-10 ${status.color}`} />
            <div>
              <h3 className={`text-2xl font-bold ${status.color}`}>
                금융 건전성: {status.title}
              </h3>
            </div>
          </div>
          <div className="mt-4 pl-14">
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div className="bg-card p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  월 저축 가능액
                </p>
                <p className="font-bold text-lg">
                  {formatNumber(monthlySaving)}원
                </p>
              </div>
              <div className="bg-card p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  예상 저축률
                </p>
                <p className={`font-bold text-lg ${status.color}`}>
                  {savingRate}%
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {status.message}
            </p>
            <Link
              href={status.actionLink}
              className={`mt-3 inline-block text-sm font-bold ${status.color} hover:underline`}
            >
              {status.actionText} →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-8 text-center">월급 상세 분석</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        {/* Left: Donut Chart & Composition */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <p className="font-semibold text-muted-foreground">
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
            <TrendingDown className="w-6 h-6 text-destructive" />
            <h3 className="text-xl font-bold">상세 공제 내역</h3>
          </div>
          <div className="space-y-2 text-sm">
            {deductionDetails.map((item, index) => (
              <div
                key={item.name}
                className="flex justify-between items-center p-3 bg-secondary rounded-lg"
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
                  <span className="text-xs text-muted-foreground ml-2">
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

      <FinancialHealthSection />
    </div>
  );
}