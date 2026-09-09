// 홈페이지 FAQ·HowTo 원본 데이터.
// JSON-LD(faqLd/howToLd)와 화면에 보이는 SEO FAQ 섹션이 같은 소스를 쓰도록 분리.
import { SALARY_MODEL_2026 } from "./salaryModelContent";

export const HOME_META_TITLE = "2026 연봉 계산기 | 세후 월급·4대보험 공제액 — 머니샐러리";
export const HOME_META_DESCRIPTION =
  "연봉·월급과 비과세·부양가족 조건을 입력해 예상 실수령액과 4대보험·소득세 공제 내역을 확인하세요. 연간 세액 추정을 월로 환산한 참고용 계산이며, 실제 급여와 차이가 날 수 있습니다.";

export interface HomeFaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: "연봉 계산기로 무엇을 계산할 수 있나요?",
    answer:
      "세전 연봉 또는 월급과 비과세·부양가족·자녀 조건을 입력하면 2026년 계산 모델의 예상 월 실수령액을 확인할 수 있습니다. 국민연금·건강보험·장기요양보험·고용보험과 소득세·지방소득세 공제 내역을 함께 보여 줍니다.",
  },
  {
    question: "연봉 실수령액과 세후 월급은 어떻게 다른가요?",
    answer:
      `연봉 실수령액은 연간 수령액, 세후 월급은 월별 수령액을 뜻합니다. 이 계산기는 연봉을 12개월로 나눠 예상 월 수령액을 구하므로 성과급 지급 시기나 실제 월 급여와 차이가 날 수 있습니다. 연봉 5,000만원은 월 약 352만원입니다 (${SALARY_MODEL_2026.defaultConditions} 기준).`,
  },
  {
    question: "4대보험 요율은 얼마인가요?",
    answer:
      "2026년 기준 근로자 부담 4대보험 요율: 국민연금 4.75%, 건강보험 3.595%, 장기요양보험(건강보험료의 13.14%), 고용보험 0.9%입니다. 회사가 동일하거나 더 높은 비율을 추가로 부담합니다.",
  },
  {
    question: "머니샐러리 연봉 계산기는 얼마나 정확한가요?",
    answer:
      `2026년 보험료율과 입력 조건을 적용한 추정 모델입니다. ${SALARY_MODEL_2026.incomeTaxMethod} ${SALARY_MODEL_2026.limitation} 의료비·교육비·연금저축 등 개별 공제와 보험료 정산을 모두 반영한 결과는 아닙니다.`,
  },
  {
    question: "연봉 3000만원 실수령액은 얼마인가요?",
    answer:
      `연봉 3,000만원의 2026년 예상 월 실수령액은 약 223만원입니다 (${SALARY_MODEL_2026.defaultConditions} 기준). 자세한 내역은 /salary/30000000 페이지에서 확인하세요.`,
  },
];

export const HOME_HOWTO_DATA = {
  name: "연봉 실수령액 계산하는 방법 (2026년)",
  description:
    "연봉과 비과세·가족 조건으로 2026년 예상 월 실수령액과 공제 내역을 확인합니다.",
  totalTime: "PT1M",
  steps: [
    {
      name: "연봉 입력",
      text: "세전 연봉 또는 월급 기준을 선택하고, 비과세 수당을 포함한 금액을 입력하세요.",
    },
    {
      name: "개인 공제 설정",
      text: "월 비과세액(기본 20만원), 본인 포함 부양가족 수, 8세~20세 공제 대상 자녀 수를 설정하세요. 자녀는 부양가족 수에도 포함하세요.",
    },
    {
      name: "결과 확인",
      text: `결과 확인하기를 누르면 예상 월 실수령액과 보험료·소득세 공제 내역이 표시됩니다. ${SALARY_MODEL_2026.incomeTaxMethod} 실제 급여명세서와 함께 비교하세요.`,
    },
  ],
};

// 인기 연봉 구간 — 홈에서 /salary/[amount] 동적 페이지로 내부링크 (검색량 높은 구간)
export const POPULAR_SALARY_LINKS: { label: string; amount: number }[] = [
  { label: "연봉 2,400만원", amount: 24000000 },
  { label: "연봉 3,000만원", amount: 30000000 },
  { label: "연봉 3,600만원", amount: 36000000 },
  { label: "연봉 4,000만원", amount: 40000000 },
  { label: "연봉 4,500만원", amount: 45000000 },
  { label: "연봉 5,000만원", amount: 50000000 },
  { label: "연봉 6,000만원", amount: 60000000 },
  { label: "연봉 7,000만원", amount: 70000000 },
  { label: "연봉 8,000만원", amount: 80000000 },
  { label: "연봉 1억원", amount: 100000000 },
];
