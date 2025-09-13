import { Suspense } from "react";
import CalculatorTabs from "@/components/CalculatorTabs";

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

      {/* 이전 단계에서 추가했던 개별 광고 코드는 삭제합니다.
        광고는 이제 layout.tsx에서 모든 페이지에 공통으로 적용됩니다.
      */}
    </main>
  );
}
