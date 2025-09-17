import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "4대 보험 완벽 정리: 국민연금, 건강보험, 고용보험, 산재보험 | Moneysalary",
  description:
    "직장인이라면 반드시 알아야 할 4대 사회보험의 모든 것. 각 보험의 역할, 요율, 계산 방법까지 한 페이지에서 완벽하게 마스터하세요.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "4대 보험 완벽 정리: 국민연금, 건강보험, 고용보험, 산재보험",
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
    "직장인이라면 반드시 알아야 할 4대 사회보험의 모든 것. 각 보험의 역할, 요율, 계산 방법까지 한 페이지에서 완벽하게 마스터하세요.",
};

export default function FourMajorInsurancesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            4대 보험, 월급에서 왜 떼는 걸까?
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            국민연금, 건강보험, 고용보험, 산재보험. 직장인의 든든한 사회안전망
            4대 보험의 모든 것을 알려드립니다.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 1일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none space-y-8">
          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              1. 국민연금: 나의 노후를 위한 최소한의 준비
            </h2>
            <p>
              소득이 있을 때 꾸준히 보험료를 납부하여 모아두었다가, 나이가 들어
              생업에 종사하지 못하거나 예기치 못한 사고나 질병으로 장애를 입거나
              사망했을 때 본인 또는 유족에게 연금을 지급하여 기본적인 생활을
              유지할 수 있도록 돕는 제도입니다.
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="!my-0">
                <strong>2025년 기준 요율:</strong> 총 9% (근로자 4.5%, 회사 4.5%
                부담)
              </p>
            </div>
          </section>

          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              2. 건강보험: 아플 때 든든한 버팀목
            </h2>
            <p>
              질병이나 부상으로 인해 발생하는 고액의 진료비 부담을 방지하기 위한
              제도로, 평소에 보험료를 내고 필요시 보험급여를 제공받습니다.
              여기에 추가로 장기요양보험료가 건강보험료의 12.95%만큼 부과됩니다.
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="!my-0">
                <strong>2025년 기준 요율:</strong> 총 7.09% (근로자 3.545%, 회사
                3.545% 부담)
              </p>
            </div>
          </section>

          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              3. 고용보험: 실직과 재취업의 다리
            </h2>
            <p>
              실직한 근로자에게 실업급여를 지급하여 재취업을 준비하는 기간
              동안의 생계를 지원하고, 재취업을 위한 각종 교육 훈련 프로그램 등을
              제공하는 사회보험입니다.
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="!my-0">
                <strong>2025년 기준 요율:</strong> 근로자 부담 0.9%
              </p>
            </div>
          </section>

          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              4. 산재보험: 일터에서의 안전망
            </h2>
            <p>
              업무상의 사유로 부상, 질병, 사망 등 재해를 입었을 경우 근로자와 그
              가족의 생활을 보장하기 위한 보험입니다. 치료비, 휴업급여,
              장해급여, 유족급여 등을 지급합니다.
            </p>
            <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-700">
              <p className="!my-0">
                <strong>산재보험료는 전액 사업주가 부담</strong>하므로 근로자의
                월급에서는 공제되지 않습니다.
              </p>
            </div>
          </section>

          <Link
            href="/"
            className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
          >
            그래서 내 월급은 얼마? 지금 바로 계산하기
          </Link>
        </article>
      </main>
    </>
  );
}
