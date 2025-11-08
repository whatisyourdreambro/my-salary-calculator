
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, PiggyBank, LineChart, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "배당주 투자, 월세처럼 따박따박 받는 법: 안정적인 현금 흐름 만들기 (2025년)",
  description:
    "은퇴 후 안정적인 현금 흐름을 원한다면? 배당주 투자가 답입니다. 배당주의 기본 개념, 고배당주 선택 기준, 배당 포트폴리오 구축 방법, 그리고 배당 소득에 대한 세금 처리 등을 상세히 알려드립니다. 월세처럼 꾸준히 배당금을 받을 수 있는 전략으로 당신의 노후를 든든하게 만드세요.",
  openGraph: {
    title: "배당주 투자, 월세처럼 따박따박 받는 법: 안정적인 현금 흐름 만들기 (2025년)",
    description:
      "배당주 투자, 더 이상 어렵지 않습니다. 월세처럼 꾸준히 받는 배당금으로 당신의 경제적 자유를 앞당기세요.",
    images: ["/api/og?title=배당주 투자, 월세처럼 받기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "배당주 투자, 월세처럼 따박따박 받는 법: 안정적인 현금 흐름 만들기 (2025년)",
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
    "배당주의 기본 개념, 고배당주 선택 기준, 배당 포트폴리오 구축 방법, 그리고 배당 소득에 대한 세금 처리 등을 상세히 알려드립니다. 월세처럼 꾸준히 배당금을 받을 수 있는 전략으로 당신의 노후를 든든하게 만드세요.",
};

export default function DividendStockInvestmentGuidePage() {
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
            배당주 투자,
            <br /> 월세처럼 따박따박 받는 법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            은퇴 후 안정적인 현금 흐름을 원한다면? 배당주 투자가 답입니다. 월세처럼 꾸준히 배당금을 받을 수 있는 전략으로 당신의 경제적 자유를 앞당기세요.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              배당주 투자는 기업이 벌어들인 이익의 일부를 주주들에게 현금으로 돌려주는 '배당금'을 목적으로 하는 투자 방식입니다. 주가 상승을 통한 시세 차익뿐만 아니라, 꾸준한 배당금 지급을 통해 안정적인 현금 흐름을 만들 수 있어 은퇴 후 생활비 마련이나 패시브 인컴을 원하는 투자자들에게 특히 매력적입니다. 이 가이드를 통해 배당주 투자의 모든 것을 파악하고, 당신의 경제적 자유를 앞당기세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                배당주 투자, 왜 매력적일까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>안정적인 현금 흐름:</strong> 주가 변동과 관계없이 꾸준히 배당금을 받을 수 있어 안정적인 생활비 마련에 도움이 됩니다.
                </li>
                <li>
                  <strong>복리 효과 극대화:</strong> 받은 배당금을 재투자하여 주식 수를 늘리면 복리 효과를 극대화할 수 있습니다.
                </li>
                <li>
                  <strong>기업의 성장 공유:</strong> 배당금을 꾸준히 지급하는 기업은 재무적으로 안정적이고 성장 가능성이 높은 경우가 많습니다.
                </li>
                <li>
                  <strong>인플레이션 헤지:</strong> 배당금은 물가 상승에 따라 함께 증가하는 경향이 있어 인플레이션 헤지 효과가 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <LineChart className="w-7 h-7 text-purple-500" />
                고배당주 선택부터 배당 포트폴리오 구축까지, 3단계 가이드
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '꾸준한 배당'과 '성장 가능성'을 동시에
                  </h3>
                  <p className="!text-sm !my-0">
                    단순히 배당 수익률이 높은 종목보다는, 꾸준히 배당금을 지급하고 배당금을 늘려나가는 기업을 선택하는 것이 중요합니다. 또한, 기업의 재무 건전성과 성장 가능성을 함께 고려하여 장기적인 관점에서 투자하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '배당 포트폴리오' 구축: 분산 투자는 필수
                  </h3>
                  <p className="!text-sm !my-0">
                    한 종목에 집중 투자하기보다는 여러 산업, 여러 국가의 배당주에 분산 투자하여 위험을 줄이세요. 배당주 ETF를 활용하면 소액으로도 쉽게 분산 투자가 가능합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '배당금 재투자'로 복리 효과 극대화
                  </h3>
                  <p className="!text-sm !my-0">
                    받은 배당금을 소비하지 않고 다시 투자하여 주식 수를 늘리면 복리 효과를 극대화할 수 있습니다. 이는 장기적으로 당신의 자산을 기하급수적으로 불려나가는 가장 강력한 방법입니다.
                  </p>
                   <Link href="/guides/compound-interest" className="text-sm text-blue-600 hover:underline">→ 복리의 마법, 눈덩이 효과 가이드 보기</Link>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 배당주 투자, 이것만은 주의하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>배당 함정:</strong> 단순히 배당 수익률이 높다고 해서 무조건 좋은 종목은 아닙니다. 기업의 재무 건전성과 성장 가능성을 함께 고려해야 합니다.
                </li>
                <li>
                  <strong>배당락:</strong> 배당금을 받을 권리가 사라지는 날(배당락일)에는 주가가 하락하는 경향이 있습니다. 단기적인 시세 변동에 주의하세요.
                </li>
                <li>
                  <strong>세금:</strong> 배당 소득에 대해서는 배당소득세(15.4%)가 원천징수됩니다. ISA 계좌를 활용하면 절세 혜택을 받을 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <PiggyBank className="w-7 h-7 text-indigo-500" />
                당신의 경제적 자유를 앞당기세요!
              </h2>
              <p>
                배당주 투자는 당신의 자산을 불리고 안정적인 현금 흐름을 만드는 중요한 수단입니다. <br />
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
