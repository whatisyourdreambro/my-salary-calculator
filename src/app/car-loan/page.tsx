import type { Metadata } from "next";
import CarLoanSimulator from "@/components/CarLoanSimulator";

export const metadata: Metadata = {
  title: "자동차 구매 계산기 | 내 연봉으로 살 수 있는 드림카는? | Moneysalary",
  description:
    "내 연봉에 맞는 현실적인 드림카를 찾아보세요! 200종 이상의 국산차, 수입차 데이터베이스를 기반으로 구매 가능한 자동차와 월 납입금을 시뮬레이션 할 수 있습니다.",
};

export default function CarLoanPage() {
  return (
    <main className="w-full bg-light-bg dark:bg-dark-bg">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-gray-800 to-slate-900 text-white text-center py-20 sm:py-28 px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          내 연봉으로 살 수 있는
          <br /> <span className="text-cyan-400">나만의 드림카 찾기</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
          단순한 이동수단을 넘어, 당신의 가치를 증명하는 자동차. 현실적인 예산
          안에서 최고의 만족감을 선사할 당신의 다음 차를 찾아보세요.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
        <CarLoanSimulator />
      </div>
    </main>
  );
}
