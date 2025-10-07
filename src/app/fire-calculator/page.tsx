// src/app/fire-calculator/page.tsx

import type { Metadata } from "next";
import FireCalculator from "@/components/FireCalculator";

export const metadata: Metadata = {
  title: "FIRE 시뮬레이터: 당신의 경제적 자유 여정 | Moneysalary",
  description:
    "단순 계산을 넘어, 당신의 은퇴 여정을 한 편의 영화처럼 시뮬레이션하세요. 투자 성향, 소득 상승, 생애 이벤트까지 모두 반영하여 가장 현실적인 FIRE 달성 시점을 예측합니다.",
};

export default function FireCalculatorPage() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)] bg-light-bg dark:bg-gray-900 text-light-text dark:text-white overflow-hidden relative flex items-center justify-center py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-40">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gray-500 rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-light-bg dark:from-gray-900 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-violet-500/10 via-transparent to-transparent animate-spin-slow" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <FireCalculator />
      </div>
    </main>
  );
}
