// src/app/page.tsx

import { Suspense } from "react";
import dynamic from "next/dynamic";
import CalculatorTabs from "@/components/CalculatorTabs";

// [수정] SalaryRank를 dynamic import로 변경
const SalaryRank = dynamic(() => import("@/components/SalaryRank"), {
  loading: () => (
    <div className="w-full h-96 flex justify-center items-center">
      순위 비교 차트 로딩 중...
    </div>
  ),
  ssr: false, // 서버에서는 렌더링하지 않음
});

export default function HomePage() {
  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
          연봉 / 퇴직금 / 미래연봉 계산기
        </h1>
        <p className="mt-4 text-base lg:text-lg text-gray-600 dark:text-gray-400">
          가장 쉽고 빠르게 급여와 퇴직금을 확인하세요.
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <CalculatorTabs />
      </Suspense>

      <SalaryRank />
    </main>
  );
}
