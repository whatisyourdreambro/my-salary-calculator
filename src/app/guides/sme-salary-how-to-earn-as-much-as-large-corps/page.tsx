
import type { Metadata } from "next";
import Link from "next/link";
import { Building, TrendingUp, Lightbulb, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "중소기업 연봉, 대기업 못지않게 받는 법: 숨겨진 기회를 찾아라!",
  description:
    "'중소기업은 박봉이다?' 편견은 이제 그만! 중소기업에서도 대기업 수준의 연봉을 받을 수 있는 현실적인 전략과 숨겨진 성장 기회를 알려드립니다. 성과 연봉제, 스톡옵션, 연봉 협상 노하우까지.",
  openGraph: {
    title: "중소기업 연봉, 대기업 못지않게 받는 법: 숨겨진 기회를 찾아라!",
    description:
      "중소기업에서도 당신의 가치를 제대로 인정받고 높은 연봉을 쟁취하세요. 대기업만이 정답은 아닙니다.",
    images: ["/api/og?title=중소기업 연봉, 대기업처럼 받기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "중소기업 연봉, 대기업 못지않게 받는 법: 숨겨진 기회를 찾아라!",
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
    "중소기업에서도 대기업 수준의 연봉을 받을 수 있는 현실적인 전략과 숨겨진 성장 기회를 알려드립니다. 성과 연봉제, 스톡옵션, 연봉 협상 노하우까지.",
};

export default function SmeSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-600 dark:from-gray-900 dark:to-green-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            중소기업 연봉,
            <br /> 대기업 못지않게 받는 법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            '중소기업은 연봉이 낮다'는 편견 때문에 좋은 기회를 놓치고 있지는 않으신가요? 중소기업에서도 당신의 가치를 제대로 인정받고 대기업 수준의 연봉을 쟁취하는 현실적인 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              많은 구직자들이 대기업만을 목표로 하지만, 국내 기업의 99%는 중소기업입니다. 중소기업은 대기업에 비해 상대적으로 낮은 연봉이라는 인식이 있지만, 이는 모든 중소기업에 해당되는 이야기가 아닙니다. 성장 가능성이 높은 강소기업이나 스타트업의 경우, 대기업 못지않은 연봉과 파격적인 보상을 제공하기도 합니다. 중요한 것은 '어떤 중소기업'을 선택하고, '어떻게 나의 가치를 증명'하느냐에 달려 있습니다.
            </p>

            <section className="mt-12 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
              <h2 className="!mt-0 !text-2xl font-bold text-green-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                중소기업, 숨겨진 기회를 찾아라!
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>빠른 성장 기회:</strong> 대기업보다 직급 체계가 유연하고, 다양한 업무를 경험하며 빠르게 성장할 수 있습니다.
                </li>
                <li>
                  <strong>성과에 따른 보상:</strong> 성과 연봉제, 스톡옵션 등 개인의 성과에 따라 파격적인 보상을 제공하는 곳이 많습니다.
                </li>
                <li>
                  <strong>워라밸:</strong> 대기업보다 상대적으로 유연한 근무 환경과 수평적인 문화를 가진 곳이 많아 워라밸을 중시하는 구직자에게 유리합니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-purple-500" />
                중소기업에서 연봉 높이는 3가지 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '성장 가능성' 있는 강소기업/스타트업 선택
                  </h3>
                  <p className="!text-sm !my-0">
                    초봉이 다소 낮더라도, 기술력이나 시장 경쟁력을 갖춘 성장형 기업을 선택하는 것이 중요합니다. 회사의 성장이 곧 나의 연봉 상승으로 이어질 가능성이 높습니다. 특히 스톡옵션을 제공하는 스타트업은 대박의 기회를 잡을 수도 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '성과'로 나의 가치를 증명하라
                  </h3>
                  <p className="!text-sm !my-0">
                    중소기업은 대기업보다 개인의 성과가 회사 전체에 미치는 영향이 큽니다. 당신의 업무 성과를 구체적인 숫자로 증명하고, 이를 연봉 협상에 적극적으로 활용하세요. '나는 회사에 이만큼 기여했다'는 강력한 근거가 됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '연봉 협상'은 필수, 자신감을 가져라
                  </h3>
                  <p className="!text-sm !my-0">
                    중소기업은 대기업처럼 정해진 연봉 테이블이 없는 경우가 많습니다. 이는 곧 당신의 협상력에 따라 연봉이 달라질 수 있다는 의미입니다. 이직 시에는 반드시 이전 연봉과 희망 연봉을 명확히 제시하고, 당신의 역량을 어필하여 원하는 연봉을 쟁취하세요.
                  </p>
                   <Link href="/guides/salary-negotiation" className="text-sm text-blue-600 hover:underline">→ 연봉 협상 잘하는 법 가이드 보기</Link>
                </div>
              </div>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                당신의 가치를 알아주는 회사를 찾으세요!
              </h2>
              <p>
                중소기업이라고 무조건 연봉이 낮을 것이라는 편견을 버리고, 당신의 역량을 제대로 평가하고 보상해줄 수 있는 회사를 찾아보세요. <br />
                Moneysalary가 당신의 성공적인 커리어를 응원합니다.
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
