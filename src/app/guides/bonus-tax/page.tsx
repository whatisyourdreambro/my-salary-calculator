// src/app/guides/bonus-tax/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "성과급(상여금) 세금 계산법, A to Z 완벽 정리 (2025년)",
  description:
    "열심히 일한 보상, 성과급! 하지만 세금이 얼마나 나올지 걱정되시나요? 성과급(상여금) 세금 계산 원리와 절세 팁까지 모두 알려드립니다.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "성과급(상여금) 세금 계산법, A to Z 완벽 정리 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-19",
  dateModified: "2025-09-19",
  description: "성과급(상여금) 세금 계산 원리와 절세 팁까지 모두 알려드립니다.",
};

export default function BonusTaxGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            내 성과급, 세금으로 얼마나 떼일까?
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            두둑한 보너스에 기뻐하기도 잠시, 월급날 통장에 찍힌 액수를 보고
            실망한 경험이 있으신가요? 성과급 세금의 비밀을 파헤쳐 드립니다.
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            성과급(상여금)은 법적으로 '근로소득'에 포함됩니다. 따라서 월급과
            마찬가지로 4대 보험료와 소득세가 모두 부과됩니다. 특히 성과급처럼 큰
            금액이 한 번에 들어올 경우, 높은 소득세율 구간이 적용되어 세금
            부담이 크게 느껴질 수 있습니다.
          </p>

          <section className="mt-12 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              성과급 세금, 이렇게 계산됩니다!
            </h2>
            <p>
              성과급 세금은 일반적으로 아래 두 가지 방식 중 하나로 계산됩니다.
            </p>
            <ol className="!my-4">
              <li>
                <strong>원칙:</strong> (성과급 받은 달까지의 총 급여 + 성과급)을
                근무 개월 수로 나누어 월 평균 소득을 계산하고, 간이세액표에 따라
                세금을 다시 계산하여 이미 낸 세금과의 차액을 징수합니다.
              </li>
              <li>
                <strong>간편 방식 (대부분의 회사):</strong> 성과급을 직전 달
                월급 기준으로 계산된 소득세율과 동일하게 적용하여
                원천징수합니다. 이 경우, 연말정산을 통해 최종적으로 정확한
                세액이 정산됩니다.
              </li>
            </ol>
            <p>
              어떤 방식이든, 성과급으로 인해 그 해의 총소득이 늘어나므로
              최종적인 세금 부담은 커지게 됩니다.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">성과급 절세 팁?</h2>
            <p>
              아쉽게도 성과급 자체에 대한 직접적인 절세 방법은 많지 않습니다.
              하지만 연금저축, IRP 계좌를 최대한 활용하면 연말정산 시 세액공제를
              통해 성과급으로 인해 늘어난 세금 부담을 일부 돌려받을 수 있습니다.
            </p>
            <Link
              href="/year-end-tax"
              className="block mt-8 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
            >
              내 연봉으로 연말정산 환급금 미리 계산하기 →
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
