import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "실업급여 조건, A부터 Z까지 완벽 정리 (2025년 최신판) | Moneysalary",
  description:
    "실업급여 수급 자격, 신청 방법, 지급액, 구직활동까지. 2025년 최신 기준으로 실업급여의 모든 것을 자세히 알려드립니다.",
};

export default function UnemploymentBenefitsPage() {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <div className="mb-8">
          <h1 className="!mb-2">
            실업급여 조건, A부터 Z까지 완벽 정리 (2025년 최신판)
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            최종 업데이트: 2025년 9월
          </p>
        </div>

        <p className="lead">
          갑작스러운 실직은 누구에게나 힘든 경험입니다. 다행히 대한민국에는
          재취업을 준비하는 기간 동안 최소한의 생계를 보장해주는 실업급여라는
          든든한 사회안전망이 있습니다. 하지만 조건이 까다롭고 절차가 복잡해
          많은 분들이 어려움을 겪습니다. 2025년 최신 기준 실업급여의 모든 것을
          알려드립니다.
        </p>

        <h2>1. 실업급여, 정확히 무엇인가요?</h2>
        <p>
          실업급여는 고용보험에 가입한 근로자가 실직하여 재취업 활동을 하는
          기간에 소정의 급여를 지급하여 생계 불안을 극복하고 생활의 안정을
          도와주는 제도입니다. 크게 <strong>구직급여</strong>와{" "}
          <strong>취업촉진수당</strong>으로 나뉩니다. 우리가 흔히 실업급여라고
          부르는 것은 대부분 구직급여를 의미합니다.
        </p>

        <h2>2. 가장 중요한 수급 조건 4가지</h2>
        <p>아래 4가지 조건을 모두 충족해야 실업급여를 받을 수 있습니다.</p>
        <ol>
          <li>
            <strong>고용보험 가입 기간:</strong> 이직일 이전 18개월 동안
            고용보험 가입 기간(피보험 단위기간)이 통산 180일 이상이어야 합니다.
          </li>
          <li>
            <strong>비자발적 퇴사:</strong> 경영상 해고, 권고사직, 계약 만료 등
            자신의 의사와 무관하게 직장을 그만둔 경우여야 합니다.{" "}
            <strong>자발적 퇴사는 원칙적으로 수급이 불가능</strong>하지만,
            정당한 사유가 인정되면 예외적으로 가능합니다.
          </li>
          <li>
            <strong>근로 의사와 능력:</strong> 실직 상태에 있으며, 적극적으로
            재취업 활동을 할 의사와 능력이 있어야 합니다.
          </li>
          <li>
            <strong>재취업 노력:</strong> 워크넷에 구직 등록을 하고, 수급 기간
            동안 적극적인 재취업 활동(입사 지원, 면접 등)을 해야 합니다.
          </li>
        </ol>

        <h2>3. 얼마나 받을 수 있나요? (지급액)</h2>
        <p>
          실업급여 지급액은 퇴사 전 3개월간의 평균임금과 고용보험 가입 기간,
          나이에 따라 달라집니다.
        </p>
        <p>
          <code>1일 지급액 = 퇴직 전 3개월 평균임금의 60%</code>
        </p>
        <p>
          단, 1일 지급액에는 상한액과 하한액이 정해져 있습니다. (2025년 기준
          상한액 66,000원, 하한액은 최저임금의 80%)
        </p>

        <blockquote>
          <p>
            퇴직 전 평균임금은 퇴직금 계산의 기초가 되기도 합니다. 나의 예상
            퇴직금이 궁금하다면? <Link href="/">퇴직금 계산기</Link>
          </p>
        </blockquote>
      </article>
    </main>
  );
}
