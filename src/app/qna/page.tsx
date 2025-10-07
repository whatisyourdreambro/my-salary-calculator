// src/app/qna/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  Wallet,
  Landmark,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import type { ElementType } from "react";

const qnaData = [
  // 연봉 및 수당
  {
    category: "연봉 및 수당",
    question: "연봉에 포함되는 수당과 안되는 수당은 무엇인가요?",
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
    category: "연봉 및 수당",
    question: "주 4일제로 바뀌면 제 월급은 어떻게 되나요?",
    answer: {
      conclusion:
        "회사의 정책에 따라 다릅니다. '임금 유지'라면 시간당 가치는 상승하지만, '근로시간 비례 삭감'이라면 총급여가 줄어들 수 있습니다.",
      details: [
        "<strong>임금 유지:</strong> 주 5일 근무와 동일한 연봉을 받으면서 하루를 더 쉬므로, 실질적인 시간당 임금이 25% 인상되는 효과입니다.",
        "<strong>비례 삭감:</strong> 주 40시간에서 32시간으로 근로시간이 20% 줄어들면, 연봉도 20% 삭감될 수 있습니다. (예: 5,000만원 → 4,000만원)",
        "<strong>세금 변화:</strong> 연봉이 삭감되면 소득세율 구간이 낮아져 세금 부담은 줄어들지만, 실수령액 감소는 불가피합니다.",
      ],
      action: {
        text: "주 4일제 연봉 변화 가이드 보기",
        href: "/guides/4-day-week",
      },
    },
  },
  // 4대보험 및 세금
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
    category: "4대보험 및 세금",
    question: "연말정산, 핵심만 콕콕!",
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
  // 퇴직 및 이직
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
    category: "퇴직 및 이직",
    question: "이직할 때 연봉, 얼마나 올려 불러야 할까요?",
    answer: {
      conclusion:
        "정답은 없지만, 일반적으로 현재 연봉의 '최소 15~20%' 이상을 목표로 하는 것이 합리적입니다.",
      details: [
        "<strong>20%를 목표로 하는 이유:</strong> 새로운 환경 적응에 대한 리스크, 기존 직장에서의 기회비용, 그리고 미래 1~2년 간의 연봉 인상분을 미리 반영한다는 개념이 포함되어 있습니다.",
        "<strong>객관적인 근거 제시:</strong> '열심히 하겠다'는 말보다, 본인의 시장 가치(Market Price)와 과거의 성과를 숫자로 증명하는 것이 협상 성공의 핵심입니다.",
        "<strong>먼저 제시하지 않기:</strong> 희망 연봉을 먼저 말하기보다, 회사의 연봉 테이블과 규정을 존중한다는 자세로 상대방이 먼저 제안하도록 유도하는 것이 유리합니다.",
      ],
      action: {
        text: "연봉 협상 실전 전략 가이드 보기",
        href: "/guides/salary-negotiation",
      },
    },
  },
  // 재테크
  {
    category: "재테크",
    question: "첫 월급, 재테크 어떻게 시작해야 할지 막막해요.",
    answer: {
      conclusion:
        "가장 먼저 할 일은 '선저축 후지출' 시스템을 만들고, 국가가 보장하는 최고의 절세 상품인 '연금저축펀드'에 가입하는 것입니다.",
      details: [
        "<strong>1. 강제 저축 시스템:</strong> 월급날, 저축할 금액이 다른 통장으로 자동이체되도록 설정하여 '남는 돈'이 아닌 '정한 돈'을 저축하는 습관을 만드세요.",
        "<strong>2. 연금저축펀드 활용:</strong> 연 600만원까지 납입 시, 연말정산에서 최대 99만원을 현금으로 돌려받습니다. 투자 지식이 없어도 연 16.5%의 확정 수익을 얻는 것과 같습니다.",
        "<strong>3. 첫 투자처:</strong> 연금저축펀드 계좌에서 미국 S&P 500 지수를 추종하는 ETF를 매달 꾸준히 매수하는 것만으로도, 장기적으로 안정적인 복리 효과를 누릴 수 있습니다.",
      ],
      action: {
        text: "사회초년생 재테크 완벽 가이드 보기",
        href: "/guides/first-job-investment",
      },
    },
  },
  {
    category: "퇴직 및 이직",
    question: "실업급여는 누가, 어떻게 받을 수 있나요?",
    answer: {
      conclusion:
        "비자발적인 사유로 퇴사하고, 재취업 의사가 있는 근로자가 일정한 조건을 충족할 때 받을 수 있는 사회보험 급여입니다.",
      details: [
        "<strong>핵심 조건 1:</strong> 퇴사일 이전 18개월 동안 고용보험 가입 기간이 총 180일 이상이어야 합니다.",
        "<strong>핵심 조건 2:</strong> 경영상 해고, 권고사직, 계약 만료 등 '비자발적'인 사유로 퇴사해야 합니다. (자발적 퇴사 시에도 일부 예외 사유 인정)",
        "<strong>지급액:</strong> 퇴직 전 3개월 평균임금의 60% 수준이며, 나이와 고용보험 가입 기간에 따라 120일에서 270일까지 지급됩니다.",
      ],
      action: {
        text: "실업급여 A to Z 가이드 보기",
        href: "/guides/unemployment-benefits",
      },
    },
  },
];

