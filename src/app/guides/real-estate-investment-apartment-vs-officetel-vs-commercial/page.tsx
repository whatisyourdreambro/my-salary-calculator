
import type { Metadata } from "next";
import Link from "next/link";
import { Home, Building, DollarSign, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "부동산 투자, 아파트 vs 오피스텔 vs 상가: 나에게 맞는 투자처는? (2025년)",
  description:
    "내 집 마련을 넘어 자산 증식을 위한 부동산 투자! 아파트, 오피스텔, 상가 등 대표적인 부동산 투자 상품의 장단점, 투자 시 고려 사항, 그리고 각 상품에 적합한 투자자를 상세히 비교 분석합니다. 당신의 투자 목표와 위험 감수 수준에 맞는 최적의 투자처를 찾아보세요.",
  openGraph: {
    title: "부동산 투자, 아파트 vs 오피스텔 vs 상가: 나에게 맞는 투자처는? (2025년)",
    description:
      "부동산 투자, 더 이상 어렵지 않습니다. 아파트, 오피스텔, 상가 중 당신에게 맞는 투자처를 Moneysalary가 찾아드립니다.",
    images: ["/api/og?title=부동산 투자, 나에게 맞는 것은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "부동산 투자, 아파트 vs 오피스텔 vs 상가: 나에게 맞는 투자처는? (2025년)",
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
    "아파트, 오피스텔, 상가 등 대표적인 부동산 투자 상품의 장단점, 투자 시 고려 사항, 그리고 각 상품에 적합한 투자자를 상세히 비교 분석합니다. 당신의 투자 목표와 위험 감수 수준에 맞는 최적의 투자처를 찾아보세요.",
};

export default function RealEstateInvestmentGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-600 dark:from-gray-900 dark:to-green-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            부동산 투자,
            <br /> 아파트 vs 오피스텔 vs 상가
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            내 집 마련을 넘어 자산 증식을 위한 부동산 투자! 하지만 어떤 부동산에 투자해야 할지 막막하신가요? 아파트, 오피스텔, 상가 등 대표적인 부동산 투자 상품의 장단점을 비교 분석하고, 당신에게 맞는 최적의 투자처를 찾아드립니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              부동산 투자는 주식 투자와 함께 대표적인 자산 증식 수단입니다. 특히 한국에서는 '부동산 불패'라는 말이 있을 정도로 많은 사람들이 부동산 투자를 통해 부를 축적해왔습니다. 하지만 부동산 시장은 끊임없이 변화하고, 투자 상품별로 특징과 위험성이 다르므로, 자신의 투자 목표와 위험 감수 수준에 맞는 현명한 선택을 하는 것이 중요합니다. 이 가이드를 통해 아파트, 오피스텔, 상가 등 대표적인 부동산 투자 상품의 모든 것을 파악하고, 당신의 성공적인 부동산 투자를 위한 전략을 세워보세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <Home className="w-6 h-6" />
                부동산 투자, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>자산 증식:</strong> 부동산 가격 상승을 통한 시세 차익과 임대 수익을 기대할 수 있습니다.
                </li>
                <li>
                  <strong>인플레이션 헤지:</strong> 물가 상승에 따라 부동산 가치도 함께 상승하는 경향이 있어 인플레이션 헤지 효과가 있습니다.
                </li>
                <li>
                  <strong>안정적인 투자처:</strong> 주식 등 금융 상품에 비해 변동성이 적고 안정적인 투자처로 인식됩니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Building className="w-7 h-7 text-purple-500" />
                아파트 vs 오피스텔 vs 상가, 한눈에 비교하기
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">아파트</th>
                      <th className="py-3 px-4 font-bold text-orange-500">오피스텔</th>
                      <th className="py-3 px-4 font-bold text-green-600">상가</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">투자 목적</td>
                      <td className="py-4 px-4">시세 차익, 주거 안정</td>
                      <td className="py-4 px-4">월세 수익, 소액 투자</td>
                      <td className="py-4 px-4">월세 수익, 높은 수익률 기대</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">장점</td>
                      <td className="py-4 px-4">환금성 우수, 시세 상승 기대, 주거 편의성</td>
                      <td className="py-4 px-4">소액 투자 가능, 역세권 입지, 높은 임대 수익률</td>
                      <td className="py-4 px-4">높은 임대 수익률, 시세 상승 기대 (상권 활성화 시)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">단점</td>
                      <td className="py-4 px-4">높은 초기 투자 비용, 규제 심함</td>
                      <td className="py-4 px-4">아파트 대비 낮은 시세 상승, 주거 만족도 낮음</td>
                      <td className="py-4 px-4">공실 위험, 상권 변화에 민감, 높은 관리 비용</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">세금</td>
                      <td className="py-4 px-4">취득세, 재산세, 양도소득세, 종합부동산세</td>
                      <td className="py-4 px-4">취득세, 재산세, 양도소득세, 부가가치세 (업무용)</td>
                      <td className="py-4 px-4">취득세, 재산세, 양도소득세, 부가가치세</td>
                    </tr>
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 내용은 일반적인 특징이며, 개별 상품 및 시장 상황에 따라 다를 수 있습니다.</p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 나에게 맞는 부동산 투자처 선택 가이드
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>시세 차익과 주거 안정을 원한다면:</strong> 아파트 투자가 가장 적합합니다. 하지만 높은 초기 투자 비용과 규제에 대한 이해가 필요합니다.
                </li>
                <li>
                  <strong>소액으로 월세 수익을 원한다면:</strong> 오피스텔 투자를 고려해볼 수 있습니다. 역세권 등 입지가 좋은 곳을 선택하는 것이 중요합니다.
                </li>
                <li>
                  <strong>높은 수익률과 상권 분석에 자신 있다면:</strong> 상가 투자를 고려해볼 수 있습니다. 하지만 공실 위험과 상권 변화에 대한 면밀한 분석이 필수입니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <DollarSign className="w-7 h-7 text-indigo-500" />
                당신의 부동산 자산, 현명하게 불리세요!
              </h2>
              <p>
                부동산 투자는 당신의 자산을 불리고 경제적 자유를 얻는 중요한 수단입니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 투자자가 되세요.
              </p>
              <Link
                href="/home-loan"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                주택담보대출 계산기 바로가기 🏠
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
