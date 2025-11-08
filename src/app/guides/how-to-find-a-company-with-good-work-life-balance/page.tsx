
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Sun, Moon, Lightbulb, Search } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "워라밸 좋은 회사, 어떻게 찾을까? (직장인 행복 지수 높이는 법)",
  description:
    "높은 연봉만이 행복의 기준은 아니다! 워라밸(Work-Life Balance) 좋은 회사의 특징, 찾아내는 방법, 그리고 면접 시 워라밸을 확인할 수 있는 질문들을 상세히 알려드립니다. 당신의 행복한 직장 생활을 위한 가이드.",
  openGraph: {
    title: "워라밸 좋은 회사, 어떻게 찾을까? (직장인 행복 지수 높이는 법)",
    description:
      "일과 삶의 균형, 당신의 행복을 위한 필수 조건입니다. 워라밸 좋은 회사를 찾아 당신의 삶을 변화시키세요.",
    images: ["/api/og?title=워라밸 좋은 회사, 찾는 법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "워라밸 좋은 회사, 어떻게 찾을까? (직장인 행복 지수 높이는 법)",
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
    "워라밸(Work-Life Balance) 좋은 회사의 특징, 찾아내는 방법, 그리고 면접 시 워라밸을 확인할 수 있는 질문들을 상세히 알려드립니다. 당신의 행복한 직장 생활을 위한 가이드.",
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
            높은 연봉만이 행복의 기준은 아닙니다. 일과 삶의 균형을 중요하게 생각하는 당신을 위해, 워라밸 좋은 회사의 특징과 이러한 기업을 찾아내는 구체적인 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-cyan-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              최근 몇 년간 직장인들 사이에서 '워라밸(Work-Life Balance)'은 연봉만큼이나 중요한 가치로 떠올랐습니다. 단순히 야근이 없는 회사를 넘어, 개인의 삶을 존중하고 성장을 지원하는 기업 문화가 좋은 워라밸의 핵심입니다. 하지만 수많은 회사 중에서 나에게 맞는 워라밸 좋은 회사를 찾는 것은 쉽지 않습니다. 이 가이드를 통해 워라밸 좋은 회사의 특징을 파악하고, 당신의 행복한 직장 생활을 위한 현명한 선택을 하세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <Sun className="w-6 h-6" />
                워라밸 좋은 회사, 이런 특징이 있어요!
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>유연한 근무 제도:</strong> 유연근무제, 재택근무, 시차출퇴근제 등 개인의 상황에 맞춰 근무 시간을 조절할 수 있는 제도.
                </li>
                <li>
                  <strong>합리적인 업무량:</strong> 과도한 야근이나 주말 근무가 적고, 업무량 조절이 가능한 문화.
                </li>
                <li>
                  <strong>수평적인 조직 문화:</strong> 자유로운 소통과 의견 개진이 가능하며, 개인의 성장을 지원하는 분위기.
                </li>
                <li>
                  <strong>다양한 복지 혜택:</strong> 건강 관리, 자기계발, 휴가 지원 등 직원들의 삶의 질 향상을 위한 실질적인 복지 혜택.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Search className="w-7 h-7 text-purple-500" />
                워라밸 좋은 회사, 찾아내는 3가지 방법
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 기업 리뷰 사이트 활용 (잡플래닛, 블라인드)
                  </h3>
                  <p className="!text-sm !my-0">
                    현직자들의 솔직한 기업 리뷰를 통해 회사의 워라밸 수준을 간접적으로 파악할 수 있습니다. 특히 '장점', '단점', '경영진에게 바라는 점' 등을 꼼꼼히 살펴보세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 면접 시 질문 활용
                  </h3>
                  <p className="!text-sm !my-0">
                    면접은 회사의 문화를 직접적으로 확인할 수 있는 좋은 기회입니다. '평균 퇴근 시간은 어떻게 되나요?', '유연근무제나 재택근무를 활용하는 직원이 많나요?', '팀원들의 워라밸을 위해 어떤 노력을 하시나요?' 등 구체적인 질문을 통해 워라밸 수준을 파악하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 현직자 네트워킹
                  </h3>
                  <p className="!text-sm !my-0">
                    링크드인이나 업계 커뮤니티를 통해 해당 회사 현직자들과 소통하며 실제 워라밸 분위기를 파악하는 것이 가장 정확합니다. 솔직한 이야기를 들을 수 있는 좋은 기회입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 워라밸, 당신의 기준은 무엇인가요?
              </h2>
              <p className="!my-2 text-base">
                워라밸은 개인마다 기준이 다릅니다. 단순히 야근이 없는 것을 넘어, 당신의 삶에서 무엇을 중요하게 생각하는지 명확히 정의하고, 그 기준에 맞는 회사를 찾아야 합니다. 연봉, 성장 가능성, 워라밸 등 다양한 요소를 종합적으로 고려하여 당신의 행복한 직장 생활을 위한 최적의 선택을 하세요.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                당신의 행복한 직장 생활을 응원합니다!
              </h2>
              <p>
                워라밸 좋은 회사를 찾아 당신의 삶을 변화시키세요. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/industry-trends-2025"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                2025년 유망 산업 트렌드 확인하기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
