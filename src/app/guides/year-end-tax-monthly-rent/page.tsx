import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, HelpCircle, Home, ReceiptText, TrendingUp } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연말정산 월세 세액공제, A to Z 완벽정리 | Moneysalary",
  description:
    "1년치 월세를 돌려받는 연말정산 월세 세액공제! 조건부터 신청 방법, 주의사항까지. 놓치지 말고 꼭 챙기세요.",
  openGraph: {
    title: "연말정산 월세 세액공제, A to Z 완벽정리",
    description:
      "월세 세액공제로 13월의 월급을 두둑하게! 당신의 절세 전략을 Moneysalary가 도와드립니다.",
    images: ["/api/og?title=연말정산 월세 세액공제 완벽 가이드"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연말정산 월세 세액공제, A to Z 완벽정리",
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
  datePublished: "2025-10-29",
  dateModified: currentDate,
  description:
    "1년치 월세를 돌려받는 연말정산 월세 세액공제! 조건부터 신청 방법, 주의사항까지. 놓치지 말고 꼭 챙기세요.",
};

export default function YearEndTaxMonthlyRentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-purple-500 to-pink-400 dark:from-gray-900 dark:to-purple-800/80 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연말정산 월세 세액공제,
            <br />
            놓치면 후회할 꿀팁
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-purple-100 dark:text-gray-300">
            매년 나가는 월세, 세액공제로 돌려받으세요! 복잡하게만 느껴지는 월세
            세액공제, Moneysalary가 쉽고 명확하게 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-purple-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &quot;월세는 그냥 나가는 돈?&quot; <br />
              아닙니다! 연말정산 시 월세 세액공제를 통해 상당 금액을 돌려받을 수
              있습니다. 하지만 많은 분들이 조건을 몰라 혜택을 놓치곤 하죠. 이
              글에서는 월세 세액공제의 모든 것을 파헤쳐 당신의 13월의 월급을
              두둑하게 만들어 드립니다.
            </p>

            {/* Key Takeaways Section */}
            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                핵심 요약 (Key Takeaways)
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>최대 17% 공제:</strong> 총 급여액에 따라 월세액의 최대
                  17%까지 세액공제 혜택을 받을 수 있습니다.
                </li>
                <li>
                  <strong>무주택 세대주 필수:</strong> 공제 대상은 무주택
                  세대주(또는 세대원)이며, 총 급여액 기준을 충족해야 합니다.
                </li>
                <li>
                  <strong>전입신고와 계약서:</strong> 월세 계약서와 전입신고는
                  필수! 확정일자는 받지 않아도 공제 가능합니다.
                </li>
                <li>
                  <strong>놓치면 아까운 혜택:</strong> 연말정산 시 누락했다면,
                  5년 이내 경정청구를 통해 소급 적용받을 수 있습니다.
                </li>
              </ul>
            </section>

            {/* Eligibility Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-indigo-500" />
                월세 세액공제, 누가 받을 수 있나요?
              </h2>
              <p>
                월세 세액공제는 주거 안정을 지원하기 위한 제도로, 일정한 조건을
                충족하는 근로소득자에게만 해당됩니다. 다음 조건을 꼼꼼히
                확인해보세요.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
                <li>
                  <strong>총 급여액 7천만원 이하</strong> (종합소득금액 6천만원
                  이하)
                </li>
                <li>
                  <strong>무주택 세대주</strong> (또는 세대원 중 근로소득자)
                </li>
                <li>
                  임대차 계약서상 주소지와 주민등록등본상 주소지가
                  <strong>동일</strong>해야 함
                </li>
                <li>
                  국민주택규모 (전용면적 85㎡ 또는 25.7평) 이하의 주택 또는
                  주거용 오피스텔, 고시원
                </li>
                <li>
                  임대차 계약서에 확정일자를 받지 않아도 공제 가능 (단, 전입신고는
                  필수)
                </li>
              </ul>
              <p className="mt-4">
                <strong className="text-red-500">주의:</strong> 배우자나
                부양가족이 주택을 소유하고 있다면 공제 대상에서 제외됩니다.
              </p>
            </section>

            {/* How to Apply Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <ReceiptText className="w-7 h-7 text-orange-500" />
                어떻게 신청하나요? (필요 서류)
              </h2>
              <p className="text-center">
                연말정산 간소화 서비스에서 자동으로 조회되지 않으므로, 직접 서류를
                준비하여 제출해야 합니다.
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">서류</th>
                      <th className="py-3 px-4 font-semibold">내용</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-bold">주민등록등본</td>
                      <td className="py-4 px-4">
                        주소지 확인 및 무주택 세대주 여부 확인
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-bold">임대차 계약서 사본</td>
                      <td className="py-4 px-4">
                        확정일자 여부와 관계없이 제출 (전입신고 필수)
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-bold">월세 이체 증명 서류</td>
                      <td className="py-4 px-4">
                        계좌이체 내역, 무통장입금증 등 월세 납입 증명
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-6">
                이 서류들을 준비하여 회사 연말정산 담당자에게 제출하거나, 홈택스를
                통해 직접 신청할 수 있습니다.
              </p>
            </section>

            {/* Related Guides Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Link href="/guides" className="text-signature-blue hover:underline">
                  <Home className="w-7 h-7 text-signature-blue" />
                  함께 보면 좋은 가이드
                </Link>
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
                <li>
                  <Link href="/guides/year-end-tax-settlement-deep-dive" className="text-signature-blue hover:underline">
                    연말정산, 놓치기 쉬운 공제 항목 TOP 10
                  </Link>
                </li>
                <li>
                  <Link href="/guides/donation-tax-credit-year-end-tax-settlement-효자-item" className="text-signature-blue hover:underline">
                    기부금 세액공제, 연말정산 효자템 완벽 활용법
                  </Link>
                </li>
                <li>
                  <Link href="/guides/housing-subscription-savings-priority" className="text-signature-blue hover:underline">
                    주택청약 1순위 조건, 5분 만에 완벽 정복
                  </Link>
                </li>
              </ul>
            </section>

            {/* Call to Action Section */}
            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                나의 연말정산, 얼마나 돌려받을 수 있을까?
              </h2>
              <p>
                복잡한 연말정산, Moneysalary의 연말정산 계산기로 예상 환급액을
                미리 확인하고 절세 전략을 세워보세요.
              </p>
              <Link
                href="/year-end-tax"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연말정산 계산기로 예상 환급액 확인하기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}