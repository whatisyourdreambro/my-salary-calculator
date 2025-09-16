import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기 | Moneysalary",
  description:
    "내 퇴직금에서 세금이 얼마나 빠져나갈까요? 복잡한 퇴직소득세 계산 구조와 공제 항목을 예시와 함께 쉽게 설명해 드립니다.",
};

// [추가] Article 스키마 데이터
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기",
  author: { "@type": "Organization", name: "Moneysalary" },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-09-01",
  dateModified: "2025-09-01",
  description:
    "내 퇴직금에서 세금이 얼마나 빠져나갈까요? 복잡한 퇴직소득세 계산 구조와 공제 항목을 예시와 함께 쉽게 설명해 드립니다.",
};

export default function SeveranceTaxPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose dark:prose-invert lg:prose-xl w-full">
          <div className="mb-8">
            <h1 className="!mb-2">
              퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              최종 업데이트: 2025년 9월
            </p>
          </div>

          <p className="lead">
            오랜 기간의 근로에 대한 보상인 퇴직금, 하지만 이 퇴직금에도
            퇴직소득세라는 세금이 부과됩니다. 다행히 퇴직소득세는 다른 소득에
            비해 많은 공제 혜택이 있어 세금 부담이 적은 편입니다. 복잡한 계산
            과정을 단계별로 알기 쉽게 설명해 드립니다.
          </p>

          <h2>1. 퇴직소득세 계산 과정 (4단계)</h2>
          <p>퇴직소득세는 아래와 같은 4단계의 복잡한 과정을 거쳐 계산됩니다.</p>
          <ol>
            <li>
              <strong>환산급여 계산:</strong> (퇴직금 - 근속연수공제) ÷ 근속연수
              × 12
            </li>
            <li>
              <strong>과세표준 계산:</strong> 환산급여 - 환산급여공제
            </li>
            <li>
              <strong>산출세액 계산:</strong> 과세표준 × 기본세율
            </li>
            <li>
              <strong>최종 납부세액:</strong> (산출세액 ÷ 12 × 근속연수)
            </li>
          </ol>

          <h2>2. 핵심은 공제! (근속연수공제 & 환산급여공제)</h2>
          <p>퇴직소득세를 줄여주는 핵심은 두 가지 큰 공제 항목입니다.</p>
          <ul>
            <li>
              <strong>근속연수공제:</strong> 근속연수에 따라 일정 금액을
              퇴직금에서 직접 빼주는 공제입니다. 오래 일할수록 공제 금액이
              커집니다.
            </li>
            <li>
              <strong>환산급여공제:</strong> 1단계에서 계산된 환산급여를
              기준으로, 소득 구간에 따라 높은 비율의 금액을 추가로 공제해줍니다.
            </li>
          </ul>
          <p>
            이러한 복잡한 공제 과정 때문에 대부분의 퇴직금은 세금 부담이 크지
            않으며, 특히 소액 퇴직금의 경우 세금이 전혀 없을 수도 있습니다.
          </p>

          <blockquote>
            <p>
              복잡한 계산은 이제 그만! <Link href="/">퇴직금 계산기</Link>에
              입사일과 퇴사일, 급여만 입력하면 예상 퇴직금을 바로 확인할 수
              있습니다.
            </p>
          </blockquote>
        </article>
      </main>
    </>
  );
}
