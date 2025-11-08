import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, PiggyBank, ShieldCheck, FileText } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "퇴직소득세 계산법과 절세 전략: 퇴직금 세금 폭탄 피하는 법 (2025년)",
  description:
    "퇴직금, 세금으로 얼마나 떼일까? 퇴직소득세 계산의 모든 것과 IRP, 연금저축을 활용한 절세 전략을 알려드립니다. 퇴직금 중간정산 시 세금은? 명예퇴직금 세금은? 궁금증을 모두 해결하세요.",
  openGraph: {
    title: "퇴직소득세 계산법과 절세 전략: 퇴직금 세금 폭탄 피하는 법 (2025년)",
    description:
      "퇴직금, 제대로 알고 받아야 세금 폭탄을 피할 수 있습니다. 당신의 소중한 퇴직금을 지키는 절세 가이드.",
    images: ["/api/og?title=퇴직소득세, 얼마나 떼일까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "퇴직소득세 계산법과 절세 전략: 퇴직금 세금 폭탄 피하는 법 (2025년)",
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
    "퇴직소득세 계산의 모든 것과 IRP, 연금저축을 활용한 절세 전략을 알려드립니다. 퇴직금 중간정산 시 세금은? 명예퇴직금 세금은? 궁금증을 모두 해결하세요.",
};

export default function SeveranceTaxGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-indigo-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            퇴직금 세금 폭탄,
            <br /> 피할 수 있을까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-purple-100 dark:text-gray-300">
            수십 년간의 노고에 대한 보상, 퇴직금. 하지만 목돈을 받는 기쁨도 잠시, 세금으로 얼마나 떼일지 걱정되시죠? 퇴직소득세의 모든 것을 파헤치고, 당신의 퇴직금을 지키는 절세 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-purple-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              퇴직금은 근로자가 퇴직할 때 받는 일시금으로, 근로소득과는 별도로 '퇴직소득'으로 분류되어 세금이 부과됩니다. 일반 소득세와는 다른 복잡한 계산 방식을 가지고 있으며, 장기근속에 대한 세금 혜택이 있지만, 잘못 관리하면 예상치 못한 세금 폭탄을 맞을 수도 있습니다. 당신의 소중한 퇴직금을 온전히 지키기 위한 현명한 방법을 지금부터 알아봅시다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                퇴직소득세, 왜 따로 계산할까?
              </h2>
              <p className="!my-2 text-base">
                퇴직소득은 수십 년간의 근로에 대한 보상이 한꺼번에 지급되는 '불규칙적인 소득'입니다. 만약 이 소득을 일반 근로소득과 합산하여 과세한다면, 높은 누진세율이 적용되어 세금 부담이 엄청나게 커질 것입니다. 이를 방지하기 위해 퇴직소득은 <strong>'분류과세'</strong>되어 다른 소득과 합산하지 않고 별도로 세금을 계산합니다. 또한, 장기근속에 대한 세금 부담을 덜어주기 위한 <strong>'연분연승법'</strong>이라는 독특한 계산 방식을 적용합니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Calculator className="w-7 h-7 text-signature-blue" />
                퇴직소득세 계산, 이렇게 합니다!
              </h2>
              <p>
                퇴직소득세는 다음과 같은 복잡한 단계를 거쳐 계산됩니다. (2025년 기준)
              </p>
              <ol className="!my-4 space-y-4 text-base">
                <li>
                  <strong>1단계: 퇴직소득금액 계산</strong><br />
                  퇴직금 총액 - 비과세 퇴직소득 = 퇴직소득금액
                </li>
                <li>
                  <strong>2단계: 퇴직소득공제 적용</strong><br />
                  퇴직소득금액 - 근속연수공제 - 환산급여공제 = 퇴직소득과세표준
                  <ul className="!my-2 list-disc list-inside text-sm">
                    <li><strong>근속연수공제:</strong> 근속연수에 따라 40%~100% 공제 (장기근속 유리)</li>
                    <li><strong>환산급여공제:</strong> 퇴직소득금액에 따라 차등 공제</li>
                  </ul>
                </li>
                <li>
                  <strong>3단계: 연분연승법 적용 (핵심!)</strong><br />
                  퇴직소득과세표준을 근속연수로 나눈 후, 소득세율을 적용하여 세액을 계산하고, 다시 근속연수를 곱합니다. 이 과정이 세금 부담을 크게 줄여줍니다.
                </li>
              </ol>
              <blockquote className="!border-l-blue-500 mt-6">
                <p>
                  <strong>예시:</strong> 근속연수 10년, 퇴직금 1억원인 경우, 연분연승법을 통해 마치 10년간 1천만원씩 받은 것처럼 세금을 계산하여 낮은 세율을 적용받게 됩니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <PiggyBank className="w-7 h-7 text-green-500" />
                퇴직소득세 절세 전략 TOP 3
              </h2>
              <p>
                퇴직소득세는 한 번 내면 끝이지만, 미리 준비하면 세금 부담을 크게 줄일 수 있습니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-green-600" /> 1. IRP (개인형 퇴직연금) 활용
                  </h3>
                  <p className="!text-sm !my-0">
                    퇴직금을 IRP 계좌로 받으면 퇴직소득세 납부를 <strong>최대 5년까지 유예</strong>할 수 있습니다. 이 기간 동안 퇴직금은 비과세로 운용되며, 연금으로 수령 시 퇴직소득세의 30%를 감면받을 수 있습니다. 가장 강력한 절세 수단입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 근속연수 늘리기
                  </h3>
                  <p className="!text-sm !my-0">
                    근속연수가 길수록 근속연수공제 혜택이 커져 세금 부담이 줄어듭니다. 퇴직 시점을 조절할 수 있다면, 근속연수를 1년이라도 더 채우는 것이 유리할 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 명예퇴직금, 위로금 등 비과세 항목 확인
                  </h3>
                  <p className="!text-sm !my-0">
                    회사에서 지급하는 명예퇴직금이나 위로금 중에는 비과세 한도가 적용되는 경우가 있습니다. 회사 담당자나 세무 전문가와 상담하여 비과세 혜택을 최대한 활용하세요.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                내 퇴직금, 정확히 계산하고 싶다면?
              </h2>
              <p>
                복잡한 퇴직소득세 계산, 혼자서 고민하지 마세요. <br />
                Moneysalary의 퇴직금 계산기로 당신의 퇴직금을 정확히 예측하고, 현명한 절세 계획을 세워보세요.
              </p>
              <Link
                href="/severance"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                퇴직금 계산기 바로가기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}