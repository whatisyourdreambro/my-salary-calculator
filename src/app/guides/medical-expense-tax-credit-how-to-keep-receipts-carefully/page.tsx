
import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse, FileText, ShieldCheck, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "의료비 세액공제, 영수증 꼼꼼히 챙겨 13월의 월급 받기 (2025년)",
  description:
    "병원비, 약값, 안경 구입비까지! 연말정산 의료비 세액공제, 제대로 알고 계신가요? 공제 대상 의료비의 범위, 공제율, 그리고 영수증 등 증빙 서류를 꼼꼼하게 챙겨 공제 혜택을 최대로 받는 방법을 상세히 알려드립니다. 놓치기 쉬운 항목까지 완벽 정리.",
  openGraph: {
    title: "의료비 세액공제, 영수증 꼼꼼히 챙겨 13월의 월급 받기 (2025년)",
    description:
      "아프지 않고 건강한 것이 최고지만, 의료비 지출이 있었다면 세액공제로 돌려받으세요. 영수증이 곧 돈입니다!",
    images: ["/api/og?title=의료비 세액공제, 영수증이 돈이다!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "의료비 세액공제, 영수증 꼼꼼히 챙겨 13월의 월급 받기 (2025년)",
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
    "공제 대상 의료비의 범위, 공제율, 그리고 영수증 등 증빙 서류를 꼼꼼하게 챙겨 공제 혜택을 최대로 받는 방법을 상세히 알려드립니다. 놓치기 쉬운 항목까지 완벽 정리.",
};

export default function MedicalExpenseTaxCreditGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-pink-500 to-rose-600 dark:from-gray-900 dark:to-pink-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            의료비 세액공제,
            <br /> 영수증이 곧 돈이다!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-rose-100 dark:text-gray-300">
            아프지 않고 건강한 것이 최고지만, 병원비 지출이 있었다면 연말정산 의료비 세액공제로 돌려받으세요. 공제 대상부터 영수증 관리법까지, 당신의 13월의 월급을 지키는 꿀팁을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-rose-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연말정산 의료비 세액공제는 근로자 본인 및 부양가족을 위해 지출한 의료비에 대해 세금을 감면해주는 제도입니다. 병원비, 약값은 물론, 안경, 콘택트렌즈 구입비, 보청기 구입비 등 생각보다 다양한 항목이 공제 대상에 포함됩니다. 하지만 많은 분들이 어떤 항목이 공제되는지, 어떻게 증빙해야 하는지 몰라 혜택을 놓치곤 합니다. 이 가이드를 통해 의료비 세액공제의 모든 것을 파악하고, 당신의 소중한 세금을 돌려받으세요.
            </p>

            <section className="mt-12 bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl border border-pink-200 dark:border-pink-800">
              <h2 className="!mt-0 !text-2xl font-bold text-pink-600 flex items-center gap-2">
                <HeartPulse className="w-6 h-6" />
                의료비 세액공제, 누가 얼마나 받을 수 있나요?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>공제 대상:</strong> 근로자 본인, 배우자, 부양가족(나이 및 소득 제한 없음)
                </li>
                <li>
                  <strong>공제율:</strong> 총급여액의 3%를 초과하는 의료비에 대해 15% 세액공제
                </li>
                <li>
                  <strong>공제 한도:</strong> 연 700만원 (본인, 65세 이상 부양가족, 장애인 의료비는 한도 없음)
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-500" />
                공제 대상 의료비, 놓치지 마세요!
              </h2>
              <p>
                병원, 약국에서 지출한 비용 외에도 공제받을 수 있는 항목들이 많습니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 병원/약국 진료비 및 약값
                  </h3>
                  <p className="!text-sm !my-0">
                    가장 기본적인 공제 항목입니다. 건강보험이 적용되지 않는 비급여 항목(예: 미용 목적 성형 수술, 건강 증진 의약품)은 공제 대상에서 제외됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 안경, 콘택트렌즈 구입비
                  </h3>
                  <p className="!text-sm !my-0">
                    시력 보정용 안경 또는 콘택트렌즈 구입비는 1인당 연 50만원까지 공제 가능합니다. 반드시 안경점에서 '의료비 세액공제용 영수증'을 발급받아야 합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 보청기, 휠체어 등 의료기기 구입/임차비
                  </h3>
                  <p className="!text-sm !my-0">
                    의료기기 판매업자로부터 구입하거나 임차한 비용도 공제 대상입니다. 의료비 세액공제용 영수증을 챙기세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    4. 산후조리원 비용
                  </h3>
                  <p className="!text-sm !my-0">
                    총급여 7천만원 이하 근로자의 경우, 산후조리원 비용은 출산 1회당 200만원까지 공제 가능합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 영수증 관리, 이렇게 하세요!
              </h2>
              <p className="!my-2 text-base">
                대부분의 의료비는 국세청 홈택스 '연말정산 간소화 서비스'에서 자동으로 조회되지만, 일부 항목(안경, 콘택트렌즈, 보청기 등)은 직접 영수증을 제출해야 합니다. 따라서 관련 영수증은 반드시 잘 보관하고, 연말정산 시기에 맞춰 제출해야 합니다.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 13월의 월급을 최대로!
              </h2>
              <p>
                의료비 세액공제는 당신의 건강과 가정을 지키는 동시에 세금 혜택까지 받을 수 있는 중요한 제도입니다. <br />
                Moneysalary의 연말정산 계산기로 당신의 환급액을 최대로 늘리세요.
              </p>
              <Link
                href="/year-end-tax"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연말정산 계산기 바로가기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
