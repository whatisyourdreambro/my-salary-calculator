import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Plane, ShoppingCart, BarChart2 } from "lucide-react";

export const metadata: Metadata = {
  title: "환율, 내 월급과 자산의 가치를 결정하는 보이지 않는 손 (2025년)",
  description:
    "환율이란 무엇일까요? 환율 상승과 하락이 해외여행, 직구, 주식 투자, 그리고 대한민국 경제에 미치는 영향을 가장 쉽게 설명하고, 환테크 전략까지 제시합니다.",
  openGraph: {
    title: "환율, 오르면 나에게 손해일까? 이득일까?",
    description:
      "해외여행, 직구, 미국 주식 투자자 필독! 환율의 모든 것을 파헤쳐 드립니다.",
    images: [
      "/api/og?title=환율, 내 자산의 가치를 결정한다&description=환율의 모든 것 A to Z",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "환율, 내 월급과 자산의 가치를 결정하는 보이지 않는 손 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-10-05",
  dateModified: "2025-10-05",
  description:
    "환율의 정의부터 환율 변동이 해외여행, 직구, 투자, 경제에 미치는 영향까지, 직장인이 꼭 알아야 할 환율의 모든 것을 알려드립니다.",
};

export default function ExchangeRateImpactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-blue-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            환율, 보이지 않는 손이
            <br /> <span className="text-blue-300">내 자산을 움직인다</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            뉴스에 매일 등장하지만 나와는 상관없는 이야기라고 생각했나요? 환율은
            당신의 해외여행 경비, 아이폰 가격, 그리고 미국 주식 수익률까지
            결정하는 가장 중요한 경제 지표입니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &apos;환율이 올랐다&apos;, &apos;원달러 환율 1,400원 돌파&apos;.
              경제 뉴스에서 가장 자주 접하는 말이지만, 대부분의 사람들은 이것이
              내 삶과 어떤 관련이 있는지 제대로 알지 못합니다. 환율은 국가 간
              돈의 교환 비율을 넘어, 당신의 실질적인 구매력과 자산 가치를
              결정하는 핵심 열쇠입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Globe className="w-7 h-7 text-signature-blue" />
                환율이란? (가장 쉬운 정의)
              </h2>
              <p>
                환율(Exchange Rate)은 말 그대로{" "}
                <strong>
                  &apos;한 나라의 돈을 다른 나라 돈으로 바꿀 때의 교환
                  비율&apos;
                </strong>
                입니다. 예를 들어, 원/달러 환율이 1,400원이라는 것은 미국 돈
                1달러를 사기 위해 우리 돈 1,400원이 필요하다는 의미입니다.
              </p>
              <blockquote>
                <p>
                  <strong>환율 상승 (원화 가치 하락):</strong> 1달러를 사는데 더
                  많은 원화(1,300원 → 1,400원)가 필요해진 상황. 해외 물건을 사기
                  비싸집니다.
                  <br />
                  <strong>환율 하락 (원화 가치 상승):</strong> 1달러를 사는데 더
                  적은 원화(1,400원 → 1,300원)가 필요한 상황. 해외 물건을 사기
                  저렴해집니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Plane className="w-7 h-7 text-cyan-500" />
                환율 상승, 내 삶에 미치는 영향
              </h2>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    해외여행객 (울상)
                  </h3>
                  <p className="!my-0 !text-base">
                    같은 100달러짜리 호텔을 예약해도 더 많은 원화를 내야 합니다.
                    현지에서 사용하는 모든 비용이 비싸져 여행 경비 부담이
                    커집니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    수입품 (가격 인상)
                  </h3>
                  <p className="!my-0 !text-base">
                    아이폰, 테슬라, 명품 등 해외에서 수입하는 모든 물건의 원가가
                    비싸져 국내 판매 가격이 인상될 가능성이 높습니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" />
                    미국 주식 투자자 (웃음 + 고민)
                  </h3>
                  <p className="!my-0 !text-base">
                    보유한 달러 자산의 가치가 원화로 환산했을 때 자동으로
                    불어납니다(환차익). 하지만 새로 주식을 사기에는 부담이
                    커지는 시기입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">환율, 위기인가 기회인가?</h2>
              <p>
                환율 변동은 누군가에게는 위기이지만, 그 원리를 아는 사람에게는
                새로운 기회가 될 수 있습니다. 당신의 연봉과 자산을 지키고 불리는
                가장 기본적인 경제 상식, 바로 환율에서 시작됩니다.
              </p>
              <Link
                href="/glossary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                더 많은 금융 용어 알아보기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
