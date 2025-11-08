
import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, Lightbulb, Code, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "사이드 프로젝트, 커리어 성장의 지름길: 당신의 몸값을 높여라!",
  description:
    "퇴근 후 2시간, 당신의 커리어를 바꿀 수 있습니다. 사이드 프로젝트는 단순히 취미 활동을 넘어, 새로운 기술 습득, 포트폴리오 강화, 네트워크 확장 등 커리어 성장의 강력한 무기입니다. 아이디어 발상부터 실행, 그리고 성공적인 사이드 프로젝트가 당신의 몸값을 높이는 비결을 알려드립니다.",
  openGraph: {
    title: "사이드 프로젝트, 커리어 성장의 지름길: 당신의 몸값을 높여라!",
    description:
      "사이드 프로젝트, 더 이상 미루지 마세요. 당신의 열정과 아이디어가 커리어를 성장시키는 지름길이 됩니다.",
    images: ["/api/og?title=사이드 프로젝트, 커리어 성장"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "사이드 프로젝트, 커리어 성장의 지름길: 당신의 몸값을 높여라!",
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
    "사이드 프로젝트는 단순히 취미 활동을 넘어, 새로운 기술 습득, 포트폴리오 강화, 네트워크 확장 등 커리어 성장의 강력한 무기입니다. 아이디어 발상부터 실행, 그리고 성공적인 사이드 프로젝트가 당신의 몸값을 높이는 비결을 알려드립니다.",
};

export default function SideProjectsGuidePage() {
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
            사이드 프로젝트,
            <br /> 커리어 성장의 지름길
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            퇴근 후 2시간, 당신의 열정과 아이디어가 커리어를 바꿀 수 있습니다. 사이드 프로젝트는 단순히 취미 활동을 넘어, 당신의 몸값을 높이는 강력한 무기입니다. 지금 바로 시작하세요!
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              빠르게 변화하는 시대에 직장인에게 '사이드 프로젝트'는 선택이 아닌 필수가 되고 있습니다. 본업에서 채우지 못하는 갈증을 해소하고, 새로운 기술을 배우며, 나아가 이직이나 창업의 발판을 마련하는 등 다양한 형태로 커리어 성장에 기여합니다. 단순히 취미 활동을 넘어, 당신의 몸값을 높이는 강력한 무기가 될 수 있는 사이드 프로젝트의 모든 것을 파헤쳐봅니다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Rocket className="w-6 h-6" />
                사이드 프로젝트, 왜 해야 할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>새로운 기술 습득:</strong> 본업에서 사용하기 어려운 새로운 기술이나 언어를 자유롭게 시도하고 배울 수 있습니다.
                </li>
                <li>
                  <strong>포트폴리오 강화:</strong> 당신의 역량을 보여줄 수 있는 실질적인 결과물을 만들어 이직 시 강력한 무기로 활용할 수 있습니다.
                </li>
                <li>
                  <strong>네트워크 확장:</strong> 사이드 프로젝트를 통해 새로운 사람들을 만나고, 협업하며 네트워크를 확장할 수 있습니다.
                </li>
                <li>
                  <strong>창업의 발판:</strong> 아이디어를 실제 서비스로 구현하며 창업의 가능성을 탐색해볼 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Code className="w-7 h-7 text-green-500" />
                성공적인 사이드 프로젝트를 위한 3단계 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '나만의 아이디어'를 구체화하라
                  </h3>
                  <p className="!text-sm !my-0">
                    일상생활에서 불편했던 점, 흥미를 느끼는 분야, 배우고 싶은 기술 등을 연결하여 아이디어를 구체화하세요. 너무 거창한 것보다는 작고 실현 가능한 아이디어부터 시작하는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '꾸준함'이 핵심, 작은 성공을 경험하라
                  </h3>
                  <p className="!text-sm !my-0">
                    사이드 프로젝트는 마라톤과 같습니다. 단기간에 끝내려 하기보다는 꾸준히 진행하는 것이 중요합니다. 작은 목표를 설정하고, 하나씩 달성하며 성취감을 느끼는 것이 지속 가능한 원동력이 됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '공유'하고 '피드백'을 받아라
                  </h3>
                  <p className="!text-sm !my-0">
                    완벽하지 않아도 괜찮습니다. 당신의 사이드 프로젝트를 블로그, 깃허브, 커뮤니티 등에 공유하고 피드백을 받으세요. 다른 사람들의 의견은 당신의 프로젝트를 발전시키고, 새로운 아이디어를 얻는 데 큰 도움이 됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 사이드 프로젝트, 이것만은 주의하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>본업에 지장 금지:</strong> 사이드 프로젝트는 본업에 지장을 주지 않는 선에서 진행해야 합니다. 본업에 소홀하면 오히려 커리어에 악영향을 미칠 수 있습니다.
                </li>
                <li>
                  <strong>회사 기밀 유출 주의:</strong> 회사 업무와 관련된 아이디어나 기밀 정보를 활용하는 것은 절대 금지입니다. 법적인 문제로 이어질 수 있습니다.
                </li>
                <li>
                  <strong>저작권 및 지적재산권 확인:</strong> 오픈소스 라이선스, 이미지 사용 등 저작권 및 지적재산권 관련 문제를 미리 확인하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                당신의 열정으로 커리어를 성장시키세요!
              </h2>
              <p>
                사이드 프로젝트는 당신의 잠재력을 깨우고, 커리어를 한 단계 업그레이드할 수 있는 최고의 기회입니다. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/career-change-can-non-majors-become-it-developers"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                비전공자 IT 개발자 전환 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
