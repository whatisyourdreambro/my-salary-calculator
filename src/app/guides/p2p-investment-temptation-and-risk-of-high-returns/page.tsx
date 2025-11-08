
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, AlertTriangle, ShieldCheck, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "P2P 투자, 고수익의 유혹과 위험: 당신의 돈을 지키는 법 (2025년)",
  description:
    "연 10% 이상의 고수익을 꿈꾼다면? P2P 투자는 매력적인 대안이 될 수 있습니다. 하지만 그만큼 위험도 따릅니다. P2P 투자의 기본 개념, 작동 방식, 그리고 투자 시 발생할 수 있는 위험(연체, 부도 등)과 이를 관리하는 방법을 상세히 알려드립니다. 당신의 돈을 지키는 현명한 투자자가 되세요.",
  openGraph: {
    title: "P2P 투자, 고수익의 유혹과 위험: 당신의 돈을 지키는 법 (2025년)",
    description:
      "P2P 투자, 더 이상 묻지마 투자는 금물! 고수익 뒤에 숨겨진 위험을 파악하고 현명하게 투자하세요.",
    images: ["/api/og?title=P2P 투자, 고수익과 위험"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "P2P 투자, 고수익의 유혹과 위험: 당신의 돈을 지키는 법 (2025년)",
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
    "P2P 투자의 기본 개념, 작동 방식, 그리고 투자 시 발생할 수 있는 위험(연체, 부도 등)과 이를 관리하는 방법을 상세히 알려드립니다. 당신의 돈을 지키는 현명한 투자자가 되세요.",
};

export default function P2pInvestmentGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-red-500 to-orange-600 dark:from-gray-900 dark:to-red-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            P2P 투자,
            <br /> 고수익의 유혹과 위험
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-orange-100 dark:text-gray-300">
            연 10% 이상의 고수익을 꿈꾼다면? P2P 투자는 매력적인 대안이 될 수 있습니다. 하지만 그만큼 위험도 따릅니다. P2P 투자의 모든 것을 파악하고, 당신의 돈을 지키는 현명한 투자자가 되세요.
          </p>
          <p className="mt-4 text-xs text-orange-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              P2P(Peer-to-Peer) 투자는 개인과 개인을 직접 연결하여 대출과 투자를 가능하게 하는 온라인 금융 서비스입니다. 은행 등 기존 금융기관을 거치지 않기 때문에 대출자는 낮은 금리로 돈을 빌릴 수 있고, 투자자는 높은 수익률을 기대할 수 있다는 장점이 있습니다. 하지만 높은 수익률 뒤에는 그만큼의 위험이 따르므로, P2P 투자를 시작하기 전에 충분히 이해하고 신중하게 접근해야 합니다. 이 가이드를 통해 P2P 투자의 모든 것을 파악하고, 당신의 돈을 지키는 현명한 투자자가 되세요.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                P2P 투자, 왜 고수익을 줄까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>중개 수수료 절감:</strong> 은행 등 기존 금융기관을 거치지 않아 중개 수수료가 절감됩니다.
                </li>
                <li>
                  <strong>신용 등급 다양화:</strong> 은행 대출이 어려운 중신용자에게도 대출이 이루어져 높은 금리가 책정됩니다.
                </li>
                <li>
                  <strong>플랫폼의 효율성:</strong> 온라인 플랫폼을 통해 효율적인 대출 심사와 관리가 가능합니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-purple-500" />
                P2P 투자, 놓치지 말아야 할 3가지 위험
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 연체 및 부도 위험
                  </h3>
                  <p className="!text-sm !my-0">
                    대출자가 원리금을 상환하지 못할 경우(연체), 또는 대출자가 파산할 경우(부도) 투자 원금을 손실할 수 있습니다. 이는 P2P 투자의 가장 큰 위험입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 플랫폼 리스크
                  </h3>
                  <p className="!text-sm !my-0">
                    P2P 플랫폼 자체가 파산하거나, 사기 행각을 벌일 경우 투자금을 회수하지 못할 수 있습니다. 금융 당국의 인가를 받은 안전한 플랫폼을 선택하는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 유동성 리스크
                  </h3>
                  <p className="!text-sm !my-0">
                    P2P 투자는 주식처럼 실시간으로 매매가 어렵습니다. 투자 기간 동안 자금이 묶일 수 있으므로, 여유 자금으로 투자해야 합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> P2P 투자, 이렇게 하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>분산 투자:</strong> 한 플랫폼이나 한 상품에 몰빵 투자하기보다는 여러 플랫폼과 다양한 상품에 분산 투자하여 위험을 줄이세요.
                </li>
                <li>
                  <strong>소액 투자:</strong> 처음에는 소액으로 시작하여 P2P 투자의 특성을 이해하고 경험을 쌓는 것이 중요합니다.
                </li>
                <li>
                  <strong>플랫폼 선택:</strong> 금융 당국의 인가를 받은 안전한 플랫폼인지, 연체율과 부도율이 낮은지, 투자자 보호 장치가 잘 되어 있는지 꼼꼼히 확인하세요.
                </li>
                <li>
                  <strong>정보 확인:</strong> 투자하려는 상품의 대출자 정보, 담보 여부, 상환 계획 등을 상세히 확인하고 투자하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 돈을 지키는 현명한 투자자가 되세요!
              </h2>
              <p>
                P2P 투자는 고수익의 기회를 제공하지만, 그만큼 위험도 따릅니다. <br />
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
