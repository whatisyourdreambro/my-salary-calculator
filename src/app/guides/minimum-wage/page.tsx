import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Calculator, AlertTriangle, CheckCircle } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

const MINIMUM_WAGE_2025 = 10030;
const MONTHLY_SALARY_2025 = MINIMUM_WAGE_2025 * 209;

export const metadata: Metadata = {
  title: `2025년 최저임금 ${MINIMUM_WAGE_2025.toLocaleString()}원 확정 | 월급 계산법 총정리`,
  description:
    `2025년 최저시급 ${MINIMUM_WAGE_2025.toLocaleString()}원 확정! 주휴수당을 포함한 2025년 최저 월급은 ${MONTHLY_SALARY_2025.toLocaleString()}원입니다. 내 월급이 최저임금 기준을 지키고 있는지 확인하는 방법과 포함/미포함 수당까지 완벽 정리.`,
  openGraph: {
    title: `2025년 최저임금 ${MINIMUM_WAGE_2025.toLocaleString()}원 확정, 내 월급은 얼마?`,
    description:
      "2025년 최저임금 기준 월급 계산법부터 실수령액 확인까지 한번에. 지금 바로 확인해보세요.",
    images: ["/api/og?title=2025년 최저임금 확정, 내 월급은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: `2025년 최저임금 ${MINIMUM_WAGE_2025.toLocaleString()}원 확정 | 월급 계산법 총정리`,
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
  datePublished: "2025-08-05",
  dateModified: currentDate,
  description:
    `2025년 최저시급 ${MINIMUM_WAGE_2025.toLocaleString()}원 기준, 월급 계산법과 최저임금 포함 수당을 알려드립니다.`,
};

export default function MinimumWageGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-600 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025년 최저임금,
            <br /> 시급 10,030원으로 확정
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            대한민국 모든 근로자의 임금 기준이 되는 2025년 최저임금이 확정되었습니다. 내 월급은 어떻게 달라지는지, 지금 바로 확인해보세요.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              최저임금은 국가가 법으로 정한 임금의 최저 수준으로, 모든 사업장은 근로자에게 최저임금 이상의 급여를 지급해야 합니다. 이는 아르바이트, 계약직, 정규직 등 고용 형태와 관계없이 모든 근로자에게 적용되는 중요한 권리입니다.
            </p>

            <section className="mt-12 text-center bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800">
              <h2 className="!mt-0 !text-2xl font-bold text-green-700 flex items-center gap-2 justify-center">
                <TrendingUp className="w-6 h-6" />
                2025년 최저임금 및 월급
              </h2>
              <p className="text-4xl font-bold my-2 text-green-600">
                시급 {MINIMUM_WAGE_2025.toLocaleString()}원
              </p>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                월급 환산: {MONTHLY_SALARY_2025.toLocaleString()}원
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                (1일 8시간, 주 40시간 근무, 주휴수당 포함, 월 209시간 기준)
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Calculator className="w-7 h-7 text-signature-blue" />
                내 월급, 최저임금 위반일까?
              </h2>
              <p>
                내 월급이 최저임금 기준을 충족하는지 확인하려면, 최저임금에 포함되는 임금과 그렇지 않은 임금을 구분해야 합니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> 최저임금 포함 항목
                  </h3>
                  <ul className="!text-sm !my-0 list-disc list-inside">
                    <li>기본급</li>
                    <li>직무수당, 직책수당 등 매월 정기적/일률적으로 지급되는 수당</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-bold !mt-0 !mb-1 text-brand-red flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> 최저임금 미포함 항목
                  </h3>
                  <ul className="!text-sm !my-0 list-disc list-inside">
                    <li>연장/야간/휴일 근로 수당</li>
                    <li>매월 지급하는 상여금, 식비, 교통비 등 복리후생비 중 일부 금액*</li>
                    <li>연차수당, 경조사비 등 비정기적 수당</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                *매월 지급되는 상여금과 복리후생비는 2025년 최저임금 월 환산액(${MONTHLY_SALARY_2025.toLocaleString()}원)의 각각 0%, 1%를 초과하는 금액만 최저임금에 산입됩니다. (2024년까지 적용되던 상여금 5%, 복리후생비 1% 규정에서 상여금 규정이 변경되었습니다.)
              </p>
              <blockquote className="!border-l-blue-500 mt-6">
                <p>
                  <strong>계산법:</strong> (최저임금에 포함되는 월급) ÷ (월 소정근로시간) = 나의 실질 시급
                </p>
                <p className="text-sm">
                  계산된 나의 실질 시급이 {MINIMUM_WAGE_2025.toLocaleString()}원보다 적다면 최저임금 위반을 의심해볼 수 있습니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                내 연봉, 최저임금과 비교하면?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                2025년 최저임금을 기준으로 내 연봉의 실수령액이 궁금하신가요? 지금 바로 '연봉 계산기'로 세후 월급을 확인해보세요.
              </p>
              <Link
                href="/salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연봉 계산기 바로가기 💸
              </Link>
              <div className="mt-4">
                <Link href="/guides/holiday-allowance" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                  주휴수당에 대해 더 알아보기
                </Link>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}