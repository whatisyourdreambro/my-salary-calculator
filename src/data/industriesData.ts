// src/data/industriesData.ts
// 산업별 평균 연봉 데이터 — "OOO 업계 연봉" 키워드 커버용
// salary 단위: 만원

export interface IndustrySalaryRange {
  min: number;
  max: number;
  avg: number;
}

export interface IndustryProfile {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  salary: {
    entry: IndustrySalaryRange;
    junior: IndustrySalaryRange;
    senior: IndustrySalaryRange;
    overall: number;
  };
  description: string;
  topCompanyIds: string[];      // salary-db의 company id들
  topJobIds: string[];          // jobsData의 job id들
  faqs: Array<{ q: string; a: string }>;
  keywords: string[];
  trend: "rising" | "stable" | "declining";
  trendNote: string;
}

export const industriesData: IndustryProfile[] = [
  {
    id: "it-software",
    name: "IT·소프트웨어",
    nameEn: "IT & Software",
    emoji: "💻",
    salary: {
      entry: { min: 4000, max: 6000, avg: 4800 },
      junior: { min: 6000, max: 10000, avg: 7500 },
      senior: { min: 9000, max: 18000, avg: 12000 },
      overall: 8000,
    },
    description:
      "네이버·카카오·쿠팡·토스·당근 등 국내 대형 IT기업과 수천 개의 스타트업이 속한 업계. AI·클라우드·핀테크 성장으로 개발자 수요가 지속 증가 중.",
    topCompanyIds: ["naver", "kakao", "coupang", "krafton", "ncsoft", "nexon"],
    topJobIds: ["software-engineer", "frontend-developer", "backend-developer", "data-scientist", "ai-engineer"],
    faqs: [
      {
        q: "IT·소프트웨어 업계 평균 연봉은 얼마인가요?",
        a: "2026년 기준 국내 IT·소프트웨어 업계 평균 연봉은 약 8,000만원입니다. 네이버·카카오·쿠팡 등 대형 플랫폼은 신입도 5,000만원 이상이며, 성과급·스톡옵션 포함 시 1억원을 넘는 개발자도 많습니다.",
      },
      {
        q: "IT 업계에서 가장 연봉이 높은 직무는 무엇인가요?",
        a: "AI/ML 엔지니어, 데이터 사이언티스트, 클라우드 아키텍트, 풀스택 시니어 개발자가 상위권입니다. 경력 5년 이상 시니어는 1억~1억5,000만원, AI 전문가는 2억원 이상도 받습니다.",
      },
    ],
    keywords: ["IT 업계 연봉", "소프트웨어 회사 연봉", "IT 회사 연봉", "개발자 연봉 비교", "IT 업계 평균 연봉 2026"],
    trend: "rising",
    trendNote: "AI 붐으로 AI/ML 엔지니어·데이터 직군 연봉이 2023~2025년 30%+ 상승. 2026년도 지속 상승세.",
  },
  {
    id: "semiconductor",
    name: "반도체·전자",
    nameEn: "Semiconductor & Electronics",
    emoji: "🔬",
    salary: {
      entry: { min: 5000, max: 7500, avg: 6000 },
      junior: { min: 7000, max: 11000, avg: 8800 },
      senior: { min: 10000, max: 20000, avg: 14000 },
      overall: 9500,
    },
    description:
      "삼성전자·SK하이닉스가 이끄는 세계 최상위 반도체 업계. HBM·AI반도체 수요 급증으로 연봉이 빠르게 오르고 있는 한국 최고 대우 산업 중 하나.",
    topCompanyIds: ["samsung-electronics", "sk-hynix", "lg-electronics"],
    topJobIds: ["semiconductor-engineer", "electrical-engineer"],
    faqs: [
      {
        q: "반도체 업계 연봉은 얼마인가요?",
        a: "삼성전자·SK하이닉스 신입 엔지니어 기본급은 약 5,000~5,300만원이지만, OPI·성과급 포함 시 신입도 7,000~9,000만원에 달합니다. AI 반도체(HBM) 호황으로 2024~2026년 성과급이 크게 증가했습니다.",
      },
      {
        q: "반도체 업계에서 어떤 전공이 유리한가요?",
        a: "전기·전자공학, 재료공학, 물리학, 화학공학 등이 유리합니다. 반도체 설계(팹리스)는 전자공학, 공정·양산은 화공·재료, 장비는 기계·전기 전공이 많습니다.",
      },
    ],
    keywords: ["반도체 업계 연봉", "반도체 회사 연봉", "삼성전자 연봉", "SK하이닉스 연봉", "반도체 취업 연봉"],
    trend: "rising",
    trendNote: "AI 칩·HBM 수요 폭증으로 2025~2026년 성과급 사상 최고 수준. 신입 영끌 연봉 9,000만원 돌파.",
  },
  {
    id: "finance-banking",
    name: "금융·은행",
    nameEn: "Finance & Banking",
    emoji: "💰",
    salary: {
      entry: { min: 4000, max: 6000, avg: 5000 },
      junior: { min: 5500, max: 8500, avg: 7000 },
      senior: { min: 8000, max: 15000, avg: 10500 },
      overall: 7500,
    },
    description:
      "KB·신한·하나·우리·농협 5대 시중은행과 증권사·자산운용사·보험사·카드사를 포함하는 금융 전반 업계.",
    topCompanyIds: ["kb-bank", "shinhan-bank", "hana-bank", "woori-bank", "korea-investment", "samsung-securities"],
    topJobIds: ["banker", "investment-banker", "fund-manager", "actuary"],
    faqs: [
      {
        q: "금융권 평균 연봉은 얼마인가요?",
        a: "국내 금융권 전체 평균 연봉은 약 7,500만원입니다. 투자은행(IB)·자산운용사 전문직은 1억~2억원 이상이며, 일반 은행 행원은 5,000~7,000만원 수준입니다.",
      },
      {
        q: "금융권에서 가장 연봉이 높은 직무는 무엇인가요?",
        a: "IB 딜러·펀드매니저·보험계리사·리서치 애널리스트가 상위권입니다. 증권사 IB팀과 외국계 은행은 성과 보너스 포함 시 2억~5억원도 가능합니다.",
      },
    ],
    keywords: ["금융권 연봉", "은행원 연봉", "금융업 연봉", "증권사 연봉", "금융 업계 연봉 2026"],
    trend: "stable",
    trendNote: "금리 변동에 따른 이자수익 영향. 핀테크 영향으로 디지털 전환 가속, 관련 직무 수요 증가.",
  },
  {
    id: "pharmaceutical-biotech",
    name: "제약·바이오",
    nameEn: "Pharmaceutical & Biotech",
    emoji: "🧬",
    salary: {
      entry: { min: 4000, max: 6000, avg: 4800 },
      junior: { min: 5500, max: 8000, avg: 6800 },
      senior: { min: 8000, max: 15000, avg: 10500 },
      overall: 7000,
    },
    description:
      "한미약품·유한양행·셀트리온·삼성바이오로직스 등 국내 대형 제약·바이오 기업과 글로벌 외국계 제약사가 포함된 업계.",
    topCompanyIds: ["hanmi-pharm", "yuhan", "celltrion", "samsung-bioepis"],
    topJobIds: ["biotech-researcher", "clinical-researcher", "pharmacist"],
    faqs: [
      {
        q: "제약·바이오 업계 연봉은 얼마인가요?",
        a: "국내 제약·바이오 업계 평균 연봉은 약 7,000만원입니다. 삼성바이오로직스·셀트리온 등 대형 바이오기업은 연봉이 높고, 외국계 제약사(한국MSD·화이자코리아 등)는 성과 보너스 포함 시 1억원 이상도 가능합니다.",
      },
    ],
    keywords: ["제약 업계 연봉", "바이오 업계 연봉", "제약사 연봉", "바이오텍 연봉", "제약회사 연봉"],
    trend: "rising",
    trendNote: "K-바이오 글로벌 기술수출 증가, ADC·세포유전자치료 분야 전문 인력 부족으로 연봉 상승 중.",
  },
  {
    id: "automotive",
    name: "자동차·모빌리티",
    nameEn: "Automotive & Mobility",
    emoji: "🚗",
    salary: {
      entry: { min: 4500, max: 6500, avg: 5500 },
      junior: { min: 6000, max: 9000, avg: 7500 },
      senior: { min: 8500, max: 14000, avg: 11000 },
      overall: 8000,
    },
    description:
      "현대차·기아·한국GM·르노코리아 등 완성차 메이커와 현대모비스·만도·현대위아 등 자동차 부품사를 포함하는 제조 업계.",
    topCompanyIds: ["hyundai-motor", "kia"],
    topJobIds: ["automotive-engineer", "mechanical-engineer", "electrical-engineer"],
    faqs: [
      {
        q: "자동차 업계 연봉은 얼마인가요?",
        a: "현대차·기아 신입 엔지니어 영끌 연봉은 약 5,500~7,000만원이며, 노조 협약에 따른 상여금이 높습니다. 전기차·자율주행 전문 엔지니어는 수요 증가로 연봉이 빠르게 오르고 있습니다.",
      },
    ],
    keywords: ["자동차 업계 연봉", "현대차 연봉", "기아 연봉", "자동차 부품사 연봉", "모빌리티 연봉"],
    trend: "stable",
    trendNote: "전통 내연기관 수요 감소, EV 전환 과도기. 소프트웨어 정의 차량(SDV) 엔지니어 수요 급증.",
  },
  {
    id: "construction",
    name: "건설·건축",
    nameEn: "Construction & Architecture",
    emoji: "🏗️",
    salary: {
      entry: { min: 3000, max: 4500, avg: 3700 },
      junior: { min: 4500, max: 6500, avg: 5500 },
      senior: { min: 6500, max: 11000, avg: 8500 },
      overall: 5700,
    },
    description:
      "현대건설·삼성물산·대우건설·GS건설·롯데건설 등 대형 건설사와 건축 설계사무소를 포함하는 업계.",
    topCompanyIds: ["daewoo-construction", "gs-construction"],
    topJobIds: ["civil-engineer", "architect"],
    faqs: [
      {
        q: "건설 업계 연봉은 얼마인가요?",
        a: "대형 건설사(현대건설·삼성물산) 신입 연봉은 약 4,500~5,500만원이며, 해외현장 수당이 붙으면 더 높습니다. 중소 건설사는 3,000~4,000만원 수준입니다.",
      },
    ],
    keywords: ["건설 업계 연봉", "건설회사 연봉", "건설사 연봉", "건축 연봉", "토목 연봉"],
    trend: "stable",
    trendNote: "국내 건설경기 침체에도 해외 플랜트·인프라 수주 증가로 글로벌 인력 수요 유지.",
  },
  {
    id: "game",
    name: "게임",
    nameEn: "Game Industry",
    emoji: "🎮",
    salary: {
      entry: { min: 4000, max: 5800, avg: 4800 },
      junior: { min: 5500, max: 8500, avg: 6800 },
      senior: { min: 8000, max: 15000, avg: 11000 },
      overall: 7500,
    },
    description:
      "크래프톤·엔씨소프트·넥슨·넷마블·스마일게이트 등 국내 대형 게임사와 수백 개의 중소 게임 개발사를 포함하는 업계.",
    topCompanyIds: ["krafton", "ncsoft", "nexon"],
    topJobIds: ["game-developer", "game-designer"],
    faqs: [
      {
        q: "게임 업계 연봉은 얼마인가요?",
        a: "크래프톤·엔씨소프트·넥슨 등 대형 게임사 신입 연봉은 성과급 포함 4,500~6,000만원이며, 경력 시니어 개발자는 1억원 이상입니다. 스타트업 게임사는 스톡옵션으로 보상하는 경우가 많습니다.",
      },
    ],
    keywords: ["게임 업계 연봉", "게임회사 연봉", "게임 개발자 연봉", "게임사 연봉", "크래프톤 연봉"],
    trend: "stable",
    trendNote: "모바일 게임 성장 둔화, 콘솔·PC 대작과 AI 게임 기술 투자 증가. 글로벌 진출 기업 연봉 상승.",
  },
  {
    id: "media-entertainment",
    name: "미디어·엔터테인먼트",
    nameEn: "Media & Entertainment",
    emoji: "🎬",
    salary: {
      entry: { min: 3000, max: 4500, avg: 3700 },
      junior: { min: 4500, max: 6500, avg: 5500 },
      senior: { min: 6500, max: 12000, avg: 8500 },
      overall: 5800,
    },
    description:
      "CJ ENM·JTBC·SBS·MBC·KBS·SM엔터·YG엔터·HYBE 등 방송·OTT·음악·영화 엔터테인먼트 업계.",
    topCompanyIds: [],
    topJobIds: ["journalist", "producer-director"],
    faqs: [
      {
        q: "미디어·엔터 업계 연봉은 얼마인가요?",
        a: "방송사 신입 PD·기자 연봉은 3,500~5,500만원이며, K-콘텐츠 글로벌 흥행으로 OTT 오리지널 제작사는 더 높습니다. 아이돌 매니지먼트(HYBE·SM 등)는 성과 보너스가 클 수 있습니다.",
      },
    ],
    keywords: ["미디어 업계 연봉", "엔터테인먼트 연봉", "방송사 연봉", "OTT 연봉", "엔터 연봉"],
    trend: "rising",
    trendNote: "K-드라마·K-팝 글로벌 흥행으로 콘텐츠 IP 수익 급증. 넷플릭스·디즈니+ 한국 투자 확대.",
  },
  {
    id: "public-enterprise",
    name: "공기업·공공기관",
    nameEn: "Public Enterprise",
    emoji: "🏛️",
    salary: {
      entry: { min: 3500, max: 5000, avg: 4200 },
      junior: { min: 4800, max: 7000, avg: 5800 },
      senior: { min: 6500, max: 10000, avg: 8000 },
      overall: 6200,
    },
    description:
      "한국전력·코레일·가스공사·수자원공사·토지주택공사 등 국가·지방 공기업과 공공기관. 안정성·복지·연금이 강점.",
    topCompanyIds: ["kepco", "korail"],
    topJobIds: ["civil-servant-5", "electrical-engineer"],
    faqs: [
      {
        q: "공기업 연봉은 얼마인가요?",
        a: "한전·코레일·수자원공사 등 주요 공기업 신입 연봉은 4,000~5,500만원이며, 경력 10년 이상은 7,000~1억원 수준입니다. 성과급·복지포인트·연금 등 복지가 우수합니다.",
      },
      {
        q: "공기업 취업하려면 어떻게 해야 하나요?",
        a: "공기업 채용은 NCS(국가직무능력표준) 필기시험→서류→면접 순서로 진행됩니다. 전공 직렬마다 시험 과목이 다르며, 한국사·한국어능력시험 자격증이 필요한 경우가 많습니다.",
      },
    ],
    keywords: ["공기업 연봉", "공공기관 연봉", "공기업 평균 연봉", "한국전력 연봉", "코레일 연봉"],
    trend: "stable",
    trendNote: "공기업 경영 효율화 정책으로 신규 채용 규모 축소 추세. 연봉 안정성은 유지.",
  },
  {
    id: "education",
    name: "교육",
    nameEn: "Education",
    emoji: "📚",
    salary: {
      entry: { min: 2800, max: 4000, avg: 3300 },
      junior: { min: 3500, max: 5000, avg: 4200 },
      senior: { min: 4500, max: 7000, avg: 5800 },
      overall: 4400,
    },
    description:
      "국공립·사립학교 교원, 대학교수, 학원·에듀테크 기업, EBS·대교·웅진씽크빅 등 교육 서비스 전반.",
    topCompanyIds: [],
    topJobIds: ["elementary-teacher", "secondary-teacher", "professor"],
    faqs: [
      {
        q: "교육 업계 평균 연봉은 얼마인가요?",
        a: "국공립 교원은 공무원 봉급표 기준으로 3,000~6,000만원이며, 대학교수는 5,500~1억2,000만원, 학원강사는 역량과 학생 수에 따라 2,500만원~수억원까지 편차가 큽니다.",
      },
    ],
    keywords: ["교육 업계 연봉", "교원 연봉", "학원강사 연봉", "에듀테크 연봉", "교육회사 연봉"],
    trend: "stable",
    trendNote: "저출산으로 학생 수 감소, 에듀테크(AI 튜터) 성장. 온라인 교육 플랫폼 강사 수입 양극화.",
  },
  {
    id: "ecommerce-retail",
    name: "이커머스·유통",
    nameEn: "E-commerce & Retail",
    emoji: "🛒",
    salary: {
      entry: { min: 3200, max: 4800, avg: 3900 },
      junior: { min: 4800, max: 7000, avg: 5800 },
      senior: { min: 7000, max: 12000, avg: 9000 },
      overall: 6000,
    },
    description:
      "쿠팡·SSG닷컴·11번가·롯데쇼핑·신세계·GS리테일 등 온라인·오프라인 유통 및 이커머스 업계.",
    topCompanyIds: ["coupang"],
    topJobIds: ["marketer", "logistics-manager"],
    faqs: [
      {
        q: "이커머스·유통 업계 연봉은 얼마인가요?",
        a: "쿠팡·SSG 등 대형 이커머스 테크 직군은 IT기업 수준(신입 4,500~6,000만원)이며, 일반 MD·마케터는 3,500~5,000만원 수준입니다. 오프라인 유통은 상대적으로 낮습니다.",
      },
    ],
    keywords: ["이커머스 연봉", "유통 업계 연봉", "쿠팡 연봉", "유통회사 연봉", "온라인 쇼핑몰 연봉"],
    trend: "stable",
    trendNote: "코로나 이후 이커머스 정상화, 물류 자동화 투자 증가. 테크 인력 수요는 꾸준히 높음.",
  },
  {
    id: "consulting-accounting",
    name: "컨설팅·회계법인",
    nameEn: "Consulting & Accounting",
    emoji: "📊",
    salary: {
      entry: { min: 6000, max: 9000, avg: 7000 },
      junior: { min: 9000, max: 15000, avg: 11500 },
      senior: { min: 15000, max: 40000, avg: 25000 },
      overall: 13000,
    },
    description:
      "McKinsey·BCG·Bain 전략컨설팅과 삼일PwC·삼정KPMG·안진Deloitte·한영EY 등 Big4 회계법인을 포함하는 고연봉 전문 서비스 업계.",
    topCompanyIds: [],
    topJobIds: ["management-consultant", "cpa"],
    faqs: [
      {
        q: "컨설팅·회계법인 연봉은 얼마인가요?",
        a: "McKinsey·BCG 빅3 신입 어소시에이트는 성과 보너스 포함 1억~1억5,000만원이며, Big4 회계법인 신입 회계사는 5,000~7,000만원, 시니어 매니저는 1억~1억5,000만원입니다.",
      },
    ],
    keywords: ["컨설팅 연봉", "회계법인 연봉", "컨설팅 회사 연봉", "McKinsey 연봉", "Big4 연봉"],
    trend: "rising",
    trendNote: "디지털 전환·AI 전략 수요 증가로 컨설팅 수요 급증. 데이터·기술 컨설팅 파트너 처우 급등.",
  },
  {
    id: "healthcare",
    name: "의료·헬스케어",
    nameEn: "Healthcare",
    emoji: "🏥",
    salary: {
      entry: { min: 3000, max: 5000, avg: 3800 },
      junior: { min: 4500, max: 8000, avg: 6000 },
      senior: { min: 7000, max: 20000, avg: 12000 },
      overall: 7500,
    },
    description:
      "서울대병원·세브란스·삼성서울병원·서울아산병원 등 대형 병원과 의원·약국·보건소·디지털헬스케어 스타트업을 포함하는 업계.",
    topCompanyIds: ["seoul-national-university-hospital", "asan-medical-center", "samsung-seoul-hospital"],
    topJobIds: ["doctor", "nurse", "pharmacist", "physical-therapist"],
    faqs: [
      {
        q: "의료·헬스케어 업계 평균 연봉은 얼마인가요?",
        a: "의사·약사 등 면허직은 1억원 이상도 흔하지만, 간호사·의료기사 등 보건의료직은 3,500~5,500만원 수준입니다. 상급종합병원은 야간·교대 수당이 추가됩니다.",
      },
    ],
    keywords: ["의료 업계 연봉", "병원 연봉", "헬스케어 연봉", "의료직 연봉", "병원 직원 연봉"],
    trend: "rising",
    trendNote: "고령화로 의료 수요 증가. 디지털헬스·원격의료 스타트업 투자 활성화로 IT 의료 인력 수요 급증.",
  },
  {
    id: "steel-heavy-industry",
    name: "철강·중공업",
    nameEn: "Steel & Heavy Industry",
    emoji: "⚙️",
    salary: {
      entry: { min: 4000, max: 5500, avg: 4700 },
      junior: { min: 5500, max: 7500, avg: 6500 },
      senior: { min: 7500, max: 12000, avg: 9500 },
      overall: 7000,
    },
    description:
      "포스코·현대제철·한국조선해양·현대중공업 등 철강·조선·중공업 대기업. 노조 협약 덕분에 상여금이 높은 편.",
    topCompanyIds: ["posco"],
    topJobIds: ["mechanical-engineer", "chemical-engineer", "civil-engineer"],
    faqs: [
      {
        q: "철강·중공업 업계 연봉은 얼마인가요?",
        a: "포스코·현대중공업 등 대형사 신입 연봉은 상여금 포함 5,000~6,500만원이며, 경력 10년 이상은 8,000~1억2,000만원 수준입니다. 노조 협약으로 상여·복리후생이 탄탄합니다.",
      },
    ],
    keywords: ["철강 업계 연봉", "중공업 연봉", "조선 업계 연봉", "포스코 연봉", "현대중공업 연봉"],
    trend: "stable",
    trendNote: "조선업 LNG선·컨테이너선 수주 회복세. 수소·친환경 에너지 전환으로 신규 투자 증가.",
  },
  {
    id: "chemical-energy",
    name: "화학·에너지·정유",
    nameEn: "Chemical & Energy",
    emoji: "⚡",
    salary: {
      entry: { min: 4200, max: 5800, avg: 4900 },
      junior: { min: 5800, max: 8000, avg: 6800 },
      senior: { min: 8000, max: 13000, avg: 10000 },
      overall: 7200,
    },
    description:
      "LG화학·롯데케미칼·SK이노베이션·한화솔루션·GS칼텍스·S-OIL 등 석유화학·배터리·정유·신재생에너지 기업.",
    topCompanyIds: ["lg-chem", "lotte-chemical"],
    topJobIds: ["chemical-engineer"],
    faqs: [
      {
        q: "화학·에너지 업계 연봉은 얼마인가요?",
        a: "LG화학·롯데케미칼 등 대형 화학사 신입 연봉은 성과급 포함 5,000~6,500만원이며, 배터리(LG에너지솔루션·삼성SDI) 부문은 IT기업 수준으로 연봉이 높습니다.",
      },
    ],
    keywords: ["화학 업계 연봉", "에너지 업계 연봉", "정유사 연봉", "배터리 업계 연봉", "LG화학 연봉"],
    trend: "rising",
    trendNote: "전기차 배터리 수요 증가로 배터리 업계 연봉 급등. 수소·탄소중립 관련 신규 투자 확대.",
  },
  {
    id: "insurance",
    name: "보험",
    nameEn: "Insurance",
    emoji: "🛡️",
    salary: {
      entry: { min: 3500, max: 5000, avg: 4200 },
      junior: { min: 5000, max: 7500, avg: 6000 },
      senior: { min: 7000, max: 13000, avg: 9500 },
      overall: 6500,
    },
    description:
      "삼성생명·삼성화재·한화생명·교보생명·현대해상 등 생명보험·손해보험사. 설계사부터 계리·언더라이팅 전문직까지.",
    topCompanyIds: ["samsung-life", "samsung-fire"],
    topJobIds: ["actuary", "financial-analyst"],
    faqs: [
      {
        q: "보험 업계 연봉은 얼마인가요?",
        a: "삼성생명·삼성화재 등 대형 보험사 사무직 신입 연봉은 4,000~5,500만원이며, 보험계리사·언더라이터 전문직은 6,000만원 이상입니다. 보험 설계사(GA·전속)는 실적 기반 인센티브로 수입이 천차만별입니다.",
      },
    ],
    keywords: ["보험 업계 연봉", "보험회사 연봉", "보험사 연봉", "삼성생명 연봉", "보험설계사 수입"],
    trend: "stable",
    trendNote: "저금리·저출산으로 생보업계 고전. 비대면·디지털 보험 성장으로 IT 인력 수요 증가.",
  },
];

export function getIndustryById(id: string): IndustryProfile | undefined {
  return industriesData.find((i) => i.id === id);
}
