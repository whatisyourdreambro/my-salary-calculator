
import type { Metadata } from "next";
import Link from "next/link";
import { User, Briefcase, Search, Lightbulb, Linkedin, FileText } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "헤드헌터가 연락하는 링크드인 프로필: 예시와 템플릿 (2025년)",
  description:
    "가만히 있어도 제안이 오는 링크드인 프로필, 어떻게 만들까요? 헤드라인, 자기소개, 경력사항 작성법을 '나쁜 예시'와 '좋은 예시'로 비교하고, STAR 기법과 키워드 전략까지 알려드립니다.",
  openGraph: {
    title: "헤드헌터가 연락하는 링크드인 프로필: 예시와 템플릿 (2025년)",
    description:
      "링크드인, 더 이상 단순한 SNS가 아닙니다. 당신의 커리어를 바꾸는 강력한 도구입니다. 지금 바로 프로필을 최적화하세요.",
    images: ["/api/og?title=헤드헌터가 연락하는 링크드인 프로필 만들기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "헤드헌터가 연락하는 링크드인 프로필: 예시와 템플릿 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-06-20",
  dateModified: currentDate,
  description:
    "헤드라인, 자기소개, 경력사항 작성법을 '나쁜 예시'와 '좋은 예시'로 비교하고, STAR 기법과 키워드 전략까지 알려드립니다.",
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
            헤드헌터가 먼저 연락하는
            <br /> 링크드인 프로필 작성법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            당신의 커리어를 한 단계 업그레이드하고 싶다면, 링크드인 프로필부터 점검하세요. 헤드헌터의 눈길을 사로잡고, 원하는 포지션 제안을 받는 프로필 최적화의 모든 노하우를 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              링크드인은 단순한 SNS가 아닙니다. 헤드헌터들은 링크드인에서 키워드로 인재를 검색하고, 프로필을 보며 연락할지 말지를 1차적으로 결정합니다. 즉, 당신의 링크드인 프로필은 24시간 쉬지 않고 당신을 홍보하는 '영업사원'인 셈입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Search className="w-7 h-7 text-green-500" />
                헤드헌터의 눈을 사로잡는 프로필 최적화
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2">1. 헤드라인: 당신을 검색하게 만드는 '핵심 키워드'</h3>
                  <p className="!text-sm !my-2">헤드헌터는 'Java 백엔드 개발자' 와 같은 키워드로 검색합니다. 당신의 전문 분야와 기술 스택을 명확히 보여주세요.</p>
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md text-sm"><span className="font-bold text-red-600">Bad:</span> Backend Developer at Samsung</div>
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md text-sm mt-2"><span className="font-bold text-green-600">Good:</span> Backend Developer @ Samsung | Java, Spring, MSA | E-commerce & Fintech</div>
                </div>
                
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2">2. 자기소개(About): 3줄로 요약하는 '나는 이런 사람'</h3>
                  <p className="!text-sm !my-2">당신이 누구인지, 무엇에 강점이 있는지, 어떤 기회를 찾는지 3~4줄로 요약하여 제시하세요.</p>
                  <blockquote className="!border-l-blue-500 !my-2 !p-2 !text-sm">
                    <p className="!my-1">1. <strong>Who:</strong> 5년차 백엔드 개발자 OOO입니다.</p>
                    <p className="!my-1">2. <strong>What:</strong> Java/Spring 기반의 대용량 트래픽 처리 및 MSA 설계에 강점이 있습니다.</p>
                    <p className="!my-1">3. <strong>Next:</strong> 사용자 중심의 핀테크 플랫폼 기업에서 동료들과 함께 성장할 수 있는 기회를 찾고 있습니다.</p>
                  </blockquote>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2">3. 경력: STAR 기법으로 성과를 증명하라</h3>
                  <p className="!text-sm !my-2">'무엇을 했다'에서 그치지 말고, STAR 기법(Situation, Task, Action, Result)을 활용해 '어떤 문제를 어떻게 해결하여 어떤 결과를 만들었는지' 숫자로 보여주세요.</p>
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md text-sm"><span className="font-bold text-red-600">Bad:</span><br/>- 쇼핑몰 백엔드 기능 개발 담당</div>
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md text-sm mt-2"><span className="font-bold text-green-600">Good:</span><br/>- <strong>(Action)</strong> 레거시 쇼핑몰 시스템을 MSA로 전환하는 프로젝트 리딩. <strong>(Result)</strong> 주문 처리량을 300% 향상시키고, 서버 비용을 20% 절감.</div>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 추가적으로 해야 할 일
              </h2>
              <ul className="!my-2 space-y-2 text-base">
                <li><strong>기술(Skills) 섹션 채우기:</strong> 당신이 다룰 수 있는 모든 기술 스택을 추가하고, 동료들에게 '검증(Endorsement)'을 요청하여 신뢰도를 높이세요.</li>
                <li><strong>'Open to Work' 설정:</strong> 'Recruiters only' 옵션으로 설정하면, 현재 회사 동료들은 모르게 헤드헌터에게만 당신이 이직 시장에 나왔음을 알릴 수 있습니다.</li>
                <li><strong>적극적인 활동:</strong> 관심 분야의 게시물에 '좋아요'를 누르거나, 전문가의 글에 의미 있는 댓글을 다는 것만으로도 당신의 프로필 노출 빈도가 올라갑니다.</li>
              </ul>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                완벽한 프로필, 다음 단계는?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                이제 당신의 링크드인 프로필은 헤드헌터의 눈길을 사로잡을 준비가 되었습니다. 다음은, 당신의 모든 성과를 집약하여 합격을 결정짓는 '경력기술서'를 작성할 차례입니다.
              </p>
              <Link
                href="/guides/career-description-key-to-job-change-success"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <FileText className="inline-block w-5 h-5 mr-2" />
                합격률 높이는 경력기술서 작성법
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
