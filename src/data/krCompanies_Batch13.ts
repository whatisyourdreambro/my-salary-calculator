import { CompanyProfile } from "@/types/company";

export const krCompanies_Batch13: CompanyProfile[] = [
  // ─── Public Finance (공공금융기관) ───────────────────────────────────────────
  {
    id: "kdb",
    name: { ko: "한국산업은행", en: "Korea Development Bank" },
    industry: "Public Finance",
    tier: "public",
    logo: "🏦",
    description: "국가 산업 발전을 위한 정책금융을 담당하는 국책은행. 기업 구조조정·산업 육성·해외 인프라 금융을 총괄.",
    salary: {
      entry: { base: 60000000, incentive: { target: 15, max: 35, avgAmount: 12000000 } },
      junior: { base: 74000000, incentive: { target: 15, max: 35, avgAmount: 14000000 } },
      senior: { base: 95000000, incentive: { target: 15, max: 35, avgAmount: 18000000 } },
      lead: { base: 120000000, incentive: { target: 15, max: 35, avgAmount: 23000000 } },
      executive: { base: 180000000, incentive: { target: 20, max: 45, avgAmount: 45000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 44 },
      vacation: { days: 22, usageRate: 85 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "본사(서울 여의도) 및 해외 지점 근무" },
    },
    benefits: [
      { category: "financial", title: "금융공기업 최고 수준 성과급", description: "목표 초과 달성 시 기본급의 최대 35% 성과급 지급", value: 12000000 },
      { category: "growth", title: "해외연수 및 자기계발비", description: "MBA·CFA 등 자격증 취득 및 해외연수 지원", value: 5000000 },
    ],
    culture: {
      score: 8.5,
      keywords: ["고연봉", "금융공기업", "안정", "전문직"],
      pros: ["공공금융 중 최고 수준의 연봉 패키지", "국가 산업 금융의 핵심 역할로 높은 직업적 자부심", "MBA·해외 파견 등 풍부한 성장 지원"],
      cons: ["높은 업무 강도와 야근 빈도", "기업 구조조정 등 스트레스성 업무 존재", "여의도 본사 중심으로 출퇴근 부담"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "exim-bank",
    name: { ko: "한국수출입은행", en: "Korea Export-Import Bank" },
    industry: "Public Finance",
    tier: "public",
    logo: "🌏",
    description: "수출입 및 해외 투자 촉진을 위한 정책금융을 공급하는 국책은행. 해외 인프라·방산·플랜트 금융을 전문으로 담당.",
    salary: {
      entry: { base: 58000000, incentive: { target: 15, max: 32, avgAmount: 11000000 } },
      junior: { base: 71000000, incentive: { target: 15, max: 32, avgAmount: 13000000 } },
      senior: { base: 90000000, incentive: { target: 15, max: 32, avgAmount: 17000000 } },
      lead: { base: 115000000, incentive: { target: 15, max: 32, avgAmount: 22000000 } },
      executive: { base: 172000000, incentive: { target: 20, max: 42, avgAmount: 42000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 44 },
      vacation: { days: 22, usageRate: 86 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "본사(서울 여의도) 및 해외 사무소 근무" },
    },
    benefits: [
      { category: "lifestyle", title: "해외 파견 지원", description: "해외 사무소 파견 시 주거비·교육비 전액 지원", value: 15000000 },
      { category: "financial", title: "복지포인트 및 학자금 지원", description: "연 150만원 복지포인트 + 자녀 학자금 지원", value: 3000000 },
    ],
    culture: {
      score: 8.3,
      keywords: ["글로벌", "금융", "안정", "전문직"],
      pros: ["해외 인프라 금융 분야 최고 수준의 전문성", "KDB에 근접하는 높은 연봉 수준", "해외 파견 기회 풍부"],
      cons: ["대형 프로젝트 딜 클로징 시 높은 업무 강도", "여의도 중심 근무로 출퇴근 부담", "공기업 특유의 보수적 의사결정 문화"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "nps",
    name: { ko: "국민연금공단", en: "National Pension Service" },
    industry: "Public Finance",
    tier: "public",
    logo: "🧓",
    description: "전 국민 노후 소득 보장을 위한 국민연금 제도를 운영하는 공공기관. 국내 최대 기관투자자로 약 1,000조원의 기금 운용.",
    // 알리오 2025년 결산 공시 + 공단 보수규정 원문(2026-03-06 개정, 별표1·6·7·8 전문 대조)
    // 확정치 — careerLevels 공기업 확대 (2026-08-31, 적대적 재검증 통과)
    disclosed: {
      avgSalaryManwon: 7646,
      fiscalYear: "2025",
      avgTenureYears: 14.7,
      source:
        "알리오(공공기관 경영정보 공개시스템) 2025년 결산 직원 평균보수 공시 (기준일 2025-12-31, 2026-04-08 제출) — 원문 표 직접 확인",
      sourceUrl: "https://www.alio.go.kr/item/itemReportTerm.do?apbaId=C0028&reportFormRootNo=2060",
      note: "일반정규직 1인당 평균보수 76,455천원(성과상여금 포함, 기금운용직·연구직 포함 집계). 2024년 결산은 7,308만원, 무기계약직 평균 3,451만원. 신입 초임(대졸 6급갑 1호봉)은 2025년 결산 4,105만원(기본급 2,515만원+수당, 성과급 제외)·2026년 예산 4,217만원.",
    },
    // 직급별 연봉 — 공단 보수규정 별표1(기본급표)·별표6(기본연봉표) 원문 확정치.
    // 호봉제(6급~3급)·연봉제(3급 보직~임원) 이원 구조 그대로 수록.
    careerLevels: [
      {
        group: "6급(갑)→3급 — 호봉제 실무직군 (보수규정 기본급표 기준)",
        promotionNote:
          "승급은 1년에 1호봉(보수규정 제5조), 승급 최고호봉은 30호봉(제5조 제3항 — 별표1 기본급표 자체는 35호봉까지 수록돼 있어 표기 범위는 기본급표 기준). 대졸 공채 신입은 6급(갑) 1호봉으로 획정(알리오 공시 작성기준 '대졸 6급갑 1호봉 만근 기준'으로 확인, 초임호봉 획정 세부는 시행규칙 위임). 이 그룹의 수치는 보수규정 별표1 기본급표(2025.12.30 개정, 2025-01-01 적용)의 월 기본급을 연 환산(×12)한 값으로 수당·성과급이 빠진 기본급만이라는 점 주의 — 실제 총보수는 신입도 4,105만원(알리오 2025년 결산). 표기값이 범위인 직급은 대표 호봉(20호봉) 기준.",
        steps: [
          {
            label: "6급(갑) 1호봉 — 신입",
            description:
              "1년차 대졸 공채 신입. 알리오 2026-04-08 공시(2025년 결산) 신입 초임 총 4,105만원(기본급 2,515만원 + 고정·실적수당·복리후생비, 성과급 제외), 2026년 예산 기준 4,217만원. 보수규정 별표1 기본급표상 6급 1호봉 월 209만6천원(연 2,515만원)과 정확히 일치",
            baseManwon: 2515,
            totalManwon: 4105,
          },
          {
            label: "6급(갑) 10호봉",
            description:
              "10년차 안팎(1년 1호봉 승급 기준). 월 기본급 277만원, 연 환산 3,324만원(수당·성과급 제외) — 보수규정 별표1 기본급표(2025.12.30 개정). 기본급표상 6급 최고 수록 호봉은 35호봉 월 425만6천원(연 환산 5,107만원)이나 승급 최고호봉은 30호봉(월 402만5천원, 연 환산 4,830만원)",
            baseManwon: 3324,
          },
          {
            label: "5급 (대리~과장급)",
            description:
              "월 기본급 1호봉 242만7천~35호봉 446만8천원(연 환산 2,912만~5,362만원, 표기값은 20호봉 4,390만원) — 보수규정 별표1 기본급표(2025.12.30 개정). 수당·성과급 제외 기본급만",
            baseManwon: 4390,
          },
          {
            label: "4급 (과장~차장급)",
            description:
              "월 기본급 1호봉 276만4천~35호봉 481만9천원(연 환산 3,317만~5,783만원, 표기값은 20호봉 4,806만원) — 보수규정 별표1 기본급표(2025.12.30 개정). 수당·성과급 제외 기본급만",
            baseManwon: 4806,
          },
          {
            label: "3급 (호봉제·차장~부장급)",
            description:
              "월 기본급 1호봉 314만4천~35호봉 518만8천원(연 환산 3,773만~6,226만원, 표기값은 20호봉 5,267만원) — 보수규정 별표1 기본급표(2025.12.30 개정). 직제규정상 부장 이상·센터장 보직을 받으면 연봉제로 전환(보수규정 제17조)",
            baseManwon: 5267,
          },
          {
            label: "전 직원 평균 (근속 14.7년)",
            description:
              "평균 근속 176개월(약 14.7년) 기준 일반정규직 1인당 평균보수 7,646만원(정확히는 76,455천원, 성과상여금 포함) — 알리오 2025년 결산(2026-04-08 공시). 2024년 결산은 7,308만원. 기금운용직·연구직 포함 집계라 일반 행정직 실제값과 차이 가능",
            totalManwon: 7646,
          },
        ],
      },
      {
        group: "3급 보직자→1급·임원 — 연봉제 (보수규정 기본연봉표 기준)",
        promotionNote:
          "연봉제 적용대상은 임원·2급 이상 전원·3급 부장 이상 및 센터장 보직자(보수규정 제17조). 연봉 = 기본연봉(기준급+직무급) + 성과연봉(별도, 제19·25조). 표기값은 기준급 '상한액'으로 성과연봉이 빠진 금액 — 실수령 총연봉과 다름. 기준급은 2급 이상만 평가등급(S~D)별로 기준인상률 ±1.0%p 차등 인상(별표7·제22조, 3급 연봉제 직원은 일반 인상률), 1급 승진 시 승진가산금 1,056만원을 기준급에 가산(별표8·제21조). 2026-01-01 적용 기본연봉표(2026.3.6 개정)",
        steps: [
          {
            label: "3급 (연봉제 — 본부 부장·지사장 보직)",
            description:
              "기준급 5,571만~8,030만원(표기값은 상한) + 직무급 기준그룹(3그룹) 576만원, 본부 부장 및 지사장 보직 시 1·2급 직무급 준용(1그룹), 성과연봉 별도 — 보수규정 별표6 기본연봉표(2026.3.6 개정, 2026-01-01 적용)",
            baseManwon: 8030,
          },
          {
            label: "2급 (부장·2급 지사장급)",
            description:
              "기준급 5,567만~7,775만원(표기값은 상한) + 직무급 기준그룹(7그룹) 1,314만원(2급 지사장 6그룹 1,509만원), 성과연봉 별도 — 보수규정 별표6 기본연봉표(2026.3.6 개정, 2026-01-01 적용)",
            baseManwon: 7775,
          },
          {
            label: "1급 (본부 부서장·지역본부장급)",
            description:
              "기준급 6,295만~8,568만원(표기값은 상한) + 직무급 기준그룹(4그룹) 1,595만원(본부 부서장 1그룹은 2,254만원), 성과연봉 별도 — 보수규정 별표6 기본연봉표(2026.3.6 개정, 2026-01-01 적용)",
            baseManwon: 8568,
          },
          {
            label: "임원 (이사장·상임이사·감사)",
            description:
              "기본연봉 상임이사·감사 1억3,095만원, 이사장 1억6,368만원(성과급 별도, 보수규정 제19조) — 보수규정 별표6 기본연봉표(2026.3.6 개정, 2026-01-01 적용), 공단 공시 보수규정 원문",
            baseManwon: 13095,
          },
        ],
      },
    ],
    salary: {
      entry: { base: 48000000, incentive: { target: 10, max: 22, avgAmount: 6500000 } },
      junior: { base: 59000000, incentive: { target: 10, max: 22, avgAmount: 8000000 } },
      senior: { base: 75000000, incentive: { target: 10, max: 22, avgAmount: 10000000 } },
      lead: { base: 95000000, incentive: { target: 10, max: 22, avgAmount: 13000000 } },
      executive: { base: 155000000, incentive: { target: 15, max: 30, avgAmount: 30000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 90 },
      remoteWork: { policy: "office", description: "본사(전주) 및 전국 지사 근무" },
    },
    benefits: [
      { category: "financial", title: "기금운용 성과급", description: "기금운용 부서의 경우 시장 성과 연동 추가 성과급 지급", value: 5000000 },
      { category: "health", title: "의료비 지원", description: "본인 및 가족 의료비 연간 최대 200만원 지원", value: 2000000 },
    ],
    culture: {
      score: 8.2,
      keywords: ["안정", "워라밸", "기금운용", "정년보장"],
      pros: ["국내 최대 기관투자자 소속으로 높은 전문성", "합리적인 워라밸과 높은 휴가 사용률", "기금운용 부서 전문직 고연봉 가능"],
      cons: ["본사 전주 이전으로 지방 근무 부담", "연금 관련 민원 업무 스트레스", "직군별 연봉 격차가 크게 발생"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "housing-finance",
    name: { ko: "한국주택금융공사", en: "Korea Housing Finance Corporation" },
    industry: "Public Finance",
    tier: "public",
    logo: "🏡",
    description: "보금자리론·디딤돌대출 등 서민 주거금융을 공급하는 금융 공공기관. 주택 담보대출 유동화(MBS) 전문 기관.",
    salary: {
      entry: { base: 52000000, incentive: { target: 12, max: 25, avgAmount: 8000000 } },
      junior: { base: 63000000, incentive: { target: 12, max: 25, avgAmount: 9500000 } },
      senior: { base: 78000000, incentive: { target: 12, max: 25, avgAmount: 11500000 } },
      lead: { base: 99000000, incentive: { target: 12, max: 25, avgAmount: 15000000 } },
      executive: { base: 158000000, incentive: { target: 18, max: 35, avgAmount: 32000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 89 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "본사(부산) 및 전국 영업점 근무" },
    },
    benefits: [
      { category: "financial", title: "직원 주택금융 우대", description: "보금자리론 등 자사 주택금융 상품 금리 우대 혜택", value: 3000000 },
      { category: "growth", title: "금융 자격증 지원", description: "CFA·FRM·보험계리사 등 취득 시 지원금 및 장려금", value: 1500000 },
    ],
    culture: {
      score: 8.0,
      keywords: ["금융", "안정", "워라밸", "서민금융"],
      pros: ["자사 대출 금리 우대 등 금융 특화 복지", "합리적인 근무환경과 워라밸", "주택금융 분야 전문성 축적 가능"],
      cons: ["본사 부산 소재로 수도권 출신 지방 근무 부담", "금융 공기업 중 상대적으로 낮은 인지도", "업무 특성상 주택 시장 변동성에 민감"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "credit-guarantee",
    name: { ko: "신용보증기금", en: "Korea Credit Guarantee Fund" },
    industry: "Finance",
    tier: "public",
    logo: "🛡️",
    description: "담보 능력이 부족한 기업에 신용보증을 제공하는 준정부기관. 중소기업 금융 지원의 핵심 기관.",
    salary: {
      entry: { base: 50000000, incentive: { target: 10, max: 22, avgAmount: 7000000 } },
      junior: { base: 61000000, incentive: { target: 10, max: 22, avgAmount: 8500000 } },
      senior: { base: 75000000, incentive: { target: 10, max: 22, avgAmount: 10500000 } },
      lead: { base: 96000000, incentive: { target: 10, max: 22, avgAmount: 13500000 } },
      executive: { base: 155000000, incentive: { target: 15, max: 30, avgAmount: 29000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 90 },
      remoteWork: { policy: "office", description: "본사(대구) 및 전국 영업점 근무" },
    },
    benefits: [
      { category: "financial", title: "복지포인트", description: "연 130만원 복지카드 지급", value: 1300000 },
      { category: "growth", title: "신용분석 전문 교육", description: "기업신용분석·심사 역량 강화 전문 연수 지원", value: 1000000 },
    ],
    culture: {
      score: 8.1,
      keywords: ["안정", "금융심사", "중소기업", "정년보장"],
      pros: ["신용분석·기업금융 분야 전문성 축적", "안정적인 고용과 합리적인 워라밸", "전국 영업점으로 거주지 인근 근무 가능"],
      cons: ["본사 대구 소재로 수도권 출신 부담", "중소기업 금융심사 업무의 높은 책임감", "금융 공기업 대비 낮은 대외 인지도"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "kibo",
    name: { ko: "기술보증기금", en: "Korea Technology Finance Corporation" },
    industry: "Finance",
    tier: "public",
    logo: "💡",
    description: "기술력 있는 중소·벤처기업에 기술보증을 제공하는 준정부기관. 기술평가를 통한 혁신 기업 금융 지원에 특화.",
    salary: {
      entry: { base: 49000000, incentive: { target: 10, max: 20, avgAmount: 6500000 } },
      junior: { base: 59000000, incentive: { target: 10, max: 20, avgAmount: 8000000 } },
      senior: { base: 72000000, incentive: { target: 10, max: 20, avgAmount: 9500000 } },
      lead: { base: 92000000, incentive: { target: 10, max: 20, avgAmount: 12000000 } },
      executive: { base: 150000000, incentive: { target: 15, max: 28, avgAmount: 27000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 89 },
      remoteWork: { policy: "office", description: "본사(부산) 및 전국 영업점 근무" },
    },
    benefits: [
      { category: "financial", title: "복지포인트", description: "연 120만원 복지카드 지급", value: 1200000 },
      { category: "growth", title: "기술평가 전문 연수", description: "IP·기술가치평가 전문 자격 취득 지원", value: 1000000 },
    ],
    culture: {
      score: 7.9,
      keywords: ["기술평가", "안정", "벤처", "정년보장"],
      pros: ["기술평가·IP 분야 희귀한 전문성 축적 기회", "벤처·스타트업 생태계와 연계한 흥미로운 업무", "안정적인 고용과 정년 보장"],
      cons: ["신보(신용보증기금) 대비 낮은 인지도", "본사 부산 소재로 수도권 출신 부담", "기술평가 업무의 높은 전문성 요구"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "koica",
    name: { ko: "한국국제협력단", en: "Korea International Cooperation Agency" },
    industry: "Development Aid",
    tier: "public",
    logo: "🤝",
    description: "개발도상국 지원과 국제개발협력을 담당하는 준정부기관. 50개국 이상에 ODA 사업을 수행하는 한국 공적개발원조의 중추.",
    salary: {
      entry: { base: 45000000, incentive: { target: 10, max: 20, avgAmount: 6000000 } },
      junior: { base: 55000000, incentive: { target: 10, max: 20, avgAmount: 7000000 } },
      senior: { base: 70000000, incentive: { target: 10, max: 20, avgAmount: 8500000 } },
      lead: { base: 90000000, incentive: { target: 10, max: 20, avgAmount: 11500000 } },
      executive: { base: 145000000, incentive: { target: 15, max: 28, avgAmount: 27000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 90 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "본사(성남) 및 해외 사무소 파견" },
    },
    benefits: [
      { category: "lifestyle", title: "해외 파견 수당 및 지원", description: "개발도상국 파견 시 위험수당·주거비·교육비 전액 지원", value: 12000000 },
      { category: "growth", title: "국제개발 전문 교육", description: "ODA·국제개발 전문 연수 및 해외 학술 교류 지원", value: 2000000 },
    ],
    culture: {
      score: 8.2,
      keywords: ["글로벌", "사회공헌", "해외파견", "국제개발"],
      pros: ["50개국 이상 해외 파견으로 글로벌 커리어 형성", "사회에 기여하는 의미 있는 업무로 높은 직업 만족도", "국제개발협력 분야 최고 전문성"],
      cons: ["개발도상국 파견 시 열악한 환경 감수 필요", "연봉이 금융 공기업 대비 낮은 편", "파견 시 가족 동반·분리 이슈 발생"],
    },
    lastUpdated: "2026-05-15",
  },

  // ─── Government Research Institutes (국책연구기관) ─────────────────────────
  {
    id: "kist",
    name: { ko: "한국과학기술연구원", en: "Korea Institute of Science and Technology" },
    industry: "R&D",
    tier: "public",
    logo: "🔬",
    description: "대한민국 최초의 종합 과학기술 연구기관. 소재·바이오·에너지 등 다양한 첨단 기초·응용 연구를 수행.",
    salary: {
      entry: { base: 48000000, incentive: { target: 10, max: 20, avgAmount: 6500000 } },
      junior: { base: 59000000, incentive: { target: 10, max: 20, avgAmount: 7500000 } },
      senior: { base: 75000000, incentive: { target: 10, max: 20, avgAmount: 9500000 } },
      lead: { base: 95000000, incentive: { target: 10, max: 20, avgAmount: 12500000 } },
      executive: { base: 152000000, incentive: { target: 15, max: 30, avgAmount: 28000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 88 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "자율출퇴근제 및 연구실 중심 근무" },
    },
    benefits: [
      { category: "growth", title: "연구비 및 학회 참가비 지원", description: "국내외 학술대회 참가비 및 논문게재료 전액 지원", value: 2000000 },
      { category: "growth", title: "도서구입비 지원", description: "연간 50만원 학술도서·전문서적 구입비 지원", value: 500000 },
    ],
    culture: {
      score: 8.5,
      keywords: ["연구자유", "박사우대", "워라밸", "자율출퇴근"],
      pros: ["자율출퇴근 등 연구자 친화적 근무 환경", "국내 최고 수준의 연구 인프라 및 장비", "박사학위자 우대 및 전문 연구 커리어 보장"],
      cons: ["연구 성과 압박과 논문·특허 실적 요구", "정규직 전환 전 포닥·계약직 기간 필요", "순수 연구 집중으로 상업화 성과 한계"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "kitech",
    name: { ko: "한국생산기술연구원", en: "Korea Institute of Industrial Technology" },
    industry: "R&D",
    tier: "public",
    logo: "⚙️",
    description: "중소·중견 제조기업의 기술 혁신을 지원하는 산업기술 전문 연구기관. 제조 현장 밀착형 기술 개발에 특화.",
    salary: {
      entry: { base: 45000000, incentive: { target: 10, max: 20, avgAmount: 5500000 } },
      junior: { base: 55000000, incentive: { target: 10, max: 20, avgAmount: 7000000 } },
      senior: { base: 70000000, incentive: { target: 10, max: 20, avgAmount: 8500000 } },
      lead: { base: 89000000, incentive: { target: 10, max: 20, avgAmount: 11000000 } },
      executive: { base: 144000000, incentive: { target: 15, max: 28, avgAmount: 25000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 87 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "자율출퇴근제 및 연구 현장 근무" },
    },
    benefits: [
      { category: "growth", title: "학회 참가비 지원", description: "국내외 학술대회 및 기술 전시회 참가비 지원", value: 1500000 },
      { category: "growth", title: "기술 자격증 취득 지원", description: "기술사·산업기사 등 전문 자격증 취득 지원", value: 800000 },
    ],
    culture: {
      score: 8.0,
      keywords: ["연구자유", "제조기술", "워라밸", "자율출퇴근"],
      pros: ["제조 현장과 연계한 실용적 연구 수행", "자율출퇴근 등 연구자 친화적 환경", "중소기업 기술 지원으로 높은 사회적 기여"],
      cons: ["현장 밀착 연구로 출장 및 현장 방문 빈번", "KIST 등 기초연구기관 대비 낮은 연봉", "연구비 수주 압박으로 인한 스트레스"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "kaeri",
    name: { ko: "한국원자력연구원", en: "Korea Atomic Energy Research Institute" },
    industry: "R&D / Nuclear",
    tier: "public",
    logo: "🔋",
    description: "원자력 에너지 기술 연구개발을 담당하는 국책 연구기관. 원자로 설계·핵연료·방사선 기술 분야 국내 최고 권위 기관.",
    salary: {
      entry: { base: 50000000, incentive: { target: 10, max: 22, avgAmount: 7000000 } },
      junior: { base: 61000000, incentive: { target: 10, max: 22, avgAmount: 8500000 } },
      senior: { base: 78000000, incentive: { target: 10, max: 22, avgAmount: 11000000 } },
      lead: { base: 99000000, incentive: { target: 10, max: 22, avgAmount: 14000000 } },
      executive: { base: 158000000, incentive: { target: 15, max: 30, avgAmount: 28000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 43 },
      vacation: { days: 21, usageRate: 87 },
      remoteWork: { policy: "office", description: "대전 본원 연구시설 중심 근무" },
    },
    benefits: [
      { category: "financial", title: "방사선 작업 수당", description: "방사선 관리구역 근무자 특수업무 수당 별도 지급", value: 3500000 },
      { category: "health", title: "방사선 전문 건강관리", description: "연 2회 방사선 종사자 특수 건강검진 및 의료비 지원", value: 1500000 },
    ],
    culture: {
      score: 8.3,
      keywords: ["연구자유", "원자력", "박사우대", "전문직"],
      pros: ["원자력 분야 국내 최고 수준의 연구 환경", "방사선 수당 등 원전 특화 복지 혜택", "SMR 등 미래 원자력 기술 선도 연구 기회"],
      cons: ["대전 유성 본원 고정 근무로 이동 제한", "원전 연구 특성상 보안·규정 준수 부담 높음", "박사학위 없이는 연구직 진입이 어려움"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "kaia-space",
    name: { ko: "한국항공우주연구원", en: "Korea Aerospace Research Institute" },
    industry: "R&D / Aerospace",
    tier: "public",
    logo: "🚀",
    description: "누리호·아리랑위성 등 한국 우주발사체·위성 개발을 이끄는 국책 연구기관. 항공우주 분야 국내 유일의 종합 연구기관.",
    salary: {
      entry: { base: 52000000, incentive: { target: 10, max: 22, avgAmount: 7500000 } },
      junior: { base: 63000000, incentive: { target: 10, max: 22, avgAmount: 9000000 } },
      senior: { base: 80000000, incentive: { target: 10, max: 22, avgAmount: 11500000 } },
      lead: { base: 102000000, incentive: { target: 10, max: 22, avgAmount: 15000000 } },
      executive: { base: 162000000, incentive: { target: 15, max: 30, avgAmount: 30000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 43 },
      vacation: { days: 21, usageRate: 87 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "대전 본원 및 고흥 발사체 시험 현장 근무" },
    },
    benefits: [
      { category: "growth", title: "항공우주 학술 연구비", description: "국제 학술대회·NASA·ESA 협력 연구비 지원", value: 3000000 },
      { category: "growth", title: "도서 및 기술 자료 지원", description: "항공우주 전문 도서·기술 자료 구입비 연간 지원", value: 600000 },
    ],
    culture: {
      score: 9.0,
      keywords: ["우주개발", "연구자유", "박사우대", "미래기술"],
      pros: ["누리호·달탐사 등 국가 우주 프로젝트 직접 참여", "항공우주 분야 국내 유일 기관으로 커리어 희소성", "우주개발 붐으로 높아진 기관 위상과 연구비"],
      cons: ["고흥 등 외딴 발사 현장 출장 빈번", "발사체 개발 일정 압박으로 업무 강도 높음", "박사급 인력 위주 채용으로 진입 장벽 높음"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "keti",
    name: { ko: "한국전자기술연구원", en: "Korea Electronics Technology Institute" },
    industry: "R&D / Electronics",
    tier: "public",
    logo: "💻",
    description: "전자·IT·반도체·디스플레이 분야 중소기업 기술 지원 및 연구개발을 담당하는 국책 연구기관.",
    salary: {
      entry: { base: 46000000, incentive: { target: 10, max: 20, avgAmount: 5500000 } },
      junior: { base: 56000000, incentive: { target: 10, max: 20, avgAmount: 7000000 } },
      senior: { base: 70000000, incentive: { target: 10, max: 20, avgAmount: 8500000 } },
      lead: { base: 89000000, incentive: { target: 10, max: 20, avgAmount: 11000000 } },
      executive: { base: 143000000, incentive: { target: 15, max: 28, avgAmount: 24000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 88 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "자율출퇴근제 및 분원(판교·구미 등) 근무" },
    },
    benefits: [
      { category: "growth", title: "학회 참가 및 논문게재비 지원", description: "국내외 전자·IT 학술대회 참가비 및 논문게재료 지원", value: 1500000 },
      { category: "growth", title: "도서구입비 지원", description: "전문 기술 도서 및 온라인 강의 구입비 연간 지원", value: 500000 },
    ],
    culture: {
      score: 8.0,
      keywords: ["연구자유", "IT기술", "워라밸", "자율출퇴근"],
      pros: ["IT·전자 분야 산학연 협력 및 기업 지원 경험", "자율출퇴근 등 연구자 친화적 근무 환경", "판교 등 수도권 분원 근무 가능"],
      cons: ["ETRI 등 상위 연구기관 대비 낮은 인지도", "연구비 수주 실적 압박이 연구 방향에 영향", "민간 IT기업 대비 낮은 연봉 경쟁력"],
    },
    lastUpdated: "2026-05-15",
  },
];
