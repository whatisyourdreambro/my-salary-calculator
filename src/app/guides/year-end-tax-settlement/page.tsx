import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, FileText, PiggyBank, CalendarCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 연말정산 완벽 가이드: 13월의 월급, 놓치지 마세요!",
  description:
    "매년 돌아오는 연말정산, 꼼꼼하게 준비해서 13월의 월급을 챙기세요! 소득공제, 세액공제 항목부터 놓치기 쉬운 꿀팁, 그리고 2025년 달라지는 세법까지. 당신의 환급액을 최대로 늘리는 모든 방법을 알려드립니다.",
  openGraph: {
    title: "2025년 연말정산 완벽 가이드: 13월의 월급, 놓치지 마세요!",
    description:
      "연말정산, 더 이상 어렵지 않습니다. 꼼꼼하게 준비해서 세금 폭탄 대신 환급의 기쁨을 누리세요.",
    images: ["/api/og?title=연말정산, 13월의 월급을 잡아라!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 연말정산 완벽 가이드: 13월의 월급, 놓치지 마세요!",
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
    "소득공제, 세액공제 항목부터 놓치기 쉬운 꿀팁, 그리고 2025년 달라지는 세법까지. 당신의 환급액을 최대로 늘리는 모든 방법을 알려드립니다.",
};

export default function YearEndTaxSettlementGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-pink-600 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연말정산 완벽 가이드,
            <br /> 13월의 월급 놓치지 마세요!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-pink-100 dark:text-gray-300">
            매년 초 직장인들의 희비가 엇갈리는 연말정산. 세금 폭탄 대신 환급의 기쁨을 누리고 싶다면 지금부터 꼼꼼하게 준비하세요. 당신의 지갑을 두둑하게 채워줄 연말정산 꿀팁을 공개합니다.
          </p>
          <p className="mt-4 text-xs text-pink-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연말정산은 1년 동안 납부한 세금을 정산하여 더 낸 세금은 돌려받고(환급), 덜 낸 세금은 추가로 납부하는 과정입니다. 복잡하게 느껴지지만, 기본적인 원리와 주요 공제 항목만 잘 알아두면 누구나 '13월의 월급'을 받을 수 있습니다. 2025년 연말정산을 위한 모든 준비를 지금부터 시작해봅시다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                연말정산, 왜 중요할까?
              </h2>
              <p className="!my-2 text-base">
                회사는 매월 근로자의 월급에서 소득세를 미리 떼어(원천징수) 납부합니다. 하지만 개인의 소비, 지출, 부양가족 등 다양한 상황을 고려하지 않고 일괄적으로 떼어가기 때문에, 실제 내야 할 세금보다 더 많이 떼어가는 경우가 많습니다. 연말정산은 이렇게 <strong>더 낸 세금을 돌려받는 과정</strong>이자, 합법적으로 세금을 줄일 수 있는 유일한 기회입니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-500" />
                소득공제 vs 세액공제, 무엇이 다를까?
              </h2>
              <p>
                연말정산의 핵심은 '공제'입니다. 공제는 크게 소득공제와 세액공제로 나뉘며, 이 둘의 차이를 아는 것이 절세의 첫걸음입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    소득공제
                  </h3>
                  <p className="!text-sm !my-0">
                    세금을 매기는 기준이 되는 <strong>'과세표준'을 줄여주는 것</strong>입니다. 과세표준이 줄어들면 적용되는 세율 구간이 낮아지거나, 세금 자체가 줄어드는 효과가 있습니다. (예: 인적공제, 주택자금공제, 신용카드 소득공제)
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    세액공제
                  </h3>
                  <p className="!text-sm !my-0">
                    이미 계산된 <strong>'산출세액'에서 직접 세금을 깎아주는 것</strong>입니다. 소득공제보다 절세 효과가 더 크다고 볼 수 있습니다. (예: 자녀세액공제, 연금계좌세액공제, 의료비/교육비/기부금 세액공제)
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <PiggyBank className="w-7 h-7 text-green-500" />
                환급액 최대로 늘리는 꿀팁 TOP 3
              </h2>
              <p>
                매년 놓치기 쉬운 연말정산 꿀팁들을 미리 확인하고 준비하세요.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 연금저축 & IRP는 필수!
                  </h3>
                  <p className="!text-sm !my-0">
                    연말정산의 '치트키'입니다. 연간 최대 900만원까지 납입하면 최대 148.5만원의 세액공제 혜택을 받을 수 있습니다. 특히 고소득자일수록 절세 효과가 큽니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 신용카드 vs 체크카드, 현금영수증 전략
                  </h3>
                  <p className="!text-sm !my-0">
                    총급여의 25%까지는 신용카드를 사용하고, 그 이후부터는 체크카드나 현금영수증을 사용하는 것이 유리합니다. 각 공제율이 다르기 때문입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 부양가족 공제, 놓치지 마세요!
                  </h3>
                  <p className="!text-sm !my-0">
                    배우자, 자녀, 부모님 등 부양가족이 있다면 인적공제, 자녀세액공제, 의료비/교육비/기부금 공제 등 다양한 혜택을 받을 수 있습니다. 주민등록상 같이 살지 않아도 조건만 맞으면 공제 가능합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                내 연말정산 환급액, 미리 계산해보고 싶다면?
              </h2>
              <p>
                복잡한 연말정산, Moneysalary의 연말정산 계산기로 <br />
                당신의 예상 환급액을 미리 확인하고 꼼꼼하게 준비하세요.
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