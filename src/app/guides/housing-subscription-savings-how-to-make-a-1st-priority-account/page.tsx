
import type { Metadata } from "next";
import Link from "next/link";
import { Home, Award, CheckCircle, Lightbulb, Star } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "주택청약 1순위 조건과 가점 높이는 법 (2025년 총정리)",
  description:
    "내 집 마련의 첫걸음, 주택청약! 국민주택과 민영주택 1순위 조건을 명확히 비교하고, 무주택기간, 부양가족 등 청약 가점을 높이는 핵심 전략을 알려드립니다.",
  openGraph: {
    title: "주택청약 1순위 조건과 가점 높이는 법 (2025년 총정리)",
    description:
      "청약 통장, 제대로 알고 활용하면 내 집 마련이 빨라집니다. 1순위 자격과 당첨 전략을 지금 바로 확인하세요.",
    images: ["/api/og?title=주택청약 1순위 조건과 가점 높이는 법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주택청약 1순위 조건과 가점 높이는 법 (2025년 총정리)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-04-10",
  dateModified: currentDate,
  description:
    "국민주택과 민영주택 1순위 조건을 비교하고, 무주택기간, 부양가족 등 청약 가점을 높이는 핵심 전략을 알려드립니다.",
};

const depositData = [
    { region: "서울/부산", size1: "300만원", size2: "600만원", size3: "1,000만원", size4: "1,500만원" },
    { region: "기타 광역시", size1: "250만원", size2: "400만원", size3: "700만원", size4: "1,000만원" },
    { region: "기타 시/군", size1: "200만원", size2: "300만원", size3: "400만원", size4: "500만원" },
]

export default function HousingSubscriptionGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-sky-600 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            주택청약 1순위,
            <br /> 어떻게 만들어야 할까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-sky-100 dark:text-gray-300">
            내 집 마련의 가장 확실한 지름길, 주택청약! 하지만 단순히 통장만 만든다고 끝이 아닙니다. 1순위 자격을 얻고 청약 당첨 확률을 높이는 전략을 지금 바로 확인하세요.
          </p>
          <p className="mt-4 text-xs text-sky-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              주택청약종합저축은 국민주택과 민영주택 모두에 청약할 수 있는 만능 통장으로, 내 집 마련을 위한 가장 기본적인 준비물입니다. 특히 청약 시장에서 유리한 고지를 점하기 위해서는 '1순위' 자격을 갖추는 것이 매우 중요합니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Award className="w-7 h-7 text-green-500" />
                청약 1순위 자격 조건 (2025년 기준)
              </h2>
              <p>
                1순위 자격은 크게 '국민주택'과 '민영주택'에 따라 다르며, 당첨자 선정 방식도 완전히 다릅니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-blue-700 dark:text-blue-300">국민주택 1순위</h3>
                  <ul className="!text-sm !my-2 list-disc list-inside space-y-1">
                    <li>청약통장 가입 기간 1년 이상 (수도권 외 6개월)</li>
                    <li>납입 횟수 12회 이상 (수도권 외 6회)</li>
                    <li>세대주 및 세대원 전원 무주택</li>
                  </ul>
                  <p className="!text-xs !font-semibold !mt-4">
                    <strong>핵심 전략:</strong> 납입 횟수와 <strong>총 납입인정금액(월 최대 10만원 인정)</strong>이 많은 '성실한 저축왕'이 절대적으로 유리합니다.
                  </p>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300">민영주택 1순위</h3>
                   <ul className="!text-sm !my-2 list-disc list-inside space-y-1">
                    <li>청약통장 가입 기간 1년 이상 (수도권 외 6개월)</li>
                    <li>지역별/면적별 예치 기준 금액 충족</li>
                    <li>세대주, 세대원 모두 청약 가능 (일부 제외)</li>
                  </ul>
                  <p className="!text-xs !font-semibold !mt-4">
                    <strong>핵심 전략:</strong> 예치금을 채운 후에는 <strong>'청약 가점'</strong>이 높은 순서대로 당첨자를 선정합니다. (추첨제 물량도 있음)
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
                <h2 className="!text-2xl font-bold">민영주택 청약 예치금 기준</h2>
                <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
                    <table className="w-full text-center text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th rowSpan={2} className="p-3 font-semibold border-r dark:border-gray-700">거주지</th>
                                <th colSpan={4} className="p-3 font-semibold">전용면적</th>
                            </tr>
                            <tr>
                                <th className="p-2 font-medium bg-gray-50 dark:bg-gray-700">85㎡ 이하</th>
                                <th className="p-2 font-medium bg-gray-50 dark:bg-gray-700">102㎡ 이하</th>
                                <th className="p-2 font-medium bg-gray-50 dark:bg-gray-700">135㎡ 이하</th>
                                <th className="p-2 font-medium bg-gray-50 dark:bg-gray-700">모든면적</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {depositData.map((item) => (
                                <tr key={item.region} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-3 font-bold">{item.region}</td>
                                    <td className="p-3">{item.size1}</td>
                                    <td className="p-3">{item.size2}</td>
                                    <td className="p-3">{item.size3}</td>
                                    <td className="p-3">{item.size4}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Star className="w-6 h-6" /> 당첨을 부르는 청약 가점 관리 전략
              </h2>
              <p className="!my-2 text-base">민영주택의 당락을 결정하는 청약 가점(총 84점 만점)은 아래 3가지 항목으로 구성됩니다. 하루라도 빨리 준비해야 점수를 높일 수 있습니다.</p>
              <ul className="!my-4 space-y-2 text-base">
                <li><strong>1. 무주택기간 (최대 32점):</strong> 만 30세부터 1년마다 2점씩 가산됩니다. (만 30세 이전에 결혼했다면 혼인신고일부터 계산)</li>
                <li><strong>2. 부양가족수 (최대 35점):</strong> 본인을 제외한 부양가족 1명당 5점씩 가산됩니다. (배우자, 직계존속, 직계비속 등)</li>
                <li><strong>3. 청약통장 가입기간 (최대 17점):</strong> 가입 후 15년 이상이면 만점입니다.</li>
              </ul>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <CheckCircle className="w-7 h-7 text-indigo-500" />
                내 집 마련의 꿈, 지금 바로 시작하세요!
              </h2>
              <p className="mt-4">
                청약은 장기적인 계획과 꾸준함이 중요합니다. <br />
                청약에 당첨된 후 필요한 대출 정보도 미리 확인해보세요.
              </p>
              <Link
                href="/guides/didimdol-vs-bogeumjari"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                디딤돌 vs 보금자리론 비교 가이드 보기 🏠
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
