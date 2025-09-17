import type { Metadata } from "next";
import HomeLoanSimulator from "@/components/HomeLoanSimulator";

export const metadata: Metadata = {
  title: "주택담보대출 계산기 (DSR 포함) | Moneysalary",
  description:
    "2025년 최신 DSR 규제 적용! 주택 가격, 대출 금리, 기간을 입력하고 월 상환액과 총 이자, 내 연봉으로 감당 가능한 대출 한도를 확인하세요.",
};

export default function HomeLoanPage() {
  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
          🏡 내 집 마련 시뮬레이터
        </h1>
        <p className="mt-4 text-base lg:text-lg text-gray-600 dark:text-gray-400">
          주택담보대출, 얼마나 받을 수 있을까? 월 상환액과 DSR을 미리 계산하고
          똑똑하게 계획하세요.
        </p>
      </div>
      <HomeLoanSimulator />
    </main>
  );
}
