import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연봉에 포함되는 수당, 안되는 수당은? | Moneysalary",
  description:
    "통상임금, 평균임금의 차이부터 비과세 수당까지, 내 연봉을 구성하는 각종 수당에 대해 자세히 알아보세요.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "QAPage",
  mainEntity: {
    "@type": "Question",
    name: "연봉에 포함되는 수당과 포함되지 않는 수당은 무엇인가요?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "연봉을 구성하는 수당은 크게 통상임금에 포함되는 것과 그렇지 않은 것으로 나뉩니다. 통상임금은 연장, 야간수당 등의 기준이 되며 기본급, 직무수당 등이 포함됩니다. 성과급이나 식대 등은 보통 포함되지 않습니다. 또한 식대, 차량유지비 등은 비과세 수당으로 세금을 떼지 않아 실수령액을 높이는 효과가 있습니다.",
    },
  },
};

export default function SalaryAllowancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            연봉에 포함되는 수당 vs 안되는 수당
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            연봉 협상이나 이직 시, 생각했던 실수령액과 달라서 당황하는 경우가
            많습니다. 가장 중요한 개념인 통상임금과 비과세 수당에 대해
            알아보겠습니다.
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <section className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-2xl font-bold">
                1. 통상임금: 각종 수당 계산의 기준
              </h2>
              <p>
                연장, 야간, 휴일근로수당이나 연차유급휴가수당 등을 산정하는
                기준이 됩니다.
              </p>
              <ul className="!my-4 text-sm">
                <li>
                  <strong>포함 항목:</strong> 기본급, 직무수당, 직책수당,
                  기술수당 등
                </li>
                <li>
                  <strong>미포함 항목:</strong> 연장근로수당, 성과급, 상여금,
                  식대 등
                </li>
              </ul>
            </section>
            <section className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-2xl font-bold">
                2. 비과세 수당: 세금을 떼지 않는 수당
              </h2>
              <p>
                비과세 수당이 많을수록 세후 실수령액이 높아지는 효과가 있습니다.
              </p>
              <ul className="!my-4 text-sm">
                <li>
                  <strong>식대:</strong> 월 20만원까지 비과세
                </li>
                <li>
                  <strong>차량유지비:</strong> 월 20만원까지 비과세 (조건 충족
                  시)
                </li>
                <li>
                  <strong>육아휴직 급여:</strong> 전액 비과세
                </li>
              </ul>
            </section>
          </div>

          <Link
            href="/"
            className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
          >
            내 비과세액 적용해서 실수령액 계산하기
          </Link>
        </article>
      </main>
    </>
  );
}
