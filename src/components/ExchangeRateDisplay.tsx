"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  change: number;
}

const initialRates: ExchangeRate[] = [
  { code: "USD", name: "미국 달러", rate: 1380.5, change: 1.2 },
  { code: "JPY", name: "일본 엔 (100)", rate: 880.1, change: -0.5 },
  { code: "EUR", name: "유로", rate: 1490.8, change: 0.8 },
];

export default function ExchangeRateDisplay() {
  const [rates, setRates] = useState<ExchangeRate[]>(initialRates);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // 무료 환율 API 예시 (실제 서비스 시 API 키 발급 필요)
        const response = await fetch("https://open.er-api.com/v6/latest/KRW");
        if (!response.ok) {
          throw new Error("환율 정보를 불러오는 데 실패했습니다.");
        }
        const data = await response.json();

        // USD, JPY, EUR 환율 정보 업데이트 (API 응답 구조에 맞게 수정)
        const newRates = [
          {
            code: "USD",
            name: "미국 달러",
            rate: 1 / data.rates.USD,
            change:
              ((1 / data.rates.USD - initialRates[0].rate) /
                initialRates[0].rate) *
              100,
          },
          {
            code: "JPY",
            name: "일본 엔 (100)",
            rate: (1 / data.rates.JPY) * 100,
            change:
              (((1 / data.rates.JPY) * 100 - initialRates[1].rate) /
                initialRates[1].rate) *
              100,
          },
          {
            code: "EUR",
            name: "유로",
            rate: 1 / data.rates.EUR,
            change:
              ((1 / data.rates.EUR - initialRates[2].rate) /
                initialRates[2].rate) *
              100,
          },
        ];

        setRates(newRates);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error(error);
        // API 호출 실패 시 초기값 유지
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 600000); // 10분에 한 번 업데이트

    return () => clearInterval(interval);
  }, []);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} className="text-red-500" />;
    if (change < 0) return <TrendingDown size={16} className="text-blue-500" />;
    return <Minus size={16} className="text-gray-500" />;
  };

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 animate-fade-in-up"
      style={{ animationDelay: "0.6s" }}
    >
      <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl border border-gray-200 dark:border-gray-800/50 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="font-bold text-sm sm:text-base flex items-center justify-center">
            주요 환율
            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
              ({lastUpdated} 기준)
            </span>
          </div>
          {rates.map((rate) => (
            <div key={rate.code} className="p-2">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {rate.name}
              </p>
              <p className="text-lg font-bold flex items-center justify-center gap-2">
                {rate.rate.toFixed(2)}
                <span className="flex items-center text-xs">
                  {getChangeIcon(rate.change)}
                  <span
                    className={`${
                      rate.change > 0
                        ? "text-red-500"
                        : rate.change < 0
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  >
                    {Math.abs(rate.change).toFixed(2)}%
                  </span>
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
