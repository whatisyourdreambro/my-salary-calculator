// src/app/mbti-salary/page.tsx
import type { Metadata } from "next";
// 경로에서 '/components'를 제거하여 수정했습니다.
import SalaryMBTICalculator from "@/components/SalaryMBTICalculator";

export const metadata: Metadata = {
  title: "재미로 보는 나의 인생 연봉 그래프 테스트 | Moneysalary",
  description:
    "나는 어떤 부자 유형일까? 간단한 테스트를 통해 나의 재물운과 미래 연봉 그래프를 확인해보세요! 유튜버 대박형, 대기만성 CEO형, 파이어족 조기은퇴형 등 재미있는 결과가 기다리고 있습니다.",
  openGraph: {
    title: "재미로 보는 나의 인생 연봉 그래프 테스트",
    description: "나는 어떤 부자 유형일까? 지금 바로 확인해보세요!",
    images: ["/api/og?title=재미로 보는 나의 인생 연봉 그래프"],
  },
};

export default function MbtiSalaryPage() {
  return (
    <main className="w-full bg-light-bg dark:bg-dark-bg">
      <div className="w-full bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-gray-900 dark:to-violet-800 text-white text-center py-20 sm:py-28 px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          나는 어떤 부자 유형일까?
          <br />
          <span className="text-violet-300">인생 연봉 그래프 테스트</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
          몇 가지 질문에 답하고, 당신의 숨겨진 재물운과 미래 연봉 그래프를
          확인해보세요!
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
        <SalaryMBTICalculator />
      </div>
    </main>
  );
}
