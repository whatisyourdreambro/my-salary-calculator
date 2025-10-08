// src/components/ExchangeRateImpactCalculator.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, HelpCircle, Loader } from "lucide-react";
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
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ExchangeRateImpactCalculator() {
  const [initialKRW, setInitialKRW] = useState("10,000,000");
  const [pastDate, setPastDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return toInputDateString(date);
  });

  const [pastRate, setPastRate] = useState(0);
  const [currentRate, setCurrentRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pastRes, currentRes] = await Promise.all([
        fetch(`https://api.frankfurter.app/${pastDate}?from=USD&to=KRW`),
        fetch(`https://api.frankfurter.app/latest?from=USD&to=KRW`),
      ]);

      if (!pastRes.ok || !currentRes.ok) {
        throw new Error("환율 정보를 불러오는 데 실패했습니다.");
      }

      const pastData = await pastRes.json();
      const currentData = await currentRes.json();

      setPastRate(pastData.rates.KRW);
      setCurrentRate(currentData.rates.KRW);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [pastDate]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const analysis = useMemo(() => {
    const krw = parseNumber(initialKRW);
    if (!krw || !pastRate || !currentRate)
      return {
        initialUSD: 0,
        currentEquivalentKRW: 0,
        changeAmount: 0,
        changePercentage: 0,
      };

    const initialUSD = krw / pastRate;
    const currentEquivalentKRW = initialUSD * currentRate;
    const changeAmount = currentEquivalentKRW - krw;
    const changePercentage = (changeAmount / krw) * 100;

    return {
      initialUSD,
      currentEquivalentKRW: Math.round(currentEquivalentKRW),
      changeAmount: Math.round(changeAmount),
      changePercentage: parseFloat(changePercentage.toFixed(2)),
    };
  }, [initialKRW, pastRate, currentRate]);

  const chartData = [
    { name: "과거 가치", value: parseNumber(initialKRW) },
    { name: "현재 가치", value: analysis.currentEquivalentKRW },
  ];

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        환율 변동에 따른 내 자산가치 변화
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <CurrencyInput
            label="분석할 원화 자산"
            value={initialKRW}
            onValueChange={setInitialKRW}
            quickAmounts={[10000000, 1000000, 100000]}
          />
          <div>
            <label className="text-sm font-medium">기준 과거 시점</label>
            <input
              type="date"
              value={pastDate}
              onChange={(e) => setPastDate(e.target.value)}
              className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm font-medium">과거 환율</label>
              <p className="font-bold text-lg">{pastRate.toFixed(2)} 원/달러</p>
            </div>
            <div className="w-1/2">
              <label className="text-sm font-medium">현재 환율</label>
              <p className="font-bold text-lg">
                {currentRate.toFixed(2)} 원/달러
              </p>
            </div>
          </div>
        </div>

        {/* Result Section */}
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-6 rounded-lg text-center transition-colors duration-300 ${
                analysis.changeAmount >= 0
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "bg-red-50 dark:bg-red-900/30"
              }`}
            >
              <p
                className={`text-lg font-bold ${
                  analysis.changeAmount >= 0
                    ? "text-blue-600 dark:text-blue-300"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {analysis.changeAmount >= 0
                  ? "달러 기준 구매력 상승!"
                  : "달러 기준 구매력 하락..."}
              </p>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold my-1">
                {analysis.changeAmount >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
                <span>
                  <CountUp end={analysis.changeAmount} separator="," /> 원 (
                  {analysis.changePercentage}%)
                </span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    formatter={(value: number) => `${formatNumber(value)}원`}
                  />
                  <Bar dataKey="value" barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#a0aec0" : "#0052ff"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="font-bold flex items-center gap-2">
          <HelpCircle size={18} /> 알아두면 좋은 지식: 달러 인덱스(DXY)
        </h4>
        <p className="text-sm mt-2 text-light-text-secondary dark:text-dark-text-secondary">
          달러 인덱스는 유로, 엔, 파운드 등 6개 주요 통화 대비 달러의 평균적인
          가치를 나타내는 지표입니다. 보통 100을 기준으로, 이보다 높으면 달러가
          강세, 낮으면 약세임을 의미합니다. 원/달러 환율뿐만 아니라 달러
          인덱스를 함께 보면 글로벌 시장 전체에서 달러의 위치를 파악하는 데 큰
          도움이 됩니다.
        </p>
      </div>
    </div>
  );
}
