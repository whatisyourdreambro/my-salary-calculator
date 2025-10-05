"use client";

import { useState, useEffect } from "react";

// 표시할 통화의 기본 구조 정의
interface InfoItem {
  id: string;
  flag: string;
  name: string;
  unit: string;
  value: number | null; // API 호출 전/실패 시 null일 수 있음
}

// 화면에 표시될 통화 목록
const currencyList: InfoItem[] = [
  { id: "USD", flag: "🇺🇸", name: "미국 달러", unit: "원", value: null },
  { id: "JPY", flag: "🇯🇵", name: "일본 엔", unit: "원 (100엔)", value: null },
  { id: "EUR", flag: "🇪🇺", name: "유로", unit: "원", value: null },
  { id: "CNY", flag: "🇨🇳", name: "중국 위안", unit: "원", value: null },
  { id: "GBP", flag: "🇬🇧", name: "영국 파운드", unit: "원", value: null },
];

export default function ExchangeRateDisplay() {
  const [marketData, setMarketData] = useState<InfoItem[]>(currencyList);
  const [lastUpdated, setLastUpdated] = useState<string>("-");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        // ExchangeRate-API의 무료 'latest' 엔드포인트 호출
        const response = await fetch("https://open.er-api.com/v6/latest/KRW");
        if (!response.ok) {
          throw new Error("API 응답에 문제가 있습니다.");
        }
        const data = await response.json();

        // API 응답을 바탕으로 각 통화의 환율 계산
        const updatedData = currencyList.map((item) => {
          const rate = 1 / data.rates[item.id];
          let displayRate = rate;
          // 일본 엔은 100엔 단위로 표시
          if (item.id === "JPY") {
            displayRate = rate * 100;
          }
          return { ...item, value: displayRate };
        });

        setMarketData(updatedData);
        setLastUpdated(
          new Date(data.time_last_update_unix * 1000).toLocaleString()
        );
      } catch (error) {
        console.error("환율 정보 업데이트에 실패했습니다:", error);
        // API 호출 실패 시, 값 없는 초기 상태 유지
        setMarketData(currencyList);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    // 무료 API는 하루 한 번 업데이트되므로, 1시간에 한 번만 호출하여 불필요한 트래픽 방지
    const interval = setInterval(fetchRates, 3600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 animate-fade-in-up"
      style={{ animationDelay: "0.6s" }}
    >
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800/50 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">오늘의 주요 환율</h2>
          <span className="text-xs text-gray-500">기준: {lastUpdated}</span>
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
                    {item.value ? item.value.toFixed(2) : "-"}
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
