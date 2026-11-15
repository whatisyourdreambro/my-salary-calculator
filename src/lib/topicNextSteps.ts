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
  // 2026-11-15 SEASONA(감사 calc ideas[6]) — 시즌·퇴직 계산기 6곳의 다음 할 일. 제목·설명은 각 목적지 페이지의 메타 설명 범위 안에서만 쓴다.
  '/calc/january-bonus': { title: '13월의 월급 시뮬레이터', description: '신용카드·IRP·의료비 공제를 넣어 연말정산 환급·추가 납부 예상액을 확인하세요.' },
  '/year-end-tax-2027': { title: '연말정산 2027 총정리', description: '2026년 귀속 연말정산 일정과 계산기·체크리스트를 단계별 순서로 확인하세요.' },
  '/calc/bonus-calculators': { title: '회사별 성과급 계산기 모음', description: '삼성전자·SK하이닉스·현대차 등 회사별 지급 방식에 맞춘 성과급 계산기를 고르세요.' },
  '/unemployment-benefit': { title: '실업급여 계산기', description: '퇴사 뒤 받을 구직급여의 예상 금액과 지급 일수, 신청 조건을 확인하세요.' },
  '/tools/finance/irp': { title: 'IRP·연금저축 세액공제 계산기', description: '연금계좌 납입액에 따른 세액공제 예상액을 연 900만원 한도 기준으로 계산하세요.' },
  '/tools/finance/severance': { title: '퇴직금 세금 계산기', description: '근속연수공제와 환산급여공제를 반영해 퇴직소득세를 계산하고 IRP 이연 효과도 확인하세요.' },
  '/calc/annual-leave-days': { title: '연차 개수 계산기', description: '입사일 기준으로 연도별로 생기는 연차 일수와 회계연도 방식의 차이를 확인하세요.' },
  '/calc/ordinary-wage': { title: '통상임금 계산기', description: '기본급·고정수당·정기상여로 시간급 통상임금과 연차수당 등 파급액을 계산하세요.' },
  '/calc/severance-vs-pension': { title: '퇴직금 vs 퇴직연금 비교', description: 'DB형·DC형과 IRP 일시·연금 수령의 세금과 실수령액을 같은 조건으로 비교하세요.' },
  '/calc/voluntary-retirement': { title: '희망퇴직 위로금 실수령 계산기', description: '위로금과 법정퇴직금을 합산한 퇴직소득세와 세후 실수령액을 계산하세요.' },
  '/year-end-tax': { title: '연말정산 환급금 계산기', description: '총급여와 카드·연금계좌·기부금을 넣어 예상 환급액이나 추가 납부액을 계산하세요.' },
  '/calc/dependent-check': { title: '부양가족 인적공제 판정기', description: '부모님·형제자매가 기본공제 150만원 대상인지 나이·소득·동거 기준으로 확인하세요.' },
  // 2026-11-15 SEASONA(감사 lib ideas[3]) — 이번 연말정산 시즌 목적지.
  '/year-end-tax-checklist': { title: '연말정산 체크리스트', description: '12월 31일 전에 챙길 공제 항목을 신용카드·연금저축·기부금·월세 등 분야별로 점검하세요.' },
  '/social-insurance-rates-2027': { title: '2027 4대보험 요율표', description: '국민연금 10.0%(근로자 5.0%) 등 2027년 요율로 월급에서 빠지는 보험료를 확인하세요.' },
  '/table/2027/monthly': { title: '2027 월급 실수령액 표', description: '2027년 국민연금 요율 인상을 반영한 월급 구간별 세후 수령액을 미리 확인하세요.' },
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
  // 2026-11-15 SEASONA(감사 lib ideas[3]): 11~2월에 첫 카드가 끝난 추석 시즌으로 가던 것을 이번 연말정산 쪽으로 — 상자는 이 쪽의
  // 마지막 광고(MultiplexAd) 뒤라 광고 위 변화 없음. 화면 수정일(PublishedMeta 2026-10-19, 광고 위)은 그대로 둔다.
  '/year-end-tax-settlement-2026': ['/year-end-tax-2027', '/year-end-tax-checklist', '/money-check'],
  '/chuseok-bonus-2026': ['/calc/bonus-home-plan', '/year-end-tax-settlement-2026', '/tips'],
  '/calc/samsung-bonus': ['/calc/bonus-home-plan', '/year-end-tax-settlement-2026'],
  // 2026-11-15 SEASONA(감사 components ideas[6]): SK하이닉스 성과급 계산기 — calc/layout 의 모든 광고 뒤. 목적지 제목·설명은 위 SEASONA 묶음 것을 쓴다.
  '/calc/sk-hynix-bonus': ['/calc/bonus-home-plan', '/calc/bonus-calculators', '/year-end-tax-2027'],
  // 2026-11-15 SEASONA(감사 calc ideas[6]): calc/layout 이 모든 광고(InArticleAd·쿠팡·HomeTopAd) 뒤에 그리는 상자 — 광고 위 변화 없음.
  // 키를 더하면 PAGE_LINK_REVIEW_PATHS 에도 들어가 사이트맵 날짜 하한이 2026-10-19 가 된다 — 통합 원장 단계가 실제 수정일(2026-11-15)로 올린다.
  '/calc/year-end-bonus-tax': ['/calc/january-bonus', '/year-end-tax-2027', '/calc/bonus-calculators'],
  '/calc/year-end-bonus': ['/calc/january-bonus', '/year-end-tax-2027', '/calc/bonus-calculators'],
  '/calc/voluntary-retirement': ['/unemployment-benefit', '/tools/finance/irp', '/calc/severance-vs-pension'],
  '/calc/vacation-pay': ['/calc/annual-leave-days', '/calc/ordinary-wage', '/tools/finance/severance'],
  '/calc/severance-vs-pension': ['/tools/finance/severance', '/tools/finance/irp', '/calc/voluntary-retirement'],
  '/calc/smb-income-tax-break': ['/year-end-tax-2027', '/year-end-tax', '/calc/dependent-check'],
  '/civil-servant-pay-2027': ['/public-institutions', '/hub/career'],
  // 2026-11-15 SEASONA(감사 lib ideas[3]): 절세 허브 — hub/[id] 쪽의 마지막 광고(MultiplexAd) 뒤 상자. 허브 본문 목록에 없는 시즌 쪽만.
  '/hub/tax-saving': ['/year-end-tax-2027', '/social-insurance-rates-2027', '/table/2027/monthly'],
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
