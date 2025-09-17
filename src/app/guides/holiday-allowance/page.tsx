import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "주휴수당 계산법 및 지급 조건 완벽 가이드 | Moneysalary",
  description:
    "주휴수당, 받을 수 있는지 궁금하신가요? 2025년 최신 지급 조건과 내 월급에 맞는 주휴수당 계산법을 예시와 함께 알려드립니다.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주휴수당 계산법 및 지급 조건 완벽 가이드",
  author: { "@type": "Organization", name: "Moneysalary" },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-09-01",
  dateModified: "2025-09-01",
  description:
    "주휴수당, 받을 수 있는지 궁금하신가요? 2025년 최신 지급 조건과 내 월급에 맞는 주휴수당 계산법을 예시와 함께 알려드립니다.",
};

export default function HolidayAllowancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            주휴수당 완벽 가이드: 나는 받을 수 있을까?
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            일주일 동안 성실하게 일한 당신을 위한 유급 휴일, 주휴수당의 모든
            것을 알려드립니다.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 1일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            주휴수당은 일주일 동안 성실하게 일한 근로자에게 주어지는 유급 휴일에
            대한 대가입니다. 아르바이트생부터 정규직까지, 조건을 충족하면 누구나
            받을 수 있는 권리이지만, 많은 분들이 지급 조건과 계산법을 잘 몰라
            놓치고 있습니다.
          </p>

          <section className="mt-12 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              주휴수당 지급 조건 3가지
            </h2>
            <p>아래 3가지 조건을 모두 충족해야 주휴수당을 받을 수 있습니다.</p>
            <ol className="!my-4">
              <li>
                <strong>1주일 소정근로시간 15시간 이상:</strong> 근로계약서에
                명시된 1주일 근무 시간이 15시간 이상이어야 합니다.
              </li>
              <li>
                <strong>소정근로일 개근:</strong> 일하기로 약속한 날에 모두
                출근해야 합니다. 지각이나 조퇴는 결근이 아니지만, 무단 결근이
                있으면 해당 주에는 주휴수당을 받을 수 없습니다.
              </li>
              <li>
                <strong>다음 주 근로 예정:</strong> 계속 근로가 예정되어 있어야
                합니다. 즉, 마지막 근무 주에는 주휴수당이 발생하지 않는 것이
                일반적입니다.
              </li>
            </ol>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-center">
              그래서, 얼마를 받아야 할까요?
            </h2>
            <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-center !my-0">
                주휴수당 = (1주일 총 소정근로시간 / 40시간) × 8시간 × 시급
              </p>
            </div>
            <p className="mt-6">
              예를 들어, 시급 10,000원을 받고 주 5일, 하루 4시간씩 총 20시간을
              일하는 아르바이트생의 경우:
            </p>
            <p className="text-center text-lg font-bold bg-signature-blue/10 p-4 rounded-lg">
              (20시간 / 40시간) × 8시간 × 10,000원 ={" "}
              <span className="text-signature-blue">40,000원</span>
            </p>
            <p>
              따라서 이 근로자는 주급 200,000원(20시간 × 10,000원)에 주휴수당
              40,000원을 더한 총 240,000원을 받아야 합니다.
            </p>
            <Link
              href="/"
              className="block mt-8 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
            >
              내 시급/주급으로 월급 계산해보기
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
