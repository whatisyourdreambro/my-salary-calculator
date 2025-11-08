import type { Metadata } from "next";
import Link from "next/link";
import { BarChart2, TrendingUp, HelpCircle, Award } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 공무원 봉급표, 9급부터 1급까지 실수령액 총정리",
  description:
    "안정적인 직업의 대명사, 공무원! 2025년 최신 봉급표를 기준으로 9급, 7급, 5급 등 주요 직급별 연봉과 실제 통장에 찍히는 월급을 자세히 알려드립니다.",
  openGraph: {
    title: "2025년 공무원 봉급표, 9급부터 1급까지 실수령액 총정리",
    description:
      "나라를 위해 일하는 당신의 연봉, 얼마나 될까요? 2025년 공무원 직급별 연봉과 실수령액을 확인해보세요.",
    images: ["/api/og?title=2025년 공무원 봉급표 완벽 분석"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 공무원 봉급표, 9급부터 1급까지 실수령액 총정리",
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
    "2025년 최신 공무원 봉급표를 기준으로 9급, 7급, 5급 등 주요 직급별 연봉과 실제 통장에 찍히는 월급을 자세히 알려드립니다.",
};

const civilServantSalaryData = [
  { rank: "9급 1호봉", baseSalary: "187만원", expectedPostTax: "약 170만원" },
  { rank: "7급 1호봉", baseSalary: "220만원", expectedPostTax: "약 200만원" },
  { rank: "5급 1호봉", baseSalary: "280만원", expectedPostTax: "약 250만원" },
  { rank: "교사 1호봉", baseSalary: "210만원", expectedPostTax: "약 190만원" },
  { rank: "경찰/소방(순경/소방사) 1호봉", baseSalary: "187만원", expectedPostTax: "약 170만원" },
];

export default function CivilServantSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-gray-900 dark:to-blue-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025년 공무원 봉급,
            <br /> 내 월급은 얼마일까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            국민을 위해 봉사하는 공무원, 그 안정성만큼이나 궁금한 것이 바로 연봉입니다. 2025년 최신 봉급표를 기준으로 당신의 진짜 월급을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &quot;공무원은 박봉이다?&quot; 옛말입니다. 물론 대기업처럼 폭발적인 연봉 상승을 기대하기는 어렵지만, 각종 수당과 공무원연금 등 숨겨진 혜택까지 고려하면 결코 적지 않은 보수입니다. 이 글에서는 공무원 봉급 체계의 모든 것을 파헤쳐봅니다.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Award className="w-6 h-6" />
                공무원 월급, 핵심 포인트!
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>기본급 + 수당 = 진짜 월급:</strong> 봉급표의 기본급에 각종 수당(정근수당, 명절휴가비, 초과근무수당 등)이 더해져 최종 월급이 결정됩니다.
                </li>
                <li>
                  <strong>호봉제의 마법:</strong> 매년 꾸준히 호봉이 오르면서 기본급이 상승하는 안정적인 구조입니다.
                </li>
                <li>
                  <strong>다양한 직렬:</strong> 일반행정직, 교육직, 경찰/소방직 등 직렬에 따라 봉급과 수당 체계가 다릅니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-amber-500" />
                봉급표, 어떻게 봐야 할까요?
              </h2>
              <p>
                공무원 봉급은 '기본급'과 '수당'으로 구성됩니다. 인사혁신처에서 매년 발표하는 '공무원 봉급표'는 이 중 기본급에 해당합니다. 여기에 개인별로 해당하는 각종 수당이 추가되어 실수령액이 결정되는 구조입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">
                    기본급 (봉급)
                  </h3>
                  <p className="!text-sm !my-0">
                    직급과 호봉에 따라 정해진 고정 급여. 모든 보수의 기준이 됩니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">
                    수당
                  </h3>
                  <p className="!text-sm !my-0">
                    정근수당, 가족수당, 초과근무수당 등 근무 조건과 개인 상황에 따라 추가로 지급되는 보수입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <BarChart2 className="w-7 h-7 text-green-500" />
                주요 직급별 초임 봉급 (2025년 예상)
              </h2>
              <p className="text-center">
                주요 공무원 직렬의 초임(1호봉) 기준 월 예상 실수령액입니다. (1인 가구, 비과세액 20만원 기준)
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">직급(호봉)</th>
                      <th className="py-3 px-4 font-semibold">월 기본급</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">
                        월 세후 (예상)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {civilServantSalaryData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">{item.rank}</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {item.baseSalary}
                        </td>
                        <td className="py-4 px-4 font-bold text-lg text-signature-blue">
                          {item.expectedPostTax}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 금액은 각종 수당(초과근무, 직급보조비 등)이 제외된 기본급 기준의 예상 실수령액입니다.</p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />내 실수령액, 정확히 계산하고 싶다면?
              </h2>
              <p>
                각종 수당과 공제 내역을 모두 반영한 정확한 실수령액이 궁금하신가요? <br />
                Moneysalary 계산기에 직접 입력하여 1원 단위까지 정확한 내 월급을 확인해보세요.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 월급 실수령액 계산하기 🧐
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}