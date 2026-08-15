import { CompanyProfile } from "@/types/company";

export const krCompanies_Batch9: CompanyProfile[] = [
  // --- BANKING ---
  {
    id: "shinhan-bank",
    disclosed: {
      avgSalaryManwon: 12300,
      fiscalYear: "2025",
      avgTenureYears: 15.4,
      source:
        "이데일리 2026-03-19 '4대 은행장 연봉킹' — 2025년 사업보고서 공시 인용 (근속 15년5개월)",
      sourceUrl: "https://v.daum.net/v/20260319111404479",
      note: "남성 평균 1억4,400만원으로 4대 은행 중 남성 최고.",
    },
    name: { ko: "신한은행", en: "Shinhan Bank" },
    industry: "Banking",
    tier: "conglomerate",
    logo: "🏦",
    description: "리딩뱅크. 더 쉽고 편안한, 더 새로운 금융.",
    salary: {
      entry: { base: 54000000, incentive: { target: 15, max: 30, avgAmount: 10000000 } },
      junior: { base: 68000000, incentive: { target: 15, max: 30, avgAmount: 14000000 } },
      senior: { base: 92000000, incentive: { target: 15, max: 35, avgAmount: 22000000 } },
      lead: { base: 125000000, incentive: { target: 20, max: 40, avgAmount: 35000000 } },
      executive: { base: 230000000, incentive: { target: 35, max: 70, avgAmount: 90000000 } },
    },
    // 직급별 연봉 — 보수체계 연차보고서 공시(뉴스1 2026-03)·금감원 국감자료(이데일리 2023-10)·
    // KPI뉴스 2023-08(신입 초봉) 기반. 추정 창작 금지.
    careerLevels: [
      {
        group: "행원 → 책임자 → 관리자 (공시·보도 기준)",
        promotionNote:
          "직급 사다리는 행원-대리-과장-차장-부부장-부장(지점장) 순이며 2021년부터 호칭만 프로·매니저 등으로 변경(이데일리·헤럴드경제). 행원·책임자·관리자급 수치는 보수체계 연차보고서 공시 기반 평균 총급여(2024년)로, 성과급 포함 총액이며 계약직을 분리하지 않은 통계라 정규 행원 실제값보다 낮게 집계됐을 수 있음.",
        steps: [
          {
            label: "신입 행원 (초봉)",
            description:
              "1년차. 대졸 신입 초봉 5,090만원(KPI뉴스 2023-08, 금감원·채용플랫폼 집계). 뉴스투데이 2020-08 보도에서도 신입 5,500만원(잡코리아·금감원)",
            totalManwon: 5090,
          },
          {
            label: "행원급 평균",
            description:
              "1~8년차 안팎. 2024년 기준 남 7,500·여 6,800만원(표기값은 중간값) — 보수체계 연차보고서 공시, 뉴스1 2026-03 보도",
            totalManwon: 7150,
          },
          {
            label: "책임자급 (과장·차장)",
            description:
              "8~15년차 안팎. 2024년 기준 남 1억3,500·여 1억2,700만원(표기값은 중간값) — 보수체계 연차보고서 공시, 뉴스1 2026-03 보도",
            totalManwon: 13100,
          },
          {
            label: "관리자급 (부부장·부지점장 이상)",
            description:
              "20년차 이상. 2024년 기준 남 1억7,000·여 1억7,500만원(표기값은 중간값) — 보수체계 연차보고서 공시, 뉴스1 2026-03 보도",
            totalManwon: 17250,
          },
          {
            label: "지점장급 (상위 10% 평균)",
            description:
              "지점장·본부 부서장. 2022년 기준 상위 10% 평균 2억220만원 — 금감원 국정감사 자료, 이데일리 2023-10 보도. 전체 평균연봉은 2022년 1억1,297만원(동일 자료), 2025년 사업보고서 기준 1억2,300만원(뉴스투데이 2026-03)",
            totalManwon: 20220,
          },
        ],
      },
    ],
    workLife: { weeklyHours: { contract: 40, real: 44 }, vacation: { days: 20, usageRate: 80 }, remoteWork: { policy: "office", description: "영업점 중심 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 12000000 }, { category: "financial", title: "사내대출", description: "저금리 주택자금 대출", value: 5000000 }],
    culture: { score: 8.3, keywords: ["리딩뱅크", "안정", "성과급"], pros: ["국내 최고 수준의 은행 연봉과 성과급", "높은 고용 안정성", "탄탄한 복지 제도"], cons: ["영업점 실적 압박", "보수적인 조직 문화"] },
    lastUpdated: "2026-08-15",
  },
  {
    id: "kb-bank",
    disclosed: {
      avgSalaryManwon: 12300,
      fiscalYear: "2025",
      avgTenureYears: 17.3,
      source:
        "이데일리 2026-03-19 — 2025년 사업보고서 공시 인용 (근속 17년3개월, 4대 은행 중 최장)",
      sourceUrl: "https://v.daum.net/v/20260319111404479",
    },
    name: { ko: "KB국민은행", en: "KB Kookmin Bank" },
    industry: "Banking",
    tier: "conglomerate",
    logo: "🏦",
    description: "국민의 평생 금융 파트너. 리브 넥스트.",
    salary: {
      entry: { base: 54000000, incentive: { target: 15, max: 30, avgAmount: 10500000 } },
      junior: { base: 69000000, incentive: { target: 15, max: 30, avgAmount: 14500000 } },
      senior: { base: 93000000, incentive: { target: 15, max: 35, avgAmount: 23000000 } },
      lead: { base: 127000000, incentive: { target: 20, max: 40, avgAmount: 36000000 } },
      executive: { base: 235000000, incentive: { target: 35, max: 70, avgAmount: 92000000 } },
    },
    // 직급별 연봉 — 보수체계 연차보고서 공시(뉴스1 2026-03)·금감원 국감자료(이데일리 2023-10)·
    // KPI뉴스 2023-08(신입 초봉)·뉴스핌 2019-01(L0~L4 체계) 기반. 추정 창작 금지.
    careerLevels: [
      {
        group: "L1 행원 → L2 책임자 → L3 관리자 → L4 지점장 (공시·보도 기준)",
        promotionNote:
          "직급체계는 L0(사무직 전환)-L1(행원·대리)-L2(과·차장)-L3(수석차장·팀장·부지점장)-L4(지점장) — 뉴스핌 2019-01. L1~L3 수치는 보수체계 연차보고서 공시 기반 평균 총급여(2025년)로 성과급 포함 총액. 국민은행은 행원급과 계약직을 분리 집계.",
        steps: [
          {
            label: "신입 행원 (L1 초임)",
            description:
              "1년차. 대졸 신입 초봉 5,110만원(KPI뉴스 2023-08, 금감원·채용플랫폼 집계). 뉴스투데이 2020-08 보도에서는 신입 5,500만원",
            totalManwon: 5110,
          },
          {
            label: "행원급 평균 (L1, 행원·대리)",
            description:
              "1~8년차 안팎. 2025년 기준 남 9,000·여 9,500만원(표기값은 중간값, 여성이 더 높음) — 보수체계 연차보고서 공시, 뉴스1 2026-03 보도",
            totalManwon: 9250,
          },
          {
            label: "책임자급 (L2, 과장·차장)",
            description:
              "8~15년차 안팎. 2025년 기준 남 1억4,000·여 1억3,800만원(표기값은 중간값) — 보수체계 연차보고서 공시, 뉴스1 2026-03 보도. 2020년 차장급 8,914만원 보도(뉴스투데이, 잡코리아 기반)와 비교하면 5년 새 큰 폭 상승",
            totalManwon: 13900,
          },
          {
            label: "관리자급 (L3 이상, 팀장·부지점장)",
            description:
              "15~20년차 이상. 2025년 기준 남 1억8,800·여 1억8,100만원(표기값은 중간값) — 보수체계 연차보고서 공시, 뉴스1 2026-03 보도. 이데일리 2023-10(국감자료)도 입행 15년차 팀장·부지점장급 평균 약 1억5,000만원으로 보도",
            totalManwon: 18450,
          },
          {
            label: "지점장급 (L4, 상위 10% 평균)",
            description:
              "지점장·본부 부서장. 2022년 기준 상위 10% 평균 2억941만원 — 5대 은행 중 1위. 금감원 국정감사 자료, 이데일리·비즈니스포스트 2023-10 보도. 전체 평균연봉은 2022년 1억2,292만원(동일 자료)",
            totalManwon: 20941,
          },
        ],
      },
    ],
    workLife: { weeklyHours: { contract: 40, real: 44 }, vacation: { days: 20, usageRate: 78 }, remoteWork: { policy: "office", description: "영업점 중심 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 12000000 }, { category: "health", title: "종합건강검진", description: "본인·배우자 검진 지원", value: 1500000 }],
    culture: { score: 8.2, keywords: ["1등은행", "안정", "복지"], pros: ["국내 1위 은행의 압도적 규모와 안정성", "업계 최상위 복지 수준", "다양한 직무 경험 기회"], cons: ["조직 규모가 커 의사결정이 느림", "영업 실적 부담"] },
    lastUpdated: "2026-08-15",
  },
  {
    id: "woori-bank",
    disclosed: {
      avgSalaryManwon: 12200,
      fiscalYear: "2025",
      avgTenureYears: 16.3,
      source:
        "이데일리 2026-03-19 — 2025년 사업보고서 공시 인용 (근속 16년4개월)",
      sourceUrl: "https://v.daum.net/v/20260319111404479",
      note: "4대 은행 중 유일한 1억2,200만원(나머지 3사는 1억2,300만원).",
    },
    name: { ko: "우리은행", en: "Woori Bank" },
    industry: "Banking",
    tier: "conglomerate",
    logo: "🏦",
    description: "우리나라 1등 은행을 향한 도전. 우리 WON.",
    salary: {
      entry: { base: 52000000, incentive: { target: 15, max: 30, avgAmount: 9000000 } },
      junior: { base: 66000000, incentive: { target: 15, max: 30, avgAmount: 13000000 } },
      senior: { base: 89000000, incentive: { target: 15, max: 35, avgAmount: 20000000 } },
      lead: { base: 120000000, incentive: { target: 20, max: 40, avgAmount: 32000000 } },
      executive: { base: 220000000, incentive: { target: 35, max: 70, avgAmount: 85000000 } },
    },
    // 직급별 연봉 — 2025년 지배구조 및 보수체계 연차보고서 공시(데일리머니 2026-03·뉴스1 2026-03·
    // 머니투데이 2026-03) 기반. 추정 창작 금지.
    careerLevels: [
      {
        group: "행원급 → 책임자급 → 관리자급 (2025년 공시 기준)",
        promotionNote:
          "직급 사다리는 행원(행원A·행원B/계장~대리) → 책임자(과장·차장) → 관리자(부부장·부장·지점장 이상) 순. 수치는 2025년 지배구조 및 보수체계 연차보고서 공시 기반 평균 총급여(성과급 포함)이며, 연차 범위는 통상적 승진 관행 기준 안내값. 신입 첫해 총보상은 시중은행 통상 6,500만~7,000만원 수준(성과급·복지성 급여 포함, 머니투데이 2026-05 보도).",
        steps: [
          {
            label: "행원급 (행원A·행원B/계장~대리)",
            description:
              "입행 1~9년차 안팎. 2025년 기준 행원급 이하 평균 총급여 남 8,300만·여 8,400만원 — 보수체계 연차보고서 공시, 데일리머니 2026-03·뉴스1 2026-03 보도",
            totalManwon: 8400,
          },
          {
            label: "책임자급 (과장·차장)",
            description:
              "10~19년차 안팎. 2025년 기준 책임자급 평균 총급여 남녀 동일 1억3,500만원 — 보수체계 연차보고서 공시, 데일리머니 2026-03 보도",
            totalManwon: 13500,
          },
          {
            label: "관리자급 (부부장·부장·지점장 이상)",
            description:
              "20년차 이상 안팎. 2025년 기준 관리자급(부점장급 이상) 평균 총급여 남 1억8,300만·여 1억9,200만원(단순평균 약 1억8,600만원 표기) — 보수체계 연차보고서 공시, 데일리머니 2026-03 보도. 전체 임직원 평균 보수는 약 1억2,100만원(2025)",
            totalManwon: 18600,
          },
        ],
      },
    ],
    workLife: { weeklyHours: { contract: 40, real: 45 }, vacation: { days: 20, usageRate: 76 }, remoteWork: { policy: "office", description: "영업점 중심 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 11000000 }, { category: "lifestyle", title: "휴양시설", description: "제휴 콘도·리조트 이용", value: 1000000 }],
    culture: { score: 7.9, keywords: ["전통", "안정", "보수적"], pros: ["역사 깊은 시중은행의 안정성", "탄탄한 학자금·대출 복지", "공채 기수 문화의 끈끈함"], cons: ["4대 은행 중 보수적인 편", "영업점 실적 압박"] },
    lastUpdated: "2026-08-15",
  },
  {
    id: "kbank",
    name: { ko: "케이뱅크", en: "Kbank" },
    industry: "Banking",
    tier: "unicorn",
    logo: "💜",
    description: "대한민국 1호 인터넷전문은행.",
    salary: {
      entry: { base: 50000000, incentive: { target: 15, max: 35, avgAmount: 8000000 } },
      junior: { base: 64000000, incentive: { target: 15, max: 35, avgAmount: 12000000 } },
      senior: { base: 87000000, incentive: { target: 15, max: 40, avgAmount: 20000000 } },
      lead: { base: 118000000, incentive: { target: 20, max: 45, avgAmount: 32000000 } },
      executive: { base: 200000000, incentive: { target: 35, max: 70, avgAmount: 75000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 44 }, vacation: { days: 20, usageRate: 82 }, remoteWork: { policy: "hybrid", daysPerWeek: 2, description: "주 2회 재택 가능" } },
    benefits: [{ category: "growth", title: "자기계발비", description: "직무 교육·도서 지원", value: 1500000 }, { category: "lifestyle", title: "복지포인트", description: "연 복지포인트 지급", value: 1500000 }],
    culture: { score: 7.8, keywords: ["인터넷은행", "성장", "디지털"], pros: ["1호 인터넷은행의 빠른 디지털 환경", "전통 은행 대비 수평적인 문화", "성장 국면의 사업 확장 기회"], cons: ["경쟁사 대비 낮은 인지도와 규모", "조직·시스템이 아직 정비 중"] },
    lastUpdated: "2026-05-15",
  },

  // --- FINTECH ---
  {
    id: "kakaopay",
    name: { ko: "카카오페이", en: "Kakao Pay" },
    industry: "Fintech",
    tier: "unicorn",
    logo: "💛",
    description: "일상을 바꾸는 금융. 누구나 쉬운 금융 생활.",
    salary: {
      entry: { base: 55000000, incentive: { target: 10, max: 25, avgAmount: 6000000 } },
      junior: { base: 70000000, incentive: { target: 10, max: 25, avgAmount: 10000000 } },
      senior: { base: 96000000, incentive: { target: 15, max: 30, avgAmount: 18000000 } },
      lead: { base: 132000000, incentive: { target: 15, max: 35, avgAmount: 30000000 } },
      executive: { base: 210000000, incentive: { target: 30, max: 60, avgAmount: 70000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 43 }, vacation: { days: 20, usageRate: 88 }, remoteWork: { policy: "hybrid", daysPerWeek: 2, description: "유연한 하이브리드 근무" } },
    benefits: [{ category: "financial", title: "스톡옵션", description: "핵심 인재 대상 부여", value: 10000000 }, { category: "lifestyle", title: "복지포인트", description: "연 복지포인트 지급", value: 2000000 }],
    culture: { score: 8.0, keywords: ["핀테크", "수평", "디지털"], pros: ["수평적이고 자율적인 IT 문화", "카카오 생태계 기반 성장성", "유연한 하이브리드 근무"], cons: ["주가 변동에 따른 보상 불확실성", "규제 환경 변화 리스크"] },
    lastUpdated: "2026-05-15",
  },
  {
    id: "shinhan-card",
    name: { ko: "신한카드", en: "Shinhan Card" },
    industry: "Fintech",
    tier: "conglomerate",
    logo: "💳",
    description: "업계 1위 카드사. 신한플레이로 잇는 일상.",
    salary: {
      entry: { base: 53000000, incentive: { target: 15, max: 30, avgAmount: 11000000 } },
      junior: { base: 67000000, incentive: { target: 15, max: 30, avgAmount: 15000000 } },
      senior: { base: 91000000, incentive: { target: 15, max: 35, avgAmount: 22000000 } },
      lead: { base: 122000000, incentive: { target: 20, max: 40, avgAmount: 34000000 } },
      executive: { base: 215000000, incentive: { target: 35, max: 65, avgAmount: 80000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 43 }, vacation: { days: 20, usageRate: 83 }, remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "부서별 재택 운영" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 11000000 }, { category: "health", title: "종합건강검진", description: "본인·배우자 검진 지원", value: 1500000 }],
    culture: { score: 8.1, keywords: ["1위카드사", "안정", "데이터"], pros: ["카드업계 1위의 안정성과 보상", "신한금융 계열의 탄탄한 복지", "데이터 기반 사업 역량"], cons: ["가맹점 수수료 규제 부담", "영업 실적 압박"] },
    lastUpdated: "2026-05-15",
  },

  // --- SECURITIES ---
  {
    id: "toss-securities",
    name: { ko: "토스증권", en: "Toss Securities" },
    industry: "Securities",
    tier: "unicorn",
    logo: "🔵",
    description: "누구나 쉽게, 토스로 시작하는 투자.",
    salary: {
      entry: { base: 58000000, incentive: { target: 10, max: 30, avgAmount: 8000000 } },
      junior: { base: 74000000, incentive: { target: 10, max: 30, avgAmount: 13000000 } },
      senior: { base: 100000000, incentive: { target: 15, max: 35, avgAmount: 22000000 } },
      lead: { base: 140000000, incentive: { target: 15, max: 40, avgAmount: 38000000 } },
      executive: { base: 230000000, incentive: { target: 30, max: 70, avgAmount: 85000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 46 }, vacation: { days: 20, usageRate: 80 }, remoteWork: { policy: "office", description: "본사 집중 근무" } },
    benefits: [{ category: "financial", title: "스톡옵션", description: "전직원 대상 부여", value: 15000000 }, { category: "lifestyle", title: "점심·간식 지원", description: "사내 식사·스낵바 제공", value: 2000000 }],
    culture: { score: 8.2, keywords: ["토스", "성장", "주도성"], pros: ["MTS 혁신을 이끈 빠른 성장세", "강한 주도성과 자율 문화", "전직원 스톡옵션 보상"], cons: ["높은 업무 강도와 성과 압박", "잦은 조직·우선순위 변화"] },
    lastUpdated: "2026-05-15",
  },
  {
    id: "nh-securities",
    name: { ko: "NH투자증권", en: "NH Investment & Securities" },
    industry: "Securities",
    tier: "conglomerate",
    logo: "📈",
    description: "초대형 IB. 고객의 자산을 키우는 투자 파트너.",
    salary: {
      entry: { base: 56000000, incentive: { target: 20, max: 60, avgAmount: 20000000 } },
      junior: { base: 72000000, incentive: { target: 20, max: 60, avgAmount: 28000000 } },
      senior: { base: 100000000, incentive: { target: 25, max: 80, avgAmount: 45000000 } },
      lead: { base: 140000000, incentive: { target: 30, max: 100, avgAmount: 65000000 } },
      executive: { base: 260000000, incentive: { target: 50, max: 150, avgAmount: 130000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 47 }, vacation: { days: 20, usageRate: 72 }, remoteWork: { policy: "office", description: "본사·지점 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 12000000 }, { category: "health", title: "종합건강검진", description: "본인·배우자 검진 지원", value: 1500000 }],
    culture: { score: 8.0, keywords: ["초대형IB", "성과급", "안정"], pros: ["초대형 IB의 높은 성과급 잠재력", "농협금융 계열의 안정성", "다양한 IB·WM 직무 경험"], cons: ["부서별 성과 편차가 큰 변동성", "IB·리테일 부서의 높은 강도"] },
    lastUpdated: "2026-05-15",
  },
  {
    id: "samsung-securities",
    name: { ko: "삼성증권", en: "Samsung Securities" },
    industry: "Securities",
    tier: "conglomerate",
    logo: "📊",
    description: "대한민국 자산관리 1위. 삼성의 금융 전문성.",
    salary: {
      entry: { base: 58000000, incentive: { target: 20, max: 60, avgAmount: 22000000 } },
      junior: { base: 74000000, incentive: { target: 20, max: 60, avgAmount: 30000000 } },
      senior: { base: 102000000, incentive: { target: 25, max: 80, avgAmount: 48000000 } },
      lead: { base: 145000000, incentive: { target: 30, max: 100, avgAmount: 68000000 } },
      executive: { base: 270000000, incentive: { target: 50, max: 150, avgAmount: 135000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 46 }, vacation: { days: 20, usageRate: 75 }, remoteWork: { policy: "office", description: "본사·지점 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 12000000 }, { category: "health", title: "종합건강검진", description: "삼성서울병원 검진 지원", value: 2000000 }],
    culture: { score: 8.3, keywords: ["삼성", "자산관리", "성과주의"], pros: ["삼성 브랜드의 자산관리 1위 위상", "업계 최상위 수준의 보상", "체계적인 교육과 시스템"], cons: ["강한 성과주의와 실적 압박", "삼성 특유의 엄격한 조직 문화"] },
    lastUpdated: "2026-05-15",
  },
  {
    id: "kb-securities",
    name: { ko: "KB증권", en: "KB Securities" },
    industry: "Securities",
    tier: "conglomerate",
    logo: "📈",
    description: "KB금융의 초대형 종합증권사.",
    salary: {
      entry: { base: 56000000, incentive: { target: 20, max: 55, avgAmount: 19000000 } },
      junior: { base: 71000000, incentive: { target: 20, max: 55, avgAmount: 26000000 } },
      senior: { base: 98000000, incentive: { target: 25, max: 75, avgAmount: 43000000 } },
      lead: { base: 138000000, incentive: { target: 30, max: 95, avgAmount: 62000000 } },
      executive: { base: 255000000, incentive: { target: 50, max: 140, avgAmount: 125000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 46 }, vacation: { days: 20, usageRate: 74 }, remoteWork: { policy: "office", description: "본사·지점 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 11000000 }, { category: "financial", title: "사내대출", description: "저금리 주택자금 대출", value: 5000000 }],
    culture: { score: 8.0, keywords: ["KB금융", "초대형IB", "안정"], pros: ["KB금융 계열의 안정적인 기반", "초대형 IB의 성과급 잠재력", "리테일·IB 균형 잡힌 사업 구조"], cons: ["부서별 성과·강도 편차", "보수적인 금융지주 문화"] },
    lastUpdated: "2026-05-15",
  },
  {
    id: "meritz-securities",
    name: { ko: "메리츠증권", en: "Meritz Securities" },
    industry: "Securities",
    tier: "conglomerate",
    logo: "🟠",
    description: "강한 성과주의로 압축 성장한 증권사.",
    salary: {
      entry: { base: 57000000, incentive: { target: 25, max: 80, avgAmount: 25000000 } },
      junior: { base: 73000000, incentive: { target: 25, max: 80, avgAmount: 35000000 } },
      senior: { base: 105000000, incentive: { target: 30, max: 100, avgAmount: 55000000 } },
      lead: { base: 150000000, incentive: { target: 40, max: 130, avgAmount: 85000000 } },
      executive: { base: 290000000, incentive: { target: 60, max: 200, avgAmount: 170000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 50 }, vacation: { days: 20, usageRate: 60 }, remoteWork: { policy: "office", description: "본사 집중 근무" } },
    benefits: [{ category: "financial", title: "성과 인센티브", description: "업계 최고 수준 성과급", value: 20000000 }, { category: "health", title: "종합건강검진", description: "본인 건강검진 지원", value: 1000000 }],
    culture: { score: 7.7, keywords: ["성과주의", "고강도", "보상"], pros: ["업계에서 가장 강력한 성과 보상", "성과를 내면 빠른 승진과 고연봉", "수익성 중심의 명확한 평가"], cons: ["매우 높은 업무 강도와 긴 근무시간", "성과 미달 시 강한 압박"] },
    lastUpdated: "2026-05-15",
  },

  // --- INSURANCE ---
  {
    id: "db-insurance",
    disclosed: {
      avgSalaryManwon: 13700,
      fiscalYear: "2025",
      avgTenureYears: 12.8,
      source:
        "뉴스투데이 2026-05-09 — 금융감독원 전자공시(DART) 2025년 사업보고서 기준 평균연봉 1억3,700만원, 근속 12년10개월",
      sourceUrl: "https://www.news2day.co.kr/article/20260506500138",
      note: "전년 1억1,800만원 대비 16% 급등(CEO스코어데일리 2026-04-03 보도 교차 부합).",
    },
    name: { ko: "DB손해보험", en: "DB Insurance" },
    industry: "Insurance",
    tier: "conglomerate",
    logo: "🛡️",
    description: "고객의 일상을 지키는 손해보험 리딩 컴퍼니.",
    salary: {
      entry: { base: 53000000, incentive: { target: 15, max: 35, avgAmount: 11000000 } },
      junior: { base: 67000000, incentive: { target: 15, max: 35, avgAmount: 15000000 } },
      senior: { base: 90000000, incentive: { target: 15, max: 40, avgAmount: 22000000 } },
      lead: { base: 122000000, incentive: { target: 20, max: 45, avgAmount: 34000000 } },
      executive: { base: 220000000, incentive: { target: 35, max: 70, avgAmount: 85000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 43 }, vacation: { days: 20, usageRate: 82 }, remoteWork: { policy: "office", description: "본사·지점 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 11000000 }, { category: "health", title: "종합건강검진", description: "본인·배우자 검진 지원", value: 1500000 }],
    culture: { score: 8.1, keywords: ["손보강자", "안정", "성과급"], pros: ["손해보험 상위권의 견고한 실적", "높은 성과급과 안정적인 고용", "탄탄한 학자금 복지"], cons: ["보수적인 보험업 조직 문화", "영업·실적 부서의 압박"] },
    lastUpdated: "2026-05-15",
  },
  {
    id: "hyundai-marine",
    name: { ko: "현대해상", en: "Hyundai Marine & Fire Insurance" },
    industry: "Insurance",
    tier: "conglomerate",
    logo: "🌊",
    description: "사람을 생각하는 손해보험. 하이카로 잇는 안심.",
    salary: {
      entry: { base: 52000000, incentive: { target: 15, max: 35, avgAmount: 10000000 } },
      junior: { base: 66000000, incentive: { target: 15, max: 35, avgAmount: 14000000 } },
      senior: { base: 89000000, incentive: { target: 15, max: 40, avgAmount: 21000000 } },
      lead: { base: 120000000, incentive: { target: 20, max: 45, avgAmount: 32000000 } },
      executive: { base: 215000000, incentive: { target: 35, max: 70, avgAmount: 80000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 43 }, vacation: { days: 20, usageRate: 83 }, remoteWork: { policy: "office", description: "본사·지점 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 11000000 }, { category: "lifestyle", title: "휴양시설", description: "제휴 콘도·리조트 이용", value: 1000000 }],
    culture: { score: 8.0, keywords: ["손보", "안정", "워라밸"], pros: ["손해보험 상위권의 안정적 기반", "보험업계 중 준수한 워라밸", "탄탄한 학자금·복지 제도"], cons: ["보수적인 보험업 문화", "영업 부서의 실적 압박"] },
    lastUpdated: "2026-05-15",
  },
  {
    id: "hanwha-life",
    name: { ko: "한화생명", en: "Hanwha Life" },
    industry: "Insurance",
    tier: "conglomerate",
    logo: "🧡",
    description: "라이프플러스. 고객의 삶에 플러스를 더하다.",
    salary: {
      entry: { base: 51000000, incentive: { target: 15, max: 30, avgAmount: 9000000 } },
      junior: { base: 64000000, incentive: { target: 15, max: 30, avgAmount: 12000000 } },
      senior: { base: 86000000, incentive: { target: 15, max: 35, avgAmount: 19000000 } },
      lead: { base: 116000000, incentive: { target: 20, max: 40, avgAmount: 30000000 } },
      executive: { base: 210000000, incentive: { target: 35, max: 65, avgAmount: 78000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 44 }, vacation: { days: 20, usageRate: 80 }, remoteWork: { policy: "office", description: "본사·지점 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 10000000 }, { category: "health", title: "종합건강검진", description: "본인·배우자 검진 지원", value: 1500000 }],
    culture: { score: 7.8, keywords: ["생보대형사", "안정", "보수적"], pros: ["생명보험 대형사의 안정적 고용", "한화그룹 계열의 복지 기반", "63빌딩 본사 등 우수한 근무 환경"], cons: ["저성장 생보업 특유의 정체감", "보수적이고 위계적인 조직 문화"] },
    lastUpdated: "2026-05-15",
  },
  {
    id: "kyobo-life",
    name: { ko: "교보생명", en: "Kyobo Life" },
    industry: "Insurance",
    tier: "conglomerate",
    logo: "📖",
    description: "고객 보장 중심의 생명보험. 사람이 미래다.",
    salary: {
      entry: { base: 51000000, incentive: { target: 15, max: 30, avgAmount: 9000000 } },
      junior: { base: 64000000, incentive: { target: 15, max: 30, avgAmount: 12500000 } },
      senior: { base: 87000000, incentive: { target: 15, max: 35, avgAmount: 19500000 } },
      lead: { base: 117000000, incentive: { target: 20, max: 40, avgAmount: 31000000 } },
      executive: { base: 210000000, incentive: { target: 35, max: 65, avgAmount: 79000000 } },
    },
    workLife: { weeklyHours: { contract: 40, real: 43 }, vacation: { days: 20, usageRate: 84 }, remoteWork: { policy: "office", description: "본사·지점 근무" } },
    benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액 지원", value: 10000000 }, { category: "growth", title: "도서·자기계발 지원", description: "교보문고 연계 도서 지원", value: 1000000 }],
    culture: { score: 8.0, keywords: ["생보대형사", "안정", "사람중심"], pros: ["생명보험 대형 3사의 안정성", "사람 중심의 비교적 온건한 문화", "준수한 워라밸과 휴가 사용률"], cons: ["저성장 생보업의 한계", "보수적인 의사결정 구조"] },
    lastUpdated: "2026-05-15",
  },
];
