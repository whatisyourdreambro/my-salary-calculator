
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Calculator, HelpCircle, TrendingUp, PiggyBank } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "퇴직금 계산법과 지급기준, IRP 세금 총정리 (2025년)",
  description:
    "나의 퇴직금, 얼마나 받을 수 있을까? 퇴직금 지급기준(1년 이상, 주 15시간 이상), 평균임금 계산법, 그리고 IRP 계좌로 이전 시의 세금 혜택까지. 퇴직금의 모든 것을 알려드립니다.",
  openGraph: {
    title: "퇴직금 계산법과 지급기준, IRP 세금 총정리 (2025년)",
    description:
      "퇴직금, 제대로 알고 계신가요? 당신의 소중한 퇴직금을 1원까지 정확하게 챙기는 방법을 알려드립니다.",
    images: ["/api/og?title=퇴직금, 1원까지 정확하게 받는 법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "퇴직금 계산법과 지급기준, IRP 세금 총정리 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-05-25",
  dateModified: currentDate,
  description:
    "퇴직금 지급기준, 평균임금 계산법, 그리고 IRP 계좌로 이전 시의 세금 혜택까지 퇴직금의 모든 것을 알려드립니다.",
};

export default function SeverancePayGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-gray-700 to-gray-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            퇴직금, 1원까지
            <br /> 정확하게 받는 법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
            오랜 시간 고생한 나에게 주는 선물, 퇴직금. 하지만 정확히 어떻게 계산되는지, 세금은 얼마나 떼는지 알고 계신가요? 당신의 소중한 퇴직금을 지키는 모든 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              퇴직금은 1년 이상 계속 근로한 근로자가 퇴직할 때 지급받는 돈으로, 근로자의 노후 생활을 보장하기 위한 중요한 제도입니다. 퇴직금은 법적으로 보장된 근로자의 당연한 권리이며, 정확한 계산법을 알아두는 것이 중요합니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-green-500" />
                퇴직금, 누가 받을 수 있나요? (지급 기준)
              </h2>
              <p>
                아래 2가지 조건을 <strong>모두</strong> 충족하면, 5인 미만 사업장을 포함한 모든 근로자가 퇴직금을 받을 수 있습니다.
              </p>
              <ol className="!my-4 list-decimal list-inside space-y-4 text-base bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <li><strong>1년 이상 계속 근로:</strong> 같은 사업장에서 1년 이상 근무해야 합니다. (수습, 인턴 기간도 포함)</li>
                <li><strong>주 15시간 이상 근무:</strong> 4주를 평균하여 1주 소정근로시간이 15시간 이상이어야 합니다.</li>
              </ol>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Calculator className="w-7 h-7 text-signature-blue" />
                내 퇴직금, 어떻게 계산될까?
              </h2>
              <p>
                퇴직금은 '1일 평균임금'에 '재직일수'를 곱한 후, 30/365를 곱하여 계산합니다. 조금 복잡하게 들리지만, 핵심은 '1일 평균임금'을 정확히 구하는 것입니다.
              </p>
              <div className="mt-6 p-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 text-center">
                <p className="text-lg font-medium">
                  퇴직금 = 1일 평균임금 × 30일 × (총 재직일수 / 365)
                </p>
              </div>
              <blockquote className="!border-l-blue-500 mt-6">
                <p className="font-bold">1일 평균임금이란?</p>
                 <p className="!my-2 text-base">
                  <strong>퇴직일 이전 3개월간 지급된 임금 총액</strong>을 그 기간의 총 일수로 나눈 금액입니다. 기본급뿐만 아니라 연장/야간수당, 상여금, 연차수당 등 대부분의 금품이 포함되어 계산됩니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <PiggyBank className="w-6 h-6" /> 퇴직금 세금, IRP로 아끼는 꿀팁
              </h2>
              <p className="!my-2 text-base">
                퇴직금에는 '퇴직소득세'가 부과됩니다. 하지만 퇴직금을 개인형 퇴직연금(IRP) 계좌로 이전하면, 당장 세금을 내지 않고 나중에 연금으로 수령할 때 낮은 세율(3.3%~5.5%)로 낼 수 있습니다. (과세이연 효과)
              </p>
              <ul className="!my-4 space-y-2 text-base">
                <li><strong>세금 절약:</strong> 퇴직소득세의 30%를 절감(연금 수령 시)할 수 있습니다.</li>
                <li><strong>추가 투자:</strong> IRP 계좌 내에서 퇴직금을 직접 운용하여 추가 수익을 기대할 수 있습니다.</li>
              </ul>
               <Link href="/guides/pension-savings-fund-vs-irp-which-is-right-for-me" className="text-sm font-bold text-yellow-800 dark:text-yellow-300 hover:underline">연금계좌(IRP) 자세히 알아보기 →</Link>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                내 퇴직금, 정확히 얼마일까?
              </h2>
              <p className="mt-4">
                복잡한 평균임금 계산, Moneysalary의 퇴직금 계산기에 맡기세요. <br/>
                입사일과 퇴사일, 3개월 급여 총액만 입력하면 예상 퇴직금을 바로 확인할 수 있습니다.
              </p>
              <Link
                href="/severance-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Calculator className="inline-block w-5 h-5 mr-2" />
                퇴직금 계산기 바로가기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
