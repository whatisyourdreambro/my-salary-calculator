
import type { Metadata } from "next";
import Link from "next/link";
import { School, FileText, ShieldCheck, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "교육비 세액공제, 학자금 대출도 공제될까? (연말정산 꿀팁 2025년)",
  description:
    "자녀 교육비, 내 학자금 대출 상환액까지! 연말정산 교육비 세액공제, 제대로 알고 계신가요? 공제 대상 교육비의 범위, 공제율, 그리고 학자금 대출 상환액 공제 여부까지 상세히 알려드립니다. 놓치기 쉬운 항목까지 완벽 정리.",
  openGraph: {
    title: "교육비 세액공제, 학자금 대출도 공제될까? (연말정산 꿀팁 2025년)",
    description:
      "교육은 미래를 위한 투자! 교육비 지출이 있었다면 세액공제로 돌려받으세요. 학자금 대출도 공제될 수 있습니다!",
    images: ["/api/og?title=교육비 세액공제, 학자금 대출도?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "교육비 세액공제, 학자금 대출도 공제될까? (연말정산 꿀팁 2025년)",
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
    "공제 대상 교육비의 범위, 공제율, 그리고 학자금 대출 상환액 공제 여부까지 상세히 알려드립니다. 놓치기 쉬운 항목까지 완벽 정리.",
};

export default function EducationExpenseTaxCreditGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            교육비 세액공제,
            <br /> 학자금 대출도 공제될까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            자녀 교육비, 내 학자금 대출 상환액까지! 연말정산 교육비 세액공제, 제대로 알고 계신가요? 공제 대상부터 학자금 대출 공제 여부까지, 당신의 13월의 월급을 지키는 꿀팁을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연말정산 교육비 세액공제는 근로자 본인 및 부양가족을 위해 지출한 교육비에 대해 세금을 감면해주는 제도입니다. 취학 전 아동부터 대학생까지, 그리고 근로자 본인의 교육비까지 다양한 항목이 공제 대상에 포함됩니다. 특히 많은 분들이 궁금해하는 학자금 대출 상환액의 공제 여부와 공제 혜택을 최대로 받는 방법을 이 가이드를 통해 자세히 알아보겠습니다.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <School className="w-6 h-6" />
                교육비 세액공제, 누가 얼마나 받을 수 있나요?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>공제 대상:</strong> 근로자 본인, 배우자, 부양가족(나이 제한 없음, 소득 제한 있음)
                </li>
                <li>
                  <strong>공제율:</strong> 교육비 지출액의 15% 세액공제
                </li>
                <li>
                  <strong>공제 한도:</strong>
                  <ul className="!my-2 list-disc list-inside text-sm">
                    <li>본인: 한도 없음</li>
                    <li>취학 전 아동/초중고생: 1인당 연 300만원</li>
                    <li>대학생: 1인당 연 900만원</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-green-500" />
                공제 대상 교육비, 놓치지 마세요!
              </h2>
              <p>
                학비, 수업료 외에도 공제받을 수 있는 항목들이 많습니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 수업료, 입학금, 보육료, 수강료
                  </h3>
                  <p className="!text-sm !my-0">
                    가장 기본적인 공제 항목입니다. 유치원, 어린이집, 학원, 학교 등 교육기관에 지출한 비용이 해당됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 교복/체육복 구입비 (초중고생)
                  </h3>
                  <p className="!text-sm !my-0">
                    초중고생의 경우 1인당 연 50만원까지 교복/체육복 구입비가 공제됩니다. 영수증을 잘 챙겨야 합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 현장체험학습비 (초중고생)
                  </h3>
                  <p className="!text-sm !my-0">
                    초중고생의 현장체험학습비는 1인당 연 30만원까지 공제됩니다. 학교에서 발급하는 영수증을 제출해야 합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    4. 학자금 대출 상환액 (본인)
                  </h3>
                  <p className="!text-sm !my-0">
                    <strong>근로자 본인이 대출받은 학자금의 원리금 상환액은 교육비 세액공제 대상에 포함됩니다.</strong> 한국장학재단 등에서 발급하는 상환 내역 증명서를 제출해야 합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 연말정산, 이렇게 준비하세요!
              </h2>
              <p className="!my-2 text-base">
                대부분의 교육비는 국세청 홈택스 '연말정산 간소화 서비스'에서 자동으로 조회되지만, 일부 항목(학원비, 교복비 등)은 직접 영수증을 제출해야 합니다. 따라서 관련 영수증은 반드시 잘 보관하고, 연말정산 시기에 맞춰 제출해야 합니다.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 13월의 월급을 최대로!
              </h2>
              <p>
                교육은 미래를 위한 투자입니다. 그리고 교육비 세액공제는 그 투자를 응원하는 제도입니다. <br />
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
