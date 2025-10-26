import type { Metadata } from "next";
import Link from "next/link";
import { BrainCircuit, Clock, BarChart3, FileText } from "lucide-react";

export const metadata: Metadata = {
  title:
    "N잡으로 월 100만원 더 벌기: 당신의 시간을 돈으로 바꾸는 기술 (2025년)",
  description:
    "직장인 N잡, 무엇부터 시작해야 할까? 당신의 재능, 시간, 노동 유형에 맞는 최고의 부업을 찾고, 월 100만원 추가 수익을 창출하는 현실적인 파이프라인 구축법과 세금 신고 노하우까지 총정리.",
  openGraph: {
    title: "N잡으로 월 100만원 더 벌기: 당신의 시간을 돈으로 바꾸는 기술",
    description:
      "본업 외 추가 수익, 더 이상 꿈이 아닙니다. 당신에게 맞는 N잡을 찾아보세요.",
    images: [
      "/api/og?title=N잡으로 월 100만원 더 벌기&description=당신의 시간을 돈으로 바꾸는 기술",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "N잡으로 월 100만원 더 벌기: 당신의 시간을 돈으로 바꾸는 기술 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-16",
  dateModified: "2025-09-20",
  description:
    "당신의 재능, 시간, 노동 유형에 맞는 최고의 부업을 찾고, 월 100만원 추가 수익을 창출하는 현실적인 파이프라인 구축법과 세금 신고 노하우까지 총정리합니다.",
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
      <main className="w-full bg-background">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-gray-900 dark:to-teal-800 text-white text-center py-20 sm:py-28 px-4">
          <p className="text-lg font-semibold text-cyan-200">
            Road to 1억 시리즈 (2편)
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            N잡, 당신의 잠자는 시간을
            <br /> 돈으로 바꾸는 기술
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            월급만으로는 채워지지 않는 목표가 있나요? 퇴근 후, 주말의 자투리
            시간을 활용해 월 100만원의 추가 현금 흐름을 만드는 가장 현실적인
            방법을 공개합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              지난 1편에서 우리는 &apos;절세&apos;를 통해 새는 돈을 막는 법을
              배웠습니다. 이제 2단계는 &apos;추가 소득&apos;으로 파이의 크기
              자체를 키우는 것입니다. N잡은 더 이상 특별한 사람들의 이야기가
              아닙니다. 당신의 경험, 지식, 시간 모두가 돈이 될 수 있는
              시대입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold text-center">
                나에게 맞는 N잡 찾기: 3가지 유형 분석
              </h2>
              <p className="text-center">
                모든 사람에게 맞는 N잡은 없습니다. 나의 강점과 상황에 따라
                최적의 부업은 달라집니다. 당신은 어떤 유형에 해당하나요?
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg border bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 text-center">
                  <BrainCircuit className="w-12 h-12 text-teal-500 mx-auto" />
                  <h3 className="!mt-4 !mb-2 font-bold text-lg">
                    1. 재능 기반형
                  </h3>
                  <p className="!text-sm !my-0">
                    디자인, 개발, 번역, 컨설팅 등 본업의 전문성을 활용합니다.
                    크몽, 탈잉 같은 플랫폼에서 시작하며,{" "}
                    <strong>가장 높은 시간당 수익</strong>을 기대할 수 있습니다.
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 text-center">
                  <Clock className="w-12 h-12 text-teal-500 mx-auto" />
                  <h3 className="!mt-4 !mb-2 font-bold text-lg">
                    2. 시간 투자형
                  </h3>
                  <p className="!text-sm !my-0">
                    스마트스토어, 블로그, 유튜브 등 콘텐츠를 쌓아 수익을
                    창출합니다. 초기 수익은 적지만, 꾸준히 운영하면{" "}
                    <strong>자동화된 수익 파이프라인</strong> 구축이 가능합니다.
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 text-center">
                  <BarChart3 className="w-12 h-12 text-teal-500 mx-auto" />
                  <h3 className="!mt-4 !mb-2 font-bold text-lg">
                    3. 노동 기반형
                  </h3>
                  <p className="!text-sm !my-0">
                    배달, 대리운전, 설문조사 등 시간을 투입한 만큼 즉각적인
                    수익을 얻습니다. <strong>원하는 시간에 자유롭게</strong>{" "}
                    일할 수 있다는 장점이 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-red-500" />
                N잡러의 숙명: 5월 종합소득세 신고
              </h2>
              <p>
                가장 중요하지만 대부분이 놓치는 부분입니다. 회사에서 받는
                월급(근로소득) 외에 N잡으로 추가 소득(사업소득 또는 기타소득)이
                단 1원이라도 발생했다면, 다음 해 5월에 반드시{" "}
                <strong>종합소득세 신고</strong>를 해야 합니다.
              </p>
              <blockquote>
                <p>
                  <strong>왜 중요할까?</strong> 연말정산은 근로소득에 대해서만
                  이루어지기 때문에, N잡 소득은 별도로 신고해야 합니다. 신고하지
                  않을 경우, 무거운 가산세가 부과될 수 있습니다. N잡으로 번
                  돈보다 더 많은 세금을 낼 수도 있으니, 5월 종합소득세 신고는
                  선택이 아닌 필수입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                행동하는 자만이 부를 얻습니다
              </h2>
              <p>
                절세로 기초를 다지고, N잡으로 시드머니를 키웠다면 이제 마지막
                단계가 남았습니다. 돈이 스스로 일하게 만드는 &apos;투자
                파이프라인&apos;을 구축하는 것입니다.
              </p>
              <Link
                href="/guides/road-to-100m-part3-invest"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                3편. 투자 파이프라인 만들기 →
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
