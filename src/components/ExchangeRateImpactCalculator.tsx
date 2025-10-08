// src/components/ExchangeRateImpactCalculator.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CurrencyInput from "./CurrencyInput";
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

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const currencies = [
  { id: "USD", name: "미국 달러", flag: "🇺🇸", symbol: "$" },
  { id: "JPY", name: "일본 엔", flag: "🇯🇵", symbol: "¥" },
  { id: "EUR", name: "유로", flag: "🇪🇺", symbol: "€" },
  { id: "CNY", name: "중국 위안", flag: "🇨🇳", symbol: "¥" },
];

// 'any' 타입 대신 정확한 타입을 지정해줍니다.
interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}

// Bar 차트의 라벨을 직접 그리는 커스텀 컴포넌트
const CustomBarLabel = (props: CustomLabelProps) => {
  const { x = 0, y = 0, width = 0, value = 0 } = props;
  if (width < 30) return null; // 바가 너무 작으면 라벨을 숨깁니다.

  const labelX = x + width + 10; // 바의 오른쪽에 위치
  const labelY = y + 20; // 바의 세로 중앙에 위치

  return (
    <text
      x={labelX}
      y={labelY}
      dominantBaseline="middle"
      textAnchor="start"
      className="fill-light-text dark:fill-dark-text font-bold"
    >
      {formatNumber(value)}
    </text>
  );
};

export default function ExchangeRateImpactCalculator() {
  const [initialKRW, setInitialKRW] = useState("10,000,000");
  const [pastDate, setPastDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return toInputDateString(date);
  });
  const [currency, setCurrency] = useState("USD");

  const [pastRate, setPastRate] = useState(0);
  const [currentRate, setCurrentRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pastRes, currentRes] = await Promise.all([
        fetch(
          `https://api.frankfurter.app/${pastDate}?from=${currency}&to=KRW`
        ),
        fetch(`https://api.frankfurter.app/latest?from=${currency}&to=KRW`),
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
  }, [pastDate, currency]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const analysis = useMemo(() => {
    const krw = parseNumber(initialKRW);
    if (!krw || !pastRate || !currentRate)
      return {
        initialForeign: 0,
        currentEquivalentKRW: 0,
        changeAmount: 0,
        changePercentage: 0,
      };

    const rateMultiplier = currency === "JPY" ? 100 : 1;
    const initialForeign = krw / (pastRate / rateMultiplier);
    const currentEquivalentKRW =
      initialForeign * (currentRate / rateMultiplier);
    const changeAmount = currentEquivalentKRW - krw;
    const changePercentage = krw > 0 ? (changeAmount / krw) * 100 : 0;

    return {
      initialForeign,
      currentEquivalentKRW: Math.round(currentEquivalentKRW),
      changeAmount: Math.round(changeAmount),
      changePercentage: parseFloat(changePercentage.toFixed(2)),
    };
  }, [initialKRW, pastRate, currentRate, currency]);

  const selectedCurrencyInfo =
    currencies.find((c) => c.id === currency) || currencies[0];
  const chartData = [
    { name: "과거 가치", value: parseNumber(initialKRW) },
    { name: "현재 가치", value: analysis.currentEquivalentKRW },
  ];

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border mt-8 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center mb-6">
        환율 변동에 따른 내 자산가치 변화
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
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
          <div>
            <label className="text-sm font-medium">비교 통화</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
            >
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">환율 직접 비교</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pastRate.toFixed(2)}
                onChange={(e) => setPastRate(Number(e.target.value))}
                className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700"
                aria-label="과거 환율"
              />
              <span>→</span>
              <input
                type="number"
                value={currentRate.toFixed(2)}
                onChange={(e) => setCurrentRate(Number(e.target.value))}
                className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700"
                aria-label="현재 환율"
              />
              <button
                onClick={fetchRates}
                className="p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="최신 환율 불러오기"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="lg:col-span-3">
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
            <div className="space-y-4 animate-fade-in-up">
              <div
                className={`p-6 rounded-xl text-center transition-colors duration-300 ${
                  analysis.changeAmount >= 0
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "bg-red-50 dark:bg-red-900/30"
                }`}
              >
                <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  {pastDate} 대비,{" "}
                  <strong>{formatNumber(parseNumber(initialKRW))}원</strong>의
                  가치는
                </p>
                <div
                  className={`flex items-center justify-center gap-2 text-3xl font-bold my-1 ${
                    analysis.changeAmount >= 0 ? "text-primary" : "text-danger"
                  }`}
                >
                  {analysis.changeAmount >= 0 ? (
                    <TrendingUp className="w-8 h-8" />
                  ) : (
                    <TrendingDown className="w-8 h-8" />
                  )}
                  <CountUp
                    end={analysis.changeAmount}
                    prefix={analysis.changeAmount >= 0 ? "+ " : ""}
                    separator=","
                  />
                  원 ({analysis.changePercentage}%)
                </div>
                <p className="text-sm">
                  (과거{" "}
                  <strong>
                    {selectedCurrencyInfo.symbol}
                    {formatNumber(Math.round(analysis.initialForeign))}
                  </strong>
                  의 현재 원화 가치 기준)
                </p>
              </div>
              <div className="h-48 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 10, right: 100 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value: string | number) =>
                        `${formatNumber(Number(value))}원`
                      }
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Bar dataKey="value" barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#a0aec0" : "#0052ff"}
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
          가치를 나타내는 지표입니다. 보통 100을 기준으로, 이보다 높으면 달러가
          강세, 낮으면 약세임을 의미합니다. 원/달러 환율뿐만 아니라 달러
          인덱스를 함께 보면 글로벌 시장 전체에서 달러의 위치를 파악하는 데 큰
          도움이 됩니다.
        </p>
      </div>
    </div>
  );
}