const categories: {
  id: string;
  name: string;
  icon: ElementType;
}[] = [
  { id: "전체", name: "전체보기", icon: HelpCircle },
  { id: "연봉 및 수당", name: "연봉/수당", icon: Wallet },
  { id: "4대보험 및 세금", name: "4대보험/세금", icon: Landmark },
  { id: "퇴직 및 이직", name: "퇴직/이직", icon: Briefcase },
  { id: "재테크", name: "재테크", icon: TrendingUp },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: qnaData.map((item) => ({
    "@type": "Question",
    name: item.question,
    answerCount: 1,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${item.answer.conclusion} ${item.answer.details.join(
        " "
      )}`.replace(/<[^>]*>?/gm, ""),
    },
  })),
};

export default function QnAPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const filteredData = useMemo(() => {
    return qnaData.filter((item) => {
      const categoryMatch =
        activeCategory === "전체" || item.category === activeCategory;
      const searchMatch =
        searchTerm === "" ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.conclusion.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [searchTerm, activeCategory]);

  const groupedByCategory = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as Record<string, typeof qnaData>);
  }, [filteredData]);

  const toggleAccordion = (id: string) => {
    const globalIndex = qnaData.findIndex((item) => item.question === id);
    setActiveIndex(activeIndex === globalIndex ? null : globalIndex);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        <div className="w-full bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            당신의 돈에 대한 모든 질문
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
            급여, 세금, 퇴직금부터 재테크까지. 알아두면 피가 되고 살이 되는 금융
            지식을 명쾌하게 알려드립니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <div className="sticky top-20 z-10 mb-12">
            <div className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
              <div className="relative mb-4">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="궁금한 점을 검색해보세요 (예: 퇴직금)"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-signature-blue bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex justify-center flex-wrap gap-2">
                {categories.map(({ id, name, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-2 ${
                      activeCategory === id
                        ? "bg-signature-blue text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {Object.entries(groupedByCategory).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-signature-blue pb-3 mb-8">
                  {category}
                </h2>
                <div className="space-y-6">
                  {items.map((item, index) => {
                    const globalIndex = qnaData.findIndex(
                      (q) => q.question === item.question
                    );
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                      >
                        <button
                          onClick={() => toggleAccordion(item.question)}
                          className="w-full flex justify-between items-center p-6 text-left bg-light-card dark:bg-dark-card"
                        >
                          <h3 className="text-xl font-bold text-light-text dark:text-dark-text pr-4">
                            <span className="text-signature-blue mr-2">Q.</span>
                            {item.question}
                          </h3>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform duration-500 flex-shrink-0 ${
                              activeIndex === globalIndex ? "rotate-180" : ""
                            }`}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <div
                          className={`grid transition-all duration-500 ease-in-out ${
                            activeIndex === globalIndex
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card/50 space-y-6">
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-signature-blue">
                                <p className="!m-0 font-semibold text-light-text dark:text-dark-text">
                                  <span className="font-bold">A. 결론:</span>{" "}
                                  {item.answer.conclusion}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="font-semibold mb-3 text-light-text dark:text-dark-text">
                                  더 자세히 알아볼까요?
                                </h4>
                                <ul className="space-y-3 text-sm list-disc pl-5">
                                  {item.answer.details.map((detail, i) => (
                                    <li
                                      key={i}
                                      dangerouslySetInnerHTML={{
                                        __html: detail,
                                      }}
                                      className="text-light-text-secondary dark:text-dark-text-secondary"
                                    />
                                  ))}
                                </ul>
                              </div>
                              <Link
                                href={item.answer.action.href}
                                className="block w-full text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-signature-blue hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                              >
                                {item.answer.action.text} →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
            {filteredData.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl font-semibold">
                  아쉽게도 검색 결과가 없네요.
                </p>
                <p className="mt-2">다른 키워드로 다시 검색해보시겠어요?</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
