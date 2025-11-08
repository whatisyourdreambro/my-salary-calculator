
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, ShieldCheck, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "종합소득세 신고, N잡러를 위한 완벽 가이드: 세금 폭탄 피하는 법 (2025년)",
  description:
    "월급 외 부업 소득이 있다면? N잡러라면 반드시 알아야 할 종합소득세 신고 방법, 소득 종류별 세금 처리, 그리고 절세 팁을 상세히 알려드립니다. 2025년 최신 세법을 반영하여 당신의 소중한 소득을 지키세요.",
  openGraph: {
    title: "종합소득세 신고, N잡러를 위한 완벽 가이드: 세금 폭탄 피하는 법 (2025년)",
    description:
      "N잡러, 세금 신고는 더 이상 어렵지 않습니다. 종합소득세의 모든 것을 파헤치고 당신의 소득을 지키세요.",
    images: ["/api/og?title=N잡러 종합소득세 완벽 가이드"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "종합소득세 신고, N잡러를 위한 완벽 가이드: 세금 폭탄 피하는 법 (2025년)",
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
    "N잡러라면 반드시 알아야 할 종합소득세 신고 방법, 소득 종류별 세금 처리, 그리고 절세 팁을 상세히 알려드립니다. 2025년 최신 세법을 반영하여 당신의 소중한 소득을 지키세요.",
};

export default function ComprehensiveIncomeTaxGuidePage() {
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
            종합소득세 신고,
            <br /> N잡러를 위한 완벽 가이드
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            월급 외 부업 소득이 있다면? N잡러라면 반드시 알아야 할 종합소득세 신고! 복잡하게 느껴지는 세금 신고를 쉽게 이해하고, 당신의 소중한 소득을 지키는 절세 팁을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              N잡러 시대, 하나의 직업만으로는 만족하지 못하고 다양한 활동을 통해 추가 소득을 창출하는 분들이 많아졌습니다. 하지만 여러 곳에서 소득이 발생하면 세금 신고가 복잡해질 수 있습니다. 종합소득세는 근로소득, 사업소득, 기타소득 등 모든 소득을 합산하여 신고하는 세금으로, N잡러라면 반드시 정확히 알고 신고해야 합니다. 이 가이드를 통해 종합소득세 신고의 모든 것을 파악하고, 세금 폭탄을 피하는 현명한 절세 전략을 세워보세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                N잡러, 왜 종합소득세 신고가 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>합산 과세:</strong> 근로소득 외에 사업소득, 기타소득 등이 발생하면 모든 소득을 합산하여 종합소득세를 신고해야 합니다. 합산하지 않으면 가산세가 부과될 수 있습니다.
                </li>
                <li>
                  <strong>누진세율 적용:</strong> 소득이 많아질수록 더 높은 세율이 적용되는 누진세율 구조이므로, 절세 전략이 더욱 중요합니다.
                </li>
                <li>
                  <strong>세금 환급 기회:</strong> 각종 소득공제, 세액공제 항목을 잘 활용하면 세금을 환급받을 수도 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-500" />
                소득 종류별 세금 처리 (N잡러 필수)
              </h2>
              <p>
                N잡러의 소득은 주로 근로소득, 사업소득, 기타소득으로 나뉩니다. 각 소득별 특징을 이해하는 것이 중요합니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 근로소득 (본업 월급)
                  </h3>
                  <p className="!text-sm !my-0">
                    회사에서 연말정산을 통해 세금 신고가 완료됩니다. 하지만 부업 소득이 있다면 종합소득세 신고 시 합산해야 합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 사업소득 (프리랜서, 개인 사업)
                  </h3>
                  <p className="!text-sm !my-0">
                    3.3% 원천징수 후 지급되는 경우가 많습니다. 종합소득세 신고 시 필요 경비를 인정받아 세금을 줄일 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 기타소득 (강연료, 원고료 등)
                  </h3>
                  <p className="!text-sm !my-0">
                    8.8% 원천징수 후 지급되는 경우가 많습니다. 연간 300만원 이하인 경우 분리과세 또는 종합과세 중 선택할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> N잡러를 위한 종합소득세 절세 팁
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>장부 작성:</strong> 사업소득이 있다면 간편장부 또는 복식부기를 작성하여 필요 경비를 최대한 인정받으세요.
                </li>
                <li>
                  <strong>경비 처리:</strong> 부업과 관련된 모든 지출(재료비, 통신비, 교통비, 교육비 등)은 증빙을 잘 챙겨 경비로 처리하세요.
                </li>
                <li>
                  <strong>소득공제/세액공제 활용:</strong> 연금저축, IRP, ISA 등 절세 상품을 적극 활용하여 세액공제 혜택을 받으세요.
                </li>
                <li>
                  <strong>세무 전문가 상담:</strong> 소득이 복잡하거나 금액이 크다면 세무사 등 전문가의 도움을 받는 것이 가장 안전하고 확실한 방법입니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 소중한 소득, 세금으로부터 지키세요!
              </h2>
              <p>
                N잡러의 시대, 종합소득세 신고는 더 이상 어렵지 않습니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 N잡러가 되세요.
              </p>
              <Link
                href="/guides/road-to-100m-part2-sidejob"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                직장인 부업으로 월 100만원 더 벌기 💸
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
