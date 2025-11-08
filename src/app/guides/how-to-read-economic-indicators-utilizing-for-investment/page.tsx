
import type { Metadata } from "next";
import Link from "next/link";
import { LineChart, DollarSign, Lightbulb, Globe } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "경제 지표 읽는 법, 투자에 활용하기: 경제 뉴스 꿰뚫어 보는 눈! (2025년)",
  description:
    "투자는 경제의 흐름을 읽는 것부터 시작됩니다. GDP, 물가 상승률, 금리, 실업률 등 주요 경제 지표의 개념과 의미를 쉽게 설명하고, 이러한 지표들이 주식, 부동산 등 투자 시장에 미치는 영향을 분석하여 투자 전략 수립에 활용하는 방법을 상세히 알려드립니다. 경제 뉴스, 더 이상 어렵지 않습니다.",
  openGraph: {
    title: "경제 지표 읽는 법, 투자에 활용하기: 경제 뉴스 꿰뚫어 보는 눈! (2025년)",
    description:
      "경제 지표, 더 이상 어렵지 않습니다. 경제 뉴스를 꿰뚫어 보고 당신의 투자 수익을 극대화하세요.",
    images: ["/api/og?title=경제 지표 읽는 법, 투자 활용"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "경제 지표 읽는 법, 투자에 활용하기: 경제 뉴스 꿰뚫어 보는 눈! (2025년)",
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
    "GDP, 물가 상승률, 금리, 실업률 등 주요 경제 지표의 개념과 의미를 쉽게 설명하고, 이러한 지표들이 주식, 부동산 등 투자 시장에 미치는 영향을 분석하여 투자 전략 수립에 활용하는 방법을 상세히 알려드립니다.",
};

export default function EconomicIndicatorsGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            경제 지표 읽는 법,
            <br /> 투자에 활용하기
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            투자는 경제의 흐름을 읽는 것부터 시작됩니다. GDP, 물가 상승률, 금리 등 주요 경제 지표의 개념과 의미를 쉽게 설명하고, 이러한 지표들이 투자 시장에 미치는 영향을 분석하여 당신의 투자 전략을 세우세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              경제 지표는 국가 경제의 현재 상태와 미래 방향을 예측할 수 있는 중요한 단서입니다. 주식, 부동산, 채권 등 모든 투자 시장은 경제 지표의 발표와 해석에 따라 민감하게 반응합니다. 따라서 투자자라면 경제 지표의 개념과 의미를 정확히 이해하고, 이를 자신의 투자 전략에 효과적으로 활용하는 능력을 키워야 합니다. 이 가이드를 통해 주요 경제 지표의 모든 것을 파악하고, 경제 뉴스를 꿰뚫어 보는 눈을 가지세요.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Globe className="w-6 h-6" />
                경제 지표, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>시장 예측:</strong> 경제 지표는 미래의 경제 상황과 시장의 방향을 예측하는 데 중요한 단서가 됩니다.
                </li>
                <li>
                  <strong>투자 전략 수립:</strong> 경제 지표의 변화에 따라 주식, 채권, 부동산 등 자산 배분 전략을 수정할 수 있습니다.
                </li>
                <li>
                  <strong>위험 관리:</strong> 경제 지표를 통해 경기 침체나 금융 위기 등 잠재적인 위험을 미리 감지하고 대비할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <LineChart className="w-7 h-7 text-green-500" />
                주요 경제 지표 읽는 법과 투자 활용 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. GDP (국내총생산): 경제 성장률의 지표
                  </h3>
                  <p className="!text-sm !my-0">
                    한 국가의 경제 규모와 성장 속도를 나타내는 가장 대표적인 지표입니다. GDP 성장률이 높으면 기업의 이익 증가와 주가 상승을 기대할 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 소비자물가지수 (CPI): 인플레이션의 척도
                  </h3>
                  <p className="!text-sm !my-0">
                    소비자들이 구매하는 상품과 서비스의 가격 변동을 나타내는 지표입니다. CPI가 높으면 인플레이션 압력이 커져 금리 인상 가능성이 높아지고, 이는 주식 시장에 부정적인 영향을 미칠 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 기준금리: 돈의 가치를 결정
                  </h3>
                  <p className="!text-sm !my-0">
                    중앙은행이 결정하는 금리로, 시중 금리에 직접적인 영향을 미칩니다. 금리가 인상되면 기업의 자금 조달 비용이 증가하고, 주식 시장에는 부정적인 영향을 미칠 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    4. 실업률: 고용 시장의 건강성
                  </h3>
                  <p className="!text-sm !my-0">
                    경제 활동 인구 중 실업자의 비율을 나타내는 지표입니다. 실업률이 낮으면 고용 시장이 건강하고 소비가 활발하여 경제 성장에 긍정적인 영향을 미칩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 경제 지표, 이것만은 기억하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>선행 지표, 동행 지표, 후행 지표:</strong> 각 지표의 특성을 이해하고, 미래를 예측하는 데 활용하세요.
                </li>
                <li>
                  <strong>종합적인 분석:</strong> 하나의 지표만으로 경제 상황을 판단하기보다는 여러 지표를 종합적으로 분석하는 것이 중요합니다.
                </li>
                <li>
                  <strong>시장의 반응:</strong> 지표의 발표 자체보다 시장이 어떻게 반응하는지 주목하세요. 시장의 기대치와 실제 발표치의 차이가 중요합니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <DollarSign className="w-7 h-7 text-indigo-500" />
                당신의 투자 수익을 극대화하세요!
              </h2>
              <p>
                경제 지표를 읽는 능력은 당신의 투자 수익을 극대화하는 중요한 무기입니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 투자자가 되세요.
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
