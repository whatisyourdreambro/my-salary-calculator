import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기 | Moneysalary",
  description:
    "내 퇴직금에서 세금이 얼마나 빠져나갈까요? 복잡한 퇴직소득세 계산 구조와 공제 항목을 예시와 함께 쉽게 설명해 드립니다.",
};

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
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            퇴직금 세금, 얼마나 떼일까?
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            오랜 기간의 근로에 대한 보상인 퇴직금, 복잡한 퇴직소득세 계산 과정을
            단계별로 알기 쉽게 설명해 드립니다.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 1일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              퇴직소득세 계산 과정 (4단계)
            </h2>
            <p>
              퇴직소득세는 다른 소득에 비해 많은 공제 혜택이 있어 세금 부담이
              적은 편입니다. 계산은 아래와 같은 4단계의 복잡한 과정을 거칩니다.
            </p>
            <ol className="!my-4">
              <li>
                <strong>환산급여 계산:</strong> (퇴직금 - 근속연수공제) ÷
                근속연수 × 12
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
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-center">
              핵심은 바로 &apos;공제&apos;!
            </h2>
            <div className="mt-6 grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="!mt-0 text-xl font-bold">근속연수공제</h3>
                <p>
                  근속연수에 따라 일정 금액을 퇴직금에서 직접 빼주는 공제입니다.
                  오래 일할수록 공제 금액이 커집니다.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="!mt-0 text-xl font-bold">환산급여공제</h3>
                <p>
                  1단계에서 계산된 환산급여를 기준으로, 소득 구간에 따라 높은
                  비율의 금액을 추가로 공제해줍니다.
                </p>
              </div>
            </div>
            <p className="mt-6 text-center">
              이러한 복잡한 공제 과정 때문에 대부분의 퇴직금은 세금 부담이 크지
              않으며, 특히 소액 퇴직금의 경우 세금이 전혀 없을 수도 있습니다.
            </p>
            <Link
              href="/"
              className="block mt-8 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
            >
              복잡한 계산은 그만! 내 퇴직금 바로 확인하기
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
