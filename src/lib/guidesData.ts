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

// 50 High-Quality Guides
export const guides: Guide[] = [
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
    content: `
      <p class="lead">연봉 5,000만원 계약서에 도장을 찍었지만, 실제 통장에 들어오는 돈은 왜 다를까요? 범인은 바로 '세금'과 '4대보험'입니다. 2025년 확정된 최신 요율을 바탕으로, 당신의 피땀 어린 월급이 어떻게 계산되는지, 그리고 연봉 구간별로 실제로 손에 쥐는 돈은 얼마인지 1원 단위까지 파헤쳐 드립니다.</p>
      
      <h2 class="flex items-center gap-2 mt-8 text-2xl font-bold text-primary">
        <span>🔍 내 월급 도둑? 공제 항목 완전 정복</span>
      </h2>
      <p>월급 명세서를 보면 한숨부터 나오시나요? 지피지기면 백전백승! 공제 항목을 정확히 알아야 절세 전략도 세울 수 있습니다.</p>
      <ul class="space-y-2 mt-4">
        <li class="flex items-start gap-2"><span class="text-xl">🛡️</span> <div><strong>4대보험:</strong> 국민연금(4.5%), 건강보험(3.545%), 장기요양보험(건보료의 12.95%), 고용보험(0.9%)은 내 미래와 안전을 위한 필수 비용입니다.</div></li>
        <li class="flex items-start gap-2"><span class="text-xl">🏛️</span> <div><strong>소득세:</strong> 소득이 많을수록 세율이 높아지는 '누진세' 구조입니다. 연봉 1억이 넘어가면 세금 구간이 확 뜁니다!</div></li>
      </ul>

      <div class="bg-secondary/30 p-6 rounded-xl mt-8 border border-primary/10">
        <h3 class="text-lg font-bold text-primary mb-2">💡 2025년 연봉별 예상 월 실수령액 (비과세 20만원 기준)</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-muted-foreground border-b border-border">
              <tr><th class="py-2">연봉</th><th class="py-2">월 실수령액</th><th class="py-2">공제율</th></tr>
            </thead>
            <tbody class="divide-y divide-border/50">
              <tr><td class="py-2 font-bold">3,000만원</td><td class="py-2 text-primary font-bold">222만원</td><td class="py-2">11.2%</td></tr>
              <tr><td class="py-2 font-bold">4,000만원</td><td class="py-2 text-primary font-bold">290만원</td><td class="py-2">12.9%</td></tr>
              <tr><td class="py-2 font-bold">5,000만원</td><td class="py-2 text-primary font-bold">354만원</td><td class="py-2">15.1%</td></tr>
              <tr><td class="py-2 font-bold">8,000만원</td><td class="py-2 text-primary font-bold">529만원</td><td class="py-2">20.6%</td></tr>
              <tr><td class="py-2 font-bold">1억원</td><td class="py-2 text-primary font-bold">634만원</td><td class="py-2">23.9%</td></tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted-foreground mt-2">* 부양가족, 비과세액 등에 따라 실제 금액은 달라질 수 있습니다.</p>
      </div>
    `
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
    content: `<p class="lead">"희망 연봉이 어떻게 되세요?" 이 질문 앞에서 머뭇거렸다면 이미 진 게임입니다. 연봉 협상은 기싸움이 아니라 '가치 입증'의 과정입니다.</p>`
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
    content: `<p class="lead">개발자들의 꿈의 직장, 네카라쿠배! '초봉 1억'이라는 자극적인 기사들이 쏟아지지만, 그 내막을 들여다보면 복잡한 보상 구조가 숨어있습니다.</p>`
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
    content: `<p class="lead">2026년 최저임금이 결정되었습니다. 단순히 알바생만의 이야기가 아닙니다. 최저임금은 모든 임금의 기준점이 되기 때문이죠.</p>`
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
    content: `<p class="lead">아름다운 이별을 위해서는 정산이 확실해야 합니다. 퇴직금, 제대로 계산된 게 맞을까요? DC형과 DB형의 차이부터 IRP 절세 팁까지 정리해드립니다.</p>`
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
    content: `<p class="lead">"우리는 포괄임금제라 야근비 없어요." 이 말은 반은 맞고 반은 틀립니다. 포괄임금제라도 한도를 초과한 근무에 대해서는 수당을 받을 수 있습니다.</p>`
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
    content: `<p class="lead">바빠서 못 쓴 내 연차, 그냥 사라지게 둘 순 없죠! 남은 연차를 돈으로 환산하면 얼마가 될지, 그리고 회사가 돈을 안 줘도 되는 경우는 언제인지 알아봅니다.</p>`
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
    content: `<p class="lead">"성과급 1,000만원!" 기뻐서 소고기 사먹을 생각부터 했지만, 막상 통장에 들어온 돈은 700만원? 보너스는 왜 월급보다 세금을 많이 떼가는 것처럼 느껴질까요?</p>`
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
    content: `<p class="lead">프리랜서의 가장 큰 고민, "얼마를 불러야 할까?". 너무 높으면 일이 끊기고, 너무 낮으면 골병듭니다. 시장 가격과 내 가치를 고려한 황금 비율을 찾아드립니다.</p>`
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
    content: `<p class="lead">오래 일할 수 있어 좋지만 월급은 줄어든다? 임금피크제는 축복일까요, 재앙일까요? 제도의 명과 암을 분석하고 현명한 대처법을 제시합니다.</p>`
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
    content: `<p class="lead">연말정산, 누군가에겐 '13월의 월급'이지만 누군가에겐 '세금 폭탄'입니다. 차이는 '준비'에서 옵니다. 올해 바뀐 공제 항목을 놓치지 마세요!</p>`
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
    content: `<p class="lead">회사 월급 외에 1원이라도 번 돈이 있다면? 5월은 '종소세'의 달입니다. 복잡한 신고 절차, 홈택스에서 10분 만에 끝내는 법을 알려드립니다.</p>`
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
    content: "<p>사랑하는 자녀에게 자산을 물려주고 싶지만 세금이 걱정되시나요? 합법적으로 세금을 내지 않고 증여할 수 있는 '면제 한도'를 200% 활용하세요.</p>"
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
    content: "<p>미국 주식으로 대박 나셨나요? 축하드립니다! 하지만 세금 폭탄을 맞지 않으려면 '12월 말'이 되기 전에 전략적인 매도가 필요합니다.</p>"
  },
  { slug: "monthly-rent-tax-credit", title: "월세 세액공제: 집주인 동의 없이 신청하기 🏠", description: "낸 월세의 최대 17%를 돌려받는 효자 공제 항목. 신청 방법과 필수 서류.", category: "세금", tags: ["월세", "세액공제", "연말정산"], level: "초급", publishedDate: "2025-11-15", views: 60000, content: "<p>월세 내느라 등골 휘시죠? 연말정산 때 한 달 치 월세는 돌려받을 수 있습니다. 집주인 눈치 보지 않고 신청하는 법을 알려드립니다.</p>" },
  { slug: "cash-receipt-guide", title: "현금영수증: 연말정산의 숨은 1인치 🧾", description: "소득공제율 30%, 신용카드보다 2배 높은 혜택 챙기기. 발급 거부 시 대처법까지.", category: "세금", tags: ["현금영수증", "소득공제", "절세"], level: "초급", publishedDate: "2025-10-05", views: 45000, content: "<p>귀찮아서 안 챙긴 현금영수증, 모으면 큰 돈이 됩니다. 신용카드보다 공제율이 훨씬 높은 현금영수증의 위력을 확인하세요.</p>" },
  { slug: "car-tax-annual-payment", title: "자동차세 연납 신청: 1년에 10% 할인 🚗", description: "1월에 미리 내면 세금이 줄어든다? 위택스 신청 방법과 카드 무이자 할부 팁.", category: "세금", tags: ["자동차세", "연납", "절세"], level: "초급", publishedDate: "2025-01-05", views: 52000, content: "<p>자동차세, 6월과 12월에 나눠 내시나요? 1월에 한 번에 내면 10%를 깎아줍니다. 클릭 몇 번으로 치킨 값 버는 꿀팁!</p>" },
  { slug: "real-estate-tax-comprehensive", title: "종합부동산세: 1주택자 공제 한도 상향 🏘️", description: "부자세? 이제는 중산층도 알아야 할 종부세 계산 구조와 절세 전략.", category: "세금", tags: ["종부세", "부동산", "세금"], level: "고급", publishedDate: "2025-11-25", views: 38000, content: "<p>집값이 오르면 세금도 오릅니다. 종부세 대상자가 늘어나면서 이제 남의 일이 아니게 되었습니다. 복잡한 종부세, 쉽게 풀어드립니다.</p>" },
  { slug: "financial-income-tax", title: "금융소득 종합과세: 이자만 2천만원? 💰", description: "예금 이자와 배당금 합계 2천만원 초과 시 세금 폭탄 피하기.", category: "세금", tags: ["금융소득", "이자", "배당"], level: "고급", publishedDate: "2025-05-10", views: 29000, content: "<p>돈이 돈을 버는 건 좋지만, 세금이 너무 많다면? 금융소득 2천만원이 넘는 순간 달라지는 세율과 건강보험료 폭탄을 피하는 법.</p>" },
  { slug: "donation-tax-credit", title: "기부금 세액공제: 기부하고 세금 환급 ❤️", description: "정치자금, 종교단체, 고향사랑기부제... 100% 환급 꿀팁.", category: "세금", tags: ["기부금", "세액공제", "환급"], level: "초급", publishedDate: "2025-12-10", views: 41000, content: "<p>좋은 일 하고 세금도 돌려받는 일석이조! 특히 10만원까지 전액 세액공제 되는 기부처들을 놓치지 마세요.</p>" },

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
    content: "<p>재테크 고수들이 입을 모아 추천하는 필수 계좌, ISA! 세금은 아끼고 수익은 불리는 마법의 통장 활용법을 공개합니다.</p>"
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
    content: "<p>어떤 주식을 사야 할지 모르겠다면? 시장을 사세요! 마음 편하게 연 10% 수익을 목표로 하는 ETF 투자의 모든 것.</p>"
  },
  { slug: "bitcoin-halving-strategy", title: "비트코인 반감기 투자 전략: 4년의 사이클 🪙", description: "4년마다 오는 기회, 반감기 사이클 분석과 매수 적기.", category: "투자", tags: ["비트코인", "가상화폐", "반감기"], level: "고급", publishedDate: "2025-03-20", views: 110000, content: "<p>비트코인의 역사는 반복될까요? 반감기 전후의 가격 변동 패턴을 분석하고, 리스크를 줄이는 분할 매수 전략을 제시합니다.</p>" },
  { slug: "us-treasury-bond", title: "미국 국채 투자: 안전자산의 매력 🇺🇸", description: "금리 인하 시기, 채권으로 시세차익과 이자 두 마리 토끼 잡기.", category: "투자", tags: ["채권", "미국국채", "안전자산"], level: "중급", publishedDate: "2025-06-15", views: 67000, content: "<p>주식이 불안할 땐 채권으로 눈을 돌리세요. 세계에서 가장 안전한 자산인 미국 국채에 투자하는 방법과 수익 구조를 설명합니다.</p>" },
  { slug: "gold-investment-methods", title: "금 투자 방법: 골드바 vs KRX 금시장 🥇", description: "전쟁과 인플레를 이기는 불변의 자산, 금 싸게 사는 법.", category: "투자", tags: ["금", "원자재", "안전자산"], level: "초급", publishedDate: "2025-08-20", views: 54000, content: "<p>금은 배신하지 않습니다. 하지만 금을 사는 방법에 따라 수수료와 세금이 천차만별입니다. 가장 똑똑하게 금을 모으는 방법은?</p>" },
  { slug: "dollar-investment", title: "달러 환테크: 환율 변동성 활용하기 💵", description: "엔저, 강달러 시대의 똑똑한 외화 투자 전략.", category: "투자", tags: ["달러", "환테크", "환율"], level: "중급", publishedDate: "2025-09-05", views: 49000, content: "<p>환율도 투자가 됩니다. 쌀 때 사서 비쌀 때 파는 환테크의 기본 원칙과 주의해야 할 환전 수수료 아끼는 팁.</p>" },
  { slug: "reits-investment", title: "리츠(REITs): 커피 한 잔 값으로 건물주 되기 🏢", description: "소액으로 강남 빌딩에 투자하고 매달 월세 배당 받는 법.", category: "투자", tags: ["리츠", "부동산", "배당주"], level: "중급", publishedDate: "2025-04-10", views: 62000, content: "<p>건물주가 꿈이지만 자본이 부족하다면? 리츠가 답입니다. 주식처럼 쉽게 사고팔며 배당금까지 챙기는 부동산 간접 투자.</p>" },
  { slug: "ipo-strategy", title: "공모주 청약: 따상 노리는 실전 팁 📈", description: "균등배정 vs 비례배정, 마이너스 통장 써도 이득일까?", category: "투자", tags: ["공모주", "청약", "주식"], level: "초급", publishedDate: "2025-02-25", views: 88000, content: "<p>치킨 값 벌려다 대박 난다? 공모주 청약 열풍에 동참하세요. 증권사 계좌 개설부터 매도 타이밍까지 A to Z.</p>" },
  { slug: "robo-advisor", title: "로보어드바이저: AI에게 내 돈 맡겨도 될까? 🤖", description: "핀트, 파운트 등 AI 투자 서비스 수익률 비교 분석.", category: "투자", tags: ["AI투자", "로보어드바이저", "핀테크"], level: "초급", publishedDate: "2025-07-15", views: 43000, content: "<p>투자가 어렵고 귀찮다면 AI에게 맡겨보세요. 감정을 배제하고 데이터로만 투자하는 로보어드바이저의 장단점 분석.</p>" },
  { slug: "pension-savings-fund", title: "연금저축펀드 vs IRP: 나에게 맞는 계좌는? 👴", description: "세액공제 한도와 운용 가능 상품 차이점 완벽 정리.", category: "투자", tags: ["연금저축", "IRP", "노후준비"], level: "중급", publishedDate: "2025-11-30", views: 71000, content: "<p>노후 준비와 절세를 동시에! 하지만 이름도 비슷한 두 계좌, 도대체 뭐가 다를까요? 당신의 투자 성향에 맞는 계좌를 골라드립니다.</p>" },

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
    content: "<p>내 전 재산이나 다름없는 전세 보증금, 한순간에 날릴 순 없죠. 계약 전 반드시 확인해야 할 서류와 안전 장치들을 꼼꼼하게 짚어드립니다.</p>"
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
    content: "<p>금리가 올라도 정부 지원 대출은 여전히 매력적입니다. 무주택자라면 무조건 챙겨야 할 정책 모기지 상품을 비교 분석해 드립니다.</p>"
  },
  { slug: "subscription-account-tips", title: "청약 통장: 1순위 조건 만들기 🏗️", description: "납입 인정 금액 상향! 당첨 확률 높이는 청약 통장 관리법.", category: "부동산", tags: ["청약", "아파트", "분양"], level: "초급", publishedDate: "2025-04-05", views: 98000, content: "<p>청약 통장, 그냥 묵혀두기만 하면 될까요? 1순위가 되기 위한 납입 횟수와 예치금 조건을 확인하고 전략적으로 관리하세요.</p>" },
  { slug: "reconstruction-redevelopment", title: "재건축 vs 재개발: 투자의 차이점 🚧", description: "헌 집 줄게 새 집 다오, 정비사업 단계별 투자 포인트.", category: "부동산", tags: ["재건축", "재개발", "투자"], level: "고급", publishedDate: "2025-10-20", views: 56000, content: "<p>부동산 투자의 꽃, 정비사업! 재건축과 재개발은 비슷해 보이지만 접근 방식이 완전히 다릅니다. 수익성과 리스크를 비교해 봅니다.</p>" },
  { slug: "officetel-investment", title: "오피스텔 투자: 주택수 포함 여부 확인 🏢", description: "취득세 중과 피하고 월세 수익 내는 오피스텔 투자법.", category: "부동산", tags: ["오피스텔", "월세", "투자"], level: "중급", publishedDate: "2025-06-25", views: 42000, content: "<p>아파트 규제의 풍선효과? 오피스텔 투자는 세금 문제가 복잡합니다. 주거용과 업무용의 차이, 그리고 주택수 포함 여부를 확실히 정리합니다.</p>" },
  { slug: "happy-housing-qualifications", title: "행복주택 입주 자격: 대학생, 사회초년생 🏘️", description: "시세의 60% 수준! 청년들을 위한 공공임대주택 활용법.", category: "부동산", tags: ["행복주택", "임대주택", "청년"], level: "초급", publishedDate: "2025-03-01", views: 81000, content: "<p>월세 걱정 없이 살 수 있는 집이 있다? 대학생, 청년, 신혼부부를 위한 행복주택 입주 자격과 신청 절차를 알아봅니다.</p>" },
  { slug: "youth-housing-station", title: "역세권 청년주택: 서울 역세권에 내 집? 🚇", description: "교통 편리한 곳에 저렴하게 사는 법, 입주 자격 총정리.", category: "부동산", tags: ["청년주택", "서울", "역세권"], level: "초급", publishedDate: "2025-05-15", views: 77000, content: "<p>지하철역 5분 거리 새 아파트에 살 수 있는 기회! 역세권 청년주택의 임대료 수준과 입주 조건을 확인하세요.</p>" },
  { slug: "gap-investment-risk", title: "갭투자: 전세 끼고 아파트 사기 📉", description: "소액으로 아파트 매수? 깡통전세 리스크 관리와 갭투자 원칙.", category: "부동산", tags: ["갭투자", "아파트", "투자"], level: "고급", publishedDate: "2025-11-10", views: 65000, content: "<p>적은 돈으로 아파트를 사는 갭투자, 하락장에서는 독이 될 수 있습니다. 역전세난의 위험성과 안전한 갭투자 비율을 분석합니다.</p>" },

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
    content: "<p>열심히 썼는데 왜 서류에서 떨어질까요? 문제는 '내용'이 아니라 '표현'입니다. 당신의 경험을 매력적인 '성과'로 포장하는 마법의 문장 공식을 알려드립니다.</p>"
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
    content: "<p>링크드인은 단순한 이력서가 아닙니다. 24시간 나를 홍보하는 영업사원이죠. 전 세계 채용 담당자들의 눈길을 사로잡는 프로필 최적화 비법!</p>"
  },
  { slug: "burnout-syndrome", title: "번아웃 증후군: 직장인 마음 챙김 🤯", description: "일이 재미없고 무기력하다면? 번아웃 자가진단과 극복법.", category: "커리어", tags: ["번아웃", "멘탈관리", "직장생활"], level: "초급", publishedDate: "2025-09-30", views: 46000, content: "<p>열심히 달리기만 하면 엔진이 고장 납니다. 번아웃은 게으름이 아니라 뇌의 경고 신호입니다. 다시 일어설 힘을 얻는 심리 처방전.</p>" },
  { slug: "side-project-income", title: "사이드 프로젝트: 월급 외 수익 파이프라인 🚀", description: "퇴근 후 2시간, 내 재능으로 부수입 만드는 현실적 방법.", category: "커리어", tags: ["부업", "사이드프로젝트", "N잡"], level: "중급", publishedDate: "2025-08-10", views: 59000, content: "<p>월급만으로는 부족하다면? 개발, 디자인, 글쓰기... 당신의 재능을 돈으로 바꾸는 사이드 프로젝트 시작 가이드.</p>" },
  { slug: "remote-work-tools", title: "재택근무 효율 높이는 툴 추천 💻", description: "노션, 슬랙, 줌... 프로 일잘러들의 생산성 도구 모음.", category: "커리어", tags: ["재택근무", "생산성", "툴"], level: "초급", publishedDate: "2025-04-25", views: 35000, content: "<p>집에서도 회사처럼, 아니 회사보다 더 효율적으로 일하는 법. 협업 툴 마스터가 되어 '일잘러'로 인정받으세요.</p>" },
  { slug: "interview-questions-100", title: "면접 예상 질문 리스트 100 🎤", description: "자기소개부터 마지막 할 말까지, 면접관을 사로잡는 답변.", category: "커리어", tags: ["면접", "취업", "이직"], level: "중급", publishedDate: "2025-02-15", views: 91000, content: "<p>면접장에만 가면 머리가 하얘지나요? 자주 나오는 질문 유형을 파악하고, 나만의 필살기 답변을 준비하면 떨리지 않습니다.</p>" },
  { slug: "mbti-work-style", title: "MBTI별 업무 스타일과 추천 직무 🧠", description: "나는 계획형 J일까 즉흥형 P일까? 성향에 맞는 일 찾기.", category: "커리어", tags: ["MBTI", "적성", "직무"], level: "초급", publishedDate: "2025-01-20", views: 105000, content: "<p>내 성격과 안 맞는 일 때문에 스트레스 받으시나요? MBTI 유형별 업무 스타일을 분석하고, 나에게 딱 맞는 직무를 추천해 드립니다.</p>" },

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
    content: "<p>신용점수는 자본주의 사회의 '성적표'입니다. 점수 10점 차이로 대출 이자가 수백만 원 달라질 수 있습니다. 지금 당장 실천할 수 있는 점수 올리기 꿀팁!</p>"
  },
  { slug: "economic-freedom-fire", title: "경제적 자유(FIRE): 4%의 법칙 🔥", description: "얼마가 있어야 은퇴할까? 파이어족의 자산 인출 전략.", category: "기초", tags: ["파이어족", "은퇴", "재무설계"], level: "고급", publishedDate: "2025-12-20", views: 78000, content: "<p>일하지 않아도 돈이 들어오는 삶, 경제적 자유! 막연한 꿈이 아니라 구체적인 숫자로 계획하세요. 4%의 법칙이 당신의 은퇴 시기를 앞당겨 줍니다.</p>" },
  { slug: "rule-of-72", title: "72의 법칙: 자산이 2배 되는 시간 ⏳", description: "복리의 마법을 암산하는 공식. 수익률 10%면 7.2년 걸린다.", category: "기초", tags: ["복리", "투자상식", "수학"], level: "초급", publishedDate: "2025-03-10", views: 41000, content: "<p>내 돈이 언제 2배가 될까? 복잡한 계산기 없이 암산으로 알 수 있습니다. 아인슈타인도 놀란 복리의 마법, 72의 법칙을 소개합니다.</p>" },
  { slug: "split-accounts", title: "통장 쪼개기: 월급 관리의 기본 🏦", description: "급여, 소비, 비상금, 투자. 4개의 통장으로 돈의 흐름 잡기.", category: "기초", tags: ["재테크", "월급관리", "저축"], level: "초급", publishedDate: "2025-01-15", views: 85000, content: "<p>월급이 스쳐 지나가나요? 통장 쪼개기는 돈을 모으는 시스템을 만드는 첫걸음입니다. 목적별로 통장을 나누고 돈의 흐름을 통제하세요.</p>" },
  { slug: "household-ledger-tips", title: "가계부 작성 팁: 뱅크샐러드 vs 엑셀 📒", description: "작심삼일 가계부는 그만! 자동으로 기록하고 소비 분석하기.", category: "기초", tags: ["가계부", "절약", "앱추천"], level: "초급", publishedDate: "2025-02-01", views: 53000, content: "<p>가계부, 쓰다 말다 하시죠? 요즘은 앱이 알아서 다 해줍니다. 나에게 맞는 가계부 작성법을 찾고 새는 돈을 막으세요.</p>" },
];