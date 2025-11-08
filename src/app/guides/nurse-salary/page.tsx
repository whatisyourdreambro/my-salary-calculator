import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse, Hospital, TrendingUp, School } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "간호사 연봉, 빅5 병원 신규(신입)부터 수간호사까지 총정리",
  description:
    "간호사 연봉, 정말 짠가요? 빅5 대학병원, 상급종합병원, 종합병원, 개인병원까지! 신규 간호사 초봉부터 주임, 수간호사 직급별 연봉과 실수령액을 알려드립니다.",
  openGraph: {
    title: "간호사 연봉, 빅5 병원 신규(신입)부터 수간호사까지 총정리",
    description:
      "백의의 천사, 간호사의 진짜 연봉 이야기. 병원 규모별, 직급별 연봉을 확인하고 당신의 미래를 계획하세요.",
    images: ["/api/og?title=간호사 연봉, 얼마나 받을까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "간호사 연봉, 빅5 병원 신규(신입)부터 수간호사까지 총정리",
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
    "빅5 대학병원, 상급종합병원, 종합병원, 개인병원까지! 신규 간호사 초봉부터 직급별 연봉과 실수령액을 알려드립니다.",
};

const nurseSalaryData = [
  {
    hospital: "빅5 병원 (서울대, 세브란스 등)",
    newNurse: "5,000만원 이상",
    chargeNurse: "7,000만원 이상",
  },
  {
    hospital: "주요 상급종합병원",
    newNurse: "4,500만원 ~ 5,000만원",
    chargeNurse: "6,000만원 ~ 7,000만원",
  },
  {
    hospital: "종합병원 / 국립대병원",
    newNurse: "4,000만원 ~ 4,500만원",
    chargeNurse: "5,500만원 ~ 6,500만원",
  },
  {
    hospital: "개인병원 / 요양병원",
    newNurse: "3,500만원 내외",
    chargeNurse: "5,000만원 내외",
  },
];

export default function NurseSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-pink-400 to-rose-500 dark:from-gray-900 dark:to-rose-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            간호사 연봉,
            <br /> 병원별 차이와 현실
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-rose-100 dark:text-gray-300">
            고된 3교대 근무와 높은 업무 강도, '태움' 문화까지... 간호사의 길은 험난합니다. 과연 그들의 땀과 노력은 연봉으로 보상받고 있을까요? 병원 규모별 연봉을 알아봅니다.
          </p>
          <p className="mt-4 text-xs text-rose-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              간호사는 대표적인 전문직이지만, 병원 규모와 지역에 따라 연봉 차이가 매우 큰 직업 중 하나입니다. 흔히 말하는 '빅5 병원' 신규 간호사는 대기업 신입사원 못지않은 높은 초봉을 받지만, 동네 개인병원의 경우 상대적으로 낮은 연봉을 받는 것이 현실입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HeartPulse className="w-7 h-7 text-red-500" />
                연봉을 결정하는 요소들
              </h2>
              <p>
                간호사 연봉은 단순히 기본급만으로 결정되지 않습니다. 3교대 근무의 대가인 <strong>나이트 수당</strong>, 그리고 병원의 규모와 수익에 따른 <strong>상여금</strong>이 연봉의 상당 부분을 차지합니다.
              </p>
              <blockquote className="!border-l-pink-500">
                <p>
                  <strong>'영끌' 연봉의 비밀:</strong> 신규 간호사의 계약 연봉이 4,000만원이더라도, 한 달에 나이트 근무를 몇 번 하느냐에 따라 실수령액은 5,000만원을 훌쩍 넘길 수 있습니다. 병원 선택 시 기본급뿐만 아니라 수당과 상여금 규모를 반드시 확인해야 하는 이유입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Hospital className="w-7 h-7 text-blue-500" />
                병원 규모별 평균 연봉 (2025년 예상)
              </h2>
              <p className="text-center">
                신규 간호사 및 5~10년차 책임(주임)급 간호사의 평균 연봉 추정치입니다. (세전, 각종 수당 및 상여금 포함)
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">병원 종류</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">신규(초봉)</th>
                      <th className="py-3 px-4 font-bold text-green-600">책임(5~10년차)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {nurseSalaryData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">{item.hospital}</td>
                        <td className="py-4 px-4 font-semibold text-signature-blue">
                          {item.newNurse}
                        </td>
                        <td className="py-4 px-4 font-semibold text-green-600">
                          {item.chargeNurse}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 금액은 실제와 차이가 있을 수 있으며, 병원 정책 및 개인의 근무 스케줄에 따라 달라질 수 있습니다.</p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                5년 뒤, 내 연봉은 얼마나 오를까?
              </h2>
              <p>
                힘든 신규 시절을 버티고 경력이 쌓이면, 연봉은 얼마나 오를까요? <br />
                Moneysalary의 5년차 간호사 연봉 가이드에서 당신의 미래를 확인해보세요.
              </p>
              <Link
                href="/guides/nurse-5yr-salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                5년차 간호사 연봉 가이드 보기 👩‍⚕️
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}