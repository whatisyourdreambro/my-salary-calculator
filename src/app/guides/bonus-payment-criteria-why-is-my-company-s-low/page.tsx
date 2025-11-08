
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, TrendingDown, Lightbulb, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "성과급 지급 기준, 우리 회사는 왜 적을까? (성과급 불만 해소 가이드)",
  description:
    "'옆 회사 성과급은 터졌다는데...' 우리 회사 성과급이 적은 이유가 궁금하신가요? 성과급 지급의 원리, 회사별 차이, 그리고 당신의 성과급을 높이기 위한 전략을 알려드립니다. 더 이상 불만만 갖지 말고, 해결책을 찾으세요.",
  openGraph: {
    title: "성과급 지급 기준, 우리 회사는 왜 적을까? (성과급 불만 해소 가이드)",
    description:
      "성과급, 제대로 알고 요구해야 합니다. 우리 회사 성과급의 비밀을 파헤치고 당신의 보상을 쟁취하세요.",
    images: ["/api/og?title=성과급, 왜 적을까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "성과급 지급 기준, 우리 회사는 왜 적을까? (성과급 불만 해소 가이드)",
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
    "성과급 지급의 원리, 회사별 차이, 그리고 당신의 성과급을 높이기 위한 전략을 알려드립니다. 더 이상 불만만 갖지 말고, 해결책을 찾으세요.",
};

export default function BonusPaymentCriteriaGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-orange-500 to-red-600 dark:from-gray-900 dark:to-orange-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            성과급 지급 기준,
            <br /> 우리 회사는 왜 적을까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-red-100 dark:text-gray-300">
            '옆 회사 성과급은 터졌다는데...' 매년 성과급 시즌이 되면 다른 회사와 비교하며 불만을 갖게 되시나요? 우리 회사 성과급이 적은 진짜 이유와 당신의 성과급을 높이기 위한 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-red-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              성과급은 직장인 연봉의 중요한 부분을 차지하며, 특히 IT, 반도체, 금융 등 특정 산업에서는 연봉의 절반 이상을 차지하기도 합니다. 하지만 성과급은 회사마다, 직무마다, 개인마다 지급 기준과 규모가 천차만별입니다. 우리 회사의 성과급이 적다고 느껴진다면, 그 이유를 정확히 파악하고 해결책을 모색하는 것이 중요합니다.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                성과급, 무엇을 기준으로 지급될까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>회사 전체 성과:</strong> 회사의 매출, 영업이익, 당기순이익 등 재무 성과가 가장 중요한 기준이 됩니다. (예: 삼성전자의 OPI/PS, SK하이닉스의 PS)
                </li>
                <li>
                  <strong>사업부/팀 성과:</strong> 소속된 사업부나 팀의 목표 달성률, 기여도에 따라 성과급이 차등 지급됩니다.
                </li>
                <li>
                  <strong>개인 성과:</strong> 개인의 업무 목표 달성률, 핵심 역량 발휘 정도 등 개인의 기여도에 따라 성과급이 달라집니다.
                </li>
                <li>
                  <strong>산업 특성:</strong> IT, 금융 등 성과주의 문화가 강한 산업은 성과급 비중이 높고, 공기업이나 공공기관은 상대적으로 낮습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingDown className="w-7 h-7 text-purple-500" />
                우리 회사 성과급이 적은 3가지 이유
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 회사 재무 성과 부진
                  </h3>
                  <p className="!text-sm !my-0">
                    가장 직접적인 원인입니다. 회사의 매출이나 영업이익이 목표에 미달하거나, 적자를 기록했다면 성과급이 줄어들거나 지급되지 않을 수 있습니다. 회사의 재무제표를 확인하여 객관적인 상황을 파악하는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 보상 철학의 차이
                  </h3>
                  <p className="!text-sm !my-0">
                    어떤 회사는 기본급을 높게 책정하고 성과급 비중을 낮추는 반면, 어떤 회사는 기본급은 낮지만 성과급 비중을 높여 개인의 성과에 따라 연봉이 크게 달라지도록 합니다. 우리 회사의 보상 철학을 이해하는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 개인의 성과 평가 결과
                  </h3>
                  <p className="!text-sm !my-0">
                    회사 전체나 사업부 성과가 좋더라도, 개인의 성과 평가 결과가 낮다면 성과급이 적게 지급될 수 있습니다. 자신의 업무 목표 달성 여부와 기여도를 객관적으로 평가하고, 부족한 점을 개선하려는 노력이 필요합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 성과급 불만, 이렇게 해결하세요!
              </h2>
              <p className="!my-2 text-base">
                성과급에 대한 불만은 단순히 불평하는 것만으로는 해결되지 않습니다. 회사의 성과급 지급 기준을 명확히 이해하고, 자신의 성과를 객관적으로 증명하며, 필요하다면 연봉 협상을 통해 개선을 요구하는 적극적인 자세가 필요합니다.
              </p>
              <Link href="/guides/salary-negotiation" className="font-semibold text-yellow-800 hover:underline">
                → 연봉 협상 잘하는 법 가이드 참고하기
              </Link>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                당신의 가치를 제대로 인정받는 회사를 찾으세요!
              </h2>
              <p>
                성과급은 당신의 노력과 기여에 대한 정당한 보상입니다. <br />
                Moneysalary의 다양한 커리어 가이드와 함께 당신의 가치를 제대로 인정받는 회사를 찾아보세요.
              </p>
              <Link
                href="/guides/industry-trends-2025"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                2025년 유망 산업 트렌드 확인하기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
