
import type { Metadata } from "next";
import Link from "next/link";
import { Baby, ShieldCheck, DollarSign, FileText } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "자녀 세액공제, 놓치지 말아야 할 혜택: 연말정산 환급액 늘리는 법 (2025년)",
  description:
    "자녀를 키우는 부모라면 반드시 챙겨야 할 자녀 세액공제! 공제 대상, 공제 금액, 그리고 연말정산 시 놓치지 않고 혜택을 받는 방법을 상세히 알려드립니다. 출산/입양 세액공제, 자녀장려금 등 관련 혜택도 함께 확인하세요.",
  openGraph: {
    title: "자녀 세액공제, 놓치지 말아야 할 혜택: 연말정산 환급액 늘리는 법 (2025년)",
    description:
      "자녀가 있다면 세금 혜택도 두 배! 자녀 세액공제로 13월의 월급을 두둑하게 챙기세요.",
    images: ["/api/og?title=자녀 세액공제, 놓치지 마세요!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "자녀 세액공제, 놓치지 말아야 할 혜택: 연말정산 환급액 늘리는 법 (2025년)",
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
    "자녀 세액공제 대상, 공제 금액, 그리고 연말정산 시 놓치지 않고 혜택을 받는 방법을 상세히 알려드립니다. 출산/입양 세액공제, 자녀장려금 등 관련 혜택도 함께 확인하세요.",
};

export default function ChildTaxCreditGuidePage() {
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
            자녀 세액공제,
            <br /> 13월의 월급을 두 배로!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-rose-100 dark:text-gray-300">
            사랑스러운 자녀와 함께라면 세금 혜택도 두 배! 연말정산의 효자, 자녀 세액공제를 비롯해 출산/입양 세액공제, 자녀장려금까지. 놓치지 말아야 할 모든 혜택을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-rose-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              자녀를 양육하는 가정이라면 연말정산 시 다양한 세금 혜택을 받을 수 있습니다. 그중에서도 '자녀 세액공제'는 가장 대표적인 항목으로, 자녀 수에 따라 일정 금액을 세금에서 직접 공제해주는 제도입니다. 이 외에도 출산/입양 세액공제, 자녀장려금 등 자녀와 관련된 여러 혜택들이 있으니, 꼼꼼히 확인하여 당신의 13월의 월급을 두둑하게 채우세요.
            </p>

            <section className="mt-12 bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl border border-pink-200 dark:border-pink-800">
              <h2 className="!mt-0 !text-2xl font-bold text-pink-600 flex items-center gap-2">
                <Baby className="w-6 h-6" />
                자녀 세액공제, 무엇인가요?
              </h2>
              <p className="!my-2 text-base">
                자녀 세액공제는 만 7세 이상의 자녀를 둔 근로자(부양가족)에게 자녀 수에 따라 일정 금액을 산출세액에서 직접 공제해주는 제도입니다. 소득공제와 달리 세액에서 직접 차감되므로 절세 효과가 매우 큽니다.
              </p>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>공제 대상:</strong> 만 7세 이상 자녀 (기본공제 대상자)
                </li>
                <li>
                  <strong>공제 금액 (2025년 기준):</strong>
                  <ul className="!my-2 list-disc list-inside text-sm">
                    <li>자녀 1명: 연 15만원</li>
                    <li>자녀 2명: 연 30만원</li>
                    <li>자녀 3명 이상: 연 30만원 + 2명 초과 1명당 연 30만원</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-green-500" />
                놓치지 말아야 할 자녀 관련 세금 혜택
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 출산/입양 세액공제
                  </h3>
                  <p className="!text-sm !my-0">
                    자녀를 출산하거나 입양한 경우 받을 수 있는 세액공제입니다. 첫째 30만원, 둘째 50만원, 셋째 이상 70만원을 공제받을 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 자녀장려금
                  </h3>
                  <p className="!text-sm !my-0">
                    저소득 가구의 자녀 양육을 지원하기 위한 제도로, 소득 및 재산 기준을 충족하는 경우 자녀 1인당 최대 80만원을 지급받을 수 있습니다. (근로장려금과 함께 신청)
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 교육비 세액공제
                  </h3>
                  <p className="!text-sm !my-0">
                    취학 전 아동부터 대학생까지 자녀의 교육비에 대해 세액공제를 받을 수 있습니다. 학원비, 교복비, 체험학습비 등 공제 대상 항목을 꼼꼼히 확인하세요.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <FileText className="w-6 h-6" /> 연말정산, 이렇게 준비하세요!
              </h2>
              <p className="!my-2 text-base">
                자녀 관련 세금 혜택은 대부분 연말정산을 통해 적용됩니다. 국세청 홈택스 '연말정산 미리보기' 서비스를 활용하여 예상 환급액을 미리 확인하고, 필요한 서류를 꼼꼼히 준비하세요. 특히 맞벌이 부부의 경우, 자녀 공제를 누가 받는 것이 유리한지 미리 계산해보는 것이 좋습니다.
              </p>
              <Link href="/guides/year-end-tax-settlement" className="font-semibold text-yellow-800 hover:underline">
                → 연말정산 완벽 가이드 보기
              </Link>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <DollarSign className="w-7 h-7 text-indigo-500" />
                당신의 13월의 월급을 두둑하게!
              </h2>
              <p>
                자녀는 사랑이자 축복입니다. 그리고 세금 혜택은 그 사랑에 대한 작은 보답입니다. <br />
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
