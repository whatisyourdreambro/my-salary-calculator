import type { Metadata } from "next";
import Link from "next/link";
import { Globe, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "환율의 모든 것: 오르면 왜 수출에 유리하고 수입에 불리할까?",
  description:
    "뉴스에 매일 나오는 환율, 정확히 알고 계신가요? 달러-원 환율이 오르고 내리는 원리부터, 환율 변동이 수출/수입 기업과 우리 삶에 미치는 영향까지 완벽하게 설명해 드립니다.",
  openGraph: {
    title: "환율의 모든 것: 오르면 왜 수출에 유리하고 수입에 불리할까?",
    description:
      "환율, 더 이상 어려운 경제 용어가 아닙니다. 환율의 기본 원리를 이해하고 경제 뉴스를 꿰뚫어 보세요.",
    images: ["/api/og?title=환율, 오르면 왜 수출에 유리할까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "환율의 모든 것: 오르면 왜 수출에 유리하고 수입에 불리할까?",
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
    "달러-원 환율이 오르고 내리는 원리부터, 환율 변동이 수출/수입 기업과 우리 삶에 미치는 영향까지 완벽하게 설명해 드립니다.",
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
            환율, 오르면 정말
            <br /> 좋은 걸까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            "환율 상승, 수출 기업에 호재!" 뉴스에서 자주 듣는 말이지만, 그 의미를 정확히 알고 계신가요? 환율의 기본 원리부터 우리 경제에 미치는 영향까지, 더 이상 헷갈리지 않게 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-cyan-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              환율은 단순히 '외국 돈의 가격'이 아닙니다. 국가 경제의 기초 체력을 보여주는 거울이자, 수출입 기업의 운명을 좌우하고, 심지어 우리 장바구니 물가에도 영향을 미치는 중요한 경제 지표입니다. 환율의 작동 원리를 이해하면, 복잡한 경제 뉴스를 꿰뚫어 보는 눈을 가질 수 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-amber-500" />
                환율, 대체 뭔가요?
              </h2>
              <p>
                환율(Exchange Rate)은 한 나라의 돈을 다른 나라 돈으로 바꿀 때의 교환 비율을 의미합니다. 예를 들어, 미국 달러와 대한민국 원의 환율이 '1달러 = 1,300원'이라면, 1달러를 사기 위해 1,300원이 필요하다는 뜻입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-bold !mt-0 !mb-1 text-brand-red flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> 환율 상승 (원화 가치 하락)
                  </h3>
                  <p className="!text-sm !my-0">
                    1달러를 사기 위해 더 많은 원화(예: 1,400원)가 필요해진 상황. 원화의 힘이 약해졌다는 의미입니다.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold !mt-0 !mb-1 text-signature-blue flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" /> 환율 하락 (원화 가치 상승)
                  </h3>
                  <p className="!text-sm !my-0">
                    1달러를 사기 위해 더 적은 원화(예: 1,200원)가 필요한 상황. 원화의 힘이 강해졌다는 의미입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Globe className="w-7 h-7 text-green-500" />
                환율 상승, 왜 수출에 유리할까?
              </h2>
              <p>
                환율이 오르면(원화 가치가 하락하면) 왜 수출 기업이 웃게 될까요? 간단한 예시로 알아봅시다.
              </p>
              <blockquote className="!border-l-green-500">
                <p>
                  미국에 1만 달러짜리 자동차를 수출하는 한국 기업이 있다고 가정해봅시다.
                </p>
                <ul className="!my-4 space-y-2 text-base">
                  <li><strong>환율이 1,200원일 때:</strong> 1만 달러를 벌면 한국 돈으로 <strong>1,200만원</strong>이 됩니다.</li>
                  <li><strong>환율이 1,400원으로 오르면:</strong> 똑같이 1만 달러를 벌어도 한국 돈으로 <strong>1,400만원</strong>이 됩니다.</li>
                </ul>
                <p>
                  수출 기업 입장에서는 가만히 앉아서 200만원을 더 버는 셈입니다. 또한, 미국 시장에서 자동차 가격을 1만 달러보다 낮춰 팔 수 있는 여력이 생겨 가격 경쟁력이 높아집니다.
                </p>
              </blockquote>
              <p className="mt-4">
                반대로, 수입 기업은 울상이 됩니다. 1만 달러짜리 기계를 수입해야 한다면, 이전보다 200만원을 더 주고 사와야 하기 때문입니다. 이는 수입 물가 상승으로 이어져 결국 우리 소비자들의 부담을 가중시키는 요인이 됩니다.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                환율 변동, 내 자산에는 어떤 영향이?
              </h2>
              <p>
                환율은 해외 주식 투자, 해외 여행 등 우리 삶 곳곳에 영향을 미칩니다. <br />
                환율 변동이 내 자산에 미치는 영향에 대해 더 자세히 알아보세요.
              </p>
              <Link
                href="/guides/exchange-rate-impact"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                환율이 내 월급에 미치는 영향 알아보기 💸
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}