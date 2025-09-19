import type { Metadata } from "next";
import CarLoanSimulator from "@/components/CarLoanSimulator";

export const metadata: Metadata = {
  title: "자동차 구매 계산기 | 내 연봉으로 살 수 있는 차는? | Moneysalary",
  description:
    "내 연봉에 맞는 현실적인 드림카를 찾아보세요! 연봉, 할부 기간, 금리를 입력하고 구매 가능한 자동차 가격대와 월 납입금을 시뮬레이션 할 수 있습니다.",
};

export default function CarLoanPage() {
  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
          🚗 내 월급으로 살 수 있는 자동차는?
        </h1>
        <p className="mt-4 text-base lg:text-lg text-gray-600 dark:text-gray-400">
          연봉에 맞는 현실적인 드림카를 찾고, 월 납입금을 미리 계산해보세요.
        </p>
      </div>
      <CarLoanSimulator />
    </main>
  );
}
