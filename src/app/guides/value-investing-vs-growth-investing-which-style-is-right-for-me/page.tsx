
import type { Metadata } from "next";
import Link from "next/link";
import { LineChart, DollarSign, Lightbulb, GitCompare } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "가치 투자 vs 성장 투자, 나에게 맞는 스타일은? (워렌 버핏 vs 캐시 우드)",
  description:
    "주식 투자의 두 가지 큰 흐름, 가치 투자와 성장 투자! 워렌 버핏으로 대표되는 가치 투자와 캐시 우드로 대표되는 성장 투자의 차이점, 장단점, 그리고 당신의 투자 성향과 시장 상황에 맞는 최적의 투자 스타일을 찾아드립니다. 당신의 성공적인 투자를 위한 현명한 선택을 하세요.",
  openGraph: {
    title: "가치 투자 vs 성장 투자, 나에게 맞는 스타일은? (워렌 버핏 vs 캐시 우드)",
    description:
      "가치 투자와 성장 투자, 헷갈리시나요? 당신의 투자 성향을 파악하고 성공적인 투자 전략을 세우세요.",
    images: ["/api/og?title=가치 투자 vs 성장 투자"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "가치 투자 vs 성장 투자, 나에게 맞는 스타일은? (워렌 버핏 vs 캐시 우드)",
  author: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-10-28",
  dateModified: currentDate,
  description:
    "워렌 버핏으로 대표되는 가치 투자와 캐시 우드로 대표되는 성장 투자의 차이점, 장단점, 그리고 당신의 투자 성향과 시장 상황에 맞는 최적의 투자 스타일을 찾아드립니다. 당신의 성공적인 투자를 위한 현명한 선택을 하세요.",
};

export default function ValueVsGrowthInvestingGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            가치 투자 vs 성장 투자,
            <br /> 나에게 맞는 스타일은?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            주식 투자의 대표적인 두 가지 전략, 가치 투자와 성장 투자! 워렌 버핏과 캐시 우드로 대표되는 두 투자 스타일의 차이점을 명확히 이해하고, 당신의 투자 성향에 맞는 최적의 전략을 찾아드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              주식 투자는 단순히 기업의 주식을 사고파는 행위를 넘어, 기업의 가치를 분석하고 미래를 예측하는 과정입니다. 이러한 투자 과정에는 다양한 철학과 전략이 존재하며, 그중 가장 대표적인 것이 '가치 투자'와 '성장 투자'입니다. 두 투자 스타일은 기업을 평가하는 기준, 투자 기간, 위험 감수 수준 등에서 큰 차이를 보입니다. 자신의 투자 성향과 목표에 맞는 스타일을 선택하는 것이 성공적인 투자의 핵심입니다. 이 가이드를 통해 가치 투자와 성장 투자의 모든 것을 파악하고, 당신의 성공적인 투자를 위한 현명한 선택을 하세요.
            </p>

            <section className="mt-12 bg-purple-500 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <GitCompare className="w-6 h-6" />
                가치 투자 vs 성장 투자, 무엇이 다를까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>가치 투자:</strong> 기업의 내재 가치보다 주가가 저평가되어 있는 기업을 발굴하여 투자하는 전략. '싸게 사서 비싸게 판다'는 원칙에 기반합니다. (예: 워렌 버핏)
                </li>
                <li>
                  <strong>성장 투자:</strong> 현재의 가치보다는 미래의 성장 가능성이 높은 기업에 투자하는 전략. '미래의 가치를 미리 산다'는 원칙에 기반합니다. (예: 캐시 우드)
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <LineChart className="w-7 h-7 text-green-500" />
                가치 투자 vs 성장 투자, 한눈에 비교하기
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">가치 투자</th>
                      <th className="py-3 px-4 font-bold text-orange-500">성장 투자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">투자 대상</td>
                      <td className="py-4 px-4">저평가된 우량 기업</td>
                      <td className="py-4 px-4">성장 가능성 높은 기업</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">주요 지표</td>
                      <td className="py-4 px-4">PER, PBR, ROE 등 재무 지표</td>
                      <td className="py-4 px-4">매출액, 영업이익 성장률, 시장 점유율 등</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">투자 기간</td>
                      <td className="py-4 px-4">장기 투자</td>
                      <td className="py-4 px-4">장기 투자 (단, 성장성 확인 필요)</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">위험도</td>
                      <td className="py-4 px-4">상대적으로 낮음</td>
                      <td className="py-4 px-4">상대적으로 높음</td>
                    </tr>
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 내용은 일반적인 특징이며, 개별 기업 및 시장 상황에 따라 다를 수 있습니다.</p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 나에게 맞는 투자 스타일 선택 가이드
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>가치 투자 추천:</strong>
                  <ul className="!my-1 list-disc list-inside text-sm">
                    <li>안정적인 투자를 선호하고, 기업 분석에 시간을 투자할 수 있는 투자자</li>
                    <li>장기적인 관점에서 꾸준히 수익을 추구하는 투자자</li>
                    <li>시장 변동성에 크게 흔들리지 않는 투자자</li>
                  </ul>
                </li>
                <li>
                  <strong>성장 투자 추천:</strong>
                  <ul className="!my-1 list-disc list-inside text-sm">
                    <li>높은 수익률을 추구하고, 위험을 감수할 수 있는 투자자</li>
                    <li>새로운 기술과 산업 트렌드에 관심이 많고, 기업의 미래 가치를 예측하는 데 능숙한 투자자</li>
                    <li>단기적인 변동성에도 흔들리지 않고 장기적인 관점에서 투자하는 투자자</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <DollarSign className="w-7 h-7 text-indigo-500" />
                당신의 성공적인 투자를 응원합니다!
              </h2>
              <p>
                가치 투자와 성장 투자, 어떤 스타일을 선택하든 중요한 것은 <br />
                자신만의 투자 원칙을 세우고 꾸준히 실천하는 것입니다.
              </p>
              <Link
                href="/guides/road-to-100m-part3-invest"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                투자 시스템 만들기 가이드 보기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
