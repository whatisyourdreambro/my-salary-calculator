
import type { Metadata } from "next";
import Link from "next/link";
import { Flame, HeartCrack, Lightbulb, ShieldCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "번아웃 증후군, 직장인이라면 꼭 알아야 할 것: 예방과 극복 (2025년)",
  description:
    "'몸도 마음도 지쳤다...' 현대 직장인들의 고질병, 번아웃 증후군! 번아웃의 증상과 원인을 분석하고, 예방 및 극복을 위한 실질적인 방법을 알려드립니다. 당신의 소중한 몸과 마음을 지키세요.",
  openGraph: {
    title: "번아웃 증후군, 직장인이라면 꼭 알아야 할 것: 예방과 극복 (2025년)",
    description:
      "번아웃, 더 이상 혼자 힘들어하지 마세요. 당신의 몸과 마음을 지키는 방법을 알려드립니다.",
    images: ["/api/og?title=번아웃 증후군, 직장인 필독!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "번아웃 증후군, 직장인이라면 꼭 알아야 할 것: 예방과 극복 (2025년)",
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
    "번아웃의 증상과 원인을 분석하고, 예방 및 극복을 위한 실질적인 방법을 알려드립니다. 당신의 소중한 몸과 마음을 지키세요.",
};

export default function BurnoutSyndromeGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-red-500 to-orange-600 dark:from-gray-900 dark:to-red-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            번아웃 증후군,
            <br /> 당신의 몸과 마음을 지켜라!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-orange-100 dark:text-gray-300">
            '몸도 마음도 지쳤다...' 현대 직장인들의 고질병, 번아웃 증후군! 당신의 소중한 몸과 마음을 지키기 위해 번아웃의 증상과 원인, 그리고 예방 및 극복 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-orange-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              번아웃 증후군(Burnout Syndrome)은 과도한 업무와 스트레스로 인해 신체적, 정신적으로 극심한 피로감을 느끼고 무기력해지는 현상을 말합니다. 특히 경쟁이 치열하고 업무 강도가 높은 현대 사회의 직장인들에게 흔히 나타나는 증상입니다. 번아웃은 단순히 '피곤하다'는 감정을 넘어, 우울증, 불안 장애 등 심각한 정신 건강 문제로 이어질 수 있으므로, 조기에 증상을 인지하고 적극적으로 대처하는 것이 중요합니다. 이 가이드를 통해 번아웃 증후군의 모든 것을 파악하고, 당신의 소중한 몸과 마음을 지키세요.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <Flame className="w-6 h-6" />
                번아웃 증후군, 혹시 나도?
              </h2>
              <p className="!my-2 text-base">
                다음과 같은 증상들이 지속적으로 나타난다면 번아웃을 의심해볼 수 있습니다.
              </p>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>신체적 증상:</strong> 만성 피로, 두통, 소화 불량, 불면증, 면역력 저하 등
                </li>
                <li>
                  <strong>정신적 증상:</strong> 무기력감, 우울감, 불안감, 집중력 저하, 기억력 감퇴, 짜증 증가 등
                </li>
                <li>
                  <strong>행동적 증상:</strong> 업무 효율 저하, 지각/결근 증가, 사회적 고립, 식욕 부진 또는 폭식 등
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HeartCrack className="w-7 h-7 text-purple-500" />
                번아웃, 왜 찾아올까? (주요 원인)
              </h2>
              <p>
                번아웃은 단순히 개인의 나약함 때문이 아닙니다. 복합적인 요인들이 작용하여 발생합니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 과도한 업무량과 책임감
                  </h3>
                  <p className="!text-sm !my-0">
                    끝없이 이어지는 업무, 높은 목표, 과도한 책임감은 번아웃의 가장 큰 원인입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 통제력 부족과 불공정한 대우
                  </h3>
                  <p className="!text-sm !my-0">
                    자신의 업무에 대한 통제력이 없거나, 불공정한 대우를 받는다고 느낄 때 번아웃이 쉽게 찾아옵니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 가치관의 충돌과 보상 부족
                  </h3>
                  <p className="!text-sm !my-0">
                    자신의 가치관과 맞지 않는 업무를 하거나, 노력에 비해 보상이 부족하다고 느낄 때 번아웃이 발생할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 번아웃, 이렇게 극복하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>휴식과 재충전:</strong> 충분한 수면, 규칙적인 운동, 취미 활동 등 자신만의 방법으로 스트레스를 해소하고 재충전의 시간을 가지세요.
                </li>
                <li>
                  <strong>업무와 삶의 경계 설정:</strong> 퇴근 후에는 업무와 관련된 생각은 잠시 잊고, 개인적인 시간을 가지세요. '디지털 디톡스'도 좋은 방법입니다.
                </li>
                <li>
                  <strong>주변에 도움 요청:</strong> 혼자 힘들어하지 말고, 가족, 친구, 동료에게 솔직하게 이야기하고 도움을 요청하세요. 필요하다면 전문가(심리 상담사, 정신과 의사)의 도움을 받는 것도 중요합니다.
                </li>
                <li>
                  <strong>업무 환경 개선:</strong> 업무량을 조절하거나, 업무 방식을 개선하는 등 적극적으로 업무 환경을 개선하려는 노력이 필요합니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 몸과 마음을 지키는 것이 최우선입니다!
              </h2>
              <p>
                번아웃은 당신의 잘못이 아닙니다. 당신의 몸과 마음을 돌보는 것이 <br />
                가장 중요합니다. Moneysalary가 당신의 건강한 직장 생활을 응원합니다.
              </p>
              <Link
                href="/guides/how-to-find-a-company-with-good-work-life-balance"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                워라밸 좋은 회사 찾는 법 가이드 보기 🧘‍♀️
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
