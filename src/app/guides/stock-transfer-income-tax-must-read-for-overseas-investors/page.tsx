
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, DollarSign, FileText, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "주식 양도소득세, 해외 주식 투자자 필독! 계산법과 절세 전략 (2025년)",
  description:
    "해외 주식 투자로 수익을 냈다면? 국내 주식과 다른 양도소득세 계산법, 신고 방법, 그리고 절세 전략을 알려드립니다. 2025년 세법 개정 내용을 반영하여 당신의 투자 수익을 세금으로부터 지키세요.",
  openGraph: {
    title: "주식 양도소득세, 해외 주식 투자자 필독! 계산법과 절세 전략 (2025년)",
    description:
      "해외 주식 투자, 세금까지 알아야 진짜 고수! 양도소득세의 모든 것을 파헤쳐봅니다.",
    images: ["/api/og?title=해외 주식 양도소득세, 필독!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주식 양도소득세, 해외 주식 투자자 필독! 계산법과 절세 전략 (2025년)",
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
    "해외 주식 투자 시 발생하는 양도소득세 계산법, 신고 방법, 그리고 절세 전략을 알려드립니다. 2025년 세법 개정 내용을 반영하여 당신의 투자 수익을 세금으로부터 지키세요.",
};

export default function StockTransferIncomeTaxGuidePage() {
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
            주식 양도소득세,
            <br /> 해외 주식 투자자 필독!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            해외 주식 투자로 달콤한 수익을 냈다면, 이제 세금 문제를 해결할 차례입니다. 국내 주식과는 다른 양도소득세 계산법과 신고 방법, 그리고 당신의 수익을 지키는 절세 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              국내 주식은 대주주가 아닌 이상 양도소득세가 비과세되지만, 해외 주식은 소액 투자자라도 수익이 발생하면 양도소득세를 신고하고 납부해야 합니다. 많은 해외 주식 투자자들이 이 사실을 모르거나 복잡하게 느껴져 세금 신고를 놓치는 경우가 많습니다. 하지만 양도소득세는 매년 5월에 반드시 신고해야 하는 중요한 세금입니다. 이 가이드를 통해 해외 주식 양도소득세의 모든 것을 파악하고, 당신의 소중한 투자 수익을 지키세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                해외 주식 양도소득세, 무엇이 다를까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>과세 대상:</strong> 국내 주식은 대주주만 과세되지만, 해외 주식은 소액 투자자라도 연간 250만원을 초과하는 양도차익에 대해 과세됩니다.
                </li>
                <li>
                  <strong>세율:</strong> 양도차익에 대해 20%의 단일 세율이 적용됩니다. (지방소득세 2% 별도, 총 22%)
                </li>
                <li>
                  <strong>신고 기간:</strong> 매년 1월 1일부터 12월 31일까지 발생한 양도차익에 대해 다음 해 5월 1일부터 31일까지 신고 및 납부해야 합니다.
                </li>
                <li>
                  <strong>기본 공제:</strong> 연간 250만원의 기본 공제가 적용됩니다. 여러 증권사를 이용하더라도 합산하여 250만원만 공제됩니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-500" />
                양도소득세 계산법과 신고 방법
              </h2>
              <p>
                해외 주식 양도소득세는 다음과 같이 계산됩니다.
              </p>
              <blockquote className="!border-l-blue-500 mt-6">
                <p>
                  <strong>(양도차익 총액 - 기본 공제 250만원) × 20% + 지방소득세 (양도소득세의 10%)</strong>
                </p>
                <p className="text-sm">
                  * 양도차익은 매도 금액에서 매수 금액, 거래 수수료, 증권거래세 등을 제외한 금액입니다.
                </p>
              </blockquote>
              <p className="mt-4">
                <strong>신고 방법:</strong> 국세청 홈택스(www.hometax.go.kr)를 통해 직접 신고하거나, 세무 대리인을 통해 신고할 수 있습니다. 증권사에서 제공하는 '양도소득세 대행 신고 서비스'를 이용하는 것이 가장 편리합니다.
              </p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 해외 주식 양도소득세 절세 전략
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>손익 통산 활용:</strong> 여러 종목에서 수익과 손실이 발생했다면, 손실을 수익에서 차감하여 양도차익을 줄일 수 있습니다. 연말에 손실 난 종목을 매도하여 세금을 줄이는 전략을 고려해볼 수 있습니다.
                </li>
                <li>
                  <strong>250만원 기본 공제 활용:</strong> 연간 250만원까지는 비과세이므로, 이 금액을 초과하지 않도록 매도 시점을 조절하는 것도 방법입니다.
                </li>
                <li>
                  <strong>배당주 투자:</strong> 해외 주식 배당금은 배당소득세(15.4%)가 원천징수되지만, 양도소득세와는 별개로 과세됩니다. 배당주 투자를 통해 안정적인 현금 흐름을 만들면서 양도소득세 부담을 줄일 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                당신의 투자 수익, 세금으로부터 지키세요!
              </h2>
              <p>
                해외 주식 투자는 매력적인 수익을 안겨주지만, 세금 문제도 꼼꼼히 챙겨야 합니다. <br />
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
