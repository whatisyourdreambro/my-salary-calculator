import { CompanyProfile } from "@/types/company";

export const krCompanies_Batch12: CompanyProfile[] = [
  {
    id: "korail",
    name: { ko: "한국철도공사", en: "KORAIL" },
    industry: "Transportation",
    tier: "public",
    logo: "🚆",
    description: "대한민국 철도망을 운영하는 공기업. KTX·ITX·무궁화호 등 연간 10억 명 수송.",
    // 알리오 2025년 결산 공시 확정치 (2026-08-31 원문 재검증). 직급별(1~6급) 확정치는
    // 공시·국감 어디에도 없어 careerLevels 미수록 (추정 금지 — 플랫폼 추정치 배제).
    disclosed: {
      avgSalaryManwon: 7738,
      fiscalYear: "2025",
      avgTenureYears: 15.9,
      source:
        "알리오(공공기관 경영정보 공개시스템) 2025년 결산 직원 평균보수 공시 (기준일 2025-12-31, 2026-04-13 제출) — 원문 표 직접 확인",
      sourceUrl: "https://www.alio.go.kr/item/itemReportTerm.do?apbaId=C0268&reportFormRootNo=2060",
      note: "일반정규직 1인당 평균보수. 2025년 결산엔 경영평가 성과급 258만원 포함(2024년은 미지급 — 2024 결산 7,091만원에서 상승한 주요 원인). 신입 초임은 2025년 결산 3,917만원(기본급 2,775만원+수당, 성과급 미포함)·2026년 예산 4,051만원.",
    },
    salary: {
      entry: { base: 47000000, incentive: { target: 10, max: 20, avgAmount: 6000000 } },
      junior: { base: 57000000, incentive: { target: 10, max: 20, avgAmount: 7000000 } },
      senior: { base: 73000000, incentive: { target: 10, max: 20, avgAmount: 9000000 } },
      lead: { base: 93000000, incentive: { target: 10, max: 20, avgAmount: 12000000 } },
      executive: { base: 150000000, incentive: { target: 15, max: 30, avgAmount: 30000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 90 },
      remoteWork: { policy: "office", description: "역사·본사 현장 근무 중심" },
    },
    benefits: [
      { category: "lifestyle", title: "철도 무임 탑승", description: "본인 및 가족 KTX 등 전 노선 무료 이용", value: 3000000 },
      { category: "financial", title: "복지포인트", description: "연 120만원 복지카드 지급", value: 1200000 },
    ],
    culture: {
      score: 8.0,
      keywords: ["안정", "정년보장", "공기업", "현장직"],
      pros: ["철밥통 수준의 고용 안정성", "합리적인 워라밸과 휴가 사용률", "KTX 등 무임 승차 독특한 복지"],
      cons: ["낮은 성과급 상한선", "보수적 조직 문화", "순환근무로 인한 지방 발령 가능성"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "incheon-airport",
    name: { ko: "인천국제공항공사", en: "Incheon International Airport Corporation" },
    industry: "Transportation",
    tier: "public",
    logo: "✈️",
    description: "세계 최고 수준의 인천국제공항을 운영·관리하는 공기업. 연간 7천만 명 이상의 여객을 처리.",
    // 알리오 2025년 결산 공시 + 보수규정 원문(제619호)·시행세칙(제153호) 확정치 —
    // careerLevels 공기업 확대 (2026-08-31, 적대적 재검증 통과: 별표1·별표4 원문 전수 대조)
    disclosed: {
      avgSalaryManwon: 9719,
      fiscalYear: "2025",
      avgTenureYears: 14.3,
      source:
        "알리오(공공기관 경영정보 공개시스템) 2025년 결산 직원 평균보수 공시 (기준일 2025-12-31, 2026-04-13 제출) — 원문 표 직접 확인",
      sourceUrl: "https://www.alio.go.kr/item/itemReportTerm.do?apbaId=C0105&reportFormRootNo=2060",
      note: "일반정규직 1인당 평균보수(성과상여금 2,002만원 포함 총액). 신입 초임은 2025년 결산 4,888만원(기본급 4,360만원+고정수당 529만원, 성과급 제외)·2026년 예산 5,041만원.",
    },
    // 직급별 기본급 상하한 — 보수규정 [별표1](규정 제619호, 2026-01-27 개정) + 직무급
    // [별표4](시행세칙 제153호, 2025-01-21 개정) 원문 확정치. 성과급·수당 제외 기본급 기준.
    careerLevels: [
      {
        group: "일반직 5급 → 1급 (보수규정 기본급 상하한표 + 직무급)",
        promotionNote:
          "직급 체계는 1급(본부장·처장)~7급이며 대졸 공채 신입의 기본급은 5급 하한과 일치(보수규정 제14조 제4항: 신규채용직원의 연간 기본급은 별표1 직급별 하한액 — 알리오 2025년 결산 초임 기본급 4,359.5만원과 별표1 5급 하한 43,595천원이 천원 단위까지 일치 확인). 아래 수치는 보수규정 [별표1] 연간 기본급 상하한표(규정 제619호, 2026-01-27 개정본 — 현행 값은 2025년 결산 초임과 일치)로 성과급·수당 제외 기본급 기준. 여기에 직무급(시행세칙 제153호 별표4, 2025-01-21 개정)이 더해짐 — 3급 이하는 월 69.9만~92.1만원 수준이지만 2급 팀장·처장은 월 245만~255.5만원, 1급 처장·본부장은 월 262만~278.5만원으로 간부급에서 급증. 경영평가성과급·내부평가급도 별도라 실제 총보수는 표보다 훨씬 높음(2025년 전직원 평균보수 9,719만원). 같은 별표1의 하위직급인 6급 3,814만~6,409만원, 7급 3,202만~5,973만원은 스텝에서 제외. 안전보안전문직은 S2~S7급 별도 테이블(별표1-1). 승진 소요연수는 공식 공시가 없어 표기하지 않음.",
        steps: [
          {
            label: "신입 (5급 초임)",
            description:
              "1년차. 2025년 결산 신입사원 초임 4,888만원(기본급 4,360만원+고정수당 529만원, 성과급 제외) — 알리오 직원 평균보수 공시(2026년 1분기, 기준일 2025-12-31). 2026년 예산 기준 5,041만원",
            totalManwon: 4888,
          },
          {
            label: "5급 (사원~대리급)",
            description:
              "연간 기본급 하한 4,360만~상한 6,830만원 — 보수규정 별표1(알리오 내부규정 공시, 2026-01-27 개정본). 직무급 월 69.9만~73.9만원(시행세칙 별표4, 2025-01-21 개정)과 성과급 별도",
            baseManwon: 4360,
          },
          {
            label: "4급",
            description:
              "연간 기본급 하한 5,965만~상한 8,377만원 — 보수규정 별표1(2026-01-27 개정본). 직무급 월 77.5만~81.5만원, 성과급 별도",
            baseManwon: 5965,
          },
          {
            label: "3급 (팀원·팀장)",
            description:
              "연간 기본급 하한 6,925만~상한 9,358만원 — 보수규정 별표1(2026-01-27 개정본). 직무급은 팀원 월 83.1만~87.1만, 팀장 월 88.1만~92.1만원(시행세칙 별표4), 성과급 별도",
            baseManwon: 6925,
          },
          {
            label: "2급 (팀장·처장)",
            description:
              "연간 기본급 하한 7,354만~상한 1억306만원 — 보수규정 별표1(2026-01-27 개정본). 직무급이 팀장 월 245만~249만, 처장 월 251.5만~255.5만원(연 3,000만원 안팎)으로 커서 실제 보수는 기본급+직무급+성과급 합산 기준",
            baseManwon: 7354,
          },
          {
            label: "1급 (처장·본부장)",
            description:
              "연간 기본급 하한 8,191만~상한 1억1,549만원 — 보수규정 별표1(2026-01-27 개정본). 직무급 처장 월 262만~266만, 본부장 월 274.5만~278.5만원(연 3,144만~3,342만원) 별도 — 기본급 상한+직무급만으로 1억4천만원대",
            baseManwon: 8191,
          },
        ],
      },
    ],
    salary: {
      entry: { base: 62000000, incentive: { target: 15, max: 30, avgAmount: 10000000 } },
      junior: { base: 75000000, incentive: { target: 15, max: 30, avgAmount: 12000000 } },
      senior: { base: 95000000, incentive: { target: 15, max: 30, avgAmount: 16000000 } },
      lead: { base: 120000000, incentive: { target: 15, max: 30, avgAmount: 20000000 } },
      executive: { base: 180000000, incentive: { target: 20, max: 40, avgAmount: 40000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 23, usageRate: 93 },
      remoteWork: { policy: "office", description: "공항 현장 및 본사 근무 중심" },
    },
    benefits: [
      { category: "lifestyle", title: "항공권 할인 혜택", description: "본인 및 가족 국내외 항공권 특별 할인", value: 4000000 },
      { category: "financial", title: "성과급 및 복지포인트", description: "업계 최고 수준 성과급 + 연 200만원 복지포인트", value: 2000000 },
    ],
    culture: {
      score: 9.0,
      keywords: ["안정", "고연봉", "공기업최고", "글로벌"],
      pros: ["공기업 중 최고 수준의 연봉 패키지", "세계 수준의 근무 환경", "항공 관련 다양한 복지 혜택"],
      cons: ["24시간 운영으로 교대 근무 부서 존재", "공항 인근 근무지 고정", "경쟁률이 매우 높은 채용"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "korea-airports",
    name: { ko: "한국공항공사", en: "Korea Airports Corporation" },
    industry: "Transportation",
    tier: "public",
    logo: "🛫",
    description: "김포·김해·제주 등 전국 14개 공항을 운영하는 공기업. 국내 항공 인프라의 핵심 운영 기관.",
    salary: {
      entry: { base: 55000000, incentive: { target: 12, max: 25, avgAmount: 8000000 } },
      junior: { base: 66000000, incentive: { target: 12, max: 25, avgAmount: 9500000 } },
      senior: { base: 82000000, incentive: { target: 12, max: 25, avgAmount: 12000000 } },
      lead: { base: 103000000, incentive: { target: 12, max: 25, avgAmount: 15000000 } },
      executive: { base: 160000000, incentive: { target: 18, max: 35, avgAmount: 32000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 22, usageRate: 91 },
      remoteWork: { policy: "office", description: "각 공항 현장 및 본사 근무" },
    },
    benefits: [
      { category: "lifestyle", title: "항공권 할인", description: "국내외 항공사 제휴 항공권 최대 50% 할인", value: 3000000 },
      { category: "financial", title: "복지포인트", description: "연 150만원 복지카드 지급", value: 1500000 },
    ],
    culture: {
      score: 8.5,
      keywords: ["안정", "항공복지", "워라밸", "정년보장"],
      pros: ["항공권 할인 등 특색 있는 복지", "안정적인 고용과 정년 보장", "국내 주요 공항 근무 기회"],
      cons: ["지방 공항 순환 근무 가능성", "보수적인 공기업 조직 문화", "인천공항공사 대비 낮은 연봉"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "lh",
    name: { ko: "한국토지주택공사", en: "Korea Land and Housing Corporation" },
    industry: "Real Estate / Housing",
    tier: "public",
    logo: "🏠",
    description: "국민 주거안정과 균형 개발을 위해 공공주택 건설·공급을 담당하는 공기업. 국내 최대 부동산 공기업.",
    // 알리오 2025년 결산 공시 + 직원보수규정 원문(규정 제348호) 확정치 —
    // careerLevels 공기업 확대 (2026-08-31, 적대적 재검증 통과: 별표1·2·8 원 단위 대조)
    disclosed: {
      avgSalaryManwon: 8408,
      fiscalYear: "2025",
      avgTenureYears: 16.8,
      source:
        "알리오(공공기관 경영정보 공개시스템) 2025년 결산 직원 평균보수 공시 (기준일 2025-12-31, 2026-04-15 제출) — 원문 표 직접 확인",
      sourceUrl: "https://www.alio.go.kr/item/itemReportTerm.do?apbaId=C0396&reportFormRootNo=2060",
      note: "일반정규직 1인당 평균보수(성과상여금 1,769만원 포함 총액). 신입 초임은 2025년 결산 4,118만원(기본급 4,004만원+실적수당 115만원, 성과급 제외)·2026년 예산 4,218만원.",
    },
    // 직급별 기준연봉 — LH 직원보수규정(규정 제348호, 2025-12-19 개정, 별표1~3·8은
    // 2025-01-01 소급 시행) 원문 확정치. 성과상여금·직무급·수당 제외 기본급 성격.
    careerLevels: [
      {
        group: "일반직 5급 → 1급 (직원보수규정 기준연봉표)",
        promotionNote:
          "직급 사다리는 5급(대졸 신입) → 4급 → 3급 → 2급 → 1급. 아래 수치는 직원보수규정(알리오 내부규정 공시, 2025-12-19 개정 규정 제348호 — 부칙상 규정 본문은 2026-01-01 시행이나 기준연봉표 별표1~3·8은 2025-01-01 소급 시행)의 '기준연봉'으로 성과상여금·직무급·수당을 뺀 기본급 성격 — 실제 총연봉은 이보다 높다(2025년 결산 전직원 평균보수 8,408만원에는 성과상여금 1,769만원 포함). 3~6급은 1~20등급의 등급표, 1~2급은 상·하한 범위형 연봉제. 기준연봉 외에 직무급(별표8, 간부그룹 R1 연 최대 983만원)·성과급이 별도 지급된다. 6급(사무·기술직)은 2,961만~4,448만원. 신입=5급 1등급 배치는 2023년 알리오 초임 기본급(32,892천원)과 2023-12-27 개정판 별표2 5급 1등급(32,892,000원)이 원 단위까지 일치해 교차검증됨. 직급별 승진 소요연수는 공식 공시가 없어 표기하지 않음.",
        steps: [
          {
            label: "신입 (5급 초임)",
            description:
              "1년차. 2025년 결산 신입사원 초임 4,118만원(기본급 4,004만원+실적수당 115만원, 성과급 제외) — 알리오 직원 평균보수 공시(2026년 1분기, 기준일 2025-12-31). 2026년 예산 기준은 4,218만원",
            totalManwon: 4118,
          },
          {
            label: "5급 (사원급)",
            description:
              "기준연봉 3,494만원(1등급)~5,357만원(20등급) — 직원보수규정 별표2(알리오 내부규정 공시, 2025-12-19 개정·2025-01-01 소급 시행). 성과급·직무급·수당 제외 기본급 성격",
            baseManwon: 3494,
          },
          {
            label: "4급",
            description:
              "기준연봉 4,040만원(1등급)~6,271만원(20등급) — 직원보수규정 별표2(2025-12-19 개정·2025-01-01 소급 시행). 성과급·직무급·수당 제외",
            baseManwon: 4040,
          },
          {
            label: "3급",
            description:
              "기준연봉 4,829만원(1등급)~7,382만원(20등급) — 직원보수규정 별표2(2025-12-19 개정·2025-01-01 소급 시행). 성과급·직무급·수당 제외",
            baseManwon: 4829,
          },
          {
            label: "2급 (간부급)",
            description:
              "기준연봉 하한 5,571만~상한 1억156만원 범위형 연봉제 — 직원보수규정 별표1(2025-12-19 개정·2025-01-01 소급 시행). 성과급·직무급 별도",
            baseManwon: 5571,
          },
          {
            label: "1급 (최상위 직급)",
            description:
              "기준연봉 하한 6,715만~상한 1억1,204만원 범위형 연봉제 — 직원보수규정 별표1(2025-12-19 개정·2025-01-01 소급 시행). 성과급·직무급 별도",
            baseManwon: 6715,
          },
        ],
      },
    ],
    salary: {
      entry: { base: 49000000, incentive: { target: 10, max: 20, avgAmount: 6500000 } },
      junior: { base: 60000000, incentive: { target: 10, max: 20, avgAmount: 7500000 } },
      senior: { base: 75000000, incentive: { target: 10, max: 20, avgAmount: 9500000 } },
      lead: { base: 96000000, incentive: { target: 10, max: 20, avgAmount: 12000000 } },
      executive: { base: 155000000, incentive: { target: 15, max: 30, avgAmount: 30000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 43 },
      vacation: { days: 21, usageRate: 88 },
      remoteWork: { policy: "office", description: "본사(진주) 및 지역본부 근무" },
    },
    benefits: [
      { category: "lifestyle", title: "공공분양 특별공급", description: "LH 공공주택 입주·분양 우선 혜택", value: 5000000 },
      { category: "financial", title: "복지포인트", description: "연 130만원 복지카드 지급", value: 1300000 },
    ],
    culture: {
      score: 7.8,
      keywords: ["안정", "정년보장", "부동산", "공공주거"],
      pros: ["공공분양 우선 혜택 등 독특한 복지", "안정적인 공기업 고용 보장", "대규모 국가 프로젝트 참여 기회"],
      cons: ["본사 진주 이전으로 지방 근무 부담", "보수적인 조직 문화", "잦은 감사와 규정 준수 부담"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "k-water",
    name: { ko: "한국수자원공사", en: "K-water" },
    industry: "Utilities / Water",
    tier: "public",
    logo: "💧",
    description: "댐·광역상수도·하수도 등 물 관련 인프라를 건설·운영하는 공기업. 국민의 안정적 용수 공급을 책임짐.",
    // 알리오 2025년 결산 공시 확정치 — careerLevels 공기업 확대 (2026-08-31, 적대적 재검증 통과)
    disclosed: {
      avgSalaryManwon: 8229,
      fiscalYear: "2025",
      avgTenureYears: 13.1,
      source:
        "알리오(공공기관 경영정보 공개시스템) 2025년 결산 직원 평균보수 공시 (기준일 2025-12-31, 2026-04-10 제출) — 원문 표 직접 확인",
      sourceUrl: "https://www.alio.go.kr/item/itemReportTerm.do?apbaId=C0221&reportFormRootNo=2060",
      note: "일반정규직 1인당 평균보수(성과상여금 1,901만원 포함 총액). 무기계약직 평균은 5,174만원 별도. 경영평가 성과급 축소로 2023년 8,554만→2025년 8,229만원 감소 추세. 신입 초임은 2025년 결산 4,171만원(기본급 3,731만원+성과상여금 382만원 등).",
    },
    // 직급별 연봉 — 알리오 경영공시(평균보수·초임·임원연봉) 확정치만, 2026-08-31 원문 재검증 통과.
    // 직급별(1~5급) 금액 확정치는 공시·국감 어디에도 없어 미수록 (추정 금지).
    careerLevels: [
      {
        group: "신입 → 전 직원 평균 → 임원 (알리오 경영공시 확정치)",
        promotionNote:
          "공사 공식 인사제도 안내 기준 일반직 사다리는 5급 사원→4급 대리·과장→3급 차장→2급 부장→1급 처·실단장(그 아래 6~8급 사원급 별도, 2021년 채용자료 기준 2급은 갑·을 구분). 그러나 직급별(1급·2급 등) 평균연봉 확정치는 알리오·국정감사 보도 어디에도 공개된 바 없어 중간 직급 금액은 미수록(추정 금지 원칙). 평균보수는 성과상여금 포함 총액으로, 경영평가 성과급 축소로 2023년 8,554만→2025년 8,229만원 감소 추세(알리오 연도별 표 실측 확인). 2021년 기준 억대연봉자 1,443명(전체 6,408명의 22.5%) — 이주환 의원실 국정감사 자료(2022-09 보도).",
        steps: [
          {
            label: "신입사원 초임 (대졸 최하위 직급)",
            description:
              "1년차. 2025년 결산 4,171만원(기본급 3,731만원+성과상여금 382만원 등 포함) — 알리오 경영공시(기준일 2025-12-31, 2026-04-10 제출, 표 원문 확인). 2026년 예산 기준은 4,195만원(경영평가 성과급 미확정 0 처리)",
            baseManwon: 3731,
            totalManwon: 4171,
          },
          {
            label: "전 직원 평균 (일반정규직, 직급 무관)",
            description:
              "평균 근속 13.1년(157개월) 시점의 일반정규직 전체 평균. 2025년 결산 1인당 평균보수 8,229만원(성과상여금 1,901만원 포함 총액) — 알리오 경영공시(기준일 2025-12-31, 2026-04-10 제출). 무기계약직 평균은 5,174만원(동일 공시)",
            totalManwon: 8229,
          },
          {
            label: "상임이사 (임원)",
            description:
              "임원급. 2025년 결산 1억 4,610만원(기본급 1억 1,139만원+경영평가 성과급 3,471만원) — 알리오 임원연봉 공시(기준일 2025-12-31, 2026-04-10 제출). 상임감사는 1억 5,478만원",
            baseManwon: 11139,
            totalManwon: 14610,
          },
          {
            label: "사장 (기관장)",
            description:
              "기관장(알리오 표기 '상임기관장'). 2025년 결산 1억 9,348만원(기본급 1억 3,924만원+경영평가 성과급 5,423만원) — 알리오 임원연봉 공시(기준일 2025-12-31, 2026-04-10 제출). 중기성과급제 적용으로 공시액과 실지급액 간 차이가 있을 수 있음(알리오 기관 세부 작성기준)",
            baseManwon: 13924,
            totalManwon: 19348,
          },
        ],
      },
    ],
    salary: {
      entry: { base: 50000000, incentive: { target: 10, max: 22, avgAmount: 7000000 } },
      junior: { base: 61000000, incentive: { target: 10, max: 22, avgAmount: 8000000 } },
      senior: { base: 78000000, incentive: { target: 10, max: 22, avgAmount: 10000000 } },
      lead: { base: 99000000, incentive: { target: 10, max: 22, avgAmount: 13000000 } },
      executive: { base: 158000000, incentive: { target: 15, max: 30, avgAmount: 31000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 89 },
      remoteWork: { policy: "office", description: "본사(대전) 및 댐·수도 현장 근무" },
    },
    benefits: [
      { category: "health", title: "건강검진 및 의료비 지원", description: "종합 건강검진 및 본인·가족 의료비 지원", value: 1500000 },
      { category: "financial", title: "복지포인트", description: "연 130만원 복지카드 지급", value: 1300000 },
    ],
    culture: {
      score: 8.0,
      keywords: ["안정", "워라밸", "환경", "정년보장"],
      pros: ["안정적인 공기업 고용과 정년 보장", "합리적인 근무시간과 워라밸", "환경·물 분야 전문성 축적"],
      cons: ["댐·현장 근무 시 지방 발령 불가피", "연봉 인상 폭이 제한적", "외부 이직 시 민간 대비 경쟁력 약화 우려"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "korea-highway",
    name: { ko: "한국도로공사", en: "Korea Expressway Corporation" },
    industry: "Transportation / Infrastructure",
    tier: "public",
    logo: "🛣️",
    description: "전국 고속도로 건설·운영·관리를 담당하는 공기업. 총 연장 5,000km 이상의 고속도로 네트워크를 관리.",
    salary: {
      entry: { base: 52000000, incentive: { target: 10, max: 22, avgAmount: 7000000 } },
      junior: { base: 63000000, incentive: { target: 10, max: 22, avgAmount: 8500000 } },
      senior: { base: 78000000, incentive: { target: 10, max: 22, avgAmount: 10000000 } },
      lead: { base: 100000000, incentive: { target: 10, max: 22, avgAmount: 13000000 } },
      executive: { base: 158000000, incentive: { target: 15, max: 30, avgAmount: 31000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 90 },
      remoteWork: { policy: "office", description: "본사(김천) 및 고속도로 현장 근무" },
    },
    benefits: [
      { category: "lifestyle", title: "고속도로 통행료 면제", description: "본인 차량 고속도로 통행료 전액 면제", value: 2000000 },
      { category: "financial", title: "복지포인트", description: "연 120만원 복지카드 지급", value: 1200000 },
    ],
    culture: {
      score: 8.0,
      keywords: ["안정", "정년보장", "인프라", "현장직"],
      pros: ["통행료 면제 등 실생활에 유용한 복지", "안정적 고용과 정년 보장", "전국 도로 인프라 관리 전문성"],
      cons: ["본사 김천 이전으로 지방 근무 부담", "현장 순환 근무로 거주지 변동 가능", "보수적인 공기업 조직 문화"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "nhis",
    name: { ko: "국민건강보험공단", en: "National Health Insurance Service" },
    industry: "Public Health / Insurance",
    tier: "public",
    logo: "🏥",
    description: "전 국민 건강보험 운영·관리를 담당하는 공공기관. 보험료 부과·징수부터 건강검진·요양급여까지 총괄.",
    salary: {
      entry: { base: 47000000, incentive: { target: 10, max: 20, avgAmount: 6000000 } },
      junior: { base: 57000000, incentive: { target: 10, max: 20, avgAmount: 7000000 } },
      senior: { base: 70000000, incentive: { target: 10, max: 20, avgAmount: 8500000 } },
      lead: { base: 89000000, incentive: { target: 10, max: 20, avgAmount: 11000000 } },
      executive: { base: 145000000, incentive: { target: 15, max: 30, avgAmount: 28000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 41 },
      vacation: { days: 20, usageRate: 92 },
      remoteWork: { policy: "office", description: "지사 및 본사 민원·행정 업무 중심" },
    },
    benefits: [
      { category: "health", title: "건강검진 전액 지원", description: "본인 및 가족 종합건강검진 전액 지원", value: 2000000 },
      { category: "financial", title: "복지포인트", description: "연 110만원 복지카드 지급", value: 1100000 },
    ],
    culture: {
      score: 8.2,
      keywords: ["안정", "워라밸", "민원서비스", "정년보장"],
      pros: ["공기업 중 우수한 워라밸과 정시 퇴근", "건강보험 관련 탁월한 복지 혜택", "전국 지사 네트워크로 거주지 인근 근무 가능"],
      cons: ["대민 서비스 직군 민원 스트레스", "연봉 수준이 타 공기업 대비 낮은 편", "업무 다양성이 제한적"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "korea-post",
    name: { ko: "우정사업본부", en: "Korea Post" },
    industry: "Postal / Logistics",
    tier: "public",
    logo: "📮",
    description: "전국 우편·소포 배달 및 우체국 금융 서비스를 운영하는 정부 기관. 전국 3,500개 이상의 우체국 네트워크 보유.",
    salary: {
      entry: { base: 45000000, incentive: { target: 8, max: 18, avgAmount: 5000000 } },
      junior: { base: 54000000, incentive: { target: 8, max: 18, avgAmount: 6000000 } },
      senior: { base: 65000000, incentive: { target: 8, max: 18, avgAmount: 7500000 } },
      lead: { base: 83000000, incentive: { target: 8, max: 18, avgAmount: 9500000 } },
      executive: { base: 138000000, incentive: { target: 12, max: 25, avgAmount: 25000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 41 },
      vacation: { days: 20, usageRate: 88 },
      remoteWork: { policy: "office", description: "우체국·집배 현장 근무 중심" },
    },
    benefits: [
      { category: "lifestyle", title: "우편·택배 서비스 할인", description: "본인 우편·소포 이용 할인 혜택", value: 500000 },
      { category: "financial", title: "복지포인트", description: "연 100만원 복지카드 지급", value: 1000000 },
    ],
    culture: {
      score: 7.5,
      keywords: ["안정", "정년보장", "전국네트워크", "공무직"],
      pros: ["준공무원 수준의 강력한 고용 안정성", "전국 어디서나 근무 가능한 광범위한 지사", "정년까지 안정적인 경력 관리"],
      cons: ["공기업 중 상대적으로 낮은 연봉 수준", "집배원 등 현장직의 높은 육체적 업무 강도", "디지털 전환 시대 성장성 제한"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "khnp",
    name: { ko: "한국수력원자력", en: "Korea Hydro & Nuclear Power" },
    industry: "Energy / Nuclear",
    tier: "public",
    logo: "⚛️",
    description: "국내 원자력·수력 발전소를 운영하는 에너지 공기업. 국내 전력 공급의 약 30%를 담당하는 핵심 에너지 기관.",
    // 알리오 2025년 결산 확정치 (매일경제 2026-05-06 교차 확인). 직급별 확정치는
    // 공시·국감 어디에도 없어 careerLevels 미수록 (추정 금지 — 2026-08-31 검증).
    disclosed: {
      avgSalaryManwon: 10847,
      fiscalYear: "2025",
      source:
        "매일경제 2026-05-06 '발전 공기업 연봉 1억원 시대' — 알리오(공공기관 경영정보 공개시스템) 2025년 결산 정규직 평균보수(10,846.5만원) 인용, 7개 전력 공기업 중 1위",
      sourceUrl: "https://v.daum.net/v/20260506150304666",
      note: "발전 공기업 정규직 평균연봉 사상 첫 1억원 돌파 보도의 1위 기관. 신입 초임은 알리오 2025년 결산 공시 기준 4,441만원(알리오 단독 근거 — 언론 교차 확인 전 참고치).",
    },
    salary: {
      entry: { base: 58000000, incentive: { target: 15, max: 30, avgAmount: 10000000 } },
      junior: { base: 70000000, incentive: { target: 15, max: 30, avgAmount: 12000000 } },
      senior: { base: 90000000, incentive: { target: 15, max: 30, avgAmount: 15000000 } },
      lead: { base: 113000000, incentive: { target: 15, max: 30, avgAmount: 18000000 } },
      executive: { base: 170000000, incentive: { target: 20, max: 38, avgAmount: 38000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 43 },
      vacation: { days: 22, usageRate: 87 },
      remoteWork: { policy: "office", description: "원전·발전소 현장 및 본사 근무" },
    },
    benefits: [
      { category: "financial", title: "방사선 작업 수당", description: "원전 현장 근무자 방사선 특수업무 수당 지급", value: 4000000 },
      { category: "health", title: "특수건강검진", description: "원전 종사자 방사선 전문 건강검진 및 의료비 지원", value: 2000000 },
    ],
    culture: {
      score: 8.5,
      keywords: ["고연봉", "원자력", "전문직", "에너지"],
      pros: ["에너지 공기업 중 최고 수준의 연봉", "방사선 수당 등 원전 특화 복지", "국가 핵심 에너지 인프라 운영 전문성"],
      cons: ["원전 현장 지방 근무(경주·울진 등) 필수", "원전 안전 규정상 높은 업무 긴장도", "순환 근무로 인한 잦은 발령"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "korea-env-corp",
    name: { ko: "한국환경공단", en: "Korea Environment Corporation" },
    industry: "Environment",
    tier: "public",
    logo: "🌿",
    description: "환경오염 방지·자원순환·기후변화 대응을 총괄하는 환경부 산하 공기업. 전국 환경 인프라 관리 담당.",
    salary: {
      entry: { base: 46000000, incentive: { target: 10, max: 20, avgAmount: 6000000 } },
      junior: { base: 56000000, incentive: { target: 10, max: 20, avgAmount: 7000000 } },
      senior: { base: 70000000, incentive: { target: 10, max: 20, avgAmount: 8500000 } },
      lead: { base: 89000000, incentive: { target: 10, max: 20, avgAmount: 11000000 } },
      executive: { base: 143000000, incentive: { target: 15, max: 28, avgAmount: 27000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 89 },
      remoteWork: { policy: "office", description: "본사(인천) 및 전국 환경 현장 근무" },
    },
    benefits: [
      { category: "growth", title: "환경 자격증 취득 지원", description: "환경 관련 자격증 응시료·교육비 전액 지원", value: 800000 },
      { category: "financial", title: "복지포인트", description: "연 110만원 복지카드 지급", value: 1100000 },
    ],
    culture: {
      score: 7.8,
      keywords: ["환경", "안정", "워라밸", "사회공헌"],
      pros: ["환경·ESG 분야 전문성 축적 기회", "안정적인 공기업 고용과 정년 보장", "합리적인 근무시간과 워라밸"],
      cons: ["타 공기업 대비 낮은 인지도와 연봉", "환경 현장 근무의 열악한 환경 가능성", "전문성 대비 제한적인 민간 이직 기회"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "knto",
    name: { ko: "한국관광공사", en: "Korea Tourism Organization" },
    industry: "Tourism",
    tier: "public",
    logo: "🗺️",
    description: "한국 관광 진흥과 해외 마케팅을 담당하는 문화체육관광부 산하 공기업. 해외 주요 도시에 지사를 운영.",
    salary: {
      entry: { base: 48000000, incentive: { target: 10, max: 22, avgAmount: 6500000 } },
      junior: { base: 58000000, incentive: { target: 10, max: 22, avgAmount: 7500000 } },
      senior: { base: 72000000, incentive: { target: 10, max: 22, avgAmount: 9000000 } },
      lead: { base: 92000000, incentive: { target: 10, max: 22, avgAmount: 12000000 } },
      executive: { base: 148000000, incentive: { target: 15, max: 30, avgAmount: 28000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 42 },
      vacation: { days: 21, usageRate: 91 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "본사(원주) 및 해외 지사 근무 가능" },
    },
    benefits: [
      { category: "lifestyle", title: "해외 지사 파견 기회", description: "뉴욕·도쿄·파리 등 주요 도시 해외 근무 기회", value: 5000000 },
      { category: "financial", title: "복지포인트", description: "연 120만원 복지카드 지급", value: 1200000 },
    ],
    culture: {
      score: 8.3,
      keywords: ["글로벌", "관광", "안정", "워라밸"],
      pros: ["해외 지사 파견 등 글로벌 근무 기회", "관광·문화 분야 흥미로운 업무 환경", "합리적인 워라밸과 휴가 사용률"],
      cons: ["본사 원주 이전으로 지방 근무 부담", "관광산업 특성상 성수기 업무 집중", "공기업 특유의 보수적 의사결정 구조"],
    },
    lastUpdated: "2026-05-15",
  },
  {
    id: "kotra",
    name: { ko: "KOTRA", en: "Korea Trade-Investment Promotion Agency" },
    industry: "Trade / Investment",
    tier: "public",
    logo: "🌐",
    description: "대한민국 무역투자진흥을 위해 해외 무역관을 운영하는 준정부기관. 전 세계 130여 개 도시에 무역관 보유.",
    salary: {
      entry: { base: 53000000, incentive: { target: 12, max: 25, avgAmount: 8000000 } },
      junior: { base: 64000000, incentive: { target: 12, max: 25, avgAmount: 9500000 } },
      senior: { base: 80000000, incentive: { target: 12, max: 25, avgAmount: 12000000 } },
      lead: { base: 102000000, incentive: { target: 12, max: 25, avgAmount: 15000000 } },
      executive: { base: 162000000, incentive: { target: 18, max: 35, avgAmount: 33000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 43 },
      vacation: { days: 21, usageRate: 88 },
      remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "서울 본사 및 해외 무역관 파견 근무" },
    },
    benefits: [
      { category: "lifestyle", title: "해외 무역관 파견 수당", description: "해외 파견 시 주거비·자녀교육비 등 풍부한 파견 지원", value: 15000000 },
      { category: "financial", title: "복지포인트", description: "연 150만원 복지카드 지급", value: 1500000 },
    ],
    culture: {
      score: 8.5,
      keywords: ["글로벌", "무역", "해외파견", "전문직"],
      pros: ["130개국 해외 무역관 파견 등 글로벌 커리어 기회", "풍부한 해외 파견 지원(주거·교육비 등)", "무역·투자 분야 최고 수준의 전문성 축적"],
      cons: ["해외 파견 시 가족 동반 이슈 발생 가능", "귀국 후 서울 집중 근무로 주거 부담", "연봉 성장 속도가 민간 대비 느린 편"],
    },
    lastUpdated: "2026-05-15",
  },
];
