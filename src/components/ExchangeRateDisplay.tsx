"use client";

import { useState, useEffect } from "react";

interface InfoItem {
  id: string;
  flag: string;
  name: string;
  unit: string;
  value: number;
}

// 초기 데이터 구조만 정의 (값은 API를 통해 채워짐)
const initialData: InfoItem[] = [
  { id: "USD", flag: "🇺🇸", name: "미국 달러", unit: "원", value: 0 },
  { id: "JPY", flag: "🇯🇵", name: "일본 엔", unit: "원 (100엔)", value: 0 },
  { id: "EUR", flag: "🇪🇺", name: "유로", unit: "원", value: 0 },
  { id: "CNY", flag: "🇨🇳", name: "중국 위안", unit: "원", value: 0 },
  { id: "GBP", flag: "🇬🇧", name: "영국 파운드", unit: "원", value: 0 },
];

export default function ExchangeRateDisplay() {
  const [marketData, setMarketData] = useState<InfoItem[]>(initialData);
  const [lastUpdated, setLastUpdated] = useState<string>("-");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
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
          return { ...item, value: displayRate };
        });

        setMarketData(updatedData);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("환율 정보 업데이트 실패:", error);
        setMarketData(initialData); // 실패 시 값을 0으로 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000); // 1시간에 한 번 업데이트

    return () => clearInterval(interval);
  }, []);

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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.flag}</span>
                  <p className="font-bold text-light-text dark:text-dark-text">
                    {item.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                    {item.value > 0 ? item.value.toFixed(2) : "-"}
                  </p>
                  <p className="text-xs text-gray-500">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
