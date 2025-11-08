
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Shield, MessageSquare, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "직장 내 괴롭힘, 현명하게 대처하는 법: 당신의 권리를 지키세요!",
  description:
    "'이건 괴롭힘일까?' 직장 내 괴롭힘의 유형을 명확히 정의하고, 현명하게 대처하는 방법, 그리고 법적 보호 및 상담 기관 정보를 상세히 알려드립니다. 더 이상 혼자 힘들어하지 말고, 당신의 권리를 지키세요.",
  openGraph: {
    title: "직장 내 괴롭힘, 현명하게 대처하는 법: 당신의 권리를 지키세요!",
    description:
      "직장 내 괴롭힘, 당신의 잘못이 아닙니다. 현명하게 대처하고 당신의 소중한 직장 생활을 지키세요.",
    images: ["/api/og?title=직장 내 괴롭힘, 현명한 대처법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "직장 내 괴롭힘, 현명하게 대처하는 법: 당신의 권리를 지키세요!",
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
    "직장 내 괴롭힘의 유형을 명확히 정의하고, 현명하게 대처하는 방법, 그리고 법적 보호 및 상담 기관 정보를 상세히 알려드립니다. 더 이상 혼자 힘들어하지 말고, 당신의 권리를 지키세요.",
};

export default function WorkplaceBullyingGuidePage() {
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
            직장 내 괴롭힘,
            <br /> 현명하게 대처하는 법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-orange-100 dark:text-gray-300">
            '이건 괴롭힘일까?' '어떻게 해야 할까?' 직장 내 괴롭힘은 당신의 잘못이 아닙니다. 더 이상 혼자 힘들어하지 말고, 당신의 권리를 지키고 건강한 직장 생활을 되찾는 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-orange-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              직장 내 괴롭힘은 직장 내 지위 또는 관계의 우위를 이용하여 업무상 적정 범위를 넘어 다른 근로자에게 신체적·정신적 고통을 주거나 근무 환경을 악화시키는 행위를 말합니다. 이는 개인의 정신 건강과 업무 효율에 심각한 영향을 미칠 뿐만 아니라, 조직 전체의 생산성 저하로 이어질 수 있습니다. 2019년 '직장 내 괴롭힘 금지법'이 시행되면서 법적으로 보호받을 수 있는 근거가 마련되었지만, 여전히 많은 피해자들이 어떻게 대처해야 할지 몰라 어려움을 겪고 있습니다. 이 가이드를 통해 직장 내 괴롭힘의 유형을 명확히 이해하고, 현명하게 대처하여 당신의 권리를 지키세요.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                직장 내 괴롭힘, 어떤 유형이 있을까?
              </h2>
              <p className="!my-2 text-base">
                직장 내 괴롭힘은 다양한 형태로 나타날 수 있습니다. 다음 유형들을 통해 당신이 겪고 있는 상황이 괴롭힘에 해당하는지 확인해보세요.
              </p>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>신체적 괴롭힘:</strong> 폭행, 협박, 물건 던지기 등 신체에 직접적인 해를 가하는 행위.
                </li>
                <li>
                  <strong>정신적 괴롭힘:</strong> 모욕적인 언행, 비난, 따돌림, 업무 배제, 사적인 심부름 강요 등 정신적 고통을 주는 행위.
                </li>
                <li>
                  <strong>업무상 부당한 지시:</strong> 업무와 무관한 일을 시키거나, 능력을 벗어나는 과도한 업무를 부여하는 행위.
                </li>
                <li>
                  <strong>사생활 침해:</strong> 개인적인 정보를 캐묻거나, 사생활을 침해하는 행위.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-blue-500" />
                직장 내 괴롭힘, 현명하게 대처하는 3단계
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 증거 확보: '기록'이 가장 중요합니다!
                  </h3>
                  <p className="!text-sm !my-0">
                    괴롭힘이 발생한 일시, 장소, 내용, 가해자, 목격자 등을 육하원칙에 따라 상세히 기록하세요. 녹취, 메시지, 이메일, 사진 등 모든 증거를 확보하는 것이 중요합니다. 증거는 당신의 주장을 뒷받침하는 가장 강력한 무기입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 주변에 도움 요청: 혼자 힘들어하지 마세요!
                  </h3>
                  <p className="!text-sm !my-0">
                    신뢰할 수 있는 동료, 상사, 인사팀, 노동조합 등 주변에 당신이 겪고 있는 상황을 알리고 도움을 요청하세요. 혼자서 모든 것을 감당하려 하지 말고, 주변의 지지를 얻는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 공식적인 절차 진행: 신고 또는 상담
                  </h3>
                  <p className="!text-sm !my-0">
                    회사 내 고충처리위원회, 노동조합, 또는 외부 기관(고용노동부, 직장 내 괴롭힘 상담센터)에 신고하거나 상담을 요청하세요. 법적 보호를 받을 수 있는 근거가 마련되어 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 당신의 정신 건강을 지키세요!
              </h2>
              <p className="!my-2 text-base">
                직장 내 괴롭힘은 당신의 정신 건강에 심각한 영향을 미칠 수 있습니다. 혼자서 감당하기 어렵다면 정신건강의학과 전문의나 심리 상담 전문가의 도움을 받는 것을 주저하지 마세요. 당신의 몸과 마음을 돌보는 것이 가장 중요합니다.
              </p>
              <Link href="/guides/burnout-syndrome-what-office-workers-must-know" className="font-semibold text-yellow-800 hover:underline">
                → 번아웃 증후군, 직장인 필독 가이드 보기
              </Link>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Shield className="w-7 h-7 text-indigo-500" />
                당신의 권리를 지키고 건강한 직장 생활을 되찾으세요!
              </h2>
              <p>
                직장 내 괴롭힘은 결코 용납될 수 없습니다. <br />
                Moneysalary가 당신의 건강한 직장 생활을 응원합니다.
              </p>
              <Link
                href="https://www.moel.go.kr/policy/policyInfo/view.do?idx=128"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                고용노동부 직장 내 괴롭힘 예방 및 대응 매뉴얼 🌐
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
