
import type { Metadata } from "next";
import Link from "next/link";
import { Home, Award, CheckCircle, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "청약 당첨 전략, 가점 높이는 비법: 내 집 마련의 꿈을 현실로! (2025년)",
  description:
    "내 집 마련의 꿈, 청약 당첨으로 이루세요! 청약 가점제의 구성 요소(무주택 기간, 부양가족 수, 청약통장 가입 기간)를 상세히 분석하고, 각 항목별 가점을 높이는 실질적인 전략과 청약 당첨 확률을 극대화하는 팁을 알려드립니다. 2025년 최신 청약 제도 반영.",
  openGraph: {
    title: "청약 당첨 전략, 가점 높이는 비법: 내 집 마련의 꿈을 현실로! (2025년)",
    description:
      "청약 가점, 제대로 알고 관리하면 내 집 마련이 빨라집니다. 당신의 청약 당첨을 Moneysalary가 응원합니다.",
    images: ["/api/og?title=청약 당첨 전략, 가점 높이는 비법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "청약 당첨 전략, 가점 높이는 비법: 내 집 마련의 꿈을 현실로! (2025년)",
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
    "청약 가점제의 구성 요소(무주택 기간, 부양가족 수, 청약통장 가입 기간)를 상세히 분석하고, 각 항목별 가점을 높이는 실질적인 전략과 청약 당첨 확률을 극대화하는 팁을 알려드립니다. 2025년 최신 청약 제도 반영.",
};

export default function SubscriptionLotteryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-sky-600 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            청약 당첨 전략,
            <br /> 가점 높이는 비법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-sky-100 dark:text-gray-300">
            내 집 마련의 꿈, 청약 당첨으로 이루세요! 청약 가점제의 모든 것을 파헤치고, 당신의 가점을 높여 당첨 확률을 극대화하는 실질적인 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-sky-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              청약 가점제는 무주택 기간, 부양가족 수, 청약통장 가입 기간 등 세 가지 항목의 점수를 합산하여 당첨자를 선정하는 방식입니다. 특히 인기 지역의 신규 분양 아파트는 가점이 높아야 당첨될 확률이 높으므로, 자신의 가점을 정확히 파악하고 관리하는 것이 매우 중요합니다. 이 가이드를 통해 청약 가점제의 모든 것을 파악하고, 당신의 내 집 마련 꿈을 현실로 만드세요.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Home className="w-6 h-6" />
                청약 가점제, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>당첨 확률 결정:</strong> 인기 지역의 신규 분양 아파트는 높은 가점을 요구하므로, 가점 관리가 당첨의 핵심입니다.
                </li>
                <li>
                  <strong>내 집 마련의 지름길:</strong> 가점을 높여 청약에 당첨되면 시세보다 저렴하게 내 집을 마련할 수 있는 기회를 얻을 수 있습니다.
                </li>
                <li>
                  <strong>계획적인 준비:</strong> 가점 항목을 미리 파악하고 계획적으로 관리하면 당첨 확률을 높일 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Award className="w-7 h-7 text-green-500" />
                청약 가점, 이렇게 높이세요! (3가지 핵심 항목)
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 무주택 기간 (최대 32점)
                  </h3>
                  <p className="!text-sm !my-0">
                    만 30세부터 무주택 기간을 산정하며, 무주택 기간이 길수록 높은 가점을 받습니다. (1년당 2점, 최대 15년 이상 32점) 세대원 전원이 무주택이어야 합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 부양가족 수 (최대 35점)
                  </h3>
                  <p className="!text-sm !my-0">
                    배우자, 직계존속(부모님), 직계비속(자녀) 등 부양가족이 많을수록 높은 가점을 받습니다. (1명당 5점, 최대 6명 이상 35점) 부양가족의 소득 및 주택 소유 여부도 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 청약통장 가입 기간 (최대 17점)
                  </h3>
                  <p className="!text-sm !my-0">
                    청약통장 가입 기간이 길수록 높은 가점을 받습니다. (1년당 1점, 최대 15년 이상 17점) 매월 10만원씩 꾸준히 납입하는 것이 중요합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 청약 당첨 확률 높이는 꿀팁!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>특별공급 적극 활용:</strong> 신혼부부, 생애최초, 다자녀 등 특별공급 자격이 된다면 일반공급보다 당첨 확률이 훨씬 높으므로 적극적으로 활용하세요.
                </li>
                <li>
                  <strong>지역별 예치금 확인:</strong> 민영주택 청약 시에는 지역별, 면적별 예치 기준 금액을 충족해야 합니다. 미리 확인하고 납입하세요.
                </li>
                <li>
                  <strong>청약 가점 계산기 활용:</strong> 한국부동산원 청약홈에서 제공하는 청약 가점 계산기를 활용하여 자신의 가점을 정확히 파악하고, 부족한 부분을 보완하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <CheckCircle className="w-7 h-7 text-indigo-500" />
                내 집 마련의 꿈, 지금 바로 시작하세요!
              </h2>
              <p>
                청약 당첨은 당신의 내 집 마련 꿈을 현실로 만들어줄 가장 확실한 방법입니다. <br />
                Moneysalary의 부동산 가이드와 함께 현명한 내 집 마련 전략을 세워보세요.
              </p>
              <Link
                href="/guides/housing-subscription-savings-how-to-make-a-1st-priority-account"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                주택청약종합저축 1순위 통장 만드는 법 🏠
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
