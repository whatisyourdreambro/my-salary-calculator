
import type { Metadata } from "next";
import Link from "next/link";
import { Car, TrendingDown, CalendarCheck, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "자동차세 연납 할인, 2025년부터 3%로 축소 (최신 정보)",
  description:
    "2025년부터 자동차세 연납 할인율이 3%로 줄어듭니다. 변경된 할인율, 신청 기간 및 방법, 연납이 여전히 유리한지 꼼꼼히 따져보고 현명하게 절약하는 방법을 알려드립니다.",
  openGraph: {
    title: "2025년 자동차세 연납, 할인율 3%로 축소! 계속 해야 할까?",
    description:
      "매년 1월의 쏠쏠한 재테크, 자동차세 연납 할인율이 2025년부터 변경됩니다. 최신 정보를 확인하고 현명한 선택을 하세요.",
    images: ["/api/og?title=2025년 자동차세 연납, 할인율 3%로 축소!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "자동차세 연납 할인, 2025년부터 3%로 축소 (최신 정보)",
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
  dateModified: `${year}-${month}-${day}`,
  description:
    "2025년부터 자동차세 연납 할인율이 3%로 줄어듭니다. 변경된 할인율에 따라 연납이 여전히 유리한지, 신청 방법과 장단점까지 완벽하게 정리해 드립니다.",
};

export default function CarTaxAnnualPaymentGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-sky-600 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            자동차세 연납 할인,
            <br /> 2025년엔 3%로 변경됩니다
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-sky-100 dark:text-gray-300">
            매년 1월의 쏠쏠한 재테크였던 자동차세 연납 할인. 2025년부터 할인율이 축소됩니다. 변경된 내용과 함께 연납 제도를 200% 활용하는 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-sky-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              2025년부터 자동차세 연납 공제율이 기존 5%에서 3%로 변경됩니다. 할인 혜택이 줄어들면서 '연납을 계속 해야 할까?' 고민하는 분들이 많아졌습니다. 이 글에서는 변경된 할인율을 정확히 계산해보고, 연납의 장단점과 신청 방법을 완벽히 정리해 드립니다.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-red-700 flex items-center gap-2">
                <TrendingDown className="w-6 h-6" />
                왜 할인율이 계속 바뀌나요?
              </h2>
              <p className="!my-2 text-base">
                자동차세 연납 할인은 과거 높은 금리 시절의 세수 조기 확보를 위한 혜택이었습니다. 하지만 저금리 시대가 이어지고, 다른 세금과의 형평성 문제가 제기되면서 정부는 2021년부터 할인율을 점진적으로 축소하고 있습니다. 2023년 7%, 2024년 5%를 거쳐 2025년부터는 3%가 적용됩니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Car className="w-7 h-7 text-green-500" />
                그래서, 얼마나 할인되나요? (2025년 기준)
              </h2>
              <p>
                자동차세 연납 할인은 '1년치 세금'의 3%가 아닌, '납부 시점 이후 기간에 해당하는 세액'의 3%가 할인됩니다. 따라서 1월에 신청해야 가장 큰 할인 혜택을 받을 수 있습니다.
              </p>
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-4 font-semibold">납부월</th>
                      <th className="p-4 font-semibold">할인 대상 기간</th>
                      <th className="p-4 font-semibold">공제율</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="p-4 font-bold text-signature-blue">1월</td>
                      <td className="p-4">2월 ~ 12월 (11개월분)</td>
                      <td className="p-4">연세액의 약 2.75%</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="p-4">3월</td>
                      <td className="p-4">4월 ~ 12월 (9개월분)</td>
                      <td className="p-4">연세액의 약 2.25%</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="p-4">6월</td>
                      <td className="p-4">7월 ~ 12월 (6개월분)</td>
                      <td className="p-4">연세액의 약 1.5%</td>
                    </tr>
                    <tr>
                      <td className="p-4">9월</td>
                      <td className="p-4">10월 ~ 12월 (3개월분)</td>
                      <td className="p-4">연세액의 약 0.75%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <blockquote className="!border-l-green-500 mt-6">
                <p>
                  <strong>예시:</strong> 2,000cc 신차 (연세액 약 52만원) 기준, <br />
                  1월에 연납하면 <strong>약 14,300원</strong>을 절약할 수 있습니다. (52만원 × 334/365일 × 3%)
                </p>
              </blockquote>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <CalendarCheck className="w-6 h-6" /> 자동차세 연납 신청 방법
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>신청 기간:</strong> 매년 1월 16일 ~ 1월 31일 (1월 연납 기준)
                </li>
                <li>
                  <strong>신청 방법:</strong>
                  <ul className="!my-1 list-disc list-inside text-sm">
                    <li>위택스(www.wetax.go.kr) 또는 서울시 이택스(etax.seoul.go.kr) 홈페이지</li>
                    <li>관할 시/군/구청 세무과 방문 또는 전화</li>
                    <li>스마트폰 세금 납부 앱 (스마트 위택스 등)</li>
                  </ul>
                </li>
              </ul>
              <p className="!my-2 text-base">
                한 번 연납 신청을 하면 다음 해부터는 별도로 신청하지 않아도 자동으로 연납 고지서가 발송됩니다. 만약 차량을 매매하거나 폐차하는 경우, 남은 기간에 대한 자동차세는 환급받을 수 있습니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Lightbulb className="w-7 h-7 text-indigo-500" />
                연납, 2025년에도 여전히 이득일까?
              </h2>
              <p>할인율이 줄었지만, 여전히 연납은 대부분의 경우에 유리합니다.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg text-green-800 dark:text-green-200">👍 장점</h3>
                  <ul className="!my-2 list-disc list-inside text-sm">
                    <li>시중 은행 예금 금리보다 높은 할인율</li>
                    <li>한 번에 납부하고 잊는 편리함</li>
                  </ul>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg text-red-800 dark:text-red-200">👎 단점</h3>
                  <ul className="!my-2 list-disc list-inside text-sm">
                    <li>목돈 지출에 대한 부담</li>
                    <li>신용카드 무이자 할부 혜택과 비교 필요</li>
                  </ul>
                </div>
              </div>
               <p className="mt-4 text-sm">
                <strong>결론:</strong> 단기 투자로 3% 이상의 수익을 낼 수 있는 상황이 아니라면, 연납은 여전히 가장 쉽고 안정적인 절약 방법입니다.
              </p>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                자동차 유지비, 세금만이 아니죠
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                줄어든 세금 할인보다 더 큰 부담은 매달 나가는 할부금일 수 있습니다. 새 차 구매를 계획 중이라면 '자동차 대출 계산기'로 현실적인 월 납입금을 먼저 확인해보세요.
              </p>
              <Link
                href="/car-loan"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                자동차 대출 계산기 바로가기 🚗
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
