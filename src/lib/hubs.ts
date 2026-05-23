// src/lib/hubs.ts
//
// 주제별 허브(필러) 페이지 데이터.
// 흩어진 계산기·도구·시즌 페이지를 주제별로 묶어 내부 링크 허브를 형성.
// 각 허브는 /hub/[id] 라우트로 정적 생성된다.
// 링크는 모두 실제 존재하는 경로만 사용 (계산기 slug·확인된 도구/페이지 경로).

export interface HubLink {
  label: string;
  href: string;
  desc: string;
}

export interface HubSection {
  heading: string;
  links: HubLink[];
}

export interface Hub {
  /** /hub/[id] 의 id */
  id: string;
  /** 페이지 제목 / H1 */
  title: string;
  /** 짧은 부제 */
  tagline: string;
  /** 필러 본문 문단 */
  intro: string[];
  keywords: string[];
  sections: HubSection[];
}

export const hubs: Hub[] = [
  {
    id: "fire",
    title: "FIRE·조기은퇴 완벽 가이드 — 경제적 자유 로드맵",
    tagline: "은퇴 자산 목표부터 복리 시뮬레이션까지 한 곳에서",
    intro: [
      "FIRE(Financial Independence, Retire Early)는 충분한 자산을 모아 노동 소득에 의존하지 않는 상태를 말합니다. 핵심은 '연 생활비의 25~30배'를 모으면 매년 자산의 3~4%만 인출해도 원금이 유지된다는 안전인출률 개념입니다. 한국은 물가·의료비를 고려해 4%보다 보수적인 3~3.5% 룰을 권장합니다.",
      "FIRE의 출발점은 두 가지 숫자입니다. 첫째, 은퇴 후 월 생활비 — 이것에 12를 곱하고 안전인출률로 나누면 목표 자산이 나옵니다. 둘째, 현재 저축 여력과 기대 수익률 — 이것으로 목표 도달까지 걸리는 시간을 계산할 수 있습니다. 아래 계산기로 두 숫자를 모두 확인해 보세요.",
      "조기은퇴의 진짜 엔진은 복리입니다. 같은 금액도 일찍 시작할수록, 수수료가 낮을수록, 인플레이션을 이긴 실질 수익률이 높을수록 자산은 기하급수적으로 커집니다.",
    ],
    keywords: ["FIRE", "조기은퇴", "경제적 자유", "은퇴 자산 계산", "파이어족", "안전인출률"],
    sections: [
      {
        heading: "1단계 — FIRE 목표 세우기",
        links: [
          { label: "FIRE 계산기", href: "/fire-calculator", desc: "은퇴 시점·필요 자산 종합 시뮬레이션" },
          { label: "FIRE 목표 자산", href: "/calc/fire-target", desc: "월 생활비로 은퇴 목표 자산 역산" },
          { label: "저축 목표 도달 시간", href: "/calc/savings-goal-time", desc: "월 저축액으로 목표까지 걸리는 기간" },
        ],
      },
      {
        heading: "2단계 — 복리의 힘 체험",
        links: [
          { label: "복리 계산기", href: "/calc/compound-interest-quick", desc: "원금+적립+수익률로 미래 자산 계산" },
          { label: "72의 법칙", href: "/calc/rule-of-72-quick", desc: "자산이 2배 되는 데 걸리는 시간" },
          { label: "적립식 투자 시뮬", href: "/calc/dollar-cost-average", desc: "매월 같은 금액 적립 시 자산 추정" },
          { label: "복리 이자 계산기", href: "/tools/finance/compound", desc: "예치·적립 복리 상세 계산" },
        ],
      },
      {
        heading: "3단계 — 수익률·물가 점검",
        links: [
          { label: "연평균 수익률(CAGR)", href: "/calc/cagr-quick", desc: "초기·최종 자산으로 연평균 수익률" },
          { label: "실질 수익률", href: "/calc/real-return-quick", desc: "인플레이션 차감 후 진짜 수익률" },
          { label: "인플레이션 영향", href: "/calc/inflation-impact-quick", desc: "물가가 자산 구매력에 미치는 영향" },
        ],
      },
      {
        heading: "다음 단계",
        links: [
          { label: "IRP 계산기", href: "/tools/finance/irp", desc: "절세하며 은퇴 자산 적립" },
          { label: "금융 가이드", href: "/guides", desc: "재테크·투자 심화 가이드 글" },
          { label: "금융 Q&A", href: "/qna", desc: "사회초년생·재테크 자주 묻는 질문" },
        ],
      },
    ],
  },
  {
    id: "invest",
    title: "주식·ETF 투자 완벽 가이드 — 수익률·세금 한눈에",
    tagline: "투자 손익·배당·세금 계산을 한 곳에서",
    intro: [
      "직장인 투자의 시작은 '내 손익을 정확히 아는 것'입니다. 매수가·매도가·수량만으로 손익과 수익률이 나오고, 장기 투자라면 연평균 수익률(CAGR)로 성과를 객관적으로 평가할 수 있습니다.",
      "투자에서 의외로 자주 놓치는 것이 세금과 수수료입니다. 국내 상장 ETF·해외주식 양도차익, 배당소득, 예금 이자에는 각각 다른 세율이 적용되며, 운용수수료 0.1%p 차이도 30년 누적되면 수천만 원의 차이를 만듭니다.",
      "아래 도구로 손익·세금·수수료를 모두 점검하고, 자산배분으로 리스크를 관리하세요.",
    ],
    keywords: ["주식 투자", "ETF 투자", "배당주", "주식 양도세", "투자 수익률", "자산배분"],
    sections: [
      {
        heading: "투자 손익 계산",
        links: [
          { label: "주식 손익 계산", href: "/calc/stock-pl-quick", desc: "매수·매도가로 손익과 수익률" },
          { label: "연평균 수익률(CAGR)", href: "/calc/cagr-quick", desc: "장기 투자 성과 객관 평가" },
          { label: "배당 수익률", href: "/calc/dividend-yield-quick", desc: "주가 대비 배당 수익률 계산" },
        ],
      },
      {
        heading: "투자 세금",
        links: [
          { label: "주식 양도세", href: "/calc/stock-capital-gains-quick", desc: "해외주식 양도차익 22% 계산" },
          { label: "배당소득세", href: "/calc/dividend-tax-quick", desc: "배당금 15.4% 분리과세 계산" },
          { label: "주식 세금 계산기", href: "/tools/finance/stock-tax", desc: "주식 양도소득세 상세 계산" },
          { label: "이자소득세", href: "/calc/interest-tax-quick", desc: "예금 이자 원천징수 후 실수령" },
        ],
      },
      {
        heading: "장기 투자 전략",
        links: [
          { label: "ETF 수수료 영향", href: "/calc/etf-fee-impact", desc: "수수료 차이의 30년 누적 손실" },
          { label: "포트폴리오 배분", href: "/calc/portfolio-allocation", desc: "주식·채권·현금 비중별 기대수익" },
          { label: "채권 수익률", href: "/calc/bond-yield-quick", desc: "액면가·쿠폰으로 만기수익률" },
          { label: "복리 계산기", href: "/calc/compound-interest-quick", desc: "장기 적립 투자 미래 자산" },
        ],
      },
      {
        heading: "더 알아보기",
        links: [
          { label: "금융 가이드", href: "/guides", desc: "주식·재테크 심화 가이드" },
          { label: "금융 용어 사전", href: "/glossary", desc: "투자 용어를 쉬운 비유로 설명" },
          { label: "FIRE 가이드", href: "/fire-calculator", desc: "투자로 경제적 자유 달성하기" },
        ],
      },
    ],
  },
  {
    id: "real-estate",
    title: "내 집 마련·부동산 완벽 가이드 — 대출부터 세금까지",
    tagline: "집값 한도·대출 상환·부동산 세금 총정리",
    intro: [
      "내 집 마련의 첫 질문은 '얼마짜리 집을 살 수 있나'입니다. 이는 자기자본과 대출 한도의 합으로 결정되며, 대출 한도는 다시 DSR(연소득 대비 원리금 비율)과 LTV(집값 대비 대출 비율) 규제로 정해집니다.",
      "집을 사면 매수 시 취득세, 보유 중 재산세·종합부동산세, 매도 시 양도소득세가 차례로 발생합니다. 전세·월세 거주자라면 전세대출 이자와 월세 세액공제가 핵심 변수입니다.",
      "아래 계산기로 매수 가능 가격, 월 상환액, 부동산 세금, 전월세 비교까지 단계별로 확인하세요.",
    ],
    keywords: ["내집마련", "주택담보대출", "DSR", "LTV", "부동산 세금", "전세 월세 비교"],
    sections: [
      {
        heading: "얼마짜리 집을 살 수 있나",
        links: [
          { label: "내가 살 수 있는 집값", href: "/calc/housing-affordability-quick", desc: "자기자본+DSR 한도로 매수 가능액" },
          { label: "DSR 한도 계산", href: "/calc/dsr-quick", desc: "연소득 기준 대출 한도 추정" },
          { label: "LTV 한도 계산", href: "/calc/ltv-quick", desc: "집값 대비 가능 대출액" },
          { label: "DSR 계산기", href: "/tools/real-estate/dsr", desc: "DSR 상세 계산" },
        ],
      },
      {
        heading: "대출 상환 계산",
        links: [
          { label: "주택담보대출 계산기", href: "/home-loan", desc: "주담대 월 상환액 종합 계산" },
          { label: "주담대 월 상환", href: "/calc/mortgage-monthly-quick", desc: "원리금균등 월 상환액 빠른 계산" },
          { label: "전세대출 월 이자", href: "/calc/jeonse-loan-cost", desc: "전세금·금리로 월 이자 부담" },
          { label: "대출 월 상환액", href: "/calc/loan-monthly-payment", desc: "일반 대출 원리금균등 상환" },
        ],
      },
      {
        heading: "부동산 세금",
        links: [
          { label: "취득세 계산기", href: "/tools/real-estate/acquisition-tax", desc: "주택 취득세 계산" },
          { label: "부동산 양도세", href: "/calc/real-estate-capital-gains-quick", desc: "1주택 비과세 vs 일반 양도" },
          { label: "종합부동산세", href: "/calc/comprehensive-property-tax-quick", desc: "공시가 합계로 종부세 산출" },
          { label: "재산세 계산", href: "/calc/property-tax-quick", desc: "공시가격 기준 주택 재산세" },
        ],
      },
      {
        heading: "전세 vs 월세",
        links: [
          { label: "전세 vs 월세 비용", href: "/calc/jeonse-vs-monthly-cost", desc: "전세 이자+기회비용 vs 월세" },
          { label: "월세 세액공제 환급", href: "/calc/monthly-rent-tax-credit-quick", desc: "월세 17% 세액공제 환급액" },
          { label: "월세 → 전세금 환산", href: "/calc/deposit-equivalent", desc: "전월세 전환율로 보증금 환산" },
        ],
      },
    ],
  },
  {
    id: "tax-saving",
    title: "직장인 절세 완벽 가이드 — 연말정산·세금 줄이기",
    tagline: "내 세금 구조를 이해하고 합법적으로 줄이는 법",
    intro: [
      "절세의 출발은 '내 세금이 어떻게 계산되는지' 아는 것입니다. 연봉에서 각종 공제를 뺀 과세표준에 6~45% 누진세율이 적용되고, 여기에 지방소득세 10%가 더해집니다. 공제 항목을 빠짐없이 챙기는 것이 가장 확실한 절세입니다.",
      "직장인의 1년 절세 사이클은 연말정산입니다. 신용카드·현금영수증, 월세, 의료비·교육비, 연금저축·IRP 세액공제까지 — 미리 알고 준비하면 13월의 월급을 받을 수 있습니다.",
      "프리랜서·N잡러라면 종합소득세와 부가가치세 구조를 함께 이해해야 합니다. 아래 도구로 내 세금 구조를 점검하세요.",
    ],
    keywords: ["절세", "연말정산", "소득세", "세액공제", "직장인 세금", "종합소득세"],
    sections: [
      {
        heading: "연말정산 준비",
        links: [
          { label: "연말정산 계산기", href: "/year-end-tax", desc: "환급·추가납부 종합 계산" },
          { label: "2026 연말정산 가이드", href: "/year-end-tax-2026", desc: "올해 달라진 공제·일정 정리" },
          { label: "월세 세액공제", href: "/calc/monthly-rent-tax-credit-quick", desc: "무주택 세대주 월세 환급" },
        ],
      },
      {
        heading: "내 세금 구조 파악",
        links: [
          { label: "소득세 누진세율 시뮬", href: "/calc/income-tax-bracket-sim", desc: "과세표준별 산출세액 계산" },
          { label: "근로소득세 간편 계산", href: "/calc/earned-income-tax-quick", desc: "월급 기준 원천징수 추정" },
          { label: "2026 세율표", href: "/tax-rates-2026", desc: "소득세·4대보험 요율 정리" },
          { label: "2026 세법 개정", href: "/tax-changes-2026", desc: "올해 바뀐 세법 핵심" },
        ],
      },
      {
        heading: "절세 계좌 활용",
        links: [
          { label: "IRP 계산기", href: "/tools/finance/irp", desc: "연 최대 900만원 세액공제" },
          { label: "퇴직소득세 계산", href: "/calc/retirement-income-tax-quick", desc: "퇴직금 환산급여 방식 세금" },
        ],
      },
      {
        heading: "프리랜서·N잡 세금",
        links: [
          { label: "프리랜서 세금 계산기", href: "/tools/finance/freelance-tax", desc: "3.3% 원천징수·종소세" },
          { label: "부업 순수입 계산", href: "/calc/side-business-net", desc: "필요경비·세금 차감 순수입" },
          { label: "부가가치세 계산", href: "/calc/vat-quick", desc: "공급가액 기준 VAT 10%" },
        ],
      },
    ],
  },
  {
    id: "career",
    title: "직장인 연봉·커리어 완벽 가이드 — 실수령액부터 이직까지",
    tagline: "내 연봉의 가치를 알고 다음 단계를 준비하세요",
    intro: [
      "커리어 관리의 기본은 내 연봉의 실제 가치를 아는 것입니다. 세전 연봉이 같아도 4대보험·세금 공제 후 실수령액은 부양가족·비과세 항목에 따라 달라집니다. 시급·주급·연봉을 자유롭게 환산하면 내 노동의 시간당 가치도 보입니다.",
      "연봉만큼 중요한 것이 수당과 퇴직금입니다. 시간외·야간·휴일 근로수당, 미사용 연차수당, 퇴직금은 모두 법으로 보장된 내 돈입니다. 제대로 계산해 빠짐없이 챙기세요.",
      "이직·연봉협상을 앞두고 있다면 동종업계·동급 회사의 연봉 데이터를 먼저 확인하는 것이 협상력의 출발점입니다.",
    ],
    keywords: ["연봉 실수령액", "연봉협상", "이직", "퇴직금", "근로수당", "커리어"],
    sections: [
      {
        heading: "내 연봉 실수령액",
        links: [
          { label: "연봉 실수령액 계산기", href: "/", desc: "4대보험·소득세 자동 계산" },
          { label: "시급 → 연봉 환산", href: "/calc/hourly-to-yearly", desc: "시급·근무시간으로 연봉 환산" },
          { label: "연봉 → 시급 환산", href: "/calc/yearly-to-hourly", desc: "내 노동의 시간당 가치" },
        ],
      },
      {
        heading: "수당·퇴직금 챙기기",
        links: [
          { label: "시간외 수당 계산", href: "/calc/overtime-pay-quick", desc: "8시간 초과 1.5배 수당" },
          { label: "연차수당 계산", href: "/calc/annual-leave-pay-quick", desc: "미사용 연차 × 통상임금" },
          { label: "퇴직금 간편 계산", href: "/calc/severance-pay-quick", desc: "평균임금 × 근속연수" },
          { label: "퇴직금 계산기", href: "/tools/finance/severance", desc: "퇴직금 상세 계산" },
        ],
      },
      {
        heading: "회사·연봉 비교",
        links: [
          { label: "회사 연봉 DB", href: "/salary-db", desc: "기업별 직급별 연봉 데이터" },
          { label: "회사 비교", href: "/company", desc: "동종업계 회사 연봉 비교" },
          { label: "연차별 커리어 단계", href: "/career-stages-2026", desc: "연차별 연봉·역량 로드맵" },
        ],
      },
      {
        heading: "이직·신입 준비",
        links: [
          { label: "삼성 연봉협상 가이드", href: "/samsung-negotiation-2026", desc: "대기업 연봉협상 전략" },
          { label: "삼성전자 성과급 계산기", href: "/calc/samsung-bonus", desc: "OPI·TAI 세후 실수령" },
          { label: "2026 신입사원 가이드", href: "/new-employee-2026", desc: "사회초년생 필수 금융 세팅" },
          { label: "성과급 세금 계산기", href: "/tools/finance/bonus", desc: "성과급·인센티브 세금 계산" },
        ],
      },
    ],
  },
];

export function getHubById(id: string): Hub | undefined {
  return hubs.find((h) => h.id === id);
}

export function getAllHubIds(): string[] {
  return hubs.map((h) => h.id);
}
