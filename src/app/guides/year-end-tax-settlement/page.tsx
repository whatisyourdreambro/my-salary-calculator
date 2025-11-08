
import type { Metadata } from "next";
import Link from "next/link";
import { FileText, TrendingDown, TrendingUp, Gift, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연말정산 완벽 가이드: 13월의 월급, 더 많이 돌려받는 법 (2025년)",
  description:
    "2025년 연말정산, 아는 만큼 돌려받습니다. 소득공제와 세액공제의 차이부터 신용카드/체크카드 공제, 월세 세액공제, 그리고 연금계좌/ISA를 활용한 최종 절세 전략까지 총정리.",
  openGraph: {
    title: "연말정산 완벽 가이드: 13월의 월급, 더 많이 돌려받는 법 (2025년)",
    description:
      "연말정산, 더 이상 13월의 세금 폭탄이 아닙니다. 당신의 13월의 월급을 최대로 불려줄 모든 것을 알려드립니다.",
    images: ["/api/og?title=연말정산, 13월의 월급 만들기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연말정산 완벽 가이드: 13월의 월급, 더 많이 돌려받는 법 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-01-10",
  dateModified: currentDate,
  description:
    "2025년 연말정산의 모든 것. 소득공제와 세액공제의 차이, 주요 공제 항목, 그리고 절세 전략을 총정리합니다.",
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
        <div className="w-full bg-gradient-to-br from-blue-600 to-sky-700 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연말정산, 13월의 월급
            <br /> 만드는 완벽 가이드
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-sky-100 dark:text-gray-300">
            매년 초, 누군가는 13월의 월급을 받고 누군가는 세금 폭탄을 맞습니다. 그 차이는 '연말정산'을 얼마나 아느냐에 달려있습니다. 아는 만큼 돌려받는 연말정산의 모든 것을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-sky-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연말정산이란, 지난 1년간의 내 소득에 대해 이미 납부한 세금(원천징수된 소득세)을 다시 계산하여, 실제 내야 할 세금보다 더 냈으면 돌려받고, 덜 냈으면 추가로 납부하는 절차입니다. 즉, 1년치 월급에 대한 '세금 정산'인 셈이죠.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-500" />
                소득공제 vs 세액공제, 차이점만 알면 끝!
              </h2>
              <p>
                연말정산의 핵심은 '소득공제'와 '세액공제'입니다. 두 가지 모두 세금을 줄여주지만, 방식이 다릅니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300 flex items-center gap-2"><TrendingDown className="w-5 h-5"/> 소득공제</h3>
                  <p className="!text-sm !my-0">
                    <strong>세금을 매기는 기준(과세표준) 자체를 줄여주는 것.</strong> 소득이 높을수록 적용되는 세율이 높기 때문에, 고소득자에게 절세 효과가 더 큽니다. (예: 인적공제, 신용카드 공제)
                  </p>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> 세액공제</h3>
                  <p className="!text-sm !my-0">
                    <strong>이미 계산된 세금 자체를 직접 깎아주는 것.</strong> 소득 수준과 관계없이 모두에게 동일한 절세 효과가 있습니다. (예: 월세 세액공제, 연금계좌 세액공제)
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">직장인 필수 공제 항목 BEST 5</h2>
              <p>다른 건 몰라도 이 5가지는 반드시 챙겨야 합니다.</p>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">1. 신용카드 등 사용금액 소득공제</h3>
                  <p className="!text-sm !my-0">총 급여의 25%를 초과하는 사용액부터 공제 대상입니다. 신용카드(15%), 체크카드/현금영수증(30%), 대중교통(40%), 전통시장(40%) 등 공제율이 다르므로 전략적인 소비가 필요합니다.</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">2. 월세 세액공제</h3>
                  <p className="!text-sm !my-0">총 급여 7천만원 이하 무주택자라면, 연 750만원 한도 내에서 월세액의 15% 또는 17%를 세금에서 직접 돌려받을 수 있는 강력한 공제입니다.</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">3. 교육비 세액공제</h3>
                  <p className="!text-sm !my-0">본인 및 부양가족(자녀, 배우자 등)을 위해 지출한 교육비의 15%를 세액공제 받을 수 있습니다. (본인 한도 없음, 자녀 1인당 300만원 등)</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">4. 의료비 세액공제</h3>
                  <p className="!text-sm !my-0">총 급여의 3%를 초과하는 의료비 지출액의 15%를 세액공제 받을 수 있습니다. (본인, 65세 이상 부양가족, 장애인은 한도 없음)</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">5. 연금계좌 세액공제</h3>
                  <p className="!text-sm !my-0">연금저축펀드, IRP에 납입한 금액에 대해 최대 900만원 한도로 13.2% 또는 16.5%의 세액공제를 받을 수 있는, 직장인 최고의 절세 상품입니다.</p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <Gift className="w-6 h-6" /> 13월의 월급, 최대로 만드는 최종 전략
              </h2>
              <p className="!my-2 text-base">
                연말정산은 '소비'를 통해 공제받는 것보다, '저축/투자'를 통해 공제받는 것이 가장 현명합니다. 아래 두 가지는 반드시 챙기세요.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/guides/pension-savings-fund-vs-irp-which-is-right-for-me" className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center hover:shadow-md">
                  <p className="font-bold !my-0">연금계좌 세액공제</p>
                  <p className="text-sm text-blue-600 !my-0">최대 148.5만원 환급받기 →</p>
                </Link>
                <Link href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account" className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center hover:shadow-md">
                  <p className="font-bold !my-0">ISA 만기자금 연금 전환</p>
                  <p className="text-sm text-blue-600 !my-0">추가 10% 세액공제 받기 →</p>
                </Link>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                내 연말정산 환급금, 미리 계산해볼까?
              </h2>
              <p className="mt-4">
                총 급여와 부양가족, 주요 공제 항목만 입력하면, <br/>
                내가 얼마를 돌려받을 수 있는지 미리 계산해볼 수 있습니다.
              </p>
              <Link
                href="/year-end-tax"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Calculator className="inline-block w-5 h-5 mr-2" />
                연말정산 계산기 바로가기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
