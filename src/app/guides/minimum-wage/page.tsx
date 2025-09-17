import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2025년 최저임금 완벽정리 (시급, 월급, 연봉) | Moneysalary",
  description:
    "2025년 최저시급은 얼마일까요? 최저임금 기준 월급과 연봉, 그리고 주휴수당 포함 계산법까지 모두 알려드립니다.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 최저임금 완벽정리 (시급, 월급, 연봉)",
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
    "2025년 최저시급은 얼마일까요? 최저임금 기준 월급과 연봉, 그리고 주휴수당 포함 계산법까지 모두 알려드립니다.",
};

export default function MinimumWagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            2025년 최저임금 완벽정리
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            국가가 법으로 정한 최소한의 임금, 2025년 최저임금 기준 시급, 월급,
            연봉을 자세히 알아보겠습니다.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 1일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <section className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-xl font-bold">최저 시급</h2>
              <p className="text-3xl font-bold text-signature-blue">10,030원</p>
              <p className="text-xs">(2024년 대비 2.5% 인상된 예시 금액)</p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-xl font-bold">
                최저 월급 (주휴수당 포함)
              </h2>
              <p className="text-3xl font-bold text-signature-blue">
                2,096,270원
              </p>
              <p className="text-xs">(월 209시간 기준)</p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-xl font-bold">최저 연봉</h2>
              <p className="text-3xl font-bold text-signature-blue">
                25,155,240원
              </p>
              <p className="text-xs">(월급 × 12개월)</p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">
              최저임금 기준 월급, 어떻게 계산될까요?
            </h2>
            <p>
              월급은 주휴수당을 포함하여 계산하는 것이 일반적입니다. 주
              40시간(주 5일, 일 8시간) 근무 기준으로 계산하면 다음과 같습니다.
            </p>
            <ul className="!my-4">
              <li>
                <strong>월 근로시간:</strong> (주 40시간 + 주휴시간 8시간) ×
                (365일 / 12개월 / 7일) ≒ 209시간
              </li>
              <li>
                <strong>최저 월급:</strong> 10,030원 × 209시간 ={" "}
                <strong>2,096,270원</strong>
              </li>
            </ul>
            <Link
              href="/"
              className="block mt-8 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
            >
              최저임금 기준, 내 실수령액은?
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
