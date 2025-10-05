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

// API 호출 실패 또는 로딩 시 표시될 기본 데이터
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
  const [lastUpdated, setLastUpdated] = useState<string>("-");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const todayResponse = await fetch(
          "https://open.er-api.com/v6/latest/KRW"
        );
        if (!todayResponse.ok)
          throw new Error("오늘 환율 정보를 가져오지 못했습니다.");
        const todayData = await todayResponse.json();

        const updatedData = initialData.map((item) => {
          const currentRate = 1 / todayData.rates[item.id];
          let displayRate = currentRate;
          if (item.id === "JPY") {
            displayRate = currentRate * 100;
          }

          // 임시 기준값(initialData의 value) 대비 변동률 계산
          // 실제 서비스에서는 전일 종가 데이터를 별도로 관리해야 정확한 일일 변동률 표시 가능
          const baseValue = 1380; // 예시 기준값
          const change =
            item.value !== 0
              ? ((displayRate - item.value) / item.value) * 100
              : ((displayRate - baseValue) / baseValue) * 100;

          return { ...item, value: displayRate, change };
        });

        setMarketData(updatedData);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("환율 정보 업데이트 실패:", error);
        setMarketData(initialData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000); // 1시간에 한 번 업데이트

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
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            환율 정보를 불러오는 중...
          </div>
        ) : (
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
                  {item.value > 0 ? item.value.toFixed(2) : "-"}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">{item.unit}</p>
                  <ChangeIndicator change={item.change} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
