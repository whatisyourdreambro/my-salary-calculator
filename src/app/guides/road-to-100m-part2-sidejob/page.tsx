import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "N잡으로 월 100만원 더 벌기 (2025년 부업 가이드) | Moneysalary",
  description:
    "직장인 부업 추천! 개발, 디자인 등 전문성을 활용한 N잡부터 스마트스토어, 배달 아르바이트까지. 월 100만원 추가 수익을 위한 현실적인 방법과 세금 신고 노하우를 알려드립니다.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "N잡으로 월 100만원 더 벌기 (2025년 부업 가이드)",
  author: { "@type": "Organization", name: "Moneysalary" },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-09-16",
  dateModified: "2025-09-16",
  description:
    "직장인 부업 추천! 개발, 디자인 등 전문성을 활용한 N잡부터 스마트스토어, 배달 아르바이트까지. 월 100만원 추가 수익을 위한 현실적인 방법과 세금 신고 노하우를 알려드립니다.",
};

export default function RoadTo100mSidejobPage() {
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
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-signature-blue to-teal-400 bg-clip-text text-transparent pb-2">
            N잡으로 월 100만원 더 벌기
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Road to 1억 시리즈 (2편)
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 16일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            월급만으로는 부족한 시대, <strong>N잡</strong>은 더 이상 선택이 아닌
            필수가 되어가고 있습니다. 당신의 소중한 시간을 추가 소득으로 바꿔줄
            현실적인 N잡 가이드를 제시합니다.
          </p>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-center">
              내게 맞는 부업 찾기: 3가지 유형
            </h2>
            <div className="mt-6 grid md:grid-cols-3 gap-8">
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <h3 className="!mt-0 text-xl font-bold">1. 재능 기반형</h3>
                <p className="text-sm">
                  디자인, 개발, 번역 등 본업의 전문성을 활용하는 부업. 크몽,
                  탈잉과 같은 재능 마켓을 통해 시작할 수 있으며 건당 수익이 높아
                  가장 효율적입니다.
                </p>
              </div>
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <h3 className="!mt-0 text-xl font-bold">2. 시간 투자형</h3>
                <p className="text-sm">
                  스마트스토어, 블로그, 유튜브 등 콘텐츠를 쌓아 수익을 창출하는
                  방식. 초기 수익은 적지만, 꾸준히 운영하면 자동화된 수익
                  파이프라인을 만들 수 있습니다.
                </p>
              </div>
              <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <h3 className="!mt-0 text-xl font-bold">3. 노동 기반형</h3>
                <p className="text-sm">
                  배달, 대리운전 등 시간을 투입한 만큼 즉각적인 수익을 얻는
                  방식. 원하는 시간에 자유롭게 일할 수 있다는 장점이 있습니다.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              N잡러 필수 상식: 종합소득세 신고
            </h2>
            <p>
              회사에서 받는 월급(근로소득) 외에 부업으로 추가 소득(사업소득 또는
              기타소득)이 발생했다면, 다음 해 5월에 반드시{" "}
              <strong>종합소득세 신고</strong>를 해야 합니다. 연말정산과 별개로
              진행되는 절차이며, 신고하지 않을 경우 가산세가 부과될 수 있으니
              잊지 마세요.
            </p>
          </section>

          <div className="mt-12 text-center">
            <p>
              다음 편에서는 부업으로 번 돈을 어떻게 굴려야 하는지 알아봅니다.
            </p>
            <Link
              href="/guides/road-to-100m-part3-invest"
              className="inline-block mt-2 p-4 bg-signature-blue text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              3편. 현실적인 투자 파이프라인 만들기 →
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
