
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Gift, ShieldCheck, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연봉 외 수당, 놓치지 말아야 할 혜택: 비과세 수당으로 실질 소득 UP!",
  description:
    "월급 명세서에 숨겨진 보물찾기! 식대, 차량유지비, 자녀 보육수당 등 연봉 외에 받을 수 있는 다양한 수당과 복지 혜택을 총정리합니다. 특히 비과세 혜택을 받을 수 있는 수당들을 확인하고 당신의 실질 소득을 높이세요.",
  openGraph: {
    title: "연봉 외 수당, 놓치지 말아야 할 혜택: 비과세 수당으로 실질 소득 UP!",
    description:
      "연봉이 전부가 아닙니다. 숨겨진 수당과 복지 혜택을 찾아 당신의 실질 소득을 극대화하세요.",
    images: ["/api/og?title=연봉 외 수당, 놓치지 마세요!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 외 수당, 놓치지 말아야 할 혜택: 비과세 수당으로 실질 소득 UP!",
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
    "식대, 차량유지비, 자녀 보육수당 등 연봉 외에 받을 수 있는 다양한 수당과 복지 혜택을 총정리합니다. 특히 비과세 혜택을 받을 수 있는 수당들을 확인하고 당신의 실질 소득을 높이세요.",
};

export default function NonSalaryAllowancesGuidePage() {
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
            연봉 외 수당,
            <br /> 당신의 숨겨진 월급을 찾아라!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            월급 명세서에 찍힌 연봉이 당신의 모든 소득이라고 생각하시나요? 천만에요! 식대, 차량유지비, 자녀 보육수당 등 연봉 외에 받을 수 있는 다양한 수당과 복지 혜택을 놓치지 마세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              직장인의 총소득은 기본 연봉 외에 다양한 수당과 복지 혜택으로 구성됩니다. 특히 이 중에는 세금이 부과되지 않는 '비과세 수당'이 있어, 이를 잘 활용하면 실질 소득을 크게 높일 수 있습니다. 당신의 회사에서 어떤 수당과 복지 혜택을 제공하는지 꼼꼼히 확인하고, 놓치지 말고 챙겨 받으세요.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Gift className="w-6 h-6" />
                비과세 수당, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>세금 절감 효과:</strong> 비과세 수당은 소득세, 4대 보험료 산정 시 소득에서 제외되므로, 그만큼 세금 부담이 줄어들어 실질 소득이 증가합니다.
                </li>
                <li>
                  <strong>실수령액 증가:</strong> 동일한 연봉이라도 비과세 수당의 비중이 높으면 실수령액이 더 많아집니다.
                </li>
                <li>
                  <strong>복지 혜택:</strong> 회사가 제공하는 다양한 복지 혜택은 금전적인 가치 외에 삶의 질을 높여주는 중요한 요소입니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-green-500" />
                직장인이 받을 수 있는 주요 수당 및 복지 혜택
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 식대 (월 20만원 비과세)
                  </h3>
                  <p className="!text-sm !my-0">
                    회사에서 식사를 제공하지 않는 경우, 월 20만원까지는 비과세 식대 수당을 받을 수 있습니다. 연봉에 포함되어 있다면 비과세 처리 여부를 확인하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 차량유지비 (월 20만원 비과세)
                  </h3>
                  <p className="!text-sm !my-0">
                    본인 소유 차량을 업무에 사용하고, 실제 발생한 유류비 등을 지급받는 경우 월 20만원까지 비과세 혜택을 받을 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 자녀 보육수당 (월 10만원 비과세)
                  </h3>
                  <p className="!text-sm !my-0">
                    만 6세 이하 자녀를 둔 근로자가 회사로부터 받는 보육수당은 월 10만원까지 비과세입니다. 맞벌이 부부의 경우 한 명만 비과세 혜택을 받을 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    4. 연구보조비/연구활동비 (월 20만원 비과세)
                  </h3>
                  <p className="!text-sm !my-0">
                    기업 부설 연구소 등에서 연구 활동에 직접 종사하는 연구원에게 지급되는 연구보조비는 월 20만원까지 비과세입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" /> 우리 회사 복지, 어디서 확인할까?
              </h2>
              <p className="!my-2 text-base">
                회사마다 제공하는 수당과 복지 혜택은 천차만별입니다. 취업규칙, 근로계약서, 사내 복지 규정 등을 꼼꼼히 확인하고, 인사팀에 문의하여 당신이 받을 수 있는 모든 혜택을 놓치지 마세요.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <DollarSign className="w-7 h-7 text-indigo-500" />
                내 연봉, 더 정확하게 계산하고 싶다면?
              </h2>
              <p>
                비과세 수당을 포함한 당신의 진짜 연봉과 실수령액이 궁금하다면? <br />
                Moneysalary의 연봉 계산기로 1원 단위까지 정확한 내 월급을 확인해보세요.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 연봉으로 실수령액 계산하기 🧐
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
