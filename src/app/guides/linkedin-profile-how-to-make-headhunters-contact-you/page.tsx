
import type { Metadata } from "next";
import Link from "next/link";
import { User, Briefcase, Search, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "링크드인 프로필, 이렇게 만들면 헤드헌터가 연락 온다 (이직 필승 전략)",
  description:
    "헤드헌터의 러브콜을 받고 싶다면? 링크드인 프로필 최적화가 핵심입니다. 매력적인 헤드라인, 상세한 경력 기술, 핵심 키워드 활용, 그리고 네트워크 확장 노하우까지. 당신의 몸값을 높이는 링크드인 프로필 작성법을 알려드립니다.",
  openGraph: {
    title: "링크드인 프로필, 이렇게 만들면 헤드헌터가 연락 온다 (이직 필승 전략)",
    description:
      "링크드인, 더 이상 단순한 SNS가 아닙니다. 당신의 커리어를 바꾸는 강력한 도구입니다. 지금 바로 프로필을 최적화하세요.",
    images: ["/api/og?title=링크드인 프로필, 헤드헌터가 찾는 법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "링크드인 프로필, 이렇게 만들면 헤드헌터가 연락 온다 (이직 필승 전략)",
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
    "매력적인 헤드라인, 상세한 경력 기술, 핵심 키워드 활용, 그리고 네트워크 확장 노하우까지. 당신의 몸값을 높이는 링크드인 프로필 작성법을 알려드립니다.",
};

export default function LinkedinProfileGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            링크드인 프로필,
            <br /> 헤드헌터가 연락 오게 만드는 법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            당신의 커리어를 한 단계 업그레이드하고 싶다면, 링크드인 프로필부터 점검하세요. 헤드헌터의 눈길을 사로잡고, 원하는 포지션 제안을 받을 수 있도록 프로필을 최적화하는 모든 노하우를 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              링크드인은 단순한 소셜 미디어가 아닙니다. 전 세계 비즈니스 전문가들이 모여 정보를 교환하고, 채용 기회를 탐색하는 '글로벌 비즈니스 플랫폼'입니다. 특히 헤드헌터들은 링크드인을 통해 잠재력 있는 인재를 발굴하고, 기업에 적합한 인재를 추천합니다. 당신의 링크드인 프로필이 잘 관리되어 있다면, 헤드헌터의 러브콜을 받아 더 좋은 기회로 이직할 수 있습니다. 이 가이드를 통해 링크드인 프로필을 최적화하고, 당신의 몸값을 높이는 이직 성공 전략을 알아보세요.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <User className="w-6 h-6" />
                링크드인 프로필, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>헤드헌터의 주요 채널:</strong> 헤드헌터들은 링크드인을 통해 인재를 검색하고, 적합한 후보자에게 먼저 연락을 취합니다.
                </li>
                <li>
                  <strong>개인의 브랜딩:</strong> 당신의 전문성과 역량을 보여주는 온라인 포트폴리오 역할을 합니다. 당신의 전문성을 효과적으로 어필할 수 있습니다.
                </li>
                <li>
                  <strong>네트워크 확장:</strong> 업계 전문가들과 연결되고, 정보를 교환하며 새로운 기회를 탐색할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Search className="w-7 h-7 text-green-500" />
                헤드헌터가 찾는 링크드인 프로필, 5단계 최적화 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 전문적인 프로필 사진과 헤드라인
                  </h3>
                  <p className="!text-sm !my-0">
                    깔끔하고 전문적인 프로필 사진은 첫인상을 결정합니다. 헤드라인에는 당신의 직무, 핵심 역량, 그리고 희망하는 포지션을 명확하게 작성하여 헤드헌터가 당신을 쉽게 찾을 수 있도록 하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 상세하고 구체적인 경력 기술
                  </h3>
                  <p className="!text-sm !my-0">
                    각 경력 사항에 대해 당신이 수행한 업무와 그 성과를 구체적인 숫자로 작성하세요. 단순히 '담당했다'가 아닌 '무엇을 어떻게 해서 어떤 결과를 만들었다'를 명확히 보여주는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 핵심 키워드 활용
                  </h3>
                  <p className="!text-sm !my-0">
                    당신의 직무와 관련된 핵심 키워드(기술 스택, 산업 용어 등)를 프로필 곳곳에 자연스럽게 배치하세요. 헤드헌터는 키워드 검색을 통해 인재를 찾으므로, 관련 키워드가 많을수록 노출될 확률이 높아집니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    4. 추천서와 기술 검증
                  </h3>
                  <p className="!text-sm !my-0">
                    이전 직장 동료나 상사에게 추천서를 요청하고, 당신의 기술을 검증받으세요. 이는 당신의 역량에 대한 신뢰도를 높여줍니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    5. 적극적인 활동과 네트워크 확장
                  </h3>
                  <p className="!text-sm !my-0">
                    관심 있는 분야의 게시물에 좋아요를 누르거나 댓글을 달고, 관련 그룹에 참여하여 당신의 전문성을 보여주세요. 또한, 헤드헌터나 업계 전문가들과 연결을 맺어 네트워크를 확장하세요.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 링크드인 프로필, 이것만은 피하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>오래된 정보:</strong> 최신 경력과 기술 스택으로 항상 업데이트하세요.
                </li>
                <li>
                  <strong>추상적인 표현:</strong> '열심히 일했다'보다는 '매출 20% 상승에 기여했다'처럼 구체적인 성과를 작성하세요.
                </li>
                <li>
                  <strong>비전문적인 사진:</strong> 셀카나 과도한 보정 사진은 피하고, 전문적인 느낌의 사진을 사용하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                당신의 커리어를 한 단계 업그레이드하세요!
              </h2>
              <p>
                링크드인 프로필은 당신의 커리어에 중요한 전환점이 될 수 있습니다. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 몸값을 높이세요.
              </p>
              <Link
                href="/guides/job-change-success-strategy-200-percent-use-of-headhunters"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                헤드헌터 200% 활용법 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
