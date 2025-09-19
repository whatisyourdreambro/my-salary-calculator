import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "주 4일제 연봉 계산법: 내 월급은 어떻게 바뀔까?",
  description:
    "주 4일제(주 32시간)로 전환되면 내 연봉과 월급은 어떻게 바뀔까요? 근로시간 단축 시 임금 계산 원칙과 실제 계산법을 알려드립니다.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주 4일제 연봉 계산법: 내 월급은 어떻게 바뀔까?",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-19",
  dateModified: "2025-09-19",
  description:
    "주 4일제(주 32시간) 전환 시 연봉과 월급 변화를 계산하는 방법을 알려드립니다.",
};

export default function FourDayWeekGuidePage() {
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
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            주 4일제가 되면, 내 월급은 어떻게 될까?
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {/* [수정] 작은따옴표를 &apos; HTML 엔티티로 변경하여 안정성을 높였습니다. */}
            &apos;꿈의 직장&apos;으로 불리는 주 4일제, 만약 우리 회사에
            도입된다면 내 연봉과 실수령액은 어떻게 변하는지 정확히 계산해
            봅시다.
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            주 4일제 근무는 많은 직장인들의 희망사항입니다. 하지만 근로시간이
            줄어드는 만큼 임금이 삭감될 수 있다는 우려도 공존합니다. 임금 조정
            방식은 회사 정책에 따라 다르지만, 일반적으로는 근로시간에 비례하여
            조정됩니다.
          </p>

          <section className="mt-12 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              {/* [수정] 작은따옴표를 &apos; HTML 엔티티로 변경하여 안정성을 높였습니다. */}
              &apos;임금 유지&apos; vs &apos;시간 비례&apos;
            </h2>
            <ul className="!my-4">
              <li>
                <strong>임금 수준 유지:</strong> 가장 이상적인 경우로, 주
                5일제와 동일한 연봉을 받으면서 하루를 더 쉬게 됩니다. 이 경우
                시간당 임금이 인상되는 효과가 있습니다.
              </li>
              <li>
                <strong>근로시간 비례 삭감 (일반적):</strong> 주 40시간에서 주
                32시간으로 근로시간이 20% 감소하므로, 연봉도 그에 비례하여
                조정될 수 있습니다.
              </li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">
              시간 비례 삭감 시 연봉 계산법
            </h2>
            <p>
              만약 기존 연봉이 5,000만원이었다면, 주 4일제(32시간) 전환 시
              연봉은 다음과 같이 계산될 수 있습니다.
            </p>
            <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xl font-bold">
                5,000만원 × (32시간 / 40시간) = 4,000만원
              </p>
            </div>
            <p className="mt-4">
              연봉이 4,000만원으로 줄어들면, 4대보험 및 소득세 공제액도 함께
              줄어들어 월 실수령액이 변동됩니다.
            </p>
            <Link
              href="/?salaryInput=40,000,000&payBasis=annual"
              className="block mt-8 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
            >
              변경된 연봉으로 실수령액 계산하기 →
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}

// 파일이 모듈로 확실하게 인식되도록 빈 export를 추가합니다.
export {};
