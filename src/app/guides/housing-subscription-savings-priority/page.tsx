import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, HelpCircle, BarChart2, TrendingUp, Home, Award } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "주택청약 1순위 조건, 5분 만에 완벽 정복 | Moneysalary",
  description:
    "내 집 마련의 첫걸음, 주택청약 1순위가 되기 위한 모든 조건을 쉽고 빠르게 알려드립니다. 민영주택, 국민주택 1순위 조건을 확인하고 당첨 확률을 높여보세요.",
  openGraph: {
    title: "주택청약 1순위 조건, 5분 만에 완벽 정복",
    description:
      "민영주택, 국민주택 1순위 조건을 확인하고 내 집 마련의 꿈을 현실로 만드세요.",
    images: ["/api/og?title=주택청약 1순위 조건 완벽 가이드"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주택청약 1순위 조건, 5분 만에 완벽 정복",
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
    "내 집 마련의 첫걸음, 주택청약 1순위가 되기 위한 모든 조건을 쉽고 빠르게 알려드립니다. 민영주택, 국민주택 1순위 조건을 확인하고 당첨 확률을 높여보세요.",
};

export default function HousingSubscriptionPriorityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-400 dark:from-gray-900 dark:to-green-800/80 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            주택청약 1순위 조건,
            <br />
            5분 만에 완벽 정복
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            내 집 마련의 필수 코스, 주택청약! 복잡한 1순위 조건을 누구나 쉽게
            이해할 수 있도록 핵심만 쏙쏙 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &quot;청약통장, 만들어만 두면 끝?&quot; <br />
              많은 사람들이 청약통장을 개설했지만, 정작 1순위 조건을 몰라 기회를
              놓치곤 합니다. 이 글에서는 &apos;민영주택&apos;과 &apos;국민주택&apos; 1순위
              조건을 명확히 구분하고, 당첨 확률을 높이는 꿀팁까지 모두
              공개합니다.
            </p>

            {/* Key Takeaways Section */}
            <section className="mt-12 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
              <h2 className="!mt-0 !text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                핵심 요약 (Key Takeaways)
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>청약의 두 종류:</strong> &apos;민영주택&apos;과 &apos;국민주택&apos;은
                  1순위 조건이 다르므로, 목표 주택에 맞춰 전략을 세워야 합니다.
                </li>
                <li>
                  <strong>가입 기간이 기본:</strong> 수도권은 최소 1년, 비수도권은
                  최소 6개월 이상 청약통장을 유지해야 1순위의 문이 열립니다.
                </li>
                <li>
                  <strong>예치금 확인은 필수:</strong> 민영주택은 거주 지역과
                  주택 면적에 맞는 예치금을 미리 채워둬야 합니다.
                </li>
                <li>
                  <strong>국민주택은 성실함이 무기:</strong> 꾸준한 납입 횟수와
                  총 납입금액이 당첨의 핵심 열쇠입니다.
                </li>
              </ul>
            </section>

            {/* Housing Type Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Home className="w-7 h-7 text-blue-500" />
                민영주택 vs 국민주택, 무엇이 다른가요?
              </h2>
              <p>
                청약의 세계는 크게 두 가지로 나뉩니다. 바로 민간 건설사가 짓는
                &apos;민영주택&apos;과 국가나 지자체, LH 등이 짓는 &apos;국민주택&apos;입니다.
                두 주택은 1순위 조건부터 당첨자 선정 방식까지 모든 것이 다르기
                때문에, 내가 어떤 주택에 청약할 것인지 먼저 정해야 합니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300">
                    민영주택 (e.g. 래미안, 자이, 힐스테이트)
                  </h3>
                  <p className="!text-sm !my-0">
                    <strong>특징:</strong> 브랜드 아파트, 비교적 자유로운 면적/구조
                    <br />
                    <strong>핵심:</strong> 가입 기간 + 예치금 + 가점
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">
                    국민주택 (e.g. LH, SH 아파트)
                  </h3>
                  <p className="!text-sm !my-0">
                    <strong>특징:</strong> 저렴한 분양가, 주로 무주택 서민 대상
                    <br />
                    <strong>핵심:</strong> 가입 기간 + 납입 횟수 + 납입 총액
                  </p>
                </div>
              </div>
            </section>

            {/* 1st Priority Conditions Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Award className="w-7 h-7 text-amber-500" />
                1순위 공통 조건 & 주택별 핵심 조건
              </h2>
              <p className="text-center">
                아래 조건을 충족해야 비로소 1순위 자격이 주어집니다.
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-semibold">민영주택</th>
                      <th className="py-3 px-4 font-semibold">국민주택</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-bold">가입 기간</td>
                      <td colSpan={2} className="py-4 px-4 text-center">
                        수도권 1년 이상 / 비수도권 6개월 이상
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-bold">나이</td>
                      <td colSpan={2} className="py-4 px-4 text-center">
                        만 19세 이상 (세대주 여부 무관)
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-bold">핵심 (민영)</td>
                      <td className="py-4 px-4">
                        <strong>지역/면적별 예치금</strong> 충족
                      </td>
                      <td className="py-4 px-4 text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-bold">핵심 (국민)</td>
                      <td className="py-4 px-4 text-gray-500">-</td>
                      <td className="py-4 px-4">
                        <strong>납입 횟수</strong> (수도권 12회 / 비수도권 6회 이상)
                      </td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-bold">참고</td>
                      <td colSpan={2} className="py-4 px-4 text-center">
                        규제 지역(투기과열, 청약과열)은 조건이 더 까다로워요! (세대주, 5년 내 당첨 이력 등)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
               <Link
                href="/glossary"
                className="block mt-6 text-center text-signature-blue font-semibold hover:underline"
              >
                청약 가점제, 추첨제가 뭔가요? 용어 사전 바로가기 →
              </Link>
            </section>

            {/* Call to Action Section */}
            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                나의 청약 점수, 미리 계산해볼까?
              </h2>
              <p>
                무주택 기간, 부양가족 수, 청약통장 가입 기간에 따라 내 점수는 크게 달라집니다.
                <br />
                Moneysalary의 청약 가점 계산기로 내 점수를 확인하고 당첨 가능성을 높여보세요.
              </p>
              <Link
                href="/home-loan"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                주택담보대출 계산기로 자금 계획 세우기 🏠
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}