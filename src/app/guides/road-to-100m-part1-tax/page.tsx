import type { Metadata } from "next";
import Link from "next/link";
import { Target, TrendingUp, ShieldCheck, Landmark, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연봉 1억 실수령액과 현실적인 절세 전략 (2025년)",
  description:
    "꿈의 연봉 1억, 실수령액은 약 650만원? 35% 소득세율 구간에 진입하는 고소득자를 위한 현실적인 세금 이야기와 연금계좌, ISA를 활용한 필수 절세 전략을 공개합니다.",
  openGraph: {
    title: "연봉 1억 실수령액과 현실적인 절세 전략 (2025년)",
    description:
      "연봉 1억의 꿈, 세금 앞에서 좌절하지 마세요. 고소득 직장인을 위한 필수 절세 전략을 알려드립니다.",
    images: ["/api/og?title=연봉 1억, 세금부터 제대로 알자"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 1억 실수령액과 현실적인 절세 전략 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-03-01",
  dateModified: currentDate,
  description:
    "연봉 1억 직장인을 위한 현실적인 세금 이야기와 연금계좌, ISA를 활용한 필수 절세 전략을 공개합니다.",
};

export default function RoadTo100MPart1TaxGuidePage() {
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
            연봉 1억 로드맵 ①
            <br /> 세금부터 제대로 알자
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
            많은 직장인들의 꿈, '연봉 1억'. 하지만 막상 도달하고 나면 예상보다 적은 실수령액에 놀라게 됩니다. 그 이유인 '세금'에 대해 제대로 공부하고, 1억의 가치를 지키는 법을 알아봅니다.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              '연봉 1억'은 성공의 상징처럼 여겨지지만, 동시에 높은 세금 부담이 시작되는 구간이기도 합니다. 월급은 833만원이지만, 각종 세금과 4대 보험을 떼고 나면 통장에 찍히는 돈은 약 650만원. 거의 200만원 가까운 돈이 사라지는 셈입니다. 연봉 1억의 꿈을 제대로 누리기 위해선, 세금 공부가 필수입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-red-500" />
                연봉 1억, 왜 세금이 무겁게 느껴질까?
              </h2>
              <p>
                가장 큰 이유는 <strong>소득세율 구간</strong>이 달라지기 때문입니다. 우리나라는 소득이 높을수록 높은 세율을 적용하는 '누진세' 구조를 따릅니다. 연봉 1억은 과세표준(세금을 매기는 기준 금액)상 <strong>35%</strong>라는 높은 세율이 적용되는 구간에 진입하게 됩니다.
              </p>
              <div className="overflow-x-auto mt-6">
                <h3 className="!text-xl font-bold text-center mb-4">2025년 소득세율표</h3>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-3 font-semibold">과세표준 (Taxable Income)</th>
                      <th className="p-3 font-semibold">세율 (Tax Rate)</th>
                      <th className="p-3 font-semibold">누진공제액</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700"><td className="p-3">1,400만원 이하</td><td className="p-3">6%</td><td className="p-3">0원</td></tr>
                    <tr className="border-b dark:border-gray-700"><td className="p-3">1,400만원 ~ 5,000만원</td><td className="p-3">15%</td><td className="p-3">126만원</td></tr>
                    <tr className="border-b dark:border-gray-700"><td className="p-3">5,000만원 ~ 8,800만원</td><td className="p-3">24%</td><td className="p-3">576만원</td></tr>
                    <tr className="border-b dark:border-gray-700 bg-red-50 dark:bg-red-900/20"><td className="p-3 font-bold">8,800만원 ~ 1.5억원</td><td className="p-3 font-bold">35%</td><td className="p-3 font-bold">1,544만원</td></tr>
                    <tr className="border-b dark:border-gray-700"><td className="p-3">1.5억원 ~ 3억원</td><td className="p-3">38%</td><td className="p-3">1,994만원</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-green-600" />
                연봉 1억 직장인 필수 절세 전략
              </h2>
              <p>
                높은 세금을 피할 수는 없지만, 합법적으로 줄일 방법은 있습니다. 연봉 1억 이상이라면 아래 두 가지는 선택이 아닌 필수입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Landmark className="w-6 h-6" /> 1. 연금계좌 (연금저축+IRP)
                  </h3>
                  <p className="!text-sm !my-0">
                    연간 최대 900만원까지 납입하여 세금을 돌려받는 최고의 절세 상품입니다. 총 급여 5,500만원 초과 시 <strong>13.2%</strong>의 세율이 적용되어, <strong>최대 118.8만원</strong>의 세금을 연말정산 시 그대로 돌려받습니다.
                  </p>
                   <Link href="/guides/pension-savings-fund-vs-irp-which-is-right-for-me" className="text-sm font-bold text-green-600 hover:underline mt-2 inline-block">자세히 알아보기 →</Link>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Target className="w-6 h-6" /> 2. ISA (개인종합자산관리계좌)
                  </h3>
                  <p className="!text-sm !my-0">
                    '만능 절세 통장'으로, 수익에 대해 비과세 혜택을 제공합니다. 특히 연금계좌와 연계 시 추가 세액공제까지 가능해져 고소득자에게는 필수적인 재테크 통장입니다.
                  </p>
                  <Link href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account" className="text-sm font-bold text-green-600 hover:underline mt-2 inline-block">자세히 알아보기 →</Link>
                </div>
              </div>
            </section>

            <section className="mt-12 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">그래서, 연봉 1억의 진짜 내 월급은?</h2>
              <p className="mt-4 max-w-xl mx-auto">
                4대보험, 소득세, 그리고 각종 공제를 모두 반영한 1원 단위의 정확한 실수령액이 궁금하다면? 지금 바로 연봉 계산기로 확인해보세요.
              </p>
              <Link
                href="/salary"
                className="inline-block mt-6 py-3 px-6 bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-lg text-center font-bold text-md hover:bg-gray-900 dark:hover:bg-white transition-transform transform hover:scale-105 shadow-lg"
              >
                <Calculator className="inline-block w-5 h-5 mr-2" />
                연봉 1억 실수령액 계산하기
              </Link>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                연봉 1억을 향한 다음 스텝은?
              </h2>
              <p>
                세금 공부를 마쳤다면, 이제는 소득을 더 늘릴 차례입니다. <br />
                다음 편에서는 직장인 부업(사이드잡)으로 월 100만원 더 버는 현실적인 방법을 알아봅니다.
              </p>
              <Link
                href="/guides/road-to-100m-part2-sidejob"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                2편: 직장인 부업으로 월 100만원 더 벌기 💸
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}