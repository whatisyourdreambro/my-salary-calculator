
import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Briefcase, MessageSquare, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "면접에서 연봉 협상, 이렇게 하면 성공한다: 당신의 몸값을 높여라!",
  description:
    "면접의 마지막 관문, 연봉 협상! 더 이상 회사에서 '주는 대로' 받지 마세요. 면접에서 연봉 협상을 성공적으로 이끌어내는 전략, 적절한 타이밍, 그리고 효과적인 커뮤니케이션 방법을 알려드립니다. 당신의 가치를 제대로 인정받으세요.",
  openGraph: {
    title: "면접에서 연봉 협상, 이렇게 하면 성공한다: 당신의 몸값을 높여라!",
    description:
      "면접에서 연봉 협상, 두려워하지 마세요. 철저한 준비와 전략으로 당신의 몸값을 높이세요.",
    images: ["/api/og?title=면접 연봉 협상 성공 전략"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "면접에서 연봉 협상, 이렇게 하면 성공한다: 당신의 몸값을 높여라!",
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
    "면접에서 연봉 협상을 성공적으로 이끌어내는 전략, 적절한 타이밍, 그리고 효과적인 커뮤니케이션 방법을 알려드립니다. 당신의 가치를 제대로 인정받으세요.",
};

export default function InterviewSalaryNegotiationGuidePage() {
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
            면접에서 연봉 협상,
            <br /> 이렇게 하면 성공한다!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            면접의 마지막 관문이자 당신의 몸값을 결정하는 중요한 순간, 연봉 협상! 더 이상 회사에서 '주는 대로' 받지 마세요. 철저한 준비와 전략으로 당신의 가치를 제대로 인정받는 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              면접에서 연봉 협상은 많은 구직자들이 어려워하는 부분입니다. 자칫 잘못하면 합격이 취소될까 봐, 혹은 너무 많은 것을 요구하는 것처럼 보일까 봐 주저하게 됩니다. 하지만 연봉 협상은 당신의 가치를 회사에 명확히 전달하고, 그에 합당한 보상을 요구하는 정당한 과정입니다. 철저한 준비와 자신감 있는 태도로 임한다면, 당신은 충분히 원하는 연봉을 쟁취할 수 있습니다. 이 가이드를 통해 면접 연봉 협상의 모든 것을 파악하고, 성공적인 결과를 만들어보세요.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Handshake className="w-6 h-6" />
                면접 연봉 협상, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>초기 연봉의 중요성:</strong> 첫 연봉은 이후 연봉 상승률의 기준이 됩니다. 초기 연봉이 높을수록 장기적으로 더 많은 소득을 기대할 수 있습니다.
                </li>
                <li>
                  <strong>자신감 표현:</strong> 당신의 역량과 시장 가치에 대한 자신감을 회사에 보여주는 기회입니다.
                </li>
                <li>
                  <strong>만족도 향상:</strong> 원하는 연봉을 받고 입사하면 업무 만족도와 회사에 대한 로열티가 높아집니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-green-500" />
                면접 연봉 협상 성공을 위한 3단계 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 철저한 사전 준비: '아는 것이 힘이다!'
                  </h3>
                  <p className="!text-sm !my-0">
                    지원하는 회사와 직무의 시장 평균 연봉, 그리고 당신의 경력과 역량에 맞는 적정 연봉 수준을 미리 조사하세요. 블라인드, 잡플래닛, 원티드 등 채용 플랫폼의 연봉 정보를 적극 활용하고, 헤드헌터나 업계 지인에게 조언을 구하는 것도 좋습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 나의 '성과'를 숫자로 증명하라
                  </h3>
                  <p className="!text-sm !my-0">
                    면접에서 당신이 회사에 기여할 수 있는 가치를 구체적인 성과(매출 증대, 비용 절감, 효율성 향상 등)로 연결하여 설명하세요. 당신의 역량이 회사에 어떤 이점을 가져다줄지 명확히 보여주는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 자신감 있는 태도와 유연한 대처
                  </h3>
                  <p className="!text-sm !my-0">
                    희망 연봉을 제시할 때는 자신감 있게, 하지만 회사의 상황을 고려하여 유연하게 대처하는 자세가 필요합니다. 연봉 외에 복지 혜택(스톡옵션, 유급 휴가, 교육 지원 등)이나 직급, 업무 범위 등 다른 조건을 협상해볼 수도 있습니다.
                  </p>
                   <Link href="/guides/salary-negotiation" className="text-sm text-blue-600 hover:underline">→ 연봉 협상 잘하는 법 가이드 보기</Link>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 협상 시 주의사항
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>절대 먼저 액수를 말하지 마라:</strong> 회사 측의 제안을 먼저 들어보고 협상을 시작하는 것이 유리합니다.
                </li>
                <li>
                  <strong>거짓말은 금물:</strong> 이전 연봉이나 희망 연봉에 대해 거짓말을 하면 신뢰를 잃을 수 있습니다.
                </li>
                <li>
                  <strong>최종 오퍼는 신중하게:</strong> 최종 오퍼를 수락하기 전에 모든 조건을 꼼꼼히 확인하고, 궁금한 점은 반드시 질문하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                당신의 가치를 제대로 인정받는 커리어를 만드세요!
              </h2>
              <p>
                면접 연봉 협상은 당신의 커리어에 중요한 전환점이 될 수 있습니다. <br />
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
