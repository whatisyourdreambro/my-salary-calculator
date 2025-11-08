
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Handshake, Lightbulb, UserCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "이직 성공 전략, 헤드헌터 200% 활용법: 당신의 몸값을 높여라!",
  description:
    "원하는 회사, 원하는 연봉으로 이직하고 싶다면? 헤드헌터를 200% 활용하는 전략을 알려드립니다. 헤드헌터와 관계 구축하는 법, 매력적인 이력서 작성, 면접 준비 노하우까지. 당신의 몸값을 높이는 이직의 모든 것을 파헤쳐봅니다.",
  openGraph: {
    title: "이직 성공 전략, 헤드헌터 200% 활용법: 당신의 몸값을 높여라!",
    description:
      "헤드헌터는 당신의 이직을 돕는 최고의 조력자입니다. 제대로 활용하여 성공적인 이직을 만드세요.",
    images: ["/api/og?title=헤드헌터 200% 활용법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "이직 성공 전략, 헤드헌터 200% 활용법: 당신의 몸값을 높여라!",
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
    "헤드헌터와 관계 구축하는 법, 매력적인 이력서 작성, 면접 준비 노하우까지. 당신의 몸값을 높이는 이직의 모든 것을 파헤쳐봅니다.",
};

export default function HeadhunterUtilizationGuidePage() {
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
            이직 성공 전략,
            <br /> 헤드헌터 200% 활용법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            원하는 회사, 원하는 연봉으로 이직하고 싶다면? 헤드헌터는 당신의 이직을 돕는 최고의 조력자입니다. 헤드헌터를 200% 활용하여 성공적인 이직을 만드는 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              헤드헌터는 기업의 인재 채용을 대행하는 전문가로, 특히 경력직 이직 시장에서 중요한 역할을 합니다. 혼자서 이직을 준비하는 것보다 헤드헌터의 도움을 받으면 더 좋은 기회를 빠르게 찾고, 연봉 협상 등 까다로운 과정을 전문가의 도움을 받아 진행할 수 있습니다. 하지만 헤드헌터를 어떻게 활용해야 할지 모르는 분들이 많습니다. 이 가이드를 통해 헤드헌터를 200% 활용하여 당신의 몸값을 높이는 이직 성공 전략을 알아보세요.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Handshake className="w-6 h-6" />
                헤드헌터, 왜 활용해야 할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>비공개 채용 정보:</strong> 외부에 공개되지 않는 고급 채용 정보를 얻을 수 있습니다.
                </li>
                <li>
                  <strong>맞춤형 포지션 추천:</strong> 당신의 경력과 역량에 맞는 최적의 포지션을 추천받을 수 있습니다.
                </li>
                <li>
                  <strong>연봉 협상 지원:</strong> 회사와 직접 연봉 협상하기 어려운 부분을 헤드헌터가 대신하여 유리한 조건을 이끌어낼 수 있습니다.
                </li>
                <li>
                  <strong>이직 과정 조언:</strong> 이력서, 경력 기술서 작성부터 면접 준비, 레퍼런스 체크까지 이직 전 과정에 대한 전문가의 조언을 받을 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <UserCheck className="w-7 h-7 text-green-500" />
                헤드헌터 200% 활용을 위한 3단계 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '나만의 강점'을 명확히 정리하라
                  </h3>
                  <p className="!text-sm !my-0">
                    헤드헌터에게 당신을 어필하기 위해서는 당신의 핵심 역량, 강점, 희망 직무 및 연봉 수준을 명확하게 정리해야 합니다. 이력서와 경력 기술서를 최신화하고, 당신의 성과를 숫자로 보여줄 수 있도록 준비하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '전문성 있는 헤드헌터'를 찾아라
                  </h3>
                  <p className="!text-sm !my-0">
                    모든 헤드헌터가 당신의 직무 분야에 전문성을 가지고 있는 것은 아닙니다. 당신의 직무 분야(IT, 마케팅, 재무 등)에 특화된 헤드헌터를 찾아 연락하고, 꾸준히 관계를 유지하는 것이 중요합니다. 링크드인, 헤드헌팅 전문 기업 홈페이지 등을 활용하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '솔직하고 적극적인 소통'으로 신뢰를 쌓아라
                  </h3>
                  <p className="!text-sm !my-0">
                    헤드헌터에게 당신의 이직 희망 조건, 현재 상황, 고민 등을 솔직하게 이야기하고, 추천받은 포지션에 대해 적극적으로 피드백을 주세요. 신뢰를 바탕으로 한 관계는 더 좋은 기회로 이어집니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 헤드헌터 활용 시 주의사항
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>여러 헤드헌터와 동시에 진행:</strong> 한 명의 헤드헌터에게만 의존하기보다는 여러 명의 헤드헌터와 관계를 맺고 다양한 기회를 탐색하는 것이 좋습니다.
                </li>
                <li>
                  <strong>정보 공유의 범위:</strong> 현재 재직 중인 회사에 대한 민감한 정보는 신중하게 공유해야 합니다.
                </li>
                <li>
                  <strong>연봉 협상:</strong> 헤드헌터는 당신의 편이지만, 결국 회사의 입장을 대변하기도 합니다. 최종 연봉 협상은 당신의 몫이므로, 충분히 준비해야 합니다.
                  <Link href="/guides/salary-negotiation" className="text-sm text-yellow-800 hover:underline">→ 연봉 협상 잘하는 법 가이드 보기</Link>
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                당신의 성공적인 이직을 응원합니다!
              </h2>
              <p>
                헤드헌터는 당신의 이직 여정을 함께하는 든든한 파트너입니다. <br />
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
