import type { Metadata } from "next";
import Link from "next/link";
import KakaoAdFit from "@/components/KakaoAdFit";
import ClientOnly from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "건강보험료는 어떻게 결정되나요? | Moneysalary",
  description:
    "매년 달라지는 건강보험료, 어떤 기준으로 부과되는지 직장가입자와 지역가입자의 차이점을 통해 명확하게 알려드립니다.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "QAPage",
  mainEntity: {
    "@type": "Question",
    name: "건강보험료는 어떻게 결정되나요?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "건강보험료는 가입자의 자격에 따라 직장가입자와 지역가입자로 나뉘며, 부과 방식에 큰 차이가 있습니다. 직장가입자는 월 소득(보수월액)을 기준으로 회사와 근로자가 50%씩 부담하며, 지역가입자는 소득뿐만 아니라 재산까지 고려하여 산정됩니다.",
    },
  },
};

export default function HealthInsurancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            건강보험료, 어떻게 결정되나요?
          </h1>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            건강보험료는 가입자의 자격에 따라 <strong>직장가입자</strong>와{" "}
            <strong>지역가입자</strong>로 나뉘며, 부과 방식에 큰 차이가
            있습니다.
          </p>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <section className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-2xl font-bold">1. 직장가입자</h2>
              <p>
                월 소득(보수월액)을 기준으로 산정되며,{" "}
                <strong>회사와 근로자가 각각 50%씩 부담</strong>합니다. 월급 외
                소득이 연간 2,000만원을 초과하면 추가 보험료가 부과될 수
                있습니다.
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="!my-0">
                  <strong>산정 방식:</strong> 보수월액 × 보험료율(7.09%)
                </p>
              </div>
            </section>
            <section className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-2xl font-bold">2. 지역가입자</h2>
              <p>
                프리랜서, 자영업자 등 지역가입자는 소득뿐만 아니라 재산(주택,
                자동차 등)까지 고려하여 더 복잡하게 산정됩니다.
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="!my-0">
                  소득 점수 + 재산 점수를 합산하여 최종 보험료 결정
                </p>
              </div>
            </section>
          </div>

          <ClientOnly>
            <div className="my-8 flex justify-center">
              <KakaoAdFit
                unit="DAN-4eRqZLQIGjrNcXj6"
                width="300"
                height="250"
              />
            </div>
          </ClientOnly>

          <Link
            href="/"
            className="block mt-8 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
          >
            내 건강보험료, 급여계산기로 확인하기
          </Link>
        </article>
      </main>
    </>
  );
}
