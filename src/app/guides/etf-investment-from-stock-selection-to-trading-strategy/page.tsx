
import type { Metadata } from "next";
import Link from "next/link";
import { LineChart, DollarSign, Lightbulb, TrendingUp, GitCompare, Globe } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "ETF 투자 완벽 가이드: SPY, VOO 비교부터 환헤지/환노출 전략까지",
  description:
    "ETF 투자, 이제 제대로 시작하세요! 대표 S&P 500 ETF(SPY, VOO, IVV) 비교, 환노출/환헤지 전략, 좋은 ETF 고르는 기준까지. 초보자를 위한 실전 ETF 투자 가이드.",
  openGraph: {
    title: "ETF 투자 완벽 가이드: SPY, VOO 비교부터 환헤지/환노출 전략까지",
    description:
      "ETF, 더 이상 어렵지 않습니다. 종목 선택부터 매매 전략까지, 당신의 성공적인 ETF 투자를 Moneysalary가 함께합니다.",
    images: ["/api/og?title=ETF 투자, 실전 완벽 가이드"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "ETF 투자 완벽 가이드: SPY, VOO 비교부터 환헤지/환노출 전략까지",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-04-25",
  dateModified: currentDate,
  description:
    "대표 S&P 500 ETF 비교, 환노출/환헤지 전략 등 실전 ETF 투자 방법을 상세히 알려드립니다.",
};

export default function EtfInvestmentGuidePage() {
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
            ETF 투자,
            <br /> 종목 선택부터 매매 전략까지
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            주식 투자가 어렵다면 ETF로 시작하세요! 분산 투자 효과와 낮은 수수료로 각광받는 ETF, 어떤 종목을 어떻게 사야 하는지 실전 팁을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              ETF(Exchange Traded Fund)는 특정 지수를 추종하는 인덱스 펀드를 주식처럼 실시간으로 사고팔 수 있게 만든 상품입니다. 소액으로도 수백 개 기업에 분산 투자하는 효과를 누릴 수 있어 '투자의 정석'으로 불립니다. 이 가이드에서는 좋은 ETF를 고르는 기준과 구체적인 투자 전략을 알아봅니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Lightbulb className="w-7 h-7 text-yellow-500" />
                좋은 ETF를 고르는 3가지 기준
              </h2>
              <ul className="!my-4 !p-0 space-y-2">
                <li><strong>1. 낮은 운용보수 (Expense Ratio):</strong> 장기 투자 시 수익률을 갉아먹는 가장 큰 적은 수수료입니다. 0.1% 이하, 가급적 0.05%에 가까운 ETF를 선택하세요.</li>
                <li><strong>2. 풍부한 거래량/자산 규모 (Volume/AUM):</strong> 거래가 활발하고 자산 규모가 커야 원할 때 쉽게 사고팔 수 있으며, 안정적인 운용이 가능합니다.</li>
                <li><strong>3. 낮은 추적오차 (Tracking Error):</strong> ETF가 추종하는 기초 지수의 움직임을 얼마나 정확하게 따라가는지를 나타냅니다. 추적오차가 낮을수록 좋은 ETF입니다.</li>
              </ul>
            </section>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <GitCompare className="w-6 h-6" />
                대표 S&P 500 ETF 전격 비교: SPY vs IVV vs VOO
              </h2>
              <p className="!text-sm !my-2">S&P 500 지수를 추종하는 대표 ETF 3대장입니다. 모두 훌륭한 ETF지만, 장기 투자자라면 운용보수를 가장 먼저 고려해야 합니다.</p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr><th className="p-2 font-semibold">구분</th><th className="p-2 font-semibold">SPY</th><th className="p-2 font-semibold">IVV</th><th className="p-2 font-semibold">VOO</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-600">
                      <td className="p-2 font-bold">운용사</td><td className="p-2">State Street</td><td className="p-2">BlackRock</td><td className="p-2">Vanguard</td>
                    </tr>
                    <tr className="border-b dark:border-gray-600">
                      <td className="p-2 font-bold">운용보수</td><td className="p-2">0.09%</td><td className="p-2">0.03%</td><td className="p-2">0.03%</td>
                    </tr>
                     <tr className="border-b dark:border-gray-600">
                      <td className="p-2 font-bold">특징</td><td className="p-2">최초의 ETF, 거래량 1위</td><td className="p-2">낮은 보수, 높은 신뢰도</td><td className="p-2">낮은 보수, 투자자 친화적</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <blockquote className="!border-l-blue-500 !mt-4 !text-base">
                <strong>결론:</strong> 단기 트레이더가 아니라면, 운용보수가 가장 저렴한 <strong>IVV 또는 VOO</strong>를 장기 적립식으로 모아가는 것이 가장 현명한 선택입니다.
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Globe className="w-7 h-7 text-green-500" />
                환노출 vs 환헤지, 그것이 문제로다
              </h2>
              <p>해외 ETF 투자 시 반드시 결정해야 할 문제입니다. 환율 변동에 내 투자를 맡길 것인지, 아니면 환율 변동 위험을 없앨 것인지 선택해야 합니다.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">환노출 (기본)</h3>
                  <p className="!text-sm !my-0">
                    주가와 환율 변동에 모두 영향을 받습니다. 달러 가치가 오르면(환율 상승) 추가 수익(환차익)을 얻을 수 있습니다. 장기적으로 달러는 안전자산으로 취급받기에, 경제 위기 시 자산을 방어하는 효과도 있습니다. <strong>장기 투자자에게 일반적으로 추천됩니다.</strong>
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-red-700 dark:text-red-300">환헤지 (H)</h3>
                  <p className="!text-sm !my-0">
                    환율 변동 위험을 없앤 상품입니다. 오직 기초 지수의 성과에만 집중하고 싶을 때 선택합니다. 단, 환율을 고정하는 '헤지 비용'이 발생하여 장기 수익률이 다소 감소할 수 있고, 환차익을 얻을 기회도 사라집니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                나만의 ETF 포트폴리오 만들기
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                이제 ETF를 고르는 눈이 생겼다면, 여러 ETF를 조합하여 당신만의 맞춤 포트폴리오를 만들 차례입니다. 위험은 낮추고 수익은 극대화하는 자산 배분 전략을 알아보세요.
              </p>
              <Link
                href="/guides/portfolio-construction-creating-my-own-investment-strategy"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                포트폴리오 구성하러 가기 📊
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
