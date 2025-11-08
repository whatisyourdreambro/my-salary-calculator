
import type { Metadata } from "next";
import Link from "next/link";
import { Code, Rocket, Lightbulb, GraduationCap } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "커리어 전환, 비전공자도 IT 개발자 될 수 있을까? (현실적인 로드맵)",
  description:
    "'코딩 한 번 안 해봤는데...' 비전공자도 IT 개발자가 될 수 있습니다! 국비 지원 부트캠프, 온라인 강의, 독학 등 현실적인 학습 경로와 포트폴리오 준비, 취업 전략까지. 당신의 커리어를 바꾸는 비전공자 개발자 로드맵을 알려드립니다.",
  openGraph: {
    title: "커리어 전환, 비전공자도 IT 개발자 될 수 있을까? (현실적인 로드맵)",
    description:
      "비전공자 개발자, 더 이상 꿈이 아닙니다. 당신의 열정과 노력으로 IT 전문가가 될 수 있습니다.",
    images: ["/api/og?title=비전공자 IT 개발자, 가능할까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "커리어 전환, 비전공자도 IT 개발자 될 수 있을까? (현실적인 로드맵)",
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
    "국비 지원 부트캠프, 온라인 강의, 독학 등 현실적인 학습 경로와 포트폴리오 준비, 취업 전략까지. 당신의 커리어를 바꾸는 비전공자 개발자 로드맵을 알려드립니다.",
};

export default function NonMajorItDeveloperGuidePage() {
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
            비전공자도 IT 개발자,
            <br /> 꿈이 아닌 현실!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            '코딩 한 번 안 해봤는데...' IT 개발자의 높은 연봉과 성장 가능성에 매력을 느끼지만, 비전공자라는 벽 앞에서 좌절하고 있나요? 당신의 열정과 노력만 있다면 충분히 가능합니다. 비전공자 개발자 로드맵을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              IT 산업의 성장과 함께 개발자는 가장 각광받는 직업 중 하나가 되었습니다. 높은 연봉, 유연한 근무 환경, 그리고 끊임없이 배우고 성장할 수 있는 기회는 많은 비전공자들을 개발자의 세계로 이끌고 있습니다. 하지만 '비전공자'라는 꼬리표 때문에 막연한 두려움을 느끼는 분들이 많습니다. 이 가이드를 통해 비전공자도 충분히 IT 개발자가 될 수 있다는 희망과 함께, 현실적인 학습 경로와 취업 전략을 제시합니다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Code className="w-6 h-6" />
                비전공자 개발자, 왜 가능할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>실력 중심의 IT 업계:</strong> IT 업계는 학벌이나 전공보다는 실제 개발 역량과 문제 해결 능력을 중요하게 평가합니다.
                </li>
                <li>
                  <strong>다양한 학습 경로:</strong> 국비 지원 부트캠프, 온라인 강의, 독학 등 비전공자를 위한 다양한 학습 경로가 잘 구축되어 있습니다.
                </li>
                <li>
                  <strong>성장하는 시장:</strong> 개발자 수요는 꾸준히 증가하고 있어, 비전공자에게도 충분한 기회가 열려 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-green-500" />
                비전공자 개발자 전환, 3단계 로드맵
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '나에게 맞는' 학습 경로 선택
                  </h3>
                  <p className="!text-sm !my-0">
                    국비 지원 부트캠프는 체계적인 커리큘럼과 취업 연계가 장점이며, 온라인 강의나 독학은 시간과 비용을 절약할 수 있습니다. 자신의 학습 스타일, 예산, 목표에 맞는 경로를 선택하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '나만의 포트폴리오' 만들기
                  </h3>
                  <p className="!text-sm !my-0">
                    비전공자에게 포트폴리오는 당신의 개발 역량을 증명하는 가장 중요한 수단입니다. 개인 프로젝트, 오픈소스 기여, 해커톤 참여 등을 통해 당신의 실력을 보여줄 수 있는 결과물을 만드세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '적극적인 네트워킹'과 '취업 전략'
                  </h3>                  <p className="!text-sm !my-0">
                    스터디 그룹, 개발자 커뮤니티, 채용 박람회 등을 통해 현직 개발자들과 교류하고 정보를 얻으세요. 이력서, 자기소개서, 기술 면접 준비 등 취업 전략을 철저히 세우는 것이 중요합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 비전공자 개발자, 이것만은 주의하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>조급함 금지:</strong> 단기간에 모든 것을 이루려 하기보다는 꾸준히 학습하고 성장하는 것이 중요합니다.
                </li>
                <li>
                  <strong>기초의 중요성:</strong> 화려한 기술보다는 컴퓨터 과학의 기초(자료구조, 알고리즘, 운영체제 등)를 탄탄히 다지는 것이 장기적인 성장에 도움이 됩니다.
                </li>
                <li>
                  <strong>꾸준한 코딩:</strong> 매일 꾸준히 코딩하며 실력을 향상시키세요. '코딩은 근육과 같다'는 말을 명심하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Rocket className="w-7 h-7 text-indigo-500" />
                당신의 커리어 전환, Moneysalary가 응원합니다!
              </h2>
              <p>
                비전공자라는 한계를 넘어 IT 개발자로 성공적인 커리어를 만들 수 있습니다. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/it-developer-salary-comparison-by-role"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                IT 개발자 직무별 연봉 비교 가이드 보기 👩‍💻
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
