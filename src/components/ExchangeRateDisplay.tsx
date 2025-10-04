"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InfoItem {
  id: string;
  flag: string;
  name: string;
  unit: string;
  value: number;
  change: number;
}

// 초기 데이터 (API 호출 실패 시 표시될 기본값)
const initialData: InfoItem[] = [
  {
    id: "USD",
    flag: "🇺🇸",
    name: "미국 달러",
    unit: "원",
    value: 1380.5,
    change: 0.15,
  },
  {
    id: "JPY",
    flag: "🇯🇵",
    name: "일본 엔",
    unit: "원 (100엔)",
    value: 880.1,
    change: -0.25,
  },
  {
    id: "EUR",
    flag: "🇪🇺",
    name: "유로",
    unit: "원",
    value: 1490.8,
    change: 0.05,
  },
  {
    id: "CNY",
    flag: "🇨🇳",
    name: "중국 위안",
    unit: "원",
    value: 189.7,
    change: -0.1,
  },
  {
    id: "GBP",
    flag: "🇬🇧",
    name: "영국 파운드",
    unit: "원",
    value: 1755.2,
    change: 0.3,
  },
];

export default function ExchangeRateDisplay() {
  const [marketData, setMarketData] = useState<InfoItem[]>(initialData);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/KRW");
        if (!response.ok) throw new Error("API response was not ok.");
        const data = await response.json();

        const updatedData = initialData.map((item) => {
          const rate = 1 / data.rates[item.id];
          let displayRate = rate;
          if (item.id === "JPY") {
            displayRate = rate * 100;
          }
          const change = ((displayRate - item.value) / item.value) * 100;

          return { ...item, value: displayRate, change };
        });

        setMarketData(updatedData);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 600000); // 10분에 한 번 업데이트

    return () => clearInterval(interval);
  }, []);

  const ChangeIndicator = ({ change }: { change: number }) => {
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

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 animate-fade-in-up"
      style={{ animationDelay: "0.6s" }}
    >
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800/50 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">주요 통화 환율</h2>
          <span className="text-xs text-gray-500">업데이트: {lastUpdated}</span>
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
                {item.value.toFixed(2)}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{item.unit}</p>
                <ChangeIndicator change={item.change} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
