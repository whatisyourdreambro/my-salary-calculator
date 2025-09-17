import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연봉 1억을 위한 현실적인 절세 전략 (2025년 최종판) | Moneysalary",
  description:
    "연봉 1억 실수령액을 높이는 가장 확실한 방법, 절세. 연금저축펀드, IRP, 비과세 수당 활용법부터 놓치기 쉬운 소득공제, 세액공제 항목까지 총정리했습니다.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 1억을 위한 현실적인 절세 전략 (2025년 최종판)",
  author: { "@type": "Organization", name: "Moneysalary" },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-09-16",
  dateModified: "2025-09-16",
  description:
    "연봉 1억 실수령액을 높이는 가장 확실한 방법, 절세. 연금저축펀드, IRP, 비과세 수당 활용법부터 놓치기 쉬운 소득공제, 세액공제 항목까지 총정리했습니다.",
};

export default function RoadTo100mTaxPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-signature-blue to-blue-400 bg-clip-text text-transparent pb-2">
            연봉 1억 절세 전략: 세금, 아는 만큼 돌려받는다
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Road to 1억 시리즈 (1편)
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 16일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            <strong>꿈의 연봉 1억</strong>을 달성했지만, 막상 통장에 찍힌 월급을
            보면 생각보다 적어 당황하셨나요? 연봉이 높을수록 세금 부담은
            기하급수적으로 늘어납니다. 하지만 합법적인 절세 전략을 아는
            것만으로도 연간 수백만 원을 아낄 수 있습니다. 2025년, 당신의 지갑을
            지켜줄 현실적인 절세 전략 A to Z를 공개합니다.
          </p>

          <section className="mt-12 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              🎯 핵심 요약: 연봉 1억 절세 3대장
            </h2>
            <ul className="!my-4">
              <li>
                <strong>연금계좌 활용:</strong> 연금저축펀드와 IRP를 최대로
                활용해 연말정산 시 최대 297만원을 환급받으세요.
              </li>
              <li>
                <strong>비과세 소득 극대화:</strong> 식대, 차량유지비 등 비과세
                항목을 빠짐없이 챙겨 과세 대상 소득 자체를 줄이세요.
              </li>
              <li>
                <strong>공제 항목 정복:</strong> 놓치기 쉬운 월세, 의료비,
                교육비 공제를 꼼꼼히 챙겨 세금을 직접 깎아내세요.
              </li>
            </ul>
          </section>

          <section className="mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold">
                1. 절세의 시작: 연금계좌 200% 활용법
              </h2>
              <p>
                연봉 1억 소득자에게 연금계좌는 선택이 아닌 필수입니다. 국가에서
                세제 혜택을 주는 유일한 금융상품이기 때문입니다. 연금계좌는 크게{" "}
                <strong>연금저축펀드</strong>와{" "}
                <strong>개인형 퇴직연금(IRP)</strong> 두 가지로 나뉩니다. 2025년
                기준, 연간 최대 <strong>900만원</strong> 납입에 대해 13.2%의
                세액공제, 즉 연말정산 시 <strong>118만 8천원</strong>을 그대로
                돌려받게 됩니다.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                2. 티끌 모아 태산: 비과세 소득 챙기기
              </h2>
              <p>
                비과세 소득은 세금을 매기지 않는 소득입니다. 연봉에 비과세
                항목이 포함되어 있다면 과세표준이 낮아져 결과적으로 세금이
                줄어듭니다. 대표적인 비과세 항목은{" "}
                <strong>식대(월 20만원)</strong>,{" "}
                <strong>차량유지비(월 20만원)</strong> 등이 있습니다.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                3. 소득공제 vs 세액공제, 무엇이 더 유리할까?
              </h2>
              <p>
                연봉 1억 소득자는 높은 세율(35% 이상)을 적용받을 가능성이 높기
                때문에, 세금을 매기는 기준 금액 자체를 줄여주는{" "}
                <strong>
                  소득공제 항목을 최대한 활용하는 것이 세액공제보다 유리
                </strong>
                할 수 있습니다. 신용카드 사용액, 주택청약저축 납입액 등을 꼼꼼히
                챙기세요.
              </p>
            </div>
            <Link
              href="/"
              className="block mt-8 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
            >
              내 연봉에 맞는 정확한 공제액 계산하기
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
