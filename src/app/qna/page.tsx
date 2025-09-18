// src/app/qna/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "급여 관련 자주 묻는 질문(Q&A) | Moneysalary",
  description:
    "연봉 수당, 건강보험료, 퇴직금 중간정산, 연말정산 등 급여에 대한 모든 궁금증을 해결해 드립니다.",
};

const posts = [
  {
    slug: "salary-allowance",
    title: "연봉에 포함되는 수당, 안되는 수당은?",
    description:
      "통상임금, 평균임금의 차이부터 비과세 수당까지, 내 연봉을 구성하는 각종 수당에 대해 자세히 알아보세요.",
  },
  {
    slug: "health-insurance",
    title: "건강보험료는 어떻게 결정되나요?",
    description:
      "매년 달라지는 건강보험료, 어떤 기준으로 부과되는지 직장가입자와 지역가입자의 차이점을 통해 명확하게 알려드립니다.",
  },
  {
    slug: "interim-severance-pay",
    title: "퇴직금 중간정산, 아무나 받을 수 있나요?",
    description:
      "2012년 이후 원칙적으로 금지된 퇴직금 중간정산, 하지만 법에서 정한 예외적인 사유에 해당하면 가능합니다.",
  },
  {
    slug: "year-end-tax-preview",
    title: "연말정산 미리보기, 핵심만 콕콕!",
    description:
      "2025년 연말정산, 미리 준비해서 13월의 월급을 놓치지 마세요. 핵심 공제 항목과 절세 팁을 알려드립니다.",
  },
];

// [추가] FAQ 구조화된 데이터 생성
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: posts.map((post) => ({
    "@type": "Question",
    name: post.title,
    acceptedAnswer: {
      "@type": "Answer",
      text: post.description,
    },
  })),
};

export default async function QnAListPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
            궁금한 점을 해결해 보세요 (Q&A)
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            급여, 세금, 퇴직금에 대한 모든 것을 알려드립니다.
          </p>
        </div>
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/qna/${post.slug}`}
              className="block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow bg-light-card dark:bg-dark-card"
            >
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                {post.title}
              </h2>
              <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
