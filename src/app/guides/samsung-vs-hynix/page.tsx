import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, GitCompare, Sparkles, Building } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "삼성전자 vs SK하이닉스, 연봉/성과급/복지 전격 비교 (2025년)",
  description:
    "대한민국 반도체 양대산맥, 삼성전자와 SK하이닉스! 신입 초봉부터 직급별 연봉, 초과이익성과급(OPI/PS), 생산성격려금(TAI/PI) 등 성과급과 복지, 기업 문화를 완벽 비교 분석합니다.",
  openGraph: {
    title: "삼성전자 vs SK하이닉스, 연봉/성과급/복지 전격 비교 (2025년)",
    description:
      "반도체 제국의 두 거인, 당신의 선택은? 연봉, 성과급, 복지, 문화까지 모든 것을 비교해 드립니다.",
    images: ["/api/og?title=삼성전자 vs SK하이닉스, 당신의 선택은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "삼성전자 vs SK하이닉스, 연봉/성과급/복지 전격 비교 (2025년)",
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
    "신입 초봉, 직급별 연봉, 성과급(OPI/PS, TAI/PI), 복지, 기업 문화를 완벽 비교 분석합니다.",
};

export default function SamsungVsHynixGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-600 to-sky-700 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            삼성전자 vs SK하이닉스,
            <br /> 반도체 제국의 승자는?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-sky-100 dark:text-gray-300">
            세계 메모리 반도체 시장을 호령하는 두 거인, 삼성전자와 SK하이닉스. 취준생과 이직러들이 가장 궁금해하는 연봉, 성과급, 복지, 그리고 기업 문화를 속 시원하게 비교해 드립니다.
          </p>
          <p className="mt-4 text-xs text-sky-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              '반도체'는 대한민국 경제의 심장입니다. 그리고 그 중심에는 삼성전자와 SK하이닉스가 있습니다. 두 회사 모두 세계 최고 수준의 기술력과 그에 걸맞은 대우를 자랑하지만, 연봉 구조부터 기업 문화까지 닮은 듯 다른 점이 많습니다. 나에게 더 맞는 회사는 어디일까요?
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <GitCompare className="w-7 h-7 text-purple-500" />
                삼성전자 vs SK하이닉스 한눈에 비교하기
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">삼성전자 (DS)</th>
                      <th className="py-3 px-4 font-bold text-orange-500">SK하이닉스</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">신입 초봉</td>
                      <td className="py-4 px-4">약 5,300만원</td>
                      <td className="py-4 px-4">약 5,300만원</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">성과급 (최대)</td>
                      <td className="py-4 px-4">OPI(연봉의 50%) + TAI(월 기본급 100%)</td>
                      <td className="py-4 px-4">PS(연봉의 50%) + PI(월 기본급 100%)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">기업 문화</td>
                      <td className="py-4 px-4">관리의 삼성, 체계적, 수직적, 효율성 중시</td>
                      <td className="py-4 px-4">SK 특유의 '패기', 상대적으로 유연, 수평적 문화</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">근무지</td>
                      <td className="py-4 px-4">기흥, 화성, 평택, 천안, 온양 등</td>
                      <td className="py-4 px-4">이천, 청주</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                    <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2 justify-center text-blue-600">
                        <Building className="w-6 h-6" /> '초격차'의 자부심, 삼성전자
                    </h3>
                    <p className="!text-sm !my-2">
                        세계 1위의 자부심과 체계적인 시스템 안에서 안정적으로 성장하고 싶다면 삼성전자가 답이 될 수 있습니다. '관리의 삼성'이라는 말처럼 모든 것이 시스템화되어 있으며, 최고의 인재들과 함께 일하며 배울 수 있는 기회가 많습니다.
                    </p>
                </div>
                <div className="text-center">
                    <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2 justify-center text-orange-500">
                        <Sparkles className="w-6 h-6" /> '성과급'의 화끈함, SK하이닉스
                    </h3>
                    <p className="!text-sm !my-2">
                        '성과 있는 곳에 보상 있다'는 원칙을 확실하게 보여주는 회사입니다. 반도체 업황이 좋을 때 터지는 막대한 성과급은 SK하이닉스의 가장 큰 매력입니다. 상대적으로 유연하고 수평적인 문화 또한 장점입니다.
                    </p>
                </div>
            </section>

            <blockquote className="!border-l-purple-500 mt-12">
                <p>
                  <strong>성과급, 그것이 문제로다!</strong> 두 회사의 기본급은 비슷하지만, 실제 연봉은 반도체 사이클에 따라 지급되는 성과급에 의해 크게 좌우됩니다. OPI/PS가 50% 최대로 지급되는 해에는 두 회사 모두 대기업 최고 수준의 연봉을 자랑합니다. 결국, 입사 시점의 업황이 연봉을 결정하는 가장 큰 변수가 될 수 있습니다.
                </p>
            </blockquote>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                다른 대기업 연봉도 궁금하다면?
              </h2>
              <p>
                자동차, IT 플랫폼 등 다른 산업의 대표 기업들은 어떨까요? <br />
                Moneysalary의 기업별 연봉 가이드에서 당신의 선택지를 넓혀보세요.
              </p>
              <Link
                href="/guides/hyundai-salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                현대자동차 연봉 가이드 보기 🚗
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}