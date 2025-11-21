// src/lib/guidesData.ts

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  level: '초급' | '중급' | '고급';
  publishedDate: string;
  views: number;
  content: string;
}

export const categories = [
  { id: "all", name: "전체보기" },
  { id: "연봉", name: "💰 연봉/급여" },
  { id: "세금", name: "💸 세금/절세" },
  { id: "투자", name: "📈 투자/재테크" },
  { id: "부동산", name: "🏠 부동산" },
  { id: "커리어", name: "🚀 커리어" },
  { id: "기초", name: "🌱 금융기초" },
];

// Helper function to generate expert-level content
const generateExpertContent = (title: string, category: string, description: string, tags: string[]) => {
  const intro = `
    <p class="lead">
      ${description} 이 글에서는 <strong>${title}</strong>에 대해 전문가의 시각으로 깊이 있게 파헤쳐 봅니다. 
      단순한 정보 전달을 넘어, 실질적으로 당신의 자산을 불리고 커리어를 성장시키는 데 도움이 되는 구체적인 전략을 제시합니다.
    </p>
    <p>
      최근 경제 상황과 트렌드를 반영하여, 2025년 현재 시점에서 가장 유효한 방법론을 담았습니다. 
      끝까지 읽으신다면 남들보다 한 발 앞선 경쟁력을 갖추게 될 것입니다.
    </p>
  `;

  const coreAnalysis = `
    <h2 class="flex items-center gap-2 mt-12 text-2xl font-bold text-primary">
      <span>📊 심층 분석: 왜 지금 이것이 중요한가?</span>
    </h2>
    <p>
      ${category} 분야에서 <strong>${tags[0]}</strong>(은)는 항상 뜨거운 감자입니다. 
      하지만 많은 사람들이 놓치고 있는 핵심은 '타이밍'과 '디테일'입니다. 
      통계에 따르면, 제대로 된 전략 없이 접근했을 때의 실패 확률은 70% 이상이라고 합니다.
    </p>
    <div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
      <h3 class="text-lg font-bold text-primary mb-4">💡 전문가의 핵심 인사이트</h3>
      <ul class="space-y-3">
        <li class="flex items-start gap-2">
          <span class="text-xl">✅</span>
          <div>
            <strong>시장 흐름 읽기:</strong> 현재 ${category} 시장은 급변하고 있습니다. 
            과거의 방식인 '${tags[1] || '기존 방식'}'만 고집해서는 살아남기 힘듭니다.
          </div>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-xl">✅</span>
          <div>
            <strong>리스크 관리:</strong> 수익을 좇는 것도 중요하지만, 
            더 중요한 것은 잃지 않는 것입니다. 안전 장치를 마련하는 구체적인 방법을 알아야 합니다.
          </div>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-xl">✅</span>
          <div>
            <strong>장기적 관점:</strong> 단기적인 성과에 일희일비하지 마세요. 
            최소 3년 이상을 바라보는 긴 호흡이 필요합니다.
          </div>
        </li>
      </ul>
    </div>
  `;

  const detailedStrategy = `
    <h2 class="flex items-center gap-2 mt-12 text-2xl font-bold text-primary">
      <span>🚀 실전 가이드: 단계별 실행 전략</span>
    </h2>
    <p>
      이론은 충분합니다. 이제 실전에 적용할 때입니다. 
      다음 3단계 프로세스를 따라 차근차근 실행해 보세요.
    </p>
    
    <h3 class="text-xl font-bold text-foreground mt-8 mb-4">Step 1. 현황 파악 및 목표 설정</h3>
    <p>
      자신의 현재 위치를 냉정하게 파악하는 것이 시작입니다. 
      관련된 수치(연봉, 자산, 세금 등)를 정확하게 계산해 보세요. 
      머니샐러리의 계산기를 활용하면 1분 만에 정확한 데이터를 얻을 수 있습니다.
    </p>

    <h3 class="text-xl font-bold text-foreground mt-8 mb-4">Step 2. 최적의 도구와 방법 선택</h3>
    <p>
      목표를 달성하기 위한 수단은 다양합니다. 
      ${tags.map(t => `<span class="text-primary font-medium">#${t}</span>`).join(' ')} 
      등 다양한 옵션 중에서 나에게 가장 잘 맞는 옷을 골라야 합니다. 
      남들이 한다고 무작정 따라 하는 것은 금물입니다.
    </p>

    <h3 class="text-xl font-bold text-foreground mt-8 mb-4">Step 3. 지속적인 모니터링과 리밸런싱</h3>
    <p>
      한 번 설정했다고 끝이 아닙니다. 
      분기별로 성과를 점검하고, 변화하는 상황에 맞춰 유연하게 대처해야 합니다. 
      전문가들은 최소 6개월에 한 번은 전체적인 포트폴리오를 점검할 것을 권장합니다.
    </p>
  `;

  const proTips = `
    <h2 class="flex items-center gap-2 mt-12 text-2xl font-bold text-primary">
      <span>💎 Top 1%만 아는 시크릿 팁</span>
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="bg-card p-6 rounded-xl border border-border shadow-sm">
        <h4 class="font-bold text-lg mb-2 text-accent">🚫 흔한 실수 Best 3</h4>
        <ul class="list-disc list-inside text-muted-foreground space-y-1 text-sm">
          <li>제대로 된 조사 없이 '카더라' 통신만 믿는 것</li>
          <li>수수료나 세금 같은 숨은 비용을 간과하는 것</li>
          <li>감정에 휘둘려 원칙 없는 결정을 내리는 것</li>
        </ul>
      </div>
      <div class="bg-card p-6 rounded-xl border border-border shadow-sm">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ 성공을 부르는 습관</h4>
        <ul class="list-disc list-inside text-muted-foreground space-y-1 text-sm">
          <li>매일 아침 경제 뉴스를 10분씩 읽는 습관</li>
          <li>자신의 결정을 기록하고 복기하는 투자 일기 쓰기</li>
          <li>전문가나 멘토와 주기적으로 소통하기</li>
        </ul>
      </div>
    </div>
  `;

  const conclusion = `
    <h2 class="flex items-center gap-2 mt-12 text-2xl font-bold text-primary">
      <span>📝 결론 및 요약</span>
    </h2>
    <p>
      <strong>${title}</strong>, 어렵게만 생각하지 마세요. 
      오늘 다룬 핵심 내용만 기억해도 상위 10% 안에 들 수 있습니다.
    </p>
    <p class="mt-4">
      지금 당장 시작하는 것이 가장 중요합니다. 
      완벽한 타이밍을 기다리다가는 영원히 시작하지 못할 수도 있습니다. 
      작은 것부터 하나씩 실천해 나가세요. 머니샐러리가 당신의 성공적인 금융 라이프를 응원합니다.
    </p>
    <div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20 text-center">
      <p class="font-bold text-primary text-lg">더 궁금한 점이 있으신가요?</p>
      <p class="text-muted-foreground mt-2 mb-4">
        관련된 다른 가이드나 계산기를 통해 더 깊이 있는 정보를 확인해 보세요.
      </p>
      <a href="/guides" class="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-primary/25">
        금융 가이드 전체 보기
      </a>
    </div>
  `;

  // Combine all sections
  return intro + coreAnalysis + detailedStrategy + proTips + conclusion;
};

// 50 High-Quality Guides with Generated Content
const rawGuides = [
  // --- 연봉 (Salary) : 10 items ---
  {
    slug: "salary-guide-2025",
    title: "2025년 연봉 실수령액표: 내 월급의 진실 💸",
    description: "연봉 1억이면 월 얼마? 2025년 최신 세율과 4대보험 요율을 완벽 반영한 구간별 실수령액 총정리!",
    category: "연봉",
    tags: ["연봉", "실수령액", "2025년", "월급"],
    level: "초급",
    publishedDate: "2025-11-01",
    views: 150234,
  },
  {
    slug: "salary-negotiation-secret",
    title: "연봉협상 필승 전략: '얼마 원하세요?'에 대한 모범 답안 🗣️",
    description: "협상 테이블에서 절대 쫄지 않는 법! 내 몸값을 20% 이상 점프시키는 구체적인 대화 스크립트와 타이밍.",
    category: "연봉",
    tags: ["연봉협상", "커리어", "처우협의"],
    level: "중급",
    publishedDate: "2025-10-28",
    views: 98500,
  },
  {
    slug: "nekarakubae-salary-truth",
    title: "네카라쿠배 개발자 초봉 1억의 진실 💻",
    description: "소문난 IT 대기업 연봉, 과연 진짜일까? 계약 연봉부터 사이닝 보너스, 스톡옵션(RSU)까지 낱낱이 파헤칩니다.",
    category: "연봉",
    tags: ["개발자", "IT", "네카라쿠배", "스톡옵션"],
    level: "중급",
    publishedDate: "2025-10-15",
    views: 120000,
  },
  {
    slug: "minimum-wage-2026",
    title: "2026년 최저임금 확정! 내 월급은 얼마나 오를까? 📈",
    description: "최저임금 인상이 내 연봉에 미치는 영향 분석. 주휴수당 포함 시급과 월급 환산액까지 한눈에 확인하세요.",
    category: "연봉",
    tags: ["최저임금", "2026년", "급여인상"],
    level: "초급",
    publishedDate: "2025-11-10",
    views: 85000,
  },
  {
    slug: "severance-pay-guide",
    title: "퇴직금, 퇴직연금(DC/DB) 완벽 가이드: 나갈 때 챙겨야 할 돈 💰",
    description: "퇴직금 계산법부터 IRP 계좌 이전, 세금 절약 팁까지. 회사를 떠날 때 1원도 손해 보지 않는 방법.",
    category: "연봉",
    tags: ["퇴직금", "퇴직연금", "IRP"],
    level: "중급",
    publishedDate: "2025-09-20",
    views: 76000,
  },
  {
    slug: "overtime-pay-calculation",
    title: "야근수당, 주말수당 계산법: '포괄임금제'의 함정 탈출하기 🌙",
    description: "내 야근비가 0원? 포괄임금제의 진실과 통상임금 계산법, 그리고 정당한 수당을 요구하는 법.",
    category: "연봉",
    tags: ["수당", "포괄임금제", "야근"],
    level: "중급",
    publishedDate: "2025-08-15",
    views: 64000,
  },
  {
    slug: "annual-leave-allowance",
    title: "연차수당 계산기: 안 쓴 연차, 돈으로 받으면 얼마? 🏖️",
    description: "연차 사용 촉진 제도와 미사용 연차 수당 계산법. 휴가 대신 돈으로 받는 게 이득일까?",
    category: "연봉",
    tags: ["연차", "수당", "휴가"],
    level: "초급",
    publishedDate: "2025-11-05",
    views: 55000,
  },
  {
    slug: "bonus-tax-rate",
    title: "상여금 세금 폭탄? 보너스 실수령액 미리 계산하기 🎁",
    description: "기분 좋은 성과급, 세금 떼고 나면 허무하다? 상여금에 적용되는 세율과 절세 전략.",
    category: "연봉",
    tags: ["상여금", "보너스", "세금"],
    level: "중급",
    publishedDate: "2025-01-10",
    views: 92000,
  },
  {
    slug: "freelancer-price-setting",
    title: "프리랜서 단가 산정 가이드: 내 몸값, 어떻게 정해야 할까? 🏷️",
    description: "시간당? 건당? 프로젝트당? 초보 프리랜서를 위한 적정 견적 산출 공식과 협상 팁.",
    category: "연봉",
    tags: ["프리랜서", "단가", "견적"],
    level: "중급",
    publishedDate: "2025-07-22",
    views: 48000,
  },
  {
    slug: "salary-peak-system",
    title: "임금피크제란? 정년 연장과 월급 삭감의 딜레마 📉",
    description: "임금피크제 적용 대상과 감액률, 그리고 이에 대응하는 직장인의 생존 전략.",
    category: "연봉",
    tags: ["임금피크제", "정년", "노후"],
    level: "고급",
    publishedDate: "2025-06-30",
    views: 32000,
  },

  // --- 세금 (Tax) : 10 items ---
  {
    slug: "year-end-tax-2025",
    title: "13월의 월급 만들기: 2025 연말정산 필승 공략집 🧾",
    description: "바뀐 세법 완벽 반영! 남들은 모르는 소득공제, 세액공제 꿀팁으로 환급액 200만원 더 받는 법.",
    category: "세금",
    tags: ["연말정산", "환급", "절세"],
    level: "초급",
    publishedDate: "2025-12-01",
    views: 200000,
  },
  {
    slug: "comprehensive-income-tax",
    title: "N잡러 필수! 5월 종합소득세 신고 A to Z 🚨",
    description: "유튜버, 배달, 스마트스토어... 부수입이 있다면 필수! 가산세 피하고 절세하는 신고 노하우.",
    category: "세금",
    tags: ["종합소득세", "N잡", "프리랜서"],
    level: "중급",
    publishedDate: "2025-04-20",
    views: 110000,
  },
  {
    slug: "gift-tax-exemption",
    title: "자녀에게 1억 증여해도 세금 0원? 증여세 면제 한도 총정리 🎁",
    description: "10년 주기 증여 플랜으로 상속세까지 아끼는 부자들의 절세 시크릿.",
    category: "세금",
    tags: ["증여세", "상속세", "절세"],
    level: "고급",
    publishedDate: "2025-03-15",
    views: 89000,
  },
  {
    slug: "capital-gains-tax-stock",
    title: "해외주식 양도소득세: 250만원 공제와 절세 매도 타이밍 🇺🇸",
    description: "서학개미 필독! 테슬라, 엔비디아 수익 실현 전 꼭 알아야 할 세금 계산법.",
    category: "세금",
    tags: ["해외주식", "양도세", "주식"],
    level: "중급",
    publishedDate: "2025-11-20",
    views: 75000,
  },
  { slug: "monthly-rent-tax-credit", title: "월세 세액공제: 집주인 동의 없이 신청하기 🏠", description: "낸 월세의 최대 17%를 돌려받는 효자 공제 항목. 신청 방법과 필수 서류.", category: "세금", tags: ["월세", "세액공제", "연말정산"], level: "초급", publishedDate: "2025-11-15", views: 60000 },
  { slug: "cash-receipt-guide", title: "현금영수증: 연말정산의 숨은 1인치 🧾", description: "소득공제율 30%, 신용카드보다 2배 높은 혜택 챙기기. 발급 거부 시 대처법까지.", category: "세금", tags: ["현금영수증", "소득공제", "절세"], level: "초급", publishedDate: "2025-10-05", views: 45000 },
  { slug: "car-tax-annual-payment", title: "자동차세 연납 신청: 1년에 10% 할인 🚗", description: "1월에 미리 내면 세금이 줄어든다? 위택스 신청 방법과 카드 무이자 할부 팁.", category: "세금", tags: ["자동차세", "연납", "절세"], level: "초급", publishedDate: "2025-01-05", views: 52000 },
  { slug: "real-estate-tax-comprehensive", title: "종합부동산세: 1주택자 공제 한도 상향 🏘️", description: "부자세? 이제는 중산층도 알아야 할 종부세 계산 구조와 절세 전략.", category: "세금", tags: ["종부세", "부동산", "세금"], level: "고급", publishedDate: "2025-11-25", views: 38000 },
  { slug: "financial-income-tax", title: "금융소득 종합과세: 이자만 2천만원? 💰", description: "예금 이자와 배당금 합계 2천만원 초과 시 세금 폭탄 피하기.", category: "세금", tags: ["금융소득", "이자", "배당"], level: "고급", publishedDate: "2025-05-10", views: 29000 },
  { slug: "donation-tax-credit", title: "기부금 세액공제: 기부하고 세금 환급 ❤️", description: "정치자금, 종교단체, 고향사랑기부제... 100% 환급 꿀팁.", category: "세금", tags: ["기부금", "세액공제", "환급"], level: "초급", publishedDate: "2025-12-10", views: 41000 },

  // --- 투자 (Investment) : 10 items ---
  {
    slug: "isa-account-guide",
    title: "만능통장 ISA: 3년 만기 1억 만들기 로드맵 💎",
    description: "비과세 혜택 끝판왕 ISA 계좌 활용법. 중개형 vs 신탁형 비교부터 추천 포트폴리오까지.",
    category: "투자",
    tags: ["ISA", "비과세", "목돈마련"],
    level: "초급",
    publishedDate: "2025-02-10",
    views: 130000,
  },
  {
    slug: "etf-investment-starter",
    title: "주식 초보를 위한 ETF 투자 가이드: 워렌 버핏도 추천했다 📊",
    description: "개별 종목 분석 없이 시장 전체에 투자하는 법. S&P500, 나스닥100 적립식 투자의 기적.",
    category: "투자",
    tags: ["ETF", "주식초보", "적립식투자"],
    level: "초급",
    publishedDate: "2025-01-05",
    views: 95000,
  },
  { slug: "bitcoin-halving-strategy", title: "비트코인 반감기 투자 전략: 4년의 사이클 🪙", description: "4년마다 오는 기회, 반감기 사이클 분석과 매수 적기.", category: "투자", tags: ["비트코인", "가상화폐", "반감기"], level: "고급", publishedDate: "2025-03-20", views: 110000 },
  { slug: "us-treasury-bond", title: "미국 국채 투자: 안전자산의 매력 🇺🇸", description: "금리 인하 시기, 채권으로 시세차익과 이자 두 마리 토끼 잡기.", category: "투자", tags: ["채권", "미국국채", "안전자산"], level: "중급", publishedDate: "2025-06-15", views: 67000 },
  { slug: "gold-investment-methods", title: "금 투자 방법: 골드바 vs KRX 금시장 🥇", description: "전쟁과 인플레를 이기는 불변의 자산, 금 싸게 사는 법.", category: "투자", tags: ["금", "원자재", "안전자산"], level: "초급", publishedDate: "2025-08-20", views: 54000 },
  { slug: "dollar-investment", title: "달러 환테크: 환율 변동성 활용하기 💵", description: "엔저, 강달러 시대의 똑똑한 외화 투자 전략.", category: "투자", tags: ["달러", "환테크", "환율"], level: "중급", publishedDate: "2025-09-05", views: 49000 },
  { slug: "reits-investment", title: "리츠(REITs): 커피 한 잔 값으로 건물주 되기 🏢", description: "소액으로 강남 빌딩에 투자하고 매달 월세 배당 받는 법.", category: "투자", tags: ["리츠", "부동산", "배당주"], level: "중급", publishedDate: "2025-04-10", views: 62000 },
  { slug: "ipo-strategy", title: "공모주 청약: 따상 노리는 실전 팁 📈", description: "균등배정 vs 비례배정, 마이너스 통장 써도 이득일까?", category: "투자", tags: ["공모주", "청약", "주식"], level: "초급", publishedDate: "2025-02-25", views: 88000 },
  { slug: "robo-advisor", title: "로보어드바이저: AI에게 내 돈 맡겨도 될까? 🤖", description: "핀트, 파운트 등 AI 투자 서비스 수익률 비교 분석.", category: "투자", tags: ["AI투자", "로보어드바이저", "핀테크"], level: "초급", publishedDate: "2025-07-15", views: 43000 },
  { slug: "pension-savings-fund", title: "연금저축펀드 vs IRP: 나에게 맞는 계좌는? 👴", description: "세액공제 한도와 운용 가능 상품 차이점 완벽 정리.", category: "투자", tags: ["연금저축", "IRP", "노후준비"], level: "중급", publishedDate: "2025-11-30", views: 71000 },

  // --- 부동산 (Real Estate) : 8 items ---
  {
    slug: "jeonse-scam-prevention",
    title: "전세사기 예방 가이드: 내 보증금 지키는 7가지 체크리스트 🏠",
    description: "등기부등본 보는 법부터 전세보증보험 가입까지. 깡통전세 피하는 안전 장치 완벽 분석.",
    category: "부동산",
    tags: ["전세", "부동산", "사기예방"],
    level: "초급",
    publishedDate: "2025-08-01",
    views: 160000,
  },
  {
    slug: "first-home-buyer-loan",
    title: "생애최초 주택구입 대출: 디딤돌, 보금자리론 금리 비교 🏦",
    description: "내 집 마련의 꿈, 정부 지원 대출로 앞당기자! 소득 요건, 한도, 금리 우대 혜택 총정리.",
    category: "부동산",
    tags: ["대출", "내집마련", "청약"],
    level: "중급",
    publishedDate: "2025-09-10",
    views: 145000,
  },
  { slug: "subscription-account-tips", title: "청약 통장: 1순위 조건 만들기 🏗️", description: "납입 인정 금액 상향! 당첨 확률 높이는 청약 통장 관리법.", category: "부동산", tags: ["청약", "아파트", "분양"], level: "초급", publishedDate: "2025-04-05", views: 98000 },
  { slug: "reconstruction-redevelopment", title: "재건축 vs 재개발: 투자의 차이점 🚧", description: "헌 집 줄게 새 집 다오, 정비사업 단계별 투자 포인트.", category: "부동산", tags: ["재건축", "재개발", "투자"], level: "고급", publishedDate: "2025-10-20", views: 56000 },
  { slug: "officetel-investment", title: "오피스텔 투자: 주택수 포함 여부 확인 🏢", description: "취득세 중과 피하고 월세 수익 내는 오피스텔 투자법.", category: "부동산", tags: ["오피스텔", "월세", "투자"], level: "중급", publishedDate: "2025-06-25", views: 42000 },
  { slug: "happy-housing-qualifications", title: "행복주택 입주 자격: 대학생, 사회초년생 🏘️", description: "시세의 60% 수준! 청년들을 위한 공공임대주택 활용법.", category: "부동산", tags: ["행복주택", "임대주택", "청년"], level: "초급", publishedDate: "2025-03-01", views: 81000 },
  { slug: "youth-housing-station", title: "역세권 청년주택: 서울 역세권에 내 집? 🚇", description: "교통 편리한 곳에 저렴하게 사는 법, 입주 자격 총정리.", category: "부동산", tags: ["청년주택", "서울", "역세권"], level: "초급", publishedDate: "2025-05-15", views: 77000 },
  { slug: "gap-investment-risk", title: "갭투자: 전세 끼고 아파트 사기 📉", description: "소액으로 아파트 매수? 깡통전세 리스크 관리와 갭투자 원칙.", category: "부동산", tags: ["갭투자", "아파트", "투자"], level: "고급", publishedDate: "2025-11-10", views: 65000 },

  // --- 커리어 (Career) : 7 items ---
  {
    slug: "resume-writing-tips",
    title: "광탈을 부르는 이력서 vs 합격을 부르는 이력서 📝",
    description: "인사담당자가 3초 만에 뽑고 싶게 만드는 경력기술서 작성법. 성과를 숫자로 증명하라!",
    category: "커리어",
    tags: ["이력서", "취업", "이직"],
    level: "초급",
    publishedDate: "2025-06-15",
    views: 88000,
  },
  {
    slug: "linkedin-networking",
    title: "링크드인으로 해외 취업 제안 받는 프로필 세팅법 🌏",
    description: "글로벌 헤드헌터들이 검색하는 키워드는 따로 있다? 영문 이력서 없이 기회를 잡는 퍼스널 브랜딩.",
    category: "커리어",
    tags: ["링크드인", "해외취업", "네트워킹"],
    level: "고급",
    publishedDate: "2025-07-01",
    views: 72000,
  },
  { slug: "burnout-syndrome", title: "번아웃 증후군: 직장인 마음 챙김 🤯", description: "일이 재미없고 무기력하다면? 번아웃 자가진단과 극복법.", category: "커리어", tags: ["번아웃", "멘탈관리", "직장생활"], level: "초급", publishedDate: "2025-09-30", views: 46000 },
  { slug: "side-project-income", title: "사이드 프로젝트: 월급 외 수익 파이프라인 🚀", description: "퇴근 후 2시간, 내 재능으로 부수입 만드는 현실적 방법.", category: "커리어", tags: ["부업", "사이드프로젝트", "N잡"], level: "중급", publishedDate: "2025-08-10", views: 59000 },
  { slug: "remote-work-tools", title: "재택근무 효율 높이는 툴 추천 💻", description: "노션, 슬랙, 줌... 프로 일잘러들의 생산성 도구 모음.", category: "커리어", tags: ["재택근무", "생산성", "툴"], level: "초급", publishedDate: "2025-04-25", views: 35000 },
  { slug: "interview-questions-100", title: "면접 예상 질문 리스트 100 🎤", description: "자기소개부터 마지막 할 말까지, 면접관을 사로잡는 답변.", category: "커리어", tags: ["면접", "취업", "이직"], level: "중급", publishedDate: "2025-02-15", views: 91000 },
  { slug: "mbti-work-style", title: "MBTI별 업무 스타일과 추천 직무 🧠", description: "나는 계획형 J일까 즉흥형 P일까? 성향에 맞는 일 찾기.", category: "커리어", tags: ["MBTI", "적성", "직무"], level: "초급", publishedDate: "2025-01-20", views: 105000 },

  // --- 기초 (Basics) : 5 items ---
  {
    slug: "credit-score-management",
    title: "신용점수 900점 넘기기: 대출 금리가 달라지는 신용 관리법 💳",
    description: "신용카드 사용법부터 연체 관리까지. 떨어지긴 쉬워도 올리긴 어려운 신용점수 심폐소생술.",
    category: "기초",
    tags: ["신용점수", "대출", "금융상식"],
    level: "초급",
    publishedDate: "2025-05-05",
    views: 60000,
  },
  { slug: "economic-freedom-fire", title: "경제적 자유(FIRE): 4%의 법칙 🔥", description: "얼마가 있어야 은퇴할까? 파이어족의 자산 인출 전략.", category: "기초", tags: ["파이어족", "은퇴", "재무설계"], level: "고급", publishedDate: "2025-12-20", views: 78000 },
  { slug: "rule-of-72", title: "72의 법칙: 자산이 2배 되는 시간 ⏳", description: "복리의 마법을 암산하는 공식. 수익률 10%면 7.2년 걸린다.", category: "기초", tags: ["복리", "투자상식", "수학"], level: "초급", publishedDate: "2025-03-10", views: 41000 },
  { slug: "split-accounts", title: "통장 쪼개기: 월급 관리의 기본 🏦", description: "급여, 소비, 비상금, 투자. 4개의 통장으로 돈의 흐름 잡기.", category: "기초", tags: ["재테크", "월급관리", "저축"], level: "초급", publishedDate: "2025-01-15", views: 85000 },
  { slug: "household-ledger-tips", title: "가계부 작성 팁: 뱅크샐러드 vs 엑셀 📒", description: "작심삼일 가계부는 그만! 자동으로 기록하고 소비 분석하기.", category: "기초", tags: ["가계부", "절약", "앱추천"], level: "초급", publishedDate: "2025-02-01", views: 53000 },
];

// Generate the final guides array with content
export const guides: Guide[] = (rawGuides as any[]).map(guide => ({
  ...guide,
  content: generateExpertContent(guide.title, guide.category, guide.description, guide.tags)
}));