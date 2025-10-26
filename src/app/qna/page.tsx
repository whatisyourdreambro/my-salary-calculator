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

// Q&A 데이터 항목에 대한 타입 정의
interface QnaItem {
  category: string;
  question: string;
  answer: {
    conclusion: string;
    details: string[];
    tip?: string;
    action: {
      text: string;
      href: string;
    };
  };
}

// SEO를 위한 FAQPage 스키마 타입 정의
interface FaqAnswer {
  "@type": "Answer";
  text: string;
}

interface FaqQuestion {
  "@type": "Question";
  name: string;
  answerCount: number;
  acceptedAnswer: FaqAnswer;
}

interface FaqPage {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: FaqQuestion[];
}

const qnaData: QnaItem[] = [
  // 1. 연봉 및 수당
  {
    category: "연봉 및 수당",
    question: "연봉에 포함되는 수당과 안되는 수당은 무엇인가요?",
    answer: {
      conclusion:
        "통상임금에 포함되는 정기/일률적 수당은 연봉의 일부지만, 성과급 등은 제외됩니다. 비과세 수당은 세금을 떼지 않아 실수령액을 높여주는 핵심 요소입니다.",
      details: [
        "<strong>통상임금:</strong> 연장/야간/휴일수당, 퇴직금, 해고예고수당 등을 계산하는 기준입니다. 기본급, 직무수당, 직책수당처럼 '정기적, 일률적, 고정적'으로 지급되는 항목이 포함됩니다.",
        "<strong>비과세 수당:</strong> 세금을 부과하지 않는 소득입니다. 월 20만원까지의 식대, 본인 차량을 업무에 사용할 때 받는 월 20만원까지의 차량유지비, 육아휴직 급여 등이 대표적입니다.",
        "<strong>평균임금:</strong> 퇴직금, 실업급여 등을 계산하는 기준으로, 퇴사 직전 3개월간 받은 모든 임금(성과급, 상여금, 수당 포함)을 평균 낸 금액입니다. 보통 통상임금보다 높습니다.",
      ],
      tip: "연봉 협상 시 총액만큼이나 '비과세 수당' 항목을 꼼꼼히 확인하세요. 같은 연봉이라도 비과세 항목이 많을수록 실수령액은 더 높아집니다.",
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
        "<strong>임금 유지 (Dream Case):</strong> 주 5일 근무와 동일한 연봉을 받으므로, 실질적인 시간당 임금이 25% 인상되는 효과입니다. (주 40시간 → 32시간)",
        "<strong>비례 삭감 (Realistic Case):</strong> 근로시간이 20% 줄어들면, 연봉도 20% 삭감될 수 있습니다. (예: 5,000만원 → 4,000만원). 이 경우 시간당 임금은 동일하게 유지됩니다.",
        "<strong>세금 변화:</strong> 연봉이 삭감되면 소득세율 구간이 낮아져 세금 부담은 줄어들지만, 실수령액 감소는 불가피합니다. 정확한 계산이 필요합니다.",
      ],
      tip: "주 4일제 전환 시, 변경된 근로 조건이 명시된 근로계약서를 반드시 다시 작성하여 법적인 권리를 확보해야 합니다.",
      action: {
        text: "주 4일제 연봉 변화 심층 분석 가이드",
        href: "/guides/4-day-week",
      },
    },
  },
  {
    category: "연봉 및 수당",
    question: "주휴수당, 정확한 지급 조건이 궁금해요.",
    answer: {
      conclusion:
        "주 15시간 이상 일하고, 결근 없이 개근했으며, 다음 주에도 일할 예정이라면 아르바이트생이라도 누구나 받을 수 있는 법적 권리입니다.",
      details: [
        "<strong>조건 1 (소정근로시간):</strong> 근로계약서상 1주일에 15시간 이상 일하기로 약속해야 합니다. 연장근로는 포함되지 않습니다.",
        "<strong>조건 2 (개근):</strong> 일하기로 한 날에 모두 출근해야 합니다. 지각이나 조퇴는 결근이 아니지만, 무단결근 시 그 주의 주휴수당은 발생하지 않습니다.",
        "<strong>조건 3 (계속 근로):</strong> 주휴수당은 다음 주의 근로를 전제로 발생하므로, 마지막 근무를 마친 주에는 일반적으로 주휴수당이 발생하지 않습니다.",
      ],
      tip: "주휴수당 미지급은 명백한 임금체불입니다. 고용노동부를 통해 진정을 제기하여 권리를 찾을 수 있습니다.",
      action: {
        text: "주휴수당 계산법 완벽 가이드 보기",
        href: "/guides/holiday-allowance",
      },
    },
  },
  // 4대보험 및 세금
  {
    category: "4대보험 및 세금",
    question: "성과급(상여금)을 받았는데 세금을 너무 많이 떼는 것 같아요.",
    answer: {
      conclusion:
        "성과급이 지급되는 달에 소득이 일시적으로 급증하면서 높은 세율 구간(누진세)이 적용되어 세금이 많아 보이는 것입니다. 연말정산을 통해 일부 환급받을 수 있습니다.",
      details: [
        "<strong>누진세 구조:</strong> 소득이 높을수록 더 높은 세율을 적용하는 구조 때문에, 성과급이 더해진 달에는 평소보다 훨씬 높은 세율(예: 15% → 24%)이 적용될 수 있습니다.",
        "<strong>원천징수 방식:</strong> 회사는 간편 계산 방식에 따라 높은 세율로 세금을 우선 떼고, 다음 해 연말정산 때 실제 내야 할 세금을 최종 정산합니다.",
        "<strong>절세 전략:</strong> 성과급을 받은 해에는 IRP/연금저축 납입 한도를 채워 소득공제를 극대화하는 것이 '세금 폭탄'을 막는 가장 효과적인 방법입니다.",
      ],
      tip: "성과급 지급 시기를 분산(예: 연 2회)하여 특정 월의 소득 급증을 막는 것도 절세에 도움이 될 수 있습니다.",
      action: {
        text: "성과급 세금 폭탄, 피하는 법 완벽 가이드",
        href: "/guides/bonus-tax",
      },
    },
  },
  {
    category: "4대보험 및 세금",
    question: "연말정산, 소득공제와 세액공제는 뭐가 다른가요?",
    answer: {
      conclusion:
        "소득공제는 '세금을 매기는 기준(과세표준)'을 줄여주는 것이고, 세액공제는 '계산된 세금 자체'를 직접 깎아주는 훨씬 강력한 혜택입니다.",
      details: [
        "<strong>소득공제 (밭 크기 줄이기):</strong> 과세 대상 소득 자체를 줄여줍니다. 연봉이 높아 높은 세율을 적용받는 사람일수록 절세 효과가 큽니다. (예: 신용카드, 주택청약저축)",
        "<strong>세액공제 (세금 직접 할인):</strong> 산출된 세금에서 직접 금액을 차감합니다. 소득 수준과 관계없이 공제 혜택이 일정하여 저연봉자에게 더 유리할 수 있습니다. (예: 월세, 의료비, 연금계좌)",
        "<strong>우선순위:</strong> 세금 자체를 깎아주는 '세액공제' 항목(특히 연금계좌, 월세액 공제)을 최우선으로 챙기는 것이 절세에 가장 효과적입니다.",
      ],
      tip: "월세 세액공제, 안경 구입비, 교복 구입비 등은 국세청 간소화 서비스에서 누락되는 경우가 많으니 증빙서류를 직접 챙겨야 합니다.",
      action: {
        text: "연말정산 A to Z, 13월의 월급 찾는 법",
        href: "/guides/year-end-tax-settlement",
      },
    },
  },
  // 퇴직 및 이직
  {
    category: "퇴직 및 이직",
    question: "퇴직금은 어떻게 계산되고, 세금은 얼마나 떼나요?",
    answer: {
      conclusion:
        "퇴직금은 '1일 평균임금 × 30일 × (총 재직일수 / 365)'로 계산됩니다. 퇴직소득세는 장기근속을 우대하는 복잡한 공제 구조 덕분에 일반 소득보다 세금 부담이 훨씬 적습니다.",
      details: [
        "<strong>1일 평균임금:</strong> 퇴사일 이전 3개월간 받은 임금 총액(기본급, 수당, 상여금 포함)을 그 기간의 총일수로 나눈 금액입니다.",
        "<strong>퇴직소득세 계산 4단계:</strong> ①환산급여 계산 → ②과세표준 계산 → ③환산산출세액 계산 → ④최종 세액 결정의 복잡한 과정을 거칩니다.",
        "<strong>핵심 공제:</strong> '근속연수공제'(오래 일할수록 UP)와 '환산급여공제'(소득이 낮을수록 UP)라는 두 가지 강력한 공제 덕분에 실제 세금 부담이 크게 줄어듭니다.",
      ],
      tip: "퇴직금을 IRP 계좌로 이전하면 퇴직소득세를 당장 내지 않고, 연금으로 수령 시 30~40% 감면된 연금소득세(3.3%~5.5%)를 적용받아 절세 효과를 극대화할 수 있습니다.",
      action: {
        text: "퇴직금 세금, 40% 아끼는 공제의 비밀",
        href: "/guides/severance-tax",
      },
    },
  },
  {
    category: "퇴직 및 이직",
    question: "이직할 때 연봉, 얼마나 올려 불러야 할까요?",
    answer: {
      conclusion:
        "정답은 없지만, 새로운 환경 적응에 대한 리스크와 기회비용을 고려하여 현재 연봉의 '최소 15~20%' 이상을 목표로 하는 것이 합리적입니다.",
      details: [
        "<strong>20% 목표의 근거:</strong> ①새로운 조직 적응 리스크 비용, ②현 직장 잔류 시 얻을 수 있었던 기회비용, ③미래 1~2년 간의 예상 연봉 인상분을 미리 반영한다는 개념이 포함되어 있습니다.",
        "<strong>객관적 근거 제시:</strong> '열심히 하겠다'는 다짐보다, 자신의 시장 가치(Market Price)와 과거의 성과를 '숫자'로 증명하는 것이 협상 성공의 핵심입니다.",
        "<strong>협상 전략:</strong> 희망 연봉을 먼저 말하기보다, 회사의 연봉 테이블과 규정을 존중한다는 자세로 상대방이 먼저 제안하도록 유도하는 것이 유리합니다.",
      ],
      tip: "최종 오퍼를 받았다면 계약 연봉뿐만 아니라 성과급, 복지 혜택까지 모두 고려한 '세후 실수령액'을 비교하여 최종 결정을 내리는 것이 중요합니다.",
      action: {
        text: "연봉 협상 실전 전략 가이드 보기",
        href: "/guides/salary-negotiation",
      },
    },
  },
  {
    category: "퇴직 및 이직",
    question: "실업급여는 누가, 어떻게 받을 수 있나요?",
    answer: {
      conclusion:
        "고용보험에 180일 이상 가입한 근로자가 비자발적인 사유로 퇴사하고, 재취업 의사가 있을 때 받을 수 있는 사회보험 급여입니다.",
      details: [
        "<strong>핵심 조건 1 (가입 기간):</strong> 퇴사일 이전 18개월 동안 고용보험 가입 기간(유급휴일 포함)이 총 180일 이상이어야 합니다.",
        "<strong>핵심 조건 2 (비자발적 퇴사):</strong> 경영상 해고, 권고사직, 계약 만료 등이 대표적입니다. 단, 통근 곤란(왕복 3시간 이상), 직장 내 괴롭힘 등 '정당한 사유'가 있는 자발적 퇴사도 예외적으로 인정될 수 있습니다.",
        "<strong>지급액 및 기간:</strong> 퇴직 전 3개월 평균임금의 60% 수준이며, 나이와 고용보험 가입 기간에 따라 120일에서 최대 270일까지 지급됩니다.",
      ],
      tip: "실업급여는 퇴사 후 1년 이내에 신청해야 합니다. 늦게 신청할수록 받을 수 있는 총액이 줄어들 수 있으니 가급적 빨리 신청하는 것이 좋습니다.",
      action: {
        text: "실업급여 A to Z 완벽 정리 가이드",
        href: "/guides/unemployment-benefits",
      },
    },
  },
  // 재테크
  {
    category: "재테크",
    question: "첫 월급, 재테크 어떻게 시작해야 할지 막막해요.",
    answer: {
      conclusion:
        "가장 먼저 할 일은 '선저축 후지출' 시스템을 만들고, 국가가 보장하는 최고의 절세 상품인 '연금저축펀드'에 가입하여 S&P 500 ETF를 매수하는 것입니다.",
      details: [
        "<strong>1. 강제 저축 시스템:</strong> 월급날, 저축할 금액이 다른 통장(예: CMA)으로 자동이체되도록 설정하여 '남는 돈'이 아닌 '정한 돈'을 저축하는 습관을 만드세요.",
        "<strong>2. 연금저축펀드 활용:</strong> 연 600만원까지 납입 시, 연말정산에서 최대 99만원을 현금으로 돌려받습니다. 투자 지식이 없어도 연 16.5%의 확정 수익을 얻는 것과 같습니다.",
        "<strong>3. 첫 투자처, S&P 500 ETF:</strong> 연금저축펀드 계좌에서 미국 우량주 500개에 분산 투자하는 S&P 500 ETF를 매달 꾸준히 매수하는 것만으로도, 장기적으로 안정적인 복리 효과를 누릴 수 있습니다.",
      ],
      tip: "월급의 3~6배에 해당하는 금액을 언제든 인출할 수 있는 파킹통장 등에 '비상금'으로 예치하여 예상치 못한 리스크에 대비하는 것이 장기 투자를 지키는 길입니다.",
      action: {
        text: "사회초년생 재테크 완벽 가이드 보기",
        href: "/guides/first-job-investment",
      },
    },
  },
  {
    category: "재테크",
    question: "ISA 계좌, 만능 통장이라는데 꼭 만들어야 하나요?",
    answer: {
      conclusion:
        "네, 절세를 생각하는 모든 투자자에게 필수적인 '만능 절세 계좌'입니다. 하나의 계좌에서 예금, 펀드, ETF 등 다양한 상품에 투자하고, 발생한 수익에 대해 파격적인 비과세 혜택을 받을 수 있습니다.",
      details: [
        "<strong>핵심 혜택 (비과세):</strong> 계좌에서 발생한 이익과 손실을 합산(손익통산)한 후, 순이익 200만원(서민형 400만원)까지는 세금을 한 푼도 내지 않습니다. 초과분은 9.9% 저율 분리과세됩니다.",
        "<strong>납입 한도:</strong> 연간 2,000만원, 5년간 총 1억원까지 납입할 수 있으며, 의무 가입 기간은 3년입니다.",
        "<strong>2025년 개편 기대:</strong> 정부의 '금융투자소득세 폐지' 및 'ISA 지원 강화' 정책에 따라 비과세 한도와 납입 한도가 대폭 상향될 가능성이 매우 높습니다.",
      ],
      tip: "만기된 ISA 계좌의 자금을 60일 이내에 연금계좌(연금저축/IRP)로 이전하면, 이전 금액의 10%(최대 300만원)를 추가로 세액공제 받을 수 있습니다. 최고의 절세 파이프라인입니다.",
      action: {
        text: "연봉 1억을 위한 절세 전략 가이드",
        href: "/guides/road-to-100m-part1-tax",
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

const faqStructuredData: FaqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: qnaData.map((item: QnaItem) => ({
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
      <main className="w-full bg-background">
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
                              {item.answer.tip && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                                  <p className="!m-0 text-sm">
                                    <span className="font-bold text-yellow-600">
                                      💡 Moneysalary&apos;s Tip:
                                    </span>{" "}
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                      {item.answer.tip}
                                    </span>
                                  </p>
                                </div>
                              )}
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
