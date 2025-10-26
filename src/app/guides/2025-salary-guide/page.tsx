import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, HelpCircle, BarChart2, TrendingUp } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 연봉 실수령액: 내 월급, 세후 얼마일까? | Moneysalary",
  description:
    "연봉 3000, 4000, 5000부터 1억까지, 2025년 최신 세법을 완벽 적용한 실수령액 테이블과 상세 공제 내역을 확인하세요. 당신의 진짜 월급을 알려드립니다.",
  openGraph: {
    title: "2025년 연봉 실수령액: 내 월급, 세후 얼마일까?",
    description:
      "최신 세법 기준, 내 연봉의 진짜 가치를 확인하고 미래를 계획하세요.",
    images: ["/api/og?title=2025년 연봉 실수령액 완벽 가이드"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 연봉 실수령액: 내 월급, 세후 얼마일까?",
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
  datePublished: "2025-09-16",
  dateModified: currentDate,
  description:
    "연봉 3000, 4000, 5000부터 1억까지, 2025년 최신 세법을 완벽 적용한 실수령액 테이블과 상세 공제 내역을 확인하세요.",
};

const salaryData = [
  { salary: "3,000만원", preTax: "250만원", postTax: "약 220만원" },
  { salary: "4,000만원", preTax: "333만원", postTax: "약 288만원" },
  { salary: "5,000만원", preTax: "417만원", postTax: "약 353만원" },
  { salary: "6,000만원", preTax: "500만원", postTax: "약 416만원" },
  { salary: "8,000만원", preTax: "667만원", postTax: "약 540만원" },
  { salary: "1억원", preTax: "833만원", postTax: "약 658만원" },
];

export default function SalaryGuide2025Page() {
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
        <div className="w-full bg-gradient-to-br from-signature-blue to-blue-400 dark:from-gray-900 dark:to-signature-blue/80 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025 연봉 실수령액,
            <br />내 진짜 월급은 얼마일까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            2025년 최신 세법과 4대보험 요율을 완벽하게 반영하여, 당신의 통장에
            찍힐 진짜 월급을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-blue-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &quot;연봉 5,000만원이면 월 417만원?&quot; <br />
              많은 이들이 연봉을 12로 나눈 값을 자신의 월급이라 생각하지만,
              현실은 다릅니다. 세금과 4대 보험이라는 이름으로 우리 월급의 일부가
              공제되기 때문이죠. 이 글에서는 복잡한 급여의 세계를 누구나 쉽게
              이해할 수 있도록 완벽하게 안내합니다.
            </p>

            {/* Key Takeaways Section */}
            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                핵심 요약 (Key Takeaways)
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>진짜 월급의 비밀:</strong> 연봉을 12로 나눈 금액이
                  아닌, 4대보험과 소득세를 제외한 &apos;세후 실수령액&apos;이
                  진짜 내 월급입니다.
                </li>
                <li>
                  <strong>공제의 4가지 기둥:</strong> 국민연금, 건강보험,
                  고용보험, 그리고 근로소득세가 월급에서 공제되는 핵심
                  항목입니다.
                </li>
                <li>
                  <strong>연봉이 전부가 아니다:</strong> 비과세 수당(식대,
                  차량유지비 등)과 부양가족 수에 따라 실수령액은 크게 달라질 수
                  있습니다.
                </li>
              </ul>
            </section>

            {/* Why Difference Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-amber-500" />
                연봉과 월급, 왜 차이가 날까요?
              </h2>
              <p>
                계약서에 명시된 연봉 총액과 실제 월급 통장에 찍히는 금액이 다른
                이유는 바로 <strong>&apos;공제&apos;</strong> 때문입니다. 국가는
                안정적인 사회 시스템 유지를 위해 소득이 있는 모든 국민에게 4대
                보험료와 세금을 걷습니다. 주요 항목은 다음과 같습니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">
                    국민연금 (노후 대비)
                  </h3>
                  <p className="!text-sm !my-0">
                    미래의 나를 위한 저축성 보험. 소득의 9%를 내지만, 회사가
                    절반을 부담해줍니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">
                    건강보험 (질병 대비)
                  </h3>
                  <p className="!text-sm !my-0">
                    병원비 부담을 덜어주는 사회 보험. 아프면 안 되지만, 아플
                    때를 위한 최소한의 안전장치입니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">
                    고용보험 (실직 대비)
                  </h3>
                  <p className="!text-sm !my-0">
                    갑작스러운 실직 시 실업급여를 받기 위한 보험. 재취업을
                    준비하는 기간의 버팀목이 됩니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">
                    근로소득세 (국민의 의무)
                  </h3>
                  <p className="!text-sm !my-0">
                    벌어들인 소득에 대한 세금. 연말정산을 통해 최종 금액이
                    결정됩니다.
                  </p>
                </div>
              </div>
              <Link
                href="/glossary"
                className="block mt-6 text-center text-signature-blue font-semibold hover:underline"
              >
                더 많은 용어가 궁금하다면? 용어 사전 바로가기 →
              </Link>
            </section>

            {/* Salary Table Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <BarChart2 className="w-7 h-7 text-green-500" />
                주요 연봉 구간별 실수령액 (2025년)
              </h2>
              <p className="text-center">
                가장 궁금해하실 주요 연봉 구간별 월 예상 실수령액입니다. (1인
                가구, 비과세액 20만원 기준)
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">연봉</th>
                      <th className="py-3 px-4 font-semibold">월 세전</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">
                        월 세후 (예상)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {salaryData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">{item.salary}</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {item.preTax}
                        </td>
                        <td className="py-4 px-4 font-bold text-lg text-signature-blue">
                          {item.postTax}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Call to Action Section */}
            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />내 연봉,
                정확히 계산하고 미래를 계획하세요
              </h2>
              <p>
                부양가족, 비과세액 등 개인의 상황에 따라 실수령액은 달라집니다.{" "}
                <br />
                Moneysalary 계산기에 직접 입력하여 1원 단위까지 정확한 내 월급을
                확인해보세요.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 연봉으로 정확한 실수령액 계산하기 🧐
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
