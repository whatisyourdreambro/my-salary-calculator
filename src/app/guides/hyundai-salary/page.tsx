import type { Metadata } from "next";
import Link from "next/link";
import { Car, BarChart2, TrendingUp, Building } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "현대자동차 연봉, 신입 초봉 1억? 직급별 연봉 총정리 (2025년)",
  description:
    "꿈의 직장, 현대자동차의 진짜 연봉이 궁금하신가요? 신입사원(초봉)부터 대리, 과장, 차장, 부장까지 직급별 평균 연봉과 성과급, 복지를 총정리했습니다.",
  openGraph: {
    title: "현대자동차 연봉, 신입 초봉 1억? 직급별 연봉 총정리 (2025년)",
    description:
      "킹차갓무직, 현대자동차의 직급별 연봉과 성과급의 모든 것을 파헤쳐봅니다.",
    images: ["/api/og?title=현대자동차 직급별 연봉 총정리"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "현대자동차 연봉, 신입 초봉 1억? 직급별 연봉 총정리 (2025년)",
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
    "신입사원(초봉)부터 대리, 과장, 차장, 부장까지 직급별 평균 연봉과 성과급, 복지를 총정리했습니다.",
};

const hyundaiSalaryData = [
  { rank: "신입 (사원)", avgSalary: "7,000만원 ~ 8,000만원", note: "성과급 포함 시 1억 근접" },
  { rank: "대리", avgSalary: "8,000만원 ~ 1억원", note: "" },
  { rank: "과장", avgSalary: "1억원 ~ 1.3억원", note: "" },
  { rank: "차장", avgSalary: "1.2억원 ~ 1.5억원", note: "" },
  { rank: "부장", avgSalary: "1.5억원 이상", note: "" },
];

export default function HyundaiSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-700 to-gray-800 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            현대자동차 연봉,
            <br /> 신입 초봉 1억 시대 열리나?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-200 dark:text-gray-300">
            '킹차갓무직'이라 불리며 취준생들의 워너비 직장으로 떠오른 현대자동차. 과연 그 명성만큼의 연봉을 받을까요? 신입사원부터 부장까지, 직급별 연봉을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-gray-300 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              최근 몇 년간 파격적인 성과급과 임금 인상으로 현대자동차의 위상이 달라졌습니다. 높은 연봉, 강력한 노조, 정년 보장, 그리고 자동차 할인까지. 현대자동차가 '꿈의 직장'으로 불리는 이유를 연봉부터 복지까지 샅샅이 분석해 드립니다.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Car className="w-6 h-6" />
                현대차 연봉의 핵심: 기본급 + α
              </h2>
              <p className="!my-2 text-base">
                현대자동차의 연봉은 단순히 기본급만으로 평가할 수 없습니다. 매년 터지는 역대급 <strong>성과급</strong>과 각종 <strong>복지 포인트, 차량 할인</strong> 혜택까지 더해야 진짜 연봉이 완성됩니다. 특히 성과급은 연봉의 30%를 넘나들며, '초봉 1억'의 현실화를 이끌고 있습니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <BarChart2 className="w-7 h-7 text-green-500" />
                직급별 평균 연봉 (2025년 예상, 성과급 포함)
              </h2>
              <p className="text-center">
                블라인드, 잡플래닛 등 현직자들의 데이터를 종합하여 추정한 직급별 평균 연봉입니다. (계약 연봉 기준, 성과급 및 각종 수당 포함 시)
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">직급</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">평균 연봉 (추정)</th>
                      <th className="py-3 px-4 font-semibold">비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {hyundaiSalaryData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">{item.rank}</td>
                        <td className="py-4 px-4 font-bold text-lg text-signature-blue">
                          {item.avgSalary}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                          {item.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 금액은 실제와 차이가 있을 수 있으며, 사업부 및 개인 성과에 따라 크게 달라질 수 있습니다.</p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Building className="w-7 h-7 text-indigo-500" />
                다른 기업 연봉과 비교해보고 싶다면?
              </h2>
              <p>
                삼성전자, SK하이닉스, 네이버, 카카오... 대한민국을 대표하는 다른 기업들의 연봉은 어떨까요? <br />
                Moneysalary의 기업별 연봉 가이드에서 확인해보세요.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/guides/samsung-vs-hynix"
                  className="inline-block py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-center font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  삼성 vs 하이닉스
                </Link>
                <Link
                  href="/guides/naver-vs-kakao"
                  className="inline-block py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-center font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  네이버 vs 카카오
                </Link>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}