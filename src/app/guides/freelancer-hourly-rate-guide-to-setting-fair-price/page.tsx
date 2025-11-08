
import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, DollarSign, Lightbulb, Handshake } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "프리랜서 시급 계산, 적정 단가 설정 가이드: 당신의 가치를 제대로!",
  description:
    "프리랜서라면 반드시 알아야 할 적정 시급/단가 계산법! 나의 경력, 전문성, 시장 상황을 고려한 합리적인 가격 책정 노하우와 클라이언트와의 성공적인 협상 전략을 알려드립니다. 더 이상 저가 수주로 손해 보지 마세요.",
  openGraph: {
    title: "프리랜서 시급 계산, 적정 단가 설정 가이드: 당신의 가치를 제대로!",
    description:
      "프리랜서, 당신의 시간과 재능은 소중합니다. 제대로 된 단가를 받고 일하는 방법을 알려드립니다.",
    images: ["/api/og?title=프리랜서 적정 단가 설정"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "프리랜서 시급 계산, 적정 단가 설정 가이드: 당신의 가치를 제대로!",
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
    "나의 경력, 전문성, 시장 상황을 고려한 합리적인 가격 책정 노하우와 클라이언트와의 성공적인 협상 전략을 알려드립니다. 더 이상 저가 수주로 손해 보지 마세요.",
};

export default function FreelancerHourlyRateGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-gray-900 dark:to-teal-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            프리랜서 시급 계산,
            <br /> 당신의 가치를 제대로!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            자유로운 영혼, 프리랜서! 하지만 '얼마를 받아야 할까?'라는 질문 앞에서 막막해지곤 합니다. 당신의 시간과 재능에 합당한 적정 단가를 설정하고, 클라이언트와 성공적으로 협상하는 노하우를 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-cyan-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              프리랜서는 스스로의 가치를 증명하고, 그에 합당한 보상을 요구해야 하는 '1인 기업'입니다. 하지만 많은 프리랜서들이 자신의 가치를 제대로 책정하지 못해 저가 수주에 시달리거나, 클라이언트와의 협상에서 어려움을 겪곤 합니다. 이 가이드를 통해 당신의 전문성과 시장 가치를 정확히 파악하고, 자신감 있게 적정 단가를 제시하는 방법을 배워보세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                프리랜서 단가, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>수익성 확보:</strong> 적정 단가를 받지 못하면 아무리 열심히 일해도 충분한 수익을 얻기 어렵습니다. 이는 장기적인 프리랜서 활동에 지장을 줍니다.
                </li>
                <li>
                  <strong>전문성 인정:</strong> 합리적인 단가는 당신의 전문성과 서비스 품질에 대한 자신감을 보여주는 지표가 됩니다. 저가 수주는 오히려 당신의 가치를 떨어뜨릴 수 있습니다.
                </li>
                <li>
                  <strong>지속 가능한 활동:</strong> 적정 단가를 받아야 자기계발, 휴식 등에 투자할 여유가 생겨 지속 가능한 프리랜서 활동이 가능해집니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Calculator className="w-7 h-7 text-signature-blue" />
                프리랜서 적정 시급/단가 계산법 (3단계)
              </h2>
              <p>
                당신의 적정 시급 또는 프로젝트 단가를 계산하기 위한 3단계 가이드입니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 목표 월수입 설정: 내가 벌고 싶은 돈은?
                  </h3>
                  <p className="!text-sm !my-0">
                    가장 먼저 당신이 한 달에 벌고 싶은 순수입을 정하세요. 여기에 4대 보험료, 세금, 퇴직금(개인 연금), 자기계발비, 장비 유지비 등 '숨겨진 비용'을 더해야 합니다. 프리랜서는 이 모든 것을 스스로 부담해야 합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 월 가용 근무 시간 계산: 내가 일할 수 있는 시간은?
                  </h3>
                  <p className="!text-sm !my-0">
                    한 달 총 근무 시간에서 주말, 공휴일, 휴가, 그리고 영업 활동, 자기계발, 행정 업무 등에 소요되는 '비청구 시간'을 제외한 순수하게 클라이언트에게 청구할 수 있는 시간을 계산합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 적정 시급/단가 도출: (목표 월수입) ÷ (월 가용 근무 시간)
                  </h3>
                  <p className="!text-sm !my-0">
                    1단계에서 계산한 목표 월수입을 2단계에서 계산한 월 가용 근무 시간으로 나누면 당신의 '최소 시급'이 나옵니다. 여기에 당신의 경력, 전문성, 시장 평균 단가 등을 고려하여 최종 단가를 결정합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Handshake className="w-6 h-6" /> 클라이언트와의 협상 노하우
              </h2>
              <p className="!my-2 text-base">
                단가 계산만큼 중요한 것이 클라이언트와의 협상입니다. 당신의 전문성과 가치를 자신감 있게 어필하고, 왜 이 단가를 받아야 하는지 논리적으로 설명하세요. 포트폴리오, 이전 프로젝트 성공 사례 등을 활용하면 더욱 효과적입니다.
              </p>
              <Link href="/guides/salary-negotiation" className="font-semibold text-yellow-800 hover:underline">
                → 연봉 협상 잘하는 법 가이드 참고하기
              </Link>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Lightbulb className="w-7 h-7 text-indigo-500" />
                프리랜서, 당신의 가치를 제대로 인정받으세요!
              </h2>
              <p>
                자유로운 만큼 책임도 큰 프리랜서의 삶. 당신의 시간과 재능에 합당한 보상을 받고 <br />
                성공적인 프리랜서 커리어를 만들어나가세요.
              </p>
              <Link
                href="/freelancer-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                프리랜서 세금 계산기 바로가기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
