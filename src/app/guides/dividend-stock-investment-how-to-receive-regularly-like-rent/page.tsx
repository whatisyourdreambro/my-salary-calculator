
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, PiggyBank, LineChart, Lightbulb, CalendarDays, ShieldCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "배당주 투자로 월세 만들기: SCHD, JEPI 비교와 월배당 포트폴리오",
  description:
    "안정적인 현금 흐름을 위한 배당주 투자 A to Z. 배당성장주(SCHD)와 고배당주(JEPI)의 차이점, 그리고 여러 분기 배당주를 조합해 나만의 '월배당 포트폴리오'를 만드는 방법을 알려드립니다.",
  openGraph: {
    title: "배당주 투자로 월세 만들기: SCHD, JEPI 비교와 월배당 포트폴리오",
    description:
      "배당주 투자, 더 이상 어렵지 않습니다. 월세처럼 꾸준히 받는 배당금으로 당신의 경제적 자유를 앞당기세요.",
    images: ["/api/og?title=배당주 투자로 월세 만들기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "배당주 투자로 월세 만들기: SCHD, JEPI 비교와 월배당 포트폴리오",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-05-01",
  dateModified: currentDate,
  description:
    "대표 배당 ETF인 SCHD와 JEPI를 비교하고, 여러 분기 배당주를 조합해 월배당 포트폴리오를 만드는 방법을 알려드립니다.",
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
              배당주 투자는 기업 이익의 일부를 현금으로 돌려주는 '배당금'을 목적으로 하는 투자 방식입니다. 주가 상승을 통한 시세 차익과 더불어, 꾸준한 배당금으로 안정적인 현금 흐름(패시브 인컴)을 만들 수 있어 많은 투자자들에게 사랑받고 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">배당주 투자의 두 갈래 길</h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300">1. 배당성장주</h3>
                  <p className="!text-sm !my-0">
                    현재 배당률은 다소 낮더라도, 매년 꾸준히 배당금을 늘려가는 기업에 투자합니다. <strong>젊고 투자 기간이 긴 투자자</strong>에게 적합하며, 장기적으로 시세 차익과 배당금 증가를 모두 노릴 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">2. 고배당주</h3>
                  <p className="!text-sm !my-0">
                    기업의 성장성보다는 현재의 높은 배당률에 집중하여 투자합니다. <strong>은퇴 후 생활비 등 당장의 현금 흐름이 중요한 투자자</strong>에게 적합합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <LineChart className="w-7 h-7 text-purple-500" />
                이것만은 알고 가자! 대표 배당 ETF
              </h2>
              <p>개별 주식을 고르기 어렵다면, 여러 배당주를 모아놓은 ETF가 훌륭한 대안입니다.</p>
               <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr><th className="p-2 font-semibold">구분</th><th className="p-2 font-semibold">SCHD (배당성장)</th><th className="p-2 font-semibold">JEPI (고배당)</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">정식 명칭</td><td className="p-2">Schwab US Dividend Equity ETF</td><td className="p-2">JPMorgan Equity Premium Income ETF</td></tr>
                    <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">특징</td><td className="p-2">재무가 탄탄하고, 10년 이상 꾸준히 배당을 지급한 기업 100개에 투자</td><td className="p-2">S&P 500 주식과 옵션(ELN)을 활용해 매월 높은 배당금 지급</td></tr>
                    <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">배당 방식</td><td className="p-2">분기 배당 (3,6,9,12월)</td><td className="p-2">월배당</td></tr>
                    <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">배당률</td><td className="p-2">연 3%대 중반</td><td className="p-2">연 7~9%대</td></tr>
                    <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">추천 대상</td><td className="p-2">안정적인 장기 우상향과 배당금 성장을 원하는 투자자</td><td className="p-2">높은 월 현금 흐름을 즉시 원하는 은퇴 준비자</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <CalendarDays className="w-6 h-6" /> 나만의 '월배당' 포트폴리오 만드는 법
              </h2>
              <p className="!my-2 text-base">
                대부분의 미국 기업은 분기 배당을 실시합니다. 배당 지급 월이 다른 세 종류의 주식/ETF를 조합하면, 매달 월급처럼 배당금을 받을 수 있습니다.
              </p>
              <blockquote className="!border-l-yellow-500 !mt-4 !text-base bg-white dark:bg-gray-800 p-4 rounded">
                <p className="font-bold !mt-0">예시: '1-2-3 월배당 포트폴리오'</p>
                <ul className="!my-2 list-disc list-inside text-sm">
                    <li><strong>1, 4, 7, 10월 배당:</strong> 리얼티인컴 (O), 펩시코 (PEP) 등</li>
                    <li><strong>2, 5, 8, 11월 배당:</strong> 애플 (AAPL), 스타벅스 (SBUX) 등</li>
                    <li><strong>3, 6, 9, 12월 배당:</strong> SCHD, 마이크로소프트 (MSFT) 등</li>
                </ul>
              </blockquote>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                배당소득세 15.4%, 절약하고 싶다면?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                배당금의 15.4%는 세금으로 나갑니다. 하지만 ISA 계좌를 활용하면 연간 발생한 금융소득 500만원(서민형)까지 비과세 혜택을 누릴 수 있습니다. 배당주 투자의 필수 파트너, ISA에 대해 알아보세요.
              </p>
              <Link
                href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <ShieldCheck className="inline-block w-5 h-5 mr-2" />
                ISA 계좌 200% 활용법 보기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
