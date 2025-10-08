// src/components/ExchangeRateImpactCalculator.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CountUp from "react-countup";
import {
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Loader,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import CustomBarLabel from "./CustomBarLabel";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const currencies = [
  { id: "KRW", name: "대한민국 원", flag: "🇰🇷", symbol: "원" },
  { id: "USD", name: "미국 달러", flag: "🇺🇸", symbol: "$" },
  { id: "JPY", name: "일본 엔", flag: "🇯🇵", symbol: "¥" },
  { id: "EUR", name: "유로", flag: "🇪🇺", symbol: "€" },
  { id: "CNY", name: "중국 위안", flag: "🇨🇳", symbol: "¥" },
  { id: "GBP", name: "영국 파운드", flag: "🇬🇧", symbol: "£" },
];

export default function ExchangeRateImpactCalculator() {
  const [assetAmount, setAssetAmount] = useState("10000000");
  const [assetCurrency, setAssetCurrency] = useState("KRW");
  const [comparisonCurrency, setComparisonCurrency] = useState("USD");
  const [pastDate, setPastDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return toInputDateString(date);
  });

  const [manualPastRateStr, setManualPastRateStr] = useState("");
  const [manualCurrentRateStr, setManualCurrentRateStr] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);

  const fetchRates = useCallback(async () => {
    if (isManual) return;
    if (assetCurrency === comparisonCurrency) {
      setManualPastRateStr("1.0000");
      setManualCurrentRateStr("1.0000");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [pastRes, currentRes] = await Promise.all([
        fetch(
          `https://api.frankfurter.app/${pastDate}?from=${assetCurrency}&to=${comparisonCurrency}`
        ),
        fetch(
          `https://api.frankfurter.app/latest?from=${assetCurrency}&to=${comparisonCurrency}`
        ),
      ]);

      if (!pastRes.ok || !currentRes.ok)
        throw new Error("환율 정보를 불러오는 데 실패했습니다.");

      const pastData = await pastRes.json();
      const currentData = await currentRes.json();

      setManualPastRateStr(
        pastData.rates[comparisonCurrency]?.toFixed(4) || "0"
      );
      setManualCurrentRateStr(
        currentData.rates[comparisonCurrency]?.toFixed(4) || "0"
      );
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [pastDate, assetCurrency, comparisonCurrency, isManual]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const analysis = useMemo(() => {
    const amount = parseNumber(assetAmount);
    const pRate = parseFloat(manualPastRateStr) || 0;
    const cRate = parseFloat(manualCurrentRateStr) || 0;

    if (!amount || !pRate || !cRate)
      return {
        changeAmount: 0,
        changePercentage: 0,
        pastValue: 0,
        currentValue: 0,
      };

    const pastValueInComparison = amount * pRate;
    const currentValueInComparison = amount * cRate;

    const changeAmount = currentValueInComparison - pastValueInComparison;
    const changePercentage =
      pastValueInComparison > 0
        ? (changeAmount / pastValueInComparison) * 100
        : 0;

    return {
      changeAmount: Math.round(changeAmount),
      changePercentage: parseFloat(changePercentage.toFixed(2)),
      pastValue: Math.round(pastValueInComparison),
      currentValue: Math.round(currentValueInComparison),
    };
  }, [assetAmount, manualPastRateStr, manualCurrentRateStr]);

  const assetSymbol =
    currencies.find((c) => c.id === assetCurrency)?.symbol || "원";
  const comparisonSymbol =
    currencies.find((c) => c.id === comparisonCurrency)?.symbol || "$";

  const chartData = [
    { name: "과거 가치", value: analysis.pastValue },
    { name: "현재 가치", value: analysis.currentValue },
  ];

  const currentValueColor = analysis.changeAmount >= 0 ? "#0052ff" : "#e11d48";

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border mt-8 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center mb-8">
        환율 변동에 따른 내 자산가치 변화
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* === 입력부 === */}
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              분석할 자산
            </label>
            <div className="flex gap-2 mt-1">
              <select
                value={assetCurrency}
                onChange={(e) => setAssetCurrency(e.target.value)}
                className="p-3 border rounded-lg dark:bg-dark-card dark:border-gray-700"
              >
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.id}
                  </option>
                ))}
              </select>
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={formatNumber(parseNumber(assetAmount))}
                  onChange={(e) =>
                    setAssetAmount(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="w-full text-lg p-3 pr-8 border rounded-lg dark:bg-dark-card dark:border-gray-700 font-semibold"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                  {assetSymbol}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              비교 통화
            </label>
            <select
              value={comparisonCurrency}
              onChange={(e) => setComparisonCurrency(e.target.value)}
              className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
            >
              {currencies
                .filter((c) => c.id !== assetCurrency)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name} ({c.id})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                기준 과거 시점
              </label>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsManual(!isManual)}
              >
                <span className="text-xs font-semibold">수동입력</span>
                <input
                  type="checkbox"
                  checked={isManual}
                  onChange={(e) => setIsManual(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                />
              </div>
            </div>
            <input
              type="date"
              value={pastDate}
              onChange={(e) => setPastDate(e.target.value)}
              disabled={isManual}
              className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              환율 (1 {assetCurrency} 당 {comparisonCurrency})
            </label>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-gray-500">
              <div>과거 환율</div>
              <div>현재(미래) 환율</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualPastRateStr}
                onChange={(e) => setManualPastRateStr(e.target.value)}
                disabled={!isManual}
                className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 disabled:opacity-50 text-center font-mono"
              />
              <span className="font-bold text-primary">→</span>
              <input
                type="text"
                value={manualCurrentRateStr}
                onChange={(e) => setManualCurrentRateStr(e.target.value)}
                disabled={!isManual}
                className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 disabled:opacity-50 text-center font-mono"
              />
              <button
                onClick={fetchRates}
                disabled={isManual}
                className="p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                aria-label="최신 환율 불러오기"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* === 결과부 === */}
        <div className="flex flex-col justify-between">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader
                  className="animate-spin mx-auto text-primary"
                  size={48}
                />
                <p className="mt-4 font-semibold">
                  최신 환율 정보를 불러오는 중...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
              <div>
                <h3 className="font-bold">로딩 실패</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up h-full flex flex-col">
              <div
                className={`p-6 rounded-xl text-center transition-colors duration-300 grow flex flex-col justify-center ${
                  analysis.changeAmount >= 0
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "bg-red-50 dark:bg-red-900/30"
                }`}
              >
                <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  {pastDate} 대비,{" "}
                  <strong>
                    {assetSymbol}
                    {formatNumber(parseNumber(assetAmount))}
                  </strong>
                  의 가치는
                </p>
                <div
                  className={`flex items-center justify-center gap-2 text-4xl lg:text-5xl font-bold my-2 ${
                    analysis.changeAmount >= 0 ? "text-primary" : "text-danger"
                  }`}
                >
                  {analysis.changeAmount >= 0 ? (
                    <TrendingUp className="w-10 h-10" />
                  ) : (
                    <TrendingDown className="w-10 h-10" />
                  )}
                  <CountUp
                    end={Math.abs(analysis.changeAmount)}
                    prefix={
                      analysis.changeAmount >= 0
                        ? `+ ${comparisonSymbol}`
                        : `- ${comparisonSymbol}`
                    }
                    separator=","
                  />
                </div>
                <p
                  className={`font-semibold text-lg ${
                    analysis.changeAmount >= 0 ? "text-primary" : "text-danger"
                  }`}
                >
                  ({analysis.changePercentage}%)
                </p>
              </div>
              <div className="h-48 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 10, right: 120 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={70}
                      stroke="currentColor"
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        `${comparisonSymbol}${formatNumber(value)}`
                      }
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Bar dataKey="value" barSize={30} radius={[0, 8, 8, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#a0aec0" : currentValueColor}
                        />
                      ))}
                      <LabelList dataKey="value" content={<CustomBarLabel />} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="font-bold flex items-center gap-2">
          <HelpCircle size={18} /> 알아두면 좋은 지식: 달러 인덱스(DXY)
        </h4>
        <p className="text-sm mt-2 text-light-text-secondary dark:text-dark-text-secondary">
          달러 인덱스는 유로, 엔, 파운드 등 6개 주요 통화 대비 달러의 평균적인
          가치를 나타내는 지표입니다. 100을 기준으로 이보다 높으면 달러 강세,
          낮으면 약세를 의미합니다. 개별 환율과 함께 보면 글로벌 자금의 흐름을
          파악하는 데 큰 도움이 됩니다.
        </p>
      </div>
    </div>
  );
}
