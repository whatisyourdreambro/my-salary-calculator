import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2025년 최저임금 완벽정리 (시급, 월급, 연봉) | Moneysalary",
  description:
    "2025년 최저시급은 얼마일까요? 최저임금 기준 월급과 연봉, 그리고 주휴수당 포함 계산법까지 모두 알려드립니다.",
};

export default function MinimumWagePage() {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <div className="mb-8">
          <h1 className="!mb-2">2025년 최저임금 완벽정리 (시급, 월급, 연봉)</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            최종 업데이트: 2025년 9월
          </p>
        </div>

        <p className="lead">
          최저임금은 국가가 근로자의 기본적인 생활을 보장하기 위해 법으로 정한
          최소한의 임금 수준입니다. 매년 최저임금위원회의 심의를 거쳐 결정되며,
          모든 사업장에 동일하게 적용됩니다. 2025년 최저임금 기준 시급, 월급,
          연봉은 얼마인지 자세히 알아보겠습니다.
        </p>

        <h2>1. 2025년 최저시급</h2>
        <p>
          2025년 최저임금은 시간당 <strong>10,030원</strong>으로 결정되었습니다.
          (예시 금액) 이는 2024년 대비 약 2.5% 인상된 금액입니다. 이 금액은 수습
          근로자 등 일부 예외를 제외하고 모든 근로자에게 적용됩니다.
        </p>

        <h2>2. 최저임금 기준 월급 계산 (주휴수당 포함)</h2>
        <p>
          월급은 주휴수당을 포함하여 계산하는 것이 일반적입니다. 주 40시간(주
          5일, 일 8시간) 근무 기준으로 계산하면 다음과 같습니다.
        </p>
        <ul>
          <li>
            <strong>월 근로시간:</strong> (주 40시간 + 주휴시간 8시간) × (365일
            / 12개월 / 7일) ≒ 209시간
          </li>
          <li>
            <strong>최저 월급:</strong> 10,030원 × 209시간 ={" "}
            <strong>2,096,270원</strong>
          </li>
        </ul>

        <h2>3. 최저임금 기준 연봉</h2>
        <p>
          최저임금 기준 연봉은 위 월급에 12개월을 곱하여 간단하게 계산할 수
          있습니다.
        </p>
        <p>
          <code>
            2,096,270원 × 12개월 = <strong>25,155,240원</strong>
          </code>
        </p>

        <blockquote>
          <p>
            최저임금 기준 연봉의 세후 실수령액이 궁금하신가요?{" "}
            <Link href="/">연봉 계산기</Link>에서 바로 확인해보세요.
          </p>
        </blockquote>
      </article>
    </main>
  );
}

// 이 파일이 모듈임을 명시적으로 선언하여 오류를 해결합니다.
export {};
