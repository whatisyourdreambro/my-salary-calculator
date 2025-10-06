// src/components/ExchangeRateDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

interface InfoItem {
  id: string;
  flag: string;
  name: string;
  unit: string;
  value: number;
  change: number;
}

const initialData: InfoItem[] = [
  { id: "USD", flag: "🇺🇸", name: "미국 달러", unit: "원", value: 0, change: 0 },
  {
    id: "JPY",
    flag: "🇯🇵",
    name: "일본 엔",
    unit: "원 (100엔)",
    value: 0,
    change: 0,
  },
  { id: "EUR", flag: "🇪🇺", name: "유로", unit: "원", value: 0, change: 0 },
  { id: "CNY", flag: "🇨🇳", name: "중국 위안", unit: "원", value: 0, change: 0 },
  {
    id: "GBP",
    flag: "🇬🇧",
    name: "영국 파운드",
    unit: "원",
    value: 0,
    change: 0,
  },
];

export default function ExchangeRateDisplay() {
  const [marketData, setMarketData] = useState<InfoItem[]>(initialData);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // 에러 상태 추가

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      setError(null); // API 요청 시작 시 에러 초기화
      try {
        // API 엔드포인트 변경 (frankfurter.app 사용)
        const response = await fetch(
          `https://api.frankfurter.app/latest?from=KRW`
        );
        if (!response.ok)
          throw new Error("최신 환율 정보를 가져오지 못했습니다.");
        const data = await response.json();

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        // 과거 날짜 API 엔드포인트 변경
        const prevResponse = await fetch(
          `https://api.frankfurter.app/${yesterdayStr}?from=KRW`
        );
        if (!prevResponse.ok)
          throw new Error("어제 환율 정보를 가져오지 못했습니다.");
        const prevData = await prevResponse.json();

        const updatedData = initialData.map((item) => {
          if (!data.rates[item.id] || !prevData.rates[item.id]) {
            return item; // 해당 통화 정보가 없으면 기존 데이터 유지
          }

          const todayRate = 1 / data.rates[item.id];
          const yesterdayRate = 1 / prevData.rates[item.id];

          let displayRate = todayRate;
          let change = 0;

          if (item.id === "JPY") {
            displayRate *= 100;
            const yesterdayDisplayRate = yesterdayRate * 100;
            change =
              ((displayRate - yesterdayDisplayRate) / yesterdayDisplayRate) *
              100;
          } else {
            change = ((todayRate - yesterdayRate) / yesterdayRate) * 100;
          }

          return { ...item, value: displayRate, change };
        });

        setMarketData(updatedData);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        if (err instanceof Error) {
          console.error("환율 정보 로딩 실패:", err.message);
          setError(
            "환율 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000); // 1시간마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const ChangeIndicator = ({ change }: { change: number }) => {
    if (isNaN(change)) return null;
    const isUp = change > 0;
    const isDown = change < 0;
    const colorClass = isUp
      ? "text-red-500"
      : isDown
      ? "text-blue-500"
      : "text-gray-500";
    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

    return (
      <span className={`flex items-center text-sm font-semibold ${colorClass}`}>
        <Icon size={16} className="mr-1" />
        {change.toFixed(2)}%
      </span>
    );
  };

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div>
            <h3 className="font-bold">환율 정보 로딩 실패</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 animate-fade-in-up"
      style={{ animationDelay: "0.6s" }}
    >
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800/50 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">주요 통화 환율</h2>
          <span className="text-xs text-gray-500">
            {isLoading ? "업데이트 중..." : `업데이트: ${lastUpdated}`}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {marketData.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{item.flag}</span>
                <p className="font-bold text-light-text dark:text-dark-text">
                  {item.name}
                </p>
              </div>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                {isLoading ? "..." : item.value.toFixed(2)}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{item.unit}</p>
                {!isLoading && <ChangeIndicator change={item.change} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
