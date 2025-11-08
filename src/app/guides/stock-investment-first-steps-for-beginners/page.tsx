
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, LineChart, Lightbulb, ShieldCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "주식 투자, 초보자를 위한 첫걸음: 계좌 개설부터 첫 매수까지 (2025년)",
  description:
    "'주식, 어렵지 않아요!' 주식 투자를 처음 시작하는 초보 투자자들을 위한 완벽 가이드. 주식의 기본 개념, 증권 계좌 개설 방법, 첫 투자 시 고려 사항, 그리고 초보 투자자들이 흔히 저지르는 실수와 예방책을 알려드립니다. 쉽고 안전하게 시작하세요.",
  openGraph: {
    title: "주식 투자, 초보자를 위한 첫걸음: 계좌 개설부터 첫 매수까지 (2025년)",
    description:
      "주식 투자, 더 이상 미루지 마세요. 초보자를 위한 쉽고 안전한 첫걸음을 Moneysalary가 함께합니다.",
    images: ["/api/og?title=주식 투자, 초보자 가이드"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주식 투자, 초보자를 위한 첫걸음: 계좌 개설부터 첫 매수까지 (2025년)",
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
    "주식의 기본 개념, 증권 계좌 개설 방법, 첫 투자 시 고려 사항, 그리고 초보 투자자들이 흔히 저지르는 실수와 예방책을 알려드립니다. 쉽고 안전하게 시작하세요.",
};

export default function StockInvestmentBeginnerGuidePage() {
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
            주식 투자,
            <br /> 초보자를 위한 첫걸음
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            '주식, 어렵지 않아요!' 재산 증식의 효과적인 수단인 주식 투자. 하지만 어디서부터 시작해야 할지 막막한 초보 투자자들을 위해, 주식의 기본 개념부터 계좌 개설, 첫 매수까지 쉽고 안전한 첫걸음을 안내합니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              주식 투자는 인플레이션을 헤지하고 자산을 증식시키는 가장 효과적인 방법 중 하나입니다. 하지만 '주식은 위험하다', '전문가만 하는 것이다'라는 편견 때문에 시작조차 하지 못하는 분들이 많습니다. 주식 투자는 복잡한 경제 지식이나 특별한 기술이 없어도 누구나 시작할 수 있습니다. 중요한 것은 기본적인 원리를 이해하고, 자신만의 투자 원칙을 세워 꾸준히 실천하는 것입니다. 이 가이드를 통해 주식 투자의 첫걸음을 쉽고 안전하게 내딛어 보세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                주식 투자, 왜 해야 할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>자산 증식:</strong> 예금 금리 이상의 수익률을 기대하며 자산을 불릴 수 있습니다.
                </li>
                <li>
                  <strong>인플레이션 헤지:</strong> 물가 상승으로 인한 화폐 가치 하락을 방어할 수 있습니다.
                </li>
                <li>
                  <strong>경제 공부:</strong> 기업과 산업, 거시 경제에 대한 이해를 높일 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <LineChart className="w-7 h-7 text-purple-500" />
                주식 투자, 초보자를 위한 3단계 로드맵
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 증권 계좌 개설: 투자의 시작
                  </h3>
                  <p className="!text-sm !my-0">
                    주식 투자를 위해서는 증권사 계좌가 필요합니다. 비대면 계좌 개설 앱을 통해 신분증만 있으면 5분 안에 쉽게 만들 수 있습니다. (증권사 선택 시 수수료, 이벤트, MTS/HTS 편의성 등을 고려하세요)
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 투자금 마련 및 원칙 설정: 여유 자금으로, 장기적인 관점
                  </h3>
                  <p className="!text-sm !my-0">
                    주식 투자는 반드시 '여유 자금'으로 해야 합니다. 단기적인 시세 변동에 일희일비하지 않고, 장기적인 관점에서 기업의 가치를 보고 투자하는 원칙을 세우세요. 처음에는 소액으로 시작하는 것이 좋습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 첫 매수: 우량 ETF부터 시작
                  </h3>
                  <p className="!text-sm !my-0">
                    개별 종목 투자가 어렵다면, S&P 500, 나스닥 100 등 시장 지수를 추종하는 ETF(상장지수펀드)부터 시작하는 것을 추천합니다. 소액으로 여러 기업에 분산 투자하는 효과를 얻을 수 있어 초보자에게 적합합니다.
                  </p>
                   <Link href="/guides/road-to-100m-part3-invest" className="text-sm text-blue-600 hover:underline">→ ETF 투자 가이드 보기</Link>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 초보 투자자들이 흔히 저지르는 실수
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>빚투 (빚내서 투자):</strong> 절대 금물! 여유 자금으로만 투자해야 합니다.
                </li>
                <li>
                  <strong>몰빵 투자:</strong> 한 종목에 모든 돈을 투자하는 것은 매우 위험합니다. 반드시 분산 투자하세요.
                </li>
                <li>
                  <strong>단기 시세 추종:</strong> 뉴스나 소문에 흔들려 단기적인 시세 차익을 노리는 것은 실패의 지름길입니다.
                </li>
                <li>
                  <strong>기업 분석 없이 투자:</strong> 자신이 투자하는 기업이 어떤 회사인지, 어떤 가치를 가지고 있는지 반드시 공부하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 성공적인 투자를 응원합니다!
              </h2>
              <p>
                주식 투자는 당신의 자산을 불리고 경제적 자유를 얻는 중요한 수단입니다. <br />
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
