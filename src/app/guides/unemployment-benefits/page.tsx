import type { Metadata } from "next";
import Link from "next/link";
import {
  LifeBuoy,
  CheckSquare,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "실업급여 A to Z: 조건, 신청 방법, 금액까지 완벽 정리 (2025년)",
  description:
    "갑작스러운 실직, 막막하신가요? 실업급여(구직급여) 수급 조건부터 온라인 신청 방법, 예상 수급액, 구직활동 인정 기준까지. 당신의 새로운 시작을 돕기 위한 모든 정보를 담았습니다.",
  openGraph: {
    title: "실업급여 A to Z: 당신의 새로운 시작을 응원합니다",
    description:
      "실직 후 막막하다면 필독! 수급 조건부터 신청 방법, Q&A까지 총정리.",
    images: [
      "/api/og?title=실업급여, 당신의 재도약을 위한 안전망&description=수급 조건부터 신청까지 A to Z",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "실업급여 A to Z: 조건, 신청 방법, 금액까지 완벽 정리 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-01",
  dateModified: "2025-09-20",
  description:
    "실업급여(구직급여) 수급 조건부터 온라인 신청 방법, 예상 수급액, 구직활동 인정 기준까지. 당신의 새로운 시작을 돕기 위한 모든 정보를 담았습니다.",
};

export default function UnemploymentBenefitsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        <div className="w-full bg-gradient-to-br from-sky-500 to-blue-600 dark:from-gray-900 dark:to-sky-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            갑작스러운 실직,
            <br /> 당신은 혼자가 아닙니다
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            새로운 시작을 준비하는 당신을 위해 국가가 마련한 최소한의 사회
            안전망, 실업급여. 그 모든 것을 가장 정확하고 따뜻하게 알려드립니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              다니던 회사와의 이별은 누구에게나 힘든 경험입니다. 당장의 생계
              걱정과 막막한 미래에 대한 불안감이 앞설 수 있습니다. 하지만
              괜찮습니다. 대한민국은 당신이 다시 일어서서 재도약할 수 있도록
              &apos;실업급여&apos;라는 든든한 제도를 마련해두었으니까요.
              지금부터 그 누구보다 쉽고 자세하게 설명해 드리겠습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <CheckSquare className="w-7 h-7 text-signature-blue" />
                Step 1: 나, 실업급여 받을 수 있을까? (핵심 조건 4가지)
              </h2>
              <p>
                가장 중요하고, 가장 많이 헷갈리는 부분입니다. 아래 4가지 조건을{" "}
                <strong>모두</strong> 충족해야 실업급여(정확한 명칭은
                &apos;구직급여&apos;)를 받을 수 있습니다. 꼼꼼히 확인해보세요.
              </p>
              <ul className="!my-6 !pl-0 space-y-4">
                <li className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-bold text-signature-blue text-2xl">
                    1
                  </span>
                  <div>
                    <h3 className="!mt-0 !mb-1 font-semibold">
                      고용보험 가입 기간이 180일 이상인가?
                    </h3>
                    <p className="!my-0 !text-base">
                      퇴사일 이전 18개월 동안, 월급을 받은 달(유급휴일 포함)을
                      세어보세요. 그 기간이 총 180일 이상이어야 합니다. 주 5일
                      근무자라면 보통 7~8개월 이상 근무했다면 충족됩니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-bold text-signature-blue text-2xl">
                    2
                  </span>
                  <div>
                    <h3 className="!mt-0 !mb-1 font-semibold">
                      비자발적인 사유로 퇴사했는가?
                    </h3>
                    <p className="!my-0 !text-base">
                      스스로 사표를 낸 &apos;자발적 퇴사&apos;는 원칙적으로
                      대상이 아닙니다. 회사의 경영 악화로 인한 해고, 권고사직,
                      계약기간 만료, 정년퇴직 등이 대표적인 비자발적 퇴사입니다.
                      (단, 자발적 퇴사라도 정당한 사유가 있다면 예외적으로
                      인정될 수 있습니다.)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-bold text-signature-blue text-2xl">
                    3
                  </span>
                  <div>
                    <h3 className="!mt-0 !mb-1 font-semibold">
                      일할 의사와 능력이 있는가?
                    </h3>
                    <p className="!my-0 !text-base">
                      실업급여는 &apos;실업&apos; 상태인 사람을 지원하는
                      제도입니다. 즉, 당장이라도 조건에 맞는 회사가 있다면 일할
                      수 있는 상태여야 합니다. 질병 치료, 학업, 군 복무 등의
                      이유로 즉시 취업이 불가능하다면 대상이 아닙니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-bold text-signature-blue text-2xl">
                    4
                  </span>
                  <div>
                    <h3 className="!mt-0 !mb-1 font-semibold">
                      적극적으로 재취업 활동을 하고 있는가?
                    </h3>
                    <p className="!my-0 !text-base">
                      실업급여는 구직 활동을 전제로 지급됩니다. 워크넷에 구직
                      등록을 하고, 정해진 기간 동안 입사 지원, 면접, 직업 훈련
                      등 재취업을 위한 노력을 증명해야 합니다.
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <ClipboardList className="w-7 h-7 text-purple-500" />
                Step 2: 그래서, 얼마를 얼마나 받을 수 있나요?
              </h2>
              <p>
                실업급여 지급액은 퇴사 전 받던 임금과 나이, 고용보험 가입 기간에
                따라 달라집니다.
              </p>
              <div className="mt-6 p-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 text-center">
                <p className="text-lg font-medium">1일 실업급여 지급액</p>
                <p className="text-2xl sm:text-3xl font-bold my-2">
                  퇴직 전 3개월 평균임금의 60%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  (2025년 기준 1일 상한액 66,000원 / 하한액은 최저임금의 80%)
                </p>
              </div>
              <p className="mt-4">
                지급 기간은 퇴사 시 만 나이와 고용보험 가입 기간에 따라 최소
                120일에서 최대 270일까지입니다. 예를 들어, 만 35세에 6년간 일한
                직장을 그만뒀다면 최대 210일(약 7개월) 동안 실업급여를 받을 수
                있습니다.
              </p>
              <blockquote>
                <p>
                  퇴직 전 3개월 평균임금을 계산하기 어렵다면,{" "}
                  <strong>Moneysalary 퇴직금 계산기</strong>를 활용해보세요.
                  퇴직금 계산의 기준이 되는 &apos;1일 평균임금&apos;이 실업급여
                  계산의 기준과 거의 동일합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-amber-500" />
                가장 많이 하는 질문 Q&A
              </h2>
              <div className="mt-6 space-y-4">
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                  <h3 className="font-bold !mt-0 !text-lg">
                    Q. 제가 직접 사표를 썼는데, 받을 수 있나요?
                  </h3>
                  <p className="!my-0 !text-base">
                    A. 원칙적으로는 어렵지만, 통근이 불가능할 정도로 먼 곳으로
                    이사를 가거나(왕복 3시간 이상), 가족의 질병 간호가
                    필요하거나, 직장 내 괴롭힘 등 &apos;정당한 사유&apos;가
                    있다면 자발적 퇴사자도 수급 자격이 인정될 수 있습니다.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                  <h3 className="font-bold !mt-0 !text-lg">
                    Q. 퇴사 후 바로 신청해야 하나요?
                  </h3>
                  <p className="!my-0 !text-base">
                    A. 아닙니다. 실업급여는 퇴사 후 1년 이내에 신청하고, 정해진
                    수급 기간 내에만 받으면 됩니다. 예를 들어 수급 기간이
                    120일이라면, 퇴사 후 8개월이 지난 시점에 신청해도 남은 4개월
                    동안 받을 수 있습니다. 하지만 늦게 신청할수록 받을 수 있는
                    총액이 줄어들 수 있으니 가급적 빨리 신청하는 것이 좋습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <LifeBuoy className="w-7 h-7 text-signature-blue" />
                당신의 새로운 시작을 응원합니다
              </h2>
              <p>
                실직은 끝이 아닌 새로운 시작을 위한 쉼표입니다. 실업급여라는
                안전망 위에서 잠시 숨을 고르고, 더 나은 미래를 향해 나아가세요.
              </p>
              <Link
                href="/?tab=severance"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 평균임금 & 퇴직금 미리 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
