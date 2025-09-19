// src/app/guides/salary-4500/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연봉 4500만원 실수령액, 세후 월급은 얼마일까? (2025년 기준)",
  description:
    "연봉 4500만원 직장인의 실제 월급은? 2025년 최신 4대보험, 소득세 기준 세후 실수령액과 공제 항목을 상세히 분석해 드립니다.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 4500만원 실수령액, 세후 월급은 얼마일까? (2025년 기준)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-19",
  dateModified: "2025-09-19",
  description:
    "연봉 4500만원 직장인의 실제 월급은? 2025년 최신 4대보험, 소득세 기준 세후 실수령액과 공제 항목을 상세히 분석해 드립니다.",
};

export default function Salary4500GuidePage() {
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
            연봉 4500만원, 내 통장엔 얼마가 찍힐까?
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            사회초년생을 넘어 경력을 쌓아가는 직장인들의 대표적인 연봉 구간,
            4500만원의 실제 수령액을 완벽 분석합니다.
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            '연봉 4500만원'은 많은 직장인에게 중요한 이정표와 같은 금액입니다.
            하지만 각종 세금과 4대 보험료를 공제하고 나면 실제 월급은 얼마나
            될까요? 2025년 최신 기준을 적용하여 실수령액을 상세히 파헤쳐
            보겠습니다.
          </p>

          <section className="mt-12 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold text-center">
              결론: 연봉 4500만원의 월 실수령액은 약 318만원
            </h2>
            <p className="text-center">(비과세액 20만원, 부양가족 1인 기준)</p>
            <div className="mt-6 text-center">
              <p>
                월 예상 공제액 합계: <strong>약 56만원</strong>
              </p>
              <ul className="list-none !pl-0 text-sm">
                <li>
                  <strong>국민연금:</strong> 약 188,620원
                </li>
                <li>
                  <strong>건강보험:</strong> 약 132,050원
                </li>
                <li>
                  <strong>고용보험:</strong> 약 33,520원
                </li>
                <li>
                  <strong>소득세:</strong> 약 191,520원
                </li>
              </ul>
            </div>
            <Link
              href="/?salaryInput=45,000,000&payBasis=annual"
              className="block mt-6 p-4 bg-signature-blue text-white rounded-lg text-center font-bold hover:bg-blue-700 transition-colors"
            >
              내 조건으로 정확히 계산해보기 →
            </Link>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">왜 이렇게 많이 떼는 걸까요?</h2>
            <p>
              연봉이 높아질수록 소득세율 구간이 함께 상승하기 때문입니다. 연봉
              4500만원은 15%의 소득세율이 적용되는 구간에 해당하여, 이전
              구간보다 세금 부담이 체감적으로 늘어나게 됩니다.
            </p>
            <blockquote>
              <p>
                부양가족 수나 비과세 혜택에 따라 실수령액은 크게 달라질 수
                있습니다. Moneysalary 계산기에서 직접 조건을 설정하여 가장
                정확한 내 월급을 확인해보세요.
              </p>
            </blockquote>
          </section>
        </article>
      </main>
    </>
  );
}
