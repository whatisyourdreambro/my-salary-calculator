
import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, PiggyBank, ShieldCheck, Wallet } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연봉 1억 실수령액, 세후 월급 650만원? 세금 폭탄 피하는 법 (2025년)",
  description:
    "꿈의 연봉 1억, 하지만 실수령액은 650만원? 높은 소득세율 구간에 진입하는 연봉 1억 직장인들을 위한 현실적인 세금 이야기와 IRP, 연금저축펀드, ISA를 활용한 필수 절세 전략을 공개합니다. 당신의 1억을 온전히 지키세요.",
  openGraph: {
    title: "연봉 1억 실수령액, 세후 월급 650만원? 세금 폭탄 피하는 법 (2025년)",
    description:
      "연봉 1억의 꿈, 세금 앞에서 좌절하지 마세요. 고소득 직장인을 위한 필수 절세 전략을 알려드립니다.",
    images: ["/api/og?title=연봉 1억, 세금 폭탄 피하기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 1억 실수령액, 세후 월급 650만원? 세금 폭탄 피하는 법 (2025년)",
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
    "연봉 1억 직장인을 위한 현실적인 세금 이야기와 IRP, 연금저축펀드, ISA를 활용한 필수 절세 전략을 공개합니다. 당신의 1억을 온전히 지키세요.",
};

const deductionData = [
    { item: "월 예상 소득(세전)", amount: "8,333,333원" },
    { item: "국민연금 (4.5%)", amount: "약 202,500원" }, // 상한액 적용
    { item: "건강보험 (3.545%)", amount: "약 295,290원" },
    { item: "고용보험 (0.9%)", amount: "약 75,000원" },
    { item: "근로소득세 (간이세액)", amount: "약 1,100,000원" },
    { item: "공제액 합계", amount: "약 1,672,790원" },
];

export default function Salary100MGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-red-500 to-orange-600 dark:from-gray-900 dark:to-red-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연봉 1억,
            <br /> 내 통장엔 얼마가 찍힐까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-orange-100 dark:text-gray-300">
            많은 직장인들의 꿈, '연봉 1억'. 하지만 막상 도달하고 나면 예상보다 적은 실수령액에 놀라게 됩니다. 그 이유인 '세금'에 대해 제대로 공부하고, 1억의 가치를 지키는 법을 알아봅니다.
          </p>
          <p className="mt-4 text-xs text-orange-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              '연봉 1억'은 성공의 상징처럼 여겨지지만, 동시에 높은 세금 부담이 시작되는 구간이기도 합니다. 월급은 833만원이지만, 각종 세금과 4대 보험을 떼고 나면 통장에 찍히는 돈은 약 650만원. 거의 200만원 가까운 돈이 사라지는 셈입니다. 연봉 1억의 꿈을 제대로 누리기 위해선, 세금 공부가 필수입니다.
            </p>

            <section className="mt-12 text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2 justify-center">
                <Calculator className="w-6 h-6" />
                연봉 1억 월 실수령액 (예상)
              </h2>
              <p className="text-4xl font-bold my-2 text-brand-red">
                약 6,660,543원
              </p>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                (월 833만원 중 약 167만원 공제)
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                (1인 가구, 비과세액 20만원 기준, 2025년 4대보험 요율 적용)
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Wallet className="w-7 h-7 text-green-500" />
                상세 공제 내역 (월 기준)
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">항목</th>
                      <th className="py-3 px-4 font-bold text-right">공제 금액 (예상)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {deductionData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className={`py-3 px-4 font-semibold ${index === 0 || index === deductionData.length - 1 ? 'font-bold' : ''}`}>{item.item}</td>
                        <td className={`py-3 px-4 text-right ${index === deductionData.length - 1 ? 'font-bold text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 부양가족 수, 비과세액, 연말정산 결과에 따라 실제 수령액은 달라질 수 있습니다.</p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <PiggyBank className="w-6 h-6" /> 재테크 팁: 세금 폭탄 피하고 자산 늘리기
              </h2>
              <p className="!my-2 text-base">
                연봉 1억은 소득세율 35% 구간에 진입하는 시점입니다. 적극적인 절세 전략과 함께 공격적인 자산 증식 투자를 병행해야 합니다.
              </p>
               <ul className="!my-2 space-y-1 text-base">
                  <li><strong>1순위:</strong> <Link href="/guides/road-to-100m-part1-tax" className="font-bold text-yellow-800 hover:underline">연금저축/IRP (연 900만원 한도)</Link> - 세액공제를 통한 확정 수익 확보
                  </li>
                  <li><strong>2순위:</strong> <Link href="/guides/road-to-100m-part3-invest" className="font-bold text-yellow-800 hover:underline">ISA 계좌</Link> - 비과세 혜택으로 투자 수익 극대화
                  </li>
                  <li><strong>3순위:</strong> <Link href="/guides/road-to-100m-part3-invest" className="font-bold text-yellow-800 hover:underline">해외 주식/ETF 투자</Link> - 글로벌 우량 자산에 분산 투자하여 복리 효과 극대화
                  </li>
                </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                내 연봉, 더 정확하게 계산하고 싶다면?
              </h2>
              <p>
                부양가족, 자녀 수, 비과세액 등을 직접 입력하여 <br />
                1원 단위까지 정확한 실수령액을 계산해보세요.
              </p>
              <Link
                href="/?salaryInput=100,000,000&payBasis=annual"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 연봉으로 실수령액 계산하기 🧐
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
