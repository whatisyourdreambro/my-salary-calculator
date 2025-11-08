
import type { Metadata } from "next";
import Link from "next/link";
import { Heart, FileText, ShieldCheck, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "기부금 세액공제, 연말정산 효자템: 나눔의 기쁨, 절세의 혜택 (2025년)",
  description:
    "따뜻한 마음을 나누면 세금 혜택이 따라옵니다! 연말정산 기부금 세액공제, 제대로 알고 계신가요? 공제 대상 기부금의 종류, 공제율, 그리고 연말정산 시 혜택을 최대로 받는 방법을 상세히 알려드립니다. 놓치기 쉬운 항목까지 완벽 정리.",
  openGraph: {
    title: "기부금 세액공제, 연말정산 효자템: 나눔의 기쁨, 절세의 혜택 (2025년)",
    description:
      "기부는 사랑입니다. 그리고 세액공제는 그 사랑에 대한 작은 보답입니다. 기부금 세액공제로 13월의 월급을 두둑하게 챙기세요.",
    images: ["/api/og?title=기부금 세액공제, 효자템!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "기부금 세액공제, 연말정산 효자템: 나눔의 기쁨, 절세의 혜택 (2025년)",
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
    "공제 대상 기부금의 종류, 공제율, 그리고 연말정산 시 혜택을 최대로 받는 방법을 상세히 알려드립니다. 놓치기 쉬운 항목까지 완벽 정리.",
};

export default function DonationTaxCreditGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-pink-500 to-rose-600 dark:from-gray-900 dark:to-pink-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            기부금 세액공제,
            <br /> 나눔의 기쁨, 절세의 혜택
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-rose-100 dark:text-gray-300">
            따뜻한 마음을 나누면 세금 혜택이 따라옵니다! 연말정산의 효자, 기부금 세액공제를 제대로 알고 활용하여 당신의 13월의 월급을 두둑하게 채우세요.
          </p>
          <p className="mt-4 text-xs text-rose-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              기부금 세액공제는 근로자 본인 및 부양가족이 지출한 기부금에 대해 세금을 감면해주는 제도입니다. 종교단체, 사회복지법인, 학교 등 다양한 곳에 기부한 금액에 대해 세액공제 혜택을 받을 수 있습니다. 많은 분들이 기부금 공제를 놓치거나 제대로 활용하지 못하는 경우가 많습니다. 이 가이드를 통해 기부금 세액공제의 모든 것을 파악하고, 당신의 소중한 세금을 돌려받으세요.
            </p>

            <section className="mt-12 bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl border border-pink-200 dark:border-pink-800">
              <h2 className="!mt-0 !text-2xl font-bold text-pink-600 flex items-center gap-2">
                <Heart className="w-6 h-6" />
                기부금 세액공제, 누가 얼마나 받을 수 있나요?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>공제 대상:</strong> 근로자 본인, 배우자, 부양가족(나이 및 소득 제한 없음)
                </li>
                <li>
                  <strong>공제율:</strong>
                  <ul className="!my-2 list-disc list-inside text-sm">
                    <li>정치자금 기부금: 10만원까지 100% 세액공제, 10만원 초과분은 15% (3천만원 초과분은 25%)</li>
                    <li>법정기부금: 30% (1천만원 초과분은 35%)</li>
                    <li>지정기부금: 15% (1천만원 초과분은 30%)</li>
                  </ul>
                </li>
                <li>
                  <strong>공제 한도:</strong> 소득 금액의 30% (종교단체 기부금은 10% 추가)
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-500" />
                공제 대상 기부금, 놓치지 마세요!
              </h2>
              <p>
                어떤 기부금이 공제 대상에 포함되는지 정확히 알아두는 것이 중요합니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 법정기부금
                  </h3>
                  <p className="!text-sm !my-0">
                    국가나 지방자치단체, 국방헌금, 이재민 구호금품, 사립학교, 병원, 사회복지법인 등에 기부한 금액이 해당됩니다. 공제율이 가장 높습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 지정기부금
                  </h3>
                  <p className="!text-sm !my-0">
                    종교단체, 사회복지단체, 문화예술단체 등 법정기부금 외의 공익성 기부금입니다. 법정기부금보다 공제율이 낮지만, 많은 분들이 해당되는 항목입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 정치자금 기부금
                  </h3>
                  <p className="!text-sm !my-0">
                    정당, 후원회, 선거관리위원회에 기부한 정치자금은 10만원까지 전액 세액공제되며, 10만원 초과분은 별도의 공제율이 적용됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 연말정산, 이렇게 준비하세요!
              </h2>
              <p className="!my-2 text-base">
                기부금 세액공제는 국세청 홈택스 '연말정산 간소화 서비스'에서 자동으로 조회되지만, 일부 기부금(종교단체 등)은 직접 기부금 영수증을 제출해야 합니다. 따라서 기부 시에는 반드시 기부금 영수증을 발급받아 잘 보관하고, 연말정산 시기에 맞춰 제출해야 합니다.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 13월의 월급을 최대로!
              </h2>
              <p>
                기부는 당신의 따뜻한 마음을 나누는 동시에 세금 혜택까지 받을 수 있는 중요한 제도입니다. <br />
                Moneysalary의 연말정산 계산기로 당신의 환급액을 최대로 늘리세요.
              </p>
              <Link
                href="/year-end-tax"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연말정산 계산기 바로가기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
