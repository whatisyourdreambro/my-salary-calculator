export type TopicLink = { href: string; title: string; description: string };

// Each destination explains a concrete next task. Only explicitly reviewed source pages render this block.
const destinations: Record<string, Omit<TopicLink, 'href'>> = {
  '/money-check': { title: '내 돈 체크', description: '소득·세금·대출 중 지금 확인할 항목을 체크리스트에서 골라보세요.' },
  '/tips': { title: '월급 관리와 절약 팁', description: '계산한 여유 자금을 생활 속 지출 관리로 연결해보세요.' },
  '/hub': { title: '주제별 종합 가이드', description: '계산 결과를 이해하는 데 필요한 제도와 선택 기준을 주제별로 살펴보세요.' },
  '/calc/2026-year': { title: '연봉에서 실수령액 계산', description: '연봉과 부양 조건을 넣어 공제 후 월 예산의 출발점을 확인하세요.' },
  '/hub/career': { title: '이직·연봉 협상 가이드', description: '실수령액 차이와 직무별 정보를 함께 보고 이직 조건을 비교하세요.' },
  '/hub/fire': { title: '은퇴·경제적 자유 가이드', description: '저축률과 생활비 가정을 바꿔 장기 자산 계획을 세워보세요.' },
  '/hub/real-estate': { title: '내 집 마련 가이드', description: '자기 자금과 대출 상환 여력을 함께 확인하는 순서를 살펴보세요.' },
  '/calc/bonus-home-plan': { title: '성과급과 내 집 마련 계획', description: '예상 성과급을 주택 자기 자금에 보탰을 때의 시나리오를 비교하세요.' },
  '/basic-pension-2026': { title: '2026 기초연금 안내', description: '노후 소득을 점검할 때 기초연금의 대상과 소득인정액 기준도 확인하세요.' },
  '/health-checkup-2026': { title: '2026 국가건강검진 안내', description: '건강보험과 함께 챙길 국가건강검진의 대상·예약 절차를 확인하세요.' },
  '/health-insurance-2026': { title: '2026 건강보험료 안내', description: '가계 예산에서 빠져나가는 건강보험료의 기준과 부담을 살펴보세요.' },
  '/year-end-tax-settlement-2026': { title: '2026 연말정산 준비', description: '급여·상여금과 공제 항목을 정리해 연말정산 준비에 연결하세요.' },
  '/chuseok-bonus-2026': { title: '명절 상여금의 세금과 지급 기준', description: '명절 상여금을 받았을 때 급여·세금 처리와 사용 계획을 함께 확인하세요.' },
  '/public-institutions': { title: '공공기관 연봉 비교', description: '공무원 보수와 구분해 공공기관의 공시 연봉·채용 조건을 비교하세요.' },
  '/civil-servant-pay-2027': { title: '2027 공무원 봉급 전망', description: '확정 봉급표와 전망치를 구분하고 공직 소득 계획의 가정을 확인하세요.' },
  '/insights': { title: '연봉 데이터 인사이트', description: '개인 계산 결과를 직무·기업·지역별 연봉 자료와 비교해보세요.' },
  '/terms': { title: '계산 결과의 이용 기준', description: '참고용 계산의 범위와 이용 조건을 확인한 뒤 실제 급여·금융 계약과 대조하세요.' },
  '/tools/finance': { title: '금융·세금 도구 모음', description: '복리·상여금·퇴직금 등 다음 계산에 필요한 금융 도구를 고르세요.' },
  '/tools/life': { title: '생활비 계산 도구 모음', description: '구독료·유류비·공동 지출을 각각 계산해 생활 예산에 반영하세요.' },
  '/tools/math': { title: '비율·숫자 도구 모음', description: '금액의 비율을 직접 검산하거나 조건에 맞는 숫자를 생성할 수 있습니다.' },
  '/tools/real-estate': { title: '주택·대출 도구 모음', description: 'LTV·DSR·취득세를 함께 계산해 주택 구입 자금의 여러 조건을 확인하세요.' },
};

export const TOPIC_NEXT_STEPS: Record<string, readonly string[]> = {
  '/money-check': ['/calc/2026-year', '/tips', '/hub', '/terms'],
  '/tips': ['/money-check', '/calc/2026-year', '/hub', '/hub/fire'],
  '/hub': ['/money-check', '/tips', '/calc/2026-year'],
  '/calc/2026-year': ['/money-check', '/tips', '/hub', '/hub/career'],
  '/calc/bonus-home-plan': ['/hub/real-estate', '/hub/fire', '/money-check'],
  '/hub/real-estate': ['/calc/bonus-home-plan', '/tools/real-estate', '/hub/fire'],
  '/hub/fire': ['/basic-pension-2026', '/health-checkup-2026', '/health-insurance-2026'],
  '/hub/career': ['/insights', '/public-institutions', '/civil-servant-pay-2027'],
  '/insights': ['/hub/career', '/hub/real-estate', '/calc/2026-year'],
  '/basic-pension-2026': ['/health-checkup-2026', '/health-insurance-2026', '/hub/fire'],
  '/health-checkup-2026': ['/basic-pension-2026', '/health-insurance-2026'],
  '/health-insurance-2026': ['/health-checkup-2026', '/basic-pension-2026', '/year-end-tax-settlement-2026'],
  '/year-end-tax-settlement-2026': ['/chuseok-bonus-2026', '/money-check', '/tips'],
  '/chuseok-bonus-2026': ['/calc/bonus-home-plan', '/year-end-tax-settlement-2026', '/tips'],
  '/calc/samsung-bonus': ['/calc/bonus-home-plan', '/year-end-tax-settlement-2026'],
  '/civil-servant-pay-2027': ['/public-institutions', '/hub/career'],
  '/public-institutions': ['/civil-servant-pay-2027', '/insights', '/hub/career'],
  '/tools/finance/compound': ['/tools/finance', '/tools/math', '/hub/fire'],
  '/tools/finance/bonus': ['/tools/finance', '/calc/bonus-home-plan'],
  '/tools/finance/severance': ['/tools/finance', '/hub/career'],
  '/tools/life/dutch-pay': ['/tools/life', '/tips'],
  '/tools/life/fuel-cost': ['/tools/life', '/tips'],
  '/tools/life/subscription': ['/tools/life', '/money-check'],
  '/tools/math/percent': ['/tools/math', '/tools/finance'],
  '/tools/math/number-gen': ['/tools/math'],
  '/tools/real-estate/dsr': ['/tools/real-estate', '/hub/real-estate'],
  '/tools/real-estate/ltv': ['/tools/real-estate', '/hub/real-estate'],
  '/tools/real-estate/acquisition-tax': ['/tools/real-estate', '/hub/real-estate'],
};

export function getTopicNextSteps(path: string): TopicLink[] {
  return (TOPIC_NEXT_STEPS[path] ?? []).map(href => ({ href, ...destinations[href] }));
}
