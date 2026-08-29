import { CompanyProfile } from "@/types/company";

export const krCompanies_Batch2: CompanyProfile[] = [
 // --- BIO / PHARMA ---
 {
 id: "samsung-biologics",
 disclosed: {
 avgSalaryManwon: 11400,
 fiscalYear: "2025",
 avgTenureYears: 5.3,
 source:
 "MTN 머니투데이방송 2026-03-19 — 금융감독원 전자공시(DART) 2025년 사업보고서 인용 (대표·임원 제외 직원 평균 보수)",
 sourceUrl: "https://v.daum.net/v/20260319104050381",
 note: "2021년 7,900만원 대비 4년 새 44% 증가. 평균 근속 5.3년은 2025년 기준(이직률 1.9% 역대 최저, 비즈니스포스트 2026-06-01 확인).",
 },
 name: { ko: "삼성바이오로직스", en: "Samsung Biologics" },
 industry: "Bio / Pharma",
 tier: "conglomerate",
 logo: "🧬",
 description: "세계 최대 바이오 의약품 위탁생산(CMO) 기업.",
 salary: {
 entry: { base: 55000000, incentive: { target: 20, max: 40, avgAmount: 15000000 } },
 junior: { base: 65000000, incentive: { target: 20, max: 40, avgAmount: 20000000 } },
 senior: { base: 85000000, incentive: { target: 20, max: 40, avgAmount: 30000000 } },
 lead: { base: 110000000, incentive: { target: 20, max: 40, avgAmount: 40000000 } },
 executive: { base: 200000000, incentive: { target: 50, max: 100, avgAmount: 100000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 45 }, vacation: { days: 20, usageRate: 85 }, remoteWork: { policy: "office", description: "송도 본사 근무 필수" } },
 benefits: [{ category: "health", title: "기숙사 지원", description: "송도 기숙사 제공", value: 6000000 }, { category: "financial", title: "복지포인트", description: "연 100만원", value: 1000000 }],
 culture: { score: 8.0, keywords: ["성장", "글로벌", "송도"], pros: ["압도적인 성장세", "높은 성과급", "깨끗한 근무 환경"], cons: ["송도 근무의 고립감", "보수적인 생산직 문화 혼재"] },
 lastUpdated: "2025-11-23",
 },
 {
 id: "celltrion",
 disclosed: {
 avgSalaryManwon: 10300,
 fiscalYear: "2024",
 source:
 "메디칼업저버 2025-04-17 — DART 2024년 사업보고서 재정리 (의약품 제조 상위 30사 분석, 1인 평균 1억300만원)",
 sourceUrl: "https://www.monews.co.kr/news/articleView.html?idxno=403602",
 note: "2025 사업연도 사업보고서는 2026-03 제출됐으나 공시 인용 보도 미확보로 2024년 수치 유지. 셀트리온제약(평균 7,700만원대)과는 별개 회사.",
 },
 name: { ko: "셀트리온", en: "Celltrion" },
 industry: "Bio / Pharma",
 tier: "conglomerate",
 logo: "💊",
 description: "대한민국 바이오 시밀러의 신화.",
 salary: {
 entry: { base: 50000000, incentive: { target: 15, max: 30, avgAmount: 10000000 } },
 junior: { base: 60000000, incentive: { target: 15, max: 30, avgAmount: 15000000 } },
 senior: { base: 80000000, incentive: { target: 15, max: 30, avgAmount: 25000000 } },
 lead: { base: 100000000, incentive: { target: 15, max: 30, avgAmount: 35000000 } },
 executive: { base: 180000000, incentive: { target: 30, max: 60, avgAmount: 80000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 48 }, vacation: { days: 15, usageRate: 70 }, remoteWork: { policy: "office", description: "현장 중심" } },
 benefits: [{ category: "financial", title: "스톡옵션", description: "성과 우수자 대상 부여", value: 10000000 }, { category: "lifestyle", title: "구내식당", description: "삼시세끼 무료", value: 3000000 }],
 culture: { score: 7.5, keywords: ["열정", "도전", "야근"], pros: ["바이오 업계 탑티어", "스톡옵션 기회", "고속 성장"], cons: ["높은 업무 강도", "회장님 카리스마 중심"] },
 lastUpdated: "2025-11-23",
 },

 // --- FINANCE ---
 {
 id: "kb-financial",
 name: { ko: "KB금융그룹", en: "KB Financial Group" },
 industry: "Finance",
 tier: "conglomerate",
 logo: "🏦",
 description: "대한민국 리딩 금융그룹.",
 salary: {
 entry: { base: 60000000, incentive: { target: 30, max: 50, avgAmount: 20000000 } },
 junior: { base: 80000000, incentive: { target: 30, max: 50, avgAmount: 30000000 } },
 senior: { base: 110000000, incentive: { target: 30, max: 50, avgAmount: 40000000 } },
 lead: { base: 140000000, incentive: { target: 30, max: 50, avgAmount: 50000000 } },
 executive: { base: 250000000, incentive: { target: 50, max: 100, avgAmount: 150000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 45 }, vacation: { days: 25, usageRate: 90 }, remoteWork: { policy: "office", description: "보수적, PC OFF제" } },
 benefits: [{ category: "financial", title: "복지연금", description: "개인연금 지원", value: 3000000 }, { category: "lifestyle", title: "PC OFF", description: "정시 퇴근 유도", value: 0 }],
 culture: { score: 8.7, keywords: ["안정", "최고연봉", "보수적"], pros: ["금융권 최고 수준 연봉", "고용 안정성", "높은 사회적 지위"], cons: ["보수적인 꼰대 문화", "영업 압박"] },
 lastUpdated: "2025-11-23",
 },
 {
 id: "shinhan-financial",
 name: { ko: "신한금융지주", en: "Shinhan Financial" },
 industry: "Finance",
 tier: "conglomerate",
 logo: "🔵",
 description: "금융의 새로운 길을 여는 신한.",
 salary: {
 entry: { base: 58000000, incentive: { target: 30, max: 50, avgAmount: 18000000 } },
 junior: { base: 78000000, incentive: { target: 30, max: 50, avgAmount: 28000000 } },
 senior: { base: 108000000, incentive: { target: 30, max: 50, avgAmount: 38000000 } },
 lead: { base: 138000000, incentive: { target: 30, max: 50, avgAmount: 48000000 } },
 executive: { base: 240000000, incentive: { target: 50, max: 100, avgAmount: 140000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 45 }, vacation: { days: 20, usageRate: 85 }, remoteWork: { policy: "office", description: "영업 중심" } },
 benefits: [{ category: "health", title: "의료비", description: "본인/가족 전액", value: 2000000 }, { category: "financial", title: "학자금", description: "자녀 학자금 지원", value: 10000000 }],
 culture: { score: 8.5, keywords: ["조직력", "영업", "군대"], pros: ["높은 연봉", "탄탄한 복지", "업계 1위 경쟁"], cons: ["군대식 문화", "강한 위계질서"] },
 lastUpdated: "2025-11-23",
 },
 {
 id: "kakaobank",
 disclosed: {
 avgSalaryManwon: 12200,
 fiscalYear: "2025",
 source:
 "머니투데이 2026-03-12 '인뱅도 1억 연봉 시대' — 은행연합회 공시 '2025년 지배구조 및 보수체계 연차보고서' 기준 임직원 평균 보수",
 sourceUrl: "https://www.mt.co.kr/finance/2026/03/12/2026031215263114559",
 note: "DART 사업보고서가 아닌 은행연합회 연차보고서 공시 기준(임직원 평균 보수, 스톡옵션 행사이익 포함 여부에 따라 변동 큼). 전년 1억1,400만원. 케이뱅크 1억200만·토스뱅크 1억2,000만원과 비교 보도.",
 },
 name: { ko: "카카오뱅크", en: "Kakao Bank" },
 industry: "Fintech",
 tier: "conglomerate",
 logo: "🟡",
 description: "같지만 다른 은행. 모바일 뱅킹의 혁신.",
 salary: {
 entry: { base: 55000000, incentive: { target: 20, max: 40, avgAmount: 15000000 } },
 junior: { base: 70000000, incentive: { target: 20, max: 40, avgAmount: 20000000 } },
 senior: { base: 100000000, incentive: { target: 20, max: 40, avgAmount: 30000000 } },
 lead: { base: 140000000, incentive: { target: 20, max: 40, avgAmount: 40000000 } },
 executive: { base: 250000000, incentive: { target: 40, max: 80, avgAmount: 100000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 42 }, vacation: { days: 25, usageRate: 95 }, remoteWork: { policy: "hybrid", description: "유연 근무제" } },
 benefits: [{ category: "financial", title: "복지포인트", description: "연 600만원", value: 6000000 }, { category: "health", title: "안식월", description: "3년 근속 시 1개월", value: 5000000 }],
 culture: { score: 8.8, keywords: ["수평", "개발자우대", "금융+IT"], pros: ["금융권 연봉 + IT 문화", "높은 복지 포인트", "수평적 분위기"], cons: ["성장 정체 우려", "규제 산업의 한계"] },
 lastUpdated: "2025-11-23",
 },

 // --- GAME ---
 {
 id: "krafton",
 name: { ko: "크래프톤", en: "Krafton" },
 industry: "Game",
 tier: "unicorn",
 logo: "🔫",
 description: "배틀그라운드의 신화. 글로벌 게임 제작사.",
 salary: {
 entry: { base: 60000000, incentive: { target: 10, max: 50, avgAmount: 10000000 } },
 junior: { base: 75000000, incentive: { target: 10, max: 50, avgAmount: 15000000 } },
 senior: { base: 110000000, incentive: { target: 10, max: 50, avgAmount: 30000000 } },
 lead: { base: 160000000, incentive: { target: 20, max: 100, avgAmount: 60000000 } },
 executive: { base: 300000000, incentive: { target: 50, max: 200, avgAmount: 200000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 45 }, vacation: { days: 20, usageRate: 90 }, remoteWork: { policy: "hybrid", description: "자율 출근" } },
 benefits: [{ category: "lifestyle", title: "키친", description: "최고급 사내 식당/카페", value: 4000000 }, { category: "lifestyle", title: "게임비", description: "게임 구매비 지원", value: 1000000 }],
 culture: { score: 8.6, keywords: ["개발자중심", "성과주의", "배그"], pros: ["업계 탑티어 연봉", "최고의 사옥 시설", "개발자 대우"], cons: ["프로젝트별 고용 불안", "배그 의존도 높음"] },
 lastUpdated: "2025-11-23",
 },
 {
 id: "ncsoft",
 name: { ko: "엔씨소프트", en: "NCSOFT" },
 industry: "Game",
 tier: "conglomerate",
 logo: "⚔️",
 description: "리니지의 명가. 기술력 중심의 게임사.",
 salary: {
 entry: { base: 55000000, incentive: { target: 10, max: 30, avgAmount: 10000000 } },
 junior: { base: 70000000, incentive: { target: 10, max: 30, avgAmount: 15000000 } },
 senior: { base: 100000000, incentive: { target: 10, max: 30, avgAmount: 25000000 } },
 lead: { base: 140000000, incentive: { target: 15, max: 50, avgAmount: 40000000 } },
 executive: { base: 250000000, incentive: { target: 30, max: 100, avgAmount: 100000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 42 }, vacation: { days: 25, usageRate: 90 }, remoteWork: { policy: "office", description: "판교 출근" } },
 benefits: [{ category: "financial", title: "복지카드", description: "연 250만원", value: 2500000 }, { category: "health", title: "메디컬센터", description: "사내 병원", value: 1000000 }],
 culture: { score: 8.2, keywords: ["기술", "안정", "대기업"], pros: ["게임업계의 삼성 (안정성)", "좋은 복지", "판교의 랜드마크"], cons: ["보수적인 문화", "최근 실적 부진"] },
 lastUpdated: "2025-11-23",
 },

 // --- TELCO ---
 {
 id: "skt",
 disclosed: {
 avgSalaryManwon: 16300,
 fiscalYear: "2025",
 avgTenureYears: 13.7,
 source:
 "DART SK텔레콤 사업보고서(2025.12) 직원 등 현황, 2026-03-18 제출 (글로벌이코노믹 2026-03-25 보도 교차 확인)",
 sourceUrl: "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260318000532",
 note: "직원 5,316명, 연간 급여총액 8,645억원. 통신 3사 중 최고.",
 },
 name: { ko: "SK텔레콤", en: "SK Telecom" },
 industry: "Telco / AI",
 tier: "conglomerate",
 logo: "📡",
 description: "대한민국 1등 통신사를 넘어 AI Company로.",
 salary: {
 entry: { base: 58000000, incentive: { target: 40, max: 60, avgAmount: 25000000 } },
 junior: { base: 75000000, incentive: { target: 40, max: 60, avgAmount: 35000000 } },
 senior: { base: 105000000, incentive: { target: 40, max: 60, avgAmount: 45000000 } },
 lead: { base: 140000000, incentive: { target: 40, max: 60, avgAmount: 60000000 } },
 executive: { base: 250000000, incentive: { target: 50, max: 100, avgAmount: 120000000 } },
 },
 // 직급별 연봉 — 사업보고서 공시(글로벌이코노믹 2026-03·SR타임스)·헤럴드경제 2024-09(초봉)·
 // 아주경제 2022-03(임원) 기반. 추정 창작 금지.
 careerLevels: [
 {
 group: "매니저 단일 호칭 (직급체계 폐지)",
 promotionNote:
 "SK텔레콤은 2006년 사원~부장 직위를 폐지하고 팀장 등 직책자를 제외한 전원을 '매니저' 단일 호칭으로 통일(전자신문 2016-08), 2019년 8월 직급체계 완전 폐지(뉴데일리 2019-07) — 전통적 직급별 연봉표는 존재하지 않음. 아래는 공시·보도 기준 구간별 수치.",
 steps: [
 {
 label: "매니저 (신입·대졸 초임)",
 description:
 "1년차. 신입 초봉 6,000만원대 — 헤럴드경제 2024-09 보도(기본급/성과급 구분 미상). 격주 주4일(해피프라이데이)·연 54일 휴무 병기 보도",
 totalManwon: 6000,
 },
 {
 label: "매니저 (전사 평균)",
 description:
 "평균 근속 13.7년. 2025년 사업보고서(2026-03 공시) 기준 직원 5,316명 1인 평균 급여 1억6,300만원 — 이통3사 1위(글로벌이코노믹 2026-03). 2024년 기준 1억6,100만원(SR타임스). 2025년 상반기에만 평균 9,200만원 지급 보도(헤럴드경제 2025-08)",
 totalManwon: 16300,
 },
 {
 label: "임원 (미등기)",
 description:
 "임원. 2021년 사업보고서 기준 미등기임원 1인 평균 5억3,000만원 — 이통3사 최고(아주경제 2022-03). 2024년 기준 약 5억1,800만원(91명) 보도",
 totalManwon: 53000,
 },
 ],
 },
 ],
 workLife: { weeklyHours: { contract: 40, real: 40 }, vacation: { days: 25, usageRate: 95 }, remoteWork: { policy: "hybrid", description: "거점 오피스 (Sphere)" } },
 benefits: [{ category: "lifestyle", title: "통신비", description: "전액 지원", value: 1200000 }, { category: "financial", title: "복지포인트", description: "연 300만원", value: 3000000 }],
 culture: { score: 9.2, keywords: ["신의직장", "워라밸", "복지"], pros: ["최고의 워라밸", "높은 연봉과 성과급", "수평적 호칭"], cons: ["성장성 정체", "통신업의 한계"] },
 lastUpdated: "2026-08-15",
 },
 {
 id: "kt",
 disclosed: {
 avgSalaryManwon: 11800,
 fiscalYear: "2025",
 avgTenureYears: 19.3,
 source:
 "DART 케이티 사업보고서(2025.12) 직원 현황, 2026-03-23 제출 (글로벌이코노믹 2026-03-25 보도 교차 확인)",
 sourceUrl: "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260323001553",
 note: "직원 1만4,701명(무기계약 14,121명 + 기간제 580명, 기간제에 미등기임원 포함). 전년 대비 +7.27%.",
 },
 name: { ko: "KT", en: "KT" },
 industry: "Telco / AI",
 tier: "conglomerate",
 logo: "🌐",
 description: "대한민국 통신 네트워크의 근간.",
 salary: {
 entry: { base: 50000000, incentive: { target: 20, max: 30, avgAmount: 10000000 } },
 junior: { base: 62000000, incentive: { target: 20, max: 30, avgAmount: 15000000 } },
 senior: { base: 85000000, incentive: { target: 20, max: 30, avgAmount: 20000000 } },
 lead: { base: 110000000, incentive: { target: 20, max: 30, avgAmount: 30000000 } },
 executive: { base: 200000000, incentive: { target: 30, max: 60, avgAmount: 80000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 40 }, vacation: { days: 20, usageRate: 85 }, remoteWork: { policy: "hybrid", description: "부서별 상이" } },
 benefits: [{ category: "financial", title: "자녀 학자금", description: "대학까지 전액", value: 10000000 }, { category: "lifestyle", title: "통신비", description: "지원", value: 1000000 }],
 culture: { score: 8.0, keywords: ["공기업", "안정", "정치"], pros: ["정년 보장 수준의 안정성", "자녀 학자금 등 가족 복지", "낮은 업무 강도"], cons: ["공기업 마인드", "낙하산 인사 논란", "느린 의사결정"] },
 lastUpdated: "2025-11-23",
 },

 // --- TECH / PLATFORM ---
 {
 id: "woowabros",
 name: { ko: "우아한형제들 (배민)", en: "Woowa Bros" },
 industry: "Platform",
 tier: "unicorn",
 logo: "🛵",
 description: "배달의민족. 문앞으로 배달되는 일상의 행복.",
 salary: {
 entry: { base: 55000000, incentive: { target: 10, max: 20, avgAmount: 5000000 } },
 junior: { base: 70000000, incentive: { target: 10, max: 20, avgAmount: 8000000 } },
 senior: { base: 100000000, incentive: { target: 10, max: 20, avgAmount: 15000000 } },
 lead: { base: 140000000, incentive: { target: 15, max: 30, avgAmount: 30000000 } },
 executive: { base: 250000000, incentive: { target: 30, max: 60, avgAmount: 80000000 } },
 },
 workLife: { weeklyHours: { contract: 32, real: 35 }, vacation: { days: 20, usageRate: 95 }, remoteWork: { policy: "remote", description: "전면 재택 (근무지 자율)" } },
 benefits: [{ category: "lifestyle", title: "주 32시간", description: "월요일 오후 1시 출근", value: 5000000 }, { category: "lifestyle", title: "배민 포인트", description: "연 200만원", value: 2000000 }],
 culture: { score: 9.0, keywords: ["재택", "주32시간", "잡담"], pros: ["주 32시간 근무 (워라밸 최강)", "전면 재택 근무", "유머러스한 문화"], cons: ["독일 모기업(DH) 인수 후 변화", "성장 둔화"] },
 lastUpdated: "2025-11-23",
 },
 {
 id: "yanolja",
 name: { ko: "야놀자", en: "Yanolja" },
 industry: "Platform",
 tier: "unicorn",
 logo: "✈️",
 description: "글로벌 여가 슈퍼앱.",
 salary: {
 entry: { base: 50000000, incentive: { target: 10, max: 20, avgAmount: 5000000 } },
 junior: { base: 65000000, incentive: { target: 10, max: 20, avgAmount: 8000000 } },
 senior: { base: 95000000, incentive: { target: 10, max: 20, avgAmount: 15000000 } },
 lead: { base: 130000000, incentive: { target: 15, max: 30, avgAmount: 25000000 } },
 executive: { base: 220000000, incentive: { target: 30, max: 60, avgAmount: 60000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 42 }, vacation: { days: 20, usageRate: 90 }, remoteWork: { policy: "remote", description: "상시 원격 근무" } },
 benefits: [{ category: "lifestyle", title: "야놀자 포인트", description: "연 100만원", value: 1000000 }, { category: "growth", title: "교육비", description: "무제한", value: 2000000 }],
 culture: { score: 8.3, keywords: ["재택", "여행", "성장"], pros: ["완전 원격 근무", "여행 관련 복지", "나스닥 상장 기대감"], cons: ["잦은 조직 개편", "업무 강도 높음"] },
 lastUpdated: "2025-11-23",
 },

 // --- CONGLOMERATE / MANUFACTURING ---
 {
 id: "lgelectronics",
 disclosed: {
 avgSalaryManwon: 11700,
 fiscalYear: "2025",
 avgTenureYears: 13.8,
 source:
 "DART LG전자 [기재정정] 사업보고서(2025.12), 2026-07-06 접수 최신본 (비즈니스포스트 2026-03 보도 교차 확인)",
 sourceUrl: "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260706000276",
 note: "직원 3만4,144명, 연간 급여총액 4조1,366억원(평균 인원 3만5,251명 기준 산출). 2024년(1억1,700만원)과 동일 수준.",
 },
 name: { ko: "LG전자", en: "LG Electronics" },
 industry: "Consumer Electronics",
 tier: "conglomerate",
 logo: "📺",
 description: "가전은 LG. 글로벌 가전 및 전장 기업.",
 salary: {
 entry: { base: 52000000, incentive: { target: 20, max: 40, avgAmount: 12000000 } },
 junior: { base: 65000000, incentive: { target: 20, max: 40, avgAmount: 18000000 } },
 senior: { base: 88000000, incentive: { target: 20, max: 40, avgAmount: 25000000 } },
 lead: { base: 115000000, incentive: { target: 20, max: 40, avgAmount: 35000000 } },
 executive: { base: 220000000, incentive: { target: 40, max: 80, avgAmount: 80000000 } },
 },
 // 직급별 초임 — 2025년 노사 합의 보도(조세금융신문·뉴스핌·아시아경제 2025-03-12) 기반. 추정 창작 금지.
 careerLevels: [
 {
 group: "사원-선임-책임 3단계 (2025년 노사 합의 초임)",
 promotionNote:
 "직급 체계는 2017년부터 사원-선임-책임 3단계(P1/P2/P3, 아시아경제 2017-04). 2025년 노사 합의로 평균 임금인상률 4.3%, 직급별 초임 100만원 인상(3월 급여 소급 적용). 아래는 초임 기본급 기준 — 직급 내 연차·고과 인상분 미포함이라 실제 재직자 연봉은 이보다 높음. 성과급(PS·PI)은 사업본부·개인 고과별 상이해 별도(전사 공통 보도값 없음). 직전 추이: 2024년 신입 5,200만원(한국경제 2024-04), 2023년 5,100만원(핀포인트뉴스 2023-03).",
 steps: [
 {
 label: "사원 (P1)",
 description:
 "1~4년차. 2025년 노사 합의 대졸 신입 초임 5,300만원(조세금융신문·뉴스핌·아시아경제 2025-03-12)",
 baseManwon: 5300,
 },
 {
 label: "선임 (P2)",
 description:
 "5~8년차. 2025년 선임 초임 6,200만원(조세금융신문 2025-03-12, 종전 대비 100만원 인상). 진급 연한(사원 4년 후 선임)은 LG그룹 공통 체계 기준",
 baseManwon: 6200,
 },
 {
 label: "책임 (P3)",
 description:
 "9년차 이상. 2025년 책임 초임 7,750만원(조세금융신문 2025-03-12). 초임 기준 — 책임 내 연차·고과·장기성과 인상분 미포함이라 실제 책임급 재직자 연봉은 이보다 높음",
 baseManwon: 7750,
 },
 ],
 },
 ],
 workLife: { weeklyHours: { contract: 40, real: 45 }, vacation: { days: 20, usageRate: 85 }, remoteWork: { policy: "hybrid", description: "팀바팀" } },
 benefits: [{ category: "lifestyle", title: "가전 할인", description: "임직원몰 할인", value: 3000000 }, { category: "financial", title: "복지포인트", description: "연 100만원", value: 1000000 }],
 culture: { score: 8.1, keywords: ["인화", "가전", "안정"], pros: ["대기업의 안정성", "가전 제품 할인", "무난한 분위기"], cons: ["보수적인 문화", "모바일 사업 철수 후 활력 저하"] },
 lastUpdated: "2026-08-15",
 },
 // 2026-08-30 중복 정본화: krCompanies_Batch15의 posco-holdings(동일 회사)를 이 항목으로
 // 병합·제거 — 급여·워라밸·복지는 posco-holdings의 최신값(2026-05-18), 격주 4일제는 유지.
 // 업종은 벤치마크 연속성 위해 Steel / Materials 유지. /salary-db/posco-holdings → /salary-db/posco 308
 {
 id: "posco",
 name: { ko: "포스코홀딩스", en: "POSCO Holdings" },
 industry: "Steel / Materials",
 tier: "conglomerate",
 logo: "🏭",
 description: "철강·이차전지소재·리튬을 아우르는 포스코그룹 지주사. 친환경 미래소재를 이끄는 대표 기업.",
 salary: {
 entry: { base: 56000000, incentive: { target: 22, max: 45, avgAmount: 16000000 } },
 junior: { base: 69000000, incentive: { target: 22, max: 45, avgAmount: 21000000 } },
 senior: { base: 92000000, incentive: { target: 22, max: 45, avgAmount: 33000000 } },
 lead: { base: 122000000, incentive: { target: 22, max: 45, avgAmount: 46000000 } },
 executive: { base: 220000000, incentive: { target: 38, max: 75, avgAmount: 92000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 43 }, vacation: { days: 20, usageRate: 85 }, remoteWork: { policy: "hybrid", description: "서울 대치동 포스코센터 + 포항, 주 1~2일 재택 (격주 4일제 시행)" } },
 benefits: [{ category: "lifestyle", title: "격주 4일제", description: "2주 단위 금요일 휴무", value: 3000000 }, { category: "financial", title: "성과 인센티브(PI/PS)", description: "그룹 실적 연동 성과급", value: 16000000 }, { category: "family", title: "자녀 학자금", description: "고교·대학 등록금 전액 지원", value: 13000000 }, { category: "lifestyle", title: "복지포인트", description: "연 200만원 상당 복지카드", value: 2000000 }],
 culture: { score: 8.4, keywords: ["제철보국", "지주사", "변화"], pros: ["격주 4일제 도입 등 변화 시도", "철강·이차전지소재 미래 사업을 함께 경험", "업계 최고 수준의 자녀 학자금·복지 제도"], cons: ["전통 제조업 그룹 특유의 보수적 조직 문화", "철강 경기 변동에 따른 실적 사이클", "서울·포항 순환 근무 가능성"] },
 lastUpdated: "2026-05-18",
 },
 {
 id: "cjcheiljedang",
 name: { ko: "CJ제일제당", en: "CJ CheilJedang" },
 industry: "Food / Bio",
 tier: "conglomerate",
 logo: "🥟",
 description: "비비고, 햇반. 글로벌 식문화 라이프스타일 기업.",
 salary: {
 entry: { base: 50000000, incentive: { target: 15, max: 30, avgAmount: 8000000 } },
 junior: { base: 62000000, incentive: { target: 15, max: 30, avgAmount: 12000000 } },
 senior: { base: 82000000, incentive: { target: 15, max: 30, avgAmount: 20000000 } },
 lead: { base: 110000000, incentive: { target: 15, max: 30, avgAmount: 30000000 } },
 executive: { base: 200000000, incentive: { target: 30, max: 60, avgAmount: 70000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 45 }, vacation: { days: 20, usageRate: 90 }, remoteWork: { policy: "hybrid", description: "거점 오피스" } },
 benefits: [{ category: "lifestyle", title: "CJ 40% 할인", description: "올리브영, 빕스 등 계열사 할인", value: 3000000 }, { category: "lifestyle", title: "크리에이티브 위크", description: "연 2주 휴가 권장", value: 0 }],
 culture: { score: 8.5, keywords: ["문화", "님호칭", "트렌디"], pros: ["CJ 계열사 할인 혜택 (올리브영 등)", "수평적 님 호칭 문화", "깔끔한 사옥"], cons: ["업무 강도 높음", "박한 연봉 인상률"] },
 lastUpdated: "2025-11-23",
 },
 {
 id: "amorepacific",
 name: { ko: "아모레퍼시픽", en: "AmorePacific" },
 industry: "Cosmetics",
 tier: "conglomerate",
 logo: "💄",
 description: "Asian Beauty Creator. 설화수, 헤라, 라네즈.",
 salary: {
 entry: { base: 48000000, incentive: { target: 10, max: 20, avgAmount: 5000000 } },
 junior: { base: 58000000, incentive: { target: 10, max: 20, avgAmount: 8000000 } },
 senior: { base: 78000000, incentive: { target: 10, max: 20, avgAmount: 15000000 } },
 lead: { base: 100000000, incentive: { target: 10, max: 20, avgAmount: 25000000 } },
 executive: { base: 180000000, incentive: { target: 20, max: 40, avgAmount: 50000000 } },
 },
 workLife: { weeklyHours: { contract: 40, real: 40 }, vacation: { days: 20, usageRate: 90 }, remoteWork: { policy: "hybrid", description: "자율 근무" } },
 benefits: [{ category: "lifestyle", title: "화장품 할인", description: "자사 제품 50% 할인", value: 2000000 }, { category: "health", title: "AP-Severance", description: "사내 병원", value: 1000000 }],
 culture: { score: 8.6, keywords: ["여초", "뷰티", "용산"], pros: ["용산 신사옥의 쾌적함", "화장품 할인", "여성 친화적 복지"], cons: ["중국 시장 부진으로 인한 위기감", "보수적인 임원진"] },
 lastUpdated: "2025-11-23",
 },
];
