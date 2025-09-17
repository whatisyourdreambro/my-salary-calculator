import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "퇴직금 중간정산, 아무나 받을 수 있나요? | Moneysalary",
  description:
    "2012년 이후 원칙적으로 금지된 퇴직금 중간정산, 하지만 법에서 정한 예외적인 사유에 해당하면 가능합니다. 그 조건을 확인해보세요.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "QAPage",
  mainEntity: {
    "@type": "Question",
    name: "퇴직금 중간정산, 아무나 받을 수 있나요?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "아닙니다. 2012년 7월 26일 이후 원칙적으로 퇴직금 중간정산은 금지되었습니다. 다만, 무주택자의 주택 구입, 본인 또는 부양가족의 6개월 이상 장기 요양, 파산 선고 등 법에서 정한 매우 예외적인 사유에 해당하고 근로자의 요청이 있는 경우에만 신청할 수 있습니다.",
    },
  },
};

export default function InterimSeverancePayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            퇴직금 중간정산, 아무나 받을 수 있나요?
          </h1>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead text-center !mb-12">
            결론부터 말씀드리면, <strong>아닙니다.</strong> 2012년 7월 26일 이후
            법이 개정되어 안정적인 노후 자금 마련을 위해 원칙적으로 퇴직금
            중간정산은 금지되었습니다.
          </p>

          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold text-center">
              중간정산이 가능한 예외적인 사유
            </h2>
            <p className="text-center">
              다만, 아래와 같이 법에서 정한 매우 예외적인 사유에 해당하고,
              근로자의 요청이 있는 경우에만 신청할 수 있습니다.
            </p>
            <ul className="!my-4">
              <li>
                <strong>주택 구입:</strong> 무주택자인 근로자가 본인 명의의
                주택을 구입하는 경우
              </li>
              <li>
                <strong>장기 요양:</strong> 본인, 배우자, 또는 부양가족이
                질병이나 부상으로 6개월 이상 요양하는 경우
              </li>
              <li>
                <strong>파산 선고:</strong> 근로자가 파산 선고를 받은 경우
              </li>
              <li>
                <strong>개인회생절차:</strong> 근로자가 개인회생절차 개시 결정을
                받은 경우
              </li>
              <li>
                <strong>기타:</strong> 천재지변 등 고용노동부장관이 정하는
                사유와 요건을 갖춘 경우
              </li>
            </ul>
          </section>

          <Link
            href="/?tab=severance"
            className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
          >
            내 예상 퇴직금 계산해보기
          </Link>
        </article>
      </main>
    </>
  );
}
