
import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse, Hospital, TrendingUp, School, Moon, AlarmPlus, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "간호사 연봉 총정리: 빅5 신규 초봉, 수당, 실수령액 (2025년)",
  description:
    "간호사 연봉의 모든 것. 빅5 병원 신규 간호사 초봉부터 나이트/오버타임 수당을 포함한 '영끌 연봉'과 실수령액, 그리고 수간호사까지의 커리어 패스를 알려드립니다.",
  openGraph: {
    title: "간호사 연봉 총정리: 빅5 신규 초봉, 수당, 실수령액 (2025년)",
    description:
      "백의의 천사, 간호사의 진짜 연봉 이야기. 병원 규모별, 직급별 연봉을 확인하고 당신의 미래를 계획하세요.",
    images: ["/api/og?title=간호사 연봉, 얼마나 받을까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "간호사 연봉 총정리: 빅5 신규 초봉, 수당, 실수령액 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-07-30",
  dateModified: currentDate,
  description:
    "빅5 병원 신규 간호사 초봉부터 나이트/오버타임 수당, 직급별 연봉과 실수령액까지 상세히 알려드립니다.",
};

const nurseSalaryData = [
    { hospital: "빅5 병원", base: "4,800 ~ 5,200만원", total: "5,500 ~ 7,000만원+" },
    { hospital: "주요 상급종합병원", base: "4,500 ~ 4,800만원", total: "5,000 ~ 6,000만원" },
    { hospital: "종합병원 / 국립대병원", base: "4,000 ~ 4,500만원", total: "4,500 ~ 5,500만원" },
    { hospital: "개인병원 / 요양병원", base: "3,500만원 내외", total: "4,000만원 내외" },
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
            <br /> 현실과 미래 총정리
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-rose-100 dark:text-gray-300">
            고된 3교대 근무와 높은 업무 강도. 과연 간호사의 땀과 노력은 연봉으로 보상받고 있을까요? 병원 규모별 신규 간호사 초봉부터 '영끌 연봉'의 비밀까지 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-rose-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              간호사는 대표적인 전문직이지만, 병원 규모와 지역에 따라 연봉 차이가 매우 큰 직업 중 하나입니다. 특히 3교대 근무의 대가인 각종 수당이 더해져야 비로소 '진짜 월급'이 완성됩니다. 간호사 연봉의 구조를 이해하는 것이 커리어 계획의 첫걸음입니다.
            </p>

            <section className="mt-12 bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl border border-pink-200 dark:border-pink-800">
              <h2 className="!mt-0 !text-2xl font-bold text-pink-600 flex items-center gap-2">
                <HeartPulse className="w-6 h-6" />
                간호사 월급의 진짜 구성 (기본급 + α)
              </h2>
              <p className="!my-2 text-base">
                간호사의 '영끌 연봉'은 아래 수당들이 더해져 만들어집니다.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-bold !mt-0 !mb-1 flex items-center gap-1"><Moon className="w-4 h-4"/> 나이트 수당</h4>
                  <p className="!text-sm !my-0">가장 큰 추가 수입원. 1개당 7~10만원 수준으로, 월 6~8개 근무 시 <strong>40~80만원</strong>의 추가 수입이 발생합니다.</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-bold !mt-0 !mb-1 flex items-center gap-1"><AlarmPlus className="w-4 h-4"/> 오버타임 수당</h4>
                  <p className="!text-sm !my-0">정규 근무시간 외 추가 근무에 대한 보상. 병원마다 지급 방식과 규모가 천차만별이므로 입사 전 확인이 중요합니다.</p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Hospital className="w-7 h-7 text-blue-500" />
                병원 규모별 신규 간호사 연봉 (2025년 예상)
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">병원 종류</th>
                      <th className="py-3 px-4 font-semibold">계약 연봉(초봉)</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">'영끌' 연봉(예상)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {nurseSalaryData.map((item) => (
                      <tr key={item.hospital} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4 font-bold">{item.hospital}</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{item.base}</td>
                        <td className="py-4 px-4 font-bold text-lg text-signature-blue">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p className="text-xs text-center mt-2 text-gray-500">* '영끌' 연봉은 각종 수당, 상여금을 포함한 추정치이며, 개인의 근무 스케줄에 따라 실제와 차이가 클 수 있습니다.</p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">간호사 커리어 패스</h2>
              <p>
                힘든 신규 시절을 버티고 경력이 쌓이면, 연봉과 직급은 꾸준히 상승합니다. 일반적인 간호사의 커리어 경로는 다음과 같습니다.
              </p>
              <div className="w-full overflow-x-auto p-2">
                <div className="flex items-center justify-between text-center text-xs sm:text-sm whitespace-nowrap">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><strong>(1~3년차)</strong><br/>일반 간호사</div>
                    <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><strong>(3~7년차)</strong><br/>주임 간호사</div>
                    <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><strong>(8년차 이상)</strong><br/>수간호사</div>
                    <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><strong>(팀장급)</strong><br/>간호과장</div>
                </div>
              </div>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                5년 뒤, 내 연봉은 얼마나 오를까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                힘든 신규 시절을 버티고 경력이 쌓이면, 연봉은 얼마나 오를까요? 5년차 간호사의 현실적인 연봉과 미래를 확인해보세요.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                 <Link
                    href="/guides/nurse-5yr-salary"
                    className="inline-block py-3 px-6 bg-signature-blue text-white rounded-lg text-center font-semibold hover:bg-blue-700"
                >
                    5년차 간호사 연봉 가이드 보기 👩‍⚕️
                </Link>
                 <Link
                    href="/salary"
                    className="inline-block py-3 px-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-center font-semibold hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    <Calculator className="inline-block w-4 h-4 mr-1" />
                    실수령액 계산하기
                </Link>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}