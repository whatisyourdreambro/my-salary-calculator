import type { Metadata } from "next";
import Link from "next/link";
import { Code, Building, Sparkles, Coffee, GitCompare } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "네이버 vs 카카오, 연봉부터 복지까지 전격 비교 (2025년)",
  description:
    "개발자들의 꿈의 직장, 네이버와 카카오! 신입 초봉, 직급별 연봉, 성과급, 스톡옵션부터 사내 문화와 복지 혜택까지! 당신에게 더 맞는 회사는 어디일까요?",
  openGraph: {
    title: "네이버 vs 카카오, 연봉부터 복지까지 전격 비교 (2025년)",
    description:
      "대한민국 IT 대장주, 네이버와 카카오! 두 거인의 연봉, 복지, 문화를 한눈에 비교해 보세요.",
    images: ["/api/og?title=네이버 vs 카카오, 당신의 선택은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "네이버 vs 카카오, 연봉부터 복지까지 전격 비교 (2025년)",
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
    "신입 초봉, 직급별 연봉, 성과급, 스톡옵션부터 사내 문화와 복지 혜택까지! 당신에게 더 맞는 회사는 어디일까요?",
};

export default function NaverVsKakaoGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-yellow-400 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            네이버 vs 카카오,
            <br /> 당신의 선택은?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-green-100 dark:text-gray-300">
            대한민국 IT 산업의 양대 산맥, 네이버와 카카오. 개발자라면 누구나 한 번쯤 꿈꾸는 두 회사의 연봉, 복지, 그리고 기업 문화를 샅샅이 비교 분석해 드립니다.
          </p>
          <p className="mt-4 text-xs text-green-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              '네카라쿠배'라는 신조어의 중심, 네이버와 카카오는 단순히 높은 연봉을 넘어 뛰어난 동료, 성장 가능성, 그리고 최고의 복지를 제공하며 많은 이들의 '드림 컴퍼니'로 자리 잡았습니다. 하지만 두 회사는 닮은 듯 다른 매력을 가지고 있습니다. 나에게 더 맞는 회사는 어디일까요?
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <GitCompare className="w-7 h-7 text-purple-500" />
                네이버 vs 카카오 한눈에 비교하기
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-green-600">네이버</th>
                      <th className="py-3 px-4 font-bold text-yellow-500">카카오</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">연봉 수준</td>
                      <td className="py-4 px-4">업계 최상위, 안정적이고 높은 기본급</td>
                      <td className="py-4 px-4">업계 최상위, 성과급/스톡옵션 등 보상 변동성 큼</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">기업 문화</td>
                      <td className="py-4 px-4">안정적, 체계적, '네이버 웍스' 기반의 협업</td>
                      <td className="py-4 px-4">자율적, 수평적, '아지트' 기반의 빠른 소통</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">대표 복지</td>
                      <td className="py-4 px-4">사내 병원, 3년 근속 시 리프레시 휴가 및 지원금</td>
                      <td className="py-4 px-4">사내 어린이집, 대출 지원(최대 2.2억), 안식 휴가</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">일하는 방식</td>
                      <td className="py-4 px-4">주 3일 사무실 출근 + 주 2일 원격 근무</td>
                      <td className="py-4 px-4">전면 원격 근무 (팀/조직별 상이)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                    <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2 justify-center text-green-600">
                        <Building className="w-6 h-6" /> 안정적인 성장을 원한다면? 네이버
                    </h3>
                    <p className="!text-sm !my-2">
                        탄탄한 사업 구조를 바탕으로 한 안정성과 체계적인 시스템 안에서 깊이 있는 전문가로 성장하고 싶다면 네이버가 더 나은 선택이 될 수 있습니다. 국내 1위 플랫폼의 자부심과 최고의 복지는 덤입니다.
                    </p>
                </div>
                <div className="text-center">
                    <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2 justify-center text-yellow-500">
                        <Sparkles className="w-6 h-6" /> 빠른 도전과 보상을 원한다면? 카카오
                    </h3>
                    <p className="!text-sm !my-2">
                        끊임없이 새로운 서비스를 시도하는 역동적인 환경에서 빠른 의사결정과 수평적인 소통을 경험하고 싶다면 카카오가 더 매력적일 수 있습니다. 성과에 대한 확실한 보상과 스톡옵션의 기회도 열려있습니다.
                    </p>
                </div>
            </section>

            <blockquote className="!border-l-purple-500 mt-12">
                <p>
                  <strong>결론: 정답은 없다!</strong> 두 회사 모두 대한민국 최고의 IT 기업이며, 개인의 성향과 가치관에 따라 만족도는 달라질 수 있습니다. 연봉과 복지뿐만 아니라, 내가 어떤 환경에서 더 즐겁게 일하고 성장할 수 있을지 고민하는 것이 중요합니다.
                </p>
            </blockquote>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                IT 개발자들의 연봉, 더 궁금하다면?
              </h2>
              <p>
                네이버, 카카오 외에 다른 IT 기업들의 연봉 수준은 어떨까요? <br />
                '네카라쿠배' 연봉 가이드에서 더 많은 정보를 확인하세요.
              </p>
              <Link
                href="/guides/nekarakubae-salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                '네카라쿠배' 연봉 가이드 보기 👩‍💻
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}