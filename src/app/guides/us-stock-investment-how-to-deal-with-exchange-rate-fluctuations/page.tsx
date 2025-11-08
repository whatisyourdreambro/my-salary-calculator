
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, TrendingUp, TrendingDown, Globe } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "미국 주식 투자, 환율 변동에 대처하는 법: 환차익 극대화 전략 (2025년)",
  description:
    "'서학개미'라면 필독! 미국 주식 투자는 환율 변동이라는 또 하나의 변수를 고려해야 합니다. 환율이 투자 수익률에 미치는 영향(환차익, 환차손)을 분석하고, 환헤지, 분할 매수/매도, 달러 예금 등 환율 위험을 관리하고 환차익을 극대화하는 실질적인 전략을 알려드립니다.",
  openGraph: {
    title: "미국 주식 투자, 환율 변동에 대처하는 법: 환차익 극대화 전략 (2025년)",
    description:
      "미국 주식 투자, 환율까지 알면 진짜 고수! 환율 변동을 기회로 만드는 전략을 지금 바로 확인하세요.",
    images: ["/api/og?title=미국 주식, 환율 변동 대처법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "미국 주식 투자, 환율 변동에 대처하는 법: 환차익 극대화 전략 (2025년)",
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
    "환율이 투자 수익률에 미치는 영향(환차익, 환차손)을 분석하고, 환헤지, 분할 매수/매도, 달러 예금 등 환율 위험을 관리하고 환차익을 극대화하는 실질적인 전략을 알려드립니다.",
};

export default function UsStockExchangeRateGuidePage() {
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
            미국 주식 투자,
            <br /> 환율 변동에 대처하는 법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            '서학개미'라면 필독! 미국 주식 투자는 환율 변동이라는 또 하나의 변수를 고려해야 합니다. 환율이 투자 수익률에 미치는 영향을 분석하고, 환율 위험을 관리하고 환차익을 극대화하는 실질적인 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              미국 주식 시장은 전 세계 경제를 이끄는 핵심 동력이며, 국내 투자자들에게도 매력적인 투자처입니다. 하지만 미국 주식에 투자할 때는 주가 변동 외에 '환율 변동'이라는 또 다른 위험 요소를 고려해야 합니다. 환율은 당신의 투자 수익률에 직접적인 영향을 미치므로, 환율의 움직임을 이해하고 이에 현명하게 대처하는 전략을 세우는 것이 중요합니다. 이 가이드를 통해 환율 변동에 따른 미국 주식 투자 전략을 파악하고, 당신의 투자 수익을 극대화하세요.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Globe className="w-6 h-6" />
                환율 변동, 미국 주식 투자에 미치는 영향
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>환율 상승 (원화 가치 하락):</strong> 달러 강세는 미국 주식 매도 시 '환차익'을 발생시켜 투자 수익률을 높입니다. 하지만 미국 주식 매수 시에는 더 많은 원화가 필요하므로 매수 부담이 커집니다.
                </li>
                <li>
                  <strong>환율 하락 (원화 가치 상승):</strong> 달러 약세는 미국 주식 매도 시 '환차손'을 발생시켜 투자 수익률을 낮춥니다. 하지만 미국 주식 매수 시에는 더 적은 원화가 필요하므로 매수 부담이 줄어듭니다.
                </li>
              </ul>
              <blockquote className="!border-l-blue-500 mt-6">
                <p>
                  <strong>예시:</strong> 1달러 = 1,200원일 때 100달러짜리 주식 1주를 12만원에 매수. <br />
                  주가 변동 없이 1달러 = 1,400원일 때 매도하면 14만원을 받아 2만원의 환차익 발생.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-green-500" />
                환율 변동에 대처하는 3가지 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 분할 매수/매도: 환율 변동 위험 분산
                  </h3>
                  <p className="!text-sm !my-0">
                    환율이 낮을 때 달러를 분할 매수하고, 환율이 높을 때 주식을 분할 매도하는 전략은 환율 변동 위험을 분산하고 평균 매입 단가를 낮추는 데 효과적입니다. '환율 예측'보다는 '환율 변동에 대한 대응'에 초점을 맞추세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 달러 예금/RP 활용: 환차익 노리기
                  </h3>
                  <p className="!text-sm !my-0">
                    환율이 낮을 때 달러를 매수하여 달러 예금이나 RP(환매조건부채권)에 넣어두고, 환율이 오르면 달러를 원화로 환전하여 환차익을 얻는 전략입니다. 미국 주식 투자와 병행하면 더욱 효과적입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 환헤지 상품 고려: 환율 위험 최소화
                  </h3>
                  <p className="!text-sm !my-0">
                    환헤지(Hedged)형 ETF나 펀드는 환율 변동에 따른 손익을 제거하여 주가 변동에만 집중할 수 있도록 돕습니다. 환율 변동에 대한 부담을 느끼는 투자자에게 적합합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 환율, 이것만은 기억하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>장기 투자:</strong> 단기적인 환율 변동에 일희일비하기보다는 장기적인 관점에서 투자하는 것이 중요합니다.
                </li>
                <li>
                  <strong>분산 투자:</strong> 환율 위험을 포함한 모든 투자 위험을 분산하기 위해 다양한 자산에 투자하세요.
                </li>
                <li>
                  <strong>정보 습득:</strong> 환율 관련 뉴스, 경제 지표 등을 꾸준히 확인하여 환율의 흐름을 이해하려는 노력이 필요합니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <DollarSign className="w-7 h-7 text-indigo-500" />
                당신의 투자 수익, 환율로부터 지키세요!
              </h2>
              <p>
                미국 주식 투자는 환율 변동이라는 또 하나의 기회이자 위험을 동반합니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 투자자가 되세요.
              </p>
              <Link
                href="/guides/exchange-rate-deep-dive"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                환율의 모든 것, 심층 분석 가이드 보기 💸
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
