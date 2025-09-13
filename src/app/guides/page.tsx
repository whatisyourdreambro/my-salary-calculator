import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "급여/세금/퇴직금 가이드 | Moneysalary",
  description:
    "실업급여, 주휴수당, 퇴직금 세금 등 직장인이라면 꼭 알아야 할 필수 정보들을 알기 쉽게 정리했습니다.",
};

const guides = [
  {
    slug: "unemployment-benefits",
    title: "실업급여 조건, A부터 Z까지 완벽 정리 (2025년 최신판)",
    description:
      "실업급여 수급 자격, 신청 방법, 지급액, 구직활동까지. 2025년 최신 기준으로 실업급여의 모든 것을 자세히 알려드립니다.",
  },
  {
    slug: "holiday-allowance",
    title: "주휴수당 계산법 및 지급 조건 완벽 가이드",
    description:
      "주휴수당, 받을 수 있는지 궁금하신가요? 2025년 최신 지급 조건과 내 월급에 맞는 주휴수당 계산법을 예시와 함께 알려드립니다.",
  },
  {
    slug: "severance-tax",
    title: "퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기",
    description:
      "내 퇴직금에서 세금이 얼마나 빠져나갈까요? 복잡한 퇴직소득세 계산 구조와 공제 항목을 예시와 함께 쉽게 설명해 드립니다.",
  },
  // 앞으로 새로운 가이드를 작성하면 이 배열에 추가하기만 하면 됩니다.
];

export default function GuidesListPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          콘텐츠 가이드
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          직장인이라면 꼭 알아야 할 필수 금융 정보를 쉽고 깊이있게 알려드립니다.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="flex flex-col p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all bg-light-card dark:bg-dark-card"
          >
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
              {guide.title}
            </h2>
            <p className="flex-grow text-light-text-secondary dark:text-dark-text-secondary">
              {guide.description}
            </p>
            <span className="mt-4 text-sm font-semibold text-signature-blue self-start">
              자세히 보기 →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
