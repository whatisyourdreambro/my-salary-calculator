import type { Metadata } from "next";
import Link from "next/link";
import { Shield, HeartPulse, Briefcase, HardHat, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "4대보험 완벽 정리 (2025년 요율) | 내 월급 공제액 계산하기",
  description:
    "국민연금, 건강보험(장기요양보험 포함), 고용보험, 산재보험. 2025년 최신 4대보험 요율과 정확한 월급 공제액 계산법을 알려드립니다. 내 연봉에서 실제로 얼마가 빠져나가는지 확인해보세요.",
  openGraph: {
    title: "4대보험 완벽 정리 (2025년 요율) | 내 월급 공제액 계산하기",
    description:
      "월급의 일부, 왜 떼어가는 걸까요? 4대 보험의 모든 것을 이해하고 내 진짜 월급을 확인하세요.",
    images: ["/api/og?title=4대보험, 2025년엔 얼마를 낼까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "4대보험 완벽 정리 (2025년 요율) | 내 월급 공제액 계산하기",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-01-15",
  dateModified: currentDate,
  description:
    "국민연금, 건강보험(장기요양보험료 포함), 고용보험, 산재보험의 역할과 2025년 최신 요율, 그리고 내 연봉에서 실제로 얼마가 공제되는지 계산해 보세요.",
};

export default function FourMajorInsurancesGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-gray-500 to-slate-600 dark:from-gray-900 dark:to-slate-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            4대보험, 내 월급의
            <br /> 보이지 않는 구성원
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-200 dark:text-gray-300">
            월급 명세서의 공제 항목을 볼 때마다 막막하셨나요? 나를 지켜주는 든든한 사회 안전망, 4대 보험의 모든 것을 정확한 2025년 기준으로 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-slate-300 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연봉 5,000만원을 12로 나누면 월 417만원인데, 왜 내 통장에는 350만원만 들어올까요? 바로 세금과 함께 <strong>4대 보험료</strong>가 공제되기 때문입니다. 대한민국 직장인이라면 의무적으로 가입하는 4대 보험, 어떤 것들이 있고 2025년에는 얼마나 내야 하는지 자세히 알아보겠습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-500" />
                나를 지키는 4개의 방패: 4대 보험
              </h2>
              <p>
                4대 보험은 질병, 실업, 노령, 산업재해 등 사회적 위험으로부터 모든 국민을 보호하기 위해 국가가 법으로 정한 사회보장제도입니다. 보험료는 회사(사업주)와 근로자가 함께 부담합니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <img src="/national-pension-icon.svg" className="w-6 h-6" alt="national pension icon"/> 국민연금 (노후 대비)
                  </h3>
                  <p className="!text-sm !my-0">
                    소득 활동을 할 때 꾸준히 납부했다가, 나이가 들어 생업에 종사하지 못할 때(은퇴, 장애, 사망 등) 연금으로 돌려받는 제도입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-red-500" /> 건강보험 (질병/부상 대비)
                  </h3>
                  <p className="!text-sm !my-0">
                    병원 진료, 치료, 수술 등 의료 서비스 이용 시 과도한 의료비 부담을 덜어주는 제도입니다. '장기요양보험'이 함께 부과됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-green-500" /> 고용보험 (실업 대비)
                  </h3>
                  <p className="!text-sm !my-0">
                    실직했을 때 일정 기간 실업급여를 지급하여 재취업 활동을 돕고 생계를 지원하는 제도입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <HardHat className="w-6 h-6 text-orange-500" /> 산재보험 (업무상 재해 대비)
                  </h3>
                  <p className="!text-sm !my-0">
                    업무 중 발생한 사고나 질병에 대해 치료비와 보상을 해주는 제도입니다. 유일하게 사업주가 전액 부담합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">2025년 4대보험 요율표</h2>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-4 font-semibold">구분</th>
                      <th className="p-4 font-semibold">근로자 부담</th>
                      <th className="p-4 font-semibold">사업주 부담</th>
                      <th className="p-4 font-semibold">합계</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="p-4 font-bold">국민연금</td>
                      <td className="p-4">4.5%</td>
                      <td className="p-4">4.5%</td>
                      <td className="p-4">9.0%</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="p-4 font-bold">건강보험</td>
                      <td className="p-4">3.545%</td>
                      <td className="p-4">3.545%</td>
                      <td className="p-4">7.09%</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="p-4 font-bold text-sm pl-8">ㄴ 장기요양보험</td>
                      <td colSpan={2} className="p-4 text-center">건강보험료의 12.95%</td>
                      <td className="p-4">-</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="p-4 font-bold">고용보험</td>
                      <td className="p-4">0.9%</td>
                      <td className="p-4">0.9% ~ 1.5%*</td>
                      <td className="p-4">-</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold">산재보험</td>
                      <td className="p-4">없음</td>
                      <td className="p-4">업종별 상이</td>
                      <td className="p-4">-</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-right mt-2 text-gray-500">* 고용보험의 사업주 부담분은 기업 규모에 따라 다릅니다.</p>
              </div>
            </section>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2 justify-center">
                <Calculator className="w-6 h-6" />
                연봉 5,000만원, 월 공제액은?
              </h2>
              <p className="!my-4 text-center">
                월 급여(과세 대상) 4,166,667원 기준, 2025년 4대보험 공제액 예시입니다.
              </p>
              <blockquote className="text-left !border-l-blue-500 bg-white dark:bg-slate-800 p-4 rounded-lg">
                 <ul className="!my-2 text-base space-y-2">
                  <li className="flex justify-between"><span> 국민연금 (4.5%):</span> <strong>약 187,500원</strong></li>
                  <li className="flex justify-between"><span> 건강보험 (3.545%):</span> <strong>약 147,708원</strong></li>
                  <li className="flex justify-between"><span> ㄴ 장기요양보험 (건보료의 12.95%):</span> <strong>약 19,128원</strong></li>
                  <li className="flex justify-between"><span> 고용보험 (0.9%):</span> <strong>약 37,500원</strong></li>
                  <li className="flex justify-between border-t pt-2 mt-2 border-gray-300 dark:border-gray-600"><span><strong>근로자 총 부담액:</strong></span> <strong className="text-red-500">약 391,836원</strong></li>
                </ul>
              </blockquote>
              <p className="text-sm text-center mt-4">
                여기에 근로소득세(약 28만원)까지 더하면, 월 공제액은 약 67만원에 달합니다.
              </p>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                내 연봉의 정확한 실수령액이 궁금하다면?
              </h2>
              <p className="mt-4">
                부양가족 수, 비과세 항목 등 개인의 조건에 따라 공제액은 달라집니다. <br />
                Moneysalary의 연봉 계산기로 1원 단위까지 정확한 내 월급을 확인해보세요.
              </p>
              <Link
                href="/salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 연봉 실수령액 계산하기 💸
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}