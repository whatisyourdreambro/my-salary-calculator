
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, Lightbulb, UserCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "경력 기술서, 이직 성공의 핵심: 합격률 높이는 작성법 (2025년)",
  description:
    "이력서만으로는 부족하다! 당신의 경험과 성과를 효과적으로 어필하여 서류 합격률을 높이는 경력 기술서 작성법을 알려드립니다. STAR 기법, 숫자로 성과 증명, 직무별 맞춤 전략까지. 당신의 이직 성공을 위한 필승 전략을 파헤쳐봅니다.",
  openGraph: {
    title: "경력 기술서, 이직 성공의 핵심: 합격률 높이는 작성법 (2025년)",
    description:
      "경력 기술서는 당신의 얼굴입니다. 매력적인 경력 기술서로 당신의 꿈을 현실로 만드세요.",
    images: ["/api/og?title=경력 기술서, 이직 성공의 핵심"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "경력 기술서, 이직 성공의 핵심: 합격률 높이는 작성법 (2025년)",
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
    "당신의 경험과 성과를 효과적으로 어필하여 서류 합격률을 높이는 경력 기술서 작성법을 알려드립니다. STAR 기법, 숫자로 성과 증명, 직무별 맞춤 전략까지. 당신의 이직 성공을 위한 필승 전략을 파헤쳐봅니다.",
};

export default function CareerDescriptionGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            경력 기술서,
            <br /> 이직 성공의 핵심
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            이력서만으로는 당신의 역량을 다 보여줄 수 없습니다. 당신의 경험과 성과를 효과적으로 어필하여 서류 합격률을 높이는 경력 기술서 작성법을 알려드립니다. 당신의 이직 성공을 위한 필승 전략을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              경력 기술서는 당신의 직무 역량과 경험을 구체적인 성과를 중심으로 보여주는 문서입니다. 특히 경력직 이직에서는 이력서보다 경력 기술서가 합격 여부를 결정하는 데 더 큰 영향을 미치기도 합니다. 단순히 수행했던 업무를 나열하는 것을 넘어, 당신의 강점과 문제 해결 능력을 효과적으로 어필할 수 있는 경력 기술서를 만드는 것이 중요합니다. 이 가이드를 통해 합격률을 높이는 경력 기술서 작성법을 알아보세요.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                경력 기술서, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>실무 역량 증명:</strong> 당신이 어떤 기술을 가지고 있고, 어떤 프로젝트를 수행했으며, 어떤 성과를 냈는지 구체적으로 보여줄 수 있습니다.
                </li>
                <li>
                  <strong>차별화된 경쟁력:</strong> 수많은 지원자들 사이에서 당신만의 강점과 개성을 어필하여 차별화된 경쟁력을 확보할 수 있습니다.
                </li>
                <li>
                  <strong>면접의 도구:</strong> 경력 기술서를 바탕으로 면접관과 심도 있는 대화를 나누며 당신의 역량을 더욱 효과적으로 전달할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-green-500" />
                합격률 높이는 경력 기술서, 3단계 작성법
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 'STAR 기법'으로 성과를 구체화하라
                  </h3>
                  <p className="!text-sm !my-0">
                    STAR 기법(Situation, Task, Action, Result)은 당신의 경험과 성과를 구체적으로 설명하는 효과적인 방법입니다. 어떤 상황(Situation)에서 어떤 과제(Task)를 맡았고, 어떤 행동(Action)을 통해 어떤 결과(Result)를 얻었는지 숫자를 포함하여 작성하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '직무별 맞춤 전략'으로 핵심 역량 강조
                  </h3>
                  <p className="!text-sm !my-0">
                    지원하는 직무에서 요구하는 핵심 역량을 파악하고, 당신의 경력 중 해당 역량을 가장 잘 보여줄 수 있는 부분을 강조하세요. 예를 들어, 개발 직무라면 사용한 기술 스택과 프로젝트 기여도를, 마케팅 직무라면 캠페인 성과와 데이터 분석 능력을 부각하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '깔끔하고 가독성 높은' 구성과 디자인
                  </h3>
                  <p className="!text-sm !my-0">
                    인사 담당자는 수많은 경력 기술서를 검토합니다. 한눈에 들어오는 깔끔한 구성과 가독성 높은 디자인은 당신의 경력 기술서를 더욱 돋보이게 합니다. 핵심 내용은 볼드 처리하거나, 표를 활용하여 시각적으로 강조하세요.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 경력 기술서, 이것만은 피하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>단순 업무 나열:</strong> '무엇을 했다'보다는 '무엇을 통해 어떤 성과를 냈다'를 보여주세요.
                </li>
                <li>
                  <strong>추상적인 표현:</strong> '열심히 노력했다'보다는 구체적인 숫자와 데이터를 활용하세요.
                </li>
                <li>
                  <strong>오탈자 및 비문:</strong> 기본적인 맞춤법과 문법은 반드시 확인하세요.
                </li>
                <li>
                  <strong>회사 기밀 유출:</strong> 이전 회사 프로젝트를 경력 기술서에 포함할 경우, 회사 기밀 유출에 주의하고 반드시 비공개 처리하거나 회사와 협의하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <UserCheck className="w-7 h-7 text-indigo-500" />
                당신의 이직 성공을 응원합니다!
              </h2>
              <p>
                경력 기술서는 당신의 이직 성공을 위한 가장 강력한 무기입니다. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/salary-negotiation"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연봉 협상 잘하는 법 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
