import type { Metadata } from "next";
// [수정] 올바른 컴포넌트 경로로 수정했습니다.
import YearEndTaxCalculator from "../../components/YearEndTaxCalculator";

export const metadata: Metadata = {
  title: "연말정산 환급금 계산기 (2025년 귀속) | Moneysalary",
  description:
    "13월의 월급, 미리 계산해보세요! 총급여, 신용카드, 의료비 등 항목을 입력하고 2025년 귀속 연말정산 예상 환급금 또는 추가 납부 세액을 확인하세요.",
};

export default function YearEndTaxPage() {
  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
          💰 13월의 월급, 얼마나 될까?
        </h1>
        <p className="mt-4 text-base lg:text-lg text-gray-600 dark:text-gray-400">
          2025년 귀속 연말정산, 예상 환급금을 미리 계산하고 절세 전략을
          세워보세요.
        </p>
      </div>
      <YearEndTaxCalculator />
    </main>
  );
}
