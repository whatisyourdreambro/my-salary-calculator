// src/components/SalaryRank.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { calculateRank, salaryDistribution } from "@/lib/salaryData";
import CurrencyInput from "./CurrencyInput";
import type { StoredFinancialData, StoredRankData } from "@/app/types";
import { Save, RotateCcw, TrendingUp, Users, BarChart2 } from "lucide-react";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const formatNumber = (num: number) => num.toLocaleString();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border rounded-lg shadow-lg">
        <p className="label font-bold">{`${label}만원`}</p>
        <p className="intro text-primary">{`상위 ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export default function SalaryRank() {
  const [annualSalary, setAnnualSalary] = useState("50,000,000");
  const router = useRouter();

  const rankResult = useMemo(() => {
    const salaryNum = Number(annualSalary.replace(/,/g, ""));
    if (isNaN(salaryNum) || salaryNum <= 0) return null;
    return calculateRank(salaryNum, "all-all-all-all");
  }, [annualSalary]);

  const handleReset = useCallback(() => {
    setAnnualSalary("50,000,000");
  }, []);

  const handleSaveData = () => {
    if (!rankResult) {
      alert("연봉이 올바르게 입력되지 않았습니다.");
      return;
    }
    try {
      const existingDataJSON = localStorage.getItem(
        "moneysalary-financial-data"
      );
      const existingData: StoredFinancialData = existingDataJSON
        ? JSON.parse(existingDataJSON)
        : { lastUpdated: new Date().toISOString() };
      const rankDataToStore: StoredRankData = {
        annualSalary: Number(annualSalary.replace(/,/g, "")),
        rank: rankResult.rank,
      };
      const updatedData: StoredFinancialData = {
        ...existingData,
        rank: rankDataToStore,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        "moneysalary-financial-data",
        JSON.stringify(updatedData)
      );
      alert("연봉 순위 정보가 대시보드에 저장되었습니다!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-xl border space-y-6">
          <h2 className="text-xl font-bold">내 연봉 순위 확인하기</h2>
          <CurrencyInput
            label="세전 연봉 입력"
            value={annualSalary}
            onValueChange={setAnnualSalary}
            quickAmounts={[10000000, 5000000, 1000000]}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleReset}
              className="w-full py-3 bg-secondary font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
            >
              <RotateCcw size={16} /> 초기화
            </button>
            <button
              onClick={handleSaveData}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Save size={16} /> 대시보드 저장
            </button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-lg border">
          <h2 className="text-2xl font-bold text-center mb-4">
            💰 연봉 순위 결과
          </h2>
          {rankResult ? (
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                연봉 {formatNumber(rankResult.salary)}원
              </p>
              <p className="my-2">
                <span className="text-5xl font-bold text-primary">
                  상위 <CountUp end={rankResult.rank} duration={1.5} />%
                </span>
              </p>
              <p className="font-semibold text-muted-foreground">
                (대한민국 상위 {rankResult.totalRank.toLocaleString()}등 이내)
              </p>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-bold text-center mb-2">
                  <Users className="inline-block w-5 h-5 mr-2" />
                  그룹별 순위
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>동년배 중:</strong> 상위 {rankResult.ageGroupRank}%
                  </p>
                  <p>
                    <strong>성별 내:</strong> 상위 {rankResult.genderRank}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>연봉을 입력해주세요.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-card p-6 rounded-xl border">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart2 /> 연봉 분포 차트
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryDistribution} margin={{ right: 20 }}>
              <XAxis
                dataKey="salaryRange"
                tickFormatter={(value) => `${value / 10000}억`}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
              <Bar dataKey="percentage">
                {salaryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      rankResult &&
                      rankResult.salary >= entry.salaryRange &&
                      (salaryDistribution[index + 1] === undefined ||
                        rankResult.salary < salaryDistribution[index + 1].salaryRange)
                        ? "hsl(var(--primary))"
                        : "hsl(var(--secondary))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}