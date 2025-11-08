
import type { Metadata } from "next";
import Link from "next/link";
import { LineChart, DollarSign, Lightbulb, Repeat } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "적립식 투자, 복리의 마법을 극대화하는 법: 꾸준함이 부자를 만든다! (2025년)",
  description:
    "주식 시장의 변동성에 흔들리지 않고 꾸준히 자산을 불려나가고 싶은 투자자들을 위한 최고의 전략, 적립식 투자! 적립식 투자의 기본 개념, 장점, 그리고 복리 효과를 극대화하는 방법을 상세히 알려드립니다. 초보 투자자도 쉽게 따라 할 수 있는 실천 팁으로 당신의 자산을 현명하게 불리세요.",
  openGraph: {
    title: "적립식 투자, 복리의 마법을 극대화하는 법: 꾸준함이 부자를 만든다! (2025년)",
    description:
      "적립식 투자, 더 이상 어렵지 않습니다. 꾸준함으로 복리의 마법을 경험하고 당신의 경제적 자유를 앞당기세요.",
    images: ["/api/og?title=적립식 투자, 복리의 마법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "적립식 투자, 복리의 마법을 극대화하는 법: 꾸준함이 부자를 만든다! (2025년)",
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
    "적립식 투자의 기본 개념, 장점, 그리고 복리 효과를 극대화하는 방법을 상세히 알려드립니다. 초보 투자자도 쉽게 따라 할 수 있는 실천 팁으로 당신의 자산을 현명하게 불리세요.",
};

export default function DollarCostAveragingGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-600 dark:from-gray-900 dark:to-green-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            적립식 투자,
            <br /> 복리의 마법을 극대화하는 법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            주식 시장의 변동성에 흔들리지 않고 꾸준히 자산을 불려나가고 싶은 투자자들을 위한 최고의 전략, 적립식 투자! 꾸준함으로 복리의 마법을 경험하고 당신의 경제적 자유를 앞당기세요.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              적립식 투자(Dollar-Cost Averaging)는 매월 또는 일정 기간마다 정해진 금액을 꾸준히 투자하는 전략입니다. 주식 시장의 등락에 관계없이 꾸준히 투자함으로써 평균 매입 단가를 낮추고, 장기적으로 복리 효과를 극대화할 수 있다는 장점이 있습니다. 특히 투자 경험이 적거나 시장 예측이 어려운 초보 투자자들에게 매우 효과적인 투자 방법입니다. 이 가이드를 통해 적립식 투자의 모든 것을 파악하고, 당신의 자산을 현명하게 불리세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <LineChart className="w-6 h-6" />
                적립식 투자, 왜 효과적일까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>평균 매입 단가 하락:</strong> 주가가 높을 때는 적게 사고, 주가가 낮을 때는 많이 사게 되어 평균 매입 단가를 낮추는 효과가 있습니다.
                </li>
                <li>
                  <strong>복리 효과 극대화:</strong> 꾸준한 투자를 통해 투자 원금과 수익이 함께 불어나면서 복리의 마법을 경험할 수 있습니다.
                </li>
                <li>
                  <strong>심리적 안정:</strong> 시장의 단기적인 변동성에 일희일비하지 않고, 장기적인 관점에서 꾸준히 투자할 수 있어 심리적 안정감을 줍니다.
                </li>
                <li>
                  <strong>시간 절약:</strong> 매번 시장 상황을 분석하고 매수 타이밍을 잡는 데 시간을 낭비할 필요가 없습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Repeat className="w-7 h-7 text-purple-500" />
                적립식 투자, 복리의 마법을 극대화하는 3단계 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '투자 목표'와 '기간' 설정
                  </h3>
                  <p className="!text-sm !my-0">
                    언제까지 얼마의 자산을 모으고 싶은지 구체적인 목표를 설정하세요. 목표가 명확할수록 꾸준히 투자할 수 있는 동기 부여가 됩니다. 적립식 투자는 최소 5년 이상의 장기적인 관점에서 접근하는 것이 좋습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '우량 자산'에 꾸준히 투자
                  </h3>
                  <p className="!text-sm !my-0">
                    개별 종목보다는 S&P 500, 나스닥 100 등 시장 지수를 추종하는 ETF나 우량 성장주에 투자하는 것을 추천합니다. 장기적으로 우상향하는 자산에 꾸준히 투자하는 것이 복리 효과를 극대화하는 핵심입니다.
                  </p>
                   <Link href="/guides/etf-investment-from-stock-selection-to-trading-strategy" className="text-sm text-blue-600 hover:underline">→ ETF 투자 가이드 보기</Link>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '자동 투자' 설정: 감정을 배제하라
                  </h3>
                  <p className="!text-sm !my-0">
                    매월 일정 금액을 자동으로 투자하도록 설정하세요. 시장의 등락에 따라 감정적으로 매매하는 것을 방지하고, 꾸준히 투자 원칙을 지킬 수 있도록 돕습니다. '사고, 잊어라'는 워렌 버핏의 명언을 기억하세요.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 적립식 투자, 이것만은 주의하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>중도 해지:</strong> 적립식 투자는 장기적인 관점에서 복리 효과를 노리는 전략입니다. 단기적인 수익률에 일희일비하여 중도 해지하는 것은 금물입니다.
                </li>
                <li>
                  <strong>무리한 투자:</strong> 반드시 여유 자금으로 투자해야 합니다. 빚을 내서 투자하거나, 생활비에 지장을 줄 정도의 무리한 투자는 피하세요.
                </li>
                <li>
                  <strong>기업 분석 소홀:</strong> ETF라고 해서 기업 분석이 필요 없는 것은 아닙니다. 자신이 투자하는 ETF가 어떤 종목으로 구성되어 있는지, 어떤 산업을 추종하는지 반드시 확인하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <DollarSign className="w-7 h-7 text-indigo-500" />
                당신의 자산을 현명하게 불리세요!
              </h2>
              <p>
                적립식 투자는 당신의 자산을 꾸준히 불리고, 경제적 자유를 얻는 중요한 수단입니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 투자자가 되세요.
              </p>
              <Link
                href="/guides/compound-interest"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                복리의 마법, 눈덩이 효과 가이드 보기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
