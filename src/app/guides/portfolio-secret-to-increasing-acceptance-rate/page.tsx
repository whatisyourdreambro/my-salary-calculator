
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Lightbulb, Code, Palette } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "포트폴리오, 합격률 높이는 비법: 당신의 역량을 증명하라!",
  description:
    "이력서만으로는 부족하다! 디자인, 개발, 마케팅 등 당신의 역량을 한눈에 보여줄 포트폴리오. 합격률을 높이는 포트폴리오를 만드는 구체적인 방법, 프로젝트 선정 기준, 그리고 효과적인 스토리텔링 노하우를 알려드립니다.",
  openGraph: {
    title: "포트폴리오, 합격률 높이는 비법: 당신의 역량을 증명하라!",
    description:
      "포트폴리오는 당신의 얼굴입니다. 매력적인 포트폴리오로 당신의 꿈을 현실로 만드세요.",
    images: ["/api/og?title=포트폴리오, 합격률 높이는 비법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "포트폴리오, 합격률 높이는 비법: 당신의 역량을 증명하라!",
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
    "합격률을 높이는 포트폴리오를 만드는 구체적인 방법, 프로젝트 선정 기준, 그리고 효과적인 스토리텔링 노하우를 알려드립니다.",
};

export default function PortfolioGuidePage() {
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
            포트폴리오,
            <br /> 합격률 높이는 비법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            이력서만으로는 당신의 역량을 다 보여줄 수 없습니다. 디자인, 개발, 마케팅 등 당신의 실력을 한눈에 보여줄 포트폴리오! 합격률을 높이는 포트폴리오를 만드는 모든 노하우를 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              포트폴리오는 당신의 역량과 경험을 시각적으로 보여주는 가장 강력한 도구입니다. 특히 디자인, 개발, 마케팅, 기획 등 실무 역량이 중요한 직무에서는 이력서보다 포트폴리오가 합격 여부를 결정하는 데 더 큰 영향을 미치기도 합니다. 단순히 작업물을 모아놓는 것을 넘어, 당신의 강점과 문제 해결 능력을 효과적으로 어필할 수 있는 포트폴리오를 만드는 것이 중요합니다. 이 가이드를 통해 합격률을 높이는 포트폴리오를 만드는 모든 노하우를 알아보세요.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                포트폴리오, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>실무 역량 증명:</strong> 당신이 어떤 기술을 가지고 있고, 어떤 프로젝트를 수행했으며, 어떤 성과를 냈는지 구체적으로 보여줄 수 있습니다.
                </li>
                <li>
                  <strong>차별화된 경쟁력:</strong> 수많은 지원자들 사이에서 당신만의 강점과 개성을 어필하여 차별화된 경쟁력을 확보할 수 있습니다.
                </li>
                <li>
                  <strong>면접의 도구:</strong> 포트폴리오를 바탕으로 면접관과 심도 있는 대화를 나누며 당신의 역량을 더욱 효과적으로 전달할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Palette className="w-7 h-7 text-green-500" />
                합격률 높이는 포트폴리오, 3단계 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '나만의 강점'을 보여줄 프로젝트 선정
                  </h3>
                  <p className="!text-sm !my-0">
                    가장 자신 있는 프로젝트, 당신의 핵심 역량을 가장 잘 보여줄 수 있는 프로젝트를 3~5개 정도 선정하세요. 단순히 결과물만 보여주는 것이 아니라, 프로젝트의 배경, 당신의 역할, 문제 해결 과정, 그리고 성과를 명확하게 설명해야 합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '스토리텔링'으로 몰입도를 높여라
                  </h3>
                  <p className="!text-sm !my-0">
                    각 프로젝트마다 '어떤 문제를 해결하기 위해 어떤 고민을 했고, 어떤 과정을 거쳐, 어떤 결과물을 만들었으며, 그 결과 어떤 성과를 얻었는지'를 스토리텔링 방식으로 풀어내세요. 면접관이 당신의 작업 과정을 이해하고 공감할 수 있도록 돕습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '깔끔하고 가독성 높은' 디자인과 구성
                  </h3>
                  <p className="!text-sm !my-0">
                    포트폴리오는 당신의 첫인상입니다. 깔끔하고 전문적인 디자인, 그리고 가독성 높은 구성은 당신의 역량을 더욱 돋보이게 합니다. PDF 파일, 웹사이트, 노션 등 다양한 형태로 제작할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 포트폴리오, 이것만은 피하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>너무 많은 프로젝트:</strong> 양보다는 질! 가장 자신 있는 프로젝트 위주로 선정하세요.
                </li>
                <li>
                  <strong>결과물만 나열:</strong> 과정과 성과를 함께 보여주는 것이 중요합니다.
                </li>
                <li>
                  <strong>오탈자 및 비문:</strong> 기본적인 맞춤법과 문법은 반드시 확인하세요.
                </li>
                <li>
                  <strong>회사 기밀 유출:</strong> 이전 회사 프로젝트를 포트폴리오에 포함할 경우, 회사 기밀 유출에 주의하고 반드시 비공개 처리하거나 회사와 협의하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Code className="w-7 h-7 text-indigo-500" />
                당신의 역량을 세상에 보여주세요!
              </h2>
              <p>
                포트폴리오는 당신의 열정과 노력을 담은 소중한 결과물입니다. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/side-projects-shortcut-to-career-growth"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                사이드 프로젝트로 커리어 성장하기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
