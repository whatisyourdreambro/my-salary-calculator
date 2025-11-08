
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, Lightbulb, UserCheck, Star } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "합격률 200% 높이는 경력기술서 작성법 (STAR 예시 포함)",
  description:
    "면접 제안이 쏟아지는 경력기술서는 어떻게 쓸까요? 인사담당자를 사로잡는 경력기술서의 구조, STAR 기법을 활용한 프로젝트 성과 정량화 방법까지, 구체적인 예시와 함께 알려드립니다.",
  openGraph: {
    title: "합격률 200% 높이는 경력기술서 작성법 (STAR 예시 포함)",
    description:
      "경력 기술서는 당신의 얼굴입니다. 매력적인 경력 기술서로 당신의 꿈을 현실로 만드세요.",
    images: ["/api/og?title=합격률 200% 높이는 경력기술서 작성법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "합격률 200% 높이는 경력기술서 작성법 (STAR 예시 포함)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-06-25",
  dateModified: currentDate,
  description:
    "인사담당자를 사로잡는 경력기술서의 구조, STAR 기법을 활용한 프로젝트 성과 정량화 방법을 구체적인 예시와 함께 알려드립니다.",
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
            합격률 200% 높이는
            <br /> 경력기술서 작성법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            이력서만으로는 당신의 역량을 다 보여줄 수 없습니다. 당신의 경험과 성과를 효과적으로 어필하여 서류 합격률을 높이는 경력 기술서 작성법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              경력 기술서는 당신이 '어떤 일을 했는지' 나열하는 문서가 아니라, '어떤 문제를 어떻게 해결했고, 그 결과 어떤 성과를 만들어냈는지'를 증명하는 '성과 보고서'입니다. 인사담당자는 당신의 화려한 경력보다, 당신이 우리 회사에 와서 어떤 문제를 해결해 줄 수 있을지에 더 관심이 많습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-green-500" />
                인사담당자를 사로잡는 경력기술서 구조
              </h2>
              <ol className="!my-4 space-y-3 text-base !p-0">
                <li className="p-3 border-l-4 border-gray-300"><strong>1. 기본 정보:</strong> 이름, 연락처, 그리고 당신을 더 보여줄 수 있는 링크드인, 깃허브, 포트폴리오 주소를 맨 위에 배치합니다.</li>
                <li className="p-3 border-l-4 border-gray-300"><strong>2. 기술 요약 (Skills Summary):</strong> 당신이 다룰 수 있는 기술들을 (Languages, Frameworks, Cloud 등) 보기 쉽게 정리하여, 인사담당자가 당신의 기술 스택을 10초 안에 파악하게 만듭니다.</li>
                <li className="p-3 border-l-4 border-gray-300"><strong>3. 업무 경력 (Work Experience):</strong> 최신순으로 근무했던 회사, 직책, 기간을 간략하게 기재합니다.</li>
                <li className="p-3 border-l-4 border-gray-300"><strong>4. 주요 프로젝트 (Key Projects):</strong> 경력기술서의 핵심입니다. 아래 'STAR 기법'을 활용하여 당신의 성과를 구체적으로 작성합니다.</li>
              </ol>
            </section>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Star className="w-6 h-6" />
                성과를 증명하는 STAR 기법 (Before & After)
              </h2>
              <p className="!my-2 text-base">
                STAR 기법(Situation, Task, Action, Result)은 당신의 경험을 가장 논리적이고 설득력 있게 만드는 마법의 공식입니다.
              </p>
              <div className="mt-4">
                <h4 className="font-bold">Before: 단순 업무 나열</h4>
                <blockquote className="!border-l-red-500 !my-2 !p-2 text-sm bg-red-50 dark:bg-red-900/30">
                    <p className="font-bold !my-0">OOO 쇼핑몰 리뉴얼 프로젝트</p>
                    <ul className="!my-1 list-disc list-inside">
                        <li>Spring Boot 기반 백엔드 시스템 개발</li>
                        <li>상품, 주문, 결제 API 개발 담당</li>
                    </ul>
                </blockquote>
              </div>
              <div className="mt-4">
                <h4 className="font-bold">After: STAR 기법 + 성과 정량화</h4>
                <blockquote className="!border-l-green-500 !my-2 !p-2 text-sm bg-green-50 dark:bg-green-900/30">
                    <p className="font-bold !my-0">OOO 쇼핑몰 MSA 전환 및 성능 개선</p>
                    <ul className="!my-1 list-disc list-inside">
                        <li><strong>(Situation)</strong> 기존 모놀리식 구조의 노후화로 주문 처리 속도 저하 및 잦은 장애 발생</li>
                        <li><strong>(Action)</strong> Spring Cloud를 활용하여 주문/결제 시스템을 MSA 구조로 분리 설계 및 구현</li>
                        <li><strong>(Action)</strong> JPA를 도입하여 데이터베이스 접근 로직을 최적화하고, Redis 캐시를 적용하여 응답 속도 개선</li>
                        <li><strong>(Result)</strong> 주문 처리 시간 <strong>50% 단축</strong> 및 장애율 <strong>80% 감소</strong>, API 평균 응답 속도 <strong>200ms 이하</strong> 달성</li>
                    </ul>
                </blockquote>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 경력기술서, 이것만은 기억하세요!
              </h2>
              <ul className="!my-2 space-y-2 text-base">
                <li><strong>지원하는 회사/직무에 맞춰라:</strong> 모든 회사에 똑같은 경력기술서를 제출하지 마세요. 채용 공고를 분석하고, 회사가 원하는 인재상과 핵심 역량에 맞춰 당신의 경험 중 일부를 강조하거나 순서를 바꾸는 '맞춤 전략'이 필요합니다.</li>
                <li><strong>분량은 2~3장 내외로:</strong> 너무 길면 읽지 않습니다. 당신의 핵심적인 강점과 성과 위주로 간결하게 작성하세요.</li>
                <li><strong>PDF로 제출하라:</strong> 다른 환경에서 파일이 깨지는 것을 방지하기 위해, 최종 제출은 반드시 PDF 파일로 변환하여 제출하세요.</li>
              </ul>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                경력기술서와 함께 제출할 '필살기'는?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                잘 쓰여진 경력기술서는 당신의 논리를, 잘 만들어진 포트폴리오는 당신의 실력을 증명합니다. 합격률을 200% 높이는 포트폴리오의 비밀을 알아보세요.
              </p>
              <Link
                href="/guides/portfolio-secret-to-increasing-acceptance-rate"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                합격률 높이는 포트폴리오 비법 🎨
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
