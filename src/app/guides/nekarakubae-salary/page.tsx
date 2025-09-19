import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "네카라쿠배 신입 개발자 초봉 실수령액 완벽 분석 (2025년)",
  description:
    "꿈의 직장 '네카라쿠배' 신입 개발자 실제 초봉은? 계약 연봉, 사이닝 보너스, 스톡옵션을 모두 포함한 2025년 최신 기준 세후 월급을 알려드립니다.",
};

export default function NekarakubaeSalaryPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          네카라쿠배 신입 초봉, 그래서 얼마 받는데?
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          2025년 기준 실제 통장에 찍히는 세후 월급 총정리
        </p>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          네이버, 카카오, 라인, 쿠팡, 배달의민족으로 대표되는{" "}
          <strong>&apos;네카라쿠배&apos;</strong>는 모든 IT 개발자 지망생들의
          꿈의 직장입니다. 그렇다면 과연 이들의 신입 개발자 초봉은 어느 정도
          수준일까요?
        </p>
        <section className="mt-12 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg">
          <h2 className="!mt-0 text-2xl font-bold">
            2025년 신입 개발자 초봉 (추정치)
          </h2>
          <p>
            일반적으로 계약 연봉 6,000만원 ~ 6,500만원 수준에서 형성되며, 여기에
            사이닝 보너스, 스톡옵션 등이 별도로 추가될 수 있습니다.
          </p>
          <p className="text-center text-2xl font-bold text-signature-blue my-4">
            계약 연봉 6,500만원 → 월 실수령액 약 440만원
          </p>
          <Link
            href="/?salaryInput=65,000,000&payBasis=annual"
            className="block mt-6 p-4 bg-signature-blue text-white rounded-lg text-center font-bold"
          >
            내 초봉 실수령액 직접 계산하기 →
          </Link>
        </section>
      </article>
    </main>
  );
}
