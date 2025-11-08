import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, TrendingUp, PiggyBank, Landmark } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연봉 4500 실수령액, 세후 월급 320만원? (2025년 기준)",
  description:
    "연봉 4500만원 직장인의 세후 실수령액은 얼마일까요? 국민연금, 건강보험, 소득세 등 상세한 공제 내역을 포함한 2025년 최신 연봉 테이블 기준 월급을 확인하고, 재테크 팁도 얻어가세요.",
  openGraph: {
    title: "연봉 4500 실수령액, 세후 월급 320만원? (2025년 기준)",
    description:
      "내 연봉 4500만원, 통장에는 얼마나 찍힐까? 상세 공제 내역과 함께 당신의 진짜 월급을 알려드립니다.",
    images: ["/api/og?title=연봉 4500만원, 실수령액은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 4500 실수령액, 세후 월급 320만원? (2025년 기준)",
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
    "연봉 4500만원 직장인의 2025년 기준 세후 실수령액과 상세 공제 내역, 그리고 재테크 팁을 알려드립니다.",
};

const deductionData = [
    { item: "월 예상 소득(세전)", amount: "3,750,000원" },
    { item: "국민연금 (4.5%)", amount: "약 168,750원" },
    { item: "건강보험 (3.545%)", amount: "약 132,930원" },
    { item: "고용보험 (0.9%)", amount: "약 33,750원" },
    { item: "근로소득세 (간이세액)", amount: "약 123,430원" },
    { item: "공제액 합계", amount: "약 458,860원" },
];

export default function Salary4500GuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-sky-500 to-blue-600 dark:from-gray-900 dark:to-sky-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연봉 4,500만원,
            <br /> 내 통장엔 얼마가 찍힐까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            사회초년생 딱지를 떼고 대리급으로 향하는 길목, 연봉 4,500만원. 세금 떼고 내 손에 들어오는 진짜 월급은 얼마인지, 상세 공제 내역과 함께 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-blue-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연봉 4,500만원은 월급으로 환산하면 375만원입니다. 하지만 각종 세금과 4대 보험료를 공제하고 나면, 실제 통장에 입금되는 금액은 이보다 훨씬 적습니다. 2025년 기준으로 연봉 4,500만원 직장인의 실제 월급 명세서를 파헤쳐 보겠습니다.
            </p>

            <section className="mt-12 text-center bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2 justify-center">
                <Calculator className="w-6 h-6" />
                연봉 4,500만원 월 실수령액 (예상)
              </h2>
              <p className="text-4xl font-bold my-2 text-signature-blue">
                약 3,291,140원
              </p>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                (월 375만원 중 약 46만원 공제)
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                (1인 가구, 비과세액 20만원 기준, 2025년 4대보험 요율 적용)
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-500" />
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
                <PiggyBank className="w-6 h-6" /> 재테크 팁: 월 50만원, 어떻게 굴릴까?
              </h2>
              <p className="!my-2 text-base">
                월 300만원 이상을 수령하기 시작했다면, 본격적으로 종잣돈을 모으고 투자를 시작해야 할 때입니다. 월 50만원씩 꾸준히 모아 투자를 시작해보세요.
              </p>
               <ul className="!my-2 space-y-1 text-base">
                  <li><strong>1순위:</strong> <Link href="/guides/road-to-100m-part1-tax" className="font-bold text-yellow-800 hover:underline">연금저축/IRP (연 900만원 한도)</Link> - 세액공제를 통한 확정 수익 확보</li>
                  <li><strong>2순위:</strong> <Link href="/guides/road-to-100m-part3-invest" className="font-bold text-yellow-800 hover:underline">미국 지수 추종 ETF</Link> - 장기적인 우상향과 복리 효과</li>
                </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                내 연봉, 더 정확하게 계산하고 싶다면?
              </h2>
              <p>
                부양가족, 자녀 수, 비과세액 등을 직접 입력하여 <br />
                1원 단위까지 정확한 실수령액을 계산해보세요.
              </p>
              <Link
                href="/?salaryInput=45,000,000&payBasis=annual"
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