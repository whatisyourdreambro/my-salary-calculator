import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "현대자동차 생산직 초봉과 성과급 분석 (2025년)",
  description:
    "킹산직, 갓산직이라 불리는 현대차 생산직! 2025년 최신 정보 기준 신입 초봉, 성과급, 각종 복지를 포함한 예상 실수령액을 알아봅니다.",
};

export default function HyundaiSalaryPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          <strong>&apos;킹산직&apos;</strong> 현대차 생산직, 초봉은 얼마?
        </h1>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          수천 대 일의 경쟁률을 뚫어야만 입사할 수 있다는 현대자동차 생산직.
          높은 연봉과 강력한 복지로 <strong>&apos;킹산직&apos;</strong>이라
          불립니다. 신입사원의 실제 연봉은 어느 정도일까요?
        </p>
        <p>
          기본급 자체는 높지 않지만, 각종 수당과 매년 노사협상을 통해 결정되는
          막대한 성과급이 더해져 높은 연봉이 완성됩니다. 2025년 기준, 모든 것을
          포함한 신입의 초봉은 <strong>7,000만원에서 1억원</strong>에 육박할
          것으로 예상됩니다.
        </p>
        <Link
          href="/?salaryInput=70,000,000&payBasis=annual"
          className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold"
        >
          연봉 7000만원 실수령액 계산하기 →
        </Link>
      </article>
    </main>
  );
}
