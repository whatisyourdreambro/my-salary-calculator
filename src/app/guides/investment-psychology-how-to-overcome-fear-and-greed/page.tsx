
import type { Metadata } from "next";
import Link from "next/link";
import { Brain, TrendingDown, TrendingUp, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "투자 심리, 공포와 탐욕을 이기는 법: 워렌 버핏처럼 투자하라! (2025년)",
  description:
    "'남들이 탐욕을 부릴 때 공포를 느끼고, 남들이 공포를 느낄 때 탐욕을 부려라.' 워렌 버핏의 명언처럼 투자 성공의 핵심은 심리 관리입니다. 투자자들이 흔히 겪는 공포와 탐욕이라는 감정적 함정을 분석하고, 이를 극복하여 합리적인 투자 결정을 내릴 수 있는 심리 관리 전략을 알려드립니다.",
  openGraph: {
    title: "투자 심리, 공포와 탐욕을 이기는 법: 워렌 버핏처럼 투자하라! (2025년)",
    description:
      "투자는 심리 게임입니다. 공포와 탐욕을 이기고 당신의 투자 수익을 극대화하세요.",
    images: ["/api/og?title=투자 심리, 공포와 탐욕"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "투자 심리, 공포와 탐욕을 이기는 법: 워렌 버핏처럼 투자하라! (2025년)",
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
    "투자자들이 흔히 겪는 공포와 탐욕이라는 감정적 함정을 분석하고, 이를 극복하여 합리적인 투자 결정을 내릴 수 있는 심리 관리 전략을 알려드립니다.",
};

export default function InvestmentPsychologyGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-red-500 to-orange-600 dark:from-gray-900 dark:to-red-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            투자 심리,
            <br /> 공포와 탐욕을 이기는 법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-orange-100 dark:text-gray-300">
            '남들이 탐욕을 부릴 때 공포를 느끼고, 남들이 공포를 느낄 때 탐욕을 부려라.' 워렌 버핏의 명언처럼 투자 성공의 핵심은 심리 관리입니다. 공포와 탐욕을 이기고 합리적인 투자 결정을 내리는 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-orange-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              투자는 단순히 기업 분석이나 차트 분석을 넘어, 투자자의 심리가 큰 영향을 미치는 영역입니다. 시장의 등락에 따라 투자자들은 공포와 탐욕이라는 극단적인 감정에 휩싸여 비합리적인 결정을 내리곤 합니다. 하지만 성공적인 투자자들은 이러한 감정적 함정을 극복하고, 자신만의 투자 원칙을 지키며 꾸준히 수익을 창출합니다. 이 가이드를 통해 투자 심리의 모든 것을 파악하고, 공포와 탐욕을 이기는 현명한 투자자가 되세요.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <Brain className="w-6 h-6" />
                투자 심리, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>비합리적인 결정 방지:</strong> 감정에 휩싸여 고점에서 매수하고 저점에서 매도하는 실수를 방지할 수 있습니다.
                </li>
                <li>
                  <strong>투자 원칙 유지:</strong> 시장의 등락에도 불구하고 자신만의 투자 원칙을 지키며 꾸준히 투자할 수 있습니다.
                </li>
                <li>
                  <strong>장기적인 수익률 향상:</strong> 심리 관리를 통해 불필요한 손실을 줄이고, 장기적인 관점에서 안정적인 수익률을 추구할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <TrendingDown className="w-7 h-7 text-purple-500" />
                투자자들이 흔히 겪는 감정적 함정
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 공포 (Fear)
                  </h3>
                  <p className="!text-sm !my-0">
                    주가가 하락할 때 손실에 대한 두려움으로 매도하거나, 좋은 기업의 주식임에도 불구하고 매수하지 못하는 심리입니다. '패닉 셀링'의 주범입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 탐욕 (Greed)
                  </h3>
                  <p className="!text-sm !my-0">
                    주가가 상승할 때 더 큰 수익을 얻기 위해 무리하게 투자하거나, 고점에서 추격 매수하는 심리입니다. '묻지마 투자'의 주범입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 군중 심리 (Herd Mentality)
                  </h3>
                  <p className="!text-sm !my-0">
                    다른 투자자들의 행동을 맹목적으로 따라 하는 심리입니다. 자신만의 투자 원칙 없이 남들을 따라 투자하면 실패할 확률이 높습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 공포와 탐욕을 이기는 3가지 전략
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>1. 자신만의 투자 원칙 수립:</strong> 투자 목표, 투자 기간, 위험 감수 수준 등을 명확히 정하고, 그 원칙을 지키세요. 원칙은 감정적인 결정을 막아주는 나침반 역할을 합니다.
                </li>
                <li>
                  <strong>2. 분산 투자:</strong> 한 종목에 모든 돈을 투자하기보다는 여러 종목, 여러 자산에 분산 투자하여 위험을 줄이세요. 이는 심리적인 안정감을 높여줍니다.
                </li>
                <li>
                  <strong>3. 장기적인 관점 유지:</strong> 단기적인 시장 변동에 일희일비하지 말고, 장기적인 관점에서 기업의 가치를 보고 투자하세요. 시간은 당신의 편입니다.
                  <Link href="/guides/compound-interest" className="text-sm text-yellow-800 hover:underline">→ 복리의 마법, 눈덩이 효과 가이드 보기</Link>
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                당신의 성공적인 투자를 응원합니다!
              </h2>
              <p>
                투자는 심리 게임입니다. 공포와 탐욕을 이기고 합리적인 투자 결정을 내린다면 <br />
                당신은 분명 성공적인 투자자가 될 수 있습니다.
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
