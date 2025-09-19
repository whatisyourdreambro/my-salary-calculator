import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "5년차 간호사 연봉 테이블 및 세후 월급 (2025년 빅5 병원 포함)",
  description:
    "대학병원, 종합병원 기준 5년차 간호사의 현실적인 연봉과 실수령액은? 서울대, 아산, 삼성서울병원 등 빅5 병원 정보와 함께 상세히 알려드립니다.",
};

export default function Nurse5yrSalaryPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          5년차 간호사, 진짜 연봉은 얼마일까?
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          2025년 빅5 병원 포함, 세후 월급 완벽 분석
        </p>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          신규 시절을 지나 병원 업무의 핵심으로 자리 잡는 5년차 간호사. 업무
          강도만큼 연봉도 만족스러울까요? 상급종합병원(대학병원) 기준 5년차
          간호사의 평균 연봉은 약 6,000만원에서 7,500만원 사이로 형성됩니다.
        </p>
        <blockquote>
          <p>
            자세한 병원별, 직급별 연봉 정보는{" "}
            <Link href="/guides/nurse-salary">
              2025년 간호사 연봉 테이블 완벽 분석
            </Link>{" "}
            가이드를 참고하세요.
          </p>
        </blockquote>
        <Link
          href="/?salaryInput=60,000,000&payBasis=annual"
          className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold"
        >
          내 연봉 실수령액 계산하기 →
        </Link>
      </article>
    </main>
  );
}
