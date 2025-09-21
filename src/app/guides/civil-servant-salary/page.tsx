// src/app/guides/civil-servant-salary/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "공무원 월급, 정말 박봉일까? | 9급·7급 첫 월급 실수령액 분석 (2025년)",
  description:
    "2025년 공무원 봉급표 기준, 9급 및 7급 1호봉의 진짜 첫 월급은? 기본급에 각종 수당을 더하고 세금을 제외한 실제 통장에 찍히는 실수령액을 상세히 알려드립니다.",
  openGraph: {
    title: "공무원 월급, 정말 박봉일까? | 9급·7급 첫 월급 실수령액 분석",
    description:
      "기본급 뒤에 숨겨진 각종 수당을 포함한 공무원의 진짜 월급을 공개합니다.",
    images: [
      "/api/og?title=공무원 월급, 정말 박봉일까?&description=2025년 기준 9급·7급 실수령액 심층 분석",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "공무원 월급, 정말 박봉일까? | 9급·7급 첫 월급 실수령액 분석 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-22",
  dateModified: "2025-09-22",
  description:
    "2025년 공무원 봉급표 기준, 9급 및 7급 1호봉의 실제 첫 월급은? 기본급과 각종 수당을 포함한 세후 실수령액을 상세히 알려드립니다.",
};

export default function CivilServantSalaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        <div className="w-full bg-gradient-to-br from-slate-600 to-gray-700 dark:from-gray-900 dark:to-slate-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            공무원 월급,
            <br /> 정말 &apos;박봉&apos;일까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
            &apos;평생 직장&apos;이라는 안정성과 &apos;적은 월급&apos;이라는
            편견 사이. 2025년 기준 9급, 7급 신규 공무원의 진짜 첫 월급 명세서를
            낱낱이 파헤쳐 봅니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              매년 수십만 명이 공무원 시험에 도전하는 이유는 무엇일까요? 최고의
              안정성을 자랑하지만, 월급이 적다는 이야기 때문에 많은 수험생과
              예비 공무원들이 현실적인 고민에 빠집니다. 결론부터 말하자면,
              공무원 월급은 단순히 봉급표의 &apos;기본급&apos;만 봐서는 절대 안
              됩니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Wallet className="w-7 h-7 text-green-500" />첫 월급 명세서
                재구성: 기본급 + α
              </h2>
              <p>
                공무원 월급은 기본급에 매달 고정적으로 지급되는 여러 수당이
                더해져 완성됩니다. 2025년 9급 1호봉의 기본급은 약 190만원이지만,
                실제로는 각종 수당이 더해져 세전 250만원 이상을 받게 됩니다.
              </p>
              <div className="mt-6 overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">항목</th>
                      <th className="py-3 px-4 font-semibold">9급 1호봉</th>
                      <th className="py-3 px-4 font-semibold">7급 1호봉</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-3 px-4 font-semibold">기본급(봉급)</td>
                      <td>약 1,900,000원</td>
                      <td>약 2,250,000원</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">정액급식비</td>
                      <td>140,000원</td>
                      <td>140,000원</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">직급보조비</td>
                      <td>185,000원</td>
                      <td>205,000원</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="py-3 px-4 font-bold">세전 월급 (예상)</td>
                      <td className="font-bold">약 2,225,000원</td>
                      <td className="font-bold">약 2,595,000원</td>
                    </tr>
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td className="py-3 px-4 font-bold text-primary">
                        세후 실수령액 (예상)
                      </td>
                      <td className="font-bold text-primary text-lg">
                        약 200만원
                      </td>
                      <td className="font-bold text-primary text-lg">
                        약 230만원
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-center mt-2 text-gray-500">
                ※ 위 금액은 공통 수당만 포함한 최소치이며, 초과근무수당,
                가족수당, 명절휴가비 등은 제외된 금액입니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-500" />
                연봉 그 이상의 가치: 안정성과 연금
              </h2>
              <p>
                공무원의 진짜 가치는 당장의 월급보다 장기적인 안정성에 있습니다.
              </p>
              <blockquote>
                <p>
                  <strong>자동 연봉 상승 시스템:</strong> 매년 자동으로 오르는
                  &apos;호봉&apos; 제도는 장기 근속 시 안정적인 소득 상승을
                  보장합니다. 특별한 성과 없이도 꾸준히 일하면 연봉이 오르는
                  구조는 사기업에서는 찾아보기 힘든 큰 장점입니다.
                  <br />
                  <br />
                  <strong>든든한 노후 보장:</strong> 국민연금보다 수령액이 높은
                  공무원연금은 은퇴 후의 삶을 보장하는 가장 확실한 안전판입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                당신의 선택, 후회 없으신가요?
              </h2>
              <p>
                높은 연봉의 사기업과 안정적인 공무원 사이에서 고민하고 있다면,
                단순히 첫 월급만 비교해서는 안 됩니다. 장기적인 관점에서 당신의
                삶에 더 큰 가치를 주는 것이 무엇인지 신중하게 생각해보세요.
              </p>
              <Link
                href="/?tab=comparator"
                className="inline-block mt-6 py-4 px-8 bg-primary text-white rounded-lg text-center font-bold text-lg hover:bg-primary-hover transition-transform transform hover:scale-105 shadow-lg"
              >
                사기업 vs 공무원 연봉 비교해보기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
