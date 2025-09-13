import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "건강보험료는 어떻게 결정되나요? | Moneysalary",
  description:
    "매년 달라지는 건강보험료, 어떤 기준으로 부과되는지 직장가입자와 지역가입자의 차이점을 통해 명확하게 알려드립니다.",
};

export default function HealthInsurancePage() {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <h1>건강보험료는 어떻게 결정되나요?</h1>
        <p>
          건강보험료는 가입자의 자격에 따라 <strong>직장가입자</strong>와{" "}
          <strong>지역가입자</strong>로 나뉘며, 부과 방식에 큰 차이가 있습니다.
        </p>
        <h2>1. 직장가입자 건강보험료</h2>
        <p>
          직장가입자의 건강보험료는 비교적 간단합니다. 월 소득(보수월액)을
          기준으로 산정되며, <strong>회사와 근로자가 각각 50%씩 부담</strong>
          합니다.
        </p>
        <p>
          <code>산정 방식: 보수월액 × 보험료율(7.09%)</code>
        </p>
        <p>
          여기서 근로자가 실제로 부담하는 금액은 위 금액의 절반입니다. 또한,
          월급 외 소득(사업, 이자, 배당 등)이 연간 2,000만원을 초과하면 추가로
          '소득월액 보험료'가 부과될 수 있습니다.
        </p>
        <h2>2. 지역가입자 건강보험료</h2>
        <p>
          프리랜서, 자영업자 등 지역가입자의 건강보험료는 소득뿐만 아니라
          재산까지 고려하여 더 복잡하게 산정됩니다.
        </p>
        <ul>
          <li>
            <strong>소득:</strong> 사업소득, 이자소득, 배당소득, 연금소득 등
            종합소득을 등급별 점수로 환산
          </li>
          <li>
            <strong>재산:</strong> 주택, 건물, 토지 등 재산과표액과 자동차
            가액을 등급별 점수로 환산
          </li>
        </ul>
        <p>
          이렇게 산출된 소득 점수와 재산 점수를 합산하여 점수당 금액을 곱해 최종
          보험료가 결정됩니다.
        </p>
        <blockquote>
          <p>
            내 월급에서 공제되는 건강보험료가 궁금하다면?{" "}
            <Link href="/">월급 계산기</Link>로 확인해보세요.
          </p>
        </blockquote>
      </article>
    </main>
  );
}
