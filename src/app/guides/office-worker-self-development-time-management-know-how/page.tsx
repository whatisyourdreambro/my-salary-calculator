
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Clock, Lightbulb, Target } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "직장인 자기계발, 시간 관리 노하우: 퇴근 후 2시간으로 성장하기!",
  description:
    "바쁜 직장 생활 속에서도 꾸준히 성장하고 싶다면? 직장인 자기계발의 핵심은 '시간 관리'입니다. 포모도로, 아이젠하워 매트릭스 등 효율적인 시간 관리 기법과 자기계발 목표 설정, 그리고 실천 노하우를 알려드립니다. 당신의 퇴근 후 2시간을 황금 시간으로 만드세요.",
  openGraph: {
    title: "직장인 자기계발, 시간 관리 노하우: 퇴근 후 2시간으로 성장하기!",
    description:
      "직장인 자기계발, 더 이상 미루지 마세요. 효율적인 시간 관리로 당신의 잠재력을 깨우세요.",
    images: ["/api/og?title=직장인 자기계발, 시간 관리"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "직장인 자기계발, 시간 관리 노하우: 퇴근 후 2시간으로 성장하기!",
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
    "포모도로, 아이젠하워 매트릭스 등 효율적인 시간 관리 기법과 자기계발 목표 설정, 그리고 실천 노하우를 알려드립니다. 당신의 퇴근 후 2시간을 황금 시간으로 만드세요.",
};

export default function OfficeWorkerSelfDevelopmentGuidePage() {
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
            직장인 자기계발,
            <br /> 시간 관리 노하우
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            바쁜 직장 생활 속에서도 꾸준히 성장하고 싶다면? 직장인 자기계발의 핵심은 '시간 관리'입니다. 당신의 퇴근 후 2시간을 황금 시간으로 바꾸는 모든 노하우를 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              빠르게 변화하는 시대에 직장인에게 자기계발은 선택이 아닌 필수가 되었습니다. 새로운 기술을 배우고, 전문성을 심화하며, 끊임없이 자신을 발전시켜야만 경쟁력을 유지하고 커리어를 성장시킬 수 있습니다. 하지만 바쁜 업무와 퇴근 후 개인 생활 속에서 자기계발 시간을 확보하기란 쉽지 않습니다. 이 가이드를 통해 효율적인 시간 관리 노하우와 자기계발 목표 설정, 그리고 실천 방법을 파악하고, 당신의 잠재력을 깨우세요.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                직장인 자기계발, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>경쟁력 강화:</strong> 새로운 기술과 지식을 습득하여 변화하는 시장에서 당신의 경쟁력을 유지하고 높일 수 있습니다.
                </li>
                <li>
                  <strong>커리어 성장:</strong> 전문성 강화를 통해 더 높은 직급, 더 좋은 연봉으로의 이직 기회를 만들 수 있습니다.
                </li>
                <li>
                  <strong>자기 만족:</strong> 끊임없이 배우고 성장하는 과정에서 오는 성취감과 만족감을 느낄 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Clock className="w-7 h-7 text-green-500" />
                효율적인 시간 관리, 3가지 핵심 노하우
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '황금 시간'을 찾아라: 나만의 집중 시간 활용
                  </h3>
                  <p className="!text-sm !my-0">
                    당신이 가장 집중력이 높은 시간(아침 일찍, 퇴근 후 저녁, 주말 등)을 찾아 자기계발에 집중하세요. 이 시간을 '황금 시간'으로 설정하고, 방해받지 않도록 환경을 조성하는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '뽀모도로 기법'으로 집중력 극대화
                  </h3>
                  <p className="!text-sm !my-0">
                    25분 집중, 5분 휴식을 반복하는 뽀모도로 기법은 짧은 시간 안에 높은 집중력을 발휘할 수 있도록 돕습니다. 자기계발 목표를 작은 단위로 쪼개어 뽀모도로 기법을 적용해보세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '아이젠하워 매트릭스'로 우선순위 설정
                  </h3>
                  <p className="!text-sm !my-0">
                    중요도와 긴급도를 기준으로 업무와 자기계발 목표의 우선순위를 설정하세요. '중요하지만 긴급하지 않은 일'(자기계발)에 시간을 투자하는 것이 장기적인 성장에 필수적입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 자기계발, 이것만은 피하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>무리한 목표 설정:</strong> 처음부터 너무 거창한 목표를 세우면 쉽게 지치고 포기하게 됩니다. 작고 실현 가능한 목표부터 시작하세요.
                </li>
                <li>
                  <strong>완벽주의:</strong> 완벽하게 준비될 때까지 시작하지 않으면 아무것도 할 수 없습니다. 일단 시작하고, 부족한 부분은 채워나가세요.
                </li>
                <li>
                  <strong>비교:</strong> 다른 사람과 자신을 비교하며 좌절하지 마세요. 당신만의 속도로 꾸준히 성장하는 것이 중요합니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Target className="w-7 h-7 text-indigo-500" />
                당신의 잠재력을 깨우고 성장하세요!
              </h2>
              <p>
                자기계발은 당신의 커리어를 더욱 풍요롭게 만들고, 삶의 만족도를 높여줄 것입니다. <br />
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
