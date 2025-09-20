import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Landmark, Calculator, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "2025년 최저임금 완벽정리: 시급 10,030원, 내 월급은? (예상)",
  description:
    "2025년 최저시급(예상 10,030원) 기준, 주휴수당을 포함한 실수령액은 얼마일까요? 월급과 연봉 계산법부터 자주 묻는 질문(Q&A)까지, 대한민국 최저임금의 모든 것을 알려드립니다.",
  openGraph: {
    title: "2025년 최저임금 완벽정리: 시급부터 월급, 연봉까지",
    description:
      "내년 최저임금, 내 삶에 미치는 영향을 미리 확인해보세요. 주휴수당 포함 월급 계산법 완벽 가이드.",
    images: [
      "/api/og?title=2025년 최저임금 완벽정리&description=주휴수당 포함 내 월급은 얼마?",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 최저임금 완벽정리: 시급 10,030원, 내 월급은? (예상)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-01",
  dateModified: "2025-09-20",
  description:
    "2025년 최저시급(예상 10,030원) 기준, 주휴수당을 포함한 실수령액은 얼마일까요? 월급과 연봉 계산법부터 자주 묻는 질문(Q&A)까지, 대한민국 최저임금의 모든 것을 알려드립니다.",
};

export default function MinimumWagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-slate-700 to-gray-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025년 최저임금,
            <br />내 삶을 지키는 최소한의 약속
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
            매년 여름, 대한민국에서 가장 뜨거운 숫자. 2025년 최저임금은 우리
            모두의 지갑과 삶에 어떤 영향을 미칠까요? 시급부터 월급, 연봉까지
            완벽하게 분석해 드립니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              최저임금은 단순히 아르바이트생에게만 해당되는 이야기가 아닙니다.
              수많은 직장인의 기본급과 수당을 결정하는 기준점이자, 우리 사회가
              노동의 가치를 얼마로 평가하는지를 보여주는 중요한 척도입니다.
              2025년, 우리의 삶을 지탱할 이 숫자의 모든 것을 파헤쳐 봅니다.
            </p>

            <section className="mt-12 text-center bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!mt-0 !text-2xl font-bold flex items-center gap-3 justify-center">
                <Landmark className="w-7 h-7 text-slate-600 dark:text-slate-300" />
                2025년 최저임금 핵심 요약
              </h2>
              <p className="text-xs text-gray-500">
                (※2024년 대비 2.5% 인상된 예시 금액)
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4">
                  <h3 className="font-semibold text-lg">최저 시급</h3>
                  <p className="text-4xl font-bold text-signature-blue">
                    10,030원
                  </p>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">최저 월급</h3>
                  <p className="text-4xl font-bold text-signature-blue">
                    2,096,270원
                  </p>
                  <p className="text-xs text-gray-500">
                    (월 209시간, 주휴수당 포함)
                  </p>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">최저 연봉</h3>
                  <p className="text-4xl font-bold text-signature-blue">
                    25,155,240원
                  </p>
                  <p className="text-xs text-gray-500">(월급 × 12개월)</p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Calculator className="w-7 h-7 text-green-500" />내 월급, 왜
                209시간으로 계산할까?
              </h2>
              <p>
                최저임금으로 월급을 계산할 때 등장하는 &apos;209시간&apos;의
                비밀은 바로 <strong>주휴수당</strong>에 있습니다. 근로기준법은
                1주일에 15시간 이상 일하고, 약속한 날에 모두 출근한 근로자에게
                1주일에 1일의 유급휴일(주휴일)을 주도록 하고 있습니다. 이날
                일하지 않아도 받을 수 있는 돈이 바로 주휴수당입니다.
              </p>
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold !mt-0 !text-lg">
                  월 209시간 계산법 (주 40시간 근무 기준)
                </h3>
                <ul className="!my-2 !text-base list-none !pl-0">
                  <li>
                    <strong>① 1주 유급 근로시간:</strong> <br />- 실제 근로:
                    8시간 × 5일 = 40시간 <br />- 주휴 시간: 8시간 × 1일 = 8시간{" "}
                    <br />- 합계: <strong>48시간</strong>
                  </li>
                  <li>
                    <strong>② 월 평균 주(週) 수:</strong> <br />- 365일 ÷ 12개월
                    ÷ 7일 ≒ <strong>4.345주</strong>
                  </li>
                  <li>
                    <strong>③ 최종 월 근로시간:</strong> <br />- 48시간 ×
                    4.345주 ≒ <strong>209시간</strong>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-amber-500" />
                최저임금 관련 자주 묻는 질문 (Q&A)
              </h2>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">
                    Q. 수습 기간에는 최저임금을 다 못 받나요?
                  </h3>
                  <p className="!my-0 !text-base">
                    A. 네, 1년 이상 근로계약을 체결한 경우, 수습 시작일로부터
                    3개월 이내에는 최저임금의 90%까지 지급할 수 있습니다. 하지만
                    1년 미만 계약직이거나, 단순 노무 직종(예: 청소, 경비, 서빙
                    등)의 경우에는 수습이라도 100%를 지급해야 합니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">
                    Q. 식대나 교통비도 최저임금에 포함되나요?
                  </h3>
                  <p className="!my-0 !text-base">
                    A. 네, 2024년부터는 식대, 교통비 등 복리후생비 전액이
                    최저임금 계산에 포함됩니다. 과거에는 일부만 포함되었지만,
                    이제는 회사가 지급하는 모든 임금이 최저임금 준수 여부를
                    판단하는 기준이 됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Scale className="w-7 h-7 text-signature-blue" />
                당신의 노동은 소중합니다
              </h2>
              <p>
                최저임금은 단순한 숫자를 넘어, 건강하고 인간다운 삶을 보장하기
                위한 최소한의 사회적 약속입니다. 내 권리를 정확히 알고 지키는
                것부터 시작하세요.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                최저 연봉 기준 실수령액 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
