
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Lightbulb, Code, Palette, Rocket } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "합격률 200% 높이는 포트폴리오의 비밀: '과정'을 팔아라",
  description:
    "결과물만 나열된 포트폴리오는 매력 없습니다. 당신의 '문제 해결 과정'을 보여주는 것이 합격의 비밀입니다. 개발자, 디자이너를 위한 포트폴리오 전략과 프로젝트 스토리텔링 템플릿을 공개합니다.",
  openGraph: {
    title: "합격률 200% 높이는 포트폴리오의 비밀: '과정'을 팔아라",
    description:
      "포트폴리오는 당신의 얼굴입니다. 매력적인 포트폴리오로 당신의 꿈을 현실로 만드세요.",
    images: ["/api/og?title=포트폴리오, 합격률 높이는 비밀"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "합격률 200% 높이는 포트폴리오의 비밀: '과정'을 팔아라",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-06-30",
  dateModified: currentDate,
  description:
    "당신의 '문제 해결 과정'을 보여주는 것이 합격의 비밀입니다. 개발자, 디자이너를 위한 포트폴리오 전략과 프로젝트 스토리텔링 템플릿을 공개합니다.",
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
            합격률 200% 높이는
            <br /> 포트폴리오의 비밀
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            경력기술서가 당신의 '논리'를 증명한다면, 포트폴리오는 당신의 '실력'을 증명합니다. 합격하는 포트폴리오는 무엇이 다른지, 그 비밀을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              인사담당자는 당신의 화려한 결과물보다, 그 결과물을 만들기까지의 '과정'을 궁금해합니다. 어떤 문제를 만났고, 어떻게 해결했으며, 그 과정에서 무엇을 배웠는지를 통해 당신의 진짜 실력과 성장 가능성을 보기 때문입니다. 합격하는 포트폴리오는 '결과물 모음집'이 아닌, '문제 해결 과정 보고서'입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-green-500" />
                직군별 포트폴리오 핵심 전략
              </h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2"><Code className="w-6 h-6"/> 개발자 포트폴리오</h3>
                  <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
                    <li><strong>GitHub:</strong> 단순히 코드를 올리는 것을 넘어, 프로젝트 README에 개발 동기, 사용 기술, 구현 기능, 그리고 '어려웠던 점과 해결 과정'을 상세히 기록하세요.</li>
                    <li><strong>라이브 데모:</strong> 실제 작동하는 서비스 링크를 제공하여 결과물을 직접 체험하게 만드세요.</li>
                    <li><strong>기술 블로그:</strong> 특정 기술을 도입한 이유, 에러 해결 과정 등을 기록한 블로그는 당신의 학습 능력과 성장 가능성을 보여주는 최고의 증거입니다.</li>
                  </ul>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2"><Palette className="w-6 h-6"/> 디자이너/기획자 포트폴리오</h3>
                  <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
                    <li><strong>Case Study 중심:</strong> '어떤 문제를 발견했고(Problem), 어떻게 리서치했으며(Research), 어떤 해결책을 제시했고(Solution), 그 결과 어떤 임팩트가 있었는지(Impact)'를 하나의 이야기로 엮어내세요.</li>
                    <li><strong>과정을 시각화:</strong> 와이어프레임, 사용자 플로우, 프로토타입 등 디자인 과정의 중간 산출물을 포함하여 당신의 논리적인 사고 과정을 보여주세요.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                '킬러 프로젝트' 스토리텔링 5단계 템플릿
              </h2>
              <p className="!my-2 text-base">
                당신의 프로젝트를 가장 매력적으로 보여주는 이야기 구조입니다. 이 순서대로 프로젝트를 설명해보세요.
              </p>
              <ol className="!my-4 space-y-2 text-base !p-0 !list-none">
                <li className="p-2"><strong>1. 프로젝트 개요:</strong> 한 줄 요약, 사용 기술, 나의 역할, 프로젝트 기간</li>
                <li className="p-2"><strong>2. 문제 정의 (The Problem):</strong> 이 프로젝트는 어떤 문제를 해결하기 위해 시작되었나요?</li>
                <li className="p-2"><strong>3. 나의 역할 및 기여 (My Contribution):</strong> 이 프로젝트에서 나는 구체적으로 무엇을, 왜 했나요?</li>
                <li className="p-2"><strong>4. 과정과 배움 (The Process & Learnings):</strong> 어떤 기술적/기획적 어려움이 있었고, 어떻게 해결했으며, 그 과정에서 무엇을 배웠나요? <strong>(가장 중요한 부분!)</strong></li>
                <li className="p-2"><strong>5. 결과 및 성과 (The Outcome):</strong> 그래서 결과는 어땠나요? 정량적 성과(예: 로딩 속도 30% 개선)나 정성적 성과(예: 사용자 만족도 피드백)를 보여주세요.</li>
              </ol>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                서류 합격, 다음은 최종 관문!
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                매력적인 포트폴리오로 서류를 통과했다면, 이제 당신의 가치를 증명하고 원하는 연봉을 얻어낼 차례입니다. 면접과 연봉 협상을 준비하세요.
              </p>
              <Link
                href="/guides/salary-negotiation"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연봉 협상 실전 전략 가이드 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
