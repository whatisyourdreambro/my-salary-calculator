import { Suspense } from "react";
import CalculatorTabs from "@/components/CalculatorTabs";
import KakaoAdFit from "@/components/KakaoAdFit"; // 광고 컴포넌트 불러오기

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

      {/* [신규] 카카오 애드핏 광고 컴포넌트 삽입 */}
      <div className="mt-8 flex justify-center">
        <KakaoAdFit unit="DAN-4eRqZLQIGjrNcXj6" width="300" height="250" />
      </div>
    </main>
  );
}
