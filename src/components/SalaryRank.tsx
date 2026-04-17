// src/components/SalaryRank.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
// [수정] 사용하지 않는 salaryDistribution 제거
import { calculateRank, salaryData } from "@/lib/salaryData";
import CurrencyInput from "./CurrencyInput";
import type { StoredFinancialData, StoredRankData } from "@/app/types";
import { Save, RotateCcw, Users, BarChart2 } from "lucide-react"; // TrendingUp 제거
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

const formatNumber = (num: number) => num.toLocaleString('ko-KR');

// 타입 정의 추가
type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length && label) {
    // 대한민국 근로자 수 (대략적인 값, 필요시 업데이트)
    const totalWorkers = 21869000;
    const rank = payload[0].value; // 상위 %
    const rankNum = Math.round((totalWorkers * rank) / 100);

    return (
      <div className="p-3 bg-background/90 border rounded-lg shadow-lg text-sm">
        <p className="font-bold text-lg">{`${formatNumber(
          parseInt(label) * 10000
        )}원`}</p>
        <p className="text-primary font-semibold">{`상위 ${rank}%`}</p>
        <p className="text-muted-foreground">{`(약 ${rankNum.toLocaleString('ko-KR')}등 이내)`}</p>
      </div>
    );
  }
  return null;
};

// salaryDistribution 데이터 가공 (차트용)
const chartDistribution = Object.entries(
  salaryData["all-all-all-all"].percentiles
)
  .map(([p, s]) => ({
    salaryRange: Math.round(s / 10000), // 만원 단위
    percentage: 100 - parseInt(p, 10), // 상위 %로 변환
  }))
  .sort((a, b) => a.salaryRange - b.salaryRange); // 연봉 오름차순 정렬

export default function SalaryRank() {
  const [annualSalary, setAnnualSalary] = useState("50,000,000");
  const router = useRouter();

  const rankResult = useMemo(() => {
    const salaryNum = Number(annualSalary.replace(/,/g, ""));
    if (isNaN(salaryNum) || salaryNum <= 0) return null;
    // calculateRank 함수 사용 및 필요한 인자 전달
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
    // [수정] rankResult.rank가 null인지 명시적으로 확인
    if (rankResult.rank === null) {
      alert("연봉 순위를 계산할 수 없습니다.");
      return;
    }

    try {
      const existingDataJSON = localStorage.getItem(
        "moneysalary-financial-data"
      );
      const existingData: StoredFinancialData = existingDataJSON
        ? JSON.parse(existingDataJSON)
        : { lastUpdated: new Date().toISOString() };

      const salaryNum = Number(annualSalary.replace(/,/g, ""));

      // StoredRankData 타입에 맞게 데이터 구성
      const rankDataToStore: StoredRankData = {
        annualSalary: salaryNum, // annualSalary 추가
        rank: rankResult.rank, // null 체크 후 할당
        condition: "all-all-all-all", // condition 추가 (예시)
        median: rankResult.median, // median 추가
        average: rankResult.average, // average 추가
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
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 hover:brightness-95 transition-all"
            >
              <Save size={16} /> 대시보드 저장
            </button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-lg border">
          <h2 className="text-2xl font-bold text-center mb-4">
            💰 연봉 순위 결과
          </h2>
          {rankResult && rankResult.rank !== null ? ( // rankResult.rank null 체크 추가
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                {/* [수정] annualSalary를 사용하도록 변경 */}
                연봉 {formatNumber(Number(annualSalary.replace(/,/g, "")))}원
              </p>
              <p className="my-2">
                <span className="text-5xl font-bold text-primary">
                  상위 <CountUp end={rankResult.rank} duration={1.5} />%
                </span>
              </p>
              {/* 전체 순위 등수 표시 (선택적) */}
              {/* <p className="font-semibold text-muted-foreground">
                (대한민국 상위 {rankResult.totalRank?.toLocaleString('ko-KR')}등 이내)
              </p> */}

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-bold text-center mb-2">
                  <Users className="inline-block w-5 h-5 mr-2" />
                  전체 근로자 기준
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-secondary p-3 rounded">
                    <p className="font-semibold">중위 연봉</p>
                    <p>{formatNumber(rankResult.median)}원</p>
                  </div>
                  <div className="bg-secondary p-3 rounded">
                    <p className="font-semibold">평균 연봉</p>
                    <p>{formatNumber(rankResult.average)}원</p>
                  </div>
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
          <BarChart2 /> 연봉 분포 차트 (전체 근로자)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartDistribution}
              margin={{ right: 20, left: -10 }}
            >
              <XAxis
                dataKey="salaryRange"
                tickFormatter={(value) => `${value / 1000}억`} // 억원 단위
                stroke="hsl(var(--muted-foreground))"
                interval={Math.floor(chartDistribution.length / 10)} // 눈금 간격 조정
              />
              <YAxis
                tickFormatter={(value) => `상위 ${value}%`}
                stroke="hsl(var(--muted-foreground))"
                domain={[0, 100]} // Y축 범위 0% ~ 100%
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--secondary))" }}
              />
              <Bar dataKey="percentage">
                {chartDistribution.map((entry, index) => {
                  const currentSalaryManwon = rankResult
                    ? Math.round(Number(annualSalary.replace(/,/g, "")) / 10000)
                    : null;
                  const isActive =
                    currentSalaryManwon !== null &&
                    currentSalaryManwon >= entry.salaryRange &&
                    (chartDistribution[index + 1] === undefined ||
                      currentSalaryManwon <
                        chartDistribution[index + 1].salaryRange);

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        isActive
                          ? "hsl(var(--primary))"
                          : "hsl(var(--secondary))"
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          * X축: 연봉(만원), Y축: 해당 연봉 이상을 받는 근로자의 비율(상위 %)
        </p>
      </div>
    </div>
  );
}
