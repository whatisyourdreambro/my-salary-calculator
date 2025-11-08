
import type { Metadata } from "next";
import Link from "next/link";
import { BarChart2, TrendingUp, HelpCircle, Award, Calculator, Gift } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 공무원 봉급표 및 수당, 실수령액 총정리 (9급, 7급)",
  description:
    "공무원 월급, 기본급만 보면 안됩니다! 2025년 최신 봉급표와 함께 정근수당, 명절휴가비 등 각종 수당이 더해진 실제 월급과 실수령액을 자세히 알려드립니다.",
  openGraph: {
    title: "2025년 공무원 봉급표 및 수당, 실수령액 총정리 (9급, 7급)",
    description:
      "나라를 위해 일하는 당신의 연봉, 얼마나 될까요? 2025년 공무원 직급별 연봉과 실수령액을 확인해보세요.",
    images: ["/api/og?title=2025년 공무원 봉급표 완벽 분석"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 공무원 봉급표 및 수당, 실수령액 총정리 (9급, 7급)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-07-25",
  dateModified: currentDate,
  description:
    "2025년 최신 공무원 봉급표와 각종 수당을 포함한 실제 월급 구조, 그리고 실수령액을 자세히 알려드립니다.",
};

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
            <br /> 내 진짜 월급은 얼마일까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            국민을 위해 봉사하는 공무원, 그 안정성만큼이나 궁금한 것이 바로 연봉입니다. 2025년 최신 봉급표와 각종 수당을 더한 당신의 '진짜 월급'을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              "공무원은 박봉이다?" 이 말은 반은 맞고 반은 틀립니다. 봉급표의 '기본급'만 보면 낮아 보이지만, 실제로는 각종 수당이 더해져 월급이 결정되기 때문입니다. 공무원 봉급 체계의 핵심인 '기본급'과 '수당'의 구조를 이해하는 것이 내 진짜 월급을 아는 첫걸음입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-amber-500" />
                공무원 월급 = 기본급(봉급) + 각종 수당
              </h2>
              <p>
                인사혁신처에서 매년 발표하는 '공무원 봉급표'는 기본급에 해당합니다. 여기에 아래와 같은 주요 수당들이 더해져 세전 월급이 완성됩니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">정액급식비</h3>
                  <p className="!text-sm !my-0">전 직원 대상 <strong>월 14만원</strong> 정액 지급</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">직급보조비</h3>
                  <p className="!text-sm !my-0">직급별 차등 지급 (9급 <strong>월 17.5만원</strong>, 7급 <strong>월 18.5만원</strong>)</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">명절휴가비</h3>
                  <p className="!text-sm !my-0">설날, 추석에 각각 <strong>월봉급액의 60%</strong> 지급</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">정근수당</h3>
                  <p className="!text-sm !my-0">근무 연수에 따라 1월, 7월에 지급 (최대 <strong>월봉급액의 50%</strong>)</p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                그래서, 9급 1호봉의 진짜 첫 월급은?
              </h2>
              <p className="!my-2 text-base">
                2025년 9급 1호봉의 기본급은 <strong>1,877,000원</strong>입니다. 여기에 매달 고정적으로 나오는 수당을 더해봅시다.
              </p>
              <blockquote className="!border-l-blue-500 !mt-4 !text-base bg-white dark:bg-gray-800 p-4 rounded">
                 <ul className="!my-2 space-y-2">
                  <li className="flex justify-between"><span>기본급 (9급 1호봉):</span> <strong>1,877,000원</strong></li>
                  <li className="flex justify-between"><span>+ 직급보조비 (9급):</span> <strong>175,000원</strong></li>
                  <li className="flex justify-between"><span>+ 정액급식비:</span> <strong>140,000원</strong></li>
                  <li className="flex justify-between border-t pt-2 mt-2 border-gray-300 dark:border-gray-600"><span><strong>월 급여액 (세전):</strong></span> <strong className="text-blue-600">2,192,000원</strong></li>
                </ul>
              </blockquote>
              <p className="!my-2 text-base">
                즉, 수당을 더한 월 급여는 약 219만원이며, 여기서 4대보험(공무원연금 기여금)과 소득세를 공제한 금액이 실수령액이 됩니다. 또한, 1월과 7월에는 정근수당, 설과 추석에는 명절휴가비가 추가되어 훨씬 더 많은 월급을 받게 됩니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">2025년 일반직 공무원 봉급표</h2>
              <p>
                아래는 2025년 일반직 공무원의 직급 및 호봉에 따른 월 기본급(봉급) 표입니다. (단위: 원)
              </p>
              <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
                <table className="w-full text-center text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-2 font-semibold">직급/호봉</th>
                      <th className="p-2 font-semibold">1호봉</th>
                      <th className="p-2 font-semibold">5호봉</th>
                      <th className="p-2 font-semibold">10호봉</th>
                      <th className="p-2 font-semibold">15호봉</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">9급</td><td className="p-2">1,877,000</td><td className="p-2">2,122,100</td><td className="p-2">2,555,900</td><td className="p-2">3,031,500</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">8급</td><td className="p-2">1,937,600</td><td className="p-2">2,283,200</td><td className="p-2">2,781,500</td><td className="p-2">3,298,900</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">7급</td><td className="p-2">2,086,700</td><td className="p-2">2,534,900</td><td className="p-2">3,110,500</td><td className="p-2">3,668,900</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">6급</td><td className="p-2">2,244,800</td><td className="p-2">2,791,500</td><td className="p-2">3,453,500</td><td className="p-2">4,062,100</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                내 직급과 호봉, 실수령액은?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                나의 예상 직급, 호봉, 그리고 각종 수당을 더한 '월 지급액'을 연봉으로 환산하여 입력해보세요. 정확한 세후 실수령액을 확인할 수 있습니다.
              </p>
              <Link
                href="/salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Calculator className="inline-block w-5 h-5 mr-2" />
                공무원 월급 실수령액 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}