
import type { Metadata } from "next";
import Link from "next/link";
import { Store, FileText, ShieldCheck, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "부가가치세, 개인사업자라면 꼭 알아야 할 것: 신고부터 절세까지 (2025년)",
  description:
    "개인사업자라면 피할 수 없는 부가가치세! 일반과세자, 간이과세자 구분부터 신고 방법, 그리고 매입세액 공제, 전자세금계산서 활용 등 절세 팁까지. 2025년 최신 세법을 반영하여 당신의 사업을 지키세요.",
  openGraph: {
    title: "부가가치세, 개인사업자라면 꼭 알아야 할 것: 신고부터 절세까지 (2025년)",
    description:
      "부가가치세, 더 이상 어렵지 않습니다. 개인사업자를 위한 완벽 가이드로 당신의 사업을 성공으로 이끄세요.",
    images: ["/api/og?title=개인사업자 부가가치세 완벽 가이드"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "부가가치세, 개인사업자라면 꼭 알아야 할 것: 신고부터 절세까지 (2025년)",
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
    "일반과세자, 간이과세자 구분부터 신고 방법, 그리고 매입세액 공제, 전자세금계산서 활용 등 절세 팁까지. 2025년 최신 세법을 반영하여 당신의 사업을 지키세요.",
};

export default function VatSoleProprietorsGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            부가가치세,
            <br /> 개인사업자라면 꼭 알아야 할 것
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            사업을 시작했다면 피할 수 없는 세금, 부가가치세! 복잡하게 느껴지는 부가가치세 신고를 쉽게 이해하고, 당신의 사업을 지키는 절세 팁을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              부가가치세(VAT)는 상품이나 용역이 생산되거나 유통되는 모든 단계에서 발생하는 부가가치에 대해 부과되는 세금입니다. 최종 소비자가 부담하지만, 사업자가 세금을 징수하여 국가에 납부하는 간접세의 일종입니다. 개인사업자라면 부가가치세 신고 및 납부 의무가 있으므로, 그 개념과 신고 방법을 정확히 이해하는 것이 중요합니다. 이 가이드를 통해 부가가치세의 모든 것을 파악하고, 당신의 사업을 성공으로 이끄세요.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Store className="w-6 h-6" />
                부가가치세, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>사업자의 의무:</strong> 사업을 영위하는 모든 개인사업자는 부가가치세 신고 및 납부 의무가 있습니다.
                </li>
                <li>
                  <strong>세금 계산의 기본:</strong> 부가가치세는 매출세액에서 매입세액을 공제하여 계산되므로, 매입세액 공제를 잘 활용하면 세금 부담을 줄일 수 있습니다.
                </li>
                <li>
                  <strong>가산세 방지:</strong> 신고 및 납부를 기한 내에 하지 않으면 가산세가 부과될 수 있으므로, 정확한 신고가 중요합니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-green-500" />
                일반과세자 vs 간이과세자, 나에게 맞는 유형은?
              </h2>
              <p>
                개인사업자는 사업 규모에 따라 일반과세자와 간이과세자로 나뉩니다. 각 유형의 특징을 이해하고 자신에게 맞는 유형을 선택하는 것이 중요합니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 일반과세자
                  </h3>
                  <p className="!text-sm !my-0">
                    연간 매출액이 8천만원 이상인 사업자. 10%의 세율이 적용되며, 매입세액 공제를 전액 받을 수 있습니다. 세금계산서 발행 의무가 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 간이과세자
                  </h3>
                  <p className="!text-sm !my-0">
                    연간 매출액이 8천만원 미만인 사업자. 업종별 부가가치율에 10%의 세율이 적용되며, 매입세액 공제는 일부만 받을 수 있습니다. 세금계산서 발행 의무가 없습니다.
                  </p>
                </div>
              </div>
              <blockquote className="!border-l-blue-500 mt-6">
                <p>
                  <strong>선택의 중요성:</strong> 사업 초기에는 간이과세자가 유리할 수 있지만, 매출이 늘어나면 일반과세자로 전환해야 합니다. 자신의 사업 규모와 특성을 고려하여 현명하게 선택하세요.
                </p>
              </blockquote>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 부가가치세 절세 팁
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>매입세액 공제 최대한 활용:</strong> 사업과 관련된 모든 지출에 대해 세금계산서, 현금영수증, 신용카드 매출전표 등 적격 증빙을 반드시 수취하여 매입세액 공제를 받으세요.
                </li>
                <li>
                  <strong>전자세금계산서 발행:</strong> 전자세금계산서를 발행하면 세액공제 혜택을 받을 수 있습니다.
                </li>
                <li>
                  <strong>신용카드 매출전표 등 발행 세액공제:</strong> 신용카드, 현금영수증 등으로 매출을 발생시키면 일정 비율의 세액공제를 받을 수 있습니다.
                </li>
                <li>
                  <strong>세무 전문가 상담:</strong> 부가가치세 신고가 복잡하거나 금액이 크다면 세무사 등 전문가의 도움을 받는 것이 가장 안전하고 확실한 방법입니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 사업, 세금으로부터 지키세요!
              </h2>
              <p>
                부가가치세 신고는 개인사업자의 중요한 의무이자, 절세의 기회입니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 사업자가 되세요.
              </p>
              <Link
                href="/freelancer-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                프리랜서 세금 계산기 바로가기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
