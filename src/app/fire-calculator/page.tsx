// src/app/fire-calculator/page.tsx

import type { Metadata } from "next";
// [수정] 올바른 컴포넌트 경로로 수정했습니다.
import FireCalculator from "../../components/FireCalculator";

export const metadata: Metadata = {
  title: "파이어족(FIRE) 계산기 | 경제적 자유 계산기 | Moneysalary",
  description:
    "나는 몇 살에 퇴사할 수 있을까? 현재 자산, 월 저축액, 목표 은퇴 나이를 입력하고 경제적 자유(Financial Independence, Retire Early) 달성 시점을 시뮬레이션 해보세요.",
};

export default function FireCalculatorPage() {
  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
          🔥 내 퇴사 D-DAY는 언제일까?
        </h1>
        <p className="mt-4 text-base lg:text-lg text-gray-600 dark:text-gray-400">
          파이어족(FIRE)을 꿈꾸는 당신을 위한 경제적 자유 달성 시뮬레이터
        </p>
      </div>
      <FireCalculator />
    </main>
  );
}
