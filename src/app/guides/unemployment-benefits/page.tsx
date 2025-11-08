import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, CalendarCheck, AlertTriangle } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "실업급여 조건, 신청 방법, 수급 기간 총정리 (2025년 최신)",
  description:
    "갑작스러운 실직, 막막하신가요? 2025년 최신 실업급여 수급 조건(자발적 퇴사 포함), 신청 방법, 지급액, 수급 기간까지! 당신의 불안감을 덜어줄 실업급여의 모든 것을 알려드립니다.",
  openGraph: {
    title: "실업급여 조건, 신청 방법, 수급 기간 총정리 (2025년 최신)",
    description:
      "실업급여, 더 이상 어렵지 않습니다. 당신의 권리를 찾고 재취업의 발판을 마련하세요.",
    images: ["/api/og?title=실업급여, 당신의 권리입니다"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "실업급여 조건, 신청 방법, 수급 기간 총정리 (2025년 최신)",
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
    "2025년 최신 실업급여 수급 조건(자발적 퇴사 포함), 신청 방법, 지급액, 수급 기간까지! 당신의 불안감을 덜어줄 실업급여의 모든 것을 알려드립니다.",
};

export default function UnemploymentBenefitsGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-orange-500 to-red-600 dark:from-gray-900 dark:to-orange-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            실업급여,
            <br /> 불안한 당신을 위한 안전망
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-red-100 dark:text-gray-300">
            갑작스러운 실직은 누구에게나 찾아올 수 있습니다. 하지만 실업급여는 당신이 다시 일어설 수 있도록 돕는 든든한 버팀목입니다. 조건부터 신청까지, 모든 것을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-red-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              실업급여는 고용보험 가입 근로자가 실직하여 재취업 활동을 하는 기간 동안 소정의 급여를 지급하여 생활 안정을 돕고 재취업의 기회를 지원하는 제도입니다. 많은 분들이 '자발적 퇴사는 실업급여를 받을 수 없다'고 오해하지만, 특정 조건에서는 자발적 퇴사자도 실업급여를 받을 수 있습니다. 당신의 권리를 제대로 알고 활용하세요.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-blue-500" />
                실업급여, 누가 받을 수 있나요? (수급 조건)
              </h2>
              <p>
                실업급여를 받기 위해서는 아래 4가지 조건을 <strong>모두</strong> 충족해야 합니다.
              </p>
              <ol className="!my-4 list-decimal list-inside space-y-4 text-base bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <li>
                  <strong>고용보험 가입 기간:</strong> 이직일 이전 18개월(초단시간 근로자는 24개월) 중 고용보험 가입 기간이 <strong>180일 이상</strong>이어야 합니다.
                </li>
                <li>
                  <strong>비자발적 이직:</strong> 해고, 권고사직, 계약 만료 등 비자발적인 사유로 퇴사해야 합니다. (단, 자발적 퇴사라도 정당한 사유가 있다면 수급 가능)
                </li>
                <li>
                  <strong>재취업 의사 및 노력:</strong> 근로의 의사와 능력이 있음에도 불구하고 취업하지 못한 상태여야 하며, 적극적으로 재취업 활동을 해야 합니다.
                </li>
                <li>
                  <strong>실업 신고:</strong> 이직 후 지체 없이 거주지 관할 고용센터에 방문하여 실업을 신고해야 합니다.
                </li>
              </ol>
              <blockquote className="!border-l-red-500 mt-6">
                <p>
                  <strong>자발적 퇴사, 실업급여 받을 수 있나요?</strong> 네, 가능합니다! 이직 전 사업장에서의 근로조건이 현저히 낮아졌거나, 질병/부상으로 업무 수행이 곤란한 경우, 사업장 이전으로 통근이 어려워진 경우 등 <strong>'정당한 사유'</strong>가 있다면 자발적 퇴사자도 실업급여를 받을 수 있습니다. 자세한 내용은 고용센터에 문의하세요.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-green-500" />
                실업급여 신청 방법 (단계별 가이드)
              </h2>
              <p>
                실업급여 신청은 크게 3단계로 진행됩니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 워크넷 구직 등록
                  </h3>
                  <p className="!text-sm !my-0">
                    가장 먼저 워크넷(www.work.go.kr)에 접속하여 구직 등록을 해야 합니다. 이력서 작성 및 희망 직종 등을 입력합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 수급자격 신청 교육 이수
                  </h3>
                  <p className="!text-sm !my-0">
                    고용보험 홈페이지(www.ei.go.kr) 또는 고용센터 방문을 통해 수급자격 신청 교육을 이수합니다. 온라인 교육이 편리합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 고용센터 방문 및 수급자격 인정 신청
                  </h3>
                  <p className="!text-sm !my-0">
                    신분증을 지참하고 거주지 관할 고용센터에 방문하여 실업급여 수급자격 인정 신청서를 제출합니다. 이때 이직확인서, 근로계약서 등 관련 서류를 함께 제출해야 합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <CalendarCheck className="w-7 h-7 text-purple-500" />
                실업급여 지급액 및 수급 기간
              </h2>
              <p>
                실업급여는 퇴직 전 평균 임금의 60%를 지급하며, 상한액과 하한액이 정해져 있습니다. 수급 기간은 고용보험 가입 기간과 연령에 따라 최소 120일에서 최대 270일까지 차등 적용됩니다.
              </p>
              <blockquote className="!border-l-purple-500 mt-6">
                <p>
                  <strong>2025년 실업급여 상한액 (예상):</strong> 1일 66,000원 (월 약 198만원)
                </p>
                <p>
                  <strong>2025년 실업급여 하한액 (예상):</strong> 최저임금의 80% (1일 약 81,280원)
                </p>
                <p className="text-sm">
                  * 정확한 금액은 고용보험 가입 기간, 퇴직 전 평균 임금, 연령 등에 따라 달라집니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                더 궁금한 점이 있다면?
              </h2>
              <p>
                실업급여에 대한 더 자세한 정보나 궁금한 점이 있다면, <br />
                고용보험 홈페이지를 방문하거나 고용센터에 문의하세요.
              </p>
              <Link
                href="https://www.ei.go.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                고용보험 홈페이지 바로가기 🌐
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}