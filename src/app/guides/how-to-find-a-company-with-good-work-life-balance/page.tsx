
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Sun, Moon, Lightbulb, Search, CheckCircle, XCircle } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "워라밸 좋은 회사 찾는 법: 그린라이트 vs 레드플래그 (2025년)",
  description:
    "진짜 워라밸 좋은 회사는 어떻게 찾을까? 채용 공고와 면접에서 좋은 회사의 시그널(그린라이트)과 나쁜 회사의 시그널(레드플래그)을 구별하는 법, 그리고 면접에서 던져야 할 핵심 질문까지 알려드립니다.",
  openGraph: {
    title: "워라밸 좋은 회사 찾는 법: 그린라이트 vs 레드플래그 (2025년)",
    description:
      "일과 삶의 균형, 당신의 행복을 위한 필수 조건입니다. 워라밸 좋은 회사를 찾아 당신의 삶을 변화시키세요.",
    images: ["/api/og?title=워라밸 좋은 회사, 그린라이트 찾는 법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "워라밸 좋은 회사 찾는 법: 그린라이트 vs 레드플래그 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-07-05",
  dateModified: currentDate,
  description:
    "채용 공고와 면접에서 좋은 회사의 시그널(그린라이트)과 나쁜 회사의 시그널(레드플래그)을 구별하는 법, 그리고 면접에서 던져야 할 핵심 질문을 알려드립니다.",
};

export default function WorkLifeBalanceCompanyGuidePage() {
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
            워라밸 좋은 회사,
            <br /> 어떻게 찾을까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            높은 연봉만이 행복의 기준은 아닙니다. 일과 삶의 균형을 중요하게 생각하는 당신을 위해, '진짜' 워라밸 좋은 회사를 찾아내는 구체적인 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-cyan-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              '워라밸'은 단순히 야근이 없는 회사를 의미하지 않습니다. 개인의 삶을 존중하고, 불필요한 감정 소모 없이 업무에 몰입하며, 그 안에서 성장을 지원하는 문화가 바로 진짜 워라밸입니다. 하지만 좋은 회사를 가려내는 것은 쉽지 않죠. 채용 공고와 면접에서 숨겨진 신호를 읽어내는 방법을 알려드립니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Search className="w-7 h-7 text-purple-500" />
                채용 공고에서 워라밸 시그널 읽기
              </h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300 flex items-center gap-2"><CheckCircle className="w-6 h-6"/> 그린라이트 🟢</h3>
                  <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
                    <li>체계적인 온보딩/교육 시스템 언급</li>
                    <li>명확한 역할과 책임(R&R) 설명</li>
                    <li>유연/재택근무 제도의 구체적 명시</li>
                    <li>합리적인 성과 측정 방식 제시</li>
                  </ul>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-bold !mt-0 !mb-2 text-red-700 dark:text-red-300 flex items-center gap-2"><XCircle className="w-6 h-6"/> 레드플래그 🔴</h3>
                  <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
                    <li>'가족같은 분위기', '주인의식' 강조</li>
                    <li>'포괄임금제' 시행 (야근비 없음)</li>
                    <li>구체적인 직무 설명 없이 '열정'만 요구</li>
                    <li>같은 포지션의 채용 공고가 너무 자주 올라옴</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                면접에서 워라밸 검증하는 핵심 질문 5가지
              </h2>
              <p className="!my-2 text-base">
                면접은 당신이 회사를 평가하는 시간이기도 합니다. 아래 질문들을 통해 회사의 민낯을 확인하세요.
              </p>
              <ol className="!my-4 space-y-2 text-base list-decimal list-inside">
                <li>"팀의 평균적인 하루 일과는 어떻게 되나요? 야근이나 주말 근무는 어느 정도 빈도인가요?"</li>
                <li>"업무 성과는 주로 어떤 방식으로 측정하고 평가받나요?"</li>
                <li>"팀원들의 워라밸을 위해 팀장님께서 특별히 노력하시는 부분이 있으신가요?"</li>
                <li>"입사하게 된다면, 3개월/6개월 후 저에게 기대하는 모습은 무엇인가요?"</li>
                <li>"팀에서 새로운 기술이나 업무 방식 도입에 대해 얼마나 열려 있나요?"</li>
              </ol>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">성장과 워라밸, 두 마리 토끼 잡기</h2>
              <p>
                진정한 워라밸은 '일하지 않는 것'이 아니라, '똑똑하게 일하고, 일한 만큼 성장하며, 그 외의 시간에는 온전히 나에게 집중하는 것'입니다. 불필요한 야근과 비효율적인 업무 프로세스가 없는 회사는 오히려 개인의 성장에 더 큰 도움이 됩니다. 성장과 워라밸은 결코 반대말이 아닙니다.
              </p>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                나의 워라밸, 이대로 괜찮을까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                현재 나의 직장 생활에 만족하시나요? 혹시 번아웃의 신호를 느끼고 있다면, 당신의 상태를 점검하고 새로운 기회를 탐색해볼 때일지도 모릅니다.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/guides/burnout-syndrome-what-office-workers-must-know"
                    className="inline-block py-3 px-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-center font-semibold hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    번아웃 자가진단 가이드
                </Link>
                <Link
                    href="/guides/job-change-success-strategy-200-percent-use-of-headhunters"
                    className="inline-block py-3 px-6 bg-signature-blue text-white rounded-lg text-center font-semibold hover:bg-blue-700"
                >
                    이직 성공 전략 가이드
                </Link>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
