
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, ShieldCheck, LineChart, Globe } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "해외 채권 투자, 안정적인 수익 추구: 불확실성 시대의 대안 (2025년)",
  description:
    "주식 시장의 변동성에 지쳤다면? 해외 채권 투자는 안정적인 수익을 추구할 수 있는 매력적인 대안입니다. 해외 채권 투자의 기본 개념, 종류, 장단점, 그리고 투자 시 고려해야 할 위험과 수익률을 상세히 알려드립니다. 환율 변동에 대한 이해와 분산 투자의 중요성을 강조하여 당신의 포트폴리오를 든든하게 만드세요.",
  openGraph: {
    title: "해외 채권 투자, 안정적인 수익 추구: 불확실성 시대의 대안 (2025년)",
    description:
      "해외 채권 투자, 더 이상 어렵지 않습니다. 안정적인 수익과 분산 투자를 통해 당신의 자산을 지키세요.",
    images: ["/api/og?title=해외 채권 투자, 안정적인 수익"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "해외 채권 투자, 안정적인 수익 추구: 불확실성 시대의 대안 (2025년)",
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
    "해외 채권 투자의 기본 개념, 종류, 장단점, 그리고 투자 시 고려해야 할 위험과 수익률을 상세히 알려드립니다. 환율 변동에 대한 이해와 분산 투자의 중요성을 강조하여 당신의 포트폴리오를 든든하게 만드세요.",
};

export default function OverseasBondInvestmentGuidePage() {
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
            해외 채권 투자,
            <br /> 안정적인 수익 추구
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            주식 시장의 변동성에 지쳤다면? 해외 채권 투자는 안정적인 수익을 추구할 수 있는 매력적인 대안입니다. 해외 채권 투자의 모든 것을 파악하고, 당신의 포트폴리오를 든든하게 만드세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              해외 채권 투자는 국내 채권 투자와 달리 환율 변동이라는 추가적인 변수를 고려해야 하지만, 높은 금리와 분산 투자 효과를 통해 안정적인 수익을 추구할 수 있는 매력적인 투자처입니다. 특히 글로벌 경제의 불확실성이 커지는 시기에는 안전자산으로서의 채권의 가치가 더욱 부각됩니다. 이 가이드를 통해 해외 채권 투자의 모든 것을 파악하고, 당신의 포트폴리오를 든든하게 만드세요.
            </p>

            <section className="mt-12 bg-blue-500 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Globe className="w-6 h-6" />
                해외 채권 투자, 왜 매력적일까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>분산 투자 효과:</strong> 주식 등 다른 자산과 상관관계가 낮아 포트폴리오의 위험을 분산하는 데 효과적입니다.
                </li>
                <li>
                  <strong>환율 분산 효과:</strong> 달러 등 외화로 투자하므로, 환율 변동에 따른 위험을 분산하고 환차익을 기대할 수 있습니다.
                </li>
                <li>
                  <strong>안정적인 이자 수익:</strong> 채권은 만기까지 보유하면 약정된 이자를 받을 수 있어 안정적인 현금 흐름을 제공합니다.
                </li>
                <li>
                  <strong>높은 금리:</strong> 국내 채권보다 높은 금리를 제공하는 해외 채권도 많아 더 높은 수익률을 기대할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <LineChart className="w-7 h-7 text-green-500" />
                해외 채권 투자, 3단계 가이드
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '나의 투자 목표'에 맞는 채권 종류 선택
                  </h3>
                  <p className="!text-sm !my-0">
                    국채, 회사채, 하이일드 채권 등 다양한 해외 채권 중 자신의 투자 목표(안정성 vs 수익성)와 위험 감수 수준에 맞는 것을 선택하세요. 신용 등급이 높은 선진국 국채는 안정적이지만 수익률이 낮고, 신흥국 채권이나 하이일드 채권은 수익률이 높지만 위험도 높습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '환율 변동'에 대한 이해와 전략
                  </h3>
                  <p className="!text-sm !my-0">
                    해외 채권은 환율 변동에 따라 수익률이 달라질 수 있습니다. 환율이 낮을 때 투자하고, 환율이 높을 때 매도하는 것이 유리하지만, 환율 예측은 어렵습니다. 환헤지 상품을 고려하거나, 분할 매수/매도를 통해 위험을 분산하는 전략을 활용하세요.
                  </p>
                   <Link href="/guides/us-stock-investment-how-to-deal-with-exchange-rate-fluctuations" className="text-sm text-blue-600 hover:underline">→ 미국 주식 환율 변동 대처법 보기</Link>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '분산 투자'로 위험 최소화
                  </h3>
                  <p className="!text-sm !my-0">
                    한 국가나 한 기업의 채권에 집중 투자하기보다는 여러 국가, 여러 기업의 채권에 분산 투자하여 위험을 줄이세요. 채권 ETF를 활용하면 소액으로도 쉽게 분산 투자가 가능합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 해외 채권 투자, 이것만은 주의하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>신용 위험:</strong> 채권을 발행한 국가나 기업이 부도날 경우 원리금을 돌려받지 못할 수 있습니다. 반드시 신용 등급을 확인하세요.
                </li>
                <li>
                  <strong>금리 위험:</strong> 금리가 상승하면 채권 가격은 하락합니다. 금리 변동에 대한 이해가 필요합니다.
                </li>
                <li>
                  <strong>환율 위험:</strong> 환율 변동에 따라 수익률이 달라질 수 있습니다. 환헤지 여부를 신중하게 고려하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 포트폴리오를 든든하게 만드세요!
              </h2>
              <p>
                해외 채권 투자는 당신의 포트폴리오를 안정적으로 만들고, <br />
                장기적인 관점에서 자산을 불릴 수 있는 좋은 방법입니다.
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
