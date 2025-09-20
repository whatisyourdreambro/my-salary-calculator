import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "급여 관련 자주 묻는 질문(Q&A) | Moneysalary",
  description:
    "연봉 수당, 건강보험료, 퇴직금 중간정산, 연말정산 등 급여에 대한 모든 궁금증을 명쾌하게 해결해 드립니다.",
};

const qnaData = [
  {
    category: "연봉 및 수당",
    question: "연봉에 포함되는 수당, 안되는 수당은 무엇인가요?",
    answer: {
      conclusion:
        "연장근로수당이나 성과급 등은 통상임금에서 제외되며, 식대나 차량유지비 같은 비과세 수당은 세금을 떼지 않아 실수령액을 높여줍니다.",
      details: [
        "<strong>통상임금:</strong> 연장/야간수당, 퇴직금 등을 계산하는 기준입니다. 기본급, 직무수당처럼 정기적/일률적으로 지급되는 항목이 포함됩니다.",
        "<strong>비과세 수당:</strong> 세금을 부과하지 않는 항목입니다. 월 20만원까지의 식대, 본인 차량을 업무에 사용할 때 받는 월 20만원까지의 차량유지비 등이 대표적입니다.",
        "<strong>평균임금:</strong> 퇴직금, 실업급여 등을 계산하는 기준으로, 퇴사 직전 3개월간 받은 모든 임금(성과급, 수당 포함)을 평균 낸 금액입니다. 보통 통상임금보다 높습니다.",
      ],
      action: {
        text: "내 비과세액 적용해서 실수령액 계산하기",
        href: "/?tab=salary",
      },
    },
  },
  {
    category: "4대보험 및 세금",
    question: "건강보험료는 어떻게 결정되나요?",
    answer: {
      conclusion:
        "직장가입자는 월 소득(보수월액) 기준으로 회사와 50%씩 부담하며, 지역가입자는 소득과 재산을 모두 고려하여 산정됩니다.",
      details: [
        "<strong>직장가입자:</strong> 월급에서 정해진 보험료율(2025년 기준 7.09%)에 따라 납부합니다. 월급 외 소득이 연 2,000만원을 넘으면 추가 보험료가 부과될 수 있습니다.",
        "<strong>지역가입자:</strong> 프리랜서, 자영업자 등이 해당되며, 소득뿐만 아니라 주택, 자동차 등 재산까지 점수화하여 보험료를 산정해 상대적으로 복잡합니다.",
        "<strong>피부양자:</strong> 직장가입자에게 생계를 의존하는 가족은 별도의 보험료 없이 건강보험 혜택을 받을 수 있습니다. (일정 소득/재산 기준 충족 시)",
      ],
      action: {
        text: "4대 보험의 모든 것, 가이드에서 확인하기",
        href: "/guides/four-major-insurances",
      },
    },
  },
  {
    category: "퇴직 및 이직",
    question: "퇴직금 중간정산, 아무나 받을 수 있나요?",
    answer: {
      conclusion:
        "아니요, 원칙적으로 금지되어 있습니다. 무주택자의 주택 구입, 6개월 이상 장기 요양 등 법에서 정한 매우 예외적인 사유에 해당해야만 가능합니다.",
      details: [
        "2012년 7월 26일 이후, 근로자의 안정적인 노후 자금 마련을 위해 퇴직금 중간정산이 원칙적으로 금지되었습니다.",
        "<strong>중간정산 가능 사유:</strong> 무주택자인 근로자의 본인 명의 주택 구입, 본인 또는 부양가족의 6개월 이상 장기 요양 필요, 파산 선고 또는 개인회생절차 개시 결정 등",
        "<strong>주의사항:</strong> 중간정산을 받으면, 퇴직금 산정을 위한 계속근로기간이 정산 시점부터 새로 계산됩니다.",
      ],
      action: {
        text: "내 예상 퇴직금 계산해보기",
        href: "/?tab=severance",
      },
    },
  },
  {
    category: "4대보험 및 세금",
    question: "연말정산 미리보기, 핵심만 콕콕!",
    answer: {
      conclusion:
        "1년간 낸 세금을 최종 정산하는 과정입니다. 소득공제(세금 매기는 기준 줄이기)와 세액공제(세금 자체를 깎기)를 최대한 활용하는 것이 핵심입니다.",
      details: [
        "<strong>소득공제:</strong> 신용카드 사용액, 주택청약저축 납입액 등이 대표적이며, 연봉이 높을수록 절세 효과가 큽니다.",
        "<strong>세액공제:</strong> 연금저축/IRP, 월세, 의료비, 교육비 등이 대표적이며, 세금 자체를 깎아주므로 매우 효과적인 절세 수단입니다.",
        "<strong>미리 준비할 것:</strong> 월세 계약서, 안경 구입비 영수증 등 국세청 간소화 서비스에 자동으로 잡히지 않는 항목들은 미리 챙겨두어야 합니다.",
      ],
      action: {
        text: "내 예상 환급금 계산하러 가기",
        href: "/year-end-tax",
      },
    },
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: qnaData.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${item.answer.conclusion} ${item.answer.details.join(
        " "
      )}`.replace(/<[^>]*>?/gm, ""),
    },
  })),
};

export default function QnAPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
            궁금한 점을 해결해 보세요 (Q&A)
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            급여, 세금, 퇴직금에 대한 모든 것을 명쾌하게 알려드립니다.
          </p>
        </div>

        <div className="space-y-10">
          {qnaData.map((item, index) => (
            <section
              key={index}
              className="p-6 bg-light-card dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-signature-blue flex items-center justify-center text-white font-bold">
                  Q
                </div>
                <div>
                  <p className="text-xs font-semibold text-signature-blue">
                    {item.category}
                  </p>
                  <h2 className="!mt-1 !mb-6 text-2xl font-bold">
                    {item.question}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-signature-blue">
                  <p className="!m-0">
                    <strong>결론부터 말하면:</strong> {item.answer.conclusion}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-semibold mb-2">더 자세히 알아볼까요?</h3>
                  <ul className="!my-0 !pl-5 space-y-2 text-sm list-disc">
                    {item.answer.details.map((detail, i) => (
                      <li
                        key={i}
                        dangerouslySetInnerHTML={{ __html: detail }}
                      />
                    ))}
                  </ul>
                </div>

                <Link
                  href={item.answer.action.href}
                  className="block w-full text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-signature-blue hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {item.answer.action.text} →
                </Link>
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
