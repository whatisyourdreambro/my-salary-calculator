import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연말정산 A to Z: 13월의 월급, 제대로 챙기는 법 | Moneysalary",
  description:
    "소득공제와 세액공제의 차이점부터 놓치기 쉬운 핵심 공제 항목까지, 연말정산의 모든 것을 알려드립니다.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연말정산 A to Z: 13월의 월급, 제대로 챙기는 법",
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
    "소득공제와 세액공제의 차이점부터 놓치기 쉬운 핵심 공제 항목까지, 연말정산의 모든 것을 알려드립니다.",
};

export default function YearEndTaxSettlementPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            연말정산 A to Z: 13월의 월급 챙기기
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            제대로 준비하지 않으면 &apos;세금폭탄&apos;이 될 수 있는 연말정산,
            핵심만 콕콕 짚어드립니다.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 1일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-center">
              연말정산의 기본 구조
            </h2>
            <div className="mt-6 grid md:grid-cols-2 gap-8">
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <h3 className="!mt-0 text-xl font-bold">소득공제</h3>
                <p>
                  세금을 매기는 기준이 되는 금액 자체를 줄여주는 것입니다. (예:
                  인적공제, 신용카드 공제). 소득이 높을수록 절세 효과가 큽니다.
                </p>
              </div>
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <h3 className="!mt-0 text-xl font-bold">세액공제</h3>
                <p>
                  계산된 세금 자체를 직접 깎아주는 것입니다. (예: 자녀, 월세
                  공제). 소득 수준과 관계없이 공제액이 일정합니다.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              직장인이 놓치기 쉬운 핵심 공제 항목 3가지
            </h2>
            <p>
              국세청 홈택스 간소화 서비스가 편리해졌지만, 직접 챙겨야만 공제받을
              수 있는 항목들이 있습니다.
            </p>
            <ol className="!my-4">
              <li>
                <strong>월세액 세액공제:</strong> 총급여 7,000만 원 이하 무주택
                근로자라면 월세액의 15~17%까지 세액공제를 받을 수 있습니다.
              </li>
              <li>
                <strong>안경 및 콘택트렌즈 구입비:</strong> 1인당 연 50만 원까지
                의료비 세액공제 대상에 포함됩니다.
              </li>
              <li>
                <strong>중고생 교복 구입비:</strong> 자녀의 교복 구입비 역시
                1인당 연 50만 원까지 교육비 세액공제를 받을 수 있습니다.
              </li>
            </ol>
            <Link
              href="/"
              className="block mt-6 p-4 bg-signature-blue text-white rounded-lg text-center font-bold hover:bg-blue-700 transition-colors"
            >
              내 부양가족 수로 예상 소득세 미리 계산하기
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
