import type { Metadata } from "next";
import Link from "next/link";
import { Code, Rocket, Crown, ShoppingCart, Bike } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "네카라쿠배 연봉, 개발자 꿈의 직장 완전 정복 (2025년)",
  description:
    "네이버, 카카오, 라인, 쿠팡, 배달의민족! 대한민국 IT 트렌드를 이끄는 5개 기업의 신입 초봉, 평균 연봉, 기업 문화, 그리고 미래 전망까지 한눈에 비교 분석합니다.",
  openGraph: {
    title: "네카라쿠배 연봉, 개발자 꿈의 직장 완전 정복 (2025년)",
    description:
      "개발자들의 최종 목표, 네카라쿠배! 5개 회사의 연봉과 문화를 비교하고 당신의 다음 커리어를 계획해보세요.",
    images: ["/api/og?title=네카라쿠배 연봉, 완전 정복"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "네카라쿠배 연봉, 개발자 꿈의 직장 완전 정복 (2025년)",
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
    "네이버, 카카오, 라인, 쿠팡, 배달의민족! 5개 기업의 신입 초봉, 평균 연봉, 기업 문화, 미래 전망까지 비교 분석합니다.",
};

export default function NekarakubaeSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-600 to-pink-500 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            네카라쿠배, 그곳이 궁금하다
            <br /> 연봉부터 문화까지
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-pink-100 dark:text-gray-300">
            개발자들의 '꿈의 직장'으로 불리는 네이버, 카카오, 라인, 쿠팡, 배달의민족. 대한민국 IT 생태계를 이끄는 이들 기업의 모든 것을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-pink-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              '네카라쿠배'는 더 이상 단순한 기업 이름의 나열이 아닙니다. 높은 연봉, 최고의 복지, 뛰어난 동료, 그리고 무한한 성장 기회를 상징하는 대한민국 IT 인재들의 '워너비' 그 자체가 되었습니다. 과연 이들 기업은 무엇이 다를까요?
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Code className="w-7 h-7 text-blue-500" />
                네카라쿠배, 어떤 회사들인가?
              </h2>
              <p>
                네카라쿠배는 대한민국을 대표하는 IT 플랫폼 기업 5곳을 의미합니다.
              </p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <p className="font-bold !mt-0 !mb-1 text-green-600">네이버</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <p className="font-bold !mt-0 !mb-1 text-yellow-500">카카오</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <p className="font-bold !mt-0 !mb-1 text-green-500">라인</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <p className="font-bold !mt-0 !mb-1 text-blue-600">쿠팡</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <p className="font-bold !mt-0 !mb-1 text-teal-500">배달의민족</p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">
                연봉과 보상: 최고 수준의 대우
              </h2>
              <p>
                네카라쿠배의 가장 큰 매력은 단연 업계 최고 수준의 연봉입니다. 2025년 기준, 신입 개발자 초봉은 대부분 <strong>6,000만원 이상</strong>에서 시작하며, 경력직의 경우 억대 연봉은 기본, 스톡옵션 등 파격적인 보상을 통해 핵심 인재를 영입하고 있습니다.
              </p>
              <blockquote className="!border-l-purple-500">
                <p>
                  <strong>기본급 + 성과급 + 스톡옵션:</strong> 네카라쿠배의 연봉은 단순히 월급만으로 평가할 수 없습니다. 회사의 성과와 개인의 기여도에 따라 지급되는 성과급과 미래의 성장을 함께 공유하는 스톡옵션이 더해져야 진짜 보상이 완성됩니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">
                기업 문화: 자율과 책임, 그리고 성장
              </h2>
              <p>
                높은 연봉만큼이나 매력적인 것은 바로 수평적이고 자율적인 기업 문화입니다. 직급 대신 '님'으로 호칭하고, 자유로운 출퇴근과 원격 근무를 보장하며, 최고의 동료들과 함께 성장할 수 있는 환경을 제공합니다.
              </p>
               <ul className="!my-4 space-y-2 text-base">
                  <li><strong>네이버/라인:</strong> 안정적이고 체계적인 문화, 깊이 있는 기술 탐구</li>
                  <li><strong>카카오/배민:</strong> 빠르고 역동적인 문화, 새로운 시도와 빠른 실행력</li>
                  <li><strong>쿠팡:</strong> 데이터 기반의 의사결정, 아마존을 닮은 치열함과 성장</li>
                </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                당신의 다음 커리어는 어디인가요?
              </h2>
              <p>
                네카라쿠배 입성을 꿈꾸고 있다면, 지금 바로 연봉 협상 전략을 세워보세요. <br />
                성공적인 이직을 위한 첫걸음, Moneysalary가 함께합니다.
              </p>
              <Link
                href="/guides/salary-negotiation"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연봉 협상 가이드 바로가기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}