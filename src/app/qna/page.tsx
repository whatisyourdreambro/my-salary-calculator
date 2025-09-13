import Link from "next/link";

const posts = [
  {
    slug: "interim-severance-pay",
    title: "퇴직금 중간정산, 아무나 받을 수 있나요?",
    description:
      "2012년 이후 원칙적으로 금지된 퇴직금 중간정산, 하지만 법에서 정한 예외적인 사유에 해당하면 가능합니다. 그 조건을 확인해보세요.",
  },
  {
    slug: "year-end-tax-preview",
    title: "연말정산 미리보기, 핵심만 콕콕!",
    description:
      "2025년 연말정산, 미리 준비해서 13월의 월급을 놓치지 마세요. 핵심 공제 항목과 절세 팁을 알려드립니다.",
  },
  // 새로운 Q&A 게시물이 생기면 이 배열에 추가하면 됩니다.
];

export default async function QnAListPage() {
  return (
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
  );
}
