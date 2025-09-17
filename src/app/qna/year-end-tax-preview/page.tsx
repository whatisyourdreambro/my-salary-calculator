import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연말정산 미리보기, 핵심만 콕콕! | Moneysalary",
  description:
    "2025년 연말정산, 미리 준비해서 13월의 월급을 놓치지 마세요. 핵심 공제 항목과 절세 팁을 알려드립니다.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "QAPage",
  mainEntity: {
    "@type": "Question",
    name: "연말정산 절세를 위한 핵심 팁은 무엇인가요?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "연말정산 절세의 핵심은 신용카드와 체크카드의 사용 비율을 조절하고, 놓치기 쉬운 공제 항목을 꼼꼼히 챙기는 것입니다. 총 급여액의 25%까지는 신용카드를, 그 초과분은 공제율이 높은 체크카드나 현금영수증을 사용하는 것이 유리합니다. 또한 조건에 맞는다면 월세액, 교육비 세액공제 등을 반드시 챙겨야 합니다.",
    },
  },
};

export default function YearEndTaxPreviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            연말정산 미리보기, 핵심만 콕콕!
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            13월의 월급을 놓치지 않도록, 2025년 귀속 연말정산을 미리 준비하는
            핵심 팁을 알려드립니다.
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              1. 신용카드 vs 체크카드, 황금비율은?
            </h2>
            <p>
              총 급여액의 25%까지는 어떤 카드를 써도 공제율이 동일하므로 혜택이
              많은 신용카드를 사용하는 것이 유리합니다. 25%를 초과하는
              금액부터는 공제율이 높은 <strong>체크카드나 현금영수증</strong>을
              사용하는 것이 절세에 도움이 됩니다.
            </p>
          </section>

          <section className="mt-8 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              2. 놓치기 쉬운 공제 항목
            </h2>
            <ul>
              <li>
                <strong>월세액 세액공제:</strong> 조건에 해당하는 무주택
                근로자라면, 연간 최대 750만원까지 월세액의 15~17%를 세액공제
                받을 수 있습니다.
              </li>
              <li>
                <strong>교육비 세액공제:</strong> 본인 및 부양가족을 위해 지출한
                교육비도 공제 대상입니다. (취학 전 아동의 학원비도 포함!)
              </li>
            </ul>
          </section>

          <Link
            href="/"
            className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
          >
            연봉 계산기로 예상 환급액 확인하기
          </Link>
        </article>
      </main>
    </>
  );
}
