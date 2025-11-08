
import type { Metadata } from "next";
import Link from "next/link";
import { Building, TrendingUp, Award, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 대기업 신입 초봉 TOP 10: 꿈의 연봉, 어디까지 가능할까?",
  description:
    "취준생들의 로망, 대기업! 2025년 최신 데이터를 바탕으로 삼성, SK, 현대, LG 등 주요 대기업의 신입사원 초봉 순위를 공개합니다. 높은 연봉과 복지를 자랑하는 기업들을 확인하고 당신의 목표를 설정하세요.",
  openGraph: {
    title: "2025년 대기업 신입 초봉 TOP 10: 꿈의 연봉, 어디까지 가능할까?",
    description:
      "대기업 신입 초봉, 당신의 미래를 바꿀 수 있습니다. 2025년 최고 연봉 기업들을 지금 바로 확인하세요.",
    images: ["/api/og?title=2025년 대기업 신입 초봉 TOP 10"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 대기업 신입 초봉 TOP 10: 꿈의 연봉, 어디까지 가능할까?",
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
    "2025년 최신 데이터를 바탕으로 삼성, SK, 현대, LG 등 주요 대기업의 신입사원 초봉 순위를 공개합니다. 높은 연봉과 복지를 자랑하는 기업들을 확인하고 당신의 목표를 설정하세요.",
};

const top10SalaryData = [
  { rank: 1, company: "SK하이닉스", salary: "7,000만원 이상", note: "성과급 포함 시 1억 이상" },
  { rank: 2, company: "삼성전자 (DS)", salary: "6,500만원 이상", note: "성과급 포함 시 1억 이상" },
  { rank: 3, company: "네이버", salary: "6,000만원 이상", note: "개발직군 기준" },
  { rank: 4, company: "카카오", salary: "6,000만원 이상", note: "개발직군 기준" },
  { rank: 5, company: "현대자동차", salary: "6,000만원 이상", note: "성과급 포함 시 1억 근접" },
  { rank: 6, company: "LG전자", salary: "5,500만원 이상", note: "" },
  { rank: 7, company: "포스코", salary: "5,000만원 이상", note: "" },
  { rank: 8, company: "롯데케미칼", salary: "5,000만원 이상", note: "" },
  { rank: 9, company: "대한항공", salary: "4,500만원 이상", note: "" },
  { rank: 10, company: "KB국민은행", salary: "4,500만원 이상", note: "" },
];

export default function Top10LargeCorpSalary2025Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-700 to-indigo-800 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025년 대기업 신입 초봉 TOP 10,
            <br /> 당신의 꿈의 직장은?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            취업 준비생이라면 누구나 꿈꾸는 대기업! 2025년 최신 데이터를 바탕으로 국내 주요 대기업의 신입사원 초봉 순위를 공개합니다. 높은 연봉과 최고의 복지를 자랑하는 기업들을 확인하고 당신의 커리어 목표를 설정하세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              대기업 입사는 단순히 높은 연봉을 넘어 안정적인 직장 생활, 체계적인 교육 시스템, 그리고 다양한 복지 혜택까지 누릴 수 있는 기회입니다. 특히 최근 몇 년간 IT 및 반도체 산업의 호황으로 대기업 신입 초봉은 꾸준히 상승하여 '초봉 1억' 시대가 현실이 되고 있습니다. 과연 어떤 기업들이 높은 연봉을 자랑하는지, 지금부터 자세히 살펴보겠습니다.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Award className="w-6 h-6" />
                대기업 초봉, 무엇이 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>기본급 + 성과급:</strong> 대기업 연봉은 기본급 외에 매년 실적에 따라 지급되는 성과급(PS, PI, OPI, TAI 등)의 비중이 매우 큽니다. 초봉이 낮아 보여도 성과급을 포함하면 훨씬 높아지는 경우가 많습니다.
                </li>
                <li>
                  <strong>직무별 차이:</strong> 특히 IT 개발직군이나 연구직은 다른 직무보다 높은 연봉을 받는 경향이 있습니다.
                </li>
                <li>
                  <strong>복지 혜택:</strong> 연봉 외에 주택자금 대출, 의료비 지원, 자녀 학자금, 사내 식당 등 다양한 복지 혜택도 실질적인 소득과 직결됩니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Building className="w-7 h-7 text-green-500" />
                2025년 대기업 신입 초봉 순위 (예상)
              </h2>
              <p className="text-center">
                각 기업의 공시 자료, 채용 공고, 현직자 인터뷰 등을 종합하여 추정한 2025년 대기업 신입사원 초봉 순위입니다. (세전, 성과급 및 각종 수당 포함)
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">순위</th>
                      <th className="py-3 px-4 font-bold">기업명</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">신입 초봉 (예상)</th>
                      <th className="py-3 px-4 font-semibold">비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {top10SalaryData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">{item.rank}</td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">
                          {item.company}
                        </td>
                        <td className="py-4 px-4 font-bold text-lg text-signature-blue">
                          {item.salary}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                          {item.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 금액은 추정치이며, 직무, 개인 성과, 회사 실적에 따라 실제와 차이가 있을 수 있습니다.</p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                당신의 꿈의 직장, 지금 바로 도전하세요!
              </h2>
              <p>
                높은 연봉과 안정적인 미래를 꿈꾼다면, 대기업은 여전히 매력적인 선택지입니다. <br />
                Moneysalary의 다양한 커리어 가이드와 함께 당신의 목표를 달성하세요.
              </p>
              <Link
                href="/guides/salary-negotiation"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연봉 협상 잘하는 법 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
