
import type { Metadata } from "next";
import Link from "next/link";
import { Home, DollarSign, FileText, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "재산세, 주택 공시가격과 세금의 관계: 내 집 세금 얼마나 나올까? (2025년)",
  description:
    "내 집 세금, 재산세! 주택 공시가격이 오르면 재산세도 오를까? 공시가격의 개념, 산정 방법, 그리고 공시가격 변동이 재산세에 미치는 영향을 상세히 알려드립니다. 재산세 절세 팁과 관련 부동산 세금 정보까지. 당신의 부동산 자산을 지키세요.",
  openGraph: {
    title: "재산세, 주택 공시가격과 세금의 관계: 내 집 세금 얼마나 나올까? (2025년)",
    description:
      "재산세, 더 이상 어렵지 않습니다. 공시가격과 세금의 관계를 이해하고 당신의 부동산 자산을 현명하게 관리하세요.",
    images: ["/api/og?title=재산세, 공시가격과 세금"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "재산세, 주택 공시가격과 세금의 관계: 내 집 세금 얼마나 나올까? (2025년)",
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
    "주택 공시가격의 개념, 산정 방법, 그리고 공시가격 변동이 재산세에 미치는 영향을 상세히 알려드립니다. 재산세 절세 팁과 관련 부동산 세금 정보까지. 당신의 부동산 자산을 지키세요.",
};

export default function PropertyTaxGuidePage() {
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
            재산세,
            <br /> 공시가격과 세금의 관계
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            내 집을 가지고 있다면 매년 납부해야 하는 재산세. 공시가격이 오르면 재산세도 오를까? 공시가격의 개념부터 재산세 계산법, 그리고 절세 팁까지. 당신의 부동산 자산을 지키는 현명한 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              재산세는 토지, 주택, 건축물, 선박, 항공기 등 재산을 소유한 자에게 부과되는 지방세입니다. 특히 주택 소유자에게는 매년 7월과 9월에 부과되는 중요한 세금입니다. 재산세는 주택의 '공시가격'을 기준으로 산정되므로, 공시가격의 개념과 산정 방법을 정확히 이해하는 것이 중요합니다. 이 가이드를 통해 재산세의 모든 것을 파악하고, 당신의 부동산 자산을 현명하게 관리하세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <Home className="w-6 h-6" />
                주택 공시가격, 무엇인가요?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>개념:</strong> 국토교통부 장관이 매년 공시하는 주택의 가격으로, 재산세, 종합부동산세, 건강보험료 등 각종 세금 및 부담금 산정의 기준이 됩니다.
                </li>
                <li>
                  <strong>종류:</strong> 단독주택은 '개별주택가격', 공동주택(아파트, 연립, 다세대)은 '공동주택가격'으로 공시됩니다.
                </li>
                <li>
                  <strong>산정 기준:</strong> 시세의 일정 비율(현실화율)을 반영하여 산정됩니다. 현실화율은 정부 정책에 따라 변동될 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-500" />
                재산세 계산법과 공시가격의 영향
              </h2>
              <p>
                재산세는 다음과 같은 과정을 거쳐 계산됩니다.
              </p>
              <blockquote className="!border-l-blue-500 mt-6">
                <p>
                  <strong>(주택 공시가격 × 공정시장가액비율) × 재산세율 - 세부담상한액</strong>
                </p>
                <ul className="!my-2 space-y-1 text-base">
                  <li><strong>공정시장가액비율:</strong> 공시가격에 곱하는 비율로, 정부 정책에 따라 변동됩니다. (2025년 기준 60% 예상)</li>
                  <li><strong>재산세율:</strong> 주택 가격 구간별로 차등 적용되는 세율입니다.</li>
                  <li><strong>세부담상한액:</strong> 전년도 재산세액의 일정 비율을 초과하여 세금이 부과되지 않도록 하는 제도입니다.</li>
                </ul>
              </blockquote>
              <p className="mt-4">
                즉, 공시가격이 오르면 과세표준이 높아져 재산세가 증가하게 됩니다. 따라서 매년 발표되는 공시가격을 확인하고, 자신의 재산세 부담을 예측하는 것이 중요합니다.
              </p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 재산세 절세 팁
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>주택 수 줄이기:</strong> 다주택자일수록 재산세 부담이 커집니다. 불필요한 주택은 처분하여 세금 부담을 줄일 수 있습니다.
                </li>
                <li>
                  <strong>공시가격 이의 신청:</strong> 공시가격이 시세보다 현저히 높게 책정되었다고 판단되면 이의 신청을 통해 재산세를 줄일 수 있습니다.
                </li>
                <li>
                  <strong>세금 감면 혜택 확인:</strong> 1세대 1주택자, 고령자, 장애인 등은 재산세 감면 혜택을 받을 수 있습니다. 해당 여부를 확인하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <DollarSign className="w-7 h-7 text-indigo-500" />
                당신의 부동산 자산, 현명하게 관리하세요!
              </h2>
              <p>
                재산세는 부동산 소유의 중요한 부분입니다. 공시가격과 세금의 관계를 이해하고 <br />
                Moneysalary의 부동산 가이드와 함께 현명한 자산 관리 전략을 세워보세요.
              </p>
              <Link
                href="/home-loan"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                주택담보대출 계산기 바로가기 🏠
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
