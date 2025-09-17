import type { Metadata } from "next";
import Link from "next/link";
import KakaoAdFit from "@/components/KakaoAdFit";
import ClientOnly from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "실업급여 조건, A부터 Z까지 완벽 정리 (2025년 최신판) | Moneysalary",
  description:
    "실업급여 수급 자격, 신청 방법, 지급액, 구직활동까지. 2025년 최신 기준으로 실업급여의 모든 것을 자세히 알려드립니다.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "실업급여 조건, A부터 Z까지 완벽 정리 (2025년 최신판)",
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
    "실업급여 수급 자격, 신청 방법, 지급액, 구직활동까지. 2025년 최신 기준으로 실업급여의 모든 것을 자세히 알려드립니다.",
};

export default function UnemploymentBenefitsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            실업급여 A to Z (2025년 최신판)
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            갑작스러운 실직, 든든한 사회안전망 실업급여의 모든 것을
            알려드립니다.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 1일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <ClientOnly>
            <div className="my-8 flex justify-center">
              <KakaoAdFit
                unit="DAN-WgV2d248sf3mJoB2"
                width="320"
                height="100"
              />
            </div>
          </ClientOnly>

          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              가장 중요한 수급 조건 4가지
            </h2>
            <p>아래 4가지 조건을 모두 충족해야 실업급여를 받을 수 있습니다.</p>
            <ol className="!my-4">
              <li>
                <strong>고용보험 가입 기간:</strong> 이직일 이전 18개월 동안
                고용보험 가입 기간이 통산 180일 이상이어야 합니다.
              </li>
              <li>
                <strong>비자발적 퇴사:</strong> 경영상 해고, 권고사직, 계약 만료
                등 자신의 의사와 무관하게 직장을 그만둔 경우여야 합니다.
              </li>
              <li>
                <strong>근로 의사와 능력:</strong> 실직 상태에 있으며,
                적극적으로 재취업 활동을 할 의사와 능력이 있어야 합니다.
              </li>
              <li>
                <strong>재취업 노력:</strong> 워크넷에 구직 등록을 하고, 수급
                기간 동안 적극적인 재취업 활동을 해야 합니다.
              </li>
            </ol>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-center">
              얼마나 받을 수 있을까요?
            </h2>
            <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-center !my-0 font-bold">
                1일 지급액 = 퇴직 전 3개월 평균임금의 60%
              </p>
            </div>
            <p className="mt-6 text-center">
              단, 1일 지급액에는 상한액과 하한액이 정해져 있습니다. (2025년 기준
              상한액 66,000원, 하한액은 최저임금의 80%)
            </p>
            <Link
              href="/?tab=severance"
              className="block mt-8 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
            >
              내 퇴직금(평균임금) 미리 계산해보기
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
