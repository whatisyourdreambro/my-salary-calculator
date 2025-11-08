import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, TrendingUp, ShoppingCart, Plane } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "환율 변동, 내 월급의 진짜 가치를 바꾸다 (해외 투자자 필독)",
  description:
    "환율 1,300원 시대, 내 월급은 괜찮을까? 환율 변동이 해외 주식 투자 수익률, 해외 직구, 여행 경비에 미치는 영향을 분석하고 당신의 실질 소득을 지키는 방법을 알려드립니다.",
  openGraph: {
    title: "환율 변동, 내 월급의 진짜 가치를 바꾸다 (해외 투자자 필독)",
    description:
      "환율이 오르면 내 미국 주식 수익률은? 해외 직구 비용은? 환율이 당신의 지갑에 미치는 영향을 지금 바로 확인하세요.",
    images: ["/api/og?title=환율 변동, 내 월급의 진짜 가치"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "환율 변동, 내 월급의 진짜 가치를 바꾸다 (해외 투자자 필독)",
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
    "환율 변동이 해외 주식 투자 수익률, 해외 직구, 여행 경비에 미치는 영향을 분석하고 당신의 실질 소득을 지키는 방법을 알려드립니다.",
};

export default function ExchangeRateImpactGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-orange-400 to-red-500 dark:from-gray-900 dark:to-orange-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            환율 쇼크,
            <br /> 내 월급의 구매력을 바꾼다
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-red-100 dark:text-gray-300">
            원화로 월급 받는 우리에게 환율은 먼 나라 이야기일까요? 천만에요. 환율은 해외 주식 투자부터 아이폰 가격까지, 우리 지갑 사정 곳곳에 직접적인 영향을 미칩니다.
          </p>
          <p className="mt-4 text-xs text-red-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              월급은 그대로인데, 작년보다 해외여행 가는 게 부담스럽고, 사고 싶던 미국 주식은 더 비싸게 느껴진다면? 바로 '환율' 때문일 가능성이 높습니다. 환율 변동은 원화(KRW)로 표시된 내 월급의 실질적인 구매력을 결정하는 중요한 요소입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-green-500" />
                환율 상승기: 해외 투자자는 웃는다 (환차익의 마법)
              </h2>
              <p>
                미국 주식에 투자하는 '서학개미'에게 환율 상승은 주가 하락을 방어해주는 든든한 방패막이 될 수 있습니다. 이를 <strong>환차익</strong>이라고 합니다.
              </p>
              <blockquote className="!border-l-green-500">
                <p>
                  1년 전, <strong>환율이 1,200원일 때</strong> 100달러짜리 미국 주식 10주(총 1,000달러)를 <strong>120만원</strong>을 주고 샀다고 가정해봅시다.
                </p>
                <p>
                  1년 후, 주가는 그대로 100달러인데 <strong>환율이 1,400원으로 올랐다면?</strong><br />
                  내가 가진 주식의 가치는 1,000달러 × 1,400원/달러 = <strong>140만원</strong>이 됩니다. 주가는 오르지 않았지만, 환율 덕분에 <strong>20만원의 수익</strong>이 발생한 것입니다. 이를 '환차익'이라고 합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <ShoppingCart className="w-7 h-7 text-brand-red" />
                환율 상승기: 수입품 소비자는 운다 (텅장 주의보)
              </h2>
              <p>
                반면, 해외에서 물건을 사거나 서비스를 이용하는 경우에는 정반대의 상황이 펼쳐집니다. 환율이 오르면 동일한 외화 가격의 상품이라도 우리가 지불해야 하는 원화 가격이 비싸지기 때문입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text flex items-center gap-2">
                    <Plane className="w-5 h-5" /> 해외여행
                  </h3>
                  <p className="!text-sm !my-0">
                    1,000달러 예산의 미국 여행. 환율이 1,200원일 땐 120만원이면 충분했지만, 1,400원으로 오르면 140만원이 필요합니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text flex items-center gap-2">
                    <img src="/apple-icon.svg" className="w-5 h-5" alt="apple icon"/> 아이폰 직구
                  </h3>
                  <p className="!text-sm !my-0">
                    999달러짜리 아이폰. 환율이 1,200원일 땐 약 120만원이지만, 1,400원이면 약 140만원을 줘야 살 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Wallet className="w-7 h-7 text-indigo-500" />
                변동성을 기회로, 내 자산 관리 전략은?
              </h2>
              <p>
                환율 변동은 위기이자 기회입니다. 환율의 원리를 이해하면 변동성을 이용해 자산을 더욱 효과적으로 관리할 수 있습니다. <br />
                환율과 투자의 관계에 대해 더 깊이 알아보세요.
              </p>
              <Link
                href="/guides/first-job-investment"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                사회초년생 재테크 가이드 바로가기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}