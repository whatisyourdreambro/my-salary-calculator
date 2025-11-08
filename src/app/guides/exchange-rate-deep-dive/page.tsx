
import type { Metadata } from "next";
import Link from "next/link";
import { Globe, TrendingUp, TrendingDown, HelpCircle, Brain } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "환율 완벽 이해: 해외 투자자를 위한 환율 변동 대처법",
  description:
    "미국 주식 투자자 필독! 달러-원 환율이 오르고 내리는 핵심 원인 3가지(금리, 무역수지, 경제위기)를 이해하고, 환율 변동이 내 투자 수익률에 미치는 영향을 분석하여 현명한 투자 전략을 세워보세요.",
  openGraph: {
    title: "환율 완벽 이해: 해외 투자자를 위한 환율 변동 대처법",
    description:
      "환율, 더 이상 어려운 경제 용어가 아닙니다. 환율의 기본 원리를 이해하고 당신의 해외 투자 수익률을 지키세요.",
    images: ["/api/og?title=환율 완벽 이해: 해외 투자자 필독"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "환율 완벽 이해: 해외 투자자를 위한 환율 변동 대처법",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-06-01",
  dateModified: currentDate,
  description:
    "환율 변동의 핵심 원인 3가지를 이해하고, 환율 변동이 투자 수익률에 미치는 영향을 분석하여 현명한 투자 전략을 세우는 법을 알려드립니다.",
};

export default function ExchangeRateDeepDiveGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-gray-900 dark:to-teal-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            환율 완벽 이해:
            <br /> 해외 투자자 필독 가이드
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            미국 주식에 투자했는데, 왜 환율 때문에 수익률이 달라질까요? 환율의 기본 원리부터 내 투자 자산을 지키는 전략까지, 해외 투자자라면 반드시 알아야 할 모든 것을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-cyan-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              환율은 단순히 '외국 돈의 가격'이 아닙니다. 해외 투자를 할 때, 나의 최종 수익률을 결정하는 매우 중요한 변수입니다. 환율의 작동 원리를 이해하면, 복잡한 경제 뉴스를 꿰뚫어 보고, 더 현명한 투자 결정을 내릴 수 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-amber-500" />
                환율 상승 vs 하락, 개념부터 잡기
              </h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-bold !mt-0 !mb-1 text-brand-red flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> 환율 상승 (원화 가치 하락)
                  </h3>
                  <p className="!text-sm !my-0">
                    <strong>1달러 = 1,300원 → 1,400원</strong><br/>
                    1달러를 사기 위해 더 많은 원화가 필요한 상황. 원화의 힘이 약해졌다는 의미입니다.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold !mt-0 !mb-1 text-signature-blue flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" /> 환율 하락 (원화 가치 상승)
                  </h3>
                  <p className="!text-sm !my-0">
                    <strong>1달러 = 1,300원 → 1,200원</strong><br/>
                    1달러를 사기 위해 더 적은 원화가 필요한 상황. 원화의 힘이 강해졌다는 의미입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Brain className="w-7 h-7 text-purple-500" />
                환율은 왜 매일 변동할까? (핵심 요인 3가지)
              </h2>
              <ol className="!my-4 space-y-3 text-base !p-0">
                <li className="p-4 border-l-4 border-purple-300"><strong>1. 금리 차이:</strong> 미국 금리가 한국보다 높으면, 더 높은 이자를 주는 달러의 매력이 커져 달러가 강세(환율 상승)가 됩니다. 전 세계 돈이 미국으로 몰리는 현상입니다.</li>
                <li className="p-4 border-l-4 border-purple-300"><strong>2. 무역수지:</strong> 한국이 수출을 잘해서 달러를 많이 벌어들이면(무역수지 흑자), 시중에 달러 공급이 늘어나 달러가 약세(환율 하락)가 됩니다.</li>
                <li className="p-4 border-l-4 border-purple-300"><strong>3. 글로벌 경제 상황:</strong> 세계 경제가 불안해지면(전쟁, 금융위기 등), 가장 안전한 자산으로 여겨지는 달러에 돈이 몰리면서 달러가 강세(환율 상승)가 됩니다.</li>
              </ol>
            </section>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <Globe className="w-6 h-6" />
                그래서, 내 미국 주식 계좌에는 어떤 영향이?
              </h2>
              <blockquote className="!border-l-teal-500 !mt-4 !text-base bg-white dark:bg-gray-800 p-4 rounded">
                <p className="font-bold !mt-0">1,000달러짜리 미국 주식을 샀다고 가정해봅시다.</p>
                <ul className="!my-2 list-disc list-inside text-sm">
                    <li><strong>환율 상승기 (1,300원 → 1,400원):</strong> 주가가 그대로여도, 내 주식의 원화 가치는 130만원에서 140만원으로 오릅니다. <strong>환차익 발생!</strong></li>
                    <li><strong>환율 하락기 (1,300원 → 1,200원):</strong> 주가가 그대로여도, 내 주식의 원화 가치는 130만원에서 120만원으로 내립니다. <strong>환차손 발생!</strong></li>
                </ul>
              </blockquote>
              <p className="!my-2 text-base">
                이처럼 해외 투자는 '주가 변동'과 '환율 변동'이라는 두 가지 변수에 동시에 영향을 받습니다.
              </p>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                환율 변동, 어떻게 대처해야 할까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                환율 변동에 대처하는 가장 좋은 방법은 환율 자체를 이해하고, 내 투자 전략에 맞게 활용하는 것입니다. '환노출'과 '환헤지'의 개념을 배우고, 나에게 맞는 ETF를 선택하는 방법을 알아보세요.
              </p>
              <Link
                href="/guides/etf-investment-from-stock-selection-to-trading-strategy"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                ETF 환노출/환헤지 전략 가이드 보기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}