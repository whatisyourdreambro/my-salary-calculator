import type { Metadata } from "next";
import Link from "next/link";
import { Target, Search, MessageSquare } from "lucide-react"; // TrendingUp 제거

export const metadata: Metadata = {
  title: "연봉협상: 최소 20% 올려받는 4단계 전략 (2025년 최종판)",
  description:
    "이직 시 연봉협상, 더 이상 두려워하지 마세요. 시장 가치 분석(리서치)부터 나의 성과 증명, 협상 테이블에서의 대화법, 최종 마무리까지. 당신의 가치를 돈으로 바꾸는 모든 노하우를 알려드립니다.",
  openGraph: {
    title: "연봉협상: 최소 20% 올려받는 4단계 전략",
    description:
      "당신의 가치를 돈으로 바꾸는 실전 협상 기술. 준비부터 마무리까지 A to Z.",
    images: [
      "/api/og?title=연봉협상, 최소 20% 올리는 법&description=당신의 가치를 증명하는 4단계 전략",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉협상: 최소 20% 올려받는 4단계 전략 (2025년 최종판)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-21",
  dateModified: "2025-09-21",
  description:
    "시장 가치 분석(리서치)부터 나의 성과 증명, 협상 테이블에서의 대화법, 최종 마무리까지. 당신의 가치를 돈으로 바꾸는 모든 노하우를 알려드립니다.",
};

export default function SalaryNegotiationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-gray-800 to-slate-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연봉협상,
            <br /> 당신의 가치를 증명하는 시간
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
            이직의 마지막 관문이자, 당신의 몸값을 결정하는 가장 중요한 순간.
            감정에 호소하는 대신, 철저한 논리와 데이터로 무장하여 원하는 숫자를
            얻어내는 실전 전략을 공개합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              많은 직장인들이 연봉협상을 불편해합니다. 돈 이야기를 꺼내는 것이
              어색하고, 혹시나 좋았던 분위기를 망칠까 두렵기 때문입니다. 하지만
              기억하세요. 연봉협상은 당신의 지난 경력과 미래의 가능성에 대한
              정당한 가치를 논의하는 지극히 <strong>프로페셔널한 과정</strong>
              입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Search className="w-7 h-7 text-blue-500" />
                1단계: 전쟁터에 나가기 전 (철저한 사전 준비)
              </h2>
              <p>
                협상은 테이블에 앉기 전에 90%가 결정됩니다. 철저한 리서치와
                자기객관화가 성공의 열쇠입니다.
              </p>
              <ul className="!my-6 space-y-3">
                <li>
                  <strong>내 시장 가치 파악하기:</strong> Moneysalary의
                  &apos;연봉 순위&apos;, 블라인드, 원티드 등 플랫폼을 통해 내
                  경력과 직무의 시장 평균 연봉을 반드시 확인하세요. 이것이
                  당신의 협상 기준점이 됩니다.
                </li>
                <li>
                  <strong>성과를 숫자로 증명하기:</strong> &apos;열심히
                  일했다&apos;는 말은 힘이 없습니다. &apos;A 프로젝트를 통해
                  매출 20% 상승에 기여&apos;, &apos;B 프로세스 개선으로 비용 10%
                  절감&apos;처럼 당신의 성과를 구체적인 숫자로 정리하세요.
                </li>
                <li>
                  <strong>마지노선 정하기:</strong> &apos;이 금액 이하로는 절대
                  안 된다&apos;는 마지노선(Walk-away), &apos;만족스러운&apos;
                  목표 금액(Target), &apos;최상으로 생각하는&apos; 희망
                  금액(Ambitious) 세 가지를 정해두면 협상에서 흔들리지 않을 수
                  있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-green-500" />
                2단계: 협상 테이블에서 (논리적인 대화의 기술)
              </h2>
              <p>
                준비가 끝났다면, 이제 자신감 있고 논리적으로 당신의 가치를
                전달할 시간입니다.
              </p>
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold !mt-0 !text-xl">
                  절대 먼저 희망 연봉을 말하지 마라
                </h3>
                <p className="!my-2 !text-base">
                  &quot;희망 연봉이 어떻게 되시나요?&quot; 라는 질문에 바로
                  답하지 마세요. &quot;회사의 연봉 테이블과 규정을 존중하며,
                  처우에 대해서는 논의를 통해 합리적으로 결정하고
                  싶습니다.&quot;라고 답하며 공을 넘기세요. 상대방이 먼저
                  제시하는 금액을 기준으로 협상을 시작하는 것이 훨씬 유리합니다.
                </p>
              </div>
              <p className="mt-4">
                회사가 먼저 금액을 제시했다면, 준비한 자료를 바탕으로 침착하게
                당신의 기여 가능성과 시장 가치를 설명하며 목표 금액을 향해
                조율해나가세요. 감정적인 태도는 금물입니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Target className="w-7 h-7 text-red-500" />
                그래서, 얼마를 불러야 할까?
              </h2>
              <p>
                모든 상황을 고려했을 때, 일반적으로 이직 시에는 현재 연봉 대비{" "}
                <strong>최소 15~20% 이상</strong>을 목표로 하는 것이
                합리적입니다.
              </p>
              <blockquote>
                <p>
                  <strong>20%를 불러야 하는 이유:</strong> 새로운 환경에
                  적응하는 리스크 비용, 지난 직장에서의 기회비용, 그리고 미래
                  1~2년 간의 연봉 인상분을 미리 당겨온다는 개념이 포함되어
                  있습니다. 20%는 결코 무리한 숫자가 아닌, 매우 현실적인
                  목표치입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                여러 개의 합격 통보, 어떻게 비교할까?
              </h2>
              <p>
                A회사는 연봉 6,000만원, B회사는 연봉 5,500만원에 성과급
                1,000만원. 어떤 선택이 더 유리할까요? 계약 연봉, 성과급, 복지
                혜택까지 모두 고려한 &apos;세후 실수령액&apos;을 비교하는 것이
                가장 현명합니다.
              </p>
              <Link
                href="/?tab=comparator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                여러 회사 오퍼, 실수령액으로 비교하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
