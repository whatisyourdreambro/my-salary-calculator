import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연말정산 미리보기, 핵심만 콕콕! | Moneysalary",
  description:
    "2025년 연말정산, 미리 준비해서 13월의 월급을 놓치지 마세요. 핵심 공제 항목과 절세 팁을 알려드립니다.",
};

// [추가] QAPage 스키마 데이터
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
      {/* [추가] 스키마 적용을 위한 스크립트 태그 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose dark:prose-invert lg:prose-xl w-full">
          <h1>연말정산 미리보기, 핵심만 콕콕!</h1>
          <p>
            연말정산은 13월의 월급이라고도 불리지만, 제대로 준비하지 않으면
            오히려 13월의 세금폭탄이 될 수 있습니다. 2025년 귀속 연말정산을 미리
            준비할 수 있도록 핵심적인 팁 몇 가지를 알려드립니다.
          </p>
          <h2>1. 신용카드 vs 체크카드, 황금비율은?</h2>
          <p>
            총 급여액의 25%까지는 어떤 카드를 써도 공제율이 동일하므로, 혜택이
            많은 신용카드를 사용하는 것이 유리합니다. 25%를 초과하는 금액부터는
            공제율이 높은 <strong>체크카드나 현금영수증</strong>을 사용하는 것이
            절세에 도움이 됩니다.
          </p>
          <h2>2. 놓치기 쉬운 공제 항목</h2>
          <ul>
            <li>
              <strong>월세액 세액공제</strong>: 조건에 해당하는 무주택
              근로자라면, 연간 최대 750만원까지 월세액의 15~17%를 세액공제 받을
              수 있습니다.
            </li>
            <li>
              <strong>교육비 세액공제</strong>: 본인 및 부양가족을 위해 지출한
              교육비도 공제 대상입니다. (취학 전 아동의 학원비도 포함!)
            </li>
          </ul>
          <blockquote>
            <p>
              더 정확한 예상 환급/납부 세액은 당신의 연봉을 기준으로 계산됩니다.{" "}
              <Link href="/">연봉 계산기</Link>.
            </p>
          </blockquote>
        </article>
      </main>
    </>
  );
}
